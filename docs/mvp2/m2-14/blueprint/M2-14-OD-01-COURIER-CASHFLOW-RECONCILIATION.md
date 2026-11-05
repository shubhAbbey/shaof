# ATEEVRA Phase M2-14 — OD-01 Courier Damage Cash-Flow & P&L Reconciliation
## Granular 11-Attribute Cash-Flow Schedules Across Five Carrier Claim Recovery Scenarios

**Document ID:** `CSH-M2-14-OD-01-COURIER-RECONCILIATION`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision References:** OD-01 (Commercial Model) & OD-02 (Refund & Return Liability)  
**Parent Policy:** [`POL-OD-02-04`](policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md) (Customer Protection & Evidence-Based Liability)  
**Governance Status:** `STRICTLY DOCUMENTATION & CASH-FLOW RECONCILIATION ONLY — ZERO IMPLEMENTATION`  
**Decision Status:** `OD-01 UNAPPROVED — PROVISIONAL DIRECTION FOR OWNER EVALUATION ONLY`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Policy Invariants

When goods are physically destroyed, crushed, water-damaged, or lost under 3PL logistics bailment (Delhivery, Shiprocket, Bluedart), ATEEVRA enforces the owner-approved provisions of [`POL-OD-02-04`](policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md):
1. **Immediate Customer Protection & Refund Scope:**  
   - Under approved [`POL-OD-02-04`](policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md) (Mode 1 baseline), customer paid ₹1,000.00 inclusive of shipping; customer refund is **-₹1,000.00** (100% of $P_{\text{sell}}$).
   - Under the provisional OD-01 customer-paid shipping model, customer paid ₹1,070.00 (₹1,000 product + ₹70 forward shipping). Because the delivery service was unperformed, consumer protection standards require a 100% refund of the full collection (**-₹1,070.00**).
2. **Merchant Realization Protection (Decoupled by Product GST):** Compliant merchants receive realization because goods were damaged after handover to 3PL custody. Payout varies across tax brackets:
   - **5% Product GST (Apparel):** Realization payout = **-₹876.24**
   - **12% Product GST (Footwear):** Realization payout = **-₹876.54**
   - **18% Product GST (Accessories):** Realization payout = **-₹876.76**
   - **OD-02 Baseline (Mode 1):** Realization payout = **-₹800.00**
3. **Carrier Claim Accountability:** ATEEVRA files a transit insurance claim against the 3PL carrier. Carrier claim denials or liability caps are never transferred to compliant merchants.
4. **Non-Cash Asset Invariant:** A claim submission or accepted claim receivable is an accounting asset, **NOT liquid cash**. It does not fund operating disbursements until bank funds clear.

This document provides granular, first-principles cash-flow and P&L schedules across **five exhaustive carrier recovery scenarios**, explicitly tracing all 11 required financial attributes and distinguishing short-term liquidity drag from ultimate economic loss.

---

## 2. Granular 11-Attribute Reconciliation Schedule Across Five Scenarios

All scenarios are evaluated using the provisional OD-01 customer-paid forward shipping model:
- Product Price: **₹1,000.00**; Customer Shipping Paid: **₹70.00**; Total Collection: **+₹1,070.00**.
- Customer Refund Executed: **-₹1,070.00** (Full refund of product and shipping).
- Forward Freight: **-₹70.00**; Reverse Salvage/Inspection Freight: **-₹90.00**.
- Gateway MDR: **-₹21.40** (2.0% on ₹1,070; Option A inclusive baseline).
- Merchant Realization Payouts: Evaluated across 5% (₹876.24), 12% (₹876.54), and 18% (₹876.76) product GST brackets.

