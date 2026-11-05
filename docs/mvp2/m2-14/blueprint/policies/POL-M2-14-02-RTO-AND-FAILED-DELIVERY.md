# ATEEVRA Policy: POL-M2-14-02 — Return to Origin (RTO) & Failed Delivery Financial Policy
## Operational Handling, Freight Allocation, Packaging Loss Tracking & Reason-Code Governance

**Policy ID:** `POL-M2-14-02`  
**Policy Name:** Return to Origin (RTO) & Failed Delivery Financial Allocation Policy  
**Owner Decision Reference:** OD-02 (Refund Financial Liability) & OD-15 (Cancellation, Return, RTO & Accountability)  
**Parent Blueprint:** [`../ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](../ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Related Policies:** [`OD-02-05-COD-RTO-FUNDING.md`](OD-02-05-COD-RTO-FUNDING.md), [`POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md`](POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md), [`POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md`](POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md)  
**Current Governance Status:** `OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)`  
**Baseline Policy Version:** `1.1.0-PROPOSED`  
**Effective Date:** Subject to Formal Owner Ratification & 3PL Logistics SLA Execution  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Purpose

A Return to Origin (RTO) occurs when a dispatched parcel cannot be successfully handed over to the customer and is returned to the merchant's warehouse by the 3PL carrier.

In Indian e-commerce, failed deliveries represent the largest friction point on Cash on Delivery (COD) orders (historical industry failure rate of 15%–25%). Failed deliveries occur due to multiple distinct causes: customer doorstep refusals, uncontactable customers after 3 attempts, incorrect/incomplete addresses, courier operational delays, or merchant fulfillment errors (wrong item dispatched).

The purpose of this policy is to establish clear financial and operational boundaries for RTOs:
1. **Merchant Protection Against RTO Reverse Charges:** Genuine RTO and failed deliveries **must NEVER attract a separate reverse-shipping charge against the merchant**.
2. **Platform Freight Absorption:** ATEEVRA manages and absorbs the reverse-logistics freight exposure under its commercial framework (funded via COD collection fees and the Return-Cost Reserve under [`POL-OD-02-05`](OD-02-05-COD-RTO-FUNDING.md)).
3. **Packaging & Labour Losses:** The merchant absorbs the loss of packaging materials (polybags, boxes, tags) and internal warehouse handling labour already expended on the aborted order.
4. **Strict Segregation of Financial Components:** Forward freight, RTO freight, packaging loss, and merchant realizations must be recorded as separate, unmerged financial line items.
5. **Attributable Fault Separation:** Genuine customer refusals or courier delivery failures do NOT count against merchant account health. Only verified merchant-caused delivery failures impact performance standing.

---

## 2. Owner-Approved Policy Directives

> **OWNER POLICY BASELINE — RTO & FAILED DELIVERIES:**
> 
> 1. ATEEVRA shall **NOT charge the merchant a separate reverse-shipping fee** for genuine Return to Origin (RTO) or courier failed-delivery cases.
> 2. The reverse-shipping fee established under `POL-M2-14-01` applies **strictly to customer returns after successful delivery**, and must NEVER be automatically imposed on an RTO.
> 3. ATEEVRA shall manage and absorb RTO reverse-logistics freight within its platform commercial model and Return-Cost Reserve.
> 4. The merchant absorbs only the unrecoverable packaging materials and packaging labour costs already incurred.
> 5. Original forward-shipping costs and RTO-related courier freight must be **recorded separately** in platform accounts.
> 6. Platform operations must implement a standardized **Reason-Code and Evidence Framework** distinguishing customer refusal, customer unavailable, incorrect address, courier failure, and merchant-caused failure.
> 7. Genuine customer or courier delivery failures must **NEVER penalize merchant account health**. Repeated merchant-caused failures shall be escalated under `POL-M2-14-06`.

---

## 3. Strict Event Classification: RTO vs. Customer Return After Delivery

A common financial defect in e-commerce accounting is merging all inbound parcels into a generic "returns" account. ATEEVRA strictly separates four distinct post-dispatch events:

```
=================================================================================================================================
EVENT DISCRIMINATION MATRIX: RTO VS. CUSTOMER RETURN AFTER DELIVERY
=================================================================================================================================
Lifecycle Attribute      | Customer Return After Delivery    | Doorstep Rejection (RTO)        | Courier Failed Delivery (RTO)
-------------------------+-----------------------------------+---------------------------------+---------------------------------
1. Delivery Milestone    | Successfully Delivered (Day T+3); | Reached Destination Doorstep;   | Never Reached Customer Doorstep;
                         | Customer accepted & opened parcel.| Customer refused acceptance.    | Failed in transit / unreachable.
