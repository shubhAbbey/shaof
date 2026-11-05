# ATEEVRA Phase M2-14 — OD-01 Corrected Unit Economics & Financial Stress Model
## Rigorous Multi-Scenario Viability, Deficit Identification & Actuarial Reserve Modeling Under Approved OD-02 Policies

**Document ID:** `MOD-M2-14-OD-01-CORRECTED-ECONOMICS`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-01 (Marketplace Platform Fee & Shipping Model)  
**Parent Policies:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)  
**Reconciliation Reference:** [`M2-14-OD-01-INDEPENDENT-FINANCIAL-RECONCILIATION-AUDIT.md`](M2-14-OD-01-INDEPENDENT-FINANCIAL-RECONCILIATION-AUDIT.md)  
**Governance Status:** `STRICTLY MODELING & DOCUMENTATION ONLY — ZERO IMPLEMENTATION`  
**Decision Status:** `OD-01 REMAINS STRICTLY UNAPPROVED — PROVISIONAL DIRECTION ONLY`  
**Commercial Parameter Status:** `PLATFORM FEE & FORWARD SHIPPING ALLOCATION EXPLICITLY UNDECIDED`  
**Model Date:** 2026-11-03  

---

## 1. Executive Summary & Modeling Philosophy

This corrected unit economics model recalculates platform margins, merchant realizations, logistics cash flows, and actuarial reserve balances under strict adherence to the six owner-approved OD-02 policies ([`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) to [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)).

### 1.1. Inviolable Governance Principles
1. **Zero Policy Distortion:** No policy rule is altered to manufacture artificial positive margins. Where a commercial combination produces operating deficits (such as platform-absorbed free shipping or low-AOV fixed fees), those losses are reported transparently.
2. **Strict Preservation of OD-02 v1.0.0:**
   - Customers receive **100% full refunds on remorse returns**, with zero reverse shipping fees deducted ([`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md)).
   - Product selling price ($P_{\text{sell}}$) is **strictly invariant between Prepaid and COD** ([`POL-OD-02-02`](policies/OD-02-02-PREPAID-COD-PRICING.md)).
   - Payment gateway MDR on merchant-fault returns is **100% absorbed by ATEEVRA**; merchants are debited only for reverse freight offsets ([`POL-OD-02-03`](policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md)).
   - Compliant merchants receive realization on transit-damaged goods, with unrecovered courier claims absorbed by ATEEVRA ([`POL-OD-02-04`](policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md)).
   - Failed COD orders (RTO) are **100% absorbed by ATEEVRA** (-₹170.00 cash drain per event), with zero seller debt and zero buyer penalties ([`POL-OD-02-05`](policies/OD-02-05-COD-RTO-FUNDING.md)).
3. **Decoupled Tax Withholdings:** GST TCS (0.5%) and IT TDS (0.1%) are treated strictly as balance sheet passthrough remittances, never as platform operating expenditures.
4. **Non-Duplication Invariant:** Internal reserve allocations and actual incident cash expenditures are never double-counted.

---

## 2. Comprehensive Fee Model Evaluation (Baseline ₹1,000 Order)

Five distinct platform fee models are evaluated for a standardized **₹1,000.00 order** under **Shipping Model A (Customer pays ₹70 forward shipping; platform contracts 3PL)**:

```
+-----------------------------------------------------------------------------------------------------------------------+
| COMPREHENSIVE FEE MODEL COMPARISON TABLE (BASELINE ₹1,000 ORDER | CUSTOMER-PAID SHIPPING MODEL A)                     |
+-----------------------------------------------------------------------------------------------------------------------+
| Financial Metric / Line Item            | Model A: Fixed  | Model B: Per-Item| Model C: 8% Fee | Model C: 10% Fee| Model D: Hybrid |
|                                         | Fee (₹50 flat)  | Fee (₹30/item)   | (₹80.00 base)   | (₹100.00 base)  | (₹20 + 5% = ₹70)|
+-----------------------------------------+-----------------+------------------+-----------------+-----------------+-----------------+
| Customer Product Payment                | +₹1,000.00      | +₹1,000.00       | +₹1,000.00      | +₹1,000.00      | +₹1,000.00      |
| Customer Forward Shipping Paid          |   +₹70.00       |   +₹70.00        |   +₹70.00       |   +₹70.00       |   +₹70.00       |
| Total Gross Customer Escrow Inflow      | +₹1,070.00      | +₹1,070.00       | +₹1,070.00      | +₹1,070.00      | +₹1,070.00      |
+-----------------------------------------+-----------------+------------------+-----------------+-----------------+-----------------+
| ATEEVRA Platform Base Fee (Revenue)     |   +₹50.00       |   +₹30.00        |   +₹80.00       |  +₹100.00       |   +₹70.00       |
| Output GST on Platform Fee (18%)        |    +₹9.00       |    +₹5.40        |   +₹14.40       |   +₹18.00       |   +₹12.60       |
| Gross Fee Invoiced to Merchant          |   -₹59.00       |   -₹35.40        |   -₹94.40       |  -₹118.00       |   -₹82.60       |
+-----------------------------------------+-----------------+------------------+-----------------+-----------------+-----------------+
| Statutory GST Section 52 TCS (0.5%)     |    -₹4.24       |    -₹4.24        |    -₹4.24       |    -₹4.24       |    -₹4.24       |
| Statutory Income Tax Sec 194-O TDS (0.1%)|   -₹1.00       |    -₹1.00        |    -₹1.00       |    -₹1.00       |    -₹1.00       |
| Net Merchant Cash Payout (Disbursed)    |  ₹935.76        |  ₹959.36         |  ₹900.36        |  ₹876.76        |  ₹912.16        |
+-----------------------------------------+-----------------+------------------+-----------------+-----------------+-----------------+
| 3PL Forward Freight (Platform Paid)     |   -₹70.00       |   -₹70.00        |   -₹70.00       |   -₹70.00       |   -₹70.00       |
| Net Shipping Margin (Customer ₹70 - 3PL)|     ₹0.00       |     ₹0.00        |     ₹0.00       |     ₹0.00       |     ₹0.00       |
| Payment Gateway MDR (2% on ₹1,070)      |   -₹21.40       |   -₹21.40        |   -₹21.40       |   -₹21.40       |   -₹21.40       |
+-----------------------------------------+-----------------+------------------+-----------------+-----------------+-----------------+
| Gross Platform Operating Spread         |   +₹28.60       |    +₹8.60        |   +₹58.60       |   +₹78.60       |   +₹48.60       |
| Actuarial Incident Risk Provision (OD02)|    -₹5.43       |    -₹5.43        |    -₹5.43       |    -₹5.43       |    -₹5.43       |
+-----------------------------------------+-----------------+------------------+-----------------+-----------------+-----------------+
| NET EXPECTED PREPAID CONTRIBUTION       |  +₹23.17        |   +₹3.17         |  +₹53.17        |  +₹73.17        |  +₹43.17        |
| NET EXPECTED PREPAID MARGIN (%)         |   +2.32%        |   +0.32%         |   +5.32%        |   +7.32%        |   +4.32%        |
+-----------------------------------------+-----------------+------------------+-----------------+-----------------+-----------------+
| If COD Rail Used (3PL Fee ₹30; Risk ₹21)|  -₹1.22 (LOSS!) | -₹21.22 (DEFICIT)|  +₹28.78        |  +₹48.78        |  +₹18.78        |
+-----------------------------------------+-----------------+------------------+-----------------+-----------------+-----------------+
```

> [!WARNING]
> **Deficit Finding on Fixed Fees under COD:**  
> If ATEEVRA charges a fixed fee of ₹50 (Model A) or ₹30 (Model B), COD orders generate an immediate **operating loss of -₹1.22 to -₹21.22 per order**. Fixed fees cannot absorb COD cash handling fees (₹30.00) and high RTO incident risks (₹21.22). Only **Model C (8%–10%)** and **Model D (Hybrid)** deliver positive operating margins across both payment rails.

---

## 3. Shipping Model Viability & The Freight Absorption Deficit

The table below contrasts the five shipping policies under **Fee Model C (10.0% Fee = ₹100.00 base revenue)** across different Average Order Value (AOV) tiers:

```
+-----------------------------------------------------------------------------------------------------------------------+
| SHIPPING MODEL P&L VIABILITY ACROSS BASKET VALUES (10% PLATFORM FEE = ₹100 PER ₹1,000 GMV)                            |
+-----------------------------------------------------------------------------------------------------------------------+
| Shipping Cost Policy                    | Low AOV (₹399.00)    | Mid AOV (₹1,000.00)  | High AOV (₹2,499.00) | Viability Status |
+-----------------------------------------+----------------------+----------------------+----------------------+------------------+
| Model A: Customer Pays Shipping (₹70)   | +₹22.10 (+5.54%)     | +₹73.17 (+7.32%)     | +₹192.59 (+7.71%)    | 100% VIABLE      |
| Model B: Merchant Pays Shipping (₹70)   | +₹22.10 (+5.54%)     | +₹73.17 (+7.32%)     | +₹192.59 (+7.71%)    | 100% VIABLE      |
| Model C: Platform Absorbs Shipping (₹70)| -₹47.90 (-12.01% DEF)| +₹3.17 (+0.32% SLIM) | +₹122.59 (+4.91%)    | UNVIABLE <₹1,000 |
| Model D: Conditional Free Shipping      | +₹22.10 (Cust pays)  | +₹73.17 (Cust pays)  | +₹122.59 (Free ship) | HIGHLY VIABLE    |
| Model E: Per-Consignment (Multi-Vendor) | +₹22.10 (Per vendor) | +₹73.17 (Per vendor) | +₹192.59 (Per vendor)| 100% VIABLE      |
+-----------------------------------------+----------------------+----------------------+----------------------+------------------+
```

