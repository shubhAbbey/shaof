# ATEEVRA Phase M2-14 — OD-01 Multi-Vendor Shipping Economics & Policy Evaluation
## Comparative Analysis of Mixed-Merchant Carts, Consignment Multiplication Dynamics & Subsidy Caps

**Document ID:** `LOG-M2-14-OD-01-MULTI-VENDOR-SHIPPING`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-01 (Pricing & Forward Shipping Model)  
**Parent Policies:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) & [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)  
**Governance Status:** `STRICTLY DOCUMENTATION & COMMERCIAL ANALYSIS ONLY — ZERO IMPLEMENTATION`  
**Decision Status:** `OD-01 UNAPPROVED — PROVISIONAL DIRECTION FOR OWNER EVALUATION ONLY`  
**Commercial Parameter Status:** `MULTI-VENDOR SHIPPING POLICY EXPLICITLY UNDECIDED`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & The Multi-Vendor Friction Problem

In a single-merchant direct-to-consumer store, adding multiple items to a cart does not increase warehouse dispatch locations: goods are packed into a single parcel and shipped via one 3PL consignment ($1 \times ₹70.00$).

In ATEEVRA's multi-vendor marketplace, independent sellers operate separate warehouses across India (e.g., Merchant A in Jaipur, Merchant B in Surat, Merchant C in Bengaluru). When a customer places a single order containing products from $N$ different merchants:
$$\mathbf{\text{Total 3PL Logistics Consignments Incurred}} = N \times ₹70.00$$
Each vendor package represents an independent pickup, long-haul line-haul transit, and destination doorstep delivery.

This operational reality creates a fundamental commercial conflict:
- **If ATEEVRA charges the customer a single flat shipping fee of ₹70.00:** The customer experiences a frictionless checkout, but ATEEVRA incurs a direct, unrecoverable logistics deficit of **-₹70.00 for each additional vendor** ($[N - 1] \times ₹70.00$).
- **If ATEEVRA charges the customer ₹70.00 per vendor ($N \times ₹70.00$):** ATEEVRA maintains 100% shipping neutrality, but the customer experiences checkout shock (e.g. ₹210 shipping on a 3-item cart), triggering severe cart abandonment (25%–40% industry drop-off).

This document evaluates five candidate shipping policies across 1, 2, 3, and 4 merchants in a single basket, detailing freight outflows, customer collections, merchant deductions, platform subsidies, and commercial sustainability.

---

## 2. Comprehensive 5-Policy Comparative Evaluation (1 to 4 Vendors)

All models are evaluated using a standardized **₹1,500.00 cart value** under **10% Platform Facilitation Fee (₹150.00 gross revenue)** and standard 3PL freight rate (**₹70.00 per consignment**):

