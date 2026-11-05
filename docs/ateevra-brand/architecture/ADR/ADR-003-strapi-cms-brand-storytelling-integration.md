# ADR-003: Strapi CMS Brand Storytelling and Headless Commerce Integration

**Status:** PROPOSED (Pending Owner Decision)  
**Date:** 2026-11-05  
**Context:** Content-led luxury commerce architecture connecting Strapi v5 and Medusa v2.19.  

---

## 1. Context and Problem Statement
Luxury fashion is sold on emotional resonance, artisan heritage, fabric drape, and seasonal narrative—not dense transactional product grids. The digital storefront must seamlessly interweave high-resolution runway editorial content from Strapi CMS with real-time transactional SKU availability from Medusa v2.

## 2. Decision Outcome
Chosen Decision: **Headless Hybrid Composition via Next.js 15 App Router**.
- **Strapi v5 (Headless CMS):** Serves lookbooks, editorial campaigns, journal articles, atelier interviews, and brand hero videos via GraphQL/REST.
- **Medusa v2.19 (Headless Commerce):** Serves catalog variants, live inventory levels, pricing, carts, and customer profiles.
- **Next.js 15 Server Components:** Fetch Strapi content at build/ISR time, hydrating dynamic product availability client-side via Medusa SDK.
