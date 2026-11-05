# ATEEVRA — Master Canonical Owner Decision Register

**Document ID:** `ATEEVRA-P05-REG-CANONICAL-001`  
**Classification:** Master Canonical Owner Decision Register & Baseline Profile  
**Register Status:** CANONICAL BASELINE (Authorized Post-Gate 0 Audit)  
**Effective Date:** 2026-11-05  
**Governing Mandate:** Gate 0 Reconciliation & Source-of-Truth Harmonization  
**Decision Approval Invariant:** **ALL 28 OWNER DECISIONS RETAIN STRICT `PROPOSED` STATUS (0/28 Approved)**  
**Author:** Principal Enterprise Architect & Policy Governance Specialist  

---

## 1. Master Canonical Decision Inventory (OD-001 through OD-028)

This register provides the untruncated, verbatim canonical titles, domains, authoritative paths, and gate dependencies for all 28 First-Party Luxury Brand Owner Decisions, reconciled against their original source documents:

```
+-----------------------------------------------------------------------------------------------------------------------------------------------+
|                                    MASTER CANONICAL OWNER DECISION INVENTORY TABLE                                                            |
+-----+-----------------------------------------------------------------------+----------+----------+-----------------------+-------------------+
| ID  | Full Canonical Decision Title                                         | Domain   | Status   | Required Gate         | Related ADRs      |
+-----+-----------------------------------------------------------------------+----------+----------+-----------------------+-------------------+
| 001 | Direct First-Party Luxury Brand Commercial Model & Seller of Record   | Domain A | PROPOSED | Gate G-CA / Gate G-LG | ADR-001           |
| 002 | Product Sourcing, Atelier Contracting & Private Label Strategy        | Domain B | PROPOSED | Gate G-QA             | ADR-002           |
| 003 | Luxury Catalog Architecture, HSN Codes & Legal Metrology              | Domain C | PROPOSED | Gate G-LG             | ADR-003, ADR-005  |
| 004 | Value-Based Luxury Pricing Architecture & Price Integrity             | Domain D | PROPOSED | Gate G-CA             | ADR-001, ADR-007  |
| 005 | Promotional Discipline, VIP Previews & Floor Price Protection         | Domain D | PROPOSED | Gate G-CA             | ADR-005           |
| 006 | Enterprise Digital Payment Instruments & Gateway Fee Absorption       | Domain E | PROPOSED | Gate G-CA             | ADR-007           |
| 007 | Statutory Tax Compliance, Section 31 Invoicing & ITC Optimization     | Domain E | PROPOSED | Gate G-CA             | ADR-007           |
| 008 | White-Glove Packaging Architecture & Tactile Unboxing Experience      | Domain F | PROPOSED | Internal Ops          | ADR-008           |
| 009 | Express Air Logistics, Same-Day Dispatch & Delivery OTP Verification   | Domain F | PROPOSED | Gate G-LO             | ADR-008           |
| 010 | Luxury Concierge Return Window, Simultaneous Size Swap & Standards    | Domain G | PROPOSED | Internal Ops          | ADR-008           |
| 011 | Post-Return Triage, Ozone Sanitation & Restocking Governance          | Domain G | PROPOSED | Gate G-QA / Gate G-LG | ADR-008           |
| 012 | Omnichannel Luxury Concierge Advisory & 5-Minute WhatsApp SLA         | Domain H | PROPOSED | Internal CX           | ADR-001           |
| 013 | Private Client Styling Dossier & VIP Clienteling Program              | Domain H | PROPOSED | Internal Luxury       | ADR-006           |
| 014 | Client Data Protection, DPDP Act 2023 Compliance & PII Masking        | Domain I | PROPOSED | Gate G-LG             | ADR-006           |
| 015 | Brand Protection, Trademark Enforcement & Grey Market Defenses        | Domain J | PROPOSED | Gate G-LG             | ADR-001           |
| 016 | Headless Commerce Architecture: Medusa v2.19, Strapi v5 & Next.js 15  | Domain K | PROPOSED | Gate G-ARCH           | ADR-003, ADR-004  |
| 017 | Decoupling Marketplace Multi-Vendor Links & Commercial Mode Gate      | Domain K | PROPOSED | Gate G-ARCH           | ADR-004           |
| 018 | Internal Admin Panel Architecture, 6 Corporate Roles & TOTP MFA       | Domain L | PROPOSED | Gate G-SEC            | ADR-006           |
| 019 | Dual-Authorization Financial Thresholds & Immutable Audit Logs        | Domain L | PROPOSED | Gate G-SEC            | ADR-006           |
| 020 | Luxury Storefront Visual Identity, Preserved Assets & Next.js 15 ISR   | Domain M | PROPOSED | Internal UX           | ADR-003, ADR-005  |
| 021 | Frictionless Single-Page Luxury Checkout Architecture                  | Domain M | PROPOSED | Internal UX           | ADR-005           |
| 022 | B2B Atelier Supplier Qualification, Tech Packs & Ethical Audits       | Domain N | PROPOSED | Gate G-QA             | ADR-002           |
| 023 | Purchase Order Milestone Financing & Advance Payment Risk Mitigation  | Domain N | PROPOSED | Gate G-CA             | ADR-002, ADR-007  |
| 024 | Central Warehouse Facility Topology, 5-Tier Addressing & RFID Tracking| Domain O | PROPOSED | Gate G-LG / Eng       | ADR-002, ADR-008  |
| 025 | ABC Perpetual Cycle Counting, Discrepancy Tolerance & Shrink Ledgers  | Domain O | PROPOSED | Gate G-CA             | ADR-002           |
| 026 | Landed Cost BOM Accounting, Ind AS 2 Valuation & Markup Multipliers   | Domain P | PROPOSED | Gate G-CA             | ADR-002, ADR-007  |
| 027 | Working Capital Financing, Cash Conversion Cycle & Liquidity Buffers   | Domain P | PROPOSED | Gate G-CA             | ADR-007           |
| 028 | 16-Week Phased Rollout, Quality Gates & Independent Validation        | Dom. Q-U | PROPOSED | All 5 Gates           | ADR-001, ADR-004  |
+-----+-----------------------------------------------------------------------+----------+----------+-----------------------+-------------------+
```

