# ADR-001: Marketplace Ownership Architecture & Tenant Scoping

**Status:** APPROVED  
**Date:** 2026-10-19  
**Authors:** Ecom Engineering Team  
**Scope:** MVP-2 Marketplace Foundation (M2-01)  
**Supersedes:** MVP-1 Single-Vendor Monolithic Architecture  

---

## 1. Context and Problem Statement

In MVP-1, the ecommerce platform was built as a single-merchant, single-operator store:
- All products, variants, SKUs, inventory, and pricing belonged implicitly to the platform operator (`Delhi Central Warehouse`).
- All customer orders, fulfillments, returns, and refunds assumed a single seller.
- The storefront BFF (`apps/storefront`) and Medusa Commerce (`apps/backend`) had only one customer authentication layer (Mobile + OTP) and one disabled/default staff admin layer.

MVP-2 extends this platform into an India-first multi-merchant fashion marketplace with:
1. A separate **Merchant Portal** where verified sellers manage their own catalog, stock, and order fulfillments.
2. A separate **Super Admin Portal** where platform staff moderate products, approve merchants, audit cross-merchant operations, and govern settlements.
3. Support for **Mixed-Merchant Orders**, where a single customer cart and order contains line items from multiple independent merchants.

We must define the canonical data ownership model, tenant isolation rules, product lifecycle policies, and server-side authorization boundaries—**without modifying core Medusa tables directly, introducing a third database, or breaking existing MVP-1 customer and commerce flows**.

---

## 2. Decision Drivers

- **Zero Core Medusa Tampering:** Do not blindly add `merchant_id` columns to native Medusa tables (`product`, `order`, `line_item`, `stock_location`). Direct table modification creates migration locks, breaks Medusa upgrade paths, and violates module boundaries.
- **Server-Enforced Tenant Isolation:** Deny by default. Authorization must be computed from the authenticated session and server-verified merchant membership. A client-supplied `merchant_id` in headers, body, or query parameters must **never** be accepted as proof of ownership.
- **Support Mixed-Merchant Orders:** A customer order must not assume `1 order = 1 seller`. Ownership must attach to individual **order line items**, allowing split fulfillment, split returns, and independent seller settlements.
- **Mandatory Product CRUD with Reassignment Governance:** Both Merchant and Super Admin have full product CRUD. Merchant is scoped strictly to own products. Super Admin must explicitly designate a target merchant on creation, and merchant reassignment must be an audited workflow rather than a standard field update.
- **Safe Lifecycle Guards:** Prevent hard deletion of products, variants, or inventory items referenced in historical orders, carts, or financial ledgers. Safe archiving is mandatory.
- **Reversibility and Rollback:** Any new schema or link tables must be cleanly reversible without data loss or corruption of existing customer/catalog data.

---

## 3. Architectural Decisions

### 3.1 Decision 1: Medusa v2 Custom Module + Module Link Architecture
Instead of modifying core Medusa schemas or creating a separate third database, we leverage Medusa v2's native **Module System** and **Module Links**:
1. **`MarketplaceModule` (`apps/backend/src/modules/marketplace`):**
   - Owns `merchant` (`id`, `name`, `handle`, `status`, `email`, `phone`, `metadata`).
   - Owns `merchant_member` (`id`, `merchant_id`, `user_id`, `role`, `status`).
2. **Medusa v2 Module Links (`apps/backend/src/links/`):**
   - `merchant_product`: Links `MarketplaceModule.merchant` with `ProductModule.product`.
   - `merchant_order_item`: Links `MarketplaceModule.merchant` with `OrderModule.orderLineItem`.
   - `merchant_stock_location`: Links `MarketplaceModule.merchant` with `StockLocationModule.stockLocation`.
   - `merchant_user`: Links `MarketplaceModule.merchant` with `UserModule.user`.

**Benefits:**
- Native Medusa query engine resolves linked entities seamlessly:
  `query.graph({ entity: "product", fields: ["*", "merchant.*"] })`.
