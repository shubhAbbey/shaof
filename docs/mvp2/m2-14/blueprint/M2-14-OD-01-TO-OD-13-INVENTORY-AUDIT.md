# ATEEVRA Phase M2-14 — Master Documentation Inventory & Status Audit (OD-01 to OD-13)

**Document ID:** `AUD-M2-14-INVENTORY`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Audit Scope:** Complete Inventory of Owner Decisions OD-01 through OD-13  
**Audit Execution Mode:** STRICTLY READ-ONLY AUDIT & GOVERNANCE PLANNING  
**Active Phase:** Phase M2-14 (Payments, Refunds, Returns and Exchanges)  
**Implementation Authorization Status:** `PLANNING ONLY — IMPLEMENTATION NOT AUTHORIZED`  
**Date:** 2026-11-03  
**Active Branch:** `m2_14`  
**HEAD Commit:** `45dbb931899d9fa5813d1c56952e60f2b2a86826`

---

## 1. Executive Summary & Audit Purpose

This document provides an exhaustive, content-level inventory and status audit of all 13 Owner Decisions (OD-01 through OD-13) established for ATEEVRA Marketplace Phase M2-14.

Its primary objectives are to:
1. Establish the definitive documentation status and physical repository locations for every decision.
2. Evaluate existing business rules, documented assumptions, and mathematical models against platform architecture standards (`MVP2-AGENT-RULES.md`, `ARCHITECTURE.md`, `ADR-001`).
3. Explicitly identify which decisions are approved, which are proposed, and which remain unaddressed.
4. Pinpoint missing financial analyses, legal/statutory validation dependencies, and operational workflows.
5. Provide a rigorous 20-point audit profile for every decision from OD-01 to OD-13.

### Established Governance Invariants:
- **OD-02 Policy Baseline Preserved:** The Central Policy Blueprint and its six owner-approved baseline policies (`POL-OD-02-01` through `POL-OD-02-06`) at Version `1.0.0` remain the established reference.
- **OD-01 Retains Proposed Status:** OD-01 remains `OWNER PROPOSED — PENDING FINAL APPROVAL AND LEGAL/ACCOUNTING REVIEW`.
- **OD-03 to OD-13 Retain Pending Status:** Decisions OD-03 through OD-13 remain strictly `PENDING OWNER DECISION` / `PENDING TAX/CA REVIEW`.
- **Zero Implementation Authorization:** No technical code, migrations, schemas, or runtime modifications are authorized.

---

## 2. Exhaustive 20-Point Audit Profiles (OD-01 through OD-13)

---

### OD-01: Marketplace Commission & Dynamic Pricing Model

1. **Decision ID & Title:** `OD-01: Marketplace Commission & Pricing Model` (Dynamic Platform Markup & Merchant Boundaries).
2. **Current Governance Status:** `OWNER PROPOSED — PENDING FINAL APPROVAL AND LEGAL/ACCOUNTING REVIEW`.
3. **Existing Documentation Files & Locations:**
   - Detailed Supporting Analysis: [`docs/mvp2/m2-14/decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md)
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-01`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-01)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
4. **Existing Business Rules & Assumptions:**
   - Bounded Dynamic Pricing: $P_{\text{realization}} \le P_{\text{sell}} \le P_{\max} \le \text{Statutory Package MRP}$.
   - Merchant sets $P_{\min}$ and $P_{\max}$ (or fixed realization $P_{\text{realization}}$).
   - ATEEVRA sets customer shelf price $P_{\text{sell}}$ dynamically.
   - Platform revenue is derived strictly from gross markup spread ($P_{\text{sell}} - P_{\text{realization}}$), not a percentage commission deducted from seller sales.
   - Mode 1 (Fixed Merchant Realization) is the advisory recommended initial mode.
5. **Decisions Already Made by Owner:**
   - Proposed Option E (Hybrid Zero-Commission Markup Model) as the strategic pricing direction.
   - Recommended Mode 1 (Fixed Realization) for initial MVP launch.
6. **Decisions Still Requiring Owner Input:**
   - Formal final adoption sign-off on Option E.
   - Formal selection between Mode 1 (Fixed Realization) vs Mode 2 (Dynamic Shared Markup).
   - Approval of minimum category spread floors ($P_{\max} - P_{\text{realization}}$).
7. **Available Alternatives Documented:**
   - *Option A:* Fixed Percentage Commission Model (e.g. 15% flat commission).
   - *Option B:* Tiered Category Commission Model (8% to 25% by category).
   - *Option C:* Pure Zero-Commission / Subscription Model (Flat monthly seller SaaS fee).
   - *Option D:* Performance / Volume-Tiered Commission (Decreasing fee on high GMV).
   - *Option E:* Hybrid Zero-Commission Product-Level Markup Model (Owner Proposed).
8. **Financial Calculations & Assumptions Documented:**
   - Illustrative order: $P_{\text{sell}} = ₹1,000$, $P_{\text{realization}} = ₹800$, Gross Markup = $+₹200.00$.
   - Breakdown of variable fulfillment deductions: Forward Freight ₹70, Gateway MDR ₹23.60, Baseline contribution = $+₹106.40$.
9. **Missing Financial Analysis:**
   - Category-specific spread elasticity modeling (how different markups affect conversion across apparel vs jewelry).
   - Sensitivity modeling of merchant minimum realization inflation (sellers inflating $P_{\text{realization}}$ to force higher customer prices).
10. **Customer Impact:**
    - Customers experience competitive, market-driven dynamic pricing within merchant-approved ceilings; guaranteed never to be charged above statutory MRP.
11. **Merchant Impact:**
    - Guaranteed price protection: Merchant realization is invariant to platform promotional pricing. Omnichannel price parity protected via $P_{\max}$.
12. **ATEEVRA Platform Impact:**
    - Platform commercial revenue directly tied to gross markup spread. Requires disciplined margin floors to avoid selling at a loss.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *Legal Metrology (Packaged Commodities) Rules, 2011:* Strict prohibition against selling above MRP.
    - *Consumer Protection (E-Commerce) Rules, 2020, Rule 5(3)(b):* Mandatory legal opinion on whether platform-driven markup manipulation constitutes prohibited price manipulation.
    - *Statutory CA Review:* Accounting and GST invoicing structure for marketplace markup vs seller realization.
14. **Operational Workflow Requirements:**
    - Product creation workflow in Merchant Portal capturing $P_{\text{realization}}$, $P_{\max}$, and MRP with strict validation guards.
    - Moderation queue in Super Admin Portal for pricing spread compliance.
15. **Technical Implementation Dependencies:**
    - Database extension of Medusa `ProductVariant` / custom pricing entity in PostgreSQL.
    - Dynamic pricing calculation worker evaluating catalog prices before cart checkout.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Native Medusa `price_set`, `money_amount` tables; scoped product API.
    - *Proposed:* `product_pricing_bound` entity; `pricing.evaluated` event; `POST /admin/pricing/reconcile` endpoint.
17. **Testing & Acceptance Requirements:**
    - Automated boundary tests asserting $P_{\text{sell}} \le P_{\max} \le \text{MRP}$ in 100% of cases.
    - Realization floor tests asserting merchant payout never falls below $P_{\text{realization}}$.
