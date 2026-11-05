# ATEEVRA Phase M2-14 — OD-01 Comprehensive Owner Review Package
## Marketplace Facilitation Model, Seller-of-Record Governance & Platform Fee Architecture

**Document ID:** `REV-M2-14-OD-01-OWNER-PACKAGE`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-01  
**Decision Title:** Marketplace Commercial Revenue Architecture & Platform Facilitation Fee Model  
**Owner Business Model Direction:** Marketplace Facilitation Platform (Merchants as Sellers of Record)  
**Current Governance Status:** `OWNER DIRECTION RECORDED — PENDING FEE SELECTION & PROFESSIONAL VALIDATION`  
**Target Operational Sub-Model:** `Platform Facilitation Fee Model (Options Evaluated — PENDING SELECTION)`  
**Audit Execution Mode:** STRICTLY DOCUMENTATION & EXECUTIVE REVIEW PREPARATION  
**Active Phase:** Phase M2-14 (Payments, Refunds, Returns and Exchanges)  
**Implementation Authorization Status:** `PLANNING ONLY — IMPLEMENTATION NOT AUTHORIZED`  
**Parent Decision Register:** [`../M2-14-OWNER-DECISION-REGISTER.md#od-01`](../M2-14-OWNER-DECISION-REGISTER.md#od-01)  
**Supporting Analysis:** [`../decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md`](../decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md)  
**Established Policy Reference:** [`policies/OD-02-06-PRICING-BOUND-CONFLICTS.md`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md) (Approved v1.0.0 Baseline)  
**Dedicated Companion Blueprints:**
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-MARKETPLACE-UNIT-ECONOMICS-STRESS-TEST.md`](M2-14-OD-01-MARKETPLACE-UNIT-ECONOMICS-STRESS-TEST.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-FEE-AND-SHIPPING-SCENARIO-MATRIX.md`](M2-14-OD-01-FEE-AND-SHIPPING-SCENARIO-MATRIX.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-BREAK-EVEN-AND-SENSITIVITY-ANALYSIS.md`](M2-14-OD-01-BREAK-EVEN-AND-SENSITIVITY-ANALYSIS.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-FINANCIAL-ASSUMPTIONS-REGISTER.md`](M2-14-OD-01-FINANCIAL-ASSUMPTIONS-REGISTER.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md`](M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md`](M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md)
- [`docs/mvp2/m2-14/blueprint/M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md`](M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md)

---

## 1. Executive Summary & Governance Guide

This document constitutes the comprehensive **Owner Review Package for Owner Decision OD-01**. It incorporates the Project Owner's clarified business-model direction and provides an exhaustive comparison of marketplace platform fee structures, unit economics, statutory tax compliance, and merchant contractual frameworks.

### 1.1. Categorical Governance Status Distinctions
To preserve absolute governance integrity:
1. **Existing Approved Policy:** The 4-step pricing-bound conflict resolution hierarchy codified in [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md) remains **`OWNER APPROVED — INITIAL POLICY BASELINE` (v1.0.0)**.
2. **Project Owner's Business Model Direction:** Recorded as the **selected commercial architecture direction** (merchants as direct sellers of record, ATEEVRA as marketplace facilitator earning revenue via a separately defined fee; zero wholesale inventory buy-sell). This direction is **pending final fee selection and professional validation**.
3. **Decisions Reserved Exclusively for the Project Owner:**
   - Selection of the specific platform fee structure (Option C: Percentage vs Option D: Hybrid vs Option A/B: Fixed);
   - Approval of forward logistics cost allocation policy (charging shipping at checkout vs platform fee absorption);
   - Approval of the Merchant Master Services Agreement (MSA) fee and settlement clauses.
4. **Matters Requiring External Professional Validation:**
   - Indian FDI policy compliance and Consumer Protection (E-Commerce) Rules compliance regarding marketplace pricing independence;
   - Formal Chartered Accountant (CA) written opinion on Section 52 GST TCS (0.5%), Section 194-O IT TDS (0.1%), and B2B platform fee invoicing under SAC 998371.
5. **No Software Implementation Authorized:** This review package does **NOT** authorize software changes, schema migrations, or API implementations.

---

## 2. Project Owner Business Model Direction & Reassessment of Prior Models

### 2.1. The Owner's Clarified Business Model
The Project Owner has clarified ATEEVRA's commercial model:
- **Merchants remain the sellers of record:** Direct contracts of sale exist between merchants and end consumers. Merchants issue customer-facing B2C GST tax invoices.
- **ATEEVRA is an Electronic Commerce Operator (ECO):** Provides digital discovery, storefront software, logistics aggregation, and payment facilitation.
- **Revenue Earned via Separately Defined Platform Fee:** ATEEVRA bills merchants a transparent platform/facilitation fee (+ 18% GST).
- **No Wholesale Resale:** ATEEVRA does **NOT** take title, purchase inventory, or act as a wholesale buyer.

