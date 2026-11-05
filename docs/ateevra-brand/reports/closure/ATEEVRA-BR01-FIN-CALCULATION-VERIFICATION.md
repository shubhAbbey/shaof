# ATEEVRA BR-01 — Financial Calculation Verification & Mixed-Cart Audit

**Document ID:** `ATEEVRA-BR01-FIN-001`  
**Classification:** Financial Verification & Independent Mathematical Audit  
**Status:** AUDITED & RECONCILED (Awaiting CA Validation)  
**Audit Date:** 2026-11-05  
**Auditor:** Principal Enterprise Architect, Financial Modeler & Policy Governance Specialist  

---

## 1. Executive Summary & Audit Mandate

In accordance with Section 1 of the BR-01 Verification Instructions, this document provides:
1. An independent recalculation of the ₹15,000 GMV order under a **realistic mixed-SKU multi-rate GST basket** (Chapter 62 apparel at 12% + Chapter 42 leather at 18%), eliminating the flawed assumption of a uniform 12% rate across all items.
2. Formal classification of all HSN-level Input Tax Credit (ITC) rates as **`MODEL ASSUMPTIONS`** due to the absence of signed supplier invoices.
3. Step-by-step mathematical proof and dual-basis sensitivity analysis of the **₹7,800 Tailored Blazer Promotional Floor Price**, evaluating both the industry-standard Gross Transaction Value basis and the GST-exclusive Net Revenue basis.
4. Proof of zero double-counting across packaging, shipping, return reserves, CAC, and gateway fees.

---

## 2. Mixed-SKU Multi-Rate GST Order Recalculation (₹15,000 GMV Basket)

In real-world luxury retail, a customer cart frequently combines woven garments with fine leather goods. 

