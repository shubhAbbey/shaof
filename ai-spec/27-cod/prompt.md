# Task 27: Cash on Delivery

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Implement COD as a manual/system payment option.

## Requirements

Offer COD where configured, use Medusa's system/manual payment provider, clearly communicate COD confirmation and create the order without pretending an online provider processed money.

## Acceptance criteria

[ ] COD appears only when configured
[ ] COD order flow works
[ ] Payment state is accurate
[ ] COD is distinct from Razorpay

## Explicit non-goals

Do not call Razorpay/Stripe refund APIs for an original COD payment.

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
