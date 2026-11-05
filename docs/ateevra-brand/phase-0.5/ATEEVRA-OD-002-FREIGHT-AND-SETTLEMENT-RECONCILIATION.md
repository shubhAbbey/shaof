# ATEEVRA PHASE 0.5 — FREIGHT AND SETTLEMENT RECONCILIATION: OD-002
**Document ID:** `ATEEVRA-OD-002-FSR-003`  
**Classification:** Logistics Disaggregation, Warehouse Allocation & Payment Gateway Settlement Schedule  
**Parent Document:** [`ATEEVRA-OD-002-FINAL-CAPITAL-RECONCILIATION.md`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/docs/ateevra-brand/phase-0.5/ATEEVRA-OD-002-FINAL-CAPITAL-RECONCILIATION.md)  
**Governance State:** `PROPOSED (Pending Explicit Owner Decision & Sourcing Quote Verification)`  
**Audit Date:** 2026-11-05  
**Auditor / Preparer:** Principal Enterprise Architect, Luxury Supply Chain Modeler & Sourcing Specialist  

---

## 1. Executive Summary & Audit Mandate

This reconciliation document resolves two critical operational and financial inquiries under **OD-002**:
1. **The Inbound Freight vs. Marine Cargo Insurance Disambiguation:** Resolving the historical shift between the ₹25,000 inbound freight label and the ₹25,000 marine cargo insurance policy, proving zero double-counting across the BOM landed cost and pre-revenue funding tables.
2. **Definitive Payment Settlement Schedule:** Deconstructing the **₹55,01,525.80 net bank deposit** against **₹56,34,500.00 Gross GMV**, establishing the exact effective deduction rate (2.36%), and modeling payment instrument variance, gateway rolling reserves, and chargeback provisions.

---

## 2. Inbound Freight vs. Marine Cargo Insurance Disambiguation

### 2.1 The Problem Audited
In early draft documents, a line item of **₹25,000** was variously described as "Inbound Freight" and "Inbound Transit Cargo Insurance". The Project Owner directed an audit to determine whether inbound freight was being double-counted.

### 2.2 Empirical Audit Finding: Inbound Freight is Capitalized in Unit Landed COGS
An audit of the unit bills of materials (BOM) in Section 8.2 of `ATEEVRA-OD-002-OWNER-DELIBERATION-DOSSIER.md` confirms that **inbound freight from manufacturing ateliers to warehouse WH01 is already capitalized inside the unit Landed COGS**:
- 150 Tailored Blazers @ ₹150.00 inbound freight = **₹22,500.00**
- 150 Mulberry Silk Shirts @ ₹90.00 inbound freight = **₹13,500.00**
- 100 Wool Trousers @ ₹80.00 inbound freight = **₹8,000.00**
- 100 Cashmere Knits @ ₹150.00 inbound freight = **₹15,000.00**
- **Total Inbound Freight Embedded in COGS:** **₹59,000.00** (Included in the ₹16.01L batch cost).

### 2.3 What Then is the Standalone ₹25,000 Line Item?
The standalone **₹25,000.00** line item in the pre-revenue working capital table is the **Annual Inbound Transit Marine Cargo Insurance Policy** (ICICI Lombard / Tata AIG all-risk Institute Cargo Clauses A):
- **Function:** Covers high-value textile rolls, silk bolts, cashmere yarns, and finished garments during transit against highway accidents, hijacking, water damage, and transit fire.
- **Why Separate from COGS?** It is a fixed annual corporate risk policy, not a per-carton courier tariff.
- **Tax Treatment:** Billed under HSN 997133 with 18.0% GST ($₹21,186.44 \text{ Net} + ₹3,813.56 \text{ GST} = \mathbf{₹25,000.00}$). The ₹3,813.56 is 100% claimable as ITC in GSTR-2B.
- **Proof of Zero Double-Counting:** Inbound transport freight (₹59,000) is paid to transport carriers and capitalized in inventory; transit insurance (₹25,000) is paid to an underwriter. There is zero double-counting.

---

## 3. Disaggregation of Logistics, Customs, Handling and Warehouse Allocations

