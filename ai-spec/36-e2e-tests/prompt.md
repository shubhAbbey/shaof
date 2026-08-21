# Task 36: End-to-End Customer Journeys

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Test complete customer journeys in a realistic environment.

## Requirements

Cover guest browsing, search, PLP/PDP, guest cart, login, new registration, wishlist, checkout, Razorpay test payment, COD, order history and return/refund flows where provider mocks/sandbox permit.

## Acceptance criteria

[ ] Critical journeys pass
[ ] Mobile search is tested
[ ] Guest-to-login cart preservation is tested
[ ] Payment failure/retry is tested

## Explicit non-goals

Do not use production payment credentials.

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
