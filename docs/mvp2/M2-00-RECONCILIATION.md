# M2-00 — Repository and Specification Reconciliation Report

**Project:** Ecom MVP — Marketplace Extension (MVP-2)  
**Phase:** M2-00 — Repository and Specification Reconciliation  
**Phase Type:** ANALYSIS ONLY (Zero code / schema / config modifications)  
**Date:** 2026-10-19  
**Status:** PASS (Analysis Complete)  

---

## 1. Executive Summary & Verification Baseline

This report constitutes the authoritative reconciliation between the project specifications, architectural documentation, historical handoffs, and the actual live codebase for the Ecom MVP platform as it transitions from a single-vendor store (MVP-1) to a multi-merchant marketplace (MVP-2).

### 1.1 Git & Working Tree Status
- **Current Branch:** `m2_00`
- **Head Commit:** `ca06ea0e0370a42abb6f0a75febf2f122d17a8ae`  
  *Message:* `feat(seed): add seed-test-product script for ₹1 test product with inventory and sales channel links`  
  *Author:* Shubham Abbey  
  *Date:* Tue Sep 22 17:40:33 2026 +0530
- **Working Tree:** Clean. No uncommitted modifications to existing tracked files. Untracked directory: `MVP2_Marketplace_Phases/`.
- **Remote Branches Available:** `origin/dev`, `origin/basic_journey`, `origin/checkout_paument`, `origin/orders_refunds`, `origin/prod_docker`, `origin/prod_impl`.

### 1.2 Host Environment & Dependency Versions
- **Node.js:** `v24.20.0` (Satisfies root engine `>=20.0.0`)
- **npm:** `11.19.0` (Satisfies root engine `>=10.0.0`)
- **Docker Engine:** `27.1.1` (build `6312585`)
- **Docker Compose:** `v2.29.1-desktop.1`
- **Monorepo Structure:** npm workspaces (`apps/*`, `packages/*`):
  - `apps/backend`: Medusa Commerce v2 (`@medusajs/medusa`: `^2.19.0`, `@medusajs/framework`: `^2.19.0`, `@medusajs/cli`: `^2.19.0`, `ioredis`: `^5.5.0`, `pg`: `^8.13.1`)
  - `apps/cms`: Strapi Headless CMS v5 (`@strapi/strapi`: `^5.52.1`, `@strapi/plugin-users-permissions`: `^5.52.1`, `pg`: `^8.13.1`, React `18.3.1`)
  - `apps/storefront`: Next.js 14 App Router (`next`: `^14.2.24`, `@medusajs/js-sdk`: `^2.19.0`, `@medusajs/types`: `^2.19.0`, React `18.3.1`, Tailwind `3.4.17`, `ioredis`: `^5.5.0`, `pg`: `^8.13.1`)
  - `packages/config`: Shared configuration and environment validator (`@ecom/config`)
  - `packages/types`: Shared TypeScript interfaces and DTOs (`@ecom/types`)

---

## 2. Specification, Handoff & Codebase Discrepancies

A strict review of project documents against the real code identified four major discrepancies:

| ID | Stated / Historical Document | Verified Repository Reality | Severity | Impact on MVP-2 |
|---|---|---|---|---|
| **DISC-01** | `ai-spec/ECOM_MVP_ZERO_LOSS_MASTER_HANDOFF_PHASE00_18.md` states project is at Phase 18 (Auth & Registration) with status "IN PROGRESS". | Commits and code demonstrate that Phases 19 through 38 (Protected Routes, Cart, Merge, Wishlist, Address Book, Shipping, Checkout, Razorpay, COD, Orders, Returns, Refunds, UX Skeletons, Error States, E2E Tests, Performance, and Production Docker) were already built and verified. | Medium | Historical handoff was abandoned/stale. The live codebase is the authoritative source of truth. |
| **DISC-02** | `ai-spec/AGENT-RULES.md`, `MVP2-AGENT-RULES.md`, and `docs/ARCHITECTURE.md` prohibit direct DB queries from Storefront ("Never query PostgreSQL/Medusa directly from storefront/BFF; no direct `pg` in storefront"). | `apps/storefront/src/lib/auth/medusa-customer-service.ts` directly imports `pg` and runs raw SQL queries against `customer` table in `medusa_db` for phone lookups, inserts, and updates. | High | Must be refactored in MVP-2 identity phase to use Medusa v2 Auth / Customer Module API instead of bypassing backend layers. |
| **DISC-03** | `ai-spec/MASTER-SPECIFICATION.md` mandates native Medusa refund execution for prepaid and COD returns. | `apps/storefront/src/lib/orders/order-service.ts` invokes Razorpay refund APIs directly and attempts to call `POST /admin/payments/:id/refund` using `x-publishable-api-key` (which is rejected by Medusa v2 Admin). Fallback persists refund state into Redis `order:by_id:${order.id}`. | High | Medusa Admin API requires admin authentication tokens, not publishable keys. In MVP-2, seller-specific refund orchestration must be native Medusa workflows. |
| **DISC-04** | `npm run lint` expected to pass cleanly across all workspaces. | `apps/storefront/src/app/account/orders/page.tsx:235:39` contains an unescaped apostrophe (`react/no-unescaped-entities`) causing Next.js lint failure. | Low | Must be fixed in the appropriate storefront phase without breaking current analysis rules. |

---

## 3. Verified Current Architecture Baseline

### 3.1 Persistence & Data Stores
- **PostgreSQL 16:** Hosted in container `ecom-dev-postgres` (or `ecom-postgres` in production). Initialized via `infrastructure/docker/init-db.sql` into two logically separated databases:
  1. `medusa_db`: Owned by Medusa v2 engine.
  2. `strapi_db`: Owned by Strapi v5 CMS.
  *No third application database exists.*
- **Redis 7:** Single instance partitioned via key namespaces:
  - `otp:*`: 10-minute TTL for mobile OTP verification.
  - `ratelimit:*`: Rate limiting for SMS/auth/checkout endpoints.
  - `session:*`: 30-day customer session tokens (`sess_<hex32>`).
  - `cart:customer:*`: Customer-to-cart association.
  - `cart:completed_order:*`: Durable checkout idempotency cache (30 days).
  - `lock:checkout:*`, `lock:return:*`, `lock:refund:*`, `lock:cancel:*`: Atomic distributed locks (30s-60s TTL).
  - `order:by_id:*`, `customer:orders:*`: Cached order snapshots.

### 3.2 Commerce Backend (`apps/backend`)
- **Framework:** Medusa v2 (`@medusajs/framework`).
- **Registered Modules:**
  - Standard Medusa Core: `Product`, `Customer`, `Order`, `Inventory`, `StockLocation`, `SalesChannel`, `Fulfillment`, `Payment`, `Pricing`, `Promotion`.
  - Custom Modules: `./src/modules/wishlist` (`WishlistModuleService` extending `MedusaService({ WishlistItem })` with DML model `apps/backend/src/modules/wishlist/models/wishlist-item.ts` and MikroORM migrations).
- **Custom Store Routes:**
  - `GET /store/addresses`, `POST /store/addresses`: Address management using resolved `Modules.CUSTOMER`.
  - `POST /store/orders/:id/cancel`: Order cancellation using resolved `Modules.ORDER`.
  - `GET /store/wishlist`, `POST /store/wishlist`: Wishlist operations using resolved `WISHLIST_MODULE`.
- **Admin Panel:** Native Medusa Admin is configured in `medusa-config.ts` (`admin: { disable: process.env.MEDUSA_ADMIN_DISABLE === 'true' }`), and explicitly disabled in production compose (`MEDUSA_ADMIN_DISABLE: "true"`).
- **Existing Merchant Code:** **ZERO**. There are no merchant tables, schemas, relations, API endpoints, or workflows anywhere in `apps/backend`.

