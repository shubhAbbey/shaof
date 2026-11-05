# ATEEVRA Phase M2-14 — OD-01 Payment Gateway MDR & GST Reconciliation
## Comparative Analysis of Inclusive vs. Exclusive MDR, Tax Invoicing, ITC Eligibility & Cash-Flow Impact

**Document ID:** `MDR-M2-14-OD-01-TAX-RECONCILIATION`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-01 (Marketplace Platform Commercial Model)  
**Parent Policies:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) & [`POL-OD-02-03`](policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md)  
**Statutory Framework:** Central Goods and Services Tax (CGST) Act, 2017 & Payment Aggregator Contractual Guidelines  
**Governance Status:** `STRICTLY DOCUMENTATION & FINANCIAL AUDIT ONLY — ZERO IMPLEMENTATION`  
**Decision Status:** `OD-01 UNAPPROVED — PROVISIONAL DIRECTION FOR OWNER EVALUATION ONLY`  
**Commercial Parameter Status:** `GATEWAY MDR ALLOCATION & GST RECOVERY MODEL UNDECIDED`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Audit Mandate

In digital commerce payment processing in India, Payment Gateways (PGs) and Payment Aggregators (PAs) such as Razorpay, Cashfree, and PayU charge a Merchant Discount Rate (MDR) for acquiring electronic payments (UPI, Credit Cards, Debit Cards, NetBanking, Wallets).

Earlier financial drafts within the repository exhibited ambiguity regarding whether the modeled **2.00% MDR** was:
1. **Inclusive of 18% GST:** A gross blended deduction of exactly 2.00% from customer collections, or
2. **Exclusive of 18% GST:** A base fee of 2.00% plus an additional 18% GST (total gross debit of 2.36%).

This document provides a first-principles reconciliation of both commercial options, traces their tax invoicing and Input Tax Credit (ITC) treatment under Section 16 of the CGST Act, 2017, calculates their exact P&L accounting expense and liquid cash-flow impacts, and models scenarios across both product-only collections (₹1,000.00) and shipping-inclusive collections (₹1,070.00).

---

## 2. Definitional Comparison: Inclusive vs. Exclusive MDR

The table below contrasts the commercial and statutory mechanics of 2.00% MDR under GST-inclusive versus GST-exclusive pricing on a **₹1,070.00 customer payment** (₹1,000 product + ₹70 customer-paid shipping):

```
+-----------------------------------------------------------------------------------------------------------------------+
| COMPARATIVE MDR PRICING SCHEDULE (ON ₹1,070.00 GROSS CUSTOMER PAYMENT)                                                |
+-----------------------------------------------------------------------------------------------------------------------+
| Financial Component                     | Option A: 2.00% Inclusive of GST    | Option B: 2.00% Exclusive of GST     |
+-----------------------------------------+-------------------------------------+---------------------------------------+
| Contractual Pricing Terms               | "2.00% all-inclusive blended rate"  | "2.00% base MDR + 18% GST applicable" |
| Total Gateway Cash Debited from Escrow  | **-₹21.40** (Exact 2.0% of ₹1,070)   | **-₹25.25** (Exact 2.36% of ₹1,070)   |
| Base Gateway Service Fee (Excl. Tax)    | **-₹18.14** (₹21.40 / 1.18)         | **-₹21.40** (2.0% of ₹1,070)          |
| 18% GST Charged by Payment Gateway      | **-₹3.26** (18% on ₹18.14)          | **-₹3.85** (18% on ₹21.40)            |
| SAC Classification on Gateway Invoice   | SAC 997159 (Payment processing svcs)| SAC 997159 (Payment processing svcs)  |
+-----------------------------------------+-------------------------------------+---------------------------------------+
| Sub-Case 1: Full ITC Recovered by ATEEVRA                                                                             |
| - Liquid Banking Cash Outflow           | -₹21.40                             | -₹25.25                               |
| - Net P&L Operating Accounting Expense  | **-₹18.14** (Base MDR only)         | **-₹21.40** (Base MDR only)           |
| - GST Recovered as Tax Offset (GSTR-3B) | +₹3.26                              | +₹3.85                                |
+-----------------------------------------+-------------------------------------+---------------------------------------+
| Sub-Case 2: Zero ITC Recovered (Blocked / Ineligible)                                                                 |
| - Liquid Banking Cash Outflow           | -₹21.40                             | -₹25.25                               |
| - Net P&L Operating Accounting Expense  | **-₹21.40** (Full cash outlay)      | **-₹25.25** (Full cash outlay)        |
| - GST Recovered as Tax Offset           | ₹0.00                               | ₹0.00                                 |
+-----------------------------------------------------------------------------------------------------------------------+
```

---

## 3. Four Full-Lifecycle Transaction Scenarios

To eliminate silent commercial assumptions, the financial model evaluates four explicit scenarios reflecting different combinations of cart values, MDR structures, and tax recovery eligibility:

### Scenario 1: Option A (Inclusive MDR) on Product-Only GMV (₹1,000.00)
- **Applicability:** Used when forward shipping is free (Platform Absorbs Model C or Conditional Model D above threshold).
- **Customer Paid:** ₹1,000.00.
- **Total Gateway Cash Debit:** $₹1,000.00 \times 2.0\% = \mathbf{₹20.00}$.
- **Base MDR (Accounting Cost if ITC claimed):** $₹20.00 / 1.18 = \mathbf{₹16.95}$.
- **Gateway GST (18%):** $₹20.00 - ₹16.95 = \mathbf{₹3.05}$.
- **Net Operating Expense:** ₹16.95 (with eligible ITC) or ₹20.00 (without ITC).

