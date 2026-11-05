# ATEEVRA Phase M2-14 — OD-01 to OD-02 Policy Compatibility & Integrity Reconciliation
## Restoring Strict Baseline Invariants Across Approved Policies POL-OD-02-01 through POL-OD-02-06

**Document ID:** `REC-M2-14-OD-01-OD02-INTEGRITY`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision References:** OD-01 (Pricing & Financial Model) & OD-02 (Refund & Return Financial Liability)  
**Authoritative Sources:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)  
**Governance Status:** `STRICTLY DOCUMENTATION & AUDIT ONLY — ZERO IMPLEMENTATION`  
**Policy Status:** `OD-02 POLICIES LOCKED AT VERSION 1.0.0 — INITIAL BASELINE APPROVED`  
**OD-01 Decision Status:** `UNAPPROVED — PROVISIONAL DIRECTION FOR OWNER EVALUATION ONLY`  
**Audit Date:** 2026-11-03  

---

## 1. Executive Summary & Policy Integrity Mandate

During recent financial modeling iterations for Phase M2-14 Owner Decision OD-01 (Marketplace Platform Fee & Shipping Allocations), several modeling assumptions inadvertently diverged from the authoritative, owner-approved baseline established in the six OD-02 policies ([`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)).

Specifically, recent draft summaries introduced three major policy conflicts:
1. **Charging Customers for Remorse Returns:** Draft text asserted that customers are charged a ₹90.00 reverse shipping fee on remorse returns, directly conflicting with [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md), which guarantees zero customer return fees and funds reverse logistics entirely through the internal Return-Cost Reserve.
2. **Assigning Merchants All Freight on Defective Returns:** Draft text asserted that merchants indemnify all ₹160.00 freight (₹70 forward + ₹90 reverse) plus platform fees on merchant-fault returns, conflicting with [`POL-OD-02-03`](policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md) and [`POL-OD-02-04`](policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md), where forward freight and gateway MDR are platform-absorbed, and only reverse freight offset is debited.
3. **Charging Merchants Gateway MDR on Fulfilled Orders:** Draft narrative claimed that merchants bear payment gateway MDR on delivered orders, contradicting the fundamental marketplace principle where the merchant receives gross turnover less platform fees and statutory withholdings, and ATEEVRA funds gateway MDR out of its platform facilitation fee revenue.

This document formally audits every approved OD-02 policy, exposes all conflicts, executes the necessary corrections, and restores 100% mathematical and commercial consistency with the approved Version `1.0.0` policy baseline.

---

## 2. Exhaustive Audit of Approved OD-02 Policy Baselines

The authoritative contents of all six approved policy files under `blueprint/policies/` are reviewed below:

### 2.1. `POL-OD-02-01`: Return-Cost Reserve Calibration Architecture
- **Approval Status:** `OWNER APPROVED — INITIAL POLICY BASELINE` (Version `1.0.0`)
- **Authoritative Rule:** ATEEVRA maintains category-specific return-cost reserves within platform gross margin/fees. The reserve acts as an internal risk buffer covering reverse shipping, gateway MDR on cancellations, and doorstep refusal costs.
- **Customer Guarantee:** **Zero Friction.** Customers are **NEVER** charged return-shipping fees. Customer shelf price is uniform and fair.
- **Merchant Guarantee:** **Fair & Protected.** Merchant realization ($P_{\text{realization}}$) is not secretly docked or subjected to arbitrary risk multipliers at launch.
- **Actuarial Baseline (₹1,000 Order):**
  - Prepaid Net Incident Cost (Measurement A): **₹5.43 per placed order**
  - COD Net Incident Cost (Measurement A): **₹21.22 per placed order**
  - Target Reserve Earmark: **₹22.61 per delivered order**

### 2.2. `POL-OD-02-02`: Unified Product Pricing Across Prepaid and COD
- **Approval Status:** `OWNER APPROVED — INITIAL POLICY BASELINE` (Version `1.0.0`)
- **Authoritative Rule:** Product shelf selling price ($P_{\text{sell}}$) must be strictly identical across Prepaid and Cash on Delivery:
  $$P_{\text{sell}}(\text{Prepaid}) \equiv P_{\text{sell}}(\text{COD})$$
- **Carrier COD Fee Absorption:** The direct carrier cash collection fee (₹30.00–₹40.00) is initially absorbed as a platform variable operating expense.
- **Prohibition on Surcharges:** The platform shall **NOT** introduce an automatic customer-facing COD fee, cash surcharge, or handling fee at initial launch.

### 2.3. `POL-OD-02-03`: Platform Absorption of Payment Gateway MDR on Merchant-Fault Returns
- **Approval Status:** `OWNER APPROVED — INITIAL POLICY BASELINE` (Version `1.0.0`)
- **Authoritative Rule:** ATEEVRA initially absorbs all non-refundable payment gateway processing fees (MDR, ~2% + GST) incurred on merchant-fault returns.
- **Prohibition on Gateway Debits:** The platform shall **NOT** automatically debit, claw back, or invoice payment gateway MDR from merchant settlement balances.
- **Reverse Shipping Offset:** While gateway MDR is platform-absorbed, reverse logistics freight (₹90.00 contractual rate or agreed 90% offset = ₹81.00) may be debited to the merchant's ledger under `LEDGER_ADJ_REVERSE_FREIGHT_MERCHANT_FAULT`. Forward freight (-₹70.00) remains platform-absorbed in the baseline model.
- **Reconciled Impact on Merchant Fault (₹1,000 Order):**
  - Customer Refund: -₹1,000.00 (100% full refund)
  - Merchant Realization: Canceled (₹0 paid)
  - Forward Freight: -₹70.00 (Platform absorbs)
  - Reverse Freight: -₹90.00 (3PL invoice)
  - Merchant Reverse Freight Offset: **+₹81.00** (Merchant debited)
  - Payment Gateway MDR: **-₹21.40 to -₹23.60** (Platform absorbs)
  - Net Platform Economic Impact: **-₹100.40 to -₹102.60**
  - Net Merchant Economic Impact: **-₹81.00** (Reverse freight only)

### 2.4. `POL-OD-02-04`: Customer Protection and Evidence-Based Liability for In-Transit Carrier Damage
- **Approval Status:** `OWNER APPROVED — INITIAL POLICY BASELINE` (Version `1.0.0`)
- **Authoritative Rule:** ATEEVRA immediately protects and refunds eligible customers upon verification of damaged delivery (100% refund of $P_{\text{sell}}$).
- **Merchant Protection Invariant:** Carrier rejection of an insurance claim must **NEVER** automatically transfer financial liability or result in a settlement debit to the merchant.
- **Condition for Merchant Liability:** Financial liability may be allocated to a merchant **ONLY** where verified, documented evidence proves that the merchant violated platform packaging/cushioning guidelines.
- **Six-Milestone Lifecycle:** ATEEVRA logs an insurance claim asset (Milestone 1), submits proof to 3PL (Milestone 2), and upon courier settlement absorbs any unrecovered shortfall as a bad debt write-off (Milestone 6) without penalizing compliant sellers.

### 2.5. `POL-OD-02-05`: Platform Absorption of COD RTO Expenses and Automated Customer Risk Controls
- **Approval Status:** `OWNER APPROVED — INITIAL POLICY BASELINE` (Version `1.0.0`)
- **Authoritative Rule:** ATEEVRA initially absorbs all logistics expenses resulting from COD customer doorstep refusal and Return to Origin (RTO).
- **Prohibition on Punitive Fees:** Zero customer penalties or blacklisting on isolated failed deliveries. Zero merchant debits (merchant payable canceled; goods restocked after QC).
- **Direct Logistics Cash Outflows on RTO (₹1,000 Order):**
  - Forward Freight: **-₹70.00**
  - Doorstep Attempt Fee: **-₹30.00**
  - RTO Reverse Return Freight: **-₹70.00**
  - Total Sunk Cash Outflow: **-₹170.00** (Funded entirely through the Return-Cost Reserve pool).
- **Mandatory Risk Controls:** SMS/WhatsApp OTP verification before order confirmation, configurable ₹5,000 order value cap, and automated repeat-RTO monitoring.

### 2.6. `POL-OD-02-06`: Merchant Pricing-Bound Governance and Conflict Resolution Hierarchy
- **Approval Status:** `OWNER APPROVED — INITIAL POLICY BASELINE` (Version `1.0.0`)
- **Inviolable Boundary Invariant:**
  $$P_{\text{realization}} \le P_{\text{sell}} \le P_{\max} \le \text{Statutory Package MRP}$$
  Under zero circumstances may $P_{\text{sell}}$ exceed merchant ceiling $P_{\max}$ or statutory MRP.
- **Mandatory 4-Step Resolution Flow:**
  - **Step 1: Compress ATEEVRA Gross Margin / Facilitation Fee** (Absorb deficit if contribution $\ge$ Viability Floor).
  - **Step 2: Renegotiate Merchant Realization** (Seek consent to lower $P_{\text{realization}}$).
  - **Step 3: Renegotiate Approved Ceiling** (Seek consent to raise $P_{\max}$, subject to MRP).
  - **Step 4: Reject or Suspend SKU** (De-list product if viable margin cannot be achieved).
- **Prohibition on Forced Co-Pays:** Platform shall **NOT** automatically introduce mandatory merchant return co-payments or forced return subsidies.

---

## 3. Master Policy-to-Financial-Model Reconciliation Matrix

The following matrix maps each approved policy against recent modeling drafts, identifies conflicts, establishes corrections, and details the exact mathematical impact on platform contribution and cash flow:

```
==================================================================================================================================
POLICY-TO-FINANCIAL-MODEL RECONCILIATION MATRIX
==================================================================================================================================
Policy ID & Title  | Approved Policy Baseline     | Recent Stress Test Assumption | Conflict Description         | Required Correction         | Impact on Contribution & Cash Flow
-------------------+------------------------------+-------------------------------+------------------------------+-----------------------------+-----------------------------------
POL-OD-02-01       | Customers are NEVER charged  | Customer charged ₹90 reverse  | VIOLATION of Zero-Return-Fee | Revert to 100% full customer| Increases platform incident cash  
Return-Cost Reserve| return-shipping fees. Zero   | freight on remorse returns.   | customer guarantee. Shifts   | refund (-₹1,070). Reverse   | drain on remorse from -₹88.63     
Calibration        | friction. Platform absorbs   | Customer refund docked from   | return freight to customer   | freight (-₹90) absorbed via | to -₹181.40 (absorbed by the      
                   | reverse freight via reserve. | ₹1,070 down to ₹1,000/₹980.   | without owner policy change. | Return-Cost Reserve pool).  | accumulated Return Reserve pool). 
-------------------+------------------------------+-------------------------------+------------------------------+-----------------------------+-----------------------------------
POL-OD-02-02       | Uniform product price across | Surcharge evaluated as        | Potential deviation if       | Affirm strict uniform shelf | Preserves customer checkout       
Unified Pricing    | Prepaid & COD. Platform      | potential mitigation. COD fee | customer-facing COD fee is   | price ($P_{sell}). Any COD  | conversion; models platform cash  
Across Channels    | absorbs 3PL COD fee (₹30-40) | treated as customer passthru. | assumed active at launch.    | fees must remain platform-  | absorption of ₹30 COD fee         
                   | at initial launch.           |                               |                              | absorbed operating costs.   | (-₹30 on delivered COD orders).   
-------------------+------------------------------+-------------------------------+------------------------------+-----------------------------+-----------------------------------
POL-OD-02-03       | ATEEVRA absorbs gateway MDR  | Merchant debited full ₹160    | VIOLATION of MDR absorption  | Merchant debited ONLY for   | Platform absorbs MDR (-₹21.40) and
Gateway Fee        | on merchant-fault returns.   | freight (₹70 fwd + ₹90 rev)   | and forward freight rules.   | reverse shipping offset     | forward freight (-₹70); net loss  
Allocation         | Merchant debited only reverse| plus platform commission      | Penalizes merchants beyond   | (+₹81 or +₹90); platform    | is -₹100.40 instead of -₹18.63.   
                   | freight offset (+₹81/+₹90).  | clawback.                     | contractual agreement.       | absorbs gateway MDR & fwd.  | Protects merchant supply trust.   
-------------------+------------------------------+-------------------------------+------------------------------+-----------------------------+-----------------------------------
POL-OD-02-04       | Immediate customer refund.   | Modeled carrier recovery      | Potential confusion if claim | Affirm compliant merchant is| Platform disburses realization to 
Courier Damage     | Compliant merchant paid. 3PL | asset (+₹600) treated as      | asset is treated as immediate| paid; claim asset (+₹600) is| merchant (-₹876.76); net platform 
Liability          | claim rejection never passed | immediate cash inflow in      | cash rather than receivable  | logged; unrecovered balance | cash drain is -₹458.16, absorbed  
                   | to seller. Bad debt absorbed.| cash flow calculations.       | pending 3PL review.          | written off to bad debt.    | via courier dispute reserves.     
-------------------+------------------------------+-------------------------------+------------------------------+-----------------------------+-----------------------------------
POL-OD-02-05       | Platform absorbs all COD RTO | Correctly modeled as platform | Zero policy conflict. Modeled| Maintain complete absorption| Platform absorbs -₹170.00 cash    
COD RTO Funding    | freight & attempt fees (-₹170| absorption; occasional drafts | faithfully, but requires     | of ₹70 fwd + ₹30 attempt +  | drain per RTO event; funded via   
                   | total). Zero seller/buyer fee| mentioned customer penalty.   | OTP risk control integration.| ₹70 rev; zero seller debit. | accumulated COD reserve pool.     
-------------------+------------------------------+-------------------------------+------------------------------+-----------------------------+-----------------------------------
POL-OD-02-06       | Inviolable price bounds. Step| Described as markup           | Terminological shift from    | Restate Step 1 as: Platform | Confirms 100% architectural       
Pricing-Bound      | 1: Compress platform margin. | compression; needed clarity   | wholesale markup to platform | compresses its facilitation | feasibility; zero margin violation
Hierarchy          | No forced merchant co-pays.  | on marketplace fee context.   | facilitation fee compression.| fee down to viability floor.| occurs under marketplace model.   
==================================================================================================================================
```

---

## 4. Resolution of the Three Key Conflicts Identified by Audit

### 4.1. Conflict 1: Customer Remorse Reverse Shipping Allocation

#### Erroneous Assumption in Previous Turn:
The summary narrative claimed:
> *"POL-OD-02-01 (Customer Remorse Return): Compatible. Customer funds return freight (₹90.00); merchant retains forward freight liability."*

#### Authoritative Policy Invariant:
[`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) Section 1 and Section 8 explicitly dictate:
> *"The purpose of this reserve is to act as an internal risk-buffer provision that financially covers platform-absorbed return, incident, and doorstep refusal costs (including reverse shipping, non-refundable gateway MDR, doorstep attempt fees, and RTO transit) across aggregate catalog sales, **without charging customers separate return-shipping fees or reducing merchant realizations**."*  
> *"Customer: Zero Friction: **Customers are never charged return-shipping fees**. Customer shelf price is fair and transparent."*

