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
      'playwright-report/**',
      'test-results/**',
      'coverage/**',
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
            {pattern: 'react', group: 'external', position: 'before'},
            {pattern: 'next/**', group: 'external', position: 'before'},
            {pattern: '@/components/**', group: 'internal', position: 'before'},
            {pattern: '@/hooks/**', group: 'internal', position: 'before'},
            {pattern: '@/lib/**', group: 'internal', position: 'before'},
            {pattern: '@/config/**', group: 'internal', position: 'before'},
            {pattern: '@/types/**', group: 'internal', position: 'before'},
            {pattern: '@/utils/**', group: 'internal', position: 'before'},
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
  // Disable ESLint stylistic rules that conflict with Prettier
  eslintConfigPrettier,
];

export default eslintConfig;
