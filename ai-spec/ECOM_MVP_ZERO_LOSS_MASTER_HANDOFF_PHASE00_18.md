# ECOM MVP --- ZERO-LOSS MASTER HANDOFF

## Phases 00--18 + Architecture + CMS + Search + Authentication

**Project:** Ecom MVP\
**Workspace:** `C:\Users\Shubham\OneDrive\Desktop\ecom_mvp`\
**Current phase:** **Phase 18 --- Existing Login & New Registration**\
**Current status:** **IN PROGRESS**

## 0. Purpose

This is the cumulative continuation handoff for the Ecom MVP. It
preserves known phase history, implementation decisions, validation
evidence, CMS/search/auth architecture, operational lessons, user
constraints, and unresolved historical gaps.

**Accuracy rule:** this document never invents missing historical facts.
Exact Phase 00--08 requirements and some historical AGY responses are
not recoverable from the currently accessible project artifacts; they
are explicitly marked as unavailable. The complete 44-phase AI
specification and live repository remain authoritative for those gaps.

## 1. Source-of-truth hierarchy

1.  `MASTER-SPECIFICATION.md`
2.  Exact phase `prompt.md`
3.  `AGENT-RULES.md`
4.  `INITIAL-AGENT-INSTRUCTIONS.md`
5.  Complete 44-phase AI specification / phase ZIP
6.  This handoff
7.  Previous project handoffs
8.  Current repository
9.  Existing tests/validation artifacts
10. AGY execution logs/reports.

If this handoff conflicts with an authoritative phase specification, the
specification wins.

## 2. Engineering rules

For every phase:

-   Inspect first.
-   Read the authoritative specification.
-   Inspect git status/diff.
-   Reuse existing architecture.
-   Implement only the current phase.
-   Avoid duplicate clients/services/components.
-   Preserve completed phases.
-   Preserve CMS/Medusa ownership.
-   Add/update tests.
-   Validate browser behavior where applicable.
-   Inspect network/console where relevant.
-   Review git diff/status.
-   Report exact PASS/FAIL evidence.
-   STOP.

Never hallucinate, suppress errors, fake PASS, create fake data to claim
completion, implement future phases early, repeatedly retry/poll,
casually reset databases, delete Docker volumes, or modify
`next.config.mjs` as a workaround.

If validation fails:

`exact error → root cause → one justified minimal fix → affected validation once → if persistent/environmental STOP and report`

## 3. Architecture

### Storefront

Next.js App Router, React, TypeScript, responsive desktop/mobile UI,
reusable ProductCard/ProductGrid, reusable PLP/PDP/search architecture.

### CMS

Strapi + PostgreSQL.

### Commerce

Medusa + PostgreSQL.

### Infrastructure

Redis, PostgreSQL, Docker, Docker volumes, local development services.

Conceptually:

``` text
Browser
  |
  v
Next.js Storefront
  |                  |
  v                  v
Strapi              Medusa
  |                  |
PostgreSQL         PostgreSQL

Redis
  |
temporary/auth/runtime state
```

## 4. Ownership boundaries

### Strapi owns

-   homepage composition
-   hero/banner/marketing copy
-   navigation presentation/merchandising
-   footer editorial content
-   campaign presentation
-   curated/trending search presentation
-   policy/editorial snippets
-   SEO
-   global settings
-   editorial brand/category/collection metadata
-   CMS media
-   page dynamic-zone composition.

### Medusa owns

-   products
-   variants
-   SKUs
-   prices
-   inventory
-   categories
-   collections
-   commerce taxonomy
-   product relationships
-   product metadata/specifications where applicable
-   promotions/sale commerce truth
-   availability
-   carts
-   orders
-   customers
-   commerce/search data
-   shipping/fulfillment/payment capabilities.

### External/logistics owns

-   pincode serviceability
-   delivery ETA
-   operational delivery availability.

### Storefront code owns

-   UI mechanics
-   responsive behavior
-   filtering/sorting mechanics
-   keyboard behavior
-   loading/error behavior
-   debounce/cancellation/stale-response protection
-   generic UI primitives
-   genuinely static design-system constants.

