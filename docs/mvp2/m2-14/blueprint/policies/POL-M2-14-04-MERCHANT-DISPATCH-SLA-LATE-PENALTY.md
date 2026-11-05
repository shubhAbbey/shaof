# ATEEVRA Policy: POL-M2-14-04 — Merchant Dispatch SLA & Late-Dispatch Accountability Penalty

**Policy ID:** `POL-M2-14-04`  
**Policy Name:** Merchant Dispatch SLA & Late-Dispatch Accountability Penalty  
**Owner Decision Reference:** OD-08 (Merchant Lifecycle & Operational Performance) & OD-15 (Cancellation, Return, RTO & Accountability)  
**Parent Blueprint:** [`../ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](../ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Related Policies:** [`POL-M2-14-03-MERCHANT-CANCELLATION-PENALTY.md`](POL-M2-14-03-MERCHANT-CANCELLATION-PENALTY.md), [`POL-M2-14-05-CUSTOMER-PRE-DISPATCH-CANCELLATION.md`](POL-M2-14-05-CUSTOMER-PRE-DISPATCH-CANCELLATION.md), [`POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md`](POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md)  
**Current Governance Status:** `OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)`  
**Baseline Policy Version:** `1.1.0-PROPOSED`  
**Effective Date:** Subject to Formal Owner Ratification & Merchant Agreement Addendum Execution  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Purpose

Timely order fulfillment is vital to consumer satisfaction, marketplace retention, and brand integrity. When a merchant delays handing over packed merchandise to contracted logistics couriers, delivery promises made to consumers at checkout are compromised, resulting in customer churn, increased cancellation rates, and higher customer support inquiry volume.

To maintain operational rigor across the merchant seller network, this policy defines:
1. Standard **Dispatch SLA windows** (24 to 48 hours, capped at 72 hours).
2. The rigorous, objective definition of **"Dispatch Confirmation"**, established strictly by the **first physical carrier pickup scan** (not label generation).
3. A **provisional financial penalty of ₹50.00** per shipment dispatched past the SLA deadline.
4. Protection mechanisms for merchants when dispatch delay is attributable to **courier partner pickup failures** or verified platform issues.
5. Impact on **Late Dispatch Rate (LDR)** and merchant tier standing under [`POL-M2-14-06`](POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md).
6. Double-entry settlement ledger accounting and statutory GST positioning.

---

## 2. Owner-Approved Policy Directives

> **OWNER POLICY BASELINE — MERCHANT DISPATCH SLA & LATE PENALTY:**
> 
> 1. Every confirmed merchant order is subject to a mandatory **Dispatch Service Level Agreement (SLA)** window, defaulting to **24–48 hours** from order placement (excluding Sundays and national holidays).
> 2. **Definition of Dispatch:** "Dispatch" is legally and operationally defined **STRICTLY as the timestamp of the first physical electronic pickup scan** logged by an integrated 3PL logistics courier partner. Printing a shipping label or generating a manifest does NOT constitute dispatch.
> 3. If an order fails to receive a physical courier pickup scan before the expiration of the SLA deadline, the merchant is debited a **provisional financial penalty of ₹50.00 per late order**.
> 4. **Carrier Pickup Failure Protection:** If the merchant marks an order `READY_FOR_PICKUP` within the SLA and the courier fails to arrive or refuses handover, the merchant is **exempt from penalty**, provided proof of courier default (manifest timestamp or missed-pickup ticket) is established.
> 5. The ₹50.00 penalty is **debited directly from the merchant's settlement balance** via contractual set-off.
> 6. Late dispatches directly inflate the merchant's **Late Dispatch Rate (LDR)** and trigger progressive corrective enforcement under [`POL-M2-14-06`](POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md).

---

## 3. Dispatch SLA Structure & Operational Milestones

### 3.1 Standard SLA Tiers

| Fulfillment Category | Standard SLA Window | Grace Period | Maximum Permissible Cut-off |
| :--- | :---: | :---: | :---: |
| **Standard Merchant Goods** | 48 hours | 4 hours | 52 hours |
| **Fast-Track / Express Eligible** | 24 hours | 2 hours | 26 hours |
| **Custom / Made-to-Order Goods** | Merchant-Configured (Max 72h) | 6 hours | Configured SLA + 6h |

*Note: SLA timers pause during declared public holidays and Sundays, based on the merchant's registered warehouse location.*

### 3.2 Physical Pickup Scan vs. Label Generation

To eliminate misleading fulfillment reporting, ATEEVRA enforces a strict technical boundary between staging and physical dispatch:

```
[Order Confirmed]
       │
       ▼  (Merchant prepares package)
[Shipping Label Generated]  ──> Status: READY_FOR_PICKUP (SLA Timer Continues Running)
       │
       ▼  (Carrier physically arrives and scans barcode)
