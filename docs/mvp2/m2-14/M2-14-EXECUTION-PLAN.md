# ATEEVRA MVP-2 — Phase M2-14 Authoritative Execution Plan
## Payments, Refunds, Returns and Exchanges
**Document Classification:** `FINAL IMPLEMENTATION-READINESS EXECUTION PLAN`  
**Phase Status:** `PLANNING AND DOCUMENTATION COMPLETE — STRICTLY PLANNING ONLY`  
**Execution Invariant:** `NO IMPLEMENTATION AUTHORIZED — ZERO APPLICATION CODE OR MIGRATIONS APPLIED`  
**Branch:** `m2_14` (`apps/storefront/tsconfig.tsbuildinfo` modified/preserved; zero code modifications)  
**Commerce Core:** Medusa v2.19.0 (`@medusajs/core-flows`, `@medusajs/payment`, `@medusajs/inventory`, `@medusajs/order`, `@medusajs/locking-postgres`, `@medusajs/framework`)  

---

## Phase Documentation & Owner Decision Index

All governance policies, commercial realization rules, and operational decisions governing this execution plan are maintained in the dedicated M2-14 decisions directory:
- **Master Decision Register:** [`M2-14-OWNER-DECISION-REGISTER.md`](M2-14-OWNER-DECISION-REGISTER.md) (Authoritative single source of truth for all 15 owner policy statuses).
- **Supporting Decisions Directory:** [`decisions/`](decisions/)
  - [OD-01 Dedicated Analysis: Marketplace Commission & Pricing Model](decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md) (`decisions/M2-14-OD-01-PRICING-MODEL-ANALYSIS.md` — Status: `OWNER DIRECTION RECORDED — PENDING FEE SELECTION`)
  - [OD-02 Dedicated Analysis: Refund Financial Liability](decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md) (`decisions/M2-14-OD-02-REFUND-FINANCIAL-LIABILITY-ANALYSIS.md` — Status: `OWNER APPROVED — INITIAL POLICY BASELINE (v1.0.0) | PROPOSED REVISION v1.1.0-PROPOSED PENDING RATIFICATION`) | 🏛️ [Central Policy Blueprint](blueprint/ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)
  - [OD-14 Dedicated Blueprint: Merchant Identity Privacy & Customer-Facing Branding](blueprint/M2-14-OD-14-CUSTOMER-FACING-BRANDING-POLICY.md) (`blueprint/M2-14-OD-14-CUSTOMER-FACING-BRANDING-POLICY.md` — Status: `OWNER DIRECTION RECORDED — FORMAL OD-14 APPROVAL PENDING`)
  - [OD-15 Master Policy Suite: Cancellation, Return, RTO & Merchant Accountability Framework](blueprint/M2-14-CANCELLATION-RETURN-RTO-CLASSIFICATION-MATRIX.md) (`blueprint/M2-14-CANCELLATION-RETURN-RTO-CLASSIFICATION-MATRIX.md` — Status: `OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION PENDING RATIFICATION`)
    - 📜 [POL-M2-14-01: Returns & Reverse Shipping](blueprint/policies/POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md)
    - 📜 [POL-M2-14-02: RTO & Failed Delivery](blueprint/policies/POL-M2-14-02-RTO-AND-FAILED-DELIVERY.md)
    - 📜 [POL-M2-14-03: Merchant Cancellation Penalty](blueprint/policies/POL-M2-14-03-MERCHANT-CANCELLATION-PENALTY.md)
    - 📜 [POL-M2-14-04: Late Dispatch SLA & Penalty](blueprint/policies/POL-M2-14-04-MERCHANT-DISPATCH-SLA-LATE-PENALTY.md)
    - 📜 [POL-M2-14-05: Customer Pre-Dispatch Cancellation](blueprint/policies/POL-M2-14-05-CUSTOMER-PRE-DISPATCH-CANCELLATION.md)
    - 📜 [POL-M2-14-06: Merchant Account Health & Progressive Enforcement](blueprint/policies/POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md)
    - 🔄 [OD-02 Baseline v1.1.0-PROPOSED](blueprint/M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md)
    - 📈 [Revised Financial Model](blueprint/M2-14-REVISED-FINANCIAL-MODEL-AND-UNIT-ECONOMICS.md)
  - [Decision Guidelines & Architecture README](decisions/README.md) (`decisions/README.md`)

---

## 1. Requirement-to-Implementation Matrix

This matrix maps every requirement from the authoritative phase file `MVP2_Marketplace_Phases/phases/M2-14-payments-refunds-returns-and-exchanges.md`, `MVP2-AGENT-RULES.md`, and `MVP2-MASTER-PLAN.md`.

