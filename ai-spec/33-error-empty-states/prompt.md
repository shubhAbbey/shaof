# Task 33: Errors, Empty States & Error Boundaries

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Complete robust failure UX.

## Requirements

Implement 404, route error boundaries, API errors, 401/403/404/409/422/429/5xx handling, network failure, payment failure, inventory conflict, search failure, CMS section failure and retry. Distinguish valid zero results from failed requests. Add empty states for cart, wishlist, orders, addresses and search.

## Acceptance criteria

[ ] Error boundaries work
[ ] Retry controls work where safe
[ ] No raw stack traces appear
[ ] Zero-result and failure states are distinct

## Explicit non-goals

Do not hide errors as empty data.

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