[First Carrier Hub/Van Scan] ──> Status: DISPATCHED / IN_TRANSIT (SLA Timer Stops)
```

> [!IMPORTANT]
> **Generating a shipping label or packing slip does NOT satisfy the dispatch obligation.** The SLA timer halts exclusively when the integrated 3PL courier API registers the `PICKUP_COMPLETED` or `OUTWARD_SCANNED` tracking webhook.

---

## 4. Late-Dispatch Penalty Mechanics & Financial Ledger

### 4.1 Financial Ledger Accounting

When an order crosses the SLA cut-off without an authorized exception:
1. The platform system automatically tags the order as `DISPATCH_LATE`.
2. A **₹50.00 late-dispatch penalty** is queued for settlement netting.
3. Accounting entries in ATEEVRA's settlement system:

| Ledger Account | Debit (₹) | Credit (₹) | Description |
| :--- | :---: | :---: | :--- |
| **Merchant Settlement Escrow (Payable)** | ₹50.00 | — | Contractual deduction from merchant payout balance |
| **Platform Penalty & Breach Recovery Income** | — | ₹50.00 | Operating revenue offsetting SLA monitoring and customer care expense |

### 4.2 GST Treatment Analysis

Consistent with CBIC Circular No. 178/10/2022-GST:
- The ₹50.00 penalty constitutes **Liquidated Damages for Delay in Performance** under Section 74 of the Indian Contract Act, 1872.
- Liquidated damages imposed to penalize non-observance of contractual deadlines are generally **exempt from GST (0%)** as they do not constitute consideration for a service.
- If tax counsel determines that the penalty should be accounted for as an administrative fee, 18% GST (₹9.00) will be added to the invoice, resulting in a ₹59.00 gross deduction.
- *Baseline Assumption:* Recorded as ₹50.00 liquidated damages pending formal tax opinion.

### 4.3 Customer Goodwill & Communication

Upon SLA breach, ATEEVRA customer support automatically dispatches an apologetic status communication to the customer, providing an updated estimated delivery date. The ₹50.00 penalty collected from the merchant may, at ATEEVRA's sole discretion, fund customer compensation (e.g., wallet promotional credits or priority shipping upgrades).

---

## 5. Carrier Pickup Failure & Merchant Exception Protocols

ATEEVRA recognises that dispatch delays may occur due to 3PL logistics partner inefficiencies rather than merchant negligence.

### 5.1 Qualified Exceptions (Zero Penalty)

Merchants are exempt from the ₹50.00 late penalty and LDR penalty scoring under the following conditions:
1. **`EXC-COUR-01` (Courier Missed Pickup):** The merchant marked the order `READY_FOR_PICKUP` at least 6 hours before the daily courier cutoff, but the courier partner failed to attempt pickup on that scheduled business day.
2. **`EXC-COUR-02` (Courier Capacity Rejection):** The carrier arrived but refused packages due to vehicle capacity exhaustion or scanner technical breakdown.
3. **`EXC-PLAT-01` (ATEEVRA Logistics API Outage):** ATEEVRA's carrier integration gateway was unable to generate manifests or transmit pickup requests within the SLA.
4. **`EXC-EXT-01` (Severe Weather / Force Majeure):** Cyclone, flooding, civic unrest, or government lockdown halting transport in the origin pin code.

### 5.2 Verification & Dispute Submission

- To qualify for `EXC-COUR-01`, the merchant must submit a **Missed Pickup Ticket** via the merchant portal before 23:59 on the SLA due date.
- ATEEVRA reconciles the merchant's `READY_FOR_PICKUP` timestamp with the carrier's GPS tracking or automated API logs.
- If verified, the penalty is dismissed immediately without requiring manual escalation.

---

## 6. Account Health Scoring Linkage

Late dispatches directly impact the **Late Dispatch Rate (LDR)** metric:

$$\text{LDR} = \left( \frac{\sum \text{Orders with First Pickup Scan past SLA Cut-off}}{\sum \text{Total Dispatched Orders}} \right) \times 100$$

- Measured on rolling **30-day** and **90-day** horizons.
- Thresholds:
  - **Healthy (Green):** $\text{LDR} < 2.0\%$
  - **Advisory (Yellow):** $2.0\% \le \text{LDR} \le 4.0\%$
  - **Critical Breach (Red):** $\text{LDR} > 4.0\%$
- Sustained high LDR triggers progressive account sanctions under [`POL-M2-14-06`](POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md), including removal of express shipping eligibility and daily order caps.

---

## 7. Governance, Implementation & Traceability Restrictions

1. **Zero Code / Schema Changes:** This document establishes the operational and financial specification only. No cron jobs, database migrations, or merchant portal modifications are authorized.
2. **Carrier SLA Synchronization:** Final enforcement is contingent upon executing bilateral Service Level Agreements with integrated 3PL couriers guaranteeing timely pickup attempts.
3. **Traceability:** Recorded in [`POLICY-REGISTER.md`](../POLICY-REGISTER.md) and governed under [`M2-14-OWNER-DECISION-REGISTER.md`](../../M2-14-OWNER-DECISION-REGISTER.md).
