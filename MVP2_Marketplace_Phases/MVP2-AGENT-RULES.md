# MVP-2 Shared Agent Rules

Read this file, `MVP2-MASTER-PLAN.md`, the current phase, the original MVP-1 44-phase specification/handoff, and repository docs before acting. Inspect the actual repo, Git status/diff, package versions, Medusa/Strapi capabilities, auth, schemas, workflows, APIs, migrations and tests. Older handoffs may be stale: verify. If original specs/repo are missing, state the blocker and do not invent facts.

## Scope and preservation
- Execute one phase only. M2-00 is analysis-only; no implementation in that phase.
- Preserve accepted MVP-1 behavior and make the smallest safe changes; no rewrite.
- Do not begin the next phase until current acceptance gate passes or the user accepts a documented blocker.
- Never claim checks passed unless actually run and observed.

## System boundaries
- Medusa is commerce source of truth; Strapi is CMS/editorial source of truth; Redis is runtime/temporary infrastructure unless the inspected architecture explicitly proves otherwise. Do not add a third app database.
- Prefer native Medusa Admin/Store APIs, modules and workflows, and native Strapi APIs. Custom endpoints need a documented gap/security/orchestration reason. Do not duplicate CRUD wrappers without justification.
- Never query PostgreSQL/Medusa directly from storefront/BFF; no direct `pg` in storefront. Backend modules/migrations follow existing repo patterns.
- No hardcoded production merchants, warehouses, roles, prices, commission, status or payout dates. No production edits through seeds.

## Identity and authorization
- Customer, platform staff/Super Admin, and merchant identities/sessions are separate security boundaries. Customer mobile app never receives admin/merchant credentials or APIs.
- Deny by default; enforce server-side authorization for every read/mutation/export/media/bulk operation. Frontend hiding is not authorization.
- Merchant scope comes from verified session plus server-verified active membership. Never trust a client-supplied `merchant_id`, role, owner ID, price, commission, payout or actor ID as proof.
- Apply merchant scope before fetching records. Never fetch globally then filter only in UI.
- Do not blindly add `merchant_id` to every Medusa table. Inspect actual version/modules and model product/variant/SKU/media/inventory/location/order-line/fulfillment/return/refund/financial ownership coherently. Support mixed-merchant customer orders; do not assume one order equals one seller.
- Super Admin cross-merchant actions are explicit and auditable. Super Admin creating a merchant-owned product MUST select a target merchant, persist that relationship and see the merchant on product list/detail/edit/delete. No accidental unassigned products unless a separately approved platform-owned product concept exists. Reassignment is a separate audited workflow, not a normal field.
- Merchant product operations are restricted to its own verified merchant. Related variants, SKUs, media, prices, inventory and moderation cannot bypass ownership.
- Use extensible permission-based RBAC for future reviewer roles without overbuilding now.

## Mandatory product CRUD
Both Merchant and Super Admin must support create, list/search/read/detail, update, and delete/archive. Merchant scope is own products only. Super Admin sees all merchants, filters by merchant, selects the merchant at creation and displays/verifies the association before mutation. Persist and enforce ownership server-side. Test merchant A cannot list/read/update/archive/delete merchant B products, forged merchant IDs fail, and all related resources are scoped. Prefer native archive/lifecycle guards over hard delete where orders/accounting/history reference a product.

## Financial correctness
Define source of truth, currency/rounding, commission, discounts, tax/shipping allocation, partial/full refunds, COD, exchanges, adjustments, net payable and settlement lifecycle before earnings/payout features. Distinguish order total, seller gross sales, platform commission, refunds, adjustments, net payable and settlement. Never invent earnings or payout dates. Financial mutations need authorization, atomic transitions, idempotency, audit and reconciliation as appropriate. Preserve existing Razorpay/COD/checkout/orders/shipping/returns/refunds/exchanges.

## Security and UX
Validate server-side, minimize output, redact secrets/PII, protect cookie sessions with CSRF defenses where applicable, restrictive CORS, rate limits, secure expiry/revocation and recovery. Super Admin MFA must be implemented or clearly release-gated before production. High-risk role, merchant, ownership, refund and settlement actions need step-up/re-auth or documented equivalent. Audit actor/role/target/time/outcome/reason and appropriate before/after fields, never secrets. Include loading/empty/error/validation/unauthorized states.

## MVP-3 deferred
Carrier-specific external shipping APIs, live tracking APIs/webhooks, live delivery ETA, carrier performance analytics, and customer behavioral funnels (PLP→PDP→wishlist→cart exit) are MVP-3. MVP-2 may retain operational shipment references/statuses already supported, but must not pretend live tracking or behavioral analytics exist.

## Anti-loop and data safety
Use finite commands/timeouts and bounded polling. If a command hangs, stop and report exact command/last output. On failure capture exact error, make at most one justified fix and rerun affected validation once, then stop/report. Never reset DBs, delete Docker volumes, drop tables or destroy data without explicit approval. Never bypass security/tests or install dependencies without justification.

## Required phase report
Report PASS/BLOCKED/FAIL; changed files; decisions/deviations; APIs/workflows used and reasons for custom endpoints; schema/migration and rollback notes; auth/permission/tenant changes; exact commands/results; MVP-1 regression tests; known gaps/unverified integrations; Git status/diff; acceptance checklist with evidence. Do not automatically start the next phase.
