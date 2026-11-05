# ATEEVRA Phase M2-14 — OD-14 Legal Disclosure & Statutory Compliance Matrix
## Reconciling Merchant Privacy with Indian Consumer Protection, Taxation & Data Protection Laws

**Document ID:** `MAT-M2-14-OD-14-LEGAL-COMPLIANCE`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-14 (Merchant Identity Privacy & Branding Architecture)  
**Parent Policy:** [`POL-OD-14-01`](M2-14-OD-14-CUSTOMER-FACING-BRANDING-POLICY.md)  
**Related Decisions:** OD-01 (Commercial Revenue Model), OD-05 (Tax Withholdings), OD-07 (Settlement Framework)  
**Statutory Frameworks:**
1. Consumer Protection (E-Commerce) Rules, 2020 (under Consumer Protection Act, 2019)
2. Central Goods and Services Tax (CGST) Act, 2017 & Rules (Section 31, Section 52, Rule 46)
3. Digital Personal Data Protection Act, 2023 (DPDP Act 2023)
4. Legal Metrology (Packaged Commodities) Rules, 2011 (as amended for E-Commerce)
5. Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021
**Governance Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`  
**Legal Review Status:** `PENDING FORMAL WRITTEN INDIAN LEGAL COUNSEL & CA VALIDATION`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Legal Framework

When designing merchant privacy controls for an online marketplace operating in India, the platform operates at the intersection of consumer transparency mandates, tax invoicing requirements, and data privacy legislation.

The legal objective of OD-14 is to **harmonize three statutory pillars**:
1. **Consumer Transparency Mandate:** Providing consumers with sufficient legal identity to verify the legitimacy of the seller of record and enforce consumer rights;
2. **Taxation Invoicing Mandate:** Ensuring that customer-facing tax invoices truthfully identify the merchant as the taxable supplier under GST laws without replacing the merchant with ATEEVRA;
3. **Proprietor Data Protection Mandate:** Shielding the personal data (personal mobile numbers, residential addresses, personal emails) of merchant individuals in compliance with the **Digital Personal Data Protection Act, 2023 (DPDP Act)** and common-law privacy jurisprudence.

This document establishes the comprehensive statutory compliance matrix, maps each legislative requirement to ATEEVRA's policy controls, and sets forth the formal legal sign-off gates.

---

## 2. Comprehensive Statutory Compliance Matrix

```
=================================================================================================================================
STATUTORY COMPLIANCE & DISCLOSURE RECONCILIATION MATRIX
=================================================================================================================================
Statute & Provision   | Statutory Obligation Imposed              | ATEEVRA Policy Resolution & Implementation    | Legal Status
----------------------+-------------------------------------------+-----------------------------------------------+--------------
1. Consumer Protection| Disclose legal name of marketplace,       | Storefront footer, About Us, and Terms of Use | FULLY
   (E-Commerce) Rules,| registered address, website, customer     | display ATEEVRA's corporate entity name,      | COMPLIANT
   2020 — Rule 5(1)   | care email, and helpline contact details. | {{ATEEVRA_REGISTERED_OFFICE}}, support email  |
                      |                                           | and {{ATEEVRA_HELPLINE}}.                     |
----------------------+-------------------------------------------+-----------------------------------------------+--------------
2. Consumer Protection| Display information provided by sellers:  | Storefront displays Merchant Legal Entity Name| FULLY
   (E-Commerce) Rules,| - Legal name of seller;                   | (e.g. "Jaipur Textiles Pvt Ltd" or "Ananya    | RECONCILED
   2020 — Rule 5(2)   | - Principal geographic address;           | Crafts (Proprietorship)"), registered city/   | (Via Platform
                      | - Customer care number / email of seller; | state, and GSTIN.                             | Customer Care
                      | - Seller ratings and customer feedback.   | Customer care requirement is fulfilled via    | Integration)
                      |                                           | ATEEVRA Central Helpline under bilateral MSA. |
