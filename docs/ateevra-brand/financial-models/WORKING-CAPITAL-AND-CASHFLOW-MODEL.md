# ATEEVRA — Working Capital and Cashflow Projection Model

**Document ID:** `ATEEVRA-FIN-CAP-001`  
**Classification:** Corporate Treasury & Working Capital Engineering  
**Status:** DRAFT (Under Owner Review)  
**Version:** 1.0.0  

---

## 1. Executive Summary & Cash Conversion Cycle (CCC)

As a first-party brand holding direct inventory custody, working capital management is critical. Unlike marketplaces which operate on negative working capital (collecting customer cash at $T=0$ and delaying vendor payouts to $T+15$), ATEEVRA must pre-fund raw materials and contract manufacturing before receiving retail customer proceeds.

### 1.1 Cash Conversion Cycle Formula & Target

$$\text{CCC} = \text{Days Inventory Outstanding (DIO)} + \text{Days Sales Outstanding (DSO)} - \text{Days Payables Outstanding (DPO)}$$

```
+-----------------------------------------------------------------------------------+
|                        ATEEVRA CASH CONVERSION CYCLE (DAYS)                       |
|                                                                                   |
|  [ DIO: 70 Days ]                   [ DSO: 1.5 Days ]      [ DPO: 45 Days ]       |
|  Atelier production (35d)           Payment Gateway        B2B Fabric & Atelier   |
|  + Warehouse stock buffer (35d)     Settlement (T+1)       Credit Terms           |
|                                                                                   |
|  NET WORKING CAPITAL FINANCING GAP (CCC) = 70 + 1.5 - 45 = 26.5 DAYS              |
+-----------------------------------------------------------------------------------+
```

---

## 2. Supplier Milestone Payment Structure

To de-risk working capital while ensuring atelier loyalty and priority production slots, payments to certified contract manufacturing ateliers follow a three-tranche milestone structure:

```
[ Purchase Order Issued ] ───► Tranche 1: 30% Advance (Funds raw material procurement)
                                         │
                                [ Production Complete ]
                                         │
[ AQL 2.5 Ex-Factory QC Pass ] ───► Tranche 2: 40% Shipment Release
                                         │
                                [ Warehouse GRN & Lab QC ]
                                         │
[ Net 30 Days Post-Receipt ] ────► Tranche 3: 30% Final Balance (Subject to Debit Notes)
```

### 2.1 Milestone Payment Matrix

| Tranche | Milestone Event | Percentage | Payment Mode | Audit & Verification Prerequisite |
| :--- | :--- | :--- | :--- | :--- |
| **Tranche 1** | Contract Signing & PO Release | 30% | Direct NEFT / RTGS | Counter-signed Tech Pack & Fabric Lab Approval |
| **Tranche 2** | Ex-Factory Inspection Certificate | 40% | Direct NEFT / RTGS | Third-Party or ATEEVRA QA Inspector Sign-Off |
| **Tranche 3** | Warehouse Inbound GRN Pass | 30% | Net 30 Days Terms | Final reconciliation against shortage or AQL defect debit notes |

---

## 3. Inventory Carrying Cost & Liquidity Buffers

Holding luxury inventory incurs physical, financial, and opportunity costs. ATEEVRA budgets an **annual carrying cost of 18.5%** of average inventory value:

$$\text{Annual Carrying Cost Rate} = \text{Cost of Capital (9.5\%)} + \text{Storage \& Climate Control (3.5\%)} + \text{Insurance (1.5\%)} + \text{Obsolescence/Shrink (4.0\%)}$$

### 3.1 Minimum Cash Reserve Policy
To protect operations during pre-season collection manufacturing:
- **Treasury Liquidity Buffer:** ATEEVRA maintains an unencumbered operating cash buffer equal to **3.0 months of forward fixed operational expenses** plus **50% of outstanding PO advance commitments**.
- **Working Capital Facility:** Standby bank credit lines (Overdraft / Cash Credit against hypothecation of finished goods inventory) to support pre-monsoon and pre-festive seasonal inventory ramps.

---
*End of Document `ATEEVRA-FIN-CAP-001`. Authorized for Working Capital & Treasury Operations.*