---

## 2. Granular Profiles for Decisions OD-001 through OD-028

### `ATEEVRA-OD-001`: Direct First-Party Luxury Brand Commercial Model & Seller of Record
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-001-direct-first-party-commercial-model.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-001-direct-first-party-commercial-model.md)
- **Domain Mapping:** Domain A (Commercial Model & Seller of Record)
- **Business Scope:** Commercial positioning and legal Seller of Record (SOR) structure for ATEEVRA fashion sales transactions.
- **Strategic Options:** Option A: Pure First-Party D2C Luxury Brand (RECOMMENDED; Tenant ID: `ATEEVRA_CORP`); Option B: Consignment / Agency Concession Model; Option C: Managed Luxury Marketplace.
- **Dependencies:** None (Root Decision). Blocks: All downstream decisions (OD-002 through OD-028).
- **Related ADRs:** [`ADR-001`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-001-first-party-commerce-domain-boundaries.md). **Required Gate:** `Gate G-CA` / `Gate G-LG`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-002`: Product Sourcing, Atelier Contracting & Private Label Strategy
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-002-sourcing-and-atelier-contracting.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-002-sourcing-and-atelier-contracting.md)
- **Domain Mapping:** Domain B (Product Sourcing & Private Label Manufacturing)
- **Business Scope:** Manufacturing and atelier contracting model to guarantee garment tailoring quality and capital efficiency.
- **Strategic Options:** Option A: Contract Manufacturing with Certified Luxury Ateliers (RECOMMENDED); Option B: Fully Owned Vertical Manufacturing Facility; Option C: Ready-Made White-Label Sourcing.
- **Dependencies:** Upstream: OD-001. Blocks: OD-003, OD-022, OD-023, OD-026.
- **Related ADRs:** [`ADR-002`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-002-internal-brand-inventory-ownership.md). **Required Gate:** `Gate G-QA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-003`: Luxury Catalog Architecture, HSN Codes & Legal Metrology
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-003-catalog-and-legal-metrology.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-003-catalog-and-legal-metrology.md)
- **Domain Mapping:** Domain C (Product Catalog Architecture & Mandatory Declarations)
- **Business Scope:** Storefront catalog specification depth and compliance with Legal Metrology (Packaged Commodities) Rules, 2011.
- **Strategic Options:** Option A: Dedicated Technical Specification Accordion with Full Legal Metrology (RECOMMENDED); Option B: Minimalist Brand Aesthetic with Footer Legal Disclaimer; Option C: Concierge Spec Inquiry (Hidden Specs).
- **Dependencies:** Upstream: OD-001, OD-002. Blocks: OD-004, OD-020.
- **Related ADRs:** [`ADR-003`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-003-strapi-cms-brand-storytelling-integration.md), [`ADR-005`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-005-unified-luxury-storefront-checkout.md). **Required Gate:** `Gate G-LG`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-004`: Value-Based Luxury Pricing Architecture & Price Integrity
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-004-luxury-pricing-architecture.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-004-luxury-pricing-architecture.md)
- **Domain Mapping:** Domain D (Pricing Strategy & Price Integrity)
- **Business Scope:** Retail markup multipliers over Total Landed Cost (TLC) to ensure luxury positioning and margin cushion.
- **Strategic Options:** Option A: 4.8x to 5.5x Multiplier over TLC (RECOMMENDED); Option B: 2.5x to 3.0x Fast-Fashion Margin Multiplier; Option C: 8.0x to 10.0x Ultra-Luxury Multiplier.
- **Dependencies:** Upstream: OD-003, OD-026. Blocks: OD-005, OD-021, OD-027.
- **Related ADRs:** [`ADR-001`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-001-first-party-commerce-domain-boundaries.md), [`ADR-007`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-007-statutory-tax-seller-of-record-accounting.md). **Required Gate:** `Gate G-CA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-005`: Promotional Discipline, VIP Previews & Floor Price Protection
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-005-promotions-and-floor-pricing.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-005-promotions-and-floor-pricing.md)
- **Domain Mapping:** Domain D (Promotions & Commercial Discipline)
- **Business Scope:** Off-season inventory clearance rules, VIP previews, and algorithmic promotional floor price enforcement.
- **Strategic Options:** Option A: Private VIP Archive Previews with Hard Floor Enforcement (RECOMMENDED); Option B: Sitewide Seasonal Sales (30% to 50% Off); Option C: Permanent Third-Party Outlet Clearance.
- **Dependencies:** Upstream: OD-004. Blocks: OD-021, OD-028.
- **Related ADRs:** [`ADR-005`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-005-unified-luxury-storefront-checkout.md). **Required Gate:** `Gate G-CA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-006`: Enterprise Digital Payment Instruments & Gateway Fee Absorption
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-006-payment-methods-and-mdr.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-006-payment-methods-and-mdr.md)
- **Domain Mapping:** Domain E (Payment Architecture & Settlement Economics)
- **Business Scope:** Payment instrument selection, gateway MDR fee absorption, and COD policy on high-value orders.
- **Strategic Options:** Option A: 100% Brand MDR Absorption + Pre-Paid Prioritization with Restricted COD (RECOMMENDED); Option B: Surcharge Payment Gateway Fees to Customers; Option C: Universal Unrestricted COD.
- **Dependencies:** Upstream: OD-001, OD-007. Blocks: OD-021, OD-027.
- **Related ADRs:** [`ADR-007`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-007-statutory-tax-seller-of-record-accounting.md). **Required Gate:** `Gate G-CA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-007`: Statutory Tax Compliance, Section 31 Invoicing & ITC Optimization
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-007-statutory-tax-and-section-31.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-007-statutory-tax-and-section-31.md)
- **Domain Mapping:** Domain E (Statutory Taxation & Fiscal Compliance)
- **Business Scope:** Statutory Section 31 GST tax invoicing, exemption from Section 52 TCS, and Input Tax Credit ledger flows.
- **Strategic Options:** Option A: Direct Section 31 Invoicing + GSTR-2B ITC Offset Architecture (RECOMMENDED); Option B: Retain Marketplace Multi-Vendor Tax Logic.
- **Dependencies:** Upstream: OD-001. Blocks: OD-006, OD-026, OD-027.
- **Related ADRs:** [`ADR-007`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-007-statutory-tax-seller-of-record-accounting.md). **Required Gate:** `Gate G-CA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-008`: White-Glove Packaging Architecture & Tactile Unboxing Experience
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-008-luxury-packaging-architecture.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-008-luxury-packaging-architecture.md)
- **Domain Mapping:** Domain F (Packaging Design & Tactile Unboxing)
- **Business Scope:** Packaging presentation standards, unboxing materials, and transit theft prevention.
- **Strategic Options:** Option A: Three-Tier Luxury Packaging Architecture (RECOMMENDED); Option B: Standard Poly Mailer Shipping; Option C: High-Graphic Branded Exterior Shipper.
- **Dependencies:** Upstream: OD-001. Blocks: OD-009, OD-026.
- **Related ADRs:** [`ADR-008`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-008-returns-concierge-and-restocking-lifecycle.md). **Required Gate:** Internal Ops. **Status:** `PROPOSED`.

