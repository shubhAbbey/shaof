# ATEEVRA PHASE 0.5 — CONSOLIDATED OWNER DIRECTION RECORD: OD-001
**Document ID:** `ATEEVRA-OD-001-DIR-001`  
**Canonical Decision Reference:** [`OD-001` (Direct First-Party Luxury Brand Commercial Model & Seller of Record)](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-001-OWNER-DELIBERATION-DOSSIER.md)  
**Parent Agenda:** [`ATEEVRA-OWNER-DECISION-REVIEW-AGENDA.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OWNER-DECISION-REVIEW-AGENDA.md)  
**Governance State:** **`PROPOSED (Owner Direction Captured — Awaiting Formal Ratification & Professional Gates)`**  
**Direction Communication Date:** 2026-11-05  
**Auditor / Preparer:** Principal Enterprise Architect, Luxury Brand Strategist & Corporate Governance Specialist  

---

## 1. Executive Summary & Governance Mandate

This document establishes the authoritative, traceable record of the **Project Owner's strategic deliberation, policy selections, and operational directions for Owner Decision OD-001**.

> [!CRITICAL]
> **GOVERNANCE MANDATE: DIRECTION CAPTURE IS NOT RATIFICATION OR AUTHORIZATION**  
> 1. Recording the Project Owner's strategic direction **DOES NOT** transition OD-001 to `APPROVED`. OD-001 remains formally **`PROPOSED`** until explicit ratification is executed under the project's governance protocol.
> 2. This document **DOES NOT** authorize:
>    - Software implementation or codebase refactoring.
>    - Database schema alterations or migrations.
>    - Configuration or environment modifications (e.g., changing `COMMERCE_MODE`).
>    - Capital expenditure, supplier contracts, purchase orders, or advances.
> 3. The recorded directions provide strategic clarity to guide external professional validation (`Gate G-CA`, `Gate G-LG`) and downstream deliberation across coupled decisions (`OD-002`, `OD-007`, `OD-017`).

---

## 2. Consolidated Record of Project Owner Directions for OD-001

On **2026-11-05**, the Project Owner deliberated and communicated explicit strategic directions across three core dimensions:

### 2.1 Commercial Model Selection
- **Decision Context:** `OD-001` evaluates whether ATEEVRA operates as a Direct First-Party Luxury Brand (Option A), a Multi-Vendor Luxury Marketplace Platform (Option B), or a Hybrid Concession / Consignment Agency (Option C).
- **Owner's Current Direction:** **`OPTION A — PURE FIRST-PARTY D2C LUXURY BRAND (SOLE SELLER OF RECORD)`**
- **Strategic Policy & Operational Scope:**  
  ATEEVRA will operate as an independent first-party luxury fashion brand, selling its own branded apparel and accessories directly to end-consumers. ATEEVRA assumes direct responsibility for:
  1. **Brand Ownership & Equity:** Absolute authority over brand identity, luxury positioning, creative lookbooks, editorial campaigns, and client tiering.
  2. **Product Merchandising & Retail Pricing:** Full pricing autonomy, establishing catalog MRPs, and enforcing non-breachable promotional price floors (e.g., ₹7,800.00 blazer promotional floor).
  3. **Product Sourcing & Inventory Responsibility:** Contracting with ateliers and fabric mills, absorbing inventory title and balance-sheet ownership, and managing sizing/deadstock risks.
  4. **Direct Customer Sales:** Acting as the legal vendor of record transacting with end-customers via ATEEVRA’s digital storefront.
  5. **Client Fulfillment, Logistics & Reverse Logistics:** Overseeing luxury unboxing, 3PL warehouse operations, outbound express courier, customer returns triage, and customer refunds.
  6. **Product Quality & Statutory Seller of Record Obligations:** Direct accountability for textile quality standards, Legal Metrology labeling compliance, Section 31 tax invoicing, and statutory product liability under the Consumer Protection Act, 2019.
- **Evidentiary State:** Strategic direction captured; pending external legal/tax validation and formal ratification.

### 2.2 Corporate & Legal Entity Structure
- **Owner's Current Direction:** **`ONE LEGAL COMPANY OPERATING BOTH BUSINESSES, WITH SEPARATE OPERATIONS AND ACCOUNTING.`**
- **The Two Recognized Business Lines:**
  1. **Business Line 1 (ATEEVRA):** First-party luxury fashion house selling proprietary branded garments directly to customers.
  2. **Business Line 2 (Existing Marketplace):** Independent multi-vendor luxury platform facilitating third-party merchant transactions.
- **Operational & Financial Segregation Framework:**  
  The company will enforce strict internal operational, managerial, and accounting separation between the two business lines:
  - **Business-Line Cost Centers & Profit Centers:** Segregated general ledger charting separating 1P brand revenues, COGS, marketing, and warehousing from marketplace commission income, payment splits, and platform overhead.
  - **Inventory Ledgers:** Physical and digital isolation of 1P brand stock from third-party vendor inventory.
  - **Management Reporting:** Independent P&L, balance sheet contribution, and Free Cash Flow reporting for each business line.
- **Critical Statutory Reality & Legal Caveat:**  
  > [!WARNING]
  > **Operational Separation Does Not Equal Legal Entity Separation:**  
  > Internal accounting segregation and departmental cost centers **DO NOT** create separate legal entities or separate statutory liabilities. Under Indian corporate law, both business lines share the same corporate veil, the same Board of Directors, and the same joint balance sheet. Any statutory liability, tax penalty, vendor breach, consumer forum claim, or labor dispute arising in one business line attaches directly to the single legal company.  
  > *Mandatory Action:* The actual corporate, GST, invoicing, accounting, and contractual implications of operating both business lines within one legal company must be rigorously reviewed by external Chartered Accountants (`Gate G-CA`) and Corporate Legal Counsel (`Gate G-LG`).

### 2.3 Strategic Business Priority & Marketplace Protection
- **Owner's Explicit Priorities:**
  1. **Primary Focus:** The **ATEEVRA luxury brand is the first business priority** for strategy, executive focus, capital deployment, and brand positioning.
  2. **Marketplace Continuity:** The **existing marketplace must continue as an independent business line** and must not be abandoned or neglected.
  3. **Architectural Non-Destruction Mandate:** ATEEVRA’s development and transition to brand mode **MUST NOT silently remove, damage, migrate, overwrite, or disable existing marketplace capabilities, database schemas, APIs, or business logic**.
- **Architectural Linkage:** This direction directly governs `OD-017` (Decoupling Marketplace Primitives & Commercial Mode Gate), mandating an additive, non-destructive architecture (such as the Synthetic Corporate Tenant `ATEEVRA_CORP`) rather than a destructive deletion of multi-vendor capabilities.

---

## 3. Comprehensive Governance Status Register for OD-001

The following table records the precise governance distinctions currently in effect:

```
+===================================================================================================================================+
|                                    OD-001 GOVERNANCE STATE & AUDIT TRAIL REGISTER                                                 |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| #  | Governance Dimension                       | Current State         | Detailed Audit Determination & Authority Basis          |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 1  | **Option A Commercial Direction**          | **DIRECTION CAPTURED**| Project Owner selected Option A (1P D2C Brand) on       |
|    |                                            |                       | 2026-11-05. Direction logged as strategic mandate.      |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 2  | **Single Legal Company Structure**         | **DIRECTION CAPTURED**| Project Owner directed single corporate entity with     |
|    |                                            |                       | dual business-line operation on 2026-11-05.             |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 3  | **Separate Operations & Accounting**       | **DIRECTION CAPTURED**| Operational/GL departmental segregation established as  |
|    |                                            |                       | business-line management policy on 2026-11-05.          |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 4  | **ATEEVRA Priority over Marketplace**      | **DIRECTION CAPTURED**| Executive prioritization established on 2026-11-05, with|
|    |                                            |                       | mandatory protection of marketplace functionality.      |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 5  | **Formal OD-001 Ratification**             | **PENDING**           | Awaiting formal execution of the Owner Ratification     |
|    |                                            |                       | Form. Formal decision status remains strictly PROPOSED. |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 6  | **Professional CA Tax Validation**         | **PENDING**           | Gate G-CA pending appointment. Dual-business GSTIN,    |
|    |                                            |                       | Section 31 invoicing, and Ind AS 115 review required.   |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 7  | **Professional Legal Counsel Validation**   | **PENDING**           | Gate G-LG pending appointment. Dual-business liability,  |
|    |                                            |                       | consumer terms, and corporate structure review required.|
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 8  | **Software Implementation Authorization**  | **NOT GRANTED**       | Strict Phase 0.5 Stop Condition remains active. Zero    |
|    |                                            |                       | code, schema, migration, or config changes authorized.  |
+----+--------------------------------------------+-----------------------+---------------------------------------------------------+
| 9  | **Capital Spending / Contract Authority**  | **NOT GRANTED**       | Dual-key financial controls active. Zero spending, POs, |
|    |                                            |                       | advances, or supplier commitments authorized.           |
+===================================================================================================================================+
```

> [!IMPORTANT]
> **Definitive Status Invariant:**  
> **OD-001 REMAINS FORMALLY `PROPOSED`.**  
> Under the project’s governance protocol, recording owner directions does not equal approval. OD-001 will transition to `APPROVED` if and only if the Project Owner formally ratifies the decision after reviewing the completed validation briefs and signing the formal ratification instrument.

---

## 4. Professional Validation Requirements Matrix (Gates G-CA & G-LG)

Prior to formal ratification and Phase 1 entry, external professional advisors must review the specific legal and financial arrangements directed by the Owner:

```
+===================================================================================================================================+
|                                    PROFESSIONAL VALIDATION REQUIREMENTS FOR OD-001                                                |
+----+-----------------------+------------------+-----------------------------------------------------------------------------------+
| #  | Validation Domain     | Gate Identifier  | Specific Inquiries & Deliverables Required from Professional Advisor              |
+----+-----------------------+------------------+-----------------------------------------------------------------------------------+
| 1  | **Dual-Business Legal**| **Gate G-LG**    | 1. Can a single Indian Private Limited company legally operate a direct 1P luxury |
|    | **Entity Structuring**| (Corporate Legal)|    brand alongside a multi-vendor marketplace under current FDI / e-commerce laws?|
|    |                       |                  | 2. Consumer Protection (E-Commerce) Rules, 2020: Review intermediary safe-harbor   |
|    |                       |                  |    implications (Section 79 IT Act) when platform also sells 1P inventory.        |
|    |                       |                  | 3. Contractual ring-fencing between marketplace vendor liabilities and 1P brand.  |
+----+-----------------------+------------------+-----------------------------------------------------------------------------------+
| 2  | **Indirect Tax (GST)**| **Gate G-CA**    | 1. GST Registration Architecture: Single GSTIN versus separate business vertical  |
|    | **Registration Model**| (Indirect Tax CA)|    registrations under Section 25(2) of CGST Act and Rule 11 of CGST Rules.       |
|    |                       |                  | 2. Tax Invoicing Segregation: Section 31 tax invoice generation (1P retail @ 12%) |
|    |                       |                  |    versus Section 52 TCS collection and commission invoicing (Marketplace @ 18%). |
|    |                       |                  | 3. GSTR-1 outward reporting: Segregation between Table 7 (B2C) and Table 4 (B2B).|
+----+-----------------------+------------------+-----------------------------------------------------------------------------------+
| 3  | **Accounting &**      | **Gate G-CA**    | 1. Ind AS 115 Principal vs. Agent determination: Verification of 1P gross revenue |
|    | **Revenue Recognition**| (Statutory Audit)|    recognition criteria (control of goods, inventory risk, pricing discretion).   |
|    |                       |                  | 2. Ind AS 108 Segment Reporting: Feasibility and mechanics of departmental segment|
|    |                       |                  |    reporting for 1P Luxury Brand vs. Marketplace Platform.                        |
|    |                       |                  | 3. Shared overhead allocation methodology (warehouse rent, hosting, management).  |
+----+-----------------------+------------------+-----------------------------------------------------------------------------------+
| 4  | **Consumer & Product**| **Gate G-LG**    | 1. Legal Metrology (Packaged Commodities) Rules, 2011: Review manufacturer/packer |
|    | **Liability Compliance**|(Regulatory Legal)|   declarations for ATEEVRA apparel sold under 1P.                                 |
|    |                       |                  | 2. Customer Terms of Sale & Privacy Policy drafting for direct luxury retail.     |
|    |                       |                  | 3. Consumer forum litigation risk allocation and warranty disclosures.            |
+----+-----------------------+------------------+-----------------------------------------------------------------------------------+
| 5  | **Future Subsidiary** | **Gate G-CA /**  | 1. Define quantitative and operational triggers under which carving out ATEEVRA   |
|    | **Separation Trigger**| **Gate G-LG**    |    into a dedicated wholly-owned subsidiary becomes legally or tax-advisable      |
|    |                       |                  |    (e.g., reaching ₹10 Crore ARR, seeking external PE equity, or FDI compliance). |
+===================================================================================================================================+
```

---

## 5. Downstream Impact Analysis Across Coupled Decisions

The Owner's direction on OD-001 directly constrains and clarifies downstream decisions:

1. **Impact on OD-002 (Product Sourcing & Atelier Contracting):**  
   Because ATEEVRA is a pure 1P brand, ATEEVRA must contract directly with ateliers and fabric mills, fund the ₹16.01L debut batch (₹17.93L gross cash), and bear 100% of inventory risk. Consignment / dropship marketplace sourcing is excluded for ATEEVRA-branded goods.
2. **Impact on OD-007 (Statutory Tax Compliance & Invoicing):**  
   ATEEVRA must issue direct Section 31 tax invoices for all retail orders, charge 12% output GST, collect customer payments, and claim inward ITC (₹239.20 CMT / ₹486.00 FOB) via GSTR-2B. Marketplace TCS logic (Section 52) must be decoupled from 1P checkout.
3. **Impact on OD-017 (Decoupling Marketplace Primitives & Mode Gate):**  
   Because the marketplace continues as an independent business line, marketplace primitives (merchant tables, commission structures, vendor payout crons) **must NOT be deleted or destroyed**. Instead, OD-017 must implement a non-destructive multi-tenant architecture (`ATEEVRA_CORP`) that allows both business lines to coexist safely.

---

## 6. Strict Governance Restrictions & Invariants

The following boundaries remain absolute:
- **OD-001 Status:** Strictly **`PROPOSED`**.
- **No Approvals:** Zero Owner Decisions approved on behalf of the Owner.
- **No Spending:** Zero capital spending, advances, or purchase orders authorized.
- **No Contracts:** Zero supplier, atelier, logistics, or lease agreements executed.
- **No Code/DB Changes:** Zero modifications across `apps/`, `packages/`, database schemas, migrations, or environment configuration (`COMMERCE_MODE`).
- **Repository Baseline:** Pinned to baseline commit `676609f` on branch `brand_decisions`. `git diff HEAD` is clean (0 lines).
- **Historical Evidence:** All historical dossiers, quality audits, and correction reports are preserved in full.

---

## 7. Next Governance Actions

1. Present this Consolidated Direction Record to the Project Owner to verify that all intent and operational boundaries have been captured accurately.
2. Authorize engagement briefs for external Chartered Accountants (`Gate G-CA`) and Corporate Legal Counsel (`Gate G-LG`) to address the dual-business legal and tax structuring questions.
3. Proceed with deliberate review of coupled Wave 1 decisions ([`OD-002`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-002-OWNER-DELIBERATION-DOSSIER.md), [`OD-007`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-007-OWNER-DELIBERATION-DOSSIER.md), [`OD-017`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-017-OWNER-DELIBERATION-DOSSIER.md)) in light of the Owner's strategic commercial direction.
