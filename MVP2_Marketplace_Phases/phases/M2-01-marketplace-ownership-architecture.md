# M2-01 — Marketplace Ownership Architecture

**Phase type:** Architecture + minimum foundation  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Design the narrowest safe ownership model for merchant, product, variant, SKU, media, pricing, inventory/location, order line, fulfillment, return/exchange/refund and financial records. Inspect installed Medusa capabilities; do not blindly add merchant_id to core tables or assume one order equals one seller. Define archive/delete and transfer policy.

## Deliverables
Add ADR and only the minimum justified compatible schema/module foundation. Include rollback/compatibility notes. No panels or broad CRUD.

## Acceptance criteria
Ownership is explicit; schema changes evidence-based and reversible; historical orders remain readable; MVP-1 flows preserved.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
