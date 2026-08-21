# Task 30: Prepaid Refunds

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement prepaid refund orchestration.

## Requirements

After return is eligible/received, Medusa should initiate refund through the configured Razorpay/payment provider. Track refund state and provider reference. Actual money movement belongs to provider.

## Acceptance criteria

[ ] Refund cannot exceed eligible amount
[ ] Duplicate refund is prevented
[ ] Provider reference/status tracked
[ ] Failure is recoverable
[ ] Frontend never directly handles payment secrets

## Explicit non-goals

Do not implement direct card/bank payment movement in Next.js.

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
