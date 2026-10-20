# M2-06 Acceptance Report: Merchant Authentication and Onboarding

**Phase:** M2-06 — Merchant Authentication and Onboarding  
**Status:** ACCEPTED  
**Date:** 2026-10-20  
**Evaluator:** Ecom Marketplace Engineering Team  
**Branch:** `m2_06`  
**Base Commit:** `b0bd62c` (`feat: Implement Super Admin Authentication, Session Lifecycle & MFA (Phase M2-05)`)  

---

## 1. Executive Summary

Phase M2-06 establishes the **Merchant Security Boundary**, **Onboarding Flow**, and **Native Medusa v2 Authentication & PostgreSQL Identity Persistence** for the Ateevra multi-vendor marketplace:
- **Native Medusa v2 Identity & Auth Modules:** Merchant credentials and identities are managed natively via `@medusajs/auth` with the `@medusajs/auth-emailpass` provider and `@medusajs/user`. Zero direct raw SQL queries against Medusa-owned core tables.
- **Strict Credential Separation (Zero Metadata Hashes):** Passwords are cryptographically hashed using native Scrypt (`scrypt-kdf` with `{ logN: 15, r: 8, p: 1 }`) and stored exclusively in `provider_identity.provider_metadata.password`. Custom password hashes and salts are strictly prohibited from `"user".metadata` (`passwordHash: undefined`, `passwordSalt: undefined`).
- **Actor & Identity Separation:** The authenticated identity in `auth_identity` is linked to the user actor via `app_metadata: { user_id: string, actor_type: 'merchant_user' }`.
- **Atomic Compensation Rollback on Registration:** Store registration orchestrates across `@medusajs/auth`, `@medusajs/user`, and `MarketplaceModuleService`. If any step fails (such as member provisioning or unique handle collision), an automated compensation sequence cleans up all created entities in reverse order, guaranteeing zero orphaned merchants, users, or auth identities.
- **Multi-Instance & Process Restart Durability:** Authenticated credentials and live status dynamically persist across simulated process restarts and dual backend instances sharing the PostgreSQL and Redis cluster.
- **Dedicated Identity & Boundary Isolation:** Merchants authenticate exclusively using corporate emails and native Medusa v2 passwords. Customer SMS-OTP and Super Admin Scrypt+MFA tokens are denied access to merchant portals.
- **Trusted Onboarding Lifecycle:** Merchant store registration enforces Indian business and tax validation (GSTIN 15-char, PAN 10-char, Phone +91 E.164, Handle) and initializes accounts strictly in `draft` status. Client-controlled self-activation is prohibited.
- **Dual-Transport Session Management:** Issues both `ecom_merchant_sess` HTTP-only cookies (`Path=/merchant`, `SameSite=Strict`, `Secure` in prod) and Bearer tokens (`sess_merch_*`).
- **Redis Session Storage:** Sessions are persisted under `session:merch:${token}` with a sliding 2-hour idle timeout and an absolute 24-hour maximum TTL. Single-session logout and global user revocation (`user:revoked_at:${userId}`) are enforced.
- **Server-Side Status Gating:** Merchants in `draft`, `pending_approval`, `suspended`, or `rejected` status—and members in `invited` or `suspended` status—are rejected with `403 FORBIDDEN` from active commercial operations, even when presenting valid sessions.
- **Distributed Rate Limiting:** 5 failed login attempts per 15-minute window per IP/email triggers a 15-minute account lockout (`429 TOO_MANY_REQUESTS`).
- **Single-Use Password Recovery:** 15-minute cryptographically secure reset tokens consumed atomically, invalidating all pre-existing sessions.
- **Production Fail-Closed Security:** In production mode, Redis or PostgreSQL unavailability triggers `REDIS_SECURITY_FAILURE` rather than degrading to unpersisted memory.
- **Full Storefront User Interface:** Fully responsive onboarding (`/merchant/onboarding`) and login (`/merchant/login`) pages with client validation, loading states, rate-limiting countdowns, and pending verification status screens.

---

## 2. Deliverables & File Changes