#### Reconciled Financial Correction:
1. **Customer Refund:** The customer receives a **100% full refund** of the total paid amount (including any customer-paid forward shipping, e.g. **₹1,070.00**). Under zero circumstances is ₹90.00 deducted from the customer's refund.
2. **Reverse Freight Payment:** ATEEVRA pays the 3PL carrier **-₹90.00** for reverse pickup.
3. **Funding Mechanism:** This out-of-pocket reverse freight is funded entirely through the accumulated **Return-Cost Reserve pool** ($R_{\text{target}} \approx ₹22.61$ per delivered order) built from previous successful orders.
4. **Merchant Realization:** The pending merchant payable ($P_{\text{realization}} = ₹876.76$) is canceled in software (pre-settlement). Zero penalty or return fee is debited to the merchant.
5. **Economic Impact:** The platform incurs a realized cash outflow of **-₹181.40** (₹21.40 gateway MDR + ₹70.00 forward freight + ₹90.00 reverse freight). This cash drain is fully neutralized on the platform balance sheet by drawing down the Return-Cost Reserve provision.

---

### 4.2. Conflict 2: Merchant-Fault Logistics & Commission Allocation

#### Erroneous Assumption in Previous Turn:
The summary narrative claimed:
> *"POL-OD-02-02 (Merchant Fault Defective Return): Compatible. Merchant indemnifies all freight (₹160.00) and platform fee."*

