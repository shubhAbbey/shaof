# ATEEVRA PHASE 0.5 — WAVE 1 UNRESOLVED QUESTIONS AND PROFESSIONAL GATES
**Document ID:** `ATEEVRA-WAVE1-GATES-001`  
**Classification:** Professional Validation Register, Evidence Gap Analysis & Governance Checklist  
**Current Governance State:** `LIVE TRACKING REGISTER (Phase 0.5 Deliberation Active)`  
**Audit Date:** 2026-11-05  
**Auditor / Preparer:** Principal Enterprise Architect & Policy Governance Specialist  

---

## 1. Executive Summary & Purpose

In strict compliance with Master Governance and Phase 0.5 directives, **architectural proposals and economic models must not be represented as settled facts or legally approved policies**. 

This document provides a comprehensive, unvarnished register of:
1. Every **unresolved business decision** requiring explicit Project Owner selection.
2. The five **external professional validation gates** (G-CA, G-LG, G-QA, G-LO, G-SC) required before operational execution.
3. Every **missing commercial and supplier document** currently absent from the repository.
4. Every **unresolved mathematical and tax calculation** subject to professional confirmation.

---

## 2. Unresolved Project Owner Deliberation Questions

The four Wave 1 Owner Decisions remain strictly `PROPOSED`. The Project Owner must deliberate upon and resolve the following explicit questions:

```
+===================================================================================================================================+
|                                    WAVE 1 PENDING OWNER DECISIONS QUESTIONNAIRE                                                   |
+----+-------------+-----------------------------------+-----------------------------------------+---------------------------------+
| #  | Decision ID | Canonical Decision Title          | Core Unresolved Governance Question     | Available Deliberation Options  |
+----+-------------+-----------------------------------+-----------------------------------------+---------------------------------+
| 1  | **OD-001**  | Direct First-Party Luxury Brand   | Does ATEEVRA assume 100% legal Seller of| [ ] Option A: Pure 1P D2C (SOR) |
|    |             | Commercial Model & Seller of      | Record title, inventory risk, and direct| [ ] Option B: Managed Marketpl. |
|    |             | Record                            | customer invoicing, or retain a platform| [ ] Option C: Consignment Agency|
|    |             |                                   | intermediary or consignment model?      |                                 |
+----+-------------+-----------------------------------+-----------------------------------------+---------------------------------+
| 2  | **OD-002**  | Product Sourcing, Atelier         | Should ATEEVRA contract master ateliers | [ ] Option A: Contract FOB      |
|    |             | Contracting & Private Label       | on a B2B Full-Package (FOB) basis, buy  | [ ] Option B: Contract CMT      |
|    |             | Strategy                          | raw fabrics directly for CMT assembly,  | [ ] Option C: White-Label       |
|    |             |                                   | procure white-label blanks, or build an | [ ] Option D: Hybrid Model      |
|    |             |                                   | owned manufacturing factory?            | [ ] Option E: Owned Factory     |
+----+-------------+-----------------------------------+-----------------------------------------+---------------------------------+
| 3  | **OD-007**  | Statutory Tax Compliance, Section | Should ATEEVRA implement direct Section | [ ] Option A: Direct Section 31 |
|    |             | 31 Invoicing & ITC Optimization   | 31 tax invoicing with complete TCS/TDS  |     & Full ITC (Deactivate TCS) |
|    |             |                                   | deactivation and aggressive ITC offset, | [ ] Option B: Retain Marketplace|
|    |             |                                   | or retain marketplace ECO tax mechanics?|     ECO TCS Engine              |
+----+-------------+-----------------------------------+-----------------------------------------+---------------------------------+
| 4  | **OD-017**  | Decoupling Marketplace Multi-     | How should Medusa multi-vendor links be | [ ] Option A: Runtime Feature   |
|    |             | Vendor Links & Commercial Mode    | decoupled: via a non-breaking runtime   |     Gate (COMMERCE_MODE)        |
|    |             | Gate                              | feature gate (`COMMERCE_MODE`), a       | [ ] Option B: DB Table Purge    |
|    |             |                                   | destructive database migration, or an   | [ ] Option C: Codebase Fork     |
|    |             |                                   | architecture freeze until Phase 1?      | [ ] Option D: Freeze & Defer    |
+----+-------------+-----------------------------------+-----------------------------------------+---------------------------------+
```

