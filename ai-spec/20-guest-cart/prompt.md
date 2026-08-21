# Task 20: Guest Cart

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement persistent Medusa guest cart.

## Requirements

Support cart ID persistence, add/remove/update quantity, totals, inventory validation, empty state, loading/error states and navigation. Guest must reach cart without authentication.

## Acceptance criteria

[ ] Guest can add to cart
[ ] Cart survives navigation/refresh
[ ] Quantity/update/remove work
[ ] Inventory conflicts are handled
[ ] Totals come from Medusa

## Explicit non-goals

Do not require login for add-to-cart or viewing cart.

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
