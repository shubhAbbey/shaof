# ATEEVRA Phase M2-14 — OD-01 Marketplace Financial Scenario & Fee Revenue Model
## Unit Economics, Cash Flow Reconciliation & Contribution Analysis for Marketplace Fee Structures

**Document ID:** `MOD-M2-14-OD-01-FINANCIAL`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-01  
**Decision Title:** Marketplace Financial Scenario Modeling across Platform Fee Structures  
**Owner Business Model Direction:** Marketplace Facilitation Platform (Merchants as Sellers of Record)  
**Governance Status:** `DOCUMENTATION & FINANCIAL ANALYSIS ONLY — CONFIGURABLE PARAMETERS`  
**Audit Execution Mode:** STRICTLY READ-ONLY AUDIT & SCENARIO RECONCILIATION  
**Active Phase:** Phase M2-14 (Payments, Refunds, Returns and Exchanges)  
**Implementation Authorization Status:** `PLANNING ONLY — IMPLEMENTATION NOT AUTHORIZED`  
**Companion Documents:**
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-MARKETPLACE-UNIT-ECONOMICS-STRESS-TEST.md`](M2-14-OD-01-MARKETPLACE-UNIT-ECONOMICS-STRESS-TEST.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-FEE-AND-SHIPPING-SCENARIO-MATRIX.md`](M2-14-OD-01-FEE-AND-SHIPPING-SCENARIO-MATRIX.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-BREAK-EVEN-AND-SENSITIVITY-ANALYSIS.md`](M2-14-OD-01-BREAK-EVEN-AND-SENSITIVITY-ANALYSIS.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-FINANCIAL-ASSUMPTIONS-REGISTER.md`](M2-14-OD-01-FINANCIAL-ASSUMPTIONS-REGISTER.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md`](M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md`](M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md)
- [`docs/mvp2/m2-14/blueprint/policies/OD-02-01-RETURN-COST-RESERVE.md`](policies/OD-02-01-RETURN-COST-RESERVE.md)
- [`docs/mvp2/m2-14/decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md`](../decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md)

---

## 1. Executive Summary & Modeling Methodology

This document models the exact unit economics, cash movements, tax withholdings, merchant settlements, and net platform contribution margins under the Project Owner's clarified **Seller-of-Record Marketplace Model**.

### 1.1. Core Modeling Principles
1. **Separation of Merchant Entitlement from Platform Revenue:**  
   The customer pays the merchant's retail product price. The entire customer payment is recognized as the merchant's gross turnover. ATEEVRA's revenue consists **strictly of the separately agreed Platform Facilitation Fee** billed to the merchant (+ 18% GST).
2. **Elimination of Arbitrary Markup Ownership:**  
   The previous assumption of a ₹200 gross markup automatically captured by ATEEVRA is discarded. Platform revenue is derived strictly from the evaluated fee models.
3. **Full Lifecycle Reconciliation:**  
   Every fee model is evaluated across four distinct lifecycle operational scenarios:
   - **Scenario 1:** Successful Delivery (Delivered & Retained);
   - **Scenario 2:** Pre-Dispatch Customer Cancellation;
   - **Scenario 3:** Customer Remorse Return (Delivered, Customer Returns for Refund);
   - **Scenario 4:** Merchant-Fault Return (Damaged by Merchant, Defective, or Wrong Item).
4. **Prepaid and Cash-on-Delivery (COD) Parity:**  
   Both prepaid and COD payment rails are modeled independently to reflect gateway fees, cash handling charges, and RTO friction.
5. **Configurable Parameters:**  
   All numerical assumptions are illustrative modeling inputs to guide the Project Owner's decision and do **NOT** constitute approved policy figures.

---

## 2. Standardized Financial Assumptions & Baseline Parameters

To enable rigorous comparison, a standardized product order is evaluated across all models:

| Modeling Parameter | Variable | Baseline Value | Explanatory Notes & Primary Source |
| :--- | :---: | :---: | :--- |
| **Customer Product Price (Retail Shelf Price)** | $P_{\text{cust}}$ | **₹1,000.00** | Inclusive of product GST (e.g., 18% GST = ₹847.46 base + ₹152.54 GST). |
| **Merchant Gross Product Entitlement** | $P_{\text{gross}}$ | **₹1,000.00** | Merchant is seller of record; gross turnover recognized by merchant. |
| **Payment Gateway MDR (Prepaid Orders)** | $G_{\text{prepaid}}$ | **2.00%** | ₹20.00 on ₹1,000 transaction (inclusive of 18% gateway GST). |
| **COD Collection & Cash Handling Fee** | $G_{\text{cod}}$ | **₹30.00** | Flat fee charged by 3PL courier for cash handling at doorstep. |
| **Forward Logistics Freight (Platform Contracted)** | $S_{\text{fwd}}$ | **₹70.00** | 3PL standard delivery charge (Delhivery/Shiprocket). |
| **Reverse Logistics Freight (Returns)** | $S_{\text{rev}}$ | **₹70.00** | 3PL reverse pickup charge. |
| **Managerial Return-Cost Reserve Target** | $R_{\text{target}}$ | **₹22.61** | Baseline reserve per delivered order under [`POL-OD-02-01`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-01-RETURN-COST-RESERVE.md). |
| **GST Tax Collected at Source (Section 52)** | $\text{TCS}$ | **0.50%** | Verified statutory rate under CBIC Notif. 15/2024 (on ₹847.46 net taxable base = ₹4.24). |
| **Income Tax TDS (Section 194-O)** | $\text{TDS}$ | **0.10%** | Verified statutory rate under Finance (No. 2) Act 2024 (0.1% on gross ₹1,000 = ₹1.00). |
| **Platform Fee GST Rate** | $\text{GST}_{\text{fee}}$ | **18.00%** | Service Accounting Code (SAC) 998371 (e-commerce facilitation). |

---

## 3. Evaluated Platform Fee Structures

Three primary fee models are compared against the baseline ₹1,000 order:

- **Model 1 (Fixed Platform Fee — Option A/B):**  
  $\text{Base Fee} = \mathbf{₹60.00}$; $\text{GST (18\%)} = ₹10.80$; $\text{Gross Fee Deducted from Merchant} = \mathbf{₹70.80}$.
- **Model 2 (Percentage Facilitation Fee — Option C):**  
  $\text{Base Fee Rate} = \mathbf{10.00\%}$; $\text{Base Fee} = \mathbf{₹100.00}$; $\text{GST (18\%)} = ₹18.00$; $\text{Gross Fee Deducted} = \mathbf{₹118.00}$.
- **Model 3 (Hybrid Platform Fee — Option D):**  
  $\text{Formula} = ₹25.00 \text{ fixed} + 5.0\% \text{ percentage}$;  
  $\text{Base Fee} = ₹25.00 + ₹50.00 = \mathbf{₹75.00}$; $\text{GST (18\%)} = ₹13.50$; $\text{Gross Fee Deducted} = \mathbf{₹88.50}$.

---

## 4. Scenario 1: Successful Delivered Order (Delivered & Retained)

The order is successfully delivered by the 3PL courier, and the customer retains the item through the expiration of the return window.

### 4.1. Prepaid Order Financial Reconciliation (Customer Paid Online)

| Financial Line Item | Model 1: Fixed Fee (₹60) | Model 2: Percentage Fee (10% = ₹100) | Model 3: Hybrid Fee (₹25 + 5% = ₹75) | Accounting / Flow Explanation |
| :--- | :---: | :---: | :---: | :--- |
| **A. Customer Payment Captured** | **+₹1,000.00** | **+₹1,000.00** | **+₹1,000.00** | Gross cash received into Payment Gateway escrow. |
| **B. Payment Gateway MDR (2%)** | -₹20.00 | -₹20.00 | -₹20.00 | Retained by Razorpay / Cashfree. |
| **C. Net Cash Inflow into Escrow** | **+₹980.00** | **+₹980.00** | **+₹980.00** | Funds available for settlement and logistics. |
| **D. Platform Facilitation Fee (Base Revenue)**| **+₹60.00** | **+₹100.00** | **+₹75.00** | ATEEVRA recognized revenue (SAC 998371). |
| **E. GST on Platform Fee (18% Output Tax)** | +₹10.80 | +₹18.00 | +₹13.50 | Billed to merchant; ATEEVRA pays to Govt. |
| **F. Gross Fee Deducted from Merchant (D+E)**| **-₹70.80** | **-₹118.00** | **-₹88.50** | Merchant pays via settlement deduction; claims ITC. |
| **G. Statutory GST TCS (0.5% on taxable base)** | -₹4.24 | -₹4.24 | -₹4.24 | ATEEVRA withholds and remits via GSTR-8. |
| **H. Statutory IT TDS (0.1% on gross)** | -₹1.00 | -₹1.00 | -₹1.00 | ATEEVRA withholds and remits via Form 26Q. |
| **I. Net Merchant Settlement Payout (A-F-G-H)**| **₹923.96** | **₹876.76** | **₹906.26** | **Net cash disbursed to merchant bank account.** |
| **J. Forward Logistics Expense (3PL Freight)** | -₹70.00 | -₹70.00 | -₹70.00 | Paid to Delhivery / Shiprocket by platform. |
| **K. Return-Cost Reserve Internal Allocation** | -₹22.61 | -₹22.61 | -₹22.61 | Earmarked internal reserve ([POL-OD-02-01](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-01-RETURN-COST-RESERVE.md)). |
| **L. Net Platform Order Contribution** | **-₹52.61** | **-₹12.61** | **-₹37.61** | **Operating Deficit if Platform absorbs 100% of Freight!** |

