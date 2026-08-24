# CMS-MIGRATION-MASTER-SPECIFICATION

**Project:** Ecom MVP  
**Document:** CMS Migration Master Specification  
**Status:** Architecture / migration contract  
**Implementation status:** Not started by this document  
**Primary CMS:** Strapi  
**Commerce platform:** Medusa  
**Frontend:** Next.js Storefront

---

## 1. Purpose

This document defines the target ownership model and migration contract for moving static business/editorial content out of the storefront codebase and into the correct authoritative source.

It is derived from the project's Master Specification, 44-phase AI specification, completed static-content audit, and existing Strapi/Medusa architecture identified during the audit.

This document is a **contract before coding**. A read-only reconciliation of the current repository and current Strapi/Medusa schemas must happen before implementation.

---

## 2. Non-Negotiable Architecture

### Strapi owns editorial/content/presentation

- homepage composition
- hero/banner/marketing copy
- navigation presentation and merchandising
- footer editorial content
- campaign presentation
- curated/trending search presentation
- policy/editorial snippets
- SEO content
- global site settings
- editorial brand/category/collection metadata
- CMS media

### Medusa owns commerce

- products
- variants
- SKUs
- prices
- inventory
- categories
- collections
- product relationships
- commerce taxonomy
- product metadata/specifications where applicable
- promotions/sale commerce truth
- availability
- carts
- orders
- customers
- shipping/fulfillment/payment capabilities

### Logistics/external systems own operational delivery data

- pincode serviceability
- delivery ETA
- operational delivery availability

### Storefront code owns UI mechanics

- UI mechanics
- responsive behavior
- filtering/sorting mechanics
- keyboard behavior
- loading/error mechanics
- debounce/cancellation/stale-response protection
- generic UI primitives
- genuinely static design-system constants

> **Core rule:** Do not convert every literal string into CMS content. Move business/content truth to its authoritative owner; leave application mechanics static.

---

## 3. Audit Coverage

The completed static-content audit reports:

- **44 findings**
- **24 MUST**
- **13 SHOULD**
- **4 legitimately static**
- **3 architectural decisions**

Category totals:

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
| UI / Other | 2 |
| **Total** | **44** |

Intended-source totals:

| Intended source | Findings |
|---|---:|
| Strapi CMS | 18 |
| Medusa Commerce DB/API | 14 |
| Strapi + Medusa hybrid | 6 |
| System UI/configuration | 4 |
| Logistics/external API | 2 |
| **Total** | **44** |

These totals are a completeness constraint; implementation must account for every finding.

---

## 4. Existing Architecture Reuse Rule

Before creating anything in Strapi:

1. Inspect all existing Strapi content types.
2. Inspect all existing Strapi components.
3. Inspect existing Page and section models.
4. Inspect existing Navigation.
5. Inspect existing shared SEO.
6. Inspect current Strapi seed/bootstrap data.
7. Inspect the storefront Strapi client and queries.
8. Inspect Medusa catalog models/APIs.
9. Reuse an existing schema when it can represent the requirement.
10. Extend an existing schema when a small field addition is sufficient.
11. Create a new type/component only when the existing architecture genuinely cannot represent the requirement.

Do not create duplicate versions such as `NavigationV2`, duplicate SEO systems, one content type per string, or duplicate Medusa commerce entities in Strapi.

---

# 5. Target Strapi Model

## 5.1 Existing models to reuse/extend

The current project already uses/references CMS structures for:

- Page
- Navigation
- shared SEO
- Hero
- Banner
- Category Tiles
- Collection Carousel
- Product Carousel
- Product Grid
- Promotional CTA
- Rich Text
- Sale Banner
- shared media/link structures

These must be inspected and reused before new models are introduced.

---

## 5.2 Global Site Settings

Preferred target: **Single Type — Global Site Settings**

Fields:

```text
siteName
brandTagline
defaultSeoTitle
defaultSeoDescription
defaultOgImage
favicon
trustHighlights[]
```

Trust highlight:

```text
title
description
icon
enabled
sortOrder
```

Includes the audited global site name, global/default SEO and global trust/value-proposition content.

---

## 5.3 Header Settings