| Area | File | Summary of Implementation |
| :--- | :--- | :--- |
| **Types** | `packages/types/src/auth.ts` | Added `MerchantRegisterPayload`, `MerchantRegisterResponse`, `MerchantLoginPayload`, `MerchantLoginResponse`, `MerchantSessionRecord`, `MerchantForgotPasswordPayload`, `MerchantResetPasswordPayload`, `MerchantAuthAuditEvent`. |
| **Backend Engine** | `apps/backend/src/modules/auth/merchant-auth-engine.ts` | Implemented `MerchantAuthEngine`, `MedusaNativeMerchantIdentityStore` (aliased as `PostgresMerchantIdentityStore`), `RedisMerchantAuthStorageAdapter`, `InMemoryMerchantIdentityStore`, `InMemoryMerchantAuthStorageAdapter`, native Medusa auth integration, compensation rollback, rate limiting, and reset token lifecycle. |
| **Middleware** | `apps/backend/src/api/middlewares/tenant-auth.ts` | Updated `resolveSessionFromToken` to resolve `sess_merch_*` sessions via `MerchantAuthEngine`. |
| **API Endpoints** | `apps/backend/src/api/merchant/auth/register/route.ts` | `POST /merchant/auth/register`: Validates Indian credentials, creates store in `draft`, provisions owner user and membership via domain services with compensation rollback. |
| **API Endpoints** | `apps/backend/src/api/merchant/auth/login/route.ts` | `POST /merchant/auth/login`: Distributed rate limiting, native Medusa `emailpass` verification, dual-transport session issuance. |
| **API Endpoints** | `apps/backend/src/api/merchant/auth/session/route.ts` | `GET /merchant/auth/session`: Validates token, refreshes sliding 2h idle TTL, asserts boundary and live DB status. |
| **API Endpoints** | `apps/backend/src/api/merchant/auth/logout/route.ts` | `POST /merchant/auth/logout`: Revokes session in storage, clears `ecom_merchant_sess` cookie. |
| **API Endpoints** | `apps/backend/src/api/merchant/auth/forgot-password/route.ts` | `POST /merchant/auth/forgot-password`: Issues 15-minute single-use reset token. |
| **API Endpoints** | `apps/backend/src/api/merchant/auth/reset-password/route.ts` | `POST /merchant/auth/reset-password`: Consumes reset token atomically, updates password via Medusa auth provider, revokes sessions. |
| **Storefront UI** | `apps/storefront/src/app/merchant/onboarding/page.tsx` | Seller registration form, Indian syntax validation, loading, error banners, and post-submission pending verification state. |
| **Storefront UI** | `apps/storefront/src/app/merchant/login/page.tsx` | Seller login form, rate-limiting lockout timer (429), status gating notifications (draft/suspended/rejected), forgot/reset password modals. |
| **Tests** | `apps/backend/src/merchant-auth.test.ts` | Comprehensive automated test suite verifying all 21 security, lifecycle, Medusa native auth, compensation rollback, and real-Redis requirements across 49 tests. |
| **Build Script** | `apps/backend/package.json` | Added `dist/merchant-auth.test.js` to standard backend test runner. |
| **Architecture** | `docs/mvp2/ADR-006-MERCHANT-AUTHENTICATION-AND-ONBOARDING.md` | Formalized architecture decision record for merchant auth, sessions, Medusa native persistence, and onboarding. |

---

## 3. Requirements Verification Matrix

