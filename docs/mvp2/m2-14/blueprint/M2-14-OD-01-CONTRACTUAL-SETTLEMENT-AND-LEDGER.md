# ATEEVRA Phase M2-14 — OD-01 Contractual Settlement, Legal Set-Off & Ledger Architecture
## Legal Reassessment of Set-Off Mechanics, Product GST Rate Sensitivity, Multi-Step ITC Lifecycle & Double-Entry Ledgers

**Document ID:** `SET-M2-14-OD-01-LEGAL-LEDGER`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-01 (Pricing & Marketplace Commercial Model)  
**Parent Policies:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)  
**Statutory Framework:** Indian Contract Act, 1872, Code of Civil Procedure, 1908, & Central Goods and Services Tax Act, 2017  
**Governance Status:** `STRICTLY DOCUMENTATION & AUDIT ONLY — ZERO IMPLEMENTATION`  
**Decision Status:** `OD-01 UNAPPROVED — PROVISIONAL DIRECTION FOR OWNER EVALUATION ONLY`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Legal Reassessment

In the confirmed **Seller-of-Record Marketplace Model**, ATEEVRA collects retail sales proceeds from customers on behalf of merchants and remits net settlement payouts after deducting agreed platform facilitation fees and mandatory statutory taxes.

This document executes four critical legal, tax, and accounting corrections:
1. **Reassessment of Legal Authority for Set-Off:** Formally corrects an erroneous citation in earlier documentation that attributed ATEEVRA's right of settlement netting to Section 70 of the Indian Contract Act, 1872. It establishes the true legal foundations of contractual netting under Indian contract law, procedural set-off, and equitable set-off.
2. **Decoupling Product GST from Universal 18%:** Demonstrates that fashion and lifestyle goods (apparel, textiles, footwear under Chapters 61, 62, and 64) span multiple GST tariff brackets (5%, 12%, and 18%), proves that Section 52 TCS changes across tax brackets, and models the exact variance in net merchant settlement payouts.
3. **Multi-Step Input Tax Credit (ITC) Lifecycle:** Rejects the unverified assumption that merchants automatically receive or utilize ITC on platform fee GST. It establishes a six-step verification lifecycle, explicitly identifying when merchants cannot claim or utilize credit.
4. **General Ledger Double-Entry Schedule:** Provides the full accounting journal entries for both ATEEVRA and the Merchant, clearly distinguishing cash movements from balance-sheet liabilities.

---

## 2. Legal Reassessment: The True Basis of Contractual Set-Off under Indian Law

Earlier documentation erroneously cited Section 70 of the Indian Contract Act, 1872 as the legal foundation for deducting platform facilitation fees and GST from merchant sales proceeds. The audit formally corrects this misattribution:

### 2.1. Why Section 70 Does NOT Establish Contractual Set-Off
Section 70 of the Indian Contract Act, 1872 governs the **obligation of a person enjoying the benefit of a non-gratuitous act**:
> *"Where a person lawfully does anything for another person, or delivers anything to him, not intending to do so gratuitously, and such other person enjoys the benefit thereof, the latter is bound to make compensation to the former in respect of, or to restore, the thing so done or delivered."*

- **Legal Analysis:** Section 70 is an equitable doctrine of **quasi-contract / restitution (quantum meruit)** designed to prevent unjust enrichment in the *absence* of an express, enforceable contract.
- **The Defect in Earlier Drafts:** ATEEVRA and its onboarded merchants operate under an **express, written commercial contract** (the Merchant Master Services Agreement). Citing Section 70 is legally defective because Section 70 only applies where no formal contract exists. Furthermore, Section 70 grants a right to *claim compensation*, not an automatic right of *unilateral debt netting or set-off*.

### 2.2. The True Legal Basis: Consensual Contractual Netting Mandate (Not Statutory Power)
Earlier documentation erroneously described statutory provisions (Sections 10 and 73 of the Indian Contract Act, 1872 and Order VIII Rule 6 of the CPC, 1908) as an established general legal authorization for routine marketplace settlement deductions. The audit clarifies the exact legal scope:

- **Order VIII Rule 6 CPC, 1908:** This is a *procedural litigation rule* governing a defendant's right to plead a legal set-off in a court lawsuit for an ascertained sum of money. It is an adversarial court pleading rule, NOT a self-executing statutory authorization for automated daily fintech deductions or bank escrow netting.
- **Section 73 of the Indian Contract Act, 1872:** This governs *compensation for loss or damage caused by breach of contract*. Marketplace fee deductions represent ordinary performance and remuneration under an ongoing agreement, not damages for contractual breach.
- **Section 10 of the Indian Contract Act, 1872:** This defines what agreements are contracts (lawful offer, acceptance, consideration). While it validates party autonomy, it does not provide an e-commerce-specific statutory netting code.

**The True Legal Mechanism:**
Under Indian law, ATEEVRA's authority to deduct its facilitation fee invoice (₹118.00) from customer product proceeds (₹1,000.00) rests upon an **Express Bilateral Contractual Netting Mandate** embedded within the Merchant Master Services Agreement (MSA), supported by agency principles under Chapter X of the Indian Contract Act, 1872, and the substantive doctrine of **Equitable Set-Off**:

1. **Express Bilateral Netting Mandate (Sections 10 & 182–186 Contract Act):**  
   The merchant explicitly appoints ATEEVRA as its technology facilitator and collection agent/mandatary, granting express, irrevocable contractual authorization to ATEEVRA and its nodal/escrow banking partner to deduct contracted facilitation fees (+ 18% GST), reverse logistics costs, and verified customer refunds directly from gross customer collections prior to disbursing the net settlement.
2. **Equitable Set-Off Doctrine:**  
   Indian courts (*Union of India v. Raman Iron Foundry*, AIR 1974 SC 1265; *Jitendra Kumar Khan v. Peerless General Finance*, (2013) 8 SCC 769) recognize equitable set-off where mutual claims arise out of the **same transaction or closely connected transactions**, making it inequitable to compel full payout without adjusting reciprocal cross-claims.

### 2.3. Legal and Regulatory Limitations of the Netting Mechanism
The contractual netting mechanism is subject to critical regulatory boundaries:
1. **RBI Payment Aggregator Guidelines (Circular DPSS.CO.PD.No.1810/02.14.008/2019-20 Clause 8.5):** All settlements must flow through a licensed PA nodal/escrow account. Netting must be executed via permissible escrow debit instructions (Clause 8.5(b) refunds, 8.5(c) commissions/fees, 8.5(a) merchant payouts). ATEEVRA cannot hold funds directly.
2. **Insolvency and Bankruptcy Code, 2016 (IBC Section 14):** In the event of merchant insolvency / CIRP, statutory moratoriums may restrict post-admission unilateral set-offs against corporate debtor receivables.
3. **Independent Tax Invoicing (CGST Act Section 31):** Netting settlement proceeds does NOT waive the legal mandate to issue an independent B2B tax invoice with SAC classification and 18% GST.
4. **Consumer Protection (E-Commerce) Rules, 2020:** Netting terms must be transparently disclosed without unfair unilateral modification clauses.

> [!IMPORTANT]
> **Mandatory Legal Counsel Sign-Off Requirement:**  
> The contractual netting mechanism must NOT be treated as legally established until qualified Indian corporate and fintech legal counsel drafts, reviews, and formally approves:
> 1. The explicit Net Settlement and Mandate Clause in the Merchant Master Services Agreement (MSA);
> 2. The tripartite Escrow / Settlement Agreement between ATEEVRA, the Payment Aggregator, and Merchant representatives;
> 3. The operational funds-flow architecture ensuring strict compliance with RBI PA Clause 8.5.

---

## 3. Product GST Rate Sensitivity: Decoupling from Universal 18%

In Indian e-commerce, lifestyle products do not uniformly fall under an 18% GST rate:
- **Apparel and Clothing (HSN 61 / 62):** Historically taxed at **5.0%** for items of value up to ₹1,000.00, and **12.0%** for items exceeding ₹1,000.00.
- **Footwear (HSN 64):** Taxed at **12.0%** (formerly 5.0% for value up to ₹1,000.00).
- **Fashion Accessories & Premium Leather (HSN 42):** Taxed at **18.0%**.

