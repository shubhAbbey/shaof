# ATEEVRA PHASE 0.5 — WAVE 1 OWNER DECISION READINESS MATRIX
**Document ID:** `ATEEVRA-WAVE1-READINESS-001`  
**Classification:** Decision-Readiness Audit & Governance Evaluation Matrix  
**Current Governance State:** `LIVE EVALUATION MATRIX (All Decisions Retain PROPOSED Status)`  
**Audit Date:** 2026-11-05  
**Auditor / Preparer:** Principal Enterprise Architect & Policy Governance Specialist  

---

## 1. Executive Summary & Readiness Assessment

This Readiness Matrix evaluates the operational, statutory, financial, and technical readiness of the four Wave 1 Owner Decisions:
- **OD-001:** Direct First-Party Luxury Brand Commercial Model & Seller of Record
- **OD-002:** Product Sourcing, Atelier Contracting & Private Label Strategy
- **OD-007:** Statutory Tax Compliance, Section 31 Invoicing & ITC Optimization
- **OD-017:** Decoupling Marketplace Multi-Vendor Links & Commercial Mode Gate

### Global Wave 1 Readiness Verdict:
$$\mathbf{READINESS\ RATING:\ PASS\ WITH\ CAVEATS\ —\ READY\ FOR\ OWNER\ DELIBERATION}$$

All four decisions are fully analyzed, structurally cross-referenced, and prepared for Project Owner deliberation. However, ratification must proceed with full awareness of the documented commercial caveats, unverified supplier quotations, and required external professional validation gates.

---

## 2. Wave 1 Decision-Readiness Master Matrix

