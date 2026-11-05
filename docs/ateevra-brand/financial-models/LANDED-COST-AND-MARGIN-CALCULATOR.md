# ATEEVRA — Landed Cost and Product Margin Calculator

**Document ID:** `ATEEVRA-FIN-CALC-001`  
**Classification:** Cost Accounting & BOM Margin Engineering  
**Status:** DRAFT (Under Owner Review)  
**Version:** 1.0.0  

---

## 1. Executive Summary & Cost Accounting Principles

In luxury fashion manufacturing, price integrity requires calculating the exact **Total Landed Cost (TLC)** for every SKU before establishing the Maximum Retail Price (MRP). ATEEVRA employs standard cost accounting under **Ind AS 2 (Inventories)**:

$$\text{Total Landed Cost (TLC)} = \text{BOM Raw Materials} + \text{CMT Atelier Labor} + \text{Trims \& Hardware} + \text{Inbound Freight} + \text{QC Testing} + \text{Wastage}$$

Luxury pricing adheres to a minimum **4.5x to 6.0x retail markup multiplier** against Landed Cost:
$$\text{Target MRP} = \text{TLC} \times \text{Markup Multiplier} \times (1 + \text{GST Rate})$$

---

## 2. Product Archetype BOM & Landed Cost Breakdown

```
+----------------------------------------------------------------------------------------------------------+
|                                    ARCHETYPE LANDED COST BREAKDOWN (INR)                                  |
+--------------------------------------+-----------------+-----------------+---------------+---------------+
| Cost Element                         | Tailored Blazer | Silk Blouse     | Wool Trousers | Leather Tote  |
+--------------------------------------+-----------------+-----------------+---------------+---------------+
| Primary Shell Material               | ₹1,650.00       | ₹1,200.00       | ₹850.00       | ₹2,400.00     |
|   (Specification)                    | (Super 130s)    | (Mulberry Silk) | (Wool Blend)  | (Full Grain)  |
| Secondary Lining & Interfacing       | ₹450.00 (Cupro) | ₹120.00 (Chiffon| ₹180.00 (Cupro| ₹350.00 (Suede|
| Hardware & Trims (Buttons/Zips/Crest)| ₹280.00 (Horn)  | ₹95.00 (MOP)    | ₹140.00 (Horn)| ₹650.00 (Brass|
| Atelier Cut, Make, Trim (CMT) Labor  | ₹1,450.00       | ₹650.00         | ₹550.00       | ₹1,800.00     |
| Inbound Freight & Packaging to WH    | ₹85.00          | ₹45.00          | ₹55.00        | ₹120.00       |
| Lab QC & Fabric Testing Allocation   | ₹35.00          | ₹30.00          | ₹25.00        | ₹50.00        |
| Material Wastage Allowance (4%)      | ₹100.00         | ₹60.00          | ₹45.00        | ₹140.00       |
+--------------------------------------+-----------------+-----------------+---------------+---------------+
| TOTAL LANDED COST (TLC) (Excl GST)   | ₹4,050.00       | ₹2,200.00       | ₹1,845.00     | ₹5,510.00     |
+--------------------------------------+-----------------+-----------------+---------------+---------------+
| Target Retail Markup Multiplier      | 5.2x            | 5.0x            | 4.8x          | 5.5x          |
| Net Selling Price (Excl GST)         | ₹21,060.00      | ₹11,000.00      | ₹8,856.00     | ₹30,305.00    |
| Applicable GST Rate                  | 12%             | 12%             | 12%           | 18%           |
| Statutory GST Amount                 | ₹2,527.20       | ₹1,320.00       | ₹1,062.72     | ₹5,454.90     |
+--------------------------------------+-----------------+-----------------+---------------+---------------+
| RECOMMENDED MRP (Rounded)            | ₹23,500.00      | ₹12,500.00      | ₹9,900.00     | ₹35,500.00    |
| GROSS MARGIN ON NET SELLING PRICE    | 80.77%          | 80.00%          | 79.17%        | 81.82%        |
+--------------------------------------+-----------------+-----------------+---------------+---------------+
```

---

## 3. Margin Elasticity and Clearance Protection

### 3.1 Floor Price Matrix
Under no circumstances may any product be sold below its **Contribution Protection Floor Price**:
$$\text{Floor Price} = \text{TLC} + \text{Direct Fulfilment} + \text{Gateway Fee} + \text{Applicable GST}$$

For the Tailored Blazer:
- $\text{TLC} = ₹4,050.00$
- $\text{Packaging + Shipping} = ₹385.00$
- $\text{Minimum Gateway MDR (2\%)} = ₹120.00$
- $\text{Minimum Break-even Floor} = ₹4,555.00 + 12\% \text{ GST} = \mathbf{₹5,101.60}$

Any promotional code, private VIP discount, or corporate VIP pricing that breaches this threshold is automatically rejected by Medusa's pricing rule engine.

---
*End of Document `ATEEVRA-FIN-CALC-001`. Authorized for SKU Margin Engineering.*
