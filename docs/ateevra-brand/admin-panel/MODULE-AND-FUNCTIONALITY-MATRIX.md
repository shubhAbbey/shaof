# ATEEVRA Admin Panel — Module & Functionality Matrix

**Document ID:** `ADM-ATEEVRA-MODULE-MATRIX-V1`  
**Classification:** `ADMINISTRATIVE CAPABILITY SPECIFICATION`  
**Parent Blueprint:** [`ADMIN-PANEL-MASTER-BLUEPRINT.md`](ADMIN-PANEL-MASTER-BLUEPRINT.md)  
**Effective Date:** 2026-11-05  

---

## 1. Complete Administrative Capability Matrix (34 Modules)

The table below delineates the 34 core modules comprising the ATEEVRA Admin Panel:

| Module Code | Module Name | Primary Business Purpose | Primary User Roles | Core Data Entities | Launch Priority | Backend API Endpoint |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **MOD-01** | **Product Master & SKU Generator** | Create and curate first-party garment styles; generate deterministic SKU codes. | Merchandiser, Super Admin | `product`, `product_category` | **P0** | `POST /admin/products` |
| **MOD-02** | **Variant Matrix (Size & Color)** | Manage garment size grids, colorways, barcode EANs, and weight specs. | Merchandiser | `product_variant` | **P0** | `POST /admin/products/:id/variants` |
| **MOD-03** | **Luxury Digital Asset Manager** | Upload ghost mannequin imagery, model 4K video clips, and detail shots. | Merchandiser, Creative Lead | `product_media` | **P0** | `POST /admin/uploads` |
| **MOD-04** | **Collection & Category Taxonomy** | Group products into seasonal collections (e.g. *AW26 Atelier*) and categories. | Merchandiser | `collection`, `category` | **P0** | `POST /admin/collections` |
| **MOD-05** | **Pricing & Landed Costing** | Configure MSRP, selling price, landed manufacturing cost, and markdown schedules. | Merchandiser, Finance | `price_list`, `product_cost` | **P0** | `POST /admin/price-lists` |
| **MOD-06** | **Size & Fit Specification Manager** | Maintain garment flat measurement charts (chest, waist, length) and fit notes. | Merchandiser, Tech Designer | `size_guide`, `garment_specs` | **P0** | `POST /admin/size-guides` |
| **MOD-07** | **Supplier & Manufacturer Directory** | Record external B2B apparel factories, mills, contact personnel, and terms. | Supply Chain Lead, Super Admin | `supplier_master` | **P1** | `GET/POST /admin/suppliers` |
| **MOD-08** | **Purchase Order (PO) Lifecycle** | Authorize manufacturing purchase orders, track production, and manage advances. | Supply Chain Lead, Finance | `purchase_order`, `po_item` | **P1** | `POST /admin/purchase-orders` |
| **MOD-09** | **Raw Material & Fabric Tracking** | Track bulk fabric yardage, mill dye lots, and trim inventories. | Supply Chain Lead | `raw_material_stock` | **P2** | `GET /admin/raw-materials` |
| **MOD-10** | **Inward Goods Receipt & AQL QC** | Inward incoming PO deliveries; record AQL 2.5 sample inspection checklists. | Warehouse QA, Warehouse Mgr | `inward_receipt`, `aql_inspection` | **P0** | `POST /admin/inward/inspect` |
| **MOD-11** | **Manufacturing Defect Claim Logging** | Document factory defects, upload photographic evidence, and issue debit notes. | Warehouse QA, Finance | `supplier_defect_claim` | **P1** | `POST /admin/suppliers/claims` |
| **MOD-12** | **Warehouse Bin & Rack Management** | Map physical storage racks, shelves, and pick bins in central warehouse. | Warehouse Operator, Mgr | `stock_location`, `warehouse_bin` | **P0** | `POST /admin/warehouse/bins` |
| **MOD-13** | **Real-Time ATS Stock Telemetry** | Track Available-to-Sell (ATS), reserved, and safety stock units in real time. | Warehouse Mgr, Merchandiser | `inventory_item`, `inventory_level` | **P0** | `GET /admin/inventory` |
| **MOD-14** | **Safety Stock & Reorder Alerts** | Automated alerts when variant stock breaches minimum safety thresholds. | Merchandiser, Supply Chain | `reorder_rule`, `stock_alert` | **P1** | `GET /admin/inventory/alerts` |
| **MOD-15** | **Stock Transfer & Quarantine Holds** | Quarantine damaged or inspection-failed items away from sellable inventory. | Warehouse QA | `inventory_reservation` | **P0** | `POST /admin/inventory/quarantine` |
| **MOD-16** | **Physical Stock Audit & Counting** | Execute periodic cycle counts and reconcile physical vs system stock deltas. | Warehouse Mgr, Finance | `cycle_count_audit` | **P2** | `POST /admin/inventory/audit` |
| **MOD-17** | **Order Orchestration & Processing** | Central view of all customer orders; hold, confirm, or split order batches. | Operations, Concierge | `order`, `order_item` | **P0** | `GET /admin/orders` |
| **MOD-18** | **Pick-List & Batch Wave Packing** | Generate consolidated warehouse pick lists for wave picking. | Warehouse Operator | `fulfillment_batch` | **P0** | `POST /admin/fulfillment/wave` |
| **MOD-19** | **Luxury Packaging Inspection** | Barcode scan verification that garment is steamed, tissue wrapped, and boxed. | Warehouse Operator | `packaging_verification` | **P0** | `POST /admin/fulfillment/pack` |
| **MOD-20** | **3PL Manifest & Thermal Label Printing** | Automated API call to courier (Delhivery); generate shipping AWB labels. | Warehouse Operator | `shipping_label`, `manifest` | **P0** | `POST /admin/fulfillment/manifest` |
| **MOD-21** | **Outward Tracking & Delivery Exceptions** | Real-time courier webhook dashboard; track in-transit, out-for-delivery, and NDRs. | Operations, Concierge | `shipment_tracking` | **P0** | `GET /admin/shipments/tracking` |
| **MOD-22** | **Unified Customer Master Profile** | View customer purchase history, lifetime value (LTV), size preference, and VIP tier. | Concierge, Merchandiser | `customer`, `customer_profile` | **P0** | `GET /admin/customers/:id` |
| **MOD-23** | **Concierge Return Authorization** | Review and approve customer return and exchange requests within 7-day window. | Concierge Agent | `order_return_request` | **P0** | `POST /admin/returns/authorize` |
| **MOD-24** | **Inward Return Warehouse QC** | Physically inspect returned garments (tags intact, unworn); authorize restock. | Warehouse QA | `return_inspection_record` | **P0** | `POST /admin/returns/inspect` |
| **MOD-25** | **Direct Customer Refund Dispatch** | Authorize automated Razorpay API refund back to original customer payment source. | Finance Controller, Concierge | `payment_refund` | **P0** | `POST /admin/refunds/execute` |
| **MOD-26** | **Customer Support Inquiries & WhatsApp** | Manage customer chat, email tickets, and order modifications. | Concierge Agent | `support_ticket` | **P1** | `GET /admin/support/inquiries` |
| **MOD-27** | **Razorpay Settlement Reconciliation** | Reconcile daily payment gateway captures, MDR processing fees, and bank wires. | Finance Controller | `gateway_reconciliation` | **P0** | `GET /admin/finance/gateway` |
| **MOD-28** | **B2C GST Invoicing & Credit Notes** | Generate and export statutory tax invoices and credit notes under CGST Act. | Finance Controller | `gst_invoice_record` | **P0** | `GET /admin/finance/invoices` |
| **MOD-29** | **Landed Margin & Unit Economics** | Real-time reporting of gross margin, contribution margin, and marketing CAC. | Finance Controller, Exec | `financial_report` | **P1** | `GET /admin/reports/margins` |
| **MOD-30** | **Strapi CMS Content Sync** | Trigger live preview and publishing of Strapi v5 editorial pages and banners. | Content Editor | `cms_publishing_job` | **P0** | `POST /admin/cms/sync` |
| **MOD-31** | **Staff Directory & RBAC Roles** | Invite internal employees, assign operational roles, and manage permissions. | Super Admin | `staff_user`, `admin_role` | **P0** | `GET/POST /admin/staff` |
| **MOD-32** | **Security & Session Governance** | Monitor active staff sessions, manage TOTP resets, and revoke access tokens. | Super Admin | `staff_session` | **P0** | `GET /admin/security/sessions` |
| **MOD-33** | **Immutable Administrative Audit Log** | Tamper-evident ledger of all admin mutations, logins, price changes, and refunds. | Super Admin, Compliance | `admin_audit_log` | **P0** | `GET /admin/audit-logs` |
| **MOD-34** | **Storefront Feature Flags & Config** | Toggle promotional banners, flash sale counters, COD availability, and maintenance. | Super Admin, Operations | `store_configuration` | **P0** | `GET/POST /admin/config` |

---

## 2. Launch Prioritization Summary
- **P0 Modules (Launch-Critical — 26 Modules):** Core product master, variants, media, pricing, sizing, inward QC, bin inventory, ATS telemetry, quarantine, order processing, pick-pack wave, packaging check, thermal label print, shipment tracking, customer master, return authorization, return QC, refund execution, gateway reconciliation, GST invoicing, Strapi sync, staff RBAC, TOTP security, audit logs, and storefront config.
- **P1 Modules (Operational Rigor — 6 Modules):** Supplier directory, purchase orders, defect claims, safety stock alerts, support inquiries, landed margin reporting.
- **P2 Modules (Advanced Optimization — 2 Modules):** Raw material yardage tracking, physical cycle count audits.
