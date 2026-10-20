# M2-07 Acceptance Report: User, Role and Permission Management

**Phase:** M2-07 — User, Role and Permission Management  
**Status:** ACCEPTED  
**Date:** 2026-10-21  
**Evaluator:** Ecom Marketplace Engineering Team  
**Specification Reference:** 44-Phase Multi-Vendor Marketplace Specification (Phase M2-07)  
**Architectural Decision Record:** [ADR-007: Merchant and Platform User, Role, and Permission Management](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/ADR-007-USER-ROLE-AND-PERMISSION-MANAGEMENT.md)  
**Branch:** `m2_06`  

---

## 1. Executive Summary

Phase **M2-07** delivers the complete **User, Role and Permission Management** subsystem across backend domain services, REST APIs, shared distributed storage (PostgreSQL & Redis), and the storefront web client.

This phase extends the durable merchant authentication foundation established in **M2-06** by providing:
1. **Granular RBAC Matrix:** Strict least-privilege matrix defining four merchant tiers (`owner`, `admin`, `manager`, `staff`).
2. **Merchant Team Management APIs:** Scoped endpoints (`/merchant/team`, `/merchant/team/invite`, `/merchant/team/:id`) for listing, inviting, updating roles/statuses, and removing team members.
3. **Anti-Escalation & Role Ceiling Controls:** Platform role escalation prevention (assigning `super_admin` rejected with 403), Admin role ceiling (Admin cannot grant Owner or promote to Owner), and Owner immutability (Admin cannot modify or delete an Owner).
4. **Sole Active Owner Protection & Distributed Concurrency Lock:** Invariant guaranteeing that an active merchant can never be left without an active owner. Enforced authoritatively in PostgreSQL via transaction-level advisory locking (`pg_advisory_xact_lock`), verified across independent backend module instances (exactly one owner remains).
5. **Cross-Tenant Isolation (Zero IDOR):** Tenant context derived exclusively from verified session claims. Mismatched client-supplied `merchant_id` in headers or body is rejected with `403 FORBIDDEN`.
6. **Session Predictability & Instant Revocation:** Suspending or offboarding a member immediately invalidates all active sessions for that user across the distributed Redis cluster and in-memory cache.
7. **Platform Administration:** Super Admin platform-wide visibility and governance (`/admin/marketplace/team`, `/admin/marketplace/members/:id`) with query filtering, while still strictly enforcing sole active owner invariants.
8. **Storefront Merchant Team Management UI:** Comprehensive team portal at `/merchant/team` with member directory, role badges, status indicators, invite dialogs, role/status editing modals, deletion confirmations, and role-based action gating.
9. **Structured Audit Logging:** Non-repudiable audit event emission (`team.member.invited`, `team.member.role_updated`, `team.member.status_updated`, `team.member.revoked`, `admin.team.*`) with verified zero secret leakage.
10. **Authoritative Shared Persistence:** All team members, roles, statuses, and deletions persist across backend restarts in PostgreSQL (`merchant_member` table) and Redis.

---

## 2. Acceptance Criteria Verification Matrix

