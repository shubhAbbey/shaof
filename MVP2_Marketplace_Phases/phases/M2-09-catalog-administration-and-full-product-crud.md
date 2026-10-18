# M2-09 — Catalog Administration and Full Product CRUD

**Phase type:** Product CRUD and target merchant binding  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Implement create, list/search/read/detail, update and delete/archive for both roles. Merchant owner comes from verified membership; merchant sees/mutates only own products. Super Admin sees all with merchant filters and MUST select a target merchant for merchant-owned product creation. Show associated merchant on Super Admin list/detail/edit/delete. Persist and enforce mapping for product, variants, SKU, media, prices, categories/collections, inventory and moderation. Ownership transfer is separate/audited. Prefer native Medusa APIs/workflows and justify custom endpoints.

## Deliverables
Build catalog list/detail/create/edit/archive-delete, validation, pagination/search/filtering, target merchant selector, merchant labels and safe confirmations. Do not create unassigned products unless a distinct platform-owned product type is approved. Prefer archive/native lifecycle when historical references exist. Add negative tests for CRUD and related resources.

## Acceptance criteria
Full CRUD tested for both roles; merchant A cannot list/read/update/delete merchant B product even by guessed ID/forged merchant_id; Super Admin creation requires selected merchant; association persists and displays; related resources are scoped; storefront catalog remains compatible.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
