# INITIAL AGENT INSTRUCTIONS

## Ecommerce MVP — Prompt Pack Execution Contract

You are the primary coding agent for this ecommerce project.

You have been given the complete `ecommerce_llm_prompt_pack` directory. It contains:

- `MASTER-SPECIFICATION.md`
- `AGENT-RULES.md`
- `README.md`
- `manifest.json`
- 44 numbered task prompts

These files collectively define the target ecommerce MVP.

---

# 1. SOURCE OF TRUTH

Before doing any implementation, read:

1. `MASTER-SPECIFICATION.md`
2. `AGENT-RULES.md`
3. `README.md`
4. The prompt for the current task

The master specification is the functional source of truth.

The agent rules are the engineering/behavioral source of truth.

The numbered task prompt defines the current implementation scope.

Do not replace these documents with your own interpretation.

If the existing repository contains functionality that conflicts with the specification, identify the conflict before changing it.

---

# 2. IMPORTANT: DO NOT EXECUTE ALL TASKS AT ONCE

The prompt pack is intentionally divided into sequential tasks.

Having access to all 44 prompts does NOT mean you should implement all 44 automatically.

You must execute tasks one at a time unless the project owner explicitly instructs you to execute a specific range.

Default behavior:

```text
Task 00
  ↓
Stop and report
  ↓
Owner reviews
  ↓
Task 01
  ↓
Stop and report
  ↓
Owner reviews
  ↓
Task 02
  ↓
...
```

Never automatically continue to the next task after completing the current task.

If the owner says:

> "Execute Task 07"

execute Task 07 only.

If the owner says:

> "Execute Tasks 07–09"

you may execute only those requested tasks, while respecting their dependencies.

If the owner says:

> "Continue"

interpret this as permission to execute the next sequential task only, unless the owner explicitly specifies a larger range.

---

# 3. FIRST TASK — PROJECT AUDIT

The first task must be the project audit.

Before modifying application code:

- Inspect the complete repository.
- Inspect the current Next.js application.
- Inspect the current Medusa setup, if present.
- Inspect the current Strapi setup, if present.
- Inspect package.json files.
- Inspect dependency versions.
- Inspect database configuration.
- Inspect Redis configuration.
- Inspect Docker configuration.
- Inspect environment files.
- Inspect routes.
- Inspect API clients.
- Inspect existing authentication.
- Inspect existing UI/components.
- Inspect tests.
- Inspect lint/typecheck/build scripts.
- Inspect deployment configuration.
- Inspect existing documentation.

The current project may contain existing work that should be reused.

Do NOT assume the repository is empty.

Do NOT delete or rewrite working functionality merely to match a preferred folder structure.

At the end of Task 00, provide:

```text
1. Current architecture
2. Existing functionality
3. Partially implemented functionality
4. Missing functionality
5. Conflicts with MASTER-SPECIFICATION.md
6. Dependencies that need changes
7. Proposed final folder structure
8. Proposed migration strategy
9. Risks/blockers
10. Recommended next task
```

Do not make major destructive changes during the audit.

---

# 4. IMPLEMENTATION PHILOSOPHY

Build this as a real production-capable ecommerce MVP, but do not over-engineer it.

The core architecture is:

```text
                    Next.js
                       |
             Presentation / UX
                       |
          +------------+------------+
          |                         |
          v                         v
       Medusa                    Strapi
      Commerce                   CMS
          |                         |
          v                         v
   PostgreSQL DB             PostgreSQL DB
          |
        Redis
```

External providers handle external responsibilities:

```text
Razorpay     -> online payments
SMS/OTP      -> OTP delivery
Shipping     -> logistics/shipping
Object Store -> media
Payout       -> COD UPI/bank refunds if selected
```

---

# 5. DATA OWNERSHIP RULE

Never duplicate ownership.

## Medusa owns

- Products
- Variants
- Options
- Categories
- Collections
- Pricing
- Inventory
- Customers
- Carts
- Promotions
- Shipping
- Fulfillment
- Orders
- Payments
- Returns
- Refunds

## Strapi owns

- Homepage
- Landing pages
- Sale pages
- Campaign pages
- Marketing content
- Hero banners
- Promotional banners
- CMS sections
- CMS media
- CMS SEO metadata

Strapi must not become a second product/catalog database.

Do not permanently copy:

- product prices
- inventory
- product availability
- order information
- customer information

into Strapi.

---

# 6. DATABASE RULE

Do not create a third custom PostgreSQL database.

Use:

```text
PostgreSQL
├── medusa_db
└── strapi_db
```

Medusa's database is the commerce source of truth.

Strapi's database is the CMS source of truth.

If custom Medusa functionality needs persistence, use Medusa's supported module/data architecture.

Do not introduce MongoDB or another database unless explicitly approved.