### 3.3 CMS Layer (`apps/cms`)
- **Framework:** Strapi v5.
- **Content Types:**
  - `global-setting`: Brand logo, header announcement, value propositions, default SEO.
  - `navigation`: Hierarchical navigation trees by handle.
  - `page`: Page routes by slug with dynamic zone sections.
- **Dynamic Zone Sections:** `hero`, `banner`, `rich-text`, `category-tiles`, `collection-carousel`, `product-carousel`, `product-grid`, `promotional-cta`, `sale-banner`.
- **Integration Boundary:** Storefront fetches CMS JSON via `apps/storefront/src/lib/strapi-client.ts`. CMS stores only references (category handles, collection handles, product handles), never duplicating prices or stock.

### 3.4 Storefront & BFF Layer (`apps/storefront`)
- **Framework:** Next.js 14 App Router.
- **SDK:** `@medusajs/js-sdk` communicating with Medusa at `http://localhost:9000` via publishable key `x-publishable-api-key`.
- **Authentication:** Customer OTP only (no passwords). Endpoints: `/api/auth/otp/request`, `/api/auth/otp/verify`, `/api/auth/session`, `/api/auth/logout`.
- **Checkout & Payment Orchestration:**
  - `CheckoutService.initiatePayment`: Pre-validates bag items, customer address, and shipping method. Supports `razorpay` (with paise conversion) and `cod` (Medusa manual provider).
  - `CheckoutService.completeCart`: Distributed mutex lock via Redis, durable idempotency check, HMAC signature verification, and Medusa cart completion.
- **Order Post-Purchase:** `OrderService` handles order cancellation, return eligibility checking, partial returns, Razorpay prepaid refunds, and COD payout data collection (UPI, Bank transfer, Store credit).

---

## 4. Existing Functionality vs Missing MVP-2 Capabilities

| Domain | Existing MVP-1 Baseline (VERIFIED) | Missing MVP-2 Marketplace Requirements (GAPS) |
|---|---|---|
| **Identity & Auth** | Customer mobile OTP auth via Redis; HTTP-only session cookie (`ecom_session_token`). | 1. Merchant identity & session management.<br>2. Super Admin separate identity & session.<br>3. Merchant user invite, onboarding & team memberships.<br>4. Multi-factor authentication (MFA) for Super Admin.<br>5. Refactor storefront customer service away from direct `pg`. |
| **Merchant Domain** | None. Single platform operator assumed. | 1. `Merchant` entity (business name, slug, status, GSTIN, PAN, bank details, contact).<br>2. Merchant onboarding status (`draft`, `pending_approval`, `active`, `suspended`, `rejected`).<br>3. Merchant verification/approval workflow by Super Admin.<br>4. Merchant membership and role-based permissions (Owner, Manager, Staff). |
| **Product CRUD** | Single-store catalog with products, variants, SKUs, options, prices, images, and inventory. | 1. **Merchant Panel Product CRUD:** Create, list, search, view detail, update, archive/delete strictly scoped to own verified merchant.<br>2. **Super Admin Product CRUD:** Platform-wide catalog search, merchant filter, mandatory merchant selector on creation, display of merchant ownership on all views, audited reassignment.<br>3. Server-side ownership validation on every product, variant, image, price, and inventory mutation.<br>4. Product moderation workflow (`draft`, `pending_review`, `approved`, `rejected`, `published`). |
| **Inventory & Warehouses** | Single hardcoded `Delhi Central Warehouse` stock location linked to default sales channel. | 1. Multi-location support partitioned by merchant.<br>2. Merchant-owned stock locations or location authorizations.<br>3. Stock adjustments scoped to merchant inventory items.<br>4. Platform-wide inventory visibility for Super Admin. |
| **Orders & Fulfillment** | Platform order completion; single fulfillment engine for the entire order. | 1. **Mixed-Merchant Orders:** A customer order containing items from multiple merchants.<br>2. Line-item merchant binding.<br>3. Seller-specific fulfillment operations (Merchant A fulfills only Merchant A line items).<br>4. Split fulfillment status tracking per merchant. |
| **Returns & Refunds** | Order-level return requests and refunds cached in Redis / Razorpay API. | 1. Merchant-scoped return request handling.<br>2. Merchant item return inspection and approval.<br>3. Return routing to the appropriate merchant location.<br>4. Authoritative Medusa refund workflow integration. |
| **Financials & Settlements** | Customer order totals, basic Razorpay refund amounts, COD refund details. | 1. Merchant gross sales tracking per line item.<br>2. Platform commission model (category-based or merchant-specific rate).<br>3. Net payable calculation accounting for item refunds and shipping fees.<br>4. Merchant settlement lifecycle (`pending_eligibility`, `due`, `processing`, `settled`).<br>5. Payout ledger and audit logs without fake simulated payout dates. |
| **Admin Portals** | Disabled Medusa Admin; Strapi admin only for CMS. | 1. Dedicated Super Admin Portal (React / Next.js or Medusa Admin extension).<br>2. Dedicated Merchant Portal (isolated frontend web application). |