> [!WARNING]
> **CRITICAL FINANCIAL FINDING: FREIGHT ABSORPTION DEFICIT:**  
> In Scenario 1, if ATEEVRA earns only ₹60, ₹75, or ₹100 in platform fee, **but absorbs 100% of the ₹70 forward shipping freight**, the platform operates at a **NET ORDER CONTRIBUTION DEFICIT** (loss of -₹12.61 to -₹52.61) after allocating the ₹22.61 Return Reserve and ₹20 gateway fee!  
> **Key Strategic Insight:** In a marketplace model (unlike wholesale markup), **forward shipping (₹70) must either be charged to the customer at checkout, or debited to the merchant as a shipping commission/fee, or the platform fee must be set higher (e.g., 15–18%)**.

---

### 4.2. Prepaid Order Financial Reconciliation (WITH Customer/Merchant Paid Shipping)
*Assuming customer or merchant covers the ₹70.00 forward shipping (standard marketplace practice):*

| Financial Line Item | Model 1: Fixed Fee (₹60) | Model 2: Percentage Fee (10% = ₹100) | Model 3: Hybrid Fee (₹25 + 5% = ₹75) | Explanatory Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Platform Base Fee Revenue** | +₹60.00 | +₹100.00 | +₹75.00 | Recognized facilitation fee. |
| **Gateway MDR (2%)** | -₹20.00 | -₹20.00 | -₹20.00 | Sunk transaction processing cost. |
| **Forward Logistics (Self-Funded by Shipping)**| ₹0.00 | ₹0.00 | ₹0.00 | Shipping charge neutralizes 3PL carrier cost. |
| **Return-Cost Reserve Allocation** | -₹22.61 | -₹22.61 | -₹22.61 | Managerial reserve buffer. |
| **Calibrated Platform Net Contribution** | **+₹17.39** (+1.74%) | **+₹57.39** (+5.74%) | **+₹32.39** (+3.24%) | **Healthy positive contribution across all models!** |

---

### 4.3. Cash-on-Delivery (COD) Order Financial Reconciliation (Delivered & Retained)
*Assuming customer pays ₹1,000 cash at doorstep; 3PL courier collects and remits to ATEEVRA less ₹30 cash handling fee:*

| Financial Line Item | Model 1: Fixed Fee (₹60) | Model 2: Percentage Fee (10% = ₹100) | Model 3: Hybrid Fee (₹25 + 5% = ₹75) | Explanatory Notes |
| :--- | :---: | :---: | :---: | :--- |
| **A. Cash Collected at Doorstep** | +₹1,000.00 | +₹1,000.00 | +₹1,000.00 | Collected by 3PL courier. |
| **B. 3PL Cash Handling Fee** | -₹30.00 | -₹30.00 | -₹30.00 | Retained by carrier for cash processing. |
| **C. Net Remittance Received from 3PL** | **+₹970.00** | **+₹970.00** | **+₹970.00** | Deposited into ATEEVRA bank account. |
| **D. Platform Facilitation Fee (Base)** | +₹60.00 | +₹100.00 | +₹75.00 | Facilitation revenue. |
| **E. GST on Platform Fee (18%)** | +₹10.80 | +₹18.00 | +₹13.50 | Billed to merchant. |
| **F. Gross Fee Deducted from Merchant** | -₹70.80 | -₹118.00 | -₹88.50 | Deducted from COD settlement. |
| **G. Statutory Taxes (0.5% TCS + 0.1% TDS)** | -₹5.24 | -₹5.24 | -₹5.24 | TCS/TDS withheld. |
| **H. Net Merchant Payout (A-F-G)** | **₹923.96** | **₹876.76** | **₹906.26** | Paid to merchant bank account. |
| **I. Return Reserve Allocation (COD Weight)** | -₹28.53 | -₹28.53 | -₹28.53 | Calibrated COD incident reserve ([POL-OD-02-05](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-05-COD-RTO-FUNDING.md)). |
| **J. Net Contribution (Shipping Neutral)** | **+₹1.47** (+0.15%) | **+₹41.47** (+4.15%) | **+₹16.47** (+1.65%) | Model 2 provides solid margin to absorb COD RTO. |