| Requirement | Test Coverage / Evidence | Status |
| :--- | :--- | :--- |
| **Native Medusa Provider Auth** | Authenticates credentials via `@medusajs/auth` `emailpass`; zero raw SQL queries against core tables | **PASS** |
| **Zero Metadata Credential Leaks**| `user.metadata` confirmed free of `passwordHash` and `passwordSalt` (`undefined`) | **PASS** |
| **Actor & Identity Separation** | `auth_identity.app_metadata` links to `user_id` and `actor_type: 'merchant_user'` | **PASS** |
| **Process Restart Persistence** | Authenticates on fresh backend instance with zero in-memory state; resolves session | **PASS** |
| **Dual Backend Simulation** | Instance A and Instance B share PostgreSQL + Redis; live status mutations propagate | **PASS** |
| **Password Reset Across Restarts**| Token consumed on restarted instance; old password fails; new succeeds; sessions revoked | **PASS** |
| **Concurrent Duplicate Email** | Concurrent registrations roll back via `IDX_user_email_unique`; exactly 1 user in DB | **PASS** |
| **Concurrent Duplicate Handle**| Concurrent registrations roll back via `idx_merchant_handle`; exactly 1 merchant in DB | **PASS** |
| **Atomic Compensation Rollback**| Simulated member creation failure triggers complete compensation sequence (zero orphan rows) | **PASS** |
| **Scrypt Password Hashing** | Constant-time verification, native Scrypt hash stored in `provider_identity.provider_metadata.password` | **PASS** |
| **Onboarding Server Validation** | GSTIN 15-char, PAN 10-char, Phone +91 E.164, handle uniqueness, min 8-char password | **PASS** |
| **Draft Status Initial State** | Initial merchant status strictly `'draft'`; client-controlled activation blocked | **PASS** |
| **Owner Provisioning** | First member created as `'owner'` with `'active'` status | **PASS** |
| **Dual-Transport Sessions** | Cookie `ecom_merchant_sess` (`HttpOnly`, `SameSite=Strict`, `Path=/merchant`, `Secure`) + Bearer `sess_merch_*` | **PASS** |
| **Rate Limiting & Lockout** | 5 consecutive failed attempts locks account for 15 minutes (`429 TOO_MANY_REQUESTS`); resets on success | **PASS** |
| **Sliding Idle Timeout** | Active requests refresh 2-hour idle TTL in Redis | **PASS** |
| **Absolute TTL Cap** | Session expires at 24 hours regardless of continuous activity | **PASS** |
| **Centralized Logout** | `POST /merchant/auth/logout` deletes Redis session and clears cookie | **PASS** |
| **Global Revocation** | `revokeAllUserSessions(userId)` immediately terminates all active sessions for that user | **PASS** |
| **Server-Side Status Gating** | `draft`, `pending_approval`, `suspended`, `rejected` accounts blocked with 403 `FORBIDDEN` | **PASS** |
| **Member Status Gating** | `invited` or `suspended` members blocked with 403 `FORBIDDEN` | **PASS** |
| **Anti-Forgery Defense** | Client-supplied `merchant_id` mismatch rejected with 403 `FORBIDDEN` (`FORGED_MERCHANT_ID`) | **PASS** |
| **Boundary Isolation** | Customer tokens blocked from `/merchant/*` with 403; Admin tokens blocked from `/merchant/auth/session` | **PASS** |
| **Direct Activation Blocked** | `validateMerchantStatusTransition('draft', 'active')` throws `DIRECT_ACTIVATION_BLOCKED` | **PASS** |
| **Sole Active Owner Protection**| `validateSoleOwnerConstraint` rejects demotion or deactivation of sole active owner | **PASS** |
| **Password Reset Single-Use** | 15-minute reset token consumed atomically; replay rejected with 400; prior sessions revoked | **PASS** |
| **Real Redis Integration** | Multi-instance session persistence, sliding TTL, rate limiting, and atomic reset on Redis port 6379 | **PASS** |
| **Production Fail-Closed** | Missing/dead Redis in production throws `REDIS_SECURITY_FAILURE`; memory adapter blocked | **PASS** |
| **Secret Redaction** | Zero passwords, salts, or reset tokens in structured audit logs | **PASS** |

---

## 4. Exact Verification Commands & Results

### 4.1 Focused Test Suite: `node --test apps/backend/dist/merchant-auth.test.js`
- **Result:** PASS (Exit code 0, natural process exit)
- **Total Tests:** 49 passed, 0 failed, 0 skipped, 0 cancelled
- **Suites:** 15 passed
- **Duration:** 18,894ms
- **Integration Highlights:**
  - `persists merchant registration and owner user durably across PostgreSQL tables`: PASS (1702ms)
  - `authenticates user across simulated process restarts with zero in-memory state`: PASS (703ms)
  - `simulates dual backend instances sharing the same PostgreSQL and Redis cluster`: PASS (893ms)
  - `persists password reset across process restarts and invalidates distributed sessions`: PASS (2404ms)
  - `enforces ACID transaction rollback on concurrent duplicate email registration`: PASS (1105ms)
  - `enforces ACID transaction rollback on concurrent duplicate store handle registration`: PASS (812ms)
  - `guarantees atomic compensation rollback on partial registration failure with zero orphaned records`: PASS (706ms)

