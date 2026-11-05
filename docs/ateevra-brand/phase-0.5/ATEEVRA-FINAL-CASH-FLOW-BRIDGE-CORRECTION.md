# ATEEVRA PHASE 0.5 — FINAL CASH-FLOW BRIDGE CORRECTION: OD-007
**Document ID:** `ATEEVRA-OD-007-CASH-BRIDGE-CORR-001`  
**Classification:** Financial Accounting Audit, Cash-Flow Reconstruction & Tax Reconciliation  
**Parent Document:** [`ATEEVRA-OD-007-BREAK-EVEN-AND-ITC-VERIFICATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-007-BREAK-EVEN-AND-ITC-VERIFICATION.md)  
**Cross-Reference:** [`ATEEVRA-WAVE-1-FINAL-EVIDENCE-VERIFICATION-REPORT.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-WAVE-1-FINAL-EVIDENCE-VERIFICATION-REPORT.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision)`  
**Audit Date:** 2026-11-05  
**Auditor / Reviewer:** Principal Enterprise Architect & Chartered Financial Controller  

---

## 1. Executive Summary & Root Cause Investigation

This audit investigates and resolves the mathematical discrepancy identified in Section 2.2 of `ATEEVRA-WAVE-1-FINAL-EVIDENCE-VERIFICATION-REPORT.md`.

### 1.1 The Identified Discrepancy
The review observed the following figures:
- Customer Gross Payment: **₹7,800.00**
- Net Bank Deposit: **~₹7,615.92**
- Reported Gross Variable Cost Disbursements: **₹7,171.80**
- Net Statutory GST Remittance: **₹509.70**
- Reported Net Cash Retained: **+₹232.02**

The discrepancy is evident upon basic subtraction:
$$₹7,615.92 - ₹7,171.80 - ₹509.70 = \mathbf{-₹65.58 \neq +₹232.02}$$

### 1.2 Root Cause Analysis: The Supplier ITC Double-Counting Error
The investigation reveals that the figure **₹7,171.80** arose from an inadvertent double-counting of the Inward Supplier Input Tax Credit (ITC) in the executive summary narrative:
1. In the detailed transaction model ([`ATEEVRA-OD-007-BREAK-EVEN-AND-ITC-VERIFICATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-007-BREAK-EVEN-AND-ITC-VERIFICATION.md), Section 5), the actual gross cash disbursed to suppliers and operational reserves totals **₹6,874.20**:
   - Atelier Landed COGS Cash: ₹4,289.20 (₹4,050.00 Net + ₹239.20 Inward GST)
   - Packaging Rigid Box Cash: ₹220.00 (₹186.44 Net + ₹33.56 Inward GST)
   - Express Outbound Courier Cash: ₹165.00 (₹139.83 Net + ₹25.17 Inward GST)
   - Performance Marketing CAC: ₹1,800.00 (Gross ad spend)
   - Return & Alteration Reserve: ₹150.00 (Internal cash reserve)
   - Concierge CX & Warehouse QC: ₹250.00 (Internal payroll/ops)
   - **True Gross Variable Cash Disbursements:** $\mathbf{₹6,874.20}$
2. When the executive summary report was drafted, the author added the total supplier input tax credit of **₹297.60** (₹239.20 + ₹33.56 + ₹25.17 $\approx$ ₹297.93) to the gross disbursements:
   $$₹6,874.20 + ₹297.60 = \mathbf{₹7,171.80}$$
3. This was an accounting error: **the gross payments to suppliers (₹4,289.20, ₹220.00, ₹165.00) ALREADY included the ₹297.60 Inward GST!**
4. By listing gross disbursements as ₹7,171.80 while simultaneously deducting the Net GST remittance of ₹509.70 (which reflects the offset of the ₹297.60 ITC), the input tax credit was subtracted **TWICE**:
   - First, as an inflated cash outflow to suppliers (+₹297.60).
   - Second, as an ITC deduction reducing the government remittance from ₹835.71 to ₹509.70.
5. Correcting the gross disbursements to their true value of **₹6,874.20** completely resolves the equation:
   $$₹7,615.92 \text{ (Bank Deposit)} - ₹6,874.20 \text{ (True Gross Disbursements)} - ₹509.70 \text{ (Net GST to GOI)} = \mathbf{+₹232.02}$$

---

## 2. Complete Transaction-Level Cash-Flow Bridge (CMT Model)

The table below provides the authoritative 12-point transaction-level cash flow bridge for the **Cut-Make-Trim (CMT)** procurement structure:

```
+===================================================================================================================================+
|                        TRANSACTION-LEVEL CASH & TAX RECONCILIATION BRIDGE (CMT MODEL @ ₹7,800 MRP)                                |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| #  | Transaction Stage / Element           | Cash Impact (₹)   | Accounting Net (₹) | Statutory & Commercial Mechanism            |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 1  | **Customer Gross Payment**            | **+₹7,800.00**    | —                  | Customer payment via payment gateway.       |
| 2  | Less: Gateway Base MDR (2.0%)         | -₹156.00          | -₹156.00           | $0.02 \times ₹7,800.00$ gross transaction.  |
| 3  | Less: 18% GST on Gateway MDR          | -₹28.08           | — (ITC Asset)      | Statutory GST on banking/payment service.   |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 4  | **NET BANK SETTLEMENT RECEIVED**      | **+₹7,615.92**    | —                  | **Actual cash deposited in ATEEVRA account**|
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 5  | **Supplier & Direct Disbursements:**  |                   |                    |                                             |
|    | • Atelier Manufacturing (CMT)         | -₹4,289.20        | -₹4,050.00         | ₹4,050 net cost + ₹239.20 Inward GST.       |
|    | • Luxury Rigid Box & Packaging        | -₹220.00          | -₹186.44           | ₹186.44 net cost + ₹33.56 Inward GST.       |
|    | • Express Outbound Air Courier        | -₹165.00          | -₹139.83           | ₹139.83 net cost + ₹25.17 Inward GST.       |
|    | • Performance Marketing CAC           | -₹1,800.00        | -₹1,800.00         | Direct paid media spend (Meta/Google).      |
|    | • Return & Alteration Reserve         | -₹150.00          | -₹150.00           | Internal provision for returns/restitching. |
|    | • Concierge CX & Warehouse QC         | -₹250.00          | -₹250.00           | Staff handling, steam press & inspection.   |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 6  | **TOTAL SUPPLIER CASH DISBURSED**     | **-₹6,874.20**    | **-₹6,576.27**     | **Gross cash out includes ₹297.93 GST**     |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 7  | **CASH BALANCE BEFORE TAX REMITTANCE**| **+₹741.72**      | —                  | $₹7,615.92 \text{ (Bank)} - ₹6,874.20$      |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 8  | **Statutory Output GST Liability**    | —                 | +₹835.71 (Debt)    | $₹7,800 / 1.12 \times 0.12 = ₹835.714$       |
| 9  | Less: Eligible Supplier ITC Asset     | —                 | -₹297.93 (Credit)  | COGS (₹239.20) + Box (₹33.56) + Air (₹25.17)|
| 10 | Less: Eligible Gateway MDR ITC Asset  | —                 | -₹28.08 (Credit)   | 18% GST on MDR from Gateway GSTR-1 invoice. |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 11 | **NET CASH GST REMITTED TO GOI**      | **-₹509.70**      | —                  | $₹835.71 - ₹297.93 - ₹28.08 = \mathbf{₹509.70}$|
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 12 | **FINAL NET CASH RETAINED**           | **+₹232.02**      | **+₹232.02**       | $\mathbf{₹741.72 - ₹509.70 = +₹232.02}$     |
|    | **(EXACT MATCH TO P&L CONTRIBUTION)** |                   |                    | **(+3.33% of Net Revenue / +2.97% of MRP)** |
+===================================================================================================================================+
```

---

## 3. Alternative Transaction-Level Cash-Flow Bridge (FOB Model)

If ATEEVRA sources finished blazers under a single **Full-Package FOB** invoice at 12% GST (HSN 6203):

