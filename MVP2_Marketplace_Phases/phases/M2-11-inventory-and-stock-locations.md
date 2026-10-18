# M2-11 — Inventory and Stock Locations

**Phase type:** Merchant inventory  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement merchant-scoped stock reads/adjustments, low-stock indicators and history using Medusa inventory/location concepts. No hardcoded warehouse. Validate location-to-merchant access and concurrent updates.

## Deliverables
Use native inventory workflows; add authorized UI/actions, adjustment validation/idempotency/audit and tests for cross-tenant stock access.

## Acceptance criteria
Data-driven locations; merchant scope enforced; customer stock/checkout behavior preserved.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
