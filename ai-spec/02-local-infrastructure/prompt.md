# Task 02: Local Infrastructure: Docker, Postgres & Redis

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Create reproducible local infrastructure.

## Requirements

Configure Docker Compose for Next.js, Medusa, Strapi, PostgreSQL and Redis as appropriate. Use separate medusa_db and strapi_db logical databases. Add persistent volumes, health checks where practical, private database/Redis networking and environment variables.

## Acceptance criteria

[ ] All required services start
[ ] Medusa connects to medusa_db
[ ] Strapi connects to strapi_db
[ ] Redis connectivity works
[ ] Postgres/Redis are not unnecessarily public

## Explicit non-goals

Do not create a third application database. Do not add Kubernetes or clusters.

## Implementation procedure

1. Inspect the current implementation and dependency versions.
2. Identify reusable existing code and official Medusa/Strapi capabilities.
3. Implement only this task and required supporting changes.
4. Add/update tests for behavior introduced by this task.
5. Run lint, typecheck, tests, and production build using the repository's actual commands.
6. Fix all errors introduced by this task.
7. Do not claim a feature is complete if it is only mocked or partially wired.
8. At the end, report changed files, validation results, and anything genuinely blocked.

Do not invent functionality outside the master specification.
