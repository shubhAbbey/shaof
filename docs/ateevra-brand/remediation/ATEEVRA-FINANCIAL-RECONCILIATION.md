# ATEEVRA — First-Party Financial Model & Unit Economics Reconciliation

**Document ID:** `ATEEVRA-REM-FIN-001`  
**Classification:** Financial Engineering & Mathematical Reconciliation  
**Status:** RECONCILED BASELINE (Awaiting CA Validation)  
**Remediation Date:** 2026-11-05  
**Author:** Principal Enterprise Architect, Financial Modeler & Policy Governance Specialist  

---

## 1. Executive Summary & Audit Background

The previous independent audit (`ATEEVRA-AUD-FIN-001`) validated the arithmetic integrity of the unit economics models, but identified eight areas requiring accounting rigor, statutory precision, and reconciliation against real-world commercial operations.

This document establishes the **authoritative, reconciled financial baseline** for ATEEVRA First-Party Luxury Brand operations.

---

## 2. Gross Merchandise Value (GMV) vs. Recognized Revenue (Ind AS 115)

In earlier documentation drafts, GMV was colloquially referred to as "100% top-line revenue". Under **Indian Accounting Standard 115 (Ind AS 115: Revenue from Contracts with Customers)** and Section 31 of the CGST Act, 2017, statutory revenue recognition requires strict segregation of taxes, customer returns, and trade allowances.

```
+---------------------------------------------------------------------------------------------------------+
|                                  STATUTORY REVENUE RECOGNITION WATERFALL                                 |
+------------------------------------+----------------------------------+----------------------------------+
| Revenue Component                  | Benchmark Order (₹1,000 GMV)     | Luxury Order (₹15,000 GMV)       |
+------------------------------------+----------------------------------+----------------------------------+
| Customer Gross Payment / GMV (MRP) | ₹1,000.00 (100.00%)              | ₹15,000.00 (100.00%)             |
| Less: Output GST Collected (12%)   | -₹107.14 (-10.71%)               | -₹1,607.14 (-10.71%)             |
|   (Fiduciary tax collected for GOI)|                                  |                                  |
| GROSS RECOGNIZED REVENUE           | ₹892.86 (89.29% GMV)             | ₹13,392.86 (89.29% GMV)          |
| Less: Provision for Customer Return| -₹107.14 (-10.71% / 12% rate)    | -₹1,607.14 (-10.71% / 12% rate)  |
|   (Ind AS 115 refund liability)    |                                  |                                  |
| NET RECOGNIZED REVENUE (GAAP/P&L)  | ₹785.72 (78.57% GMV)             | ₹11,785.72 (78.57% GMV)          |
+------------------------------------+----------------------------------+----------------------------------+
```

*Note: For unit-level margin analysis, Gross Recognized Revenue (₹13,392.86) is typically taken as the net denominator before return adjustments, with return costs captured as an explicit operational reserve.*

---

## 3. Input Tax Credit (ITC) on Landed COGS: Category & HSN Breakdown

