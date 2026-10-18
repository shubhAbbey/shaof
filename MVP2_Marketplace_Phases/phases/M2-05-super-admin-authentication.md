# M2-05 — Super Admin Authentication

**Phase type:** Platform auth  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement separate platform login/session lifecycle with secure credentials, throttling, expiry/rotation/revocation, logout, recovery and lockout where supported. MFA must be implemented or explicitly release-gated before production.

## Deliverables
Add login/logout/session UI/APIs and server-side route protection. Test invalid credentials, throttling, expiry, revocation, CSRF as applicable and customer-to-admin escalation.

## Acceptance criteria
Anonymous/customer sessions denied; sessions revocable; secrets not logged; MFA status honestly documented.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
