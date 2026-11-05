# ATEEVRA-OD-018: Internal Admin Panel Architecture, 6 Corporate Roles & TOTP MFA

**Decision ID:** `ATEEVRA-OD-018`  
**Domain Mapping:** Domain L (Internal Admin Panel, RBAC & Security Governance)  
**Functional Cluster:** Cluster 6 (Technical Architecture, Admin & Storefront Engineering)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-018-internal-admin-rbac-and-mfa.md`  

---

## 1. Background & Context
Public merchant self-onboarding portals are eliminated. Internal corporate operations require strict role-based access control (RBAC) and strong cryptographic authentication to protect business secrets and financial operations.

## 2. Problem Statement
How should ATEEVRA architect its internal administrative portal, define corporate operational roles, and enforce authentication security?

## 3. Decision Alternatives Considered

### Option A: Dedicated Next.js BFF with 6 Granular Corporate Roles & Mandatory TOTP MFA (RECOMMENDED)
- **Description:** Next.js Backend-for-Frontend (BFF) protecting `/admin`; six defined roles (Super Admin, Brand Merchandiser, Supply Chain & Logistics, Finance & Tax, Luxury Concierge, Store Manager); mandatory hardware/app TOTP MFA; 30-minute idle session timeout.
- **Pros:** Enterprise-grade defense; prevents credential hijacking; enforces strict separation of duties between merchandising, finance, and logistics.
- **Cons:** Staff must enroll authenticator apps; minor friction during initial onboarding.

### Option B: Single Shared Administrative Login with Email OTP
- **Description:** One generic "admin" account shared among staff with email OTP codes.
- **Pros:** Simplest setup; zero user management overhead.
- **Cons:** Catastrophic security risk; zero auditability; high risk of insider unauthorized refunds or data theft.

---

## 4. Recommended Option & Justification
**Option A** is strongly recommended. Protecting high-ticket luxury customer records and financial ledgers requires institutional-grade security.

---

## 5. Acceptance Criteria & Owner Ratification Block
- [ ] 6 corporate roles configured in RBAC enforcement middleware.
- [ ] Mandatory TOTP MFA enforced on all `/admin` routes.

```
+-------------------------------------------------------------------------+
|                        OWNER RATIFICATION BLOCK                         |
| Decision Selected: [  ] Option A    [  ] Option B                       |
| Signature: ___________________________  Date: ________________________ |
+-------------------------------------------------------------------------+
```
