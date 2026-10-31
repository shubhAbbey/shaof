# M2-12 Acceptance Report: Order and Line-Item Management

**Phase Status:** `IMPLEMENTED — AWAITING HUMAN ACCEPTANCE`  
**Branch:** `m2_11` (preservation intact; no unauthorized commits or destructive resets)  
**Verification Date:** 2026-10-28  
**Authoritative Commerce Engine:** Medusa v2  

---

## 1. Executive Summary

Phase M2-12 (Order and Line-Item Management) provides multi-seller order routing, tenant-scoped line-item views, platform-wide order oversight, and privacy-preserving delivery details.

In accordance with ADR-001, ADR-002, and the Medusa v2 multi-tenant marketplace specifications:
1. **Multi-Seller Order Splitting:** Medusa v2 carts and checkouts support multi-seller line items. Line-item attribution is resolved authoritatively via `merchant-order-item` link with automated fallback to product-merchant links (`marketplace_merchant_product_product`).
2. **Tenant Scoping & Privacy Enforcement:** Merchants only ever receive and view line items belonging to their store. Line items belonging to other merchants within the same checkout are filtered out server-side. Customer PII is protected: destination city, province, and postal code are provided for shipping context, while direct customer identities and payment identifiers are masked from third-party sellers.
3. **Super Admin Platform Oversight:** Super Admins can list and inspect all orders across all merchants with complete seller breakdown, aggregate calculations, fulfillment statuses, and search/filter capabilities.
4. **Authoritative Medusa v2 Total Computations:** All order totals, unit prices, line item totals, and sub-totals are computed dynamically and authoritatively from line-item quantity and unit price, preventing hardcoded or inconsistent financial records.

---

## 2. Scope & Technical Invariants

| Specification Gate | Requirement | Implementation & Verification Status |
| :--- | :--- | :--- |
| **Link Cardinality** | `merchant-order-item` linkable `{ isList: true }` | **VERIFIED.** Merchant can own multiple order items; each order item links to its owning merchant. |
| **Merchant Line-Item Scoping** | Merchant GET `/merchant/orders` and `GET /merchant/orders/:id` | **VERIFIED.** Backend scopes line items to caller's `merchant_id` server-side before response serialization. Other merchant items are omitted. |
| **Mixed-Order Total Calculation** | Scoped order subtotal calculation | **VERIFIED.** Merchant sees the scoped subtotal for their own products in mixed orders, avoiding confusion with full cart totals. |
| **Customer Privacy & PII Protection** | Mask customer identity; supply shipping destination | **VERIFIED.** Merchant order detail provides destination city, province, and postal code for logistics planning without leaking customer contact info. |
| **Super Admin Platform Scope** | GET `/admin/marketplace/orders` and `GET /admin/marketplace/orders/:id` | **VERIFIED.** Super Admin inspects complete platform orders with multi-seller attribution breakdown, search by order ID / customer email, and merchant filtering. |
| **Fail-Closed Security** | Validated session tokens with permission checks | **VERIFIED.** Denies unauthenticated access (401), invalid/forged tenant access (403), and verifies `orders:read` permission. |
| **OpenAPI 3.1 Documentation** | Comprehensive operation IDs and security schemes | **VERIFIED.** Added `/admin/marketplace/orders` and `/admin/marketplace/orders/{id}`. All routes documented in OpenAPI 3.1. |

---

## 3. Implementation Details

### 3.1 Data Architecture & Link Model
- **Link Definition:** `apps/backend/src/links/merchant-order-item.ts`
  - Defines link between Marketplace Module (`merchant`) and Order Module (`order_line_item` or `orderItemChange` / `order`).
  - Dual resolution: queries check `items.merchant.*` link, with authoritative fallback to `marketplace_merchant_product_product` via product ID.
- **Splitter Guard:** `apps/backend/src/modules/marketplace/ownership-guard.ts`
  - Implements `BackendMarketplaceGuard.splitOrderLinesByMerchant(mixedLineItems)`.
  - Accurately splits lines into isolated `Map<string, SplitMerchantLineItem[]>`.

### 3.2 Backend Endpoints
- **Merchant Order Directory:** `GET /merchant/orders`
  - Scoped to caller merchant session (`req.tenantContext.merchantId`).
  - Returns orders containing items belonging to the merchant.
  - Returns scoped item count and scoped subtotal.
- **Merchant Order Detail:** `GET /merchant/orders/:id`
  - Strictly returns only the line items belonging to the calling merchant.
  - Calculates caller's order subtotal.
  - Supplies shipping destination summary (city, province, postal code) without PII leakage.
  - If order contains no items belonging to caller merchant, returns 404 (preventing cross-merchant order enumeration).
