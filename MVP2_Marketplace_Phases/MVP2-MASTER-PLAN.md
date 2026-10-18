# MVP-2 Master Plan — Marketplace, Super Admin and Merchant Portal

## Goal
Extend the existing India-first e-commerce MVP into a multi-merchant marketplace with separate Super Admin and Merchant experiences, strong tenant isolation, full role-scoped catalog operations, moderation, merchant-aware inventory/orders/fulfillment/returns/refunds/exchanges, and truthful financial reporting—without rewriting accepted MVP-1 features.

## Explicit product CRUD requirement
YES. Full product create/read/list/search/update/delete-or-archive is included for both Merchant and Super Admin. Merchant actions are scoped to that merchant's own products. Super Admin can operate across merchants, but must select a target merchant when creating a merchant-owned product and must see/verify that merchant association for read/update/delete/archive. Persist and enforce the mapping server-side for products and related variants, SKUs, media, pricing, inventory, moderation and audit. No accidental unassigned product. Ownership transfer, if needed, is a separate audited workflow.

## MVP-2 includes
Repository reconciliation; ownership architecture; separate customer/admin/merchant identities; merchant records and memberships; RBAC and tenant boundaries; Super Admin and merchant login/onboarding; roles and approvals; product CRUD and moderation; inventory/locations; merchant-aware orders and fulfillment; existing payments/COD/refunds/returns/exchanges; CMS; customer support; dashboards/reporting; settings/search/notifications; audit/security; integration/E2E/performance tests; release runbook.

## Deferred to MVP-3
Carrier-specific shipping APIs, tracking webhooks/live tracking/ETA, carrier performance analytics, customer behavioral analytics and funnel tracking. Do not simulate these in MVP-2.

## Dependencies
M2-00–04 foundation; M2-05–08 identity/merchant approval; M2-09–14 commerce operations; M2-15–19 CMS/support/dashboards/settings; M2-20–23 security/testing/release. Do not skip gates.

## Phase index
M2-00 Repository and Specification Reconciliation (analysis-only)
M2-01 Marketplace Ownership Architecture
M2-02 Identity and Session Architecture
M2-03 Merchant Domain Foundation
M2-04 Authorization and API Boundaries
M2-05 Super Admin Authentication
M2-06 Merchant Authentication and Onboarding
M2-07 User, Role and Permission Management
M2-08 Merchant Review and Approval
M2-09 Catalog Administration and Full Product CRUD
M2-10 Product Moderation and Publishing
M2-11 Inventory and Stock Locations
M2-12 Order and Line-Item Management
M2-13 Fulfillment Operations
M2-14 Payments, Refunds, Returns and Exchanges
M2-15 CMS and Editorial Administration
M2-16 Customer and Support Operations
M2-17 Super Admin Dashboard and Reporting
M2-18 Merchant Dashboard and Reporting
M2-19 Platform Search, Settings and Notifications
M2-20 Security and Audit Hardening
M2-21 API and Integration Testing
M2-22 End-to-End and Performance Validation
M2-23 Release Readiness and Runbook
