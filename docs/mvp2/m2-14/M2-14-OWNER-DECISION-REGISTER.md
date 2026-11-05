# ATEEVRA MVP-2 — Phase M2-14 Master Owner Decision Register
## Payments, Refunds, Returns and Exchanges
**Document Classification:** `OFFICIAL OWNER DECISION REGISTER & POLICY AUDIT`  
**Phase Status:** `PLANNING ONLY — AWAITING EXPLICIT OWNER POLICY AUTHORIZATION`  
**Execution Invariant:** `STRICTLY DOCUMENTATION AND ANALYSIS ONLY — IMPLEMENTATION NOT AUTHORIZED`  
**Branch:** `m2_14` (`apps/storefront/tsconfig.tsbuildinfo` preserved; zero code modifications)  
**Commerce Core:** Medusa v2.19.0 (`@medusajs/payment`, `@medusajs/order`, `@medusajs/inventory`, `@medusajs/locking-postgres`)  

---

## Executive Summary & Governance Notice

This document establishes the authoritative **Master Owner Decision Register** for Phase M2-14 (Payments, Refunds, Returns and Exchanges).

In strict accordance with `MVP2-AGENT-RULES.md` and `MVP2-MASTER-PLAN.md`, all technical implementation for M2-14 is paused until the platform owner reviews and formally signs off on these 13 commercial, legal, and operational policies. 

> [!IMPORTANT]
> **GOVERNANCE INVARIANT:**
> - All recommendations presented herein are **strictly advisory** and **unapproved**.
> - Zero business policies or financial defaults have been hardcoded into application code, database migrations, or test suites.
> - Current technical capabilities strictly isolate gross sales data, enforce equal-value financial neutrality, and report truthful transaction states without faking payouts or silent deductions.
> - **Implementation remains strictly withheld pending explicit written owner approval.**

---

## Master Owner Decisions Summary Matrix (OD-01 through OD-14)

| ID | Decision Title | Core Policy Question | Technical Baseline in M2-14 Plan | Current Status |
| :--- | :--- | :--- | :--- | :--- |
| **OD-01** | **Marketplace Commercial Revenue Architecture & Platform Fee Model** | Marketplace Facilitation Platform (Merchants as Sellers of Record; direct customer sales; ATEEVRA earns revenue via separately defined platform fee; zero wholesale inventory buy-sell). Fee structure options: Option C (Percentage 8–10%) vs Option D (Hybrid ₹20 + 5%) vs Option A (Fixed).<br>📄 [Detailed Analysis](decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md)<br>🏛️ [Fee Comparison](blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md)<br>📊 [Financial Model](blueprint/M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md)<br>⚖️ [Validation Checklist](blueprint/M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md) | Displays strictly **Gross Line-Item Sales** (`quantity * unitPrice`); zero commission deducted. | **OWNER DIRECTION RECORDED — PENDING FEE SELECTION & PROFESSIONAL VALIDATION** |
| **OD-02** | **Refund Financial Liability** | Allocation of refund liability across product realization, platform markup, gateway fees, and logistics.<br>📄 [Detailed Analysis](decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md)<br>🏛️ [Central Policy Blueprint](blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)<br>🔄 [Controlled Revision v1.1.0](blueprint/M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md) | Tracks technical refund transactions; zero silent debits or clawbacks against seller balances. | **OWNER APPROVED — INITIAL POLICY BASELINE (v1.0.0) | PROPOSED REVISION v1.1.0-PROPOSED PENDING OWNER RATIFICATION (OD-15)** |
| **OD-03** | **Coupon Allocation & Splitting** | Who finances order-level promo codes in mixed-seller carts, and how are discounts calculated on partial returns? | Order coupons remain strictly platform order-level attributes; zero pro-rata deductions from merchant gross. | **PENDING OWNER DECISION** |
| **OD-04** | **Shipping Revenue Allocation** | In mixed-seller orders, does platform retain customer shipping revenue to fund central 3PL logistics, or is shipping distributed? | Shipping total remains at platform order level; zero shipping revenue credited to merchant line items. | **PENDING OWNER DECISION** |
| **OD-05** | **Statutory Tax Withholding (TCS/TDS)** | Shall 1% GST TCS (Sec 52) and 1% IT TDS (Sec 194-O) be deducted in software or handled externally by finance? | Displays captured GST per line; zero tax withholdings calculated or deducted in database. | **PENDING TAX/CA REVIEW** |
| **OD-06** | **Exchange Price Differences** | Are exchanges restricted strictly to equal-value variants, or should an automated price-delta billing engine be built? | Price-delta exchanges strictly disabled; system allows only equal-value variant swaps (`financial_status = 'none'`). | **PENDING OWNER DECISION** |
| **OD-07** | **Payout Rails & Settlement** | Confirm automated bank payouts remain deferred to MVP-3, and define approved escrow hold duration (e.g. T+7 post-delivery). | Payouts recorded strictly as `unsettled`; zero simulated bank payouts or fake disbursements. | **PENDING OWNER DECISION** |
| **OD-08** | **Return Window Duration** | What is the customer return and exchange eligibility duration (e.g. 7 vs 14 days from carrier delivery)? | Hardcoded constants removed; system requires configurable platform setting. | **OWNER DIRECTION RECORDED: 7-DAY DEFAULT RETURN WINDOW (POL-M2-14-01) — PENDING FORMAL RATIFICATION** |
| **OD-09** | **Exchange Reservation Expiration** | How long is replacement inventory reserved during an exchange before automatic release if not picked up? | Inventory reserved under PostgreSQL advisory lock; hold duration requires owner configuration. | **PENDING OWNER DECISION** |
| **OD-10** | **Exchange Cancellation Rights** | At what operational milestone (e.g. courier pickup scan) does a customer lose self-service cancellation rights? | Cancellations before pickup release reservation; cancellations after receipt require policy. | **PENDING OWNER DECISION** |
| **OD-11** | **Non-Returned Item Handling** | What fulfillment model governs exchanges: Receive & inspect first, dispatch upon pickup scan, or doorstep swap? | Replacement fulfillment blocked until merchant confirms physical receipt (`physical_status = 'received'`). | **PENDING OWNER DECISION** |
| **OD-12** | **Repeated Fulfillment Failures** | When a replacement shipment fails delivery and returns to origin (RTO), does merchant re-ship or terminate? | Undelivered replacement item held in warehouse; zero automatic re-dispatches. | **PENDING OWNER DECISION** |
| **OD-13** | **Exchange-to-Refund Conversion** | When an approved exchange cannot be fulfilled, does the system auto-refund the customer or require manual review? | Automatic conversion blocked; requires operator authorization or approved conversion rule. | **PENDING OWNER DECISION** |
| **OD-14** | **Merchant Identity Privacy & Customer-Facing Branding** | How should merchant identity be displayed across customer touchpoints to protect personal phone/email/address, while preserving statutory seller disclosures (CGST/Consumer Protection) and routing customer care via ATEEVRA?<br>📄 [Analysis](blueprint/M2-14-OD-14-MERCHANT-IDENTITY-PRIVACY-ANALYSIS.md)<br>📜 [Policy](blueprint/M2-14-OD-14-CUSTOMER-FACING-BRANDING-POLICY.md)<br>⚖️ [Legal Matrix](blueprint/M2-14-OD-14-LEGAL-DISCLOSURE-AND-COMPLIANCE-MATRIX.md)<br>🔒 [Access Matrix](blueprint/M2-14-OD-14-INFORMATION-ACCESS-AND-DISCLOSURE-MATRIX.md)<br>🔗 [Traceability](blueprint/M2-14-OD-14-IMPLEMENTATION-TRACEABILITY.md) | Public APIs and storefront mask merchant personal PII; invoices print merchant legal name and registered business address under Section 31 CGST Act; customer care points to `{{ATEEVRA_HELPLINE}}` and `{{ATEEVRA_SUPPORT_EMAIL}}`; full operational data restricted internally via RBAC. | **OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING** |
| **OD-15** | **Cancellation, Return, RTO & Merchant Accountability Policy Framework** | Master marketplace operational policy suite covering: weight-based merchant reverse shipping on post-delivery customer returns (₹30–₹165+); ₹0 merchant reverse shipping on genuine RTO; ₹25 merchant cancellation penalty; ₹50 late dispatch penalty; ₹0 merchant penalty on pre-dispatch customer cancellation; 5-stage progressive enforcement framework.<br>📜 [POL-M2-14-01: Returns & Reverse Shipping](blueprint/policies/POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md)<br>📜 [POL-M2-14-02: RTO & Failed Delivery](blueprint/policies/POL-M2-14-02-RTO-AND-FAILED-DELIVERY.md)<br>📜 [POL-M2-14-03: Merchant Cancellation](blueprint/policies/POL-M2-14-03-MERCHANT-CANCELLATION-PENALTY.md)<br>📜 [POL-M2-14-04: Late Dispatch](blueprint/policies/POL-M2-14-04-MERCHANT-DISPATCH-SLA-LATE-PENALTY.md)<br>📜 [POL-M2-14-05: Customer Pre-Dispatch](blueprint/policies/POL-M2-14-05-CUSTOMER-PRE-DISPATCH-CANCELLATION.md)<br>📜 [POL-M2-14-06: Account Health](blueprint/policies/POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md)<br>📊 [Classification Matrix](blueprint/M2-14-CANCELLATION-RETURN-RTO-CLASSIFICATION-MATRIX.md)<br>🏛️ [OD-02 v1.1.0 Revision](blueprint/M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md)<br>📈 [Revised Financial Model](blueprint/M2-14-REVISED-FINANCIAL-MODEL-AND-UNIT-ECONOMICS.md) | Enforces 100% full customer refund on returns/cancellations; debits merchant settlement balance via contractual set-off; tracks 8 account health metrics; requires first physical carrier scan as proof of dispatch. | **OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)** |

---

## Detailed Decision Registers (OD-01 to OD-14)

---

### OD-01: Marketplace Commercial Revenue Architecture & Platform Fee Model

