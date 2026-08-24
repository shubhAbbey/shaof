# CORE SEARCH MVP — FINAL IMPLEMENTATION TASK

You are implementing the remaining CORE search functionality for the ecommerce MVP.

The CMS migration is already complete. Do NOT redo or redesign the CMS architecture.

==================================================
1. READ THESE FIRST — MANDATORY
==================================================

Before modifying anything, read and analyze:

1. MASTER-SPECIFICATION.md
2. AGENT-RULES.md
3. INITIAL-AGENT-INSTRUCTIONS.md
4. Complete 44-phase AI specification
5. Phase 14 Search Foundation specification
6. Phase 15 Desktop Search specification
7. Phase 16 Mobile Search specification
8. CMS-MIGRATION-MASTER-SPECIFICATION-FINAL.md
9. Latest CMS Schema Reconciliation & Implementation-Readiness / completion reports
10. Current repository state, git diff and existing tests.

Then inspect the actual implementation of:

- search provider
- useSearch
- search API routes
- SearchBar
- mobile search
- /search page
- reusable PLP engine
- filters
- sorting
- infinite loading
- URL state
- category PLP
- brand PLP
- collection PLP
- sale/curated PLP
- Medusa product/category/collection APIs
- current Strapi integration
- current CMS-backed navigation/search configuration

DO NOT assume that the previous phase reports are perfectly accurate.
Verify the current repository before changing anything.

==================================================
2. OBJECTIVE
==================================================

Complete the CORE ecommerce search experience for the MVP using the existing:

- Next.js storefront
- existing search architecture
- Medusa
- Strapi where editorial/configuration content is appropriate
- existing reusable PLP architecture.

Do NOT introduce a dedicated search platform.

Do NOT implement advanced search.

==================================================
3. FINAL MVP SEARCH SCOPE
==================================================

The final MVP must support these core search capabilities:

### A. Product Search

Users can search products through the existing search provider and Medusa.

Must support:

- product matching
- product suggestions
- product → PDP
- full product search → Search PLP

Reuse the existing Phase 14/15 implementation.

DO NOT create another search implementation.

--------------------------------------------------

### B. Category Search

Search must dynamically discover matching commerce categories.

Category data must come from Medusa.

Do NOT use:

- hardcoded category arrays
- NAVIGATION_CATEGORIES
- duplicate category data in Strapi.

Category result:

query
→ matching category
→ /category/[handle]

Verify both autocomplete and full navigation behavior.

--------------------------------------------------

### C. Collection Search

Search must dynamically discover matching Medusa collections.

Do NOT use:

- hardcoded collection arrays
- navigation.ts as a commerce database
- duplicate collection catalog in Strapi.

Collection result:

query
→ matching collection
→ /collections/[handle]

Verify autocomplete and navigation end-to-end.

--------------------------------------------------

### D. Brand Search / Brand PLP

Implement core brand discovery/search.

IMPORTANT:

The current commerce architecture does NOT have a dedicated Medusa Brand entity.

Brand truth is:

product.metadata.brand

Therefore:

- DO NOT create a Medusa Brand entity.
- DO NOT create a duplicate Strapi commerce-brand catalog.
- DO NOT create a second brand database.
- Reuse the existing product metadata representation.
- Dynamically derive/search brands from the actual Medusa product data/API capability.

Brand search must support:

query
→ matching brand
→ /brand/[handle]

Use the existing reusable brand PLP.

If the current Medusa/API architecture cannot efficiently provide a distinct brand endpoint, inspect the existing implementation and implement the smallest reusable solution using the available Medusa data.

Do NOT invent an API that does not exist.

--------------------------------------------------

### E. Sale / Curated Search

Support core discovery/navigation for sale and curated commerce destinations.

Reuse the existing:

- /sale
- /sale/all
- reusable PLP
- Medusa sale filtering.

Do NOT create duplicate CMS commerce catalogs.

Do NOT create a new Sale content type.

The existing approved architecture is:

- commerce/product truth → Medusa
- editorial sale content → Strapi
- PLP rendering → reusable storefront PLP.

Verify that sale discovery/search navigation does not incorrectly treat /sale as a Medusa collection.

--------------------------------------------------

### F. Desktop Autocomplete

Preserve the existing Phase 15 desktop autocomplete.

It must continue to support:

- product suggestions
- category suggestions
- collection suggestions
- brand suggestions if the core brand-search implementation requires surfacing them
- View All Results
- product → PDP
- category → category PLP
- collection → collection PLP
- brand → brand PLP
- Enter with no active suggestion → Search PLP
- ArrowUp
- ArrowDown
- Enter
- Escape
- loading
- empty
- error states.

Do not rebuild the SearchBar.

Extend the existing implementation only where required.

--------------------------------------------------

### G. Full Search PLP

The existing:

/search?q=<query>

must be a complete reusable search PLP.

Verify and fix only what is actually missing.

It must support:

- query binding
- product results
- filters
- sorting
- infinite loading
- URL state
- zero results
- loading
- error handling
- browser back/forward
- refresh/deep-linking.

Reuse the existing PlpView/PLP engine.

Do NOT create a second PLP.

--------------------------------------------------

### H. Mobile Search

Preserve the existing Phase 16 mobile search architecture.

Verify that:

- mobile search works
- search query updates correctly
- product results update correctly
- category/collection/brand navigation works where surfaced
- ZSR works
- infinite loading works
- debounce works
- cancellation works
- back navigation works.

Do not duplicate desktop search logic unnecessarily.

==================================================
4. CRITICAL BUG TO VERIFY/FIX
==================================================

There was a previously observed desktop bug:

/search?q=pajama
→ 0 results

User changes query to:

chanderi

and presses Enter.

URL changes to:

/search?q=chanderi

but the product grid remains stale and still shows the previous pajama result state.

This MUST be explicitly tested.

Required behavior:

pajama
→ results A

change to chanderi
→ results B

The UI must not retain stale results from pajama.

Also test rapid transitions:

pajama
→ kurta
→ chanderi

and ensure an older asynchronous response can never overwrite the newest query.

Reuse the existing Phase 14 cancellation/stale-response protection rather than creating another mechanism.

==================================================
5. CORE SEARCH BEHAVIOR
==================================================

The following are REQUIRED for MVP:

- Product search
- Category search
- Collection search
- Brand search
- Sale/curated discovery
- Desktop autocomplete
- Mobile search
- Full Search PLP
- ZSR
- Filters
- Sorting
- Infinite loading
- URL state
- Debounce
- Request cancellation
- Stale-response protection
- Loading/error/empty states.

==================================================
6. EXPLICITLY OUT OF SCOPE
==================================================

DO NOT implement:

- Elasticsearch
- Algolia
- Meilisearch
- Typesense
- OpenSearch
- vector search
- semantic search
- AI search
- personalized search
- ML ranking
- advanced ranking engine
- dedicated typo-correction engine
- advanced synonym engine
- query-learning/ranking analytics
- recommendation engine
- conversational search.

Typo tolerance/synonyms may ONLY be used if the existing Medusa/basic implementation already provides them naturally without introducing a dedicated search platform.

Do NOT build them manually in this task.

==================================================
7. ARCHITECTURAL RULES
==================================================

### Maximum reuse

Before adding code:

1. Find the existing implementation.
2. Determine whether it can be extended.
3. Reuse existing hooks/providers/API helpers/components.
4. Add new abstraction only when genuinely required.
5. Prefer one reusable mechanism over multiple feature-specific implementations.

Do NOT create:

- second search provider
- second SearchBar
- second PLP
- second brand model
- second category model
- second collection model
- duplicate debounce logic
- duplicate cancellation logic
- duplicate stale-response protection
- duplicate URL-state handling.

==================================================
8. CMS / MEDUSA BOUNDARY
==================================================

CMS migration is already complete.

Maintain these ownership rules:

STRAPI:
- editorial content
- search editorial/trending configuration where already approved
- navigation/configuration
- SEO/editorial metadata

MEDUSA:
- products
- variants
- prices
- inventory
- product categories
- collections
- product metadata
- brand commerce identity
- sale commerce truth.

LOGISTICS:
- pincode serviceability
- delivery ETA
- COD/fulfillment availability.

STOREFRONT:
- search mechanics
- debounce
- cancellation
- stale protection
- filtering mechanics
- sorting mechanics
- URL state
- rendering.

Do not move commerce data into Strapi.

==================================================
9. DO NOT HALLUCINATE
==================================================

If an API, model, field, endpoint, route or component is not present:

1. Inspect the repository.
2. Inspect the installed Medusa/Strapi capabilities.
3. Determine the smallest valid implementation.
4. If still unverifiable, report it as UNKNOWN/BLOCKED.

