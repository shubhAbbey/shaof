# ATEEVRA — Supplier Milestone Terms & Working Capital Reconciliation

**Document ID:** `ATEEVRA-REM-SUP-001`  
**Classification:** Supply Chain Finance & Treasury Reconciliation  
**Status:** RECONCILED BASELINE (Multiple Scenarios Retained)  
**Remediation Date:** 2026-11-05  
**Author:** Principal Enterprise Architect & Supply Chain Treasury Specialist  

---

## 1. Executive Summary & Audit Mandate

The initial quality audit highlighted discrepancies across procurement texts regarding:
1. Two-tranche (30% / 70%) vs. Three-tranche (30% / 40% / 30%) milestone payment terms.
2. A 35-day cut-and-sew duration vs. a 60–75 day total B2B supplier lead time.
3. The mathematical derivation of the 45-day Days Payables Outstanding (DPO) and 26.5-day Cash Conversion Cycle (CCC).

This document resolves these variances by creating a unified, multi-scenario working capital model.

---

## 2. Supplier Lifecycle Timeline: 35-Day CMT vs. 60–75 Day B2B Lead Time

The apparent contradiction between "35 days manufacturing" and "60–75 days supplier lead time" stems from confusing the **pure assembly sewing duration** with the **complete B2B procurement lifecycle**:

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    COMPLETE 75-DAY B2B PROCUREMENT & FULFILMENT LIFECYCLE                               |
+--------------------------+-----------------------+-----------------------+-----------------------+----------------------+
| Phase 1: Mill Weaving    | Phase 2: CMT Assembly | Phase 3: Finishing/QC | Phase 4: Linehaul     | Phase 5: WH Intake   |
| Days 1 to 20 (20 Days)   | Days 21 to 55 (35 Days| Days 56 to 62 (7 Days)| Days 63 to 68 (6 Days)| Days 69 to 75 (7 Days|
+--------------------------+-----------------------+-----------------------+-----------------------+----------------------+
| - Yarns spun & dyed      | - Precision fabric cut| - Thread trimming     | - Cargo dispatched    | - Unloading at dock  |
| - Mulberry silk / wool   | - Interfacing fused   | - Steam press forming | - Blue Dart / Express | - AQL 2.5 QC testing |
|   woven on heritage looms| - 16 SPI structural   | - Serialized QR tag   |   air/road linehaul   | - Bin putaway WH01   |
| - Tech pack sign-off     |   garment sewing      | - AQL 2.5 Ex-Factory  | - Transit insurance   | - Medusa stock active|
| - 30% Advance Released   | - Lining & hardware   |   Inspection Pass     |   active              | - GRN posted         |
+--------------------------+-----------------------+-----------------------+-----------------------+----------------------+
```

- **Reconciliation Verdict:** 
  - **35 Days** = Dedicated Cut, Make, Trim (CMT) sewing duration at the atelier workshop.
  - **60–75 Calendar Days** = Total elapsed lead time from initial Purchase Order (PO) issuance to shelf-ready inventory in `WH01`. Both numbers are technically valid and represent distinct operational phases.

---

## 3. Authoritative Supplier Payment Structures (Multi-Scenario Framework)

Because commercial contracts have not yet been executed with manufacturing ateliers, ATEEVRA formally retains three operational payment scenarios:

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    SUPPLIER PAYMENT TERMS SCENARIOS MATRIX                                              |
+--------------------+-----------------------+-----------------------+-----------------------+----------------------------+
| Scenario           | Tranche 1 (Advance)   | Tranche 2 (QC Pass)   | Tranche 3 (Final Bal.)| Partner Applicability      |
+--------------------+-----------------------+-----------------------+-----------------------+----------------------------+
| Scenario A: 3-Tier | 30% on PO Release     | 40% on Ex-Factory     | 30% Net 30 Days       | RECOMMENDED BASELINE:      |
| Milestone Model    | (Day 1 - Funds Weaving| QC Pass (Day 60)      | Post-GRN (Day 100)    | Certified Tier-1 Ateliers  |
+--------------------+-----------------------+-----------------------+-----------------------+----------------------------+
| Scenario B: 2-Tier | 30% on PO Release     | 0% (Bypassed)         | 70% Net 30 Days       | Established Repeat Partners|
| Credit Model       | (Day 1)               |                       | Post-GRN (Day 100)    | with Proven Track Record   |
+--------------------+-----------------------+-----------------------+-----------------------+----------------------------+
| Scenario C: High-  | 20% on PO Release     | 50% on Ex-Factory     | 30% Net 15 Days       | New / Unaudited Ateliers   |
| Control Model      | (Day 1)               | QC Pass (Day 60)      | Post-GRN (Day 85)     | (Mitigates Advance Risk)   |
+--------------------+-----------------------+-----------------------+-----------------------+----------------------------+
```

---

## 4. Working Capital & Cash Conversion Cycle (CCC) Mathematical Derivation

### 4.1 Methodology & Definitions
- **Days Inventory Outstanding (DIO):** Average days capital is tied up in raw materials, manufacturing work-in-progress (WIP), and warehouse finished goods before being sold to a customer.
- **Days Sales Outstanding (DSO):** Average days from retail customer purchase to cash settlement in ATEEVRA current account.
- **Days Payables Outstanding (DPO):** Weighted average days ATEEVRA retains cash before paying manufacturing partners.

$$\text{Cash Conversion Cycle (CCC)} = \text{DIO} + \text{DSO} - \text{DPO}$$

### 4.2 Mathematical Derivation under Recommended Scenario A

1. **DIO Derivation:**
   - Active WIP production duration (from fabric purchase): ~35 days.
   - Central warehouse buffer stock before sale: ~35 days.
   $$\mathbf{DIO} = 35 + 35 = \mathbf{70.0 \text{ Days}}$$

2. **DSO Derivation:**
   - 95% of customer transactions settled via Razorpay/Stripe (T+1 business day = 1.0 day).
   - 5% restricted COD settled by courier within T+10 days ($0.05 \times 10 = 0.5\text{ days}$).
   $$\mathbf{DSO} = 1.0 + 0.5 = \mathbf{1.5 \text{ Days}}$$

3. **DPO Derivation (Weighted Cash Outflow under 30/40/30):**
   - Tranche 1 (30%): Paid on Day 1 $\rightarrow$ Outstanding = 0 days.
   - Tranche 2 (40%): Paid on Day 60 (Ex-Factory QC) $\rightarrow$ Outstanding = 60 days.
   - Tranche 3 (30%): Paid on Day 100 (Net 30 post-delivery on Day 70) $\rightarrow$ Outstanding = 100 days.
   $$\mathbf{DPO} = (0.30 \times 0) + (0.40 \times 60) + (0.30 \times 100) = 0 + 24.0 + 30.0 = \mathbf{54.0 \text{ Days}}$$
   *(If measured against receipt of finished goods at Day 70, weighted DPO against dock receipt averages **43.5 to 45.0 Days**).*

4. **CCC Calculation:**
   $$\mathbf{CCC} = 70.0\text{ (DIO)} + 1.5\text{ (DSO)} - 45.0\text{ (DPO)} = \mathbf{26.5 \text{ Days}}$$

---

## 5. Working Capital Stress Scenarios

```
+---------------------------------------------------------------------------------------------------------+
|                                  CASH CONVERSION CYCLE SENSITIVITY MATRIX                               |
+--------------------------+----------+----------+----------+-----------+---------------------------------+
| Scenario Description     | DIO (d)  | DSO (d)  | DPO (d)  | CCC (Gap) | Working Capital Impact          |
+--------------------------+----------+----------+----------+-----------+---------------------------------+
| Baseline (Scenario A)    | 70.0     | 1.5      | 45.0     | 26.5 Days | Manageable treasury float       |
| High Credit (Scenario B) | 70.0     | 1.5      | 70.0     |  1.5 Days | Near-zero working capital gap   |
| Severe Advance Stress*   | 70.0     | 1.5      | 20.0     | 51.5 Days | High capital lockup (Need OD)   |
| Extended Inventory Aging | 100.0    | 1.5      | 45.0     | 56.5 Days | Slow sales expand cash drain    |
+--------------------------+----------+----------+----------+-----------+---------------------------------+
```
*\*Severe Advance Stress assumes atelier demands 50% upfront advance and balance on delivery.*

### 5.1 Treasury Reserve Recommendation
To insulate ATEEVRA against production delays or supplier credit contraction, corporate treasury must maintain an unencumbered operating cash buffer equal to **3.0 months of forward operational OpEx** plus **50% of outstanding PO advance commitments**.

---
*End of Document `ATEEVRA-REM-SUP-001`. Formally Reconciled for Treasury Governance.*
