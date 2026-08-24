# CMS-MIGRATION-MASTER-SPECIFICATION

**Project:** Ecom MVP  
**Purpose:** Authoritative CMS migration contract  
**Primary CMS:** Strapi  
**Commerce source:** Medusa  
**Frontend:** Next.js Storefront  
**Status:** Approved planning baseline — implementation not yet performed

---

# 1. Source-of-Truth Rule

This document is based on the completed **CMS Schema Reconciliation & Migration Read-Only Audit**, the 44-item static-content audit, the project's Master Specification, and the existing repository architecture.

The audit verified the repository read-only and reconciled all 44 findings. fileciteturn39file0turn39file3

The ownership model is:

| Domain | Authoritative source |
|---|---|
| Editorial/content/presentation | Strapi |
| Products/variants/SKUs/prices/inventory | Medusa |
| Commerce categories | Medusa |
| Commerce collections | Medusa |
| Product metadata | Medusa |
| Promotions/sale commerce truth | Medusa |
| Brand commerce identity | Medusa product metadata (`product.metadata.brand`) |
| Delivery ETA/serviceability/COD operational availability | Logistics/external capability |
| UI mechanics | Storefront |
| Technical filter/sort labels and UI primitives | Storefront |

**Non-negotiable:** Do not duplicate commerce master data in Strapi. Strapi may reference commerce entities by stable handles/IDs. fileciteturn39file0

---

# 2. Completeness Contract

The static-content audit contains:

- **44 total findings**
- **24 MUST be CMS/DB/API driven**
- **13 SHOULD be CMS/DB/API driven**
- **4 legitimately static/system**
- **3 requiring architectural decisions**

By category:

| Category | Findings |
|---|---:|
| Navigation | 6 |
| Search | 5 |
| Homepage | 6 |
| PDP | 7 |
| PLP | 5 |
| Category / Collection / Brand | 6 |
| Promotion | 4 |
| SEO | 3 |
| UI copy / Other | 2 |
| **Total** | **44** |

By intended source:

| Source | Findings |
|---|---:|
| Strapi CMS | 18 |
| Medusa Commerce DB/API | 14 |
| Strapi + Medusa hybrid | 6 |
| System UI/configuration | 4 |
| Logistics/external API | 2 |
| **Total** | **44** |

These counts are a completeness check. No implementation may silently omit a finding. fileciteturn39file5

---

# 3. Verified Existing Strapi Architecture

The read-only audit verified that Strapi is already substantially implemented:

### Existing content type

```text
api::page.page
```

It supports dynamic zones and the existing editorial sections.

### Existing navigation content type

```text
api::navigation.navigation
```

with:

```text
title
handle
items: JSON
```

### Existing shared SEO

```text
shared.seo
```

### Existing page/section architecture

Already used for:

- homepage;
- sale;
- campaign pages;
- privacy/legal pages;
- other editorial pages.

The existing architecture must be reused rather than replaced. fileciteturn39file18

---

# 4. Final Schema Decision

## 4.1 Only genuinely new Strapi content type

The audit identifies **one** genuinely new schema:

```text
api::global-setting.global-setting
```

It is a **Single Type**.

Do NOT create separate new `Header Settings`, `Footer Settings`, or `Search Settings` content types unless a later repository inspection proves an unavoidable requirement and receives explicit approval.

This correction is important: the read-only audit explicitly concluded that only the Global Setting single type is genuinely new. fileciteturn39file18turn39file19

---

# 5. Global Settings Schema

## Content type

```text
api::global-setting.global-setting
```

## Required conceptual fields

```text
siteName: string
siteTagline?: string
defaultSeo: shared.seo
announcement: elements.announcement-bar
valuePropositions: repeatable elements.value-prop
```

The audit also identified:

```text
announcementText
announcementLink
freeShippingThreshold
```

as global-setting data. The exact final field nesting must follow the existing component architecture after schema inspection. fileciteturn39file19

### Important ownership rule

`freeShippingThreshold` is presentation/configuration only if it is needed for displaying a threshold. It must not become the authoritative commerce/shipping rule if Medusa/shipping configuration owns that rule.

---

# 6. Existing Navigation Schema

## Reuse

```text
api::navigation.navigation
```

No new Navigation content type.

Create/use:

```text
handle = header-nav
```

and:

```text
handle = footer-nav
```

The existing `items` JSON can represent the verified navigation tree.

The audit explicitly confirms this as the correct reuse strategy. fileciteturn39file18turn39file19

