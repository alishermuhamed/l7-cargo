import config from '@l7-cargo/eslint-config/shared'
import { defineConfig } from 'eslint/config'

export default defineConfig([
  {
    files: ['**/*.ts'],
    extends: config,
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
