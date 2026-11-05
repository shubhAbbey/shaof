# ADR-004: Decoupling Marketplace Merchant Primitives

**Status:** PROPOSED (Pending Owner Decision)  
**Date:** 2026-11-05  
**Context:** Runtime isolation and bypass of multi-vendor database links in first-party brand mode.  

---

## 1. Context and Problem Statement
The Medusa backend includes link modules linking `merchant` to `product`, `order_item`, and `stock_location`. In first-party mode, customer orders must not be split across multiple merchants, nor should vendor commission engines execute.

## 2. Decision Outcome
Chosen Decision: **Commercial Mode Feature Gate & Synthetic Entity Mapping**.
- A root environment variable `COMMERCE_MODE=FIRST_PARTY_BRAND` is introduced.
- Medusa service workflows bypass merchant filtering and associate all catalog entries with a single internal tenant ID: `ATEEVRA_CORP`.
- Existing database tables and link migrations remain intact without alteration, guaranteeing zero disruption to marketplace assets.
