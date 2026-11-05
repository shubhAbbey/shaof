# ATEEVRA — Medusa v2.19 & Strapi v5 Headless Integration Blueprint

**Document ID:** `ATEEVRA-ARCH-INT-001`  
**Classification:** System Integration & Middleware Blueprint  
**Status:** DRAFT (Under Owner Review)  
**Version:** 1.0.0  

---

## 1. Executive Summary & Headless Architecture

The ATEEVRA digital platform harmonizes high-velocity transactional commerce (Medusa v2.19) with content-rich luxury editorial storytelling (Strapi v5) through a unified Next.js 15 App Router presentation layer.

```
                                  [ NEXT.JS 15 STOREFRONT ]
                                  (Server Components & ISR)
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
          [ STRAPI v5 HEADLESS CMS ]                   [ MEDUSA v2.19 COMMERCE ]
          - Runway Lookbooks                           - SKU Master & Variants
          - Atelier Journal Articles                   - Real-Time Inventory WH01
          - Fabric Provenance Stories                  - Customer Cart & Checkout
          - Hero Video Banners                         - Section 31 Tax Engine
                      │                                             │
                      └──────────────────────┬──────────────────────┘
                                             ▼
                                [ REDIS DISTRIBUTED CACHE ]
```

---

## 2. API Contracts and Data Federation

### 2.1 Editorial Lookbook Component Schema (Strapi)
In Strapi v5, a Lookbook entry embeds Medusa product handles as relational references:
```json
{
  "id": "lookbook_aw26_monolith",
  "title": "Autumn/Winter 2026: Monolith",
  "editorial_narrative": "Structured architectural overcoats crafted from virgin Loro Piana wool...",
  "hero_video_url": "https://cdn.ateevra.com/campaigns/aw26/monolith_4k.mp4",
  "scenes": [
    {
      "scene_number": 1,
      "hotspots": [
        {
          "coordinate_x": 45.2,
          "coordinate_y": 62.8,
          "medusa_product_handle": "tailored-cashmere-overcoat-noir"
        }
      ]
    }
  ]
}
```

### 2.2 Revalidation & Cache Synchronization
1. **Content Publish Trigger:** When an editor publishes an article or lookbook in Strapi v5, a webhook fires to `/api/revalidate?tag=editorial`.
2. **On-Demand ISR:** Next.js revalidates the cache tag instantly without requiring storefront redeployment.
3. **Product Stock Hydration:** Product availability and prices are never cached statically in CMS blobs; they are hydrated dynamically on the server via Medusa's low-latency Redis cache (`< 15ms`).

---
*End of Document `ATEEVRA-ARCH-INT-001`. Authorized for Middleware Architecture.*