### `ATEEVRA-OD-009`: Express Air Logistics, Same-Day Dispatch & Delivery OTP Verification
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-009-express-logistics-and-otp.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-009-express-logistics-and-otp.md)
- **Domain Mapping:** Domain F (Logistics, Express Transport & Proof of Handover)
- **Business Scope:** Courier priority freight selection, same-day dispatch cutoff, and dynamic delivery OTP verification.
- **Strategic Options:** Option A: Dedicated Air Express Network (24-48h) + Dynamic Delivery OTP (RECOMMENDED); Option B: Economy Surface Aggregators without Delivery OTP.
- **Dependencies:** Upstream: OD-008. Blocks: OD-010, OD-021.
- **Related ADRs:** [`ADR-008`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-008-returns-concierge-and-restocking-lifecycle.md). **Required Gate:** `Gate G-LO`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-010`: Luxury Concierge Return Window, Simultaneous Size Swap & Condition Standards
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-010-concierge-return-and-exchange.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-010-concierge-return-and-exchange.md)
- **Domain Mapping:** Domain G (Reverse Logistics, Returns & Exchanges)
- **Business Scope:** Return policy window duration, simultaneous size exchange mechanics, and packaging fee deduction.
- **Strategic Options:** Option A: 7-Day Concierge Return Window with Simultaneous Doorstep Size Swap (RECOMMENDED); Option B: Standard 30-Day Open Return Window with Free Pickups; Option C: Final Sale / No Returns.
- **Dependencies:** Upstream: OD-009. Blocks: OD-011, OD-012.
- **Related ADRs:** [`ADR-008`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-008-returns-concierge-and-restocking-lifecycle.md). **Required Gate:** Internal Ops. **Status:** `PROPOSED`.

### `ATEEVRA-OD-011`: Post-Return Triage, Ozone Sanitation & Restocking Governance
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-011-post-return-triage-restocking.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-011-post-return-triage-restocking.md)
- **Domain Mapping:** Domain G (Quality Assurance & Warehouse Triage)
- **Business Scope:** Returned garment grading, sanitization protocol, and Grade-A inventory restocking rules.
- **Strategic Options:** Option A: 5-Stage Warehouse Triage with Ozone Sanitization & Grade-A Restock (RECOMMENDED); Option B: Immediate Restock to Primary Bins upon Return Receipt.
- **Dependencies:** Upstream: OD-010, OD-024. Blocks: OD-025.
- **Related ADRs:** [`ADR-008`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-008-returns-concierge-and-restocking-lifecycle.md). **Required Gate:** `Gate G-QA` / `Gate G-LG`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-012`: Omnichannel Luxury Concierge Advisory & 5-Minute WhatsApp SLA
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-012-omnichannel-concierge-whatsapp.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-012-omnichannel-concierge-whatsapp.md)
- **Domain Mapping:** Domain H (Customer Experience & Concierge Advisory)
- **Business Scope:** Real-time customer service architecture, client advisor staffing, and response time SLAs.
- **Strategic Options:** Option A: Dedicated Human WhatsApp Luxury Concierge with 5-Minute First Response SLA (RECOMMENDED); Option B: Automated Chatbot Only.
- **Dependencies:** Upstream: OD-001, OD-010. Blocks: OD-013.
- **Related ADRs:** [`ADR-001`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-001-first-party-commerce-domain-boundaries.md). **Required Gate:** Internal CX. **Status:** `PROPOSED`.