Do NOT invent:

- Medusa endpoints
- Strapi schemas
- database tables
- routes
- APIs
- fields
- business rules.

==================================================
10. IMPLEMENTATION PROCESS
==================================================

PHASE A — READ-ONLY AUDIT

Before editing:

- inspect current implementation;
- inspect git diff;
- identify already-complete functionality;
- identify genuinely missing functionality;
- identify bugs;
- map each required search capability to existing code.

Produce a short implementation plan.

Do NOT modify anything during this audit.

PHASE B — MINIMAL IMPLEMENTATION

Implement only required changes.

For every changed file:

- explain why it must change;
- reuse existing code;
- avoid unrelated refactoring;
- preserve existing behavior.

PHASE C — TEST EACH CHANGE

For every new/modified logic path, add or update tests.

Test:

- product search
- category search
- collection search
- brand search
- sale routing
- autocomplete
- keyboard navigation
- full search
- filters
- sorting
- infinite loading
- URL state
- debounce
- cancellation
- stale-response protection
- loading
- error
- empty/ZSR.

==================================================
11. END-TO-END TEST MATRIX
==================================================

Test at minimum:

### Product

- known product query
- multiple product results
- no product results
- product click → correct PDP.

### Category

- category query
- category click → correct category PLP
- nonexistent category.

### Collection

- collection query
- collection click → correct collection PLP
- nonexistent collection.

### Brand

- known brand
- case variations
- brand navigation → correct brand PLP
- unknown brand
- products with missing brand metadata.

### Sale

- /sale
- /sale/all
- sale product results
- sale navigation
- no collection/sale route confusion.

### Search PLP

- direct /search?q=...
- refresh
- browser back
- browser forward
- filter
- sort
- infinite loading
- zero results.

### Query transition

Explicitly test:

pajama
→ chanderi

and:

pajama
→ kurta
→ chanderi

including rapid changes.

Verify stale responses cannot overwrite the newest query.

### Desktop

- focus
- typing
- dropdown
- keyboard
- mouse selection
- Enter
- Escape
- View All.

### Mobile

- open search
- type
- results update
- ZSR
- product navigation
- back navigation
- infinite loading.

==================================================
12. VALIDATION COMMANDS
==================================================

Use the repository's actual commands.

At minimum run:

- lint
- typecheck
- unit tests
- relevant integration tests
- desktop browser validation
- mobile browser validation
- production build.

Do not claim PASS if a command fails.

==================================================
13. ERROR / LOOP CONTROL
==================================================

IMPORTANT:

Do NOT get stuck in repeated error loops.

If a command/test fails:

1. Capture the exact error.
2. Determine whether it is:
   - production-code defect
   - test defect
   - environment issue
   - unrelated pre-existing issue.
3. Make ONE justified fix if the failure is within this task's scope.
4. Re-run the affected validation once.
5. If the same error persists, STOP that investigation and report it.

Do NOT:

- repeatedly retry the same command;
- add arbitrary waits;
- suppress errors;
- change unrelated configuration;
- create hacks solely to make tests pass;
- claim success without evidence.

For asynchronous browser validation, use condition/event-based waiting tied to actual DOM/API state, not arbitrary fixed delays.

==================================================
14. BUILD SAFETY
==================================================

Do not modify next.config.mjs merely to make the build pass.

Do not add build workarounds.

If the known Windows .next/trace EPERM problem appears again:

- capture the exact error;
- determine whether it is environmental;
- do not alter production architecture to bypass it;
- report it clearly.

==================================================
15. FINAL REPORT
==================================================

At completion provide:

1. Search capabilities already present before this task.
2. Search capabilities newly implemented.
3. Exact files changed.
4. Why each changed file was necessary.
5. Architecture/reuse decisions.
6. Medusa/API changes.
7. Strapi changes, if any.
8. Tests added/updated.
9. Complete end-to-end test matrix with PASS/FAIL.
10. lint result.
11. typecheck result.
12. unit test result.
13. browser/E2E result.
14. production build result.
15. Any remaining blocker with exact error.
16. Confirmation that no advanced search functionality was introduced.
17. Confirmation that no duplicate search/PLP/provider architecture was introduced.
18. Confirmation that Phase 17+ was NOT started.

Do NOT claim the MVP search is complete if any required core scenario remains unverified or broken.

STOP after the final report.