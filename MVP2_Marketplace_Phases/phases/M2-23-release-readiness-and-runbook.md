# M2-23 — Release Readiness and Runbook

**Phase type:** Release gate  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Review deployment, migrations, backup/restore, secrets, MFA, CORS/CSRF, role provisioning, audit retention, financial reconciliation, monitoring, incidents, rollback and MVP-3 deferrals.

## Deliverables
Produce runbook, migration/rollback instructions, env var names (no values), ops checklist and final evidence-based acceptance report. Do not deploy or alter production data without approval.

## Acceptance criteria
Each requirement PASS/FAIL/BLOCKED with evidence; rollback and limitations clear; unverified backups/integrations labeled honestly.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