### 3.1. Impact on Net Taxable Base and Section 52 GST TCS
Under Section 52(1) of the CGST Act, 2017, Tax Collected at Source (TCS) is levied at **0.50%** on the **net taxable supply base**, not the gross customer selling price:
$$\text{Taxable Supply Base} = \frac{P_{\text{sell}}}{1 + \text{Product GST Rate}}$$
Because the taxable base varies with the product tax rate, the TCS withheld and the final merchant settlement payout vary across product categories:

```
+-----------------------------------------------------------------------------------------------------------------------+
| PRODUCT GST RATE SENSITIVITY GRID (BASELINE ₹1,000 PRODUCT RETAIL PRICE | 10% PLATFORM FEE)                           |
+-----------------------------------------------------------------------------------------------------------------------+
| Metric / Transaction Component          | 5% Product GST (Apparel) | 12% Product GST (Footwear)| 18% Product GST (Access.)|
+-----------------------------------------+--------------------------+---------------------------+--------------------------+
| Customer Shelf Selling Price ($P_{sell}$)|       +₹1,000.00         |        +₹1,000.00         |        +₹1,000.00        |
| Net Taxable Product Supply Base         |        **₹952.38**       |         **₹892.86**       |         **₹847.46**      |
| Product Output GST Charged to Customer  |          ₹47.62 (5%)     |          ₹107.14 (12%)    |          ₹152.54 (18%)   |
+-----------------------------------------+--------------------------+---------------------------+--------------------------+
| ATEEVRA Platform Facilitation Base Fee  |         -₹100.00         |          -₹100.00         |          -₹100.00        |
| Output GST on Facilitation Fee (18%)*   |          -₹18.00         |           -₹18.00         |           -₹18.00        |
| Gross B2B Fee Deducted from Merchant    |         -₹118.00         |          -₹118.00         |          -₹118.00        |
+-----------------------------------------+--------------------------+---------------------------+--------------------------+
| Statutory GST Section 52 TCS (0.50%)    |          **-₹4.76**      |           **-₹4.46**      |           **-₹4.24**     |
| Statutory Income Tax Sec 194-O TDS (0.1%)|         -₹1.00         |            -₹1.00         |            -₹1.00        |
+-----------------------------------------+--------------------------+---------------------------+--------------------------+
| NET MERCHANT SETTLEMENT PAYOUT          |        **₹876.24**       |         **₹876.54**       |         **₹876.76**      |
+-----------------------------------------------------------------------------------------------------------------------+
```
*\*Note: ATEEVRA's platform facilitation service remains standard at 18.00% under SAC 998599 (pending CA confirmation), regardless of the merchant's underlying product GST rate.*

> [!NOTE]
> **Audit Finding:**  
> The net merchant payout is **₹876.24** for 5% apparel, **₹876.54** for 12% footwear, and **₹876.76** for 18% accessories. The variance of up to 52 paise per order arises strictly from Section 52 TCS base calculations. Financial models must not assume a flat ₹876.76 across all catalog categories.

---

## 4. Multi-Step Input Tax Credit (ITC) Lifecycle & Failure Scenarios

Earlier documentation made the sweeping assumption that merchants always receive and utilize the ₹18.00 platform-fee GST as Input Tax Credit (ITC). The audit establishes that **ITC recovery is conditional and multi-staged**:

```
[Step 1: Invoice Issuance] ──► [Step 2: GSTR-1 Reporting] ──► [Step 3: GSTR-2B Auto-Population]
        │                                                                │
        ▼                                                                ▼
[Step 6: GSTR-3B Utilization] ◄── [Step 5: ITC Eligibility Review] ◄── [Step 4: Sec 16(2) Compliance]
```