### 2.1 Representative Mixed-Order Basket Specification
- **Item A: Tailored Wool Trousers** (Chapter 62 — Woven Apparel): Maximum Retail Price (MRP) = **₹9,900.00** (Inclusive of 12.0% GST).
- **Item B: Full-Grain Leather Cardholder & Belt** (Chapter 42 — Leather Articles): Maximum Retail Price (MRP) = **₹5,100.00** (Inclusive of 18.0% GST).
- **Total Customer Invoice Value (GMV):** **₹15,000.00**

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    MIXED-SKU MULTI-RATE GST CALCULATION TABLE                                           |
+--------------------+----------------+---------------+------------+-----------+-------------------+----------------------+
| Line Item          | SKU Title      | Gross MRP (₹) | HSN Chapter| GST Rate  | Tax Base (Net ₹)  | Output GST Amount (₹)|
+--------------------+----------------+---------------+------------+-----------+-------------------+----------------------+
| Item A (Apparel)   | Wool Trousers  | ₹9,900.00     | Chapter 62 | 12.0%     | ₹8,839.2857       | ₹1,060.7143          |
| Item B (Leather)   | Leather Belt   | ₹5,100.00     | Chapter 42 | 18.0%     | ₹4,322.0339       | ₹777.9661            |
+--------------------+----------------+---------------+------------+-----------+-------------------+----------------------+
| CONSOLIDATED TOTAL | Mixed Basket   | ₹15,000.00    | Blended    | 13.97%*   | ₹13,161.3196      | ₹1,838.6804          |
| (Rounded Reality)  |                | ₹15,000.00    |            |           | ₹13,161.32        | ₹1,838.68            |
+--------------------+----------------+---------------+------------+-----------+-------------------+----------------------+
```
*\*Effective blended GST rate against net taxable base: $\frac{₹1,838.68}{₹13,161.32} = 13.9703\%$.*

### 2.2 Comparison: 100% Apparel Model vs. Mixed-Cart Reality
- **Pure Apparel Assumption (Flat 12%):**
  - Net Revenue Recognized = **₹13,392.86**
  - Output GST Collected = **₹1,607.14**
- **Mixed-Cart Reality (12% Apparel + 18% Leather):**
  - Net Revenue Recognized = **₹13,161.32** (-₹231.54 variance)
  - Output GST Collected = **₹1,838.68** (+₹231.54 variance)
- **Reconciliation Finding:** The flat 12% model in earlier documents was an **illustrative model assumption**. Medusa's checkout and tax engines must compute taxes at the individual line-item variant level using the exact statutory HSN code.

---

## 3. Input Tax Credit (ITC) Evidentiary Reality Check

### 3.1 Verification of Supplier Invoices
- **Repository Inspection:** A complete search of `apps/backend/` and `infrastructure/` confirms **zero physical B2B supplier invoices or purchase orders exist in the repository**.
- **Classification Directive:** In strict compliance with the audit instructions:
  $$\mathbf{HSN\ Input\ Tax\ Credit\ (ITC)\ Figures\ are\ CLASSIFIED\ AS:\ MODEL\ ASSUMPTIONS}$$
  $$\mathbf{Status:\ PROFESSIONAL\ VALIDATION\ REQUIRED\ (NOT\ VERIFIED\ ITC)}$$
- **Assumed Rate Baseline for Economic Modeling:**
  - Raw silk/wool fabrics (HSN 5007 / 5111): Assumed at 5.0% GST ($₹2,100 \times 0.05 = ₹105.00$).
  - Apparel CMT job work (HSN 9988): Assumed at 5.0% GST ($₹1,350 \times 0.05 = ₹67.50$).
  - Trims and hardware (HSN 9606): Assumed at 18.0% GST ($₹270 \times 0.18 = ₹48.60$).
  - Inbound transport GTA (HSN 9965): Assumed at 5.0% GST ($₹110 \times 0.05 = ₹5.50$).
  - Technical lab testing (HSN 9983): Assumed at 18.0% GST ($₹70 \times 0.18 = ₹12.60$).
  - *Model Total Assumed ITC on COGS:* **₹239.20** (Requires formal sign-off from Statutory Auditor).

---

## 4. Payment Gateway MDR Disaggregation & Reconciliation

To ensure zero double-counting across the cash ledger and P&L statement for a ₹15,000 transaction:

$$\text{Gross Customer Payment} = \mathbf{₹15,000.00}$$
$$\text{Base Gateway MDR (2.0\% on Gross GMV)} = 0.02 \times ₹15,000.00 = \mathbf{₹300.00}$$
$$\text{Statutory GST on Banking Service (18\% on ₹300)} = 0.18 \times ₹300.00 = \mathbf{₹54.00}$$
$$\text{Total Bank Settlement Cash Deduction} = ₹300.00 + ₹54.00 = \mathbf{₹354.00 \text{ (2.36\% of GMV)}}$$
$$\text{Net Cash Settled to Corporate Current Account} = ₹15,000.00 - ₹354.00 = \mathbf{₹14,646.00 \text{ (T+1 Days)}}$$

```
+---------------------------------------------------------------------------------------------------------+
|                                    GATEWAY ACCOUNTING LEDGER ENTRIES                                    |
+------------------------------------+------------------+-------------------------------------------------+
| Accounting Ledger / Financial Book | Amount (INR)     | Economic Nature & Treatment                     |
+------------------------------------+------------------+-------------------------------------------------+
| Debit: Bank Account (Current Asset)| ₹14,646.00       | Actual cash liquidity deposited into bank.      |
| Debit: Gateway MDR (P&L OpEx)      | ₹300.00          | Pure P&L operating expense (Operating EBITDA).  |
| Debit: GST Input Credit (GSTR-2B)  | ₹54.00           | Balance sheet tax asset; offsets output GST.   |
| Credit: Gross Accounts Receivable  | ₹15,000.00       | Clears customer order balance.                  |
+------------------------------------+------------------+-------------------------------------------------+
```
- **Proof of No Double-Counting:** The P&L operating expense captures **₹300.00**, while the **₹54.00** tax asset directly reduces cash GST remittance to the government. At no point is ₹354.00 expensed in the P&L alongside an unadjusted GST remittance.

---

## 5. Profitability Metric Stratification (Gross Margin vs. CM1 vs. CM2 vs. EBITDA)

```
[ Gross Customer Payment (GMV / MRP): ₹15,000.00 ]
                       │
             Less: Output GST (12% Apparel): -₹1,607.14
                       ▼
       [ Net Recognized Revenue: ₹13,392.86 (100.0% Net) ]
                       │
             Less: Landed COGS (Fabric, CMT, Trims, Inbound): -₹3,900.00
                       ▼
    =======================================================
    1. GROSS PROFIT (GROSS MARGIN): ₹9,492.86 (70.88% of Net)
    =======================================================
                       │
             Less: Direct Outbound Express Air Courier: -₹165.00
             Less: Rigid Luxury Packaging & Presentation: -₹220.00
             Less: Return & Simultaneous Swap Reserve: -₹150.00
                       ▼
    =======================================================
    2. CONTRIBUTION MARGIN 1 (CM1): ₹8,957.86 (66.89% of Net)
    =======================================================
                       │
             Less: Direct Payment Gateway Fee (2% MDR): -₹300.00
             Less: Performance Marketing CAC Allocation (18% GMV): -₹2,700.00
             Less: Luxury Concierge & CX Allocation (3% GMV): -₹450.00
                       ▼
    =======================================================
    3. CONTRIBUTION MARGIN 2 (CM2): ₹5,507.86 (41.13% of Net)*
    =======================================================
                       │
             Less: Allocated Fixed Corporate Overheads (HQ/G&A/Cloud): -₹920.00
                       ▼
    =======================================================
    4. OPERATING EBITDA: ₹4,587.86 (34.26% of Net / 30.59% GMV)
    =======================================================
