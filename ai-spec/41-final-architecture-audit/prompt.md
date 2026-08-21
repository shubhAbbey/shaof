# Task 41: Final Architecture & Scope Audit

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Audit the entire implementation against MASTER-SPECIFICATION.md.

## Requirements

Trace every requirement from the master specification to code, tests and runtime behavior. Identify missing, partial, conflicting or invented functionality. Check ownership boundaries between Next.js, Medusa and Strapi and confirm there is no third database.

## Acceptance criteria

[ ] Every master requirement is accounted for
[ ] No out-of-scope features were accidentally added
[ ] Data ownership is correct
[ ] Critical journeys are traceable

## Explicit non-goals

Do not add new features during the audit unless required to close a specified gap.

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
