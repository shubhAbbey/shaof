# ATEEVRA-OD-023: Purchase Order Milestone Financing & Advance Payment Risk Mitigation

**Decision ID:** `ATEEVRA-OD-023`  
**Domain Mapping:** Domain N (Procurement, Supplier Operations & Inbound Supply Chain)  
**Functional Cluster:** Cluster 8 (Supply Chain, Warehouse, Treasury & Program Management)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-023-po-milestone-financing-terms.md`  

---

## 1. Background & Context
High-end apparel manufacturing requires funding specialized natural yarns, premium silk weaves, and bespoke horn hardware prior to sewing. However, paying 100% upfront exposes the brand to catastrophic non-performance risk, while demanding 100% credit alienates top-tier ateliers.

## 2. Problem Statement
What milestone payment schedules and financial risk controls should govern B2B Purchase Orders (POs) issued to contract manufacturing ateliers?

## 3. Decision Alternatives Considered

### Option A: Three-Tranche Milestone Payment Structure (30% / 40% / 30% Net 30) (RECOMMENDED)
- **Description:** Tranche 1 (30% Advance upon signed PO to fund fabric procurement); Tranche 2 (40% upon passing independent AQL 2.5 ex-factory QC); Tranche 3 (30% final balance Net 30 days post-warehouse GRN, subject to debit notes).
- **Pros:** Optimally balances working capital liquidity with supplier partnership; retains financial leverage until goods pass physical warehouse inspection.
- **Cons:** Requires active milestone tracking in Admin procurement module.

### Option B: 100% Advance Payment at PO Issuance
- **Description:** Paying the entire order value prior to fabric cutting.
- **Pros:** Highest priority slot at manufacturing mills.
- **Cons:** Zero leverage in the event of manufacturing defects, sizing errors, or delivery delays.

### Option C: 100% Post-Delivery Net 60 Days
- **Description:** Refusing any advance and paying 60 days post-receipt.
- **Pros:** Highly favorable to brand working capital.
- **Cons:** Reputable luxury ateliers will refuse to cut fabric under these terms; restricts sourcing to desperate low-grade manufacturers.

---

## 4. Recommended Option & Justification
**Option A** is the global luxury industry standard. It secures priority mill production while protecting corporate capital against defective deliveries.

---

## 5. Acceptance Criteria & Owner Ratification Block
- [ ] Milestone payment scheduler configured in Admin Procurement Module.
- [ ] Automated hold on Tranche 3 if incoming GRN logs AQL non-conformance.

```
+-------------------------------------------------------------------------+
|                        OWNER RATIFICATION BLOCK                         |
| Decision Selected: [  ] Option A    [  ] Option B    [  ] Option C      |
| Signature: ___________________________  Date: ________________________ |
+-------------------------------------------------------------------------+
```
