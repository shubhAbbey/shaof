# ATEEVRA — First-Party Statutory, Regulatory & Compliance Reference

**Document ID:** `ATEEVRA-RES-REG-001`  
**Classification:** Regulatory & Legal Compliance Compendium  
**Status:** COMPLIANCE BASELINE  
**Version:** 1.0.0  

---

## 1. Executive Summary & Legal Classification

As a direct-to-consumer (D2C) first-party luxury fashion brand, ATEEVRA operates as the sole **Seller of Record (SOR)** for every transaction executed on its digital platforms. This establishes direct statutory and fiscal accountability between ATEEVRA and the purchasing consumer, distinct from multi-vendor e-commerce marketplaces regulated under marketplace intermediary frameworks.

---

## 2. Statutory Regulatory Framework Matrix

```
+-----------------------------------------------------------------------------------+
|                        ATEEVRA STATUTORY COMPLIANCE REGIME                        |
|                                                                                   |
|  [ CONSUMER PROTECTION ]              [ LEGAL METROLOGY ]                         |
|  - Consumer Protection Act, 2019      - Legal Metrology Act, 2009                 |
|  - Consumer Protection (E-Commerce)   - Legal Metrology (Packaged Commodities)    |
|    Rules, 2020 (Direct Seller Stds)     Rules, 2011 (2021 E-Com Amendments)       |
|                                                                                   |
|  [ TAXATION & FISCAL ]                [ DATA PRIVACY & CYBERSECURITY ]            |
|  - CGST / SGST / IGST Acts, 2017      - Digital Personal Data Protection Act 2023 |
|  - Section 31 (Tax Invoices)          - Information Technology Act, 2000          |
|  - Chapter 61, 62, 42 HSN Codes       - CERT-In Directions on Security Incident   |
+-----------------------------------------------------------------------------------+
```

---

## 3. Legal Metrology (Packaged Commodities) Rules, 2011

Under Rule 6(10) of the *Legal Metrology (Packaged Commodities) Amendment Rules, 2021*, e-commerce entities selling packaged commodities must display statutory declarations prominently on the digital product display page (PDP):

### 3.1 Mandatory PDP Declarations Matrix

| Statutory Field | Display Format / Standard | Monorepo Schema Field |
| :--- | :--- | :--- |
| **Name & Address of Manufacturer / Packer** | Complete registered address of manufacturing atelier or ATEEVRA packaging hub | `product.metadata.manufacturer_details` |
| **Country of Origin** | Unambiguous ISO country name (e.g., "India", "Italy", "Portugal") | `product.origin_country` |
| **Common / Generic Name** | E.g., "Men's Tailored Wool Overcoat", "Women's Mulberry Silk Blouse" | `product.title` |
| **Net Quantity** | Standard metric quantity (e.g., "1 N (1 Piece)", "1 Pair") | `product.metadata.net_quantity` |
| **Dimensions / Size** | Standard Indian metric size specification (Chest: 102 cm, Length: 76 cm) | `product_variant.metadata.dimensions` |
| **Month & Year of Manufacture / Packing** | Format: `MM / YYYY` (e.g., "10 / 2026") | `product.metadata.mfg_date` |
| **Maximum Retail Price (MRP)** | Inclusive of all taxes: `₹XX,XXX.00 (Incl. of all taxes)` | `product_variant.prices` (Formatted MRP) |
| **Consumer Care Contact** | Name, Designation, Address, Phone & Email of Greivance Officer | `storefront.footer` & PDP Accordion |

---

## 4. Consumer Protection (E-Commerce) Rules, 2020

### 4.1 Direct Seller Obligations (Rule 6 & Rule 7)
1. **Accurate Representation:** Visuals and descriptions must reflect the true specifications, fabric blend, and finish of the garment without misleading enhancements.
2. **Transparent Terms of Contract:** Clear display of return windows (7 days), warranty/guarantee terms, delivery fees, and refund turnaround times prior to order confirmation.
3. **Grievance Redressal Mechanism:**
   - **Grievance Officer Appointment:** A named corporate officer resident in India.
   - **Acknowledgment SLA:** Automated ticketing acknowledgment within 48 hours of receipt.
   - **Resolution SLA:** Mandatory redressed resolution within one month of receipt.
   - **Published Details:** Publicly listed on storefront footer, contact page, and order confirmation email.