#### Authoritative Policy Invariant:
[`POL-OD-02-03`](policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md) Section 2, Rule 1, and Rule 3 explicitly state:
> *"ATEEVRA shall **initially absorb all payment gateway processing fees (MDR)** incurred on merchant-fault returns. The platform shall **NOT automatically debit, claw back, or invoice payment gateway MDR from merchant settlement balances**."*  
> *"While gateway MDR is absorbed by ATEEVRA, contractual reverse shipping fees may be debited to the merchant's ledger: Reverse shipping (₹90 or agreed contractual rate, e.g. 90% offset = ₹81) may be recorded as an authorized merchant settlement adjustment... strictly isolated from gateway charges."*

Furthermore, under standard marketplace law, when an order is returned due to defect, the sale is canceled: **merchants are not billed a platform facilitation fee for canceled transactions**, and the merchant does not indemnify forward shipping unless an explicit future commercial contract amendment mandates it.

#### Reconciled Financial Correction:
1. **Customer Refund:** Customer receives **100% full refund** (**-₹1,070.00**).
2. **Merchant Realization:** Canceled in software (₹0 paid).
3. **Gateway MDR:** **-₹21.40** is **100% absorbed by ATEEVRA** and booked to sunk banking charges.
4. **Forward Freight:** **-₹70.00** is absorbed by ATEEVRA in the baseline model.
5. **Reverse Freight Offset:** The merchant's settlement ledger is debited for **₹81.00** (or ₹90.00 if 100% offset is agreed in the Merchant MSA) under `LEDGER_ADJ_REVERSE_FREIGHT_MERCHANT_FAULT`.
6. **Platform Commission:** **₹0.00** (Platform does not earn or retain commission on defective items).
7. **Net Economic Impact:** ATEEVRA absorbs **-₹100.40** (₹21.40 MDR + ₹70.00 forward freight + ₹90.00 reverse freight - ₹81.00 merchant offset). The merchant incurs **-₹81.00** in reverse logistics offsets.