The initial model assumed a uniform 12.0% ITC recovery across the entire ₹3,900 COGS ($12\% \times ₹3,900 = ₹468.00$). In actual apparel manufacturing, the Bill of Materials (BOM) comprises diverse input materials and services governed by different GST tariff headings:

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    INVOICE-LEVEL BOM INPUT TAX CREDIT (ITC) AUDIT                                        |
+--------------------+----------------+---------------+------------+-----------+--------------+---------------------------+
| BOM Cost Component | Typical Spec   | Cost Base (₹) | HSN Code   | GST Rate  | ITC Claim (₹)| Statutory Eligibility     |
+--------------------+----------------+---------------+------------+-----------+--------------+---------------------------+
| Shell Fabric       | Mulberry Silk  | ₹2,100.00     | HSN 5007   | 5.0%      | ₹105.00      | Eligible (Sec 16 CGST)    |
| Atelier CMT Labor  | Tailoring Job  | ₹1,350.00     | HSN 9988   | 5.0%      | ₹67.50       | Eligible (Apparel Jobwork)|
| Hardware & Trims   | Horn Buttons   | ₹270.00       | HSN 9606   | 18.0%     | ₹48.60       | Eligible (Trims supply)   |
| Inbound Freight    | Air/Road Cargo | ₹110.00       | HSN 9965   | 5.0%      | ₹5.50        | Eligible (GTA Services)   |
| Lab QC & Testing   | Tensile/ISO Lab| ₹70.00        | HSN 9983   | 18.0%     | ₹12.60       | Eligible (Technical test) |
+--------------------+----------------+---------------+------------+-----------+--------------+---------------------------+
| TOTAL LANDED COGS  |                | ₹3,900.00     | Blended    | 6.13%     | ₹239.20      | Actual Recoverable ITC    |
+--------------------+----------------+---------------+------------+-----------+--------------+---------------------------+
```

### 3.1 Financial Impact of Reconciled ITC
- **Previous Overstatement:** The initial assumption claimed ₹468.00 in ITC against COGS.
- **True Reconciled ITC:** **₹239.20** (due to natural textile fabrics and apparel job work attracting concessional 5.0% GST under Indian notification rates, not 12.0%).
- **Variance:** -₹228.80 lower cash tax offset per luxury garment.
- **Net GST Remittance to Government:**
  $$\text{Output Tax Liability} = ₹1,607.14$$
  $$\text{ITC on COGS} = -₹239.20$$
  $$\text{ITC on Rigid Packaging (18\% on ₹220)} = -₹39.60$$
  $$\text{ITC on Express Air Freight (18\% on ₹165)} = -₹29.70$$
  $$\text{ITC on Gateway MDR (18\% on ₹300)} = -₹54.00$$
  $$\text{Total Recoverable ITC} = ₹239.20 + ₹39.60 + ₹29.70 + ₹54.00 = \mathbf{₹362.50}$$
  $$\mathbf{Net\ Cash\ GST\ Payable\ to\ Tax\ Authorities} = ₹1,607.14 - ₹362.50 = \mathbf{₹1,244.64}$$
  *(Previous estimate of ₹1,015.84 was understated by ₹228.80. Formally marked for Chartered Accountant sign-off).*

---

## 4. Payment Gateway MDR: Cash Flow vs. P&L Expense vs. Recoverable ITC

To avoid double-counting gateway fees in profitability analysis:

```
+-----------------------------------------------------------------------------------+
|                        PAYMENT GATEWAY CASH & ACCOUNTING FLOW                     |
|                                                                                   |
|  [ GROSS CLIENT PAYMENT: ₹15,000.00 ]                                             |
|                                                                                   |
|  --> Bank Settlement Deduction: -₹354.00 (2.36% of GMV)                           |
|      - Net Cash Deposited in ATEEVRA Current Account: ₹14,646.00 (T+1 Days)       |
|                                                                                   |
|  --> Financial Accounting Entries:                                                |
|      - Dr Bank Account (Asset):              ₹14,646.00                           |
|      - Dr Gateway MDR Expense (P&L OpEx):       ₹300.00  <-- True P&L Hit         |
|      - Dr GST Input Tax Credit (Balance Sheet):  ₹54.00  <-- Tax Asset (GSTR-2B)  |
|      - Cr Sales Revenue (Customer Balance): ₹15,000.00                            |
+-----------------------------------------------------------------------------------+
```

- **Reconciliation Principle:** In the Operating EBITDA calculation, the gateway expense is **₹300.00** (not ₹354.00). The ₹54.00 GST portion is recovered against output tax liabilities on the balance sheet.

---

## 5. SKU-Level Pricing & Landed Margin Reconciliation

Below is the definitive reconciliation across the four core product archetypes, detailing the raw multiplier formula, statutory GST addition, psychological price rounding, and resulting net margins:

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    SKU-LEVEL PRICING & MARGIN RECONCILIATION TABLE                                       |
+------------------------------------+-----------------+-----------------+-----------------+------------------------------+
| Metric / Financial Line Item       | Tailored Blazer | Silk Blouse     | Wool Trousers   | Leather Tote Bag             |
+------------------------------------+-----------------+-----------------+-----------------+------------------------------+
| Primary Material Specification     | Super 130s Wool | Mulberry Silk   | Wool Blend      | Full-Grain Calfskin          |
| Applicable Statutory GST Chapter   | Chapter 62 (12%)| Chapter 62 (12%)| Chapter 62 (12%)| Chapter 42 (18%)             |
+------------------------------------+-----------------+-----------------+-----------------+------------------------------+
| Total Landed Cost (TLC) Excl GST   | ₹4,050.00       | ₹2,200.00       | ₹1,845.00       | ₹5,510.00                    |
| Target Retail Multiplier           | 5.20x           | 5.00x           | 4.80x           | 5.50x                        |
| Mathematical Net Price (Excl GST)  | ₹21,060.00      | ₹11,000.00      | ₹8,856.00       | ₹30,305.00                   |
| Add: Statutory Output GST Amount   | ₹2,527.20 (12%) | ₹1,320.00 (12%) | ₹1,062.72 (12%) | ₹5,454.90 (18%)              |
| Raw Calculated MRP (Inclusive GST) | ₹23,587.20      | ₹12,320.00      | ₹9,918.72       | ₹35,759.90                   |
+------------------------------------+-----------------+-----------------+-----------------+------------------------------+
| RECOMMENDED MRP (Rounded Luxury)   | ₹23,500.00      | ₹12,500.00      | ₹9,900.00       | ₹35,500.00                   |
| Rounding Adjustment                | -₹87.20 (-0.37%)| +₹180.00 (+1.46%) -₹18.72 (-0.19%)| -₹259.90 (-0.73%)            |
+------------------------------------+-----------------+-----------------+-----------------+------------------------------+
| RECONCILED REALITY (At Rounded MRP)|                 |                 |                 |                              |
|   - Actual Output GST Collected    | ₹2,517.86       | ₹1,339.29       | ₹1,060.71       | ₹5,415.25                    |
|   - Actual Net Recognized Revenue  | ₹20,982.14      | ₹11,160.71      | ₹8,839.29       | ₹30,084.75                   |
|   - Actual Realized Multiplier     | 5.181x          | 5.073x          | 4.791x          | 5.460x                       |
|   - Gross Profit Amount (Net - TLC)| ₹16,932.14      | ₹8,960.71       | ₹6,994.29       | ₹24,574.75                   |
|   - ACTUAL GROSS MARGIN (%)        | 80.70%          | 80.29%          | 79.13%          | 81.68%                       |
+------------------------------------+-----------------+-----------------+-----------------+------------------------------+
```

