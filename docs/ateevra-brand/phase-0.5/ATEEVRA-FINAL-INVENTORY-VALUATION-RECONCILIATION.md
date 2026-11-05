# ATEEVRA PHASE 0.5 — INVENTORY VALUATION & SOURCING RECONCILIATION
**Document ID:** `ATEEVRA-OD-002-INV-VAL-REC-001`  
**Classification:** Inventory Accounting Audit, Ind AS 2 Valuation & Sourcing Model Reconciliation  
**Parent Document:** [`ATEEVRA-PHASE-1-FUNDING-REQUIREMENT-BRIDGE.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-PHASE-1-FUNDING-REQUIREMENT-BRIDGE.md)  
**Cross-References:** [`ATEEVRA-OD-002-EVIDENCE-AND-CORRECTION-ADDENDUM.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-002-EVIDENCE-AND-CORRECTION-ADDENDUM.md), [`ATEEVRA-PHASE-0.5-FUNDING-AUTHORIZATION-CONTROLS-ADDENDUM.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-PHASE-0.5-FUNDING-AUTHORIZATION-CONTROLS-ADDENDUM.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision)`  
**Audit Date:** 2026-11-05  
**Auditor / Reviewer:** Principal Enterprise Architect, Luxury Supply Chain Modeler & Inventory Controller  

---

## 1. Executive Summary & Audit Mandate

This document resolves the targeted inventory valuation questions in Phase 0.5:
1. **Reconciliation of the Sourcing Ceiling (₹32.875L) with the Asset Register (₹28.635L):** Identifying the exact nature, accounting classification, and drop assignment of the remaining **₹4,24,000.00 (₹4.24 Lakhs)**.
2. **Clarification of Inbound Freight (₹59,000.00):** Confirming that freight is **already embedded** in the unit landed costs of the four debut SKUs, preventing duplicate capitalization.
3. **Statutory Ind AS 2 Valuation Boundaries:** Distinguishing accounting book value, commercial selling value, and cash recoverability risk.

---

## 2. Line-by-Line Reconciliation: Sourcing Ceiling vs. Asset Register

The review noted that the asset categories listed in earlier reports totaled **₹28.635L** against the **₹32.875L** sourcing ceiling:
- Debut Finished-Goods Inventory: **₹16.01 Lakhs**
- Drop 2 Raw Materials & Trims (WIP): **₹12.625 Lakhs**
- **Subtotal:** **₹28.635 Lakhs**
- **Unexplained Difference:** $₹32.875\text{L} - ₹28.635\text{L} = \mathbf{₹4,24,000.00 \text{ (₹4.24 Lakhs)}}$

### 2.1 The Remaining Amount Identified: Drop 2 Atelier Conversion Cost
The ₹4,24,000.00 represents the **Second-Drop Master Atelier Cut-Make-Trim (CMT) Conversion Labor (Conversion Cost)**:
- **Relevant Drop:** **Drop 2 (Secondary Drop / Fast Replenishment Drop of 500 units)**.
- **Accounting Nature:** **Conversion Labor Services under Ind AS 2, Paragraph 12** (*Costs of Conversion*).
- **Physical Reality:** In Drop 2, the raw materials (wool, silk, canvas, trims) cost **₹12,62,500.00**. To convert these raw fabrics into finished tailored garments, the atelier performs cut-make-trim tailoring services budgeted at **₹4,24,000.00**.
- **Combined Drop 2 Value:** Once tailored, Drop 2 becomes finished inventory valued at $₹12,62,500.00 + ₹4,24,000.00 = \mathbf{₹16,86,500.00}$.
- **Prior to Tailoring:** Prior to cutting, the ₹12.625L resides in Raw Materials inventory, and the ₹4.24L resides as committed conversion labor under the Master Manufacturing Agreement (MMA).

```
+===================================================================================================================================+
|                                    TOTAL SOURCING CEILING ASSET RECONCILIATION                                                    |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
| #  | Inventory & Sourcing Element       | Units / Scope    | Net Amount (₹)   | Accounting Nature     | Relevant Production Drop  |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
| 1  | **Debut Finished-Goods Inventory** | **500 Units**    | **₹16,01,000.00**| **Finished Inventory**| **Drop 1 (Debut Capsule)**|
|    | (Blazers, Shirts, Trousers, Knits) | (Landed at WH01) | **(~₹16.01L)**   | (Ind AS 2 Asset)      | Funded via Day 0 Equity   |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
| 2  | **Drop 2 Raw Materials & Trims**   | **Mill Yardage** | **₹12,62,500.00**| **Raw Materials Asset**| **Drop 2 (Secondary Drop)**|
|    | (Wool Bolts, Silk Lining, Hardware)| (500 units equiv)| **(~₹12.625L)**  | (Ind AS 2 Asset)      | Reorder Raw Material Pool |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
| 3  | **Drop 2 Atelier Conversion Cost** | **CMT Labor**    | **₹4,24,000.00** | **Conversion Cost**   | **Drop 2 (Secondary Drop)**|
|    | (Master Atelier Tailoring Services)| (500 units cut)  | **(~₹4.24L)**    | (Ind AS 2 Conversion) | Atelier Tailoring Service |
+----+------------------------------------+------------------+------------------+-----------------------+---------------------------+
|    | **TOTAL SOURCING CEILING**         | **1,000 Units**  | **₹32,87,500.00**| —                     | **Drop 1 + Drop 2**       |
|    | **(EXACT MATCH TO BUDGET CEILING)**| **Total Scope**  | **(~₹32.875L)**  |                       | **(Zero Variance!)**      |
+===================================================================================================================================+
```

---

## 3. Inbound Freight Treatment: Prevention of Double Capitalization

The quality review instructed an explicit confirmation of whether the **₹59,000.00 inbound freight** is already embedded inside the ₹16.01L debut inventory cost.

### 3.1 Mathematical & Component Proof
The unit landed cost calculations established in `ATEEVRA-OD-002-EVIDENCE-AND-CORRECTION-ADDENDUM.md`, Section 2.1, disaggregate the four debut SKUs as follows:

```
+===================================================================================================================================+
|                                    DEBUT CAPSULE SKU-LEVEL FREIGHT AUDIT (500 UNITS)                                              |
+----+--------------------------+------------+-----------------+------------------+--------------------+----------------------------+
| #  | SKU Description          | Planned    | Unit Inbound    | Total SKU        | Unit True Landed   | Consolidated SKU           |
|    |                          | Batch Qty  | Freight (₹)     | Inbound Freight  | Cost (Ind AS 2) (₹)| Batch Accounting Cost (₹)  |
+----+--------------------------+------------+-----------------+------------------+--------------------+----------------------------+
| 1  | Tailored Wool Blazer     | 150 Units  | ₹150.00         | ₹22,500.00       | ₹4,050.00          | ₹6,07,500.00               |
| 2  | Silk Evening Shirt       | 150 Units  | ₹90.00          | ₹13,500.00       | ₹2,790.00          | ₹4,18,500.00               |
| 3  | Pleated Wool Trousers    | 100 Units  | ₹80.00          | ₹8,000.00        | ₹2,250.00          | ₹2,25,000.00               |
| 4  | Cashmere Fine Knit       | 100 Units  | ₹150.00         | ₹15,000.00       | ₹3,500.00          | ₹3,50,000.00               |
+----+--------------------------+------------+-----------------+------------------+--------------------+----------------------------+
|    | **CONSOLIDATED TOTALS**  | **500**    | —               | **₹59,000.00**   | —                  | **₹16,01,000.00**          |
+===================================================================================================================================+
```

### 3.2 Confirmation of Non-Duplication
$$\text{Sum of SKU Freight} = ₹22,500.00 + ₹13,500.00 + ₹8,000.00 + ₹15,000.00 = \mathbf{₹59,000.00}$$
$$\text{Sum of SKU Accounting Cost} = ₹6,07,500.00 + ₹4,18,500.00 + ₹2,25,000.00 + ₹3,50,000.00 = \mathbf{₹16,01,000.00}$$

> [!CRITICAL]
> **Definitive Accounting Invariant:**  
> The ₹59,000.00 inbound freight is **ALREADY EMBEDDED inside the ₹16.01 Lakh debut inventory cost**.  
> Under Ind AS 2, Paragraph 11, freight is capitalized directly into SKU landed cost. **Zero additional freight may be capitalized on top of ₹16.01L**. Adding ₹59,000.00 as a separate line item would constitute improper double-capitalization.

---

## 4. Closing Inventory Valuation, Selling Value & Cash Recoverability

```
+===================================================================================================================================+
|                                    INVENTORY REALIZATION & RECOVERY SPECTRUM (500 UNITS)                                          |
+--------------------------+------------------+--------------------+----------------------------------------------------------------+
| Valuation Tier           | Amount (₹)       | Recovery Status    | Evidentiary Basis & Impairment Triggers                        |
+--------------------------+------------------+--------------------+----------------------------------------------------------------+
| **1. Accounting Cost**   | **₹16,01,000.00**| **Book Value**     | **Ind AS 2 Lower of Cost and NRV.** Valid prior to launch.      |
| **(Historical Landed)**  |                  |                    | Not liquid; capital locked in physical garments.               |
+--------------------------+------------------+--------------------+----------------------------------------------------------------+
| **2. Commercial GMV**    | **₹56,34,500.00**| **Expected Cash**  | Assumes 450 units sold (90% sell-through) at targeted luxury   |
| **(Realistic Scenario)** |                  |                    | pricing with promotional blazer floor (₹7,800) and 18% returns.|
+--------------------------+------------------+--------------------+----------------------------------------------------------------+
| **3. Liquidation Salvage**| **₹8,00,000.00** | **50% Loss**       | **Downside Stress Case:** Deadstock sold to jobbers at salvage |
| **(Distressed Sale)**    | **to ₹9,50,000** | **(High Risk)**    | below raw fabric value if brand fails to achieve market launch.|
+===================================================================================================================================+
```

---

## 5. Register of Corrections

| Item | Previous Description / Figure | Corrected Figure | Exact Calculation / Reason |
| :--- | :--- | :--- | :--- |
| **Sourcing Ceiling Residual** | ₹4.24L unexplained | **₹4,24,000.00** | Drop 2 Master Atelier CMT Conversion Labor: $₹32,87,500 - (₹16,01,000 + ₹12,62,500) = ₹4,24,000$. |
| **Inbound Freight Status** | Ambiguous whether extra | **Included in ₹16.01L** | Sum of SKU freight $(₹22.5\text{k} + ₹13.5\text{k} + ₹8\text{k} + ₹15\text{k} = ₹59\text{k})$ is embedded in unit COGS. |
| **Inventory Liquidity** | Described as asset | **Illiquid Risk Asset** | Reclassified: inventory cannot be treated as immediately spendable cash. |
