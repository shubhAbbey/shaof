# M2-13 — Fulfillment Operations

**Phase type:** Existing fulfillment workflows  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement merchant-aware pick/pack/status operations supported by current Medusa model. Keep seller responsibility explicit for mixed orders. Only existing operational shipment references/statuses in MVP-2; carrier APIs/live tracking/webhooks are MVP-3.

## Deliverables
Build authorized fulfillment actions, transition checks, idempotency and audit. Do not fabricate tracking or ETA.

## Acceptance criteria
No cross-merchant fulfillment access; duplicate/invalid actions handled; no pretend carrier integration.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
