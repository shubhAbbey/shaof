# Task 00: Project Audit & Architecture Baseline

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Inspect the complete existing repository and produce an implementation baseline before feature coding.

## Requirements

Map apps, packages, routes, dependencies, Next.js/Medusa/Strapi versions, database/Redis configuration, environment variables, API clients, auth, existing UI, tests, scripts, Docker and deployment. Identify implemented/partial/missing/conflicting functionality. Propose the final architecture and folder structure without changing application behavior.

## Acceptance criteria

[ ] Repository inventory exists
[ ] Current versions identified
[ ] Existing work classified
[ ] Architecture conflicts identified
[ ] No feature code changed unnecessarily

## Explicit non-goals

Do not rebuild the project from scratch. Do not delete existing working code.

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
