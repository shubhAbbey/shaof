# ATEEVRA BR-01 — Open Findings, Remediation & Governance Register

**Document ID:** `ATEEVRA-BR01-REG-001`  
**Classification:** Audit Findings Register & Remediation Verification  
**Status:** ACTIONABLE & AUDITED  
**Audit Date:** 2026-11-05  
**Auditor:** Principal Enterprise Architect & Policy Governance Specialist  

---

## 1. Executive Summary & Classification Rubric

This register tracks all architectural, financial, operational, and governance findings across the BR-01 closure verification. In accordance with Section 10 of the instructions, every finding is assigned one of six exact statuses:
- **`VERIFIED`**: Proven with concrete repository, Git-baseline-based, or mathematical evidence.
- **`VERIFIED WITH CAVEATS`**: Verified mathematically or technically, but subject to operational assumptions.
- **`NOT VERIFIED`**: Insufficient evidentiary access to substantiate claim.
- **`PROFESSIONAL VALIDATION REQUIRED`**: Mandates licensed specialist sign-off (CA, Legal, QA, Logistics).
- **`OWNER DECISION REQUIRED`**: Mandates explicit Project Owner choice; cannot be approved autonomously.
- **`CORRECTIONS REQUIRED`**: Contains factual or textual discrepancies requiring rectification.

---

## 2. Comprehensive Findings & Status Register

```
+-----------------------------------------------------------------------------------------------------------------------------------------------+
|                                    BR-01 MASTER FINDINGS & AUDIT STATUS REGISTER                                                              |
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| #  | Governance Area       | Evaluated Finding Description    | Finding Classification Status    | Evidentiary Basis & Remediation Action     |
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 1  | Mixed-Cart Tax        | ₹15,000 mixed basket evaluated   | VERIFIED                         | Reconciled in ATEEVRA-BR01-FIN-001.        |
|    | Recalculation         | with Chapter 62 (12%) + 42 (18%) |                                  | Blended tax is ₹1,838.68 (13.97% base).    |
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 2  | HSN-Level ITC on      | Landed COGS Input Tax Credit     | MODEL ASSUMPTION /               | Invoices unavailable. Classified as        |
|    | Landed COGS           | rates across silk, CMT, trims    | PROFESSIONAL VALIDATION REQUIRED | MODEL ASSUMPTION. Blended ITC ₹239.20 (6%).|
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 3  | Gateway MDR & Net P&L | 2.0% MDR + 18% GST separated into| VERIFIED                         | Verified: Cash deduction -₹354; P&L OpEx   |
|    | Operating Expense     | cash, P&L expense, and ITC asset |                                  | -₹300; GSTR-2B asset +₹54. Zero double-cnt.|
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 4  | Blazer Promotional    | Recalculation of ₹7,800 floor;   | VERIFIED (DUAL BASIS) /          | Direct variable cost = ₹6,635. Minimum MRP |
|    | Floor Price Proof     | dual Gross vs Net gateway basis  | UNVERIFIED FEE BASIS (Gate G-CA) | breakeven = ₹7,601 (Gross) / ₹7,583 (Net). |
|    |                       |                                  |                                  | ₹7,800 gives +₹173 (Gross) / +₹190 (Net).  |
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 5  | Supplier Milestone    | Status of 30/40/30 vs 30/70      | MODEL ASSUMPTION /               | Formally clarified as RECOMMENDED MODEL,   |
|    | Payment Terms         | supplier payment structure       | OWNER DECISION REQUIRED          | NOT approved agreement. OD-023 is PENDING. |
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 6  | ISO 2859-1 QC Plan    | Normal Level II sampling for lot | VERIFIED WITH CAVEATS /          | Lot 281–500, Code H, Sample 50: Critical   |
|    | Sampling Parameters   | size 281–500 (Sample size 50)    | PROPOSED QA VALIDATION REQUIRED  | Ac 0/Re 1, Major Ac 3/Re 4, Minor Ac 5/Re 6|
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 7  | Indian Occupational   | Warehouse ozone sanitation legal | VERIFIED WITH CAVEATS /          | Replaced OSHA with Factories Act 1948      |
|    | Workplace Safety      | basis (Factories Act / OSH Code) | PROFESSIONAL VALIDATION REQUIRED | Sec 13/14, BIS IS 15442 (0.1 ppm TWA).     |
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 8  | High-Value Refund     | Dual-authorization rules for all | VERIFIED                         | Verified: Dual auth mandatory for ALL      |
|    | RBAC Disallowance     | refunds > ₹5k, including > ₹25k  |                                  | disbursements > ₹5k. Super Admin cannot bypass|
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 9  | Marketplace Isolation | 8-point raw Git command audit    | VERIFIED                         | Git-baseline-based verification confirmed: |
|    | Baseline Proof        | against baseline commit 676609f  |                                  | git diff on docs/mvp2/ & apps/ is 0 lines. |
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 10 | Documentation File    | Reconciliation of 93 vs. 171     | VERIFIED                         | Reconciled: 86 original + 7 review = 93.   |
|    | Count Manifest        | reported file numbers            |                                  | 93 + 13 remediation + 65 marketplace = 171.|
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
| 11 | Decision Approval     | Status verification across all 28| VERIFIED                         | 28/28 decisions confirmed as PROPOSED.     |
|    | Status Invariants     | owner decision packages          |                                  | Zero decisions approved. Phase 0.5 gated.  |
+----+-----------------------+----------------------------------+----------------------------------+--------------------------------------------+
```

