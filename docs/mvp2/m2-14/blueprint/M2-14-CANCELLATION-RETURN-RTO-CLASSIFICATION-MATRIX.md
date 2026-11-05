# ATEEVRA M2-14 — Master Cancellation, Return, RTO & Accountability Classification Matrix

**Document Reference:** `DOC-M214-CR-RTO-MATRIX`  
**Parent Blueprint:** [`ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md`](ATEEVRA-MARKETPLACE-FINANCIAL-COMMERCIAL-POLICY-BLUEPRINT.md)  
**Associated Policies:** [`policies/POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md`](policies/POL-M2-14-01-CUSTOMER-RETURNS-AND-REVERSE-SHIPPING.md), [`policies/POL-M2-14-02-RTO-AND-FAILED-DELIVERY.md`](policies/POL-M2-14-02-RTO-AND-FAILED-DELIVERY.md), [`policies/POL-M2-14-03-MERCHANT-CANCELLATION-PENALTY.md`](policies/POL-M2-14-03-MERCHANT-CANCELLATION-PENALTY.md), [`policies/POL-M2-14-04-MERCHANT-DISPATCH-SLA-LATE-PENALTY.md`](policies/POL-M2-14-04-MERCHANT-DISPATCH-SLA-LATE-PENALTY.md), [`policies/POL-M2-14-05-CUSTOMER-PRE-DISPATCH-CANCELLATION.md`](policies/POL-M2-14-05-CUSTOMER-PRE-DISPATCH-CANCELLATION.md), [`policies/POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md`](policies/POL-M2-14-06-MERCHANT-ACCOUNT-HEALTH-AND-ENFORCEMENT.md)  
**Governance Status:** `OWNER DIRECTION RECORDED — PROPOSED POLICY REVISION (PENDING OWNER RATIFICATION)`  
**Baseline Policy Version:** `1.1.0-PROPOSED`  
**Audit Date:** 2026-11-04  

---

## 1. Executive Summary & Objective

This document provides the authoritative, exhaustive multi-variable classification matrix across all operational order exception states in the ATEEVRA marketplace. It reconciles financial liabilities, logistics charges, platform facilitation fees, customer refund entitlements, settlement debits, statutory tax consequences, and merchant account health impacts across eight distinct operational scenarios.

---

## 2. Master Event Classification Matrix (8 Scenarios)

The table below delineates the precise commercial, operational, and financial treatment of each exception category:

| Event Ref | Operational Scenario | Primary Fault Bearer | Forward Shipping Bearer | Reverse Shipping Bearer | Platform Fee Earned? | Merchant Penalty | Customer Refund % | Packaging Drag Bearer | Account Health Impact |
| :--- | :--- | :--- | :--- | :--- | :---: | :---: | :---: | :---: | :--- |
| **EV-01** | **Customer Return: Defective / Wrong Item** | Merchant | Per Forward Model | **Merchant** (Weight Slabs ₹30–₹165+) | No (Reversed) | ₹0.00 | 100% | Merchant | Increases DRR (Defect Rate) |
| **EV-02** | **Customer Return: Remorse / Fit / Preference** | Customer | Per Forward Model | **Merchant** (Weight Slabs ₹30–₹165+) | No (Reversed) | ₹0.00 | 100% | Merchant | Neutral (Standard Return) |
| **EV-03** | **RTO: Doorstep Refusal / Customer Unavailable** | Customer | Per Forward Model | **Platform (ATEEVRA)** via COD Fees/Reserve | No (Reversed) | ₹0.00 | 100% (Prepaid) | Merchant | Neutral (No Merchant Penalty) |
| **EV-04** | **RTO: Incorrect Address / Customer Fake** | Customer | Per Forward Model | **Platform (ATEEVRA)** via COD Fees/Reserve | No (Reversed) | ₹0.00 | 100% (Prepaid) | Merchant | Neutral (Customer Flagged) |
| **EV-05** | **RTO: Courier Fake Attempt / Carrier Default** | 3PL Courier | Carrier Claim | **3PL Courier** (Carrier Liability) | No (Reversed) | ₹0.00 | 100% (Prepaid) | Merchant | Carrier SLA Penalty |
| **EV-06** | **Merchant Cancellation: Stock-out / Inability** | Merchant | N/A (Not Dispatched) | N/A (Not Dispatched) | No (₹0.00) | **₹25.00** | 100% | N/A | Increases OCR (Cancellation Rate) |
| **EV-07** | **Merchant Late Dispatch: Exceeding SLA** | Merchant | Per Forward Model | N/A (If Delivered) | Yes (If Delivered) | **₹50.00** | 0% (Delivered) | N/A | Increases LDR (Late Dispatch Rate) |
| **EV-08** | **Customer Pre-Dispatch Cancellation** | Customer | N/A (Voided AWB) | N/A (Not Dispatched) | No (₹0.00) | **₹0.00** | 100% | Merchant (₹39–₹79) | Neutral (Zero Penalty) |

---

## 3. Financial Line-Item Segregation & Settlement Ledger

The table below reconciles each line item in ATEEVRA's settlement and accounting engine for a standard ₹1,000 baseline transaction:

| Event Ref | Merchant Gross Payout (₹) | Platform Fee Debit (₹) | Reverse Shipping Debit (₹) | Merchant Penalty Debit (₹) | Net Merchant Settlement (₹) | Platform Net Realization (₹) | Customer Final Position (₹) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **EV-01** (Defect Return, 500g) | ₹0.00 | ₹0.00 | -₹35.40 (₹30+GST) | ₹0.00 | **-₹35.40** | -Forward Cost - MDR | Full Refund (₹1,000) |
| **EV-02** (Remorse Return, 1kg) | ₹0.00 | ₹0.00 | -₹59.00 (₹50+GST) | ₹0.00 | **-₹59.00** | -Forward Cost - MDR | Full Refund (₹1,000) |
| **EV-03** (RTO Refusal, COD) | ₹0.00 | ₹0.00 | ₹0.00 | ₹0.00 | **₹0.00** | -Forward - Reverse Freight | Unpaid (COD) |
| **EV-04** (RTO Incorrect Addr, Prepaid) | ₹0.00 | ₹0.00 | ₹0.00 | ₹0.00 | **₹0.00** | -Forward - Reverse - MDR | Full Refund (₹1,000) |
| **EV-05** (RTO Courier Default) | ₹0.00 | ₹0.00 | ₹0.00 | ₹0.00 | **₹0.00** | Courier Claim Recovery | Full Refund (₹1,000) |
| **EV-06** (Merchant Cancelled) | ₹0.00 | ₹0.00 | ₹0.00 | -₹25.00 | **-₹25.00** | +₹25.00 - MDR Loss | Full Refund (₹1,000) |
| **EV-07** (Late Dispatch Delivered, 10% Fee) | ₹882.00 | -₹118.00 (Fee+GST) | ₹0.00 | -₹50.00 | **+₹832.00** | +₹100 Fee + ₹50 Penalty | Goods Retained (₹1,000 paid) |
| **EV-08** (Customer Pre-Dispatch Cancel) | ₹0.00 | ₹0.00 | ₹0.00 | ₹0.00 | **₹0.00** | -MDR Loss | Full Refund (₹1,000) |

*Note: In EV-07, Merchant Gross Payout of ₹882 reflects: ₹1,000 GMV - ₹100 Platform Fee - ₹18 Platform GST (₹118 total fee) = ₹882 base payout, prior to TDS/TCS statutory withholdings. Deducting the ₹50 late penalty yields ₹832 net merchant settlement.*

---

## 4. Statutory Tax, Contractual Netting & Legal Analysis

### 4.1 GST Applicability on Exception Line Items
1. **Product Supply (Section 9 CGST Act):** In return and cancellation scenarios (EV-01, 02, 03, 04, 05, 06, 08), the underlying product supply is cancelled or reversed. The merchant issues a formal Credit Note under Section 34 of the CGST Act, 2017, adjusting their outward GST liability.
2. **Reverse Shipping Recovery (Section 7 CGST Act):** Reverse shipping invoiced to merchants (EV-01, EV-02) constitutes a taxable B2B logistics recovery service subject to **18% GST**. A tax invoice is issued by ATEEVRA, enabling the merchant to claim Input Tax Credit (ITC) if GST registered.
3. **Penalties & Liquidated Damages:** Pursuant to CBIC Circular No. 178/10/2022-GST, the ₹25 cancellation penalty (EV-06) and ₹50 late dispatch penalty (EV-07) represent liquidated damages for contractual default and are provisionally recorded at **0% GST**. If tax counsel determines administrative classification, 18% GST will attach.
4. **GST TCS (Section 52 CGST Act):** In cancelled or returned orders, no net taxable supply occurs, resulting in **₹0.00 net TCS liability**.
5. **Income Tax TDS (Section 194-O):** TDS is applicable strictly on gross sales realized; on cancelled and returned transactions, credit notes negate the taxable base, resulting in zero net TDS deduction.

### 4.2 Contractual Netting Authority
All settlement debits, penalty charges, and reverse-logistics recoveries are executed pursuant to the express contractual set-off clause in the ATEEVRA Merchant Service Agreement, governed by Sections 10, 73, and 74 of the Indian Contract Act, 1872.

---

## 5. Account Health Scoring Cross-Reference

| Scenario Ref | Primary KPI Affected | Green Target | Yellow Advisory | Red Critical Breach | Progressive Enforcement Action |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **EV-01** | Defect Return Rate (DRR) | $< 1.5\%$ | $1.5\% - 3.0\%$ | $> 3.0\%$ | Stage 1 Warning -> Stage 4 SKU Suspension |
| **EV-02** | General Return Rate | $< 8.0\%$ | $8.0\% - 15.0\%$ | $> 15.0\%$ | Catalog Description Review |
| **EV-03 / 04** | Customer-Fault RTO Rate | N/A | N/A | N/A | Zero Merchant Fault (Pincode/Customer Risk Scoring) |
| **EV-05** | Courier Fake Attempt Rate | N/A | N/A | N/A | Carrier SLA Penalty / Route Escalation |
| **EV-06** | Order Cancellation Rate (OCR) | $< 1.0\%$ | $1.0\% - 2.5\%$ | $> 2.5\%$ | Stage 1 Warning -> Stage 2 Reserve -> Stage 4 Order Cap |
| **EV-07** | Late Dispatch Rate (LDR) | $< 2.0\%$ | $2.0\% - 4.0\%$ | $> 4.0\%$ | Stage 1 Warning -> Stage 2 Reserve -> Stage 3 Suppression |
| **EV-08** | Customer Pre-Dispatch Rate | N/A | N/A | N/A | Zero Merchant Penalty / Zero Metric Impact |

---

## 6. Implementation & Operational Boundaries

1. **Strictly Governance & Specification:** This classification matrix is a policy and accounting specification. No automated routing or code implementations are authorized.
2. **Traceability:** Integrated into [`POLICY-REGISTER.md`](../POLICY-REGISTER.md) and tracked under [`M2-14-OWNER-DECISION-REGISTER.md`](../../M2-14-OWNER-DECISION-REGISTER.md).
