# Task 19: Protected Routes & Authorization

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Secure account, wishlist and checkout routes.

## Requirements

Implement frontend route protection plus backend authorization. Guest checkout transition must require login and then continue to intended shipping step. Guests cannot access wishlist/account/order/address data.

## Acceptance criteria

[ ] Protected routes redirect unauthenticated users
[ ] Backend ownership checks exist
[ ] Intended destination survives login
[ ] Unauthorized API responses are handled

## Explicit non-goals

Do not rely only on frontend route guards.

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
