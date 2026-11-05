# ATEEVRA Policy: OD-02-03 — Merchant-Fault Gateway Fee Allocation

**Policy ID:** `POL-OD-02-03`  
**Policy Name:** Platform Absorption of Payment Gateway MDR on Merchant-Fault Returns  
**Owner Decision Reference:** OD-02 (Sub-Decision OD-02-03)  
**Approval Status:** `OWNER APPROVED — INITIAL POLICY BASELINE`  
**Current Version:** `1.0.0`  
**Effective Date:** Initial Baseline (Mandatory Validation Gates Apply Before Production)  
**Parent Blueprint:** [`../ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](../ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Policy Register:** [`../POLICY-REGISTER.md`](../POLICY-REGISTER.md)

---

## 1. Executive Summary & Purpose

When a customer returns an order due to verified merchant fault (such as shipping a defective, damaged, incorrect, counterfeit, or mis-described item), ATEEVRA refunds the customer in full. In India, payment gateways (Razorpay, Cashfree, PayU) retain the original transaction Merchant Discount Rate (MDR, ~2% + GST) upon processing a refund.

This policy governs the financial allocation of the non-refundable gateway MDR fee on merchant-fault returns, establishing whether this fee is absorbed by ATEEVRA or debited from the merchant's settlement balance.

---

## 2. Owner-Approved Decision

> **APPROVED INITIAL POLICY: ATEEVRA ABSORBS GATEWAY MDR INITIALLY**
> 
> 1. ATEEVRA shall **initially absorb all payment gateway processing fees (MDR)** incurred on merchant-fault returns.
> 2. The platform shall **NOT automatically debit, claw back, or invoice payment gateway MDR from merchant settlement balances**.
> 3. The platform must maintain a **strict conceptual and operational separation between merchant product-realization liability ($P_{\text{realization}}$) and gateway processing fee liability ($C_{\text{gateway}}$)**.
> 4. Any future policy allowing ATEEVRA to debit or recover payment gateway MDR from merchants on defective dispatches requires an **explicit policy revision, formal written merchant contractual agreement, and platform owner approval**.

---

## 3. Governance and Approval Status

- **Status:** `OWNER APPROVED — INITIAL POLICY BASELINE`
- **Governance Invariants:**
  - Establishes the binding initial policy baseline approved by the platform owner.
  - Does NOT authorize Phase M2-14 technical code or schema changes.
  - Requires contractual alignment: Merchant Agreement Terms of Service must clearly specify what liabilities are debited on returns (e.g. reverse shipping liability vs. gateway processing fees).
  - Any future change to debit gateway fees to merchants must be submitted as a formal Change Request under [`../POLICY-CHANGELOG.md`](../POLICY-CHANGELOG.md).

---

## 4. Rationale & Commercial Justification

1. **Merchant Onboarding & Partner Friction Reduction:**  
   During early-stage marketplace growth, high-quality artisanal and fashion merchants are sensitive to punitive platform fee clawbacks. Charging merchants complex non-refundable banking charges on disputed returns creates severe partner friction and escalations over small rupee amounts (~₹23.60 on a ₹1,000 order).
2. **Simplified Ledger & Settlement Architecture:**  
   Debit adjustments against merchant payouts require complex legal backing, GST debit notes, and tax reconciliation. Separating product realization ($P_{\text{realization}}$ payable cancellation) and reverse logistics debits from third-party banking charges keeps the MVP settlement ledger clean, robust, and less prone to legal challenges.
3. **Statistical Insignificance Relative to Markup:**  
   Merchant-fault returns represent a low modeled probability (illustratively 2.0% in prepaid and 1.23% in COD). The probability-weighted cost of absorbing gateway MDR on merchant-fault returns is:
   $$\mathbb{E}[\text{MDR}_{\text{merchant-fault}}] = 0.02 \times ₹23.60 = \mathbf{₹0.472 \text{ per placed prepaid order}}$$
   This negligible cost (under 50 paise per order) is easily absorbed by ATEEVRA's gross markup (+₹200), making platform absorption the superior commercial strategy.

---

## 5. Scope & Applicability

- **In Scope:**  
  - All return and refund requests where the verified root cause is merchant non-compliance (defective item, wrong size/color shipped, expired/damaged prior to dispatch, counterfeit or missing parts).
  - All payment methods where payment gateway transaction fees are non-refundable (Cards, NetBanking, UPI, Wallets).
- **Out of Scope:**  
  - Reverse shipping freight charges (which may be debited to merchants per [`OD-02-04-COURIER-DAMAGE-LIABILITY.md`](OD-02-04-COURIER-DAMAGE-LIABILITY.md) and commercial terms).
  - Customer remorse returns (where gateway MDR is already absorbed by ATEEVRA).

---

## 6. Business Rules & Financial Accounting Treatment

### Rule 1: Zero Gateway Debit to Merchant
When a return is verified as Merchant Fault:
- The pending merchant payable ($P_{\text{realization}} = ₹800$) is canceled (pre-settlement) or recorded as an adjustment receivable (post-settlement).
- Sunk payment gateway MDR ($₹23.60$) is **100% absorbed by ATEEVRA** and booked to *Payment Gateway Charges (Sunk Loss)*.
- Zero rupee amount for payment gateway fees shall be entered into the merchant adjustment ledger.

### Rule 2: Reverse Logistics Allocation Distinct from Gateway Fees
While gateway MDR is absorbed by ATEEVRA, contractual reverse shipping fees may be debited to the merchant's ledger:
- Reverse shipping ($₹90$ or agreed contractual rate, e.g. 90% offset = $₹81$) may be recorded as an authorized merchant settlement adjustment if supported by the Merchant Agreement.
- This reverse shipping adjustment must be recorded under a distinct ledger transaction type: `LEDGER_ADJ_REVERSE_FREIGHT_MERCHANT_FAULT`, strictly isolated from gateway charges.

### Rule 3: Reconciled Financial Breakdown (₹1,000 Order Example)

| Financial Transaction Component | Customer Remorse Return | Merchant-Fault Return (Approved Policy) | Merchant-Fault (If Gateway Debited - Rejected Option) |
| :--- | :---: | :---: | :---: |
| **Customer Refund Executed** | -₹1,000.00 | -₹1,000.00 | -₹1,000.00 |
| **Merchant Realization Payable** | Canceled (₹0 paid) | Canceled (₹0 paid) | Canceled (₹0 paid) |
| **Forward Freight Incurred** | -₹70.00 *(Platform)* | -₹70.00 *(Platform)* | -₹70.00 *(Platform)* |
| **Reverse Freight Incurred** | -₹90.00 *(Platform)* | -₹90.00 *(3PL invoice)* | -₹90.00 *(3PL invoice)* |
| **Merchant Reverse Freight Offset** | ₹0.00 *(Platform absorbs)* | **+₹81.00** *(Merchant debited)* | **+₹81.00** *(Merchant debited)* |
| **Payment Gateway MDR Incurred** | -₹23.60 *(Platform)* | -₹23.60 *(Platform)* | -₹23.60 *(Sunk to Gateway)* |
| **Merchant Gateway MDR Offset** | ₹0.00 | **₹0.00 (Platform Absorbs)** | **+₹23.60 (Debited to Seller)** |
| **Net Platform Economic Impact** | **-₹183.60** | **-₹102.60** | **-₹79.00** |
| **Net Merchant Economic Impact** | **₹0.00** *(Goods returned)* | **-₹81.00** *(Reverse freight)* | **-₹104.60** *(Reverse freight + MDR)* |

*Result:* Under the approved policy, ATEEVRA absorbs -₹102.60 on a merchant-fault return rather than -₹79.00, protecting partner relationships for a minor ₹23.60 difference.

> [!NOTE]
> **Historical Context on the "Rejected Option" Reference:**  
> The third column labeled *"Merchant-Fault (If Gateway Debited - Rejected Option)"* represents the historical advisory Option D proposal analyzed prior to platform owner review. The owner explicitly rejected debiting gateway MDR to merchants and approved platform absorption as ATEEVRA's official initial policy baseline. This reference is preserved solely for comparative financial transparency and does not contradict or weaken the owner-approved policy that ATEEVRA absorbs gateway MDR on merchant-fault returns.

---

## 7. Preconditions and Exceptions

### Preconditions
- The customer return request must be substantiated with valid defect evidence (photographs/unboxing video) and confirmed by merchant inspection or platform dispute resolution.

### Exceptions
- **Systemic Merchant Fraud / Counterfeiting:** If a merchant is found to be engaged in willful counterfeiting or fraudulent shipments, ATEEVRA reserves the right under platform terms to suspend the merchant, freeze settlements, and pursue full legal and monetary indemnity (including all transaction fees and legal expenses).

---

## 8. Stakeholder Impacts

| Stakeholder | Direct Impact |
| :--- | :--- |
| **Customer** | 100% full refund received promptly. Unaffected by platform-merchant fee allocations. |
| **Merchant** | Protected from unexpected banking fee clawbacks. Responsible only for physical product realization and reverse logistics on defective dispatches. |
| **ATEEVRA Platform** | Incurs minor operational expense (~₹0.47 per placed order) to preserve merchant trust and maintain straightforward settlement ledgers. |
| **Payment Gateway** | Receives and retains standard contractual MDR without administrative dispute. |

---

## 9. Required Evidence and Audit Trails

1. **Return Defect Verification Record:** Image/video evidence and customer statement logged under `return_request_id`.
2. **Settlement Ledger Entry:** Settlement transaction showing:
   - `merchant_id`
   - `order_id`
   - `realization_canceled`: ₹800.00
   - `reverse_shipping_debited`: ₹81.00
   - `gateway_fee_debited`: **₹0.00**
   - `gateway_fee_absorbed_by_platform`: **₹23.60**

---

## 10. Dispute & Escalation Procedures

- **Merchant Disputes Regarding Defect Attribution:** If a merchant claims an item was damaged by the carrier rather than defective from origin, the ticket escalates to the **Courier Damage vs. Defect Workflow** governed by [`OD-02-04-COURIER-DAMAGE-LIABILITY.md`](OD-02-04-COURIER-DAMAGE-LIABILITY.md).

---

## 11. Accounting and Reconciliation Considerations

- **Tax Invoices & GST Notes:** Because gateway fees are not debited to merchants, ATEEVRA avoids the administrative requirement to issue GST tax debit notes to merchants for financial intermediary services.
- **P&L Booking:** Absorbed MDR is booked directly to *Operating Expenses: Payment Gateway Charges*.

---

## 12. Dependencies & Open Questions

- **Dependencies:**
  - Final legal text of the standard ATEEVRA Merchant Agreement.
- **Open Questions:**
  - Whether a future threshold of merchant defect rate (e.g. >5% defect rate) should trigger automatic contractual review.

---

## 13. Review Frequency & Change Triggers

- **Semi-Annual Review:** Financial review of aggregate absorbed MDR on merchant-fault returns.
- **Triggers for Policy Reconsideration:**
  - Total merchant-fault return rate across the platform exceeds 5.0% of total catalog orders.
  - Payment gateway significantly increases transaction processing fee rates.

---

## 14. Controlled Revision Notice: Baseline v1.1.0-PROPOSED Addendum

> [!NOTE]
> **GOVERNANCE STATUS: OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)**  
> Pursuant to Project Owner directions issued on 2026-11-04 regarding Cancellation, Return, RTO & Merchant Accountability (OD-15), a controlled policy revision (`v1.1.0-PROPOSED`) has been formulated:
> - **Superceding Policy Reference:** [`POL-M2-14-03-MERCHANT-CANCELLATION-PENALTY.md`](POL-M2-14-03-MERCHANT-CANCELLATION-PENALTY.md) and [`M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md`](../M2-14-OD-02-REVISED-POLICY-BASELINE-V1-1-0.md).
> - **Key Proposed Change:** Levies a provisional ₹25 penalty on merchant-initiated cancellations to defray platform gateway refund leakage and administrative overhead, while preserving ₹0 platform facilitation fee on cancellations.
> - **Legal Baseline:** This document (`POL-OD-02-03` v1.0.0) remains the approved baseline until formal Owner Ratification is executed.
