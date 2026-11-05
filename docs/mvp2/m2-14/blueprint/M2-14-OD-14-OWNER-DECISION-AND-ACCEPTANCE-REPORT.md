# ATEEVRA Phase M2-14 — OD-14 Master Owner Decision & Acceptance Report
## Merchant Identity Privacy, Personal Data Protection & Customer-Facing Branding Governance

**Document ID:** `ACC-M2-14-OD-14-OWNER-DECISION-REPORT`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-14 (Merchant Identity Privacy & Branding Architecture)  
**Parent Policies:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)  
**Related Decisions:** OD-01 (Commercial Model), OD-02 (Refunds), OD-05 (TCS/TDS), OD-07 (Settlements), OD-08 (Return Window)  
**Governance Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`  
**Execution Mode:** `STRICTLY DOCUMENTATION & POLICY GOVERNANCE ONLY — ZERO IMPLEMENTATION`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Governance Status

This document establishes the official Master Owner Decision & Acceptance Report for **Owner Decision OD-14 (Merchant Identity Privacy & Customer-Facing Branding Policy)**.

The Project Owner has provided clear commercial, operational, and customer-experience directives aimed at protecting merchant proprietors, artisans, and small business owners from public exposure of their personal contact details, while establishing ATEEVRA as the unified, premium customer service and branding layer.

```
========================================================================================================================
GOVERNANCE & APPROVAL STATUS RECORD
========================================================================================================================
Governance Parameter       | Status / Condition                                            | Compliance Verification
---------------------------+---------------------------------------------------------------+------------------------
OD-14 Decision Status      | OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING     | 100% Compliant (Not Approved)
OD-01 Decision Status      | STRICTLY UNAPPROVED — Direction: Merchant as Seller of Record | 100% Compliant
OD-02 Approved Policies    | LOCKED AT VERSION 1.0.0 (POL-OD-02-01 to POL-OD-02-06)       | Zero policy text modified
OD-07 Decision Status      | STRICTLY UNAPPROVED — Settlement Rails Pending Owner Review   | 100% Compliant
Software Implementation    | STRICTLY ZERO — No DB schemas, APIs, migrations, or configs   | 100% Clean codebase
Working Tree Integrity     | PRESERVED — tsconfig.tsbuildinfo untouched, zero git commits  | 100% Compliant
========================================================================================================================
```

---

## 2. Summary of Project Owner Direction Recorded

The Project Owner has explicitly mandated the following eight policy pillars:

1. **Conceal Personal Phone Numbers:** Merchants' personal mobile numbers must be strictly hidden from retail customers across all digital storefronts, checkout screens, order confirmation messages, packing slips, and shipping labels.
2. **Conceal Personal Email Addresses:** Merchants' personal email addresses (e.g. Gmail, Yahoo, personal domains) must be completely suppressed from customer-facing templates and API metadata.
3. **Conceal Residential / Home Addresses:** Private residential premises of micro-proprietors and artisans must be protected from public display; customer-facing screens show only registered commercial city and state.
4. **Preserve Statutory Disclosures:** Display only legally mandated business information regarding the seller of record (registered corporate/business entity name, registered commercial address, and GSTIN).
5. **Centralized ATEEVRA Helpline:** ATEEVRA's central helpline (`{{ATEEVRA_HELPLINE}}`) and support email (`{{ATEEVRA_SUPPORT_EMAIL}}`) serve as the primary customer-facing contact channel.
6. **Unified ATEEVRA Branding:** Customer-facing order confirmations, transaction notifications, packing slips, packaging elements, and digital customer journeys carry prominent ATEEVRA branding.
7. **Anti-Disintermediation:** Prevent unmonitored direct merchant-to-customer contact, off-platform solicitations, and package marketing flyers.
8. **Internal Operational Access:** Complete operational data (including merchant warehouse pickup hubs, dispatch contacts, and banking details) remains accessible internally to authorized ATEEVRA personnel under Role-Based Access Control (RBAC).

---

## 3. Comprehensive Deliverables Inventory

The OD-14 policy suite consists of six authoritative documents established under `docs/mvp2/m2-14/blueprint/`:

```
========================================================================================================================
OD-14 POLICY BLUEPRINT DELIVERABLES INVENTORY
========================================================================================================================
Deliverable & File Name                                   | Core Scope & Architectural Focus                  | Status
----------------------------------------------------------+---------------------------------------------------+---------
1. M2-14-OD-14-MERCHANT-IDENTITY-PRIVACY-ANALYSIS.md      | Deep operational, commercial, and risk analysis   | COMPLETE
2. M2-14-OD-14-CUSTOMER-FACING-BRANDING-POLICY.md         | Official policy rules across 9 customer touchpoints| COMPLETE
3. M2-14-OD-14-LEGAL-DISCLOSURE-AND-COMPLIANCE-MATRIX.md  | Legal compliance matrix across 5 Indian statutes  | COMPLETE
4. M2-14-OD-14-INFORMATION-ACCESS-AND-DISCLOSURE-MATRIX.md| Multi-stakeholder data matrix & internal RBAC     | COMPLETE
5. M2-14-OD-14-IMPLEMENTATION-TRACEABILITY.md             | Medusa subsystem mapping & verification gates     | COMPLETE
6. M2-14-OD-14-OWNER-DECISION-AND-ACCEPTANCE-REPORT.md    | Master decision summary & sign-off acceptance     | COMPLETE
========================================================================================================================
```

---

## 4. Customer-Visible versus Internally Accessible Information

A fundamental achievement of the OD-14 policy architecture is the clean separation between customer-facing disclosures and internally accessible operational data:

```
+-----------------------------------------------------------------------------------------------------------------------+
| DATA VISIBILITY & ACCESS ARCHITECTURE                                                                                 |
+-----------------------------------------------------------------------------------------------------------------------+
| Customer-Visible Information (Storefront & Package)    | Internally Accessible Information (Authorized Ops & 3PL)     |
+--------------------------------------------------------+--------------------------------------------------------------+
| • Merchant Brand / Trade Name                          | • Merchant Proprietor Personal Mobile & Emergency Numbers    |
| • Merchant Registered Legal Entity Name                | • Merchant Proprietor Personal Email Address                 |
| • Merchant Registered Commercial City & State          | • Merchant Residential Premises & Home Studio Floor Details  |
| • Merchant GSTIN & State Code (on Tax Invoices)        | • Merchant Physical Warehouse / Hub Pickup Street Address    |
| • ATEEVRA Central Helpline ({{ATEEVRA_HELPLINE}})      | • Merchant Warehouse Dispatch Manager Contact Phone          |
| • ATEEVRA Support Email ({{ATEEVRA_SUPPORT_EMAIL}})    | • Merchant Settlement Bank Account Number & IFSC Code        |
| • ATEEVRA Grievance Portal & Officer Name              | • Merchant Business PAN, Aadhaar & KYC Verification Files    |
| • ATEEVRA Standardized Packing Slip & Return QR        | • 3PL Carrier Driver Pickup Manifests & Weight Slips         |
+--------------------------------------------------------+--------------------------------------------------------------+
```

---

## 5. Legal Boundaries & Statutory Exceptions

### 5.1. Preservation of Seller of Record (OD-01)
- Under Section 31 of the CGST Act, 2017, the merchant remains the taxable supplier of record.
- **Strict Invariant:** ATEEVRA must **NEVER replace the merchant's statutory supplier block with ATEEVRA's details** on the B2C tax invoice. The invoice correctly identifies the merchant as the seller and ATEEVRA as the marketplace facilitator.

### 5.2. Consumer Protection (E-Commerce) Rules, 2020 Compliance
- **Rule 5(1):** ATEEVRA discloses its own corporate entity, registered office, and customer care details.
- **Rule 5(2):** The customer care requirement for sellers is fulfilled via ATEEVRA's central helpline (`{{ATEEVRA_HELPLINE}}`), acting as the designated customer care agent under the bilateral Merchant MSA.
- **Rule 5(3)(b):** In response to formal written customer dispute requests, ATEEVRA releases registered commercial details (legal entity, registered commercial address, official dispute email, GSTIN) without exposing personal mobile numbers or private home addresses.

### 5.3. DPDP Act, 2023 Compliance
- Merchant personal contact details are classified as personal data of data principals under Section 2(t).
- ATEEVRA enforces reasonable technical and organizational safeguards (Section 8(5)) via API response serializer filtering, admin RBAC masking, and log redactors.

---

## 6. Pre-Implementation Validation Requirements

Before Phase M2-14 technical code or schema changes are authorized by the Project Owner, the following formal professional validations must be executed:

```
========================================================================================================================
MANDATORY PRE-IMPLEMENTATION VALIDATION GATES
========================================================================================================================
Domain / Area        | Required Professional Authority | Key Scope of Written Sign-Off Required                | Status
---------------------+---------------------------------+-------------------------------------------------------+-----------
E-Commerce Law       | Corporate Legal Counsel         | Written legal opinion confirming Rule 5(2) compliance | PENDING
                     | (Indian Bar)                    | via centralized customer care and MSA data mandate.   |