| # | Exact Specification Requirement | Acceptance Criterion | Existing Implementation & Relevant Function | Evidence Inspected | Missing Functionality | Proposed Implementation | Required Automated & Integration Tests | Dependencies & Unresolved Decisions |
| :- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **REQ-1** | *"Expose existing Razorpay/COD payment, refund, return and exchange workflows to Super Admin and eligible merchant scope."* | Super Admin and scoped merchants can view and execute authorized payment/refund/return actions; cross-tenant access fails closed with 403 Forbidden. | - `apps/backend/src/api/merchant/orders/[id]/route.ts`<br>- `apps/backend/src/api/admin/marketplace/orders/[id]/route.ts` | Inspected route handlers; verified `GET /merchant/orders/:id` filters items by `merchant_id` but lacks refund/return endpoints. | No merchant or admin endpoints exist for managing payments, viewing transaction histories, approving returns, or issuing refunds. | Implement scoped endpoints: `GET /merchant/orders/:id/payments`, `POST /merchant/orders/:id/refunds`, `POST /merchant/returns/:id/receive`, `POST /admin/marketplace/orders/:id/refunds`. | - Merchant sees own items only.<br>- Admin sees platform items.<br>- Merchant A cannot mutate Merchant B (403).<br>- Unauthenticated rejected (401). | Requires `merchant-order-item` link and verified tenant session context. |
| **REQ-2** | *"Define financial source of truth... before earnings/payout."* | Medusa v2 commerce engine and PostgreSQL database are the authoritative source of truth for all balances, captured totals, and refunds. | `apps/storefront/src/lib/orders/order-service.ts`: `processPrepaidRefund` (lines 813-820). | Inspected line 820: `await this.saveOrder(order)` saves financial state into Redis key `order:by_id:${order.id}`. | Order financial updates bypass PostgreSQL and live only in storefront Redis cache. | Move all financial mutations to Medusa backend; update Medusa `payment`, `refund`, and `order` tables in PostgreSQL. Invalidate Redis cache. | - DB persistence verification.<br>- Multi-instance state synchronization.<br>- Authoritative balance calculation tests. | Owner decision required on financial settlement and payout policies before earnings are calculated. |
| **REQ-3** | *"financial calculations traceable."* | Calculations are mathematically traceable; gross data is clearly identified as gross; zero unapproved policies hardcoded. | Subtotal calculation in `apps/backend/src/api/merchant/orders/[id]/route.ts` lines 122-132. | Inspected line 132: calculates `scopedSubtotal = sum(unitPrice * qty)`. | No formal financial calculation service; no distinction between gross sales and net figures. | Implement `FinancialEngine`: strictly derives and displays **Gross Transaction Data** (`quantity * unitPrice`) without assuming commission, deductions, or payout dates. | - Line-item mathematical trace.<br>- Verified absence of unapproved deductions.<br>- Pro-rata order total verification. | **Owner Business Decisions Required** on Commission (OD-01), Deductions (OD-02), Discounts (OD-03), and Shipping (OD-04). |
| **REQ-4** | *"Expose existing Razorpay/COD payment... refund... workflows"* | Scoped merchant can refund only their owned line items; Super Admin can execute platform-wide refunds. | `OrderService.processPrepaidRefund` in `apps/storefront/src/lib/orders/order-service.ts`. | Inspected lines 797-802: calls `/admin/payments/:id/refund` using `x-publishable-api-key` (rejected 401). Inspected provider: `refundPayment` is a mock. | **M2-00 DEFECT:** Publishable key cannot authorize Admin API. Backend provider does not call Razorpay API. | Implement backend `RefundService` invoking `createRefunds` and `addOrderTransactions` after verifying line-item ownership; implement outbound Razorpay API call in provider with `X-Refund-Idempotency`. | - Scoped line-item refund passes.<br>- Cross-merchant refund fails (403).<br>- Over-refund fails (400).<br>- Gateway idempotency verified. | Requires server-side `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. |
| **REQ-5** | *"COD, exchange differences, adjustments, net payable and settlement lifecycle before earnings/payout... If payout rules/integration are undefined, show truthful transaction state only; never fake payouts."* | Truthful transaction state recorded; valid destination details (UPI / Bank Transfer / Store Credit); no fake bank disbursements. | `ReturnEngine.validateRefundDetails` and `createCodRefundPayout` in `apps/backend/src/modules/return/return-engine.ts`. | Inspected lines 88-140: strictly validates UPI and IFSC/account; returns DTO with `status: 'pending'`. | Payout records are in-memory DTOs. Missing persistent backend storage and merchant/admin review. | Persist COD payout records in PostgreSQL with status strictly `pending`; display truthful ledger without faking bank transfers. | - Valid UPI regex.<br>- Valid IFSC & account.<br>- Strict `pending` status assertion.<br>- Idempotency key uniqueness. | Owner decision required on COD payout banking rails (OD-07, deferred to MVP-3). |
| **REQ-6** | *"unauthorized seller cannot mutate another's transactions"* | Mixed-seller orders decompose return requests by merchant; merchant accesses only own items; native workflows reused. | `apps/backend/src/modules/return/return-engine.ts` and `apps/storefront/src/app/api/account/orders/[id]/returns/route.ts`. | Inspected `ReturnEngine.validateReturnRequest`: validates item existence and quantities on single order. | Mixed-seller return requests not decomposed; merchant cannot approve, reject, or mark return received. | Decompose customer return requests by `merchant_id` via `merchant-order-item` link; add `GET /merchant/orders/:id/returns`, `POST /merchant/returns/:id/receive`. | - Decomposes mixed return.<br>- Merchant A cannot see Merchant B return.<br>- Quantity ceiling enforcement.<br>- Zero cross-tenant data leakage. | Requires `merchant-order-item` link. |
| **REQ-7** | *"Expose existing... return and exchange workflows"* | Customer requests variant replacement; merchant approves and fulfills replacement variant within same merchant. | Medusa v2 `createReservationsWorkflow` in `@medusajs/core-flows`. | Inspected installed core flows: `createReservationsWorkflow` and `deleteReservationsWorkflow` exist. | Zero exchange endpoints, DTOs, or UI exist in storefront or backend. | Implement `POST /api/account/orders/:id/exchanges` restricting exchange to replacement variants of the same merchant; reserve via `createReservationsWorkflow`. | - Exchange succeeds.<br>- Cross-merchant exchange fails (400).<br>- Stock reservation verified. | **Owner Business Decisions Required** on price differences (OD-06) and exchange commercial rules (OD-08 to OD-13). |
| **REQ-8** | *"idempotency, atomic transitions, audit/reconciliation."* | Concurrent refunds/returns cannot double-spend or corrupt state; no reliance on in-memory Redis fallback. | `AutoFallbackRedisClient` in `apps/storefront/src/lib/auth/redis-client.ts`. | Inspected lines 120-146: falls back to `InMemoryRedisAdapter` when Redis fails. | In-memory locking fails across serverless/multi-instance deployments. Webhook deduplication in Redis has 24h TTL. | Implement PostgreSQL advisory transaction locking on backend; implement database-backed `payment_refund_operation`, `payment_refund_sync_map`, and `payment_webhook_inbox` tables. | - Concurrent duplicate refund rejected.<br>- Advisory lock released on commit/rollback.<br>- Webhook inbox deduplication.<br>- Monotonic state guard. | PostgreSQL database. |
| **REQ-9** | *"audit/reconciliation."* | All financial mutations and return state transitions record an immutable audit event with actor, role, and before/after state. | In-memory audit array in `apps/backend/src/modules/marketplace/fulfillment-service.ts`. | Inspected lines 39-59: records structured audit events for fulfillments. | No audit logging for returns, refunds, or payment state transitions. | Add structured audit logging in `ReturnService` and `RefundService` recording actor ID, role, action, and payload. | - Audit event created on refund.<br>- Audit event created on return receipt.<br>- Non-tamperable event trail. | Database persistence. |
| **REQ-10** | *"MVP-1 payment/checkout/refund/return/exchange regressions pass"* | All existing MVP-1 catalog, checkout, Razorpay, COD, order, and fulfillment tests continue to pass 100%. | Existing test suites: 475 backend tests, 339 storefront tests, 71 lifecycle scenarios. | All suites currently pass 100% on `m2_14`. | Risk of breaking existing checkout/order flows during backend refactoring. | Preserve all existing public and customer interfaces; update backend plumbing underneath. | - Run full 475 backend test suite.<br>- Run full 339 storefront test suite.<br>- Run 71-scenario lifecycle audit. | Working test harnesses. |

---

## 2. Four-Dimension Financial Policy Boundaries

All unapproved financial policies (including 0% commission, strict line-item debits, full line-item price assumptions, goodwill expense allocations, equal-value exchange commercial restrictions, and unapproved discount/tax allocations) are **strictly prohibited** from being treated as approved policies.

The system enforces a strict separation across four distinct dimensions:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                FOUR FINANCIAL DIMENSIONS                                    │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ Dimension A: Existing Persisted Values  (What DB actually recorded at checkout)             │
│ Dimension B: Technical Limits & Safety  (Over-refund & double-spend prevention)             │
│ Dimension C: Tenant Scoping & Access    (Merchant can only access owned items)              │
│ Dimension D: Commercial Liability       (REQUIRES EXPLICIT OWNER DECISIONS)                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

| Financial Area | Dimension A: Existing Persisted Values | Dimension B: Technical Limits & Protections | Dimension C: Tenant Scoping & Access | Dimension D: Commercial Policy (REQUIRES OWNER DECISION) | Technical Enforcement in M2-14 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Platform Commission** | Zero commission fields exist in schema. Only line item unit price, quantity, and subtotal are recorded. | Mathematical calculation capability to compute `rate * amount` when formula is provided. | Merchant can only view sales data for line items bound to their `merchant_id`. | **OWNER DECISION REQUIRED (OD-01):**<br>1. Commission percentage/model.<br>2. Flat vs category-tiered vs merchant contract.<br>3. When commission is realized. | **DO NOT COMPUTE OR DISPLAY "NET EARNINGS".** Display strictly "Gross Line-Item Sales" and "Captured Customer Payment". Zero commission deducted. |
| **Refund Financial Liability** | `payment.refunds` stores aggregate refund transactions issued to customer. | Total refunds on order cannot exceed `payment.amount_captured`. Concurrency locked via PostgreSQL advisory lock. | Merchant can only trigger refunds on returns for line items they own. | **OWNER DECISION REQUIRED (OD-02):**<br>1. Does merchant gross get debited for refunds?<br>2. Does platform retain commission on refunded items?<br>3. Who bears cost of Admin goodwill refunds? | **DO NOT SILENTLY DEBIT MERCHANT BALANCES.** System tracks technical refunds linked to line items. No settlement or liability ledger is updated without approved policy. |
| **Customer Refund Amount Determination** | `order_line_item.unit_price`, `subtotal`, and line-level `discount_total`. | Refund request amount must be > 0 and <= remaining captured order balance. | Scoped merchant cannot refund more than the total value of their owned items. | **OWNER DECISION REQUIRED (OD-03):**<br>1. Is refund equal to `unit_price * qty`?<br>2. Are cart coupons deducted proportionally?<br>3. Is return shipping fee deducted? | **CALCULATIONS REQUIRE CONFIGURABLE POLICY.** System provides calculation primitives. No hardcoded deduction or policy rule is applied without owner sign-off. |
| **Order-Level Discount Allocation** | `order.discount_total` recorded at order level from cart promo code. | Total order discount is bounded by sum of line item subtotals. | Merchant can see line-level discounts on own items. Order discount is on platform order. | **OWNER DECISION REQUIRED (OD-03):**<br>1. Does platform subsidize order coupons?<br>2. Or is coupon split pro-rata across sellers?<br>3. How is coupon handled on partial returns? | **ZERO SILENT ALLOCATION.** Order-level discount remains strictly an order-level attribute. It is NOT pro-rated or debited from merchant gross sales. |
| **Mixed-Order Shipping Allocation** | `order.shipping_total` recorded at order level. | Total shipping fee paid by customer is immutable. | Merchant order view exposes destination shipping context (city, postal code) without shipping fee. | **OWNER DECISION REQUIRED (OD-04):**<br>1. Is shipping platform revenue?<br>2. Is it distributed to merchants by weight/origin?<br>3. Is shipping refunded on partial returns? | **ZERO SHIPPING ALLOCATION.** Shipping total remains on order level. Zero shipping revenue is credited or allocated to merchant line items. |
| **Statutory Tax Withholding (TCS/TDS)** | `order_line_item.tax_total` records GST per line item. Zero withholding fields exist. | Field structures available to record statutory withholdings. | Line-item GST is displayed to merchant for tax invoicing context. | **OWNER DECISION REQUIRED (OD-05):**<br>1. Will platform withhold 1% GST TCS?<br>2. Will platform withhold 1% Section 194-O TDS?<br>3. How are tax certificates issued? | **ZERO TAX WITHHOLDING.** Display line GST as captured. Do not calculate or deduct any TCS/TDS withholdings from transactions. |
| **Exchange Scope & Price Differences** | Original order line item references product variant in Medusa database. | Replacement variant must exist in catalog and have available inventory. | Replacement variant must belong to the **same merchant** (`merchant-order-item` link). | **OWNER DECISION REQUIRED (OD-06):**<br>1. Price delta billing rules.<br>2. Surcharge or customer refund on variant price differences. | **PRICE DELTA DISABLED.** System allows strictly equal-value exchanges. Price-difference exchanges remain disabled pending explicit owner policy OD-06. |
| **Merchant Settlement & Payout Rails** | No merchant bank accounts or payout ledger exist in database. | Persistent ledger table records verified transaction events (`order_id`, `payment_id`, `amount`). | Merchant can view audit ledger of transactions for their items. | **OWNER DECISION REQUIRED (OD-07):**<br>1. Settlement schedule (T+2, T+7, monthly).<br>2. Escrow release conditions (return window expired).<br>3. Banking rail (Razorpay Route, NEFT/IMPS). | **DEFERRED TO MVP-3.** Status strictly reported as `unsettled`. Zero simulated bank payouts or automated disbursements. |
| **Merchant Identity Privacy & Branding** | Merchant legal and contact details captured during M2-13 onboarding. | Serializer filtering, API response masking, and application log redactors prevent PII exposure. | Merchant views own operational/pickup details; public storefront sees brand & registered commercial entity; support routes via ATEEVRA. | **OWNER DIRECTION RECORDED (OD-14):**<br>1. Hide personal phone, personal email, and residential address.<br>2. Route customer care exclusively via ATEEVRA helpline.<br>3. Preserve statutory seller disclosures on tax invoice. | **STAGED AS PLANNING SPECIFICATION.** Zero software implementation authorized. |

---

## 3. P0-1: Database Identity, Index Limitations & Unresolved Multi-Module Atomicity

### 3.1 Review of Proposed Custom Indexes & Identity Disconnect

The proposal to inject external partial unique indexes on core Medusa tables was evaluated against Medusa v2's architecture:

```sql
-- Evaluated Index 1: Medusa Core Refund Table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_medusa_refund_op_id 
ON refund (payment_id, ((metadata->>'operation_id'))) 
WHERE (metadata->>'operation_id') IS NOT NULL;

