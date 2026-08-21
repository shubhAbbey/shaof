# Task 26: Razorpay Payment Integration

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Integrate Razorpay through Medusa's payment architecture.

## Requirements

Implement payment session/initiation, client UI, server-side verification as required by the current integration, success/failure/retry, secure webhooks, signature verification and idempotency. Never expose secret keys.

## Acceptance criteria

[ ] Online payment works in test mode
[ ] Payment state synchronizes with Medusa
[ ] Webhooks are verified/idempotent
[ ] Failed payment can retry
[ ] No card/payment secrets are stored

## Explicit non-goals

Do not use Stripe for the MVP unless explicitly changed later.

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