18. **Links to Related Decisions:**
    - Directly bounds **OD-02** (markup funds return reserves).
    - Directly bounds **OD-03** (markup funds platform promotional coupons).
    - Informs **OD-06** (exchange variant price comparisons).
19. **Documentation Gaps & Contradictions:**
    - The dedicated analysis document (`M2-14-OD-01-PRICING-MODEL-ANALYSIS.md`) lacks formal integration with the 4-step pricing conflict resolution hierarchy approved under `POL-OD-02-06`.
20. **Recommended Next Action:**
    - Submit OD-01 to platform owner for formal approval alongside corporate legal counsel review on Rule 5(3)(b).

---

### OD-02: Refund Financial Liability & Return-Cost Reserve Architecture

1. **Decision ID & Title:** `OD-02: Refund Financial Liability` (Customer-Friendly Reverse Shipping, Gateway MDR Allocation & Return-Cost Pricing Reserve).
2. **Current Governance Status:** `OWNER APPROVED — INITIAL POLICY BASELINE (OD-02-01 through OD-02-06)`.
3. **Existing Documentation Files & Locations:**
   - Master Central Blueprint: [`docs/mvp2/m2-14/blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)
   - Policy Register: [`docs/mvp2/m2-14/blueprint/POLICY-REGISTER.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/POLICY-REGISTER.md)
   - Six Individual Policy Specifications: [`docs/mvp2/m2-14/blueprint/policies/OD-02-01`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-01-RETURN-COST-RESERVE.md) to [`OD-02-06`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)
   - Supporting Analysis: [`docs/mvp2/m2-14/decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md)
   - Audit Report: [`docs/mvp2/m2-14/blueprint/M2-14-BLUEPRINT-FINAL-AUDIT-REPORT.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/blueprint/M2-14-BLUEPRINT-FINAL-AUDIT-REPORT.md)
4. **Existing Business Rules & Assumptions:**
   - Zero return-shipping fee charged to customers for eligible returns.
   - Category-specific return-cost reserve embedded in gross markup (`POL-OD-02-01`).
   - Unified product price across prepaid and COD (`POL-OD-02-02`).
   - ATEEVRA absorbs gateway MDR on merchant-fault returns initially (`POL-OD-02-03`).
   - Customer refunded on transit damage; platform absorbs unrecovered carrier losses; no auto-debit to compliant merchants (`POL-OD-02-04`).
   - ATEEVRA funds COD RTO; enforces OTP verification, ₹5,000 order cap, and repeat-RTO safeguard (`POL-OD-02-05`).
   - 4-step pricing conflict resolution hierarchy; never silently violate $P_{\max}$ or MRP (`POL-OD-02-06`).
5. **Decisions Already Made by Owner:**
   - Formal approval of initial policy baseline across all six sub-decisions (OD-02-01 through OD-02-06).
6. **Decisions Still Requiring Owner Input:**
   - Final approval to transition from `PLANNING ONLY` to `IMPLEMENTATION AUTHORIZED` after professional validation gates are cleared.
   - Formal sign-off on Day 1 Category Viability Floors ($V_{\text{floor}}$).
7. **Available Alternatives Documented:**
   - *Option A:* Merchant-Absorbed Returns (Clawback realization, MDR, and forward/reverse shipping).
   - *Option B:* Platform-Absorbed Returns (Platform pays merchant realization on returns).
   - *Option C:* Pro-Rata / Shared Risk Model (Platform forfeits markup; merchant forfeits realization).
   - *Option D:* Granular Fault-Based Allocation (Historical advisory recommendation).
   - *Option D.1:* Customer-Friendly Reverse Shipping & Pricing Reserve (Owner Approved Baseline).
8. **Financial Calculations & Assumptions Documented:**
   - Reconciled Prepaid unit economics: Baseline retained contribution = **+₹106.40**, Expected contribution = **+₹76.25**, Measurement A net incremental incident expense = **₹5.43**, Gross cash drain = **₹16.85**, Lost contribution = **₹30.15**.
   - Reconciled COD unit economics: Baseline retained contribution = **+₹90.00**, Expected contribution = **+₹30.96**, Measurement A net incremental incident expense = **₹21.22**, Gross cash drain = **₹38.78**, Lost contribution = **₹59.04**.
   - Comprehensive GST refund-rail sensitivity matrix across 4 scenarios (Alt 1 Cases A/B, Alt 2 Cases A/B).
9. **Missing Financial Analysis:**
   - None. Financial models are complete, reconciled, and audited to 7 decimal places.
10. **Customer Impact:**
    - Zero return fees; immediate damage refunds; identical checkout pricing across payment rails.
11. **Merchant Impact:**
    - Guaranteed realization on retained sales; no arbitrary chargebacks on carrier damage; protected against banking fee deductions on defective returns.
12. **ATEEVRA Platform Impact:**
    - Systematic risk provisioning via internal markup reserve buffers; sustainable unit economics (+₹76.25 prepaid / +₹30.96 COD).
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *Gate 1:* Legal counsel sign-off on Consumer Protection Rules and Legal Metrology.
    - *Gate 2:* Statutory CA memorandum on managerial reserve vs balance sheet provisioning under Ind AS 37.
    - *Gate 3:* Tax counsel sign-off on SAC 997159 GST on payout rails and Section 16(2) ITC eligibility.
    - *Gate 4:* Countersigned 3PL courier MSAs (transit damage caps) and Razorpay MDR refund terms.
14. **Operational Workflow Requirements:**
    - 6-milestone courier claim and merchant recovery lifecycle (`POL-OD-02-04`).
    - 3-gate COD risk mitigation workflow (OTP, value cap, repeat RTO monitor).
15. **Technical Implementation Dependencies:**
    - Order-level policy snapshotting engine in PostgreSQL (`order_policy_snapshot`).
    - Double-entry settlement adjustment ledger (`merchant_adjustment`).
    - Carrier claim tracking entity (`carrier_transit_claim`).
16. **Required APIs, Events, Records & Modules:**
    - *Proposed Modules:* `Medusa SettlementModule`, `Medusa RiskModule`, `Medusa DisputeModule`.
    - *Events:* `return.inspected_merchant_fault`, `carrier_claim.submitted`, `carrier_claim.reimbursed`, `order.delivery_failed_rto`.
17. **Testing & Acceptance Requirements:**
    - Comprehensive test suites codified in `POLICY-VALIDATION-AND-ACCEPTANCE.md` (Suites 1–4: Arithmetic, Pricing Bounds, Snapshot Immutability, Idempotency).
18. **Links to Related Decisions:**
    - Depends on **OD-01** (pricing markup).
    - Directly bounds **OD-05** (tax withholding on settlement adjustments).
    - Directly bounds **OD-07** (settlement offset mechanics).
    - Informs **OD-08** (return window duration).
19. **Documentation Gaps & Contradictions:**
    - Zero gaps remaining. Audit findings F-01 through F-05 resolved in Record `DOC-M214-ERRATA-01`.
20. **Recommended Next Action:**
    - Execute external professional validation sign-offs (Gates 1 through 4) prior to requesting implementation authorization.

---

### OD-03: Coupon Allocation and Splitting in Mixed-Merchant Carts