Preferred target: **Single Type — Header Settings**

Fields:

```text
announcementEnabled
announcementText
shippingMessage
codMessage
trackOrderEnabled
supportEnabled
announcementLinks[]
```

Link:

```text
label
destinationType
destination
openInNewTab
enabled
sortOrder
```

A shipping threshold or other actual commerce rule must not be duplicated into CMS if the authoritative rule is owned by Medusa/shipping configuration.

---

## 5.4 Navigation

The current static navigation tree must not remain the runtime business-content authority.

Reuse/extend the existing Strapi Navigation model.

Target structure:

```text
Navigation
├── key
├── title
├── enabled
├── sections[]
└── footerColumns[]
```

Section:

```text
label
slug/key
enabled
sortOrder
destination
destinationType
```

Group:

```text
title
enabled
sortOrder
items[]
```

Item:

```text
label
destinationType
destination
badge
badgeVariant
enabled
sortOrder
```

Featured item:

```text
title
description
image
destination
destinationType
badge
enabled
sortOrder
```

---

## 5.5 Category / Collection / Campaign Boundary

Do not duplicate commerce taxonomy into Strapi.

### Medusa owns

```text
category identity
category handle
category hierarchy
collection identity
collection handle
product relationships
```

### Strapi owns

```text
navigation label
navigation placement
featured presentation
marketing image
promotional badge
CTA
sort order
editorial copy
```

A CMS navigation item may reference a Medusa entity by canonical identifier:

```text
destinationType = category
destination = <Medusa category handle>
```

or:

```text
destinationType = collection
destination = <Medusa collection handle>
```

Promotional routes such as `/sale` are campaigns/pages and must not be falsely represented as Medusa collections.

---

## 5.6 Header / Navigation Consumers

After migration, these should consume CMS navigation/configuration:

- Desktop Header
- Mobile Header
- Mega Menu
- Mobile Navigation Drawer
- Footer navigation
- relevant curated search/navigation presentation

The storefront must no longer use the old static navigation dataset as runtime business content.

---

## 5.7 Footer

Reuse existing footer/navigation structures where possible.

### Value propositions

```text
title
description
icon
enabled
sortOrder
```

### Brand story

```text
brandStoryTitle
brandStoryBody
brandStoryCtaLabel
brandStoryCtaDestination
```

### Footer navigation

Use the authoritative Navigation model where applicable; do not maintain a second independent static footer tree.

### Payment badges

Actual payment capability must come from configured payment methods. Strapi may control presentation/order but must not claim unsupported capabilities.

---

# 6. Homepage

The existing section-based CMS architecture is the authoritative homepage composition model.

Reuse:

- Hero
- Category Tiles
- Collection Carousel
- Product Carousel
- Product Grid
- Banner
- Sale Banner
- Promotional CTA
- Rich Text

Do not create another homepage CMS architecture.

### Hero

Possible fields, subject to existing schema reconciliation:

```text
eyebrow
title
subtitle
description
image
mobileImage
ctaLabel
ctaDestination
badge
```

### Sale Banner

Possible fields:

```text
eyebrow
title
subtitle
disclaimer
ctaLabel
ctaDestination
```

### Promotional Banner / CTA

Possible fields:

```text
title
subtitle
ctaLabel
destination
image
```

### Product Feed

CMS may own:

```text
title
subtitle
presentation/configuration
```

Products remain Medusa-owned.

### Category Tiles

Target:

```text
Category Tiles
├── title
├── subtitle
└── tiles[]
```

Tile:

```text
label
image
destination
destinationType
sortOrder
enabled
```

Category identity remains Medusa-owned.

### Collection Carousel

Strapi may own collection handles/order and editorial presentation. Medusa supplies the actual collection/products.

Do not migrate mock product objects into Strapi.

---

# 7. Sale / Campaign

The existing CMS Page/section architecture should own sale-page editorial composition.

Static fallback sale sections must not be the production authority after CMS content is populated.

Optional campaign metadata, only if existing models cannot represent it:

```text
key
title
subtitle
badge
description
seo
active
```

Do not duplicate product prices, inventory, product lists, or promotion rules into Strapi.

