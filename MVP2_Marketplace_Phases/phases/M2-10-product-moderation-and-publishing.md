# M2-10 — Product Moderation and Publishing

**Phase type:** Submission/review  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement merchant submission and Super Admin review with explicit lifecycle states; define re-review rules for edits; drafts/rejected products stay unpublished. Preserve history/reasons and ownership checks.

## Deliverables
Build moderation queue and approve/reject/request-changes actions using native lifecycle where possible. Test unauthorized publishing, concurrent edits and cross-merchant review.

## Acceptance criteria
Merchant cannot self-approve; only approved products are public; all review decisions audited.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
