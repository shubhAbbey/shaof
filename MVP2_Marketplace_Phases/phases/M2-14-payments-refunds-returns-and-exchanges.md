# M2-14 — Payments, Refunds, Returns and Exchanges

**Phase type:** Financially safe operations  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Expose existing Razorpay/COD payment, refund, return and exchange workflows to Super Admin and eligible merchant scope. Define financial source of truth, commission, discounts, tax/shipping allocation, partial refunds, COD, exchange differences, adjustments, net payable and settlement lifecycle before earnings/payout.

## Deliverables
Reuse native workflows; add scoped visibility/actions, idempotency, atomic transitions, audit/reconciliation. If payout rules/integration are undefined, show truthful transaction state only; never fake payouts.

## Acceptance criteria
MVP-1 payment/checkout/refund/return/exchange regressions pass; unauthorized seller cannot mutate another's transactions; financial calculations traceable.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