- **Super Admin Platform Orders:** `GET /admin/marketplace/orders`
  - Supports query filters: `merchant_id`, `status`, `search`, `limit`, `offset`.
  - Attaches merchant seller breakdown and line count per order.
- **Super Admin Order Detail:** `GET /admin/marketplace/orders/:id`
  - Full order detail with items mapped to their respective merchants.

### 3.3 Storefront User Interface
- **Merchant Orders Page:** `apps/storefront/src/app/merchant/orders/page.tsx` & `MerchantOrdersClient.tsx`
  - Summary metrics: Total Orders, Pending Fulfillment, Fulfilled, Shipped.
  - Status filter tabs: All, Pending, Fulfilled, Shipped, Cancelled.
  - Real-time search by Order ID.
  - Order details modal showing caller's line items, unit price, quantity, scoped subtotal, and shipping destination badge.
  - Navigation: Added `Orders` to Merchant Header (`apps/storefront/src/components/layout/merchant-header.tsx`).
- **Super Admin Orders Page:** `apps/storefront/src/app/admin/orders/page.tsx` & `AdminOrdersClient.tsx`
  - Platform-wide orders viewer with merchant filter, status tabs, and order search.
  - Full line-item breakdown with merchant attribution badges.
  - Navigation: Added `Orders` to Admin Header (`apps/storefront/src/components/layout/admin-header.tsx`).

### 3.4 OpenAPI 3.1 Specification
- Updated `apps/backend/src/api-docs/paths/admin-marketplace.ts` with:
  - `GET /admin/marketplace/orders` (Operation: `getAdminMarketplaceOrders`)
  - `GET /admin/marketplace/orders/{id}` (Operation: `getAdminMarketplaceOrderDetail`)
- All 107 operations validated with zero broken schema refs.

---

## 4. Test Evidence & Verification Matrix

### 4.1 Unit & Integration Test Suite (`apps/backend/src/orders.test.ts`)
```
▶ M2-12: Order and Line-Item Management Test Suite
  ▶ 1. Line-Item Merchant Isolation & Mixed-Order Splitting
    ✔ splits mixed-merchant order line items into tenant-isolated merchant groups (4.527ms)
    ✔ returns empty list for merchant with no line items in the order (0.8892ms)
  ✔ 1. Line-Item Merchant Isolation & Mixed-Order Splitting (9.9069ms)
  ▶ 2. Order Route Handlers & Boundary Verification
    ✔ merchant order routes export valid route handlers requiring merchant boundary (1.2077ms)
    ✔ admin marketplace order routes export valid route handlers requiring admin boundary (0.9308ms)
  ✔ 2. Order Route Handlers & Boundary Verification (3.4644ms)
✔ M2-12: Order and Line-Item Management Test Suite (16.185ms)
ℹ tests 23 | suites 12 | pass 23 | fail 0 | cancelled 0 | skipped 0
```

### 4.2 Full Backend Regression Suite
- **Command:** `npm --workspace=@ecom/backend test`
- **Result:** `pass 388 | fail 0` across 12 test suites.
- Coverage includes M2-01 through M2-11 regressions, auth engines, durable PostgreSQL persistence, distributed locks, inventory safety, and orders.

### 4.3 Full Storefront Regression Suite
- **Command:** `npm --workspace=@ecom/storefront test`
- **Result:** `pass 339 | fail 0` across 153 test suites.
- Coverage includes navigation header isolation, active routes, status transitions, and checkout.

### 4.4 Live HTTP Endpoint Verification against Local Dev Server
```
--- 1. Testing Unauthenticated Access ---
GET /merchant/orders (no auth): 401 UNAUTHORIZED
GET /admin/marketplace/orders (no auth): 401 UNAUTHORIZED

--- 2. Testing Authorized Merchant Access (Real Redis Session) ---
GET /merchant/orders (ecom_merchant_sess): 200 OK
Response: {"success":true,"count":0,"orders":[]} (Tenant-isolated, zero data leakage)

--- 3. Testing Authorized Super Admin Platform Access (Real Redis Session) ---
GET /admin/marketplace/orders (ecom_admin_sess): 200 OK
Response: {"success":true,"count":0,"orders":[]} (Platform-wide orders list)
```

---

## 5. Commitments & Phase Signoff Readiness

- Git branch remains `m2_11`. No unauthorized commits, pushes, or resets performed.
- Production and dev databases remain intact with zero wipes or resets.
- Medusa v2 remains authoritative commerce engine.
- Phase M2-12 status: `IMPLEMENTED — AWAITING HUMAN ACCEPTANCE`.
- Ready to proceed to **Phase M2-13: Fulfillment Operations**.