---

# 7. REDIS RULE

Use one Redis instance initially.

Use namespaces/prefixes for:

- OTP
- Rate limiting
- Cache
- Session-related data where appropriate
- Medusa Redis functionality
- Workflow/queue functionality where required

Do not introduce Redis Cluster/Sentinel in the MVP.

---

# 8. PAYMENT RULE

The India-first MVP uses Razorpay.

Do not implement Stripe unless explicitly requested later.

Architecture:

```text
Next.js
   |
Medusa
   |
Razorpay
```

COD uses Medusa's system/manual payment provider.

Do not treat COD as an online Razorpay payment.

For prepaid refunds:

```text
Medusa
   |
Razorpay
   |
Original payment method / provider refund
```

For COD refunds:

```text
Medusa/custom backend workflow
   |
   +-- UPI payout
   +-- Bank/IMPS payout
   +-- Store credit
```

Next.js must never perform the financial payout itself.

---

# 9. AUTHENTICATION RULE

Authentication is mobile OTP based.

No passwords.

No social login.

Existing customer:

```text
Mobile
  |
Customer lookup
  |
Existing
  |
OTP
  |
Verify
  |
Authenticated
```

New customer:

```text
Mobile
  |
Registration
  |
Name + Email + Mobile
  |
OTP
  |
Verify
  |
Create customer/session
```

Do NOT collect:

- Address
- Referral code
- Age

during registration.

Address is added later during checkout or through the address book.

OTP must be:

- temporary
- rate limited
- attempt limited
- expired
- invalidated after successful verification
- stored temporarily in Redis
- never logged in plaintext

---

# 10. GUEST ACCESS RULE

Guest users can:

- Browse homepage
- Search
- Open PLP
- Open PDP
- Add products to cart
- View cart
- Modify cart

Guest users cannot:

- Access wishlist
- Access account
- Access order history
- Access address book
- Proceed from cart to shipping without authentication

Flow:

```text
Guest Cart
    |
Proceed to Shipping
    |
Login/Register
    |
OTP
    |
Authenticated
    |
Shipping
```

Do not lose the guest cart during authentication.

---

# 11. SEARCH RULE

Search behavior is explicitly defined.

## Desktop

Header contains search.

Typing displays a compact dropdown containing:

```text
Products
- image
- name
- price

Categories
- category names

Collections
- collection names

View all results
```

Destinations:

```text
Product       -> PDP
Category      -> PLP
Collection    -> PLP
View all      -> Search PLP
Enter         -> Search PLP if no active suggestion
```

Keyboard:

```text
Arrow Up
Arrow Down
Enter
Escape
```

## Mobile

Tapping search opens a dedicated search page.

The page contains:

- back
- search box
- results

Typing displays infinite results.

Zero results must display a proper ZSR state.

Search failure must NOT be shown as zero results.

Search must be debounced.

Stale responses must not overwrite newer queries.

Keep search behind an abstraction so it can later move from Medusa to:

- OpenSearch
- Elasticsearch
- Algolia
- Meilisearch

Do not deploy a dedicated search engine in the MVP unless explicitly requested.

---

# 12. PLP RULE

PLP must be reusable for:

- Category
- Brand
- Collection
- Sale/curated
- Search

Support:

- Product cards
- Images
- Names
- Brand where available
- Price
- Original price where applicable
- Discount
- Availability
- Wishlist
- Safe add-to-cart
- Filters
- Sorting
- Infinite scroll
- URL state
- Loading
- Error
- Empty state

Filters should only expose fields supported by the actual catalog/backend.

Do not invent filters or ranking algorithms.

---

# 13. PDP RULE

PDP must support:

- Images
- Name
- Brand
- Description
- Price
- Discount
- Options
- Variants
- Availability
- Add to cart
- Wishlist
- Related products where available

Invalid variants cannot be added.

---

# 14. CART RULE

Cart is Medusa-owned.

Guest cart is allowed.

Support:

- Add
- Remove
- Quantity
- Cart ID persistence
- Totals
- Inventory validation
- Empty state
- Loading state
- Error state

The frontend must never be the authoritative source of:

- price
- tax
- discount
- inventory
- order total

After login, guest and customer carts must be handled deterministically.

Never silently lose cart items.

---

# 15. CHECKOUT RULE

Checkout:

```text
Cart
 |
Authentication if required
 |
Shipping address
 |
Shipping method
 |
Payment
 |
Order
```

Address fields:

```text
Full name
Mobile
Address line 1
Address line 2 optional
Landmark optional
City
State
Pincode
Country
Address type
Default flag
```

Do not collect address during registration.

---

# 16. RETURN/REFUND RULE

Returns and refunds are part of the MVP.

Use Medusa's native commerce capabilities wherever possible.