- Link tables (`link_merchant_product`, etc.) are managed independently by Medusa's MikroORM migration runner.
- If the marketplace extension is ever rolled back, dropping the link tables leaves all core products, orders, and locations completely functional.

---

### 3.2 Decision 2: Product & Catalog Ownership Hierarchy
A product's merchant ownership cascades hierarchically:
```
Merchant (Owner)
  └── Product (Linked via Module Link)
        ├── Product Options (Color, Size)
        ├── Product Variants (Sage Green / M, Sku: SHIRT-SAGE-M)
        │     ├── Prices (₹1,399 INR)
        │     └── Inventory Items (Linked via remoteLink to Inventory Module)
        └── Product Images & Media
```
- **Variants, SKUs, and Prices** belong to the product. They cannot have a different merchant owner than the parent product.
- **Accidental Unassigned Products Blocked:** When creating a merchant product, the target merchant is mandatory. In the Merchant Portal, it is injected from the verified session. In the Super Admin Portal, the target merchant must be explicitly selected before submission.
- **Ownership Reassignment:** Transferring a product from Merchant A to Merchant B cannot occur via normal `PATCH /products/:id`. It requires a dedicated audited workflow that validates inventory reconciliation, active line items, and pending returns.

---

### 3.3 Decision 3: Mixed-Merchant Orders & Line-Item Ownership
```
Customer Order (Platform-level: Total ₹3,598, Customer: cus_priya)
  ├── Line Item 1: Banarasi Silk Saree (₹2,199) ───► [Link] ──► Merchant A (Virasat Heritage)
  └── Line Item 2: Pure Linen Casual Shirt (₹1,399) ──► [Link] ──► Merchant B (Loom & Thread)
```
- **Order:** Belongs to the customer and the platform.
- **Line Items:** Each line item is linked to its owning merchant via `merchant_order_item` link.
- **Fulfillment Operations:**
  - Fulfillment is split per merchant. Merchant A sees and fulfills only Line Item 1.
  - Merchant B sees and fulfills only Line Item 2.
  - Fulfillments, tracking references, and dispatch timestamps are tracked per merchant fulfillment group.
- **Returns & Exchanges:**
  - When a customer requests a return for Line Item 1, the return authorization, item inspection, and return stock routing are directed strictly to Merchant A's authorized warehouse.

---

### 3.4 Decision 4: Inventory & Warehouse Scoping
- In Medusa v2, stock is tracked via `InventoryItem` and `InventoryLevel` located at a `StockLocation`.
- Each merchant is linked to one or more dedicated `StockLocation`s via `merchant_stock_location` link.
- A merchant can only view, stock, or adjust inventory at stock locations linked to their merchant account.
- Super Admin retains platform-wide visibility across all stock locations.

---

### 3.5 Decision 5: Three Separate Identity and Session Boundaries
```
┌───────────────────────────┬───────────────────────────┬───────────────────────────┐
│     CUSTOMER BOUNDARY     │     MERCHANT BOUNDARY     │    SUPER ADMIN BOUNDARY   │
├───────────────────────────┼───────────────────────────┼───────────────────────────┤
│ Auth: Indian Mobile + OTP │ Auth: Email + Credentials │ Auth: Staff Creds + MFA   │
│ Cookie: ecom_session_token│ Cookie: ecom_merchant_sess│ Cookie: ecom_admin_sess   │
│ Storage: Redis session:*  │ Storage: Medusa Auth/Sess │ Storage: Medusa Admin Sess│
│ Access: /store/* APIs     │ Access: /merchant/* APIs  │ Access: /admin/* APIs     │
│ Scoped to: Own profile,   │ Scoped to: Own verified   │ Scoped to: Platform-wide, │
│ cart, wishlist, orders    │ merchant membership       │ explicit merchant target  │
└───────────────────────────┴───────────────────────────┴───────────────────────────┘
```
- **No Shared Session Tokens:** A customer cookie is never valid for merchant or admin APIs. A merchant cookie cannot access admin endpoints.
- **Tenant Scope Enforcement Pipeline:**
  1. Extract session token from secure HTTP-only cookie.
  2. Validate session and resolve `user_id`.
  3. Query `merchant_member` to verify active membership in target `merchant_id`.
  4. Verify merchant account status is `active`.
  5. Check role permissions (`owner`, `admin`, `manager`, `staff`).
  6. Inject verified `merchant_id` into query filters.

