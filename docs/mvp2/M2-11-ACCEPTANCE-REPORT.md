# M2-11 — Inventory and Stock Locations Acceptance Report

**Phase Status:** `IMPLEMENTED — AWAITING HUMAN ACCEPTANCE`  
**Execution Timestamp:** 2026-10-28T17:05:00+05:30  
**Branch:** `m2_11`  
**Preceding Phases:** M2-08, M2-09, M2-10 (Explicitly Accepted by Project Owner)

---

## 1. Executive Summary & Objective

Phase M2-11 implements merchant-scoped stock reads, stock adjustments, low-stock indicators, and data-driven stock location assignments using native Medusa v2 inventory concepts. Hardcoded warehouse assumptions are replaced with dynamic database-driven location resolution and multi-tenant scoping. All inventory operations strictly enforce tenant boundaries, concurrency serialization via PostgreSQL advisory locks, and active customer order reservation safety.

---

## 2. Architecture & Design Decisions

### 2.1 Multi-Tenant Link Cardinality Fix
- **Problem:** Linking stock locations or order items to merchants previously risked link cardinality exceptions under 1:N relations in Medusa v2.
- **Solution:** Updated `apps/backend/src/links/merchant-stock-location.ts` and `apps/backend/src/links/merchant-order-item.ts` with `{ linkable: ..., isList: true }`, ensuring merchants can own multiple stock locations and line items without schema violations.

### 2.2 Data-Driven Stock Locations
- Stock locations are resolved dynamically from `stock_location` and `marketplace_merchant_stock_location_stock_location`.
- No hardcoded IDs or warehouse names exist in the codebase.
- Merchants can access assigned fulfillment centers or dedicated warehouse locations.
- Super Admin can link any stock location to any merchant via dedicated endpoints and UI.

### 2.3 Available Quantity & Low-Stock Calculations
- `stocked_quantity`: total physical quantity on hand.
- `reserved_quantity`: units committed to open customer orders.
- `available_quantity`: `Math.max(0, stocked_quantity - reserved_quantity)`.
- `is_low_stock`: boolean flag evaluated server-side when `available_quantity <= 10` (or configured threshold).

### 2.4 Concurrency & Advisory Lock Serialization
- Race conditions during concurrent stock adjustments are prevented using PostgreSQL transactional advisory locks:
  `SELECT pg_advisory_xact_lock(hashtext('inv:' || inventory_item_id || ':' || location_id))`
- Concurrent requests for the same inventory level are serialized at the database level.
- Lock is automatically released upon transaction commit or rollback.

### 2.5 Safety & Reservation Invariants
- Enforced via `BackendMarketplaceGuard.evaluateInventoryAdjustmentSafety`:
  1. **Non-negativity:** Resulting stocked quantity cannot drop below `0`.
  2. **Active Reservation Protection:** Resulting stocked quantity cannot drop below active customer `reserved_quantity`. Attempting to reduce stock below reservations is blocked with a 400 error (`RESERVATION_CONFLICT`).

### 2.6 Tenant Boundary Enforcement & Audit Logging
- Merchant callers cannot adjust stock for inventory items belonging to other merchants (enforced with 403 `FORBIDDEN`).
- Merchant callers cannot adjust stock at locations they are not authorized for (403 `FORBIDDEN`).
- Every adjustment emits structured audit logs:
  `[AUDIT] [INVENTORY_ADJUSTMENT] Merchant '<id>' (actor: '<user>') adjusted item '<item>' at location '<loc>'. Stock: <prev> -> <new> (adjustment: +/-<delta>). Reason: '<reason>'.`

---

## 3. Implemented Deliverables