1. **Decision ID & Title:** `OD-03: Coupon Allocation & Splitting` (Promo Code Financing and Partial Return Calculations).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-03`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-03) (Lines 588–640)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-03-COUPON-ALLOCATION-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Order coupons remain strictly platform order-level attributes; zero pro-rata deductions from merchant gross.
   - Advisory recommendation: **Option A (Platform-Subsidized Universal Coupons)** — ATEEVRA funds 100% of order-level promo codes as marketing expense. Merchants receive full gross realization.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Who finances platform-wide promo codes in mixed-seller carts: Platform (marketing budget) vs Sellers (pro-rata gross deduction) vs Co-funded.
   - How partial return refunds are calculated when a customer returns 1 item from a discounted multi-item cart (pro-rata discount deduction vs line-item sequence).
7. **Available Alternatives Documented:**
   - *Option A:* Platform-Subsidized Universal Coupons (100% platform-funded marketing expense).
   - *Option B:* Pro-Rata Merchant-Funded Coupons (Discount apportioned across line items based on item value).
   - *Option C:* Seller-Funded Promotions Only (Platform coupons disabled; discounts apply strictly to individual merchant SKUs).
   - *Option D:* Hybrid Co-Funded Model (Universal platform vouchers funded by ATEEVRA; seller-specific deals funded by merchant).
8. **Financial Calculations & Assumptions Documented:**
   - Conceptual description of ₹100 discount across ₹600 + ₹400 mixed cart. No formal mathematical model or partial refund reconciliation yet documented.
9. **Missing Financial Analysis:**
   - Impact of Option A on platform net contribution margin under OD-01 markup spreads.
   - Mathematical formula for partial return refund calculations:
     $$\text{Refund}(Item_i) = P_{\text{sell}}(Item_i) - \text{Discount}(Item_i)$$
   - Minimum cart threshold compliance rules on returns (e.g. if returning 1 item drops cart below ₹1,000 coupon threshold, does discount get revoked?).
10. **Customer Impact:**
    - High conversion under universal coupons. Customer expects fair partial refund upon returning 1 item from a discounted order.
11. **Merchant Impact:**
    - Under Option A: Merchant is fully protected (receives promised realization). Under Option B: Merchant margin is eroded by unapproved platform discounts.
12. **ATEEVRA Platform Impact:**
    - Direct hit to platform gross margin if coupons exceed available markup ($M_{\text{gross}}$). Requires hard guardrails.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *GST Valuation Rules:* Discount must be shown on tax invoice to reduce GST liability (Section 15(3) of CGST Act).
    - *Merchant Agreement:* Explicit consent required if merchant gross is ever docked for coupons.
14. **Operational Workflow Requirements:**
    - Promo engine evaluating coupon applicability during cart checkout.
    - Partial refund calculation workflow in Medusa return engine.
15. **Technical Implementation Dependencies:**
    - Medusa native Promotion / Discount module integration with multi-merchant split line items.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Medusa native `discount` entity; order total calculation.
    - *Proposed:* `line_item_discount_allocation` breakdown in PostgreSQL; `discount.apportioned` event.
17. **Testing & Acceptance Requirements:**
    - Pro-rata rounding tests (ensuring sum of discounted items equals total captured payment down to the exact paisa).
    - Partial return refund tests verifying customer receives correct net paid amount.
18. **Links to Related Decisions:**
    - Depends on **OD-01** (markup must cover coupon budget).
    - Interacts with **OD-02** (refund liability on discounted line items).
19. **Documentation Gaps & Contradictions:**
    - Lacks a standalone dedicated analysis document (`M2-14-OD-03-COUPON-ALLOCATION-ANALYSIS.md`).
    - Lacks mathematical formulation of partial return clawbacks.
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-03-COUPON-ALLOCATION-ANALYSIS.md` detailing Option A vs Option D and partial return formulas.

---

### OD-04: Shipping Revenue Allocation & 3PL Logistics Subsidies

1. **Decision ID & Title:** `OD-04: Shipping Revenue Allocation` (Customer Shipping Fee Retention vs Multi-Vendor Distribution).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-04`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-04) (Lines 641–691)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-04-SHIPPING-ALLOCATION-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Shipping fee remains at platform order level; zero shipping revenue credited to merchant line items.
   - Advisory recommendation: **Option A (Platform Retains Shipping & Manages Central 3PL Logistics)** — ATEEVRA centrally contracts with 3PL carriers, provides prepaid shipping labels, and retains customer shipping fees to offset bulk carrier invoices.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Whether platform retains shipping fees or distributes them to merchants.
   - Customer shipping pricing structure: Flat fee (e.g. ₹70) vs Free shipping threshold (e.g. Free over ₹999) vs Free shipping site-wide.
   - Multi-merchant cart shipping fee logic: Single flat fee per cart vs Per-merchant shipping fee.
7. **Available Alternatives Documented:**
   - *Option A:* Platform Retains Shipping & Manages 3PL Logistics (Centrally contracted labels; platform retains customer fees).
   - *Option B:* Shipping Split Pro-Rata Across Merchants (Merchants handle own couriers).
   - *Option C:* Multi-Vendor Individual Shipping Fees at Checkout (Customer charged separate shipping per seller).
   - *Option D:* Free Shipping Marketplace / Seller-Absorbed (Shipping free to customers; sellers absorb freight).
8. **Financial Calculations & Assumptions Documented:**
   - Assumes forward freight of ₹70 per 500g package. No multi-merchant shipment aggregation modeling documented.
9. **Missing Financial Analysis:**
   - Mixed-order split shipment cost modeling: If a customer orders 2 items from 2 different merchants, ATEEVRA incurs $2 \times ₹70 = ₹140$ in forward freight, but collects only ₹70 (or ₹0) from the customer. The platform margin must absorb the ₹70 multi-vendor fulfillment deficit.
10. **Customer Impact:**
    - Single flat fee (or free shipping over threshold) provides frictionless checkout; charging multiple shipping fees per merchant causes cart abandonment.
11. **Merchant Impact:**
    - Zero courier negotiation overhead under Option A; merchants simply print platform prepaid manifests.
12. **ATEEVRA Platform Impact:**
    - High financial exposure on mixed carts: Platform must budget for multi-vendor fulfillment split costs.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *GST Invoicing:* Platform must issue GST invoice for shipping convenience fee if retained by platform, or pass through as pure agent.
    - *Carrier Master Agreements:* Central negotiated volume contracts with Delhivery/Shiprocket.
14. **Operational Workflow Requirements:**
    - Centralized shipping label generation API in Merchant Portal upon order fulfillment.
15. **Technical Implementation Dependencies:**
    - Medusa fulfillment provider architecture with automated shipping calculation based on cart seller count.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Medusa `shipping_option`, `shipping_method` tables.
    - *Proposed:* `carrier_shipment_manifest` entity; integration with Shiprocket/Delhivery shipping API.
17. **Testing & Acceptance Requirements:**
    - Test mixed-merchant checkout: Assert shipping total displays correct single fee.
    - Test fulfillment split: Assert each merchant generates dedicated tracking number and label.
18. **Links to Related Decisions:**
    - Directly interacts with **OD-01** (markup covers split shipping deficits).
    - Directly interacts with **OD-02** (forward shipping loss on returns and RTO).
19. **Documentation Gaps & Contradictions:**
    - Lacks a standalone dedicated analysis document (`M2-14-OD-04-SHIPPING-ALLOCATION-ANALYSIS.md`).
    - Lacks multi-vendor shipment deficit modeling.
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-04-SHIPPING-ALLOCATION-ANALYSIS.md` modeling split shipment economics under Option A.

