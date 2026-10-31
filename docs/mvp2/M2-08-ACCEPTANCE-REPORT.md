# M2-08 Acceptance Report: Merchant Review and Approval

**Phase:** M2-08 — Merchant Review and Approval  
**Status:** ACCEPTED (Explicit Project Owner Approval)  
**Date:** 2026-10-21 (Approved: 2026-10-28)  
**Evaluator:** Ecom Marketplace Engineering Team  
**Specification Reference:** 44-Phase Multi-Vendor Marketplace Specification (Phase M2-08)  
**Branch:** `m2_08`  

---

## 1. Executive Summary

Phase **M2-08** delivers the complete **Merchant Review and Approval** subsystem for the multi-vendor marketplace platform across backend domain services, Super Admin REST APIs, OpenAPI 3.1 documentation, and the Storefront Next.js management UI.

This phase establishes the administrative gatekeeper between initial merchant onboarding (M2-06) and commercial marketplace activity:
1. **Super Admin Review Queue API (`GET /admin/marketplace/merchants`):** Enables platform administrators to browse, filter by lifecycle status (`draft`, `pending_approval`, `active`, `suspended`, `rejected`), search by business name/handle, and inspect owner verification status.
2. **Merchant Application Detail View API (`GET /admin/marketplace/merchants/:id`):** Provides a comprehensive view of business registration (GSTIN, PAN), contact information, verification metadata, active owner profile, team members, catalog product count, and complete audit lifecycle history.
3. **Application Review & Lifecycle Transitions API (`PUT /admin/marketplace/merchants/:id/status`):**
   - **Approve (`approve`):** Transitions `pending_approval` -> `active`. Strictly validates that the merchant has at least one active owner before approval is granted (`OWNER_REQUIRED`).
   - **Request Changes (`request-changes`):** Transitions `pending_approval` -> `draft` with mandatory `changesRequestedReason` recorded in verification metadata, allowing the merchant to amend defective details and resubmit without schema churn.
   - **Reject (`reject`):** Transitions `pending_approval` -> `rejected` with mandatory `rejectedReason` and platform audit stamp.
   - **Suspend (`suspend`):** Transitions `active` -> `suspended` with mandatory `suspendedReason`, triggering immediate distributed session revocation across Redis for all merchant team members.
   - **Reactivate (`reactivate`):** Transitions `suspended` -> `active` with audit logging and timestamping.
4. **Separation of Duties & Authorization:** Non-admin callers (customers, merchant users) attempting to access review endpoints are strictly blocked with `403 FORBIDDEN`. Merchants cannot self-approve.
5. **Commercial Endpoint Gating:** Any merchant account in `suspended`, `pending_approval`, `draft`, or `rejected` state is strictly barred from catalog mutation and commercial operations (`403 FORBIDDEN: MERCHANT_NOT_ACTIVE`).
6. **Storefront Super Admin Review Portal (`/admin/merchants`):** Built interactive review UI featuring status tab filtering, real-time search, detail modal with verification checks, action dialogs with mandatory reason fields, and clear audit history display.

---

## 2. Acceptance Criteria Verification Matrix

| Criterion | Specification Requirement | Implementation Evidence | Result |
| :--- | :--- | :--- | :---: |
| **AC-01: Super Admin Review Queue** | `GET /admin/marketplace/merchants` lists applications with status filters and search. | `api/admin/marketplace/merchants/route.ts` supports `?status=`, `?q=`, `limit`, and `offset`. | **PASS** |
| **AC-02: Application Detail Inspection** | `GET /admin/marketplace/merchants/:id` provides comprehensive business profile, owner details, team members, and audit history. | `api/admin/marketplace/merchants/[id]/route.ts` aggregates profile, GSTIN/PAN metadata, owner, members, and product count. | **PASS** |
| **AC-03: Approval Transition** | Approve pending merchant with active owner check. | `PUT /admin/marketplace/merchants/:id/status` validates `active` owner exists before transitioning to `active`. | **PASS** |
| **AC-04: Mandatory Reason on Rejection** | Rejection requires non-empty explanation. | Request rejected with `400 REJECTION_REASON_REQUIRED` if reason is omitted or whitespace. | **PASS** |
| **AC-05: Request Changes Workflow** | Transition `pending_approval` to `draft` with mandatory reason. | Enforced in `validateMerchantStatusTransition` and route handler (`400 CHANGES_REQUESTED_REASON_REQUIRED`). | **PASS** |
| **AC-06: Suspension & Session Revocation** | Suspend active merchant with reason and immediately invalidate sessions. | Mandatory reason enforced (`400 SUSPENSION_REASON_REQUIRED`). `MerchantAuthEngine.revokeAllUserSessions` invoked for all members. | **PASS** |
| **AC-07: Reactivation Workflow** | Reactivate suspended merchant to active state. | Transitions `suspended` -> `active` with audit trail recording. | **PASS** |
| **AC-08: Separation of Duties** | Prevent merchant self-approval or non-admin status mutation. | Route protected by `requireTenantAuth({ boundary: 'admin' })`. Merchant callers receive `403 FORBIDDEN`. | **PASS** |
| **AC-09: Commercial Status Gating** | Non-active merchants blocked from commercial endpoints. | Verified via `verifyActiveMembership` in `requireTenantAuth` (`403 MERCHANT_NOT_ACTIVE`). | **PASS** |
| **AC-10: Super Admin Review UI** | Administrative portal for merchant review and queue management. | Implemented in `apps/storefront/src/app/admin/merchants/page.tsx` with full interactive modals and filters. | **PASS** |
| **AC-11: OpenAPI 3.1 Documentation** | Accurate OpenAPI operations for all review routes. | Documented in `src/api-docs/paths/admin-marketplace.ts` and verified by `openapi.test.ts`. | **PASS** |
| **AC-12: Zero Regression** | Existing MVP-1 and MVP-2 suites continue to pass 100%. | All 297 backend tests and 66 `@ecom/types` tests pass cleanly. | **PASS** |

