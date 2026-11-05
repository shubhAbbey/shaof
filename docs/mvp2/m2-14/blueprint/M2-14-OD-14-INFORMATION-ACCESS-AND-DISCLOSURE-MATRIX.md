# ATEEVRA Phase M2-14 — OD-14 Information Access, Disclosure & RBAC Security Matrix
## Multi-Stakeholder Data Exposure Controls, Logistics Masking & Role-Based Access Governance

**Document ID:** `MAT-M2-14-OD-14-INFORMATION-ACCESS`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-14 (Merchant Identity Privacy & Branding Architecture)  
**Parent Policy:** [`POL-OD-14-01`](M2-14-OD-14-CUSTOMER-FACING-BRANDING-POLICY.md)  
**Related Documents:** [`ANA-M2-14-OD-14-MERCHANT-PRIVACY`](M2-14-OD-14-MERCHANT-IDENTITY-PRIVACY-ANALYSIS.md) & [`MAT-M2-14-OD-14-LEGAL-COMPLIANCE`](M2-14-OD-14-LEGAL-DISCLOSURE-AND-COMPLIANCE-MATRIX.md)  
**Governance Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`  
**Execution Restriction:** `STRICTLY ARCHITECTURAL SPECIFICATION & GOVERNANCE ONLY — ZERO IMPLEMENTATION`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Purpose

In a multi-vendor marketplace, merchant data is shared across multiple stakeholders: retail customers, third-party logistics (3PL) carriers, payment aggregators, statutory tax portals, customer service representatives, warehouse fulfillment staff, and internal administrators.

A critical security vulnerability occurs when data shared for one purpose (e.g. providing a merchant's warehouse contact to a 3PL driver for parcel pickup) automatically bleeds into another touchpoint (e.g. printing the merchant's personal mobile on the package shipping label visible to the customer).

The purpose of this document is to establish a rigorous, granular **Information Access & Disclosure Matrix** that:
1. Segregates customer-visible information from partner-visible and internally accessible operational data;
2. Defines specialized privacy controls for physical shipping labels, return labels, and packaging inserts;
3. Establishes a comprehensive **Role-Based Access Control (RBAC)** model for merchant personal information;
4. Outlines data protection safeguards covering API serializers, application log redaction, audit logging, and data retention under the Digital Personal Data Protection Act, 2023 (DPDP Act).

---

## 2. Master Stakeholder Information Disclosure Matrix

The schedule below details the permissible visibility of 14 core merchant data attributes across five stakeholder categories:
1. **Retail Customer (Storefront & Package):** Public buyer browsing, purchasing, or receiving delivery;
2. **3PL Logistics Partners (Delhivery / Shiprocket / Bluedart):** Carriers executing forward pickup, line-haul, and doorstep delivery;
3. **Payment Aggregators / Banking Partners (Razorpay / Cashfree):** Nodal account operators processing settlement payouts;
4. **Statutory Tax & Regulatory Authorities (GSTN / Income Tax):** Government bodies receiving e-commerce filings;
5. **Internal ATEEVRA Operations Personnel:** Tier-1 Customer Support, Operations, Finance, and Super Admins.

```
=================================================================================================================================
MASTER STAKEHOLDER DATA DISCLOSURE MATRIX
=================================================================================================================================
Merchant Data Attribute        | Retail Customer   | 3PL Logistics    | Payment Gateway  | Statutory Govt   | Internal ATEEVRA
                               | (Store & Package) | Carrier (Pickup) | Aggregator (KYC) | Authorities (Tax)| Operations (RBAC)