---

### OD-05: Statutory Tax Withholding (GST TCS & Income Tax TDS)

1. **Decision ID & Title:** `OD-05: Statutory Tax Withholding` (Section 52 GST TCS & Section 194-O IT TDS Engine).
2. **Current Governance Status:** `PENDING TAX/CA REVIEW`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-05`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-05) (Lines 692–747)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-05-STATUTORY-WITHHOLDING-ANALYSIS.md` — *(Pending Creation)*
   - Detailed Errata & Validation Analysis: [`M2-14-OD-05-TAX-ASSUMPTION-ERRATA-AND-VALIDATION.md`](M2-14-OD-05-TAX-ASSUMPTION-ERRATA-AND-VALIDATION.md)
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Displays captured GST per line item; zero tax withholdings calculated or deducted in database.
   - Advisory recommendation: **Option A (External Accounting / CA Batch Settlement — MVP-2 Baseline)** — System tracks gross sales and displays gross figures. Statutory GST TCS and IT TDS are calculated externally by the finance team/CA during offline payout batch runs.
   - *Rate Calibration & Errata:* Historical references to 1.0% TCS and 1.0% TDS are superseded by **CBIC Notification No. 15/2024–Central Tax (reducing GST TCS to 0.5% total effective 10 July 2024)** and the **Finance (No. 2) Act, 2024 (reducing Section 194-O TDS to 0.1% effective 1 October 2024)**.
5. **Decisions Already Made by Owner:**
   - None. Awaiting professional Chartered Accountant and tax counsel review.
6. **Decisions Still Requiring Owner Input:**
   - Whether tax withholding is executed via automated database logic (Options B/C/D) or handled externally by finance during payout runs (Option A).
   - Confirmation of structural tax framework: Marketplace Agency (Section 52 / 194-O applies) vs Wholesale Resale (Section 194Q / B2B ITC applies).
   - Treatment of TCS/TDS adjustments on returned items and cancelled orders.
7. **Available Alternatives Documented:**
   - *Option A:* External Accounting / CA Batch Settlement (Offline finance calculation during payout runs).
   - *Option B:* Automated Software GST TCS Withholding (0.5% Sec 52 GST TCS deducted in DB).
   - *Option C:* Automated Software Income Tax TDS Withholding (0.1% Sec 194-O TDS deducted in DB, subject to ₹5L Individual threshold).
   - *Option D:* Full Dual Software Tax Withholding Engine (Automated software deduction of both TCS & TDS with GSTR-8 / Form 26Q export tables).
8. **Financial Calculations & Assumptions Documented:**
   - Verified Revised Statutory Rates:
     - 0.5% Section 52 GST TCS (0.25% CGST + 0.25% SGST, or 0.5% IGST) on net taxable supplies (CBIC Notif. 15/2024, effective 10 July 2024).
     - 0.1% Section 194-O IT TDS on gross sale value (Finance (No. 2) Act 2024, effective 1 October 2024; ₹5L threshold for Individual/HUF).
9. **Missing Financial Analysis:**
   - Structural Tax Determination: If ATEEVRA operates on Mode 1 Fixed Realization as a wholesale buy-sell reseller, does Section 52 TCS apply at all, or does the transaction fall under Section 194Q (0.1% purchase TDS) and standard B2B ITC?
   - Tax base reconciliation under OD-01 Markup Model: Under Mode 1 Fixed Realization, is Sec 194-O levied on customer price $P_{\text{sell}}$ or merchant realization $P_{\text{realization}}$?
   - Negative turnover handling: How return reversals in Month 2 offset positive sales in Month 1 under GSTR-8 reporting.
10. **Customer Impact:**
    - Zero direct impact (TCS/TDS is strictly between platform, merchant, and tax authorities).
11. **Merchant Impact:**
    - Withheld taxes must be deposited with government under merchant's GSTIN and PAN; merchant claims credit in GSTR-2B and Form 26AS.
12. **ATEEVRA Platform Impact:**
    - Statutory compliance obligation: Platform is personally liable for uncollected TCS/TDS under Indian tax law.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - Mandatory Chartered Accountant formal opinion on Sections 52, 194-O, and 194Q compliance under marketplace markup models.
14. **Operational Workflow Requirements:**
    - Monthly GSTR-8 filing and Form 26Q quarterly TDS returns.
    - Generation of Form 16A certificates and TCS certificates for merchants.
15. **Technical Implementation Dependencies:**
    - Capturing merchant verified GSTIN and PAN during onboarding (already implemented in M2-06).
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Merchant profile with GSTIN/PAN in PostgreSQL.
    - *Proposed:* `tax_withholding_ledger` table; monthly tax export CSV endpoint.
17. **Testing & Acceptance Requirements:**
    - Mathematical verification of 0.5% TCS and 0.1% TDS calculations against taxable line item subtotal.
    - Negative balance tests on returns.
18. **Links to Related Decisions:**
    - Informs **OD-07** (net merchant settlement payout amount).
    - Interacts with **OD-01** (definition of gross taxable supply).
19. **Documentation Gaps & Contradictions:**
    - GAP-OD-05: Missing standalone analysis document; historical 1% rate assumptions required official gazette correction; lack of formal CA legal opinion on Section 52 TCS, Section 194-O TDS, and Section 194Q applicability.
20. **Recommended Next Action:**
    - Maintain status as `PENDING TAX/CA REVIEW`. Review [`M2-14-OD-05-TAX-ASSUMPTION-ERRATA-AND-VALIDATION.md`](M2-14-OD-05-TAX-ASSUMPTION-ERRATA-AND-VALIDATION.md) and obtain formal CA written opinion.

---

### OD-06: Exchange Scope & Price Differences