Return:

```text
Order
 |
Request Return
 |
Select Item
 |
Quantity
 |
Reason
 |
Return Processing
 |
Received
 |
Refund
```

Prepaid:

```text
Medusa
 |
Razorpay refund
```

COD:

```text
Refund method
 |
 +-- UPI
 +-- Bank/IMPS
 +-- Store credit
```

The backend must own the refund decision and financial orchestration.

Do not put payout logic in Next.js.

---

# 17. CMS RULE

CMS page types:

- Homepage
- Landing page
- Sale page
- Campaign page
- Brand content page
- Policy/content pages where required

Reusable sections:

- Hero
- Banner
- Rich text
- Category tiles
- Category grid
- Collection carousel
- Product carousel
- Product grid
- Promotional CTA
- Sale banner
- SEO metadata

CMS section ordering must be data-driven.

Use Medusa for actual product information.

---

# 18. UI/UX RULE

The UI should be a modern fashion ecommerce experience.

SHEIN India may be used only as a general UX reference for:

- ecommerce density
- navigation patterns
- category navigation
- product grids
- promotional sections
- responsive behavior

Do NOT copy:

- branding
- logo
- assets
- text
- source code
- proprietary implementation

Desktop and mobile must be intentionally designed rather than simply scaled.

---

# 19. LOADING RULE

Every meaningful asynchronous operation must have a loading state.

Use shimmers/skeletons for:

- Homepage
- CMS sections
- PLP
- PDP
- Search
- Cart
- Account
- Wishlist
- Address book
- Checkout

Mutating buttons must show progress and prevent duplicate submissions.

Do not leave blank screens during API requests.

---

# 20. ERROR RULE

Distinguish:

```text
Valid empty data
```

from:

```text
API failure
```

Examples:

```text
0 search results
!=
search API failed
```

```text
empty cart
!=
cart API failed
```

Implement:

- 404
- route error boundaries
- API errors
- authentication errors
- payment errors
- inventory errors
- shipping errors
- CMS errors
- search errors
- network errors
- retry actions where safe

Never expose stack traces or secrets.

---

# 21. SECURITY RULE

Backend authorization is mandatory.

Never trust:

- customer ID from browser
- order ID ownership
- price from browser
- total from browser
- payment state from browser
- inventory from browser
- refund amount from browser

Protect:

- OTP secrets
- database credentials
- Redis credentials
- Razorpay secrets
- payout-provider credentials
- session secrets
- webhook secrets

Never log:

- OTP
- card data
- payment secrets
- bank credentials
- authentication tokens

---

# 22. INFRASTRUCTURE RULE

Initial deployment is intentionally simple:

```text
Single VPS
 |
 +-- Reverse Proxy
 +-- Next.js
 +-- Medusa
 +-- Strapi
 +-- PostgreSQL
 +-- Redis
```

Use Docker Compose where practical.

Use external object storage for media.

Use external backups.

Do not introduce:

- Kubernetes
- Kafka
- service mesh
- database cluster
- Redis cluster
- multiple load balancers
- complex autoscaling

at MVP launch.

The code must remain capable of future horizontal scaling.

---

# 23. COST RULE

The initial target is approximately ₹500/month where practical.

Cost optimization must never justify:

- insecure database exposure
- no backups
- plaintext secrets
- insecure authentication
- unsafe payment handling

Use the cheapest practical infrastructure that meets the requirements.

---

# 24. TASK EXECUTION RULE

For every task:

### Step 1 — Read

Read:

- MASTER-SPECIFICATION.md
- AGENT-RULES.md
- Current task prompt
- Existing relevant code

### Step 2 — Inspect

Understand:

- current architecture
- dependencies
- existing implementation
- integration boundaries

### Step 3 — Plan

Before editing, produce a concise implementation plan.

For complex tasks, list:

- files to change
- new files
- APIs/modules involved
- tests required
- risks

### Step 4 — Implement

Implement only the requested task.

### Step 5 — Validate

Run the project's actual:

- lint
- typecheck
- unit/integration tests
- build

Also run targeted tests for the feature.

### Step 6 — Fix

Fix errors introduced by your work.

Do not leave obvious TypeScript/lint/build errors.

### Step 7 — Review

Check:

- security
- authorization
- loading states
- error states
- empty states
- mobile behavior
- desktop behavior
- accessibility
- API correctness

### Step 8 — Report

At the end report:

```text
Task:
Status:

Implemented:
- ...

Files changed:
- ...

Tests:
- ...

Lint:
- ...

Typecheck:
- ...

Build:
- ...

Known issues:
- ...

Next recommended task:
- ...
```

Then STOP.

---

# 25. GIT CHECKPOINT RULE

After a task has been verified:

```text
git status
git diff
```

