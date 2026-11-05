# ATEEVRA PHASE 0.5 — PAYMENT GATEWAY FEE & SETTLEMENT RECONCILIATION: OD-002
**Document ID:** `ATEEVRA-OD-002-PAY-FEE-REC-001`  
**Classification:** Payment Aggregator Economics, Statutory Zero-MDR Audit & Bank Settlement Schedule  
**Parent Document:** [`ATEEVRA-OD-002-FREIGHT-AND-SETTLEMENT-RECONCILIATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-002-FREIGHT-AND-SETTLEMENT-RECONCILIATION.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision & Gateway Contract Execution)`  
**Audit Date:** 2026-11-05  
**Auditor / Reviewer:** Principal Enterprise Architect, FinTech Treasury Modeler & Banking Specialist  

---

## 1. Executive Summary & Reconciliation Mandate

This document resolves the payment gateway fee reconciliation questions raised regarding **OD-002**:
1. **The ₹93,081.94 vs. ₹90,090.02 Variance:** Fully reconciling why applying 2.36% to 70% of transactions produces ₹93,081.94, whereas the detailed instrument sensitivity schedule produced ₹90,090.02.
2. **Statutory Zero-MDR Realities:** Verifying the legal basis under Section 10A of the Payment and Settlement Systems Act, 2007, while establishing contractual exceptions (PPI interchange, platform convenience fees).
3. **Rolling Reserve Treatment:** Documenting the 5.0% rolling reserve (₹2.82 Lakh) imposed by payment aggregators on early-stage luxury e-commerce merchants.
4. **Authoritative Bank Settlement Schedule:** Tracing 450 customer orders across payment instruments to establish exact net bank deposits.

---

## 2. Reconciling the ₹93,081.94 vs. ₹90,090.02 Payment Fee Variance

### 2.1 The Source of the Mathematical Difference

The review correctly noted that on **₹56,34,500.00 Gross GMV**, if 30% is zero-MDR (25% UPI + 5% RuPay debit) and the remaining 70% incurs the standard 2.36% (2.0% base MDR + 18% GST), the fee calculation yields:
$$\text{Eligible GMV (70%)} = 0.70 \times ₹56,34,500.00 = ₹39,44,150.00$$
$$\text{Standard Fee (2.36%)} = 0.0236 \times ₹39,44,150.00 = \mathbf{₹93,081.94 \approx ₹93,082}$$

Why did `ATEEVRA-OD-002-FREIGHT-AND-SETTLEMENT-RECONCILIATION.md` report **₹90,090.02**?

**The Explanation:**  
The reported figure of **₹90,090.02** did NOT apply a uniform 2.36% flat rate across the entire 70%. Instead, it disaggregated the 70% non-zero-MDR basket into **differentiated real-world payment instruments**:
- **Regulated Visa/Mastercard Debit Cards (10% volume):** Regulated by the Reserve Bank of India (RBI circular DPSS.CO.PD.No.1515/02.14.003/2017-18) with a capped base MDR of **0.90%** (+18% GST = **1.062%**).
- **Net Banking (5% volume):** Fixed transaction tier averaging **1.50%** base MDR (+18% GST = **1.770%**).
- **Domestic Credit Cards (40% volume):** Commercial standard at **1.85%** base MDR (+18% GST = **2.183%**).
- **American Express / Diners / Corporate Cards (15% volume):** Premium luxury tier at **3.00%** base MDR (+18% GST = **3.540%**).

Because the lower rates on regulated debit cards (1.062%) and net banking (1.770%) pull down the weighted average of the 70% basket to **2.284%** (rather than 2.360%), the actual computed fee was **₹90,090.02**, creating a difference of **₹2,991.92**:
$$₹93,081.94 - ₹90,090.02 = \mathbf{₹2,991.92}$$

---

## 3. Detailed Payment Instrument Settlement Schedule

The table below provides the authoritative transaction-level settlement schedule across 450 projected capsule orders:

```
+===================================================================================================================================+
|                        DISAGGREGATED PAYMENT INSTRUMENT SETTLEMENT SCHEDULE (450 ORDERS / ₹56.34L GMV)                            |
+--------------------+-------+--------+---------------+----------+--------+------------+--------------------+-----------------------+
| Payment Instrument | Share | Txn    | Gross GMV     | Base MDR | GST on | Total Cut  | Total Deduction (₹)| Net Bank Settlement   |
| Type               | (%)   | Count  | Processed (₹) | Rate (%) | MDR (%)| Rate (%)   | (MDR + GST)        | Deposited in A/c (₹)  |
+--------------------+-------+--------+---------------+----------+--------+------------+--------------------+-----------------------+
| **UPI (P2M Bank)** | 25.0% | 112.5  | ₹14,08,625.00 | 0.00%    | 0.00%  | 0.000%     | ₹0.00              | ₹14,08,625.00         |
| **RuPay Debit**    | 5.0%  | 22.5   | ₹2,81,725.00  | 0.00%    | 0.00%  | 0.000%     | ₹0.00              | ₹2,81,725.00          |
| **Visa/MC Debit**  | 10.0% | 45.0   | ₹5,63,450.00  | 0.90%    | 18.0%  | 1.062%     | ₹5,983.84          | ₹5,57,466.16          |
| **Domestic Credit**| 40.0% | 180.0  | ₹22,53,800.00 | 1.85%    | 18.0%  | 2.183%     | ₹49,200.45         | ₹22,04,599.55         |
| **Amex / Premium** | 15.0% | 67.5   | ₹8,45,175.00  | 3.00%    | 18.0%  | 3.540%     | ₹29,919.20         | ₹8,15,255.80          |
| **Net Banking**    | 5.0%  | 22.5   | ₹2,81,725.00  | 1.50%    | 18.0%  | 1.770%     | ₹4,986.53          | ₹2,76,738.47          |
+--------------------+-------+--------+---------------+----------+--------+------------+--------------------+-----------------------+
| **REALISTIC MODEL**| 100%  | 450.0  | ₹56,34,500.00 | 1.355%*  | 18.0%  | **1.599%** | **₹90,090.02**     | **₹55,44,409.98**     |
+--------------------+-------+--------+---------------+----------+--------+------------+--------------------+-----------------------+
| **AGGREGATED 70%** | 100%  | 450.0  | ₹56,34,500.00 | 1.400%*  | 18.0%  | **1.652%** | **₹93,081.94**     | **₹55,41,418.06**     |
+--------------------+-------+--------+---------------+----------+--------+------------+--------------------+-----------------------+
| **CONSERVATIVE**   | 100%  | 450.0  | ₹56,34,500.00 | 2.000%   | 18.0%  | **2.360%** | **₹1,32,974.20**   | **₹55,01,525.80**     |
+===================================================================================================================================+
```
*\*Weighted average base rate.*

---

## 4. Statutory Zero-MDR Realities vs. Commercial Contractual Surcharges

To avoid over-optimistic treasury planning, ATEEVRA must account for the legal and contractual boundaries of "Zero-MDR":

### 4.1 Statutory Authority for Zero-MDR
Under **Section 10A of the Payment and Settlement Systems Act, 2007** (enacted via Finance Act No. 2 of 2019, effective 1 January 2020):
> *"No bank or system provider shall impose any charge on a person making or receiving a payment through any prescribed electronic mode of payment."*
The prescribed electronic modes under Rule 119AA of the Income Tax Rules include **BHIM-UPI** and **RuPay Debit Cards**.

### 4.2 Commercial Exceptions & Provider Platform Fees
While statutory base MDR is zero on bank-to-bank UPI, payment aggregators (Razorpay, Cashfree, Stripe India, PayU) enforce non-MDR charges that must be budgeted:
1. **Prepaid Payment Instruments (PPI) Interchange on UPI:**  
   Under NPCI guidelines (March 2023), merchant transactions initiated via PPI wallets (Paytm Wallet, PhonePe Wallet, Amazon Pay) for ticket sizes >₹2,000 carry an **interchange fee of up to 1.10%** (+18% GST). If 20% of ATEEVRA's UPI transactions are wallet-backed, an additional ₹3,655 in interchange applies.
2. **Aggregator Platform & Gateway Maintenance Fees:**  
   Aggregators levy platform setup fees (₹15,000 to ₹25,000 one-time), annual software maintenance fees (₹5,000 to ₹10,000/year), and technical convenience fees (₹2.00 to ₹4.00 per API settlement batch).
3. **Non-Refundable Fee Policy on Customer Returns:**  
   When a customer returns a blazer and receives a full ₹17,800 refund, **payment aggregators DO NOT refund the gateway fee or the GST on MDR**. On an 18% customer return rate (81 units returned), ATEEVRA permanently absorbs approximately **₹23,900.00** in unrecoverable gateway fees.

---

## 5. Gateway Rolling Reserve Treatment & Liquidity Restriction

Because ATEEVRA is a newly incorporated luxury D2C brand with no historical chargeback or dispute track record, payment aggregators will enforce a **Mandatory Risk Rolling Reserve**:

```
+===================================================================================================================================+
|                                    PAYMENT AGGREGATOR ROLLING RESERVE SPECIFICATION                                               |
+------------------------------------+----------------------------------+-----------------------------------------------------------+
| Parameter                          | Specification / Contract Term    | Impact on ATEEVRA Working Capital                         |
+------------------------------------+----------------------------------+-----------------------------------------------------------+
| **Reserve Percentage**             | **5.0% of Gross Transaction GMV**| Deducted at source from daily settlement batches.         |
| **Retention Period**               | **90 to 120 Days** Rolling Hold  | Cash is released on a rolling basis post-return window.   |
| **Total Phase 1 Reserve Amount**   | $\mathbf{₹2,81,725.00}$          | **Cash is legally owned by ATEEVRA, but trapped in escrow**|
| **Dispute & Chargeback Offset**    | Priority chargeback deduction    | Customer chargebacks deducted directly from reserve.      |
+===================================================================================================================================+
```

### 5.1 Impact on Immediate Bank Liquidity
While gross collections are ₹56.34L, the immediate cash liquid and spendable in ATEEVRA’s operating bank account during Month 1–3 is reduced by the rolling reserve:

$$\text{Gross Customer GMV} = ₹56,34,500.00$$
$$\text{Less: Realistic Gateway Fees (1.60%)} = -₹90,090.02$$
$$\text{Less: 5.0% Gateway Rolling Reserve Hold} = -₹2,81,725.00$$
$$\mathbf{Immediate\ Liquid\ Cash\ Inflow\ to\ Operating\ Account} = \mathbf{₹52,62,684.98}$$

---

## 6. Summary Conclusion & Financial Policy

1. **Reconciliation Resolved:** The difference between ₹93,082 and ₹90,090 is completely explained by RBI-regulated debit card caps (1.062%) and net banking rates (1.770%) pulling down the weighted average of the 70% non-zero-MDR basket.
2. **Authoritative Planning Baseline:** For conservative risk management, ATEEVRA will retain the **2.36% flat model (₹1,32,974.20 total deduction / ₹55,01,525.80 net bank collections)** as the approved budgeting baseline in `OD-002`.
3. **Liquidity Buffer:** The ₹42,884.00 favorable variance resulting from actual UPI/RuPay adoption will serve as an unbudgeted cash cushion to absorb PPI wallet surcharges and non-refundable fees on customer returns.
4. **Contractual Gate:** Final payment aggregator terms, MDR rate cards, and rolling reserve waivers must be negotiated and executed under **Gate G-LO / Gate G-CA** prior to launch.
