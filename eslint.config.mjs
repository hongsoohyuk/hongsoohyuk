import {dirname} from 'path';
import {fileURLToPath} from 'url';

import {FlatCompat} from '@eslint/eslintrc';
import eslintConfigPrettier from 'eslint-config-prettier';
import unusedImports from 'eslint-plugin-unused-imports';

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
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    rules: {
      // TypeScript rules - warn instead of error
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
      // React rules - warn instead of error
      'react-hooks/exhaustive-deps': 'warn',
      // General rules
      'no-unused-vars': 'warn',
      'no-console': 'off',
      // Bulletproof React import order
      'unused-imports/no-unused-imports': 'error',
      'import/order': [
        'error',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling'], 'index', 'object', 'type'],
          pathGroups: [
            // 1. External libraries (React, Next)
            {pattern: 'react', group: 'external', position: 'before'},
            {pattern: 'next/**', group: 'external', position: 'before'},

            // 2. App layer
            {pattern: '@/app/**', group: 'internal', position: 'before'},

            // 3. Features (domain modules)
            {pattern: '@/features/**', group: 'internal', position: 'before'},

            // 4. Shared layers (components, hooks, lib, config, types, utils)
            {pattern: '@/components/**', group: 'internal', position: 'before'},
            {pattern: '@/hooks/**', group: 'internal', position: 'before'},
            {pattern: '@/lib/**', group: 'internal', position: 'before'},
            {pattern: '@/config/**', group: 'internal', position: 'before'},
            {pattern: '@/types/**', group: 'internal', position: 'before'},
            {pattern: '@/utils/**', group: 'internal', position: 'before'},

            // Legacy paths (for migration period)
            {pattern: '@/pages/**', group: 'internal', position: 'after'},
            {pattern: '@/widgets/**', group: 'internal', position: 'after'},
            {pattern: '@/entities/**', group: 'internal', position: 'after'},
            {pattern: '@/shared/**', group: 'internal', position: 'after'},
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      // Bulletproof React: enforce unidirectional codebase
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // features cannot import from app
            {
              target: './src/features',
              from: './src/app',
            },
            // shared modules cannot import from features or app
            {
              target: ['./src/components', './src/hooks', './src/lib', './src/types', './src/utils', './src/config'],
              from: ['./src/features', './src/app'],
            },
          ],
        },
      ],
    },
  },
  // Disable ESLint stylistic rules that conflict with Prettier
  eslintConfigPrettier,
];

export default eslintConfig;
