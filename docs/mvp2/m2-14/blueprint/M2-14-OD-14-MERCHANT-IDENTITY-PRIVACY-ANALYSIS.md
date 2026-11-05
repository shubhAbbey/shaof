# ATEEVRA Phase M2-14 — OD-14 Merchant Identity Privacy & Personal Information Protection Analysis
## Architectural, Commercial, Legal & Operational Assessment of Seller Data Masking and Brand-Led Communication

**Document ID:** `ANA-M2-14-OD-14-MERCHANT-PRIVACY`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint & Master Decision Register  
**Decision Reference:** Owner Decision OD-14 (Merchant Identity Privacy & Customer-Facing Branding)  
**Parent Policies:** [`POL-OD-02-01`](policies/OD-02-01-RETURN-COST-RESERVE.md) through [`POL-OD-02-06`](policies/OD-02-06-PRICING-BOUND-CONFLICTS.md)  
**Related Decisions:** OD-01 (Commercial Revenue Model), OD-02 (Refund & Return Liability), OD-07 (Settlement Framework)  
**Governance Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`  
**Execution Mode:** `STRICTLY DOCUMENTATION & POLICY ANALYSIS ONLY — ZERO APPLICATION IMPLEMENTATION`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Context

ATEEVRA operates as a multi-vendor lifestyle and design marketplace where independent artisans, boutique fashion houses, emerging apparel designers, and craft enterprises sell directly to consumers. 

In e-commerce marketplaces catering to small and medium enterprises (MSMEs) and individual creator-merchants, a critical operational and security challenge emerges:
- **Merchant Vulnerability:** Independent designers and boutique proprietors frequently operate as sole proprietorships or micro-enterprises registered from home studios, private residences, or shared workshops. When onboarding, proprietors submit personal mobile numbers, personal email addresses, and residential premises as part of their verification data.
- **Exposure Hazards:** If this personal contact information is exposed across customer-facing touchpoints (product pages, checkout screens, order confirmation emails, packing slips, shipping labels, or tracking portals), merchants face severe adverse consequences, including:
  1. Direct, off-platform customer harassment, late-night calls, and aggressive post-delivery disputes;
  2. Disintermediation risk (attempts by buyers or sellers to bypass platform commissions through direct settlement);
  3. Physical safety and privacy violations when private residential premises are mistakenly identified as public retail walk-in stores;
  4. Fragmented, unmonitored customer support that damages the ATEEVRA brand reputation and breaches platform return/refund SLAs.
- **The Statutory Counter-Constraint:** Indian consumer protection and taxation laws mandate specific seller disclosures to protect consumers from anonymous or fraudulent online transactions. Under the Consumer Protection (E-Commerce) Rules, 2020 and the Central Goods and Services Tax (CGST) Act, 2017, a marketplace entity must provide transparent seller information, including registered commercial name, geographic address, and GSTIN on tax invoices.

**The Purpose of OD-14:** To design a rigorous, balanced governance architecture that:
1. Completely shields merchants' personal phone numbers, personal emails, and residential addresses from retail customers;
2. Establishes ATEEVRA as the unified, brand-led customer care and communication layer;
3. Preserves 100% compliance with mandatory Indian statutory disclosures without misrepresenting ATEEVRA as the seller of record;
4. Maintains full operational data access internally for authorized ATEEVRA personnel, 3PL logistics carriers, payment gateways, and statutory authorities.

---

## 2. Project Owner Business Model Direction

The Project Owner has explicitly issued the following strategic directives for OD-14:

```
========================================================================================================================
PROJECT OWNER DIRECTION — OWNER DECISION OD-14
========================================================================================================================
1. Personal Phone Numbers:   STRICTLY HIDDEN from retail customers across all digital and physical touchpoints.
2. Personal Email Addresses: STRICTLY HIDDEN from retail customers; zero exposure in templates or metadata.
3. Residential Addresses:    STRICTLY PROTECTED from public display; replaced with registered commercial addresses.
4. Statutory Transparency:   Display ONLY legally required business and seller information (e.g. Legal Entity, GSTIN).
5. Customer Support Anchor:  ATEEVRA helpline and support email serve as the EXCLUSIVE primary customer care channel.
6. Unified Platform Brand:   Customer-facing communications, packaging slips, and notifications carry ATEEVRA branding.
7. Anti-Disintermediation:   Prevent unnecessary, unmonitored direct merchant-to-customer contact.
8. Internal Operations Data: Complete operational data (pickup hubs, phone, bank) remains accessible internally to 
                             authorized ATEEVRA personnel under Role-Based Access Control (RBAC).