---

### 4.3. Conflict 3: Payment Gateway MDR Allocation on Fulfilled Orders

#### Erroneous Assumption in Previous Turn:
The summary narrative claimed:
> *"POL-OD-02-03 (Gateway MDR Allocation): Compatible... merchant bears MDR on fulfilled orders."*

#### Authoritative Policy Invariant:
In both the wholesale baseline (`M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md`) and the clarified marketplace model (`M2-14-OD-01-OWNER-REVIEW-PACKAGE.md`), payment gateway processing fees are third-party banking charges incurred on platform payment rails:
- Under the confirmed **Seller-of-Record Marketplace Model**, the merchant is invoiced a clean **Platform Facilitation Fee** (e.g. 10.0% = ₹100.00 + 18% GST).
- ATEEVRA contracts directly with Razorpay / Cashfree / PayU.
- The payment gateway retains the MDR (2% + GST) directly from gross customer collections entering the platform escrow/nodal account.
- **The merchant is NOT billed a separate line item for gateway MDR.** ATEEVRA funds gateway MDR out of its recognized platform facilitation fee revenue.

#### Reconciled Financial Correction:
1. **Customer Collection:** Customer pays ₹1,070.00 via UPI / Card.
2. **Gateway MDR Deduction:** Gateway retains 2.0% on ₹1,070.00 = **₹21.40**. Net cash into platform nodal account = **₹1,048.60**.
3. **Merchant Invoiced Fee:** ATEEVRA bills the merchant **₹100.00 base fee + ₹18.00 GST = ₹118.00**.
4. **Merchant Payout:** Merchant receives gross product sales (₹1,000.00) less platform fee (₹118.00) less statutory withholdings (TCS ₹4.24 + TDS ₹1.00) = **₹876.76**.
5. **Platform Operating P&L:** ATEEVRA recognizes **+₹100.00** base fee revenue and books **-₹21.40** gateway MDR operating expense, leaving **+₹78.60 gross operating spread** (before actuarial incident risk provisions).
6. **Integrity Rule:** The merchant never sees or pays a separate gateway charge, keeping merchant onboarding frictionless and settlement accounting legally compliant.