```
*\*Reflects reconciled ₹300.00 net P&L gateway charge rather than ₹354.00 gross cash deduction.*

---

## 6. Mathematical Proof & Sensitivity Analysis of ₹7,800 Tailored Blazer Floor Price

The promotional floor price represents the minimum Maximum Retail Price (MRP) at which an authorized promotional code can be redeemed without resulting in negative cash contribution.

### 6.1 Included vs. Excluded Cost Schedule

```
+---------------------------------------------------------------------------------------------------------+
|                              TAILORED BLAZER FLOOR INCLUSION/EXCLUSION AUDIT                            |
+------------------------------------+------------------+-------------------------------------------------+
| Cost Element                       | Amount (INR)     | Inclusion Status & Rationale                    |
+------------------------------------+------------------+-------------------------------------------------+
| Total Landed Cost (TLC)            | ₹4,050.00        | INCLUDED: Shell fabric, cupro, CMT labor, trims.|
| Rigid Luxury Box & Monogram Tissue | ₹220.00          | INCLUDED: Mandatory physical unboxing standard. |
| Outbound Priority Air Freight      | ₹165.00          | INCLUDED: Contracted carrier courier cost.      |
| Return Reserve & Triage Provision  | ₹150.00          | INCLUDED: 12% probability of return freight.   |
| Promotional Customer CAC           | ₹1,800.00        | INCLUDED: Target acquisition cost on discount.  |
| Concierge Support Allocation       | ₹250.00          | INCLUDED: Human WhatsApp advisor servicing.     |
| Payment Gateway MDR                | 2.0% (Fee Basis) | INCLUDED: Evaluated on Gross vs Net basis below.|
| Statutory Output GST               | 12.0% on Base    | INCLUDED: Mandatory tax collected for GOI.      |
| Fixed HQ Corporate Rent / Legal    | EXCLUDED         | EXCLUDED: Period fixed overheads.               |
| Creative Editorial Photo Shoots    | EXCLUDED         | EXCLUDED: Sunk marketing brand investments.     |
+------------------------------------+------------------+-------------------------------------------------+
```

- **Total Direct Net Variable Cost ($C_v$):**
  $$C_v = ₹4,050.00 + ₹220.00 + ₹165.00 + ₹150.00 + ₹1,800.00 + ₹250.00 = \mathbf{₹6,635.00}$$

---

### 6.2 Scenario A: Industry-Standard Gross Transaction Value Basis (Recommended Model)

In commercial payment processing across India (e.g., Razorpay, PayU, Cashfree), Merchant Discount Rate (MDR) is assessed on the **Gross Transaction Value (Gross Customer Payment)** charged to the customer's payment method.

1. **Formula-Level Derivation of Breakeven Gross Price ($P_{\text{gross}}$):**
   At breakeven, Net Recognized Revenue minus Net MDR must equal Direct Variable Cost ($C_v$):
   $$\text{Net Revenue} - \text{MDR} = C_v$$
   $$\frac{P_{\text{gross}}}{1.12} - 0.02 \times P_{\text{gross}} = ₹6,635.00$$
   $$P_{\text{gross}} \times \left(\frac{1}{1.12} - 0.02\right) = ₹6,635.00$$
   $$P_{\text{gross}} \times (0.89285714 - 0.02) = ₹6,635.00$$
   $$P_{\text{gross}} \times 0.87285714 = ₹6,635.00$$
   $$\mathbf{P_{\text{gross, min}} = \frac{₹6,635.00}{0.87285714} = ₹7,601.47}$$

2. **Economics at ₹7,800.00 Promotional Floor MRP (Gross Basis):**
   - **Gross Customer Payment:** **₹7,800.00**
   - **Net Taxable Sales Base (12% GST-Exclusive Revenue):** $\frac{₹7,800.00}{1.12} = \mathbf{₹6,964.29}$
   - **Statutory Output GST Collected (12%):** $₹7,800.00 - ₹6,964.29 = \mathbf{₹835.71}$
   - **Gateway MDR (2.0% on Gross Customer Payment):** $0.02 \times ₹7,800.00 = \mathbf{₹156.00}$
   - **Statutory GST on MDR (18% on ₹156.00):** $0.18 \times ₹156.00 = \mathbf{₹28.08}$ (Recoverable GSTR-2B ITC Asset)
   - **Bank Settlement Cash Deduction:** $₹156.00 + ₹28.08 = \mathbf{₹184.08}$ (Bank settles ₹7,615.92)
   - **Direct Variable Cost ($C_v$):** **₹6,635.00**
   - **Net P&L Operating Contribution:**
     $$\text{Contribution} = \text{Net Revenue} - (\text{Net MDR} + C_v) = ₹6,964.29 - (₹156.00 + ₹6,635.00) = ₹6,964.29 - ₹6,791.00 = \mathbf{+₹173.29}$$
   - **Net Cash Realized (Cash Reconciliation):**
     $$\text{Cash Realized} = \text{Bank Settlement} - C_v - \text{Net GST Remittance}$$
     $$\text{Net GST Remittance} = \text{Output GST} (₹835.71) - \text{MDR ITC} (₹28.08) = ₹807.63$$
     $$\text{Cash Realized} = ₹7,615.92 - ₹6,635.00 - ₹807.63 = \mathbf{+₹173.29}$$

---

### 6.3 Scenario B: GST-Exclusive Net Revenue Basis (Unverified Alternative)

If contractual payment terms or an alternative settlement mechanism calculate MDR solely on the GST-exclusive net merchandise value:

1. **Formula-Level Derivation:**
   $$P_{\text{net}} = \frac{C_v}{1 - \text{MDR Rate}} = \frac{₹6,635.00}{1 - 0.02} = \frac{₹6,635.00}{0.98} = \mathbf{₹6,770.41}$$
   $$\mathbf{\text{Exact Floor MRP} = P_{\text{net}} \times 1.12 = ₹6,770.41 \times 1.12 = ₹7,582.86}$$

2. **Economics at ₹7,800.00 Promotional Floor MRP (Net Basis):**
   - **Net Taxable Sales Base:** **₹6,964.29**
   - **Gateway MDR (2.0% on Net Revenue):** $0.02 \times ₹6,964.29 = \mathbf{₹139.29}$
   - **Direct Variable Cost ($C_v$):** **₹6,635.00**
   - **Net P&L Operating Contribution:**
     $$\text{Contribution} = ₹6,964.29 - (₹139.29 + ₹6,635.00) = ₹6,964.29 - ₹6,774.29 = \mathbf{+₹190.00}$$

---

### 6.4 Comparative Summary & Fee Basis Verification Status

```
+---------------------------------------------------------------------------------------------------------+
|                                    GATEWAY BASIS SENSITIVITY COMPARISON                                 |
+------------------------------------+--------------------------+-----------------------------------------+
| Metric / Calculation Element       | Scenario A (Gross Basis) | Scenario B (Net Basis)                  |
+------------------------------------+--------------------------+-----------------------------------------+
| Industry / Commercial Status       | Standard Indian Gateway  | Theoretical / Unverified Alternative    |
| MDR Calculation Basis              | 2.0% of Gross GMV        | 2.0% of GST-Exclusive Net Revenue      |
| Base MDR at ₹7,800 MRP             | ₹156.00                  | ₹139.29                                 |
| Minimum Breakeven Floor MRP        | ₹7,601.47                | ₹7,582.86                               |
| Selected Promotional Floor MRP     | ₹7,800.00                | ₹7,800.00                               |
| Resulting Net Contribution         | +₹173.29 (+2.49% of Net) | +₹190.00 (+2.73% of Net)                |
| Cash Contribution Cushion          | Safe / Positive (+₹173)  | Safe / Positive (+₹190)                 |
+------------------------------------+--------------------------+-----------------------------------------+
```

- **Evidentiary Finding:** There are currently zero executed gateway merchant agreements in the repository.
- **Classification:** **`UNVERIFIED — CONTRACT EXECUTION & PROFESSIONAL VALIDATION REQUIRED (Gate G-CA)`**.
- **Audit Conclusion:** Under both calculation bases, the **₹7,800.00 Promotional Floor MRP is financially sound and guarantees positive cash contribution** (+₹173.29 on standard gross payment basis and +₹190.00 on net basis), exceeding the breakeven threshold of ₹7,601.47 (Gross) and ₹7,582.86 (Net). Selling below **₹7,602.00** under standard gateway terms burns operating cash.

---

## 7. Verification of Zero Double-Counting

```
+---------------------------------------------------------------------------------------------------------+
|                                    DOUBLE-COUNTING AUDIT VERIFICATION                                   |
+--------------------------+-----------------------+-----------------------+------------------------------+
| Operational Expense      | Incurred In Waterfall | Accounting Boundary   | Double-Counting Check        |
+--------------------------+-----------------------+-----------------------+------------------------------+
| Packaging (₹220)         | Direct Fulfilment     | Operating Logistics   | VERIFIED: Excluded from COGS.|
| Express Freight (₹165)   | Direct Fulfilment     | Outbound Courier      | VERIFIED: Excluded from COGS.|
| Return Reserve (₹150)    | Direct Fulfilment     | Refund Provision      | VERIFIED: Not in forward air.|
| Performance CAC (₹2,700) | Variable OpEx (CM2)   | Sales & Marketing     | VERIFIED: Not in Net Revenue.|
| Gateway MDR (₹300 net)   | Variable OpEx (CM2)   | Bank Financial Charge | VERIFIED: Excluded ₹54 ITC.  |
+--------------------------+-----------------------+-----------------------+------------------------------+
```

---
*End of Document `ATEEVRA-BR01-FIN-001`. Formally Verified with Reproducible Formulas.*