========================================================================================================================
```

**Recorded Governance Status:**  
$$\mathbf{\text{Status: OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING}}$$
*(This direction establishes policy analysis boundaries. It does NOT constitute formal owner approval of implementation, and does NOT authorize software, schema, or configuration modifications).*

---

## 3. The Structural Tension: Merchant Privacy vs. Statutory Transparency

A marketplace must balance the privacy rights of individual business owners with mandatory statutory disclosures under Indian jurisprudence:

```
                      ┌─────────────────────────────────────────────────────────┐
                      │             THE COMMERCIAL & LEGAL TENSION               │
                      └───────────────────────────┬─────────────────────────────┘
                                                  │
                ┌─────────────────────────────────┴─────────────────────────────────┐
                ▼                                                                   ▼
┌───────────────────────────────┐                                   ┌───────────────────────────────┐
│     MERCHANT PRIVACY GOAL     │                                   │   STATUTORY COMPLIANCE GOAL   │
├───────────────────────────────┤                                   ├───────────────────────────────┤
│ • Shield personal mobile nos. │                                   │ • Consumer Protection Rules:  │
│ • Hide personal email IDs     │                                   │   Display seller legal name,  │
│ • Conceal home/studio address │                                   │   geographic address & care   │
│ • Centralize all support      │                                   │ • CGST Act Section 31:        │
│ • Prevent disintermediation   │                                   │   Supplier name, address,     │
│ • Protect micro-proprietors   │                                   │   GSTIN on B2C tax invoice    │
│ • Prevent customer harassment │                                   │ • Legal Metrology Rules:      │
│ • DPDP Act 2023 compliance    │                                   │   Manufacturer/packer details │
└───────────────────────────────┘                                   └───────────────────────────────┘
                │                                                                   │
                └─────────────────────────────────┬─────────────────────────────────┘
                                                  ▼
                                ┌───────────────────────────────────┐
                                │       RECONCILED OD-14 POLICY     │
                                ├───────────────────────────────────┤
                                │ 1. Merchant = Seller of Record    │
                                │ 2. Commercial entity disclosed    │
                                │ 3. Personal data strictly masked  │
                                │ 4. ATEEVRA = Centralized Care     │
                                │ 5. 3PL logistics data isolated    │
                                └───────────────────────────────────┘
```

### 3.1. Reconciling Seller of Record (OD-01) with ATEEVRA Branding
Under Owner Decision OD-01, the Project Owner confirmed that **Merchants remain the sellers of record**. Direct contracts of sale exist between merchants and customers, and merchants issue customer-facing product tax invoices.

**Critical Compliance Guardrail:**  
ATEEVRA branding on customer communications, packaging, and the storefront must **NEVER misrepresent ATEEVRA as the seller of record or the manufacturer of products**. ATEEVRA acts as an Electronic Commerce Operator (ECO) facilitating transactions. 

The customer must always understand:
1. **Who the legal seller is:** Displayed transparently as the Merchant's registered business entity (e.g. *"Sold by: Jaipur Textiles Private Limited"* or *"Sold by: Ananya Crafts (Proprietorship)"*).
2. **Who facilitates and guarantees customer care:** Displayed as ATEEVRA Marketplace (e.g. *"Marketplace Facilitation & Customer Care by ATEEVRA"*).

---

## 4. Comprehensive Touchpoint Privacy Vulnerability Audit

To enforce complete merchant identity protection, the platform must analyze and sanitize nine distinct customer-facing touchpoints:

```
========================================================================================================================
TOUCHPOINT VULNERABILITY & SANITIZATION AUDIT
========================================================================================================================
Touchpoint             | Vulnerability Description                  | Required OD-14 Sanitization Rule
-----------------------+--------------------------------------------+---------------------------------------------------
1. Product Listings &  | Exposure of seller internal codes, phone   | Display ONLY brand name and product title.
   Catalog Search      | numbers or personal identity in URL slugs. | Zero merchant personal contact details.
-----------------------+--------------------------------------------+---------------------------------------------------
2. Product Detail Page | Customer clicking seller profile exposed to| Display registered business name, registered city/
   (PDP)               | home address, personal phone or email.     | state, and brand story. Support contact points
                       |                                            | strictly to {{ATEEVRA_HELPLINE}}.