-------------------------------+-------------------+------------------+------------------+------------------+--------------------
1. Brand / Trade Name          | VISIBLE           | VISIBLE          | VISIBLE          | VISIBLE          | VISIBLE
2. Legal Registered Entity Name| VISIBLE (PDP/Inv) | VISIBLE (Manifest| VISIBLE (KYC)    | VISIBLE (GSTR-8) | VISIBLE
3. Registered Commercial Addr. | VISIBLE (Invoice) | VISIBLE          | VISIBLE          | VISIBLE          | VISIBLE
4. Warehouse / Pickup Hub Addr.| MASKED / HIDDEN   | VISIBLE (Pickup) | NOT APPLICABLE   | NOT APPLICABLE   | VISIBLE
5. Proprietor Residential Addr.| STRICTLY HIDDEN   | STRICTLY HIDDEN  | VISIBLE (KYC)    | VISIBLE (Direct) | MASKED (Admin Only)
6. Business Support Email      | MASKED (ATEEVRA)  | NOT APPLICABLE   | VISIBLE          | VISIBLE          | VISIBLE
7. Proprietor Personal Email   | STRICTLY HIDDEN   | STRICTLY HIDDEN  | VISIBLE (KYC)    | VISIBLE          | MASKED (Admin Only)
8. Business Customer Care Phone| MASKED (ATEEVRA)  | NOT APPLICABLE   | VISIBLE          | VISIBLE          | VISIBLE
9. Proprietor Personal Mobile  | STRICTLY HIDDEN   | MASKED (IVR)*    | VISIBLE (KYC)    | VISIBLE          | MASKED (Tier-2/Admin)
10. Warehouse Dispatch Contact | STRICTLY HIDDEN   | VISIBLE (Driver) | NOT APPLICABLE   | NOT APPLICABLE   | VISIBLE (Ops Only)
11. Merchant GSTIN & State Code| VISIBLE (Invoice) | VISIBLE (E-Way)  | VISIBLE          | VISIBLE          | VISIBLE
12. Merchant Business PAN      | MASKED (On Invc)  | NOT APPLICABLE   | VISIBLE          | VISIBLE (26Q)    | VISIBLE (Finance)
13. Proprietor Personal Aadhaar| STRICTLY HIDDEN   | STRICTLY HIDDEN  | VISIBLE (KYC)    | NOT APPLICABLE   | RESTRICTED (Compliance)
14. Settlement Bank A/C & IFSC | STRICTLY HIDDEN   | STRICTLY HIDDEN  | VISIBLE (Payout) | VISIBLE          | RESTRICTED (Finance)
=================================================================================================================================
```
*\*Note on Attribute 9 (3PL Courier Access):* While the 3PL dispatch driver requires a contact number to coordinate parcel pickup at the merchant's warehouse, the customer-facing package shipping label must **NEVER** print this number. It is transmitted solely via encrypted digital API for driver dispatch coordination.

---

## 3. Specialized Logistics Document Privacy Assessment

Logistics documents represent the highest risk vector for accidental merchant data leakage. Shipping labels, return labels, and packaging inserts must be assessed and governed separately:

```
                  ┌─────────────────────────────────────────────────────────┐
                  │          LOGISTICS DOCUMENT PRIVACY ARCHITECTURE        │
                  └───────────────────────────┬─────────────────────────────┘
                                              │
         ┌────────────────────────────────────┼────────────────────────────────────┐
         ▼                                    ▼                                    ▼
┌─────────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────────────┐
│    3PL SHIPPING LABEL       │  │     RETURN SHIPPING LABEL   │  │       PACKAGING INSERT      │
├─────────────────────────────┤  ├─────────────────────────────┤  ├─────────────────────────────┤
│ • Shipper: [Merchant Name]  │  │ • Consignee: ATEEVRA Return │  │ • Standard ATEEVRA Slip     │
│   c/o ATEEVRA Hub           │  │   Processing Facility       │  │ • Order Item details        │
│ • Routing Code displayed    │  │ • Virtual Return Hub ID     │  │ • ATEEVRA Return QR Code    │
│ • Phone: Logistics IVR      │  │ • Phone: Logistics IVR      │  │ • Helpline & Support Email  │
│ • ZERO Personal Mobile      │  │ • ZERO Home Address         │  │ • ZERO Merchant Flyers      │
│ • ZERO Home Address         │  │ • ZERO Personal Contact     │  │ • ZERO Direct Contacts      │
└─────────────────────────────┘  └─────────────────────────────┘  └─────────────────────────────┘
```

### 3.1. Forward Shipping Labels (3PL Thermal Labels on Outer Box)
- **Vulnerability:** Standard carrier APIs default to printing the merchant's master onboarding contact number as the "Shipper Phone Number" on the package label.
- **Mandatory Policy Rule:**
  - The customer-facing shipping label must display the Shipper as:  
    $$\mathbf{\text{Shipper: } [\text{Merchant Registered Trade Name}] \text{ c/o ATEEVRA Logistics Hub, } [\text{Hub Routing Code}]}$$
  - The Shipper Phone Number must be populated with ATEEVRA's central logistics IVR placeholder:  
    $$\mathbf{\text{Shipper Contact: } \{\{\text{ATEEVRA\_LOGISTICS\_IVR}\}\}}$$
  - The merchant's actual warehouse address is converted into a regional logistics routing code (e.g. `RJ-JPR-HUB01`), preventing retail customers from identifying residential premises.

### 3.2. Reverse Logistics Return Labels
- **Vulnerability:** When a customer initiates a return under [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md), generating an Airway Bill (AWB) directly to the seller's home creates a direct privacy breach.
- **Mandatory Policy Rule:**
  - Return shipments must be consigned to a **Centralized ATEEVRA Return Consolidation Center** or an authorized regional 3PL warehouse hub.
  - The return label consignee must read:  
    $$\mathbf{\text{Consignee: ATEEVRA Return Processing Center, [Regional Logistics Code]}}$$
  - Only after consolidated batch intake and physical inspection by ATEEVRA Operations are parcels routed back to the merchant's warehouse, keeping customer return documentation completely sterile of private addresses.

### 3.3. Physical Packaging Inserts & Packing Slips
- **Mandatory Policy Rule:**
  - Merchants must print and include **only the standardized ATEEVRA Marketplace Packing Slip** generated from the Merchant Portal.
  - The packing slip carries ATEEVRA branding, order line items, care instructions, and centralized customer support contacts (`{{ATEEVRA_HELPLINE}}`).
  - **Strict Contractual Prohibition:** Merchants are contractually barred from inserting personal business cards, personal WhatsApp QR codes, external discount flyers, or direct contact solicitations.

---

## 4. Internal Role-Based Access Control (RBAC) Specification

Access to merchant personal information within ATEEVRA internal systems (Medusa Admin, Database, API endpoints, Customer Support ticketing) must follow strict Role-Based Access Control (RBAC):

```
=================================================================================================================================
INTERNAL ROLE-BASED ACCESS CONTROL (RBAC) MATRIX
=================================================================================================================================
System Role                    | Target Operational Scope                | Personal Mobile & Email | Residential & Bank Details
-------------------------------+-----------------------------------------+-------------------------+-----------------------------
1. Tier-1 Customer Support     | Order tracking, standard customer care  | STRICTLY MASKED         | STRICTLY MASKED
   Representative              | and customer-facing ticket resolution.  | (Zero access)           | (Zero access)
-------------------------------+-----------------------------------------+-------------------------+-----------------------------
2. Tier-2 Dispute & Escalations| Adjudicating transit damage claims,     | PARTIALLY MASKED        | MASKED
   Officer                     | packaging violations, carrier disputes. | (Last 4 digits only)    | (City/State level only)
-------------------------------+-----------------------------------------+-------------------------+-----------------------------
3. Merchant Onboarding &       | Verifying merchant KYC, GSTIN, PAN,     | FULL ACCESS             | FULL ACCESS
   Compliance Officer          | and business registration certificates. | (Audited access)        | (Audited access)
-------------------------------+-----------------------------------------+-------------------------+-----------------------------
4. 3PL Logistics Operations    | Dispatching carrier pickups, resolving  | FULL ACCESS             | WAREHOUSE ONLY
   Lead                        | failed pickup scans, weight disputes.   | (Warehouse contact only)| (Residential masked)
-------------------------------+-----------------------------------------+-------------------------+-----------------------------
5. Finance & Settlement        | Processing merchant payout batches,     | MASKED                  | BANK A/C FULL ACCESS
   Manager                     | Form 26Q TDS and GSTR-8 TCS filings.    | (Email only)            | (Encrypted access)
-------------------------------+-----------------------------------------+-------------------------+-----------------------------
6. Super Administrator         | System configuration, security audits,  | FULL ACCESS             | FULL ACCESS
   (Executive / CTO)           | platform master data management.        | (Strict audit logging)  | (Strict audit logging)
=================================================================================================================================
```

---

## 5. Technical Data Protection & Leakage Prevention Architecture

*(Strictly architectural specification for future implementation — zero code modified during this task)*

```
[Storefront Public API Request] ──► [Serializer & Field Masker] ──► [Sanitized JSON Response (Zero PII)]
                                            │
                                            ▼
                               [Winston / Pino Logger] ──► [Regex Redaction Filter: Mobile/PAN/Aadhaar]
                                            │
                                            ▼
                               [Medusa Admin UI Layer] ──► [RBAC Masking: +91 98XXX X1234]
                                            │
                                            ▼
                               [PostgreSQL Database]   ──► [Encrypted Columns: pgcrypto for Bank/ID]
```

### 5.1. Storefront API Serializer Masking
- Public Storefront REST and GraphQL APIs (e.g. `/store/products`, `/store/orders/{id}`) must enforce strict response serialization.
- Database columns containing `merchant.personal_phone`, `merchant.personal_email`, `merchant.residential_address`, and `merchant.bank_account` must be explicitly excluded from public serializers at the data access layer.

### 5.2. Application Log Sanitization (Zero PII in Logs)
- Centralized server loggers (Winston, Pino) must include pre-write sanitization interceptors.
- All HTTP request payloads, database query traces, and error stack dumps must automatically redact:
  - 10-digit Indian telephone patterns (`[6-9]\d{9}`);
  - 10-character PAN patterns (`[A-Z]{5}[0-9]{4}[A-Z]{1}`);
  - 12-digit Aadhaar patterns (`\d{4}\s?\d{4}\s?\d{4}`);
  - Personal email addresses matching merchant proprietor domains.

### 5.3. Audit Logging & Access Traceability
- Any internal admin view or export of unmasked merchant personal information must generate an immutable record in `audit_log_events`:
  - `admin_user_id`: Unique identifier of the staff member;
  - `action`: `VIEW_UNMASKED_MERCHANT_PII` or `EXPORT_MERCHANT_KYC`;
  - `merchant_id`: Target merchant;
  - `timestamp`: UTC ISO-8601 timestamp;
  - `justification`: Mandatory operational justification entered by the user.

---

## 6. Authorized Disclosures & Statutory Exception Handling

Merchant personal data may be unmasked and disclosed **ONLY under strict statutory exceptions**:
1. **Valid Court Orders & Law Enforcement Subpoenas:** Upon receipt of a formal written order issued by a court of competent jurisdiction, the Cyber Crime Police, or the Central Consumer Protection Authority (CCPA) under Section 19 of the Consumer Protection Act, 2019.
2. **Statutory Tax Investigations:** In response to a formal summons issued by the Directorate General of GST Intelligence (DGGI) or the Income Tax Department under Section 131 of the Income-tax Act, 1961.
3. **Escalation Protocol:** Any release of merchant personal data under statutory subpoena requires formal written approval from ATEEVRA's Corporate Legal Officer.

---

## 7. Governance Status Confirmation

1. **OD-14 Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`.
2. **OD-01 Seller of Record Integrity:** Preserved 100%. Public and statutory visibility is balanced without altering seller status.
3. **OD-02 Policy Baseline Invariant:** All six approved return, refund, and damage policies remain locked at Version 1.0.0.
4. **Execution Restriction:** Strictly documentation and architectural specification. Zero software code, schema, API, or configuration changes have been executed.
