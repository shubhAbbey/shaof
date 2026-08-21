# Task 40: Backups, Health Checks & Basic Observability

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Make the low-cost production environment recoverable.

## Requirements

Implement automated PostgreSQL backups to external storage, basic health checks, logs without secrets, disk/resource monitoring and documented restore procedure.

## Acceptance criteria

[ ] Backup runs automatically
[ ] Restore procedure is documented/tested
[ ] Health endpoints/checks work
[ ] Sensitive data is absent from logs

## Explicit non-goals

Do not build an enterprise observability platform.

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
