# ATEEVRA Phase M2-14 — OD-01 Merchant Settlement & Platform Fee Reconciliation
## Exhaustive Double-Entry Accounting, Statutory Deductions, and Netting Mechanism Analysis

**Document ID:** `SET-M2-14-OD-01-MERCHANT-RECONCILIATION`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-01 (Pricing & Financial Model)  
**Parent Policies:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)  
**Cross-Reference Audit:** [`M2-14-OD-01-INDEPENDENT-FINANCIAL-RECONCILIATION-AUDIT.md`](M2-14-OD-01-INDEPENDENT-FINANCIAL-RECONCILIATION-AUDIT.md)  
**Governance Status:** `STRICTLY DOCUMENTATION & AUDIT ONLY — ZERO IMPLEMENTATION`  
**OD-01 Decision Status:** `UNAPPROVED — PROVISIONAL DIRECTION FOR OWNER EVALUATION ONLY`  
**Commercial Parameter Status:** `PLATFORM FEE & FORWARD SHIPPING ALLOCATION EXPLICITLY UNDECIDED`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Audit Mandate

In the confirmed **Seller-of-Record Marketplace Model**, merchants sell goods directly to retail customers on ATEEVRA. When an order completes, ATEEVRA's payment gateway or 3PL logistics partner collects funds from the buyer. ATEEVRA then settles the proceeds to the merchant after applying valid contractual and statutory deductions.

The standard calculation for a delivered ₹1,000.00 product under a provisional 10% platform facilitation fee is:
$$\mathbf{₹1,000.00 \text{ (Gross Turnover)} - ₹100.00 \text{ (Base Fee)} - ₹18.00 \text{ (Fee GST)} - ₹4.24 \text{ (TCS)} - ₹1.00 \text{ (TDS)} = ₹876.76 \text{ (Net Payout)}}$$

This document performs an exhaustive, first-principles audit of this settlement formula to:
1. Reconcile all 11 constituent financial and statutory line items.
2. Formally determine whether the **₹18.00 platform-fee GST** is legally and commercially valid as part of the merchant's payment obligation via contractual set-off or improperly deducted from merchant product entitlement.
3. Establish the complete double-entry ledger schedules for both ATEEVRA's books and the Merchant's books.
4. Trace cash movements across Escrow/Nodal accounts, merchant bank accounts, gateway operators, and statutory government authorities.
5. Prove that statutory withholdings (TCS & TDS) are balance-sheet passthrough liabilities, entirely decoupled from platform operating P&L.

---

## 2. Reconciled Financial Constituents (Baseline ₹1,000 Order)

The table below reconciles all 11 financial components of the baseline delivered order under **Option C (10% Platform Fee = ₹100.00 base + ₹18.00 GST)** with **Shipping Model A (Customer pays ₹70 forward shipping; platform contracts 3PL)**:

```
+------------------------------------------------------------------------------------------------------------------------+
| MASTER 11-LINE RECONCILIATION SCHEDULE (DELIVERED ₹1,000 PRODUCT | MODEL A CUSTOMER-PAID SHIPPING)                      |
+------------------------------------------------------------------------------------------------------------------------+
| Line Item Description                    | Rupee Amount | Stakeholder Bearing Cost | Statutory / Commercial Basis      |
+------------------------------------------+--------------+--------------------------+-----------------------------------+
| 1. Merchant Gross Product Entitlement    |  +₹1,000.00  | Customer (Payer)         | Gross turnover recognized by seller|
|    - Net Taxable Product Base (SAC/HSN)  |   (₹847.46)  | Customer                 | 18% GST reverse-extracted base    |
|    - Product GST Output Liability (18%)  |   (₹152.54)  | Merchant Liability       | Remitted by merchant via GSTR-3B  |
| 2. Customer Forward Shipping Paid        |    +₹70.00   | Customer (Payer)         | 3PL forward logistics cost offset |
| 3. ATEEVRA Platform Fee (Excl. GST)      |   -₹100.00   | Merchant (B2B Expense)   | 10.0% facilitation fee (Revenue)  |
| 4. GST on ATEEVRA Facilitation Service   |    -₹18.00   | Merchant (Recoverable)   | 18% GST (SAC 998599 - Merchant ITC)|
| 5. Merchant Net Product GST Liability    |    ₹134.54   | Merchant Outflow to Govt | Product GST (₹152.54) - ITC (₹18) |
| 6. Statutory GST TCS (Section 52)        |     -₹4.24   | Merchant Asset / Credit  | 0.5% on ₹847.46 (CBIC Notif 15/24)|
| 7. Statutory Income Tax TDS (Sec 194-O)  |     -₹1.00   | Merchant Asset / Credit  | 0.1% on ₹1,000 (Finance Act 2024) |
| 8. Payment Gateway MDR (2% on ₹1,070)    |    -₹21.40   | ATEEVRA Platform Expense | Funded from platform revenue      |
| 9. Net Merchant Cash Settlement Payout   |   +₹876.76   | Cash to Merchant Bank    | Gross GMV less fee, GST, TCS, TDS |
| 10. Platform Fee Receivable Closed       |   +₹118.00   | Settled via Netting      | Base fee (₹100) + Output GST (₹18)|
| 11. Statutory Tax Liabilities to Remit   |    +₹23.24   | ATEEVRA Remits to Govt   | GST TCS (₹4.24)+TDS (₹1)+GST (₹18)|
+------------------------------------------------------------------------------------------------------------------------+
```

