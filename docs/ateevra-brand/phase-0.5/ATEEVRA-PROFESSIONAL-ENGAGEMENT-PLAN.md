# ATEEVRA — Professional Specialist Engagement Plan & Terms of Reference

**Document ID:** `ATEEVRA-P05-ENG-001`  
**Classification:** External Specialist Commissioning Briefs & Terms of Reference  
**Phase Status:** ACTIVE COMMISSIONING PLAN (Authorized by Project Owner)  
**Effective Date:** 2026-11-05  
**Governing Mandate:** Phase 0.5 Professional Validation Gateway  
**Implementation Guardrail:** **STRICT STOP CONDITION ACTIVE (Phase 1 Code/DB Prohibited)**  
**Author:** Principal Enterprise Architect, Luxury Brand Strategist & Policy Governance Specialist  

---

## 1. Executive Summary & Commissioning Principles

The ATEEVRA First-Party Luxury Brand architecture mandates external professional validation across five specialized domains before any production code is deployed or physical inventory is purchased. 

Relying on internal architectural assumptions for statutory tax compliance, labor law applicability, textile defect tolerances, or payment gateway accounting introduces unacceptable corporate risk.

This document establishes the **formal Terms of Reference (TOR) and engagement briefs** for:
1. **Gate G-CA:** Statutory Chartered Accountant & Tax Advisory Firm.
2. **Gate G-LG:** Corporate, Commercial & Labour Legal Counsel.
3. **Gate G-QA:** Accredited Textile Testing Laboratory & QC Specialist.
4. **Gate G-LO:** Enterprise Logistics & Supply Chain Specialist.
5. **Gate G-SC:** Cybersecurity & Penetration Testing Firm.

---

## 2. Professional Validation Gate Briefs

```
+---------------------------------------------------------------------------------------------------------+
|                                    PROFESSIONAL VALIDATION GATES SUMMARY                                |
+--------+--------------------------+-------------------------------------+-----------------+-------------+
| Gate   | Specialist Domain        | Primary Validation Focus            | Target Form     | Turnaround  |
+--------+--------------------------+-------------------------------------+-----------------+-------------+
| G-CA   | Chartered Accountancy    | Sec 31 Invoicing, TCS, ITC, Ind AS 2| Opinion Letter  | 7-10 Days   |
| G-LG   | Legal & Regulatory       | Factories Act vs Shops, Metrology   | Legal Memo      | 7-10 Days   |
| G-QA   | Textile Testing Lab      | ISO 2859-1 Sampling, Ozone Safety   | Lab Test Report | 10-14 Days  |
| G-LO   | Logistics Operations     | Carrier SLAs, Delivery OTP Handover | Contract Review | 5-7 Days    |
| G-SC   | Cybersecurity & Auditing | Admin BFF Pen-Test, Dual-Auth Bypass| Cert. Pen Report| 7-10 Days   |
+--------+--------------------------+-------------------------------------+-----------------+-------------+
```

---

### 2.1 Gate G-CA: Statutory Chartered Accountant & Tax Advisory Brief

- **Engagement Title:** First-Party Luxury D2C Fiscal, Tax & Inventory Accounting Validation.
- **Required Qualifications:** Practicing Fellow Chartered Accountant (FCA) / Peer-Reviewed CA Firm with specialized experience in e-commerce retail taxation and Ind AS compliance.
- **Scope of Work:**
  1. **Section 31 Invoicing Opinion:** Validate that ATEEVRA, operating as a 100% first-party direct brand (`COMMERCE_MODE=FIRST_PARTY_BRAND`), issues statutory tax invoices under Section 31 of the CGST Act, 2017, and verify required invoice fields (HSN code, GSTIN, place of supply, tax rate disaggregation).
  2. **Section 52 TCS Inapplicability Confirmation:** Issue a written opinion confirming that Tax Collected at Source (TCS) under Section 52 is **NOT applicable** to direct first-party D2C sales, as ATEEVRA does not operate as an electronic commerce operator collecting consideration on behalf of third-party merchants.
  3. **HSN-Level Input Tax Credit (ITC) Verification:** Audit the ITC claim mechanism across raw fabrics (HSN 5007 / 5111 @ 5%), CMT stitching services (HSN 9988 @ 5%), luxury trims (HSN 9606 @ 18%), and inbound freight (HSN 9965 @ 5%), verifying GSTR-2B reconciliation prerequisites.
  4. **Payment Gateway MDR Accounting:** Confirm accounting ledger treatment disaggregating the 2.0% gateway fee on gross customer payment into net P&L operating expense (EBITDA) and 18% GST input credit asset (GSTR-2B), verifying zero double-counting.
  5. **Ind AS 2 Inventory Valuation:** Review standard absorption costing rules for product Bill of Materials (BOM) under Ind AS 2 (FIFO method), confirming capitalization of direct landed costs and treatment of warehousing/fulfillment as period OpEx.
