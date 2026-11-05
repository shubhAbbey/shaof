# ATEEVRA M2-14 — Revised Financial Model & Unit Economics Stress Test (v1.1.0-PROPOSED)

**Document Reference:** `DOC-M214-FIN-MODEL-V110`  
**Parent Blueprint:** [`ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Associated Policies:** [`policies/POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md`](policies/POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md) through [`policies/POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md`](policies/POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md)  
**Governance Status:** `OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)`  
**Baseline Policy Version:** `1.1.0-PROPOSED`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Context

This financial stress test updates the ATEEVRA unit economics model to reflect the Project Owner's revised directions:
1. **Weight-Based Merchant Reverse Shipping on Post-Delivery Returns:** ₹30 (500g), ₹50 (1kg), ₹80 (2kg), ₹120 (5kg), ₹165+ (>5kg), exclusive of 18% GST.
2. **Zero Reverse Shipping on Genuine RTOs:** Failed deliveries incur ₹0 merchant reverse-shipping debit; platform absorbs reverse freight via COD fees/reserve.
3. **Merchant Cancellation Penalty:** Provisional ₹25.00 debit per merchant-initiated cancellation.
4. **Merchant Late Dispatch Penalty:** Provisional ₹50.00 debit per order dispatched past SLA.
5. **Customer Pre-Dispatch Cancellation:** ₹0 merchant penalty, ₹0 reverse shipping, 100% full customer refund.

### Baseline Parameters
- **Product Value (GMV):** ₹1,000.00
- **Provisional Platform Facilitation Fee:** 10.0% = ₹100.00 (exclusive of 18% GST = ₹118.00 gross fee)
- **Payment Gateway MDR:** 1.8% + 18% GST = 2.124% (Prepaid: ₹21.24)
- **Forward Shipping Cost:** ₹65.00 (absorbed under Scenario 1 Platform Subsidy or charged per agreed forward model)
- **Packaging & Handling Cost:** ₹45.00 (Merchant internal sunken drag)

---

## 2. Core Operational Scenarios (A through E)

### Scenario A: Standard Delivered Order (No Return)

| Line Item | Prepaid Order (₹) | COD Order (₹) | Legal / Statutory Note |
| :--- | :---: | :---: | :--- |
| **Gross Customer Payment** | ₹1,000.00 | ₹1,049.00 | Includes ₹49 COD handling fee |
| **Platform Facilitation Fee (excl. GST)** | ₹100.00 | ₹100.00 | 10% platform fee |
| **GST on Platform Fee (18%)** | ₹18.00 | ₹18.00 | ATEEVRA GST liability |
| **Payment Gateway MDR** | ₹21.24 | ₹0.00 | Absorbed by platform |
| **COD Collection Fee** | ₹0.00 | ₹30.00 | Paid to 3PL carrier |
| **Forward Logistics Cost** | ₹65.00 | ₹65.00 | Paid to 3PL carrier |
| **Merchant Net Settlement Payout** | **₹882.00** | **₹882.00** | Before TDS/TCS statutory withholdings |
| **Platform Net Contribution Margin** | **-₹4.24** | **+₹22.00** | Platform-subsidized forward shipping baseline |

*Note: If forward shipping is borne by customer or merchant, Platform Net Margin rises to +₹60.76 (Prepaid) and +₹87.00 (COD).*

---

### Scenario B: Customer Return After Delivery (By Weight Slabs)

In all return scenarios, the customer receives a **100% full refund (₹1,000.00)**. The platform facilitation fee is reversed (₹0 earned). The merchant is debited the weight-based reverse-shipping fee.

| Metric | Slab 1 (≤500g) | Slab 2 (501g–1kg) | Slab 3 (1.01–2kg) | Slab 4 (2.01–5kg) | Slab 5 (>5kg) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Base Reverse Fee** | ₹30.00 | ₹50.00 | ₹80.00 | ₹120.00 | ₹165.00 |
| **18% GST on Reverse Fee** | ₹5.40 | ₹9.00 | ₹14.40 | ₹21.60 | ₹29.70 |
| **Gross Merchant Debit** | **-₹35.40** | **-₹59.00** | **-₹94.40** | **-₹141.60** | **-₹194.70** |
| **Customer Refund** | ₹1,000.00 | ₹1,000.00 | ₹1,000.00 | ₹1,000.00 | ₹1,000.00 |
| **Merchant Inventory Position** | Restocked | Restocked | Restocked | Restocked | Restocked |
| **Merchant Packaging Drag** | -₹45.00 | -₹45.00 | -₹45.00 | -₹45.00 | -₹45.00 |
| **Merchant Net Total Position** | **-₹80.40** | **-₹104.00** | **-₹139.40** | **-₹186.60** | **-₹239.70** |
| **Platform Net Position** | -Forward - MDR | -Forward - MDR | -Forward - MDR | -Forward - MDR | -Forward - MDR |

> [!NOTE]
> Under the previous OD-02 v1.0.0 model, ATEEVRA lost ₹65–₹85 in reverse freight on every remorse return. Under v1.1.0-PROPOSED, the platform's reverse-freight cash leakage is **eliminated** (recovered from the merchant).

---

### Scenario C: Return to Origin (RTO / Failed Delivery)

The parcel reaches the delivery location but is refused or customer is unavailable.

| Financial Element | Prepaid RTO (₹) | COD RTO (₹) | Responsible Party |
| :--- | :---: | :---: | :--- |
| **Customer Refund** | ₹1,000.00 (100%) | ₹0.00 (Not paid) | ATEEVRA Escrow |
| **Platform Facilitation Fee** | ₹0.00 | ₹0.00 | Reversed (No sale) |
| **Forward Freight** | ₹65.00 | ₹65.00 | Paid to Courier |
| **Reverse Freight (RTO)** | ₹50.00 | ₹50.00 | Paid to Courier |
| **Merchant Reverse Fee Debit** | **₹0.00** | **₹0.00** | **₹0 charged to merchant** |
| **Merchant Settlement Payout** | ₹0.00 | ₹0.00 | No sale |
| **Merchant Packaging Drag** | -₹45.00 | -₹45.00 | Merchant internal loss |
| **Platform COD Fee Realized** | ₹0.00 | ₹49.00 (if collected) / ₹0 | Platform absorption |
| **Platform Net Cash Drag** | **-₹136.24** | **-₹115.00** | Absorbed via Platform Reserve / COD Fund |

---

### Scenario D: Merchant-Initiated Cancellation

Merchant cancels confirmed order due to stock-out or pricing error.

| Line Item | Value (₹) | Accounting / Cashflow Impact |
| :--- | :---: | :--- |
| **Customer Refund** | ₹1,000.00 | 100% full refund via payment gateway |
| **Platform Facilitation Fee** | ₹0.00 | Zero revenue recognized |
| **Gateway MDR Loss on Refund** | -₹21.24 | Incurred by ATEEVRA |
| **Merchant Cancellation Penalty** | **+₹25.00** | Debited from merchant settlement balance |
| **Merchant Net Cash Position** | **-₹25.00** | Net loss to merchant |
| **Platform Net Position** | **+₹3.76** | ₹25 penalty offsets ₹21.24 MDR leakage |
| **Merchant Account Health** | Degradation | +1 Count to Order Cancellation Rate (OCR) |

---

### Scenario E: Merchant Late Dispatch (Delivered Order)

Merchant dispatches package past SLA deadline, but customer accepts delivery.

| Line Item | Value (₹) | Accounting / Cashflow Impact |
| :--- | :---: | :--- |
| **Customer Payment** | ₹1,000.00 | Customer receives merchandise |
| **Platform Facilitation Fee (10%)** | ₹100.00 | Recognized as platform revenue |
| **Platform GST (18%)** | ₹18.00 | Remitted to tax authorities |
| **Late Dispatch Penalty** | **+₹50.00** | Debited from merchant settlement balance |
| **Forward Logistics** | -₹65.00 | Paid to 3PL courier |
| **Gateway MDR** | -₹21.24 | Paid to payment aggregator |
| **Merchant Settlement Payout** | **₹832.00** | ₹882 standard base - ₹50 late penalty |
| **Platform Net Realization** | **+₹45.76** | ₹100 Fee + ₹50 Penalty - ₹65 Shipping - ₹21.24 MDR - ₹18 GST |
| **Merchant Account Health** | Degradation | +1 Count to Late Dispatch Rate (LDR) |

---

## 3. Comparative Unit Economics: Baseline v1.0.0 vs. Proposed v1.1.0

The table below contrasts the blended platform unit economics per 1,000 orders under both models:
- Assumption: 1,000 orders of ₹1,000 GMV (Total GMV = ₹10,00,000).
- Delivered without return: 800 orders (80%).
- Delivered with customer return: 100 orders (10%, average 1kg = ₹50 fee).
- RTO (failed delivery): 50 orders (5%).
- Merchant cancellations: 30 orders (3%).
- Customer pre-dispatch cancellations: 20 orders (2%).
- Late dispatches among delivered: 50 orders (5%).

| Financial Metric | Approved Baseline (v1.0.0) | Proposed Revision (v1.1.0-PROPOSED) | Net Financial Variance |
| :--- | :---: | :---: | :---: |
| **Platform Facilitation Fee Revenue** | ₹85,000.00 | ₹85,000.00 | ₹0.00 |
| **Merchant Cancellation Penalties** | ₹0.00 | **+₹750.00** (30 × ₹25) | +₹750.00 |
| **Merchant Late Dispatch Penalties** | ₹0.00 | **+₹2,500.00** (50 × ₹50) | +₹2,500.00 |
| **Reverse Logistics Freight (Returns)** | **-₹6,500.00** (100 × ₹65) | **₹0.00** (Billed to Merchants) | **+₹6,500.00** |
| **Reverse Logistics Freight (RTO)** | -₹2,500.00 (50 × ₹50) | -₹2,500.00 (Platform absorbed) | ₹0.00 |
| **Forward Logistics Subsidy (Delivered + RTO)** | -₹61,750.00 (950 × ₹65) | -₹61,750.00 (950 × ₹65) | ₹0.00 |
| **Payment Gateway MDR Friction** | -₹20,000.00 | -₹20,000.00 | ₹0.00 |
| **Net Platform Contribution Margin** | **-₹5,750.00** | **+₹3,000.00** | **+₹8,750.00 (+152%)** |
| **Required Platform Reserve Target** | **₹22,610.00** (₹22.61/order) | **₹7,850.00** (₹7.85/order) | **-₹14,760.00 (-65%)** |

---

## 4. Sensitivity & Break-Even Analysis

### 4.1 Sensitivity to Customer Return Weight Slabs

If customer return weight distribution shifts towards heavier goods:
- At 500g average: Merchant recovery = ₹30/return; platform margin impact = neutral (fully recovered).
- At 2kg average: Merchant recovery = ₹80/return; 3PL courier invoice = ~₹75; platform generates a slight risk buffer (+₹5/return).
- At >5kg: Merchant recovery = ₹165+; full cost pass-through prevents margin erosion on bulky catalog items.

### 4.2 Impact on Merchant Viability

| Merchant Category | Average Return Rate | Average Weight Slab | Merchant Net Realization per 100 Orders | Margin Drag |
| :--- | :---: | :---: | :---: | :---: |
| **Apparel / Fashion** | 18% | 500g (₹30) | ₹81,828.00 | -7.2% |
| **Footwear** | 12% | 1.5kg (₹80) | ₹87,072.00 | -4.9% |
| **Consumer Electronics** | 5% | 1kg (₹50) | ₹93,800.00 | -2.1% |
| **Home & Kitchen** | 8% | 3.5kg (₹120) | ₹89,648.00 | -4.5% |

The weight-based structure directly incentivizes merchants with high-return SKUs (apparel, footwear) to improve size charts, image accuracy, and packaging quality.

---

## 5. Governance & Operational Restrictions

1. **Analytical Document Only:** This financial model provides scenario simulations for owner evaluation.
2. **Implementation Hold:** No financial billing algorithms or ledger debit rules may be implemented in production until formal Owner Ratification is completed.
3. **Traceability:** Governed under [`M2-14-OWNER-DECISION-REGISTER.md`](../../M2-14-OWNER-DECISION-REGISTER.md).
