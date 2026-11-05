# ATEEVRA Admin Panel — Administrative Workflows Blueprint

**Document ID:** `ADM-ATEEVRA-WORKFLOWS-V1`  
**Classification:** `OPERATIONAL WORKFLOW SPECIFICATION`  
**Parent Blueprint:** [`ADMIN-PANEL-MASTER-BLUEPRINT.md`](ADMIN-PANEL-MASTER-BLUEPRINT.md)  
**Effective Date:** 2026-11-05  

---

## 1. Product Merchandising & Publishing Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Merch as Brand Merchandiser
    participant AdminUI as Admin Panel (/admin/products)
    participant Medusa as Medusa Backend Engine
    actor Creative as Creative Lead
    participant Strapi as Strapi v5 Headless CMS
    participant Storefront as Next.js Storefront

    Merch->>AdminUI: Create Product Style (Title, Description, Fit)
    AdminUI->>Medusa: POST /admin/products
    Merch->>AdminUI: Generate Size Grid (S, M, L, XL) & Barcodes
    AdminUI->>Medusa: POST /admin/products/:id/variants
    Merch->>AdminUI: Set MSRP (₹4,999) & Landed Cost (₹1,500)
    AdminUI->>Medusa: POST /admin/price-lists
    Creative->>Strapi: Upload 4K Runway Video & Curated Lookbook Story
    Creative->>AdminUI: Link Strapi Lookbook ID to Medusa Product
    Merch->>AdminUI: Click "Publish to Digital Flagship"
    AdminUI->>Medusa: Update published_at = NOW()
    Medusa->>Storefront: Invalidate Next.js ISR Tag ('products')
    Storefront-->>Merch: Live on ateevra.com within 500ms
```

---

## 2. Procurement, Inward Goods & AQL 2.5 Inspection Workflow

```mermaid
flowchart TD
    A["PO Issued to Factory (e.g. 500 Units Linen Shirt)"] --> B["Factory Ships Finished Batch to Central Hub"]
    B --> C["Warehouse Scans PO Barcode at Receiving Bay"]
    C --> D["Carton Count & Outer Seal Verification"]
    D --> E["Quality Lead Pulls 50 Random Samples (AQL 2.5 Normal Level II)"]
    E --> F{"Inspect: Measurements, Seams, Buttons, Color Shading"}
    F -- "PASS: <= 3 Minor Defects Found" --> G["Authorize Inward Receipt in Admin (Mod-10)"]
    G --> H["Garments Steam-Pressed & Barcode Security Tags Applied"]
    H --> I["Stock Assigned to Warehouse Bins (e.g., Rack A-04-B)"]
    I --> J["ATS Inventory Automatically Incremented in Medusa"]
    F -- "FAIL: >= 4 Defects or Any Critical Flaw" --> K["Reject Batch; Move to Quarantine Bin (Mod-15)"]
    K --> L["Finance Issues Formal Debit Note & Rejection Notice to Factory"]
```

---

## 3. Wave Picking, Luxury Packing & Courier Handover Workflow

```mermaid
flowchart TD
    A["Customer Orders Placed (Captured & Paid)"] --> B["System Groups Orders into Wave Pick Batches (Mod-18)"]
    B --> C["Warehouse Operator Receives Optimized Bin Routing on Tablet"]
    C --> D["Pick Garments from Bins & Scan Barcode Verification"]
    D --> E["Garment Transfer to Luxury Packing Station"]
    E --> F["Pre-Pack Inspection: Check Fabric Surface, Snags & Cleanliness"]
    F --> G["Garment Steam-Finished to Eradicate Transit Creases"]
    G --> H["Fold around Archival Card; Wrap in Custom Tissue with Wax Seal"]
    H --> I["Insert in Matte Charcoal Rigid Gift Box with Thank-You Card"]
    I --> J["Place Box in Kraft Corrugated Shipper & Seal with Tamper Tape"]
    J --> K["Print Delhivery / Bluedart Thermal Label (Mod-20)"]
    K --> L["Carrier Arrives; Handover Manifest Signed Electronically"]
    L --> M["Status Transitions to DISPATCHED; WhatsApp Tracking Sent to Customer"]
```

---

## 4. Concierge Returns, Warehouse QC & Instant Refund Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Retail Customer
    participant StoreUI as Customer Account (/account/orders)
    actor Concierge as Customer Concierge
    actor Courier as 3PL Express Courier
    actor QC as Warehouse QA Inspector
    participant AdminUI as Admin Console (/admin/returns)
    participant Medusa as Medusa Backend Engine
    participant Gateway as Razorpay Payment Gateway

    Customer->>StoreUI: Submit Return Request within 7 Days (Select Reason)
    StoreUI->>Medusa: POST /store/returns
    Concierge->>AdminUI: Review Request; Confirm Not Hygiene-Excluded
    Concierge->>AdminUI: Click "Approve & Book Reverse Courier"
    AdminUI->>Medusa: Trigger 3PL Reverse Pickup API (Delhivery)
    Courier->>Customer: Doorstep Package Pickup
    Courier->>QC: Deliver Return Box to Central Hub
    QC->>AdminUI: Scan Return Tracking Barcode (Mod-24)
    QC->>QC: Inspect: Security Tag Intact? Unworn? Unwashed? No Odors?
    alt Inspection PASSED
        QC->>AdminUI: Mark Return "QC_APPROVED_FOR_RESTOCK"
        AdminUI->>Medusa: Restock Garment to Warehouse Active Bin
        Medusa->>Gateway: POST /v1/payments/:id/refund (100% Amount)
        Gateway-->>Medusa: HTTP 200 Refund Success
        Medusa->>Medusa: Generate B2C GST Credit Note (Section 34 CGST Act)
        Medusa-->>Customer: WhatsApp Confirmation: "Refund of ₹X,XXX Dispatched"
    else Inspection FAILED
        QC->>AdminUI: Mark Return "QC_REJECTED" & Upload Photos
        AdminUI->>Concierge: Notification: Return Rejected for Damage/Tag Cut
        Concierge->>Customer: Contact via VIP Concierge; Garment Returned to Buyer
    end
```
