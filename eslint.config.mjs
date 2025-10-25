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
  {
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
    },
  },
  // Disable ESLint stylistic rules that conflict with Prettier
  eslintConfigPrettier,
];

export default eslintConfig;
