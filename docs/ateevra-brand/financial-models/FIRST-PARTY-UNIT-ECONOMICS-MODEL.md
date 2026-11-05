# ATEEVRA — First-Party Luxury Brand Unit Economics Model

**Document ID:** `ATEEVRA-FIN-MOD-001`  
**Classification:** Financial Engineering & Unit Economics Specification  
**Status:** DRAFT (Under Owner Review)  
**Version:** 1.0.0  

---

## 1. Executive Summary & Model Overview

Unlike a multi-vendor marketplace where platform revenue is derived from intermediary commission fees (e.g., 8%–15%) and gateway pass-throughs, ATEEVRA's first-party commercial model captures **100% of top-line Gross Merchandise Value (GMV)** as revenue, bearing full responsibility for Cost of Goods Sold (COGS), inventory risk, inbound/outbound logistics, luxury packaging, and customer acquisition.

This model provides mathematical reconciliations for:
1. **Normalized ₹1,000 Order Benchmark:** For direct structural comparison against marketplace unit economics models.
2. **Luxury Target ₹15,000 Order Baseline:** Representing ATEEVRA's core luxury fashion transaction (e.g., a tailored blazer or silk ensemble).

---

## 2. Unit Economics Waterfall Comparison

```
+---------------------------------------------------------------------------------------------------------+
|                                    UNIT ECONOMICS RECONCILIATION WATERFALL                               |
+------------------------------------+----------------------------------+----------------------------------+
| Metric / Financial Line Item       | Benchmark Order (₹1,000 Baseline)| Luxury Order (₹15,000 Baseline)  |
+------------------------------------+----------------------------------+----------------------------------+
| Gross Customer Invoice Value (GMV) | ₹1,000.00 (100.00%)              | ₹15,000.00 (100.00%)             |
| Less: GST on Apparel (12% Inbuilt) | -₹107.14 (-10.71%)               | -₹1,607.14 (-10.71%)             |
| Net Recognized Revenue             | ₹892.86 (89.29%)                 | ₹13,392.86 (89.29%)              |
| Less: Landed COGS (26% of GMV)     | -₹260.00 (-26.00%)               | -₹3,900.00 (-26.00%)             |
|   - Raw Materials (Fibers/Silk)    |   ₹140.00 (14.00%)               |   ₹2,100.00 (14.00%)             |
|   - Cut, Make, Trim (CMT)          |   ₹90.00  (9.00%)                |   ₹1,350.00 (9.00%)              |
|   - Trims, Buttons, Zippers        |   ₹18.00  (1.80%)                |   ₹270.00   (1.80%)              |
|   - Inbound Logistics & QC         |   ₹12.00  (1.20%)                |   ₹180.00   (1.20%)              |
| GROSS MARGIN (Gross Profit)        | ₹632.86 (63.29% GMV / 70.9% Net) | ₹9,492.86 (63.29% GMV / 70.9% Net|
+------------------------------------+----------------------------------+----------------------------------+
| Less: Direct Fulfilment Expenses   |                                  |                                  |
|   - Luxury Magnetic Box & Ribbons  | -₹35.00  (-3.50%)                | -₹220.00  (-1.47%)               |
|   - Outbound Express Air Shipping  | -₹85.00  (-8.50%)                | -₹165.00  (-1.10%)               |
|   - Return Reserve / Swap Cost (10%) -₹20.00  (-2.00%)                | -₹150.00  (-1.00%)               |
| CONTRIBUTION MARGIN 1 (CM1)        | ₹492.86 (49.29%)                 | ₹8,957.86 (59.72%)               |
+------------------------------------+----------------------------------+----------------------------------+
| Less: Direct Variable Operating Exp|                                  |                                  |
|   - Payment Gateway MDR (2.0% + GST| -₹23.60  (-2.36%)                | -₹354.00  (-2.36%)               |
|   - Blended Performance CAC (18%)  | -₹180.00 (-18.00%)               | -₹2,700.00 (-18.00%)             |
|   - Concierge Support & CX (3%)    | -₹30.00  (-3.00%)                | -₹450.00  (-3.00%)               |
| CONTRIBUTION MARGIN 2 (CM2)        | ₹259.26 (25.93%)                 | ₹5,453.86 (36.36%)               |
+------------------------------------+----------------------------------+----------------------------------+
| Less: Allocated Fixed Overheads    |                                  |                                  |
|   - Cloud Infrastructure & Strapi  | -₹15.00  (-1.50%)                | -₹120.00  (-0.80%)               |
|   - Design & Creative Direction    | -₹30.00  (-3.00%)                | -₹350.00  (-2.33%)               |
|   - G&A, HQ, Compliance, Legal     | -₹40.00  (-4.00%)                | -₹450.00  (-3.00%)               |
| NET OPERATING EBITDA               | ₹174.26 (17.43%)                 | ₹4,533.86 (30.23%)               |
+------------------------------------+----------------------------------+----------------------------------+
```