**Core rule:** move business/editorial truth to the authoritative owner;
do not convert every UI string into CMS.

## 5. Database/runtime safety

A real Strapi empty-content incident occurred. PostgreSQL showed zero
rows for pages/navigations/files even though tables existed.

Never casually:

-   drop `strapi_db`
-   drop Medusa DB
-   reset PostgreSQL
-   delete Docker volumes
-   wipe CMS data
-   wipe Medusa data
-   reseed unnecessarily.

Useful historical commands:

``` powershell
docker volume ls
docker inspect ecom-dev-postgres --format '{{.Created}}'
docker inspect ecom-dev-postgres --format '{{json .Mounts}}'
docker exec ecom-dev-postgres psql -U postgres -d strapi_db -c "SELECT COUNT(*) FROM pages;"
```

Do not kill all Node processes blindly.

## 6. Known repository structure

``` text
ecom_mvp/
├── apps/
│   ├── cms/
│   └── storefront/
├── infrastructure/
├── ai-spec/
├── MASTER-SPECIFICATION.md
├── AGENT-RULES.md
└── package.json
```

Known CMS schema/component families:

``` text
navigation
page
elements/category-item
sections/banner
sections/category-tiles
sections/collection-carousel
sections/hero
sections/product-carousel
sections/product-grid
sections/promotional-cta
sections/rich-text
sections/sale-banner
shared/seo
```

Local URLs:

``` text
Storefront: http://localhost:3000
Strapi Admin: http://localhost:1337/admin
Medusa: http://localhost:9000
```

# 7. Phase 00--08

All are historically recorded as **COMPLETED**, but the exact original
task names, requirements, implementation details, validation and
verbatim AGY reports are not exposed in the currently accessible project
artifacts.

Therefore:

  Phase   Status      Evidence detail
  ------- ----------- ----------------------------------------
  00      Completed   Exact historical details not recovered
  01      Completed   Exact historical details not recovered
  02      Completed   Exact historical details not recovered
  03      Completed   Exact historical details not recovered
  04      Completed   Exact historical details not recovered
  05      Completed   Exact historical details not recovered
  06      Completed   Exact historical details not recovered
  07      Completed   Exact historical details not recovered
  08      Completed   Exact historical details not recovered

Do **not** invent these phases. Recover exact information from the
complete 44-phase specification/repository if needed.

# 8. Phase 09 --- CMS-Driven Homepage

**Status: COMPLETED**

Known scope:

-   CMS-driven homepage
-   hero banners
-   category tiles
-   collection sections
-   product carousels/grids
-   sale banners
-   new-arrival sections
-   optional recommendation sections
-   Strapi section composition
-   Medusa live commerce data
-   optional section failure must not crash page
-   loading/error states
-   no AI recommendation engine.

Architecture:

``` text
Strapi → page sections → storefront renderer → Medusa commerce data
```

Homepage section visible-item behavior should be CMS-configurable where
specified; responsive behavior determines actual layout. Desktop
generally uses CMS-controlled visible counts; mobile generally shows up
to two items with slider behavior when more exist.

# 9. Phase 10 --- CMS Seed/Bootstrap/Data Restoration

**Status: COMPLETED**

Root cause of earlier empty Strapi Content Manager:

`seed-homepage.cjs` existed but was not integrated into startup.

Resolution:

``` text
strapi.documents('api::page.page').create(...)
strapi.documents('api::navigation.navigation').create(...)
```

Known seeded pages:

-   Homepage
-   Mega Season Finale Sale
-   Summer Solstice Campaign 2026
-   Royal Festive Kurtas Edit
-   About Us
-   Privacy Policy

Known navigation:

-   Main Header Navigation
-   Footer Navigation

Important lesson: `DEFAULT_HOMEPAGE_SECTIONS` was a fallback. Never
confuse fallback content with actual CMS data.

# 10. Phase 11 --- Reusable PLP

**Status: COMPLETED**

Reusable PLP supports:

-   Category
-   Collection
-   Brand
-   Sale
-   Search context later.

Known capabilities:

-   product grid/cards
-   filters
-   sorting
-   pagination/loading
-   URL state
-   responsive behavior.

Commerce remains Medusa-owned.

# 11. Phase 12 --- Homepage Product Sections + PLP/Infinite Loading

**Status: COMPLETED**

Existing PLPs:

-   Category
-   Collection
-   Brand
-   Sale

Desktop:

-   View More
-   filters
-   sorting
-   pagination
-   URL state.

Mobile:

-   IntersectionObserver
-   infinite loading
-   deduplication.

Loading/error rules:

-   preserve loaded products during loading
-   preserve loaded products after errors
-   avoid duplicate next-page requests
-   prevent View More storms
-   prevent repeated IntersectionObserver requests
-   deduplicate products.

Previously discussed breakpoints:

`375, 390, 399, 400, 450, 499, 500, 768, 1024, 1280, 1440`

Avoid horizontal overflow, clipping, unintended wrapping and unexplained
right-side blank space.

Reported validation:

``` text
npm run typecheck      PASS
npm run lint           PASS
npm test               PASS
npm run build          PASS
node infrastructure/scripts/verify-task12.mjs PASS
```

Verification:

`18/18 checks passed`

Evidence limitation: audit catalog had only 16 products while preferred
batch was 24. A targeted 50--60 product smoke validation was requested
to demonstrate multiple batches, correct offsets, no duplicate
requests/products and end-of-data behavior.

# 12. Phase 13 --- PDP / Mini PDP / Image Gallery

**Status: COMPLETED**

Known implementation includes:

-   Full PDP
-   Mini PDP
-   image gallery/zoom
-   product image behavior
-   variant logic
-   PDP API/data route
-   PDP context
-   Mini PDP context.

Known paths included:

``` text
apps/storefront/src/app/product/
apps/storefront/src/app/api/products/[handle]/
apps/storefront/src/components/pdp/
apps/storefront/src/components/pdp/pdp-image-gallery.tsx
```

Mobile image-viewer intent:

-   main image click opens dedicated viewer/overlay
-   not merely zooming inside original image box
-   image-focused viewer
-   Back/close
-   zoom/pan
-   color swatches when applicable
-   preserve selected product/variant/color
-   close returns to previous PDP/Mini-PDP state
-   desktop behavior remains intact.

Important historical source-fidelity note: the exact 44-phase roadmap
was temporarily unavailable when color/size/variant questions were
discussed, so those specific roadmap requirements were explicitly marked
NOT VERIFIED rather than invented.

# 13. Phase 13.2 --- PDP Navigation / Share / Config

**Status: COMPLETED**

Scope:

-   Mobile Back Navigation
-   direct PDP URL Back fallback
-   Mini PDP Back/Close
-   mobile image viewer Back
-   canonical PDP sharing
-   Web Share API
-   clipboard fallback
-   environment separation
-   centralized config layer.

Share must use canonical full PDP URL.

Never share:

-   Mini PDP state
-   image viewer state
-   API URL
-   Admin URL
-   temporary UI state
-   hardcoded localhost URL.

Environment files:

``` text
.env.local
.env.qa
.env.production
```

Rules:

-   no hardcoded secrets
-   no real secrets committed
-   no client-side server secrets
-   preserve `NEXT_PUBLIC_*`
-   no duplicate environment values.

Config structure:

``` text
apps/storefront/src/config/
├── env.ts
├── api.ts
└── index.ts
```

Keep configuration simple; no custom configuration framework.

A previous Phase 13.2 execution was interrupted by AGY quota. The
continuation rule was to inspect repository/task state rather than
restart the phase. The later phase history records 13.2 complete.

# 14. Phase 14 --- Search Foundation + Header Scroll UX

**Status: COMPLETED**

Search foundation:

-   SearchProvider abstraction
-   separate `suggestions()` and full `search()`
-   Medusa-backed provider
-   debounce
-   cancellation
-   stale-response protection
-   reusable normalized interfaces
-   no duplicate API/client architecture.

Explicit non-goals:

-   Elasticsearch
-   OpenSearch
-   Algolia
-   Meilisearch
-   Phase 15 desktop UI
-   Phase 16 mobile UI.

Header UX:

-   full header at top
-   scroll down hides categories/navigation and compacts header
-   scroll up restores appropriately
-   `scrollY = 0` restores exact full header
-   rapid direction changes must not flicker/layout-jump
-   preserve mega-menu/mobile nav
-   no second header architecture.

Testing includes search, header behavior, previous-phase regressions,
network/console and runtime validation.

# 15. Phase 15 --- Desktop Search UI & Autocomplete

**Status: COMPLETED / ACCEPTED**

Features:

-   desktop search combobox
-   debounce
-   direct query
-   category suggestions
-   collection suggestions
-   product suggestions
-   product image/name/price/discount
-   View All Results
-   ArrowDown/ArrowUp/Enter/Escape/Tab
-   ARIA combobox/listbox/option
-   loading/empty/error states
-   trending/popular empty-query state.

Routing:

``` text
Product    → /product/[handle]
Category   → /category/[handle]
Collection → /collections/[handle]
Search     → /search?q=[query]
```

Collection guard:

``` ts
f.href.startsWith('/collections/')
```

Therefore `/sale` is never converted into a collection suggestion.

Phase 15 unit suite:

`84/84 PASS across 44 suites`

Browser validation encountered headless CDP synthetic focus/click/timing
issues. The production SearchBar was not changed merely to satisfy a
broken harness; condition/event-based waiting was preferred.

# 16. Search PLP Architecture / `/search`

The master specification requires a full reusable Search PLP.

Architecture:

``` text
Phase 11 → reusable PLP
Phase 14 → search data foundation
Phase 15 → desktop autocomplete
Phase 16 → mobile search + /search
```

Initially `/search` returned 404 because
`apps/storefront/src/app/search/page.tsx` did not exist. It was
subsequently implemented.

Required Search PLP:

-   query binding
-   product grid
-   filters
-   sorting
-   infinite loading
-   URL state
-   zero results
-   loading
-   errors
-   browser back/forward
-   refresh/deep-linking.

Do not create a second PLP.

# 17. Search Stale Response Bug

Observed:

``` text
/search?q=pajama
→ 0 results

change to chanderi
→ count changes
→ product grid remains stale
```

Required:

``` text
pajama → results A
chanderi → results B
```

Rapid sequence must also be safe:

``` text
pajama → kurta → chanderi
```

Approved fix:

`apps/storefront/src/components/plp/interactive-plp-view.tsx`

uses active request ID/sequence protection so only the newest response
can update displayed products.

# 18. Phase 16 --- Mobile Search / Core Search MVP

**Status: COMPLETED / ACCEPTED**

Relevant changed files included:

``` text
apps/storefront/src/app/search/page.tsx
apps/storefront/src/components/layout/search-bar.tsx
apps/storefront/src/components/plp/interactive-plp-view.tsx
apps/storefront/src/components/search/mobile-search-view.tsx
apps/storefront/scripts/run-tests.mjs
ai-spec/16-mobile-search/enhancedSearchPrompt.md
```

Generated:

`apps/storefront/tsconfig.tsbuildinfo` should not be committed.

Core MVP supports:

-   product search
-   category search
-   collection search
-   brand search
-   sale/curated discovery
-   full search PLP
-   desktop autocomplete
-   mobile search.

### Product

Product matching/suggestions, product → PDP, full search → Search PLP.

### Category

Dynamic Medusa categories.

Do not use hardcoded category arrays, `NAVIGATION_CATEGORIES`, or
duplicate Strapi category catalog.

Route:

`/category/[handle]`

### Collection

Dynamic Medusa collections.

Do not use hardcoded collection arrays or navigation.ts as a commerce
database.

Route:

`/collections/[handle]`

### Brand

No first-class Medusa Brand entity.

Brand truth:

`product.metadata.brand`

Do not create Medusa Brand entity, duplicate Strapi commerce-brand
catalog, or second brand database.

Route:

`/brand/[handle]`

### Sale/curated

Reuse:

``` text
/sale
/sale/all
```

