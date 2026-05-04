---
name: create-db-migration
description: Generate TypeORM migrations for `apps/api` and verify the migration matches only the current entity changes. Use when need to create, review, or validate database migrations in this repo, especially after editing `apps/api/src/**/*.entity.ts`, `apps/api/src/**/entity/*.ts`, or related TypeORM models.
---

# Create DB migration

Generate and validate TypeORM migrations in `apps/api` using the repo's npm scripts. Keep migrations minimal and reject unrelated schema operations.

## Use Commands From apps/api/package.json

Run all commands from `apps/api`:

- `npm run migration:generate -- src/db/migrations/<migration-name>`
- `npm run migration:create -- src/db/migrations/<migration-name>`
- `npm run migration:run`
- `npm run migration:revert`
- `npm run migration:show`

Use `migration:generate` for entity-driven schema changes. Use `migration:create` only for manual SQL/data migration edits.

## Workflow

1. Confirm migration intent.
   Determine which entities changed and expected schema impact (tables, columns, indexes, constraints).

2. Check repo state.
   Run `git status --short` and `git diff --name-only` before generation. Note changed entity files under `apps/api/src`.

3. Generate migration. Use kebab-case for file name.
   Run:
   `npm run migration:generate -- src/db/migrations/<migration-name>`

4. Validate migration scope.
   Review the generated migration file and ensure `up`/`down` only include expected operations tied to changed entities.

5. Register migration in data source options.
   Update `apps/api/src/db/data-source-options.ts`:
   - Add import for the new migration class in the `// Migrations` import block.
   - Add the migration class to the `migrations` array.
     Keep ordering consistent with existing migrations.

6. Run migration.
   Apply the migration to the local database:
   `npm run migration:run`

7. Run no-op verification.
   Run generation again to a temporary name:
   `npm run migration:generate -- src/db/migrations/__verify_no_changes`
   Expected result: no new migration because schema is already in sync.
   If a file is created, treat it as a failed verification and inspect missing/unintended entity deltas.

8. Clean verification artifacts.
   Remove temporary verification migration files if created.

## Acceptance Checks

Approve migration only if all checks pass:

- Migration file is the only new migration artifact.
- New migration is imported and listed in `apps/api/src/db/data-source-options.ts`.
- `npm run migration:run` applies successfully.
- SQL operations match expected entity changes.
- No unrelated `DROP`/`ALTER` on untouched modules.
- Follow-up generate pass is no-op (no additional migration needed).
- `down` reverses `up` for the same objects.

If any check fails, do not finalize. Explain the mismatch and regenerate after correcting entities/configuration.

## Response Format

When reporting results, include:

- Generated migration path.
- Expected changes vs actual operations.
- Verification command outcomes.
- Pass/fail decision with next action.