### `ATEEVRA-OD-013`: Private Client Styling Dossier & VIP Clienteling Program
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-013-private-client-styling-dossier.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-013-private-client-styling-dossier.md)
- **Domain Mapping:** Domain H (VIP Clienteling & Retention Strategy)
- **Business Scope:** VIP loyalty tiers, styling dossiers, and personalized client relationship management.
- **Strategic Options:** Option A: Bespoke Private Client Styling Dossier & Invitation-Only VIP Circle (RECOMMENDED); Option B: Mass Points-Based Gamified Loyalty Program.
- **Dependencies:** Upstream: OD-012, OD-014. Blocks: OD-018, OD-020.
- **Related ADRs:** [`ADR-006`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-006-role-based-internal-admin-bff.md). **Required Gate:** Internal Luxury. **Status:** `PROPOSED`.

### `ATEEVRA-OD-014`: Client Data Protection, DPDP Act 2023 Compliance & Internal PII Masking
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-014-client-privacy-and-dpdp-2023.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-014-client-privacy-and-dpdp-2023.md)
- **Domain Mapping:** Domain I (Data Privacy, DPDP Act Compliance & Security)
- **Business Scope:** Customer PII protection, DPDP Act 2023 consent capture, and administrative PII masking.
- **Strategic Options:** Option A: Comprehensive DPDP Act 2023 Consent Architecture & Role-Based PII Masking (RECOMMENDED); Option B: Static Generic Privacy Terms.
- **Dependencies:** Upstream: OD-001. Blocks: OD-018, OD-020.
- **Related ADRs:** [`ADR-006`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-006-role-based-internal-admin-bff.md). **Required Gate:** `Gate G-LG`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-015`: Brand Protection, Trademark Enforcement & Grey Market Defenses
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-015-brand-protection-anti-counterfeit.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-015-brand-protection-anti-counterfeit.md)
- **Domain Mapping:** Domain J (Brand IP, Trademarks & Anti-Counterfeiting)
- **Business Scope:** Intellectual property protection, anti-counterfeiting verification, and grey-market defense.
- **Strategic Options:** Option A: Dual Cryptographic QR/NFC Verification & Active Trademark Watch (RECOMMENDED); Option B: Passive Trademark Registration Only.
- **Dependencies:** Upstream: OD-001. Blocks: OD-003, OD-020.
- **Related ADRs:** [`ADR-001`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-001-first-party-commerce-domain-boundaries.md). **Required Gate:** `Gate G-LG`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-016`: Headless Commerce Architecture: Medusa v2.19, Strapi v5 & Next.js 15
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-016-headless-medusa-strapi-nextjs.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-016-headless-medusa-strapi-nextjs.md)
- **Domain Mapping:** Domain K (System Architecture & Technology Engine)
- **Business Scope:** Headless commerce tech stack, CMS integration, and framework baseline roadmap.
- **Strategic Options:** Option A: Decoupled Headless Medusa v2.19 + Strapi v5 + Next.js Storefront (RECOMMENDED; Launch on Next.js 14.2.24); Option B: Monolithic Luxury SaaS Migration.
- **Dependencies:** Upstream: OD-001, OD-017. Blocks: OD-018, OD-020, OD-021.
- **Related ADRs:** [`ADR-003`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-003-strapi-cms-brand-storytelling-integration.md), [`ADR-004`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-004-decoupling-marketplace-merchant-primitives.md). **Required Gate:** `Gate G-ARCH`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-017`: Decoupling Marketplace Multi-Vendor Links & Commercial Mode Gate
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-017-decoupling-marketplace-primitives.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-017-decoupling-marketplace-primitives.md)
- **Domain Mapping:** Domain K (Marketplace Decoupling & Multi-Tenant Isolation)
- **Business Scope:** Architectural decoupling of multi-vendor primitives without destructive schema drops.
- **Strategic Options:** Option A: Runtime Feature Toggle `COMMERCE_MODE=FIRST_PARTY_BRAND` (RECOMMENDED for Phase 1); Option B: Destructive Database Migration (Drop Marketplace Schemas); Option C: Codebase Forking; Option D: Complete Architecture Freeze & Deferral to Phase 1 (RECOMMENDED for Phase 0.5).
- **Dependencies:** Upstream: OD-001. Blocks: OD-016, OD-018.
- **Related ADRs:** [`ADR-004`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-004-decoupling-marketplace-merchant-primitives.md). **Required Gate:** `Gate G-ARCH`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-018`: Internal Admin Panel Architecture, 6 Corporate Roles & TOTP MFA
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-018-internal-admin-rbac-and-mfa.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-018-internal-admin-rbac-and-mfa.md)
- **Domain Mapping:** Domain L (Internal Administrative Governance & Access Security)
- **Business Scope:** Internal admin panel security, role-based access control (RBAC), and hardware TOTP MFA.
- **Strategic Options:** Option A: Dedicated Admin BFF with 6 Corporate Roles & Mandatory TOTP MFA (RECOMMENDED); Option B: Shared Monolithic Admin with Single-Factor Passwords.
- **Dependencies:** Upstream: OD-017. Blocks: OD-019.
- **Related ADRs:** [`ADR-006`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-006-role-based-internal-admin-bff.md). **Required Gate:** `Gate G-SEC`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-019`: Dual-Authorization Financial Thresholds & Immutable Audit Logs
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-019-dual-auth-thresholds-audit-logs.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-019-dual-auth-thresholds-audit-logs.md)
- **Domain Mapping:** Domain L (Financial Risk Controls & Administrative Governance)
- **Business Scope:** Dual-authorization financial thresholds for customer refunds, concessions, and vendor disbursements.
- **Strategic Options:** Option A: Universal Dual-Authorization for All Financial Actions $> ₹5,000$ (RECOMMENDED); Option B: Single Concierge Approval for All Operational Refunds.
- **Dependencies:** Upstream: OD-018. Blocks: OD-023, OD-025.
- **Related ADRs:** [`ADR-006`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-006-role-based-internal-admin-bff.md). **Required Gate:** `Gate G-SEC`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-020`: Luxury Storefront Visual Identity, Preserved Assets & Next.js 15 ISR
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-020-storefront-aesthetic-and-isr.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-020-storefront-aesthetic-and-isr.md)
- **Domain Mapping:** Domain M (Storefront User Experience & Aesthetic Direction)
- **Business Scope:** Storefront visual identity, preservation of custom SVG logo, and sub-second page performance.
- **Strategic Options:** Option A: Quiet Luxury Monochromatic Aesthetic with Preserved SVG Brand Identity (RECOMMENDED); Option B: Off-the-Shelf Commercial Theme Redesign.
- **Dependencies:** Upstream: OD-003, OD-016. Blocks: OD-021.
- **Related ADRs:** [`ADR-003`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-003-strapi-cms-brand-storytelling-integration.md), [`ADR-005`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-005-unified-luxury-storefront-checkout.md). **Required Gate:** Internal UX. **Status:** `PROPOSED`.