**Decision Status:** `OWNER DIRECTION RECORDED — PENDING FEE SELECTION & PROFESSIONAL VALIDATION`  
*(Governance Invariant: This records the Project Owner's clarified commercial business-model direction. It does NOT constitute final approval of fee rates, does NOT authorize software implementation, and does NOT approve application code changes).*  
**Owner Business Model Direction:** Marketplace Facilitation Platform (Merchants as Sellers of Record; zero wholesale inventory buy-sell).  
**Dedicated Supporting Analysis:** [`decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md`](decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md)  
**Dedicated Blueprint Deliverables:**
- [`blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md`](blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md)
- [`blueprint/M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md`](blueprint/M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md)
- [`blueprint/M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md`](blueprint/M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md)

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"Define financial source of truth, commission, discounts, tax/shipping allocation... before earnings/payout."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L15`: *"No hardcoded production merchants, warehouses, roles, prices, commission, status or payout dates."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L31`: *"Distinguish order total, seller gross sales, platform commission, refunds, adjustments, net payable and settlement."*
- [`M2-14-EXECUTION-PLAN.md#Section 2`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#2-four-dimension-financial-policy-boundaries): Enforces Gross Transaction Data (`quantity * unitPrice`) without hardcoded commission deductions.

#### 2. Project Owner Clarified Direction & Reassessment of Prior Models
- **Merchants are Sellers of Record:** Direct contracts of sale exist between merchants and customers. Merchants issue customer-facing B2C GST tax invoices.
- **ATEEVRA is Marketplace Facilitator:** Operates as an Electronic Commerce Operator (ECO) providing storefront software, checkout routing, and logistics aggregation.
- **Revenue via Separately Defined Facilitation Fee:** ATEEVRA earns revenue via an explicit platform fee (+ 18% GST under SAC 998371) billed to merchants.
- **No Wholesale Resale:** ATEEVRA does NOT take title, purchase inventory, or act as a wholesale buyer.
- **Reassessment of Previous Mode 1 (Wholesale Markup):** Treating $(P_{\text{sell}} - P_{\text{realization}})$ as automatic wholesale markup is discarded. In a seller-of-record model, the merchant is entitled to customer product sales, and platform revenue is governed by the agreed **Platform Facilitation Fee**.

#### 3. Rigorous Pricing Terminology & Mathematical Constraints

##### A. Core Pricing Variables in Marketplace Facilitation Model
All pricing algorithms, database specifications, and financial calculations must use the following variables consistently:
- **$P_{\min}$:** Merchant-approved minimum acceptable net product realization per unit (the floor below which the merchant cannot be settled).
- **$P_{\text{merchant}}$:** Merchant-declared retail product price (basis for customer shelf price and B2C tax invoice).
- **$P_{\max}$:** Merchant-approved maximum customer-facing selling price per unit (omnichannel price parity ceiling).
- **$P_{\text{sell}}$:** Customer-facing shelf selling price. In pure seller-of-record marketplace, $P_{\text{sell}} = P_{\text{merchant}}$.

##### B. Complete Mathematical Pricing Constraints
The pricing engine must strictly enforce:
$$\mathbf{P_{\text{realization}} \le P_{\text{sell}} \le P_{\max} \le \text{Statutory Package MRP}}$$
- Where $\text{Net Merchant Realization} = P_{\text{sell}} - \text{Platform Fee} - \text{GST on Fee} - \text{Statutory TCS/TDS}$.
- **Non-Negativity Constraint:** Net merchant realization must never fall below $P_{\min}$. If platform fees cause net realization to drop below $P_{\min}$, the pricing conflict hierarchy in [`POL-OD-02-06`](blueprint/policies/OD-02-06-PRICING-BOUND-CONFLICTS.md) executes.

##### C. Statutory Terminology Safeguard: $P_{\max}$ vs. Legal MRP
- In compliance with Indian Legal Metrology (Packaged Commodities) Rules, the term **Maximum Retail Price (MRP)** is a statutory declaration that can only be printed on physical packaging by the manufacturer or importer.
- **$P_{\max}$ must strictly be defined and displayed as "maximum customer-facing selling price"**, unless the actual legally declared MRP is separately captured, verified, and displayed as the statutory package ceiling ($P_{\text{sell}} \le \text{MRP}$).

#### 4. Evaluated Platform Fee Structures
*(Detailed in [`blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md`](blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md))*:
- **Option A (Fixed Fee Per Order):** Flat ₹50.00 base per fulfilled order. Simple, but creates operating deficit on low AOV and fails to scale.
- **Option B (Fixed Fee Per Item):** Flat ₹25.00 base per delivered unit. Flawed for multi-item low-value bundling.
- **Option C (Percentage Facilitation Fee — PRIMARY RECOMMENDATION):** **8.0% to 10.0%** of customer product price. Dynamically scales revenue with order value; covers OD-02 return reserves; conforms cleanly to Indian FDI marketplace regulations.
- **Option D (Hybrid Platform Fee — STRONG ALTERNATIVE):** **₹20.00 fixed + 5.0% percentage**. Provides guaranteed downside cost recovery on cheap items while capturing scale on expensive items.
- **Option E (Customer-Paid Convenience Fee):** Flat ₹19.00 billed to customer at checkout. NOT RECOMMENDED due to high cart abandonment and CCPA dark pattern scrutiny.

#### 5. Critical Financial & Compliance Safeguards
- **Platform Facilitation Fee Invoicing (SAC 998371):** ATEEVRA's facilitation fee is a B2B supply of digital marketplace services attracting **18% GST**. ATEEVRA issues a B2B Tax Invoice; registered merchants claim Input Tax Credit (ITC).
- **Verified Statutory Tax Withholding Rates:**
  - *GST Section 52 TCS:* **0.50% total** (0.25% CGST + 0.25% SGST / 0.50% IGST) on net taxable supplies pursuant to **CBIC Notification No. 15/2024–Central Tax (effective 10 July 2024)**.
  - *Income Tax Section 194-O TDS:* **0.10%** on gross sales pursuant to the **Finance (No. 2) Act, 2024 (effective 1 October 2024)**, subject to the ₹5,00,000 threshold for Individual/HUF sellers.
- **Mandatory Qualified Indian Legal & CA Tax Review Required:** FDI Press Note 2 (2018) marketplace compliance, Consumer Protection Rule 5(3)(b) price independence, and RBI Payment Aggregator nodal escrow guidelines.

#### 6. Financial Impact & Forward Freight Warning
*(Detailed in [`blueprint/M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md`](blueprint/M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md))*:
- **Forward Freight Absorption Deficit:** If ATEEVRA earns only ₹60, ₹75, or ₹100 in platform fee, but absorbs 100% of the ₹70 forward shipping freight, the platform operates at a **NET ORDER CONTRIBUTION DEFICIT** (-₹12.61 to -₹52.61) after allocating the ₹22.61 Return Reserve and ₹20 gateway fee.
- **Strategic Imperative:** Forward shipping must be shipping-neutral (billed to customer at checkout or charged to merchant), or the platform facilitation fee must be set higher (e.g. 15%+) to cover freight. Under shipping neutrality, Option C (10%) yields a healthy **+₹57.39 net contribution (+5.74%)**.

#### 7. OD-02 Compatibility Analysis
The marketplace facilitation fee model is **100% compatible with all six approved OD-02 policies** (`POL-OD-02-01` through `POL-OD-02-06`):
- `POL-OD-02-01` (Return Reserve): Funded from platform facilitation fee revenue.
- `POL-OD-02-02` (Unified Pricing): Maintained across prepaid and COD.
- `POL-OD-02-03` (Gateway MDR Absorption): Platform absorbs gateway MDR on merchant-fault returns.
- `POL-OD-02-04` (Carrier Damage): Customer protected; merchant realization protected unless packing defect.
- `POL-OD-02-05` (COD RTO Funding): Platform funds COD RTO out of return reserve pool.
- `POL-OD-02-06` (Conflict Hierarchy): Step 1 ("Compress Gross Markup") translates directly to **"Compress ATEEVRA Platform Facilitation Fee"**.

#### 8. Required System Changes (When Authorized)
- **Database (Proposed):**
  - Extend product variant schema: `min_price_in_cents`, `max_price_in_cents`, `merchant_price_in_cents`.
  - Extend `order_line_item`: `platform_fee_cents`, `platform_fee_gst_cents`, `tcs_withheld_cents`, `tds_withheld_cents`.
  - Create `merchant_platform_fee_invoice` ledger table.
- **Backend Services:** `PlatformFeeEngine` service; checkout line-item calculation pipeline; boundary validator guards.
- **Merchant Portal UI:** Pricing bound inputs; monthly B2B platform fee invoice download tab.
- **Admin UI:** Fee rate configuration dashboard, category fee override matrix.

#### 9. Explicit Policy Dependencies
- **OD-05 (Statutory Tax Withholding):** Net payout deduction of 0.5% GST TCS and 0.1% Income Tax TDS.
- **OD-07 (Merchant Settlement and Payouts):** Payouts to merchants calculated strictly as:
  $$\text{Net Payout} = \sum P_{\text{item}} - \text{Fee} - \text{GST on Fee} - \text{TCS} - \text{TDS} - \text{OD-02 Debits} \pm \text{Reserves}$$

#### 10. Exact Questions Requiring Project Owner Decision
> **Project Owner Decision Frame for OD-01:**  
> 1. Do you formally ratify the **Marketplace Facilitation Platform Model** (merchants as direct sellers of record, issuing B2C customer invoices, ATEEVRA earning service revenue via transparent facilitation fees)?  
> 2. Which platform fee model do you select for ATEEVRA MVP-2: **Option C (Percentage Fee, e.g. 8–10%)** or **Option D (Hybrid Fee, e.g. ₹20 + 5%)**?  
> 3. Do you confirm that forward shipping freight (₹70) must be shipping-neutral (billed to customer at checkout or charged to merchant) to prevent platform contribution margin deficits?

---

### OD-02: Refund Financial Liability

**Decision Status:** `OWNER APPROVED — INITIAL POLICY BASELINE (OD-02-01 through OD-02-06)`  
*(Governance Invariant: The platform owner has formally approved the six initial policies [OD-02-01 to OD-02-06] as ATEEVRA's commercial baseline. This approval is for initial business-policy direction only; legal, accounting, GST, tax, and contractual validation remains mandatory. Implementation is NOT authorized, and application code/schema modifications remain blocked).*  
**Authoritative Central Blueprint:** [`blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Master Policy Register:** [`blueprint/POLICY-REGISTER.md`](blueprint/POLICY-REGISTER.md)  
**Approved Baseline Policies:**
- **OD-02-01:** Category-Specific Return-Cost Reserve Calibration ([`POL-OD-02-01`](blueprint/policies/OD-02-01-RETURN-COST-RESERVE.md))
- **OD-02-02:** Unified Product Selling Price Across Prepaid and COD ([`POL-OD-02-02`](blueprint/policies/OD-02-02-PREPAID-COD-PRICING.md))
- **OD-02-03:** Platform Absorption of Gateway MDR on Merchant-Fault Returns ([`POL-OD-02-03`](blueprint/policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md))
- **OD-02-04:** Customer Protection with Evidence-Based Liability for Carrier Damage ([`POL-OD-02-04`](blueprint/policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md))
- **OD-02-05:** Platform Funding of COD RTO with Automated Customer Risk Controls ([`POL-OD-02-05`](blueprint/policies/OD-02-05-COD-RTO-FUNDING.md))
- **OD-02-06:** Pricing-Bound Conflict Resolution Hierarchy (Never Silently Violate $P_{\max}$/MRP) ([`POL-OD-02-06`](blueprint/policies/OD-02-06-PRICING-BOUND-CONFLICTS.md))  
**Dedicated Supporting Analysis:** [`decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md`](decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md)  
**Historical Alternatives Context:** Option D (Advisory Recommendation — Superseded) | Option D.1 (Owner Proposed Model — Formalized into Policies OD-02-01 to OD-02-06)

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"Define financial source of truth, commission, discounts, tax/shipping allocation, partial refunds, COD, exchange differences, adjustments, net payable and settlement lifecycle before earnings/payout."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L31`: *"Distinguish order total, seller gross sales, platform commission, refunds, adjustments, net payable and settlement."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L15`: *"No hardcoded production merchants, warehouses, roles, prices, commission, status or payout dates."*
- [`M2-14-EXECUTION-PLAN.md#Section 2`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/mvp2/m2-14/M2-14-EXECUTION-PLAN.md#2-four-dimension-financial-policy-boundaries): Dimension D (Commercial Liability) mandates zero silent seller ledger debits.

#### 2. Business Context & Interaction with Proposed OD-01 Pricing Model
Under the proposed OD-01 Hybrid Zero-Commission Product-Level Markup Model (Mode 1 Fixed Realization), a customer pays $P_{\text{sell}}$, the merchant is promised a fixed realization $P_{\text{realization}}$ ($P_{\text{realization}} \ge P_{\min}$), and ATEEVRA earns a gross markup of $P_{\text{sell}} - P_{\text{realization}}$.
When an order cancellation or return refund occurs, ATEEVRA must refund the customer up to $P_{\text{sell}}$. A formal commercial policy must establish:

##### A. Five Fundamental Financial & Accounting Concepts
1. **Actual Cash Movement:** Real cash transfers into or out of platform bank/gateway accounts (customer checkout payments, Razorpay MDR charges, 3PL logistics invoices, customer refunds, merchant payouts).
2. **Merchant Payable Cancellation:** Internal software ledger operation voiding pending $P_{\text{realization}}$ liability during pre-settlement status. **Zero cash moves** into or out of any external bank account.
3. **Merchant Adjustment Receivable Creation:** Internal software ledger entry logging that a merchant owes funds to ATEEVRA. **This is an accounting asset, NOT an immediate cash inflow.**
4. **Successful Future Settlement Offset:** Operational withholding of an existing receivable from future earned settlement disbursement batches, resulting in economic recovery. **Offsets strictly reduce future cash payout outflows to the merchant; they are never immediate cash inflows.**
5. **Uncollectible Merchant Receivable (Bad Debt):** The permanent economic loss when a receivable cannot be offset because the merchant has zero future sales or defaults, requiring a write-off.

##### B. Merchant Settlement States
- **Unsettled Merchant Payable (Pre-Settlement Return):** Occurs during the provisional merchant payout hold / settlement reserve window (OD-07 provisional). The pending realization payable ($P_{\text{realization}}$) is canceled. **This is not a bank debit.**
- **Already Settled Merchant Payout (Post-Settlement Return):** Approved after payout disbursement. An authorized adjustment receivable ($P_{\text{realization}}$) is recorded on the ledger. Recovery occurs strictly via future settlement offsets; the platform cannot perform an automated direct bank debit.

##### C. Decoupling Physical Custody from Legal Ownership
Physical logistics and legal property rights must be separated into six dimensions:
1. **Courier Custody:** Physical bailment/possession by the 3PL partner during reverse transit.
2. **Merchant Physical Receipt:** Physical parcel delivery scan at the merchant warehouse dock.
3. **Product Inspection:** Technical condition and authenticity audit by merchant personnel.
4. **Contractual Legal Ownership (Title in Goods):**
   > [!IMPORTANT]
   > The platform and specifications must **never invent an automatic legal ownership-transfer rule**. Passage of title is governed strictly by the Indian Sale of Goods Act, 1930, and formal Merchant Agreements / Terms of Service. Legal ownership transfer requires contractual definition and legal counsel confirmation.
5. **Restocking Eligibility:** Operational determination if an item can be re-entered into sellable inventory.
6. **Damaged / Unusable Inventory Treatment:** Disposition for items failing inspection (liquidation, return-to-customer, or courier insurance claim). Restocking does not drive financial disbursement.

##### D. Overhead & Logistics Allocation
ATEEVRA forfeits its gross markup. Commercial policy determines who absorbs non-refundable gateway processing fees (~2% + GST) and forward/reverse shipping across return fault categories.

#### 3. Current Implementation & Architecture Baseline
- **Prepaid Refund Flow:** `OrderService.processPrepaidRefund` in `apps/storefront/src/lib/orders/order-service.ts` attempts to call Medusa `/admin/payments/:id/refund` using a publishable key (rejected 401), swallows the error, and saves state only into Redis cache (`order:by_id:${order.id}`).
- **Razorpay Integration:** `RazorpayPaymentProvider.refundPayment` in `apps/backend/src/modules/payment/razorpay-provider.ts` is a mock returning `{ status: 'refunded' }` with zero outbound HTTP calls to the Razorpay refund API. Webhook handler ignores refund events (`refund.processed` returns `not_supported`).
- **COD Payout Flow:** `ReturnEngine` in `apps/backend/src/modules/return/return-engine.ts` validates UPI/IFSC regex and generates an in-memory DTO with `status: 'pending'`. There is zero database persistence and zero banking payout rail.
- **Settlement Adjustments:** There is **no seller ledger or settlement adjustment table** in the database. Scoped merchant orders calculate gross subtotal only (`sum(unitPrice * qty)`). Technical refund primitives exist in Medusa core, but zero seller balance deductions are implemented.

#### 4. Proposed Return & Refund Lifecycle & Open Operational Protocols
The proposed lifecycle consists of nine sequential stages:
`Return request → authorization → pickup → physical receipt → inspection/dispute → refund authorization → gateway submission → gateway confirmation → financial reconciliation.`

**Open Operational Policy Questions (Unresolved):**
- *Inspection Timeout:* If a merchant fails to inspect a returned item within $N$ days, does the system auto-refund the customer? (A 48-hour window is an illustrative design parameter, NOT an approved policy).
- *Delayed Transit:* Who bears customer dispute costs if 3PL courier transit is prolonged past the return window?
- *Disputed Returns:* Handling protocols for empty-box or customer-damaged returns remain an open governance decision.

#### 5. Financial Liability Components
Every return or refund reconciliation separates nine distinct financial components:
1. **Customer Refund Amount ($C_{\text{ref}}$):** Amount credited back to customer ($\le P_{\text{sell}}$).
2. **Merchant Realization Reversal ($M_{\text{rev}}$):** Agreed realization canceled/debited ($P_{\text{realization}}$).
3. **ATEEVRA Markup Reversal ($A_{\text{rev}}$):** Platform markup forfeited ($P_{\text{sell}} - P_{\text{realization}}$).
4. **Payment Gateway Sunk Fee ($GW_{\text{fee}}$):** Non-refundable Razorpay MDR (~2% + GST on $P_{\text{sell}}$).
5. **Forward Logistics Cost ($Ship_{\text{fwd}}$):** Outbound 3PL delivery fee.
6. **Reverse Logistics Cost ($Ship_{\text{rev}}$):** Inbound 3PL return transit fee.
7. **Platform-Funded Discount Reversal:** Platform coupon adjustment (OD-03 Provisional).
8. **Merchant-Funded Discount Reversal:** Seller promotional deal adjustment (OD-03 Provisional).
9. **Statutory Tax Adjustments:** GST credit notes and Section 52 GST TCS reversal filings (OD-05 Provisional).

#### 6. Policy Alternatives
- **Option A (Merchant Bears Product Liability; Platform Absorbs Overhead):**
  - Merchant realization payable is canceled (or receivable logged if post-settlement).
  - ATEEVRA forfeits gross markup and permanently absorbs the non-refundable Razorpay fee (~2% + GST). Forward/reverse shipping absorbed by platform or customer.
- **Option B (ATEEVRA Bears Product Liability):**
  - Merchant realization remains fully paid to or retained by the merchant. ATEEVRA absorbs the entire customer refund, losing product price + markup + gateway + shipping. (Commercially unviable; creates severe moral hazard).
- **Option C (Responsibility Based on Return Reason / Fault):**
  - *Merchant Fault (Defective / Damaged / Wrong Item):* Merchant payable canceled; merchant debited for reverse shipping and gateway processing fees.
  - *Customer Remorse (Size / Fit / Changed Mind):* Merchant payable canceled; customer or platform absorbs reverse shipping.
- **Option D (Hybrid Granular Liability Model — ADVISORY RECOMMENDATION):**
  - Product realization payable is canceled for the merchant (or receivable logged if post-settlement).
  - Platform gross markup is 100% forfeited by ATEEVRA.
  - Non-refundable gateway fee (~2% + GST) is absorbed by ATEEVRA as a platform operating cost.
  - Reverse shipping is debited to the merchant *only* on verified merchant-fault returns (defective/incorrect); remorse returns are platform-subsidized (or customer-deducted).
  - Payout timing is coordinated with provisional merchant payout hold / settlement reserve rules (OD-07) to reduce negative balance risk.
- **Option D.1 (Customer-Friendly Zero-Return-Fee Model with Dynamic Pricing Reserve — OWNER PROPOSED):**
  - Advanced commercial refinement of Option D eliminating all customer-facing return shipping fees and refund deductions.
  - Merchant realization payable is canceled for the returned item.
  - Platform gross markup is forfeited on the individual returned order.
  - Non-refundable gateway fee (~2% + GST), forward freight, and customer-remorse reverse shipping are 100% absorbed by ATEEVRA.
  - Sunk platform return expenses are funded across completed sales via an internal actuarial Return-Cost Pricing Reserve integrated within $P_{\text{sell}}$ under OD-01 constraints ($P_{\text{sell}} \le P_{\max}$).
  - Reverse shipping is debited to the merchant *only* on verified merchant-fault returns (defective, wrong SKU, transit-damaged due to packaging).
  - Payout timing is coordinated with provisional settlement reserve holds (OD-07) to mitigate negative balance risk.

#### 7. Numerical Reconciliation (Hypothetical ₹1,000 Purchase)
*(Hypothetical commercial cash-flow illustrations only; not finalized statutory accounting or tax treatment; zero approved policies; Razorpay fee of ₹23.60 is an illustrative input)*
- Initial Customer Payment Inflow: **+₹1,000.00**
- Merchant Realization ($P_{\text{realization}}$): **₹800.00** | Platform Gross Markup: **₹200.00**
- Gateway Processing Fee (Sunk): **-₹23.60**
- Forward Shipping (Sunk): **-₹70.00** | Reverse Shipping: **-₹90.00**
- Customer Refund Outflow: **-₹1,000.00**

##### A. Pre-Settlement Numerical Reconciliation (Customer Return Prior to Payout Disbursement)
1. **Actual Platform Cash Movements (Bank/Gateway Perspective):**
   - Customer Payment Inflow: +₹1,000.00
   - Gateway Processing Fee (Sunk): -₹23.60
   - Forward Logistics Fee (Sunk): -₹70.00
   - Customer Refund Outflow: -₹1,000.00
   - Reverse Logistics Fee: -₹90.00
   - Pre-Settlement Merchant Payout Outflow: ₹0.00 (Opt A, C, D) | -₹800.00 (Opt B)
   - **Actual Platform Cash Impact Before Any Recovery:**
     - **Option A:** **-₹183.60** (+1,000 - 23.60 - 70 - 1,000 - 90 = -183.60)
     - **Option B:** **-₹983.60** (+1,000 - 23.60 - 70 - 1,000 - 90 - 800 = -983.60)
     - **Option C:** **-₹183.60** (+1,000 - 23.60 - 70 - 1,000 - 90 = -183.60)
     - **Option D:** **-₹183.60** (+1,000 - 23.60 - 70 - 1,000 - 90 = -183.60)

2. **Internal Software Ledger Entries (Zero Immediate Cash):**
   - Merchant Payable Canceled: ₹800.00 (Opt A, C, D) | ₹0.00 (Opt B)
   - Merchant Adjustment Receivable Logged (Ledger Asset, NOT Cash Inflow):
     - Option A: ₹0.00
     - Option B: ₹0.00
     - Option C (Merchant Fault): **+₹113.60** (reverse shipping ₹90.00 + gateway fee ₹23.60)
     - Option D (Merchant Fault): **+₹90.00** (reverse shipping ₹90.00 only)
     - Option D (Customer Remorse): ₹0.00

3. **Subsequent Settlement Resolution & Net Economic Impact:**
   - **Outcome 1 (Offset Succeeded in Future Settlement Batch):**
     - Option A: Final Economic Impact = **-₹183.60**
     - Option B: Final Economic Impact = **-₹983.60**
     - Option C (Merchant Fault): Offset +₹113.60 achieved → Final Economic Impact = **-₹70.00** (-183.60 + 113.60)
     - Option D (Merchant Fault): Offset +₹90.00 achieved → Final Economic Impact = **-₹93.60** (-183.60 + 90.00)
     - Option D (Customer Remorse): Final Economic Impact = **-₹183.60**
   - **Outcome 2 (Offset Fails / Uncollectible Bad Debt):**
     - Offset achieved: ₹0.00; Uncollectible receivable written off: ₹113.60 (Opt C) / ₹90.00 (Opt D Fault).
     - Final Unrecovered Platform Cash Loss: **-₹183.60** across Option A, C, and D.

##### B. Post-Settlement Numerical Reconciliation (Customer Return After Payout Disbursement)
1. **Complete Lifecycle Cash Flow (Platform Bank Perspective):**
   - Initial Sale & Payout: Customer Inflow +₹1,000.00, Gateway Fee -₹23.60, Forward Shipping -₹70.00, Original Merchant Payout Disbursed -₹800.00 → Interim Platform Cash Balance: **+₹106.40**.
   - Return & Customer Refund: Customer Refund Outflow -₹1,000.00, Reverse Shipping Outflow -₹90.00.
   - **Cumulative Platform Cash Impact Before Any Recovery:** $+106.40 - 1,000.00 - 90.00 = \mathbf{-₹983.60}$ (identical across all options prior to recovery).

2. **Post-Settlement Ledger Adjustment Entries (Ledger Asset, NOT Cash Inflow):**
   - Option A: Debit Merchant Adjustment Receivable: **+₹800.00** (realization clawback).
   - Option B: Debit Merchant Adjustment Receivable: **₹0.00** (merchant realization protected).
   - Option C (Merchant Fault): Debit Merchant Adjustment Receivable: **+₹913.60** (realization ₹800 + gateway ₹23.60 + reverse shipping ₹90).
   - Option D (Merchant Fault): Debit Merchant Adjustment Receivable: **+₹890.00** (realization ₹800 + reverse shipping ₹90).
   - Option D (Customer Remorse): Debit Merchant Adjustment Receivable: **+₹800.00** (realization ₹800).

3. **Post-Settlement Resolution Scenarios:**
   - **Scenario 1 (Future Settlement Offset Actually Achieved):**
     - Option A: Offset of +₹800.00 achieved → Final Economic Impact = **-₹183.60** (-983.60 + 800.00).
     - Option B: Offset of ₹0.00 → Final Economic Impact = **-₹983.60**.
     - Option C (Merchant Fault): Offset of +₹913.60 achieved → Final Economic Impact = **-₹70.00** (-983.60 + 913.60).
     - Option D (Merchant Fault): Offset of +₹890.00 achieved → Final Economic Impact = **-₹93.60** (-983.60 + 890.00).
     - Option D (Customer Remorse): Offset of +₹800.00 achieved → Final Economic Impact = **-₹183.60** (-983.60 + 800.00).
   - **Scenario 2 (Future Offset Fails / Merchant Delists or Defaults):**
     - Offset achieved: ₹0.00. Uncollectible receivable written off.
     - Final Unrecovered Platform Cash Loss: **-₹983.60** across all options.

##### C. Complete Lifecycle Analysis for Option B (Platform Bears Refund Liability)
- **Pre-Settlement Case:** Option B explicitly protects and pays the ₹800.00 merchant realization even when the return occurs before normal settlement (Customer refunded ₹1,000.00, Merchant disbursed ₹800.00 payout outflow, Gateway fee ₹23.60 sunk, Forward shipping ₹70.00 sunk, Reverse shipping ₹90.00 paid → **Net Platform Cash Impact: -₹983.60**).
- **Post-Settlement Case:** Merchant already disbursed ₹800.00 prior to return. Customer refunded ₹1,000.00, Gateway fee ₹23.60 sunk, Forward shipping ₹70.00 sunk, Reverse shipping ₹90.00 paid. Zero receivable logged → **Net Platform Cash Impact: -₹983.60**.
- **Commercial Evaluation:** Option B inflicts a near-total cash loss of ₹983.60 on every ₹1,000 return and creates severe moral hazard.

#### 8. Customer-Friendly Reverse Shipping & Return-Cost Pricing Reserve — OWNER PROPOSAL

**Status:** `OWNER PROPOSED — PENDING FINAL APPROVAL AND LEGAL/ACCOUNTING REVIEW`

##### A. Commercial Vision & Option D.1 Categorization
The platform owner proposed that:
> *"ATEEVRA should not charge customers separately for reverse shipping. Reverse-shipping costs should be borne by ATEEVRA or shared between ATEEVRA and the merchant, depending on the verified reason for return. Expected cancellation and return expenses should be incorporated into ATEEVRA's customer-facing product pricing."*

- **Classification:** Officially recorded as **Option D.1 (Customer-Friendly Zero-Return-Fee Model with Dynamic Pricing Reserve)**.
- **Relationship to Option D:** Option D is preserved as the base advisory framework (reason-based liability split). Option D.1 refines Option D by strictly eliminating any customer deduction or fee for returns, funding platform-absorbed remorse shipping and sunk gateway fees via an actuarial Return-Cost Pricing Reserve inside gross platform markup.

##### B. Proposed Commercial Principles
1. **Zero Customer Reverse-Shipping Fees & Deductions:** Eligible returns receive 100% refund of $P_{\text{sell}}$ paid; zero reverse shipping is billed or deducted.
2. **Transparent Terms:** Clear disclosure of return windows, product condition criteria, transit steps, and refund turnaround times.
3. **Regulatory Compliance:** Strict compliance with the Consumer Protection Act, 2019, and Consumer Protection (E-Commerce) Rules, 2020.
4. **Reverse Shipping Responsibility Matrix:**
   - *Customer Remorse / Change of Mind:* **ATEEVRA** (100% absorbed via Return-Cost Pricing Reserve).
   - *Wrong Product Dispatched:* **Merchant** (debited to adjustment ledger; offset against future settlement).
   - *Incorrect Description / Listing:* **Merchant** (debited to adjustment ledger; offset against future settlement).
   - *Merchant Packaging Defect:* **Merchant** (debited to adjustment ledger; offset against future settlement).
   - *Verified Merchant-Caused Defect:* **Merchant** (debited to adjustment ledger; offset against future settlement).
   - *Courier Damage During Transit:* **Courier Claim / ATEEVRA** (ATEEVRA refunds customer immediately; prosecutes carrier loss claim).
   - *Unclear / Disputed Responsibility:* **ATEEVRA Initially** (platform covers immediate return, arbitrates evidence before debiting).
5. **Investigation & Dispute Protocol:** Customer returns are insulated from delays; photographic/video evidence collected at pickup and dock intake; disputes arbitrated under executed Merchant Agreements without inventing statutory liability.

##### C. Return-Cost Reserve in Product Pricing Engine
1. **Three Distinct Financial Measurements:**
   - **Measurement A (Expected Additional Return Expenses):** Incremental cash outflows caused solely by return/cancellation events (reverse freight ₹90, RTO freight ₹70, attempt fee ₹30, salvage freight ₹90, default risk). Excludes ordinary forward shipping (₹70) and gateway MDR (₹23.60) which are baseline variable costs.
   - **Measurement B (Expected Lost Contribution):** Economic delta between a successful retained order and an incident order: $\Delta \text{Contribution} = C_{\text{successful}} - C_{\text{incident}}$.
     *The ₹290.00 Remorse Difference:* $+106.40 - (-183.60) = \mathbf{₹290.00}$ (₹200 gross markup lost + ₹90 reverse shipping; common sunk gateway and forward freight cancel). At 6% remorse, expected lost contribution is **₹17.40** per placed order. Represents **lost contribution (opportunity cost)**, NOT an additional cash expense line.
   - **Measurement C (Expected Contribution Across All Outcomes):** Probability-weighted unit economics standard: $\mathbb{E}[\text{Contribution}] = \sum P_j \times C_j$ across mutually exclusive outcomes ($\sum P_j = 1.0$).
2. **Double-Counting Audit Across Expense Line Items:**
   - *Payment Gateway MDR (~2% + GST = ₹23.60):* Direct variable cost on captured orders. Sunk upfront. Never deducted a second time in return reserves.
   - *Outbound Forward Logistics (₹70.00):* Direct variable cost of fulfillment. Sunk upfront. Never deducted a second time in return reserves.
   - *Inbound Reverse Logistics (₹90.00):* Incremental return expense. Belongs strictly in expected incident costs / return reserve.
   - *Doorstep Verification Attempt Fee (₹30.00):* Incremental failed delivery expense (COD specific).
   - *COD RTO Reverse Freight (₹70.00):* Incremental failed delivery expense (COD specific).
   - *Damaged Merchandise Payout (₹800.00):* Incremental loss when customer refunded and compliant seller protected.
   *Rule:* Every expense is deducted **exactly once** in unit economics calculations.
3. **Revalidated Prepaid Unit Economics (Mutually Exclusive Tree, N = 100% Placed Orders):**
   - Pre-dispatch cancellation ($P = 0.040$, Avg Contribution = -₹16.52, Weighted = -₹0.66).
     *Cancellation Lost Contribution Decomposition:* $\mathbf{₹122.92} = \text{Foregone Platform Markup } (+₹200.00) - \text{Saved Forward Freight } (₹70.00) - \text{Saved Gateway MDR } (₹7.08)$ (accounting for ₹7.08 gateway MDR savings across States A, B, and C).
   - Courier transit damage ($P = 0.005$, Contribution = -₹623.60 net of illustrative 60% claim recovery on illustrative ₹600 cap [$0.60 \times ₹600 = ₹360$], Weighted = -₹3.12).
   - Verified merchant fault ($P = 0.020$, Contribution = -₹102.60 net of 90% offset recovery, Weighted = -₹2.05).
   - Customer remorse return ($P = 0.060$, Contribution = -₹183.60, Weighted = -₹11.02).
   - Successful delivery retained ($P = 0.875$, Contribution = +₹106.40, Weighted = +₹93.10).
   - Sum of Probabilities = $0.040 + 0.005 + 0.020 + 0.060 + 0.875 = \mathbf{1.000}$ (100.0%).
   - **Expected Contribution Per Placed Prepaid Order:** $+93.10 - 0.66 - 3.12 - 2.05 - 11.02 = \mathbf{+₹76.25}$.
   - *Identity Check:* Baseline Successful Contribution (+₹106.40) minus Expected Lost Contribution (₹30.15) = **+₹76.25**.
   - *Separation of Six Prepaid Unit-Economics & Reserve Metrics:*
     1. Gross incident expenses (excl. saved freight): $0.06(90) + 0.02(9) + 0.005(530) = \mathbf{₹8.23}$ per placed order.
     2. Avoided freight from pre-dispatch cancellation: $0.04 \times (-70) = \mathbf{-₹2.80}$ per placed order.
     3. Net expected incremental incident expense after saved freight (Measurement A): $8.2300 - 2.8000 = \mathbf{+₹5.43}$ per placed order. *(Measurement A strictly excludes pre-dispatch cancellation gateway MDR savings [$0.040 \times ₹7.08 = \mathbf{₹0.2832}$ per placed order], which are already fully captured in Measurement B expected lost contribution and must not be double-counted)*.
     4. Probability-weighted incident cash drain: $0.040(16.52) + 0.005(623.60) + 0.020(102.60) + 0.060(183.60) = 0.6608 + 3.1180 + 2.0520 + 11.0160 = \mathbf{₹16.8468 \approx ₹16.85}$ per placed order.
        *Full Bridge Breakdown of the ₹11.4168 Difference ($₹16.8468 - ₹5.4300 = \mathbf{₹11.4168}$):*
        - Cancellation gateway MDR retained: $0.040 \times ₹16.52 = \mathbf{₹0.6608}$
        - Cancellation avoided forward freight: $0.040 \times ₹70.00 = \mathbf{₹2.8000}$
        - Dispatched incident gateway MDR & forward freight: $0.085 \times (₹23.60 + ₹70.00) = 0.085 \times ₹93.60 = \mathbf{₹7.9560}$
        - Total Reconciled Bridge: $₹0.6608 + ₹2.8000 + ₹7.9560 = \mathbf{₹11.4168}$.
     5. Expected lost contribution (Measurement B): $\sum P_k \times (C_{\text{successful}} - C_k) = \mathbf{₹30.15}$ per placed order.
     6. Expected contribution per placed order (Measurement C): $+106.40 - 30.15 = \mathbf{+₹76.25}$.
     *(Note: Subtracting ₹16.85 from ₹106.40 yields +₹89.55, which overstates contribution by ₹13.30 because 12.5% of placed orders fail to complete and never earn baseline markup).*
4. **Revalidated COD Unit Economics (Mutually Exclusive Tree, N = 100% Placed Orders):**
   - Doorstep Customer Refusal / RTO ($P = 0.180$, Contribution = -₹170.00 [Forward Freight -₹70, Doorstep Attempt -₹30, RTO Freight -₹70, COD Collection Fee waived ₹0], Weighted = -₹30.60).
   - Successful COD Delivery Retained ($P = 0.7749$, Contribution = +₹90.00 [Customer +₹1,000 - Merchant ₹800 - Forward Freight ₹70 - COD Collection Fee ₹40], Weighted = +₹69.74).
   - Post-Delivery Remorse Return ($P = 0.0328$, Contribution = -₹203.40 [Forward Freight -₹70, COD Collection Fee -₹40, Reverse Freight -₹90, IMPS Payout Rail Fee -₹3.40], Weighted = -₹6.67).
   - Post-Delivery Merchant Fault ($P = 0.0123$, Contribution = -₹122.40 [Total outlays -₹203.40 + Merchant Offset +₹81.00], Weighted = -₹1.51).
   - Sum of Probabilities = $0.180 + 0.7749 + 0.0328 + 0.0123 = \mathbf{1.000}$ (100.0%).
   - **Expected Contribution Per Placed COD Order:** $+69.74 - 30.60 - 6.67 - 1.51 = \mathbf{+₹30.96}$.
   - *Reconciling COD Expected Incremental Incident Expense vs. Gross Incident Cash Drain:*
     - Net Incremental Incident Expense (Measurement A): $0.180(100.00) + 0.0328(93.40) + 0.0123(12.40) = \mathbf{₹21.22}$ per placed COD order.
     - Probability-Weighted Gross Incident Cash Drain: $0.180(170.00) + 0.0328(203.40) + 0.0123(122.40) = \mathbf{₹38.78}$ per placed COD order.
     - Reconciled ₹17.56 Difference: $₹38.78 - ₹21.22 = \mathbf{₹17.56}$ represents baseline fulfillment costs embedded in failed orders ($0.18 \times ₹70 \text{ forward freight} + 0.0451 \times ₹110 \text{ [forward + COD fee]} = \mathbf{₹17.561}$).
     - Expected Lost Contribution (Measurement B): $0.180(260.00) + 0.0328(293.40) + 0.0123(212.40) = \mathbf{₹59.04}$ per placed order ($+90.00 - 59.04 = \mathbf{+₹30.96}$).
     - Reconciling the "₹45–₹50" claim: Baseline at 18% RTO is ₹38.78 gross cash drain; ₹45–₹50 reflects elevated cohort RTO rates of 22%–25% ($0.22 \times 170 + 8.18 = \mathbf{₹45.58}$; $0.25 \times 170 + 8.18 = \mathbf{₹50.68}$).
   - *Tax Treatment & GST Sensitivity of Electronic Refund-Rail Fee:*
     - Distinguishes: (1) Pre-GST Base Fee: ₹3.400, (2) 18% GST: ₹0.612, (3) Gross Cash Payment: ₹4.012, (4) Potential Eligible ITC (subject to CA/tax review), (5) Net Economic Expense after ITC.
     - *Alternative 1, Case A (Contractual Fee Inclusive of GST, No Recoverable ITC / Sunk Tax — Baseline):* Gross cash payment = ₹3.400, base service fee = ₹2.881, embedded GST = ₹0.519, net economic expense = ₹3.400 (ITC unrecoverable / expensed) $\rightarrow$ Baseline COD contribution remains exactly **+₹30.96396 $\approx$ +₹30.96**.
     - *Alternative 1, Case B (Contractual Fee Inclusive of GST, With Eligible Recoverable ITC — Upside):* Gross cash payment = ₹3.400, base service fee = ₹2.881, embedded GST claimed as ITC = ₹0.519, net economic expense = ₹2.881 per refund $\rightarrow$ Expected COD contribution adjusts by $+0.0451 \times ₹0.519 = +₹0.0234069$ to **+₹30.98737 $\approx$ +₹30.99** (portfolio delta = +₹0.023 per placed COD order).
     - *Alternative 2, Case A (Pre-GST Base Fee with Recoverable ITC — Baseline Economic Model):* Base fee = ₹3.400, 18% GST = ₹0.612, gross cash payment = ₹4.012, net economic expense = ₹3.400 (claiming ₹0.612 ITC against output GST) $\rightarrow$ Baseline COD contribution remains exactly **+₹30.96396 $\approx$ +₹30.96**.
     - *Alternative 2, Case B (Pre-GST Base Fee with Non-Recoverable GST / Blocked ITC — Downside):* Base fee = ₹3.400, 18% GST = ₹0.612, gross cash payment = ₹4.012, net economic expense = ₹4.012 (no ITC) $\rightarrow$ Expected COD contribution adjusts by $-0.0451 \times ₹0.612 = -₹0.0276012$ to **+₹30.93636 $\approx$ +₹30.94** (portfolio delta = -₹0.028 per placed COD order).
     - *ITC Caveat:* Input tax credit is NOT automatically available under either alternative; requires valid Section 31 tax invoice and GSTR-2B matching, and must be reviewed by ATEEVRA's statutory auditors and tax counsel.
5. **Courier & Merchant Recovery Lifecycle Assumptions:**
   Six operational milestones: (1) Ledger Adjustment Logged (accounting asset, **NOT cash**), (2) Claim Submitted, (3) Claim Accepted, (4) Cash Reimbursement Received (bank inflow), (5) Future Settlement Offset Completed (reduces future payout), (6) Receivable Written Off (bad debt). Recovery must **NEVER** improve cash or economic outcomes until milestone 4 or 5 occurs.
6. **Managerial Nature of the Reserve:**
   The reserve is strictly an internal pricing buffer within gross markup, NOT an advertised customer fee, a cash outflow at sale time, or a statutory tax deduction.

##### D. Compatibility with OD-01 Pricing Constraints & Contribution Hierarchy
1. **9-Level Pricing & Contribution Margin Hierarchy:**
   - Level 1: Customer Shelf Selling Price ($P_{\text{sell}}$) bounded by $P_{\text{realization}} \le P_{\text{sell}} \le P_{\max} \le \text{MRP}$.
   - Level 2: Fixed Merchant Realization ($P_{\text{realization}} \ge P_{\min}$).
   - Level 3: Gross Platform Markup ($P_{\text{sell}} - P_{\text{realization}} \ge 0$, +₹200.00).
   - Level 4: Direct Variable Transaction Operating Costs ($C_{\text{variable}}$: Prepaid: MDR ₹23.60 + Forward Freight ₹70.00 = ₹93.60 | COD: COD Collection Fee ₹40.00 + Forward Freight ₹70.00 = ₹110.00).
   - Level 5: Baseline Contribution of a Successful Retained Order ($C_{\text{successful}}$: Prepaid: +₹106.40 | COD: +₹90.00).
   - Level 6: Internal Risk Buffer / Expected Incident Reserve Calibration:
     - Net Incremental Incident Expense (Measurement A): +₹5.43 Prepaid / +₹21.22 COD
     - Probability-Weighted Gross Incident Cash Drain: ₹16.85 Prepaid / ₹38.78 COD
     - Expected Lost Contribution (Measurement B): ₹30.15 Prepaid / ₹59.04 COD
     *(Note: ₹16.85 and ₹38.78 represent gross cash drains bundling embedded baseline fulfillment costs; they must NOT be labeled as incremental return reserves).*
   - Level 7: Expected Unit Contribution Per Placed Order ($\mathbb{E}[\text{Contribution}]$: **+₹76.25 Prepaid** / **+₹30.96 COD** via Method A outcome sum or Method B: $C_{\text{successful}} - \mathbb{E}[\text{Lost Contribution}]$: Prepaid $+106.40 - 30.15 = \mathbf{+₹76.25}$ | COD $+90.00 - 59.04 = \mathbf{+₹30.96}$).
   - Level 8: Remaining Platform Contribution Before Fixed Overheads (covers CAC, AWS/GCP, Strapi CMS, Customer Support, Batch Payouts).
   - Level 9: Net Platform Profit (Cumulative Contribution - Fixed Corporate Overheads - Corporate Taxes).
   > [!CAUTION]
   > The pricing reserve allocation must **NEVER be subtracted a second time** from Expected Contribution, as expected contribution already incorporates all return and incident outlays.
2. **Hard Ceiling Invariant:** Pricing engine must **NEVER set $P_{\text{sell}} > P_{\max}$** under any circumstances. $P_{\max}$ is the merchant-approved customer price ceiling, NOT statutory package MRP ($P_{\text{realization}} \le P_{\text{sell}} \le P_{\max} \le \text{Statutory MRP}$).
3. **Pricing-Bound Conflict Resolution:** If $(P_{\max} - P_{\text{realization}}) < R_{\text{return}} + M_{\text{target}}$, owner must select among:
   - *Policy 1 (Catalog Guard Rejection):* Reject product onboarding if spread is below category minimum floor.
   - *Policy 2 (Platform Margin Compression):* ATEEVRA absorbs the deficit, accepting lower net margin.
   - *Policy 3 (Realization Renegotiation):* Request merchant lower $P_{\text{realization}}$ to create viable spread.
   - *Policy 4 (Merchant Return Co-Pay):* Merchant contractually subsidizes remorse returns if demanding tight spread.
4. **Statutory & CA Sign-Off:** Requires legal opinion on Rule 5(3)(b) price manipulation compliance and CA sign-off on GST structure.

##### E. Six Operational Numerical Scenarios (Hypothetical ₹1,000 Purchase)
*(All figures are illustrative commercial cash-flow examples; cash movements strictly separated from ledger entries)*

1. **Scenario 1: Customer Remorse Return (Prepaid):**
   - Customer payment: +₹1,000.00 | Customer refund: -₹1,000.00 | Net Customer: ₹0.00 (zero return fee).
   - Merchant realization: ₹800.00 | Payable canceled: ₹800.00 | Net Merchant Paid: ₹0.00 | Restocks goods.
   - Gateway fee: -₹23.60 (sunk) | Forward freight: -₹70.00 (sunk) | Reverse freight: -₹90.00 (paid by ATEEVRA).
   - **Actual Platform Cash Impact Before Recovery:** $+1,000 - 23.60 - 70 - 1,000 - 90 = \mathbf{-₹183.60}$.
   - Merchant Receivable: ₹0.00 | **Final Economic Impact:** **-₹183.60** (funded from pricing reserve).
   - **Lost Contribution Relative to Success:** **₹290.00** ($+106.40 - (-183.60) = \mathbf{₹290.00}$; ₹200 gross markup lost + ₹90 reverse freight).
2. **Scenario 2: Verified Merchant-Fault Return (Prepaid):**
   - Customer payment: +₹1,000.00 | Customer refund: -₹1,000.00 | Net Customer: ₹0.00.
   - Merchant realization: ₹800.00 | Payable canceled: ₹800.00 | Defective goods returned to merchant.
   - Gateway fee: -₹23.60 (sunk) | Forward freight: -₹70.00 (sunk) | Reverse freight: -₹90.00 (paid to 3PL).
   - **Actual Platform Cash Impact Before Recovery:** **-₹183.60**.
   - Merchant Receivable Logged: **+₹90.00** (reverse shipping penalty; ledger asset, **NOT immediate cash**).
   - **Economic Impact After Successful Offset:** $-183.60 + 90.00 = \mathbf{-₹93.60}$. (If offset fails: bad debt loss remains -₹183.60).
3. **Scenario 3: Courier-Damaged Shipment (Prepaid):**
   - Customer refund: -₹1,000.00 immediately released. Net customer cost: ₹0.00.
   - Merchant realization entitlement ($P_{\text{realization}} = \mathbf{₹800.00}$): Under proposed commercial policy, ATEEVRA proposes protecting merchants who comply with documented packaging requirements when damage occurs during carrier custody, subject to executed merchant agreements, carrier contracts, applicable law, and formal legal review. Payable held pending claim resolution, then disbursed.
   - Physical goods transit damaged; salvage value treated conservatively as ₹0.00; retrieved for carrier inspection.
   - Gateway fee: -₹23.60 (sunk) | Forward freight: -₹70.00 (sunk) | Reverse/salvage freight: -₹90.00.
   - **Actual Platform Cash Impact Before Recovery:** $+1,000 - 23.60 - 70 - 1,000 - 90 = \mathbf{-₹183.60}$.
   - Courier Claim Receivable Logged: **+₹800.00** declared value claim against 3PL (ledger asset under assessment, **NOT cash**).
   - *Case 3.A (Illustrative Uncapped Full Recovery / ₹800.00 Paid by 3PL):* 3PL pays +₹800 cash; ATEEVRA settles merchant ₹800 $\rightarrow$ Platform net cash impact: $-183.60 + 800 - 800 = \mathbf{-₹183.60}$.
   - *Case 3.B.1 (Illustrative Recovery Subject to ₹600 Cap):* 100% cap payout (+₹600 cash) $\rightarrow$ Net cash impact: $-183.60 + 600 - 800 = \mathbf{-₹383.60}$; 60% expected claim recovery (+₹360 cash) $\rightarrow$ Net cash impact: $-183.60 + 360 - 800 = \mathbf{-₹623.60}$ (Lost contribution = **₹730.00**).
   - *Case 3.B.2 (Illustrative Partial Recovery under ₹400 Cap):* 3PL pays +₹400 cash; ATEEVRA protects merchant and pays full ₹800 $\rightarrow$ Platform net cash impact: $-183.60 + 400 - 800 = \mathbf{-₹583.60}$.
   - *Case 3.C (Illustrative Denied Recovery / Claim Rejected by 3PL):*
     - Sub-case 3.C.1 (Platform Absorbs Loss to Protect Compliant Merchant): pays merchant ₹800 $\rightarrow$ Net platform cash loss: $-183.60 - 800 = \mathbf{-₹983.60}$.
     - Sub-case 3.C.2 (Carrier Proves Merchant Packaging Violation): liability shifts contractually to merchant per Scenario 2; ₹800 payable canceled (paid ₹0); merchant debited ₹90 reverse freight $\rightarrow$ Net impact: **-₹93.60** (after offset) or **-₹183.60** (if bad debt). *(Merchant liability must NEVER be assumed without factual/contractual proof).*
   - *(Note: The ₹600 cap and ₹400 cap are illustrative analytical parameters for modeling, NOT verified contractual SLA terms).*
4. **Scenario 4: RTO After COD Customer Refusal at Doorstep:**
   - *Comparison with Successful COD Delivery:* Customer pays +₹1,000 cash; forward freight -₹70; COD collection fee -₹40; merchant paid realization -₹800 $\rightarrow$ Net platform cash surplus: $+1,000 - 70 - 40 - 800 = \mathbf{+₹90.00}$.
   - *Comparison with Post-Delivery Remorse Return:* Customer refunded -₹1,000 electronically; forward freight -₹70 sunk; COD collection fee -₹40 retained by 3PL; reverse freight -₹90 paid; electronic IMPS payout rail fee (-₹3.40 base fee; -₹4.012 gross cash payment including 18% GST). Net economic expense: **-₹203.40** (if ITC eligible or inclusive fee); Gross cash outflow / unrecoverable expense: **-₹204.012** (if GST is unrecoverable).
   - *Doorstep Refusal (RTO):* Zero cash collected; zero customer refund. Merchant payable canceled; unopened goods returned to merchant custody and restocked to salable inventory after QC check. Zero merchant debit.
   - Logistics Breakdown: Forward freight: -₹70.00 | 3PL doorstep verification attempt fee: -₹30.00 (typically ₹20–₹40; carrier percentage collection fee of ₹40.00 waived because zero cash was collected) | RTO reverse return freight: -₹70.00 (typically ₹50–₹70).
   - Total failed delivery logistics: **₹120.00 to ₹180.00** (hypothetical baseline: **-₹170.00**).
   - **Actual Platform Cash Impact:** $0 - 70 - 30 - 70 = \mathbf{-₹170.00}$ (or up to **-₹180.00** if attempt fee is ₹40). Zero merchant debt created.
   - Cause Allocation: Remorse/refusal absorbed 100% by COD Return Risk Reserve; Merchant delay debited to merchant; Fake attempt disputed with 3PL.
   - **Final Economic Impact:** **-₹170.00** dead-loss absorbed by platform COD pricing reserve.
   - **Lost Contribution Relative to Success:** **₹260.00** ($+90.00 - (-170.00) = \mathbf{₹260.00}$; ₹200 gross markup lost + ₹60 net logistics difference).
5. **Scenario 5: Pre-Dispatch Customer Cancellation (Prepaid):**
   - Customer refund: -₹1,000.00. Merchant payable canceled. Physical goods never leave merchant shelf. Zero shipping (saves ₹70 forward freight).
   - *Three Technical States:*
     - State A (Pre-Auth Cancellation): Zero gateway fee charged: **₹0.00**. Net cash impact: **₹0.00**.
     - State B (Authorized Uncaptured Void): Authorization hold released/voided. Razorpay retains **₹0.00 MDR**. Net cash impact: **₹0.00**.
     - State C (Post-Capture Settlement Refund): Auto-captured payment. Razorpay permanently retains non-refundable MDR (~2% + GST = **-₹23.60**). Platform cash moves: $+1,000 - 23.60 - 1,000 = \mathbf{-₹23.60}$.
   - Cost Allocation: Sunk MDR (-₹23.60 in State C; ₹0.00 in States A & B) absorbed by platform cancellation reserve. *(Fee must NOT be automatically applied to all cancellations).*
   - **Lost Contribution Relative to Success:**
     - *Weighted Average Across All States:* $C_{\text{successful}} - C_{\text{cancel}} = +106.40 - (-16.52) = \mathbf{₹122.92} = \text{Foregone Markup } (+₹200.00) - \text{Saved Forward Freight } (₹70.00) - \text{Saved Gateway MDR } (₹7.08)$.
     - *State C Specifically (Post-Capture):* $C_{\text{successful}} - C_{\text{cancel\_StateC}} = +106.40 - (-23.60) = \mathbf{₹130.00} = \text{Foregone Markup } (+₹200.00) - \text{Saved Forward Freight } (₹70.00) - \text{Saved Gateway MDR } (₹0.00)$.
6. **Scenario 6: Successful Delivery Without Return (Prepaid):**
   - Customer pays ₹1,000.00. Merchant disbursed realization: -₹800.00 ($P_{\text{realization}} \ge P_{\min}$). Gateway MDR fee: -₹23.60. Outbound forward freight: -₹70.00.
   - **Actual Platform Cash Impact:** Net cash surplus of $+1,000 - 23.60 - 70 - 800 = \mathbf{+₹106.40}$ retained in platform bank account.
   - Internal Risk Reserve: **Managerial Risk Buffer Calibration:** Internal risk calibration incorporates net incremental incident expenses (+₹5.43), gross incident cash drain (₹16.85), and expected lost contribution (₹30.15). *(Strictly an internal managerial pricing allocation buffer within gross markup, NOT an additional cash outflow from the bank account, NOT an advertised fee, and NOT a statutory tax provision).*
   - Contribution Margin Recognition: **₹76.25** recognized as **"Expected Unit Contribution Per Placed Prepaid Order (Before Other Operating Expenses)"** across the order portfolio.
   - Excluded Company-Level Overheads: This expected contribution is **NOT net operating profit**. It represents unit contribution remaining to absorb company-level operating expenses: (1) CAC & marketing, (2) Cloud hosting (AWS/GCP/Supabase/Redis), (3) Strapi CMS & analytics, (4) Support and operations payroll, (5) IMPS/NEFT payout rail fees, (6) Core engineering salaries, (7) Corporate income taxes.
   - Net Platform Profit realized only after all company-level operating overheads and corporate taxes are deducted from cumulative contribution.

##### F. Financial and Operational Safeguards
1. *Reserve Volatility:* Cash buffer required for seasonal return surges.
2. *Non-Guaranteed Offsets:* Future merchant settlement offsets depend on ongoing sales volume.
3. *Merchant Default:* Negative balances from defective batches become bad debt if seller departs.
4. *Return Fraud:* Velocity limits, OTP on pickup, unboxing evidence protocols to prevent wardrobing.
5. *Courier Claims:* Stringent 24–48h filing windows and transit packaging proof.
6. *Inspection Timeouts:* Automated 48-hour auto-refund release prevents merchant holding refunds hostage.
7. *OD-07 & OD-08 Dependencies:* Settlement reserve hold duration must match or exceed customer return window.

##### G. Unresolved Owner Decisions Under Option D.1
1. Calculation methodology (universal flat vs. category-level actuarial vs. seller risk-tiered).
2. Whether merchant-fault gateway fee (~2% + GST) is debited to merchant or permanently absorbed by platform.
3. Courier damage loss absorption when carrier denies insurance claim.
4. COD RTO funding (platform markup reserve vs. customer COD fee).
5. Default pricing-bound conflict resolution policy (Rejection vs. Compression vs. Renegotiation vs. Co-Pay).
6. MVP launch strategy (single blended reserve vs. multi-category tables).
7. Confirmation that customer-remorse reverse shipping will never be deducted from customer refunds.

#### 9. Advantages & Disadvantages of Alternatives
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Simple to administer; transparent; standard marketplace norm. | ATEEVRA absorbs all gateway and reverse logistics losses. |
| **Option B** | Extreme seller attraction. | High financial drain; extreme moral hazard (sellers collude on returns). |
| **Option C** | High equity; protects platform from seller quality failures. | High administrative overhead; requires evidence arbitration on returns. |
| **Option D (Base Advisory)** | Balanced risk; protects platform from seller fault; avoids merchant friction on remorse. | Requires clear return reason categorization in UI. |
| **Option D.1 (OWNER PROPOSED)** | **Zero customer return friction (100% free returns); high conversion; actuarially funded via markup.** | **Pricing engine complexity; requires active category cohort re-calibration.** |

#### 10. Operational & Support Implications & Settlement Reserve / Payout Hold Risk Assessment
- **Provisional Status & Risk Reality:** A settlement holding period (OD-07) significantly reduces exposure by retaining payables during the customer return eligibility window (OD-08).
  - *Provisional Terminology:* The hold is a provisional operational mechanism, NOT a legally recognized escrow arrangement; OD-07 remains an open pending decision.
  - *Residual Exposure:* A settlement reserve **CANNOT completely eliminate negative balance risk** due to:
    1. Courier transit and pickup turnaround delays past the return window.
    2. Merchant inspection backlogs.
    3. Post-settlement customer refunds (latent defects, warranty claims, executive goodwill overrides).
    4. Payment gateway chargebacks: Card network (Visa, Mastercard, RuPay) and gateway dispute timeframes and rules are payment-method and gateway-agreement dependent, requiring formal verification with Razorpay; there is NO universal 120-day guarantee across payment instruments.
    5. Merchant delisting, insolvency, or abandonment where negative balances cannot be offset against future sales.
- **Dispute Workflow:** Evidence protocols (unboxing video/photos) must be established before debiting sellers.

#### 11. Dependencies on Other Master Owner Decisions (Provisional Boundaries)
- **OD-01 (Pricing Model):** Realization reversal operates on $P_{\text{realization}}$ rather than a percentage commission clawback. Crucially, gross markup ($P_{\text{sell}} - P_{\text{realization}}$) must accommodate the Return-Cost Pricing Reserve.
- **OD-03 (Coupons — Provisional):** Customer refunds on discounted carts are capped at net cash paid; promotional discounts are not refunded in cash.
- **OD-04 (Shipping Allocation — Provisional):** Governs whether customer is refunded outbound shipping fees.
- **OD-05 (Tax Withholding — Provisional):** Requires credit notes for GST and GSTR-8 Section 52 TCS reversal filings.
- **OD-07 (Payout Rails & Settlement — Provisional):** Payouts coordinated with provisional merchant payout hold / settlement reserve duration. Does not establish a formal legal escrow.
- **OD-08 (Return Window Duration — Provisional):** Directly drives the required minimum payout hold duration under OD-07.

#### 12. Risks & Unresolved Questions
- **Unrecoverable Gateway Fees:** In India, Razorpay permanently retains the ~2% + GST fee on refunds (~0.35% GMV platform loss).
- **Negative Balance Recovery:** In the event of post-settlement refunds, recovery is limited to future sales offsets; no automated direct bank debit exists.
- **COD Refund Operations:** COD returns require manual UPI/bank account collection, introducing account typo and payout failure risks.
- **Reserve Depletion Under Volatility:** In seasonal return spikes, actual cash outflows may exceed accumulated pricing reserves.

#### 13. Advisory Recommendation & Exact Approval Questions
- **Base Advisory Recommendation:** **Option D (Hybrid Granular Liability Model: ADVISORY RECOMMENDATION — NOT APPROVED)**.
- **Owner Proposed Policy:** **Option D.1 (Customer-Friendly Zero-Return-Fee Model with Dynamic Pricing Reserve: OWNER PROPOSED — NOT APPROVED)**.
- **Decision Status:** `OWNER PROPOSAL — PENDING FINAL APPROVAL AND LEGAL/ACCOUNTING REVIEW`.
- **Exact Approval Questions Requiring Formal Sign-Off:**
  > ### Question 1: Commercial Policy Adoption
  > *"Does the platform owner approve **Option D.1 (Customer-Friendly Zero-Return-Fee Model with Dynamic Pricing Reserve)** for Phase M2-14, whereby on customer returns: (1) eligible customers are never charged return shipping fees or penalized with refund deductions, (2) merchants are debited reverse shipping only on verified merchant-fault returns, (3) ATEEVRA absorbs remorse reverse shipping and non-refundable gateway fees, and (4) these platform costs are funded via an actuarial Return-Cost Pricing Reserve integrated within product gross markup ($P_{\text{sell}} - P_{\text{realization}}$)?"*
  
  > ### Question 2: Pricing-Bound Conflict Resolution
  > *"In cases where $(P_{\max} - P_{\text{realization}})$ cannot accommodate the category return reserve and target net margin, which default policy shall the pricing engine enforce: (Policy 1) Catalog Guard Rejection, (Policy 2) Platform Margin Compression, (Policy 3) Realization Renegotiation, or (Policy 4) Merchant Return Co-Pay?"*
  
  > ### Question 3: Statutory & Accounting Verification
  > *"Subject to formal written opinion from: (1) qualified Indian legal counsel confirming compliance with Rule 5(3)(b) of the Consumer Protection (E-Commerce) Rules, 2020, and (2) qualified Indian Chartered Accountant confirming GST tax invoicing and reserve accounting treatment under applicable standards?"*

---

### OD-03: Coupon Allocation and Splitting

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"discounts, partial refunds..."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L31`: *"Distinguish order total, seller gross sales, platform commission, refunds, adjustments..."*
- [`M2-14-EXECUTION-PLAN.md#Section 2`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#2-four-dimension-financial-policy-boundaries): Order coupons remain strictly platform order-level attributes.

#### 2. Current Implementation & Architecture Implications
- Medusa stores `order.discount_total` at root order level from cart promo codes.
- In mixed-merchant orders, cart discounts are **not allocated across merchant line items**.
- Current architecture treats coupons strictly as platform order-level attributes; zero pro-rata deductions occur from merchant gross sales.

#### 3. Available Business-Policy Options
- **Option A (Platform-Subsidized Universal Coupons):** ATEEVRA funds 100% of order-level promo codes as marketing expense. Merchants receive full gross line price minus commission.
- **Option B (Pro-Rata Merchant-Funded Coupons):** Cart discount is apportioned proportionally across all line items based on item value. Merchants receive discounted net amount.
- **Option C (Seller-Funded Promotions Only):** Platform-wide cart coupons are disabled. Discounts apply strictly to individual merchant products funded by that merchant.
- **Option D (Hybrid Co-Funded Model):** Platform universal coupons (e.g. `WELCOME10`) funded by platform; merchant deals (e.g. `DIWALI20`) funded by merchant.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Highest merchant satisfaction; clean seller accounting; zero seller friction. | High cash burn / marketing liability for ATEEVRA. |
| **Option B** | Standard e-commerce model; shares marketing cost across sellers. | Merchants resist unapproved margin cuts; complex partial return calculations. |
| **Option C** | Eliminates platform discount expense; clean financial isolation. | Hinders high-conversion platform-wide marketing campaigns. |
| **Option D** | Optimal commercial flexibility. | Requires coupon entity schema extensions (`funded_by`). |

#### 5. Financial Impact
- **Partial Return Scenario:** Customer buys Item A (₹1,000, Seller 1) and Item B (₹1,000, Seller 2) with ₹400 coupon (Total paid = ₹1,600). Customer returns Item A.
  - *Under Option A:* Customer refunded ₹800 (or ₹1,000)? If customer gets ₹1,000, customer kept Item B for ₹600 (exploiting coupon). If customer gets ₹800, platform retained coupon value.
  - *Under Option B:* Customer refunded ₹800. Seller 1 debited ₹800.

#### 6. Operational & Support Implications
- Customer disputes if refunded amount on a partial return is less than the item's tag price due to pro-rata coupon deduction.

#### 7. Required System Changes
- **Database:** Add `funded_by ('platform' | 'merchant')` to promotion table; add `allocated_discount` to `order_line_item`.
- **Backend:** Cart calculation pipeline allocating discounts pro-rata across line items for tax and refund calculations.

#### 8. Dependencies on Other Decisions
- Coupled to **OD-01** (whether commission is charged on pre-discount or post-discount price).
- Coupled to **OD-02** (refund calculation on partial returns).

#### 9. Risks & Failure Scenarios
- Threshold gaming: Customer orders ₹2,000 to trigger ₹500 discount, then immediately returns ₹1,500 worth of goods.

#### 10. Recommended Option (Advisory Only)
- **Option A for MVP-2:** Platform funds universal coupons as a marketing expense. On partial returns, customer refund is calculated as `line_subtotal - pro_rata_discount` to prevent coupon threshold exploitation, while merchant is debited strictly the net amount received.

#### 11. Exact Question Requiring Owner Approval
> *"Who finances order-level promotional coupons in mixed-merchant orders (Platform vs. Merchants pro-rata), and on partial returns, is the customer refunded the full item price or the net discounted price?"*

---

### OD-04: Shipping Revenue Allocation

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"tax/shipping allocation, partial refunds..."*
- [`M2-14-EXECUTION-PLAN.md#Section 2`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#2-four-dimension-financial-policy-boundaries): Shipping total remains at platform order level; zero shipping revenue credited to merchant line items.

#### 2. Current Implementation & Architecture Implications
- Medusa records `order.shipping_total` at root order level from selected shipping method.
- In mixed-merchant orders, fulfillment is decentralized (each merchant ships their own package via their designated courier).
- Merchant order route excludes `shipping_total`; zero shipping revenue is credited to merchants.

#### 3. Available Business-Policy Options
- **Option A (Platform Retains Shipping & Manages 3PL Logistics):** Customer pays flat shipping (or free shipping over ₹999). ATEEVRA centrally contracts with 3PL logistics (Shiprocket/Delhivery), provides prepaid shipping labels, and retains customer shipping fees.
- **Option B (Shipping Split Pro-Rata Across Merchants):** Customer shipping fee divided among fulfilling merchants based on item count or weight. Merchants arrange their own couriers.
- **Option C (Multi-Vendor Individual Shipping Fees at Checkout):** Customer charged separate shipping per merchant (e.g. ₹50 for Seller 1 + ₹50 for Seller 2 = ₹100). Each merchant receives their designated fee.
- **Option D (Free Shipping Marketplace / Seller-Absorbed):** Shipping is free to customers platform-wide; merchants absorb their own shipping costs into product listing prices.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Consistent customer experience; uniform tracking; platform controls delivery quality. | Platform absorbs shipping cost deficits on multi-origin orders. |
| **Option B** | Easy to compute. | Unfair if Seller 1 ships 5kg from Assam and Seller 2 ships 200g locally. |
| **Option C** | Accurately reflects logistics costs. | High cart abandonment due to stacked shipping fees. |
| **Option D** | Highest conversion rates; standard modern D2C marketplace model. | Requires merchants to factor shipping into product pricing. |

#### 5. Financial Impact
- **Multi-Origin Deficit:** If a customer pays ₹100 flat shipping on an order containing items from 3 different merchants in different cities, ATEEVRA pays the 3PL courier ~₹70 $\times 3 =$ ₹210, incurring a net logistics loss of ₹110 on that order under Option A.
- **Return Shipping:** Is the original shipping fee refunded when a customer returns an order? (Standard industry policy: Non-refundable).

#### 6. Operational & Support Implications
- Integration with unified 3PL aggregation APIs (Shiprocket/Delhivery/NimbusPost) for automated label generation.

#### 7. Required System Changes
- **Backend:** Logistics fee calculation engine; courier label generation service.
- **Storefront:** Checkout shipping summary reflecting single or multi-vendor shipping breakdown.

#### 8. Dependencies on Other Decisions
- Coupled to **OD-02** (Return shipping cost allocation).
- Affects **OD-07** (Logistics fee deduction from seller payout).

#### 9. Risks & Failure Scenarios
- High logistics burn on low-ticket multi-vendor orders wiping out platform gross margins.

#### 10. Recommended Option (Advisory Only)
- **Option A for MVP-2:** Platform centrally manages 3PL logistics, offers flat shipping (₹99 or Free over ₹999), and retains customer shipping revenue. Original customer shipping fee is non-refundable on returns.

#### 11. Exact Question Requiring Owner Approval
> *"How shall shipping revenue and logistics costs be structured in mixed-merchant orders: Does ATEEVRA retain shipping revenue and centrally manage 3PL logistics labels, and is customer shipping fee refundable on partial returns?"*

---

### OD-05: Statutory Tax Withholding (TCS/TDS)
*(Requires Qualified Indian Chartered Accountant Review)*

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"Define financial source of truth... net payable and settlement lifecycle before earnings/payout."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L31`: *"Define source of truth, currency/rounding... tax/shipping allocation... net payable and settlement lifecycle."*
- [`M2-14-EXECUTION-PLAN.md#Section 2`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#2-four-dimension-financial-policy-boundaries): Zero statutory tax withholdings calculated or deducted in database.

#### 2. Current Implementation & Architecture Implications
- Line-item GST is calculated at checkout based on product tax code (e.g. 5%, 12%, 18%).
- There are **zero statutory deduction fields** (TCS/TDS) in the PostgreSQL schema.
- System currently derives strictly gross transaction values.

#### 3. Available Business-Policy Options
- **Option A (External Accounting / CA Batch Settlement):** System software tracks gross sales and displays gross figures. Statutory 1% GST TCS and 1% IT TDS are calculated externally by the finance team/CA during offline payout batch runs (MVP-2 baseline).
- **Option B (Automated Software GST TCS Withholding):** Platform database automatically deducts 1% Section 52 GST TCS (0.5% CGST + 0.5% SGST, or 1% IGST) from net payable upon order completion.
- **Option C (Automated Software Income Tax TDS Withholding):** Platform database automatically deducts 1% Section 194-O TDS on gross sales value.
- **Option D (Full Dual Software Tax Withholding Engine):** Automated software deduction of both 1% GST TCS and 1% Section 194-O TDS with automated GSTR-8 / Form 26Q export tables.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Eliminates software tax compliance defects; simplifies MVP-2 database; legally compliant if CA handles deductions prior to bank transfers. | Manual spreadsheet/ERP reconciliation for finance team. |
| **Option B/C/D** | Real-time tax tracking in marketplace database; automated reporting. | High software complexity; risk of incorrect tax calculation; PAN/GSTIN verification overhead. |

#### 5. Financial Impact
- **ATEEVRA:** Electronic Commerce Operators (ECO) under Indian GST law are legally mandated to collect 1% TCS on net taxable supplies. Under Section 194-O, ECOs must deduct 1% TDS on gross sales. Withheld funds must be deposited with the Indian Government by the 10th (TCS) and 7th (TDS) of the following month.
- **Merchants:** 2% total cash flow withholding, claimable as tax credits via GSTR-2B and Form 26AS.

#### 6. Operational & Support Implications
- Platform CA must file monthly GSTR-8 returns with GSTN and quarterly Form 26Q returns with the Income Tax Department.
- Merchants require automated downloadable monthly TCS/TDS certificates.

#### 7. Required System Changes
- **Database:** `merchant_tax_profile` (PAN, GSTIN, legal entity type); `statutory_withholding_ledger` table.
- **Backend:** Tax deduction calculation rules based on seller state vs customer delivery state (intra-state CGST+SGST vs inter-state IGST).

#### 8. Dependencies on Other Decisions
- Directly coupled to **OD-07** (Net payout calculation).

#### 9. Risks & Failure Scenarios
- Calculating TCS on gross value including GST instead of net taxable value excluding GST.
- Applying wrong tax component (CGST+SGST vs IGST) leading to GSTR-8 portal rejection.

#### 10. Recommended Option (Advisory Only)
- **Option A for MVP-2:** Software records gross sales and displays gross line items; formal statutory withholdings are calculated externally by ATEEVRA's Chartered Accountant prior to offline batch payouts. Automated withholding engine is deferred to MVP-3 alongside automated banking rails.

#### 11. Exact Questions Requiring Qualified Tax/CA Review
> [!CAUTION]
> **MANDATORY CHARTERED ACCOUNTANT REVIEW QUESTIONS:**
> 1. *"Is ATEEVRA registered as an Electronic Commerce Operator (ECO) under Section 52 of the CGST Act and Section 194-O of the Income Tax Act, 1961?"*
> 2. *"Shall statutory 1% GST TCS and 1% Section 194-O TDS be deducted programmatically in the marketplace software for MVP-2, or will the platform finance team compute and deduct statutory withholdings externally in Tally/ERP prior to offline bank disbursements?"*
> 3. *"Does the platform qualify for Section 194-O individual seller ₹5,00,000 annual gross threshold exemptions during MVP-2?"*

---

### OD-06: Exchange Scope & Price Differences

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"exchange differences, adjustments... return and exchange workflows..."*
- [`M2-14-EXECUTION-PLAN.md#Section 2 & 6`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#6-p0-4-complete-exchange-lifecycle--policy-boundaries): Restricts exchanges strictly to equal-value variants; price-difference exchanges disabled.

#### 2. Current Implementation & Architecture Implications
- Catalog product variants may have different prices (e.g. Size XXL priced higher than Size M, or premium color finishes).
- Medusa `createReservationsWorkflow` reserves replacement inventory.
- Current technical architecture allows **strictly equal-value exchanges** (`replacement_variant.price == original_variant.price`), maintaining complete financial neutrality (`financial_status = 'none'`).

#### 3. Available Business-Policy Options
- **Option A (Strictly Equal-Value Exchanges Only):** Customers may only exchange for a variant of identical price (e.g. Size swap S to M). Price-difference exchanges are blocked in UI; customer must execute a return-for-refund and place a new order.
- **Option B (Automated Price-Delta Surcharge / Downward Refund Engine):** Customer pays price difference via Razorpay payment link before exchange fulfillment; downward price differences are refunded to original payment method.
- **Option C (Surcharge Collection + Store Credit Downward):** Upward price differences collected via payment link; downward differences credited as non-refundable store credit.
- **Option D (No Exchanges; Return & Rebuy Only):** Disable the exchange workflow entirely; all product replacements handled via standard return, refund, and new purchase.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Zero financial mutations; zero Razorpay payment links; 100% financially clean and reliable for MVP-2. | Customer cannot swap to a higher-priced variant directly. |
| **Option B** | Best customer experience; maximizes upsell potential. | High software complexity (payment links, link timeouts, downward partial refunds, tax adjustments). |
| **Option C** | Protects platform cash flow. | Requires store credit / wallet infrastructure. |
| **Option D** | Simplest possible codebase. | Higher customer return friction; lost sales. |

#### 5. Financial Impact
- **ATEEVRA:** Neutral under Option A. Micro-transaction payment gateway fees on small delta payments under B.
- **Merchants:** Equal inventory value swap under A; upsell revenue under B.
- **Customers:** Frictionless size swaps under A.

#### 6. Operational & Support Implications
- Payment link abandonment: Under Option B, if a customer requests an exchange for a higher-priced item but fails to pay the surcharge link within 24 hours, stock reservation must be automatically canceled.

#### 7. Required System Changes
- **If Option A:** Enforce `original_price == replacement_price` validation guard in exchange route.
- **If Option B:** Implement `ExchangePaymentService`, Razorpay Payment Link API integration, webhook handler for link payment, downward refund pipeline.

#### 8. Dependencies on Other Decisions
- Coupled to **OD-08** (Return window).
- Coupled to **OD-09** (Reservation hold duration).

#### 9. Risks & Failure Scenarios
- Customer payment for price difference succeeds, but replacement item goes out of stock before payment webhook arrives.

#### 10. Recommended Option (Advisory Only)
- **Option A for MVP-2:** Permit strictly equal-value variant exchanges (e.g. size/color swaps at identical price). Price-difference exchanges are blocked, and customer is directed to use standard return-and-rebuy. Automated price-delta billing deferred to MVP-3.

#### 11. Exact Question Requiring Owner Approval
> *"Shall ATEEVRA restrict exchanges strictly to equal-value variants (same price, e.g. size swap) for MVP-2, requiring return-and-rebuy for price differences, or should an automated price-delta billing engine (Razorpay payment link surcharge / downward refund) be built?"*

---

### OD-07: Merchant Settlement & Payout Rails

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"If payout rules/integration are undefined, show truthful transaction state only; never fake payouts."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L15`: *"No hardcoded production merchants, warehouses, roles, prices, commission, status or payout dates."*
- `MVP2_Marketplace_Phases/MVP2-AGENT-RULES.md#L36`: *"MVP-3 deferred: Automated split payouts/escrow banking integrations..."*
- [`M2-14-EXECUTION-PLAN.md#Section 2 & 10`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13): COD and merchant payouts recorded strictly as `unsettled`.

#### 2. Current Implementation & Architecture Implications
- Zero merchant bank accounts, IFSC codes, or beneficiary IDs exist in the PostgreSQL database.
- Razorpay Route (split payments) is not integrated.
- Architecture displays truthful gross transaction data with status strictly reported as `unsettled`. Zero fake payouts or simulated dates exist.

#### 3. Available Business-Policy Options
- **Option A (Manual Corporate Banking NEFT/RTGS Batch Payouts — MVP-3 Deferred):** Automated banking rails deferred to MVP-3 in accordance with Master Plan. Platform database records verified transaction events as `unsettled`. Finance team generates monthly/weekly CSV settlement sheets and executes batch bank payouts via corporate net banking.
- **Option B (Razorpay Route Automated Split Payments):** Integrate Razorpay Route API. Split customer funds automatically at capture or settlement into merchant linked accounts.
- **Option C (RazorpayX Automated Payouts Engine):** Integrate RazorpayX Current Account API. Scheduled automated payouts via IMPS/NEFT based on rolling escrow rules.
- **Option D (Merchant On-Demand Withdrawal Request):** Merchants request payout when unsettled balance exceeds threshold (e.g. ₹5,000), subject to admin review.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | 100% compliant with Master Plan MVP-3 deferral; zero banking API integration risks; complete cash flow control. | Manual banking execution overhead for platform operations team. |
| **Option B** | Fully automated; zero manual bank execution. | Requires complex linked-account seller onboarding; split-refund complexities on mixed orders. |
| **Option C** | Clean automated escrow releases. | Requires dedicated RazorpayX account, webhook listeners, high API setup cost. |
| **Option D** | Seller-driven flexibility. | Operational burden reviewing individual withdrawal requests. |

#### 5. Financial Impact
- **Escrow Holding Window:** Payouts must be held until the customer return window (OD-08) has expired (e.g. Delivery Date + 7 Days). Settling a merchant earlier leaves ATEEVRA holding 100% liability if the customer returns the item.

#### 6. Operational & Support Implications
- Merchant payout schedule policy: Weekly (e.g. every Monday) or Bi-monthly (1st and 16th of every month) for eligible orders where return window has passed.

#### 7. Required System Changes
- **If Option A:** Create `MerchantSettlementReportService` exporting CSV/Excel ledger reports with Order ID, Delivery Date, Gross Sales, Return Window Expiry, and Bank Details.
- **If Option B/C:** Encrypted bank details storage, Razorpay Route/X integration, webhook handlers.

#### 8. Dependencies on Other Decisions
- Dependent on **OD-01** (Commission deduction).
- Dependent on **OD-02** (Refund clawback).
- Dependent on **OD-05** (TCS/TDS withholding).
- Dependent on **OD-08** (Escrow hold duration).

#### 9. Risks & Failure Scenarios
- Paying out a merchant on T+2, followed by customer return on T+5, resulting in an uncollectible negative balance if seller stops selling.

#### 10. Recommended Option (Advisory Only)
- **Option A:** Maintain automated banking rails strictly deferred to MVP-3. For MVP-2, software records truthful `unsettled` transaction status and provides Super Admin settlement export reports. Formal payout policy: Orders become eligible for offline bank payout **7 days post-delivery** (after return window expires).

#### 11. Exact Question Requiring Owner Approval
> *"Confirm that automated banking payout rails remain deferred to MVP-3 (with MVP-2 reporting truthful unsettled ledger records for finance team batch bank transfers), and define the approved settlement escrow schedule (e.g., T+7 days post-delivery)?"*

---

### OD-08: Return Window Duration

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"return and exchange workflows..."*
- [`M2-14-EXECUTION-PLAN.md#Section 10`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#10-master-owner-decisions-register-od-01-to-od-13): Hardcoded 7-day constant removed; requires configurable setting.

#### 2. Current Implementation & Architecture Implications
- Legacy storefront code contained an unapproved hardcoded constant `RETURN_WINDOW_DAYS = 7`.
- The architecture plan removed hardcoded values, requiring a configurable platform-level setting.

#### 3. Available Business-Policy Options
- **Option A (Strict 7 Calendar Days from Delivery):** Customer may request a return or exchange within 7 days of verified carrier delivery.
- **Option B (14 Calendar Days from Delivery):** Customer may request return within 14 days of delivery.
- **Option C (Category-Specific Windows):** e.g., 7 days for Electronics/Footwear, 15 days for Apparel, Non-returnable for Personal Care/Lingerie.
- **Option D (Replacement/Exchange Only Policy):** Returns for cash refund disabled (except for damaged/defective goods); 7-day window for size/variant exchanges only.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Industry standard for D2C fashion; limits reverse logistics costs and inventory lockup. | Shorter evaluation time for customers. |
| **Option B** | High buyer trust; matches Amazon/Myntra standard. | Increases return volume; delays merchant payouts by 14 days. |
| **Option C** | Maximum commercial hygiene protection. | Complex configuration; customer confusion across categories. |
| **Option D** | Maximum merchant cash flow protection. | Significant barrier to conversion for new customers. |

#### 5. Financial Impact
- Return rate in Indian fashion e-commerce averages 25-35%. Every return incurs two-way logistics costs (~₹120-₹180). Longer windows correlate with 3-5% higher return volumes.

#### 6. Operational & Support Implications
- Carrier scan dependency: Window MUST be calculated from carrier `DELIVERED` webhook timestamp, never order creation date.

#### 7. Required System Changes
- **Database:** `platform_settings.return_window_days INT DEFAULT 7`.
- **Storefront:** Order details page displays return eligibility countdown badge.
- **Backend:** API validator checking `NOW() <= delivery_date + INTERVAL 'X days'`.

#### 8. Dependencies on Other Decisions
- Directly determines **OD-07** (Escrow hold duration before merchant payout).
- Determines **OD-09** (Exchange reservation timing).

#### 9. Risks & Failure Scenarios
- Carrier webhook delayed or missed, causing legitimate customer return requests to be blocked as "expired".

#### 10. Recommended Option (Advisory Only)
- **Option A:** Strict **7 calendar days from carrier-verified delivery timestamp**, configured as a platform-level setting in `platform_settings`.

#### 11. Exact Question Requiring Owner Approval
> *"What is ATEEVRA's official customer return and exchange window duration (e.g. 7 calendar days vs. 14 calendar days from carrier delivery date), and should it be uniform platform-wide or category-specific?"*

---

### OD-09: Exchange Reservation Timing & Expiration Schedule

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"return and exchange workflows... idempotency, atomic transitions..."*
- [`M2-14-EXECUTION-PLAN.md#Section 5 & 10`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#5-p0-3-ownership-safe-orphan-reservation-recovery): Proves inventory reservation under PostgreSQL advisory lock.

#### 2. Current Implementation & Architecture Implications
- When an exchange is requested, `createReservationsWorkflow` reserves replacement inventory.
- If a customer requests an exchange but never hands over the original item to the reverse courier, how long does the merchant's replacement stock remain locked?
- Currently, no automated expiration job exists; stock would remain reserved indefinitely without an approved expiration schedule.

#### 3. Available Business-Policy Options
- **Option A (Immediate Reservation with 7-Day Auto-Expiry):** Stock reserved immediately upon customer request. If courier registers no physical reverse pickup scan within 7 calendar days, reservation is automatically deleted via `deleteReservationsWorkflow` and exchange claim is marked `released`.
- **Option B (Immediate Reservation with 3-Day Auto-Expiry):** Strict 3-day hold to minimize merchant inventory lockup.
- **Option C (Delayed Reservation on Pickup Scan):** Replacement inventory is NOT reserved when customer requests exchange; stock is reserved only when the 3PL courier scans the reverse pickup at customer's doorstep.
- **Option D (Manual Expiration Only):** Reservations never auto-expire; requires merchant or Super Admin manual release.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Balances customer courier handover window with merchant inventory protection. | Stock locked for 7 days if customer is non-serious. |
| **Option B** | Rapid inventory return to available stock. | Customer pickup delays (courier missed attempt) trigger premature cancellation. |
| **Option C** | Zero inventory lockup for unfulfilled return requests. | High risk replacement SKU sells out while original item is in transit. |
| **Option D** | Eliminates automated cancellation edge cases. | Merchant stock remains locked indefinitely if neglected. |

#### 5. Financial Impact
- Prevents merchant stock from being frozen off the marketplace during peak sales seasons.

#### 6. Operational & Support Implications
- Reverse pickup attempts: 3PL courier typically attempts reverse pickup 3 times over 3-5 days. Auto-expiry must account for courier retry windows.

#### 7. Required System Changes
- **Backend:** Background cron worker querying `order_line_item_claim` where `physical_status = 'requested'` and `created_at < NOW() - INTERVAL '7 days'`. Executes ownership-safe cleanup protocol under lock.

#### 8. Dependencies on Other Decisions
- Dependent on **OD-08** (Return window duration).
- Coupled to **OD-11** (Non-returned original items).

#### 9. Risks & Failure Scenarios
- Releasing a reservation while the customer has already handed the package to the courier but the courier scan has not synced.

#### 10. Recommended Option (Advisory Only)
- **Option A:** Immediate reservation upon customer exchange request, held for **7 calendar days**. If no reverse-pickup scan (`PICKED_UP`) is registered by the 3PL courier within 7 days, the reservation is safely released under lock and the claim marked `released`.

#### 11. Exact Question Requiring Owner Approval
> *"How long should replacement variant inventory be reserved during an exchange (e.g. 7 calendar days), and under what exact carrier event condition should the reservation be automatically released and canceled?"*

---

### OD-10: Exchange Cancellation Rights

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"return and exchange workflows..."*
- [`M2-14-EXECUTION-PLAN.md#Section 6 & 10`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#6-p0-4-complete-exchange-lifecycle--policy-boundaries): Separates unapproved cancellation rights from core technical invariants.

#### 2. Current Implementation & Architecture Implications
- Order cancellation exists for unfulfilled orders (`apps/backend/src/api/store/orders/[id]/cancel/route.ts`).
- There are **zero exchange cancellation endpoints** in storefront or backend.
- Before warehouse receipt, canceling an exchange safely deletes the reservation and releases the claim. After warehouse receipt, physical goods are in merchant possession.

#### 3. Available Business-Policy Options
- **Option A (Cancellation Permitted Until Carrier Pickup Scan):** Customer may cancel online self-service anytime prior to handing package to courier. Once carrier scans `PICKED_UP`, cancellation is disabled. Merchant cannot cancel an approved exchange unless returned item fails inspection.
- **Option B (Cancellation Permitted Until Warehouse Receipt):** Customer can cancel even while package is in transit (courier redirected to return item to customer).
- **Option C (Mutual Cancellation Permitted Pre-Dispatch):** Customer and merchant can both cancel anytime prior to replacement shipment dispatch.
- **Option D (No Customer Self-Service Cancellation):** Once an exchange is submitted, customer cannot cancel self-service; must contact customer support.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Clean operational cut-off; aligns with 3PL logistics capabilities; zero rerouting costs. | Customer cannot cancel if they change mind after courier handover. |
| **Option B** | High customer flexibility. | Extremely complex and costly in-transit courier rerouting. |
| **Option C** | Maximum flexibility before final fulfillment. | Causes disputes if original item is already inspected at merchant warehouse. |
| **Option D** | Eliminates edge cases. | Increases customer support ticket volume. |

#### 5. Financial Impact
- In-transit courier rerouting (Option B) doubles shipping costs (~₹150 additional reverse charge).

#### 6. Operational & Support Implications
- Storefront UI displays "Cancel Exchange" button strictly when carrier status is `PENDING_PICKUP`.

#### 7. Required System Changes
- **Storefront:** `POST /api/account/orders/[id]/exchanges/cancel` endpoint.
- **Backend:** `ExchangeService.cancelExchange(claimId)` verifying `physical_status == 'requested'`.

#### 8. Dependencies on Other Decisions
- Coupled to **OD-09** (Reservation timing).
- Coupled to **OD-13** (Refund conversion).

#### 9. Risks & Failure Scenarios
- Race condition: Customer clicks cancel at 10:00 AM; courier scans pickup at 10:01 AM.

#### 10. Recommended Option (Advisory Only)
- **Option A:** Customer retains self-service cancellation rights **until the courier performs the physical pickup scan**. Once scanned, self-service cancellation is disabled. If merchant rejects the return upon physical inspection, the claim transitions to `inspection_failed` and customer support arbitrates.

#### 11. Exact Question Requiring Owner Approval
> *"At what operational milestone does a customer lose self-service cancellation rights for an exchange (e.g. at courier reverse-pickup scan vs. warehouse receipt), and can merchants reject an exchange after receipt if the returned item fails inspection?"*

---

### OD-11: Non-Returned Original Item Handling

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"return and exchange workflows..."*
- [`M2-14-EXECUTION-PLAN.md#Section 6 & 10`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#6-p0-4-complete-exchange-lifecycle--policy-boundaries): Separates fulfillment models from technical invariants.

#### 2. Current Implementation & Architecture Implications
- Technical baseline enforces that equal-value exchanges carry zero monetary settlement.
- Replacement variant is reserved in inventory.
- Currently, replacement fulfillment is blocked until merchant confirms physical receipt (`physical_status = 'received'`).

#### 3. Available Business-Policy Options
- **Option A (Receive & Inspect First — Safe Fulfillment):** Merchant dispatches replacement item ONLY after the original item is received at warehouse and passes inspection. If customer never returns item, reservation auto-expires (OD-09) and transaction closes. Zero risk to merchant.
- **Option B (Dispatch Upon Carrier Pickup Scan — Fast Fulfillment):** Merchant dispatches replacement item immediately when 3PL courier registers reverse pickup scan. If customer returned an empty box or counterfeit item, merchant files a Seller Protection Claim with ATEEVRA.
- **Option C (Doorstep Reverse-QC Courier Swap):** Single-step swap by courier at customer doorstep (3PL driver only hands over replacement box if customer hands over old item with tags intact).
- **Option D (Immediate Dispatch with Card Pre-Authorization):** Replacement shipped immediately; customer's credit card pre-authorized for the item value; captured if old item not received in 14 days.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | 100% fraud-proof; merchant never loses replacement stock. | Slowest turnaround for customer (7-12 days total cycle). |
| **Option B** | Fast turnaround (3-5 days); customer delight. | High merchant fraud risk (bricks in box, tag swapping). |
| **Option C** | Best of both worlds (immediate swap + verified return). | Requires specialized 3PL reverse-QC services; higher courier costs (~₹40 extra per shipment). |
| **Option D** | Standard US Amazon workflow. | **Legally/technically impossible in India** for standard domestic debit/credit cards without standing RBI e-mandates. |

#### 5. Financial Impact
- Fraud losses: High under Option B. Zero under Option A. Option C has modest incremental 3PL fee.

#### 6. Operational & Support Implications
- Reverse QC guidelines: Clear physical checklist for warehouse receiving teams (original tags, unwashed, unworn, original packaging).

#### 7. Required System Changes
- **Backend:** `POST /merchant/returns/:id/receive` route with inspection checklist input (`passed: boolean, reason?: string`). Unlocks replacement fulfillment workflow.

#### 8. Dependencies on Other Decisions
- Dependent on **OD-09** (Reservation hold duration).
- Dependent on **OD-12** (Fulfillment failure handling).

#### 9. Risks & Failure Scenarios
- Customer returns damaged item; merchant rejects; customer claims item was sent in perfect condition.

#### 10. Recommended Option (Advisory Only)
- **Option A (Receive & Inspect First) for MVP-2 Launch:** Merchant dispatches replacement item strictly after original item is received and verified at warehouse. If pickup fails after 3 courier attempts, request auto-cancels. Option C (Doorstep QC Swap) can be evaluated in MVP-3 with specialized 3PL partners.

#### 11. Exact Question Requiring Owner Approval
> *"Which exchange fulfillment model shall ATEEVRA mandate: (A) Receive & inspect original item at warehouse before dispatching replacement, (B) Dispatch replacement immediately upon courier pickup scan, or (C) Doorstep courier reverse-QC swap?"*

---

### OD-12: Repeated Replacement Fulfillment Failures

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"return and exchange workflows... idempotency, atomic transitions..."*
- [`M2-14-EXECUTION-PLAN.md#Section 6 & 10`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#6-p0-4-complete-exchange-lifecycle--policy-boundaries): Undelivered replacement item held in warehouse; zero automatic re-dispatches.

#### 2. Current Implementation & Architecture Implications
- Original item has been received and inspected at warehouse.
- Merchant dispatches replacement shipment B.
- Courier fails to deliver replacement B (customer unreachable, address incomplete, package damaged in transit) &rarr; Shipment returns to origin (RTO).
- Architecture currently holds the original item in warehouse and blocks automatic refund conversion pending explicit policy.

#### 3. Available Business-Policy Options
- **Option A (Single Re-Dispatch Attempt, Then Auto-Refund):** Merchant contacts customer to verify address and re-dispatches once. If second delivery attempt fails (RTO), exchange terminates and triggers automatic full monetary refund (OD-13).
- **Option B (Immediate Conversion to Monetary Refund on First RTO):** If replacement shipment returns as RTO, do not re-dispatch. Exchange immediately terminates and triggers full monetary refund to customer.
- **Option C (Immediate Store Credit Conversion on First RTO):** Full value credited as non-expiring Store Credit.
- **Option D (Manual Admin Resolution):** Transaction flagged `fulfillment_failed`; Super Admin arbitrates.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Customer-centric; gives benefit of doubt for courier error. | Incurs two additional shipping legs (re-ship + potential 2nd RTO). |
| **Option B** | Prevents dead logistics burn; standard e-commerce practice for RTO. | Customer who still wanted the item must re-order. |
| **Option C** | Retains platform GMV. | Customer dissatisfaction if they expected cash back. |
| **Option D** | Case-by-case precision. | Operational bottleneck; delayed resolution. |

#### 5. Financial Impact
- 3PL RTO charges: Carrier charges two-way shipping fee on RTO packages. Repeated re-dispatches multiply logistics losses. Under Option B, logistics loss is capped at one cycle.

#### 6. Operational & Support Implications
- Automated customer notification when replacement package becomes RTO.

#### 7. Required System Changes
- **Backend:** 3PL tracking webhook listener detecting `DELIVERY_FAILED` / `RTO_DELIVERED`. Updates exchange claim status to `fulfillment_failed`.

#### 8. Dependencies on Other Decisions
- Directly triggers **OD-13** (Failed exchange-to-refund conversion).
- Affects **OD-02** (Refund liability).

#### 9. Risks & Failure Scenarios
- Courier falsely marks package RTO without attempting delivery (fake door-knock).

#### 10. Recommended Option (Advisory Only)
- **Option B:** If a replacement shipment returns to the merchant as RTO (undelivered), the exchange immediately terminates and automatically converts to a full monetary refund (triggering OD-13). The merchant returns replacement stock to available inventory.

#### 11. Exact Question Requiring Owner Approval
> *"When a replacement exchange shipment fails delivery and is returned to origin (RTO), should the merchant re-attempt dispatch, or should the exchange immediately terminate and convert to a monetary refund?"*

---

### OD-13: Failed Exchange-to-Refund Conversion

#### 1. Specification References
- `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`: *"financial calculations traceable... return and exchange workflows..."*
- [`M2-14-EXECUTION-PLAN.md#Section 6 & 10`](file:///C:/Users/Shubham/.gemini/antigravity-cli/brain/440e959d-3242-4a30-9198-49c733b4a010/M2-14-EXECUTION-PLAN.md#6-p0-4-complete-exchange-lifecycle--policy-boundaries): Automatic conversion strictly blocked; requires operator authorization or approved conversion rule.

#### 2. Current Implementation & Architecture Implications
- Technical invariant: Equal-value exchanges are financially neutral (`financial_status = 'none'`).
- If an exchange cannot be fulfilled (e.g. merchant receives original item, but replacement variant is found to be damaged, defective, out of stock, or delivery fails as in OD-12):
- Current plan blocks automatic conversion to monetary refund because equal-value exchanges carry zero refund metadata and could trigger double-refunding if not coordinated.

#### 3. Available Business-Policy Options
- **Option A (Automated Monetary Refund Conversion):** If replacement variant cannot be fulfilled within 3 business days of return receipt, system automatically converts the exchange claim into a standard monetary refund (`financial_status = 'refund_pending'`) and executes outbound Razorpay refund protocol.
- **Option B (Instant Store Credit Issuance):** Full original item value issued as non-expiring Store Credit with promotional 5% bonus.
- **Option C (Manual Super Admin Review Only):** Exchange remains locked in `exchange_unfulfillable` state; Super Admin manually reviews and clicks "Authorize Cash Refund".
- **Option D (Customer Interactive Choice Flow):** Storefront notifies customer and offers self-service selection: (1) Select alternative variant, (2) Receive original payment refund, or (3) Receive Store Credit.

#### 4. Advantages & Disadvantages
| Option | Advantages | Disadvantages |
| :--- | :--- | :--- |
| **Option A** | Highest customer satisfaction; legally compliant with Indian Consumer Protection rules; fully automated. | Cash leaves platform; merchant loses sale. |
| **Option B** | Retains cash and GMV on platform. | Dissatisfied customers if they demand original payment back. |
| **Option C** | Zero accidental automated payouts. | Severe customer support backlog; angry customers waiting for money. |
| **Option D** | Maximum commercial engagement. | Requires complex interactive storefront UI and customer selection workflows. |

#### 5. Financial Impact
- **COD Orders:** If the original order was Cash on Delivery, an automated monetary refund cannot be pushed via Razorpay API. System must capture customer's verified UPI ID or Bank Account/IFSC details (strictly per REQ-5).

#### 6. Operational & Support Implications
- Traceable audit event: `exchange.converted_to_refund` recording original exchange operation ID, reason, actor, and new refund operation ID.

#### 7. Required System Changes
- **Backend:** `ExchangeService.convertToRefund(claimId, reason)`:
  - Releases replacement reservation via `deleteReservationsWorkflow`.
  - Sets `order_line_item_claim.financial_status = 'refund_pending'`.
  - Creates row in `payment_refund_operation` linked to original payment and line item.
  - Invokes backend `RefundService` outbound dispatch protocol.
- **Storefront:** Customer return status updates from "Exchange" to "Refund Processed".

#### 8. Dependencies on Other Decisions
- Triggered by **OD-12** (Fulfillment failure).
- Coupled to **OD-02** (Refund liability).
- Coupled to **OD-03** (Coupon clawback on converted refunds).

#### 9. Risks & Failure Scenarios
- Double refund: System converts exchange to refund while merchant simultaneously dispatches replacement SKU. (Prevented by requiring reservation release and status locks before refund dispatch).

#### 10. Recommended Option (Advisory Only)
- **Option A:** If replacement item cannot be fulfilled within **3 business days** of physical return receipt at warehouse, system automatically converts the claim into a full monetary refund. For prepaid orders, funds return via Razorpay API. For COD orders, customer is prompted for UPI/Bank details with status strictly `pending` per REQ-5.

#### 11. Exact Question Requiring Owner Approval
> *"When an approved exchange cannot be fulfilled by the merchant (e.g. replacement SKU out of stock or damaged), does the system automatically convert the claim into a full monetary refund (to original payment method for prepaid, UPI/Bank for COD), or does it require manual Super Admin review / Store Credit issuance?"*

---

### OD-14: Merchant Identity Privacy & Customer-Facing Branding Policy

**Decision Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`  
*(Governance Invariant: This records the Project Owner's explicit policy direction. It does NOT constitute final approval of the policy, does NOT authorize software implementation, and does NOT approve application code changes).*  
**Owner Business Direction:** Conceal merchant personal phone, personal email, and residential address; display only statutory commercial seller details; route customer care exclusively via ATEEVRA helpline; apply unified platform branding.  
**Dedicated Supporting Deliverables:**
- [`blueprint/M2-14-OD-14-MERCHANT-IDENTITY-PRIVACY-ANALYSIS.md`](blueprint/M2-14-OD-14-MERCHANT-IDENTITY-PRIVACY-ANALYSIS.md)
- [`blueprint/M2-14-OD-14-CUSTOMER-FACING-BRANDING-POLICY.md`](blueprint/M2-14-OD-14-CUSTOMER-FACING-BRANDING-POLICY.md)
- [`blueprint/M2-14-OD-14-LEGAL-DISCLOSURE-AND-COMPLIANCE-MATRIX.md`](blueprint/M2-14-OD-14-LEGAL-DISCLOSURE-AND-COMPLIANCE-MATRIX.md)
- [`blueprint/M2-14-OD-14-INFORMATION-ACCESS-AND-DISCLOSURE-MATRIX.md`](blueprint/M2-14-OD-14-INFORMATION-ACCESS-AND-DISCLOSURE-MATRIX.md)
- [`blueprint/M2-14-OD-14-IMPLEMENTATION-TRACEABILITY.md`](blueprint/M2-14-OD-14-IMPLEMENTATION-TRACEABILITY.md)
- [`blueprint/M2-14-OD-14-OWNER-DECISION-AND-ACCEPTANCE-REPORT.md`](blueprint/M2-14-OD-14-OWNER-DECISION-AND-ACCEPTANCE-REPORT.md)

#### 1. Core Policy Problem & Motivation
In an artisan, designer, and MSME marketplace, merchant proprietors frequently operate from residential studios and submit personal phone numbers during onboarding. If exposed across storefront PDPs, invoices, or thermal shipping labels, merchants face severe harassment, privacy violations, off-platform disintermediation, and physical safety risks.

#### 2. Project Owner Explicit Direction
- **Personal Mobile Numbers:** Strictly hidden across all customer touchpoints.
- **Personal Email Addresses:** Strictly hidden from storefront and notifications.
- **Residential Addresses:** Strictly protected; replaced with registered commercial city/state on storefront.
- **Statutory Disclosures:** Preserve merchant legal business name, registered business address, and GSTIN on tax invoices (CGST Act Section 31).
- **ATEEVRA Centralized Customer Support:** Primary customer-facing contact via `{{ATEEVRA_HELPLINE}}` and `{{ATEEVRA_SUPPORT_EMAIL}}`.
- **Unified Branding:** Standardized ATEEVRA packaging slips, order notifications, and customer journeys.
- **Internal Availability:** Operational data (warehouse hubs, dispatch contacts, bank details) accessible internally under strict RBAC.

#### 3. Statutory Compliance Reconciliation
- **Consumer Protection (E-Commerce) Rules, 2020:** Rule 5(2) customer care requirement is fulfilled via ATEEVRA central helpline acting as designated customer care agent under bilateral MSA. Rule 5(3)(b) dispute identity disclosures release registered commercial details without exposing personal mobile numbers.
- **CGST Act Section 31 & Rule 46:** Tax invoices truthfully identify the Merchant as Supplier of Record and ATEEVRA as Marketplace Facilitator. ATEEVRA does NOT replace the merchant on statutory invoices.
- **DPDP Act, 2023:** Proprietor personal data protected under Sections 6 and 8(5) via API field filtering, admin RBAC masking, and log redactors.

#### 4. Exact Question Requiring Owner Approval
> *"Shall ATEEVRA formally approve POL-OD-14-01 establishing centralized customer care, complete customer-facing masking of merchant personal phone numbers, personal emails, and residential addresses, and ATEEVRA-branded packaging, while preserving statutory merchant supplier details on tax invoices?"*

---

### OD-15: Cancellation, Return, RTO & Merchant Accountability Policy Framework

**Policy Reference:** `POL-M2-14-01` through `POL-M2-14-06`  
**Parent Blueprint:** [`blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Classification Matrix:** [`blueprint/M2-14-CANCELLATION-RETURN-RTO-CLASSIFICATION-MATRIX.md`](blueprint/M2-14-CANCELLATION-RETURN-RTO-CLASSIFICATION-MATRIX.md)  
**Controlled Revision:** [`blueprint/M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md`](blueprint/M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md)  
**Revised Financial Model:** [`blueprint/M2-14-REVISED-FINANCIAL-MODEL-AND-UNIT-ECONOMICS.md`](blueprint/M2-14-REVISED-FINANCIAL-MODEL-AND-UNIT-ECONOMICS.md)  
**Governance Status:** `OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)`  
**Baseline Policy Version:** `1.1.0-PROPOSED`  

#### 1. Strategic Rationale & Operational Context
An e-commerce marketplace requires unequivocal operational rules governing failed deliveries, returns, merchant defaults, and order cancellations. Unclear boundaries create financial friction, customer churn, and uncollectible logistics losses. OD-15 establishes a comprehensive, legally compliant, and financially audited framework aligning merchant accountability with consumer protection.

#### 2. Project Owner Explicit Direction
- **Customer Returns After Delivery (`POL-M2-14-01`):** Weight-dependent merchant reverse-shipping fee (500g: ₹30, 1kg: ₹50, 2kg: ₹80, 5kg: ₹120, >5kg: ₹165+, excl. 18% GST); 100% full customer refund with zero deductions; 7-day default return window; volumetric weight reweighing dispute mechanism.
- **Return to Origin / Failed Delivery (`POL-M2-14-02`):** Zero merchant reverse-shipping fee on genuine failed deliveries (customer unavailable, doorstep refusal); ATEEVRA absorbs reverse freight via COD fees and reserve; merchant packaging drag (₹39–₹79) recognized as internal operational expense.
- **Merchant-Initiated Cancellations (`POL-M2-14-03`):** Provisional ₹25.00 penalty per eligible cancellation (out of stock, pricing error); ₹0 platform facilitation fee earned; negative impact on Order Cancellation Rate (OCR); exception workflow for platform outages and fraud.
- **Merchant Late Dispatch SLA (`POL-M2-14-04`):** Provisional ₹50.00 penalty for dispatches past SLA (24–48h); dispatch strictly defined as first electronic courier pickup scan; exception for carrier missed pickups.
- **Customer Pre-Dispatch Cancellation (`POL-M2-14-05`):** Zero merchant fee (₹0), zero penalty (₹0), zero reverse shipping (₹0); 100% full customer refund; zero account health impact.
- **Merchant Account Health & Progressive Enforcement (`POL-M2-14-06`):** 8 KPIs tracked across 5 progressive stages (Warning -> Financial Penalties & Enhanced Reserve Withholding -> Visibility Suppression -> Order Intake Capping -> Deboarding Review); 5-day appeal window.

#### 3. Statutory & Contractual Compliance
- **Indian Contract Act, 1872:** Deductions and penalties executed via express contractual set-off clause (Sections 10, 73, and 74).
- **CGST Act, 2017 & CBIC Circular 178/10/2022-GST:** Penalties provisionally treated as liquidated damages for contractual default (0% GST), subject to tax counsel sign-off. Reverse shipping invoiced to merchants with 18% GST as B2B service recovery.
- **Consumer Protection (E-Commerce) Rules, 2020:** 100% customer refund guarantee without hidden deductions.

#### 4. Exact Question Requiring Owner Ratification
> *"Shall ATEEVRA formally ratify Policy Suite POL-M2-14-01 through POL-M2-14-06, adopting the OD-02 Baseline v1.1.0-PROPOSED and the revised financial model, to establish weight-based merchant return fees, ₹0 merchant RTO fees, provisional cancellation (₹25) and late dispatch (₹50) penalties, and the 5-stage progressive enforcement framework?"*

---

## Preflight Git State & Verification Evidence

```
Command: git status --short
Output:
 M apps/storefront/tsconfig.tsbuildinfo

Command: git branch --show-current
Output:
m2_14

Command: git rev-parse HEAD
Output:
45dbb931899d9fa5813d1c56952e60f2b2a86826

Verification Invariants:
- The working tree is NOT clean: it contains exactly one modified build-metadata file (apps/storefront/tsconfig.tsbuildinfo) generated during storefront typecheck.
- apps/storefront/tsconfig.tsbuildinfo is preserved intact without cleaning, resetting, stashing, or discarding.
- Zero application code files modified.
- Zero migrations applied.
- Zero git commands executed that commit, push, stash, clean, reset, or switch branches.
- Acceptance statuses of M2-11, M2-12, and M2-13 preserved as IMPLEMENTED — AWAITING HUMAN ACCEPTANCE.
```

---

## FINAL STATUS

`M2-14 — OWNER DECISIONS PENDING — IMPLEMENTATION NOT AUTHORIZED`