---

### 3.6 Decision 6: Product Lifecycle & Deletion Policy
To prevent broken orders, missing accounting entries, and data corruption:
- **Hard Deletion Blocked:**
  A product or variant cannot be permanently deleted from the database if:
  - It exists in any placed `Order` (historical or active).
  - It has active inventory reservations or non-zero stock.
  - It is referenced in any pending `Return` or financial settlement.
- **Safe Archiving Required:**
  - Instead of hard delete, products transition to `status: "archived"`.
  - Archived products are immediately hidden from customer search, PLPs, category views, and the storefront cart add-to-bag action.
  - Historical order details and merchant sales reporting continue to display the product record and variant title correctly.

---

### 3.7 Decision 7: Financial Boundaries & Settlement Policy (Strictly Decoupled)
As mandated by `MVP2-AGENT-RULES.md`:
- Customer payment collection (Razorpay / COD) remains authoritative within Medusa's existing payment workflows.
- Financial reporting is based on verified data:
  - **Item Gross Sales:** `unit_price * quantity - item_discount`.
  - **Platform Commission:** Calculated based on confirmed business rules (undecided in M2-01; no invented formulas).
  - **Net Payable:** `gross_sales - commission - refunds_allocated`.
- Payout states are strictly data-driven (`pending_eligibility` -> `due` -> `in_transit` -> `settled`). No synthetic or hardcoded payout dates.

---

## 4. Rollback and Reversibility Plan

If this architecture needs to be rolled back at any stage:
1. **Link Tables:** Dropping `link_merchant_product`, `link_merchant_order_item`, and `link_merchant_stock_location` removes merchant associations with zero disruption to Medusa's native `product`, `order`, or `stock_location` tables.
2. **Marketplace Module:** Removing `./src/modules/marketplace` from `medusa-config.ts` and dropping tables `merchant` and `merchant_member` completely isolates the platform back to its MVP-1 single-store state.
3. **No Downtime for Customer Storefront:** Customer browsing, checkout, payments, and order history rely solely on Medusa v2 core modules and remain 100% operational throughout.

---

## 5. Security & Negative Authorization Matrix

| Actor | Action Attempted | Target Resource | Expected Server Response | Rule Enforced |
|---|---|---|---|---|
| Merchant A | `GET /merchant/products/:id` | Product owned by Merchant B | **403 FORBIDDEN** | Cross-tenant read blocked |
| Merchant A | `PATCH /merchant/products/:id` | Product owned by Merchant B | **403 FORBIDDEN** | Cross-tenant mutation blocked |
| Merchant A | `POST /merchant/products` with `merchant_id: "merchant_B"` | Product create payload | **403 FORBIDDEN** / Injected own ID | Client merchant_id ignored / rejected |
| Merchant A | `GET /merchant/orders` | Mixed order (contains Merchant A & B items) | **200 OK** (Filtered) | Returns ONLY Merchant A line items |
| Merchant A | `DELETE /merchant/products/:id` | Product referenced in existing order | **409 CONFLICT** | Hard deletion blocked; archive required |
| Customer | `GET /merchant/products` | Merchant catalog | **401 UNAUTHORIZED** | Customer session rejected |
| Super Admin | `POST /admin/marketplace/products` without `target_merchant_id` | Product create payload | **400 BAD REQUEST** | Mandatory target merchant selection |
