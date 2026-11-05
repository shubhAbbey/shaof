# ATEEVRA-OD-001: Direct First-Party Luxury Brand Commercial Model & Seller of Record

**Decision ID:** `ATEEVRA-OD-001`  
**Domain Mapping:** Domain A (Commercial Model & Seller of Record)  
**Functional Cluster:** Cluster 1 (Commercial Model & Corporate Tax Architecture)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-001-direct-first-party-commercial-model.md`  

---

## 1. Background & Context
The ATEEVRA monorepo originally housed a multi-vendor marketplace framework with independent merchant onboarding, commission withholdings, and distributed merchant fulfillment. The Project Owner has directed the establishment of ATEEVRA as a direct-to-consumer (D2C) first-party luxury fashion brand.

## 2. Problem Statement
How should ATEEVRA legally, commercially, and architecturally position itself regarding sales transactions: as a multi-vendor platform facilitator, an agency/consignment intermediary, or the sole first-party Seller of Record (SOR)?

## 3. Decision Alternatives Considered

### Option A: Pure First-Party D2C Luxury Brand (RECOMMENDED)
- **Description:** ATEEVRA is the sole legal Seller of Record (SOR), owns 100% of finished goods inventory, issues direct customer tax invoices under Section 31 CGST Act, and captures 100% of top-line GMV as revenue.
- **Pros:** Total brand equity protection; complete control over pricing, quality, and packaging; zero multi-vendor regulatory friction; higher enterprise valuation.
- **Cons:** Working capital required to pre-fund inventory; bears full inventory obsolescence risk.
- **Financial Impact:** 100% GMV top-line recognition; target 70%+ gross margins; EBITDA margins 22%–30%.
- **Operational Feasibility:** High; central warehouse and 3PL express air integration.

### Option B: Consignment / Agency Concession Model
- **Description:** Third-party luxury ateliers own inventory until point of sale; ATEEVRA takes physical custody on consignment and earns 25%–35% agency commission.
- **Pros:** Lower working capital requirement; atelier bears obsolescence risk.
- **Cons:** Complex consignment accounting; GST liability complexities under Indian law; lack of priority production from top mills.
- **Financial Impact:** Net revenue recognition only (commission); lower top-line GMV capitalization.

### Option C: Managed Luxury Marketplace (Curated Multi-Vendor)
- **Description:** Ateliers sell directly to customers via ATEEVRA storefront; ATEEVRA controls storefront UI but orders are fulfilled and invoiced by ateliers.
- **Pros:** Zero inventory risk; zero working capital requirement.
- **Cons:** Inconsistent packaging and unboxing; multi-vendor split cart headaches; customer confusion; loss of luxury brand prestige; subject to Section 52 TCS marketplace regulations.

---

## 4. Recommended Option & Justification
**Option A (Pure First-Party D2C Luxury Brand)** is strongly recommended. True luxury fashion houses (Chanel, Hermès, Loro Piana, Brunello Cucinelli) never operate as open or curated marketplaces. Brand equity, price stability, white-glove unboxing, and rapid concierge customer care require undivided legal and commercial ownership.

---

## 5. Multi-Dimensional Impact Analysis
- **Financial Impact:** 100% top-line GMV revenue recognition. Inventory held on balance sheet under Ind AS 2.
- **Statutory & Legal Compliance:** Direct B2C/B2B invoicing under Section 31 CGST Act; full exemption from Section 52 TCS.
- **Operational Impact:** Central logistics facility `WH01` established with AQL 2.5 incoming QC.
- **Technical Architecture:** Medusa v2.19 operates in single-tenant brand mode; multi-vendor links bypassed.
- **Customer Experience:** Seamless single-shipment delivery, uniform packaging, and dedicated concierge support.

---

## 6. Acceptance Criteria & Owner Ratification Block
- [ ] Medusa order pipeline executes without merchant links.
- [ ] Section 31 tax invoice generated with ATEEVRA GSTIN as sole seller.
- [ ] Single consolidated cart and payment settlement.

```
+-------------------------------------------------------------------------+
|                        OWNER RATIFICATION BLOCK                         |
|                                                                         |
| Decision Selected: [  ] Option A    [  ] Option B    [  ] Option C      |
| Owner Directive Notes: ________________________________________________ |
| Signature: ___________________________  Date: ________________________ |
+-------------------------------------------------------------------------+
```
