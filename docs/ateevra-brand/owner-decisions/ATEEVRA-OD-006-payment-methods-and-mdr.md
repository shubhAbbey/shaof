# ATEEVRA-OD-006: Enterprise Digital Payment Instruments & Gateway Fee Absorption

**Decision ID:** `ATEEVRA-OD-006`  
**Domain Mapping:** Domain E (Payments, Gateway MDR & Tax Invoicing)  
**Functional Cluster:** Cluster 1 (Commercial Model & Corporate Tax Architecture)  
**Current Status:** PROPOSED (Pending Owner Direction / Selection)  
**Creation Date:** 2026-11-05  
**Target Approval Date:** Pre-Implementation Phase 1  
**Authoritative Path:** `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-006-payment-methods-and-mdr.md`  

---

## 1. Background & Context
Payment friction at luxury checkout directly causes cart abandonment. In luxury retail, charging payment gateway processing fees (MDR) to the client is considered poor etiquette.

## 2. Problem Statement
Which payment instruments should ATEEVRA enable, how should gateway processing MDR (2.0% + GST) be treated, and how should Cash on Delivery (COD) be managed?

## 3. Decision Alternatives Considered

### Option A: 100% MDR Absorption, UPI/Card Dominance, Restricted COD (RECOMMENDED)
- **Description:** ATEEVRA absorbs all gateway MDR into COGS/operating expenses; activates Amex, Visa Infinite, Mastercard World, UPI, and international cards; restricts COD to orders between ₹2,500 and ₹15,000 with pre-dispatch verification.
- **Pros:** Frictionless premium checkout experience; eliminates awkward payment surcharges; minimizes RTO risk on high-ticket items.
- **Cons:** Gateway MDR (~2.36% blended) internalized into P&L.

### Option B: Pass-Through Gateway Convenience Surcharge
- **Description:** Adding a 2.0% convenience fee to orders paid via credit card.
- **Pros:** Eliminates payment processing expense from corporate P&L.
- **Cons:** Unacceptable in luxury fashion; leads to immediate drop-off of high-net-worth cardholders.

### Option C: Unrestricted Cash on Delivery (COD) on All Orders
- **Description:** Allowing COD on all orders up to ₹50,000 without pre-verification.
- **Pros:** Maximizes impulsive initial cart checkout rate.
- **Cons:** Severe RTO rates (exceeding 35%); capital tied up in refused consignments; high courier cash-handling fees.

---

## 4. Recommended Option & Justification
**Option A** is recommended. Luxury brands internalize payment processing as a standard cost of doing business while protecting operations from catastrophic COD refusal rates.

---

## 5. Acceptance Criteria & Owner Ratification Block
- [ ] Storefront checkout integrates Stripe/Razorpay enterprise gateways with zero customer surcharges.
- [ ] Automated COD restriction applied on carts $> ₹15,000$.

```
+-------------------------------------------------------------------------+
|                        OWNER RATIFICATION BLOCK                         |
| Decision Selected: [  ] Option A    [  ] Option B    [  ] Option C      |
| Signature: ___________________________  Date: ________________________ |
+-------------------------------------------------------------------------+
```