Sale SEO must reuse the shared SEO architecture.

---

# 8. Search

## Search Settings

Create/reuse a Search Settings single type only after confirming no existing equivalent exists.

Possible fields:

```text
enabled
trendingQueries[]
popularCategories[]
emptySearchMessage
zeroResultsMessage
```

Trending query:

```text
query
enabled
sortOrder
destination
```

Popular category:

```text
categoryHandle
labelOverride
enabled
sortOrder
```

Do not duplicate the entire Medusa category catalog into Strapi.

## Search architecture

```text
SearchBar
  ↓
useSearch
  ↓
Search Provider
  ↓
Medusa
```

Medusa supplies products/categories/collections and commerce taxonomy.

Strapi supplies curated/trending search content and editorial search configuration where appropriate.

The search provider must not use `navigation.ts` as a substitute database.

---

# 9. Brand / Category / Collection Editorial Model

## Brands

Do not create a duplicate Strapi commerce brand database.

First verify the actual Medusa project representation.

Medusa/current commerce representation owns:

```text
brand identity
brand handle
product → brand relationship
```

Optional Strapi editorial metadata:

```text
brandHandle
displayName
logo
description
heroImage
seo
```

## Categories

Medusa:

```text
category name
category handle
category hierarchy
category relationships
```

Strapi may provide:

```text
editorial description
hero image
marketing copy
SEO
featured presentation
```

## Collections

Medusa:

```text
collection name
collection handle
product relationships
```

Strapi may provide:

```text
editorial description
hero image
marketing copy
SEO
featured presentation
```

Do not duplicate commerce identity into Strapi.

---

# 10. PDP

## Product facts

The audited PDP facts such as:

- Country of Origin
- Fabric Care
- Package Contains

are product/commercial metadata and should come from Medusa product data/metadata.

Do not move duplicated product truth into Strapi.

## Policy content

Shipping/return/COD policy copy is editorial/policy content.

Reuse the existing Strapi policy/page architecture where available. Do not create duplicate policy sources.

Possible reusable policy snippet:

```text
key
title
body
enabled
sortOrder
```

## Trust highlights

May use the reusable Global Site Settings trust-highlight component:

```text
title
description
icon
enabled
sortOrder
```

Capability-dependent statements must remain consistent with actual commerce/payment/shipping capabilities.

## Delivery/pincode

Hardcoded ETA/serviceability is not CMS content.

Target:

```text
Pincode
  ↓
Delivery Availability Provider
  ↓
Logistics/Fulfillment/Medusa capability
  ↓
ETA + serviceability + COD availability
```

Never present fabricated operational information.

## Mock products

Hardcoded product objects are not CMS content.

They must be removed from the production path and replaced by Medusa.

A test fixture may remain only when explicitly isolated from production runtime.

---

# 11. PLP

The reusable PLP engine remains storefront-owned and supports:

- category
- brand
- collection
- sale/curated
- search

Medusa supplies product/catalog data.

Strapi may supply page/editorial presentation such as:

- title
- subtitle
- campaign badge
- hero
- editorial description
- SEO

Filter/sort mechanics remain in storefront code.

## Search PLP

`/search?q=<query>` must use the reusable PLP engine:

1. Read `q` from URL.
2. Pass `q` to commerce search/query layer.
3. Render Medusa products.
4. Support existing PLP filter/sort/infinite loading/URL state.
5. Render ZSR appropriately.
6. Use shared SEO architecture.

Search result data is not CMS content.

---

# 12. SEO

Reuse the existing shared SEO component.

### Global

Strapi Global Site Settings:

```text
defaultSeoTitle
defaultSeoDescription
defaultOgImage
siteName
```

### Page-specific

Existing Page/section or editorial entity:

```text
seo.title
seo.description
seo.ogImage
seo.canonical
```

Do not create separate SEO implementations per route.

---

# 13. URL Ownership

CMS-managed links should store canonical business/page identifiers rather than unnecessary frontend implementation URLs.

Generic link:

```text
label
destinationType
destination
openInNewTab
enabled
sortOrder
```

Examples:

```text
destinationType = category
destination = women-kurta-sets
```

```text
destinationType = collection
destination = festive-glam
```