Review changes.

The project owner should commit the verified state before moving to the next task.

Suggested commit naming:

```text
feat(task-00): audit project architecture
feat(task-01): bootstrap project foundation
feat(task-02): add local infrastructure
...
```

Do not automatically push to a remote repository unless explicitly requested.

---

# 26. WHEN A TASK DISCOVERS A PROBLEM

If the current task discovers a blocker in an earlier task:

Do not blindly work around it.

Report:

```text
BLOCKER
Source:
Impact:
Recommended fix:
```

If the fix is small and strictly required for the current task, you may make it.

If it is a larger unrelated architectural change, stop and ask the project owner.

Do not silently expand scope.

---

# 27. WHEN MEDUSA/STRAPI API DIFFERS FROM THE SPEC

The specification describes desired behavior, not outdated endpoint names.

If the installed Medusa/Strapi version uses a different API:

1. Verify the installed version.
2. Use the current supported API/module pattern.
3. Preserve the intended behavior.
4. Do not invent fake endpoints.
5. Do not downgrade dependencies merely to match an old tutorial unless explicitly approved.
6. Document any important compatibility decision.

---

# 28. WHEN A FEATURE IS ALREADY IMPLEMENTED

Do not rewrite it.

Instead:

1. Inspect it.
2. Compare it against the specification.
3. Keep correct behavior.
4. Fix only gaps.
5. Add missing tests.

The goal is a correct final system, not maximum code churn.

---

# 29. NO HALLUCINATION POLICY

Never invent:

- Medusa APIs
- Strapi APIs
- Payment provider behavior
- Shipping behavior
- Refund behavior
- Database schemas
- Authentication mechanisms
- Business rules

If unsure:

- inspect installed dependencies
- inspect local types
- inspect official/current documentation if web access is available
- inspect existing integration code

Then implement based on verified behavior.

---

# 30. NO FEATURE CREEP

Do not add:

- referral codes
- loyalty
- reviews
- ratings
- social login
- password auth
- native app
- marketplace
- multi-vendor
- multi-tenancy
- AI recommendation engine
- advanced analytics
- complex exchange system
- enterprise infrastructure

unless the project owner explicitly changes the specification.

---

# 31. FINAL ACCEPTANCE PRINCIPLE

The project is not considered complete merely because:

- pages exist
- APIs return mocked data
- TypeScript compiles
- UI looks correct

A feature is complete only when its relevant end-to-end behavior works against the actual configured backend/services or a clearly documented test/sandbox integration.

Examples:

Search is complete when:

```text
Desktop typing
 -> dropdown
 -> product/category/collection navigation
 -> Enter -> search PLP

Mobile tap
 -> search page
 -> typing
 -> infinite results
 -> ZSR
```

Checkout is complete when:

```text
Cart
 -> login
 -> address
 -> shipping
 -> Razorpay/COD
 -> order
 -> success/failure
```

Return/refund is complete when:

```text
Order
 -> return request
 -> return processing
 -> refund
```

with prepaid and COD paths handled according to the specification.

---

# 32. HOW THE OWNER WILL CONTROL EXECUTION

The project owner may say:

```text
Execute Task 00
```

or:

```text
Execute Task 12
```

or:

```text
Continue with the next task
```

or:

```text
Execute Tasks 15 through 17
```

Follow exactly the requested scope.

Do not infer permission to execute all future tasks.

---

# 33. FIRST RESPONSE AFTER RECEIVING THIS PROMPT

If no task has been explicitly requested yet:

1. Read the specification files.
2. Inspect the repository.
3. Do NOT implement features.
4. Tell the owner that the prompt pack has been loaded.
5. Identify the next task as Task 00.
6. Wait for the owner to explicitly request execution, unless they have already requested Task 00.

If the owner explicitly says to begin implementation, execute Task 00.

---

# 34. FINAL OBJECTIVE

Build the ecommerce MVP exactly according to:

`MASTER-SPECIFICATION.md`

using the numbered tasks as the controlled implementation plan.

The final architecture must be:

```text
Next.js
   |
   +----------------------+
   |                      |
   v                      v
Medusa                  Strapi
Commerce                CMS
   |                      |
   v                      v
PostgreSQL             PostgreSQL
   |
 Redis
```

with:

```text
Razorpay -> online payments
COD -> Medusa system/manual payment
OTP -> external SMS provider
Media -> object storage
Shipping -> external shipping provider
```

The final product must be:

- functional
- secure
- responsive
- maintainable
- testable
- deployable on a low-cost single VPS
- ready for future horizontal scaling
- free of unnecessary microservices
- free of duplicated commerce/CMS data
- faithful to the MVP requirements
- free of unapproved feature creep

Do not optimize for writing the most code.

Optimize for building the **correct system**.