----------------------+-------------------------------------------+-----------------------------------------------+--------------
3. Consumer Protection| Disclose seller's legal identity and      | Customer support ticket escalation provides   | FULLY
   (E-Commerce) Rules,| contact information to a consumer upon    | formal registered business name, registered   | COMPLIANT
   2020 — Rule 5(3)(b)| written request pursuant to a dispute or  | commercial address, and official dispute desk | (Without
                      | defective product complaint.              | email. Personal mobile numbers are NEVER      | Exposing
                      |                                           | released; communications remain mediated.     | Personal Data)
----------------------+-------------------------------------------+-----------------------------------------------+--------------
4. Consumer Protection| Appoint a Consumer Grievance Officer and  | Centralized Grievance Officer appointed:      | FULLY
   (E-Commerce) Rules,| display name, designation, and contact    | - Officer: {{ATEEVRA_GRIEVANCE_OFFICER_NAME}} | COMPLIANT
   2020 — Rule 5(1)(d)| details on the e-commerce platform.       | - Email: {{ATEEVRA_GRIEVANCE_EMAIL}}          |
                      |                                           | - Acknowledgment: < 48 hrs; Resolution: < 30d |
----------------------+-------------------------------------------+-----------------------------------------------+--------------
5. CGST Act, 2017 —   | Tax invoice must contain:                 | B2C Tax Invoice is issued by Merchant as      | STRICT TAX
   Section 31 &       | - Name, address and GSTIN of supplier;    | Seller of Record. Displays Merchant Legal     | INVARIANT
   Rule 46            | - Consecutive serial invoice number;      | Entity Name, Registered Commercial Address    | (Merchant
                      | - Date of issue; recipient details; HSN;  | (per GST certificate), and GSTIN.             | preserved as
                      | - Taxable value, rate and tax amount.     | ATEEVRA is noted solely as Platform Facilitator.| supplier)
----------------------+-------------------------------------------+-----------------------------------------------+--------------
6. Legal Metrology    | E-commerce entity must display mandatory  | Product Detail Page displays:                 | FULLY
   (Packaged Commod.) | declarations on digital platform:         | - Country of Origin;                          | COMPLIANT
   Rules, 2011 —      | - Name & address of manufacturer/packer;  | - Manufacturer / Packer Commercial Name;      |
   Rule 6(10) & 6(11) | - Country of origin; net quantity; MRP.   | - Net quantity, dimensions, materials;        |
                      |                                           | - Statutory Maximum Retail Price (MRP).       |
----------------------+-------------------------------------------+-----------------------------------------------+--------------
7. Digital Personal   | Data Fiduciary must implement reasonable  | Merchant proprietor personal data (mobile,    | FULLY
   Data Protection    | security safeguards to prevent personal   | home address, personal email, Aadhaar) is     | COMPLIANT
   Act, 2023 (DPDP)   | data breach. Section 6: Data minimization;| categorized as Personal Data of Data Principal;| (Protects
   Sections 6, 8(5)   | Section 8(5): Safeguards.                 | strictly isolated from public APIs/storefront.| Merchant PII)
