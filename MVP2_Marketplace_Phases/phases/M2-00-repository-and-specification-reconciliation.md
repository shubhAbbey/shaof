# M2-00 — Repository and Specification Reconciliation

**Phase type:** ANALYSIS ONLY  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Inspect current repository, Git state, MVP-1 44-phase spec/handoff, package versions, Medusa/Strapi modules, auth, schemas, APIs, workflows, migrations, catalog, inventory, order-line ownership, payment/COD, fulfillment, return/exchange/refund, CMS and tests. Identify verified existing capabilities vs gaps. Trace product, variant, SKU, media, inventory, order line, financial ownership. Do not guess from stale handoffs.

## Deliverables
Create a repository-grounded reconciliation report with file/path evidence, phase baseline, Git state, API inventory, gaps, risks, tests and unresolved architecture/financial decisions. No code/schema/config changes.

## Acceptance criteria
Verified baseline and current gaps; product binding and financial unknowns explicit; no implementation occurred.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
