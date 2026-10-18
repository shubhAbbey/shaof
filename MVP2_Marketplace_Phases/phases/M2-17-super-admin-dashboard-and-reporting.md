# M2-17 — Super Admin Dashboard and Reporting

**Phase type:** Platform KPIs  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Build platform-wide order/sales/merchant/product approval/catalog/inventory/return/refund/exchange and real integration health KPIs. Define currency, timezone, date windows, status inclusion and data freshness; distinguish order value from settled funds/payable.

## Deliverables
Use efficient approved aggregation services, drilldowns and loading/error states; avoid N+1 and fake production metrics.

## Acceptance criteria
Sample metrics reconcile to source; role protection holds; no fabricated data.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
