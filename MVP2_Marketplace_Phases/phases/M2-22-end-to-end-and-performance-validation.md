# M2-22 — End-to-End and Performance Validation

**Phase type:** Journeys/performance  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Validate customer, merchant and Super Admin journeys including merchant approval, product CRUD, Super Admin selecting a merchant and managing that merchant's product, moderation, inventory, order lines, refunds/returns and cross-merchant denials. Test mobile responsiveness and large lists.

## Deliverables
Run finite E2E/perf checks; inspect loading/error/empty states, pagination and N+1. Do not implement MVP-3 analytics/tracking.

## Acceptance criteria
Critical journeys pass; merchant binding visible and enforced; regressions/perf limits reported honestly.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
