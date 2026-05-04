import { config } from 'dotenv'

config()

export default {
  api: {
    input: {
      target: process.env.ORVAL_OPENAPI_URL,
    },
    hooks: {
      afterAllFilesWrite: {
        command: 'npm run lint -- --fix src/lib/api/api.gen.ts',
        injectGeneratedDirsAndFiles: false,
      },
    },
    output: {
      mode: 'single',
      target: './src/lib/api/api.gen.ts',
      prettier: true,
      client: 'fetch',
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: './src/lib/api/custom-fetch.ts',
          name: 'customFetch',
        },
      },
    },
  },
}
