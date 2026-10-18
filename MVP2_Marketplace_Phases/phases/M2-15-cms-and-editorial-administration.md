# M2-15 — CMS and Editorial Administration

**Phase type:** Strapi  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Expose pages, homepage, navigation, campaigns, policies, SEO, media and editorial settings via native Strapi capabilities. Keep commerce in Medusa and editorial content in Strapi; consider linking/embedding native admin instead of duplicating CRUD.

## Deliverables
Implement only necessary bridge/UI and access controls; protect uploads and publish actions; test unauthorized access.

## Acceptance criteria
CMS persists in Strapi; no duplicate commerce data; customer/merchant cannot perform platform editorial actions.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