```
+===================================================================================================================================+
|                                    WAVE 1 OWNER DECISION READINESS MASTER MATRIX                                                  |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| Parameter          | OD-001: Commercial Model & SOR           | OD-002: Sourcing & Manufacturing   | OD-007: Statutory Tax & Sec31|
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Canonical Title**| Direct First-Party Luxury Brand          | Product Sourcing, Atelier          | Statutory Tax Compliance,    |
|                    | Commercial Model & Seller of Record      | Contracting & Private Label Strat. | Section 31 Invoicing & ITC   |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Current Status** | `PROPOSED (Pending Owner Selection)`     | `PROPOSED (Pending Owner Selection)`| `PROPOSED (Pending Selection)|
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Readiness Rating| **PASS WITH CAVEATS**                    | **PASS WITH CAVEATS**              | **PASS WITH CAVEATS**        |
|                    | (Ready for Owner Deliberation)           | (Ready for Owner Deliberation)     | (Ready for Owner Delib.)     |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Evaluated**      | • Option A: Pure 1P D2C Brand (SOR)      | • Option A: Contract Atelier FOB   | • Option A: Direct Sec 31 &  |
| **Alternatives**   | • Option B: Managed Marketplace (ECO)    | • Option B: Contract CMT Assembly  |   Full ITC (Deactivate TCS)  |
|                    | • Option C: Hybrid Consignment Agency    | • Option C: White-Label Blanks     | • Option B: Retain Legacy    |
|                    |                                          | • Option D: Hybrid Apparel+Access. |   Marketplace ECO TCS Engine |
|                    |                                          | • Option E: Owned Factory          |                              |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Architectural**  | **Option A (Pure First-Party D2C)**      | **Option A (Contract Atelier FOB)**| **Option A (Direct Sec 31 &  |
| **Recommendation** |                                          |                                    | Full ITC Offset)**           |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Primary Economic**| 100% Top-line Gross Revenue recognition  | 500-unit batch requires ₹16.01L    | Net tax remittance ₹509.70;  |
| **Metric Baseline**| under Ind AS 115 (Principal); 75% gross  | in accounting COGS; peak pre-rev   | P&L contribution +₹173.29    |
|                    | margin potential at full retail price.   | cash drain is ₹26.50L (+₹10L buff).| (+2.49% of Net Revenue).     |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Open Commercial**| • 4.7x revenue multiple is an accounting | • Unit COGS are MODEL ASSUMPTIONS; | • Assumed ITC rates (5%, 12%,|
| **Caveats & Gaps** |   presentation difference, not an        |   zero signed quotes in repo.      |   18%) require CA sign-off.  |
|                    |   inherent economic profit advantage.    | • 12% GST cash prepayment on POs   | • Gateway MDR fee basis      |
|                    | • 1P bears 100% unsold inventory risk    |   creates ₹1.92L initial drain.    |   assumed on gross payment.  |
|                    |   and storage obsolescence.              | • Sell-through realistically 80%.  | • Single Karnataka GSTIN     |
|                    | • Requires corporate entity formation.   | • Terminal stock write-down risk.  |   requires pan-India memo.   |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Mandatory Gates**| **Gate G-CA (Chartered Accountant)**     | **Gate G-QA (Textile Testing Lab)**| **Gate G-CA (Statutory CA)** |
| **for Clearance**  | **Gate G-LG (Corporate Legal Counsel)**  | **Gate G-SC (Atelier Auditor)**    | **Gate G-LG (Legal Counsel)**|
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **Downstream**     | Predecessor to 15 decisions (OD-002,     | Predecessor to 11 decisions (OD-003| Predecessor to OD-004, OD-005|
| **Dependencies**   | OD-007, OD-017, OD-004, OD-008, OD-026). | OD-004, OD-005, OD-007, OD-022/27).| OD-006, OD-010, OD-026.      |
+===================================================================================================================================+
| Parameter          | OD-017: Technical Decoupling Gate        | Composite Wave 1 Evaluation Summary                               |
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Canonical Title**| Decoupling Marketplace Multi-Vendor      | Foundational Commercial, Sourcing, Indirect Tax & Technical Gate  |
|                    | Links & Commercial Mode Gate             |                                                                   |
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Current Status** | `PROPOSED (Pending Owner Selection)`     | **ALL 4 DECISIONS RETAIN PROPOSED STATUS**                        |
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Readiness Rating| **PASS WITH CAVEATS**                    | **PASS WITH CAVEATS — READY FOR OWNER DELIBERATION**              |
|                    | (Ready for Owner Deliberation)           |                                                                   |
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Evaluated**      | • Option A: Runtime Gate (COMMERCE_MODE) | 14 Total Alternatives Evaluated Across 4 Operational Domains;     |
| **Alternatives**   | • Option B: Destructive DB Table Purge   | 4 Strategic Recommendations Formulated with Rigorous Caveats.     |
|                    | • Option C: Codebase Forking             |                                                                   |
|                    | • Option D: Complete Freeze & Deferral   |                                                                   |
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Architectural**  | **Option A (Feature Gate for Phase 1)**  | **Cohesive Strategic Pathway:** Option A across all four decisions|
| **Recommendation** | **Option D (Freeze & Defer in Ph 0.5)**  | forms a mutually reinforcing commercial and technical architecture|
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Primary Economic**| Zero incremental infrastructure OpEx;    | Converts fixed manufacturing overhead into variable PO costs;     |
| **Metric Baseline**| 15%–25% faster catalog queries in brand; | maximizes enterprise valuation via 1P gross revenue recognition;  |
|                    | preserves 100% of historical M2-14 tests.| protects working capital via aggressive ITC cash offsets.         |
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Open Commercial**| • Config toggle does not resolve orphan  | • All unit economics depend on unverified supplier quotations.   |
| **Caveats & Gaps** |   order data asymmetry if rolled back.   | • Zero professional validation gates have been formally signed.   |
|                    | • Stock location collision risk.         | • Zero corporate legal entities or GST registrations yet active.  |
|                    | • Prohibits schema alterations in Ph 0.5.| • Implementation stop condition remains 100% binding.             |
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Mandatory Gates**| **Gate G-SC (Enterprise Architect)**     | **All 5 Gates Active: G-CA, G-LG, G-QA, G-LO, G-SC**              |
| **for Clearance**  | **Gate G-LG (Governance Lead)**          |                                                                   |
+--------------------+------------------------------------------+-------------------------------------------------------------------+
| **Downstream**     | Predecessor to OD-016, OD-018, OD-020,   | Foundational baseline unlocking Wave 2, Wave 3, and Wave 4        |
| **Dependencies**   | and all Phase 1 backend engineering.     | deliberation agendas.                                             |
+===================================================================================================================================+
```

---

## 3. Deliberation Action Guide for the Project Owner

To formally ratify Wave 1, the Project Owner should review the four authoritative deliberation dossiers alongside their respective evidence addenda:

1. **Review OD-001 Dossier & Addendum:** Confirm whether ATEEVRA should bear full inventory and operational risk as a pure first-party luxury brand to capture long-term luxury brand equity.
2. **Review OD-002 Dossier & Addendum:** Confirm whether ATEEVRA should contract master ateliers on a Full-Package (FOB) basis, committing ~₹26.5L in peak working capital and establishing a ₹10L cash contingency buffer under OD-027.
3. **Review OD-007 Dossier & Addendum:** Confirm the adoption of direct Section 31 invoicing and authorize CA commissioning (Gate G-CA) for formal Section 52 TCS exemption sign-off.
4. **Review OD-017 Dossier & Addendum:** Confirm the non-breaking runtime feature gate (`COMMERCE_MODE`) architecture for Phase 1 while maintaining an absolute architecture freeze during Phase 0.5.

---

## 4. Master Ratification Form (To Be Completed by Project Owner)

```
+=========================================================================================================+
|                                    ATEEVRA WAVE 1 FORMAL RATIFICATION FORM                              |
|                                                                                                         |
| Current Status: PROPOSED (All Decisions Unselected)                                                     |
+=========================================================================================================+
|                                                                                                         |
| 1. OD-001: Commercial Model & Seller of Record                                                          |
|    [   ] Option A: Pure First-Party D2C Luxury Brand (Direct Seller of Record) — [RECOMMENDED]          |
|    [   ] Option B: Managed Luxury Marketplace (Curated Multi-Vendor Platform)                           |
|    [   ] Option C: Hybrid Concession / Consignment Agency Model                                         |
|                                                                                                         |
| 2. OD-002: Product Sourcing, Atelier Contracting & Private Label Strategy                               |
|    [   ] Option A: Certified Contract Atelier B2B Manufacturing (FOB / Full-Package) — [RECOMMENDED]    |
|    [   ] Option B: Contract CMT (Cut, Make, Trim) Job-Work Manufacturing                                |
|    [   ] Option C: Finished-Product White-Label / Private-Label Sourcing                                |
|    [   ] Option D: Hybrid Strategy (Contract Core + Private-Label Accessories)                          |
|    [   ] Option E: Vertically Owned Manufacturing (Company-Owned Atelier / Factory)                     |
|                                                                                                         |
| 3. OD-007: Statutory Tax Compliance, Section 31 Invoicing & ITC Optimization                            |
|    [   ] Option A: Direct Section 31 Invoicing, Deactivated TCS & Full ITC Offset — [RECOMMENDED]       |
|    [   ] Option B: Retain Marketplace Electronic Commerce Operator (ECO) Tax Engine                     |
|                                                                                                         |
| 4. OD-017: Decoupling Marketplace Multi-Vendor Links & Commercial Mode Gate                             |
|    [   ] Option A: Runtime Feature Gate (COMMERCE_MODE=FIRST_PARTY_BRAND) & Synthetic Tenant — [RECOM.] |
|    [   ] Option B: Destructive Database Migration (Purge Multi-Vendor Tables)                           |
|    [   ] Option C: Codebase Forking (Separate Brand Repository)                                         |
|    [   ] Option D: Complete Architecture Freeze & Deferral to Phase 1                                   |
|                                                                                                         |
|---------------------------------------------------------------------------------------------------------|
| Project Owner Directives, Modifications & Specific Instructions:                                        |
|                                                                                                         |
|                                                                                                         |
|                                                                                                         |
|---------------------------------------------------------------------------------------------------------|
| Project Owner Signature: ____________________________________      Date: ______________________________ |
|                                                                                                         |
| Printed Name:            ____________________________________                                           |
+=========================================================================================================+
```
