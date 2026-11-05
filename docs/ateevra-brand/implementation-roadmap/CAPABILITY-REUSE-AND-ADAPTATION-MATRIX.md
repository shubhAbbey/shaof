# ATEEVRA — Monorepo Capability Reuse and Adaptation Matrix

**Document ID:** `ATEEVRA-ROAD-REUSE-001`  
**Classification:** Technical Architecture & Codebase Migration Strategy  
**Status:** DRAFT (Under Owner Review)  
**Version:** 1.0.0  

---

## 1. Executive Summary & Reuse Methodology

The existing ATEEVRA Monorepo contains enterprise-grade commerce foundations across `apps/backend` (Medusa v2.19), `apps/cms` (Strapi v5), and `apps/storefront` (Next.js 15). Transitioning to a first-party luxury fashion brand does not require discarding this architecture. Instead, an exhaustive capability audit classifies every module into one of four distinct engineering dispositions:

1. **`REUSE_AS_IS`**: Foundational components, infrastructure, styling tokens, and core engines utilized with zero code modifications.
2. **`REUSE_WITH_ADAPTATION`**: Modules where business logic is streamlined (e.g., stripping multi-vendor filtering, redirecting stock checks to central warehouse).
3. **`REPLACE_OR_DEPRECATE`**: Marketplace-specific mechanisms (e.g., merchant onboarding, commission split engines, multi-vendor cart splits) that are disabled or bypassed.
4. **`BUILD_NEW`**: First-party luxury brand capabilities (e.g., B2B Atelier PO tracker, AQL 2.5 QC intake, WhatsApp Concierge, White-Glove packaging workflows).

---

## 2. Comprehensive Monorepo Capability Disposition Matrix

```
+---------------------------------------------------------------------------------------------------------------+
|                                    CODEBASE CAPABILITY DISPOSITION AUDIT                                     |
+----------------------------------------+-------------------------+--------------------------------------------+
| Monorepo Path / Module                 | Architectural Category  | Planned Disposition & Engineering Action   |
+----------------------------------------+-------------------------+--------------------------------------------+
| apps/backend/src/modules/auth          | Core Security           | REUSE_AS_IS: JWT auth, bcrypt, RBAC hooks  |
| apps/backend/src/modules/customer      | Customer Profile        | REUSE_AS_IS: Medusa v2 Customer accounts   |
| apps/backend/src/modules/cart          | Cart & Pricing Engine   | REUSE_WITH_ADAPTATION: Remove vendor split |
| apps/backend/src/modules/order         | Order Lifecycle         | REUSE_WITH_ADAPTATION: Single SOR order    |
| apps/backend/src/modules/stock-location| Central Warehouse       | REUSE_AS_IS: WH01 central facility mapping |
| apps/backend/src/modules/merchant-*    | Multi-Vendor Primitive  | REPLACE_OR_DEPRECATE: Bypass/deprecate     |
| apps/backend/src/modules/commission    | Marketplace Commission  | REPLACE_OR_DEPRECATE: First-party 100% GMV |
| apps/backend/src/modules/settlement    | Merchant Settlement     | REPLACE_OR_DEPRECATE: Replace with AP PO   |
| apps/backend/src/modules/b2b-procure   | Inbound Supply Chain    | BUILD_NEW: Atelier PO & Milestone payments |
| apps/backend/src/modules/qc-inspection | Quality Assurance       | BUILD_NEW: AQL 2.5 defect logging service  |
| apps/backend/src/modules/tax-invoice   | Direct Tax Compliance   | BUILD_NEW: Section 31 B2C / B2B GST Invoice|
+----------------------------------------+-------------------------+--------------------------------------------+
| apps/cms/src/api/homepage              | Brand Showcase          | REUSE_WITH_ADAPTATION: Editorial content   |
| apps/cms/src/api/journal               | Storytelling / Articles | REUSE_AS_IS: Luxury atelier editorial blog |
| apps/cms/src/api/collection            | Lookbooks & Campaigns   | REUSE_AS_IS: Runway collections, Lookbooks |
| apps/cms/src/api/lookbook              | Visual Campaign Media   | REUSE_AS_IS: High-res video/stills embeds  |
| apps/cms/src/api/merchant-page         | Vendor Storefronts      | REPLACE_OR_DEPRECATE: Disabled             |
+----------------------------------------+-------------------------+--------------------------------------------+
| apps/storefront/src/components/ui      | Design Tokens & Primitives| REUSE_AS_IS: Radix, Lucide, Tailwind 3.4   |
| apps/storefront/src/components/logo    | Brand Heraldry & Logo   | REUSE_AS_IS: Preserved luxury logo & loader|
| apps/storefront/src/components/pdp     | Product Detail View     | REUSE_WITH_ADAPTATION: Legal metrology tags|
| apps/storefront/src/components/checkout| Order Placement         | REUSE_WITH_ADAPTATION: 1-step luxury check |
| apps/storefront/src/components/concierge| Real-Time Client Styling| BUILD_NEW: Floating WhatsApp advisor widget|
| apps/storefront/src/components/merchant| Merchant Profile Pages  | REPLACE_OR_DEPRECATE: Fully removed from UI|
+----------------------------------------+-------------------------+--------------------------------------------+
```

---

## 3. Detailed Adaptation & Decoupling Strategy

### 3.1 Decoupling Marketplace Links in Medusa Backend
In Medusa v2, multi-vendor capabilities were introduced via link definitions (e.g., `defineLink(MerchantModule.linkable.merchant, ProductModule.linkable.product)`).
- **Execution Invariant:** Existing database migrations and link files in `docs/mvp2/` remain strictly untouched.
- **First-Party Brand Mode:** A service-level flag (`COMMERCE_MODE=FIRST_PARTY_BRAND`) instructs the Medusa query layer to bypass merchant entity joins and treat all catalogue products as owned by the central corporate entity (`ATEEVRA_HQ`).

### 3.2 Preserving Storefront Aesthetic Assets
The user experience and visual assets developed in `apps/storefront`—including custom SVG brand marks, typography configuration, gold-leaf accent styling, and preloader animations—are 100% retained and repurposed for the luxury brand.

---
*End of Document `ATEEVRA-ROAD-REUSE-001`. Authorized for Engineering Architecture Implementation.*