1. **Decision ID & Title:** `OD-06: Exchange Scope & Price Differences` (Equal-Value Swaps vs Automated Price-Delta Billing Engine).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-06`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-06) (Lines 748–799)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-06-EXCHANGE-PRICE-DIFFERENCES-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Price-delta exchanges strictly disabled; system allows only equal-value variant swaps (`financial_status = 'none'`).
   - Advisory recommendation: **Option A (Strictly Equal-Value Exchanges Only)** — Customers may only exchange for a variant of identical price (e.g. Size swap S to M). Price-difference exchanges are blocked in UI; customer must execute a return-for-refund and place a new order.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Whether to maintain strictly equal-value exchanges for MVP-2 (Option A) or build an automated price-delta billing engine (Option B).
7. **Available Alternatives Documented:**
   - *Option A:* Strictly Equal-Value Exchanges Only (Size/color swaps at same price; price delta blocked).
   - *Option B:* Automated Price-Delta Surcharge / Downward Refund Engine (Razorpay payment link for upward delta; partial refund for downward delta).
   - *Option C:* Surcharge Collection + Store Credit Downward (Upward delta paid; downward delta credited as store credit).
   - *Option D:* No Exchanges; Return & Rebuy Only (Disable exchange engine entirely).
8. **Financial Calculations & Assumptions Documented:**
   - Equal-value exchanges have $\Delta \text{Price} = 0$, resulting in zero cash movement between customer and platform.
9. **Missing Financial Analysis:**
   - Cost-benefit analysis of building complex payment-link billing workflows vs customer drop-off on Option A.
   - Merchant settlement adjustment calculation when an exchange item has a different $P_{\text{realization}}$.
10. **Customer Impact:**
    - Option A satisfies 85%–90% of apparel exchange requests (size swaps). If a customer wants a more expensive variant, they must return and repurchase.
11. **Merchant Impact:**
    - Simple inventory swap without recalculating payout amounts under Option A.
12. **ATEEVRA Platform Impact:**
    - Option A dramatically simplifies accounting and database architecture; avoids building multi-transaction child order billing.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *GST Invoicing:* Exchanging for different price requires issuing GST credit note for original item and new tax invoice for replacement item. Equal-value swap requires zero tax invoice mutation.
14. **Operational Workflow Requirements:**
    - Storefront UI variant selector restricting exchange options strictly to variants with identical $P_{\text{sell}}$.
15. **Technical Implementation Dependencies:**
    - Medusa exchange workflow validation asserting `new_variant.price == original_variant.price`.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Medusa `exchange`, `exchange_item` primitives.
    - *Proposed:* Server-side validation guard in `POST /store/returns/exchange`.
17. **Testing & Acceptance Requirements:**
    - Negative test: Attempt to select variant with different price $\rightarrow$ assert API rejects mutation with 400 Bad Request.
    - Positive test: Select variant with identical price $\rightarrow$ assert exchange claim created with `financial_status = 'none'`.
18. **Links to Related Decisions:**
    - Directly simplifies **OD-09** (reservation lock) and **OD-13** (conversion to refund).
19. **Documentation Gaps & Contradictions:**
    - Lacks standalone dedicated analysis document (`M2-14-OD-06-EXCHANGE-PRICE-DIFFERENCES-ANALYSIS.md`).
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-06-EXCHANGE-PRICE-DIFFERENCES-ANALYSIS.md` recommending Option A for initial launch.

---

### OD-07: Merchant Settlement & Payout Rails Boundary

1. **Decision ID & Title:** `OD-07: Merchant Settlement & Payout Rails` (Banking Rails Boundary & Escrow Hold Duration).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-07`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-07) (Lines 800–853)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-07-PAYOUT-RAILS-SETTLEMENT-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Automated bank payouts strictly deferred to MVP-3 in accordance with Master Plan; platform database records verified transactions as `unsettled`. Zero simulated bank payouts or fake disbursements.
   - Advisory recommendation: **Option A (Manual Corporate Banking Batch Payouts — MVP-3 Deferred)** — Finance team generates weekly/monthly settlement CSVs and executes batch NEFT/RTGS via corporate banking portal.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Confirmation that automated banking APIs (RazorpayX / Route) remain deferred to MVP-3.
   - Exact escrow hold duration (e.g. T+7 days post-delivery vs T+14 days post-delivery) before an order transitions from provisional hold to `eligible_for_settlement`.
   - Settlement cadence: Weekly batch vs Bi-weekly vs Monthly.
7. **Available Alternatives Documented:**
   - *Option A:* Manual Corporate Banking NEFT/RTGS Batch Payouts (MVP-3 Deferred).
   - *Option B:* Razorpay Route Automated Split Payments (Split at capture).
   - *Option C:* RazorpayX Automated Payouts Engine (Scheduled IMPS/NEFT API).
   - *Option D:* Merchant On-Demand Withdrawal Request (Threshold-based withdrawal requests).
8. **Financial Calculations & Assumptions Documented:**
   - Calculation of Net Settlement:
     $$\text{Net Merchant Payout} = \sum P_{\text{realization}} - \text{Authorized Settlement Offsets (OD-02)} - \text{TCS/TDS (OD-05)}$$
9. **Missing Financial Analysis:**
   - Working capital float analysis: Modeling the cash float held in ATEEVRA nodal account during the T+7 to T+14 escrow hold window relative to return rates.
10. **Customer Impact:**
    - Indirect: Escrow hold ensures platform retains funds to honor customer refunds if returns occur.
11. **Merchant Impact:**
    - Cash flow predictability: Merchants know exact settlement dates and receive transparent itemized statements.
12. **ATEEVRA Platform Impact:**
    - High protection against merchant default/bad debt: Holding realization through the return window ensures returns are settled by canceling payables rather than chasing receivables.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *RBI Nodal / Escrow Account Guidelines:* Marketplace platforms handling seller funds must comply with RBI Payment Intermediary directions (Directions for Opening and Operation of Accounts and Settlement of Payments for Electronic Payment Transactions).
14. **Operational Workflow Requirements:**
    - Automated cron job transitioning delivered orders to `eligible_for_settlement` after escrow hold expires.
    - Super Admin payout batch generation and CSV export.
15. **Technical Implementation Dependencies:**
    - Scoped merchant settlement tables in PostgreSQL (`settlement_batch`, `settlement_item`).
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Scoped merchant order totals.
    - *Proposed:* `POST /admin/settlements/generate`, `GET /merchant/settlements`, `settlement.batched` event.
17. **Testing & Acceptance Requirements:**
    - Escrow hold tests: Assert order delivered on Day 0 cannot be batched on Day 3 if hold is 7 days.
    - Settlement offset tests: Assert pending reverse freight debits (OD-02) are properly deducted from batch payout.
18. **Links to Related Decisions:**
    - Directly bounded by **OD-08** (escrow hold must be $\ge$ return window).
    - Directly executes offsets from **OD-02** and deductions from **OD-05**.
19. **Documentation Gaps & Contradictions:**
    - Lacks standalone dedicated analysis document (`M2-14-OD-07-PAYOUT-RAILS-SETTLEMENT-ANALYSIS.md`).
    - Lacks legal confirmation of RBI nodal account compliance for manual batch payouts.
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-07-PAYOUT-RAILS-SETTLEMENT-ANALYSIS.md` codifying Option A and T+7 post-delivery escrow hold.

---

### OD-08: Customer Return & Exchange Eligibility Window Duration

