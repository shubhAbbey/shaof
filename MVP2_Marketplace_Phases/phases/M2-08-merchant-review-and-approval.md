# M2-08 — Merchant Review and Approval

**Phase type:** Merchant moderation  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement Super Admin review queue and approve/reject/request-changes/suspend/reactivate transitions with reasons, verification state and impact on access/products/orders. Preserve decision history.

## Deliverables
Build review UI and backend transitions; notification hooks only if real infrastructure exists. Test invalid transitions and suspended access.

## Acceptance criteria
Only authorized reviewers decide; actor/time/reason/outcome retained; status gates work.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
