# ADR-006: Role-Based Internal Admin Backend-for-Frontend (BFF)

**Status:** PROPOSED (Pending Owner Decision)  
**Date:** 2026-11-05  
**Context:** Internal administrative architecture and access security.  

---

## 1. Context and Problem Statement
Public merchant self-registration is eliminated. Internal brand operations—including collection launches, private clienteling, inventory receiving, and high-value refund issuance—require strict enterprise security and role-based access control (RBAC).

## 2. Decision Outcome
Chosen Decision: **Dedicated Admin BFF with Cryptographic Multi-Factor Authentication**.
- Administrative endpoints operate on a dedicated Next.js BFF layer protected by mandatory TOTP MFA.
- Six granular corporate roles: Super Admin, Brand Merchandiser, Supply Chain & Logistics, Finance & Tax, Luxury Concierge, Store Manager.
- Dual-authorization threshold: refunds or inventory write-offs exceeding ₹5,000 mandate secondary cryptographic approval.
