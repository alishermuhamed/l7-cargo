# @l7-cargo/eslint-config

Shared ESLint configurations for the monorepo.

This package encapsulates all ESLint plugins and configurations. Consumers only need `eslint` as a dependency — all plugins are bundled here to ensure consistent versions and reduce duplication across packages.

## Usage

Add `@l7-cargo/eslint-config` and `eslint` to package's devDependencies:

```json
{
  "devDependencies": {
    "@l7-cargo/eslint-config": "*",
    "eslint": "^9.39.2"
  }
}
```

Then create an `eslint.config.js`:

```javascript
import config from '@l7-cargo/eslint-config/web' // or /shared, /base
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: config,
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
])
```
