import {COMMANDS} from './commands';
import {VirtualFS} from './filesystem';
import {tokenize} from './lexer';
import {parse} from './parser';

import type {CommandResult, ExecContext, SimpleCommand} from '../types';

type ShellState = {
  fs: VirtualFS;
  cwd: string;
  env: Record<string, string>;
  history: string[];
};

export type ExecuteResult = {
  output: string;
  isError: boolean;
  newCwd?: string;
  newEnv?: Record<string, string>;
  clear?: boolean;
};

export function execute(input: string, state: ShellState): ExecuteResult {
  const trimmed = input.trim();
  if (!trimmed) return {output: '', isError: false};

  // tokenize with env for $VAR expansion
  const tokens = tokenize(trimmed, {...state.env, '?': '0', PWD: state.cwd});
  const ast = parse(tokens);

  let lastResult: CommandResult = {stdout: '', stderr: '', exitCode: 0};
  let currentCwd = state.cwd;
  let currentEnv = state.env;
  const outputs: string[] = [];

  for (const entry of ast.entries) {
    // check && / || from previous entry
    // (separator is on the *previous* entry, telling what to do before running the next)
    // Actually, separator is on the current entry, telling how to connect to the next.
    // But we need to check the previous entry's separator before running this one.
    // The entries array stores: [{pipeline, separator}]
    // separator tells what comes AFTER this pipeline.
    // So we need to track whether to skip based on previous separator + exitCode.

    // Execute this pipeline
    const pipelineResult = executePipeline(entry.pipeline, {
      fs: state.fs,
      cwd: currentCwd,
      env: currentEnv,
      history: state.history,
    });

    // Collect output
    if (pipelineResult.stdout) outputs.push(pipelineResult.stdout);
    if (pipelineResult.stderr) outputs.push(pipelineResult.stderr);

    // Handle side effects
    if (pipelineResult.clear) {
      return {output: '', isError: false, clear: true, newCwd: pipelineResult.newCwd, newEnv: pipelineResult.newEnv};
    }
    if (pipelineResult.newCwd) currentCwd = pipelineResult.newCwd;
    if (pipelineResult.newEnv) currentEnv = pipelineResult.newEnv;

    lastResult = pipelineResult;

    // Decide whether to continue based on separator
    if (entry.separator === '&&' && lastResult.exitCode !== 0) break;
    if (entry.separator === '||' && lastResult.exitCode === 0) break;
    // ';' and null: always continue
  }

  return {
    output: outputs.filter(Boolean).join('\n'),
    isError: lastResult.exitCode !== 0,
    newCwd: currentCwd !== state.cwd ? currentCwd : undefined,
    newEnv: currentEnv !== state.env ? currentEnv : undefined,
  };
}

function executePipeline(
  pipeline: SimpleCommand[],
  state: {fs: VirtualFS; cwd: string; env: Record<string, string>; history: string[]},
): CommandResult {
  let stdin = '';
  let lastResult: CommandResult = {stdout: '', stderr: '', exitCode: 0};

  for (let i = 0; i < pipeline.length; i++) {
    const cmd = pipeline[i];
    const ctx: ExecContext & {fs: VirtualFS; cwd: string} = {
      fs: state.fs,
      cwd: state.cwd,
      stdin,
      env: state.env,
      history: state.history,
    };

    const handler = COMMANDS[cmd.name];
    if (!handler) {
      return {
        stdout: '',
        stderr: `${cmd.name}: command not found. Type 'help' for available commands.`,
        exitCode: 127,
      };
    }

    lastResult = handler(cmd.args, ctx);

    // Handle cwd change
    if (lastResult.newCwd) state.cwd = lastResult.newCwd;
    if (lastResult.newEnv) state.env = lastResult.newEnv;

    // Handle redirects on this command
    for (const redirect of cmd.redirects) {
      const error =
        redirect.type === '>'
          ? state.fs.writeFile(state.cwd, redirect.target, lastResult.stdout + '\n')
          : state.fs.appendFile(state.cwd, redirect.target, lastResult.stdout + '\n');

      if (error) {
        return {stdout: '', stderr: error, exitCode: 1};
      }
      // redirect consumed the stdout
      lastResult = {...lastResult, stdout: ''};
    }

    // Pass stdout as stdin to next command in pipeline
    stdin = lastResult.stdout;
  }

  return lastResult;
}