---

## 6. Contribution Protection Floor Price Recalculation (Tailored Blazer)

The previous draft cited a floor price of ₹4,555.00 (or ₹5,101.60 incl. GST). This figure was dangerously flawed because it captured only raw landed cost and shipping, while ignoring customer acquisition cost (CAC), return reserves, and concierge handling. 

Selling a garment at ₹5,101 results in severe cash destruction. Below are the three authoritative floor tiers:

```
+---------------------------------------------------------------------------------------------------------+
|                              TAILORED BLAZER MULTI-TIER FLOOR PRICE MATRIX                              |
+------------------------------------+------------------+-------------------------------------------------+
| Floor Protection Level             | Minimum MRP (₹)  | Covered Cost Elements                           |
+------------------------------------+------------------+-------------------------------------------------+
| Level 1: Variable Cash Breakeven   | ₹5,400.00        | TLC (₹4,050) + Packaging (₹220) + Air Courier   |
|   (CM1 Breakeven Floor)            | (Incl. 12% GST)  | (₹165) + Return Reserve (₹150) + MDR (2%).      |
|                                    |                  | Absolves raw physical fulfillment without loss. |
+------------------------------------+------------------+-------------------------------------------------+
| Level 2: Commercial Marketing Floor| ₹7,800.00        | Level 1 Costs + Minimum Promotional CAC (₹1,800)|
|   (CM2 Breakeven Floor)            | (Incl. 12% GST)  | + Concierge Support Allocation (₹250).          |
|   *RECOMMENDED SYSTEM GUARDRAIL*   |                  | Ensures brand does not lose cash on marketing.  |
+------------------------------------+------------------+-------------------------------------------------+
| Level 3: Full Enterprise Breakeven | ₹10,500.00       | Level 2 Costs + Minimum Fixed OpEx Absorption   |
|   (Zero EBITDA Floor)              | (Incl. 12% GST)  | (Cloud, Design, HQ Corporate Overheads).        |
+------------------------------------+------------------+-------------------------------------------------+
```