-----------------------+--------------------------------------------+---------------------------------------------------
3. Cart & Checkout     | Merchant warehouse address or personal     | Display: "Sold by: [Registered Business Name]".
   Review              | phone surfaced during checkout review.     | Fulfilled by ATEEVRA 3PL Network.
-----------------------+--------------------------------------------+---------------------------------------------------
4. Order Confirmation  | Seller contact details injected into       | ATEEVRA branded template. Customer support points
   Emails & Messages   | automated transaction email headers.       | strictly to {{ATEEVRA_SUPPORT_EMAIL}}.
-----------------------+--------------------------------------------+---------------------------------------------------
5. Statutory B2C Tax   | Invoice header exposing proprietor's home  | Statutory supplier block: Legal Business Name,
   Invoices            | address or personal phone.                 | Registered Commercial Address, GSTIN. Customer care
                       |                                            | footer: ATEEVRA Helpline & Grievance Desk.
-----------------------+--------------------------------------------+---------------------------------------------------
6. Physical Packing    | Merchant inserting handwritten notes,      | Platform-standardized ATEEVRA packing slip.
   Slips & Inserts     | personal WhatsApp cards, or flyers.        | Strict contractual prohibition of personal flyers.
-----------------------+--------------------------------------------+---------------------------------------------------
7. 3PL Shipping Labels | Shipper/Return address exposing merchant's | Shipper displayed as: "[Merchant Name] c/o ATEEVRA
   & Outer Packaging   | private home address or personal mobile.   | Hub, [Logistics Routing Code]". Phone: IVR Helpline.
-----------------------+--------------------------------------------+---------------------------------------------------
8. Return / Exchange   | Return shipping label exposing merchant's  | Return destination routed to centralized ATEEVRA
   Documentation       | home address to customer.                  | Return Processing Center or verified warehouse hub.
-----------------------+--------------------------------------------+---------------------------------------------------
9. SMS & WhatsApp      | Automated tracking updates showing         | Sent from verified ATEEVRA Sender ID ("ATEVRA").
   Transactional Pushes| merchant personal phone numbers.           | Replies routed to ATEEVRA automated support bot.
========================================================================================================================
```

---

## 5. Accidental and Unstructured Data Disclosure Vectors

In addition to structured database fields, personal contact information frequently leaks through unstructured user-generated content and uploaded documents. OD-14 identifies five critical accidental disclosure vectors:

### 5.1. Product Imagery Watermarks and Overlays
- **Vulnerability:** Artisan merchants often photograph products in home studios and superimpose watermarks containing personal phone numbers (e.g. *"For wholesale inquiries WhatsApp: +91 98XXX XXXXX"*).
- **Mitigation Requirement:** Storefront media pipeline must implement automated image moderation or mandatory vendor onboarding guidelines barring contact overlays in catalog images.

### 5.2. Product Description and Specification Text
- **Vulnerability:** Sellers typing promotional text into Medusa markdown descriptions (e.g. *"Contact designer directly at shubham@personalmail.com for custom sizing"*).
- **Mitigation Requirement:** Description validator rule to detect and flag regex patterns matching 10-digit Indian mobile numbers (`^[6-9]\d{9}$`) and email strings prior to catalog publishing.

### 5.3. Uploaded Certificates and Compliance Documentation
- **Vulnerability:** Merchants uploading artisan certificates, handloom council registrations, or MSME Udyam certificates as product attachments, inadvertently exposing personal Aadhaar numbers, PAN, or residential addresses.
- **Mitigation Requirement:** Uploaded compliance attachments must NOT be made publicly downloadable on the storefront; compliance verified by internal ops only.

### 5.4. Shipping Label Sender Contact Phone
- **Vulnerability:** 3PL carrier APIs (Delhivery, Shiprocket) automatically populate the "Shipper Contact Phone" on the physical thermal shipping label pasted on the box. If the API passes the merchant's onboarding mobile number, the delivery boy and the customer obtain the merchant's private phone.
- **Mitigation Requirement:** Logistics integration pipeline must override the customer-facing label sender phone with ATEEVRA's central logistics IVR placeholder (`{{ATEEVRA_LOGISTICS_IVR}}`), while transmitting the merchant's actual warehouse contact solely in the digital manifest for 3PL driver pickup coordination.

### 5.5. Return Documentation & Reverse Logistics Manifests
- **Vulnerability:** When a customer initiates a return, the reverse pickup airway bill (AWB) or return authorization slip displays the consignee address. If goods are returned directly to a home studio, the customer can see the proprietor's private home.
- **Mitigation Requirement:** Return shipping labels must either route to a regional ATEEVRA consolidation hub, or display the merchant's registered commercial facility address rather than personal residential details.

---

## 6. ATEEVRA Centralized Customer Support Architecture

To fulfill the Project Owner's mandate that ATEEVRA acts as the primary customer-support contact, all customer communication channels are centralized:

```mermaid
flowchart TD
    Customer[Retail Customer] -->|Inquiry / Dispute / Return| Channel{Customer Contact Channel}
    Channel -->|Phone Call| ATEEVRA_Phone["ATEEVRA Central Helpline\n{{ATEEVRA_HELPLINE}}"]
    Channel -->|Email Inquiry| ATEEVRA_Email["ATEEVRA Support Desk\n{{ATEEVRA_SUPPORT_EMAIL}}"]
    Channel -->|Web Portal / App| ATEEVRA_Portal["ATEEVRA In-App Grievance Portal\n(Ticketing Engine)"]
    
    ATEEVRA_Phone --> CentralDesk[ATEEVRA Tier-1 Customer Support Team]
    ATEEVRA_Email --> CentralDesk
    ATEEVRA_Portal --> CentralDesk
    
    CentralDesk -->|Resolution within Platform Policy| DirectResolve[Issue Refund / Exchange / Info Directly to Customer]
    CentralDesk -->|Requires Seller Action| InternalEscalation[Internal Merchant Escalation Channel\n(Medusa Admin / Merchant Ticket)]
    
    InternalEscalation --> MerchantPortal[Merchant Operational Portal]
    MerchantPortal -->|Merchant Response / Resolution| CentralDesk
    CentralDesk -->|Unified ATEEVRA Communication| Customer