---

## 5. Scenario 2: Pre-Dispatch Customer Cancellation

The customer cancels the order before fulfillment or 3PL courier pickup dispatch.

```
                      PRE-DISPATCH CANCELLATION FLOW
                      
   Prepaid:  Customer Paid ₹1,000  ──►  100% Refunded (₹1,000)
             Gateway MDR Sunk: -₹20.00 (Platform Absorbs per OD-02)
             Platform Fee: ₹0.00 (Not Earned)
             Merchant Payout: ₹0.00 (Order Voided)
             Platform Net Contribution: -₹20.00
             
   COD:      No Cash Moved  ──►  Order Cancelled
             Platform Net Contribution: ₹0.00
```

- **Prepaid Orders:** ATEEVRA issues a 100% refund (₹1,000) to the customer. Under standard payment gateway terms, the 2.0% gateway MDR (₹20.00) is **non-refundable and retained by Razorpay**. Under approved policy [`POL-OD-02-03`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md), ATEEVRA absorbs this gateway loss. Platform fee is not earned. **Net Contribution = -₹20.00.**
- **COD Orders:** Zero financial movement. Order is cancelled in database. **Net Contribution = ₹0.00.**

---

## 6. Scenario 3: Customer Remorse Return (Delivered & Returned)

The order is delivered, but the customer exercises their right of remorse return within the approved return window (OD-08). The item is returned in perfect, re-saleable condition.

| Financial Flow | Model 1: Fixed Fee (₹60) | Model 2: Percentage Fee (10% = ₹100) | Model 3: Hybrid Fee (₹75) | Policy & Legal Reference |
| :--- | :---: | :---: | :---: | :--- |
| **1. Customer Cash Refund** | **-₹1,000.00** | **-₹1,000.00** | **-₹1,000.00** | 100% full refund to customer payment source. |
| **2. Merchant Entitlement** | **₹0.00** | **₹0.00** | **₹0.00** | Realization cancelled; zero payout to merchant. |
| **3. Platform Facilitation Fee** | **Waived / Credited** | **Waived / Credited** | **Waived / Credited** | ATEEVRA issues GST Credit Note to merchant. |
| **4. Sunk Gateway MDR (Prepaid)** | -₹20.00 | -₹20.00 | -₹20.00 | Absorbed by platform per [`POL-OD-02-03`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md). |
| **5. Forward Freight Incurred** | -₹70.00 | -₹70.00 | -₹70.00 | Incurred on initial delivery. |
| **6. Reverse Freight Incurred** | -₹70.00 | -₹70.00 | -₹70.00 | Absorbed by platform per [`POL-OD-02-01`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-01-RETURN-COST-RESERVE.md). |
| **7. Gross Incident Cash Drain** | **-₹160.00** | **-₹160.00** | **-₹160.00** | Exact gross incident cash outflow. |
| **8. Reserve Absorption** | +₹160.00 | +₹160.00 | +₹160.00 | Absorbed by Return-Cost Reserve pool. |
| **9. Merchant Liability** | **₹0.00** | **₹0.00** | **₹0.00** | Merchant is not penalized for customer remorse. |

---

## 7. Scenario 4: Merchant-Fault Return (Damaged / Defective / Wrong Item)

The item delivered is defective, wrong variant, or damaged due to inadequate merchant packaging. The customer returns the item and receives an immediate full refund.

