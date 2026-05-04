# DB Module

NestJS database module and TypeORM CLI wiring.

## What lives here

- `DbModule`: Configures TypeORM for the Nest app.
- `DbService`: Runs migrations on module init.
- `data-source.ts`: TypeORM CLI entrypoint (uses `dotenv`).
- `data-source-options.ts`: Shared TypeORM options builder.
- `columns/`: Reusable column decorators.

## App usage

`DbModule` uses `ConfigService` and `buildDataSourceOptions` via
`TypeOrmModule.forRootAsync`.

## CLI usage

TypeORM scripts should point at `data-source.ts` so the CLI can load `.env`
and the same options builder.

Example (package.json script):

```
typeorm-ts-node-commonjs -d apps/api/src/db/data-source.ts migration:run
```