### Scenario 2: Option A (Inclusive MDR) on Cart + Shipping (₹1,070.00)
- **Applicability:** Used under Shipping Model A (Customer pays ₹70.00 forward shipping).
- **Customer Paid:** ₹1,070.00.
- **Total Gateway Cash Debit:** $₹1,070.00 \times 2.0\% = \mathbf{₹21.40}$.
- **Base MDR (Accounting Cost if ITC claimed):** $₹21.40 / 1.18 = \mathbf{₹18.14}$.
- **Gateway GST (18%):** $₹21.40 - ₹18.14 = \mathbf{₹3.26}$.
- **Net Operating Expense:** ₹18.14 (with eligible ITC) or ₹21.40 (without ITC).

### Scenario 3: Option B (Exclusive MDR) on Product-Only GMV (₹1,000.00)
- **Applicability:** Standard commercial card tariff where GST is surcharged separately.
- **Customer Paid:** ₹1,000.00.
- **Base MDR:** $₹1,000.00 \times 2.0\% = \mathbf{₹20.00}$.
- **Gateway GST (18%):** $₹20.00 \times 18\% = \mathbf{₹3.60}$.
- **Total Gateway Cash Debit:** $₹20.00 + ₹3.60 = \mathbf{₹23.60}$.
- **Net Operating Expense:** ₹20.00 (with eligible ITC) or ₹23.60 (without ITC).

### Scenario 4: Option B (Exclusive MDR) on Cart + Shipping (₹1,070.00)
- **Applicability:** Standard commercial card tariff on full customer checkout collection.
- **Customer Paid:** ₹1,070.00.
- **Base MDR:** $₹1,070.00 \times 2.0\% = \mathbf{₹21.40}$.
- **Gateway GST (18%):** $₹21.40 \times 18\% = \mathbf{₹3.85}$.
- **Total Gateway Cash Debit:** $₹21.40 + ₹3.85 = \mathbf{₹25.25}$.
- **Net Operating Expense:** ₹21.40 (with eligible ITC) or ₹25.25 (without ITC).

---

## 4. Statutory Invoicing, Reporting & ITC Eligibility Under Section 16

ATEEVRA cannot treat the GST charged by payment gateways as an automatic cash saving without satisfying the strict statutory requirements of the CGST Act, 2017:

```
[Gateway Issues B2B Invoice] ──► [GSTR-1 Filed by PG] ──► [Auto-Populates in GSTR-2B] ──► [Sec 16 Validation] ──► [GSTR-3B Offset]
    - Must show ATEEVRA GSTIN        - Due on 11th of month      - GSTR-2B available on 14th    - 4 statutory tests     - Offsets Output Tax
    - SAC Code 997159                - Matching tax paid         - Rule 36(4) compliance        - Payment made to PG    - Reduces Cash Tax
```

### 4.1. The Four Statutory Conditions under Section 16(2)
To legally claim Input Tax Credit on payment gateway GST invoices:
1. **Possession of Tax Invoice:** ATEEVRA must possess a valid GST tax invoice issued by the payment aggregator showing ATEEVRA's corporate GSTIN, legal address, and invoice serial number.
2. **Receipt of Service:** ATEEVRA has received the digital transaction processing service.
3. **Tax Deposited by Supplier:** The payment aggregator must have actually remitted the tax to the Government and reported the transaction in its **Form GSTR-1**.
4. **Filing of Return:** ATEEVRA must file its monthly summary return in **Form GSTR-3B** within statutory due dates.

### 4.2. Exceptions and Situations Where ITC Cannot Be Claimed
- **Rule 36(4) Mismatch:** If the payment aggregator fails to upload the invoice in its GSTR-1, the tax credit does not appear in ATEEVRA's auto-generated **Form GSTR-2B**, legally preventing ATEEVRA from claiming ITC for that month.
- **Section 17(5) Blocked Credits:** If ATEEVRA offers any exempt supplies or if statutory auditors classify the expense under blocked credit categories.
- **Delayed Supplier Payment Rule (Section 16(2) Second Proviso):** Under payment aggregator contracts, MDR is deducted instantly at source ($T+0$); therefore, the 180-day supplier payment rule is inherently satisfied.

---

## 5. Cash-Flow Impact vs. P&L Operating Expense Reconciliation

An essential financial distinction is that **the cash-flow impact is always immediate, whereas ITC recovery is deferred**:
- **Day $T+0$ (Cash Debit):** The payment gateway debits the full gross amount (**-₹21.40 or -₹25.25**) immediately upon transaction capture. Zero cash is retained in escrow.
- **Day $M+20$ (Tax Offset):** ATEEVRA recovers the GST portion (**+₹3.26 or +₹3.85**) on the 20th of the following month when it files Form GSTR-3B, using the credit to reduce cash tax remittances on platform facilitation fees.
- **Timing Drag:** The platform experiences an intra-month working capital cash drag equal to the gateway GST amount for 20 to 50 days.

---

## 6. Audit Conclusion & Governance Invariants

1. **Both Commercial Options Fully Modeled:** Financial schedules now explicitly present both 2% inclusive (Option A) and 2% exclusive (Option B) figures, eliminating hidden assumptions.
2. **Tax Decoupling Verified:** Gateway MDR is confirmed as an operating expense of ATEEVRA funded out of platform facilitation fee revenue, not debited to merchants.
3. **Governance Invariant:** OD-01 remains unapproved; gateway pricing terms remain undecided pending commercial contracting with payment aggregators; zero code or schema changes have occurred.