---

## 3. Legal and Accounting Analysis: The ₹18.00 Platform-Fee GST Deduction

The audit specifically investigated:
> *"Explain exactly why the current model calculates: ₹1,000 - ₹100 - ₹18 - ₹4.24 - ₹1 = ₹876.76. Determine whether the ₹18 platform-fee GST is properly collected as part of the merchant's payment obligation or improperly deducted from merchant product entitlement."*

### 3.1. Contract Law and Right of Mutual Set-Off
Under the Indian Contract Act, 1872 (Section 70) and established commercial jurisprudence:
1. **The Merchant's Claim against ATEEVRA:**  
   ATEEVRA acts as an Electronic Commerce Operator (ECO) and collection agent. When the customer pays ₹1,000.00 for the merchant's goods, ATEEVRA holds ₹1,000.00 in a fiduciary / escrow capacity. The merchant has an actionable claim against ATEEVRA for **₹1,000.00**.
2. **ATEEVRA's Claim against the Merchant:**  
   Under the commercial Merchant Master Services Agreement (MSA), ATEEVRA provides digital marketplace technology, catalog hosting, and transaction facilitation services. For these B2B services, ATEEVRA issues a valid GST tax invoice to the merchant:
   $$\text{Platform Service Value} = \mathbf{₹100.00}$$
   $$\text{Applicable GST at 18\%} = \mathbf{₹18.00}$$
   $$\text{Total Tax Invoice Payable by Merchant} = \mathbf{₹118.00}$$
   The merchant owes ATEEVRA **₹118.00** for services rendered.
3. **The Doctrine of Mutual Set-Off:**  
   Rather than executing two circular bank transfers (ATEEVRA transferring ₹1,000.00 to the merchant, followed by the merchant transferring ₹118.00 back to ATEEVRA), the parties execute a **contractual set-off**:
   $$\text{Net Entitlement} = ₹1,000.00 - ₹118.00 = \mathbf{₹882.00}$$

### 3.2. Statutory Deductions under Central Acts
From the remaining ₹882.00, ATEEVRA is statutorily mandated by the Central Government to withhold:
- **GST Section 52 TCS:** Deduct 0.5% of net taxable sales ($0.005 \times ₹847.46 = \mathbf{₹4.24}$) and remit to the CBIC via Form GSTR-8.
- **Income Tax Section 194-O TDS:** Deduct 0.1% of gross sales ($0.001 \times ₹1,000.00 = \mathbf{₹1.00}$) and remit to the Income Tax Department via Form 26Q.
$$\text{Net Payout Disbursed} = ₹882.00 - ₹4.24 - ₹1.00 = \mathbf{₹876.76}$$

### 3.3. Input Tax Credit (ITC) Neutralization for the Merchant
The ₹18.00 is **NOT** a financial penalty or an improper deduction from the merchant's product realization. In Indian GST practice:
1. The merchant charges the retail customer ₹152.54 in product GST, which the merchant owes to the Government on its monthly GSTR-3B return.
2. Because ATEEVRA issues a B2B tax invoice charging ₹18.00 GST, this ₹18.00 auto-populates in the merchant's **GSTR-2B** as eligible **Input Tax Credit (ITC)**.
3. When the merchant files GSTR-3B, it utilizes the ₹18.00 ITC to offset its product tax liability:
   $$\text{Cash Tax Payable by Merchant to Govt} = ₹152.54 \text{ (Output Tax)} - ₹18.00 \text{ (ITC from ATEEVRA)} = \mathbf{₹134.54}$$
