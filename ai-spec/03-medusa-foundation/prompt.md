# Task 03: Medusa Foundation

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Configure Medusa as the commerce source of truth.

## Requirements

Configure current Medusa version/modules for products, variants, options, categories, collections, pricing, inventory, customers, carts and admin. Verify APIs/modules actually available in the installed version.

## Acceptance criteria

[ ] Commerce entities work in Medusa
[ ] Admin can manage core catalog
[ ] Database persistence works
[ ] Current APIs are verified

## Explicit non-goals

Do not create duplicate commerce services or a custom commerce engine.

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
