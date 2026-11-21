# ATEEVRA PHASE 0.5 — PHASE 1 READINESS & MINIMUM VIABLE ENTRY SET
**Document ID:** `ATEEVRA-P05-P1-READINESS-001`  
**Classification:** Phase 1 Gating, Dependency Mapping & Governance Transition Architecture  
**Current Governance Status:** ACTIVE PHASE 0.5 GATING DOCUMENT (Phase 1 NOT Started / Locked)  
**Effective Date:** 2026-11-05  
**Governing Mandate:** Phase 0.5 Quality Gate & Readiness Architecture  
**Baseline Git Commit:** `676609f` on branch `brand_decisions`  
**Auditor / Preparer:** Principal Enterprise Architect, Luxury Brand Strategist & Governance Specialist  

---

## 1. Executive Summary & Governance Mandate

The transition from Phase 0.5 (Strategy, Gating & Financial Modeling) to Phase 1 (Architecture Decoupling & Sourcing Framework) represents a major governance checkpoint.

Under Master Governance instructions:
1. **Phase 1 IS NOT DECLARED READY AND IS NOT STARTED BY THIS DOCUMENT.**
2. Codebase refactoring, database migrations, and commercial spending remain strictly prohibited until the Project Owner provides written ratification.
3. However, rather than requiring all 28 Owner Decisions to be approved indiscriminately before any initial technical preparation can commence, this document establishes a **rational, defensible, dependency-driven Minimum Viable Phase 1 Entry Set**.
4. This allows the Project Owner to focus strategic deliberation on the critical-path decisions that genuinely unblock Phase 1, while allowing independent operational, customer experience, and policy decisions to be deliberated in parallel during Phase 1.

---

## 2. Comprehensive 28-Decision Readiness & Phasing Classification