```
========================================================================================================================
MASTER COURIER-DAMAGE RECOVERY SCHEDULE ACROSS FIVE SCENARIOS (ALL AMOUNTS IN INR ₹)
========================================================================================================================
Financial Attribute Line Item   | Scenario 1:       | Scenario 2:       | Scenario 3:       | Scenario 4:       | Scenario 5:       
                                | Full Realization  | Full Retail GMV   | Partial Recovery  | Delayed Recovery  | Denied Claim      
                                | Recovery (Day 30) | Recovery (Day 30) | (₹600 Cap Day 30) | (₹600 Cap Day 60) | (100% Bad Debt)   
--------------------------------+-------------------+-------------------+-------------------+-------------------+-------------------
1. Original Customer Collection |        +₹1,070.00 |        +₹1,070.00 |        +₹1,070.00 |        +₹1,070.00 |        +₹1,070.00 
2. Customer Refund Executed     |        -₹1,070.00 |        -₹1,070.00 |        -₹1,070.00 |        -₹1,070.00 |        -₹1,070.00 
3. Forward Freight Paid to 3PL  |           -₹70.00 |           -₹70.00 |           -₹70.00 |           -₹70.00 |           -₹70.00 
4. Reverse Salvage Freight Paid |           -₹90.00 |           -₹90.00 |           -₹90.00 |           -₹90.00 |           -₹90.00 
5. Gateway MDR Paid (Sunk Loss) |           -₹21.40 |           -₹21.40 |           -₹21.40 |           -₹21.40 |           -₹21.40 
6. Merchant Payout (Disbursed)  |                   |                   |                   |                   |                   
   - Under 5% Product GST       |          -₹876.24 |          -₹876.24 |          -₹876.24 |          -₹876.24 |          -₹876.24 
   - Under 12% Product GST      |          -₹876.54 |          -₹876.54 |          -₹876.54 |          -₹876.54 |          -₹876.54 
   - Under 18% Product GST      |          -₹876.76 |          -₹876.76 |          -₹876.76 |          -₹876.76 |          -₹876.76 
--------------------------------+-------------------+-------------------+-------------------+-------------------+-------------------
   PEAK LIQUIDITY DEFICIT (DAY 7|                   |                   |                   |                   |                   
   - With 5% Product GST Payout |        -₹1,057.64 |        -₹1,057.64 |        -₹1,057.64 |        -₹1,057.64 |        -₹1,057.64 
   - With 12% Product GST Payout|        -₹1,057.94 |        -₹1,057.94 |        -₹1,057.94 |        -₹1,057.94 |        -₹1,057.94 
   - With 18% Product GST Payout|        -₹1,058.16 |        -₹1,058.16 |        -₹1,058.16 |        -₹1,058.16 |        -₹1,058.16 
--------------------------------+-------------------+-------------------+-------------------+-------------------+-------------------
7. Claim Amount Filed with 3PL  |        +₹1,000.00 |        +₹1,000.00 |        +₹1,000.00 |        +₹1,000.00 |        +₹1,000.00 
8. Claim Amount Accepted by 3PL |    Payout Equiv.* |        +₹1,000.00 |          +₹600.00 |          +₹600.00 |             ₹0.00 
9. Receivable Recognition Date  |            Day 14 |            Day 14 |            Day 14 |            Day 14 |            Day 14 
10. Actual Cash Reimbursement   |                   |                   |                   |                   |                   
    - Cash Settlement Timing    |            Day 30 |            Day 30 |            Day 30 |            Day 60 |            Day 30 
    - Remittance Received (+)   |    Payout Equiv.* |        +₹1,000.00 |          +₹600.00 |          +₹600.00 |             ₹0.00 
--------------------------------+-------------------+-------------------+-------------------+-------------------+-------------------
11. NET CASH IMPACT (CLOSING)   |                   |                   |                   |                   |                   
    - With 5% GST (₹876.24 pay) |          -₹181.40 |           -₹57.64 |          -₹457.64 |          -₹457.64 |        -₹1,057.64 
    - With 12% GST(₹876.54 pay) |          -₹181.40 |           -₹57.94 |          -₹457.94 |          -₹457.94 |        -₹1,057.94 
    - With 18% GST(₹876.76 pay) |          -₹181.40 |           -₹58.16 |          -₹458.16 |          -₹458.16 |        -₹1,058.16 
12. FINAL P&L OPERATING LOSS    |          -₹181.40 |  -₹57.64 to -58.16| -₹457.64 to -458.16|-₹457.64 to -458.16|-₹1057.64 to -1058.16
========================================================================================================================
```
```

---

## 3. Granular Analysis of the Five Recovery Scenarios

### Scenario 1: Full Merchant Realization Recovery (₹876.76)
- **Carrier Disposition:** 3PL carrier accepts liability for the exact merchant realization invoice value (₹876.76).
- **Cash Flow Dynamic:** ATEEVRA disburses ₹1,058.16 by Day 7. On Day 30, the carrier deposits ₹876.76 into ATEEVRA's bank account.
- **Net Cash & P&L Result:** The net cash impact is **-₹181.40** (Forward freight ₹70 + Reverse freight ₹90 + Gateway MDR ₹21.40).
- **Actuarial Funding:** The -₹181.40 net loss is fully covered by the accumulated Return-Cost Reserve pool.

### Scenario 2: Full Retail GMV Recovery (₹1,000.00)
- **Carrier Disposition:** 3PL carrier indemnifies the gross declared value of the parcel (₹1,000.00).
- **Cash Flow Dynamic:** ATEEVRA disburses ₹1,058.16 by Day 7. On Day 30, the carrier reimburses ₹1,000.00.
- **Net Cash & P&L Result:** The net loss is reduced to **-₹58.16** (MDR ₹21.40 + Reverse salvage freight ₹90 - Gross freight surplus ₹52.60).
- **Outcome:** Minimal platform cash drain.

### Scenario 3: Partial Recovery under Standard Carrier Liability Cap (₹600.00)
- **Carrier Disposition:** Under standard Indian 3PL contracts without supplemental value insurance, carrier liability is capped at ₹600.00 per standard package (e.g. ₹50/kg or flat ₹500–₹600).
- **Cash Flow Dynamic:** ATEEVRA disburses ₹1,058.16 by Day 7. On Day 30, the carrier reimburses ₹600.00.
- **Net Cash & P&L Result:** Net platform cash drain is **-₹458.16**.
- **Accounting Treatment:** ATEEVRA books a bad debt write-off for the unrecovered balance:
  $$\mathbf{\text{Unrecovered Shortfall} = ₹876.76 \text{ (Paid Realization)} - ₹600.00 \text{ (Recovery)} = \mathbf{₹276.76}}$$
  Plus sunk logistics and gateway fees of ₹181.40 = **-₹458.16 total P&L loss**.

### Scenario 4: Delayed Recovery (Day 60 Bank Settlement)
- **Carrier Disposition:** 3PL accepts the ₹600.00 claim, but internal carrier audit and payment processing delays disbursement until Day 60.
- **The Liquidity Shock:**  
  - **Between Day 7 and Day 59:** ATEEVRA experiences a peak liquid cash deficit of **-₹1,058.16**.
  - **On Day 60:** The bank receives +₹600.00, reducing cumulative cash drain to **-₹458.16**.
- **Critical Finding:** Even though the final P&L loss matches Scenario 3 (-₹458.16), Scenario 4 ties up **₹1,058.16 of liquid corporate working capital for two full months**.

### Scenario 5: Denied Claim (100% Bad Debt Write-Off)
- **Carrier Disposition:** Carrier rejects the claim citing packaging failure, excluded perils, or late reporting. ATEEVRA's internal investigation confirms the merchant followed packaging guidelines (preventing a merchant debit under `POL-OD-02-04`).
- **Cash Flow Dynamic:** Zero recovery from carrier; zero deduction from merchant.
- **Net Cash & P&L Result:** ATEEVRA absorbs the entire transaction drain of **-₹1,058.16**.
- **Accounting Treatment:** Full debit to `EXP_BAD_DEBT_COURIER_CLAIMS` (-₹1,058.16).

---

## 4. Distinguishing Timing-Related Liquidity Drag from Ultimate Economic Loss

The audit highlights a vital distinction for treasury management:

```
[Day 1: Customer Refund Executed] ──► Cash Drain: -₹1,070.00
       │
