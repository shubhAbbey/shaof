# Task 29: Returns

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement customer return request flow using Medusa capabilities.

## Requirements

Order detail -> request return -> select eligible item/quantity/reason -> submit -> status. Admin/Medusa workflow must support review/receiving and inventory handling where supported.

## Acceptance criteria

[ ] Return request works
[ ] Item/quantity/reason captured
[ ] Return status displayed
[ ] Ineligible/invalid requests are rejected safely

## Explicit non-goals

Do not build a complex independent RMA system.

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