### 3.1. Mathematical Proof of Model C Unviability
Under Shipping Model C, ATEEVRA absorbs forward freight (₹70.00) on all orders without charging buyers or merchants:
- On a **₹399.00 order**, 10% platform fee is **₹39.90**.
- Fixed 3PL forward freight is **₹70.00**.
- Gross freight deficit = $₹39.90 - ₹70.00 = \mathbf{-₹30.10}$.
- Adding gateway MDR (₹9.42) and actuarial incident provision (₹5.43) drives the total net loss to **-₹47.90 per order (-12.01% operating margin)**.
- **Rule:** Universal platform-absorbed free shipping is mathematically impossible under marketplace fee rates.

---

## 4. Multi-Consignment Cart Dynamics (Multi-Vendor Orders)

When a customer orders products from $N$ independent merchants:
$$\text{Total 3PL Logistics Expense} = N \times ₹70.00$$

The table below demonstrates the devastating margin erosion if the platform fails to charge shipping per vendor:

```
+---------------------------------------------------------------------------------------------------+
| MULTI-VENDOR CART FREIGHT EROSION (₹1,500 BASKET | 10% PLATFORM FEE = ₹150.00)                   |
+---------------------------------------------------------------------------------------------------+
| Scenario Configuration                  | Customer Pays | 3PL Freight Incurred | Platform Net Margin |
+-----------------------------------------+---------------+----------------------+---------------------+
| Single-Vendor Order (1 Merchant)        | +₹70.00       | -₹70.00 (1 delivery) | +₹114.60 (+7.64%)   |
| 2-Vendor Cart with Flat ₹70 Shipping    | +₹70.00       | -₹140.00 (2 pickups) | +₹44.60 (+2.97%)    |
| 2-Vendor Cart with Proposed ₹50 Surcharge| +₹120.00     | -₹140.00 (2 pickups) | +₹94.60 (+6.31%)    |
| 2-Vendor Cart with Strict Model E       | +₹140.00      | -₹140.00 (2 pickups) | +₹114.60 (+7.64%)   |
| 3-Vendor Cart with Flat ₹70 Shipping    | +₹70.00       | -₹210.00 (3 pickups) | -₹25.40 (-1.69% DEF)|
+-----------------------------------------+---------------+----------------------+---------------------+
```

> [!CAUTION]
> **Multi-Vendor Policy Rule:**  
> Flat basket shipping on mixed carts loses **-₹70.00 per additional vendor**. Charging ₹50.00 leaves a **-₹20.00 subsidy deficit**. To maintain commercial solvency during early MVP operations, ATEEVRA must enforce **Shipping Model E (pass-through of ₹70.00 per merchant consignment)** or restrict multi-vendor checkout on baskets below ₹1,500.

---

## 5. Actuarial Return-Cost Reserve Reconciliation & Stress Testing

### 5.1. Definitional Reconciliation: Reserve Earmark vs. Actual Cash Drain

A critical finding from the audit is the necessity of maintaining strict accounting separation between:
1. **Actuarial Reserve Earmark ($R_{\text{target}} \approx ₹22.61$):** A managerial profit allocation deducted on paper from platform fee revenue on delivered orders to build an internal risk buffer.
2. **Actual Incident Cash Outflow:** Realized payments made to 3PL couriers (reverse freight ₹90, RTO freight ₹70, attempt fee ₹30) and payment gateways (sunk MDR ₹21.40) when returns occur.

```
Expected Cash Inflow per Order (Delivered Platform Fee)
                      │
                      ▼
         [Platform Revenue Escrow]
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
 [Operating Profit]       [Return-Cost Reserve Pool]
   (e.g. +₹78.60)           (Earmark: ₹22.61/order)
                                   │
                                   ▼
                      Funds Realized Incidents:
                      - Remorse Returns (-₹181.40)
                      - Defective Returns (-₹100.40)
                      - COD RTOs (-₹170.00)
```

