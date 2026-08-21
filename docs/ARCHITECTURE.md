# System Architecture Documentation

## Overview

This ecommerce platform is built with a decoupled, headless three-tier architecture:

1. **Storefront (`apps/storefront`):** Next.js App Router (React, TypeScript, Tailwind CSS). Uses `@medusajs/js-sdk` and `@medusajs/types`.
2. **Commerce Backend (`apps/backend`):** Medusa Commerce v2 (Products, Variants, Inventory, Pricing, Customers, Carts, Orders, Payments, Shipping, Returns/Refunds).
3. **CMS (`apps/cms`):** Strapi Headless CMS (Marketing landing pages, Homepage dynamic sections, Promotional banners, CMS SEO).
4. **Persistence:** Single PostgreSQL instance hosting two distinct logical databases: `medusa_db` and `strapi_db`.
5. **Cache / In-Memory:** Single Redis instance with strict key namespacing (`otp:*`, `ratelimit:*`, `cache:*`).

## Workspace Boundaries

- `apps/storefront`: Customer presentation layer & selective BFF proxy.
- `apps/backend`: Authoritative commerce layer & payment orchestration.
- `apps/cms`: Marketing editorial layer.
- `packages/types`: Shared domain DTOs, API contracts, search interfaces.
- `packages/config`: Shared configuration (TypeScript, ESLint, environment validation).
- `infrastructure`: Docker, Nginx, and ops scripts.

## Data Ownership Principles

- Medusa owns all commerce transactions, cart state, orders, customer records, and product prices/stock.
- Strapi owns marketing pages, hero banners, and dynamic section ordering. Strapi stores only category/collection handles or product IDs, never duplicate product records.
- Next.js acts as the compositor, fetching live commerce data from Medusa and content layout from Strapi.