```
========================================================================================================================
MULTI-VENDOR SHIPPING POLICY COMPARISON SCHEDULE (BASELINE ₹1,500 BASKET | 10% FEE = ₹150.00 | MDR = ₹30.00)
========================================================================================================================
Number of Vendors | Policy Description & Key Rules            | 3PL Freight | Customer | Merchant | Platform | Net Platform
in Customer Cart  |                                           | Outflow (-) | Paid (+) | Deducted | Subsidy  | Contribution
------------------+-------------------------------------------+-------------+----------+----------+----------+-------------
1 MERCHANT CART   | Policy 1: Strict Per-Consignment (Model E)|     -₹70.00 |   +₹70.00|     ₹0.00|     ₹0.00|  +₹120.00   
(Baseline Control)| Policy 2: Flat Basket Shipping (₹70 flat) |     -₹70.00 |   +₹70.00|     ₹0.00|     ₹0.00|  +₹120.00   
                  | Policy 3: Merchant-Paid per-consignment   |     -₹70.00 |     ₹0.00|   -₹70.00|     ₹0.00|  +₹120.00   
                  | Policy 4: Conditional Free Shipping >₹1.2k|     -₹70.00 |     ₹0.00|     ₹0.00|   -₹70.00|   +₹50.00   
                  | Policy 5: Partial Subsidy (₹50 Surcharge) |     -₹70.00 |   +₹70.00|     ₹0.00|     ₹0.00|  +₹120.00   
------------------+-------------------------------------------+-------------+----------+----------+----------+-------------
2 MERCHANTS CART  | Policy 1: Strict Per-Consignment (Model E)|    -₹140.00 |  +₹140.00|     ₹0.00|     ₹0.00|  +₹120.00   
(2 Consignments)  | Policy 2: Flat Basket Shipping (₹70 flat) |    -₹140.00 |   +₹70.00|     ₹0.00|   -₹70.00|   +₹50.00   
                  | Policy 3: Merchant-Paid per-consignment   |    -₹140.00 |     ₹0.00|  -₹140.00|     ₹0.00|  +₹120.00   
                  | Policy 4: Conditional Free Shipping >₹1.2k|    -₹140.00 |     ₹0.00|     ₹0.00|  -₹140.00|   -₹20.00*  
                  | Policy 5: Partial Subsidy (₹50 Surcharge) |    -₹140.00 |  +₹120.00|     ₹0.00|   -₹20.00|  +₹100.00   
------------------+-------------------------------------------+-------------+----------+----------+----------+-------------
3 MERCHANTS CART  | Policy 1: Strict Per-Consignment (Model E)|    -₹210.00 |  +₹210.00|     ₹0.00|     ₹0.00|  +₹120.00   
(3 Consignments)  | Policy 2: Flat Basket Shipping (₹70 flat) |    -₹210.00 |   +₹70.00|     ₹0.00|  -₹140.00|   -₹20.00*  
                  | Policy 3: Merchant-Paid per-consignment   |    -₹210.00 |     ₹0.00|  -₹210.00|     ₹0.00|  +₹120.00   
                  | Policy 4: Conditional Free Shipping >₹1.2k|    -₹210.00 |     ₹0.00|     ₹0.00|  -₹210.00|   -₹90.00*  
                  | Policy 5: Partial Subsidy (₹50 Surcharge) |    -₹210.00 |  +₹170.00|     ₹0.00|   -₹40.00|   +₹80.00   
------------------+-------------------------------------------+-------------+----------+----------+----------+-------------
4 MERCHANTS CART  | Policy 1: Strict Per-Consignment (Model E)|    -₹280.00 |  +₹280.00|     ₹0.00|     ₹0.00|  +₹120.00   
(4 Consignments)  | Policy 2: Flat Basket Shipping (₹70 flat) |    -₹280.00 |   +₹70.00|     ₹0.00|  -₹210.00|   -₹90.00*  
                  | Policy 3: Merchant-Paid per-consignment   |    -₹280.00 |     ₹0.00|  -₹280.00|     ₹0.00|  +₹120.00   
                  | Policy 4: Conditional Free Shipping >₹1.2k|    -₹280.00 |     ₹0.00|     ₹0.00|  -₹280.00|  -₹160.00*  
                  | Policy 5: Partial Subsidy (₹50 Surcharge) |    -₹280.00 |  +₹220.00|     ₹0.00|   -₹60.00|   +₹60.00   
========================================================================================================================
```
*\*Asterisked Contributions indicate an operating cash deficit on the order.*

---

## 3. Deep Dive into the Five Evaluated Policies

### Policy 1: Strict Per-Consignment Pass-Through (Model E)
- **Mechanism:** Customer is charged an itemized shipping fee of **₹70.00 per vendor consignment** ($N \times ₹70.00$).
- **Customer Experience:** High friction. A 3-vendor order incurs ₹210.00 in shipping fees.
- **Financial Solvency:** **100% Protected.** ATEEVRA incurs zero shipping deficit. Operating margin is identical whether an order has 1 or 4 merchants (+₹120.00 on ₹1,500 GMV).
- **Advisory Rating:** **Essential for MVP Capital Preservation.** Recommended as the default baseline until operating cash flows and transaction telemetry stabilize.

### Policy 2: Flat Basket Shipping with Platform Deficit Absorption
- **Mechanism:** Customer is charged a flat **₹70.00 shipping fee**, regardless of how many vendors are in the cart. ATEEVRA absorbs the difference.
- **Customer Experience:** Optimal. Seamless single-store perception.
- **Financial Solvency:** **Disastrous Deficit.** A 3-vendor order creates a -₹140.00 freight deficit, driving net platform contribution from +₹120.00 down to **-₹20.00 (Operating Loss)**. A 4-vendor order generates a **-₹90.00 operating loss**.
- **Advisory Rating:** **Strictly Prohibited for MVP.**

### Policy 3: Merchant-Paid Per-Consignment Freight
- **Mechanism:** Forward freight is borne by merchants. ATEEVRA debits ₹70.00 from each merchant's settlement realization.
- **Customer Experience:** Exceptional. Customer sees "Free Shipping" across the entire store.
- **Merchant Impact:** Severe friction for low-priced items. A merchant selling a ₹400 scarf loses ₹70 (17.5% of value) in freight plus ₹40 platform fee, leaving only ₹290 realization.
- **Advisory Rating:** Only viable for high-margin luxury or premium designer tiers.