---

## 3. Detailed Line-Item Accounting & Tax Analysis

### 3.1 Goods & Services Tax (GST) Treatment
In the first-party model, ATEEVRA is the primary taxable entity:
- **Output Tax Liability:** On a ₹15,000 gross apparel sale (inclusive of 12% GST), output tax is:
  $$\text{Tax Base} = \frac{₹15,000}{1 + 0.12} = ₹13,392.86$$
  $$\text{Output GST} = ₹15,000 - ₹13,392.86 = ₹1,607.14$$
- **Input Tax Credit (ITC) Offset:** ATEEVRA offsets output GST against GST paid on:
  - B2B Fabric & Manufacturing procurement (12% GST on ₹3,900 = ₹468.00)
  - Luxury packaging boxes (18% GST on ₹220 = ₹39.60)
  - Air logistics courier services (18% GST on ₹165 = ₹29.70)
  - Payment gateway MDR (18% GST on ₹300 = ₹54.00)
  - Cloud hosting & marketing services (18% GST)
  $$\text{Total ITC Recoverable per Order} = ₹468.00 + ₹39.60 + ₹29.70 + ₹54.00 = ₹591.30$$
  $$\text{Net Cash GST Remitted to Government} = ₹1,607.14 - ₹591.30 = ₹1,015.84$$

### 3.2 Payment Gateway MDR Mechanics
- Standard luxury credit cards, UPI, and net banking average an blended interchange MDR of 2.00% + 18% GST.
- For a ₹15,000 transaction:
  $$\text{Base Gateway Fee} = 2.00\% \times ₹15,000 = ₹300.00$$
  $$\text{GST on Fee (18\%)} = ₹54.00$$
  $$\text{Total Deducted at Settlement} = ₹354.00$$
  *(Net Payout Received into ATEEVRA Current Account = ₹14,646.00 within T+1 days).*

---

## 4. Sensitivity and Stress Testing Matrix

### 4.1 Return Rate Sensitivity on CM2 Margin
Because returns incur non-recoverable forward and reverse logistics costs, as well as box refurbishing costs:

| Return Rate Scenario | Return Cost per Shipped Unit | Resulting CM1 Margin | Resulting CM2 Margin | EBITDA Margin |
| :--- | :--- | :--- | :--- | :--- |
| **Best Case (8%)** | ₹110.00 | 60.05% | 36.69% | 30.56% |
| **Base Case (12%)** | ₹165.00 | 59.72% | 36.36% | 30.23% |
| **Moderate Return (18%)**| ₹248.00 | 59.16% | 35.80% | 29.67% |
| **Severe Stress (28%)** | ₹385.00 | 58.25% | 34.89% | 28.76% |

Even under severe stress (28% return rate), the luxury first-party brand maintains a healthy CM2 of $\ge 34.89\%$ and EBITDA of $\ge 28.76\%$ due to strong initial gross product margins (70%+).

---
*End of Document `ATEEVRA-FIN-MOD-001`. Authorized for Financial Modeling & Valuation.*