```text
destinationType = page
destination = about-us
```

```text
destinationType = external
destination = https://...
```

The storefront route resolver generates the actual Next.js route.

---

# 14. Proposed Reusable Strapi Components

These are proposals only and must be reconciled against existing schemas before creation.

### Shared

```text
seo
link
badge
cta
media
trust-highlight
policy-snippet
```

### Navigation

```text
navigation-section
navigation-group
navigation-item
navigation-featured-item
```

### Search

```text
trending-query
popular-category
```

### Editorial

```text
brand-meta
category-meta
collection-meta
campaign-meta
```

---

# 15. Proposed Strapi Content-Type Inventory

Preferred target after reconciliation:

### Single Types

```text
Global Site Settings
Header Settings
Footer Settings
Search Settings
```

### Existing/reused

```text
Page
Navigation
Shared SEO
Hero
Banner
Category Tiles
Collection Carousel
Product Carousel
Product Grid
Promotional CTA
Rich Text
Sale Banner
```

### Potential editorial collections

Only when required and not already represented:

```text
Brand Editorial
Category Editorial
Collection Editorial
Campaign Metadata
Policy Snippets
```

These are candidates, not guaranteed new types.

---

# 16. Ownership Matrix

| Data | Owner |
|---|---|
| Product | Medusa |
| Variant | Medusa |
| SKU | Medusa |
| Price | Medusa |
| Inventory | Medusa |
| Category | Medusa |
| Collection | Medusa |
| Product/category relationship | Medusa |
| Product/collection relationship | Medusa |
| Brand commerce identity | Medusa/current commerce representation |
| Product specifications | Medusa |
| Sale price | Medusa |
| Promotion rules | Medusa |
| Availability | Medusa |
| Shipping capability | Medusa/configuration |
| Fulfillment | Medusa/logistics |
| Delivery ETA | Logistics/external |
| Pincode serviceability | Logistics/external |
| Homepage composition | Strapi |
| Hero copy | Strapi |
| Banner copy | Strapi |
| Navigation presentation | Strapi |
| Mega-menu merchandising | Strapi |
| Footer copy | Strapi |
| Footer links | Strapi |
| Search curated content | Strapi |
| Editorial brand content | Strapi |
| Editorial category content | Strapi |
| Editorial collection content | Strapi |
| Campaign copy | Strapi |
| Policy copy | Strapi |
| SEO | Strapi |
| Global site settings | Strapi |
| UI mechanics | Storefront |
| Filter/sort mechanics | Storefront |
| Search debounce/cancellation | Storefront |
| Generic UI primitives | Storefront |

---

# 17. Legitimately Static Content

These remain code unless a future specification changes the requirement:

1. `COLOR_MAP`
2. `SORT_LABELS`
3. PLP filter UI labels
4. Generic `EmptyState`

A basic 404/error boundary should also remain static unless a future explicit requirement introduces CMS-managed error pages, because error handling must remain functional if CMS is unavailable.

---

# 18. Migration Sequence

## Migration 0 — Read-only reconciliation

Inspect:

- current Strapi schemas/components;
- current Strapi data;
- seed/bootstrap;
- storefront CMS client;
- Medusa catalog models;
- complete static-content audit;
- this specification.

No modifications.

## Migration 1 — Global Settings

Migrate:

- site name;
- default SEO;
- trust content;
- header settings;
- footer content.

## Migration 2 — Navigation

Migrate the existing static navigation into the existing Strapi Navigation architecture.

Switch:

- desktop header;
- mobile header;
- mega menu;
- mobile drawer;
- footer.

## Migration 3 — Homepage

Migrate:

- hero;
- category tiles;
- collection presentation;
- product-feed presentation;
- promotional banners;
- sale banner.

## Migration 4 — Search

Migrate:

- trending searches;
- curated search settings;
- remove static navigation dependency from search provider.

## Migration 5 — Taxonomy / Editorial

Migrate:

- brand editorial;
- category editorial;
- collection editorial;

while keeping commerce identity in Medusa.

## Migration 6 — Sale / Campaign

Migrate:

- sale editorial content;
- campaign metadata;
- sale SEO.

