# Task 24: Checkout Shipping

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement shipping address selection and shipping method selection.

## Requirements

Authenticated checkout can select saved address or add new address. Use Medusa shipping/fulfillment architecture. Display provider-returned rates/methods without inventing rates or delivery dates.

## Acceptance criteria

[ ] Address selection works
[ ] New address can be added
[ ] Shipping methods load
[ ] Shipping failures have clear UI
[ ] Checkout state persists appropriately

## Explicit non-goals

Do not invent logistics-provider rules.

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