1. **Decision ID & Title:** `OD-08: Return Window Duration` (Configurable Customer Eligibility Duration).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-08`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-08) (Lines 854–903)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-08-RETURN-WINDOW-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Hardcoded day constants removed; system requires configurable platform setting.
   - Advisory recommendation: **Option A (Strict 7 Calendar Days from Delivery)** — Customer may request return or exchange within exactly 7 days of carrier delivery confirmation.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Selection between 7 calendar days vs 14 calendar days vs Category-specific return windows.
   - What happens on day 8: Hard UI cutoff blocking return submission.
7. **Available Alternatives Documented:**
   - *Option A:* Strict 7 Calendar Days from Verified Carrier Delivery.
   - *Option B:* 14 Calendar Days from Delivery.
   - *Option C:* Category-Specific Windows (e.g. 7 days apparel, non-returnable accessories).
   - *Option D:* Replacement/Exchange Only Policy (Cash refunds disabled; 7-day exchange only).
8. **Financial Calculations & Assumptions Documented:**
   - Shorter windows (7 days) reduce merchant inventory depreciation and shorten platform escrow hold duration.
9. **Missing Financial Analysis:**
   - Impact of 7 vs 14 days on customer conversion and total return volume (industry data shows 14 days increases returns by ~15%–20%).
10. **Customer Impact:**
    - 7 days is standard for fashion ecommerce in India; provides sufficient time to try garments while preventing excessive wear-and-return abuse.
11. **Merchant Impact:**
    - Faster settlement payout under 7 days; returned inventory returns to salable stock quickly.
12. **ATEEVRA Platform Impact:**
    - Directly governs merchant escrow hold duration in OD-07: Escrow hold can safely be set to T+8 or T+10 days.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *Consumer Protection (E-Commerce) Rules, 2020:* Return terms must be prominently disclosed on product pages and invoice.
14. **Operational Workflow Requirements:**
    - Carrier delivery webhook (`DELIVERED`) starts the countdown timer.
    - Automatic disabling of the "Request Return" button in customer account at $T + 7\text{ days} + 23:59:59$.
15. **Technical Implementation Dependencies:**
    - Configurable database setting in Medusa store configuration (`store.return_window_days = 7`).
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Native Medusa return request endpoint.
    - *Proposed:* Server-side timestamp validation guard in `POST /store/returns`.
17. **Testing & Acceptance Requirements:**
    - Boundary test: Assert return request at Day 6.99 is accepted; assert request at Day 7.01 is rejected with 422 Unprocessable Entity.
18. **Links to Related Decisions:**
    - Directly bounds **OD-07** (merchant payout hold window must be $\ge$ return window).
    - Informs **OD-02** (return probability rates).
19. **Documentation Gaps & Contradictions:**
    - Lacks standalone dedicated analysis document (`M2-14-OD-08-RETURN-WINDOW-ANALYSIS.md`).
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-08-RETURN-WINDOW-ANALYSIS.md` recommending Option A (7 calendar days).

---

### OD-09: Replacement Inventory Reservation Timing & Expiration Schedule

1. **Decision ID & Title:** `OD-09: Exchange Reservation Timing & Expiration Schedule` (Replacement Stock Hold Duration & Advisory Lock TTL).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-09`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-09) (Lines 904–952)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-09-EXCHANGE-RESERVATION-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Inventory reserved under PostgreSQL advisory lock; hold duration requires owner configuration.
   - Advisory recommendation: **Option A (Immediate Reservation with 7-Day Auto-Expiry)** — Stock reserved immediately upon customer exchange request. If 3PL courier registers no reverse pickup scan within 7 calendar days, reservation is automatically released and exchange is cancelled.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Selection between 7-day hold vs 3-day hold vs Delayed reservation upon pickup scan.
7. **Available Alternatives Documented:**
   - *Option A:* Immediate Reservation with 7-Day Auto-Expiry (Prevents replacement stockout; releases if customer fails pickup).
   - *Option B:* Immediate Reservation with 3-Day Auto-Expiry (Strict hold minimizing merchant inventory lockup).
   - *Option C:* Delayed Reservation on Pickup Scan (Stock reserved only when courier scans parcel at customer doorstep).
   - *Option D:* Manual Expiration Only (Reservations never auto-expire; requires staff action).
8. **Financial Calculations & Assumptions Documented:**
   - Holding inventory locks up merchant working capital; auto-release prevents dead stock.
9. **Missing Financial Analysis:**
   - Risk modeling of Option C: In high-velocity flash sales, delayed reservation on pickup scan risks stockouts (replacement SKU sells out while parcel is being picked up, forcing conversion to refund OD-13).
10. **Customer Impact:**
    - Option A guarantees replacement item will not sell out while customer awaits courier pickup.
11. **Merchant Impact:**
    - Merchants cannot sell reserved inventory during the hold window; 7-day auto-expiry protects against perpetual lockup.
12. **ATEEVRA Platform Impact:**
    - Automated background worker prevents orphan reservations from polluting inventory counts.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - Zero legal dependencies (internal operational inventory management).
14. **Operational Workflow Requirements:**
    - Automated daily cron worker executing `deleteReservationsWorkflow` for expired holds.
15. **Technical Implementation Dependencies:**
    - Native Medusa Inventory Module `ReservationItem` entity; PostgreSQL advisory lock namespace.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Medusa `inventory_item`, `reservation_item` tables.
    - *Proposed:* `exchange_reservation_expiry_worker`; `inventory.reservation_expired` event.
17. **Testing & Acceptance Requirements:**
    - Concurrency test: Two customers request last remaining variant simultaneously $\rightarrow$ assert PostgreSQL advisory lock serializes, granting 1 reservation and rejecting the other.
    - Expiry test: Simulate Day 8 with zero pickup scan $\rightarrow$ assert worker deletes reservation and marks claim `expired`.
18. **Links to Related Decisions:**
    - Interacts with **OD-10** (cancellation rights) and **OD-11** (fulfillment sequencing).
    - Fallback triggers **OD-13** (conversion to refund if reservation lost).
19. **Documentation Gaps & Contradictions:**
    - Lacks standalone dedicated analysis document (`M2-14-OD-09-EXCHANGE-RESERVATION-ANALYSIS.md`).
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-09-EXCHANGE-RESERVATION-ANALYSIS.md` validating Option A with 7-day TTL.

---

### OD-10: Customer Self-Service Exchange Cancellation Rights

1. **Decision ID & Title:** `OD-10: Exchange Cancellation Rights` (Customer Self-Service Operational Boundary).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-10`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-10) (Lines 953–1002)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-10-EXCHANGE-CANCELLATION-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Cancellations before pickup release reservation; cancellations after receipt require policy.
   - Advisory recommendation: **Option A (Cancellation Permitted Until Carrier Reverse Pickup Scan)** — Customer may cancel exchange online self-service anytime prior to handing parcel to 3PL driver. Once carrier scans `PICKED_UP`, self-service cancellation is locked.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Cutoff milestone for customer self-service cancellation: Before pickup scan (Option A) vs Before warehouse receipt (Option B).
7. **Available Alternatives Documented:**
   - *Option A:* Cancellation Permitted Until Carrier Pickup Scan (Clean cutoff; locks once parcel is in courier custody).
   - *Option B:* Cancellation Permitted Until Warehouse Receipt (Requires complex courier intercept in transit).
   - *Option C:* Mutual Cancellation Permitted Pre-Dispatch (Both parties can cancel prior to replacement shipping).
   - *Option D:* No Customer Self-Service Cancellation (All cancellations require customer support call).
8. **Financial Calculations & Assumptions Documented:**
   - Cancelling prior to pickup saves reverse freight (₹90) and replacement forward freight (₹70).
9. **Missing Financial Analysis:**
   - Courier reverse-pickup cancellation charge: Does 3PL charge an attempt fee (e.g. ₹20–₹30) if customer cancels after driver is dispatched?
10. **Customer Impact:**
    - High convenience: Customer can change their mind and keep the original product without contacting support.
11. **Merchant Impact:**
    - Reserved replacement inventory is immediately released back to sellable stock.
12. **ATEEVRA Platform Impact:**
    - Saves logistics expenses; prevents reverse freight charges.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - Zero legal dependencies.
14. **Operational Workflow Requirements:**
    - Real-time courier webhook updating reverse pickup status to `PICKED_UP`.
    - UI toggle hiding "Cancel Exchange" button once status is `in_transit`.
15. **Technical Implementation Dependencies:**
    - Server-side status guard in `POST /store/returns/exchange/:id/cancel`.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Medusa cancel return primitive.
    - *Proposed:* `POST /store/returns/exchange/:id/cancel` endpoint; `exchange.cancelled_by_customer` event.
17. **Testing & Acceptance Requirements:**
    - State test: Cancel exchange while status is `pickup_pending` $\rightarrow$ assert reservation deleted and original order item restored.
    - State test: Cancel exchange while status is `picked_up` $\rightarrow$ assert API returns 409 Conflict with error "Cannot cancel parcel in transit".
18. **Links to Related Decisions:**
    - Directly bounds **OD-09** (cancelling releases reservation).
    - Precedes **OD-11** (fulfillment sequencing).
19. **Documentation Gaps & Contradictions:**
    - Lacks standalone dedicated analysis document (`M2-14-OD-10-EXCHANGE-CANCELLATION-ANALYSIS.md`).
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-10-EXCHANGE-CANCELLATION-ANALYSIS.md` validating Option A.

