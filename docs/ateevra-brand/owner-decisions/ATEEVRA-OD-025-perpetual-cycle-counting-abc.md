# ATEEVRA-OD-025: ABC Perpetual Cycle Counting, Discrepancy Tolerance & Shrinkage Ledgers

**Decision ID:** `ATEEVRA-OD-025`  
**Domain Mapping:** Domain O (Inventory Management, Warehouse Operations & Stock Custody)  
**Functional Cluster:** Cluster 8 (Supply Chain, Warehouse, Treasury & Program Management)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-025-perpetual-cycle-counting-abc.md`  

---

## 1. Background & Context
Luxury apparel inventory is susceptible to shrinkage, misplacement, and pilferage. Shutting down warehouse fulfillment for annual stocktakes causes unacceptable delivery disruptions.

## 2. Problem Statement
What perpetual inventory counting methodology, discrepancy tolerances, and accounting write-down controls should ATEEVRA enforce?

## 3. Decision Alternatives Considered

### Option A: ABC Perpetual Cycle Counting with Strict Tolerance & Dual-Signed Write-offs (RECOMMENDED)
- **Description:** Weekly counts for Class A (Cashmere/Outerwear/Leather, 70% value); bi-weekly for Class B (20% value); monthly for Class C (10% value); 100.0% accuracy target for Class A; discrepancies $> ₹2,500$ trigger mandatory video audit; write-downs $> ₹10,000$ mandate CFO dual-approval.
- **Pros:** 365-day warehouse continuity; immediate detection of inventory leakage; perfect statutory compliance under Ind AS 2.
- **Cons:** Ongoing daily warehouse labor allocation for cycle counts (approx. 45 mins per day).

### Option B: Annual Comprehensive Physical Stocktake (Facility Shutdown)
- **Description:** Halting all outbound fulfillment for 3 full days once a year to count every item.
- **Pros:** Minimal ongoing daily counting overhead.
- **Cons:** Discrepancies go undetected for up to 12 months; complete shutdown of customer order dispatch; massive spike in client complaints.

---

## 4. Recommended Option & Justification
**Option A** is the modern standard for high-value retail. Perpetual cycle counting maintains 99.9%+ inventory accuracy year-round without fulfillment stoppages.

---

## 5. Acceptance Criteria & Owner Ratification Block
- [ ] Automated daily ABC cycle count generator active in Admin Inventory Module.
- [ ] Stock adjustment journal integrated with Ind AS 2 general ledger codes.

```
+-------------------------------------------------------------------------+
|                        OWNER RATIFICATION BLOCK                         |
| Decision Selected: [  ] Option A    [  ] Option B                       |
| Signature: ___________________________  Date: ________________________ |
+-------------------------------------------------------------------------+
```
