# Task 09: Homepage & CMS Section Rendering

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement the CMS-driven homepage.

## Requirements

Render hero banners, category tiles, collection sections, product carousels/grids, sale banners, new-arrival sections and optional recommendation sections. Use Strapi for section composition and Medusa for live commerce data.

## Acceptance criteria

[ ] Homepage is CMS-driven
[ ] Sections render dynamically
[ ] Product data comes from Medusa
[ ] Optional section failure does not crash whole page
[ ] Loading/error states exist

## Explicit non-goals

Do not build an AI recommendation engine.

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
