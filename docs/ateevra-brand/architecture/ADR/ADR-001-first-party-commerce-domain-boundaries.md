# ADR-001: First-Party Luxury Brand Domain Boundaries

**Status:** PROPOSED (Pending Owner Decision)  
**Date:** 2026-11-05  
**Context:** Monorepo architecture transition from multi-vendor marketplace to first-party luxury fashion house.  

---

## 1. Context and Problem Statement
The ATEEVRA monorepo originally housed a multi-vendor marketplace structure with merchant onboarding, vendor commissions, and distributed fulfillment. The brand is now pivoting to an owned, direct-to-consumer (D2C) luxury fashion house. We must establish clear, non-negotiable domain boundaries that prevent marketplace constructs from leaking into brand operations while preserving the monorepo codebase.

## 2. Decision Drivers
- Need for absolute brand control over catalog, pricing, customer experience, and quality.
- Prevention of multi-vendor clutter (no merchant dashboards, no vendor commission splits).
- Preservation of existing monorepo assets (`apps/backend`, `apps/cms`, `apps/storefront`).
- Strict isolation of marketplace documentation and decisions.

## 3. Considered Options
- **Option 1: Hard fork repository into a brand-new codebase.** Discards working Next.js/Medusa/Strapi setups; high duplication and rebuild cost.
- **Option 2: In-place domain decoupling within current monorepo.** Maintain single repo; isolate marketplace modules behind a commercial mode toggle; configure pure first-party domain models.
- **Option 3: Hybrid coexistence with dual storefronts.** Complex, confuses brand prestige, high maintenance overhead.

## 4. Decision Outcome
Chosen Option: **Option 2 (In-place domain decoupling within current monorepo)**.
ATEEVRA is established as the sole commercial domain entity. All transactional logic maps directly to `ATEEVRA_CORP`.

### 4.1 Positive Consequences
- Retains 100% of core Medusa v2.19, Strapi v5, and Next.js 15 investments.
- Establishes a clean, singular brand domain model.
- Zero risk to historical marketplace documentation.

### 4.2 Negative Consequences / Trade-offs
- Requires careful discipline to ensure multi-vendor links are bypassed in first-party mode.
