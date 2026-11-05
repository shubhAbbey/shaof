# ATEEVRA PHASE 0.5 — STATUTORY CMT VS. FOB TAX MODEL VERIFICATION: OD-007
**Document ID:** `ATEEVRA-OD-007-CMT-FOB-ITC-001`  
**Classification:** Statutory Indirect Tax Audit, HSN Tariff Analysis & Inward ITC Verification  
**Parent Document:** [`ATEEVRA-OD-007-BREAK-EVEN-AND-ITC-VERIFICATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-007-BREAK-EVEN-AND-ITC-VERIFICATION.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision & CA Professional Gate Sign-Off)`  
**Audit Date:** 2026-11-05  
**Auditor / Reviewer:** Principal Enterprise Architect & Indirect Tax Advisory Specialist  

---

## 1. Executive Summary & Verification Mandate

This document provides the definitive statutory and accounting verification of the two alternative manufacturing tax models evaluated under **OD-007**:
1. **Model 1: Job-Work / Cut-Make-Trim (CMT) Procurement Structure** — Generating **₹239.20 COGS ITC** (and ₹297.93 total supplier ITC including packaging and courier).
2. **Model 2: Full-Package Finished Garment (FOB) Invoicing** — Generating **₹486.00 COGS ITC** (and ₹544.73 total supplier ITC).

The mandate requires establishing component-level taxable values, statutory HSN classifications, official rate notifications, invoice documentation requirements, and separating statutory tariff facts from commercial pricing estimates.

---

## 2. Component-Wise Taxable Value & GST Calculation: CMT Model

In a Cut-Make-Trim (CMT) framework, ATEEVRA procures fabrics, interlinings, and trims directly from raw material mills and engages master tailoring ateliers as job-workers under Section 143 of the CGST Act, 2017.

### 2.1 Detailed Component Schedule (Landed COGS = ₹4,050.00 Net)

```
+===================================================================================================================================+
|                                    CMT JOB-WORK STATUTORY COMPONENT BREAKDOWN (BLAZER COGS)                                       |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| Input Component          | HSN /    | Net Taxable | GST Rate | Inward GST | Statutory Basis, Rate Notification                    |
| Description              | SAC Code | Value (₹)   | (%)      | Credit (₹) | & Prescribed Tax Invoice Documentation                |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **Super 120s Wool**      | **5111** | ₹1,850.00   | 5.0%     | ₹92.50     | Notification No. 1/2017-CT(R), Sched I, Entry 211.    |
| **Worsted Suiting Fabric**|         |             |          |            | Tax invoice from textile mill (Raymond/Osim).         |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **Silk & Horsehair**     | **5007** | ₹450.00     | 5.0%     | ₹22.50     | Notification No. 1/2017-CT(R), Sched I, Entry 202.    |
| **Floating Canvas**      |          |             |          |            | Woven fabrics of silk. Mill B2B Tax Invoice.          |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **Luxury Trims**         | **9606** | ₹250.00     | 18.0%    | ₹45.00     | Notification No. 1/2017-CT(R), Sched III, Entry 448.  |
| (Horn Buttons, Cupro)    | / **5408**|            |          |            | Horn buttons & synthetic lining. Vendor B2B Invoice.  |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **Master Atelier CMT**   | **9988** | ₹1,350.00   | 5.0%     | ₹67.50     | Notification No. 11/2017-CT(R), Entry 26(i)(b)        |
| **Job-Work Labor**       |          |             |          |            | (as amended). Job-work on textile products. B2B Inv.  |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **Factory Inbound Freight**| **9965**| ₹150.00    | 7.8%     | ₹11.70     | Blended courier (18%) and Goods Transport Agency (5%).|
| **& Handling to WH01**   |          |             | (Blended)|            | Consignment note / 3PL B2B invoice.                   |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **TOTAL MANUFACTURING**  | —        | **₹4,050.00**| **5.906%**| **₹239.20**| **Total Landed Manufacturing COGS ITC Asset**         |
+===================================================================================================================================+
```

### 2.2 Secondary Direct Operational Inputs (Packaging & Express Courier)
Beyond manufacturing COGS, direct variable customer fulfillment requires packaging and last-mile logistics:
1. **Luxury Rigid Gift Box & Ribbon:**
   - **HSN Code:** **4819** (*Cartons, boxes, cases, bags and other packing containers*).
   - **Taxable Value:** **₹186.44** | **GST Rate:** **18.0%** | **Inward GST:** **₹33.56** | **Gross Cash:** **₹220.00**.
   - *Statutory Basis:* Notification No. 1/2017-CT(R), Schedule III, Entry 122.
2. **Express Air Outbound Courier (Delivery to Customer):**
   - **SAC Code:** **9965** (*Courier services by express cargo airlines*).
   - **Taxable Value:** **₹139.83** | **GST Rate:** **18.0%** | **Inward GST:** **₹25.17** | **Gross Cash:** **₹165.00**.
   - *Statutory Basis:* Notification No. 11/2017-CT(R), Entry 18.

### 2.3 Synthesis of Total CMT Supplier ITC
$$\text{COGS ITC } (₹239.20) + \text{Packaging ITC } (₹33.56) + \text{Courier ITC } (₹25.17) = \mathbf{₹297.93}$$
*(Note: An additional ₹28.08 ITC is generated from 18% GST on the payment gateway MDR, bringing total available inward ITC to ₹326.01).*

---

## 3. Component-Wise Taxable Value & GST Calculation: FOB Model

Under OD-002 Option A (Certified Contract Atelier Full-Package FOB), the atelier procures all fabrics, canvas, trims, and labor internally, and bills ATEEVRA for a single finished garment unit.

### 3.1 Statutory FOB Invoicing Schedule

```
+===================================================================================================================================+
|                                    FULL-PACKAGE FOB STATUTORY INVOICING (BLAZER COGS)                                             |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| Invoiced Line Item       | HSN /    | Net Taxable | GST Rate | Inward GST | Statutory Basis, Rate Notification                    |
| Description              | SAC Code | Value (₹)   | (%)      | Credit (₹) | & Prescribed Tax Invoice Documentation                |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **Finished Tailored**    | **6203** | **₹4,050.00**| **12.0%**| **₹486.00**| Notification No. 1/2017-CT(R), Sched II, Entry 171A   |
| **Wool Men's Blazer**    |          |             |          |            | (Articles of apparel with sale value > ₹1,000).       |
|                          |          |             |          |            | Single Section 31 Tax Invoice from Master Atelier.    |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **Packaging & Courier**  | 4819 /   | ₹326.27     | 18.0%    | ₹58.73     | Box (₹33.56) + Express Air Courier (₹25.17).          |
|                          | 9965     |             |          |            | Standard supplier B2B invoices.                       |
+--------------------------+----------+-------------+----------+------------+-------------------------------------------------------+
| **TOTAL SUPPLIER INPUTS**| —        | **₹4,376.27**| —        | **₹544.73**| **Total Supplier Inward ITC Asset**                   |
+===================================================================================================================================+
```

### 3.2 Key Differences Between CMT and FOB Tax Treatments

| Tax Dimension | CMT Job-Work Model | Full-Package FOB Model |
| :--- | :--- | :--- |
| **Primary Statutory HSN** | Unbundled: 5111 (5%), 5007 (5%), 9606 (18%), 9988 (5%) | Single Finished Code: **6203 (12%)** |
| **Inward COGS ITC Asset** | **₹239.20 (Blended 5.906%)** | **₹486.00 (Flat 12.000%)** |
| **Total Supplier ITC** | **₹297.93** | **₹544.73** |
| **Gross Atelier Invoice** | ₹4,289.20 | ₹4,536.00 (+₹246.80 cash paid to atelier) |
| **Net GST Remitted to GOI** | **₹509.70** | **₹262.90** (-₹246.80 cash paid to government) |
| **Final Net Cash Retained** | **+₹232.02** | **+₹232.02 (100% Tax-Neutral)** |
| **Inverted Duty Structure?** | **NO:** Input blended (5.9%) < Output (12.0%). All ITC is consumed immediately against output GST. | **NO:** Input (12.0%) = Output (12.0%). Perfectly matched tax rate. |

---

## 4. Evidence Classification & Statutory Substantiation

All tax assumptions are classified under the canonical evidence taxonomy:

| Tax Parameter | Value / Treatment | Evidence Classification | Source Authority / Statutory Reference |
| :--- | :--- | :--- | :--- |
| **Wool Fabric GST Rate** | 5.0% | **VERIFIED STATUTORY RATE** | Notification No. 1/2017-CT(R), Sched I, Entry 211 (HSN 5111). |
| **Silk Fabric GST Rate** | 5.0% | **VERIFIED STATUTORY RATE** | Notification No. 1/2017-CT(R), Sched I, Entry 202 (HSN 5007). |
| **Buttons / Trims GST Rate**| 18.0% | **VERIFIED STATUTORY RATE** | Notification No. 1/2017-CT(R), Sched III, Entry 448 (HSN 9606). |
| **Job-Work Service GST Rate**| 5.0% | **VERIFIED STATUTORY RATE** | Notification No. 11/2017-CT(R), Entry 26(i)(b) as amended (SAC 9988). |
| **Finished Garment Rate** | 12.0% | **VERIFIED STATUTORY RATE** | Notification No. 1/2017-CT(R), Sched II, Entry 171A (HSN 6203). |
| **Output GST Rate (MRP)** | 12.0% | **VERIFIED STATUTORY RATE** | Applicable to luxury tailored blazers priced above ₹1,000. |
| **Component Base Costs** | Fabric ₹1,850, CMT ₹1,350 | **ESTIMATED MODEL ASSUMPTIONS** | Preliminary atelier discussions. Requires **Gate G-SUP** execution. |
| **Legally Binding Tax Opinion**| Unbundling legality | **PROFESSIONAL VALIDATION REQUIRED** | **Gate G-CA:** Formal sign-off by practicing Chartered Accountant. |

---

## 5. Summary Conclusion & CA Engagement Condition

Both the CMT and FOB models are statutory indirect tax pathways recognized under the CGST Act, 2017. Both pathways result in **identical economic contribution (+₹232.02) and identical net cash generation (+₹232.02)**. 

Prior to commercial execution in Phase 1, ATEEVRA must submit this document to external tax counsel under **Gate G-CA** to verify job-work delivery challan compliance under Section 143 and formalize GSTR-2B reconciliation procedures.
