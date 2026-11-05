# ATEEVRA PHASE 0.5 — BREAK-EVEN AND ITC VERIFICATION: OD-007
**Document ID:** `ATEEVRA-OD-007-BE-ITC-003`  
**Classification:** Definitive Break-Even Mathematics, Input GST Disaggregation & Cash-Flow Bridge  
**Parent Document:** [`ATEEVRA-OD-007-FINAL-CALCULATION-RECONCILIATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-007-FINAL-CALCULATION-RECONCILIATION.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision & Statutory CA Sign-Off)`  
**Audit Date:** 2026-11-05  
**Auditor / Preparer:** Principal Enterprise Architect, Statutory Tax Modeler & Policy Governance Specialist  

---

## 1. Executive Summary & Audit Mandate

This verification document establishes the definitive mathematical proof for:
1. **The Correct Promotional Break-Even Price ($P_{\text{min}}$):** Re-evaluating the historical ₹7,601.47 figure and establishing why the true disaggregated break-even price is **₹7,534.19**.
2. **Fixed vs. Variable Cost Behavior:** Categorizing every direct cost element by whether it is strictly fixed per unit or varies proportionally with selling price.
3. **The ₹297.93 vs. ₹486.00 Inward GST Reconciliation:** Explaining the exact statutory distinction between component-level CMT procurement (yielding ₹239.20 COGS ITC) and full-package FOB finished apparel procurement (yielding ₹486.00 COGS ITC at 12% GST).
4. **Reproducible Cash-Flow Bridge:** Providing an end-to-end reconciliation proving how customer cash flows through payment gateways, supplier disbursements, and statutory tax remittances to realize **+₹232.02 in net cash retained**.

---

## 2. Re-Calculation of the Promotional Break-Even Selling Price

### 2.1 The Historical Claim Analyzed
Earlier documentation cited a break-even selling price of **₹7,601.47**. 

Mathematical audit confirms that ₹7,601.47 was derived using the old lump-sum direct variable cost of **₹6,635.00**:
$$P_{\text{gross}} = \frac{₹6,635.00}{\frac{1}{1.12} - 0.02} = \frac{₹6,635.00}{0.89285714 - 0.02} = \frac{₹6,635.00}{0.87285714} = \mathbf{₹7,601.47}$$

### 2.2 The Correct Break-Even Equation under Reconciled Net Costs
Under the disaggregated cost model established in `ATEEVRA-OD-007-FIN-REC-002`, the **true GST-exclusive net unit cost ($C_{v,\text{net}}$)** is **₹6,576.27** (because the embedded GST on the box of ₹33.56 and air freight of ₹25.17 is excluded from expense under Ind AS 2):

$$\text{Contribution} = R_{\text{net}} - \text{Base MDR} - C_{v,\text{net}} = 0$$
$$\frac{P_{\text{gross}}}{1.12} - 0.02 \times P_{\text{gross}} = ₹6,576.27$$
$$P_{\text{gross}} \times \left(0.89285714 - 0.02\right) = ₹6,576.27$$
$$P_{\text{gross}} \times 0.87285714 = ₹6,576.27$$
$$\mathbf{P_{\text{gross, breakeven}} = \frac{₹6,576.27}{0.87285714} = ₹7,534.19}$$

- **Correction Finding:** The true statutory break-even price is **₹7,534.19**. The previously reported ₹7,601.47 was conservative by **₹67.28**, as it failed to deduct recoverable input tax credits from packaging and freight expenses.
- **Supersession Notice:** **₹7,534.19** is hereby formally established as the authoritative minimum promotional break-even floor price. At the planned promotional price of **₹7,800.00**, the company maintains a safety cushion of **+₹265.81 per blazer** ($₹7,800.00 - ₹7,534.19$).

---

## 3. Cost Variability Analysis: Behavior Across Promotional Price Changes

The table below audits whether each direct cost element remains fixed per unit or scales dynamically with customer selling price:

```
+===================================================================================================================================+
|                                    DIRECT COST VARIABILITY & SENSITIVITY MATRIX                                                   |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| Cost Component     | Net Cost @ ₹7.8k | Cost Behavior Type  | Variability Basis | Impact if Promotional Price Changes             |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Net Revenue**    | ₹6,964.29        | **Variable**        | Linear ($P/1.12$) | Decreases by ₹89.29 for every ₹100 drop in MRP. |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Gateway MDR**    | ₹156.00          | **Variable**        | Linear ($0.02P$)  | Decreases by ₹2.00 for every ₹100 drop in MRP.  |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Landed COGS**    | ₹4,050.00        | **Fixed per Unit**  | Contract PO Price | Fixed; independent of retail selling price.     |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Packaging Box**  | ₹186.44          | **Fixed per Unit**  | Supplier PO Price | Fixed; identical luxury box used across sales.  |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Express Freight**| ₹139.83          | **Fixed per Unit**  | Courier Tariff    | Fixed; air parcel weight remains 1.2 kg.        |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Return Reserve** | ₹150.00          | **Semi-Variable**   | Fixed Accrual     | Modeled as flat ₹150; if modeled as 3% of net,  |
|                    |                  |                     |                   | drops to ₹195 at full MRP and ₹150 at floor.    |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Promo CAC**      | ₹1,800.00        | **Fixed Campaign**  | Target Blended CAC| Fixed allocation per converted luxury client.   |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Concierge CX/QC**| ₹250.00          | **Fixed per Unit**  | In-House Labor    | Fixed warehouse inspection and styling labor.   |
+===================================================================================================================================+
```

### 3.1 Sensitivity Analysis across Selling Prices

```
+---------------------------------------------------------------------------------------------------------+
|                                  BLAZER PROFITABILITY ACROSS PRICE POINTS                               |
+--------------------+--------------------+--------------------+--------------------+---------------------+
| Metric             | Standard Full MRP  | Private Client VIP | Reconciled Floor   | True Break-Even     |
+--------------------+--------------------+--------------------+--------------------+---------------------+
| **Customer Price** | **₹18,500.00**     | **₹13,875.00**     | **₹7,800.00**      | **₹7,534.19**       |
| Net Revenue (12%)  | ₹16,517.86         | ₹12,388.39         | ₹6,964.29          | ₹6,726.96           |
| Gateway MDR (2%)   | -₹370.00           | -₹277.50           | -₹156.00           | -₹150.68            |
| Net Unit Costs     | -₹7,721.81*        | -₹6,876.27         | -₹6,576.27         | -₹6,576.27          |
+--------------------+--------------------+--------------------+--------------------+---------------------+
| **P&L Contribution**| **+₹8,426.05**    | **+₹5,234.62**     | **+₹232.02**       | **₹0.00 (BREAKEVEN)**|
| **Margin on Net**  | **+51.01%**        | **+42.25%**        | **+3.33%**         | **0.00%**           |
+--------------------+--------------------+--------------------+--------------------+---------------------+
```
*\*Includes elevated luxury CAC (₹2,500) and full-price return provision (₹495.54).*

---

## 4. Reconciling the ₹297.93 Supplier ITC vs. 12% Full-Package FOB Invoicing

The quality review questioned why the ₹4,050.00 landed COGS generates **₹239.20 of ITC** rather than **12.0% ($0.12 \times ₹4,050 = ₹486.00$)**.

### 4.1 The Statutory Reason: The CMT Component Model
The figure of **₹239.20** was derived under a **Job-Work / Cut-Make-Trim (CMT)** procurement structure, where physical inputs are unbundled across discrete statutory HSN classifications:

```
+===================================================================================================================================+
|                                    CMT JOB-WORK PROCUREMENT INWARD ITC BREAKDOWN                                                  |
+--------------------------+----------+-------------+------------+------------------------------------------------------------------+
| Input Element            | HSN Code | Net Cost (₹)| Inward GST | Statutory Basis & Invoice Documentation                          |
+--------------------------+----------+-------------+------------+------------------------------------------------------------------+
| Super 120s Wool Fabric   | **5111** | ₹1,850.00   | ₹92.50     | **5.0% GST** under Notification No. 1/2017-CT(R). Mill B2B Inv. |
| Silk / Canvas Interlining| **5007** | ₹450.00     | ₹22.50     | **5.0% GST** under Chapter 50 silk tariffs. Mill B2B Invoice.    |
| Horn Buttons & Zippers   | **9606** | ₹250.00     | ₹45.00     | **18.0% GST** under Chapter 96 apparel hardware. Vendor Invoice. |
| Master Atelier CMT Labor | **9988** | ₹1,350.00   | ₹67.50     | **5.0% GST** on job-work textile manufacturing services.         |
| Inbound Freight to WH01  | **9965** | ₹150.00     | ₹11.70     | Blended 7.8% (Courier 18% vs GTA 5%). Transport B2B consignment. |
+--------------------------+----------+-------------+------------+------------------------------------------------------------------+
| **TOTAL MANUFACTURING**  | Blended  | **₹4,050.00**| **₹239.20**| **Effective Input GST Rate: 5.906%**                             |
+===================================================================================================================================+
```

### 4.2 The Alternative: Finished Garment Full-Package (FOB) Invoicing
Under OD-002 Option A (Certified Contract Atelier FOB), if the atelier procures all fabrics and bills ATEEVRA for a single finished garment:
- **HSN Classification:** HSN 6203 (Men's Tailored Blazers > ₹1,000).
- **Statutory Rate:** **12.0% GST**.
- **Inward GST Billed by Atelier:** $0.12 \times ₹4,050.00 = \mathbf{₹486.00}$.
- **Comparison between Procurement Tax Models:**

```
+===================================================================================================================================+
|                                    PROCUREMENT TAX TREATMENT COMPARISON (COGS ₹4,050)                                             |
+------------------------------------+----------------------------------+-----------------------------------------------------------+
| Tax Parameter                      | Scenario A: CMT Job-Work Model   | Scenario B: Full-Package FOB Model                        |
+------------------------------------+----------------------------------+-----------------------------------------------------------+
| Atelier Procurement Mode           | ATEEVRA buys fabric; pays CMT sew| Atelier bills single finished garment                     |
| Inward COGS ITC Asset              | **₹239.20 (Blended 5.9%)**       | **₹486.00 (Flat 12.0%)**                                  |
| Other ITC (Box ₹33.56 + Air ₹25.17)| ₹58.73                           | ₹58.73                                                    |
| Gateway MDR ITC (18%)              | ₹28.08                           | ₹28.08                                                    |
| **Total Claimable ITC Asset**      | **₹326.01**                      | **₹572.81**                                               |
+------------------------------------+----------------------------------+-----------------------------------------------------------+
| Output GST Collected from Customer | ₹835.71                          | ₹835.71                                                   |
| Less: Total Inward ITC Offset      | -₹326.01                         | -₹572.81                                                  |
| **Net Cash GST Remitted to GOI**   | **₹509.70**                      | **₹262.90**                                               |
+------------------------------------+----------------------------------+-----------------------------------------------------------+
| Upfront Cash Disbursed to Supplier | ₹4,289.20 (Net + 5.9% GST)       | ₹4,536.00 (Net + 12% GST)                                 |
| Timing of Tax Cash Realization     | Trapped until GSTR-3B offset     | Trapped until GSTR-3B offset                              |
| **Final Net P&L Contribution**     | **+₹232.02**                     | **+₹232.02 (IDENTICAL UNDER IND AS 2)**                   |
| **Final Net Cash Retained**        | **+₹232.02**                     | **+₹232.02 (IDENTICAL UNDER IND AS 2)**                   |
+===================================================================================================================================+
```

- **Statutory Synthesis:** Whether ATEEVRA procures via CMT (₹239.20 ITC) or FOB (₹486.00 ITC), **the final P&L contribution and final net cash retained are IDENTICAL (+₹232.02)**! 
  - Under FOB, ATEEVRA pays ₹246.80 more cash to the atelier upfront, but pays **₹246.80 LESS cash to the Government of India** upon customer delivery!
  - Both models are 100% tax-neutral on final cash. The only difference is the working capital timing of the supplier advance.

---

## 5. End-to-End Cash-Flow Bridge: From Customer Checkout to Retained Cash

The table below traces the exact journey of every rupee from digital checkout through banking settlement, vendor payments, and government tax remittances:

```
+===================================================================================================================================+
|                                    DEFINITIVE CASH-FLOW BRIDGE (MRP ₹7,800.00)                                                    |
+------------------------------------+------------------+---------------------------------------------------------------------------+
| Transaction Event                  | Cash Flow (INR)  | Explanatory Mechanism & Ledger Balancing                                  |
+------------------------------------+------------------+---------------------------------------------------------------------------+
| **1. Customer Checkout Payment**   | **+₹7,800.00**   | Customer credit card debited via payment gateway.                         |
| **2. Gateway Settlement Cut**      | -₹184.08         | 2.0% Base MDR (₹156.00) + 18% Statutory GST on MDR (₹28.08) deducted.     |
| **3. Net Cash Deposited in Bank**  | **+₹7,615.92**   | Actual cash liquidity deposited into ATEEVRA corporate bank account (T+1).|
+------------------------------------+------------------+---------------------------------------------------------------------------+
| **4. Supplier Cash Outflows:**     |                  |                                                                           |
| • Atelier Landed COGS Cash Payment | -₹4,289.20       | ₹4,050.00 Net Cost + ₹239.20 Inward GST paid to atelier.                  |
| • Luxury Rigid Box Cash Payment    | -₹220.00         | ₹186.44 Net Cost + ₹33.56 Inward GST paid to box manufacturer.            |
| • Express Air Outbound Freight Cash| -₹165.00         | ₹139.83 Net Cost + ₹25.17 Inward GST paid to air courier.                 |
| • Promotional Digital CAC Cash Out | -₹1,800.00       | Paid to digital ad platforms (Meta/Google).                               |
| • Return & Repair Reserve Accrual  | -₹150.00         | Internal liquidity reserved in corporate bank account.                    |
| • Concierge CX & Warehouse QC Cash | -₹250.00         | Direct payroll allocation for packing and styling staff.                  |
| **Total Cash Disbursed / Reserved**| **-₹6,874.20**   | **Sum of all direct variable operating disbursements**                    |
+------------------------------------+------------------+---------------------------------------------------------------------------+
| **5. Cash Balance Before Tax**     | **+₹741.72**     | $₹7,615.92 \text{ (Bank Deposit)} - ₹6,874.20 \text{ (Disbursements)}$    |
+------------------------------------+------------------+---------------------------------------------------------------------------+
| **6. Statutory Tax Remittance:**   |                  |                                                                           |
| • Output GST Liability Collected   | +₹835.71         | Statutory debt owed to GOI on customer invoice.                           |
| • Less: COGS Inward ITC Asset      | -₹239.20         | Claimed in GSTR-3B Table 4(A)(5).                                         |
| • Less: Packaging Box Inward ITC   | -₹33.56          | Claimed in GSTR-3B Table 4(A)(5).                                         |
| • Less: Express Courier Inward ITC | -₹25.17          | Claimed in GSTR-3B Table 4(A)(5).                                         |
| • Less: Gateway MDR GST Inward ITC | -₹28.08          | Claimed from gateway B2B tax invoice.                                     |
| **Net Cash Remitted to GOI**       | **-₹509.70**     | **Actual tax payment made via GST portal net banking**                    |
+------------------------------------+------------------+---------------------------------------------------------------------------+
| **7. FINAL NET CASH RETAINED**     | **+₹232.02**     | $\mathbf{₹741.72 - ₹509.70 = +₹232.02}$                                   |
| **(MATCHES RECONCILED P&L)**       |                  | **(+3.33% of Net Taxable Revenue / +2.97% of Gross Payment)**              |
+===================================================================================================================================+
```

---

## 6. Document Supersession & Authoritative References

1. **Supersedes:** The ₹7,601.47 break-even price in Section 2.4 of `ATEEVRA-BR01-FINAL-CLOSURE-ADDENDUM.md` and Section 4 of `ATEEVRA-OD-007-FINAL-CALCULATION-RECONCILIATION.md`.
2. **Authoritative Break-Even Price:** The true statutory break-even price is **₹7,534.19**.
3. **Authoritative Contribution:** Reconciled P&L and Cash Contribution are **+₹232.02**.
4. **Governance Invariant:** `OD-007 REMAINS STRICTLY PROPOSED`. Professional sign-off by Statutory Auditor via Gate G-CA is mandatory before live tax configuration.
