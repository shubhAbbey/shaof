# M2-19 — Platform Search, Settings and Notifications

**Phase type:** Operations  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Add authorization-aware cross-domain platform search, validated settings and notifications/alerts only where real data/events exist. Keep CMS settings separate from commerce config; secrets remain server-side.

## Deliverables
Implement bounded paginated search and auditable settings; no pretend alerts. Test scope and permissions.

## Acceptance criteria
Search leaks no unauthorized records; settings validated; no secrets exposed.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
