# Task 11: PLP Core Engine

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Build the reusable product listing engine.

## Requirements

Support category, brand, collection, sale/curated and search listing contexts. Implement product cards with image, name, brand, current/original price, discount where available, availability, wishlist action and safe add-to-cart behavior.

## Acceptance criteria

[ ] All PLP contexts can render
[ ] Product cards are reusable
[ ] Variant safety is respected
[ ] Commerce data comes from Medusa/search provider

## Explicit non-goals

Do not implement advanced search engine integration here.

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