### 2.2. Reassessment of Prior Models
- **Why Previous Wholesale Markup Fails:** In earlier drafts, Mode 1 assumed ATEEVRA captured $(P_{\text{sell}} - P_{\text{realization}})$ as automatic resale markup. In a seller-of-record model, the merchant is entitled to the full customer selling price, and ATEEVRA's revenue cannot be an arbitrary spread. It must be an explicitly contracted **Platform Facilitation Fee**.
- **FDI & Consumer Protection Safeguard:** Unilateral price manipulation and spread retention by an e-commerce platform breaches Indian FDI Press Note 2 (2018) inventory-control rules and Consumer Protection Rule 5(3)(b). Operating transparently as a facilitator charging service fees eliminates these severe legal vulnerabilities.

---

## 3. Comparison of Five Platform Fee Structures

The table below summarizes the comprehensive evaluation conducted in [`M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md`](M2-14-OD-01-MARKETPLACE-PLATFORM-FEE-COMPARISON.md):

| Dimension | Option A: Fixed Per Order | Option B: Fixed Per Item | Option C: Percentage Fee | Option D: Hybrid (Base + %) | Option E: Customer Fee |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Illustrative Rate** | Flat ₹50.00 / order | Flat ₹25.00 / item | **8.0% to 10.0%** of sale | **₹20 fixed + 5.0%** | Flat ₹19.00 / checkout |
| **Who Pays** | Merchant | Merchant | Merchant | Merchant | End Customer |
| **Invoicing Entity** | ATEEVRA $\rightarrow$ Merchant | ATEEVRA $\rightarrow$ Merchant | ATEEVRA $\rightarrow$ Merchant | ATEEVRA $\rightarrow$ Merchant | ATEEVRA $\rightarrow$ Customer |
| **GST SAC Code** | SAC 998371 (18%) | SAC 998371 (18%) | SAC 998371 (18%) | SAC 998371 (18%) | SAC 998371 (18%) |
| **Merchant ITC Eligibility**| Yes (B2B Tax Invoice) | Yes (B2B Tax Invoice) | Yes (B2B Tax Invoice) | Yes (B2B Tax Invoice) | No (B2C) |
| **Customer Transparency** | 100% Transparent | 100% Transparent | 100% Transparent | 100% Transparent | **Poor (Drip pricing risk)** |
| **Cart Drop-Off Risk** | Zero | Zero | Zero | Zero | **High** |
| **AOV Scaling** | Zero | Zero | **High (Scales with AOV)**| **Moderate** | Zero |
| **Cost Recovery on Cheap SKUs**| High | Moderate | Low | **High (Guaranteed base)** | Low |
| **OD-02 Compatibility** | Partially viable | Poor on single items | **100% Compatible** | **100% Compatible** | Incompatible |
| **Advisory Ranking** | Secondary (B2B Niche) | Flawed for Bundling | **PRIMARY RECOMMENDATION**| **STRONG ALTERNATIVE** | **NOT RECOMMENDED** |

---

## 4. Financial Scenario Modeling & Unit Economics

As modeled in [`M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md`](M2-14-OD-01-FINANCIAL-SCENARIO-MODEL.md), the economics of a standard **₹1,000.00 Order** are modeled across operational scenarios:

### 4.1. Delivered Order Unit Economics (Assuming Shipping Neutrality)
*Customer pays ₹1,000.00; Forward Shipping (₹70.00) is self-funded via customer checkout shipping fee or merchant logistics deduction:*

$$\begin{aligned}
\text{Model 1 (Fixed ₹60):} \quad &\text{Fee (₹60)} - \text{Gateway (₹20)} - \text{Reserve (₹22.61)} = \mathbf{+₹17.39} \text{ Contribution (+1.74\%)} \\
\text{Model 2 (10\% = ₹100):} \quad &\text{Fee (₹100)} - \text{Gateway (₹20)} - \text{Reserve (₹22.61)} = \mathbf{+₹57.39} \text{ Contribution (+5.74\%)} \\
\text{Model 3 (Hybrid ₹75):} \quad &\text{Fee (₹75)} - \text{Gateway (₹20)} - \text{Reserve (₹22.61)} = \mathbf{+₹32.39} \text{ Contribution (+3.24\%)}
\end{aligned}$$

> [!WARNING]
> **CRITICAL REVENUE WARNING — THE FREIGHT DEFICIT TRAP:**  
> If ATEEVRA absorbs 100% of the ₹70.00 forward shipping cost out of a ₹60, ₹75, or ₹100 platform fee, the transaction operates at a **NET ORDER CONTRIBUTION LOSS** (-₹12.61 to -₹52.61).  
> **Strategic Imperative:** Forward shipping must be shipping-neutral (billed to customer at checkout or charged to merchant), or the platform facilitation fee must be set higher (e.g. 15%+) to cover freight.