---

# 7. Header Navigation Contract

The existing static `navigation.ts` structure must be migrated into the Strapi `header-nav` document.

Conceptual contract:

```ts
interface CmsNavigationItem {
  id: string;
  name: string;
  handle: string;
  href: string;
  badge?: string;
  groups: {
    title: string;
    items: {
      label: string;
      href: string;
      isHot?: boolean;
      isNew?: boolean;
    }[];
  }[];
  featured?: {
    title: string;
    subtitle?: string;
    href: string;
    badge?: string;
    image?: string;
  }[];
}
```

This is a data contract, not permission to change the existing Strapi field structure unnecessarily. fileciteturn39file3

### Consumers that must stop using the static navigation authority

- `desktop-header.tsx`
- `mobile-header.tsx`
- `mega-menu.tsx`
- `mobile-nav-drawer.tsx`
- relevant search-provider navigation dependency

They should use `fetchCmsNavigation('header-nav')` and query Medusa where commerce data is required. fileciteturn39file0turn39file19

---

# 8. Announcement Bar

Current hardcoded announcement content in desktop/mobile headers must become CMS-driven.

Preferred owner:

```text
api::global-setting.global-setting
```

using the existing announcement component:

```text
elements.announcement-bar
```

The audit identifies announcement text/link/threshold as global content. fileciteturn39file19

Do not create a separate Announcement content type.

---

# 9. Footer

## Navigation

Reuse:

```text
api::navigation.navigation
handle = footer-nav
```

It should contain the verified footer link columns.

## Value propositions / brand narrative

Use:

```text
api::global-setting.global-setting
```

and its reusable value-proposition structure.

Do not create a separate Footer Settings content type unless explicitly approved later.

The audit maps footer link columns to `footer-nav` and value propositions/brand story to Global Settings. fileciteturn39file19

## Payment methods

Payment capability must remain consistent with actual configured commerce/payment capabilities. Do not use CMS to claim unsupported payment methods.

---

# 10. Homepage

The existing architecture is already compliant:

```text
api::page.page
slug = homepage
```

with its dynamic zone and existing section components.

The audit verified that the homepage seed already publishes the expected six sections. fileciteturn39file18

### Do not replace this architecture.

### Existing fallback

`DEFAULT_HOMEPAGE_SECTIONS` may remain as an offline/resilience fallback.

It is not the production CMS authority.

The implementation must preserve graceful behavior if CMS is unavailable.

---

# 11. Homepage Section Schema Extensions

Only these specific existing section extensions are identified by the audit.

## `components/sections/hero.json`

Add:

```text
badgeText: string, optional
```

Supports audited hero badge content.

## `components/sections/sale-banner.json`

Add:

```text
badgeText: string, optional
disclaimerText: string, optional
```

## `components/sections/banner.json`

Add:

```text
ctaLabel: string, optional
```

These are **extensions of existing components**, not new content types. fileciteturn39file18

---

# 12. Homepage Commerce Ownership

Homepage editorial configuration comes from Strapi.

Actual products/categories/collections remain commerce-owned.

Therefore:

```text
Strapi
  → section title/copy/order/presentation/references

Medusa
  → products/categories/collections/prices/inventory
```

Do not put product objects or live commerce truth into Strapi.

---

# 13. Sale / Campaign Pages

Reuse:

```text
api::page.page
```

with the existing page types:

```text
sale_page
campaign_page
```

The audit verified existing seeded CMS pages including sale and campaign content. fileciteturn39file18

Do not create separate Sale Page or Campaign Page content types.

Commerce sale truth remains Medusa.

---

# 14. Policy / Legal Pages

Reuse:

```text
api::page.page
```

with:

```text
pageType = policy_page
```

and the existing rich-text/editorial sections.

Do not create a separate Policy Page content type.

The audit verified existing policy-page usage. fileciteturn39file18

---

# 15. Search

## Product/category/collection results

Medusa remains authoritative.

The Phase 15 desktop autocomplete must not use static navigation data as a commerce/search database.

Current issue:

```text
medusa-provider.ts
  → NAVIGATION_CATEGORIES
```

must be removed for dynamic category/collection matching.

## Required dynamic sources

The provider should query Medusa directly for:

```text
/store/product-categories
/store/collections
```

as identified by the audit. fileciteturn39file19

### Search provider responsibility

```text
Medusa
  → product suggestions
  → category suggestions
  → collection suggestions
```

### Curated/trending search content

