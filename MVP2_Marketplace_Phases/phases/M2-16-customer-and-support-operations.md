# M2-16 — Customer and Support Operations

**Phase type:** Support console  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Provide least-privilege customer search/profile/order context and permitted support actions. Merchants see only customer information needed for their own orders. Never expose credentials, tokens or payment secrets.

## Deliverables
Build search/detail/limited actions using existing APIs; protect exports/bulk access with permission, pagination and audit. Test PII minimization.

## Acceptance criteria
Customer data is minimized and scoped; sensitive reads/actions audited.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
