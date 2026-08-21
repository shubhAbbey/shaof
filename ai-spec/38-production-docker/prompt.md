# Task 38: Production Docker Configuration

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Prepare production containers.

## Requirements

Create production Dockerfiles/Compose configuration for Next.js, Medusa, Strapi, PostgreSQL and Redis as appropriate. Use non-development configuration, health checks, environment variables, persistent data and safe restart behavior.

## Acceptance criteria

[ ] Production images build
[ ] Services start reliably
[ ] Secrets are externalized
[ ] Persistent data survives restart

## Explicit non-goals

Do not expose database/Redis publicly.

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
