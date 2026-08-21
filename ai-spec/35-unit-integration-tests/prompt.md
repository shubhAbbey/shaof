# Task 35: Unit & Integration Tests

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Add tests for core domain and API behavior.

## Requirements

Test authentication, OTP rules, search transformation, PLP filters, cart operations, wishlist authorization, address validation, checkout transitions, payment state handling, return/refund validation and CMS integration boundaries.

## Acceptance criteria

[ ] Core business behavior has tests
[ ] Failure cases are covered
[ ] Tests are deterministic
[ ] Existing tests remain green

## Explicit non-goals

Do not rely exclusively on snapshots.

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
