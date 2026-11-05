# ATEEVRA Marketplace — Policy-to-Implementation Traceability Matrix

**Document ID:** `TRC-M2-14-TRACEABILITY`  
**Governance Authority:** Phase M2-14 Central Policy Blueprint  
**Parent Blueprint:** [`ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Policy Register:** [`POLICY-REGISTER.md`](POLICY-REGISTER.md)  
**Last Updated:** 2026-11-03

---

## 1. Executive Summary & Architecture Boundary Principles

This document establishes the bidirectional traceability connecting high-level business policies to their future technical implementation modules, database models, event handlers, and test specifications.

### Strict Architectural Boundaries (As Established by ADR-001 & `ARCHITECTURE.md`):
1. **Medusa Commerce Engine (`apps/backend`):**  
   The authoritative commerce system of record for all order lifecycles, payments, customer carts, line-item ownership, fulfillments, returns, exchanges, and financial transactions.
2. **Strapi Headless CMS (`apps/cms`):**  
   The editorial marketing content layer. Strapi hosts marketing landing pages, policy FAQs, return instructions, and SEO copy. **Strapi NEVER stores orders, transactions, pricing calculations, or merchant settlement data.**
3. **Storefront & Merchant Portal (`apps/storefront`):**  
   The Next.js App Router presentation layer and selective BFF proxy. It displays prices, captures user actions, and submits mutations to Medusa.
4. **PostgreSQL Database:**  
   The durable ACID storage layer hosting `medusa_db` and `strapi_db`. All financial ledgers, policy snapshots, and idempotency records reside in `medusa_db`.
5. **Redis In-Memory Store:**  
   Dedicated strictly to caching (`cache:*`), session rate limiting (`ratelimit:*`), and ephemeral OTP storage (`otp:*`). **Redis must NEVER serve as the durable financial source of truth.**

> [!CAUTION]
> **Implementation Phasing Notice:**  
> This traceability document outlines **future technical requirements** for Phase M2-14. It clearly distinguishes existing architectural primitives from proposed new schemas and modules. **No code, database migrations, or API changes are authorized by this document.**

---

## 2. Existing Baseline vs. Proposed Future Implementation

| Architectural Domain | Existing Repository Baseline | Proposed Future M2-14 Implementation |
| :--- | :--- | :--- |
| **Merchant Scoping** | Scoped products via `merchant_product` link; orders display gross line-item sum (`unitPrice * qty`). | Scoped returns, line-item cancellations, and settlement adjustment records. |
| **Payment Processing** | Razorpay mock returning `{ status: 'refunded' }`; webhook handler returns `not_supported`. | Authoritative Razorpay API integration with idempotent webhook processing and refund status tracking. |
| **COD Workflow** | `ReturnEngine` validates UPI/IFSC regex in-memory; returns `status: 'pending'`. | Durable PostgreSQL payout records, SMS/WhatsApp OTP verification, and doorstep attempt tracking. |
| **Financial Ledger** | Zero seller balance adjustment tables; zero settlement deduction tables in PostgreSQL. | Dedicated `marketplace_ledger_entry` and `settlement_batch` tables supporting double-entry bookkeeping. |
| **Policy Snapshots** | Orders save standard line-item snapshots; no policy versioning attached to orders. | Explicit `policy_snapshot` JSON column in `Order` linking every order to active policy versions at checkout. |

---

## 3. Comprehensive Traceability Matrix

| Policy ID & Name | Business Rules & Financial Model | Architectural Component & Layer | Proposed Schema / Entity Models | Triggering Financial & Operational Events | Verification Test Suite References |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POL-OD-02-01**<br>Return-Cost Reserve | - Category-specific reserve %<br>- Separate prepaid vs COD risk<br>- Telemetry capture from Day 1<br>- Managerial pricing buffer | **Medusa Backend**<br>`apps/backend/src/modules/pricing`<br>(Future Pricing Engine Extension) | `category_pricing_reserve`<br>- `category_id`<br>- `prepaid_reserve_pct`<br>- `cod_reserve_pct`<br>- `version`, `effective_dates` | - `order.placed`<br>- `return.requested`<br>- `return.received`<br>- `settlement.reconciled` | - `TEST-UNIT-RESERVE-01`<br>- `TEST-ARITH-RESERVE-02`<br>- `TEST-TELEMETRY-LOG-03` |
| **POL-OD-02-02**<br>Prepaid vs COD Pricing | - Identical $P_{\text{sell}}$ across rails<br>- Zero customer COD surcharge<br>- Platform absorbs carrier fee (~₹40)<br>- Separate channel contribution | **Storefront & Medusa**<br>`apps/storefront/src/app/checkout`<br>`apps/backend/src/modules/payment` | `order.payment_method`<br>`order_financial_channel`<br>- `is_cod`<br>- `collection_fee_absorbed`<br>- `net_channel_contrib` | - `cart.payment_method_selected`<br>- `order.placed`<br>- `order.delivered`<br>- `payment.captured` | - `TEST-UI-PRICE-INVARIANT-01`<br>- `TEST-INT-COD-EXPENSE-02`<br>- `TEST-REPORT-SPLIT-03` |
| **POL-OD-02-03**<br>Gateway Fee Allocation | - Platform absorbs gateway MDR<br>- Zero seller MDR debit<br>- Realization liability separated<br>- Distinct reverse freight debit | **Medusa Backend**<br>`apps/backend/src/modules/settlement`<br>(Future Settlement Module) | `merchant_adjustment`<br>- `merchant_id`<br>- `order_id`<br>- `adj_type` (`REVERSE_FREIGHT`)<br>- `mdr_debited: 0.00` | - `return.inspected_merchant_fault`<br>- `refund.gateway_submitted`<br>- `settlement_batch.generated` | - `TEST-UNIT-MDR-ABSORB-01`<br>- `TEST-LEDGER-SEPARATION-02`<br>- `TEST-SETTLE-OFFSET-03` |
| **POL-OD-02-04**<br>Courier Damage Liability | - Customer refunded immediately<br>- Platform absorbs unrecovered loss<br>- No auto-seller debit on denial<br>- 6-milestone recovery lifecycle | **Medusa Backend & Portal**<br>`apps/backend/src/modules/dispute`<br>`apps/storefront/src/app/admin/claims` | `carrier_transit_claim`<br>- `claim_id`<br>- `tracking_id`<br>- `claimed_amt`, `recovered_amt`<br>- `seller_fault_proven: bool`<br>- `milestone_status` (1–6) | - `return.carrier_damage_reported`<br>- `carrier_claim.submitted`<br>- `carrier_claim.reimbursed`<br>- `carrier_claim.denied` | - `TEST-WORKFLOW-MILESTONE-01`<br>- `TEST-PROTECT-MERCHANT-02`<br>- `TEST-BAD-DEBT-WRITEOFF-03` |
| **POL-OD-02-05**<br>COD RTO Funding | - Platform absorbs -₹170 failure<br>- Mandatory SMS/WhatsApp OTP<br>- Max order value cap (₹5,000)<br>- Repeat-RTO customer safeguard | **Medusa & BFF Proxy**<br>`apps/backend/src/modules/risk`<br>`apps/storefront/src/lib/checkout` | `customer_risk_profile`<br>- `customer_id`<br>- `consecutive_rto_count`<br>- `cod_blocked_until`<br>`order_rto_incident` | - `checkout.otp_requested`<br>- `checkout.otp_verified`<br>- `order.delivery_failed_rto`<br>- `merchant.restock_confirmed` | - `TEST-RISK-CAP-ENFORCE-01`<br>- `TEST-OTP-AUTH-GATE-02`<br>- `TEST-RTO-CASH-DRAIN-03` |
| **POL-OD-02-06**<br>Pricing-Bound Conflicts | - Never violate $P_{\max}$ or MRP<br>- 4-step resolution order:<br>  1. Compress markup<br>  2. Renegotiate realization<br>  3. Renegotiate $P_{\max}$<br>  4. Suspend/reject SKU | **Medusa Backend & Portal**<br>`apps/backend/src/modules/pricing`<br>`apps/storefront/src/app/merchant/catalog` | `product_pricing_bound`<br>- `variant_id`<br>- `p_realization`, `p_max`<br>- `mrp`, `p_sell`<br>- `resolution_state`<br>- `compressed_margin_amt` | - `product.created`<br>- `product.updated`<br>- `pricing_engine.evaluated`<br>- `sku.suspended_unviable` | - `TEST-MRP-HARD-CEILING-01`<br>- `TEST-4STEP-HIERARCHY-02`<br>- `TEST-NO-SILENT-OVERRIDE-03` |

### 3.2 Proposed Policy Revisions Traceability (Baseline v1.1.0-PROPOSED)

| Policy ID & Name | Business Rules & Financial Model | Architectural Component & Layer | Proposed Schema / Entity Models | Triggering Financial & Operational Events | Verification Test Suite References |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POL-M2-14-01**<br>Customer Returns & Weight Reverse Fee | - Merchant debited weight fee (₹30–₹165+)<br>- 100% full customer refund<br>- Volumetric weight reweighing<br>- 7-day default return window | **Medusa Backend & Portal**<br>`apps/backend/src/modules/return`<br>`apps/backend/src/modules/settlement` | `merchant_return_fee`<br>- `return_id`, `merchant_id`<br>- `chargeable_weight_grams`<br>- `weight_tier`, `fee_amount`<br>- `gst_rate: 18%` | - `return.requested`<br>- `carrier.pickup_scan`<br>- `carrier.reweighed`<br>- `settlement.debited` | - `TEST-RETURN-WEIGHT-SLAB-01`<br>- `TEST-CUST-REFUND-FULL-02`<br>- `TEST-WEIGHT-DISPUTE-03` |
| **POL-M2-14-02**<br>RTO & Failed Delivery Allocation | - ₹0 reverse fee to merchant on genuine RTO<br>- Platform absorbs RTO freight via COD fees/reserve<br>- Merchant packaging drag (₹39–₹79) | **Medusa Logistics Engine**<br>`apps/backend/src/modules/fulfillment`<br>`apps/backend/src/modules/risk` | `order_rto_disposition`<br>- `order_id`, `rto_reason`<br>- `courier_scan_history`<br>- `merchant_reverse_fee: 0.00`<br>- `platform_rto_cost` | - `delivery.failed_ndr`<br>- `carrier.rto_initiated`<br>- `carrier.rto_delivered`<br>- `inventory.restocked` | - `TEST-RTO-ZERO-MERCH-FEE-01`<br>- `TEST-RTO-REASON-CODE-02`<br>- `TEST-RTO-PACK-DRAG-03` |
| **POL-M2-14-03**<br>Merchant Cancellation Penalty | - Provisional ₹25 penalty per order<br>- ₹0 platform facilitation fee earned<br>- Order Cancellation Rate (OCR) impact<br>- Outage & fraud appeals | **Medusa Backend & Admin**<br>`apps/backend/src/modules/order`<br>`apps/backend/src/modules/merchant` | `merchant_penalty_ledger`<br>- `penalty_id`, `merchant_id`<br>- `penalty_type: CANCELLATION`<br>- `amount: 25.00`<br>- `appeal_status` | - `order.cancelled_by_merchant`<br>- `order.auto_cancelled_sla`<br>- `penalty.appealed`<br>- `penalty.settled` | - `TEST-CANCEL-PENALTY-25-01`<br>- `TEST-ZERO-PLAT-FEE-02`<br>- `TEST-OCR-METRIC-CALC-03` |
| **POL-M2-14-04**<br>Late Dispatch SLA Penalty | - Provisional ₹50 late penalty<br>- SLA: 24–48h cut-off<br>- First physical pickup scan proof<br>- Courier missed pickup exception | **Medusa Logistics Engine**<br>`apps/backend/src/modules/fulfillment`<br>`apps/backend/src/modules/merchant` | `dispatch_sla_tracking`<br>- `order_id`, `sla_due_at`<br>- `ready_for_pickup_at`<br>- `first_carrier_scan_at`<br>- `penalty_amount: 50.00` | - `manifest.generated`<br>- `carrier.first_scan`<br>- `sla.breached`<br>- `dispute.lodged` | - `TEST-LATE-DISPATCH-50-01`<br>- `TEST-SCAN-VS-LABEL-02`<br>- `TEST-CARRIER-EXC-03` |
| **POL-M2-14-05**<br>Customer Pre-Dispatch Cancellation | - ₹0 merchant fee, ₹0 penalty, ₹0 rev ship<br>- 100% full customer refund<br>- Packaging drag tracked internally<br>- Pre-pickup boundary | **Medusa Backend & Storefront**<br>`apps/backend/src/modules/order`<br>`apps/storefront/src/app/account` | `order_cancellation_log`<br>- `order_id`<br>- `cancelled_by: CUSTOMER`<br>- `lifecycle_milestone: PRE_DISPATCH`<br>- `merchant_penalty: 0.00` | - `order.cancel_requested`<br>- `carrier_awb.voided`<br>- `refund.processed_100`<br>- `stock.unreserved` | - `TEST-PRE-DISPATCH-ZERO-FEE-01`<br>- `TEST-PRE-DISPATCH-REFUND-02`<br>- `TEST-STOCK-RESTORE-03` |
| **POL-M2-14-06**<br>Account Health & Enforcement | - 8 operational KPIs tracked<br>- 5 progressive enforcement stages<br>- T+14 payout hold & reserve withhold<br>- Natural justice & 5-day appeal | **Merchant Portal & Risk**<br>`apps/backend/src/modules/risk`<br>`apps/storefront/src/app/merchant/health` | `merchant_health_scorecard`<br>- `merchant_id`, `scorecard_date`<br>- `ocr_val`, `ldr_val`, `drr_val`<br>- `enforcement_stage (1-5)`<br>- `probation_until` | - `daily_metrics.aggregated`<br>- `health.stage_escalated`<br>- `merchant.appealed`<br>- `contract.suspended` | - `TEST-HEALTH-5STAGE-01`<br>- `TEST-METRIC-THRESHOLDS-02`<br>- `TEST-APPEAL-WORKFLOW-03` |

---

## 4. Proposed Database Entity Relationship Blueprint

```mermaid
erDiagram
    ORDER ||--o{ ORDER_LINE_ITEM : contains
    ORDER ||--|| ORDER_POLICY_SNAPSHOT : "captures version at placement"
    ORDER ||--o{ MERCHANT_ADJUSTMENT : generates
    ORDER ||--o{ CARRIER_TRANSIT_CLAIM : files
    CUSTOMER ||--|| CUSTOMER_RISK_PROFILE : tracks
    PRODUCT_VARIANT ||--|| PRODUCT_PRICING_BOUND : bounds
    CATEGORY ||--|| CATEGORY_PRICING_RESERVE : calibrates

    ORDER_POLICY_SNAPSHOT {
        uuid id PK
        uuid order_id FK
        jsonb active_policy_versions
        jsonb calculated_reserves
        timestamp captured_at
    }

    MERCHANT_ADJUSTMENT {
        uuid id PK
        uuid merchant_id FK
        uuid order_id FK
        string adjustment_type
        numeric gross_amount
        numeric eligible_offset_amount
        string recovery_status
        timestamp created_at
    }

    CARRIER_TRANSIT_CLAIM {
        uuid id PK
        uuid order_id FK
        string tracking_id
        numeric claimed_amount
        numeric recovered_amount
        int milestone_stage
        boolean merchant_packaging_breach
        timestamp updated_at
    }

    PRODUCT_PRICING_BOUND {
        uuid id PK
        uuid variant_id FK
        numeric p_realization
        numeric p_max
        numeric mrp
        numeric p_sell
        string resolution_step
    }
```

---

## 5. Security & Permission Boundaries

1. **Deny by Default:**  
   Merchant users can only query adjustments and claims where `merchant_id == session.merchant_id`. Client-supplied IDs are never trusted.
2. **Super Admin Privilege Separation:**  
   Only Super Admin with `FINANCIAL_OFFICER` role may approve bad-debt write-offs or execute manual settlement batch offsets.
3. **Audit Trail Completeness:**  
   Every state transition in `carrier_transit_claim` and `merchant_adjustment` must record `actor_id`, `actor_role`, `previous_state`, `new_state`, and `timestamp`.