> [!IMPORTANT]
> **Approved Technical Baseline: Next.js 14.2.24 (Not Next.js 15)**  
> The approved repository frontend baseline is strictly **Next.js 14.2.24**, **React 18.3.1**, **Medusa v2.19**, and **Strapi v5.52.1** (as empirically verified in `apps/storefront/package.json` and established in [`ATEEVRA-NEXTJS-BASELINE-CLARIFICATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-NEXTJS-BASELINE-CLARIFICATION.md)). Next.js 15 is an unapproved future proposal. No framework upgrade is required or permitted for Phase 1.

Every one of the 28 Owner Decisions is mapped into its strict governance category:

```
+===================================================================================================================================+
|                                    28-DECISION PHASE 1 TRANSITION GOVERNANCE MATRIX                                               |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| #  | Decision ID | Canonical Decision Title          | Deliberation Wave  | Phase 1 Gating   | Technical / Operational Rationale |
|    |             |                                   |                    | Requirement      | for Gating Classification         |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 1  | **OD-001**  | Direct 1P Brand Commercial Model  | Wave 1 (Baseline)  | **MANDATORY P1** | ROOT DECISION. Unblocks corporate |
|    |             | & Seller of Record (SOR)          |                    | **PREREQUISITE** | entity, tax model, and tenant ID. |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 2  | **OD-002**  | Product Sourcing, Atelier         | Wave 1 (Baseline)  | **MANDATORY P1** | Unblocks Tech Packs, fabrication  |
|    |             | Contracting & Private Label       |                    | **PREREQUISITE** | model, and Option D BOM costing.  |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 3  | **OD-007**  | Statutory Tax Compliance, Sec 31  | Wave 1 (Baseline)  | **MANDATORY P1** | Establishes GSTIN architecture,   |
|    |             | Invoicing & ITC Optimization      |                    | **PREREQUISITE** | Sec 31 invoice schema, TCS imm.   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 4  | **OD-017**  | Decoupling Marketplace Primitives | Wave 1 (Baseline)  | **MANDATORY P1** | Establishes `ATEEVRA_CORP` tenant |
|    |             | & Commercial Mode Gate            |                    | **PREREQUISITE** | and non-destructive isolation.    |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 5  | **OD-016**  | Headless Architecture: Medusa     | Wave 2 (Framework) | **MANDATORY P1** | Pins technical runtime boundaries|
|    |             | v2.19, Strapi v5.52.1 & Next 14   |                    | **PREREQUISITE** | between storefront and core.      |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 6  | **OD-022**  | B2B Atelier Supplier Qual.,       | Wave 2 (Framework) | **MANDATORY P1** | Mandates QC standards & ethical   |
|    |             | Tech Packs & Ethical Audits       |                    | **PREREQUISITE** | audits before vendor selection.   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 7  | **OD-026**  | Landed Cost BOM Accounting,       | Wave 2 (Framework) | **MANDATORY P1** | Capitalizes ₹59k freight & defines|
|    |             | Ind AS 2 Valuation & Multipliers  |                    | **PREREQUISITE** | inventory asset accounting rules. |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 8  | **OD-003**  | Luxury Catalog Architecture,      | Wave 2 (Framework) | CAN DELIBERATE   | PDP spec layouts can be finalized|
|    |             | HSN Codes & Legal Metrology       |                    | DURING PHASE 1   | while headless schemas build.     |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 9  | **OD-006**  | Digital Payment Instruments &     | Wave 2 (Framework) | CAN DELIBERATE   | Gateway underwriting proceeds in  |
|    |             | Gateway Fee Absorption (2% MDR)   |                    | DURING PHASE 1   | parallel with core development.   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 10 | **OD-008**  | White-Glove Packaging             | Wave 2 (Framework) | CAN DELIBERATE   | Box structural testing proceeds   |
|    |             | Architecture & Tactile Unboxing   |                    | DURING PHASE 1   | during Phase 1 without code block.|
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 11 | **OD-009**  | Express Air Logistics, Same-Day   | Wave 2 (Framework) | CAN DELIBERATE   | Courier contract negotiation      |
|    |             | Dispatch & Delivery OTP           |                    | DURING PHASE 1   | occurs during Phase 1.            |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 12 | **OD-014**  | Client Data Protection, DPDP Act  | Wave 2 (Framework) | CAN DELIBERATE   | Consent text drafting occurs      |
|    |             | 2023 & PII Masking                |                    | DURING PHASE 1   | in parallel with legal counsel.   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 13 | **OD-015**  | Brand Protection, Trademark       | Wave 2 (Framework) | CAN DELIBERATE   | Trademark filing proceeds         |
|    |             | Enforcement & Grey Market Defenses|                    | DURING PHASE 1   | independently through legal counsel|
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 14 | **OD-018**  | Internal Admin Panel              | Wave 2 (Framework) | CAN DELIBERATE   | Admin UI design occurs after      |
|    |             | Architecture & TOTP MFA           |                    | DURING PHASE 1   | core tenant isolation completes.  |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 15 | **OD-019**  | Dual-Authorization Financial      | Wave 2 (Framework) | CAN DELIBERATE   | Threshold rules apply to live     |
|    |             | Thresholds (> ₹5k) & Audit Logs   |                    | DURING PHASE 1   | payments, needed for Phase 2/3.   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 16 | **OD-024**  | Central Warehouse Facility        | Wave 2 (Framework) | CAN DELIBERATE   | Physical lease LOI proceeds       |
|    |             | Topology & RFID Tracking          |                    | DURING PHASE 1   | during Phase 1 warehouse fitout.  |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 17 | **OD-004**  | Value-Based Luxury Pricing (4.8x) | Wave 3 (Commercial)| CAN DELIBERATE   | Catalog MRPs locked before PDP    |
|    |             | Architecture & Price Integrity    |                    | DURING PHASE 1   | publication; not needed for code. |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 18 | **OD-005**  | Promotional Discipline, VIP       | Wave 3 (Commercial)| CAN DELIBERATE   | Promotional rules coded during    |
|    |             | Previews & Floor Price Protection |                    | DURING PHASE 1   | storefront checkout build.        |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 19 | **OD-010**  | Concierge Return Window (7-Day),  | Wave 3 (Commercial)| CAN DELIBERATE   | Return rules finalized during     |
|    |             | Size Swap & Condition Standards   |                    | DURING PHASE 1   | post-purchase flow development.   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 20 | **OD-011**  | Post-Return Triage, Ozone         | Wave 3 (Commercial)| CAN DELIBERATE   | Ozone chamber setup needed before |
|    |             | Sanitation & Restocking Governance|                    | DURING PHASE 1   | warehouse goes live in Phase 3.   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 21 | **OD-012**  | Omnichannel Concierge Advisory &  | Wave 3 (Commercial)| CAN DELIBERATE   | WhatsApp API onboarding occurs    |
|    |             | 5-Minute WhatsApp SLA             |                    | DURING PHASE 1   | in parallel during storefront.    |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 22 | **OD-013**  | Private Client Styling Dossier &  | Wave 3 (Commercial)| CAN DELIBERATE   | Clienteling workflows drafted     |
|    |             | VIP Clienteling Program           |                    | DURING PHASE 1   | during Phase 2.                   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 23 | **OD-020**  | Luxury Storefront Visual Identity,| Wave 3 (Commercial)| CAN DELIBERATE   | UI/UX design tokens crafted       |
|    |             | Preserved Assets & Next.js 14 ISR |                    | DURING PHASE 1   | during storefront development.    |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 24 | **OD-021**  | Frictionless Single-Page Luxury   | Wave 3 (Commercial)| CAN DELIBERATE   | Checkout UI integrated after      |
|    |             | Checkout Architecture             |                    | DURING PHASE 1   | gateway underwriting completes.   |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 25 | **OD-023**  | PO Milestone Financing (30/40/30) | Wave 3 (Commercial)| CAN DELIBERATE   | Terms incorporated into MMA       |
|    |             | & Advance Payment Risk Mitigation |                    | DURING PHASE 1   | before first PO advance payment.  |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 26 | **OD-025**  | ABC Perpetual Cycle Counting &    | Wave 3 (Commercial)| CAN DELIBERATE   | Warehouse inventory SOPs written  |
|    |             | Shrinkage Discrepancy Tolerance   |                    | DURING PHASE 1   | during WH01 setup.                |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 27 | **OD-027**  | Working Capital Financing, Cash   | Wave 3 (Commercial)| CAN DELIBERATE   | Rolling cash schedules monitored  |
|    |             | Conversion Cycle & Cash Buffers   |                    | DURING PHASE 1   | against initial capital pool.     |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
| 28 | **OD-028**  | 16-Week Phased Rollout, Quality   | Wave 4 (Capstone)  | CAN DELIBERATE   | Master project capstone governing |
|    |             | Gates & Independent Validation    |                    | DURING PHASE 1   | end-to-end commercial deployment. |
+----+-------------+-----------------------------------+--------------------+------------------+-----------------------------------+
```

---

## 3. Recommended Minimum Viable Phase 1 Entry Set

The Minimum Viable Phase 1 Entry Set comprises **7 Core Decisions**:

```
+===================================================================================================================================+
|                                    MINIMUM VIABLE PHASE 1 ENTRY SET (7 DECISIONS)                                                 |
+----+-------------+-----------------------------------+-----------------------+---------------------------------------------------+
| #  | Decision ID | Canonical Decision Title          | Status / Direction    | Prerequisite Function for Phase 1 Entry           |
+----+-------------+-----------------------------------+-----------------------+---------------------------------------------------+
| 1  | **OD-001**  | Direct 1P Brand Commercial Model  | Direction: Option A   | Establishes company as sole Seller of Record,     |
|    |             | & Seller of Record (SOR)          | (Ratification Pending)| directing 1P checkout and financial ledgers.      |
+----+-------------+-----------------------------------+-----------------------+---------------------------------------------------+
| 2  | **OD-002**  | Product Sourcing, Atelier         | Direction: Option D   | Captures Category Hybrid Sourcing; directs        |
|    |             | Contracting & Private Label       | (Ratification Pending)| custom apparel Tech Packs & accessory modeling.   |
+----+-------------+-----------------------------------+-----------------------+---------------------------------------------------+
| 3  | **OD-007**  | Statutory Tax Compliance, Sec 31  | Deliberation Dossier  | Confirms Section 31 tax invoice schema, GSTIN     |
|    |             | Invoicing & ITC Optimization      | Ready for Selection   | vertical structure, and TCS deactivation for 1P.  |
+----+-------------+-----------------------------------+-----------------------+---------------------------------------------------+
| 4  | **OD-017**  | Decoupling Marketplace Primitives | Deliberation Dossier  | Mandates synthetic tenant isolation `ATEEVRA_CORP`|
|    |             | & Commercial Mode Gate            | Ready for Selection   | and protects marketplace against code damage.     |
+----+-------------+-----------------------------------+-----------------------+---------------------------------------------------+
| 5  | **OD-016**  | Headless Architecture: Medusa     | Architectural Brief   | Locks verified baseline: Medusa v2.19, Strapi     |
|    |             | v2.19, Strapi v5.52.1 & Next 14   | Formulated            | v5.52.1, Next.js 14.2.24, React 18.3.1.           |
+----+-------------+-----------------------------------+-----------------------+---------------------------------------------------+
| 6  | **OD-022**  | B2B Atelier Supplier Qual.,       | Standards Brief       | Establishes ISO 2859-1 Level II AQL 2.5 standards |
|    |             | Tech Packs & Ethical Audits       | Formulated            | and ethical criteria before contacting ateliers.  |
+----+-------------+-----------------------------------+-----------------------+---------------------------------------------------+
| 7  | **OD-026**  | Landed Cost BOM Accounting,       | Financial Model       | Capitalizes ₹59k embedded freight and establishes |
|    |             | Ind AS 2 Valuation & Multipliers  | Reconciled            | Ind AS 2 inventory asset valuation formula.       |
+===================================================================================================================================+
```

### Strategic Rationale for the 7-Decision Set:
1. **Sufficient Architectural Completeness:** These 7 decisions answer all questions regarding *who sells* (OD-001), *who makes* (OD-002), *how tax is billed* (OD-007), *how systems isolate* (OD-017), *what tech runs* (OD-016), *what quality governs* (OD-022), and *how inventory is capitalized* (OD-026).
2. **Zero Premature Constraints:** Deferring the remaining 21 decisions avoids artificial blockages on storefront aesthetics, WhatsApp SLAs, or packaging box textures while foundational decoupling occurs.

---

## 4. Professional Validation Clearances Required Before Relevant Execution

Even after Phase 1 entry is authorized, specific implementation milestones remain locked behind external professional gates:

```
+===================================================================================================================================+
|                                    MANDATORY PROFESSIONAL GATES BY WORKSTREAM                                                     |
+--------+--------------------------+-----------------------+-----------------------------------------------------------------------+
| Gate   | Specialist Domain        | Advisor State         | Locked Implementation Milestone                                       |
+--------+--------------------------+-----------------------+-----------------------------------------------------------------------+
| **G-CA**| Statutory Chartered      | Existing Advisor      | Mandatory before deploying Section 31 tax invoice engine, activating  |
|        | Accountancy & Tax        | Review Pending        | live GSTIN in Medusa, or finalizing corporate accounting ledgers.    |
+--------+--------------------------+-----------------------+-----------------------------------------------------------------------+
| **G-LG**| Corporate & Commercial   | Existing Advisor      | Mandatory before executing Master Manufacturing Agreements with       |
|        | Legal Counsel            | Review Pending        | ateliers, signing warehouse lease, or deploying public customer terms.|
+--------+--------------------------+-----------------------+-----------------------------------------------------------------------+
| **G-QA**| Textile Testing & Quality| Specialist Search in  | Mandatory before releasing 40% inline fabrication advance to ateliers |
|        | Assurance Laboratory     | Phase 0.5 (Sprint B)  | or cutting production cloth for bulk inventory.                       |
+--------+--------------------------+-----------------------+-----------------------------------------------------------------------+
| **G-LO**| Express Air Logistics &  | Specialist Search in  | Mandatory before signing carrier SLA rate cards or integrating live   |
|        | Courier Operations       | Phase 0.5 (Sprint B)  | Blue Dart / Delhivery shipping APIs.                                  |
+--------+--------------------------+-----------------------+-----------------------------------------------------------------------+
| **G-ARCH**| Enterprise Systems    | Principal Software    | Mandatory before merging or activating `COMMERCE_MODE` in production  |
|        | Architecture Gate        | Architect Active      | or deploying Medusa decoupled services.                               |
+--------+--------------------------+-----------------------+-----------------------------------------------------------------------+
| **G-SEC**| Cybersecurity & Security | CERT-In Auditor Search| Mandatory before provisioning public-facing admin panel accounts or   |
|        | Infrastructure Gate      | in Sprint B           | accepting live customer payment credentials.                          |
+===================================================================================================================================+
```

---

## 5. Non-Executable Technical Documentation Safely Preparable in Phase 0.5

During the current Phase 0.5 deliberation window, technical preparation is strictly restricted to **non-executable markdown architectural documentation, specification drafts, and requirements documents stored within `docs/ateevra-brand/`**.

> [!CAUTION]
> **STRICT PROHIBITION ON EXECUTABLE CODE & REPOSITORY ASSET CREATION:**  
> Under the active Phase 0.5 stop condition, engineering MUST NOT create, modify, or commit:
> - Production TypeScript interfaces, types, or `.ts` / `.d.ts` files in `apps/` or `packages/`.
> - Strapi content-type `.json` schema files or database configurations in `apps/strapi/`.
> - OpenAPI `.yaml` or `.json` implementation files in application directories.
> - Application source code in `apps/storefront/`, `apps/backend/`, etc.
> - Automated test scripts (`.test.ts`, `.spec.ts`, `.mjs`) within application directories.
> 
> All technical preparation must remain purely descriptive markdown documentation until Phase 1 implementation is formally authorized by the Project Owner.

Permissible non-executable documentation preparation within `docs/ateevra-brand/` includes:
1. **Markdown API Contract Drafts:** Narrative documentation of REST/GraphQL endpoint parameters, auth headers, and response payloads.
2. **Descriptive Data Modeling:** Documenting entity field requirements, HSN mappings, and validation rules in markdown tables.
3. **Quality & Test Scenarios:** Documenting test matrices, regression checklists, and marketplace isolation scenarios in markdown text.
4. **Content Modeling Architecture:** Documenting editorial attributes and relationship diagrams for atelier storytelling in markdown.

---

## 6. Commercial Commitments Requiring Separate Spending Authorization

Every capital deployment requires explicit dual-authorization and written Project Owner approval:

```
+===================================================================================================================================+
|                                    COMMERCIAL COMMITMENTS SPENDING AUTHORIZATION MATRIX                                           |
+----+----------------------------------------+------------------+---------------------+--------------------------------------------+
| #  | Commitment Category                    | Gross Commitment | Cash Flow Timing    | Required Prerequisite Gate / Authority     |
+----+----------------------------------------+------------------+---------------------+--------------------------------------------+
| 1  | **Milestone 1 PO Advance (Debut 30%)** | ₹4,80,300.00     | Day 15 (Phase 1)    | OD-002 Approval + MMA Signed (G-LG).       |
| 2  | **WH01 Warehouse Lease Deposit**       | ₹3,00,000.00     | Day 30 (Phase 1)    | Site LOI Approved + Lease Review (G-LG).   |
| 3  | **Tech Pack & Pattern CAD Software**   | ₹3,50,000.00     | Day 10 (Phase 1)    | In-house Studio Tooling Authorization.     |
| 4  | **Fabric Mill Swatch & Color Dye Lots**| ₹75,000.00       | Day 12 (Phase 1)    | Swatch RFP Selection Approval.             |
| 5  | **Textile Testing Retainer (SGS/Inter)**| ₹45,000.00      | Day 20 (Phase 1)    | Testing Protocol Approval (G-QA).          |
| 6  | **Trademark Class 25 / 35 Filings**    | ₹30,000.00       | Day 7 (Phase 1)     | Trademark Search Clearance (G-LG).         |
+----+----------------------------------------+------------------+---------------------+--------------------------------------------+
|    | **TOTAL INITIAL PHASE 1 COMMITMENTS**  | **₹12,80,300.00**| Initial 30-Day Cash | Sub-allocated from ₹36.48L initial pool.   |
+===================================================================================================================================+
```

---

## 7. Current Governance Status Invariant

- **Current Phase:** **Strictly Phase 0.5** (Strategy, Gating & Financial Modeling).
- **Phase 1 Status:** **NOT STARTED — PROHIBITED FROM STARTING** until:
  1. The Project Owner formally ratifies the Minimum Viable Phase 1 Entry Set (`OD-001`, `OD-002`, `OD-007`, `OD-017`).
  2. Professional validation briefs (`Gate G-CA` and `Gate G-LG`) receive formal written advisor responses.
  3. The Project Owner executes a written Phase 1 Commencement Authorization Instrument.