4. **Conclusion:** The ₹18.00 deducted by ATEEVRA directly reduces the merchant's out-of-pocket tax payment to the Government by exactly ₹18.00! Therefore, the merchant experiences **zero net loss on the ₹18.00 GST component**.

```
Customer Pays Product GST (₹152.54) ──► Collected in Merchant's Turnover (₹1,000)
                                                 │
      ┌──────────────────────────────────────────┴──────────────────────────────────────────┐
      ▼                                                                                     ▼
ATEEVRA Invoices Platform Fee GST (₹18.00)                                   Merchant Pays Net Govt Tax (₹134.54)
(Deducted via Settlement Netting)                                            (₹152.54 Output - ₹18.00 ITC)
      │                                                                                     ▲
      └──────────────────────── Claimed as ITC in GSTR-3B ──────────────────────────────────┘
```

---

## 4. Complete Double-Entry Ledger Illustration

The schedules below trace the double-entry accounting entries generated across the transaction lifecycle for both ATEEVRA and the Merchant:

### 4.1. Double-Entry Schedule in ATEEVRA's Books

```
========================================================================================================================
ATEEVRA GENERAL LEDGER ENTRIES (ORDER PLACEMENT THROUGH DISBURSEMENT)
========================================================================================================================
Date / Step | Account Head & Description                                    | Debit (₹)    | Credit (₹)   | Impact
------------+---------------------------------------------------------------+--------------+--------------+-------------
Event 1:    | DR Payment Gateway Nodal Escrow Account (`ASSET_ESCROW`)       |     1,070.00 |              | Cash Inflow
Order Paid  |   CR Merchant Settlement Clearing Account (`LIAB_MERCH_PAY`)  |              |     1,000.00 | Seller Debt
            |   CR Shipping Clearing Account (`LIAB_SHIPPING_CLEARING`)     |              |        70.00 | Carrier Debt
            | *(Customer pays ₹1,000 product + ₹70 shipping)*               |              |              |
------------+---------------------------------------------------------------+--------------+--------------+-------------
Event 2:    | DR Gateway Processing Charges (`EXP_BANKING_MDR`)             |        21.40 |              | P&L Expense
MDR Billed  |   CR Payment Gateway Nodal Escrow Account (`ASSET_ESCROW`)    |              |        21.40 | Cash Retained
            | *(Gateway retains 2% MDR on gross collection of ₹1,070)*       |              |              |
------------+---------------------------------------------------------------+--------------+--------------+-------------
Event 3:    | DR 3PL Forward Freight Expense (`EXP_LOGISTICS_FWD`)          |        70.00 |              | P&L Expense
Shipping In |   CR Accounts Payable - Delhivery / Shiprocket (`LIAB_3PL_AP`)|              |        70.00 | 3PL Invoice
            | DR Shipping Clearing Account (`LIAB_SHIPPING_CLEARING`)       |        70.00 |              | Offset
            |   CR 3PL Forward Freight Expense (`EXP_LOGISTICS_FWD`)        |              |        70.00 | Net Zero
------------+---------------------------------------------------------------+--------------+--------------+-------------
Event 4:    | DR Merchant Settlement Clearing Account (`LIAB_MERCH_PAY`)   |       118.00 |              | Offset Debt
Platform Fee|   CR Platform Facilitation Fee Revenue (`REV_FEE_BASE`)       |              |       100.00 | P&L Income
Invoiced    |   CR Output GST Payable to Govt (`LIAB_GST_OUTPUT_18`)        |              |        18.00 | Govt Debt
            | *(B2B Invoice issued under SAC 998599 to Merchant)*           |              |              |
------------+---------------------------------------------------------------+--------------+--------------+-------------
Event 5:    | DR Merchant Settlement Clearing Account (`LIAB_MERCH_PAY`)   |         5.24 |              | Offset Debt
Statutory   |   CR GST TCS Payable under Sec 52 (`LIAB_TAX_TCS_GSTR8`)      |              |         4.24 | Govt Debt
Tax Withheld|   CR Income Tax TDS Payable under Sec 194-O (`LIAB_TAX_TDS_26Q`)|            |         1.00 | Govt Debt
------------+---------------------------------------------------------------+--------------+--------------+-------------
Event 6:    | DR Merchant Settlement Clearing Account (`LIAB_MERCH_PAY`)   |       876.76 |              | Clears Debt
Settlement  |   CR Payment Gateway Nodal Escrow Account (`ASSET_ESCROW`)    |              |       876.76 | Bank Outflow
Payout (T+7)| *(Net funds transferred to merchant bank account)*            |              |              |
------------+---------------------------------------------------------------+--------------+--------------+-------------
Event 7:    | DR Output GST Payable to Govt (`LIAB_GST_OUTPUT_18`)          |        18.00 |              | Clears Govt
Tax Payment | DR GST TCS Payable under Sec 52 (`LIAB_TAX_TCS_GSTR8`)        |         4.24 |              | Clears Govt
to Govt     | DR Income Tax TDS Payable under Sec 194-O (`LIAB_TAX_TDS_26Q`)|         1.00 |              | Clears Govt
            |   CR Operating Bank Account (`ASSET_BANK_CURRENT`)            |              |        23.24 | Bank Outflow
========================================================================================================================
```