```
+===================================================================================================================================+
|                                    TOTAL LOGISTICS & WAREHOUSING COST ARCHITECTURE                                                |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| Cost Category      | Amount (INR)     | Cost Nature         | Allocation Method | Statutory Tax Treatment                         |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Inbound Transit**| ₹59,000.00       | Capitalized in      | Unit BOM          | 5.0% Goods Transport Agency (GTA) reverse charge|
| **Freight to WH01**| (Across 500 units| Inventory Asset     | (₹80–₹150 / SKU)  | or 18% courier consignment note. Claimable ITC. |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Marine Cargo**   | ₹25,000.00       | Fixed Corporate     | Annual Risk       | 18.0% GST under HSN 997133; claimable in full   |
| **Insurance**      | (Annual Policy)  | Balance Sheet Asset | Overhead          | against output sales tax liabilities.           |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Outbound Express**| ₹74,250.00      | Variable Selling    | Per Unit Shipped  | 18.0% GST under HSN 9965 (₹139.83 net + ₹25.17  |
| **Courier Air**    | (450 Units Sold) | OpEx                | (₹165.00 gross)   | GST). Claimable ITC under Section 16.           |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **Customs Clearing**| Embedded in     | Capitalized in      | Unit Fabric BOM   | Basic Customs Duty (BCD) + 12% IGST paid at air |
| **& Port Handling**| Import Fabrics   | Raw Materials       | (Como/Biella silk)| cargo port (Bengaluru Airport Air Cargo).       |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **WH01 Facility**  | ₹1,75,000.00     | Fixed Facility      | Pre-Revenue       | 18.0% GST on commercial real estate lease.      |
| **Lease & Setup**  | (Month 1 + Setup)| Operating Overhead  | Operating OpEx    | Full ITC claimable against output tax.          |
+--------------------+------------------+---------------------+-------------------+-------------------------------------------------+
| **WH01 Lease**     | ₹5,25,000.00     | Refundable Security | Capital Pool      | Non-taxable commercial deposit; returned at lease|
| **Security Deposit**| (3 Months Rent) | Deposit (Asset)     | Contingency Buffer| expiry. Funded from ₹10.0L contingency buffer.  |
+===================================================================================================================================+
```

### 3.1 Warehouse WH01 Facility Allocation Clarified
- The **₹1,75,000.00** line item represents **Month 1 facility rent (₹1,25,000) + climate control & LED fitout amortization (₹50,000)** for the 3,500 sq ft facility in Bengaluru.
- The **3-Month Refundable Security Deposit (₹5,25,000.00)** is an asset, not an expense. It is funded directly out of the **₹10.00 Lakh Cash Contingency Buffer** under OD-027.

---

## 4. Corrected Pre-Revenue Funding Model and Cash Timeline

```
+===================================================================================================================================+
|                                    CORRECTED PEAK PRE-REVENUE FUNDING SCHEDULE                                                    |
+----+------------------------------------+------------------+------------------------------------+--------------------------------+
| #  | Expenditure Category               | Cash Amount (₹)  | Precise Inward Tax Basis           | Verification Gate Trigger      |
+----+------------------------------------+------------------+------------------------------------+--------------------------------+
| 1  | Atelier Production POs (500 Units) | ₹17,93,120.00    | 12.0% GST (₹1,92,120.00 ITC Asset) | Milestone 1/2/3 via Gate G-SUP |
| 2  | Luxury Rigid Boxes & Ribbon (500)  | ₹1,29,800.00     | 18.0% GST (₹19,800.00 ITC Asset)   | Packaging QC via Gate G-SUP    |
| 3  | Transit Marine Cargo Insurance     | ₹25,000.00       | 18.0% GST (₹3,813.56 ITC Asset)    | Insurance binder via Gate G-LO |
| 4  | Pre-Launch Digital Creative & CAC  | ₹4,50,000.00     | 18.0% GST (Meta/Google Ad Invoice) | Lookbook freeze via Gate G-LG  |
| 5  | WH01 Month 1 Facility Rent & Ops   | ₹1,75,000.00     | 18.0% GST on Commercial Lease      | Facility LOI via Gate G-SUP    |
| 6  | Statutory Legal & Metrology Setup  | ₹75,000.00       | 18.0% GST on Professional Retainer | Corporate legal via Gate G-LG  |
+----+------------------------------------+------------------+------------------------------------+--------------------------------+
|    | **TOTAL PEAK CASH DEPLOYED**       | **₹26,47,920.00**| **Total Inward ITC: ₹2,90,750.00** | **Pre-Revenue Operating Cash** |
|    | **Rounded Planning Metric**        | **₹26.50 Lakhs** | (Trapped until customer sales)     |                                |
+----+------------------------------------+------------------+------------------------------------+--------------------------------+
| 7  | WH01 Lease Security Deposit (Asset)| ₹5,25,000.00     | Refundable Deposit (Zero GST)      | Lease agreement via Gate G-SUP |
| 8  | Unallocated Emergency Cash Reserve | ₹4,75,000.00     | Liquid Bank Cash Buffer            | Liquidity reserve via Gate G-CA|
+----+------------------------------------+------------------+------------------------------------+--------------------------------+
|    | **TOTAL AUTHORIZED CAPITAL POOL**  | **₹36,47,920.00**| **(~₹36.50 Lakhs Total Capital)**  | **Governed Under OD-027**      |
+===================================================================================================================================+
```

---

## 5. Payment Gateway Settlement Reconciliation & Instrument Variance

### 5.1 Reconciling Gross GMV to Net Bank Deposits
- **Exact SKU Gross GMV (450 units sold):** **₹56,34,500.00** (or ~₹57.16L under aggregate approximations).
- **Payment Gateway Base MDR (2.0% on Gross):**
  $$\text{Base MDR} = 0.02 \times ₹56,34,500.00 = \mathbf{₹1,12,690.00}$$
- **Statutory GST on Banking Service (18% on MDR):**
  $$\text{GST on MDR} = 0.18 \times ₹1,12,690.00 = \mathbf{₹20,284.20}$$
