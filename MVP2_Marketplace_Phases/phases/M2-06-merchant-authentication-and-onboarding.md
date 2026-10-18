# M2-06 — Merchant Authentication and Onboarding

**Phase type:** Merchant auth  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement merchant application/invitation and login, verification, activation, rejection/suspension and recovery based on M2-02 decisions. Bind membership only through trusted backend flow; pending/rejected/suspended merchants cannot use active operations.

## Deliverables
Add onboarding/login UI and APIs; test status gates, forged IDs, membership change and session revocation.

## Acceptance criteria
Merchant accesses only its workspace; status gates are server-side; auth remains separate from customer/admin.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
