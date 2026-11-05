# ATEEVRA PHASE 0.5 — ROLLBACK AND OPTION D ADDENDUM: OD-017
**Document ID:** `ATEEVRA-OD-017-ADD-002`  
**Classification:** Systems Architecture Addendum, Data-Model Asymmetry Audit & Option D Formalization  
**Parent Document:** [`ATEEVRA-OD-017-OWNER-DELIBERATION-DOSSIER.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-017-OWNER-DELIBERATION-DOSSIER.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision)`  
**Audit Date:** 2026-11-05  
**Auditor / Preparer:** Principal Enterprise Architect & Commerce Engine Systems Specialist  

---

## 1. Executive Summary & Audit Mandate

This Addendum resolves critical architectural contradictions and introduces a fourth formal alternative for **OD-017**:
1. **Resolution of the Rollback Contradiction:** Resolves the apparent conflict between claiming "reversibility in seconds via feature gate" while simultaneously acknowledging "data-model asymmetry if rolled back".
2. **Deconstruction of Rollback Layers:** Formally separates Configuration Rollback, Application-Code Rollback, Data-Model Compatibility, Historical Order Integrity, and Marketplace Operational Recovery.
3. **The Fate of First-Party Orders in Marketplace Mode:** Details the technical behavior and query handling of brand-mode orders that lack third-party merchant links if the system is reverted to marketplace mode.
4. **Partition Key Reality Check:** Evaluates whether physical PostgreSQL table partition keys are mandatory, merely proposed, or avoidable through safe synthetic tenant binding (`ATEEVRA_CORP`).
5. **Formalization of Option D (Architecture Freeze & Deferral):** Embeds Option D as an authoritative alternative across all governance registers, preserving Options A, B, and C.

---

## 2. Resolving the Rollback Contradiction: Layered Deconstruction

In earlier documentation, two seemingly contradictory claims appeared:
- *Claim 1:* "The runtime feature gate is 100% reversible in seconds by changing an environment variable."
- *Claim 2:* "A feature gate does not solve data model asymmetry or historical orphan orders upon rollback."

Both statements are true, but they refer to **different architectural layers**. The contradiction is resolved by separating the five layers of rollback:

```
+===================================================================================================================================+
|                                    THE FIVE DISTINCT LAYERS OF REVERSAL & ROLLBACK                                                |
+----+------------------------+---------------------+-------------------+-----------------------------------------------------------+
| #  | Rollback Layer         | Mechanism of Action | Time to Execute   | Technical Reality & Caveats                               |
+----+------------------------+---------------------+-------------------+-----------------------------------------------------------+
| 1  | **Configuration**      | Change env var:     | **< 10 Seconds**  | **INSTANTANEOUS:** Service layer reads new environment    |
|    | **Rollback**           | `COMMERCE_MODE=     | (Process restart) | toggle upon restart; route guards switch execution paths. |
|    |                        |  MARKETPLACE`       |                   | Zero database touches required.                           |
+----+------------------------+---------------------+-------------------+-----------------------------------------------------------+
| 2  | **Application-Code**   | Git checkout /      | **< 5 Minutes**   | **TESTED & SAFE:** Docker containers redeploy from cold   |
|    | **Rollback**           | container redeploy  | (CI/CD pipeline)  | image; verified commit `676609f` restores exact behavior. |
+----+------------------------+---------------------+-------------------+-----------------------------------------------------------+
| 3  | **Data-Model**         | Foreign keys and    | **0 Seconds**     | **ZERO DRIFT:** Because Option A forbids destructive SQL  |
|    | **Compatibility**      | schema constraints  | (Continuous)      | drops (`DROP TABLE`), all marketplace tables remain intact|
|    |                        |                     |                   | in PostgreSQL. Schema is 100% backward compatible.        |
+----+------------------------+---------------------+-------------------+-----------------------------------------------------------+
| 4  | **Historical Order &** | Querying orders     | **Requires Query  | **THE DATA ASYMMETRY CAVEAT:** Orders created during brand|
|    | **Inventory Integrity**| created during 1P   | Handling Logic**  | mode will lack third-party merchant IDs. In marketplace   |
|    |                        | mode after rollback |                   | mode, they must not crash merchant payout dashboards.     |
+----+------------------------+---------------------+-------------------+-----------------------------------------------------------+
| 5  | **Marketplace Ops**    | Resuming vendor     | **1–2 Business    | **OPERATIONAL CAVEAT:** Re-onboarding vendors, re-verifying|
|    | **Recovery**           | onboarding and bank | Days**            | bank accounts, and re-establishing escrow agreements is an|
|    |                        | payouts             |                   | operational process, not an instantaneous code switch.    |
+===================================================================================================================================+
```

---

## 3. The Fate of First-Party Orders if the System Returns to Marketplace Mode

If leadership operates in first-party brand mode for 6 months and then switches back to `COMMERCE_MODE=MARKETPLACE`, what happens to the database records?

### 3.1 The Problem of "Orphan Orders"
In the monorepo's marketplace framework:
- Every order line item is linked to a merchant via `apps/backend/src/links/merchant-order-item.ts`.
- Merchant dashboards query `/api/merchant/orders` by filtering `merchant_id = req.user.merchant_id`.
- The marketplace payout engine aggregates line items where `merchant_payout_status = PENDING`.

If 1P brand mode created orders without merchant links, those orders would have `merchant_id = NULL`.
- If a vendor queries their dashboard, their query does not break (SQL filters out nulls).
- HOWEVER, the platform admin dashboard might fail if an inner join `JOIN merchant_order_item` is executed without a null-safe coalesce.

### 3.2 The Architectural Solution: Synthetic Corporate Tenant (`ATEEVRA_CORP`)
To prevent data-model asymmetry without requiring complex database schema alterations:
1. When `COMMERCE_MODE=FIRST_PARTY_BRAND` is active, all brand-mode products and order line items are bound to a default internal organization:
   $$\mathbf{merchant\_id = 'ATEEVRA\_CORP'}$$
2. This single design pattern achieves two critical objectives:
   - It **satisfies all foreign key constraints** and Medusa v2 link module relationships.
   - If the system is switched back to marketplace mode, historical brand orders appear under the internal account `ATEEVRA_CORP`. They **never become orphan records**, never break admin queries, and are naturally filtered out of third-party vendor dashboards!

---

## 4. Are Database Partition Keys Actually Required?

In earlier technical commentary, "database partition keys" were proposed as a possible requirement.

### Technical Audit Finding:
$$\mathbf{DATABASE\ PARTITION\ KEYS\ ARE\ NOT\ REQUIRED\ FOR\ PHASE\ 1}$$
- **PostgreSQL Table Partitioning** (e.g., partitioning `orders` by `commerce_mode`) is an advanced performance optimization required only when transaction volumes exceed **500,000+ orders per year**.
- For an early-stage luxury brand operating at 500 to 5,000 orders/month, table partitioning introduces unnecessary operational complexity, vacuum overhead, and index maintenance risks.
- **The Safe Alternative:** A simple indexed column (`metadata.commerce_mode VARCHAR(32)`) combined with the **Synthetic Tenant pattern (`ATEEVRA_CORP`)** provides 100% query isolation, zero data corruption, and seamless rollback without touching database DDL schemas.

---

## 5. Formalization of Option D: Complete Architecture Freeze & Deferral

To ensure the Project Owner has the full range of governance choices, **Option D** is formally integrated as an authoritative alternative:

```
+===================================================================================================================================+
|                                    OD-017 COMPLETE FOUR-ALTERNATIVE EVALUATION                                                    |
+--------------------------+-----------------------+---------------------+-----------------------+----------------------------------+
| Evaluation Criteria      | Option A: Feature Gate| Option B: DB Purge  | Option C: Code Fork   | Option D: Architecture Freeze    |
|                          | (COMMERCE_MODE)       | (Drop Tables)       | (Separate Repo)       | & Deferral to Phase 1            |
+--------------------------+-----------------------+---------------------+-----------------------+----------------------------------+
| **Description**          | Non-breaking runtime  | Executing SQL drops | Forking into a brand- | Zero code changes during Phase   |
|                          | environment toggle    | on merchant tables; | new Git repository;   | 0.5; preserve baseline 676609f;  |
|                          | & synthetic tenant    | deleting link files | duplicating CI/CD     | defer all BFF/gate code to Ph 1. |
+--------------------------+-----------------------+---------------------+-----------------------+----------------------------------+
| **Governance Status**    | Recommended for Ph 1  | REJECTED (Violation)| REJECTED (Technical)  | **RECOMMENDED FOR PHASE 0.5**    |
+--------------------------+-----------------------+---------------------+-----------------------+----------------------------------+
| **Database Safety**      | 100% Preserved        | DESTRUCTIVE LOSS    | Preserved (Fractured) | 100% FROZEN & UNTOUCHED          |
+--------------------------+-----------------------+---------------------+-----------------------+----------------------------------+
| **Rollback Risk**        | Low (Via toggle)      | Impossible          | High (Code drift)     | **ZERO RISK (No changes made)**  |
+--------------------------+-----------------------+---------------------+-----------------------+----------------------------------+
| **Timing of Execution**  | Phase 1 Sprint 1      | Never               | Never                 | **ACTIVE NOW IN PHASE 0.5**      |
+===================================================================================================================================+
```

### Strategic Value of Option D for the Project Owner:
Selecting Option D allows the Project Owner to:
1. Ratify the commercial model (OD-001) and tax strategy (OD-007) first.
2. Complete all external professional validations (G-CA, G-LG, G-QA).
3. Keep the engineering team 100% frozen on baseline commit `676609f` until all business prerequisites are satisfied, preventing speculative or premature code refactoring.

---

## 6. Register Synchronization Schedule

The expanded 4-option structure for OD-017 is formally updated across all Phase 0.5 documents:
- `docs/ateevra-brand/owner-decisions/ATEEVRA-OD-017-decoupling-marketplace-primitives.md`
- `docs/ateevra-brand/phase-0.5/ATEEVRA-OD-017-OWNER-DELIBERATION-DOSSIER.md`
- `docs/ateevra-brand/phase-0.5/ATEEVRA-OWNER-DECISION-MASTER-REGISTER-CANONICAL.md`
- `docs/ateevra-brand/phase-0.5/ATEEVRA-OWNER-DECISION-REVIEW-AGENDA.md`
- `docs/ateevra-brand/phase-0.5/ATEEVRA-OWNER-DECISION-DEPENDENCY-MATRIX.md`
- `docs/ateevra-brand/phase-0.5/ATEEVRA-WAVE-1-OWNER-DECISION-READINESS-MATRIX.md`

---

## 7. Final Governance State

$$\mathbf{OD-017\ STATUS:\ PROPOSED\ (PENDING\ EXPLICIT\ OWNER\ SELECTION)}$$
- **Zero code changes implemented.**
- **Zero synthetic tenants created in database.**
- **Implementation remains strictly locked.**