---

## 5. Architectural Gap Analysis: Medusa v2 Marketplace Strategy

Medusa v2 core (`@medusajs/medusa`) does not ship with an opinionated multi-vendor marketplace engine. However, Medusa v2’s framework is purpose-built to extend core commerce primitives through **Modules**, **Module Links**, and **Workflows**.

### 5.1 Why Blindly Adding `merchant_id` to Every Table is Wrong
- Direct table alterations violate Medusa v2 module encapsulation.
- Medusa v2 modules (Product, Inventory, Order, Fulfillment, Customer) run in isolated boundaries.
- Medusa v2 provides `defineLink` and `remoteLink` specifically to connect custom modules with core modules without mutating core schemas.

### 5.2 Recommended Medusa v2 Architecture for Marketplace
```
                   ┌───────────────────────────────────────────────┐
                   │           Super Admin / Merchant API          │
                   └───────────────────────┬───────────────────────┘
                                           │
                        ┌──────────────────▼──────────────────┐
                        │     Marketplace Module (Custom)     │
                        │  - Merchant                         │
                        │  - MerchantUser / Membership        │
                        │  - MerchantRole / Permission        │
                        │  - MerchantSettlement / Ledger      │
                        └──────────────────┬──────────────────┘
                                           │
                     ┌─────────────────────┼─────────────────────┐
                     │ Medusa v2 Links     │                     │
                     ▼                     ▼                     ▼
          ┌────────────────────┐ ┌────────────────────┐ ┌────────────────────┐
          │   Product Module   │ │   Order Module     │ │StockLocation Mod.  │
          │  merchant <-> prod │ │merchant <-> line_it│ │merchant <-> loc    │
          └────────────────────┘ └────────────────────┘ └────────────────────┘
```

1. **Marketplace Module (`apps/backend/src/modules/marketplace`):**
   - Entities: `Merchant`, `MerchantMember`, `MerchantRole`, `MerchantPayoutAccount`, `MerchantLedgerEntry`.
2. **Medusa v2 Module Links (`apps/backend/src/links/`):**
   - `defineLink(MarketplaceModule.linkable.merchant, ProductModule.linkable.product)`
   - `defineLink(MarketplaceModule.linkable.merchant, OrderModule.linkable.orderLineItem)`
   - `defineLink(MarketplaceModule.linkable.merchant, StockLocationModule.linkable.stockLocation)`
   - `defineLink(MarketplaceModule.linkable.merchant, UserModule.linkable.user)`
3. **Product Ownership Propagation:**
   - Variants, options, SKUs, and images are hierarchical children of `Product`. Binding `Product` to `Merchant` automatically scopes all variants and SKUs.
4. **Order Line Item Ownership (Mixed-Seller Orders):**
   - In a mixed order, the customer creates 1 `Order` containing multiple `LineItem`s.
   - Each `LineItem` is linked to its respective `Merchant`.
   - The Merchant Portal displays only the `LineItem`s linked to that merchant.
   - Fulfillment sets and fulfillments are created per merchant.