---

## 3. Specific Audit Investigations & Findings Details

### 3.1 Item 1: ISO 2859-1 Sampling Plan Validation
- **Standard Reference:** **ISO 2859-1:1999(E)** (*Sampling procedures for inspection by attributes — Part 1: Sampling schemes indexed by acceptance quality limit (AQL) for lot-by-lot inspection*).
- **Applicable Lot Size Range:** **281 to 500 units** (under Table 1, General Inspection Level II).
  *(Note: If lot size is 501 to 1,200 units, Code Letter is J, requiring Sample Size = 80 units).*
- **Sample Size Code Letter:** **Letter H**.
- **Sample Size:** **50 pieces**.
- **Inspection Standard:** **Single Sampling Plan for Normal Inspection** (Table 2-A).
- **Defect Classifications & Acceptance Bounds:**
  - **Critical Defects (AQL 0.0):** **Accept 0, Reject 1** (Any broken needle, hazardous sharp, or counterfeit trim immediately rejects entire 500-unit lot).
  - **Major Defects (AQL 2.5):** **Accept 3, Reject 4** (Dimensional out-of-tolerance $> 1.5\text{ cm}$, visible seam slippage, puckered lapel).
  - **Minor Defects (AQL 4.0):** **Accept 5, Reject 6** (Loose thread end $> 0.5\text{ cm}$, slight label tilt $< 2\text{ mm}$).
- **Status:** **PROPOSED — QA VALIDATION REQUIRED.** The sampling plan proposal is preserved on disk but is explicitly classified as **PROPOSED — QA VALIDATION REQUIRED** until a qualified textile QA professional confirms the standard edition, lot-size assumptions, sampling conditions, and acceptance criteria.

---

### 3.2 Item 2: Indian Occupational Safety Framework (Warehouse Ozone Sanitation)
The legal and technical framework for warehouse ozone garment sanitization is categorized as follows:
1. **Verified Statutory Obligations (Where Facility is Classified as a Factory):**
   - **The Factories Act, 1948:** Section 13 (effective fresh air ventilation); Section 14 (exhaust appliances for dust and toxic fumes); Section 41F and Second Schedule (permissible exposure limits for hazardous chemicals).
   - *Statutory Applicability Uncertainty:* Whether an e-commerce fulfillment warehouse (WH01) that carries out garment ozone sanitization is legally deemed a "factory" under Section 2(m)/Section 2(k) or a commercial establishment under the Karnataka Shops and Commercial Establishments Act, 1961 requires formal legal determination.
   - *Classification:* **PROFESSIONAL VALIDATION REQUIRED (Labour Law Counsel)**.
2. **Applicable / Enacted Standards (National Framework):**
   - **Occupational Safety, Health and Working Conditions Code, 2020 (Sections 23 & 24):** Enacted statutory framework for general employer workplace health duties; full operational notification across all states remains pending.
   - *Classification:* **ENACTED STANDARD / FUTURE STATUTORY BASELINE — PROFESSIONAL VALIDATION REQUIRED**.
3. **Voluntary Technical Controls & Industrial Hygiene Benchmarks:**
   - **Bureau of Indian Standards (BIS IS 15442:2004 / IS 5182):** Recommends workplace ambient ozone limits (8-hour TWA $\le 0.10\text{ ppm}$ / $0.20\text{ mg/m}^3$; 15-minute STEL $\le 0.30\text{ ppm}$).
   - *Classification:* **VOLUNTARY TECHNICAL BENCHMARK / RECOGNIZED INDUSTRIAL HYGIENE STANDARD**.
4. **Proposed Engineering Recommendations (Non-Statutory Technical Solutions):**
   - **Negative-Pressure Containment Room:** Proposed architectural design referencing NBC 2016 Part 8 guidelines to mitigate gas leakage; not an explicit central statutory command.
   - **Catalytic Manganese Dioxide Destruct Scrubbers:** Proposed voluntary engineering control to decompose ozone into oxygen before exhaust; not explicitly named in the Factories Act or NBC.
   - *Classification:* **PROPOSED ENGINEERING RECOMMENDATIONS / VOLUNTARY RISK MITIGATION CONTROLS**.
- **Overall Status:** **PROPOSED — OCCUPATIONAL SAFETY & INDUSTRIAL HYGIENE VALIDATION REQUIRED (`Gate G-QA` / `Gate G-LG`)**.

---

### 3.3 Item 3: Supplier Payment Structure Reality
- **Clarification:** The 30% advance / 40% ex-factory QC / 30% Net 30 post-GRN schedule is a **`RECOMMENDED COMMERCIAL MODELLING BASELINE`**.
- It is **NOT** an owner-approved contractual commitment and **NOT** a signed supplier agreement.
- Decision **`ATEEVRA-OD-023`** remains strictly **`PENDING OWNER REVIEW`**.

---

### 3.4 Item 4: High-Value Financial Authorization Enforcement
- **Universal Dual-Authorization Rule:** **EVERY disbursement exceeding ₹5,000 requires TWO distinct authorized individuals.**
- **Above ₹25,000 Threshold:** Mandates Dual Authorization with Step-Up Hardware TOTP Authentication (Initiator: Finance Specialist; Approver: CFO / Corporate Director).
- **Super Admin Guardrail:** Super Admin platform administrator accounts possess **ZERO unilateral refund authority**. Any attempt to approve a refund by a single user is blocked at the API layer with HTTP 403 Forbidden.

---
*End of Document `ATEEVRA-BR01-REG-001`.*
