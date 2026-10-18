# M2-03 — Merchant Domain Foundation

**Phase type:** Domain foundation  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement merchant and membership records using existing backend patterns/database. Define profile, status lifecycle, verification metadata, timestamps and user membership. Keep merchant separate from customer; no third database or fake production seeds.

## Deliverables
Add migrations/module/services/validation and tests; no full onboarding UI yet. Provide migration compatibility.

## Acceptance criteria
Constraints/status validation tested; active membership is server-verifiable; no destructive core-table rewrite.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
