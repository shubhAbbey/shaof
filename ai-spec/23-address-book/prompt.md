# Task 23: Customer Address Book

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement Medusa-backed address book.

## Requirements

Fields: full name, mobile, address line 1, optional address line 2, optional landmark, city, state, pincode, country default India, address type Home/Office/Other, default flag. Support add/edit/delete/select.

## Acceptance criteria

[ ] Registration has no address
[ ] Address book CRUD works
[ ] Default address behavior is deterministic
[ ] Validation works

## Explicit non-goals

Do not create custom address tables outside Medusa.

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