---

## 5. Direct Taxation & Goods and Services Tax (GST)

### 5.1 First-Party Seller of Record Invoicing
- **Section 31 of CGST Act, 2017:** ATEEVRA issues a direct B2C or B2B Tax Invoice to the customer.
- **Section 52 TCS Inapplicability:** Tax Collected at Source (TCS) under Section 52 applies *strictly* to electronic commerce operators facilitating sales on behalf of *other suppliers*. Because ATEEVRA sells its own owned inventory, Section 52 TCS does NOT apply.
- **Section 194-O TDS Inapplicability:** Income Tax TDS under Section 194-O applies to marketplace facilitators paying third-party e-commerce participants. First-party sales are direct revenue, governed by standard corporate income tax (Section 115BAA).

### 5.2 Applicable HSN Codes and GST Rates

| HSN Chapter | Commodity Description | Transaction Value Bound | Applicable GST Rate |
| :--- | :--- | :--- | :--- |
| **Chapter 61** | Articles of apparel and clothing accessories, knitted or crocheted | Any Value (> ₹1,000 standard luxury) | **12% GST** (6% CGST + 6% SGST or 12% IGST) |
| **Chapter 62** | Articles of apparel and clothing accessories, not knitted or crocheted (Woven) | Any Value (> ₹1,000 standard luxury) | **12% GST** (6% CGST + 6% SGST or 12% IGST) |
| **Chapter 42** | Articles of leather, handbags, wallets, travel goods | Any Value | **18% GST** (9% CGST + 9% SGST or 18% IGST) |
| **Chapter 71** | Precious metal jewelry, cufflinks, silver accessories | Any Value | **3% GST** (1.5% CGST + 1.5% SGST or 3% IGST) |

---

## 6. Digital Personal Data Protection Act, 2023 (DPDP Act)

ATEEVRA acts as a **Data Fiduciary** regarding all client personal, biometric, and financial records.

### 6.1 Data Governance Directives
1. **Notice & Consent:** Itemized, clear, and plain language consent banner for data processing (contact details, address, fit preferences) with option to withdraw consent.
2. **Purpose Limitation:** Customer phone numbers and addresses are utilized *solely* for order fulfillment, logistics tracking, and requested concierge styling. They are never sold or rented to third-party ad networks.
3. **Right of Correction & Erasure:** Clients may request full erasure of their personal style profile and marketing consent via the Admin Concierge interface.
4. **Data Retention Limits:** Shipping addresses retained for 7 years strictly to satisfy tax audit (GST invoice records); marketing profiles erased within 30 days upon client account closure request.

---

## 7. Textile Quality & Fabric Testing Standards

ATEEVRA requires all contract ateliers and material mills to submit accredited laboratory test reports (SGS, Intertek, or Bureau Veritas) certifying compliance with international textile standards:

- **Color Fastness to Washing:** ISO 105-C06 (Grade 4.0 Minimum).
- **Color Fastness to Light:** ISO 105-B02 (Grade 4.0 Minimum).
- **Dimensional Stability (Shrinkage):** ISO 6330 / ISO 5077 ($\le \pm 2.0\%$ after 3 cycles).
- **Pilling Resistance:** ISO 12945-2 Martindale Method (Grade 4.0 Minimum after 2,000 rubs).
- **Tensile & Tear Strength:** ASTM D5034 / ASTM D1424 for woven luxury fabrics.
- **Zero Harmful Chemicals:** OEKO-TEX Standard 100 Class I compliance (free of azo dyes, formaldehyde, heavy metals, and alkylphenol ethoxylates).

---
*End of Document `ATEEVRA-RES-REG-001`. Authorized for Regulatory Compliance Infrastructure.*
