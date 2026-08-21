# Task 25: Checkout Orchestration

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Build the complete protected checkout flow.

## Requirements

Cart -> login if needed -> shipping address -> shipping method -> payment -> order. Revalidate cart/inventory/totals. Prevent duplicate order submissions. Implement success/failure states.

## Acceptance criteria

[ ] Protected transition works
[ ] Shipping and payment steps are coherent
[ ] Final totals are backend authoritative
[ ] Duplicate submissions are prevented
[ ] Success page works

## Explicit non-goals

Do not implement a second order engine.

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