### `ATEEVRA-OD-021`: Frictionless Single-Page Luxury Checkout Architecture
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-021-single-page-luxury-checkout.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-021-single-page-luxury-checkout.md)
- **Domain Mapping:** Domain M (Checkout Optimization & Friction Elimination)
- **Business Scope:** Storefront checkout funnel architecture and completion speed optimization.
- **Strategic Options:** Option A: Single-Page Headless Checkout with One-Tap Address Autocomplete (RECOMMENDED; $< 45\text{s}$ completion); Option B: Traditional 5-Step Checkout Wizard.
- **Dependencies:** Upstream: OD-006, OD-009, OD-020. Blocks: OD-028.
- **Related ADRs:** [`ADR-005`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-005-unified-luxury-storefront-checkout.md). **Required Gate:** Internal UX. **Status:** `PROPOSED`.

### `ATEEVRA-OD-022`: B2B Atelier Supplier Qualification, Tech Packs & Ethical Audits
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-022-atelier-qualification-and-audits.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-022-atelier-qualification-and-audits.md)
- **Domain Mapping:** Domain N (Vendor Governance & Sourcing Risk Management)
- **Business Scope:** Atelier qualification audits, technical packs, and ethical labor standards.
- **Strategic Options:** Option A: 4-Stage Onboarding Audit with Comprehensive Tech Packs (RECOMMENDED); Option B: Informal Sampling & Relationship-Based Sourcing.
- **Dependencies:** Upstream: OD-002. Blocks: OD-023, OD-026.
- **Related ADRs:** [`ADR-002`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-002-internal-brand-inventory-ownership.md). **Required Gate:** `Gate G-QA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-023`: Purchase Order Milestone Financing & Advance Payment Risk Mitigation
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-023-po-milestone-financing-terms.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-023-po-milestone-financing-terms.md)
- **Domain Mapping:** Domain N (Supply Chain Commercial Terms & Financing)
- **Business Scope:** Atelier milestone payment terms balancing liquidity support against advance payment risk.
- **Strategic Options:** Option A: 30% Advance / 40% Ex-Factory Inspection / 30% Net 30 Post-GRN (RECOMMENDED); Option B: 100% Upfront Advance Payment; Option C: 100% Net 60 Post-Delivery Terms.
- **Dependencies:** Upstream: OD-019, OD-022. Blocks: OD-027.
- **Related ADRs:** [`ADR-002`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-002-internal-brand-inventory-ownership.md), [`ADR-007`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-007-statutory-tax-seller-of-record-accounting.md). **Required Gate:** `Gate G-CA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-024`: Central Warehouse Facility Topology, 5-Tier Addressing & RFID Tracking
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-024-central-warehouse-bin-topology.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-024-central-warehouse-bin-topology.md)
- **Domain Mapping:** Domain O (Warehouse Physical Architecture & Storage Zones)
- **Business Scope:** Fulfillment center physical zone layout, 5-tier bin addressing, and negative-pressure ozone chamber allocation.
- **Strategic Options:** Option A: 8,500 sq ft Facility in Bengaluru with 5-Tier Addressing & Ozone Containment Room (RECOMMENDED); Option B: Single-Room Flat Warehouse without Specialized Zones.
- **Dependencies:** Upstream: OD-001. Blocks: OD-011, OD-025.
- **Related ADRs:** [`ADR-002`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-002-internal-brand-inventory-ownership.md), [`ADR-008`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-008-returns-concierge-and-restocking-lifecycle.md). **Required Gate:** `Gate G-LG` / Engineering. **Status:** `PROPOSED`.

