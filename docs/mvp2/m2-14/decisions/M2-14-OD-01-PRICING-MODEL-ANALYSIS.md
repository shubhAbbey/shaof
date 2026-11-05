# ATEEVRA Phase M2-14 — Supporting Decision Analysis
## OD-01: Marketplace Commercial Revenue Architecture & Platform Fee Model

**Document Classification:** `OFFICIAL OWNER DECISION SUPPORTING ANALYSIS & MARKETPLACE MODEL REASSESSMENT`  
**Parent Document:** [`../M2-14-OWNER-DECISION-REGISTER.md#od-01`](../M2-14-OWNER-DECISION-REGISTER.md#od-01)  
**Decision ID:** `OD-01`  
**Decision Topic:** Marketplace Revenue Architecture, Seller-of-Record Governance, and Platform Facilitation Fee Model  
**Owner Business Model Direction:** Marketplace Facilitation Platform (Merchants as Sellers of Record)  
**Decision Status:** `OWNER DIRECTION RECORDED — PENDING FEE SELECTION & PROFESSIONAL VALIDATION`  
**Implementation Invariant:** `STRICTLY DOCUMENTATION AND ANALYSIS ONLY — ZERO APPLICATION CODE OR MIGRATIONS AUTHORIZED`  
**Companion Documents:**
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md`](../blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md`](../blueprint/M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md`](../blueprint/M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md)
- [`docs/mvp2/m2-14/blueprint/policies/OD-02-06-PRICING-BOUND-CONFLICTS.md`](../blueprint/policies/OD-02-06-PRICING-BOUND-CONFLICTS.md) (Approved v1.0.0 Baseline)

---

## 1. Specification References & Governance Authority

- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`:
  > *"Define financial source of truth, commission, discounts, tax/shipping allocation, partial refunds, COD, exchange differences, adjustments, net payable and settlement lifecycle before earnings/payout."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L15`:
  > *"No hardcoded production merchants, warehouses, roles, prices, commission, status or payout dates."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L31`:
  > *"Distinguish order total, seller gross sales, platform commission, refunds, adjustments, net payable and settlement."*
- [`M2-14-EXECUTION-PLAN.md#Section 2`](../M2-14-EXECUTION-PLAN.md#2-four-dimension-financial-policy-boundaries):
  > Enforces Gross Transaction Data (`quantity * unitPrice`) without hardcoded commission deductions.

---

## 2. Project Owner Business Model Direction & Model Reassessment

### 2.1. Project Owner's Clarified Commercial Direction
The Project Owner has formally clarified the commercial and legal business model direction for ATEEVRA in Phase M2-14:
1. **Merchants are Sellers of Record:** Third-party merchants list and sell their products directly to retail customers on the ATEEVRA marketplace platform. The merchant is the vendor of record issuing the customer-facing tax invoice.
2. **Direct Contract of Sale:** The contract of sale for goods is formed directly between the merchant and the end customer.
3. **Marketplace & Technology Intermediary:** ATEEVRA operates strictly as an Electronic Commerce Operator (ECO) providing digital marketplace software, storefront discovery, payment gateway routing, and technology facilitation services.
4. **Platform Revenue via Separately Defined Facilitation Fee:** ATEEVRA earns revenue through a separately negotiated, transparently defined platform/facilitation fee charged for its marketplace services.
5. **No Wholesale Inventory Ownership / Resale:** ATEEVRA is **NOT** intended to purchase merchant inventory, take title to physical goods, or act as a wholesale buyer reselling products to consumers.

### 2.2. Reassessment of Previous OD-01 Models
- **Why Previous Mode 1 (Wholesale Markup) Fails the Clarified Model:**  
  Mode 1 previously assumed ATEEVRA bought goods at $P_{\text{realization}}$ and resold at $P_{\text{sell}}$, treating $(P_{\text{sell}} - P_{\text{realization}})$ as automatic wholesale markup. In a seller-of-record model, the merchant invoices the customer for the full selling price $P_{\text{sell}}$ and recognizes that gross amount in its books. ATEEVRA cannot unilaterally pocket the spread. Instead, ATEEVRA's revenue must be defined contractually as a **Platform Facilitation Fee** billed to the merchant (+ 18% GST).
- **Why Mode 2 (Dynamic Revenue Share) Remains Deferred:**  
  Mode 2 introduced high accounting opacity and dispute risk. It remains unapproved.
- **The Shift to Marketplace Platform Fee Structures:**  
  The commercial focus of OD-01 shifts from wholesale markup algorithms to selecting the optimal **Marketplace Facilitation Fee Architecture** (evaluated in detail in [`M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md`](../blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md)).

---

## 3. Current Implementation & Architecture Baseline

- **Medusa v2 Core PostgreSQL Schema:**
  - Medusa core `order_line_item` stores `unit_price`, `quantity`, and `subtotal`.
  - There are **zero commission or markup fields** in the installed database schema.
- **Backend Merchant Order API:**
  - [`apps/backend/src/api/merchant/orders/[id]/route.ts#L122-L132`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/apps/backend/src/api/merchant/orders/%5Bid%5D/route.ts#L122-L132) calculates `scopedSubtotal = sum(unitPrice * qty)`.
  - It reports strictly gross sales for owned line items.
- **Architecture Invariant:**
  - The system strictly prohibits faking "net earnings" or assuming an unapproved commission percentage (e.g. 0% or 10%).
  - Truthful gross transaction data is displayed until the platform owner signs off on formal commercial rules.

---

## 4. Rigorous Pricing Terminology & Mathematical Constraints

### A. The Four Core Pricing Variables in a Seller-of-Record Marketplace
- **$P_{\min}$:** Merchant-approved minimum acceptable net product realization per unit (the absolute floor below which the merchant cannot be settled).
- **$P_{\text{merchant}}$:** Merchant-declared product retail price (the basis for the customer shelf price and the merchant's B2C tax invoice).
- **$P_{\max}$:** Merchant-approved maximum customer-facing selling price per unit (to protect omnichannel price parity).
- **$P_{\text{sell}}$:** Storefront customer-facing selling price per unit. In a pure seller-of-record model without customer fees, $P_{\text{sell}} = P_{\text{merchant}}$.

### B. Complete Mathematical Pricing Constraints
The pricing engine must strictly enforce:
$$\mathbf{P_{\text{realization}} \le P_{\text{sell}} \le P_{\max} \le \text{Statutory Package MRP}}$$
- Where $\text{Net Merchant Realization} = P_{\text{sell}} - \text{Platform Fee} - \text{GST on Fee} - \text{Statutory TCS/TDS}$.
- **Non-Negativity Constraint:** Net merchant realization must never fall below $P_{\min}$. If platform fees cause net realization to drop below $P_{\min}$, the pricing conflict hierarchy in [`POL-OD-02-06`](../blueprint/policies/OD-02-06-PRICING-BOUND-CONFLICTS.md) executes.

### C. Statutory Terminology Safeguard: $P_{\max}$ vs. Legal MRP
- In compliance with Indian Legal Metrology (Packaged Commodities) Rules, the term **Maximum Retail Price (MRP)** is a statutory declaration that can only be printed on physical packaging by the manufacturer or importer.
- **$P_{\max}$ must strictly be defined and displayed as "maximum customer-facing selling price"**, unless the actual legally declared MRP is separately captured, verified, and displayed as the statutory package ceiling ($P_{\text{sell}} \le \text{MRP}$).

---

## 5. Critical Financial & Compliance Safeguards

### A. Platform Facilitation Fee Invoicing (SAC 998371)
ATEEVRA's facilitation fee is a B2B supply of digital marketplace services:
- Billed to the merchant under SAC 998371;
- Attracts **18% GST**;
- ATEEVRA issues a B2B Tax Invoice; registered merchants claim Input Tax Credit (ITC).

### B. Verified Statutory Tax Withholding Rates (Post-2024 Gazette Updates)
- **GST Section 52 TCS:** **0.50% total** (0.25% CGST + 0.25% SGST / 0.50% IGST) on net taxable supplies, pursuant to **CBIC Notification No. 15/2024–Central Tax (effective 10 July 2024)**.
- **Income Tax Section 194-O TDS:** **0.10%** on gross sales, pursuant to the **Finance (No. 2) Act, 2024 (effective 1 October 2024)**, subject to the ₹5,00,000 threshold for Individual/HUF sellers.

### C. Mandatory Qualified Indian Legal & CA Tax Review Required
1. **FDI Marketplace Boundaries:** Confirmation that setting customer prices within merchant-authorized bands $[P_{\min}, P_{\max}]$ complies with Press Note 2 of 2018.
2. **Consumer Protection E-Commerce Rules:** Confirmation of Rule 5(3)(b) compliance and seller disclosures under Rule 6.
3. **Escrow Turnaround:** Compliance with RBI Payment Aggregator Guidelines regarding nodal escrow settlements.

---

## 6. Evaluated Platform Fee Options Matrix

| Option | Commercial Structure | Revenue Mechanics | Pros | Cons | Recommendation Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **Option A** | **Fixed Fee Per Order** | Flat ₹50.00 base per fulfilled order. | Simple; attractive for high-value orders. | Deficit on low AOV; doesn't scale with basket size. | Viable for niche B2B |
| **Option B** | **Fixed Fee Per Item** | Flat ₹25.00 base per delivered unit. | Directly tied to unit logistics. | Penalizes multi-item low-cost bundling. | Flawed for bundles |
| **Option C** | **Percentage Facilitation Fee** | **8.0% to 10.0%** of customer product price. | **Scales with product value; covers OD-02 return reserves; industry standard.** | Lower absolute fee on cheap products. | **PRIMARY ADVISORY RECOMMENDATION** |
| **Option D** | **Hybrid Platform Fee** | **₹20.00 fixed + 5.0% percentage.** | **Guaranteed baseline cost recovery + value scaling.** | Slightly higher reconciliation math. | **STRONG ALTERNATIVE** |
| **Option E** | **Customer Convenience Fee** | Flat ₹19.00 billed to customer at checkout. | Merchants pay zero fees. | **High cart abandonment; CCPA dark pattern scrutiny.** | **NOT RECOMMENDED** |

---

## 7. Trade-Off Analysis of Recommended Option C (Percentage Fee)

| Stakeholder Perspective | Key Advantages | Key Disadvantages & Risks |
| :--- | :--- | :--- |
| **Merchant Perspective** | Seller of record transparency; retains control of retail pricing; pays only on realized sales; claims 18% GST ITC on platform fee. | High-value product sellers pay higher absolute fee; must maintain price parity. |
| **ATEEVRA Perspective** | Dynamically scales revenue with order value; generates sufficient contribution to absorb OD-02 Return Reserves and payment processing fees; clean FDI compliance. | Lower revenue on low-ticket items; requires category-specific calibration. |
| **Customer Perspective** | Completely transparent retail pricing; zero surprise checkout fees or drip pricing. | None. Standard e-commerce experience. |

---

## 8. Financial Impact Breakdown

- **ATEEVRA:** Earns transparent service revenue (e.g., 10% = ₹100 on ₹1,000 order). Out of this revenue, ATEEVRA funds gateway MDR (₹20), the Return-Cost Reserve (₹22.61), and customer service, yielding a healthy **+₹57.39 net contribution** (assuming shipping neutrality).
- **Merchants:** Receives gross product sales less platform fee and statutory tax withholdings ($₹1,000 - ₹118 - ₹5.24 = ₹876.76 net payout).
- **Customers:** Pays transparent shelf price $P_{\text{sell}}$.

---

## 9. Required System Changes (When Authorized)

*(Strictly planning specification — zero code or schema changes authorized)*

- **Database (Proposed):**
  - Extend product variant schema: `min_price_in_cents`, `max_price_in_cents`, `merchant_price_in_cents`.
  - Extend `order_line_item`: `platform_fee_cents`, `platform_fee_gst_cents`, `tcs_withheld_cents`, `tds_withheld_cents`.
  - Create `merchant_platform_fee_invoice` ledger table.
- **Backend Services:** `PlatformFeeEngine` service; checkout line-item calculation pipeline; boundary validator guards.
- **Merchant Portal UI:** Pricing bound inputs; monthly B2B platform fee invoice download tab.
- **Admin UI:** Fee rate configuration dashboard, category fee override matrix.

---

## 10. Explicit Policy Dependencies & OD-02 Compatibility

- **OD-02 (Refund Financial Liability):** 100% compatible. When a customer remorse return occurs, ATEEVRA waives/credits the platform fee via GST Credit Note and absorbs logistics/gateway friction via the Return-Cost Reserve ([POL-OD-02-01](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-01-RETURN-COST-RESERVE.md)). On merchant-fault returns, logistics are debited to the merchant ([POL-OD-02-04](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md)).
- **OD-03 (Coupon Allocation):** Platform coupon discounts are accounted for against platform marketing accounts and do not reduce the merchant's gross product entitlement.
- **OD-04 (Shipping Revenue Allocation):** Shipping fees collected from customers are retained by the platform to neutralize 3PL logistics costs, ensuring fee revenue remains unburdened by freight deficits.
- **OD-05 (Statutory Tax Withholding):** Section 52 TCS (0.5%) and Section 194-O TDS (0.1%) are deducted directly from the merchant's net payout ledger.
- **OD-07 (Merchant Settlement Payouts):** Payouts are calculated strictly as:
  $$\text{Net Payout} = \sum P_{\text{item}} - \text{Fee} - \text{GST on Fee} - \text{TCS} - \text{TDS} - \text{OD-02 Debits} \pm \text{Reserves}$$

---

## 11. Exact Questions Requiring Project Owner Decision

When ready to decide, the Project Owner will be requested to approve:

> **Owner Decision Frame for OD-01:**  
> 1. Do you formally ratify the **Marketplace Facilitation Platform Model** (merchants as direct sellers of record, issuing B2C customer invoices)?  
> 2. Which platform fee structure do you select: **Option C (Percentage Fee, e.g., 8–10%)** or **Option D (Hybrid Fee, e.g., ₹20 + 5%)**?  
> 3. Do you confirm that forward shipping freight (₹70) must be shipping-neutral (billed to customer at checkout or charged to merchant) to prevent platform contribution deficits?
