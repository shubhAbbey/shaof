# ADR-002: Internal Brand Inventory Custody and Valuation Architecture

**Status:** PROPOSED (Pending Owner Decision)  
**Date:** 2026-11-05  
**Context:** Centralizing inventory custody from distributed merchant drop-shipping to company-owned warehousing.  

---

## 1. Context and Problem Statement
In a marketplace model, stock resides with independent merchants, creating variable packaging, unreliable fulfillment SLAs, and inconsistent inspection standards. For a luxury brand, product presentation, fabric care, and same-day dispatch require absolute physical control over every single garment.

## 2. Decision Drivers
- Uncompromising quality control: pre-dispatch garment steaming, lint removal, luxury packaging.
- Statutory compliance with Ind AS 2 (valuation at lower of cost or net realizable value).
- Same-day dispatch SLA for all orders placed before 14:00 IST.

## 3. Decision Outcome
Chosen Decision: **Centralized Physical Custody in ATEEVRA Central Facility (`WH01`)**.
- All inventory is owned as a balance-sheet asset upon Goods Receipt Note (GRN) posting.
- Medusa Stock Location Module maps directly to physical zones (GOH hanging, climate-controlled flat fold, high-value vault).
- Perpetual cycle counts replace disruptive annual audits.