### Policy 4: Universal Conditional Free Shipping (Threshold at ₹1,199.00)
- **Mechanism:** If the customer's cart exceeds ₹1,199.00, forward shipping is free, and ATEEVRA absorbs all 3PL freight charges.
- **Financial Solvency:** While self-sustaining on a single-vendor basket (+₹50.00 contribution on ₹1,500), multi-vendor baskets produce catastrophic losses:
  - 2 Vendors: Platform margin drops to **-₹20.00**.
  - 3 Vendors: Platform margin drops to **-₹90.00**.
  - 4 Vendors: Platform margin drops to **-₹160.00**.
- **Advisory Rating:** Unviable for mixed carts unless qualified by a **Vendor Count Cap** (e.g. Free shipping applies only if all items belong to 1 merchant, or if basket exceeds ₹2,999).

### Policy 5: Partial Subsidy with Surcharge (₹70 Base + ₹50 per Additional Vendor)
- **Mechanism:** Customer pays ₹70.00 for the first vendor, plus a discounted **₹50.00 surcharge** for each additional merchant. ATEEVRA funds the ₹20.00 gap per extra vendor.
- **Customer Experience:** Balanced. A 2-vendor order incurs ₹120.00; a 3-vendor order incurs ₹170.00.
- **Financial Solvency:** Positive across all tiers (+₹100.00 on 2 vendors; +₹80.00 on 3 vendors; +₹60.00 on 4 vendors).
- **Advisory Rating:** **Strong Growth-Stage Candidate.** Viable once ATEEVRA allocates an explicit marketing subsidy budget.

---

## 4. The Multi-Vendor Promotional Subsidy Budget Cap Model

If the Project Owner selects a customer-friendly model that involves platform subsidies (such as Policy 2 or Policy 5), the platform must implement an **Inviolable Monthly Promotional Subsidy Budget Cap**:

$$\mathbf{\text{Monthly Multi-Vendor Subsidy Pool } (B_{\text{sub}})} = \mathbf{₹50,000.00 \text{ per Calendar Month}}$$

### Operational Control Engine
1. **Real-Time Subsidy Tracking:**  
   Every multi-vendor order logging an unbacked freight gap debits the ledger account `EXP_MARKETING_FREIGHT_SUBSIDY`.
2. **Automated Fallback Trigger:**  
   If cumulative monthly subsidies reach **90% of the budget cap (₹45,000.00)**:
   - Medusa checkout dynamically falls back to **Policy 1 (Strict Per-Consignment Model E: ₹70 per vendor)**.
   - The platform prevents unbudgeted cash burn without human intervention.
3. **P&L Isolation:**  
   The subsidy is categorized as a **Promotional Marketing Acquisition Expense**, completely isolated from base 3PL logistics cost centers.

---

## 5. Strategic Decision Framework for Project Owner

```
+---------------------------------------------------------------------------------------------------+
| MULTI-VENDOR STRATEGIC POLICY TRADEOFF MATRIX                                                     |
+---------------------------------------------------------------------------------------------------+
| Policy Alternative             | Customer Friction | Merchant Friction | Platform Solvency Risk   |
+--------------------------------+-------------------+-------------------+--------------------------+
| **Policy 1: Model E Pass-Thru**| **HIGH**          | **ZERO**          | **ZERO RISK (Recommended)|
| **Policy 5: Staged Subsidy**   | **MODERATE**      | **ZERO**          | **CONTROLLED (With Cap)**|
| **Policy 3: Merchant Paid**    | **ZERO**          | **HIGH**          | **ZERO RISK**            |
| **Policy 2: Flat ₹70 Basket**  | **ZERO**          | **ZERO**          | **UNACCEPTABLE DRAIN**   |
| **Policy 4: Cond. Free Ship**  | **ZERO**          | **ZERO**          | **SEVERE DEFICIT >1 VEND**|
+---------------------------------------------------------------------------------------------------+
```

---

## 6. Governance Conclusion

1. **Multi-Vendor Policy Invariant:** Multi-vendor cart economics remain **UNDECIDED**. No policy is approved on behalf of the Project Owner.
2. **Deficit Transparently Proven:** The mathematical schedule proves that flat shipping on mixed carts loses -₹70 per extra vendor.
3. **Zero Software Implementation:** No checkout rules, freight algorithms, or database schemas have been altered.
