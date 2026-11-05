# ATEEVRA-OD-003: Luxury Catalog Architecture, HSN Codes & Legal Metrology

**Decision ID:** `ATEEVRA-OD-003`  
**Domain Mapping:** Domain C (Catalog, HSN Codes & Legal Metrology)  
**Functional Cluster:** Cluster 2 (Merchandising, Catalog & Pricing Integrity)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-003-catalog-and-legal-metrology.md`  

---

## 1. Background & Context
Indian e-commerce regulations under the Legal Metrology (Packaged Commodities) Amendment Rules, 2021 mandate strict statutory declarations on digital Product Detail Pages (PDPs). Non-compliance carries severe fines and site suspension.

## 2. Problem Statement
How should ATEEVRA structure its Medusa product metadata and storefront presentation to ensure 100% legal compliance while preserving a clean, editorial luxury aesthetic?

## 3. Decision Alternatives Considered

### Option A: Integrated Luxury Accordion with Automated Statutory Validation (RECOMMENDED)
- **Description:** Storefront PDP renders statutory declarations (Origin, Manufacturer, MRP, Net Quantity, Dimensions, Care) inside an elegant, expandable "Details & Origin" accordion, backed by schema enforcement in Medusa.
- **Pros:** 100% regulatory compliance; preserves clean luxury layout; automated publish blocking if mandatory fields are missing.
- **Cons:** Requires minor schema additions to Medusa `product.metadata`.

### Option B: Generic Footer Disclaimer Block
- **Description:** Placing general legal metrology text in the website footer or cart summary.
- **Pros:** Minimal engineering changes.
- **Cons:** Direct violation of Rule 6(10) of Legal Metrology Rules (mandating declarations on the exact product display page); high legal risk.

### Option C: Minimalist "Contact Concierge for Specs"
- **Description:** Omitting technical details from PDP to maintain pure visual art, instructing users to message concierge.
- **Pros:** Ultra-minimal visual design.
- **Cons:** Legally non-compliant under Indian consumer protection and weights/measures acts.

---

## 4. Recommended Option & Justification
**Option A** is recommended. It guarantees full statutory immunity under Indian law while providing the sophisticated transparency that luxury clients appreciate regarding fabric origin and ethical manufacturing.

---

## 5. Acceptance Criteria & Owner Ratification Block
- [ ] Medusa Product Module enforces mandatory Legal Metrology fields prior to `is_active=true`.
- [ ] Next.js Storefront renders expandable accordion with all statutory parameters.

```
+-------------------------------------------------------------------------+
|                        OWNER RATIFICATION BLOCK                         |
| Decision Selected: [  ] Option A    [  ] Option B    [  ] Option C      |
| Signature: ___________________________  Date: ________________________ |
+-------------------------------------------------------------------------+
```
