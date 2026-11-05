# ATEEVRA — Unified Internal Admin RBAC & Financial Approval Governance Matrix

**Document ID:** `ATEEVRA-REM-RBAC-001`  
**Classification:** Enterprise Security & Corporate Governance Specification  
**Status:** PROPOSED RECONCILED BASELINE (Awaiting Owner Ratification)  
**Remediation Date:** 2026-11-05  
**Author:** Principal Enterprise Architect & Cybersecurity Governance Specialist  

---

## 1. Executive Summary & Governance Remediation

The previous quality audit identified a critical governance contradiction: while the Security Blueprint and OD-019 mandated strict dual authorization for disbursements exceeding ₹5,000, other documents (Customer Support Operations and Admin RBAC Matrix) granted the Super Admin and Concierge Lead unilateral authority up to ₹10,000 or unrestricted power.

This document resolves this conflict by enforcing a fundamental architectural separation:
$$\mathbf{Technical\ Platform\ Administration} \neq \mathbf{Financial\ Approval\ Authority}$$

### 1.1 Non-Negotiable Separation of Duties
1. **Super Admin Authority Boundary:** The Super Admin possesses full technical access to configure system settings, provision user roles, review infrastructure logs, and deploy code. **The Super Admin CANNOT unilaterally initiate or approve financial disbursements, cash refunds, or inventory write-offs exceeding ₹5,000.**
2. **Dual-Authorization Invariant:** Any disbursement or balance-sheet modification $> ₹5,000$ requires two distinct authenticated individuals: an **Initiator** and a **Secondary Approver**.
3. **No Single Point of Compromise:** Even if a Super Admin account is compromised, the attacker cannot execute high-value financial refunds without secondary approval from a separate, authenticated Finance role.

---

## 2. Authoritative Corporate RBAC & Permission Matrix

```
+-----------------------------------------------------------------------------------------------------------------------------------------------+
|                                    AUTHORITATIVE CORPORATE ACTION & FINANCIAL THRESHOLD MATRIX                                                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Operational Action       | Authorized          | Mandatory Secondary | Approval    | Monetary Threshold  | Step-Up MFA       | Audit Logging  |
| Category                 | Initiator Role      | Approver Role       | Count       | & Currency (INR)    | Enforced?         | Classification |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Goodwill Store Credit /  | Client Advisor      | None (Single Auth)  | 1 Signature | $\le ₹1,500$        | Standard Session  | APPEND_ONLY    |
| Promotional Voucher      | (Concierge Tier 1)  |                     |             |                     |                   |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Discretionary Refund /   | Concierge Lead      | None (Single Auth)  | 1 Signature | $\le ₹5,000$        | Standard Session  | APPEND_ONLY    |
| Standard Return Exchange | (Concierge Tier 2)  |                     |             |                     |                   |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| High-Value Customer      | Concierge Lead OR   | Finance Specialist  | 2 Distinct  | ₹5,001 to ₹25,000   | Primary TOTP on   | IMMUTABLE_SEC  |
| Refund Disbursement      | Finance Specialist  | OR CFO              | Signatures  |                     | Both Signatures   |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Executive Critical       | Finance Specialist  | Chief Financial     | 2 Distinct  | $> ₹25,000$         | Mandatory Step-Up | CRYPTO_SEALED  |
| Refund / VIP Settlement  | OR Concierge Lead   | Officer (CFO)       | Signatures  |                     | Hardware Token    | & ALERT_OWNER  |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Routine Inventory Count  | Warehouse Inventory | Warehouse Manager   | 1 Signature | $\le ₹2,500$ per SKU| Standard Session  | INVENTORY_LOG  |
| Adjustment (Damaged Unit)| Controller          |                     |             |                     |                   |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Moderate Stock Write-Off | Warehouse Manager   | Supply Chain &      | 1 Signature | ₹2,501 to ₹10,000   | Standard Session  | INVENTORY_LOG  |
| / Scrap Adjustment       |                     | Logistics Lead      |             |                     |                   |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Major Inventory Variance | Supply Chain Lead   | Finance Manager     | 2 Distinct  | ₹10,001 to ₹25,000  | Primary TOTP on   | IMMUTABLE_SEC  |
| / Quarantine Adjustment  |                     |                     | Signatures  |                     | Both Signatures   |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Critical Balance-Sheet   | Supply Chain Lead   | Chief Financial     | 2 Distinct  | $> ₹25,000$         | Mandatory Step-Up | CRYPTO_SEALED  |
| Write-Off (Bulk Shrink)  |                     | Officer (CFO)       | Signatures  |                     | Hardware Token    | & ALERT_OWNER  |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| User Account Provisioning| Super Admin         | None                | 1 Signature | N/A (Technical)     | Mandatory Step-Up | SECURITY_AUDIT |
| & Role Assignment        |                     |                     |             |                     | Hardware Token    |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Catalog Publishing /     | Brand Merchandiser  | Merchandising Lead  | 1 Signature | N/A (Merchandising) | Standard Session  | CATALOG_LOG    |
| Lookbook Activation      |                     |                     |             |                     |                   |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
| Statutory Financial & Tax| Finance Specialist  | Finance Director    | 2 Distinct  | N/A (Data Export)   | Mandatory Step-Up | SECURITY_AUDIT |
| Data Export (GSTR / PII) |                     |                     | Signatures  |                     | PII Download Mask |                |
+--------------------------+---------------------+---------------------+-------------+---------------------+-------------------+----------------+
```

