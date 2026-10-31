# M2-10 Acceptance Report: Product Moderation and Publishing

**Phase:** M2-10 — Product Moderation and Publishing  
**Status:** ACCEPTED (Explicit Project Owner Approval)  
**Date:** 2026-10-21 (Approved: 2026-10-28)  
**Evaluator:** Ecom Marketplace Engineering Team  
**Specification Reference:** 44-Phase Multi-Vendor Marketplace Specification (Phase M2-10)  
**Branch:** `m2_08`  

---

## 1. Executive Summary

Phase **M2-10** delivers the complete **Product Moderation and Publishing** governance lifecycle for the multi-vendor marketplace platform across backend domain APIs, moderation state machine transitions, separation of duties, customer storefront catalog isolation, OpenAPI 3.1 documentation, and Next.js 14 storefront interfaces.

This phase guarantees:
1. **Merchant Submission Workflow (`POST /merchant/products/:id/submit`):**
   - Enables merchants to formally submit products for platform moderation, transitioning status from `draft` or `rejected` to `proposed`.
   - Records audit metadata: `submittedAt` timestamp and `submittedBy` user ID.
   - Enforces strict IDOR defense: Merchant A cannot submit products owned by Merchant B (`403 FORBIDDEN`).
   - Stale-state defense: Rejects submission if product is already `proposed` (`400 ALREADY_SUBMITTED`) or `published` (`400 ALREADY_PUBLISHED`).
2. **Separation of Duties & Anti-Self-Approval Defense:**
   - Strict privilege separation: Merchant role is strictly prevented from directly self-approving or publishing products via `PUT /merchant/products/:id` (`403 CANNOT_SELF_APPROVE`).
   - Moderation decision authority is exclusively reserved for the Super Admin boundary.
3. **Re-Review Trigger on Merchant Modification:**
   - If a merchant edits content fields (`title`, `handle`, `description`) of an already `published` product via `PUT /merchant/products/:id`, the system automatically transitions the product's status back to `proposed` and emits an audit event.
   - Prevents bypass of content moderation through post-approval edits.
4. **Super Admin Moderation Queue & Decision Engine:**
   - **Moderation Queue (`GET /admin/marketplace/moderation`):** Lists all products awaiting review (`status: 'proposed'`) with full merchant profile context, submitted timestamps, search filters, and status filters.
   - **Moderation Decisions (`POST /admin/marketplace/products/:id/moderate`):**
     - `approve`: Transitions product from `proposed` to `published`. Strictly validates that the product's associated merchant is in `active` status (`MERCHANT_NOT_ACTIVE`).
     - `request-changes`: Transitions product back to `draft`. Enforces a mandatory non-empty reason (`CHANGES_REQUESTED_REASON_REQUIRED`) and records audit metadata.
     - `reject`: Transitions product to `rejected`. Enforces a mandatory non-empty reason (`REJECTION_REASON_REQUIRED`) and records audit metadata.
5. **Customer Storefront Catalog Isolation:**
   - Public customer catalog queries (`/store/products` and storefront browse/search) strictly isolate visible products: only products with `status === 'published'` belonging to merchants with `status === 'active'` are exposed.
   - Products in `draft`, `proposed`, or `rejected` states, or products belonging to suspended merchants, are strictly excluded from public storefront visibility.
6. **Storefront Next.js 14 Interfaces:**
   - **Super Admin Moderation Portal (`/admin/moderation`):** Interactive queue interface displaying submitted products, merchant details, submission timestamps, diff inspection preview, and action modals for Approve, Request Changes, and Reject.
   - **Merchant Product Catalog (`/merchant/products`):** Interactive "Submit for Moderation" button for products in `draft` or `rejected` status with dynamic feedback and badge updates.
7. **OpenAPI 3.1 Documentation:** Documented all moderation endpoints in `src/api-docs/paths/admin-marketplace.ts` and `src/api-docs/paths/merchant-operations.ts`. Total operations verified at **97** by automated scanner suite.

---

## 2. Acceptance Criteria Verification Matrix