---

## 5. Statutory, Legal, and Regulatory Alignment Verification

The reconciled policies maintain full compliance with Indian statutory frameworks:

1. **Consumer Protection (E-Commerce) Rules, 2020:**  
   - *Rule 5(3)(a) (Price Parity & Non-Discrimination):* Satisfied by [`POL-OD-02-02`](policies/OD-02-02-PREPAID-COD-PRICING.md), ensuring identical shelf pricing across Prepaid and COD without discriminatory checkout fees.
   - *Rule 5(3)(b) (Prohibition Against Price Manipulation):* Satisfied by [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md), ensuring the platform never overrides merchant ceiling prices or manipulates shelf prices above MRP.
   - *Rule 6(5) (Refund Administration):* Satisfied by [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) and [`POL-OD-02-04`](policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md), guaranteeing full refunds without hidden return-shipping deductions for remorse or damaged goods.

2. **Legal Metrology (Packaged Commodities) Rules, 2011:**  
   - The inviolable rule $P_{\text{sell}} \le \text{Statutory Package MRP}$ guarantees zero violations of maximum retail price regulations.

3. **FDI Policy (Press Note 2 of 2018):**  
   - Operating strictly as a marketplace facilitation platform where merchants are sellers of record, determining their own prices subject to platform ceilings, ensures ATEEVRA complies with marketplace-based model guidelines (100% FDI allowed under automatic route, zero inventory ownership).

---

## 6. Governance Confirmation & Status Invariants

A strict governance verification confirms:
- **OD-02 Policy Invariance:** All six approved policies ([`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)) remain strictly locked at Version `1.0.0` with **zero text modifications** and **zero alterations to their approved commercial baseline**.
- **OD-01 Governance Status:** Owner Decision OD-01 remains strictly **UNAPPROVED**.
- **Commercial Discretion Preserved:** Platform fee structure and forward-shipping cost allocation remain **UNDECIDED** pending explicit written selection by the Project Owner.
- **Zero Software Implementation:** No code, schema, migration, API, or configuration changes were executed.