## Migration 7 — PDP

Migrate:

- policy copy;
- trust content;

and move product-specific facts to Medusa metadata where required.

## Migration 8 — Operational data

Replace mock delivery information with the correct delivery provider abstraction/integration.

## Migration 9 — Cleanup

Only after all consumers are switched and validated:

- remove obsolete static business datasets;
- remove duplicate constants;
- remove production mock data;
- remove unused imports;
- update tests;
- update seed/bootstrap;
- update documentation.

---

# 19. Migration Safety

Never:

```text
delete static content
→ assume CMS is populated
```

Use:

```text
static source
→ populate CMS / verify Medusa
→ implement new reader
→ switch consumer
→ validate UI
→ regression tests
→ remove obsolete source
```

Do not perform destructive CMS/database resets.

Existing CMS content must be preserved.

---

# 20. CMS Seed/Data Migration

Creating a schema is insufficient.

The migration must populate Strapi with existing business/editorial content.

The migration must:

- preserve existing CMS documents;
- create missing content safely;
- avoid destructive replacement;
- be idempotent where possible;
- publish required documents;
- preserve existing media references where possible.

---

# 21. Required Read-Only Reconciliation

Before any schema/code modification, produce:

| Audit Finding | Current File | Current Source | Current Owner | Existing Strapi Type | Existing Fields | Medusa Source | Intended Owner | Reuse/Extend/New | Migration | Evidence | Confidence |
|---|---|---|---|---|---|---|---|---|---|---|---|

Every one of the 44 audit findings must appear.

If something cannot be verified:

`UNKNOWN — requires verification during implementation.`

Do not invent repository facts.

---

# 22. Required Strapi Reconciliation

Inventory:

- content types;
- single types;
- components;
- relations;
- fields;
- media;
- navigation;
- page models;
- SEO;
- seed/bootstrap scripts.

Classify every proposed target:

```text
REUSE EXISTING
EXTEND EXISTING
NEW TYPE REQUIRED
NEW COMPONENT REQUIRED
NOT STRAPI — MEDUSA
NOT STRAPI — LOGISTICS
KEEP STATIC
```

---

# 23. Required Medusa Reconciliation

Verify the actual project implementation for:

- product;
- variant;
- category;
- collection;
- brand;
- product metadata;
- price;
- inventory;
- promotion;
- availability.

Do not assume that a first-class Medusa Brand entity exists.

---

# 24. Required Storefront Data-Flow Audit

Document:

```text
Strapi
 ↓
Strapi API
 ↓
strapi-client / adapter
 ↓
storefront component
```

and:

```text
Medusa
 ↓
commerce client/provider
 ↓
storefront component
```

For every audit finding, identify the current and intended path.

---

# 25. Testing Contract

Every migrated domain must have validation.

### CMS editability

Change a CMS value and verify the storefront changes without code modification.

### Navigation

Verify:

- desktop;
- mega menu;
- mobile;
- footer.

### Search

Verify:

- search input;
- autocomplete;
- curated content;
- product/category/collection destinations;
- no static navigation dependency.

### Commerce

Change Medusa catalog data and verify the storefront reflects it.

### PDP

Verify product metadata and policy content separately.

### Sale

Verify CMS campaign copy and Medusa commerce data independently.

### SEO

Verify title, description, canonical and OG data where applicable.

### Regression

Run the repository's actual:

- lint;
- typecheck;
- unit tests;
- integration tests;
- desktop browser validation;
- mobile browser validation;
- CMS runtime validation;
- Medusa runtime validation.

Do not claim PASS when a required validation is blocked.

---

# 26. Acceptance Criteria

The migration is complete only when:

### Coverage

- [ ] All 44 audit findings are accounted for.
- [ ] All 24 MUST findings are resolved.
- [ ] All 13 SHOULD findings are resolved or explicitly deferred with justification.
- [ ] All 3 architectural decisions are explicitly resolved.
- [ ] The 4 legitimate static categories remain appropriately static.

### Ownership

- [ ] No product/category/collection commerce master data is duplicated into Strapi.
- [ ] No delivery/ETA truth is stored as CMS content.
- [ ] Editorial content is CMS-owned.
- [ ] UI mechanics remain storefront-owned.

