# ADR-007: Merchant and Platform User, Role, and Permission Management

**Status:** IMPLEMENTED / PENDING HUMAN ACCEPTANCE  
**Date:** 2026-10-20  
**Authors:** Ecom Engineering Team  
**Scope:** MVP-2 User, Role and Permission Management (M2-07)  
**Dependencies:** ADR-002 (Architecture), ADR-003 (Tenant Isolation), ADR-004 (Marketplace Ownership), ADR-006 (Merchant Authentication)  

---

## 1. Context and Problem Statement

Following the completion of **M2-06** (Merchant Authentication and Onboarding), merchants can securely apply, register, and authenticate using Medusa v2's native authentication module (`@medusajs/auth-emailpass`) backed by Scrypt credential verification and PostgreSQL durable storage.

However, production multi-vendor marketplace governance requires granular access control, delegation, and role lifecycle management within each merchant organization, as well as overarching administrative oversight by platform operators.

Phase **M2-07** establishes the comprehensive **User, Role and Permission Management** subsystem:
1. **Merchant Team Management (`/merchant/team`):** Scoped access for merchant staff to view, invite, update roles/statuses, and offboard team members.
2. **Strict Least Privilege & Role Hierarchy:** Distinct permission sets across four merchant tiers (`owner`, `admin`, `manager`, `staff`).
3. **Anti-Escalation & Role Ceiling Controls:** Protection against privilege escalation, including prohibiting merchant assignment of platform roles (`super_admin`), preventing Admin users from inviting or promoting members to Owner, and preventing Admin users from modifying or removing Owners.
4. **Sole Active Owner Protection:** Absolute prevention of orphaned stores. Every active merchant must maintain at least one active owner. Concurrency control via mutex locks (`withMerchantLock`) prevents race conditions during simultaneous owner demotions or removals.
5. **Cross-Tenant Isolation & IDOR Defense:** Team operations are strictly bound to the verified caller's tenant context. Client-supplied merchant IDs in headers or body are validated or discarded.
6. **Predictable Session Lifecycle & Distributed Revocation:** Any role change, member suspension, or member removal immediately invalidates all active sessions for that user across all backend instances via Redis shared storage.
7. **Platform Governance (`/admin/marketplace/team`):** Super Admin visibility across all merchant teams with filtering, combined with the ability to modify member roles/statuses while still respecting sole active owner constraints.
8. **Structured Audit Logging:** Non-repudiable audit event emission with zero credential or secret leakage.
9. **Authoritative Shared Persistence:** Member records and relationships are persisted in Medusa v2's `merchant_member` table and User module, ensuring consistency across backend process restarts.

---

## 2. Decision Drivers

- **Least Privilege (Principle of Least Authority):** Team members only receive the permissions necessary for their operational responsibilities. Operational staff must not have team management or payout authority.
- **Strict Role Ceiling:** Subordinate administrators must never be able to grant privileges higher than their own or usurp higher-ranking accounts.
- **Store Continuity Invariant:** A merchant organization must never exist without an active owner to assume commercial, legal, and operational responsibility.
- **Cross-Tenant Security (Zero IDOR):** No merchant user can query, invite, modify, or remove users belonging to another merchant organization.
- **Instant Revocation Semantics:** Security policy enforcement must not rely on waiting for JWT or session token expiration. Suspended or offboarded users must be denied access immediately.
- **Separation of Tenant and Platform Concerns:** Platform operators oversee and govern merchant teams without bypassing critical business rules like sole owner protection.
- **Audit Integrity & Secret Hygiene:** Audit logs must track all privilege grants and revocations with actor context, timestamp, and IP, but must never contain passwords, hashes, salts, or session tokens.

---

## 3. Architectural Specifications

### 3.1 Role-Permission Matrix

The platform implements four distinct merchant roles and one platform administration role:

| Permission | Owner | Admin | Manager | Staff | Super Admin |
| :--- | :---: | :---: | :---: | :---: | :---: |
| `team:manage` | **Yes** | **Yes** (with ceiling) | No | No | Platform-level |
| `catalog:read` | **Yes** | **Yes** | **Yes** | **Yes** | Cross-tenant |
| `catalog:write` | **Yes** | **Yes** | **Yes** | No | Cross-tenant |
| `catalog:delete` | **Yes** | **Yes** | No | No | Cross-tenant |
| `inventory:read` | **Yes** | **Yes** | **Yes** | No | Cross-tenant |
| `inventory:adjust` | **Yes** | **Yes** | **Yes** | No | Cross-tenant |
| `orders:read` | **Yes** | **Yes** | **Yes** | **Yes** | Cross-tenant |
| `orders:fulfill` | **Yes** | **Yes** | **Yes** | **Yes** | Cross-tenant |
| `returns:read` | **Yes** | **Yes** | **Yes** | No | Cross-tenant |
| `returns:process` | **Yes** | **Yes** | **Yes** | No | Cross-tenant |
| `financials:view` | **Yes** | No | No | No | Platform-level |
| `financials:payout` | **Yes** | No | No | No | Platform-level |
| `settings:manage` | **Yes** | No | No | No | Platform-level |

### 3.2 Anti-Escalation & Role Ceiling Enforcement Rules

1. **Platform Role Ceiling:**
   - No merchant user can invite or assign the `super_admin` role. Attempting this returns `403 FORBIDDEN: PLATFORM_ROLE_ESCALATION_PROHIBITED`.
2. **Owner Role Ceiling:**
   - Only users with `role: 'owner'` can invite another `owner`. An Admin attempting to invite an Owner returns `403 FORBIDDEN: CANNOT_GRANT_ROLE_ABOVE_CEILING`.
   - Only users with `role: 'owner'` can promote an existing member to `owner`. An Admin attempting this returns `403 FORBIDDEN: CANNOT_GRANT_ROLE_ABOVE_CEILING`.
3. **Owner Immutability against Admin Callers:**
   - An Admin caller cannot modify the role or status of an Owner. Attempting this returns `403 FORBIDDEN: CANNOT_MODIFY_HIGHER_ROLE`.
   - An Admin caller cannot remove or offboard an Owner. Attempting this returns `403 FORBIDDEN: CANNOT_MODIFY_HIGHER_ROLE`.
4. **Peer Admin Management:**
   - Admins can manage Staff and Manager members (invite, promote, demote, suspend, remove).
   - Admins can also manage fellow Admins (subject to sole active owner and cross-tenant rules).

### 3.3 Sole Active Owner Protection & Distributed Concurrency Invariant

- Every active merchant must possess at least one member with `role === 'owner'` and `status === 'active'`.
- Demoting the sole active owner to `admin`, `manager`, or `staff` is blocked with `409 CONFLICT: SOLE_OWNER_PROTECTION`.
- Suspending the sole active owner is blocked with `409 CONFLICT: SOLE_OWNER_PROTECTION`.
- Removing the sole active owner is blocked with `409 CONFLICT: SOLE_OWNER_PROTECTION`.
- When multiple active owners exist, an owner may be demoted or removed, down to the final active owner.
- **Authoritative Database Concurrency Control (`pg_advisory_xact_lock`):**
  - Distributed concurrency safety is enforced in PostgreSQL at the transaction boundary:
    `SELECT pg_advisory_xact_lock(hashtext('merchant_member_' || merchantId))`
  - The transaction-level advisory lock is acquired on the dedicated database transaction context before reading member records.
  - Authoritative membership rows are re-read inside the transaction (`{ transactionManager: em }`), ensuring dirty reads and read-after-read race conditions are impossible across independent backend instances.
  - `validateSoleOwnerConstraint` is evaluated against the fresh transactional state. If the operation would leave zero active owners, the transaction is rolled back, immediately releasing the lock.
  - On commit, rollback, or connection loss, PostgreSQL automatically releases the advisory lock.
  - The in-process Promise queue (`withMerchantLock`) remains in place as an optional local queue for single-process memory optimization and test fallback, while PostgreSQL transaction-level advisory locking remains authoritative for distributed correctness.