### 4.1. Six Distinct Lifecycle Steps
1. **Step 1: Invoice Issuance:** ATEEVRA issues a valid B2B tax invoice containing the merchant's valid 15-digit GSTIN, serial number, and SAC code.
2. **Step 2: GSTR-1 Reporting:** ATEEVRA uploads the invoice to the GST Portal in its monthly **Form GSTR-1** on or before the 11th of the following month.
3. **Step 3: GSTR-2B Auto-Population:** On the 14th of the following month, the GST Portal auto-populates the tax data into the merchant's static **Form GSTR-2B**.
4. **Step 4: Statutory Compliance Test:** The merchant satisfies the four cumulative tests of Section 16(2) of the CGST Act, 2017.
5. **Step 5: Eligibility & Reversal Review:** The merchant confirms the credit is not restricted under Section 17(5) or subject to proportionate reversal under Rule 42.
6. **Step 6: GSTR-3B Utilization:** The merchant credits the ₹18.00 to its Electronic Credit Ledger and offsets it against its product output tax liability (e.g. ₹152.54).

### 4.2. Concrete Exceptions Where Merchants CANNOT Claim ITC
The assumption of automatic ITC fails under four real-world commercial circumstances:
1. **Unregistered E-Commerce Sellers (CBIC Notification No. 34/2023–Central Tax):**  
   Under recent GST amendments effective October 2023, micro-enterprises with turnover below ₹40 Lakhs (goods) may sell intra-state via e-commerce operators using an Enrolment Number without formal GST registration. An unregistered seller **cannot claim Input Tax Credit**. For these sellers, the ₹18.00 is a **pure sunk cost**, reducing their net realization from ₹876.76 to ₹858.76.
2. **Composition Scheme Dealers (Section 10 CGST Act):**  
   If eligible composition dealers participate in permitted categories, Section 10(4) explicitly bars them from claiming any ITC on inward supplies.
3. **Defaulting or Non-Filing Sellers:**  
   If the merchant has not filed its outward returns or its GSTIN is suspended/canceled, it cannot access the GST portal to claim ITC.
4. **Zero or Exempt Output Supplies:**  
   If a merchant sells exclusively nil-rated or exempt handcrafted textiles, Section 17(2) prohibits claiming ITC on input services used for exempt supplies.

---

## 5. Complete General Ledger Double-Entry Schedule

The double-entry accounting schedules trace both entities' books for a delivered order (Product: ₹1,000.00; Platform Fee: ₹100.00 + ₹18.00 GST; TCS: ₹4.24; TDS: ₹1.00; Net Payout: ₹876.76):

### 5.1. ATEEVRA General Ledger

```
========================================================================================================================
ATEEVRA FINANCIAL LEDGER JOURNAL ENTRIES
========================================================================================================================
Journal Reference & Transaction Description                                 | Debit (₹)    | Credit (₹)   | Ledger Classification
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 1: On Customer Payment Confirmation (UPI/Card Capture)                |              |              |
  DR Payment Gateway Nodal Escrow (`ASSET_ESCROW_NODAL`)                     |     1,070.00 |              | Current Asset
    CR Merchant Settlement Clearing Account (`LIAB_MERCH_CLEARING`)         |              |     1,000.00 | Current Liability
    CR Shipping Clearing Account (`LIAB_SHIPPING_CLEARING`)                 |              |        70.00 | Current Liability
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 2: On Payment Gateway MDR Debit                                       |              |              |
  DR Payment Gateway Processing Charges (`EXP_BANKING_MDR`)                 |        21.40 |              | P&L Operating Cost
    CR Payment Gateway Nodal Escrow (`ASSET_ESCROW_NODAL`)                  |              |        21.40 | Current Asset Outflow
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 3: On Platform Fee Invoicing to Merchant (SAC 998599 - B2B Invoice)   |              |              |
  DR Merchant Settlement Clearing Account (`LIAB_MERCH_CLEARING`)           |       118.00 |              | Liability Extinguished
    CR Platform Facilitation Fee Revenue (`REV_PLATFORM_FEE`)               |              |       100.00 | P&L Operating Income
    CR Output GST Payable to Government (`LIAB_TAX_GST_OUTPUT`)             |              |        18.00 | Current Liability (Govt)
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 4: On Statutory Withholdings (TCS & TDS Deduction)                    |              |              |
  DR Merchant Settlement Clearing Account (`LIAB_MERCH_CLEARING`)           |         5.24 |              | Liability Extinguished
    CR GST TCS Payable under Section 52 (`LIAB_TAX_TCS_GSTR8`)              |              |         4.24 | Current Liability (Govt)
    CR Income Tax TDS Payable under Section 194-O (`LIAB_TAX_TDS_26Q`)      |              |         1.00 | Current Liability (Govt)
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 5: On Settlement Payout Disbursement (Bank NEFT to Merchant Bank)     |              |              |
  DR Merchant Settlement Clearing Account (`LIAB_MERCH_CLEARING`)           |       876.76 |              | Liability Extinguished
    CR Payment Gateway Nodal Escrow (`ASSET_ESCROW_NODAL`)                  |              |       876.76 | Current Asset Outflow
========================================================================================================================
```