---

### OD-11: Non-Returned Original Item Handling & Inspection Gates

1. **Decision ID & Title:** `OD-11: Non-Returned Item Handling` (Exchange Fulfillment Sequencing & Inspection Gates).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-11`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-11) (Lines 1003–1051)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-11-NON-RETURNED-ITEM-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Replacement fulfillment blocked until merchant confirms physical receipt (`physical_status = 'received'`).
   - Advisory recommendation: **Option A (Receive & Inspect First — Safe Fulfillment)** — Merchant dispatches replacement item ONLY after the original item is received at warehouse and passes inspection. Zero merchant fraud risk.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Fulfillment model selection: Receive & inspect first (Option A) vs Dispatch upon courier pickup scan (Option B) vs Doorstep courier swap (Option C).
7. **Available Alternatives Documented:**
   - *Option A:* Receive & Inspect First (Safe; merchant dispatches only after dock receipt & QC).
   - *Option B:* Dispatch Upon Carrier Pickup Scan (Fast fulfillment; merchant ships upon pickup; platform covers fraud).
   - *Option C:* Doorstep Reverse-QC Courier Swap (Single-trip swap; requires 3PL reverse-QC capability).
   - *Option D:* Immediate Dispatch with Card Pre-Authorization (Pre-auth charged if old item not returned).
8. **Financial Calculations & Assumptions Documented:**
   - Under Option B: 1%–2% fraud rate (empty boxes) requires platform seller protection fund. Under Option A: Fraud rate is 0%.
9. **Missing Financial Analysis:**
   - Total turnaround time comparison: Option A takes 10–14 days for customer; Option B takes 4–6 days.
   - 3PL courier surcharge for Doorstep Reverse-QC Swap (Option C typically costs +₹40 to +₹60 extra per swap).
10. **Customer Impact:**
    - Option A has longer turnaround time; Option B provides faster customer satisfaction but higher platform risk.
11. **Merchant Impact:**
    - Option A eliminates merchant fraud risk entirely.
12. **ATEEVRA Platform Impact:**
    - Option A requires zero seller indemnity reserve; Option B requires budgeting for fraudulent return claims.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *Indian Sale of Goods Act, 1930:* Title transfer occurs upon inspection and acceptance of goods.
14. **Operational Workflow Requirements:**
    - Merchant Portal dock scan and inspection checklist (`APPROVE` / `REJECT_DAMAGED` / `REJECT_WRONG_ITEM`).
15. **Technical Implementation Dependencies:**
    - Medusa workflow transition guard blocking `createFulfillment` on exchange until `return.status == 'received'`.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Medusa return receive primitive.
    - *Proposed:* `POST /merchant/returns/:id/receive-and-inspect` endpoint; `return.inspected` event.
17. **Testing & Acceptance Requirements:**
    - Negative test: Attempt to create replacement fulfillment while status is `pickup_scanned` $\rightarrow$ assert API rejects mutation.
    - Positive test: Merchant submits `receive-and-inspect` $\rightarrow$ assert replacement fulfillment unblocks.
18. **Links to Related Decisions:**
    - Sequenced after **OD-09** and **OD-10**.
    - Precedes **OD-12** (replacement fulfillment).
19. **Documentation Gaps & Contradictions:**
    - Lacks standalone dedicated analysis document (`M2-14-OD-11-NON-RETURNED-ITEM-ANALYSIS.md`).
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-11-NON-RETURNED-ITEM-ANALYSIS.md` validating Option A for MVP-2.

---

### OD-12: Repeated Replacement Fulfillment Failures (Replacement RTO)

1. **Decision ID & Title:** `OD-12: Repeated Replacement Fulfillment Failures` (Replacement Shipment RTO Protocol & Termination Thresholds).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-12`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-12) (Lines 1052–1101)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-12-REPEATED-FULFILLMENT-FAILURE-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Undelivered replacement item held in warehouse; zero automatic re-dispatches.
   - Advisory recommendation: **Option A (Single Re-Dispatch Attempt, Then Auto-Refund)** — Merchant verifies address and re-dispatches once. If second attempt fails (RTO), exchange terminates and triggers automatic full monetary refund (OD-13).
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Selection between 1 re-dispatch attempt (Option A) vs Immediate refund on 1st RTO (Option B) vs Immediate store credit (Option C).
   - Maximum attempt threshold before forced termination.
7. **Available Alternatives Documented:**
   - *Option A:* Single Re-Dispatch Attempt, Then Auto-Refund (Maximum 2 delivery attempts total).
   - *Option B:* Immediate Conversion to Monetary Refund on First RTO (Zero re-dispatch; immediate refund).
   - *Option C:* Immediate Store Credit Conversion on First RTO (Value credited as store credit).
   - *Option D:* Manual Admin Resolution (Flagged for Super Admin arbitration).
8. **Financial Calculations & Assumptions Documented:**
   - Every replacement shipment incurs forward freight (₹70) and RTO freight (₹70). Multiple re-dispatches cause severe freight dead-losses.
9. **Missing Financial Analysis:**
   - Cumulative logistics loss modeling across 2 failed attempts:
     $$\text{Original Ship } (₹70) + \text{Reverse Return } (₹90) + \text{Replacement Ship } (₹70) + \text{Replacement RTO } (₹70) = \mathbf{₹300 \text{ logistics drain}}$$
10. **Customer Impact:**
    - Option A gives customer a second chance if courier missed them; Option B provides faster closure via monetary refund.
11. **Merchant Impact:**
    - Merchant avoids infinite re-dispatch loops; replacement stock returned to warehouse dock.
12. **ATEEVRA Platform Impact:**
    - Caps platform logistics losses by enforcing a hard termination limit.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - Zero legal dependencies.
14. **Operational Workflow Requirements:**
    - Courier RTO webhook triggering merchant outreach notification.
    - Hard limit counter (`re_dispatch_attempt_count <= 1`).
15. **Technical Implementation Dependencies:**
    - Replacement order lifecycle state tracking in PostgreSQL.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Medusa order fulfillment status.
    - *Proposed:* `POST /merchant/exchanges/:id/re-dispatch` endpoint; `exchange.fulfillment_failed` event.
17. **Testing & Acceptance Requirements:**
    - Counter test: Execute 1st replacement RTO $\rightarrow$ assert re-dispatch permitted.
    - Termination test: Execute 2nd replacement RTO $\rightarrow$ assert re-dispatch blocked and event transitions to `exchange_terminated_refund_required`.
18. **Links to Related Decisions:**
    - Directly feeds into **OD-13** (failed exchange-to-refund conversion).
19. **Documentation Gaps & Contradictions:**
    - Lacks standalone dedicated analysis document (`M2-14-OD-12-REPEATED-FULFILLMENT-FAILURE-ANALYSIS.md`).
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-12-REPEATED-FULFILLMENT-FAILURE-ANALYSIS.md` codifying Option B (immediate refund on 1st RTO) or Option A (max 1 re-dispatch).