- **Technical Implementation:** Medusa pricing engine guardrails must enforce **Level 2 (₹7,800.00)** as the absolute minimum transaction floor for promotional discount codes, preventing rogue negative-contribution sales.

---

## 7. Fulfilment & Return Reserve Reconciliation

### 7.1 Forward vs. Total Fulfilment Clarification
- In earlier texts, forward fulfilment was cited as ₹120 (benchmark) and ₹385 (luxury order).
- In the unit economics waterfall, fulfilment was cited as ₹140 (benchmark) and ₹535 (luxury order).
- **Reconciliation:**
  $$\text{Total Direct Fulfilment} = \text{Forward Packaging} + \text{Forward Air Freight} + \text{Reverse Return Reserve}$$
  - Benchmark ₹1,000 Order: Forward Packaging (₹35) + Forward Air (₹85) + Return Reserve (₹20) = **₹140.00**
  - Luxury ₹15,000 Order: Forward Packaging (₹220) + Forward Air (₹165) + Return Reserve (₹150) = **₹535.00**
  - *Finding: There is zero discrepancy. ₹385 represents purely forward logistics; ₹535 represents total direct fulfillment including return risk.*

### 7.2 Return Reserve Formula & Sensitivity Reconciliation
- The return reserve per shipped unit is calculated as:
  $$\text{Return Reserve} = \text{Return Rate } (p) \times (\text{Reverse Express Air Freight} + \text{Box Refurbishment \& Ozone Triage Cost})$$
  - Base Model Assumption: $12\% \text{ Return Rate} \times (₹165 \text{ Reverse Air} + ₹150 \text{ Triage/Repack}) = 0.12 \times ₹315 = \mathbf{₹37.80 \text{ minimum}}$.
  - Conservative Safety Reserve: The model sets **₹150.00** (1.0% of GMV) to provide a heavy cushion for potential transit damages and simultaneous size swaps. In the sensitivity stress test, a higher stress figure of **₹165.00** was evaluated. Both figures are valid modeling parameters representing baseline vs. stressed reserve thresholds.

---

## 8. Financial Assumptions & Unverified Inputs Register

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                    FINANCIAL ASSUMPTIONS & VALIDATION REGISTER                                          |
+----+--------------------------------+--------------------+----------------------------+---------------------------------+
| #  | Financial Assumption           | Current Baseline   | Sensitivity Range          | Statutory Validation Action     |
+----+--------------------------------+--------------------+----------------------------+---------------------------------+
| 1  | Atelier CMT Unit Labor Cost    | ₹550 – ₹1,800      | ± 15% based on batch size  | CA & Atelier Contract Review    |
| 2  | Fabric BOM Input Tax Credit    | 5.0% on silk/wool  | 5% to 12% depending on HSN | Statutory Tax Auditor Sign-Off  |
| 3  | Blended Customer CAC           | 18.0% of GMV       | 15% – 25% of GMV           | Digital Marketing Trial Pilot   |
| 4  | Average Return Rate            | 12.0%              | 8% – 18%                   | Initial Cohort Cohort Tracking  |
| 5  | Payment Gateway Net MDR        | 2.00% + 18% GST    | 1.85% – 2.10% + GST        | Final Gateway Merchant Agreement|
| 6  | Fixed Corporate OpEx Overheads | 6.13% of GMV       | Fixed ₹9,20,000 / month    | Corporate Budget Ratification   |
+----+--------------------------------+--------------------+----------------------------+---------------------------------+
```

---
*End of Document `ATEEVRA-REM-FIN-001`. Formally Reconciled for Financial Review.*
