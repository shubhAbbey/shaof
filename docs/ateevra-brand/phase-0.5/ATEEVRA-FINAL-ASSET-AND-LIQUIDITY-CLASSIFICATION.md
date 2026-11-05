# ATEEVRA PHASE 0.5 — ASSET RECOVERABILITY & LIQUIDITY RISK CLASSIFICATION
**Document ID:** `ATEEVRA-ASSET-LIQUIDITY-CLASS-001`  
**Classification:** Balance Sheet Asset Audit, Liquidity Spectrum & Capital Recovery Risk Matrix  
**Parent Document:** [`ATEEVRA-PHASE-1-FUNDING-REQUIREMENT-BRIDGE.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-PHASE-1-FUNDING-REQUIREMENT-BRIDGE.md)  
**Cross-References:** [`ATEEVRA-FINAL-INVENTORY-VALUATION-RECONCILIATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-FINAL-INVENTORY-VALUATION-RECONCILIATION.md), [`ATEEVRA-120-DAY-CASH-FLOW-VALIDATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-120-DAY-CASH-FLOW-VALIDATION.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision)`  
**Audit Date:** 2026-11-05  
**Auditor / Reviewer:** Principal Enterprise Architect & Chartered Financial Controller  

---

## 1. Executive Summary & Audit Mandate

This document establishes the definitive accounting and treasury framework separating **formal accounting balance-sheet classification** from **actual commercial liquidity and capital recoverability risk**.

Following the closure instructions, this document provides:
1. **Lower-Risk Capital Disaggregation:** Renaming "Safe Capital" to **Lower-Risk Capital**, explicitly distinguishing **immediately spendable liquid cash** from the **locked refundable commercial lease deposit**.
2. **Comprehensive ITC Float Breakdown:** Providing the full line-by-line derivation of the **₹2,90,750.00** Inward GST balance, including the statutory explanation of the **₹63,575.76** embedded ITC offset.
3. **Day 75 Launch Snapshot:** Establishing a formal balance-sheet and liquidity snapshot on launch day.

---

## 2. Rebuilding the Initial Capital Exposure Breakdown (₹36,47,920.00 Pool)

At product launch (Day 75), prior to retail sales, the **₹36,47,920.00 initial capital pool** is divided into three distinct capital exposure tiers:

```
+===================================================================================================================================+
|                                    DAY 75 CAPITAL EXPOSURE DECOMPOSITION (INITIAL POOL)                                           |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
| #  | Capital Exposure Category          | Component Detail | Amount (₹)       | % of Peak Capital     | Liquidity Horizon & Risk  |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
| 1  | **LOWER-RISK CAPITAL**             | Bank Cash Buffer | ₹4,75,000.00     | 13.02%                | **100% Liquid** (T+0 Cash)|
|    |                                    | WH01 Lease Dep.  | ₹5,25,000.00     | 14.39%                | Locked Asset (11 Months). |
|    | **Subtotal Lower-Risk Capital**    | —                | **₹10,00,000.00**| **27.41%**            | **Contractually Protected**|
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
| 2  | **COMMERCIALIZATION-EXPOSED**      | Landed Inventory | ₹16,01,000.00    | 43.89%                | Illiquid Stock (30–90 d). |
|    | **CAPITAL**                        | Trapped GST ITC  | ₹2,90,750.00     | 7.97%                 | Non-cash GSTR-2B Credit.  |
|    | **Subtotal Exposed Capital**       | —                | **₹18,91,750.00**| **51.86%**            | **High Commercial Risk**  |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
| 3  | **CONSUMED OPEX & PREPAYMENTS**    | Pre-Launch Mktg  | ₹4,50,000.00     | 12.34%                | 100% Expended (Period).   |
|    | **(THE REMAINING PORTION)**        | Month 1 WH01 Rent| ₹1,75,000.00     | 4.80%                 | 100% Expended (Facility). |
|    |                                    | Net Packaging PO | ₹1,10,000.00     | 3.02%                 | Consumable (Fulfillment). |
|    |                                    | Net Cargo Policy | ₹21,186.44       | 0.58%                 | Prepaid Risk Overhead.    |
|    |                                    | Legal / Metrology| ₹63,559.32       | 1.74%                 | Setup Professional OpEx.  |
|    |                                    | Less: ITC Offset | -₹63,575.76      | -1.74%                | (Embedded in ITC float).  |
|    | **Subtotal Consumed Capital**      | —                | **₹7,56,170.00** | **20.73%**            | **100% Sunk / Expended**  |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
|    | **TOTAL INITIAL CAPITAL POOL**     | —                | **₹36,47,920.00**| **100.00%**           | **Exact Rupee Match!**    |
+===================================================================================================================================+
```

$$\mathbf{₹10,00,000.00\ (Lower\ Risk)\ +\ ₹18,91,750.00\ (Exposed)\ +\ ₹7,56,170.00\ (Consumed)\ =\ ₹36,47,920.00}$$

### 2.1 Lower-Risk Capital: Liquid Cash vs. Locked Lease Deposit
To prevent treasury confusion, Lower-Risk Capital is divided into two distinct legal and liquidity instruments:
1. **Immediately Spendable Liquid Cash (₹4,75,000.00 / 13.02%):**  
   - Held in ATEEVRA’s corporate current account with an RBI-scheduled commercial bank.
   - **100% Liquid (T+0):** Available on-demand for operational contingencies, unexpected freight demurrage, or cash deficits.
2. **Locked Refundable Lease Deposit (₹5,25,000.00 / 14.39%):**  
   - Commercial security deposit transferred to the warehouse landlord under a registered 11-month lease agreement.
   - **Illiquid & Restricted:** Completely inaccessible for working capital during operations. Refundable only at lease expiry upon physical handover of the facility, subject to standard premises condition deductions.

---

## 3. Supporting Breakdown of the ₹2,90,750.00 ITC Balance & Treatment of the ₹63,575.76 Offset

### 3.1 Component-Level Derivation of the ₹2,90,750.00 Inward ITC Float
The Inward GST accumulated in ATEEVRA’s electronic credit ledger (GSTR-2B) at Day 75 totals **₹2,90,750.00**, comprising:

```
+===================================================================================================================================+
|                                    DAY 75 INWARD GST / ITC FLOAT SUPPORTING BREAKDOWN                                             |
+----+------------------------------------+------------------+----------+-------------------+---------------------------------------+
| #  | Transaction / Invoice Element      | Taxable Base (₹) | GST Rate | Inward ITC (₹)    | Statutory Source & Tax Invoice Type   |
+----+------------------------------------+------------------+----------+-------------------+---------------------------------------+
| 1  | Debut Atelier Production PO (500)  | ₹16,01,000.00    | 12.0%    | **₹1,92,120.00**  | Section 31 Tax Invoice (HSN 6203).    |
| 2  | Custom Luxury Rigid Boxes (500)    | ₹1,10,000.00     | 18.0%    | **₹19,800.00**    | Supplier Tax Invoice (HSN 4819).      |
| 3  | Inbound Transit Cargo Insurance    | ₹21,186.44       | 18.0%    | **₹3,813.56**     | Insurer Premium Tax Invoice (SAC 9971)|
| 4  | Legal & Metrology Setup Retainer   | ₹63,559.32       | 18.0%    | **₹11,440.68**    | Professional Tax Invoice (SAC 9982).  |
+----+------------------------------------+------------------+----------+-------------------+---------------------------------------+
|    | **SUBTOTAL: DIRECT PO & RETAINERS**| **₹17,95,745.76**| —        | **₹2,27,174.24**  | **Audited Supplier Invoices**         |
+----+------------------------------------+------------------+----------+-------------------+---------------------------------------+
| 5  | Central WH01 Month 1 Lease Rent    | ₹1,48,305.08     | 18.0%    | **₹26,694.92**    | Landlord Commercial Lease Tax Invoice.|
| 6  | Pre-Launch Digital PR & Lookbook   | ₹2,04,893.56     | 18.0%    | **₹36,880.84**    | Creative Agency Tax Invoice (SAC 9983)|
+----+------------------------------------+------------------+----------+-------------------+---------------------------------------+
|    | **SUBTOTAL: OPERATING OVERHEAD GST**| **₹3,53,198.64** | —        | **₹63,575.76**    | **Overhead Operating Service Invoices**|
+----+------------------------------------+------------------+----------+-------------------+---------------------------------------+
|    | **TOTAL INWARD ITC BALANCE**       | —                | —        | **₹2,90,750.00**  | **Electronic Credit Ledger Asset**    |
+===================================================================================================================================+
```

$$\mathbf{₹2,27,174.24\ (Direct\ Inputs)\ +\ ₹63,575.76\ (Operating\ Overheads)\ =\ ₹2,90,750.00}$$

### 3.2 Accounting Treatment of the ₹63,575.76 Embedded ITC Offset
In Section 2's capital exposure table, the consumed operating expense lines are entered on a **gross cash disbursed basis**:
- Pre-launch Marketing: **₹4,50,000.00** (gross cash out)
- Central WH01 Month 1 Rent: **₹1,75,000.00** (gross cash out)

These two gross payments already contain **₹63,575.76** of Inward GST ($₹26,694.92 \text{ on rent} + ₹36,880.84 \text{ on agency billings} = \mathbf{₹63,575.76}$).

Because the capital exposure table presents the **full ₹2,90,750.00 ITC float** as a separate balance-sheet asset under Tier 2 (Commercialization-Exposed Capital), **failing to deduct the ₹63,575.76 from the consumed expense total would double-count that overhead GST**. 

Therefore, the line item:
$$\mathbf{Less:\ ITC\ Offset:\ -₹63,575.76\ (Embedded\ in\ ITC\ Float)}$$
is the mathematically necessary accounting adjustment that ensures the total deployed cash reconciles to the exact **₹36,47,920.00 initial capital pool**.

---

## 4. Day 75 Pre-Revenue Balance-Sheet & Liquidity Snapshot

```
+===================================================================================================================================+
|                                    DAY 75 BALANCE SHEET & LIQUIDITY SNAPSHOT (PRE-REVENUE)                                        |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
| #  | Asset Category           | Balance Sheet    | Accounting Class   | Commercial Liquidity  | Capital Recovery Mechanism &      |
|    |                          | Book Value (₹)   | (Ind AS Taxonomy)  | Access Horizon        | Primary Impairment Risks          |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
| 1  | **Immediately Spendable**| ₹4,75,000.00     | **Current Asset**  | **Immediate (T+0)**   | **Zero Recovery Risk.**           |
|    | **Bank Cash Buffer**     |                  | (Cash & Cash Equiv)| Free Spendable Cash   | Maintained in commercial bank.    |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
| 2  | **Refundable Security**  | ₹5,25,000.00     | **Non-Current**    | **Locked (11 Months)**| **Low Recovery Risk.**            |
|    | **Lease Deposit**        |                  | (Loans & Advances) | Non-spendable capital | Contractually refundable at lease |
|    |                          |                  |                    |                       | expiry; dispute risk with owner.  |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
| 3  | **Finished Goods**       | ₹16,01,000.00    | **Current Asset**  | **Illiquid Stock**    | **High Commercial Risk.**         |
|    | **Inventory (Landed)**   | (500 units debut)| (Inventories IndAS2| Converted only via    | Realizable only via customer sales|
|    |                          |                  | Lower of Cost/NRV) | retail orders         | Salvage value: 30–50% if failed.  |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
| 4  | **Work-in-Progress &**   | ₹0.00            | **Current Asset**  | **Not Applicable**    | **Zero Deployed at Day 75.**      |
|    | **Raw Materials (WIP)**  | (Debut is 100% FG| (Inventories IndAS2| (Drop 2 mill booking  | Drop 2 fabric is booked at        |
|    |                          | finished goods)  |                    | occurs at Day 120)    | Day 120 from sales proceeds.      |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
| 5  | **Recoverable GST /**    | ₹2,90,750.00     | **Current Asset**  | **Non-Cash Credit**   | **Realizable ONLY via Output Tax.**|
|    | **Input Tax Credit**     |                  | (Other Current     | Cannot be withdrawn   | Inward tax in GSTR-2B. Under      |
|    | **(GSTR-2B Float)**      |                  | Assets - GST Reg)  | as liquid bank cash   | Sec 54(3), zero cash refund!      |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
| 6  | **Prepaid Logistics**    | ₹21,186.44       | **Current Asset**  | **Sunk Asset**        | **Zero Cash Recovery.**           |
|    | **Insurance**            |                  | (Prepaid Expenses) | Amortized over 12 mo  | Non-refundable transit policy.    |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
| 7  | **Consumed Operating**   | ₹7,34,983.56     | **Period Expense** | **Zero Liquidity**    | **100% Consumed.**                |
|    | **Overheads (OpEx)**     |                  | (Cost of Sales, Mkt| Sunk pre-launch spend | Expended into meta-ads, warehouse |
|    |                          |                  | & Legal Setup)     |                       | rent, and legal compliance.       |
+----+--------------------------+------------------+--------------------+-----------------------+-----------------------------------+
|    | **TOTAL INITIAL ASSETS** | **₹36,47,920.00**| —                  | —                     | **Balanced Accounting Snapshot!** |
+===================================================================================================================================+
```

---

## 5. Register of Corrections

| Item | Previous Presentation | Corrected Value | Exact Calculation / Reason |
| :--- | :--- | :--- | :--- |
| **Safe Capital Labeling** | "Safe Capital" | **"Lower-Risk Capital"** | Accurately describes contractually protected capital while distinguishing liquid cash from locked deposit. |
| **Spendable Cash vs Deposit**| Conflated as ₹10.0L | **₹4.75L Cash / ₹5.25L Dep** | Disaggregates immediately spendable bank buffer from 11-month locked commercial lease deposit. |
| **ITC Float Breakdown** | ₹2.91L aggregate | **₹2,90,750.00 itemized** | Explains direct PO ITC (₹2,27,174.24) + overhead rent/ad ITC (₹63,575.76). |
| **Embedded ITC Offset** | Unexplained offset | **-₹63,575.76 explained** | Deducted from gross opex to prevent double-counting overhead GST in the capital pool. |
