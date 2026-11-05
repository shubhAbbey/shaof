# ATEEVRA Policy: OD-02-01 — Return-Cost Reserve Calibration

**Policy ID:** `POL-OD-02-01`  
**Policy Name:** Return-Cost Reserve Calibration Architecture  
**Owner Decision Reference:** OD-02 (Sub-Decision OD-02-01)  
**Approval Status:** `OWNER APPROVED — INITIAL POLICY BASELINE`  
**Current Version:** `1.0.0`  
**Effective Date:** Initial Baseline (Mandatory Validation Gates Apply Before Production)  
**Parent Blueprint:** [`../ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](../ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Policy Register:** [`../POLICY-REGISTER.md`](../POLICY-REGISTER.md)

---

## 1. Executive Summary & Purpose

This policy establishes the methodology by which ATEEVRA calibrates and allocates an internal **Return-Cost Pricing Reserve** ($R_{\text{return}}$) within the platform's gross commercial markup ($M_{\text{gross}} = P_{\text{sell}} - P_{\text{realization}}$).

The purpose of this reserve is to act as an internal risk-buffer provision that financially covers platform-absorbed return, incident, and doorstep refusal costs (including reverse shipping, non-refundable gateway MDR, doorstep attempt fees, and RTO transit) across aggregate catalog sales, without charging customers separate return-shipping fees or reducing merchant realizations.

---

## 2. Owner-Approved Decision

> **APPROVED INITIAL POLICY: CATEGORY-SPECIFIC RESERVE**
> 
> 1. ATEEVRA shall maintain **category-specific** return-cost reserve assumptions across the product catalog.
> 2. The platform shall maintain **strictly separate actuarial assumptions for prepaid orders versus Cash on Delivery (COD) orders**.
> 3. Reserves shall be calculated mathematically using empirical/modeled **expected incident probabilities** ($P_k$) and **expected net financial costs** ($C_k$).
> 4. For initial launch, reserve parameters shall operate at the **category level** (with a conservative blended rate during early cold-start), capturing catalog telemetry from Day 1.
> 5. **Merchant-specific risk adjustments** (e.g. seller quality scores or defect penalties) shall NOT be applied at launch, and may only be introduced after statistically meaningful operating volume (minimum 90 days and sufficient order count) is established.
> 6. Actual incurred return expenses must be reviewed periodically against reserve allocations (30-day, 60-day, and 90-day review cycles).
> 7. All calculation formulas, actuarial assumptions, effective dates, and model versions must be durably versioned and preserved.

---

## 3. Governance and Approval Status

- **Status:** `OWNER APPROVED — INITIAL POLICY BASELINE`
- **Governance Invariants:**
  - This policy establishes the binding commercial policy direction approved by the platform owner.
  - Approval does NOT authorize immediate application code, schema, or runtime changes for Phase M2-14.
  - Formal implementation remains gated on statutory CA/auditor review, legal compliance verification under the Consumer Protection (E-Commerce) Rules, 2020, and technical architecture review.
  - Changes to reserve calibration parameters must follow the formal change-control protocol defined in [`../POLICY-CHANGELOG.md`](../POLICY-CHANGELOG.md).
  - Previously placed orders shall remain governed by the policy version active at their placement time.

---

## 4. Rationale & Commercial Justification

1. **Adverse Cross-Subsidization Avoidance:**  
   A single, platform-wide flat reserve percentage or fixed rupee fee is commercially defective. In ecommerce:
   - High-return fashion categories (e.g. Women's Ethnic Wear, Footwear, Fitted Western Wear) routinely experience 25%–35% return rates due to sizing and tactile remorse.
   - Low-return categories (e.g. Belts, Scarves, Fashion Accessories, Unstitched Fabric) experience 3%–7% return rates.  
   Applying a flat reserve would artificially overprice low-return products (destroying merchant competitiveness) while underfunding high-return products (depleting platform cash).
2. **Payment Rail Risk Differentiation:**  
   Prepaid orders exhibit significantly lower cancellation and incident risk (modeled baseline: 87.5% retention, 6.0% remorse returns, 4.0% cancellations). In contrast, COD orders carry high doorstep refusal and Return-to-Origin (RTO) friction (modeled baseline: 77.49% retention, 18.00% doorstep refusal/RTO, 3.28% post-delivery remorse). Separate risk modeling is essential to maintain portfolio solvency.
3. **Managerial Reserve vs. Statutory Deduction:**  
   The reserve is strictly an internal pricing allocation within platform markup. It is **never** presented to the customer as an added fee, **never** deducted from merchant realization, and **never** treated as an immediate cash outlay at order placement.

---

## 5. Scope & Applicability

- **In Scope:**  
  - All product categories active on the ATEEVRA multi-merchant marketplace.
  - Internal pricing calculations determining customer shelf price ($P_{\text{sell}}$) relative to merchant realization ($P_{\text{realization}}$).
  - P&L risk modeling for prepaid and COD fulfillment rails.
- **Out of Scope:**  
  - Merchant payout deduction formulas (merchant realization remains fixed per Mode 1).
  - Customer invoice line items (customers see a single product selling price).
  - Direct statutory tax provisioning (reserve is a managerial cost buffer, not a GST or corporate tax reserve).

---

## 6. Business Rules & Calculation Methodology

### Rule 1: Three Distinct Financial Measurements
To prevent double-counting and financial misstatements, the platform calculation engine must strictly distinguish:

1. **Measurement A: Net Incremental Incident Expense ($\mathbb{E}[\text{Incident Expense}]$):**  
   The probability-weighted sum of *out-of-pocket expenses that would NOT have occurred had the order completed successfully*.
   - *Prepaid Model:* Gateway MDR on canceled orders + reverse shipping on remorse returns = **₹5.43 per placed order**.
   - *COD Model:* Doorstep attempt fee + RTO freight on doorstep refusals + reverse freight and IMPS payout rail fees on returns = **₹21.22 per placed order**.
2. **Probability-Weighted Gross Cash Outflow Drain:**  
   The total probability-weighted gross cash flowing out of ATEEVRA accounts across all failed orders. This bundles baseline forward fulfillment costs (forward shipping, COD collection fees) already embedded in failed orders.
   - *Prepaid Model:* **₹16.85 per placed order** (includes ₹11.42 of sunk baseline fulfillment/gateway costs).
   - *COD Model:* **₹38.78 per placed order** (includes ₹17.56 of sunk forward fulfillment/COD collection costs).
   - *Rule:* Gross cash drain must **NEVER** be cited as the incremental return reserve.
3. **Measurement B: Expected Lost Contribution ($\mathbb{E}[\text{Lost Contribution}]$):**  
   The probability-weighted reduction from the baseline contribution of a successful retained order ($C_{\text{successful}}$).
   - *Prepaid Model:* **₹30.15 per placed order**.
   - *COD Model:* **₹59.04 per placed order**.

### Rule 2: Expected Unit Contribution Invariant (Measurement C)
The pricing engine must verify that Expected Contribution calculated via outcome probability sums (Method A) matches baseline contribution minus lost contribution (Method B):
$$\mathbb{E}[\text{Contribution}] = \sum_{k} P_k \times C_k = C_{\text{successful}} - \mathbb{E}[\text{Lost Contribution}]$$

- *Prepaid Baseline:* $+₹106.40 - ₹30.15 = \mathbf{+₹76.25 \text{ per placed order}}$.
- *COD Baseline:* $+₹90.00 - ₹59.04 = \mathbf{+₹30.96 \text{ per placed order}}$.

### Rule 3: Category Calibration & Telemetry Capture
1. At launch, the pricing engine applies initial category-level reserve buffers ($R_{\text{cat}}$) based on industry benchmarks:
   - High-Return Apparel (Dresses, Kurtas, Trousers): $R_{\text{cat}} = 12\%–18\%$ of gross markup.
   - Low-Return Accessories (Dupattas, Stoles, Bags): $R_{\text{cat}} = 4\%–6\%$ of gross markup.
2. The platform telemetry service must record order placement, return requests, return reasons, and final settlement disposition tagged with `category_id` and `sub_category_id`.
3. An actuarial review must run every 30 days during the first 90 days post-launch, recalibrating $R_{\text{cat}}$ against rolling 30-day realized loss rates.

### Rule 4: Prohibition of Premature Merchant-Risk Scores
Merchant-specific defect penalties or risk multipliers must NOT be applied to product pricing or reserve allocations until:
- The merchant has completed $\ge 100$ delivered orders; and
- The merchant has been active for $\ge 90$ calendar days; and
- A formal policy revision is approved by the platform owner.

---

## 7. Preconditions and Exceptions

### Preconditions
- The product must be assigned to an active, verified catalog category.
- Merchant realization ($P_{\text{realization}}$) and price ceiling ($P_{\max}$) must be verified before reserve calculation.

### Exceptions
- **Custom-Made / Made-to-Order Items:** If a category is formally classified as non-returnable under consumer law (except for manufacturing defect or transit damage), the remorse return reserve component is set to zero, but transit damage and pre-dispatch cancellation reserves remain active.
- **Clearance / Final Sale:** Any special clearance event modifying return eligibility requires a separate, owner-approved policy amendment.

---

## 8. Stakeholder Impacts

| Stakeholder | Direct Impact |
| :--- | :--- |
| **Customer** | **Zero Friction:** Customers are never charged return-shipping fees. Customer shelf price is fair and transparent. |
| **Merchant** | **Fair & Protected:** Realization is not secretly docked to fund platform return reserves. No arbitrary risk penalties at launch. |
| **ATEEVRA Platform** | **Solvency & Predictability:** Markup systematically provisions for reverse logistics and failed order expenses, preventing surprise operating deficits. |
| **Payment Gateway / 3PL** | **Contractual Settlement:** Fees are paid according to standard commercial schedules; platform manages risk internally. |

---

## 9. Concrete Financial Example (₹1,000 Shelf Price)

| Operational Variable | Prepaid Order Baseline | Cash on Delivery (COD) Baseline |
| :--- | :---: | :---: |
| **Customer Shelf Price ($P_{\text{sell}}$)** | ₹1,000.00 | ₹1,000.00 |
| **Merchant Realization ($P_{\text{realization}}$)** | ₹800.00 | ₹800.00 |
| **Gross Platform Markup ($M_{\text{gross}}$)** | ₹200.00 | ₹200.00 |
| **Variable Fulfillment Costs ($C_{\text{variable}}$)** | ₹93.60 *(MDR ₹23.60 + Ship ₹70.00)* | ₹110.00 *(COD Fee ₹40.00 + Ship ₹70.00)* |
| **Baseline Retained Contribution ($C_{\text{successful}}$)** | **+₹106.40** | **+₹90.00** |
| **Probability of Retained Success ($P_{\text{success}}$)** | 87.50% | 77.49% |
| **Net Incremental Incident Expense (Measurement A)** | **₹5.43** per placed order | **₹21.22** per placed order |
| **Probability-Weighted Gross Cash Drain** | **₹16.85** per placed order | **₹38.78** per placed order |
| **Expected Lost Contribution (Measurement B)** | **₹30.15** per placed order | **₹59.04** per placed order |
| **Expected Unit Contribution (Measurement C)** | **+₹76.25** per placed order | **+₹30.96** per placed order |

> [!CAUTION]
> Under no circumstances may the pricing engine subtract the reserve allocation a second time from Expected Unit Contribution, as Expected Unit Contribution already accounts for all return outlays.

---

## 10. Required Evidence and Audit Trails

1. **Category Rate Card Table:** Persisted in PostgreSQL database with columns: `category_id`, `prepaid_reserve_pct`, `cod_reserve_pct`, `effective_from`, `effective_to`, `approved_by`.
2. **Order-Level Telemetry Log:** Order snapshot linking `order_id` to the active `reserve_model_version` applied at checkout.
3. **Monthly Actuarial Reconciliation Report:** Comparing actual reverse logistics and gateway expenses debited vs. reserve provisions accumulated across categories.

---

## 11. Dispute & Escalation Procedures

- **Category Misclassification Disputes:** If a merchant disputes the category assigned to an item (claiming an accessory was placed in high-return apparel), the merchant may submit a category re-evaluation ticket to Platform Operations.
- **Reclassification Authority:** Reclassification requires review by Catalog Operations and approval by the Category Lead.
- **No Retroactive Pricing Adjustment:** Category changes apply strictly to future orders; settled transactions are not re-priced.

---

## 12. Accounting and Reconciliation Considerations

- **Ledger Classification:** The Return-Cost Reserve is an internal management accounting provision, NOT a separate statutory balance sheet liability under Ind AS / IFRS unless formal provisioning rules are mandated by statutory auditors.
- **GST Consideration:** GST is levied on the actual invoice value ($P_{\text{sell}}$) and platform service fee/commission, not on internal reserve components.
- **Audit Verification:** Requires annual verification by ATEEVRA's statutory auditors to confirm alignment between managerial cost models and actual P&L logistics expenditures.

---

## 13. Dependencies & Open Questions

- **Dependencies:**
  - Category taxonomy schema in Medusa / PostgreSQL.
  - Finalization of OD-01 Pricing Model (OD-01 remains under review).
- **Open Questions:**
  - Exact Day 1 initial category reserve percentages (to be finalized with Category Leads prior to commercial launch).
  - Actuarial software tool / SQL dashboard for monthly reserve vs. actual variance reporting.

---

## 14. Review Frequency & Change Triggers

- **Scheduled Review:** Monthly during the first quarter post-launch; quarterly thereafter.
- **Automatic Change Triggers:**
  - Realized category return rate exceeds modeled rate by more than 5 percentage points over a rolling 30-day window.
  - 3PL logistics provider issues a general freight rate increase.
  - Owner issues a formal policy revision.

---

## 15. Controlled Revision Notice: Baseline v1.1.0-PROPOSED Addendum

> [!NOTE]
> **GOVERNANCE STATUS: OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)**  
> Pursuant to Project Owner directions issued on 2026-11-04 regarding Cancellation, Return, RTO & Merchant Accountability (OD-15), a controlled policy revision (`v1.1.0-PROPOSED`) has been formulated:
> - **Superceding Policy Reference:** [`POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md`](POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md) and [`M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md`](../M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md).
> - **Key Proposed Change:** Shifts 100% platform-absorbed reverse freight on post-delivery customer returns to a weight-based merchant reverse-shipping fee (₹30 to ₹165+). Platform Return-Cost Reserve target is correspondingly reduced from ₹22.61 to ~₹7.85 per order.
> - **Legal Baseline:** This document (`POL-OD-02-01` v1.0.0) remains the approved baseline until formal Owner Ratification is executed.
