# M2-21 — API and Integration Testing

**Phase type:** Backend tests  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Test merchant onboarding, product CRUD/owner binding, moderation, inventory, mixed orders, fulfillment, payment/refund/return/exchange, CMS boundaries and role permissions. Use isolated fixtures; no real-money calls.

## Deliverables
Run finite deterministic test suites; test idempotency/concurrency/failure where relevant. Report exact commands and flaky tests.

## Acceptance criteria
Critical positive/negative API tests pass; MVP-1 regression coverage included; gaps explicit.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
