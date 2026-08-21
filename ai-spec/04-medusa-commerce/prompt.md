# Task 04: Medusa Promotions, Shipping, Fulfillment & Returns Foundation

You are implementing one controlled task in the ecommerce MVP.

## Required context

Read these files before coding:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- Any prior task artifacts and the current repository state.

## Scope

Configure remaining core commerce domains.

## Requirements

Configure promotions/discounts, shipping/fulfillment architecture, order workflows and return/refund primitives. Establish payment-provider abstraction without implementing Razorpay yet.

## Acceptance criteria

[ ] Promotions are available
[ ] Shipping/fulfillment boundaries exist
[ ] Returns/refunds can be initiated through Medusa capabilities
[ ] Orders are persisted correctly

## Explicit non-goals

Do not invent business return rules. Do not implement payment provider code yet.

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
