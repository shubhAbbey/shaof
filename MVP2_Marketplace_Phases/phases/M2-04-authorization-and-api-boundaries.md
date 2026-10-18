# M2-04 — Authorization and API Boundaries

**Phase type:** Deny-by-default policies  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement server-side authorization primitives for platform roles, merchant membership and resource ownership. Apply verified merchant scope before queries for products, variants, media, inventory, orders/line items, fulfillment, returns and financial data. Reuse native authorization where possible.

## Deliverables
Add policy helpers and endpoint-permission matrix; tests for cross-tenant IDOR and privilege escalation. No login UI.

## Acceptance criteria
Every read/mutation is scoped server-side; forged merchant IDs fail; customer flow remains intact.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