-------------------------+-----------------------------------+---------------------------------+---------------------------------
2. Return Window Trigger | Within 7-day return window.       | Immediate at delivery attempt.  | Carrier marks failed attempts.
-------------------------+-----------------------------------+---------------------------------+---------------------------------
3. Merchant Realization  | Previously credited on Day 7;     | Never disbursed;                | Never disbursed;
   Accounting Treatment  | Debited upon return intake.       | Order marked 'failed_delivery'. | Order marked 'failed_delivery'.
-------------------------+-----------------------------------+---------------------------------+---------------------------------
4. Reverse-Shipping Fee  | **DEBITED TO MERCHANT**           | **ZERO (₹0.00) MERCHANT DEBIT** | **ZERO (₹0.00) MERCHANT DEBIT**
   Allocation            | (Weight slab: ₹30 to ₹165+).      | (Absorbed by ATEEVRA Reserve).  | (Absorbed by ATEEVRA Reserve).
-------------------------+-----------------------------------+---------------------------------+---------------------------------
5. Forward Freight Paid  | Sunk cost.                        | Sunk cost.                      | Sunk cost.
-------------------------+-----------------------------------+---------------------------------+---------------------------------
6. Merchant Packaging &  | Sunk cost.                        | Sunk cost (Merchant absorbs     | Sunk cost (Merchant absorbs
   Labour Material Loss  |                                   | packaging & handling effort).   | packaging & handling effort).
-------------------------+-----------------------------------+---------------------------------+---------------------------------
7. Account Health Impact | Informational customer Remorse;   | Zero fault on merchant;         | Zero fault on merchant;
                         | Defect rates tracked separately.  | Customer COD profile tracked.   | Carrier SLA failure tracked.
=================================================================================================================================
```

---

## 4. Standardized Reason-Code & Evidence Framework

To ensure objective financial allocation and prevent unfair merchant penalties, 3PL carriers must log standardized reason codes supported by verifiable digital telemetry:

```
=================================================================================================================================
RTO REASON-CODE & RESPONSIBILITY TAXONOMY
=================================================================================================================================
Reason Code | Category Description       | Primary Evidence Required                     | Responsible Party | Financial Allocation
------------+----------------------------+-----------------------------------------------+-------------------+---------------------
RTO-CUST-01 | Customer Refused at Door   | Physical doorstep scan; driver audio log or   | Customer Remorse  | Merchant Reverse = ₹0
            | (Remorse / Mind Changed)   | customer SMS rejection confirmation.          |                   | ATEEVRA Reserve pays
------------+----------------------------+-----------------------------------------------+-------------------+---------------------
RTO-CUST-02 | Customer Unavailable       | 3 separate delivery attempt logs across 48h;  | Customer Action   | Merchant Reverse = ₹0
            | (3 Attempts Exhausted)     | automated OTP / SMS trigger to customer.      |                   | ATEEVRA Reserve pays
------------+----------------------------+-----------------------------------------------+-------------------+---------------------
RTO-ADDR-01 | Incomplete / Incorrect     | Geolocation tag at delivery pin; carrier call | Customer / Data   | Merchant Reverse = ₹0
            | Customer Address           | recording to customer uncontactable.          |                   | ATEEVRA Reserve pays
------------+----------------------------+-----------------------------------------------+-------------------+---------------------
RTO-COUR-01 | Courier Out of Service /   | Non-serviceable pincode routed in error; zero | 3PL Carrier Fault | Merchant Reverse = ₹0
            | Operational Delivery Delay | delivery attempt within contracted SLA.       |                   | Carrier penalty claim
