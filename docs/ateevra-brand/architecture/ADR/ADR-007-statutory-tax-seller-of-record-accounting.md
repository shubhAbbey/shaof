# ADR-007: Statutory Tax and Seller-of-Record Accounting Architecture

**Status:** PROPOSED (Pending Owner Decision)  
**Date:** 2026-11-05  
**Context:** Fiscal compliance under Indian Goods and Services Tax (GST) and Corporate Tax Laws.  

---

## 1. Context and Problem Statement
Marketplaces operate as electronic commerce intermediaries under Section 52 of the CGST Act (collecting TCS) and Section 194-O of the Income Tax Act (withholding TDS). As a first-party brand, ATEEVRA sells its own owned inventory directly to consumers.

## 2. Decision Outcome
Chosen Decision: **Direct Section 31 Tax Invoicing and Comprehensive ITC Offset**.
- ATEEVRA issues direct B2C/B2B Tax Invoices under Section 31 of the CGST Act, 2017.
- Section 52 TCS and Section 194-O TDS logic are completely deactivated.
- Input Tax Credit (ITC) paid on atelier manufacturing, luxury packaging boxes, and courier air freight is systematically offset against output GST liability.