### 4.2 Full Backend Suite: `npm test --workspace=apps/backend`
- **Result:** PASS (Exit code 0, natural process exit)
- **Total Tests:** 212 passed, 0 failed, 0 skipped, 0 cancelled
- **Suites:** 56 passed
- **Duration:** 40,869ms
- **Included Test Suites:**
  1. `commerce-domains.test.js` (MVP-1 catalog, bag, checkout, payments, orders, shipping, returns, refunds, exchanges)
  2. `marketplace-ownership.test.js` (M2-01 & M2-04 tenant scoping and API boundaries)
  3. `persistent-integration.test.js` (M2-03 & M2-04 persistent PostgreSQL link compensation and lifecycle)
  4. `admin-auth.test.js` (M2-05 Super Admin authentication, Scrypt, TOTP MFA, backup codes, fail-closed Redis)
  5. `merchant-auth.test.js` (M2-06 Merchant authentication, onboarding, status gating, sliding sessions, rate limiting, native Medusa auth, and compensation rollback)

### 4.3 Workspace Typecheck: `npm run typecheck --workspaces --if-present`
- **Result:** PASS (Exit code 0 across all 5 workspaces)
  - `@ecom/backend`: 0 errors
  - `@ecom/cms`: 0 errors
  - `@ecom/storefront`: 0 errors
  - `@ecom/config`: 0 errors
  - `@ecom/types`: 0 errors

### 4.4 Fresh-Database Migration & Native Authentication Verification
- **Environment & Isolation:** Dedicated isolated database `medusa_m206_fresh_verify` dynamically provisioned; development database `medusa_db` verified unchanged at 149 tables before and after execution.
- **Migration Execution:** `medusa db:migrate` executed against empty database; migrated all core Medusa modules, marketplace module migration `Migration20261019000000.ts`, link tables (`marketplace_merchant_product_product`, `marketplace_merchant_order_order_line_item`, `marketplace_merchant_stock_location_stock_location`), and core migration scripts.
- **Table & Index Verification:** 149 tables created; primary keys and unique indexes verified (`merchant_pkey`, `idx_merchant_handle`, `idx_merchant_email`, `merchant_member_pkey`, `idx_merchant_member_unique`, `auth_identity_pkey`, `provider_identity_pkey`, `user_pkey`).
- **Native Persistence Audit:**
  - `auth_identity` row confirmed: `app_metadata: { user_id: '...', actor_type: 'merchant_user' }`.
  - `provider_identity` row confirmed: `provider: 'emailpass'`, native Scrypt password hash in `provider_metadata.password`.
  - `public.user` row confirmed: **zero password hashes or salts in metadata** (`passwordHash: undefined`, `passwordSalt: undefined`).
  - `merchant` & `merchant_member` confirmed: handle `fresh-migrated-store`, status `draft`, owner membership `active`.
- **E2E Smoke Test:** Valid credentials authenticated successfully, issued session token (`sess_merch_*`), resolved session boundary `merchant` and role `owner`; invalid password rejected with `Invalid email or password`.
- **Teardown:** `DROP DATABASE medusa_m206_fresh_verify WITH (FORCE)` executed cleanly; zero test residuals.
- **Exit Code:** 0

---

## 5. Architectural Divergence with M2-05 Super Admin

- **Phase M2-05 (Super Admin):** Utilizes custom Scrypt hashing stored in `"user".metadata` and an in-memory user registry for admin identity.
- **Phase M2-06 (Merchant):** Adheres strictly to ADR-002, using Medusa v2's native `@medusajs/auth` module (`emailpass` provider), separating identity (`auth_identity`) from actor (`"user"`), storing Scrypt hashes exclusively in `provider_identity`, and managing stores/members via `MarketplaceModuleService`.
- **Scope Boundary:** To respect strict phase boundaries and avoid regression of accepted M2-05 behavior, **no changes were made to M2-05 code during Phase M2-06**. Aligning M2-05 to native Medusa v2 authentication is explicitly preserved as a documented follow-up architectural item.

---

## 6. Phase Boundary Adherence

- Zero modifications to customer authentication (`/store/*`).
- Zero modifications to Super Admin MFA engine (`/admin/auth/*`).
- Preserved M2-04 product deletion concurrency race for M2-09.
- Zero catalog, inventory, order fulfillment, moderation, commission, or payout features implemented.

---

## 7. Decision Status

**ACCEPTED**. Phase M2-06 — Merchant Authentication and Onboarding is formally accepted following human authorization. All 49/49 merchant authentication tests passed, all 212/212 full backend tests passed, all five workspace TypeScript checks passed with 0 errors, and the independent fresh-database migration and native authentication verification passed with exit code 0. Zero password hashes or salts leak into user metadata. The documented M2-05 Super Admin authentication divergence is tracked for future alignment, and the M2-04 product deletion concurrency race remains tracked for M2-09.

