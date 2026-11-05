# ATEEVRA-OD-017: Decoupling Marketplace Multi-Vendor Links & Commercial Mode Gate

**Decision ID:** `ATEEVRA-OD-017`  
**Domain Mapping:** Domain K (Headless Architecture, CMS & Commerce Engine)  
**Functional Cluster:** Cluster 6 (Technical Architecture, Admin & Storefront Engineering)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-017-decoupling-marketplace-primitives.md`  

---

## 1. Background & Context
The Medusa backend includes multi-vendor link modules (`merchant-product`, `merchant-order-item`, `merchant-stock-location`) developed during earlier marketplace iterations. We must ensure these primitives do not pollute first-party operations while leaving historical database schemas intact.

## 2. Problem Statement
How should the engineering team bypass multi-vendor link dependencies in runtime queries without breaking database integrity or altering existing migrations?

## 3. Decision Alternatives Considered

### Option A: Runtime Feature Gate (`COMMERCE_MODE=FIRST_PARTY_BRAND`) & Synthetic Tenant (RECOMMENDED)
- **Description:** Introduce an environment toggle `COMMERCE_MODE=FIRST_PARTY_BRAND`; Medusa query layer maps all catalog items to internal entity `ATEEVRA_CORP`; bypasses merchant join queries; preserves all existing database tables and migrations untouched.
- **Pros:** Zero risk of database schema corruption; 100% reversible; leaves historical marketplace documentation (`docs/mvp2/m2-14/`) valid; rapid deployment.
- **Cons:** Codebase retains dormant marketplace link definitions.

### Option B: Destructive Database Migration (Drop Merchant Tables)
- **Description:** Deleting all merchant tables, foreign keys, and link modules from PostgreSQL.
- **Pros:** Completely purges unused database schemas.
- **Cons:** Violates non-negotiable governance constraints; destroys database rollback capability; permanently corrupts historical marketplace documentation traceability.

### Option C: Codebase Forking (Separate Brand Repository)
- **Description:** Forking into an entirely separate Git repository for the first-party brand.
- **Pros:** Complete isolation of brand code.
- **Cons:** Duplicates CI/CD maintenance and breaks cross-package monorepo sharing.

### Option D: Architecture Freeze & Deferral to Phase 1 (RECOMMENDED FOR PHASE 0.5)
- **Description:** Maintain complete freeze on baseline commit `676609f` during Phase 0.5; make zero code, schema, or configuration modifications; defer all runtime feature-gate implementation to Phase 1 after commercial and tax decisions are formally approved.
- **Pros:** Zero regression risk during deliberation; perfectly compliant with implementation stop condition; avoids premature technical refactoring.
- **Cons:** Technical prototype execution deferred until Phase 1.

---

## 4. Recommended Option & Justification
**Option A (for Phase 1 Implementation)** combined with **Option D (for Phase 0.5 Deliberation)** is the sanctioned path. It satisfies all master governance constraints, prevents code corruption, and cleanly isolates the first-party brand runtime without premature code changes.

---

## 5. Acceptance Criteria & Owner Ratification Block
- [ ] Runtime flag `COMMERCE_MODE=FIRST_PARTY_BRAND` implemented (in Phase 1).
- [ ] Automated regression tests pass confirming zero query execution against merchant links in brand mode.
- [ ] Zero database schema alterations or migrations executed.

```
+---------------------------------------------------------------------------------------+
|                               OWNER RATIFICATION BLOCK                                |
| Decision Selected: [  ] Option A    [  ] Option B    [  ] Option C    [  ] Option D   |
| Signature: ___________________________  Date: ______________________________________ |
+---------------------------------------------------------------------------------------+
```
