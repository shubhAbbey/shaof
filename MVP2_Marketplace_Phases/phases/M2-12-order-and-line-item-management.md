# M2-12 — Order and Line-Item Management

**Phase type:** Merchant-aware orders  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Super Admin gets platform-wide order search/details; merchants see only their own line items and necessary fulfillment/customer context. Support mixed-merchant customer orders and minimize PII exposure.

## Deliverables
Build scoped lists/details/actions, filters and pagination. Enforce seller ownership on server, not only UI. Test guessed IDs and mixed-seller order masking.

## Acceptance criteria
Super Admin sees all eligible data; merchants cannot see other sellers' lines/details; customer order history unchanged.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