Commerce truth = Medusa `onSaleOnly`.

Editorial content = Strapi.

Do not create Sale commerce catalog/content type.

Never treat `/sale` as collection.

### Mobile

Preserve Phase 16 architecture:

-   mobile search
-   query updates
-   product results
-   category/collection/brand navigation where surfaced
-   ZSR
-   infinite loading
-   debounce
-   cancellation
-   back navigation.

### Advanced search excluded

Do not add:

-   Elasticsearch
-   Algolia
-   Meilisearch
-   Typesense
-   OpenSearch
-   vector search
-   AI/ML search.

# 19. CMS Static-Content Audit

Audit result:

``` text
44 findings
24 MUST
13 SHOULD
4 legitimately static/system
3 architectural decisions
```

Category totals:

``` text
Navigation                 6
Search                     5
Homepage                   6
PDP                        7
PLP                        5
Category/Collection/Brand  6
Promotion                  4
SEO                        3
UI/Other                   2
Total                     44
```

Intended sources:

``` text
Strapi CMS                 18
Medusa Commerce DB/API     14
Strapi + Medusa hybrid      6
System UI/configuration     4
Logistics/external API      2
Total                      44
```

No finding may be silently omitted.

# 20. CMS Migration Master Specification

Files:

``` text
CMS-MIGRATION-MASTER-SPECIFICATION.md
CMS-MIGRATION-MASTER-SPECIFICATION-FINAL.md
```

These define the target ownership/migration contract.

## New Strapi schema

Exactly one genuinely new type:

``` text
api::global-setting.global-setting
```

Single Type.

## Reuse existing

``` text
api::page.page
api::navigation.navigation
shared.seo
existing sections
```

Do not create merely:

``` text
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

## Global Settings

Fields:

``` text
siteName
siteTagline
defaultSeo
announcementText
announcementLink
freeShippingThreshold
valuePropositions
footerAboutText
```

## Navigation

``` text
header-nav
footer-nav
```

## Section extensions

Hero:

`badgeText`

Sale Banner:

`badgeText` `disclaimerText`

Banner:

`ctaLabel`

## Approved seed scripts

``` text
apps/cms/scripts/seed-global-settings.cjs
apps/cms/scripts/seed-navigation.cjs
```

## CMS ownership

Homepage uses existing `api::page.page`.

Sale/campaign pages reuse page architecture.

Policy pages reuse page architecture with policy page type.

Search commerce identity comes from Medusa.

Trending/curated search can be CMS-backed without a new Search Settings
type.

Brand commerce identity remains Medusa product metadata.

Category/collection commerce identity remains Medusa.

## Static code that legitimately remains static

Examples include:

-   design-system/UI primitives
-   PLP sort options
-   filter headers
-   generic empty-state mechanics
-   technical PDP image-gallery constants where appropriate.

Do not migrate every string to CMS.

## Delivery pincode

Simulated text such as:

`Delivery available in 3-5 business days`

is logistics/external-system responsibility, not CMS.

## Site-name discrepancy

Observed:

`env.ts → Gulmohar Fashion`

Target:

`EcomFashion`

Target environment:

`NEXT_PUBLIC_SITE_NAME=EcomFashion`

Align Strapi Global Settings and runtime configuration.

# 21. Phase 17 --- OTP Authentication Foundation

**Status: COMPLETED / ACCEPTED**

Exact title:

**Phase 17 --- OTP Authentication Foundation**

Scope:

-   mobile as primary auth
-   Redis temporary OTP state
-   expiration
-   resend
-   attempt tracking
-   external SMS/OTP provider
-   server-side secrets
-   rate limiting.

Explicit non-goals:

-   passwords
-   social login.

Accepted implementation:

-   cryptographically secure OTP
-   Redis state
-   approximately 300-second TTL
-   HMAC-SHA256 OTP storage in production
-   verification-attempt protection
-   mobile rate limiting
-   IP rate limiting
-   replay prevention
-   SMS abstraction
-   Mock/Fast2SMS/Twilio structure
-   provider failure handling
-   S2S protection
-   development-only OTP fetch
-   production fail-closed
-   no duplicate customer DB.

Routes:

``` text
/api/auth/otp/request
/api/auth/otp/verify
/api/auth/otp/dev-fetch
```

Validation:

``` text
120/120 unit tests PASS
8/8 live auth route/Redis integration tests PASS
production storefront build PASS
security/architecture/git-scope audit PASS
```

Real telecom SMS was not validated; Mock provider was used in automated
tests.

Phase 17 did NOT create:

``` text
/signin
/login
/account
registration UI
login UI
```

### Development-only OTP

`fetchOtp` may return OTP during development/testing using context such
as:

-   `otpType`
-   mobile number
-   S2S authorization.

Must remain unavailable/secure in production.

# 22. Phase 18 --- Existing Login & New Registration

**Status: IN PROGRESS**

Authoritative file:

`ai-spec/18-auth-registration/prompt.md`

## Exact scope

Existing:

``` text
mobile
→ lookup
→ OTP
→ verify
→ session
```

New:

``` text
registration
→ OTP
→ verify
→ Medusa customer/session
```

Original prompt explicitly states registration data:

-   name
-   email
-   mobile.

Explicit non-goals:

-   referral code
-   passwords
-   address fields.

The user additionally requested:

-   First Name
-   Last Name
-   Gender
-   DOB
-   Mobile Number
-   Email ID.

These additional fields must be verified against the authoritative Phase
18 specification before implementation. Do not silently invent fields.
Never add referral code, password, address or age.

## Login UX

Must contain:

-   `Welcome to EcomFashion` or equivalent
-   mobile field
-   Generate OTP CTA
-   New user registration link.

After successful OTP request:

``` text
Mobile
  ↓ smooth transition