-- Evaluated Index 2: Medusa Core Order Transaction Table
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS uq_medusa_order_trx_op_id 
ON order_transaction (order_id, reference_id) 
WHERE reference = 'refund';
```

#### Detailed Technical Findings & Identity Disconnect:
1. **Distinct Identities Enforced by Each Index:**
   - **Index 1 (`refund`):** Enforces uniqueness on the composite key of `(payment_id, metadata->>'operation_id')`.
   - **Index 2 (`order_transaction`):** Enforces uniqueness on the composite key of `(order_id, reference_id)`.
   - **CRITICAL ARCHITECTURAL FINDING:** The two indexes **do NOT visibly enforce the same identity**. `order_transaction.reference_id` is a generic varchar column. In Medusa core, `reference_id` is often populated with gateway refund transaction IDs, internal refund UUIDs, or arbitrary reference strings. Unless application logic explicitly passes the Ateevra operation UUID into `reference_id`, Index 2 does not correlate with Index 1. Claiming both indexes enforce the same identity is technically false without strict application-level parameter coupling.
2. **Consistent Generation and Propagation of Operation ID:**
   - Ateevra generates an immutable UUID (`rfop_...`) before dispatch.
   - For `refund`: passed via `paymentModuleService.createRefunds([{ ..., metadata: { operation_id: op.id } }])`.
   - For `order_transaction`: passed via `orderModuleService.addOrderTransactions([{ ..., reference: 'refund', reference_id: op.id }])`.
   - If any synchronization path passes Medusa's generated `refund.id` into `reference_id` (a common Medusa pattern), the identity correlation breaks completely.
3. **PostgreSQL Limitation: `CREATE INDEX CONCURRENTLY` in Transaction Blocks:**
   - In PostgreSQL, `CREATE INDEX CONCURRENTLY` **cannot run inside a transaction block** (`ERROR: CREATE INDEX CONCURRENTLY cannot run inside a transaction block`).
   - Standard database migration frameworks (including MikroORM migrations by default) execute migration scripts inside an implicit `BEGIN ... COMMIT` transaction. Attempting to execute `CREATE INDEX CONCURRENTLY` within a standard migration file results in an immediate runtime error.
4. **Medusa Migration Incompatibility & Upgrade Risks:**
   - Medusa v2 manages its database schemas independently via internal MikroORM migrations inside `@medusajs/payment` and `@medusajs/order`.
   - Injected external DDL indexes are unrecognized by Medusa's CLI. If a future Medusa release modifies table columns, restructures metadata, or renames entities, external indexes can cause deployment lock contention, upgrade crashes, or silent index invalidation.
5. **Detection of Existing Duplicates:**
   - A pre-migration audit query would be required:
     ```sql
     SELECT payment_id, metadata->>'operation_id', COUNT(*) 
     FROM refund WHERE metadata->>'operation_id' IS NOT NULL 
     GROUP BY payment_id, metadata->>'operation_id' HAVING COUNT(*) > 1;
     ```
     If duplicate rows exist, index creation aborts with error `23505` (`unique_violation`).
6. **Legitimate Multiple Refunds Against Same Payment:**
   - Because each distinct customer return generates a new `operation_id` (`rfop_1`, `rfop_2`), legitimate multiple partial refunds on the same payment remain possible. Only accidental duplicate inserts of the *same* operation ID would be blocked.
7. **Rollback Strategy:**
   - `DROP INDEX CONCURRENTLY IF EXISTS uq_medusa_refund_op_id;`
   - `DROP INDEX CONCURRENTLY IF EXISTS uq_medusa_order_trx_op_id;`

#### Authoritative Review Conclusion:
Safe integration with Medusa migrations **cannot be established**, and **no custom DDL on core Medusa tables is approved**. Therefore:
- The proposed partial unique indexes are **strictly unapproved**.
- The duplicate-insert risk across separate module transactions is **EXPLICITLY PRESERVED AS AN UNRESOLVED RESIDUAL RISK** inherent to Medusa v2's decoupled module architecture, mitigated strictly by application-level discovery heuristics, primary-node queries, and daily reconciliation audits.

---

### 3.2 Four-Part Separation of Concurrency Concepts

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                               FOUR SEPARATE SYNCHRONIZATION CONCEPTS                        │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Serialization Among Entrypoints   │ Guaranteed via PostgreSQL Advisory Lock on Conn_App  │
│ 2. Metadata/Reference Discovery      │ Best-effort application recovery aid (NOT an ACID    │
│                                      │ guarantee)                                           │
│ 3. Database-Enforced Uniqueness      │ Enforced on custom payment_refund_sync_map;          │
│                                      │ ABSENT on core Medusa tables (refund, transaction)   │
│ 4. Residual Duplicate-Insert Risk    │ Inherent risk when crash occurs before mapping       │
│                                      │ persistence and discovery query misses the row       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Serialization Among Entrypoints:** Guaranteed by PostgreSQL advisory lock held on `Conn_App` across the operation.
2. **Metadata & Reference Discovery:** When recovering, worker checks `listRefunds({ payment_id })` and `listOrderTransactions({ order_id, reference: 'refund' })`. This is an application-level discovery aid, not a database constraint.
3. **Database-Enforced Uniqueness:** Enforced on `payment_refund_sync_map` via `operation_id` PRIMARY KEY, `medusa_refund_id` UNIQUE, and `medusa_order_transaction_id` UNIQUE. Absent on Medusa core tables.
4. **Residual Duplicate-Insert Risk:** If Worker A commits an insert on `Conn_Pay` and crashes before updating `payment_refund_sync_map` on `Conn_App`, and Worker B's recovery discovery query misses the row (e.g. read replica delay or cache inconsistency), a second insert will occur. This is an accepted, documented unresolved risk.

---

## 4. P0-2: Accurate Classification of Synchronization Entrypoints

### 4.1 Explicit Overall Repository Audit Finding

> [!CAUTION]
> **AUTHORITATIVE AUDIT FINDING — ZERO VERIFIED END-TO-END REFUND PATHS:**  
> There is currently **NO verified end-to-end refund synchronization path** in the repository spanning customer refund initiation, backend provider dispatch, provider webhook processing, and Medusa reconciliation.  
> - The storefront prepaid endpoint ([`apps/storefront/src/app/api/account/orders/[id]/refunds/prepaid/route.ts`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/apps/storefront/src/app/api/account/orders/%5Bid%5D/refunds/prepaid/route.ts)) is partially implemented but **defective** (relies on publishable API key rejected with 401, updates only Redis).  
> - The backend `RefundService`, backend refund webhook receiver, reconciliation worker, and admin reconciliation route remain **PROPOSED / NOT FOUND** in the repository.  
> - Proposed designs must not be described as implemented repository behavior.

---

### 4.2 Entrypoint Classification Matrix

| # | Actual Entrypoint | Repository Source File & Line | Repository Classification | Actual Call Chain | Medusa Sync Invoked? | Order Lock Acquisition Point |
| :- | :--- | :--- | :--- | :--- | :--- | :--- |
| **EP-1** | **Razorpay Webhook Handler** | [`apps/storefront/src/app/api/webhooks/razorpay/route.ts#L6-L84`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/apps/storefront/src/app/api/webhooks/razorpay/route.ts#L6-L84) | **EXISTING AND VERIFIED (CHECKOUT ONLY; REFUNDS UNHANDLED)** | `POST /api/webhooks/razorpay` &rarr; `CheckoutService.verifyRazorpayWebhookSignature` &rarr; `CheckoutService.processWebhookEvent` in [`checkout-service.ts#L865-L910`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/apps/storefront/src/lib/checkout/checkout-service.ts#L865-L910). | **NO.** Only handles `payment.captured` and `order.paid`. Refund events (`refund.processed`, `refund.failed`) fall through unhandled. | Uses Redis key `webhook:processed:${eventId}` with 24h TTL. Zero PostgreSQL advisory locks. *(Proposed: forward to backend to acquire PostgreSQL advisory lock).* |
| **EP-2** | **Storefront Prepaid Refund Endpoint** | [`apps/storefront/src/app/api/account/orders/[id]/refunds/prepaid/route.ts#L10-L64`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/apps/storefront/src/app/api/account/orders/%5Bid%5D/refunds/prepaid/route.ts#L10-L64) | **PARTIALLY IMPLEMENTED (DEFECTIVE / STOREFRONT ISOLATED)** | `POST /api/account/orders/[id]/refunds/prepaid` &rarr; `OrderService.processPrepaidRefund` in [`order-service.ts#L740-L825`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/apps/storefront/src/lib/orders/order-service.ts#L740-L825). | **NO (FAILS).** Line 797 attempts `fetch(/admin/payments/:id/refund)` with publishable key (401 rejected). Line 820 writes state to Redis only. | Acquires 30-second Redis distributed lock `lock:refund:${orderId}`. Zero PostgreSQL advisory locks. **Backend `RefundService` does NOT exist in the repository.** |
| **EP-3** | **First-Dispatch Response Handler** | `apps/backend/src/modules/payment/refund-service.ts` | **PROPOSED (DOES NOT EXIST IN REPOSITORY)** | Outbound Razorpay HTTPS POST returns HTTP 200 &rarr; invokes Medusa sync. In `razorpay-provider.ts#L84-L93`, `refundPayment()` is currently a mock. | **NO.** `refund-service.ts` does not exist. | *Proposed:* Opens `Conn_App`, acquires `pg_advisory_xact_lock(key)`, locks `payment_refund_sync_map FOR UPDATE`. |
| **EP-4** | **Reconciliation Polling Worker** | `apps/backend/src/modules/payment/refund-reconciliation-worker.ts` | **PROPOSED (DOES NOT EXIST IN REPOSITORY)** | Background worker polling Razorpay GET API for unknown refunds &rarr; invokes Medusa sync. | **NO.** No worker file or job exists. | *Proposed:* Opens `Conn_App`, acquires `pg_advisory_xact_lock(key)`, locks `payment_refund_sync_map FOR UPDATE`. |
| **EP-5** | **Admin Manual Reconcile Route** | `apps/backend/src/api/admin/marketplace/orders/[id]/refunds/reconcile/route.ts` | **PROPOSED (DOES NOT EXIST IN REPOSITORY)** | Super Admin clicks manual reconciliation in dashboard &rarr; triggers sync. | **NO.** Admin orders directory contains only `fulfill` and `fulfillments`. | *Proposed:* Scoped route opens `Conn_App`, acquires `pg_advisory_xact_lock(key)`, locks `payment_refund_sync_map FOR UPDATE`. |

**Provider Invocation Invariant:** Under no circumstances may provider-facing `refundPayment()` be called to synchronize a confirmed refund. `refundPayment()` calls the gateway provider. Synchronization must invoke generated CRUD `paymentModuleService.createRefunds()`.

---

## 5. P0-3: Advisory-Lock Namespace Verification & Hash Entropy

### 5.1 Technical Correction of Advisory-Lock Key Width & Hash Entropy
Inspection of PostgreSQL internals and Medusa's native locking provider establishes the exact key derivation:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                          ADVISORY LOCK KEY DERIVATION & WIDTH AUDIT                         │
├──────────────────────────┬────────────────────────────┬─────────────────────────────────────┤
│ Dimension                │ Root Order Advisory Lock   │ Medusa Inventory Advisory Lock      │
├──────────────────────────┼────────────────────────────┼─────────────────────────────────────┤
│ Exact Hash Function      │ PostgreSQL hashtext()      │ JavaScript djb2 (hashStringToInt)   │
│ Hash Output Width        │ 32-bit signed integer      │ 32-bit unsigned integer (hash >>> 0)│
│ Output Range             │ -2,147,483,648 to 2,147,483,647 │ 0 to 4,294,967,295             │
│ Lock Overload Used       │ pg_advisory_xact_lock(bigint) │ pg_advisory_xact_lock(bigint)     │
│ Key Parameter Width      │ 64-bit bigint              │ 64-bit bigint                       │
│ Effective Entropy Width  │ STRICTLY 32 BITS           │ STRICTLY 32 BITS                    │
└──────────────────────────┴────────────────────────────┴─────────────────────────────────────┘
```

#### Detailed Findings & Unverified Collision Risk:
1. **`hashtext()` is NOT a 64-Bit Hash:** PostgreSQL's built-in `hashtext(text)` returns a 32-bit signed integer (`int4`). Describing it as a 64-bit hash is technically false.
2. **Key Parameter Width vs. Hash Entropy:** When PostgreSQL executes `SELECT pg_advisory_xact_lock(hashtext('order:' || order_id))`, the 32-bit integer is widened to `bigint` by implicit casting. The lock key parameter is 64 bits wide, but its input entropy is strictly **32 bits wide**.
3. **Exact Overload & Shared Namespace Contamination:**
   - Both root order locking and Medusa inventory locking invoke the **exact same single-argument overload: `pg_advisory_xact_lock(bigint)`**.
   - In PostgreSQL internals (`lock.c`), all single-argument advisory lock calls share the same internal lock tag namespace (`locktag_field4 = 1`).
   - If `hashtext('order:' || order_id)` produces the same numerical integer as `hashStringToInt(inventory_item_id)`, **a root order lock and an inventory lock will collide in PostgreSQL**, causing false lock contention between an order operation and an unrelated stock reservation.
4. **Evaluation of Two-Argument Overload `pg_advisory_xact_lock(int, int)`:**
   - In PostgreSQL, `pg_advisory_lock(int4, int4)` sets `locktag_field4 = 2`, which is technically distinct from the single-argument overload (`locktag_field4 = 1`).
   - However, because Medusa's `PostgresAdvisoryLockProvider` hardcodes the single-argument overload `SELECT pg_advisory_xact_lock(?)`, any custom root order lock using the single-argument overload directly shares the namespace.
   - Unless verified against the exact PostgreSQL runtime and connection pooler, **complete collision elimination cannot be claimed**.
   - **Status:** This cross-namespace collision risk is **explicitly documented as an unverified, unresolved risk**.

---

### 5.2 Checkout & Exchange Inventory Reservation Matrix

Inspected [`core-flows/dist/cart/steps/reserve-inventory.js#L38-L44`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/node_modules/@medusajs/core-flows/dist/cart/steps/reserve-inventory.js#L38-L44), [`core-flows/dist/reservation/steps/create-reservations.js#L20-L25`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/node_modules/@medusajs/core-flows/dist/reservation/steps/create-reservations.js#L20-L25), and [`locking-postgres/dist/services/advisory-lock.js#L15-L45`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/node_modules/@medusajs/locking-postgres/dist/services/advisory-lock.js#L15-L45).

| Path | Calling Code / Workflow | Native Lock Acquired? | Lock Scope & Protection Level |
| :--- | :--- | :--- | :--- |
| **Path 1: Standard Checkout** | `completeCartWorkflow` &rarr; `reserveInventoryStep` | **YES** | `locking.execute()` holds `pg_advisory_xact_lock` on `Conn_Lock` across entire reservation creation. |
| **Path 2: Native Reservation Workflow** | `createReservationsWorkflow` &rarr; `createReservationsStep` | **YES** | `locking.execute()` holds `pg_advisory_xact_lock` on `Conn_Lock` across entire reservation creation. |
| **Path 3: Direct Service Call** | `inventoryService.createReservationItems()` | **NO (BYPASSES LOCK)** | Opens transaction on `Conn_Inv` only. **Bypasses advisory lock.** Concurrent checkout can race and oversell. |
| **Path 4: Direct DB Update** | Direct SQL update to `inventory_level.reserved_quantity` | **NO (BYPASSES LOCK)** | Completely bypasses validation and locks. **Strictly prohibited.** |

**MANDATORY ARCHITECTURAL REQUIREMENT:** Exchanges MUST invoke `createReservationsWorkflow` (or wrap inside `locking.execute(lockingKeys, ...)`). Calling `inventoryService.createReservationItems()` directly is strictly prohibited.

* **Global Lock Hierarchy (Deadlock Prevention):**
  $$\text{Level 1: Root Order Lock (order:order\_id)} \longrightarrow \text{Level 2: Inventory Item Lock (djb2(inventory\_item\_id))}$$
  Transactions MUST acquire locks strictly in this order to guarantee zero circular deadlocks.

---

## 6. P0-3: Ownership-Safe Orphan Reservation Recovery

To guarantee that reservations are never released based merely on age thresholds or temporary database race windows:

### 6.1 Durable Reservation Ownership Contract
When an exchange reserves stock via `createReservationsWorkflow`, it passes immutable ownership metadata:
```ts
{
  inventory_item_id: replacementInventoryItemId,
  location_id: locationId,
  quantity: exchangeQuantity,
  description: `Exchange replacement for ${exchange_op_id}`,
  metadata: {
    exchange_op_id: exchange_op_id,
    order_id: orderId,
    line_item_id: originalLineItemId,
    claim_id: claimId,
    merchant_id: merchantId
  }
}
```

### 6.2 Ownership-Safe Cleanup Protocol Under Lock

A reservation is released ONLY when the following 6-step verification succeeds under lock:

```
[ Orphan Cleanup Worker ]
  1. Candidate Reservation Discovered:
     - description LIKE 'Exchange replacement for exop_%'
     - created_at < NOW() - INTERVAL '5 minutes'
  2. Extract order_id, inventory_item_id, and exchange_op_id from reservation metadata.
  3. Acquire Locks in Strict Hierarchical Order:
     - Level 1: Root Order Advisory Lock: pg_advisory_xact_lock(hash('order:' || order_id))
     - Level 2: Inventory Item Lock: locking.execute([inventory_item_id], async () => { ... })
  4. Under Lock, Re-verify Entities:
     - Re-read reservation from inventoryService.retrieveReservationItem(reservation.id).
       Verify item, location, and quantity match candidate record.
     - Re-read order_line_item_claim:
       SELECT * FROM order_line_item_claim 
       WHERE metadata->>'exchange_op_id' = reservation.metadata->>'exchange_op_id' 
       FOR UPDATE;
  5. Evaluation Rules:
     - Case A (Active Valid Exchange): Claim exists AND physical_status IN ('requested', 'received') AND claim_status == 'active'.
       ACTION: DO NOT RELEASE. Link claim.reservation_id = reservation.id if missing.
     - Case B (Definitively Canceled): Claim exists AND physical_status == 'canceled' AND claim_status == 'released'.
       ACTION: SAFE TO RELEASE.
     - Case C (Definitively Abandoned): NO claim exists in order_line_item_claim for exchange_op_id.
       Because the worker holds the Root Order Lock, any in-flight claim transaction would have committed or rolled back.
       The absence of a claim under lock proves the initiation transaction rolled back.
       ACTION: SAFE TO RELEASE.
  6. Idempotent Release Execution:
     - Call deleteReservationsWorkflow(container).run({ input: { ids: [reservation.id] } }).
     - Record immutable audit event: inventory.orphan_reservation_released with actor 'system_cleanup_worker'.
     - Subsequent worker runs discover no reservation, making repeated execution safe and harmless.
```
**SAFETY INVARIANT:** Age or missing rows alone NEVER trigger deletion. Verification must execute under two-level hierarchical locks.

---

## 7. P0-4: Complete Exchange Lifecycle & Policy Boundaries

All unapproved commercial assumptions have been removed from technical invariants and registered as explicit Owner Decisions Required:

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 COMPLETE EXCHANGE LIFECYCLE                                 │
├───────────────────────┬──────────────────────────────────────┬──────────────────────────────┤
│ Lifecycle Stage       │ Database / Inventory State           │ Financial & Claim Status     │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 1. Exchange Requested │ - Replacement SKU reserved via       │ physical_status: 'requested' │
│                       │   createReservationsWorkflow.        │ financial_status: 'none'     │
│                       │ - Claim created for original line.   │ claim_status: 'active'       │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 2. Original Received  │ - Merchant inspects item at warehouse│ physical_status: 'received'  │
│                       │ - Confirms receipt via backend route.│ financial_status: 'none'     │
│                       │ - Replacement reservation remains.   │ claim_status: 'active'       │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 3. Fulfillment Init   │ - Merchant initiates shipment of B.  │ physical_status: 'received'  │
│                       │ - Carrier tracking number assigned.  │ financial_status: 'none'     │
│                       │                                      │ claim_status: 'active'       │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 4. Fulfillment Done   │ - Fulfillment completes. Reservation │ physical_status: 'received'  │
│                       │   consumed; stock decremented.       │ financial_status: 'none'     │
│                       │ - Exchange completed.                │ claim_status: 'settled'      │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 5. Canceled Before    │ - deleteReservationsWorkflow deletes │ physical_status: 'canceled'  │
│    Receipt            │   reservation; stock restored.       │ financial_status: 'none'     │
│                       │ - Claim released.                    │ claim_status: 'released'     │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 6. Cancellation After │ - Subject to Owner Policy OD-10.     │ If permitted by owner:       │
│    Receipt            │   Default: Locked in received state. │ physical_status: 'received'  │
│                       │   Cannot cancel without policy.      │ claim_status: 'active'       │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 7. Return Window      │ - Subject to Owner Policy OD-08.     │ If expired per owner rule:   │
│    Expiry             │   Default: Reservation held until    │ Worker releases reservation; │
│                       │   configured policy expiration.      │ claim transitions to released│
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 8. Non-Returned Goods │ - Subject to Owner Policy OD-11.     │ Customer kept original item. │
│                       │   Default: Requires manual review.   │ Commercial remedy locked.    │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 9. Repeated Fulfill-  │ - Subject to Owner Policy OD-12.     │ Replacement undeliverable.   │
│    ment Failures      │   Default: Item held in warehouse.   │ Conversion to refund BLOCKED │
│                       │   Zero silent refund conversions.    │ pending OD-13.               │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 10. Price Differences │ - Price delta exchanges disabled     │ BLOCKED pending OD-06.       │
│     (OD-06)           │   pending explicit owner policy.     │                              │
└───────────────────────┴──────────────────────────────────────┴──────────────────────────────┘
```

- **Financial Invariant:** Equal-value exchanges remain strictly financially neutral: `financial_status = 'none'`. Zero fictitious refunds, captures, or negative order transactions are recorded.
- **Price-Difference Invariant:** Exchanges involving price differences are strictly disabled pending explicit owner resolution of **OD-06**.

---

## 8. P0-5: First-Dispatch Worker Concurrency Protocol

```sql
UPDATE payment_refund_operation
SET status = 'gateway_submitted',
    worker_id = $1,
    gateway_submitted_at = NOW(),
    updated_at = NOW()
WHERE id = (
    SELECT id FROM payment_refund_operation
    WHERE status = 'initiated' AND gateway_submitted_at IS NULL
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
)
RETURNING *;
```

### Protocol & Crash Proof
1. **Single Worker Claim:** `FOR UPDATE SKIP LOCKED` guarantees only one worker acquires the row. Concurrent workers skip locked rows without contention.
2. **Commit Before Dispatch:** The claim transaction commits to PostgreSQL immediately. The database connection is released back to the pool.
3. **Dispatch Outside Database Transaction:** Worker sends the HTTPS POST request to Razorpay (`/v1/payments/{id}/refund`) outside any database transaction. Zero database row or advisory locks are held during network I/O.
4. **Crash After Claim Commit:** Local record has `status = 'gateway_submitted'` and `gateway_submitted_at` set. Because physical packet transmission over the internet cannot be proven, recovery treats it as **POSSIBLY DISPATCHED**. Automated outbound retries are **STRICTLY PROHIBITED**. Operation transitions to `status = 'unknown'`.
5. **No Automatic Balance Release:** Time thresholds (5 minutes, 2 hours, 24 hours) trigger monitoring and escalation alerts only. Neither 2-hour nor 24-hour milestones ever automatically release reserved balances or quantities. All funds remain locked until definitive evidence is obtained.

---

## 9. P0-6: Webhook Event Authenticity & Terminal-State Resolution Matrix

### 9.1 Verification of Currently Implemented vs. Proposed Webhook Authenticity

Inspection of the actual storefront webhook handler reveals:

- **Currently Implemented Functionality ([`apps/storefront/src/app/api/webhooks/razorpay/route.ts#L6-L84`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/apps/storefront/src/app/api/webhooks/razorpay/route.ts#L6-L84)):**
  - Verifies `x-razorpay-signature` over `req.text()` using HMAC-SHA256 with `RAZORPAY_WEBHOOK_SECRET`.
  - Checks Redis key `webhook:processed:${eventId}` with 24h TTL.
  - Processes ONLY `payment.captured` and `order.paid` by calling `CheckoutService.completeCart()`.
  - **Does NOT** compute or verify payload hashes.
  - **Does NOT** persist raw payloads or event history in a database inbox.
  - **Does NOT** handle any refund events (`refund.processed`, `refund.failed`, `refund.created`).
- **Proposed Webhook Authenticity Specification:**
  - **Provider Event ID:** Extracted from `eventData.id`.
  - **Signature & Raw Request Payload:** Dual HMAC-SHA256 signature verification over exact raw UTF-8 request body string before JSON parsing.
  - **Exact Payload-Hash Input:** SHA-256 digest computed strictly over the canonical raw request buffer.
  - **Duplicate Delivery vs. Altered Payload:**
    - Same `event_id` + identical `payload_hash` &rarr; Duplicate delivery. Return HTTP 200 `{ duplicate: true }`.
    - Same `event_id` + differing `payload_hash` &rarr; Altered payload / Security replay attack. Reject HTTP 409 Conflict.
  - **Durable Event History:** Persisted in PostgreSQL `payment_webhook_inbox` (`event_id`, `event_name`, `provider`, `payload_hash`, `raw_payload`, `received_at`).
  - **Authoritative Provider Reconciliation:** For ambiguous terminal transitions (e.g. `terminal_conflict`), an active read query (`GET /v1/payments/:id/refunds`) against Razorpay's authoritative API is mandatory before taking action.

---

### 9.2 Complete Webhook Transition Matrix

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                           WEBHOOK TRANSITION & CONFLICT MATRIX                              │
├───────────────────────┬──────────────────────────────────────┬──────────────────────────────┤
│ Scenario              │ Local State / Event Condition        │ Action & Permitted Transition│
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 1. Same event ID,     │ Any local state                      │ DUPLICATE DELIVERY:          │
│    same payload hash  │                                      │ Return HTTP 200 { duplicate }│
│                       │                                      │ Zero DB state mutation.      │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 2. Same event ID,     │ Any local state                      │ SECURITY CONFLICT:           │
│    different hash     │                                      │ Payload tampering detected.  │
│                       │                                      │ REJECT immediately HTTP 409. │
│                       │                                      │ Security alert logged.       │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 3. Different event ID,│ In-progress / gateway_submitted      │ NORMAL LIFECYCLE EVENT:      │
│    same refund ID     │                                      │ Do NOT discard. Evaluate     │
│                       │                                      │ transition under order lock. │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 4. refund.failed then │ Current state: failed (terminal)     │ TERMINAL CONFLICT:           │
│    refund.processed   │ Incoming event: refund.processed     │ DO NOT OVERWRITE. Mark inbox │
│                       │                                      │ 'terminal_conflict'. Hold    │
│                       │                                      │ resources. Provider GET sync.│
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 5. refund.processed   │ Current state: completed (terminal)  │ REVERSAL ESCALATION:         │
│    then refund.failed │ Incoming event: refund.failed        │ DO NOT OVERWRITE. Mark inbox │
│                       │                                      │ 'reversal_escalation'. Alert │
│                       │                                      │ finance for manual review.   │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 6. Unknown Operation  │ Not found in Ateevra DB              │ UNRECOGNIZED TRANSACTION:    │
│    (Valid signature)  │                                      │ Ingest to unmapped inbox log.│
│                       │                                      │ Return HTTP 200. Zero updates│
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 7. Event Before Local │ Current state: initiated             │ OUT-OF-ORDER INGESTION:      │
│    Dispatch Update    │                                      │ Ingest inbox. Advance status │
│                       │                                      │ gateway_submitted; sync.     │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 8. Webhook & Worker   │ Concurrent execution                 │ RACE CONVERGENCE:            │
│    Racing             │                                      │ Serialize on order lock.     │
│                       │                                      │ Winner commits; loser exits. │
├───────────────────────┼──────────────────────────────────────┼──────────────────────────────┤
│ 9. Provider State     │ Local terminal != Provider GET       │ DISCREPANCY ESCALATION:      │
│    Discrepancy        │ status                               │ Flag manual_reconciliation.  │
│                       │                                      │ Balances stay locked.        │
└───────────────────────┴──────────────────────────────────────┴──────────────────────────────┘
```

---

## 10. Master Owner Decisions Register (OD-01 to OD-13)

All commercial policy areas remain documented strictly as Owner Decisions Required:

### Commercial Core Decisions (OD-01 to OD-07)
- **OD-01 (Commission & Pricing Policy):** *Owner Proposed (Pending Final Approval & Legal/CA Review):* Hybrid Zero-Commission Product-Level Markup Model. Technical baseline remains: engine derives and displays strictly **Gross Transaction Data** (`quantity * unitPrice`); zero commission deducted.
- **OD-02 (Refund Financial Liability):** Zero silent seller ledger debits.
- **OD-03 (Order-Level Discount Allocation & Refund Calculations):** Zero silent cart-level coupon splits; coupons remain on platform order level. Refund calculations provide primitives without hardcoded deductions.
- **OD-04 (Mixed-Order Shipping Revenue Allocation):** Zero shipping fees credited to merchants; shipping remains on platform order level.
- **OD-05 (Statutory Deductions - 1% TCS / 1% TDS):** Zero tax withholding calculated or applied.
- **OD-06 (Exchange Scope & Price Differences):** Price-difference exchanges remain disabled pending explicit commercial policy; equal-value exchanges supported technically.
- **OD-07 (Merchant Settlement & Payout Rails):** COD and merchant payouts recorded strictly as `unsettled` (deferred to MVP-3).

### Exchange Policy Decisions (OD-08 to OD-13)
- **OD-08 (Exchange Return Window Duration):** Maximum return window duration for customer exchange requests (e.g. 7 days vs 14 days from delivery).
- **OD-09 (Exchange Reservation Timing & Expiration Schedule):** Maximum duration replacement inventory is held before automatic release if original item is not received.
- **OD-10 (Exchange Cancellation Rights Before & After Return Receipt):** Permitted stages where customer or merchant may cancel an exchange request.
- **OD-11 (Non-Returned Original Item Handling):** Commercial remedy and liability allocation when customer fails to send original item after replacement is dispatched or reserved.
- **OD-12 (Repeated Replacement Fulfillment Failures):** Operational remedy when replacement shipment is damaged, lost, or returned undeliverable.
- **OD-13 (Failed Exchange-to-Refund Conversion):** Explicit commercial policy and authorization rules for converting an unfulfillable exchange into a monetary refund.

---

## 11. Preflight Git State & Verification Evidence

```
Command: git status --short
Output:
 M apps/storefront/tsconfig.tsbuildinfo

Command: git branch --show-current
Output:
m2_14

Command: git rev-parse HEAD
Output:
45dbb931899d9fa5813d1c56952e60f2b2a86826

Verification Invariants:
- The working tree is NOT clean: it contains one modified build-metadata file (apps/storefront/tsconfig.tsbuildinfo) generated during storefront typecheck.
- apps/storefront/tsconfig.tsbuildinfo is preserved intact without cleaning, resetting, stashing, or discarding.
- Zero application code files modified.
- Zero migrations applied.
- Zero git commands executed that commit, push, stash, clean, reset, or switch branches.
- Acceptance statuses of M2-11, M2-12, and M2-13 preserved as IMPLEMENTED — AWAITING HUMAN ACCEPTANCE.
```

---

M2-14 — PLANNING ONLY — AWAITING EXPLICIT OWNER AUTHORIZATION
