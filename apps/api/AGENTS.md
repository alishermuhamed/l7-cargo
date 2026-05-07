# Agent Guidelines

This file defines instructions for coding agents working in `apps/api`.

## Project Overview

- `apps/api` is the backend API application for this monorepo.
- Built with NestJS.
- Uses TypeORM with PostgreSQL for data access and migrations.
- Uses `@nestjs/swagger` for API documentation support.
- Consumes shared code from `@l7-cargo/shared`.

## Rules

- Use repositories only inside the module where the entity lives.
- Do not inject or call another module's repository directly.
- To expose module behavior to other modules, export and consume services.
- DTO classes and mappers are scoped to their module.
- Do not import another module's DTOs or mappers.
- Import DTO classes and mappers only at controller level within their own module.
- Every method/function must have an explicit return type.
- Do not add explicit database index names in TypeORM decorators or migrations unless there is a hard requirement.
- To generate/create migrations, use `apps/api/skills/create-db-migration/SKILL.md`.
- Do not write tests unless explicitly asked to.
