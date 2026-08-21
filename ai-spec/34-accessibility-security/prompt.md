# Task 34: Accessibility & Security Hardening

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Harden the storefront and APIs.

## Requirements

Keyboard navigation, focus management, semantic HTML, accessible dialogs/dropdowns, labels, contrast. Security: HTTPS assumptions, secure cookies, input validation, authorization, rate limiting, webhook validation, secret management, no public Postgres/Redis, no sensitive logs.

## Acceptance criteria

[ ] Keyboard flows work
[ ] Protected APIs verify ownership
[ ] Secrets are server-side
[ ] Webhooks validate signatures
[ ] Sensitive data is not logged

## Explicit non-goals

Do not weaken security to meet the low-cost deployment target.

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