### 3.1 Backend Endpoints & Service
| Method | Path | Security Boundary | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/merchant/inventory` | `merchant` (`inventory:read`) | Lists merchant-owned inventory items, levels, available stock, low-stock indicators, and summary metrics. |
| `GET` | `/merchant/inventory/locations` | `merchant` (`inventory:read`) | Returns data-driven stock locations authorized for the authenticated merchant. |
| `POST` | `/merchant/inventory/adjust` | `merchant` (`inventory:adjust`) | Adjusts stock (+/- delta or absolute set) with advisory lock, reservation protection, and audit logging. |
| `GET` | `/admin/marketplace/inventory` | `admin` (Super Admin) | Platform-wide inventory view with merchant metadata, filters (`merchant_id`, `location_id`, `status`, `search`). |
| `GET` | `/admin/marketplace/inventory/locations` | `admin` (Super Admin) | Lists all platform stock locations and their merchant assignments. |
| `POST` | `/admin/marketplace/inventory/locations` | `admin` (Super Admin) | Assigns/links a stock location to a merchant. |
| `POST` | `/admin/marketplace/inventory/adjust` | `admin` (Super Admin) | Super Admin platform stock adjustment with audit logging. |

### 3.2 Service & Core Logic
- `apps/backend/src/modules/marketplace/inventory-service.ts`:
  - `InventoryService.getMerchantInventory(...)`
  - `InventoryService.getPlatformInventory(...)`
  - `InventoryService.getMerchantStockLocations(...)`
  - `InventoryService.adjustStock(...)`
  - `InventoryService.withAdvisoryLock(...)`
  - `InventoryService.getAllStockLocationsWithMerchants(...)`
  - `InventoryService.assignStockLocationToMerchant(...)`

### 3.3 Types & Contracts
- `packages/types/src/marketplace.ts`:
  - Added `MerchantInventoryItemDto`, `InventorySummaryDto`, `InventoryAdjustmentDto`, `InventoryAdjustmentResultDto`, `InventoryAdjustmentSafetyResult`.
  - Added `MarketplaceOwnershipGuard.assertStockLocationAccess` and `evaluateInventoryAdjustmentSafety`.
  - Compiled with 0 errors (`npm --workspace=@ecom/types run build`).

### 3.4 Storefront UI
- **Merchant Panel:**
  - Route: `/merchant/inventory`
  - Summary cards: Total SKUs, In Stock, Low Stock, Out of Stock, Total Stocked Units.
  - Interactive status tabs, location dropdown, search bar.
  - Table showing Product, Variant, SKU, Location, Stocked, Reserved, Available, and Status Badge.
  - Quick Stock Adjust modal (+/- delta and absolute set, reason, live preview of resulting available units, safety error banner).
  - Navigation: Added `Inventory` to Merchant Header (`apps/storefront/src/components/layout/merchant-header.tsx`).
- **Super Admin Panel:**
  - Route: `/admin/inventory`
  - Platform-wide view with merchant filter, location filter, status tabs, search.
  - Modal to assign stock locations to merchants.
  - Quick Stock Adjust modal with reason audit trail.
  - Navigation: Added `Inventory` to Admin Header (`apps/storefront/src/components/layout/admin-header.tsx`).

### 3.5 OpenAPI 3.1 Specification
- Updated `apps/backend/src/api-docs/paths/merchant-operations.ts` with 3 merchant inventory endpoints.
- Updated `apps/backend/src/api-docs/paths/admin-marketplace.ts` with 3 super admin inventory endpoints.
- Documented 105 unique operations across the API documentation.

---

## 4. Test Evidence & Verification Matrix

### 4.1 Unit & Integration Test Suite (`apps/backend/src/inventory.test.ts`)
```
▶ M2-11: Inventory and Stock Locations Test Suite
  ▶ 1. Backend Stock Location Access Guard
    ✔ allows access when merchant owns the stock location (5.1357ms)
    ✔ allows access for Super Admin regardless of location merchant (1.3092ms)
    ✔ NEGATIVE: rejects cross-tenant access with 403 when Merchant A accesses Merchant B location (1.8839ms)
    ✔ NEGATIVE: rejects with 401 when session merchant ID is missing (1.0988ms)
  ✔ 1. Backend Stock Location Access Guard (15.9554ms)
  ▶ 2. Inventory Adjustment Safety & Reservation Protection
    ✔ allows positive stock adjustment and correctly updates available quantity (1.9724ms)
    ✔ allows valid negative adjustment when remaining stock exceeds reserved quantity (0.9719ms)
    ✔ NEGATIVE: rejects adjustment that would result in negative stocked quantity (1.1795ms)
    ✔ NEGATIVE: rejects adjustment that reduces stock below active customer reservations (1.2283ms)
    ✔ allows adjustment exactly to the reserved quantity (resulting available = 0) (1.197ms)
  ✔ 2. Inventory Adjustment Safety & Reservation Protection (8.9401ms)
  ▶ 3. Concurrency & Advisory Lock Serialization
    ✔ executes database operations safely within advisory lock transaction (273.7432ms)
  ✔ 3. Concurrency & Advisory Lock Serialization (275.052ms)
  ▶ 4. Inventory Endpoints Route Handlers
    ✔ merchant inventory routes require merchant boundary and permissions (1.587ms)
    ✔ admin marketplace inventory routes require admin boundary (0.7586ms)
  ✔ 4. Inventory Endpoints Route Handlers (3.2309ms)
