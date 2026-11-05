# ATEEVRA Phase M2-14 — OD-01 GST Invoicing, Tax Workflows & Ledger Flows
## Statutory Invoice Architecture, Credit Note Reversals, SAC Classification Audit & CA Validation Gates

**Document ID:** `TAX-M2-14-OD-01-GST-INVOICING`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-01 (Pricing & Marketplace Commercial Model)  
**Parent Policies:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)  
**Statutory Authorities:** Central Goods and Services Tax (CGST) Act, 2017 & Integrated Goods and Services Tax (IGST) Act, 2017  
**Governance Status:** `STRICTLY DOCUMENTATION & TAX AUDIT ONLY — ZERO IMPLEMENTATION`  
**Decision Status:** `OD-01 UNAPPROVED — PROVISIONAL DIRECTION FOR OWNER EVALUATION ONLY`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Statutory Framework

In the confirmed **Seller-of-Record Marketplace Model**, ATEEVRA operates as an Electronic Commerce Operator (ECO) under Section 2(45) of the CGST Act, 2017. ATEEVRA does not purchase or resell merchant goods, does not hold product title, and does not act as a consignee.

Consequently, marketplace transactions involve two distinct, legally decoupled commercial relationships:
1. **The Merchant-to-Customer Sale:** The merchant sells goods directly to the customer, issuing a B2C retail tax invoice and recognizing gross product turnover.
2. **The ATEEVRA-to-Merchant Facilitation Service:** ATEEVRA provides digital marketplace technology, catalog hosting, payment aggregation enablement, and order orchestration, issuing a B2B service tax invoice to the merchant for the agreed platform facilitation fee.

This document details:
- The five statutory invoicing and credit note workflows governing order placement, fulfillment, cancellation, and returns.
- An exhaustive investigation into the Service Accounting Code (SAC) discrepancies (SAC 998371 vs. SAC 998314) identified in earlier documentation.
- The precise tax interpretations, reporting schedules, and statutory validation gates requiring formal written sign-off from qualified Indian Chartered Accountants prior to Phase M2-14 production rollout.

---

## 2. The Five Statutory Invoicing & Credit Note Flows

```
                   ORDER LIFECYCLE TAX INVOICING & CREDIT NOTE TOPOLOGY
                   
       [1. Merchant B2C Product Invoice] ───────────────► Customer (Retail Buyer)
            (₹847.46 base + ₹152.54 GST = ₹1,000)               │
                                                                ▼
       [2. ATEEVRA B2B Platform Fee Invoice] ──────────► [Customer Return Initiated]
            (₹100.00 base + ₹18.00 GST = ₹118)                  │
                                                                ▼
       [3. GST TCS Section 52 Withholding] ─────────────► [5. Merchant Product Credit Note]
            (0.5% net taxable = ₹4.24 to CBIC GSTR-8)           (Reverses ₹1,000 + ₹152.54 GST)
                                                                │
                                                                ▼
                                                         [4. ATEEVRA Fee Credit Note]
                                                          (Reverses ₹100 + ₹18 GST via GSTR-1)
```

---

### Flow 1: Merchant B2C Product Tax Invoice
- **Issuer:** Registered Merchant (Seller of Record).
- **Recipient:** Retail Customer (B2C Buyer).
- **Legal Authority:** Section 31(1) of the CGST Act, 2017 read with Rule 46 of the CGST Rules, 2017.
- **Invoice Contents:**
  - Merchant's Legal Name, Registered Trade Name, and GSTIN.
  - Consecutive invoice serial number unique for the financial year.
  - HSN (Harmonized System of Nomenclature) code for the apparel/lifestyle goods.
  - Taxable value of the product (e.g. **₹847.46** for an 18% GST apparel item).
  - Rate of GST (CGST 9% + SGST 9% for intra-state, or IGST 18% for inter-state = **₹152.54**).
  - Total customer retail selling price: **₹1,000.00**.
  - Customer shipping charge line item (if customer-paid, e.g. ₹70.00 inclusive of logistics GST).