OTP
```

OTP screen:

-   OTP inputs
-   heading
-   Login/Verify
-   Back
-   Resend OTP
-   countdown.

## OTP box contract

User requested 4 visual boxes.

Phase 17 currently uses a 6-digit OTP.

Therefore inspect the authoritative contract first.

If 6 digits → 6 boxes.

If authoritative Phase 18 changes to 4 → update contract and tests
safely.

Never create frontend/backend mismatch.

OTP UX:

-   first input focused automatically
-   smooth focus transfer
-   digit advances
-   backspace goes backward
-   paste complete OTP
-   numeric-only
-   numeric mobile keyboard
-   clear focus
-   no cursor jumping.

## Resend

-   Resend OTP link
-   countdown
-   disabled during countdown
-   enabled after countdown
-   real API call
-   timer reset after successful resend
-   rate-limit/provider errors.

No fake resend.

## Registration

Requested UX:

-   First Name
-   Last Name
-   Gender
-   DOB
-   Mobile Number
-   Email ID
-   Already a user? Login
-   Submit.

After success:

`Registration → smooth transition → OTP`

OTP component shared with login.

## Login/register links

Login:

`New user? Register`

Registration:

`Already have an account? Login`

Preserve intended destination.

## Responsive

Mobile:

``` text
Login: Mobile → OTP
Registration: Registration → OTP
```

Desktop:

``` text
Login: Modal → Mobile → OTP
Registration: Modal → Registration → OTP
```

Reuse existing modal/dialog system.

## Design

Soft, elegant, smooth, attractive, premium/minimal, matching
EcomFashion.

Reuse existing typography, spacing, colors, buttons, inputs, icons,
radius, modal primitives, breakpoints and animation conventions.

## Mobile field

Reuse Phase 17 validation/normalization.

Need:

-   valid Indian mobile
-   +91 behavior
-   numeric input
-   mobile keyboard
-   max length
-   smooth typing
-   no cursor jumping
-   accessible labels
-   validation.

No duplicate validation.

## Session

Existing:

``` text
server-side customer lookup
→ Phase 17 OTP
→ verification
→ canonical Medusa session
```

New:

``` text
registration
→ Phase 17 OTP
→ verification
→ Medusa customer creation
→ session
```

No duplicate customer DB/session architecture.

## Intended destination

Example:

``` text
/checkout
→ login
→ OTP
→ authenticated
→ /checkout
```

Only safe internal destinations.

No open redirects.

## Logout

Must:

-   invalidate canonical session
-   clear client auth state
-   clear stale customer information
-   return to unauthenticated state.

## Reusable components

Inspect existing equivalents first.

Possible shared pieces:

``` text
AuthModal
AuthStep/Screen
MobileNumberInput
OtpInput
OtpVerificationStep
LoginForm
RegistrationForm
AuthTransition
```

Names are illustrative, not mandatory.

OTP must be shared.

## Accessibility

Support:

-   keyboard
-   labels
-   ARIA
-   focus
-   dialog semantics
-   tab order
-   screen-reader errors
-   OTP semantics
-   loading/disabled states.

First OTP input gets focus on render.

## Phase 18 tests

Login:

-   mobile validation
-   customer lookup
-   OTP request
-   OTP verification
-   session
-   success
-   wrong OTP
-   expired OTP
-   rate limits
-   provider error
-   logout.

Registration:

-   authoritative fields
-   mobile
-   email
-   submission
-   OTP
-   verification
-   Medusa customer creation
-   session
-   duplicate handling.

OTP UI:

-   box count
-   initial focus
-   digit advance
-   backspace
-   paste
-   invalid chars
-   resend timer
-   disabled/enabled resend
-   resend failure
-   Back.

Navigation:

-   Login ↔ Register
-   Login/Register → OTP
-   OTP → Back
-   intended destination.

Session:

-   authenticated state
-   refresh persistence
-   logout
-   logged-out state.

## E2E

Real browser validation, not API-only:

Existing user:

1.  login
2.  valid mobile
3.  Generate OTP
4.  development OTP retrieval where appropriate
5.  enter OTP
6.  authenticated
7.  intended destination
8.  logout
9.  logged-out.

New user:

1.  registration
2.  authoritative fields
3.  submit
4.  OTP screen
5.  first OTP focused
6.  dev OTP retrieval where appropriate
7.  enter OTP
8.  Medusa customer created
9.  session
10. destination
11. logout.

Also wrong OTP, expired OTP, resend, rate limit, Back, Login/Register
switching.

## Phase 18 security

Preserve Phase 17:

-   no production OTP leakage
-   no client secrets
-   no S2S token client-side
-   dev-fetch unavailable in production
-   no open redirects
-   canonical session
-   no bypass
-   no fake customers.

## Phase 18 validation

Run:

1.  lint
2.  typecheck
3.  unit tests
4.  integration tests
5.  desktop E2E
6.  mobile E2E
7.  production build
8.  git status
9.  git diff.

Do not unnecessarily rerun unrelated already-passing checks.

# 23. Build / Environment Incident

A manual storefront production build previously completed successfully
and generated:

``` text
/
_api/products
_api/products/[handle]
_api/search
_api/search/suggestions
/brand/[handle]
/category/[handle]
/collections/[handle]
/pages/[slug]
/policies/[slug]
/product/[handle]
/sale
/sale/all
/search
```

During that build, repeated Strapi HTTP 401 errors appeared for:

-   pages
-   header navigation
-   footer navigation
-   global settings.

The build still completed successfully.

A read-only investigation was requested to determine why. Do not invent
the outcome unless an actual report exists.

# 24. AGY Operational Lessons

AGY has previously become stuck during CDP/browser debugging, consumed
quota through repeated polling, and sometimes stopped displaying logs
even when work had happened.

If logs disappear:

-   inspect repository state
-   inspect git status/diff
-   inspect actual command output
-   inspect task state once
-   restart/reopen the same AGY conversation if necessary
-   do not duplicate implementation work.

Prefer one targeted investigation and one justified fix over loops.

# 25. Phase Master Record

``` text
00  COMPLETED — exact historical details not recovered
01  COMPLETED — exact historical details not recovered
02  COMPLETED — exact historical details not recovered
03  COMPLETED — exact historical details not recovered
04  COMPLETED — exact historical details not recovered
05  COMPLETED — exact historical details not recovered
06  COMPLETED — exact historical details not recovered
07  COMPLETED — exact historical details not recovered
08  COMPLETED — exact historical details not recovered
09  COMPLETED — CMS-driven homepage
10  COMPLETED — CMS seed/bootstrap/data restoration
11  COMPLETED — reusable PLP
12  COMPLETED — PLP/infinite loading/homepage product sections
13  COMPLETED — PDP/Mini PDP/image gallery
13.2 COMPLETED — navigation/share/environment/config
14  COMPLETED — Search Foundation + Header Scroll UX
15  COMPLETED — Desktop Search UI & Autocomplete
16  COMPLETED — Mobile Search/Core Search MVP
17  COMPLETED / ACCEPTED — OTP Authentication Foundation
18  IN PROGRESS — Existing Login & New Registration
19  NOT STARTED
```

# 26. Important Phase Boundary Corrections

Do not call Phase 18:

`Customer Profile & Session Architecture`

That was conversational shorthand and is not the authoritative title.

Use:

**Phase 18 --- Existing Login & New Registration**

Do not confuse Phase 17 and Phase 18:

``` text
Phase 17 = backend OTP foundation
Phase 18 = actual login + registration + session UX/flow
```

Phase 17 did not create `/signin` or `/login`.

# 27. Search/CMS/Auth Continuity

Correct direction:

``` text
Strapi
  ↓