### 5.2. Merchant General Ledger

```
========================================================================================================================
MERCHANT FINANCIAL LEDGER JOURNAL ENTRIES
========================================================================================================================
Journal Reference & Transaction Description                                 | Debit (₹)    | Credit (₹)   | Ledger Classification
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 1: On Retail Customer Sale Recognition (Seller of Record)             |              |              |
  DR ATEEVRA Marketplace Clearing Receivable (`ASSET_MKT_RECEIVABLE`)       |     1,000.00 |              | Current Asset
    CR Product Sales Turnover (`REV_PRODUCT_SALES`)                         |              |       847.46 | P&L Operating Income
    CR Product Output GST Liability (`LIAB_TAX_PRODUCT_GST`)                |              |       152.54 | Current Liability (Govt)
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 2: On Processing ATEEVRA Platform Fee Invoice                         |              |              |
  DR Marketplace Facilitation Expense (`EXP_MKT_COMMISSION`)                |       100.00 |              | P&L Operating Expense
  DR Input Tax Credit (ITC) Asset on Service (`ASSET_TAX_GST_ITC`)          |        18.00 |              | Current Asset (ITC)
    CR ATEEVRA Marketplace Clearing Receivable (`ASSET_MKT_RECEIVABLE`)     |              |       118.00 | Current Asset Offset
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 3: On Recording Statutory Withholding Certificates                    |              |              |
  DR GST TCS Credit Asset (`ASSET_TAX_GST_CASH_LEDGER`)                     |         4.24 |              | Current Asset (Cash Ledg)
  DR Income Tax TDS Credit Asset (`ASSET_TAX_INCOME_26AS`)                  |         1.00 |              | Current Asset (Tax Recov)
    CR ATEEVRA Marketplace Clearing Receivable (`ASSET_MKT_RECEIVABLE`)     |              |         5.24 | Current Asset Offset
----------------------------------------------------------------------------+--------------+--------------+----------------------
Entry 4: On Receipt of Net Settlement Payout in Bank Account                |              |              |
  DR Merchant Bank Current Account (`ASSET_BANK_CURRENT`)                   |       876.76 |              | Current Asset Inflow
    CR ATEEVRA Marketplace Clearing Receivable (`ASSET_MKT_RECEIVABLE`)     |              |       876.76 | Asset Extinguished
========================================================================================================================
```

---

## 6. Audit Sign-Off Requirements

The following legal and tax validations must be completed prior to code implementation:
1. **Merchant Contract Counsel Sign-Off:** Written opinion confirming that the Merchant MSA's contractual set-off clause complies with Indian contract law and Civil Procedure Code doctrines.
2. **Tax Advisor Validation:** Written confirmation of HSN-specific product tax rate variations and their impact on automated Section 52 TCS withholding logic.
3. **CA Written Opinion on SAC Code:** Confirmation of SAC 998599 (or Heading 9961) for ATEEVRA platform service billing.

---

## 7. Governance Invariant Guarantee

- **OD-01 Status:** Strictly **UNAPPROVED**.
- **Commercial Selection:** Platform fee structure and forward shipping policy remain **UNDECIDED**.
- **OD-07 Status:** Settlement timelines remain **UNAPPROVED**.
- **Zero Software Implementation:** No code, schemas, or migrations were modified.
