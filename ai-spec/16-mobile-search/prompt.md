# Task 16: Mobile Search Page & ZSR

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement dedicated mobile search page.

## Requirements

Tap search -> dedicated page. Show search box and infinite product results while typing. Support product -> PDP, category/collection -> PLP if surfaced, zero results/ZSR, errors, debounce and back navigation.

## Acceptance criteria

[ ] Mobile search is a separate page
[ ] Infinite results work
[ ] ZSR is distinct from API failure
[ ] Product selection opens PDP
[ ] Search query state is preserved appropriately

## Explicit non-goals

Do not reuse desktop dropdown as the primary mobile UX.

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