---

### OD-13: Failed Exchange-to-Refund Conversion & Stockout Handling

1. **Decision ID & Title:** `OD-13: Failed Exchange-to-Refund Conversion` (Stockout Conversion Protocol & Customer Compensation).
2. **Current Governance Status:** `PENDING OWNER DECISION`.
3. **Existing Documentation Files & Locations:**
   - Master Decision Register: [`docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-13) (Lines 1102–1156)
   - Master Execution Plan: [`docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13)
   - Dedicated Analysis Document: `docs/mvp2/m2-14/decisions/M2-14-OD-13-EXCHANGE-TO-REFUND-CONVERSION-ANALYSIS.md` — *(Pending Creation)*
4. **Existing Business Rules & Assumptions:**
   - Technical baseline: Automatic conversion blocked; requires operator authorization or approved conversion rule.
   - Advisory recommendation: **Option A (Automated Monetary Refund Conversion)** — If replacement variant cannot be fulfilled within 3 business days of return receipt at warehouse, system automatically converts the exchange claim into a standard monetary refund (`financial_status = 'refund_pending'`) and executes outbound Razorpay/COD refund protocol.
5. **Decisions Already Made by Owner:**
   - None. Decision remains completely open and unapproved.
6. **Decisions Still Requiring Owner Input:**
   - Whether conversion to monetary refund is automated (Option A) vs Manual Admin review (Option C) vs Customer interactive choice flow (Option D).
   - Timeframe before conversion triggers (e.g. 3 business days).
7. **Available Alternatives Documented:**
   - *Option A:* Automated Monetary Refund Conversion (Auto-refund to original payment method or UPI after 3 days).
   - *Option B:* Instant Store Credit Issuance (Full value issued as store credit with optional 5% promotional bonus).
   - *Option C:* Manual Super Admin Review Only (Locked until admin clicks "Authorize Cash Refund").
   - *Option D:* Customer Interactive Choice Flow (Storefront offers customer: Alternative variant vs Cash refund vs Store credit).
8. **Financial Calculations & Assumptions Documented:**
   - Customer refunded 100% of original item selling price ($P_{\text{sell}}$). Merchant payable canceled; merchant paid ₹0.
9. **Missing Financial Analysis:**
   - COD refund rail costs: When a COD exchange converts to a refund, ATEEVRA incurs the IMPS payout rail fee (₹3.40 to ₹4.012 per OD-02 sensitivity models).
10. **Customer Impact:**
    - Automated monetary refund (Option A) prevents customer funds from being trapped when merchant runs out of stock.
11. **Merchant Impact:**
    - Merchant stockout terminates transaction cleanly without chargeback penalties.
12. **ATEEVRA Platform Impact:**
    - Prevents escalations and customer support tickets resulting from indefinitely stalled exchanges.
13. **Legal, Tax, Accounting & Contractual Dependencies:**
    - *Consumer Protection Rules:* Customer entitled to prompt refund if replacement goods are unavailable.
14. **Operational Workflow Requirements:**
    - Automated background worker monitoring unfulfilled exchanges and triggering refund workflow at Day 3.
15. **Technical Implementation Dependencies:**
    - Bridge workflow connecting Medusa `Exchange` entity to `RefundPaymentWorkflow`.
16. **Required APIs, Events, Records & Modules:**
    - *Existing:* Medusa refund payment primitives.
    - *Proposed:* `exchange_to_refund_conversion_worker`; `exchange.converted_to_refund` event.
17. **Testing & Acceptance Requirements:**
    - Transition test: Mark replacement variant out-of-stock $\rightarrow$ assert worker transitions exchange to `converted_to_refund` and triggers Razorpay refund API.
18. **Links to Related Decisions:**
    - Terminal resolution for **OD-06**, **OD-09**, **OD-11**, and **OD-12**.
    - Re-uses refund rails from **OD-02**.
19. **Documentation Gaps & Contradictions:**
    - Lacks standalone dedicated analysis document (`M2-14-OD-13-EXCHANGE-TO-REFUND-CONVERSION-ANALYSIS.md`).
20. **Recommended Next Action:**
    - Author dedicated analysis document `M2-14-OD-13-EXCHANGE-TO-REFUND-CONVERSION-ANALYSIS.md` validating Option A with 3-day SLA.

---

## 3. Physical Inventory Summary Table

| Decision ID | Decision Title | Governance Status | Dedicated File Status | Physical Repository Location | Analysis Depth |
| :--- | :--- | :---: | :---: | :--- | :---: |
| **OD-01** | Marketplace Commission & Pricing Model | `OWNER PROPOSED` | **PHYSICALLY EXISTS** | `docs/mvp2/m2-14/decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md` | **COMPLETE** |
| **OD-02** | Refund Financial Liability & Risk Reserve | `OWNER APPROVED` | **PHYSICALLY EXISTS** | `docs/mvp2/m2-14/decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md`<br>+ `docs/mvp2/m2-14/blueprint/` (11 files) | **COMPLETE** |
| **OD-03** | Coupon Allocation and Splitting | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-03` | **PARTIAL** |
| **OD-04** | Shipping Revenue Allocation | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-04` | **PARTIAL** |
| **OD-05** | Statutory Tax Withholding (TCS/TDS) | `PENDING TAX/CA` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-05` | **PARTIAL** |
| **OD-06** | Exchange Scope & Price Differences | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-06` | **PARTIAL** |
| **OD-07** | Merchant Settlement & Payout Rails | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-07` | **PARTIAL** |
| **OD-08** | Return Window Duration | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-08` | **PARTIAL** |
| **OD-09** | Exchange Reservation Timing | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-09` | **PARTIAL** |
| **OD-10** | Exchange Cancellation Rights | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-10` | **PARTIAL** |
| **OD-11** | Non-Returned Original Item Handling | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-11` | **PARTIAL** |
| **OD-12** | Repeated Replacement Failures | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-12` | **PARTIAL** |
| **OD-13** | Failed Exchange Conversion | `PENDING` | *Pending Creation* | In Register: `docs/mvp2/m2-14/M2-14-OWNER-DECISION-REGISTER.md#od-13` | **PARTIAL** |
