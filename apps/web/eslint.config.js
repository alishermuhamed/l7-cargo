import pluginQuery from '@tanstack/eslint-plugin-query'
import config from '@l7-cargo/eslint-config/web'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [config, ...pluginQuery.configs['flat/recommended']],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