### Navigation

- [ ] Static navigation is no longer the runtime business-content authority.
- [ ] Desktop header works.
- [ ] Mobile header works.
- [ ] Mega menu works.
- [ ] Mobile drawer works.
- [ ] Footer navigation works.

### Homepage

- [ ] Homepage marketing content is CMS-driven.
- [ ] Product data remains Medusa-driven.
- [ ] Category/collection identity remains Medusa-driven.

### Search

- [ ] Curated search configuration is CMS-driven where applicable.
- [ ] Product/category/collection results come from Medusa.
- [ ] Search provider does not depend on static navigation content.

### PDP

- [ ] Product facts come from Medusa.
- [ ] Policy/editorial content comes from Strapi.
- [ ] Operational delivery data is not fabricated.

### CMS

- [ ] Content Manager exposes required fields.
- [ ] Content can be changed without code deployment.
- [ ] No unnecessary duplicate content types exist.
- [ ] Existing CMS data is preserved.

### Cleanup

- [ ] Obsolete production business-content constants are removed.
- [ ] Production mock commerce data is removed.
- [ ] Unused imports are removed.
- [ ] Tests are updated.

---

# 27. Final Architecture

```text
                         ┌──────────────────────────┐
                         │         STRAPI           │
                         │                          │
                         │ Global Settings          │
                         │ Header                   │
                         │ Footer                   │
                         │ Navigation               │
                         │ Homepage Sections        │
                         │ Campaigns                │
                         │ Search Configuration     │
                         │ Policies                 │
                         │ Editorial Metadata       │
                         │ SEO                      │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                              CMS Content Layer
                                      │
                                      ▼
                               NEXT.JS STOREFRONT
                                      ▲
                                      │
                         ┌────────────┴─────────────┐
                         │                          │
                         ▼                          ▼
                    STRAPI DATA                MEDUSA DATA
                    Editorial                  Commerce
                         │                          │
                         │                    Products
                         │                    Categories
                         │                    Collections
                         │                    Variants
                         │                    Prices
                         │                    Stock
                         │
                         └────────────┬─────────────┘
                                      │
                                      ▼
                               Storefront UI
                                      │
                                      ▼
                         Logistics / External APIs
                         for operational delivery
```

The final ownership rule is:

> **Strapi = editorial/content/presentation.**  
> **Medusa = commerce/catalog truth.**  
> **Logistics = operational delivery truth.**  
> **Storefront = UI behavior and mechanics.**

---

# 28. Implementation Guardrails

When this document is used as an implementation contract, the agent must:

1. Read this document completely.
2. Read the Master Specification and Agent Rules.
3. Read the complete static-content audit.
4. Perform read-only reconciliation first.
5. Show exact current schemas before proposing new ones.
6. Never invent missing repository facts.
7. Never duplicate Medusa commerce data into Strapi.
8. Never create one-off content types for individual strings.
9. Reuse existing Strapi section/content models wherever possible.
10. Do not modify unrelated phases/features.
11. Do not hide errors.
12. Do not repeatedly retry a failing validation.
13. If validation fails, report the exact error and stop according to the approved execution plan.
14. Do not claim migration completion if content is mocked, fallback-only, partially wired, or not editable through the intended authoritative source.

---

# 29. Definition of Done

```text
44 Audit Findings
        ↓
100% accounted for
        ↓
Ownership verified
        ↓
Strapi schemas reconciled
        ↓
Medusa schemas reconciled
        ↓
Migration implemented
        ↓
CMS populated
        ↓
Storefront consumers migrated
        ↓
Static business content removed
        ↓
CMS editing verified
        ↓
Medusa ownership verified
        ↓
Regression validation passed
```

The final proof is:

> An authorized content editor can change intended editorial content in Strapi, the storefront reflects the change without code changes, and commerce/operational data continues to come from its correct authoritative source.

---

## Document Status

**CMS Migration Master Specification:** Ready for read-only reconciliation.

**Schema implementation:** Not started.

**Content migration:** Not started.

**Static-content cleanup:** Not started.

**Approval required before implementation:** Yes.