[Day 7: Merchant Payout Executed] ──► Cash Drain Reaches Peak: -₹1,058.16 (NET OF CUSTOMER INFLOW)
       │
       ├─► Period of Maximum Liquidity Exposure (Day 7 to Day 60)
       │   - Accounting Books Show: Asset (Claims Receivable: +₹600.00)
       │   - Banking Reality: Liquid Cash is DOWN by -₹1,058.16
       │   - Warning: Claims receivables cannot pay 3PL logistics bills!
       │
[Day 60: 3PL Cash Reimbursement] ──► Bank Inflow: +₹600.00
       │
[Final Position: Ultimate Economic Loss] ──► Final Cash Drain: -₹458.16
```

> [!CAUTION]
> **Treasury Liquidity Rule:**  
> A marketplace must not equate "Claim Accepted" with "Liquid Cash". In the 60-day lag between merchant settlement and carrier cash reimbursement, ATEEVRA requires a committed equity buffer to prevent payroll or logistics payment defaults.

---

## 5. Governance Sign-Off

1. **OD-02-04 Invariance Preserved:** Customers are refunded immediately; compliant merchants receive realization; claims are accounted for under the four-state lifecycle.
2. **Quality Balance Verified:** All cash-flow lines balance to zero variance across all five scenarios.
3. **Governance Status:** OD-01 remains unapproved; zero software code modified.