strapi-client
  ↓
editorial components
```

``` text
Medusa
  ↓
commerce/search provider
  ↓
commerce/search components
```

``` text
Phase 17 OTP
  ↓
Phase 18 login/registration
  ↓
future auth/account phases
```

Do not duplicate these layers.

# 28. Zero-Loss Reconciliation Procedure for the Next Chat

When starting the next chat:

1.  Upload this handoff.
2.  Upload/provide the complete 44-phase AI-spec ZIP if it is not
    automatically accessible.
3.  Provide `MASTER-SPECIFICATION.md`, `AGENT-RULES.md`, and Phase 18
    prompt if necessary.
4.  First perform a READ-ONLY reconciliation of this handoff against the
    44-phase specification.
5.  Recover exact Phase 00--08 names/scopes/details from the
    authoritative ZIP instead of guessing.
6.  Recover any exact historical AGY responses available in
    repository/phase artifacts.
7.  Compare phase statuses.
8.  Preserve all validated later-phase details from this handoff.
9.  Inspect the live repository.
10. Continue Phase 18 only.

## Recommended next-chat prompt

``` text
Continue the Ecom MVP from this ZERO-LOSS MASTER HANDOFF.

Phase 18 — Existing Login & New Registration is IN PROGRESS.

Treat:
- MASTER-SPECIFICATION.md
- AGENT-RULES.md
- INITIAL-AGENT-INSTRUCTIONS.md
- complete 44-phase AI specification
- this handoff
- current repository

as authoritative.

First perform a READ-ONLY reconciliation of this handoff against the complete 44-phase specification. Recover exact Phase 00–08 names, requirements, implementation records, validation and decisions if present. Do not guess missing historical information.

Then inspect the current repository/git status and current Phase 18/AGY state.

Do NOT restart completed phases.
Do NOT redo CMS migration.
Do NOT redo Core Search.
Do NOT redo Phase 17 OTP.
Do NOT start Phase 19.

Continue ONLY remaining Phase 18 work.

Preserve all Medusa/Strapi ownership boundaries, Phase 17 security, Phase 18 UX requirements, reusable architecture, validation rules, and no-loop/error-handling rules.

If any historical detail is not supported by the authoritative source, explicitly mark it unknown instead of hallucinating it.
```

# 29. Accuracy Contract

This handoff is intended to be **zero-loss with respect to all
information currently recoverable from the project context**.

It deliberately does NOT manufacture:

-   exact missing Phase 00--08 task names
-   exact missing Phase 00--08 implementation details
-   unavailable verbatim AGY responses
-   unsupported PDP/variant requirements
-   unsupported future-phase functionality.

The authoritative 44-phase ZIP/repository must be used to fill those
gaps.

# END OF ZERO-LOSS MASTER HANDOFF