### `ATEEVRA-OD-025`: ABC Perpetual Cycle Counting, Discrepancy Tolerance & Shrinkage Ledgers
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-025-perpetual-cycle-counting-abc.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-025-perpetual-cycle-counting-abc.md)
- **Domain Mapping:** Domain O (Inventory Control & Loss Prevention)
- **Business Scope:** Warehouse inventory auditing frequency, perpetual cycle counts, and shrinkage accounting ledgers.
- **Strategic Options:** Option A: Daily Perpetual ABC Cycle Counting with Dedicated Shrinkage Ledgers (RECOMMENDED); Option B: Annual Physical Stocktake with Warehouse Shutdown.
- **Dependencies:** Upstream: OD-019, OD-024. Blocks: OD-026, OD-027.
- **Related ADRs:** [`ADR-002`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-002-internal-brand-inventory-ownership.md). **Required Gate:** `Gate G-CA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-026`: Landed Cost BOM Accounting, Ind AS 2 Valuation & Markup Multipliers
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-026-landed-cost-bom-accounting.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-026-landed-cost-bom-accounting.md)
- **Domain Mapping:** Domain P (Cost Accounting & Financial Valuation)
- **Business Scope:** Standard absorption costing rules under Ind AS 2 and BOM capitalization boundaries.
- **Strategic Options:** Option A: Standard Absorption Costing under Ind AS 2 on FIFO Basis (RECOMMENDED); Option B: Pure Cash-Outflow Invoice Expensing.
- **Dependencies:** Upstream: OD-002, OD-007, OD-022. Blocks: OD-004, OD-027.
- **Related ADRs:** [`ADR-002`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-002-internal-brand-inventory-ownership.md), [`ADR-007`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-007-statutory-tax-seller-of-record-accounting.md). **Required Gate:** `Gate G-CA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-027`: Working Capital Financing, Cash Conversion Cycle & Liquidity Buffers
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-027-working-capital-cashflow-buffers.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-027-working-capital-cashflow-buffers.md)
- **Domain Mapping:** Domain P (Treasury, Cash Flow & Working Capital)
- **Business Scope:** Treasury liquidity buffers, Cash Conversion Cycle (CCC) management, and operating runway.
- **Strategic Options:** Option A: 26.5-Day Cash Conversion Cycle with ₹30L Rolling Buffer (RECOMMENDED); Option B: Just-in-Time Zero Cash Buffer.
- **Dependencies:** Upstream: OD-007, OD-023, OD-026. Blocks: OD-028.
- **Related ADRs:** [`ADR-007`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-007-statutory-tax-seller-of-record-accounting.md). **Required Gate:** `Gate G-CA`. **Status:** `PROPOSED`.

### `ATEEVRA-OD-028`: 16-Week Phased Rollout, Quality Gates & Independent Validation
- **Authoritative Path:** [`docs/ateevra-brand/owner-decisions/ATEEVRA-OD-028-phased-rollout-and-validation.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/owner-decisions/ATEEVRA-OD-028-phased-rollout-and-validation.md)
- **Domain Mapping:** Domains Q-U (Program Governance & Phased Launch Roadmap)
- **Business Scope:** Master deployment strategy, 16-week four-phase roadmap, and external validation gates.
- **Strategic Options:** Option A: 16-Week 4-Phase Gated Rollout with 5 Independent Specialist Gates (RECOMMENDED); Option B: 4-Week "Big Bang" Public Launch.
- **Dependencies:** Upstream: OD-001 through OD-027 (Capstone Decision). Blocks: Production Launch.
- **Related ADRs:** [`ADR-001`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-001-first-party-commerce-domain-boundaries.md), [`ADR-004`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/architecture/ADR/ADR-004-decoupling-marketplace-merchant-primitives.md). **Required Gate:** All 5 Gates. **Status:** `PROPOSED`.

---
*End of Register `ATEEVRA-P05-REG-CANONICAL-001`. Formally Established as Authoritative Master Register.*