```

### 6.1. Centralized Support Operating Rules
1. **Zero Direct Customer-to-Merchant Calling:** Customers are never provided with a merchant's direct telephone number. All calls route to ATEEVRA's integrated telephony system.
2. **Standardized Brand Voice:** All email responses, chat transcripts, and refund notifications are formatted using approved ATEEVRA design systems and brand templates.
3. **Internal Escalation Protocol:** When a customer inquiry requires merchant input (e.g., custom tailoring specifications, technical craft details, manufacturing defects), ATEEVRA Support opens an **Internal Merchant Ticket** via the Merchant Portal. The merchant responds to ATEEVRA, and ATEEVRA relays the answer to the customer.
4. **Dispute & Grievance Shielding:** In-transit damage disputes (`POL-OD-02-04`), doorstep refusals (`POL-OD-02-05`), and return requests (`POL-OD-02-01`) are adjudicated centrally by ATEEVRA Operations without exposing merchants to adversarial customer confrontations.

---

## 7. Placeholder Governance & Brand Identity Rules

In strict adherence to governance constraints:
- **No Invented Contact Details:** Neither this analysis nor any blueprint deliverable invents a placeholder phone number, email address, corporate identification number (CIN), or physical address.
- **Configuration Placeholders:** All documents, templates, and specifications utilize standard configuration placeholders:
  - Helpline Phone: `{{ATEEVRA_HELPLINE}}`
  - Customer Support Email: `{{ATEEVRA_SUPPORT_EMAIL}}`
  - Logistics IVR Phone: `{{ATEEVRA_LOGISTICS_IVR}}`
  - Grievance Officer Contact: `{{ATEEVRA_GRIEVANCE_EMAIL}}`
  - Corporate Office Address: `{{ATEEVRA_REGISTERED_OFFICE}}`
- **Owner Input Required:** The Project Owner must supply the actual production values prior to live platform deployment.

---

## 8. Governance Status Confirmation

1. **OD-14 Status:** `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`.
2. **OD-01 Direction Preserved:** Merchants remain sellers of record issuing B2C tax invoices; ATEEVRA operates the marketplace platform.
3. **OD-02 Invariant:** Policies `POL-OD-02-01` through `POL-OD-02-06` remain locked at Version 1.0.0.
4. **Execution Restriction:** Strictly documentation and analysis. Zero software implementation authorized.