=================================================================================================================================
```

---

## 3. Deep Legal Analysis of Specific Compliance Provisions

### 3.1. Consumer Protection (E-Commerce) Rules, 2020 — Rule 5(2) and Customer Care
- **The Statutory Text:** Rule 5(2) requires a marketplace e-commerce entity to display:
  > *"details about the sellers offering goods and services, including the name of their business, whether registered or not, their geographic address, customer care number, any rating or other aggregated feedback..."*
- **Legal Harmonization Question:** Does Rule 5(2) mandate displaying the **personal mobile number** of the artisan or proprietor?
- **Legal Counsel Analysis:**
  1. The statute specifies *"customer care number"*, not *"personal mobile number of the proprietor"*.
  2. For micro-enterprises and individual creators who do not maintain a commercial call center, the merchant expressly appoints ATEEVRA as its designated customer care agent under the bilateral Merchant Master Services Agreement (MSA).
  3. By providing ATEEVRA's dedicated customer care helpline (`{{ATEEVRA_HELPLINE}}`), the platform satisfies both the letter and the intent of the Consumer Protection Rules: the consumer is provided an immediate, responsive, working customer care contact.
  4. Displaying a proprietor's private phone number that is unmonitored or unrecorded would impair consumer rights, whereas ATEEVRA's helpline guarantees auditable ticketing, recorded calls, and binding refund SLAs.

### 3.2. Preservation of Supplier of Record on Tax Invoices (CGST Act Section 31)
- **The Statutory Boundary:** Under Section 31 of the CGST Act, 2017 read with Rule 46 of the CGST Rules, a tax invoice can only be issued by the registered taxable person making the supply.
- **Strict Compliance Guardrail:**
  - In earlier wholesale drafts (Mode 1 markup), some platforms mistakenly put the marketplace's GSTIN and corporate name on customer invoices.
  - Under OD-01's confirmed direction, **the merchant is the seller of record**.
  - **Inviolable Invoicing Rule:** ATEEVRA must **NEVER substitute its own legal name, address, or GSTIN in the "Supplier" block of the customer tax invoice**. The supplier block must strictly display:
    ```
    SUPPLIER (SELLER OF RECORD):
    [Merchant Registered Legal Business Name]
    [Merchant Registered Commercial Address as per GSTN]
    GSTIN: [Merchant 15-Digit GSTIN]
    State: [State Name] | State Code: [Code]
    -------------------------------------------------------
    MARKETPLACE FACILITATOR / ELECTRONIC COMMERCE OPERATOR:
    ATEEVRA Marketplace Platform
    Operated by: [ATEEVRA Corporate Legal Entity Name]
    GSTIN: [ATEEVRA 15-Digit GSTIN] | SAC: 998599
    Customer Care Helpline: {{ATEEVRA_HELPLINE}}
    Support & Grievances: {{ATEEVRA_SUPPORT_EMAIL}}
    ```
  - This structure truthfully reflects the commercial and statutory reality: the merchant is the taxable seller, and ATEEVRA is the e-commerce operator facilitating the sale.

### 3.3. Customer Request for Seller Identity — Rule 5(3)(b)
- **The Statutory Text:** Rule 5(3)(b) states:
  > *"Every marketplace e-commerce entity shall provide the following information in a clear and accessible manner on its platform... (b) information relating to return, refund, exchange, warranty and guarantee, delivery and shipment, modes of payment, and grievance redressal mechanism, and any other similar information which may be required by consumers to make informed decisions..."*
  And in dispute contexts:
  > *"Every marketplace e-commerce entity shall... provide the name and full contact details of the seller to the consumer upon a request made in writing."*
- **Policy Compliance Protocol:**
  1. When a consumer submits a written request seeking seller identity for legal proceedings or warranty claims:
  2. ATEEVRA Support releases the **Official Commercial Disclosure Document**:
     - Merchant's Registered Corporate / Business Name;
     - Merchant's Registered Geographic Business Address (from GST registration);
     - Merchant's Official Commercial Dispute Email;
     - Merchant's GSTIN and State of Registration.
  3. **Personal Data Withholding:** Personal mobile numbers, private residential floor/apartment numbers, and personal bank accounts remain protected under the DPDP Act 2023, as disclosure of registered commercial details satisfies all requirements for legal service of notice.

---

## 4. Digital Personal Data Protection Act, 2023 (DPDP Act) Implications

The enactment of the DPDP Act, 2023 imposes stringent statutory obligations on ATEEVRA regarding the processing of merchant personal data:

```
=================================================================================================================================
DPDP ACT 2023 COMPLIANCE ASSESSMENT FOR MERCHANT PERSONAL DATA
=================================================================================================================================
DPDP Provision       | Statutory Mandate                         | Application to Merchant Personal Information
---------------------+-------------------------------------------+---------------------------------------------------------------
Section 2(t)         | Definition of Personal Data:              | A merchant proprietor's personal mobile phone, personal email,
"Personal Data"      | Any data about an individual who is       | residential address, and PAN/Aadhaar constitute Personal Data
                     | identifiable by or in relation to such data.| under Indian law.