### 3.4 Immediate Session Revocation

To eliminate privilege persistence windows:
1. When a team member's status is updated to `suspended`, `MerchantAuthEngine.revokeAllUserSessions(userId)` is executed immediately.
2. When a team member's role is updated, existing sessions are revoked immediately, forcing re-authentication to acquire updated role permissions.
3. When a team member is removed from the organization, all active sessions are revoked immediately.
4. Revocation records the current Unix timestamp in Redis (`user:revoked_at:${userId}`) or memory adapter. Any session issued before this timestamp is rejected upon subsequent request resolution.

### 3.5 API Route Contracts

#### Merchant Team Routes (Scoped to Authenticated Merchant)
- `GET /merchant/team`: Lists all members of the caller's merchant. Requires `team:manage`.
- `POST /merchant/team`: Invites a new team member. Requires `team:manage`. Payload: `{ email: string, role: MerchantRole }`.
- `POST /merchant/team/invite`: Dedicated alias forwarding directly to `POST /merchant/team`.
- `PUT /merchant/team/:id`: Updates member role and/or status. Requires `team:manage`. Payload: `{ role?: MerchantRole, status?: MerchantMemberStatus }`.
- `DELETE /merchant/team/:id`: Removes member from merchant team. Requires `team:manage`.

#### Platform Administration Routes (Super Admin)
- `GET /admin/marketplace/team`: Lists merchant team members platform-wide with query filters (`merchant_id`, `role`, `status`). Requires `admin` boundary.
- `PUT /admin/marketplace/members/:id`: Updates role or status of any merchant member. Requires `admin` boundary. Enforces sole active owner protection.

---

## 4. Verification and Testing Strategy

Phase M2-07 is verified by a dedicated test suite (`apps/backend/src/role-management.test.ts`) covering:
1. **Role-Permission Matrix:** Full matrix verification for Owner, Admin, Manager, and Staff; 403 enforcement on unauthorized endpoints.
2. **Collection & Invitations:** Listing scoped to merchant, successful invitations, invalid email/role rejection, duplicate membership rejection.
3. **Role & Status Updates:** Promotion, demotion, activation, suspension, reactivation, missing fields rejection, non-existent member rejection.
4. **Anti-Escalation:** Prohibiting `super_admin` assignment, prohibiting Admin granting Owner, prohibiting Admin modifying/deleting Owner.
5. **Sole Active Owner Protection:** Blocking demotion, suspension, and deletion of sole owner; permitting when co-owners exist; in-process serialization during single-instance race conditions.
6. **Cross-Tenant Isolation:** Zero data leakage across tenants; blocking cross-tenant update and deletion; blocking forged `merchant_id`.
7. **Session Revocation:** Immediate session nullification upon suspension and deletion across Redis and in-memory storage.
8. **Super Admin Platform Operations:** Cross-merchant querying, query filtering, administrative updates, sole owner constraint enforcement on admins, blocking non-admin callers.
9. **Audit Logging & Secret Redaction:** Structured event recording and verification of zero secret leakage.
10. **PostgreSQL & Redis Integration:** Persistence of members, roles, statuses, and deletions in PostgreSQL, and distributed session revocation in Redis.
11. **Distributed Multi-Instance Concurrency:** Real cross-instance verification using two independent service instances sharing PostgreSQL:
    - Simultaneous demotion of co-owners across instances serializes via `pg_advisory_xact_lock` so exactly 1 active owner remains.
    - Simultaneous suspension of co-owners across instances serializes so exactly 1 active owner remains.
    - Concurrent removal and role change cannot bypass the invariant.
    - Failed transactions automatically release the advisory lock and permit subsequent valid operations.
    - Normal authorized operations execute cleanly across instances.
    - Platform Super Admin mutations strictly obey the distributed invariant.