### 4.2. Double-Entry Schedule in the Merchant's Books

```
========================================================================================================================
MERCHANT GENERAL LEDGER ENTRIES
========================================================================================================================
Account Head & Transaction Description                                      | Debit (₹)    | Credit (₹)   | Balance Type
----------------------------------------------------------------------------+--------------+--------------+-------------
DR ATEEVRA Marketplace Clearing Receivable (`ASSET_MKT_RECEIVABLE`)          |     1,000.00 |              | Asset
  CR Product Sales Revenue (`REV_SALES_TURNOVER`)                           |              |       847.46 | P&L Income
  CR Output Product GST Payable (`LIAB_GST_PRODUCT_18`)                     |              |       152.54 | Tax Debt
*(Merchant recognizes customer sale as seller of record)*                   |              |              |
----------------------------------------------------------------------------+--------------+--------------+-------------
DR Marketplace Commission Expense (`EXP_MKT_COMMISSION`)                    |       100.00 |              | P&L Expense
DR Input Tax Credit (ITC) Receivable on Commission (`ASSET_GST_ITC_18`)     |        18.00 |              | Tax Asset
  CR ATEEVRA Marketplace Clearing Receivable (`ASSET_MKT_RECEIVABLE`)       |              |       118.00 | Asset Offset
*(Merchant processes ATEEVRA's platform fee invoice)*                       |              |              |
----------------------------------------------------------------------------+--------------+--------------+-------------
DR GST TCS Credit Asset (`ASSET_GST_CASH_LEDGER`)                           |         4.24 |              | Tax Asset
DR Income Tax TDS Asset (`ASSET_INCOME_TAX_26AS`)                           |         1.00 |              | Tax Asset
  CR ATEEVRA Marketplace Clearing Receivable (`ASSET_MKT_RECEIVABLE`)       |              |         5.24 | Asset Offset
*(Merchant records tax certificates for withholdings)*                      |              |              |
----------------------------------------------------------------------------+--------------+--------------+-------------
DR Merchant Bank Current Account (`ASSET_BANK`)                             |       876.76 |              | Cash Inflow
  CR ATEEVRA Marketplace Clearing Receivable (`ASSET_MKT_RECEIVABLE`)       |              |       876.76 | Clears Asset
*(Merchant receives net settlement transfer)*                               |              |              |
----------------------------------------------------------------------------+--------------+--------------+-------------
DR Output Product GST Payable (`LIAB_GST_PRODUCT_18`)                       |       152.54 |              | Clears Tax
  CR Input Tax Credit (ITC) Receivable (`ASSET_GST_ITC_18`)                 |              |        18.00 | Offsets ITC
  CR GST TCS Credit Asset (`ASSET_GST_CASH_LEDGER`)                         |              |         4.24 | Offsets Cash
  CR Merchant Bank Current Account (`ASSET_BANK`)                           |              |       130.30 | Net Cash Out
*(Merchant files GSTR-3B, utilizing ITC and TCS to settle output tax)*      |              |              |
========================================================================================================================
```

---

## 5. End-to-End Cash Flow & Escrow Movement Schedules

The physical cash flow traces the movement of customer money through the banking rails:

```
+-------------------------------------------------------------------------------------------------------------------+
| PHYSICAL CASH MOVEMENT SCHEDULE (ALL AMOUNTS IN INR ₹)                                                            |
+-------------------------------------------------------------------------------------------------------------------+
| Stage & Cash Node                                      | Inflow (+)  | Outflow (-) | Cumulative Escrow / Bank Bal |
+--------------------------------------------------------+-------------+-------------+------------------------------+
| 1. Customer initiates payment via UPI / Card           | +₹1,070.00  |       ₹0.00 | +₹1,070.00 (Escrow)          |
| 2. Razorpay/Cashfree retains 2.0% MDR                  |       ₹0.00 |     -₹21.40 | +₹1,048.60 (Escrow)          |
| 3. Customer shipping allocated to 3PL carrier          |       ₹0.00 |     -₹70.00 |   +₹978.60 (Escrow)          |
| 4. Net settlement payout disbursed to Merchant Bank    |       ₹0.00 |    -₹876.76 |   +₹101.84 (Escrow)          |
| 5. ATEEVRA transfers earned revenue to Corporate Bank  |       ₹0.00 |    -₹101.84 |      ₹0.00 (Escrow Cleared)  |
|    - Of which: Platform Base Fee Revenue               |   (+₹78.60) |       ₹0.00 |    +₹78.60 (Corporate P&L)   |
|    - Of which: Output GST Collected for Govt           |   (+₹18.00) |       ₹0.00 |    +₹18.00 (Tax Clearing)    |
|    - Of which: GST TCS Withheld for Govt               |    (+₹4.24) |       ₹0.00 |     +₹4.24 (Tax Clearing)    |
|    - Of which: IT TDS Withheld for Govt                |    (+₹1.00) |       ₹0.00 |     +₹1.00 (Tax Clearing)    |
| 6. ATEEVRA remits statutory taxes to Tax Authorities:  |             |             |                              |
|    - Form GSTR-3B: Output GST on Platform Fee          |       ₹0.00 |     -₹18.00 |      ₹0.00 (Tax Clearing)    |
|    - Form GSTR-8: GST TCS to CBIC                      |       ₹0.00 |      -₹4.24 |      ₹0.00 (Tax Clearing)    |
|    - Form 26Q: Income Tax TDS to IT Department         |       ₹0.00 |      -₹1.00 |      ₹0.00 (Tax Clearing)    |
+--------------------------------------------------------+-------------+-------------+------------------------------+
| FINAL NET CASH RETAINED BY ATEEVRA                     |             |             |    +₹78.60 (Net Cash)        |
+-------------------------------------------------------------------------------------------------------------------+
```

---

## 6. Statutory Decoupling Proof: TCS and TDS are NOT Platform Expenses

A frequent error in amateur marketplace financial models is adding GST TCS (₹4.24) and IT TDS (₹1.00) to platform operating costs. The audit formally proves that this is accounting malpractice:
1. **Balance Sheet Neutrality:**  
   When ATEEVRA withholds ₹5.24 from the merchant, ATEEVRA records an identical current liability (`LIAB_TAX_TCS_GSTR8` and `LIAB_TAX_TDS_26Q`). When ATEEVRA pays ₹5.24 to the tax authorities on the 10th of the following month, the cash outflow extinguishes the current liability.
2. **Zero P&L Impact:**  
   $$\text{P&L Expense} = \text{Debit to Expense Account} = \mathbf{₹0.00}$$
   Neither TCS nor TDS ever touches an operating expense head in ATEEVRA's P&L.
3. **Audit Rule:**  
   $$\text{Platform Net Operating Contribution} = \text{Platform Base Fee (₹100)} - \text{Gateway MDR (₹21.40)} = \mathbf{+₹78.60}$$
   TCS and TDS have zero effect on platform contribution.

---

## 7. Governance Conclusion & Actionable Findings

1. **Settlement Formula Validated:** The calculation $₹1,000 - ₹100 - ₹18 - ₹4.24 - ₹1 = \mathbf{₹876.76}$ is mathematically and legally sound, fully supported by the doctrine of contractual set-off under the Indian Contract Act, 1872.
2. **GST Invoicing Integrity:** The ₹18.00 platform-fee GST is legally invoiced by ATEEVRA and fully recoverable by the merchant as Input Tax Credit (ITC), creating zero net tax leakage.
3. **P&L Decoupling Enforced:** Statutory withholdings are established as pure balance-sheet passthroughs.
4. **Governance Invariant Maintained:** OD-01 remains unapproved, platform fee and shipping structures remain undecided, and zero software code was modified.