- **Target Deliverable:** Signed **Statutory Tax & Accounting Opinion Letter** addressed to the Board of Directors of ATEEVRA.

---

### 2.2 Gate G-LG: Corporate, Commercial & Labour Legal Counsel Brief

- **Engagement Title:** E-Commerce Regulatory, Labour Jurisprudence & Commercial Contracts Validation.
- **Required Qualifications:** Licensed Advocate / Corporate Law Firm enrolled with the Bar Council of Karnataka, with demonstrable practice in Indian labour law, Legal Metrology, and data protection.
- **Scope of Work:**
  1. **Warehouse Regulatory Classification:** Issue an authoritative legal opinion determining whether the 8,500 sq ft fulfillment facility (WH01) in Bengaluru conducting garment steaming, packing, and ozone sanitation legally constitutes a **"factory"** under Section 2(m)/2(k) of The Factories Act, 1948 (triggering factory licensing, chief inspectorate approvals, and Chapter III health provisions) or is governed under the **Karnataka Shops and Commercial Establishments Act, 1961**.
  2. **Legal Metrology PDP Compliance:** Audit storefront product detail page (PDP) specification layouts against the **Legal Metrology (Packaged Commodities) Rules, 2011**, verifying statutory placement of manufacturer name/address, country of origin, net quantity, dimensions, consumer care contact, and MRP inclusive of all taxes.
  3. **Terms of Sale & Return Contract:** Draft and validate legally binding customer **Terms of Sale**, return/exchange conditions (7-day window, ₹250 restocking deduction for pure refunds, ₹0 for exchanges), and carrier delivery handover clauses.
  4. **DPDP Act 2023 Consent Architecture:** Review customer consent capture, privacy notices, data principal right-to-erasure mechanisms, and administrative PII masking protocols against the **Digital Personal Data Protection Act, 2023**.
- **Target Deliverable:** Formal **Corporate, Labour & Regulatory Compliance Memorandum**.

---

### 2.3 Gate G-QA: Accredited Textile Testing Laboratory Brief

- **Engagement Title:** Textile Quality Assurance Protocol & Ozone Sanitization Safety Certification.
- **Required Qualifications:** NABL-accredited / ISO/IEC 17025 certified commercial textile testing laboratory (e.g., SGS India, Intertek, Bureau Veritas, or TÜV SÜD).
- **Scope of Work:**
  1. **ISO 2859-1 Sampling Protocol Review:** Formally evaluate and validate the proposed **ISO 2859-1:1999 Table 1 & Table 2-A Single Normal Sampling Plan** for lot size 281–500 units (Sample Size 50, Code Letter H, Critical Ac 0/Re 1, Major Ac 3/Re 4, Minor Ac 5/Re 6). Confirm standard edition, atmospheric conditioning parameters, and defect severity rubrics.
  2. **Visual Defect Catalog Audit:** Validate defect classifications across apparel categories (lapel puckering, seam slippage $> 3\text{ mm}$, color shading variance, loose threads $> 5\text{ mm}$, dimensional drift $> 1.5\text{ cm}$).
  3. **Ozone Sanitation Fabric Compatibility Testing:** Conduct rigorous laboratory exposure testing on representative luxury fabric swatches:
     - 100% Mulberry Silk (16mm & 19mm Charmeuse).
     - 100% Superfine Merino Wool (Super 120s & 140s).
     - Cupro Bemberg Lining (100% regenerated cellulose).
     - Electroplated Brass Buttons and Metal Zippers.
     - *Testing Procedure:* Expose swatches to repeated 15-minute ozone cycles at 5–10 ppm concentration; test for colorfastness to light/rubbing (ISO 105), tensile strength degradation (ASTM D5034), and metal hardware oxidation/tarnish.