- **Tax Liability:** The merchant alone is legally liable to report this transaction in its monthly **Form GSTR-1** and discharge the **₹152.54** output tax liability through **Form GSTR-3B**. ATEEVRA has zero liability for the product tax.

---

### Flow 2: ATEEVRA B2B Platform Facilitation Fee Invoice
- **Issuer:** ATEEVRA Technologies Private Limited (Electronic Commerce Operator).
- **Recipient:** Registered Merchant.
- **Legal Authority:** Section 31(2) of the CGST Act, 2017 read with Rule 47 of the CGST Rules, 2017.
- **Invoice Timing:** Generated automatically at the time of order confirmation or upon delivery milestone completion.
- **Invoice Contents:**
  - ATEEVRA's Legal Entity Name, Corporate Address, and 15-digit GSTIN.
  - Merchant's Legal Business Name, Trade Name, and GSTIN.
  - Service Accounting Code (SAC): Standard e-commerce support classification (formally pending CA sign-off).
  - Taxable facilitation fee base value: **₹100.00** (under provisional 10% fee model).
  - Applicable GST at 18.00%: **₹18.00** (CGST ₹9.00 + SGST ₹9.00 or IGST ₹18.00).
  - Total B2B invoice value: **₹118.00**.
- **Tax Liability & Input Tax Credit (ITC):**
  - ATEEVRA reports this invoice in its **Form GSTR-1** and remits the ₹18.00 to the Central/State Governments via **Form GSTR-3B**.
  - The ₹18.00 auto-populates in the merchant's **Form GSTR-2B**. If the merchant is a regular GST taxpayer, it claims the ₹18.00 as an **Input Tax Credit (ITC)** against its ₹152.54 product output tax liability.

---

### Flow 3: Statutory GST Tax Collected at Source (Section 52 TCS)
- **Collector:** ATEEVRA (Electronic Commerce Operator).
- **Reporting Obligation:** Section 52 of the CGST Act, 2017 read with Rule 67 of the CGST Rules, 2017.
- **Verified Statutory Rate:** **0.50% total** (0.25% CGST + 0.25% SGST or 0.50% IGST), pursuant to **CBIC Notification No. 15/2024–Central Tax, effective 10 July 2024** (superseding the historical 1.0% rate).
- **Calculation Base:** Calculated strictly on the **net taxable value** of supplies (excluding taxes and net of returns):
  $$\text{Net Taxable Supply Base} = \mathbf{₹847.46}$$
  $$\text{TCS Withheld} = 0.50\% \times ₹847.46 = \mathbf{₹4.24}$$
- **Remittance & Matching Workflow:**
  - ATEEVRA remits the ₹4.24 to the Government on or before the **10th of the following month** by filing **Form GSTR-8**.
  - Upon filing, the ₹4.24 automatically credits to the merchant's **Electronic Cash Ledger** on the GST Portal.
  - The merchant can utilize this ₹4.24 cash credit to pay any future tax liabilities or claim a cash refund.

---

### Flow 4: ATEEVRA Platform Fee Tax Credit Note (Order Cancellation / Return)
- **Issuer:** ATEEVRA Technologies Private Limited.
- **Recipient:** Registered Merchant.
- **Legal Authority:** Section 34(1) of the CGST Act, 2017.
- **Trigger Event:** Customer initiates an authorized return or pre-dispatch cancellation where ATEEVRA waives its platform facilitation fee.
- **Credit Note Contents:**
  - Original platform fee invoice number and date.
  - Reversal of taxable platform facilitation fee: **-₹100.00**.
  - Reversal of output GST (18%): **-₹18.00**.
  - Total credit note value: **-₹118.00**.
- **Accounting & Tax Impact:**
  - ATEEVRA reports the credit note in **Table 9B of Form GSTR-1**, reducing its output tax liability by ₹18.00.
  - The merchant's available ITC in **GSTR-2B** is reduced by ₹18.00, ensuring complete tax symmetry without revenue leakage.

---