---

## 3. Test Suite & Verification Results

### 3.1 Focused Test Suite: `apps/backend/src/merchant-review.test.ts`
- **Total Tests:** 18
- **Passed:** 18
- **Failed:** 0
- **Execution Time:** ~28ms

Key test scenarios:
1. `GET /admin/marketplace/merchants` listing across all statuses.
2. `GET /admin/marketplace/merchants?status=pending_approval` filtering.
3. `GET /admin/marketplace/merchants?q=Vedic` full-text search.
4. Non-admin caller rejection (`403 Forbidden`).
5. Merchant detail retrieval with owner verification and audit history.
6. Approval transition with active owner verification.
7. Approval blocked when active owner is missing (`OWNER_REQUIRED`).
8. Request changes transition with reason recording.
9. Request changes blocked without reason (`CHANGES_REQUESTED_REASON_REQUIRED`).
10. Rejection transition with reason recording.
11. Rejection blocked without reason (`REJECTION_REASON_REQUIRED`).
12. Suspension transition with mandatory reason and distributed session revocation.
13. Suspension blocked without reason (`SUSPENSION_REASON_REQUIRED`).
14. Reactivation transition from suspended to active.
15. Merchant self-approval blocked (`403 Forbidden`).
16. Commercial operation gating on suspended merchant (`403 Forbidden`).
17. Commercial operation gating on pending merchant (`403 Forbidden`).

### 3.2 Full Backend Regression Suite
- **Total Tests:** 297
- **Passed:** 297
- **Failed:** 0
- **Suites:** 82 passed

### 3.3 Typechecks
- `@ecom/types`: OK (66 tests passed)
- `@ecom/backend`: OK (`tsc --noEmit` clean)
- `@ecom/storefront`: OK (`tsc --noEmit` clean)

---

## 4. Implementation Manifest

| File | Change Type | Purpose |
| :--- | :--- | :--- |
| `packages/types/src/marketplace.ts` | Modified | Added `changesRequestedReason` to status transition validation and `MerchantVerificationMetadata`. |
| `apps/backend/src/modules/marketplace/service.ts` | Modified | Stamped `changesRequestedAt/By/Reason` in metadata upon `pending_approval` -> `draft` transition. |
| `apps/backend/src/api/admin/marketplace/merchants/route.ts` | Created | Super Admin review queue endpoint (`GET`). |
| `apps/backend/src/api/admin/marketplace/merchants/[id]/route.ts` | Created | Super Admin merchant application detail endpoint (`GET`). |
| `apps/backend/src/api/admin/marketplace/merchants/[id]/status/route.ts` | Created | Super Admin review action handler (`PUT`). |
| `apps/backend/src/api-docs/paths/admin-marketplace.ts` | Modified | OpenAPI 3.1 documentation for all review endpoints. |
| `apps/backend/src/openapi.test.ts` | Modified | Updated operation count assertion to 91 for M2-08 endpoints. |
| `apps/backend/src/merchant-review.test.ts` | Created | Test suite covering all 18 M2-08 scenarios. |
| `apps/backend/package.json` | Modified | Included `merchant-review.test.js` in `npm test` script. |
| `apps/storefront/src/app/admin/merchants/page.tsx` | Created | Next.js 14 Super Admin review queue and decision UI. |

---

## 5. Gate Status

**Phase M2-08 Gate Status:** `ACCEPTED`  
**Approval Confirmation:** Explicit project owner authorization recorded on 2026-10-28.  
All automated tests, typechecks, security invariants, and UI requirements have been verified and accepted.