Trending searches can be supplied by a Strapi-backed search configuration endpoint or equivalent CMS-backed mechanism.

Do not create a dedicated Search Settings content type without explicit architectural approval.

---

# 16. Search Static Content

The current:

```text
TRENDING_SEARCHES
POPULAR_CATEGORIES
```

must be classified separately.

### Trending searches

Business/editorial curated content → CMS-backed.

### Popular categories

The category identity should come from Medusa; any editorial label/order/presentation may come from Strapi.

Do not duplicate the category catalog into Strapi.

---

# 17. Brand Ownership

The project has **no independent first-class Medusa Brand entity**.

Brand truth is currently:

```text
product.metadata.brand
```

Therefore:

- do not invent a Medusa Brand entity;
- do not create a duplicate Strapi commerce Brand directory merely to represent product truth;
- brand PLP/product filtering must query the actual Medusa product metadata representation.

If editorial brand metadata is required, Strapi may own editorial fields while the commerce identity remains the Medusa brand value.

The audit specifically identifies dynamic brand querying as a migration task. fileciteturn39file0turn39file3

---

# 18. Brand Editorial Metadata

If the existing repository has no suitable editorial representation, a brand editorial model may be proposed only after reconciliation.

Potential editorial fields:

```text
brandHandle
displayName
logo
description
heroImage
seo
```

These are editorial fields only.

Do not duplicate:

```text
product relationship
price
inventory
commerce catalog
```

into Strapi.

---

# 19. Category Ownership

Medusa owns:

```text
category identity
category handle
category hierarchy
category relationships
```

Strapi may own editorial presentation where required:

```text
description
hero
marketing copy
SEO
featured presentation
```

Navigation may reference Medusa category handles.

Do not duplicate live category entities into Strapi.

---

# 20. Collection Ownership

Medusa owns:

```text
collection identity
collection handle
product relationships
```

Strapi may own editorial presentation:

```text
description
hero
marketing copy
SEO
featured presentation
```

Navigation may reference Medusa collection handles.

Do not create a CMS collection catalog that duplicates Medusa collections.

---

# 21. PDP Product Metadata

The audit identifies these PDP facts:

- Country of Origin
- Fabric Care
- Package Contains

They are product metadata and belong in:

```text
Medusa product.metadata
```

The PDP specification tabs should bind to actual Medusa product metadata rather than hardcoded strings/data.

This is an implementation task, not a Strapi migration.

The audit explicitly recommends connecting PDP specification tabs to `Medusa product.metadata`. fileciteturn39file3

---

# 22. PDP Policy / Trust Content

Policy copy is editorial and should be sourced from the existing Strapi policy/page architecture or an already-existing reusable CMS structure.

Do not create duplicate policy systems.

Trust/value-proposition content should use Global Settings where appropriate.

---

# 23. PDP Delivery / Pincode

Hardcoded operational delivery information must not be migrated into Strapi.

The target ownership is:

```text
Pincode
  ↓
Delivery/fulfillment capability
  ↓
serviceability / ETA / COD
```

The audit identifies pincode logistics as an external/logistics responsibility.

Do not fabricate ETA or serviceability values in CMS. fileciteturn39file5

---

# 24. PLP

The reusable PLP remains storefront-owned.

Supported contexts:

```text
category
brand
collection
sale/curated
search
```

Commerce data:

```text
Medusa
```

Editorial page content where applicable:

```text
Strapi
```

Filter and sort mechanics remain code-owned.

---

# 25. Search PLP

The `/search?q=<query>` page is a storefront/Medusa search-result experience, not a CMS product-list database.

It must use the reusable PLP engine and Medusa search data.

Strapi may provide editorial SEO/configuration where appropriate.

Do not store search-result products in Strapi.

---

# 26. SEO Ownership

The audit verifies:

### CMS pages

Examples:

```text
/
 /sale
 /pages/*
 /policies/*
```

use Strapi page SEO.

### Commerce routes

Examples:

```text
/category/*
/collections/*
/brand/*
/product/*
/search
```

derive dynamic SEO from commerce/page context using the existing SEO implementation.

Do not create separate SEO content types per route. fileciteturn39file18

Global defaults move to:

```text
api::global-setting.global-setting.defaultSeo
```

---

# 27. Legitimately Static — Do Not Migrate

The audit explicitly verified these as legitimate static/system code:

1. `COLOR_MAP` in `pdp-image-gallery.tsx`
2. `SORT_LABELS` in `interactive-plp-view.tsx`
3. PLP filter UI labels in `plp-filters-panel.tsx`
4. `EmptyState` primitive in `empty-state.tsx`

These must remain code unless the Master Specification is later changed.

The purpose of the CMS migration is not to turn technical UI constants into CMS records. fileciteturn39file18

---

# 28. Static Fallback Rule

A static fallback is acceptable only when it is a resilience mechanism and not the intended production source.

Examples:

```text
DEFAULT_HOMEPAGE_SECTIONS
```

may remain for CMS outage resilience.

However:

- production content must come from CMS when CMS is available;
- commerce fallback products must not remain as fake production data;
- obsolete business-content constants must be removed once their replacement is verified.

---

# 29. Exact Migration Order

## Step 0 — Baseline and backup

Before modifications:

- record current git status;
- preserve existing CMS data;
- inspect existing seeds;
- do not reset/delete databases;
- establish a rollback point.

## Step 1 — Global Settings

Create the single:

```text
api::global-setting.global-setting
```

only if not already present.

Reuse:

```text
shared.seo
elements.announcement-bar
elements.value-prop
```

where available.

Populate:

- site name;
- tagline;
- default SEO;
- announcement content;
- approved value propositions.

Then wire consumers.

## Step 2 — Header and Footer Navigation

Populate:

```text
header-nav
footer-nav
```

in existing:

```text
api::navigation.navigation
```

Then migrate:

- Desktop Header
- Mobile Header
- Mega Menu
- Mobile Navigation Drawer
- Footer

from static `navigation.ts`/footer data to CMS navigation.

## Step 3 — Search Provider Decoupling

Change:

```text
medusa-provider.ts
```

so category/collection discovery uses Medusa APIs rather than `NAVIGATION_CATEGORIES`.

Preserve the Phase 14/15 search contracts:

- debounce;
- cancellation;
- stale-response protection;
- product suggestions;
- category suggestions;
- collection suggestions;
- deterministic routing.

Do not introduce brand/future search functionality as part of this migration unless explicitly approved.

## Step 4 — Brand Dynamic Querying

Replace:

```text
KNOWN_BRANDS
```

with dynamic querying against the actual Medusa product metadata representation.

Do not invent a first-class Brand entity.

## Step 5 — PDP Metadata Binding

Bind PDP specification tabs to:

```text
product.metadata
```

for the audited product fields.

## Step 6 — Homepage / Existing Page Content

Verify all existing CMS-seeded homepage/sale/campaign/policy pages.

Only migrate remaining hardcoded editorial values not already represented by the existing CMS page/dynamic-zone architecture.

Apply only the approved component extensions:

- Hero `badgeText`
- Sale Banner `badgeText`
- Sale Banner `disclaimerText`
- Banner `ctaLabel`

## Step 7 — Search Editorial Configuration

Move curated/trending search presentation to CMS-backed configuration.

Keep category/product/collection truth in Medusa.

## Step 8 — Operational Delivery

Do not move delivery truth into Strapi.

Connect the pincode/delivery experience to the appropriate logistics/fulfillment capability.

## Step 9 — Static Content Cleanup

Only after each replacement is proven:

- remove obsolete business-content constants;
- remove unused `navigation.ts` business data;
- remove obsolete `KNOWN_BRANDS`;
- remove production mock commerce fallbacks;
- remove dead imports;
- update tests.

---

# 30. Migration Pattern

Every individual migration must follow:

```text
1. Identify current hardcoded source
        ↓
2. Identify authoritative target
        ↓
3. Verify existing target schema/API
        ↓
4. Seed/migrate target data
        ↓
5. Implement target reader
        ↓
6. Switch consumer
        ↓
7. Validate CMS/Medusa data
        ↓
8. Validate desktop + mobile UI
        ↓
9. Run regression tests
        ↓
10. Remove obsolete source
```

Never:

```text
delete source → hope CMS works
```

---

# 31. No-Duplication Rules

Never create Strapi records for:

- products;
- variants;
- SKUs;
- prices;
- inventory;
- live category catalog;
- live collection catalog;
- product/category relationships;
- product/collection relationships;
- promotion rules;
- delivery ETA;
- pincode serviceability.

Strapi may contain references such as:

```text
categoryHandle
collectionHandle
```

but the actual entity remains Medusa-owned.

---

# 32. CMS Seed Rules

Creating a schema is not enough.

The migration must also populate the required Strapi data.

Seed scripts must be:

- safe;
- non-destructive;
- repeatable/idempotent where practical;
- compatible with existing content;
- publish required production documents;
- preserve media references where possible.

Do not wipe existing Strapi content.

---

# 33. Required Verification Per Migration

For every migrated field/content source:

### Source verification

- [ ] Current hardcoded source identified.
- [ ] Target source identified.
- [ ] Ownership verified.
- [ ] Existing schema/API verified.

### Data verification

- [ ] CMS/Medusa record exists.
- [ ] Values match the audited current content.
- [ ] No duplicate commerce data created.

### Runtime verification

- [ ] Storefront fetches the new source.
- [ ] Old source is no longer authoritative.
- [ ] UI renders correctly.
- [ ] Links/routes remain correct.
- [ ] Desktop verified.
- [ ] Mobile verified where applicable.

### Regression

- [ ] lint
- [ ] typecheck
- [ ] unit tests
- [ ] relevant browser validation
- [ ] build, subject to the known Windows environment issue already documented for this project

Never report PASS when validation is blocked.

---

# 34. CMS Editability Test

For every editorial migration, perform this proof:

```text
Open Strapi Content Manager
        ↓
Change one migrated field
        ↓
Publish
        ↓
Refresh storefront
        ↓
Verify changed value appears
        ↓
No code change
```

This is the definitive proof that the content is genuinely CMS-driven.

---

# 35. Commerce Ownership Test

For commerce data:

```text
Change Medusa commerce data
        ↓
Refresh storefront
        ↓
Verify storefront reflects Medusa change
```

Strapi must not need to be edited.

---

# 36. Static Audit After Migration

After implementation, repeat a repository-wide static-content search.

The final audit must confirm:

- no migrated navigation data remains as runtime authority;
- no migrated announcement copy remains;
- no `KNOWN_BRANDS` production authority remains;
- no migrated search editorial constants remain;
- no migrated PDP product facts remain;
- no production mock commerce data remains;
- no duplicate CMS/Medusa source has been introduced.

The four legitimate static categories must still be present only where appropriate.

---

# 37. 44-Finding Reconciliation Requirement

AGY must maintain a final matrix with exactly one row for each audit finding:

| # | Category | Finding | Current Source | Current File | Intended Owner | Existing Schema/API | Required Change | Data Migration | Consumer | Validation | Status |
|---|---|---|---|---|---|---|---|---|---|---|---|

Required status values:

```text
ALREADY COMPLIANT
MIGRATE TO STRAPI
MIGRATE/QUERY MEDUSA
MIGRATE TO LOGISTICS/API
HYBRID
KEEP STATIC
BLOCKED — NEEDS DECISION
```

No finding may be silently omitted.

---

# 38. Final Strapi Schema Inventory

After reconciliation, the expected architecture is:

## Existing and reused

```text
api::page.page
api::navigation.navigation
shared.seo
existing sections/components
existing announcement component
existing value-prop component
```

## One new type

```text
api::global-setting.global-setting
```

## Existing component extensions

```text
hero.badgeText
sale-banner.badgeText
sale-banner.disclaimerText
banner.ctaLabel
```

## Not automatically new types

Do NOT create these merely because they appear in conceptual planning:

```text
Header Settings
Footer Settings
Search Settings
Navigation V2
SEO V2
Product CMS
Category CMS
Collection CMS
Brand Commerce CMS
```

Reuse existing architecture or keep the domain in Medusa.

---

# 39. Final Storefront Dependency Direction

Correct:

```text
Strapi
  ↓
strapi-client
  ↓
editorial components
```

and:

```text
Medusa
  ↓
commerce client/provider
  ↓
commerce components
```

Incorrect:

```text
navigation.ts
  ↓
MedusaSearchProvider
```

Incorrect:

```text
Strapi
  ↓
duplicate product catalog
```

Incorrect:

```text
Storefront hardcoded value
  ↓
production business truth
```

---

# 40. Final Acceptance Criteria

## Coverage

- [ ] All 44 findings accounted for.
- [ ] All 24 MUST findings resolved.
- [ ] All 13 SHOULD findings resolved or explicitly deferred.
- [ ] All 3 architectural decisions resolved/documented.
- [ ] Four legitimate static categories preserved.

## Strapi

- [ ] Existing Page architecture reused.
- [ ] Existing Navigation reused.
- [ ] Existing SEO reused.
- [ ] Global Settings implemented only once.
- [ ] No unnecessary duplicate content types.
- [ ] CMS data populated.
- [ ] CMS content editable through Content Manager.