### Flow 5: Merchant Product Tax Credit Note (Customer Return)
- **Issuer:** Registered Merchant.
- **Recipient:** Retail Customer.
- **Legal Authority:** Section 34(1) of the CGST Act, 2017.
- **Trigger Event:** Order return verified and approved; customer refund processed.
- **Credit Note Contents:**
  - Original B2C product invoice number and date.
  - Reversal of taxable product value: **-₹847.46**.
  - Reversal of product output GST (18%): **-₹152.54**.
  - Total refund value: **-₹1,000.00** (or -₹1,070.00 if customer shipping is refunded).
- **Accounting & Tax Impact:**
  - The merchant reports the credit note in **Table 9B of Form GSTR-1**, reducing its product output tax liability by ₹152.54.
  - In ATEEVRA's monthly **Form GSTR-8**, the returned taxable value (-₹847.46) offsets against gross sales, reducing net Section 52 TCS obligations.

---

## 3. Exhaustive SAC Discrepancy Investigation (998371 vs. 998314)

Earlier documentation within the repository exhibited conflicting references regarding the Service Accounting Code (SAC) governing ATEEVRA's platform facilitation fee invoices:
- `M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md` cited **SAC 998371**.
- `M2-14-OD-01-MARKETPLACE-UNIT-ECONOMICS-STRESS-TEST.md` cited **SAC 998314**.

An independent audit of the official CBIC Scheme of Classification of Services (Annexure to Notification No. 11/2017-Central Tax (Rate)) reveals that **BOTH codes are technically defective for marketplace facilitation commissions**:

```
+-----------------------------------------------------------------------------------------------------------------------+
| STATUTORY AUDIT EVALUATION OF SAC CLASSIFICATIONS UNDER CBIC GST TARIFF SCHEDULES                                     |
+-----------------------------------------------------------------------------------------------------------------------+
| SAC Code | Official CBIC Statutory Title           | Covered Services Scope               | Audit Compliance Verdict  |
+----------+-----------------------------------------+--------------------------------------+---------------------------+
| **998371**| Market research and public opinion      | Consumer surveys, brand tracking,    | **FACTUALLY ERRONEOUS**   |
|          | polling services                        | statistical opinion polls.           | Not an analytics firm.    |
+----------+-----------------------------------------+--------------------------------------+---------------------------+
| **998314**| Information technology (IT) design and  | Bespoke computer programming, mobile | **FACTUALLY ERRONEOUS**   |
|          | development services                    | app coding, custom software building.| Not contract programming. |
+----------+-----------------------------------------+--------------------------------------+---------------------------+
| **998599**| Other support services n.e.c.           | Business facilitation, listing infra,| **STANDARD INDUSTRY CODE**|
| (Cand. 1)| (Heading 9985 - Support Services)       | payment enablement, aggregator ops.  | Widely used by marketplaces|
+----------+-----------------------------------------+--------------------------------------+---------------------------+
| **996111**| Services provided for a fee/commission  | Wholesale trade commission agency,   | **CONDITIONALLY APPLIES** |
| (Cand. 2)| on wholesale trade (Heading 9961)       | brokerage, commodity intermediation. | Only if wholesale model.  |
+-----------------------------------------------------------------------------------------------------------------------+
```

### 3.1. Formal Governance Determination on SAC Selection
In strict compliance with governance rules:
- Antigravity does **NOT** unilaterally select, adopt, or hardcode any SAC code into production schemas.
- The repository documentation formally marks the SAC classification as:
  $$\mathbf{\text{PENDING CHARTERED ACCOUNTANT (CA) WRITTEN VALIDATION}}$$
- **Operational Reality:** Whether statutory auditors select SAC 998599 or Heading 9961, the applicable GST rate is uniformly **18.00%**, ensuring that financial models, margin projections, and cash flow forecasts remain 100% stable.

---

## 4. Statutory Reporting & Return Filing Calendar

To maintain zero-penalty statutory compliance, ATEEVRA Finance Operations must adhere to the following monthly statutory return filing lifecycle:

```
========================================================================================================================
MONTHLY STATUTORY TAX COMPLIANCE TIMELINE (FOR TRANSACTIONS IN MONTH M)
========================================================================================================================
Calendar Due Date | Statutory Return Form | Governing Section & Authority | Filing Contents & Cash Outflow
------------------+-----------------------+-------------------------------+---------------------------------------------
10th of Month M+1 | **Form GSTR-8**       | Section 52(4) CGST Act (CBIC) | Monthly electronic statement of gross sales,
                  |                       |                               | returns, and 0.50% TCS withheld.
                  |                       |                               | *Cash Outflow:* Full remittance of TCS pool.
------------------+-----------------------+-------------------------------+---------------------------------------------
11th of Month M+1 | **Form GSTR-1**       | Section 37(1) CGST Act (CBIC) | Statement of outward supplies: Details of all
                  |                       |                               | B2B platform fee invoices and credit notes.
                  |                       |                               | *Cash Outflow:* Zero (Reporting only).
------------------+-----------------------+-------------------------------+---------------------------------------------
20th of Month M+1 | **Form GSTR-3B**      | Section 39(1) CGST Act (CBIC) | Monthly summary return.
                  |                       |                               | *Cash Outflow:* 18% Output GST collected on
                  |                       |                               | platform fees less eligible ITC.
------------------+-----------------------+-------------------------------+---------------------------------------------
7th of Next Month | **Form 26Q** (Challan)| Section 194-O Income Tax Act  | Payment of monthly 0.10% IT TDS withholding
(Quarterly Return)| (Quarterly Form 26Q)  | (Income Tax Department)       | via Challan ITNS 281. Form 26Q filed by 31st
                  |                       |                               | of month following quarter end.
========================================================================================================================
```

---

## 5. Professional Validation Gates Required Prior to Implementation

Before any Medusa invoicing module, automated invoice generator, or settlement cron job is coded, the following formal validation gates must be signed off:

```
+-------------------------------------------------------------------------------------------------------------------+
| PRE-IMPLEMENTATION STATUTORY VALIDATION GATES                                                                     |
+-------------------------------------------------------------------------------------------------------------------+
| Validation Gate Identifier | Statutory Subject Matter                   | Required Professional Sign-Off          |
+----------------------------+--------------------------------------------+-----------------------------------------+
| **GATE-TAX-01**            | Final SAC Code Classification (998599 vs.  | Written legal/tax opinion from qualified|
|                            | alternative Heading) for platform fees.    | Indian Chartered Accountant (FCA).      |
+----------------------------+--------------------------------------------+-----------------------------------------+
| **GATE-TAX-02**            | Verification of Section 52 TCS compliance  | Tax audit review of Medusa automated    |
|                            | logic (netting of returns and discounts).  | GSTR-8 JSON export payload schema.      |
+----------------------------+--------------------------------------------+-----------------------------------------+
| **GATE-TAX-03**            | Section 194-O TDS threshold monitoring     | Direct tax advisor written approval on  |
|                            | (₹5,00,000 PAN threshold for Individuals). | TDS certificate (Form 16A) automation.  |
+----------------------------+--------------------------------------------+-----------------------------------------+
| **GATE-LEGAL-01**          | Merchant Master Services Agreement (MSA)   | Legal counsel review of contractual     |
|                            | B2B invoicing and set-off clauses.         | mutual set-off under Contract Act, 1872.|
+----------------------------+--------------------------------------------+-----------------------------------------+
| **GATE-LEGAL-02**          | Consumer Protection Rule 5(3)(b) price     | Legal sign-off confirming marketplace   |
|                            | manipulation safeguards.                   | facilitation status without FDI breach. |
+----------------------------+--------------------------------------------+-----------------------------------------+
```

---

## 6. Governance Conclusion

1. **Invoicing Architecture Verified:** The five-flow topology cleanly separates the merchant's B2C product invoice from ATEEVRA's B2B platform fee invoice.
2. **SAC Code Marked for Validation:** Both SAC 998371 and SAC 998314 are cataloged as erroneous; the final code is marked **PENDING CA VALIDATION** with zero silent selection.
3. **Statutory Gating Maintained:** All tax workflows remain advisory documentation only. Zero database schemas or invoice generators have been implemented.