------------+----------------------------+-----------------------------------------------+-------------------+---------------------
RTO-COUR-02 | In-Transit Parcel Damage   | Carrier damage log; crushed box photo at hub. | 3PL Carrier Fault | Governed by POL-OD-02-04
            | Prior to Doorstep Delivery | (Never reached customer).                     |                   | (Carrier Insurance Claim)
------------+----------------------------+-----------------------------------------------+-------------------+---------------------
RTO-MRCH-01 | Merchant Packing Violation | Barcode unreadable; package dimensions exceed | Merchant Fault    | Merchant Reverse Surcharge;
            | or Wrong Item Dispatched   | declared manifest by > 50%; leaking liquid.   |                   | Account Health Impact
=================================================================================================================================
```

---

## 5. Merchant Packaging Material & Labour Tracking

While merchants are shielded from reverse-freight logistics debits on genuine RTOs, they incur unrecoverable physical packaging and operational labour costs:

### 5.1. Typical Merchant Packaging Loss Components
1. **Outer Packaging Materials:** Corrugated cardboard boxes (₹12.00–₹25.00), tamper-evident polybags (₹4.00–₹8.00), bubble wrap/cushioning (₹5.00–₹10.00), brand tissue paper and branded sticker seals (₹3.00–₹6.00).  
   *Estimated Material Loss:* **₹24.00 to ₹49.00 per package**.
2. **Operational Labour Effort:** Warehouse picking, quality inspection, steaming/folding, boxing, label printing, and courier handover.  
   *Estimated Labour Cost:* **₹15.00 to ₹30.00 per package**.
3. **Total Merchant Economic Drag per RTO:** **₹39.00 to ₹79.00 per failed order**.

### 5.2. Operational Accounting Separation
- In the Merchant Portal, these losses must be explicitly categorized under:  
  `ANALYTICS_MERCHANT_ESTIMATED_PACKAGING_LOSS`
- **Inviolable Ledger Boundary:** Packaging losses are **internal merchant operating overheads**. ATEEVRA does not deduct packaging expenses from merchant settlements, nor does ATEEVRA reimburse merchants for packaging on customer doorstep rejections, unless a specific merchant defect program applies.

---

## 6. Financial Ledger & Settlement Reconciliation Rules

Under an RTO event, the platform executes the following ledger transactions:
1. **Reversal of Product Turnover:** The gross product entitlement is canceled (`order.status = 'failed_delivery'`); zero product payout leaves escrow.
2. **Forward Freight Account:** Sunk logistics expense debited to `EXP_LOGISTICS_3PL_FORWARD` (-₹70.00).
3. **RTO Reverse Freight Account:** Carrier return freight debited to `EXP_LOGISTICS_3PL_RTO` (-₹70.00 to -₹90.00). Funded entirely via platform COD fee revenue (`REV_PLATFORM_COD_FEES`) and the Return-Cost Reserve (`RESERVE_RETURN_COST_OD02`).
4. **Merchant Settlement Debit:** **₹0.00**. No reverse-shipping fee, no penalty fee, and no platform commission deducted.
5. **Customer Refund (Prepaid RTOs):** 100% full refund executed immediately upon RTO carrier scan confirmation.

---

## 7. Merchant Account Health Protection

1. **Strict Immunity for Genuine RTOs:** Reason codes `RTO-CUST-01`, `RTO-CUST-02`, `RTO-ADDR-01`, `RTO-COUR-01`, and `RTO-COUR-02` must **NEVER degrade a merchant's account health rating**.
2. **Seller Packaging Defect Escalation (`RTO-MRCH-01`):** Only where factual, photographic evidence from 3PL hub inspections demonstrates that delivery failed due to unreadable merchant barcodes, unsealed boxes, or wrong goods shipped, may the event be logged against the merchant's account health metrics under `POL-M2-14-06`.

---

## 8. Governance Status Confirmation

1. **Reconciliation with OD-02 v1.0.0:** Perfectly compatible with [`POL-OD-02-05`](OD-02-05-COD-RTO-FUNDING.md) (COD RTO Risk Controls). It formally ratifies that RTO reverse logistics is platform-absorbed and distinct from post-delivery customer remorse returns.
2. **Approval Status:** `OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)`.
3. **Execution Restriction:** Strictly documentation and analysis. Zero software code, Medusa modules, or database migrations are authorized.
