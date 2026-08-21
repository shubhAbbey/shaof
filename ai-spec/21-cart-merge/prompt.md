# Task 21: Guest-to-Customer Cart Merge

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Handle authentication from cart without losing items.

## Requirements

On login, preserve guest cart and merge with customer active cart deterministically. Recalculate prices/promotions and respect inventory. Do not silently lose items.

## Acceptance criteria

[ ] Guest cart survives login
[ ] Existing customer cart is handled deterministically
[ ] Duplicate quantities are controlled
[ ] Inventory/price revalidation occurs

## Explicit non-goals

Do not create an independent cart database.

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