- **Target Deliverable:** Certified **QA Inspection Protocol Sign-Off** and **Ozone Textile Compatibility Laboratory Test Report**.

---

### 2.4 Gate G-LO: Enterprise Logistics & Supply Chain Specialist Brief

- **Engagement Title:** Priority Air Express Logistics Contract & OTP Security Verification.
- **Required Qualifications:** Enterprise Supply Chain Consultant / Logistics Operations Lead with experience integrating premium express freight carriers in India.
- **Scope of Work:**
  1. **Enterprise SLA Contract Review:** Review negotiated commercial rate cards and Service Level Agreements with primary priority air carriers (**Blue Dart Apex** and **Delhivery Air**), validating 24–48h delivery commitments across Tier-1 metros.
  2. **Delivery OTP Handover Protocol:** Review carrier webhook API integration specifications for mandatory customer delivery OTP handovers, ensuring packages cannot be marked delivered without customer authorization.
  3. **High-Value Transit Liability & Insurance:** Audit carrier risk terms, proof-of-delivery (POD) dispute windows, maximum liability coverage per package, and transit insurance claims procedures for shipments valued up to ₹50,000.
- **Target Deliverable:** Signed **Logistics SLA & Risk Mitigation Sign-Off Memorandum**.

---

### 2.5 Gate G-SC: Independent Application Security & Penetration Testing Brief

- **Engagement Title:** Headless Commerce Engine & Admin BFF Security Assessment.
- **Required Qualifications:** CERT-In Empaneled / CREST-Certified independent application security auditing firm.
- **Scope of Work:**
  1. **Medusa & Admin BFF Penetration Testing:** Perform gray-box penetration testing on the Medusa v2.19 administrative endpoints, Strapi v5 CMS endpoints, and Next.js 14 API routes.
  2. **Hardware TOTP MFA Enforcement:** Verify that internal administrative logins strictly enforce TOTP multi-factor authentication, testing for session hijacking, token replay, and brute-force vulnerabilities.
  3. **Dual-Authorization Bypass Testing:** Perform targeted API-level tampering to confirm that high-value financial actions ($> ₹5,000$ refunds, manual credit disbursements) **cannot be executed unilaterally** by a single actor (including Super Admin) via modified payloads, race conditions, or parameter tampering.
- **Target Deliverable:** Certified **Application Security Assessment & Penetration Test Report**.

---

## 3. Commissioning Roadmap & Governance Tracking

```
+---------------------------------------------------------------------------------------------------------+
|                                  PROFESSIONAL COMMISSIONING ROADMAP                                     |
+--------------------------+------------------------------------------------------------------------------+
| Milestone / Date         | Operational Commissioning Step                                               |
+--------------------------+------------------------------------------------------------------------------+
| Day 1 (Sprint 0.5A)      | Dispatch formal RFPs and Terms of Reference to shortlisted specialist firms. |
| Day 3 (Sprint 0.5A)      | Receive proposals, finalize fee engagements, and execute Non-Disclosure Agrmts.|
| Day 4 (Sprint 0.5A)      | Dispatch fabric swatches and hardware samples to accredited textile testing lab.|
| Day 7 (Sprint 0.5A)      | Provide architecture blueprints and staging credentials to security auditor. |
| Day 10 (Sprint 0.5B)     | Ingest draft opinions from CA (Gate G-CA) and Legal Counsel (Gate G-LG).    |
| Day 12 (Sprint 0.5B)     | Ingest textile laboratory test certificate (Gate G-QA) and Logistics SLA.   |
| Day 14 (Sprint 0.5B)     | Ingest final penetration test report (Gate G-SC) and present to Owner.       |
+--------------------------+------------------------------------------------------------------------------+
```

- **Governance Mandate:** All five professional validation deliverables must be received, reviewed, and logged in [`ATEEVRA-PHASE-0.5-STATUS-REGISTER.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-PHASE-0.5-STATUS-REGISTER.md) prior to requesting Project Owner authorization for Phase 1 entry.

---
*End of Document `ATEEVRA-P05-ENG-001`. Formally Established for Professional Specialist Commissioning.*
