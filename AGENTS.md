# Agent Guidelines

This file defines repo-specific instructions for coding agents working in this project.

## Project Overview

- Monorepo with npm workspaces: `apps/*`, `packages/*`
- Task runner: `turbo`
- Package manager: `npm`

## Workspace Map

- `apps/api` - NestJS API application. Uses TypeORM, PostgreSQL, Jest, and shared code from `@l7-cargo/shared`.
- `apps/web` - Vite + React web app. Uses TanStack Router, TanStack Query, Radix UI Themes, and generated API clients via Orval.
- `packages/shared` - Shared TypeScript package for reusable constants, types, and utilities consumed by other workspaces.
- `packages/eslint-config` - Shared ESLint configuration package with base, web, shared, and API presets.

## Common Commands

- `npm run dev` - Run workspace development tasks through Turbo.
- `npm run build` - Build all workspaces through Turbo.
- `npm run lint` - Run lint tasks across workspaces through Turbo.
- `npm run typecheck` - Run TypeScript type checking across workspaces through Turbo.
- `npm run test` - Run test tasks across workspaces through Turbo.
- `npm run format <filenames>` - Format the specified files with Prettier.

## TypeScript Safety

- Do not use TypeScript escape hatches such as non-null assertions (`!`) or suppression comments like `@ts-ignore`, `@ts-expect-error`, or `@ts-nocheck`.
- Fix the types properly instead of disabling or bypassing local type checking.

## Environment Variables

- When adding, renaming, or removing an environment variable in code, update the relevant `.env.example` file in the same change.

## Finish Checklist

Before finishing work, run formatting and lint autofix for files changed in the task:

- `npm run format <filenames>`
- `npm --workspace <workspace-name> run lint -- --fix <filenames>`

## Known Issues

### NestJS (apps/api) does not react to all changes in @packages/shared during dev

In development (`nest start --watch`), changes in `packages/shared` may not always restart the API.

- Changes that affect emitted `.d.ts` files, such as constants, usually trigger a restart.
- Changes that only affect emitted `.js`, such as function body updates, may not.

Cause: The compiler effectively watches what it sees change, which in practice is often `packages/shared/dist/**/*.d.ts`, not every runtime `.js` change.

Workaround: Manually restart the API or touch a file that triggers a restart.