---------------------+---------------------------------+-------------------------------------------------------+-----------
GST & Indirect Tax   | Chartered Accountant (CA)       | Written CA sign-off on B2C tax invoice template       | PENDING
                     |                                 | preserving merchant supplier block under Sec 31 CGST. |
---------------------+---------------------------------+-------------------------------------------------------+-----------
3PL Logistics SLAs   | Logistics Account Lead          | Carrier agreement (Delhivery/Shiprocket) confirming   | PENDING
                     |                                 | shipper phone override with central IVR placeholder.  |
---------------------+---------------------------------+-------------------------------------------------------+-----------
Executive Authority  | Project Owner                   | Formal executive approval of OD-14 policy and         | PENDING
                     |                                 | provisioning of actual helpline/support parameters.   |
========================================================================================================================
```

---

## 7. Governance Conclusion & Stop Statement

1. **OD-14 Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`.
2. **Zero Code Modified:** Zero application code, database migrations, Medusa modules, or APIs have been created or modified.
3. **Execution Freeze:** Work on OD-14 is strictly complete at the documentation, legal reconciliation, and policy architecture level.

> [!IMPORTANT]
> **STOP — STRICT GOVERNANCE HOLD:**  
> The OD-14 policy documentation suite is complete. Owner Decisions **OD-01**, **OD-07**, and **OD-14** remain strictly **UNAPPROVED**, and all commercial parameters remain strictly **UNDECIDED**. Awaiting explicit instructions from the Project Owner.
