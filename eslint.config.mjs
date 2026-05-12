import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error', // Chặn hoàn toàn việc dùng any
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', 'temp_js/**', 'build.js'],
  }
);