## Navigation

- [ ] Desktop header reads CMS navigation.
- [ ] Mobile header reads CMS navigation.
- [ ] Mega Menu reads CMS navigation.
- [ ] Mobile drawer reads CMS navigation.
- [ ] Footer uses CMS navigation.
- [ ] Static navigation is no longer runtime authority.

## Search

- [ ] Product suggestions come from Medusa.
- [ ] Category suggestions come from Medusa.
- [ ] Collection suggestions come from Medusa.
- [ ] Curated/trending search content is CMS-backed where specified.
- [ ] Search provider no longer depends on `NAVIGATION_CATEGORIES`.
- [ ] Existing Phase 14/15 behavior remains intact.

## Homepage

- [ ] Existing Strapi page remains authoritative.
- [ ] Approved section extensions are implemented.
- [ ] Product/catalog truth remains Medusa-owned.
- [ ] Offline fallback remains only as resilience.

## PDP

- [ ] Product specifications come from Medusa metadata.
- [ ] Policy content comes from existing Strapi architecture.
- [ ] Delivery data is not fabricated or CMS-owned.

## PLP

- [ ] Category/brand/collection/search commerce data remains Medusa-owned.
- [ ] Editorial page content uses Strapi where applicable.
- [ ] Filter/sort mechanics remain storefront-owned.

## Cleanup

- [ ] Obsolete static business datasets removed only after replacement verification.
- [ ] Mock production commerce data removed.
- [ ] Dead imports removed.
- [ ] Tests updated.
- [ ] Repository-wide static-content audit repeated.

---

# 41. Implementation Guardrails for AGY

AGY must:

1. Read this specification completely.
2. Read the 44-phase AI specification.
3. Read `AGENT-RULES.md`.
4. Read the complete static-content audit.
5. Treat the read-only audit as evidence, not as permission to invent architecture.
6. Reuse existing Strapi schemas before creating anything.
7. Create only the approved Global Settings type unless a new requirement is explicitly approved.
8. Never duplicate Medusa commerce truth in Strapi.
9. Never invent a first-class Medusa Brand entity.
10. Never use static navigation data as a substitute for Medusa taxonomy.
11. Preserve existing Phase 14/15 search behavior while decoupling its data source.
12. Do not start unrelated future phases.
13. Do not modify `next.config.mjs` unless separately justified and approved.
14. Do not perform destructive CMS/database resets.
15. Do not hide, suppress, or loop indefinitely on errors.
16. If a validation fails, report the exact error.
17. Make only a justified fix within the approved migration scope.
18. If the same issue persists or is environmental, stop and report it.
19. Never claim completion while content is mocked, fallback-only, partially wired, or not actually editable from the intended source.

---

# 42. Definition of Done

The CMS migration is complete only when:

```text
44 findings
    ↓
100% accounted for
    ↓
ownership verified
    ↓
existing schemas reused
    ↓
Global Settings added/verified
    ↓
CMS data populated
    ↓
navigation migrated
    ↓
homepage/editorial content verified
    ↓
search decoupled
    ↓
brand querying corrected
    ↓
PDP metadata corrected
    ↓
policy/SEO ownership corrected
    ↓
operational data correctly sourced
    ↓
obsolete static business sources removed
    ↓
CMS editability verified
    ↓
Medusa ownership verified
    ↓
desktop/mobile regression verified
    ↓
final static-content audit passes
```

The final proof is:

> An authorized editor can change intended editorial content in Strapi and see that change in the storefront without changing code, while products, prices, inventory, categories, collections, brand commerce identity, product metadata, and operational commerce data continue to come from their authoritative systems.

---

# 43. Important Architectural Correction

This specification supersedes any earlier generic proposal that listed `Header Settings`, `Footer Settings`, or `Search Settings` as independent new Strapi content types.

The verified audit found that these concerns can be represented through:

- `api::global-setting.global-setting`;
- `api::navigation.navigation`;
- existing `api::page.page`;
- existing components;
- Medusa APIs.

Only the Global Settings Single Type is identified as a genuinely new schema candidate. fileciteturn39file18turn39file19

---

# 44. Status

**Planning:** Complete  
**Repository reconciliation:** Complete and read-only  
**Schema implementation:** Not started  
**Data migration:** Not started  
**Storefront migration:** Not started  
**Static-content cleanup:** Not started  
**Approval required before implementation:** Yes
