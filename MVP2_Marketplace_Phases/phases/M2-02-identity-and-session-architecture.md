# M2-02 — Identity and Session Architecture

**Phase type:** Architecture + limited contract  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Define separate customer, platform staff/Super Admin and merchant identities/sessions using existing auth stack. Decide separate apps vs route groups from repository evidence. Specify expiry/revocation, recovery, MFA/step-up, CSRF/CORS, rate limits and future React Native customer compatibility.

## Deliverables
Write identity/session ADR and trust-boundary flows. Implement only a minimal non-breaking contract if justified; no full login UI yet.

## Acceptance criteria
Auth boundaries explicit; customer session cannot imply admin/merchant access; reviewer roles can be permission-based.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