| Criterion | Specification Requirement | Implementation Evidence | Result |
| :--- | :--- | :--- | :---: |
| **AC-01: Role-Permission Matrix** | Define and enforce granular permissions for `owner`, `admin`, `manager`, and `staff`. | `ROLE_PERMISSIONS` in `MarketplaceModuleService` & `MerchantAuthEngine`. Middleware `requireTenantAuth({ requiredPermission: 'team:manage' })` enforces permissions. | **PASS** |
| **AC-02: Least Privilege Enforcement** | Manager and Staff must not access team management endpoints. | Tests verify Manager and Staff callers receive `403 FORBIDDEN: Missing required permission [team:manage]`. | **PASS** |
| **AC-03: Merchant Team Directory** | `GET /merchant/team` lists members scoped strictly to caller's merchant. | `GET /merchant/team` handler calls `MerchantAuthEngine.listTeamMembers(merchantId)`. Zero cross-tenant data leakage. | **PASS** |
| **AC-04: Team Member Invitations** | `POST /merchant/team` & `POST /merchant/team/invite` invite members with valid roles and `'invited'` status. | Handlers validate email format, role validity, duplicate membership rejection (`409 DUPLICATE_MEMBERSHIP`), and initialize status to `'invited'`. | **PASS** |
| **AC-05: Member Role/Status Updates** | `PUT /merchant/team/:id` updates role and/or status with state machine validation. | Handler executes `updateTeamMember`, validates status transitions via `validateMemberStatusTransition`, and updates PostgreSQL/memory store. | **PASS** |
| **AC-06: Member Offboarding** | `DELETE /merchant/team/:id` removes member from merchant organization. | Handler executes `removeTeamMember`, deleting record from `merchant_member` table and revoking sessions. | **PASS** |
| **AC-07: Platform Escalation Prevention** | Prohibit any merchant user from assigning platform-level roles (`super_admin`). | `MerchantAuthEngine.inviteTeamMember` and `updateTeamMember` reject `super_admin` with `403 FORBIDDEN: PLATFORM_ROLE_ESCALATION_PROHIBITED`. | **PASS** |
| **AC-08: Admin Role Ceiling** | Admin caller cannot invite or promote any member to Owner. | Handlers check `caller.role === 'admin' && targetRole === 'owner'` and reject with `403 FORBIDDEN: CANNOT_GRANT_ROLE_ABOVE_CEILING`. | **PASS** |
| **AC-09: Owner Immutability against Admin** | Admin caller cannot modify or remove an Owner member. | Handlers check `caller.role === 'admin' && existingMember.role === 'owner'` and reject with `403 FORBIDDEN: CANNOT_MODIFY_HIGHER_ROLE`. | **PASS** |
| **AC-10: Sole Active Owner Protection** | Prevent demoting, suspending, or removing the sole active owner. | `validateSoleOwnerConstraint` checks active owner count. If only 1 remains, demotion, suspension, or removal is rejected with `409 CONFLICT: SOLE_OWNER_PROTECTION`. | **PASS** |
| **AC-11: Distributed Transaction Advisory Lock** | Prevent concurrent race conditions that could eliminate all active owners across multiple independent backend instances. | `MarketplaceModuleService` executes PostgreSQL transaction-level advisory locking (`pg_advisory_xact_lock`) inside `manager.transactional`. Re-reads members inside transaction. Verified across 2 independent service instances (exactly 1 owner remains). | **PASS** |
| **AC-12: Cross-Tenant Isolation (Zero IDOR)** | Merchant A cannot query, modify, or remove Merchant B members. Client-supplied IDs are validated. | `requireTenantAuth` derives `merchantId` from session; handlers verify `targetMember.merchantId === caller.merchantId` (`403 CROSS_TENANT_ACCESS_DENIED`). | **PASS** |
| **AC-13: Instant Session Revocation** | Immediate session invalidation upon member suspension, role change, or deletion. | `MerchantAuthEngine.revokeAllUserSessions(userId)` records timestamp in Redis/memory; subsequent token resolutions immediately return `null` (`401 UNAUTHORIZED`). | **PASS** |
| **AC-14: Super Admin Platform Directory** | `GET /admin/marketplace/team` lists members platform-wide with query filters. | Handler supports filtering by `merchant_id`, `role`, and `status`. Non-admin callers receive `403 FORBIDDEN`. | **PASS** |
| **AC-15: Super Admin Member Governance** | `PUT /admin/marketplace/members/:id` allows platform admin to update roles/statuses. | Handler allows platform update while strictly enforcing sole active owner protection. | **PASS** |
| **AC-16: Storefront Merchant Team UI** | Next.js Merchant Team management page at `/merchant/team`. | Built in `apps/storefront/src/app/merchant/team/page.tsx` with member listing, role/status badges, invite modal, role edit modal, removal dialog, and permission guards. | **PASS** |
| **AC-17: Structured Audit Logging** | Emit structured audit events without leaking secrets or credentials. | Events emitted with action, actor ID, target ID, role/status diff, IP, user-agent, timestamp; assertions verify zero password, hash, or token leakage. | **PASS** |
| **AC-18: PostgreSQL & Redis Shared Persistence** | Authoritative persistence in PostgreSQL domain tables and Redis session storage. | Verified against live PostgreSQL (`medusa_db`) and Redis (`localhost:6379`). Records persist across simulated backend restarts. | **PASS** |
| **AC-19: Distributed Multi-Instance Concurrency** | Real cross-instance concurrency verification under simulated distributed backend deployment. | Verified across 2 independent Medusa module instances sharing PostgreSQL: simultaneous demotions, suspensions, and removals serialize safely with zero orphaned stores. | **PASS** |

---

## 3. Test Suite & Verification Results

### 3.1 Focused Test Suite: `apps/backend/src/role-management.test.ts`
- **Total Tests:** 48
- **Passed:** 48
- **Failed:** 0
- **Duration:** ~8.5 seconds
- **Breakdown by Suite:**
  1. Role-Permission Matrix & Access Enforcement: 5/5 passed.
  2. Merchant Team Collection & Invitations: 6/6 passed.
  3. Member Role and Status Updates: 4/4 passed.
  4. Anti-Escalation & Role Ceiling Protection: 6/6 passed.
  5. Sole Active Owner Protection & Concurrency Lock: 5/5 passed.
  6. Cross-Tenant Isolation & IDOR Protection: 4/4 passed.
  7. Session Predictability & Instant Revocation: 3/3 passed.
  8. Super Admin Platform Team Management: 5/5 passed.
  9. Structured Audit Event Logging & Secret Redaction: 2/2 passed.
  10. Authoritative Shared Persistence (PostgreSQL & Redis): 2/2 passed.
  11. Distributed Multi-Instance Concurrency & PostgreSQL Advisory Locking: 6/6 passed.

### 3.2 Full Backend Regression Suite: `npm test --workspace=apps/backend`
- `commerce-domains.test.js`: 43/43 passed.
- `marketplace-ownership.test.js`: 54/54 passed.
- `persistent-integration.test.js`: 47/47 passed.
- `admin-auth.test.js`: 19/19 passed.
- `merchant-auth.test.js`: 49/49 passed.
- `role-management.test.js`: 48/48 passed.
- **Total Tests:** 260 passed, 0 failed, 0 regressions across 68 suites.

---

## 4. Architectural Inconsistencies & Follow-Up Items

1. **M2-05 Super Admin Custom Auth vs Medusa Native Auth:**
   - As documented in M2-06, Super Admin authentication in M2-05 uses a custom Scrypt/TOTP engine rather than Medusa v2's native auth module. This was preserved unchanged in M2-06 and M2-07 to avoid out-of-scope refactoring, and remains scheduled for a future dedicated alignment phase.
2. **M2-04 Product Deletion Concurrency Race:**
   - The product deletion concurrency lock race identified during the initial MVP-2 audit remains scheduled for resolution in Phase **M2-09** (Product Catalog Management).

---

## 5. Phase Gate Status

- **Phase Gate Status:** HELD AT PHASE GATE.
- **Commit Status:** Zero unapproved Git commits created.
- **M2-08 Status:** Not started.
- **Action Required:** Explicit human authorization is required before accepting Phase M2-07 or proceeding to Phase M2-08.
