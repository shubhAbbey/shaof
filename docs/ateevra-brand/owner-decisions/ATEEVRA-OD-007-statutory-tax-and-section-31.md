# ATEEVRA-OD-007: Statutory Tax Compliance, Section 31 Invoicing & ITC Optimization

**Decision ID:** `ATEEVRA-OD-007`  
**Domain Mapping:** Domain E (Payments, Gateway MDR & Tax Invoicing)  
**Functional Cluster:** Cluster 1 (Commercial Model & Corporate Tax Architecture)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-007-statutory-tax-and-section-31.md`  

---

## 1. Background & Context
Under Indian tax jurisprudence, marketplace facilitators must collect Tax Collected at Source (TCS) under Section 52 of the CGST Act and withhold TDS under Section 194-O. In a first-party brand model, ATEEVRA is the direct manufacturer/seller of goods.

## 2. Problem Statement
How should ATEEVRA structure its digital tax invoicing and input tax credit (ITC) mechanics in full alignment with the CGST Act, 2017?

## 3. Decision Alternatives Considered

### Option A: Direct Section 31 B2C/B2B Tax Invoicing & Full ITC Offset (RECOMMENDED)
- **Description:** ATEEVRA issues direct tax invoices under Section 31 of the CGST Act using its corporate GSTIN; completely deactivates Section 52 TCS and Section 194-O TDS logic; offsets output GST against input GST paid on manufacturing, rigid boxes, courier air freight, and cloud hosting.
- **Pros:** 100% legal compliance; eliminates marketplace intermediary tax liabilities; saves significant working capital through comprehensive ITC recovery.
- **Cons:** Requires rigorous monthly GSTR-1, GSTR-2B, and GSTR-3B reconciliations.

### Option B: Retain Marketplace Section 52 TCS Machinery
- **Description:** Attempting to run first-party sales through existing marketplace commission and TCS modules.
- **Pros:** Zero code modifications to existing marketplace backend link services.
- **Cons:** Legally erroneous under GST law (a company cannot collect TCS from itself); triggers immediate tax audit scrutiny and penalties.

---

## 4. Recommended Option & Justification
**Option A** is legally mandatory and commercially optimal. Direct Section 31 invoicing reflects the true economic reality of a first-party fashion brand and enables full statutory ITC utilization.

---

## 5. Acceptance Criteria & Owner Ratification Block
- [ ] Section 31 automated PDF tax invoice generator active.
- [ ] Section 52 TCS and Section 194-O routines completely bypassed in first-party mode.

```
+-------------------------------------------------------------------------+
|                        OWNER RATIFICATION BLOCK                         |
| Decision Selected: [  ] Option A    [  ] Option B                       |
| Signature: ___________________________  Date: ________________________ |
+-------------------------------------------------------------------------+
```