| Criterion | Specification Requirement | Implementation Evidence | Result |
| :--- | :--- | :--- | :---: |
| **AC-01: Merchant Product Submission** | Merchant can submit `draft` or `rejected` product for platform moderation (`status: 'proposed'`). | Implemented in `POST /merchant/products/:id/submit`. Tested draft & rejected transitions. | **PASS** |
| **AC-02: Stale State Defense** | Reject submitting already proposed or published products without prior edits. | Returns `400 ALREADY_SUBMITTED` or `400 ALREADY_PUBLISHED`. Tested in `product-moderation.test.ts`. | **PASS** |
| **AC-03: IDOR Defense on Submission** | Merchant A cannot submit Merchant B's products. | Verified with `BackendMarketplaceGuard.assertMerchantProductOwnership`; returns `403 FORBIDDEN`. | **PASS** |
| **AC-04: Separation of Duties** | Merchant cannot self-approve or publish products directly. | `PUT /merchant/products/:id` checks status change and rejects with `403 CANNOT_SELF_APPROVE`. | **PASS** |
| **AC-05: Re-Review Trigger on Edit** | Modifying published product content automatically resets status to `proposed`. | Tested: updating title/description of published product transitions status to `proposed`. | **PASS** |
| **AC-06: Moderation Queue Listing** | Super Admin queue endpoint listing all products in `proposed` status with merchant info. | `GET /admin/marketplace/moderation` with search, status filtering, and attached merchant profile. | **PASS** |
| **AC-07: Super Admin Product Approval** | Super Admin approves proposed product (`status: 'published'`). | `POST /admin/marketplace/products/:id/moderate` with `action: 'approve'` transitions product to `published`. | **PASS** |
| **AC-08: Active Merchant Check on Approval** | Block approving product if associated merchant is suspended or inactive. | Handler verifies merchant status; rejects with `400 MERCHANT_NOT_ACTIVE`. | **PASS** |
| **AC-09: Request Changes with Reason** | Super Admin requests changes (`proposed` &rarr; `draft`) with mandatory reason. | Requires non-empty reason; returns `400 CHANGES_REQUESTED_REASON_REQUIRED` if omitted. | **PASS** |
| **AC-10: Product Rejection with Reason** | Super Admin rejects product (`proposed` &rarr; `rejected`) with mandatory reason. | Requires non-empty reason; returns `400 REJECTION_REASON_REQUIRED` if omitted or whitespace. | **PASS** |
| **AC-11: Customer Catalog Isolation** | Storefront queries exclude draft, proposed, rejected, and suspended merchant items. | Customer graph filter strictly enforces `status === 'published'` AND `merchant.status === 'active'`. | **PASS** |
| **AC-12: Storefront Moderation UI** | Next.js 14 review queue for Super Admin and submit action for Merchant. | Implemented at `/admin/moderation` and integrated into `/merchant/products`. | **PASS** |
| **AC-13: OpenAPI 3.1 Specification** | All moderation operations documented in OpenAPI specification. | Documented and verified in `openapi.test.ts` (97 total operations). | **PASS** |
| **AC-14: Zero Regression & Integrity** | All existing commerce, auth, RBAC, review, and CRUD tests continue to pass 100%. | All 335 backend tests pass across 10 suites. Workspace typecheck clean. | **PASS** |

---

## 3. Test Suite & Verification Results

### 3.1 Focused Test Suite: `apps/backend/src/product-moderation.test.ts`
- **Total Tests:** 19
- **Passed:** 19
- **Failed:** 0
- **Execution Time:** ~65ms

Verified test scenarios:
1. `POST /merchant/products/:id/submit`: submits draft product for moderation (`draft` &rarr; `proposed`).
2. `POST /merchant/products/:id/submit`: allows resubmitting rejected product for re-moderation (`rejected` &rarr; `proposed`).
3. NEGATIVE: rejects submitting already proposed product (`400 ALREADY_SUBMITTED`).
4. NEGATIVE: rejects submitting already published product (`400 ALREADY_PUBLISHED`).
5. NEGATIVE IDOR Defense: Merchant A cannot submit Merchant B product (`403 FORBIDDEN`).
6. NEGATIVE Separation of Duties: Merchant cannot self-approve product to published status via PUT (`403 CANNOT_SELF_APPROVE`).
7. NEGATIVE Separation of Duties: Merchant cannot set status to proposed or any non-draft status via PUT (`403 CANNOT_SELF_APPROVE`).
8. NEGATIVE Non-admin caller cannot access moderation endpoint (`403 FORBIDDEN`).
9. Re-Review Trigger: automatically transitions published product to `proposed` when content is edited.
10. Re-Review Trigger: automatically transitions published product to `proposed` when a new variant is added.
11. `GET /admin/marketplace/moderation`: lists products in `proposed` status with merchant context.
12. `GET /admin/marketplace/moderation?q=...`: searches queue by title.
13. NEGATIVE: Non-admin caller cannot view moderation queue (`403 FORBIDDEN`).
14. Super Admin approves a proposed product and transitions to `published`.
15. NEGATIVE: blocks approving product if associated merchant is suspended (`400 MERCHANT_NOT_ACTIVE`).
16. Super Admin requests changes on a proposed product (`proposed` &rarr; `draft`) with mandatory reason.
17. NEGATIVE: request-changes without reason is rejected (`400 CHANGES_REQUESTED_REASON_REQUIRED`).
18. Super Admin rejects a proposed product (`proposed` &rarr; `rejected`) with mandatory reason.
19. NEGATIVE: reject without reason is blocked (`400 REJECTION_REASON_REQUIRED`).
20. Customer Storefront Catalog Isolation: guarantees only published products from active merchants are visible to public customers; draft, proposed, and suspended merchant products are strictly hidden.

