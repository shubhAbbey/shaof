# Task 42: Release Readiness & Final Verification

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Perform final production-readiness verification.

## Requirements

Run lint, typecheck, unit/integration tests, E2E tests, production build and smoke tests. Verify environment variables, payment sandbox, OTP provider sandbox, CMS publishing, database backup, error pages, security basics and deployment documentation.

## Acceptance criteria

[ ] All validation commands pass or blockers are documented
[ ] Critical user journeys work
[ ] Deployment can be reproduced
[ ] Known limitations are documented
[ ] Release decision is explicit

## Explicit non-goals

Do not claim production-ready if critical blockers remain.

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
