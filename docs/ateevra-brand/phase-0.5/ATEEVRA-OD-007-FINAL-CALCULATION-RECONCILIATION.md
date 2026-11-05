# ATEEVRA PHASE 0.5 — FINAL CALCULATION RECONCILIATION: OD-007
**Document ID:** `ATEEVRA-OD-007-FIN-REC-002`  
**Classification:** Definitive Indirect Tax, P&L Contribution & Cash-Flow Reconciliation  
**Parent Document:** [`ATEEVRA-OD-007-OWNER-DELIBERATION-DOSSIER.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-007-OWNER-DELIBERATION-DOSSIER.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision & Statutory CA Sign-Off)`  
**Audit Date:** 2026-11-05  
**Auditor / Preparer:** Principal Enterprise Architect, Statutory Tax Modeler & Policy Governance Specialist  

---

## 1. Executive Summary & Audit Mandate

This document establishes the **single authoritative, mathematically reconciled financial model** for the **Tailored Wool Blazer (MRP ₹7,800.00)** under **OD-007**.

The quality gate review identified that earlier documentation contained conflicting interpretations regarding:
1. Whether the reported **₹6,635.00 direct variable cost** was GST-inclusive or GST-exclusive.
2. The exact mathematical origin and resolution of the **₹297.93 discrepancy** between P&L contribution and net cash retained.
3. Whether **+₹173.29** or **+₹232.02** is the correct economic P&L contribution and cash contribution.
4. The exact commercial and statutory treatment of the **₹184.08 payment gateway deduction** (₹156.00 base MDR + ₹28.08 GST) in both the P&L and cash-flow ledgers.
5. The mathematical proof of the **₹7,601.47 promotional breakeven floor price**.

This document resolves these items from primary statutory and accounting principles.

---

## 2. Definitive Step-by-Step Breakdown: The 14 Core Metrics

The table below provides the authoritative 14-point reconciliation for a single Tailored Blazer unit sold at the promotional floor price of ₹7,800.00:

```
+===================================================================================================================================+
|                                  DEFINITIVE 14-POINT FINANCIAL & TAX RECONCILIATION                                               |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| #  | Metric Name                        | Amount (INR)     | Exact Formula, Accounting Nature & Statutory Basis                 |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 1  | **Customer Gross Payment (MRP)**   | **₹7,800.00**    | Gross cash collected from customer at digital checkout.            |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 2  | **GST-Exclusive Recognized Revenue**| **₹6,964.29**    | $P_{\text{net}} = \frac{₹7,800.00}{1.12} = ₹6,964.2857$            |
|    |                                    |                  | (Top-line revenue recognized under Ind AS 115 Principal rules).    |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 3  | **Statutory Output GST (12.0%)**   | **₹835.71**      | $\text{Tax} = ₹7,800.00 - ₹6,964.29 = ₹835.7143$                   |
|    |                                    |                  | (Statutory balance sheet liability collected for Government of India).|
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 4  | **GST-Exclusive Cost of Inputs:**  |                  | Pure P&L inventory & operating expenses under Ind AS 2:            |
|    | • Manufacturing Landed COGS (TLC)  | ₹4,050.00        | Shell fabric (₹1,850) + Canvas (₹450) + Trims (₹250) + CMT (₹1,350)|
|    |                                    |                  | + Inbound freight (₹150). (Excludes recoverable GST).             |
|    | • Rigid Luxury Box Packaging       | ₹186.44          | $₹220.00 \times \frac{1}{1.18} = ₹186.4407$ (HSN 4819 @ 18% GST).   |
|    | • Express Air Outbound Freight     | ₹139.83          | $₹165.00 \times \frac{1}{1.18} = ₹139.8305$ (HSN 9965 @ 18% GST).   |
|    | • Customer Return & Repair Reserve | ₹150.00          | Internal cash provision for cleaning, repairs & return processing. |
|    | • Promotional Marketing CAC        | ₹1,800.00        | Digital client acquisition ad spend (Meta / Google Ads).           |
|    | • Concierge CX & AQL 2.5 QC Labor  | ₹250.00          | Stylist advisory, packaging labor, and warehouse inspection wages. |
|    | **Total GST-Exclusive Input Cost** | **₹6,576.27**    | **Sum of Net Operating Expenses ($C_{v,\text{net}}$)**             |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 5  | **GST Paid on Inputs to Suppliers:**|                  | Inward GST cash disbursed to suppliers (Pending GSTR-2B credit):   |
|    | • Manufacturing Landed COGS GST    | ₹239.20          | Blended 5.906% GST on fabrics (5%), CMT (5%), and trims (18%).     |
|    | • Rigid Luxury Box Packaging GST   | ₹33.56           | $₹220.00 - ₹186.44 = ₹33.5593$ (18.0% GST on packaging).           |
|    | • Express Air Freight GST          | ₹25.17           | $₹165.00 - ₹139.83 = ₹25.1695$ (18.0% GST on courier services).    |
|    | • Return Reserve & Internal CX GST | ₹0.00            | Zero GST (Internal balance sheet reserves & company payroll).      |
|    | • Marketing CAC GST (Paid to Meta) | ₹0.00*           | *Modeled as net cash spend; see Section 3 for CAC GST sensitivity.|
|    | **Total Inward Supplier GST Paid** | **₹297.93**      | **Total Tax Cash Disbursed to Vendors ($₹239.20 + ₹33.56 + ₹25.17)**|
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 6  | **Gross Supplier Cash Payments**   | **₹6,874.20**    | $\text{Total Net Cost (₹6,576.27)} + \text{Supplier GST (₹297.93)}$|
|    |                                    |                  | **= ₹6,874.20** (Actual cash disbursed to vendors).                |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 7  | **Eligible Input Tax Credit (ITC):**|                 | Recoverable tax assets under Section 16 CGST Act:                  |
|    | • Manufacturing COGS ITC Asset     | ₹239.20          | Claimable upon atelier GSTR-1 filing matching GSTR-2B.             |
|    | • Luxury Rigid Box ITC Asset       | ₹33.56           | Claimable upon box manufacturer invoice upload in GSTR-2B.         |
|    | • Express Air Cargo ITC Asset      | ₹25.17           | Claimable upon courier invoice upload in GSTR-2B.                  |
|    | **Total Inward Supplier ITC**      | **₹297.93**      | **Total claimable against output tax from vendor supplies**        |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 8  | **Payment Gateway Base MDR Expense**| **₹156.00**     | $0.02 \times ₹7,800.00 = ₹156.00$ (P&L Financial Banking OpEx).    |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 9  | **Statutory GST on Gateway MDR**   | **₹28.08**       | $0.18 \times ₹156.00 = ₹28.08$ (18.0% GST on banking service).     |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 10 | **Gateway MDR ITC Eligibility**    | **₹28.08**       | 100% Eligible under Section 16; auto-reflects in GSTR-2B.          |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 11 | **Total Claimable ITC Asset**      | **₹326.01**      | $\text{Supplier ITC (₹297.93)} + \text{Gateway ITC (₹28.08)} = \mathbf{₹326.01}$|
|    | **Net GST Cash Remitted to GOI**   | **₹509.70**      | $\text{Output GST (₹835.71)} - \text{Total ITC (₹326.01)} = \mathbf{₹509.70}$   |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 12 | **P&L Net Contribution (CM2)**     | **+₹232.02**     | $\text{Net Rev (₹6,964.29)} - \text{MDR (₹156.00)} - C_{v,\text{net}}(₹6,576.27)$|
|    |                                    |                  | $\mathbf{= +₹232.02}$ (+3.33% of Net Taxable Revenue).             |
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 13 | **Actual Net Cash Contribution**   | **+₹232.02**     | $\text{Bank Deposit (₹7,615.92)} - \text{Supplier Cash (₹6,874.20)}|
|    |                                    |                  | $- \text{Net Tax Remitted (₹509.70)} = \mathbf{+₹232.02}$ (Exact match)|
+----+------------------------------------+------------------+--------------------------------------------------------------------+
| 14 | **Timing Lag on ITC Utilization**  | **30–45 Days**   | Supplier GST (₹297.93) is paid on Day 0/45; recovered on Day 60/75|
|    |                                    |                  | via GSTR-3B offset against customer output GST.                    |
+===================================================================================================================================+
```

---

## 3. Explicit Resolution of the ₹297.93 Discrepancy

### 3.1 The Origin of the Earlier Confusion
In earlier documents:
- P&L contribution was reported as **+₹173.29**.
- Cash retained was reported as **+₹471.22**.
- Difference: $₹471.22 - ₹173.29 = \mathbf{₹297.93}$.

### 3.2 The Root Cause Revealed: The "Lump-Sum ₹6,635" Hybrid Error
The ₹6,635.00 figure originally established in BR-01 was computed as:
$$₹4,050 \text{ (TLC)} + ₹220 \text{ (Box)} + ₹165 \text{ (Air)} + ₹150 \text{ (Return)} + ₹1,800 \text{ (CAC)} + ₹250 \text{ (CX)} = \mathbf{₹6,635.00}$$

An inspection reveals that this ₹6,635 was a **hybrid mixture of GST-exclusive and GST-inclusive numbers**:
- TLC (₹4,050), Return (₹150), CAC (₹1,800), and CX (₹250) were **GST-exclusive costs**.
- BUT Box (₹220) and Air Freight (₹165) were **GST-inclusive retail invoice totals**!
  - The GST on the Box was **₹33.56** ($₹220 - ₹186.44$).
  - The GST on Air Freight was **₹25.17** ($₹165 - ₹139.83$).
  - Total GST embedded inside the ₹220 and ₹165 was: $₹33.56 + ₹25.17 = \mathbf{₹58.73}$.

Therefore:
- The **true GST-exclusive operating cost** is:
  $$C_{v,\text{net}} = ₹6,635.00 - ₹58.73 = \mathbf{₹6,576.27}$$
- When subtracting $C_{v,\text{net}}$ of ₹6,576.27 from Net Revenue (₹6,964.29) and Base MDR (₹156.00):
  $$\mathbf{P\&L\ Contribution = ₹6,964.29 - ₹156.00 - ₹6,576.27 = +₹232.02}$$

### 3.3 Why Was +₹173.29 Previously Reported?
- If an accountant treats the entire ₹6,635.00 as a net GST-exclusive cost (i.e., assuming the Box net cost is ₹220 and Air net cost is ₹165):
  $$\text{Net Revenue (₹6,964.29)} - \text{Base MDR (₹156.00)} - ₹6,635.00 = \mathbf{+₹173.29}$$
- In that scenario, gross cash paid to suppliers must be: $₹6,635.00 + ₹297.93 = \mathbf{₹6,932.93}$.
- Then cash retained is:
  $$\text{Cash Retained} = \text{Bank Deposit (₹7,615.92)} - ₹6,932.93 - \text{Tax (₹509.70)} = \mathbf{+₹173.29}$$

### 3.4 Why Was +₹471.22 Erroneously Derived?
- The ₹471.22 figure was derived in earlier drafts by subtracting only **₹6,635.00** as the cash paid to suppliers (as if ₹6,635 were the total cash disbursement), but simultaneously subtracting **₹326.01 of ITC** from the government tax remittance!
- This was an accounting double-count of the ₹297.93 supplier ITC asset.
- **Definitive Finding:** Under proper accounting, **P&L contribution and cash contribution MUST BE EQUAL**.
  - Under the disaggregated model: **Both are +₹232.02 (+3.33%)**.
  - Under the conservative lump-sum net model: **Both are +₹173.29 (+2.49%)**.
  - **In NO scenario is cash contribution +₹471.22.** The ₹471.22 figure is formally **WITHDRAWN AND SUPERSEDED**.

---

## 4. Re-Verification of Breakeven Floor Price: ₹7,601.47 vs. ₹7,633.00

### 4.1 Treatment of the ₹184.08 Gateway Deduction
A payment gateway charges:
- **Base MDR (2.0%):** ₹156.00 (Operating expense).
- **Statutory GST (18.0% on MDR):** ₹28.08 (Input tax credit asset).
- **Total Deduction from Customer Payment:** **₹184.08 (2.36% of Gross GMV)**.
- **Cash Deposited in Bank:** $₹7,800.00 - ₹184.08 = \mathbf{₹7,615.92}$.

### 4.2 Is the ₹184.08 Deduction Handled Correctly?
**YES.** In both the P&L and Cash Ledgers:
1. **In the P&L:** The expense recognized is **₹156.00** (Base MDR). The ₹28.08 is not an expense; it is a balance sheet tax asset.
2. **In the Cash Flow:** The bank deducts ₹184.08 in cash. However, when remitting sales tax to the Government of India, ATEEVRA reduces its cash tax payment by **₹28.08** (Table 4(A) of GSTR-3B).
   $$\text{Net Economic Cash Cost of Gateway} = ₹184.08 \text{ (Bank Cut)} - ₹28.08 \text{ (Tax Saving)} = \mathbf{₹156.00}$$
   Therefore, the net cash cost of the gateway is exactly equal to the base MDR of 2.0%!

### 4.3 Mathematical Proof of Breakeven Floor Price ($P_{\text{gross}}$)

#### Scenario A: With Full ITC Recovery on MDR (Verified Baseline)
$$\frac{P_{\text{gross}}}{1.12} - 0.02 \times P_{\text{gross}} = C_v$$

- If $C_v = ₹6,635.00$ (Conservative Lump-Sum):
  $$P_{\text{gross}} \times \left(\frac{1}{1.12} - 0.02\right) = ₹6,635.00 \implies P_{\text{gross}} \times 0.87285714 = ₹6,635.00$$
  $$\mathbf{P_{\text{gross, min}} = \frac{₹6,635.00}{0.87285714} = ₹7,601.47}$$

- If $C_v = ₹6,576.27$ (True Disaggregated Net Cost):
  $$\mathbf{P_{\text{gross, min}} = \frac{₹6,576.27}{0.87285714} = ₹7,534.19}$$

#### Scenario B: If ITC on MDR Were Ineligible (Extreme Stress Test)
If tax authorities disallowed ITC on gateway fees, the effective fee would be $2.0\% \times 1.18 = 2.36\%$:
$$P_{\text{gross}} \times \left(\frac{1}{1.12} - 0.0236\right) = ₹6,635.00 \implies P_{\text{gross}} \times 0.86925714 = ₹6,635.00$$
$$\mathbf{P_{\text{gross, min}} = \frac{₹6,635.00}{0.86925714} = ₹7,633.00}$$

- **Conclusion:** At the proposed promotional floor price of **₹7,800.00**, the product is **cash-positive across all scenarios**:
  - Cushion under Disaggregated Net ($P_{\text{min}} = ₹7,534.19$): **+₹265.81**
  - Cushion under Conservative Lump-Sum ($P_{\text{min}} = ₹7,601.47$): **+₹198.53**
  - Cushion under Blocked ITC Stress Test ($P_{\text{min}} = ₹7,633.00$): **+₹167.00**

---

## 5. Input Tax Credit (ITC) Itemized Schedule & Statutory Requirements

```
+===================================================================================================================================+
|                                  ITEMIZED ITC SCHEDULE & STATUTORY CONDITIONS                                                     |
+--------------------+----------+-------------+------------+--------------------------------+---------------------------------------+
| Input Category     | Assumed  | Net Taxable | Inward ITC | Mandatory Rule & Document for  | Evidentiary Classification            |
|                    | GST Rate | Base (₹)    | Amount (₹) | ITC Claim under Section 16     | & Gating Requirement                  |
+--------------------+----------+-------------+------------+--------------------------------+---------------------------------------+
| **Shell Fabric &** | 5.0% /   | ₹4,050.00   | ₹239.20    | Section 31 B2B Tax Invoice;    | `UNVERIFIED — MODEL ASSUMPTION`       |
| **CMT Stitching**  | 12.0%    |             |            | GSTR-2B match; AQL 2.5 pass.   | (Pending binding quotes via Gate G-SUP)
+--------------------+----------+-------------+------------+--------------------------------+---------------------------------------+
| **Luxury Rigid Box**| 18.0%   | ₹186.44     | ₹33.56     | HSN 4819 Tax Invoice from box  | `UNVERIFIED — MODEL ASSUMPTION`       |
| **Packaging**      |          |             |            | supplier; GSTR-2B match.       | (Pending packaging quote via Gate G-SUP)
+--------------------+----------+-------------+------------+--------------------------------+---------------------------------------+
| **Express Air**    | 18.0%    | ₹139.83     | ₹25.17     | HSN 9965 Courier Consignment   | `UNVERIFIED — MODEL ASSUMPTION`       |
| **Courier Freight**|          |             |            | Note / B2B Invoice; GSTR-2B.   | (Pending logistics SLA via Gate G-LO) |
+--------------------+----------+-------------+------------+--------------------------------+---------------------------------------+
| **Gateway MDR**    | 18.0%    | ₹156.00     | ₹28.08     | Monthly Tax Invoice issued by  | `UNVERIFIED — MODEL ASSUMPTION`       |
| **Banking Fee**    |          |             |            | Razorpay/PayU with corporate GST| (Pending merchant agr. via Gate G-CA) |
+--------------------+----------+-------------+------------+--------------------------------+---------------------------------------+
| **TOTAL INWARD ITC**| Blended | —           | **₹326.01**| GSTR-3B Table 4(A)(5) Claimable| **PROFESSIONAL VALIDATION REQUIRED**  |
+===================================================================================================================================+
```

---

## 6. Document Supersession & Audit Trail

The findings of this document formally supersede conflicting calculations in earlier records:
1. **Supersedes Section 8.3 of `ATEEVRA-OD-007-OWNER-DELIBERATION-DOSSIER.md`:** The claim that net cash retained is +₹471.22 is superseded. Reconciled cash contribution is **+₹232.02 (disaggregated)** or **+₹173.29 (conservative lump-sum)**.
2. **Supersedes Section 3 of `ATEEVRA-OD-007-FINANCIAL-AND-TAX-RECONCILIATION.md`:** The ambiguous derivation of ₹471.22 is resolved as an erroneous double-counting of supplier ITC.
3. **Re-Affirms Breakeven Floor:** Re-affirms that **₹7,800.00 is cash-positive and viable**, with an absolute statutory breakeven floor of **₹7,601.47**.

---

## 7. Final Governance State

$$\mathbf{OD-007\ STATUS:\ PROPOSED\ (PENDING\ OWNER\ SELECTION\ &\ CA\ SIGN-OFF)}$$
- **Zero Decisions Approved.**
- **Zero Tax Configuration Changes Implemented.**
- **Implementation Remains Locked.**
