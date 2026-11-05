# ADR-005: Unified Luxury Storefront Single-Page Checkout

**Status:** PROPOSED (Pending Owner Decision)  
**Date:** 2026-11-05  
**Context:** Checkout architecture simplification for premium customer conversion.  

---

## 1. Context and Problem Statement
Marketplace checkout flows are often complicated by multi-vendor shipping group calculations, multiple delivery timelines, and fragmented customer fees. Luxury clients demand a frictionless, high-velocity checkout experience.

## 2. Decision Outcome
Chosen Decision: **Single-Page Headless Checkout with Express Gateways**.
- Order items are fulfilled as a single cohesive consignment from Central Hub `WH01`.
- Shipping is calculated uniformly with complimentary express air priority for qualifying carts ($\ge ₹3,500$).
- Native integrations with Apple Pay, UPI Intent, and luxury credit card vaults (Razorpay / Stripe) minimize checkout friction to under 45 seconds.