### 3.2 Storefront PLP & Catalog Isolation Test Suite: `apps/storefront/src/plp-filtering.test.ts`
- **Describe 8: Storefront Marketplace Catalog & Moderation Isolation Invariant**
  - Scenario 1: `fetchPlpProducts strictly filters out unapproved products (draft, proposed, rejected)`: PASS
  - Scenario 2: `fetchPlpProducts strictly filters out products from non-active merchants (suspended, pending_approval, draft)`: PASS
- **Total Storefront Tests:** 296 passed (140 suites, 0 failed)

### 3.3 Full Backend Regression Suite
- **Total Tests:** 346
- **Passed:** 346
- **Failed:** 0
- **Suites:** 95 passed (10 test modules)
- **Execution Duration:** ~96s

Test Module Summary:
1. `commerce-domains.test.js`: PASS
2. `marketplace-ownership.test.js`: PASS
3. `persistent-integration.test.js`: PASS (20/20, including PG order/deletion concurrency & Redis session revocation)
4. `admin-auth.test.js`: PASS
5. `merchant-auth.test.js`: PASS
6. `role-management.test.js`: PASS (36/36)
7. `merchant-review.test.js` (M2-08): PASS (18/18)
8. `product-crud.test.js` (M2-09): PASS (20/20)
9. `product-moderation.test.js` (M2-10): PASS (19/19)
10. `openapi.test.js`: PASS (19/19, 97 total operations)

### 3.3 TypeScript & Workspace Typecheck
- `@ecom/types`: OK (`tsc --noEmit`)
- `@ecom/config`: OK (`tsc --noEmit`)
- `@ecom/cms`: OK (`tsc --noEmit`)
- `@ecom/storefront`: OK (`tsc --noEmit`)
- `@ecom/backend`: OK (`tsc --noEmit`)
- Root workspace: OK (`npm run typecheck` returned exit code 0)

---

## 4. Implementation Manifest

### Backend API Routes & Controllers
- `apps/backend/src/api/merchant/products/[id]/submit/route.ts` (POST submission for moderation)
- `apps/backend/src/api/merchant/products/[id]/route.ts` (PUT with anti-self-approval guard and re-review trigger)
- `apps/backend/src/api/admin/marketplace/moderation/route.ts` (GET moderation queue with filters)
- `apps/backend/src/api/admin/marketplace/products/[id]/moderate/route.ts` (POST moderation decisions: approve, reject, request-changes)

### Storefront Next.js 14 Management Portals
- `apps/storefront/src/app/admin/moderation/page.tsx` (Super Admin moderation queue, preview drawer, action dialogs)
- `apps/storefront/src/app/merchant/products/page.tsx` (Merchant catalog list with "Submit for Moderation" flow)

### Test Suites & Fixtures
- `apps/backend/src/product-moderation.test.ts` (18 focused tests)
- `apps/backend/src/api/__tests__/fixtures/mock-medusa-container.ts` (updated with 'proposed' status and merchant status enrichment)
- `apps/backend/package.json` (updated test runner pipeline to include M2-10)

### API Documentation & Type Contracts
- `apps/backend/src/api-docs/paths/admin-marketplace.ts` (OpenAPI definitions for moderation queue and actions)
- `apps/backend/src/api-docs/paths/merchant-operations.ts` (OpenAPI definitions for product submit route)
- `apps/backend/src/openapi.test.ts` (asserts exact 97 operations)
- `packages/types/src/marketplace.ts` (added 'proposed' to `ProductModerationStatus`)

---

## 5. Security & Invariant Analysis

1. **Separation of Duties (SoD):** The state machine strictly prevents the creator of a product from publishing it. Only callers authenticating through the Super Admin boundary can transition products to `published`.
2. **Post-Approval Tamper Protection:** If a merchant alters product content after platform approval, the status resets to `proposed`. The modified product cannot be purchased until re-approved by Super Admin.
3. **Suspended Merchant Quarantine:** Moderation approval strictly verifies that the product's owner is an `active` merchant. If a merchant was suspended while a product was pending in the queue, approval is blocked.
4. **Public Storefront Shielding:** Catalog queries enforce dual filters (`product.status === 'published' AND merchant.status === 'active'`), ensuring customers never see unreviewed or suspended merchant products.

---

## 6. Formal Technical Phase Gate Status

```
Technical Verification Gate: PASSED
Phase Status: ACCEPTED (Explicit Project Owner Approval: 2026-10-28)
```

All 14 Acceptance Criteria have been implemented, verified, audited, and formally accepted by the project owner.
