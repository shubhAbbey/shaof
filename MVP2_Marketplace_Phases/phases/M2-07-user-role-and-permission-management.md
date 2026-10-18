# M2-07 — User, Role and Permission Management

**Phase type:** RBAC  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Allow Super Admin to manage staff and merchant team memberships/roles/permissions with least privilege. Avoid self-escalation; merchant owners cannot grant platform roles. Changes must be auditable and affect active sessions predictably.

## Deliverables
Build controlled UI/actions, validation and audit events. Test privilege escalation, cross-merchant membership changes and unauthorized role grants.

## Acceptance criteria
Permission matrix enforced by APIs; role changes audited and take effect predictably.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