---

## 3. Professional Validation Gates: Status and Requisite Deliverables

No Owner Decision tied to taxation, law, or engineering safety shall be considered final until the corresponding external professional validation gate is formally signed off in writing:

```
+===================================================================================================================================+
|                                    PROFESSIONAL VALIDATION GATES TRACKER (WAVE 1)                                                 |
+--------+--------------------------+-----------------------+---------------------+-------------------------------------------------+
| Gate   | Specialist Domain        | Commissioning Status  | Lead Authority      | Mandatory Professional Deliverable Required     |
+--------+--------------------------+-----------------------+---------------------+-------------------------------------------------+
| **G-CA**| Chartered Accountancy    | BRIEF PREPARED        | Statutory FCA Firm  | 1. Written opinion on Section 52 TCS exemption. |
|        | & Indirect Taxation      | (Awaiting Owner Auth) | (Audit Partner)     | 2. Section 31 tax invoice Rule 46 sign-off.     |
|        |                          |                       |                     | 3. Ind AS 115 Principal revenue policy sign-off.|
|        |                          |                       |                     | 4. GSTR-2B ITC eligibility verification memo.   |
+--------+--------------------------+-----------------------+---------------------+-------------------------------------------------+
| **G-LG**| Corporate, Commercial    | BRIEF PREPARED        | Corporate Law Firm  | 1. Master Manufacturing Agreement (MMA) draft.  |
|        | & Consumer Protection    | (Awaiting Owner Auth) | (Partner)           | 2. Customer Terms of Service & Refund Policy.   |
|        |                          |                       |                     | 3. Legal Metrology packaged commodity compliance|
|        |                          |                       |                     | 4. IP protection & non-compete atelier covenants|
+--------+--------------------------+-----------------------+---------------------+-------------------------------------------------+
| **G-QA**| Quality Assurance &      | BRIEF PREPARED        | NABL Accredited     | 1. ISO 2859-1 Level II AQL 2.5 protocol approval|
|        | Textile Testing Lab      | (Awaiting Owner Auth) | Testing Laboratory  | 2. Standardized Tech Pack tolerance standards.  |
|        |                          |                       | (SGS / Intertek)    | 3. Fiber composition & tensile lab certificates.|
+--------+--------------------------+-----------------------+---------------------+-------------------------------------------------+
| **G-LO**| Logistics & Courier      | BRIEF PREPARED        | Enterprise Freight  | 1. Blue Dart / Delhivery express air SLA card.  |
|        | Operations               | (Awaiting Owner Auth) | Express Specialist  | 2. Delivery OTP security protocol confirmation. |
|        |                          |                       |                     | 3. Reverse logistics air transit rate card.     |
+--------+--------------------------+-----------------------+---------------------+-------------------------------------------------+
| **G-SC**| Enterprise Software &    | BRIEF PREPARED        | Senior Systems      | 1. Medusa v2.19 single-tenant performance audit.|
|        | Systems Architecture     | (Awaiting Owner Auth) | Enterprise Architect| 2. Automated regression test harness for links. |
|        |                          |                       |                     | 3. Database schema freeze verification memo.    |
+--------+--------------------------+-----------------------+---------------------+-------------------------------------------------+
```

---

## 4. Missing Supplier and Commercial Document Register

The following commercial evidence is currently **ABSENT FROM THE REPOSITORY** and must be acquired during Phase 0.5:

```
+===================================================================================================================================+
|                                    MISSING COMMERCIAL EVIDENCE REGISTER                                                           |
+----+--------------------------------+-----------------------+--------------------+------------------------------------------------+
| #  | Document Category              | Target Document       | Decision Impact    | Current Evidentiary Status                     |
+----+--------------------------------+-----------------------+--------------------+------------------------------------------------+
| 1  | **Atelier Production Quotes**  | 3 Binding Quotations  | OD-002, OD-026     | `ABSENT / UNVERIFIED`                          |
|    | (Blazer, Shirt, Trouser, Knit) | from master ateliers  | Landed COGS Model  | (Currently relying on modeled assumptions)     |
+----+--------------------------------+-----------------------+--------------------+------------------------------------------------+
| 2  | **Fabric Mill Pro-Formas**     | Pro-forma tax invoices| OD-002, OD-007     | `ABSENT / UNVERIFIED`                          |
|    | (Silk, Super 120s Wool, Trims) | with verified HSN/GST | Inward ITC Model   | (No supplier tax invoices exist in repo)       |
+----+--------------------------------+-----------------------+--------------------+------------------------------------------------+
| 3  | **Rigid Box Packaging Quotes** | Formal manufacturer   | OD-008, OD-005     | `ABSENT / UNVERIFIED`                          |
|    | (Magnetic Boxes, Ribbon, Bags) | quotation & sample    | Variable Cost Model| (Modeled at ₹220.00/unit)                      |
+----+--------------------------------+-----------------------+--------------------+------------------------------------------------+
| 4  | **Express Air Logistics SLA**  | Commercial contract & | OD-009, OD-005     | `ABSENT / UNVERIFIED`                          |
|    | (Priority Courier Freight)     | published tariff card | Variable Cost Model| (Modeled at ₹165.00/unit)                      |
+----+--------------------------------+-----------------------+--------------------+------------------------------------------------+
| 5  | **Warehouse WH01 Commercial LOI| Letter of Intent or   | OD-024, OD-001     | `ABSENT / UNVERIFIED`                          |
|    | (Bengaluru Facility Lease)**   | commercial lease draft| Physical Custody   | (Modeled at ₹1,75,000.00/month)                |
+----+--------------------------------+-----------------------+--------------------+------------------------------------------------+
| 6  | **Payment Gateway Schedule**   | Executed Merchant     | OD-006, OD-007     | `ABSENT / UNVERIFIED`                          |
|    | (MDR & Processing Fees)**      | Agreement & Fee Sched.| Net Settlement     | (Modeled at 2.0% gross MDR + 18% GST)          |
+----+--------------------------------+-----------------------+--------------------+------------------------------------------------+
```

---

## 5. Unresolved Calculations Subject to CA / Professional Sign-Off

The following mathematical and indirect tax items remain classified as **MODEL ASSUMPTIONS** until verified by executed contracts and chartered accountant audit:

1. **GST Cash Prepayment on POs:** Cash outflow to ateliers requires ₹17.93 Lakhs (inclusive of 12% GST) rather than the net ₹16.01 Lakhs, creating a temporary **₹1.92 Lakh working capital cash drain** prior to ITC realization.
2. **Gross vs. Net Gateway Fee Basis:** Confirmation whether the payment aggregator deducts 2.0% on gross customer payment (₹156.00) or net revenue (₹139.29), affecting the exact cash cushion (+₹173.29 vs. +₹190.00).
3. **Inbound Freight ITC Eligibility:** Confirmation whether courier air cargo carries 18.0% GST with full ITC, or 5.0% Goods Transport Agency (GTA) reverse-charge GST.
4. **Peak Working Capital Requirement:** The total pre-revenue capital commitment for 500 units is **₹26.50 Lakhs deployed + ₹10.00 Lakhs cash contingency buffer = ₹36.50 Lakhs**, requiring formal balance sheet liquidity allocation under OD-027.

---

## 6. Document Conclusion & Action Mandate

This Register confirms that **all foundational models have been mathematically audited and stress-tested, but cannot be implemented into software until the Project Owner provides written selections and external professional gates are commissioned**.
