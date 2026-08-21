# Task 32: Loading, Shimmer & Mutation UX

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Complete loading UX across all domains.

## Requirements

Add route/data skeletons for homepage, CMS pages, PLP, PDP, search, cart, account, wishlist, address book, checkout. Add button loading states and duplicate-submission prevention.

## Acceptance criteria

[ ] No major async screen is blank while loading
[ ] Buttons show progress
[ ] Infinite-scroll loading is visible
[ ] Payment/loading states are clear

## Explicit non-goals

Do not introduce arbitrary spinners where skeletons are more appropriate.

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