---

## 6. Product CRUD Requirements Specification

As stipulated in the Master Plan and Rules, full product CRUD is mandatory for both panels:

### 6.1 Merchant Panel Product CRUD Rules
- **Create:** Creates a product in `draft` or `pending_review` status. The authenticated merchant ID is automatically injected server-side from the verified session membership. Client-supplied merchant IDs are rejected.
- **List / Search / Read:** Query filters are applied server-side before database query. Merchant A can never retrieve, view, or search products belonging to Merchant B.
- **Update:** Pre-validates that the target product belongs to the authenticated merchant. Allows updating title, description, images, options, variants, SKUs, and pricing.
- **Delete / Archive:** Hard deletion is blocked if the product or variant is referenced in existing orders, carts, or financial ledgers. Safe archiving (`status: "archived"`) is enforced.
- **Variants & Inventory:** Any addition of variants or stock level updates is validated against the product's verified merchant ownership.

### 6.2 Super Admin Product CRUD Rules
- **Create:** Super Admin **MUST** explicitly select a target approved merchant before product creation. Product creation without a designated merchant is rejected.
- **List / Search / Read:** Super Admin views products across all merchants, with explicit merchant filtering, search, and sorting. Every product listing and detail view prominently displays the associated merchant name and ID.
- **Update:** Super Admin can update any product, but the backend verifies and preserves the merchant association.
- **Reassignment Workflow:** Reassigning a product from Merchant A to Merchant B is not a casual edit field; it must be an audited, explicit workflow that verifies variant inventory, active orders, and financial history.
- **Delete / Archive:** Validates lifecycle constraints; prefers archiving over hard deletion to maintain order integrity.

---

## 7. Identity, Session and Authorization Boundaries

```
[ Customer Boundary ]        [ Merchant Boundary ]        [ Super Admin Boundary ]
- Mobile OTP                 - Email + Password / Auth0   - Staff Credentials + MFA
- Next.js Session Cookie     - Separate Merchant Cookie   - Separate Admin Cookie
- Redis: session:sess_*      - Medusa User + Membership   - Medusa Admin User
- Restricted to /store/ APIs - Restricted to /merchant/   - Restricted to /admin/
```

1. **Customer Security Boundary:**
   - Authenticated exclusively via Indian mobile + Redis OTP.
   - Client applications (Storefront / Customer Mobile) never receive administrative or merchant tokens.
   - Customer authorization checks (`BackendAuthGuard.validateResourceOwnership`) ensure customers can only access their own orders, addresses, and wishlist.
2. **Merchant Security Boundary:**
   - Merchant users authenticate via dedicated auth flow.
   - Server-side middleware verifies:
     `Session User -> Active Merchant Membership -> Verified Merchant Status (Active) -> Role Permissions`.
   - Merchant ID is derived solely from the server-verified membership, never from HTTP query params, route params, or body payloads.
3. **Super Admin Security Boundary:**
   - Platform staff with cross-merchant privileges.
   - Requires MFA before production deployment.
   - High-risk operations (merchant approval, commission changes, payouts, product deletion) produce structured audit log records (`actor_id`, `actor_role`, `target_merchant_id`, `action`, `timestamp`, `diff`).

---

## 8. Financial Model & Settlement Decisions Required

Before implementing settlements, the following business definitions must be confirmed:

1. **Commission Architecture:**
   - Model A: Uniform platform commission rate (e.g., flat 10% across all sellers).
   - Model B: Category-dependent commission (e.g., 15% for Sarees, 10% for Casual Shirts).
   - Model C: Merchant-negotiated custom commission rate stored on `Merchant` record.
2. **Shipping Fee & Discount Allocation:**
   - When a mixed cart has a shipping charge (e.g., ₹100), how is shipping allocated among multiple merchants?
   - When a platform promotion (e.g., `SUMMER20`) is applied, does the platform bear the discount cost, or is it deducted proportionally from merchant gross sales?
