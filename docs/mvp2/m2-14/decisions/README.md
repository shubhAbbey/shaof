# ATEEVRA Phase M2-14 — Dedicated Owner Decision Analysis Documents

This directory contains the in-depth, dedicated supporting analysis documents for each Owner Decision (OD) in Phase M2-14 (Payments, Refunds, Returns and Exchanges).

---

## Architectural Principles & Governance Invariants

1. **One Dedicated Analysis Document per OD Decision:**
   Each of the 13 owner decisions (OD-01 through OD-13) has or will have its own standalone supporting Markdown document in this directory.

2. **Standardized Naming Convention:**
   `M2-14-OD-XX-<TOPIC>-ANALYSIS.md`
   *(Example: `M2-14-OD-01-PRICING-MODEL-ANALYSIS.md`)*

3. **Master Decision Register is the Single Source of Truth for Approval:**
   The master register [`../M2-14-OWNER-DECISION-REGISTER.md`](../M2-14-OWNER-DECISION-REGISTER.md) is the authoritative source of truth for:
   - Current governance and approval status.
   - Cross-decision policy reconciliation.
   - Master policy matrices and phase gating.

4. **Dedicated Documents Contain In-Depth Analysis:**
   Supporting documents unpack the granular implications that would otherwise clutter the master decision register.

5. **Mandatory Standard Sections for Every Decision Document:**
   Every OD analysis document must include:
   - Exact Decision Status (e.g., `PENDING OWNER DECISION` or `OWNER PROPOSED — PENDING FINAL APPROVAL`).
   - Specification References & Governance Authority.
   - Current Implementation & Architecture Baseline.
   - Evaluated Alternatives & Options Context.
   - Rigorous Mathematical / Operational Rules.
   - Trade-Off Analysis (Advantages & Disadvantages across Merchant, Platform, and Customer perspectives).
   - Financial Impact Breakdown.
   - Technical & Architectural Implications (Database, Backend, Frontend).
   - Dependencies on Other Owner Decisions.
   - Exact Question Requiring Owner Approval & Legal/CA Sign-Off.

6. **Recommendations are Strictly Advisory:**
   All recommendations (including recommended initial operational modes) are advisory only and carry the explicit status `RECOMMENDED — NOT APPROVED` until formal written sign-off is granted by the platform owner.

---

## Directory Index

| Decision ID | Document File | Topic | Status |
| :--- | :--- | :--- | :--- |
| **OD-01** | [`M2-14-OD-01-PRICING-MODEL-ANALYSIS.md`](M2-14-OD-01-PRICING-MODEL-ANALYSIS.md) | Marketplace Commission & Dynamic Pricing Engine | `OWNER PROPOSED — PENDING FINAL APPROVAL AND LEGAL/ACCOUNTING REVIEW` (Mode 1: `RECOMMENDED — NOT APPROVED`) |
| **OD-02** | [`M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md`](M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md)<br>🏛️ [Central Policy Blueprint](../blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md) | Refund Financial Liability, Gateway Fee & Logistics Allocation | `OWNER APPROVED — INITIAL POLICY BASELINE (OD-02-01 to OD-02-06)`<br>*(Implementation NOT authorized; validation gates apply)* |
| **OD-03** | `M2-14-OD-03-COUPON-ALLOCATION-ANALYSIS.md` | Promo Code Financing & Mixed-Cart Return Calculations | *(Pending Creation)* |
| **OD-04** | `M2-14-OD-04-SHIPPING-ALLOCATION-ANALYSIS.md` | Logistics Revenue Retention & 3PL Subsidies | *(Pending Creation)* |
| **OD-05** | `M2-14-OD-05-STATUTORY-WITHHOLDING-ANALYSIS.md` | Indian GST TCS (Sec 52) & IT TDS (Sec 194-O) Policy | *(Pending Creation)* |
| **OD-06** | `M2-14-OD-06-EXCHANGE-PRICE-DIFFERENCES-ANALYSIS.md` | Price Delta Billing vs. Equal-Value Only Restrictions | *(Pending Creation)* |
| **OD-07** | `M2-14-OD-07-PAYOUT-RAILS-SETTLEMENT-ANALYSIS.md` | Payout Scheduling & MVP-3 Banking Rails Boundary | *(Pending Creation)* |
| **OD-08** | `M2-14-OD-08-RETURN-WINDOW-ANALYSIS.md` | Configurable Return Eligibility Window | *(Pending Creation)* |
| **OD-09** | `M2-14-OD-09-EXCHANGE-RESERVATION-ANALYSIS.md` | Replacement Stock Hold Expiry & Advisory Lock TTL | *(Pending Creation)* |
| **OD-10** | `M2-14-OD-10-EXCHANGE-CANCELLATION-ANALYSIS.md` | Customer Self-Service Cancellation Operational Boundary | *(Pending Creation)* |
| **OD-11** | `M2-14-OD-11-NON-RETURNED-ITEM-ANALYSIS.md` | Exchange Fulfillment Sequencing & Inspection Gates | *(Pending Creation)* |
| **OD-12** | `M2-14-OD-12-REPEATED-FULFILLMENT-FAILURE-ANALYSIS.md` | Replacement RTO Protocol & Termination Thresholds | *(Pending Creation)* |
| **OD-13** | `M2-14-OD-13-EXCHANGE-TO-REFUND-CONVERSION-ANALYSIS.md` | Stockout Conversion Protocol & Customer Compensation | *(Pending Creation)* |