| Financial Flow | Model 1: Fixed Fee (₹60) | Model 2: Percentage Fee (10% = ₹100) | Model 3: Hybrid Fee (₹75) | Policy & Legal Reference |
| :--- | :---: | :---: | :---: | :--- |
| **1. Customer Cash Refund** | **-₹1,000.00** | **-₹1,000.00** | **-₹1,000.00** | 100% full refund issued immediately. |
| **2. Merchant Entitlement** | **₹0.00** | **₹0.00** | **₹0.00** | Merchant receives zero product realization. |
| **3. Forward Logistics Liability** | **-₹70.00 (Debited)** | **-₹70.00 (Debited)** | **-₹70.00 (Debited)** | Debited to merchant per [`POL-OD-02-04`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md). |
| **4. Reverse Logistics Liability** | **-₹70.00 (Debited)** | **-₹70.00 (Debited)** | **-₹70.00 (Debited)** | Debited to merchant per [`POL-OD-02-04`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md). |
| **5. Sunk Gateway MDR** | -₹20.00 | -₹20.00 | -₹20.00 | Absorbed by platform per [`POL-OD-02-03`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md). |
| **6. Platform Facilitation Fee** | **₹0.00 (Waived)** | **₹0.00 (Waived)** | **₹0.00 (Waived)** | Platform waives fee as service resulted in return. |
| **7. Total Merchant Debit Offset**| **-₹140.00** | **-₹140.00** | **-₹140.00** | **Debited against merchant's future settlement.** |
| **8. Net Platform Cash Loss** | **-₹20.00** | **-₹20.00** | **-₹20.00** | Platform loses only the gateway fee. |

---

## 8. Sensitivity Analysis: Net Contribution Across Varying Order Values (AOV)

The table below demonstrates how the three fee structures perform across low-priced, mid-priced, and premium product baskets (assuming shipping-neutral operations):

| Average Order Value (AOV) | Model 1: Fixed Fee (₹60) | Model 2: Percentage Fee (10%) | Model 3: Hybrid Fee (₹25 + 5%) | Strategic Assessment |
| :--- | :---: | :---: | :---: | :--- |
| **Low AOV: ₹400.00** |  |  |  |  |
| - Base Fee Revenue | +₹60.00 (15.0%) | +₹40.00 (10.0%) | +₹45.00 (11.25%) | Model 1 captures highest rate on low AOV. |
| - Gateway MDR (2%) | -₹8.00 | -₹8.00 | -₹8.00 | |
| - Return Reserve Allocation | -₹22.61 | -₹22.61 | -₹22.61 | |
| - **Net Order Contribution** | **+₹29.39** (+7.35%) | **+₹9.39** (+2.35%) | **+₹14.39** (+3.60%) | Model 2 operates on thin margin at ₹400. |
| **Mid AOV: ₹1,000.00** |  |  |  |  |
| - Base Fee Revenue | +₹60.00 (6.0%) | +₹100.00 (10.0%) | +₹75.00 (7.5%) | Model 2 outpaces Model 1 by 67%. |
| - Gateway MDR (2%) | -₹20.00 | -₹20.00 | -₹20.00 | |
| - Return Reserve Allocation | -₹22.61 | -₹22.61 | -₹22.61 | |
| - **Net Order Contribution** | **+₹17.39** (+1.74%) | **+₹57.39** (+5.74%) | **+₹32.39** (+3.24%) | Model 2 provides superior economics. |
| **High AOV: ₹3,000.00** |  |  |  |  |
| - Base Fee Revenue | +₹60.00 (2.0%) | +₹300.00 (10.0%) | +₹175.00 (5.83%) | Fixed fee collapses to negligible 2%. |
| - Gateway MDR (2%) | -₹60.00 | -₹60.00 | -₹60.00 | Gateway consumes 100% of Fixed Fee! |
| - Return Reserve Allocation | -₹22.61 | -₹22.61 | -₹22.61 | |
| - **Net Order Contribution** | **-₹22.61** (-0.75%) | **+₹217.39** (+7.25%) | **+₹92.39** (+3.08%) | **Model 1 bleeds money on high-value orders!** |

---

## 9. Synthesis & Conclusions for Project Owner

1. **Failure Mode of Pure Fixed Fee (Model 1):**  
   At higher order values (₹3,000+), the 2% payment gateway fee alone (₹60) consumes 100% of the fixed platform fee, causing ATEEVRA to lose money on every high-value sale. Pure fixed fees are **commercially unviable** for a general merchandise marketplace.
2. **Superiority of Percentage Fee (Model 2):**  
   Model 2 (10% fee) dynamically scales revenue with transaction value, providing healthy contribution (+₹57.39 at ₹1,000; +₹217.39 at ₹3,000) that easily absorbs return reserves and payment gateway friction.
3. **Resilience of Hybrid Fee (Model 3):**  
   Model 3 (₹25 + 5%) provides the most robust downside protection across low and mid AOV ranges, guaranteeing cost recovery on entry-level products while capturing scale on premium goods.