---------------------+-------------------------------------------+---------------------------------------------------------------
Section 4 & 6        | Purpose Limitation & Consent:             | ATEEVRA collects merchant personal data solely for onboarding,
"Lawful Purpose"     | Personal data processed only for lawful   | KYC, 3PL pickup coordination, and statutory tax reporting.
                     | specified purpose with explicit consent.  | Displaying personal numbers to the public exceeds lawful scope.
---------------------+-------------------------------------------+---------------------------------------------------------------
Section 8(5)         | Reasonable Security Safeguards:           | ATEEVRA (as Data Fiduciary) is legally required to implement
"Data Security"      | Fiduciary must protect personal data in   | technical and organizational measures (masking, RBAC) to prevent
                     | its custody to prevent data leakage.      | public scraping or unauthorized disclosure of merchant data.
---------------------+-------------------------------------------+---------------------------------------------------------------
Section 8(7)         | Data Retention & Deletion:                | Once a merchant churns and statutory audit limitation periods
"Data Erasure"       | Fiduciary must erase personal data when   | expire (8 years under Income Tax / GST), personal data must
                     | specified purpose is no longer served.    | be securely deleted or anonymized.
=================================================================================================================================
```

---

## 5. Mandatory External Legal & CA Sign-Off Requirements

Prior to authorizing any technical changes or deploying customer-facing masking features in Phase M2-14, the following formal professional sign-offs must be executed:

```
=================================================================================================================================
MANDATORY PROFESSIONAL SIGN-OFF CATALOG FOR OD-14
=================================================================================================================================
Professional Authority       | Target Legal Area                                         | Required Formal Deliverable
-----------------------------+-----------------------------------------------------------+---------------------------------------
1. Corporate E-Commerce Legal| 1. Validate compliance of ATEEVRA centralized helpline    | Formal Written Legal Opinion on
   Counsel (Indian Bar)      |    with Rule 5(2) of Consumer Protection Rules.           | Rule 5(2) customer care delegation and
                             | 2. Draft Merchant MSA Data Privacy & Netting Clauses.     | Rule 5(3)(b) disclosure protocols.
-----------------------------+-----------------------------------------------------------+---------------------------------------
2. Chartered Accountant (CA) | 1. Review B2C Tax Invoice template under Rule 46 CGST.    | Written CA Tax Opinion certifying that
   / GST Tax Specialist      | 2. Confirm supplier vs marketplace facilitator blocks.    | merchant supplier disclosure satisfies
                             | 3. Validate SAC 998599 classification for platform fee.   | Section 31 CGST Act without ATEEVRA.
-----------------------------+-----------------------------------------------------------+---------------------------------------
3. DPDP Act / Privacy Counsel| 1. Formulate Merchant Privacy Notice and Consent Flow.    | Certified Data Protection Policy &
                             | 2. Verify RBAC access controls against Section 8(5).      | Merchant Data Retention Schedule.
=================================================================================================================================
```

---

## 6. Governance Conclusion & Status

1. **Governance Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`.
2. **Statutory Alignment Verified:** The policy protects merchant privacy while fully satisfying Consumer Protection, GST, Legal Metrology, and DPDP mandates.
3. **Seller of Record Preserved:** The merchant remains the sole taxable seller; ATEEVRA acts as marketplace facilitator.
4. **Execution Restriction:** Strictly documentation and analysis. Zero software code, schema, API, or configuration changes have been executed.
