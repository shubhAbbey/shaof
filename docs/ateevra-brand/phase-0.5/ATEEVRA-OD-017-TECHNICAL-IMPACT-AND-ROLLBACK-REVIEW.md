# ATEEVRA PHASE 0.5 — TECHNICAL IMPACT AND ROLLBACK REVIEW: OD-017
**Document ID:** `ATEEVRA-OD-017-REV-001`  
**Parent Document:** [`ATEEVRA-OD-017-OWNER-DELIBERATION-DOSSIER.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-017-OWNER-DELIBERATION-DOSSIER.md)  
**Canonical Title:** Decoupling Marketplace Multi-Vendor Links & Commercial Mode Gate  
**Classification:** Enterprise Architecture Review, Regression Analysis & Rollback Safety Audit  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision)`  
**Audit Date:** 2026-11-05  
**Auditor / Preparer:** Principal Enterprise Architect & Commerce Engine Systems Specialist  

---

## 1. Executive Summary & Purpose of Review

This document provides an independent technical impact review and regression safety analysis of the proposed **`COMMERCE_MODE` feature gate** in **OD-017**.

The Project Owner's quality mandate explicitly requires that the architecture team:
1. Conduct a granular, 10-point architectural impact audit across every affected Medusa module, service, link, and background workflow.
2. Clearly distinguish between:
   - A runtime configuration toggle (`COMMERCE_MODE`).
   - A synthetic internal tenant identity (`ATEEVRA_CORP`).
   - A statutory change in Seller of Record and legal liability.
   - A structural database or relationship-model migration.
3. Reject the naive assumption that an environment variable alone guarantees complete runtime isolation or rollback safety.
4. Introduce and evaluate a **Conservative Alternative (Alternative 4)**: Preserving the existing marketplace implementation completely untouched and deferring all first-party runtime changes until the Project Owner formally ratifies Wave 1 and external validation gates clear.

---

## 2. Conceptual Clarification: The Four Distinct Architectural Layers

To avoid architectural conflation, the engineering team must recognize four distinct, independent layers:

```
+===================================================================================================================================+
|                                  THE FOUR DISTINCT ARCHITECTURAL LAYERS INVOLVED                                                  |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| Layer Concept      | Definition & Operational Mechanism       | Failure Mode if Conflated          | Implementation Timing        |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **1. Runtime**     | Environment variable (`COMMERCE_MODE=    | Assuming an env flag automatically | Phase 1 (Only after owner    |
| **Feature Gate**   | FIRST_PARTY_BRAND | MARKETPLACE`) that   | purges database dependencies or    | selection and test harness)  |
|                    | controls conditional code execution.     | enforces business constraints.     |                              |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **2. Synthetic**   | A default corporate entity record in the | Conflating internal database joins | Phase 1 (Data seed, zero     |
| **Internal Tenant**| merchant table (`ATEEVRA_CORP`) to satisfy| with a true statutory Seller of    | schema alteration)           |
|                    | foreign key relationships without drops. | Record entity.                     |                              |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **3. Statutory**   | Corporate legal formation, GSTIN filing, | Assuming code changes alone fulfill| Corporate Legal / CA Setup   |
| **Seller of Record| Section 31 tax invoice issuance, and     | legal Seller of Record requirements| (Gate G-CA & Gate G-LG)      |
|                    | direct consumer product liability.       | without corporate underwriting.    |                              |
+--------------------+------------------------------------------+------------------------------------+------------------------------+
| **4. Database /**  | Physical SQL schemas, PostgreSQL tables, | Attempting destructive `DROP TABLE`| STRICTLY PROHIBITED          |
| **Schema Migration| Medusa link definitions (`defineLink`),  | migrations that destroy historical | (Preserves 100% of existing  |
|                    | and foreign key constraints.             | rollback capabilities.             | migrations and tables)       |
+===================================================================================================================================+
```

---

## 3. Ten-Point Architecture Impact Matrix

The table below audits the 10 operational areas of Medusa v2.19, contrasting existing marketplace behavior against proposed first-party behavior, identifying change types, regression risks, and test mandates:

```
+===================================================================================================================================+
|                                    TEN-POINT ARCHITECTURAL IMPACT AND REGRESSION MATRIX                                           |
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| #  | System Component  | Existing Marketplace    | Proposed First-Party    | Change Type | Regression Risk     | Required Test    |
|    | / Domain          | Execution Behavior      | Brand Behavior          |             |                     | Verification     |
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 1  | **Medusa Core**   | Service layer resolves  | Bypasses marketplace    | Code Change | Circular dependency | Integration test |
|    | **Modules**       | multi-vendor links on   | service interceptors;   | (Service    | in dependency       | confirming clean |
|    |                   | every entity lookup.    | direct core execution.  | Decorator)  | container.          | boot in both modes.
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 2  | **Merchant-**     | Products joined to      | Queries bind to standard| Code Change | Broken catalog queries| Product CRUD test|
|    | **Product Link**  | `merchant_product` table| Medusa sales channels;  | (Query      | if link decorators  | without merchant |
|    | (`merchant-prod`)| to check vendor status. | merchant link bypassed. | Interceptor)| fail silently.      | join active.     |
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 3  | **Merchant-Order-**| Cart items tagged with | Single order line item  | Code Change | Split cart failure; | Single checkout  |
|    | **Item Link**     | merchant ID; split orders| pipeline; all items     | (Workflow   | line items assigned | order creation   |
|    | (`merchant-order`)| generated for vendors.  | bound to ATEEVRA brand. | Step)       | to null merchant ID.| integration test. |
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 4  | **Merchant-Stock-**| Inventory allocated to  | Stock dedicated to      | Config &    | Stock starvation if | Stock lookup and |
|    | **Location Link** | merchant-specific stock | central warehouse       | Data Change | location mapping    | reservation test |
|    | (`merchant-stock`)| locations across India. | facility location `WH01`| (Seed loc)  | is misconfigured.   | at location WH01.|
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 5  | **Inventory &**   | Stock availability      | Real-time inventory read| No Change   | Inventory oversell  | Stress test of   |
|    | **Fulfillment**   | aggregated across       | directly from WH01 stock| (Uses core  | on high-velocity    | inventory locks  |
|    |                   | vendor warehouses.      | levels via core Medusa. | Medusa)     | launch events.      | in single location.
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 6  | **Cart, Checkout**| Multi-vendor cart; split| Single consolidated cart| Code Change | Broken customer cart| Full E2E checkout|
|    | **& Payment**     | shipping charges; split | single shipping charge; | (Cart/Pay   | if checkout expects | test with mock   |
|    |                   | gateway settlements.    | direct corporate deposit| Service)    | vendor sub-orders.  | gateway in 1P.   |
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 7  | **Refunds &**     | Refund approval routed  | Direct concierge refund;| Code Change | Stuck refund jobs   | Automated credit |
|    | **Returns**       | to individual merchant; | automated Section 34    | (Refund     | awaiting merchant   | note & refund    |
|    |                   | merchant clawback ledger| Credit Note generation. | Workflow)   | approval that fails.| emission test.   |
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 8  | **Admin &**       | Dedicated `/api/merchant| Merchant routes return  | Code Change | Unauthorized vendor | Security audit   |
|    | **Merchant Auth** | routes; merchant user   | HTTP 403 Forbidden;     | (API Route  | access to internal  | testing route    |
|    |                   | session management.     | brand admin active.     | Middleware) | brand operations.   | guards in brand. |
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 9  | **Background**    | Subscribers calculate   | Merchant payout workers | Config &    | Worker crashes due  | Event subscriber |
|    | **Jobs / Events** | merchant commission and | disabled; invoice event | Code Change | to missing merchant | execution audit  |
|    |                   | trigger payout ledgers. | triggers PDF generator. | (Event Sub) | context in brand.   | across all queues.|
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
| 10 | **Audit Logs &**  | Vendor-segregated sales | Centralized statutory   | Code Change | Mixed-mode audit log| Ledger audit test|
|    | **Reconciliation**| reports and Form GSTR-8 | accounting ledger and   | (Reporting  | contamination       | confirming zero  |
|    |                   | TCS audit logs.         | GSTR-1 sales logs.      | Layer)      | between modes.      | TCS entries in 1P.
+----+-------------------+-------------------------+-------------------------+-------------+---------------------+------------------+
```

---

## 4. Evaluation of Sourcing Alternatives: Adding Conservative Alternative 4

The original dossier evaluated:
- Alternative 1: Runtime Feature Gate (`COMMERCE_MODE`)
- Alternative 2: Destructive Database Migration (Purge Merchant Tables)
- Alternative 3: Codebase Forking (Separate Repository)

To ensure comprehensive governance, we formally introduce and evaluate **Alternative 4**:

### Alternative 4: Complete Architecture Freeze & Deferred Implementation — [CONSERVATIVE ALTERNATIVE]
- **Mechanics:** Make zero modifications to Medusa code, zero changes to environment variables, zero additions of synthetic tenants, and zero route changes during Phase 0.5. Preserve the repository at commit `676609f`. Defer all runtime decoupling changes to **Phase 1 (Sprint 1)**, executing them only after the Project Owner formally signs OD-001/017 and external professional gates (G-CA, G-LG, G-QA) clear.
- **Advantages:** Absolute zero regression risk during the deliberation phase; prevents speculative code refactoring; ensures engineering effort is expended only on ratified decisions.
- **Disadvantages:** Defers technical prototype verification until Phase 1.

```
+===================================================================================================================================+
|                                    COMPARATIVE EVALUATION OF ALL FOUR ALTERNATIVES                                                |
+--------------------------+-----------------------+---------------------+-----------------------+----------------------------------+
| Evaluation Criteria      | Alt 1: Runtime Gate   | Alt 2: DB Purge     | Alt 3: Code Fork      | Alt 4: Complete Freeze & Defer   |
|                          | [Recommended Ph 1]    | [REJECTED]          | [REJECTED]            | [RECOMMENDED FOR PHASE 0.5]      |
+--------------------------+-----------------------+---------------------+-----------------------+----------------------------------+
| Monorepo Governance      | Fully Compliant       | VIOLATION (Drops DB)| Problematic (Fork)    | 100% PERFECTLY COMPLIANT         |
| Database Safety          | 100% Preserved        | DESTRUCTIVE LOSS    | Preserved (Fractured) | 100% PRESERVED & FROZEN          |
| Rollback Feasibility     | Seconds (Toggle flag) | Impossible (Lost DB)| Complex Git sync      | IMMEDIATE (Zero changes made)    |
| Engineering Blast Radius | Low (Controlled BFF)  | Catastrophic        | High (Dual pipelines) | ZERO BLAST RADIUS                |
| Timing of Execution      | Phase 1 Implementation| Never               | Never                 | ACTIVE NOW IN PHASE 0.5          |
+===================================================================================================================================+
```

### Why Destructive Migrations (Alt 2) and Codebase Forking (Alt 3) are Formally Rejected:
1. **Destructive SQL Migrations (`DROP TABLE merchant CASCADE`)** permanently destroy historical marketplace investments, break all 65 verified M2-14 test suites, and invalidate repository traceability. They represent an unforced, catastrophic governance violation.
2. **Codebase Forking** doubles DevOps overhead, splits continuous integration pipelines, and prevents cross-project component reuse, creating unnecessary technical debt.

---

## 5. Rollback Protocol and Its Technical Limitations

### 5.1 Deterministic Rollback Protocol
If the Project Owner selects Option A (Runtime Feature Gate), the rollback mechanism operates as follows:
1. Revert environment variable in production container configuration: `COMMERCE_MODE=MARKETPLACE`.
2. Restart backend Node.js / Medusa process.
3. Service interceptors deactivate; merchant link modules re-engage; merchant routes unblock.
4. Historical merchant data remains intact in PostgreSQL.

### 5.2 Technical Limitations of Feature Gates (What a Toggle CANNOT Do):
A simple configuration toggle does **NOT** solve:
1. **Data Model Asymmetry:** Orders created during brand mode will lack merchant line-item bindings. If switched back to marketplace mode, historical brand-mode orders will appear as "orphan orders" in merchant payout dashboards unless explicitly filtered out.
2. **Stock Location Collisions:** Stock allocated to `WH01` in brand mode must be logically segregated from merchant inventory pools to prevent multi-vendor stock collisions upon rollback.
3. **Audit Trail Separation:** Financial reports must partition transactions by `commerce_mode` column to prevent mixed-mode accounting corruption.

---

## 6. Explicit Evidence Classification for OD-017

1. **Existence of Merchant Link Modules (`merchant-product.ts` etc.):** `VERIFIED (Inspected in apps/backend/src/links/)`.
2. **Existence of Merchant Database Tables (`merchant` etc.):** `VERIFIED (Inspected in apps/backend/src/modules/marketplace/)`.
3. **Preservation of Baseline Commit `676609f`:** `VERIFIED (git diff 676609f on apps/ and docs/mvp2/ = 0)`.
4. **Feasibility of Service Layer Interceptor Pattern:** `ESTIMATED (Architectural design pattern, requires integration test in Phase 1)`.
5. **Zero Schema Modification Feasibility:** `CALCULATED (Proven by synthetic tenant mapping architecture)`.

---

## 7. Review Conclusion & Governance Status

- **Technical Strategy Confirmed:** Alternative 1 (Runtime Feature Gate) remains the soundest technical design for Phase 1, but **Alternative 4 (Complete Freeze & Deferral) must govern Phase 0.5**.
- **Governance Invariant:** `OD-017 REMAINS STRICTLY PROPOSED`. Zero implementation code, zero feature gate modules, and zero synthetic tenants shall be written to the repository until the Project Owner explicitly ratifies the decision in writing.