- **Total Deduction from Customer Gross Collections:**
  $$\text{Total Bank Cut} = ₹1,12,690.00 + ₹20,284.20 = \mathbf{₹1,32,974.20}$$
- **Implied Effective Deduction Rate:**
  $$\text{Effective Rate} = \frac{₹1,32,974.20}{₹56,34,500.00} = \mathbf{2.3600\%}$$
- **Actual Net Cash Deposited in Bank Account:**
  $$\mathbf{Net\ Bank\ Deposit = ₹56,34,500.00 - ₹1,32,974.20 = ₹55,01,525.80}$$

---

### 5.2 Payment Instrument Sensitivity Schedule

In commercial payment processing, transaction fees vary significantly by payment method. The 2.0% figure represents a weighted blended average:

```
+===================================================================================================================================+
|                                    PAYMENT METHOD SENSITIVITY & SETTLEMENT MATRIX                                                 |
+--------------------+------------+---------------+----------+------------+--------------------+------------------------------------+
| Payment Instrument | % Volume   | Gross GMV     | Base MDR | Total Cut  | Total Deduction (₹)| Commercial Settlement Reality      |
| Type               | Share      | Processed (₹) | Fee Rate | (Incl 18%) | (MDR + GST)        | & Cash Flow Timing                 |
+--------------------+------------+---------------+----------+------------+--------------------+------------------------------------+
| **UPI (Standard)** | 25.0%      | ₹14,08,625.00 | 0.00%    | 0.00%      | ₹0.00              | T+1 Settlement; statutory 0% MDR.  |
| **Debit (RuPay)**  | 5.0%       | ₹2,81,725.00  | 0.00%    | 0.00%      | ₹0.00              | T+1 Settlement; statutory 0% MDR.  |
| **Debit (Visa/MC)**| 10.0%      | ₹5,63,450.00  | 0.90%    | 1.062%     | ₹5,983.84          | T+1 Settlement; regulated cap.     |
| **Domestic Credit**| 40.0%      | ₹22,53,800.00 | 1.85%    | 2.183%     | ₹49,200.45         | T+2 Settlement; Visa/Mastercard.   |
| **Amex / Premium** | 15.0%      | ₹8,45,175.00  | 3.00%    | 3.540%     | ₹29,919.20         | T+3 Settlement; high-net-worth VIP.|
| **Net Banking**    | 5.0%       | ₹2,81,725.00  | 1.50%    | 1.770%     | ₹4,986.53          | T+1 Settlement; HDFC/ICICI portals.|
+--------------------+------------+---------------+----------+------------+--------------------+------------------------------------+
| **REALISTIC TOTAL**| **100.0%** | **₹56,34,500**| **1.40%**| **1.654%** | **₹90,090.02**     | **Actual Blended Bank Cut is LOWER |
| **BLENDED BASKET** |            |               | **(Avg)**| **(Avg)**  |                    | than the 2.36% planning model!**   |
+===================================================================================================================================+
```
- **Favorable Financial Variance:** Because 30% of transaction volume in India processes via zero-MDR rails (UPI and RuPay), the **actual blended deduction is only ~₹90,090.00 (1.65%)**, rather than ₹1,32,974.20 (2.36%). 
- The conservative planning baseline of **2.36% provides a ₹42,884.00 positive liquidity cushion**.

---

### 5.3 Gateway Settlement Deductions: Rolling Reserves & Refunds

Payment aggregators (Razorpay / PayU / Cashfree) impose specific underwriting holdbacks on newly registered luxury merchants:
1. **Rolling Security Reserve:** New e-commerce merchants with ticket sizes $> ₹10,000$ are typically subject to a **5.0% rolling reserve for 90 days** to protect against fraud and chargebacks:
   $$\text{Rolling Reserve Held} = 0.05 \times ₹56,34,500.00 = \mathbf{₹2,81,725.00}$$
   This ₹2.82 Lakhs is returned to ATEEVRA at Day 90–120 upon satisfactory delivery confirmation.
2. **Refund Deductions:** When a customer return occurs, the gateway reverses the transaction consideration to the buyer. While the gross amount is refunded, **payment aggregators do NOT refund the MDR fee** to the merchant. The non-refundable MDR on returned orders is absorbed directly by the **Customer Return & Repair Reserve (₹150.00/unit)** under OD-010.

---

## 6. Document Supersession & Governance State

- **Supersedes:** The informal logistics labels and approximate net bank collection figures in `ATEEVRA-OD-002-FINAL-CAPITAL-RECONCILIATION.md`.
- **Authoritative Metrics:** 
  - Peak pre-revenue cash requirement: **₹26,47,920.00**
  - Total recommended capital pool: **₹36,47,920.00**
  - Net bank deposits: **₹55,01,525.80** (under conservative 2.36% planning model).
- **Governance Invariant:** `OD-002 REMAINS STRICTLY PROPOSED`. Sourcing purchase orders cannot be issued until the Project Owner explicitly selects an option and external professional validation gates (G-QA and G-SUP) clear.