✔ M2-11: Inventory and Stock Locations Test Suite (312.5264ms)
ℹ tests 12 | suites 5 | pass 12 | fail 0
```

### 4.2 Full Backend Regression Suite
- **Command:** `npm --workspace=@ecom/backend test`
- **Result:** `pass 395 | fail 0` across 11 test suites.
- Coverage includes M2-01 through M2-10 regressions, identity persistence, role management, product CRUD, moderation, inventory, and OpenAPI specification.

### 4.3 Full Storefront Regression Suite
- **Command:** `npm --workspace=@ecom/storefront test`
- **Result:** `pass 339 | fail 0` across 153 test suites.
- Verified PLP, cart, checkout, payments, customer addresses, navigation, header isolation, and status-driven action isolation.

### 4.4 Live HTTP Endpoint Verification against Local Dev Server
```
--- 1. Testing Unauthenticated Access ---
GET /merchant/inventory (no auth): 401 UNAUTHORIZED
GET /admin/marketplace/inventory (no auth): 401 UNAUTHORIZED
POST /merchant/inventory/adjust (no auth): 401 UNAUTHORIZED

--- 2. Testing Tenant Boundary Enforcement ---
Unowned merchant / forged member: 403 FORBIDDEN

--- 3. Testing Valid Merchant Access ---
GET /merchant/inventory: 200 OK (count: 0, summary: 0 units, zero cross-tenant leakage)
GET /merchant/inventory/locations: 200 OK (1 location: Delhi Central Warehouse)

--- 4. Testing Super Admin Platform Access ---
GET /admin/marketplace/inventory: 200 OK (count: 79 items, 7920 total stocked units, metadata attached)
GET /admin/marketplace/inventory/locations: 200 OK (count: 1, Delhi Central Warehouse)
POST /admin/marketplace/inventory/adjust: 200 OK (adjusted item by +10, stock 120 -> 130, available 130, audit logged)
```

---

## 5. Files Changed & Created

### Modified:
- `apps/backend/package.json`
- `apps/backend/src/links/merchant-stock-location.ts`
- `apps/backend/src/links/merchant-order-item.ts`
- `apps/backend/src/modules/marketplace/ownership-guard.ts`
- `apps/backend/src/openapi.test.ts`
- `apps/backend/src/api-docs/paths/merchant-operations.ts`
- `apps/backend/src/api-docs/paths/admin-marketplace.ts`
- `apps/storefront/src/components/layout/merchant-header.tsx`
- `apps/storefront/src/components/layout/admin-header.tsx`
- `packages/types/src/marketplace.ts`

### Created:
- `apps/backend/src/modules/marketplace/inventory-service.ts`
- `apps/backend/src/api/merchant/inventory/route.ts`
- `apps/backend/src/api/merchant/inventory/locations/route.ts`
- `apps/backend/src/api/merchant/inventory/adjust/route.ts`
- `apps/backend/src/api/admin/marketplace/inventory/route.ts`
- `apps/backend/src/api/admin/marketplace/inventory/locations/route.ts`
- `apps/backend/src/api/admin/marketplace/inventory/adjust/route.ts`
- `apps/backend/src/inventory.test.ts`
- `apps/storefront/src/app/merchant/inventory/page.tsx`
- `apps/storefront/src/app/merchant/inventory/MerchantInventoryClient.tsx`
- `apps/storefront/src/app/admin/inventory/page.tsx`
- `apps/storefront/src/app/admin/inventory/AdminInventoryClient.tsx`
- `docs/mvp2/M2-11-ACCEPTANCE-REPORT.md`

---

## 6. Phase Acceptance Status

Phase M2-11 is complete and verified. As mandated by project rules, this report leaves M2-11 in:
**`IMPLEMENTED — AWAITING HUMAN ACCEPTANCE`**
*(No automatic acceptance; proceeding to next authorized sequential phase M2-12 implementation).*