### 4.2. Returns & Cancellations Lifecycle Summary
1. **Pre-Dispatch Cancellation:** Customer refunded 100%. Platform fee waived. Sunk gateway MDR (-₹20) absorbed by platform per [`POL-OD-02-03`](policies/OD-02-03-GATEWAY-FEE-ALLOCATION.md). Net Contribution = -₹20.00.
2. **Customer Remorse Return:** Customer refunded 100%. Merchant entitlement cancelled. Platform fee waived via GST Credit Note. Forward + Reverse freight (₹140) + Gateway (₹20) = ₹160 gross cash drain, absorbed entirely by the OD-02 Return-Cost Reserve.
3. **Merchant-Fault Return:** Customer refunded 100%. Forward + Reverse freight (₹140) debited to merchant settlement ledger per [`POL-OD-02-04`](policies/OD-02-04-COURIER-DAMAGE-LIABILITY.md). Platform absorbs gateway fee (-₹20).

---

## 5. Pricing Bounds & Compatibility with Approved `POL-OD-02-06`

In the seller-of-record model, the 4-step conflict resolution hierarchy in [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md) operates with complete elegance:

$$\mathbf{P_{\text{realization}} \le P_{\text{sell}} \le P_{\max} \le \text{Statutory Package MRP}}$$

- **Step 1 (Compress ATEEVRA Platform Fee):** If a product has a narrow margin spread $(P_{\max} - P_{\min})$, ATEEVRA compresses its platform facilitation fee (e.g. from 10% down to 6%), provided expected net contribution remains above the Category Viability Floor.
- **Step 2 (Renegotiate Merchant Price Floor):** Seek explicit merchant consent to lower $P_{\min}$.
- **Step 3 (Renegotiate Customer Price Ceiling):** Seek merchant consent to increase $P_{\max}$ (strictly bounded by statutory MRP).
- **Step 4 (Suspend SKU):** If viable unit economics cannot be achieved, the SKU is suspended from the catalog to prevent cash-bleeding sales.

---

## 6. Statutory Tax & Regulatory Validation Framework

As documented in [`M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md`](M2-14-OD-01-LEGAL-ACCOUNTING-VALIDATION-CHECKLIST.md), the legal and tax parameters are verified against official primary sources:

1. **GST Section 52 TCS:** Verified at **0.50% total** (CBIC Notification No. 15/2024–Central Tax, effective 10 July 2024) levied on net taxable supplies. Monthly Form GSTR-8.
2. **Income Tax Section 194-O TDS:** Verified at **0.10%** (Finance (No. 2) Act, 2024, effective 1 October 2024). Individual/HUF sellers exempt up to ₹5,00,000 annual gross sales.
3. **Platform Fee GST Invoicing:** SAC 998371, 18% GST. B2B Tax Invoice issued to merchant. Merchant avails 100% ITC.
4. **FDI Marketplace Compliance:** 100% FDI allowed under automatic route in marketplace model; merchants retain pricing ownership; zero inventory control.

---

## 7. Merchant Master Services Agreement (MSA) Required Clauses

The Merchant Agreement must incorporate five standardized clauses:
1. **Seller of Record & Direct Contracting Clause:** Merchant confirms it is the direct seller to customers, issuing tax invoices and fulfilling legal warranties.
2. **Platform Facilitation Fee Clause:** Merchant authorizes ATEEVRA to deduct the agreed platform facilitation fee (+ 18% GST) from settlement disbursements.
3. **Statutory Tax Withholding Indemnity:** Merchant authorizes 0.5% GST TCS and 0.1% Income Tax TDS deductions, warranting accurate GSTIN/PAN filings.
4. **Return Defect Freight Debit Authorization:** Merchant authorizes direct settlement debit of forward and reverse freight on verified merchant packaging or product defects.
5. **Pricing Parity & MRP Warranty:** Merchant warrants that product prices do not exceed statutory package MRP under the Legal Metrology Rules.

---

## 8. Explicit Questions for Project Owner Decision

The Project Owner is invited to evaluate and resolve the following three decision points:

```
================================================================================
                    PROJECT OWNER DECISION FRAME FOR OD-01
================================================================================

1. FORMAL MODEL CONFIRMATION:
   Do you formally ratify the Marketplace Facilitation Platform Model
   (merchants as direct sellers of record, issuing B2C customer invoices,
   ATEEVRA earning service revenue via transparent facilitation fees)?

2. PLATFORM FEE STRUCTURE SELECTION:
   Which platform fee model do you select for ATEEVRA MVP-2?
   [ ] Option C: Percentage Facilitation Fee (Recommended: 8.0% to 10.0%)
   [ ] Option D: Hybrid Fee (Recommended: ₹20.00 fixed + 5.0% percentage)
   [ ] Option A: Fixed Fee Per Order (e.g. ₹50.00 flat)

3. LOGISTICS COST RECOVERY POLICY:
   Do you confirm that forward shipping freight (₹70.00) must be shipping-neutral
   (billed to customer at checkout or charged to merchant) to prevent
   platform contribution margin deficits?
================================================================================
```
