import config from '@l7-cargo/eslint-config/api'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'eslint.config.mjs']),
  {
    files: ['**/*.ts'],
    extends: config,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
