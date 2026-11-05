# ATEEVRA Digital Flagship — Storefront Master Blueprint

**Document ID:** `STR-ATEEVRA-STOREFRONT-MASTER-V1`  
**Classification:** `DIGITAL FLAGSHIP FRONTEND ARCHITECTURE`  
**Parent Blueprint:** [`../ATEEVRA-STOREFRONT-BLUEPRINT.md`](../ATEEVRA-STOREFRONT-BLUEPRINT.md)  
**Frontend Framework:** Next.js 15 App Router (`apps/storefront`)  
**Styling Engine:** Tailwind CSS 3.4 with Custom ATEEVRA Luxury Tokens  
**State Management:** React 19 Server Components, Zustand client stores, SWR / TanStack Query  
**Effective Date:** 2026-11-05  

---

## 1. Executive Summary & Brand Storefront Mission

The ATEEVRA Storefront serves as the digital flagship of the brand. It is engineered to translate haute horlogerie and luxury fashion sensibilities into a lightning-fast, highly responsive web application.

```mermaid
flowchart TD
    subgraph "Core Architectural Tenets"
        T1["Architectural Minimalism: Clean typography, ample whitespace, muted palette"]
        T2["Sensory Richness: High-definition 4K video clips, macro fabric textures"]
        T3["Frictionless Utility: Instant mobile OTP login, one-page checkout, zero surprise fees"]
        T4["Technical Rigor: Next.js 15 Server Components, sub-second LCP, zero hydration shift"]
    end
```

---

## 2. Design System & Luxury Token Architecture

```css
/* Custom ATEEVRA Brand Tokens in tailwind.config.js */
:root {
  --color-brand-offwhite: #FAFAFA;
  --color-brand-alabaster: #F4F1EA;
  --color-brand-charcoal: #1A1A1A;
  --color-brand-black: #0D0D0D;
  --color-brand-slate: #707070;
  --color-brand-gold-accent: #C5A059;

  --font-serif-luxury: 'Playfair Display', Georgia, serif;
  --font-sans-modern: 'Plus Jakarta Sans', system-ui, sans-serif;
  
  --transition-luxury: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### 2.1 Preserved Visual Invariants
- **ATEEVRA Custom Logo:** Scalable vector SVG mark preserved without modification.
- **Brand Loader:** Custom loading spinner with branded geometric easing preserved from initial MVP design.
- **Image Aspect Ratios:** Universal 3:4 vertical framing for all product listings and detail visuals.

---

## 3. Technology Stack & Component Architecture

```mermaid
flowchart TD
    subgraph "Next.js 15 App Router Architecture"
        RSC["React Server Components (RSC)"] -->|Fetch Initial Data at Edge| MedusaAPI["Medusa v2 Store API"]
        RSC -->|Fetch Editorial Stories & Lookbooks| StrapiAPI["Strapi v5 CMS API"]
        
        RSC --> CC["Client Component Islands"]
        CC --> CartStore["Zustand Shopping Bag Store"]
        CC --> WishStore["Zustand Wishlist Store"]
        CC --> CheckoutFlow["One-Page Checkout Form"]
    end

    subgraph "Edge Delivery & Optimization"
        Cloudflare["Cloudflare Enterprise Edge CDN"]
        NextImage["Next.js Image Optimizer (WebP/AVIF)"]
        Cloudflare --> RSC
        RSC --> NextImage
    end
```

### 3.1 Caching & Incremental Static Regeneration (ISR)
- **Product Listing Pages (PLP):** Revalidated on-demand via Next.js tag revalidation (`revalidateTag('products')`) triggered by Admin catalog webhooks.
- **Product Detail Pages (PDP):** Hybrid static shell with dynamic real-time inventory checks (ATS badge rendered via lightweight client query).
- **Cart & Checkout:** 100% dynamic server rendering with zero edge caching.