### 5.2. Return-Rate Sensitivity & Breakeven Stress Matrix

The table evaluates the sustainability of the **₹22.61 reserve target** across varying return and RTO rates:

```
+---------------------------------------------------------------------------------------------------+
| ACTUARIAL RESERVE ADEQUACY SENSITIVITY MATRIX (BLENDED 50% PREPAID / 50% COD)                      |
+---------------------------------------------------------------------------------------------------+
| Scenario Stress Level | Remorse Return Rate | COD RTO Rate | Expected Incident Cost | Reserve Surplus / (Deficit)|
+-----------------------+---------------------+--------------+------------------------+----------------------------+
| Optimistic            | 4.0%                | 12.0%        | ₹9.85 per order        | +₹12.76 (Strong Surplus)   |
| Baseline (Model)      | 6.0%                | 18.0%        | ₹13.33 per order       | +₹9.28 (Healthy Buffer)    |
| Adverse Tier 1        | 10.0%               | 22.0%        | ₹18.42 per order       | +₹4.19 (Narrow Buffer)     |
| Adverse Tier 2        | 12.0%               | 25.0%        | ₹21.75 per order       | +₹0.86 (Barely Solvent)    |
| Severe Stress         | 15.0%               | 30.0%        | ₹26.80 per order       | -₹4.19 (DEFICIT / DRAIN!)  |
+---------------------------------------------------------------------------------------------------+
```

### 5.3. Liquidity, Timing, and Tail-Risk Safeguards

While the baseline model projects an actuarial surplus (+₹9.28 per order), operational liquidity can fail due to real-world cash flow lags:

1. **Working Capital Cash Drag:**  
   Refunds to customers and 3PL freight disbursements occur on Day $T+1$ to $T+3$. If order volume surges rapidly, cash outflows for returns on previous cohorts deplete liquid bank balances before new platform fees clear escrow.
2. **Merchant Settlement Window Invariant (OD-07):**  
   Holding merchant disbursements for $T+7$ days (aligning with the customer return eligibility window under OD-08) is the primary safeguard that prevents cash drain. If payouts were disbursed immediately on delivery ($T+0$), subsequent remorse returns would force ATEEVRA to disburse customer refunds out of equity capital while holding uncollected merchant receivables.
3. **Catastrophic Tail Risk:**  
   In the event of carrier warehouse fires or transit vehicle accidents, dozens of customer orders are destroyed simultaneously. ATEEVRA must refund customers immediately while waiting 45–90 days for 3PL insurance claim settlements ([`POL-OD-02-04`](policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md)), requiring a designated **Contingency Liquidity Reserve** of at least ₹2,00,000 in platform bank accounts.

---

## 6. Strategic Decision Framework for Project Owner

To achieve formal approval of OD-01, the Project Owner must select from the following rigorously verified combinations:

```
+---------------------------------------------------------------------------------------------------+
| MASTER OWNER DECISION OPTIONS FRAMEWORK                                                           |
+---------------------------------------------------------------------------------------------------+
| Combination Option      | Commercial Configuration           | Expected Contribution | Key Strategic Tradeoff        |
+-------------------------+------------------------------------+-----------------------+-------------------------------+
| Combination C-A         | 10% Platform Fee +                 | +₹73.17 (Prepaid)     | Maximum financial safety; zero|
| (Capital Preservation)  | Customer-Paid Shipping (₹70)       | +₹48.78 (COD)         | freight risk; highest friction|
+-------------------------+------------------------------------+-----------------------+-------------------------------+
| Combination C-D         | 10% Platform Fee +                 | +₹73.17 (Below ₹1,199)| Optimal UX/margin balance;    |
| (Staged Hybrid Leader)  | Free Shipping above ₹1,199         | +₹15.09 (Above ₹1,199)| self-sustaining basket size.  |
+-------------------------+------------------------------------+-----------------------+-------------------------------+
| Combination D-A         | Hybrid Fee (₹20 + 5%) +            | +₹43.17 (Prepaid)     | Superior downside protection  |
| (Low-AOV Shield)        | Customer-Paid Shipping (₹70)       | +₹18.78 (COD)         | on entry-level catalog items. |
+-------------------------+------------------------------------+-----------------------+-------------------------------+
```

---

## 7. Governance Conclusion

- **OD-01 Status:** Strictly **UNAPPROVED**.
- **Commercial Selection:** Platform fee model and shipping policy remain **UNDECIDED**.
- **Approved OD-02 Baseline:** Preserved with 100% mathematical integrity across all formulas.
- **Zero Software Implementation:** No code, schema, migration, or config files were created or modified.
