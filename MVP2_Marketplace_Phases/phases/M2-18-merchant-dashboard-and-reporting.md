# M2-18 — Merchant Dashboard and Reporting

**Phase type:** Seller KPIs  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Build merchant-scoped products/orders/stock/returns/exchanges/transactions and financial reporting only supported by approved model. Separate gross sales, refunds, commission, adjustments, net payable and settlement status; no invented next payout.

## Deliverables
Use server-scoped aggregates, date filters, states and detail links; test cross-merchant isolation and financial calculations.

## Acceptance criteria
No other seller data leaks; financial definitions documented; unsupported settlement shown as unavailable, not fabricated.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