```
+===================================================================================================================================+
|                        TRANSACTION-LEVEL CASH & TAX RECONCILIATION BRIDGE (FOB MODEL @ ₹7,800 MRP)                                |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| #  | Transaction Stage / Element           | Cash Impact (₹)   | Accounting Net (₹) | Statutory & Commercial Mechanism            |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 1  | Customer Gross Payment                | +₹7,800.00        | —                  | Customer payment via payment gateway.       |
| 2  | Less: Gateway Base MDR (2.0%)         | -₹156.00          | -₹156.00           | $0.02 \times ₹7,800.00$ gross transaction.  |
| 3  | Less: 18% GST on Gateway MDR          | -₹28.08           | — (ITC Asset)      | Statutory GST on banking/payment service.   |
| 4  | **NET BANK SETTLEMENT RECEIVED**      | **+₹7,615.92**    | —                  | Actual cash deposited in bank.              |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 5  | **Supplier & Direct Disbursements:**  |                   |                    |                                             |
|    | • Atelier Finished Blazer (FOB 12%)   | -₹4,536.00        | -₹4,050.00         | ₹4,050 net cost + ₹486.00 Inward GST (12%). |
|    | • Packaging, Courier, CAC, QC & Res.  | -₹2,585.00        | -₹2,526.27         | Packaging (₹220), Courier (₹165), CAC (₹1.8k)|
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 6  | **TOTAL SUPPLIER CASH DISBURSED**     | **-₹7,121.00**    | **-₹6,576.27**     | **Gross cash out includes ₹544.73 GST**     |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 7  | **CASH BALANCE BEFORE TAX REMITTANCE**| **+₹494.92**      | —                  | $₹7,615.92 \text{ (Bank)} - ₹7,121.00$      |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 8  | Statutory Output GST Liability        | —                 | +₹835.71 (Debt)    | $₹7,800 / 1.12 \times 0.12 = ₹835.71$       |
| 9  | Less: Eligible Supplier ITC Asset     | —                 | -₹544.73 (Credit)  | COGS (₹486.00) + Box (₹33.56) + Air (₹25.17)|
| 10 | Less: Eligible Gateway MDR ITC Asset  | —                 | -₹28.08 (Credit)   | 18% GST on MDR from Gateway B2B invoice.    |
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 11 | **NET CASH GST REMITTED TO GOI**      | **-₹262.90**      | —                  | $₹835.71 - ₹544.73 - ₹28.08 = \mathbf{₹262.90}$|
+----+---------------------------------------+-------------------+--------------------+---------------------------------------------+
| 12 | **FINAL NET CASH RETAINED**           | **+₹232.02**      | **+₹232.02**       | $\mathbf{₹494.92 - ₹262.90 = +₹232.02}$     |
+===================================================================================================================================+
```

---

## 4. Reconciliation of P&L Contribution vs. Actual Cash Retained

### 4.1 P&L Contribution Statement (Ind AS 115 & Ind AS 2)
Under accrual accounting principles:
$$\text{Net Taxable Revenue} = \frac{₹7,800.00}{1.12} = \mathbf{₹6,964.29}$$
$$\text{Less: Direct Net COGS} = -\mathbf{₹4,050.00}$$
$$\text{Less: Luxury Packaging Box} = -\mathbf{₹186.44}$$
$$\text{Less: Outbound Air Courier} = -\mathbf{₹139.83}$$
$$\text{Less: Payment Gateway Base MDR (2%)} = -\mathbf{₹156.00}$$
$$\text{Less: Promotional CAC} = -\mathbf{₹1,800.00}$$
$$\text{Less: Return & Repair Provision} = -\mathbf{₹150.00}$$
$$\text{Less: Concierge CX & Warehouse QC} = -\mathbf{₹250.00}$$
$$\mathbf{P\&L\ Net\ Contribution} = ₹6,964.29 - ₹6,732.27 = \mathbf{+₹232.02}$$

### 4.2 Cash Retained Reconciliation
$$\text{Final Cash Retained} = \text{Net Bank Settlement Received } (₹7,615.92) - \text{Gross Disbursements } (₹6,874.20) - \text{Net Tax Remittance } (₹509.70) = \mathbf{+₹232.02}$$

$$\mathbf{P\&L\ Contribution\ (+₹232.02) \equiv Final\ Cash\ Retained\ (+₹232.02)}$$

### 4.3 Timing Differences Across the Lifecycle
While the net economic result is identical, the cash flows occur across three distinct temporal phases:
1. **Phase A (T-60 to T-15 Days — Pre-Production):** Advance cash is disbursed to suppliers for fabrics and manufacturing (₹4,289.20 gross in CMT or ₹4,536.00 in FOB). Cash is negative during this working capital cycle.
2. **Phase B (Day T to T+1 — Sale & Settlement):** Customer pays ₹7,800.00; payment gateway settles ₹7,615.92 into bank account within 24–48 hours. Cash turns positive (+₹741.72 pre-tax in CMT; +₹494.92 in FOB).
3. **Phase C (T+20 to T+50 Days — Tax Remittance):** On the 20th day of the month following the sale, GSTR-3B is filed. Net GST (₹509.70 in CMT or ₹262.90 in FOB) is electronically remitted to the GST portal via net banking. Final retained cash settles at **+₹232.02**.

---

## 5. Supersession & Authoritative Reference Register

| Item / Claim | Superseded Value | Corrected Authoritative Value | Reason for Correction |
| :--- | :--- | :--- | :--- |
| **Gross Variable Disbursements** | ₹7,171.80 | **₹6,874.20 (CMT) / ₹7,121.00 (FOB)** | Eliminated accidental double-counting of ₹297.60 supplier ITC in narrative summary. |
| **Cash Flow Equation** | Reconciled at -₹65.58 | **Reconciled at +₹232.02** | Corrected gross disbursements resolves equation to exact positive match. |
| **P&L to Cash Difference** | Claimed discrepancy | **₹0.00 Difference (Identical +₹232.02)** | Proved complete mathematical equivalence under Ind AS 2. |