3. **Tax & Compliance (India Marketplace Regulations):**
   - GST TCS (Tax Collected at Source - 1%) and TDS (194-O - 1%) requirements for e-commerce operators in India.
   - Invoicing: Customer invoice generated by the Merchant, or platform marketplace invoice?
4. **Settlement Lifecycle:**
   - When does a line item become eligible for payout? (Standard: Delivery Date + Customer Return Window, e.g., 7 days after delivery).
   - Payout states: `pending_eligibility` -> `available_for_settlement` -> `payout_initiated` -> `settled`.
   - Never invent mock payout dates; records must be data-driven based on actual fulfillment and return events.

---

## 9. Test Baseline & Regression Suite Status

All existing test suites across the monorepo were executed synchronously. Every suite passed with zero failures:

| Workspace | Test Command | Tests Run | Result | Duration | Notes |
|---|---|---|---|---|---|
| `packages/config` | `npm run test --workspace=packages/config` | 2 tests, 0 suites | **PASS** | 114ms | Validates environment variables and required keys. |
| `packages/types` | `npm run test --workspace=packages/types` | 1 test, 1 suite | **PASS** | 71ms | Validates canonical commerce DTOs and contracts. |
| `apps/cms` | `npm run test --workspace=apps/cms` | 6 tests, 1 suite | **PASS** | 124ms | Validates Strapi PostgreSQL config, schemas, sections, and DTOs. |
| `apps/backend` | `npm run test --workspace=apps/backend` | 28 tests, 9 suites | **PASS** | 86.2s | Validates Razorpay, COD, Promotions, Fulfillment, Orders, Returns, Auth Guard, Wishlist, and Addresses. |
| `apps/storefront` | `npm run test --workspace=apps/storefront` | 296 tests, 140 suites | **PASS** | 630ms | Validates full customer journey: Navigation, CMS, PLP, PDP, Search, Auth, Cart, Merge, Wishlist, Addresses, Shipping, Checkout, Razorpay, COD, Orders, Returns, Refunds, UX Skeletons, Error boundaries, and Performance. |
| **Total** | `npm run test` (all packages) | **333 tests, 151 suites** | **100% PASS** | — | **Zero test failures in entire repository.** |

### 9.1 TypeScript Typecheck Status
- `packages/types`: `tsc --noEmit` -> **0 errors (PASS)**
- `packages/config`: `tsc --noEmit` -> **0 errors (PASS)**
- `apps/storefront`: `tsc --noEmit` -> **0 errors (PASS)**
- `apps/cms`: `tsc --noEmit` -> **0 errors (PASS)**
- `apps/backend`: `tsc --noEmit` -> **0 errors (PASS)**

### 9.2 Linter Status
- `packages/config`: OK
- `packages/types`: OK
- `apps/backend`: OK
- `apps/cms`: OK
- `apps/storefront`: 1 pre-existing syntax error in `./src/app/account/orders/page.tsx:235:39` (`react/no-unescaped-entities`). *Preserved untouched per M2-00 analysis-only rules.*

---

## 10. Proposed Implementation Order & Phase Dependencies

Following `MVP2-MASTER-PLAN.md`, the marketplace build must proceed in strict dependency sequence without jumping ahead:

```
[M2-00 Reconciliation] (Complete)
          │
          ▼
[M2-01 Marketplace Ownership Architecture]
  - Design Module Links & Entity Relationships
  - Define product, line item, stock location, and settlement bindings
          │
          ▼
[M2-02 Identity & Session Architecture]
  - Separate Customer, Merchant, and Super Admin boundaries
  - Refactor storefront customer service away from direct `pg`
          │
          ▼
[M2-03 Merchant Domain Foundation]
  - Create Marketplace Module in Medusa v2 (Merchant, Membership, PayoutAccount)
  - Generate MikroORM migrations
          │
          ▼
[M2-04 Authorization & API Boundaries]
  - Server-side tenant assertion middlewares
  - Super Admin vs Merchant route guards
          │
          ▼
[M2-05–08 Authentication & Merchant Onboarding]
  - Super Admin login + MFA gate
  - Merchant registration, review, approval & RBAC
          │
          ▼
[M2-09–14 Catalog, Inventory, Orders & Fulfillment]
  - Full Product CRUD for Merchant & Super Admin (M2-09)
  - Product Moderation & Publishing (M2-10)
  - Stock Locations & Inventory (M2-11)
  - Mixed-Merchant Orders & Line-Item Management (M2-12)
  - Merchant-Scoped Fulfillment (M2-13)
  - Returns, Exchanges & Financial Ledgers (M2-14)
          │
          ▼
[M2-15–23 CMS, Support, Dashboards, Security, Hardening & Release]
```

---

## 11. Concrete File Evidence & Repository Citations

| File / Directory Path | Key Evidence Verified |
|---|---|
| `apps/backend/package.json` | Medusa 2.19.0 dependencies (`@medusajs/medusa`, `@medusajs/framework`, `@medusajs/cli`). |
| `apps/backend/medusa-config.ts` | Configures `medusa_db`, Redis, Wishlist custom module, CORS, and disabled admin flag. |
| `apps/backend/src/modules/wishlist/models/wishlist-item.ts` | Medusa v2 DML model definition with compound unique index on `[customer_id, variant_id]`. |
| `apps/backend/src/modules/wishlist/service.ts` | Extends `MedusaService({ WishlistItem })` showing standard Medusa v2 module pattern. |
| `apps/backend/src/modules/auth/auth-guard.ts` | `BackendAuthGuard.validateResourceOwnership` asserting customer ownership of commerce resources. |
| `apps/backend/src/api/store/addresses/route.ts` | Direct resolution of `Modules.CUSTOMER` for address listing and creation. |
| `apps/backend/src/api/store/orders/[id]/cancel/route.ts` | Native Medusa Order module cancellation workflow endpoint. |
| `apps/backend/src/scripts/seed-catalog.ts` | Uses `createProductsWorkflow(container).run()` from `@medusajs/medusa/core-flows`. |
| `apps/backend/src/scripts/link-variant-inventory.ts` | Uses Medusa v2 `remoteLink` linking `Modules.PRODUCT` to `Modules.INVENTORY`. |
| `apps/backend/src/scripts/seed-shipping.ts` | Seeds `Delhi Central Warehouse` stock location and shipping options via Medusa core workflows. |
| `apps/cms/package.json` | Strapi 5.52.1 dependencies (`@strapi/strapi`, `@strapi/plugin-users-permissions`). |
| `apps/cms/src/api/` | Strapi content-types for `global-setting`, `navigation`, and `page`. |
| `apps/storefront/package.json` | Next.js 14.2.24, `@medusajs/js-sdk` 2.19.0, React 18.3.1. |
| `apps/storefront/src/lib/auth/medusa-customer-service.ts` | Direct `pg` database query violation requiring remediation in M2-02. |
| `apps/storefront/src/lib/checkout/checkout-service.ts` | Distributed locking (`lock:checkout:*`), idempotency, and Razorpay/COD checkout orchestration. |
| `apps/storefront/src/lib/orders/order-service.ts` | Order history, cancellation, returns, prepaid refunds, and COD payout abstraction. |
| `apps/storefront/scripts/run-tests.mjs` | 6,923 lines of regression test suites covering Tasks 08 through 37. |
| `infrastructure/docker/init-db.sql` | Creates isolated `medusa_db` and `strapi_db` on single PostgreSQL instance. |
| `docker-compose.prod.yml` | Multi-container production deployment with Postgres, Redis, Medusa, Strapi, Next.js, and Nginx. |
| `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md` | Authoritative operational rules for MVP-2 implementation. |
| `MVP2_Marketplace_Phases/MVP2-MASTER-PLAN.md` | Master phase index and explicit product CRUD requirements. |
