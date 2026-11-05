# ATEEVRA-OD-026: Landed Cost BOM Accounting, Ind AS 2 Valuation & Markup Multipliers

**Decision ID:** `ATEEVRA-OD-026`  
**Domain Mapping:** Domain P (Financial Modeling, Landed Costs, Cashflow & Capital)  
**Functional Cluster:** Cluster 8 (Supply Chain, Warehouse, Treasury & Program Management)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-026-landed-cost-bom-accounting.md`  

---

## 1. Background & Context
Under Indian Accounting Standard 2 (Ind AS 2), inventory must be valued at the lower of cost or net realizable value (NRV). Cost must encompass all costs of purchase, costs of conversion (CMT), and other costs incurred in bringing inventories to their present location and condition.

## 2. Problem Statement
How should ATEEVRA itemize its Bill of Materials (BOM), calculate Total Landed Cost (TLC), and establish accounting valuation rules for inventory capitalization?

## 3. Decision Alternatives Considered

### Option A: Standard Absorption Costing with Granular BOM Itemization (RECOMMENDED)
- **Description:** Capitalize shell fabric, cupro lining, hardware/trims, atelier CMT labor, inbound freight, lab QC testing, and standard wastage (4%) into the unit balance-sheet cost; establish retail pricing via 4.8x–5.5x multipliers.
- **Pros:** Precise gross margin tracking per SKU; 100% compliance with Ind AS 2 statutory audits; provides exact floor pricing for promotional protection.
- **Cons:** Requires detailed BOM maintenance in procurement ledger.

### Option B: Simplistic Invoice-Only Costing (Ignoring Inbound Freight & QC)
- **Description:** Booking only the atelier purchase invoice as inventory cost, expensing freight and trims immediately.
- **Pros:** Simpler bookkeeping.
- **Cons:** Distorts gross margins; non-compliant with Ind AS 2; leads to premature tax liabilities by under-capitalizing inventory assets.

---

## 4. Recommended Option & Justification
**Option A** is mandatory for rigorous financial governance and statutory tax compliance under Ind AS 2.

---

## 5. Acceptance Criteria & Owner Ratification Block
- [ ] BOM Calculator functional in Admin Module with automated TLC generation.
- [ ] Ind AS 2 valuation export validated by Statutory Auditor.

```
+-------------------------------------------------------------------------+
|                        OWNER RATIFICATION BLOCK                         |
| Decision Selected: [  ] Option A    [  ] Option B                       |
| Signature: ___________________________  Date: ________________________ |
+-------------------------------------------------------------------------+
```