---

## 3. Detailed Operational Role Definitions

### 3.1 Role 1: Super Admin (Technical Platform Administrator)
- **Primary Function:** System configuration, cloud environment variables, backup monitoring, database health, security log review.
- **Explicit Exclusions:** Cannot create customer orders, cannot approve refunds, cannot adjust inventory counts.
- **Step-Up Authentication:** Required when creating or modifying staff user accounts or modifying RBAC mappings.

### 3.2 Role 2: Luxury Concierge Lead (Tier 2 Support)
- **Primary Function:** Client relationship management, styling dossier oversight, 5-minute WhatsApp queue monitoring, discretionary return/exchange intake.
- **Financial Bounds:** Single-signature refund authority up to ₹5,000. Acts as Initiator for refunds between ₹5,001 and ₹25,000.

### 3.3 Role 3: Finance Specialist & CFO (Corporate Treasury & Tax)
- **Primary Function:** GSTR-1/3B tax filings, Section 31 tax invoice reconciliations, gateway payout settlements, atelier milestone disbursements.
- **Financial Bounds:** Finance Specialist acts as Approver for refunds ₹5,001 to ₹25,000. CFO approval is mandatory for all disbursements or write-offs exceeding ₹25,000.

### 3.4 Role 4: Supply Chain & Logistics Lead (Warehouse & Procurement)
- **Primary Function:** Atelier PO release, inbound AQL 2.5 QC inspection intake, 5-tier bin putaway, carrier dispatch SLA tracking.
- **Inventory Bounds:** Single-signature adjustment authority up to ₹10,000. Discrepancies $> ₹10,000$ require co-signature from Finance.

---

## 4. Emergency Break-Glass Governance Protocol

In catastrophic scenarios where an urgent financial or operational adjustment is required but designated approvers are physically unavailable (e.g., medical emergency, communication blackout during festive drop):

```
                                [ EMERGENCY BREAK-GLASS SEQUENCE ]
                                                │
[ Step 1 ] ───► Dual Cryptographic Invocation: Super Admin + Alternate Corporate Director
                (Simultaneous entry of distinct hardware MFA tokens)
                                                │
[ Step 2 ] ───► Automated Real-Time Out-of-Band Notification Dispatched
                (Encrypted SMS & Email alerts delivered immediately to Project Owner)
                                                │
[ Step 3 ] ───► System Enters 4-Hour Time-Limited Break-Glass Mode
                (Temporary financial authority granted; all database mutations snapshot-logged)
                                                │
[ Step 4 ] ───► Automated Post-Incident Audit Review within 24 Hours
                (Written report submitted to Statutory Auditor and Board of Directors)
```

---
*End of Document `ATEEVRA-REM-RBAC-001`. Formally Reconciled for Security Architecture.*
