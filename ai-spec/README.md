# Ecommerce LLM Prompt Pack

Use `MASTER-SPECIFICATION.md` as the source of truth and `AGENT-RULES.md` as the operating contract.

## Execution order

0.  `00-project-audit/prompt.md` — Project Audit & Architecture Baseline
1.  `01-project-bootstrap/prompt.md` — Project Bootstrap & Folder Structure
2.  `02-local-infrastructure/prompt.md` — Local Infrastructure: Docker, Postgres & Redis
3.  `03-medusa-foundation/prompt.md` — Medusa Foundation
4.  `04-medusa-commerce/prompt.md` — Medusa Promotions, Shipping, Fulfillment & Returns Foundation
5.  `05-strapi-foundation/prompt.md` — Strapi Foundation
6.  `06-strapi-content-models/prompt.md` — CMS Content Models & Section Registry
7.  `07-design-system/prompt.md` — Storefront Design System & Responsive Foundation
8.  `08-header-navigation/prompt.md` — Header, Category Navigation & Mega Menu
9.  `09-homepage/prompt.md` — Homepage & CMS Section Rendering
10. `10-cms-pages/prompt.md` — Landing, Sale, Campaign & Policy Pages
11. `11-plp-core/prompt.md` — PLP Core Engine
12. `12-plp-filters-sort/prompt.md` — PLP Filters, Sorting & Infinite Scroll
13. `13-pdp/prompt.md` — Product Detail Page
14. `14-search-foundation/prompt.md` — Search Abstraction & Backend Integration
15. `15-desktop-search/prompt.md` — Desktop Search Dropdown
16. `16-mobile-search/prompt.md` — Mobile Search Page & ZSR
17. `17-auth-foundation/prompt.md` — OTP Authentication Foundation
18. `18-auth-registration/prompt.md` — Existing Login & New Registration
19. `19-protected-routes/prompt.md` — Protected Routes & Authorization
20. `20-guest-cart/prompt.md` — Guest Cart
21. `21-cart-merge/prompt.md` — Guest-to-Customer Cart Merge
22. `22-wishlist/prompt.md` — Wishlist
23. `23-address-book/prompt.md` — Customer Address Book
24. `24-shipping/prompt.md` — Checkout Shipping
25. `25-checkout/prompt.md` — Checkout Orchestration
26. `26-razorpay/prompt.md` — Razorpay Payment Integration
27. `27-cod/prompt.md` — Cash on Delivery
28. `28-orders/prompt.md` — Orders & Account Order History
29. `29-returns/prompt.md` — Returns
30. `30-refunds/prompt.md` — Prepaid Refunds
31. `31-cod-refunds/prompt.md` — COD Refund Methods
32. `32-loading-shimmer/prompt.md` — Loading, Shimmer & Mutation UX
33. `33-error-empty-states/prompt.md` — Errors, Empty States & Error Boundaries
34. `34-accessibility-security/prompt.md` — Accessibility & Security Hardening
35. `35-unit-integration-tests/prompt.md` — Unit & Integration Tests
36. `36-e2e-tests/prompt.md` — End-to-End Customer Journeys
37. `37-performance/prompt.md` — Performance & Core Web Vitals Hardening
38. `38-production-docker/prompt.md` — Production Docker Configuration
39. `39-vps-deployment/prompt.md` — Single VPS Deployment
40. `40-backups-monitoring/prompt.md` — Backups, Health Checks & Basic Observability
41. `41-final-architecture-audit/prompt.md` — Final Architecture & Scope Audit
42. `42-release-readiness/prompt.md` — Release Readiness & Final Verification
43. `43-post-build-documentation/prompt.md` — Architecture, Runbook & Handoff Documentation

## Recommended workflow

1. Start with 00 audit.
2. Run tasks sequentially.
3. After each task, inspect the agent's validation report.
4. Commit the verified result before starting the next task.
5. If a task discovers a blocker, fix the blocker before proceeding.
6. Never skip a task silently; mark it Not Applicable only with a written reason.
7. Keep MASTER-SPECIFICATION.md unchanged unless the product requirements are intentionally changed by the project owner.

## Empty Project Usage

Place this entire `ai-spec/` directory inside a new empty Git repository/project root:

```text
ecommerce-mvp/
└── ai-spec/
    ├── INITIAL-AGENT-INSTRUCTIONS.md
    ├── MASTER-SPECIFICATION.md
    ├── AGENT-RULES.md
    ├── README.md
    ├── manifest.json
    └── 44 numbered task folders
```

Open the **project root** (`ecommerce-mvp/`) in your coding agent, not only the `ai-spec/` directory.

Start by asking the agent to read `ai-spec/INITIAL-AGENT-INSTRUCTIONS.md` and execute Task 00 only.

## Canonical Greenfield Project Layout

Place this directory inside the root of the new project:

```text
ecom_mvp/
└── ai-spec/
    ├── INITIAL-AGENT-INSTRUCTIONS.md
    ├── MASTER-SPECIFICATION.md
    ├── AGENT-RULES.md
    ├── README.md
    ├── manifest.json
    ├── 00-project-audit/
    ├── 01-project-bootstrap/
    ├── 02-local-infrastructure/
    ├── ...
    └── 43-post-build-documentation/
```

The numbered task directories use exactly one numeric prefix:
`00-project-audit`, `01-project-bootstrap`, ..., `43-post-build-documentation`.

Open `ecom_mvp/` in the coding agent and execute the tasks sequentially according to `INITIAL-AGENT-INSTRUCTIONS.md`.
