import {FlatCompat} from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import {dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'wasm/build/**',
      'wasm/build_native/**',
      'next-env.d.ts',
    ],
  },
  // Disable ESLint stylistic rules that conflict with Prettier
  eslintConfigPrettier,
];

export default eslintConfig;
