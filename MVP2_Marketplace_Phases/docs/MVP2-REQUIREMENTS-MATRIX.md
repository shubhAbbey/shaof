# MVP-2 Requirements Matrix

| Area | Merchant | Super Admin | Acceptance/security |
|---|---|---|---|
| Product create | Own verified merchant | Must select target merchant | Persist owner; no accidental unassigned product |
| Product list/read/search | Own products only | All merchants + merchant filter | Server-side tenant filters |
| Product update/archive/delete | Own products, lifecycle guarded | Cross-platform, association shown/verified | Re-check ownership; prefer archive for historical records |
| Variants/SKU/media/prices/inventory | Own product tree | Target product's merchant remains visible | Related resources cannot bypass ownership |
| Moderation | Submit/view own decisions | Review/approve/reject | Merchant cannot self-approve |
| Inventory | Authorized own locations/stock | Platform-wide authorized operations | Data-driven locations, safe concurrency |
| Orders | Own line items + needed context | Platform-wide | Mixed-seller orders supported; minimize PII |
| Fulfillment | Allowed seller-specific operations | Platform operations | No carrier APIs/live tracking in MVP-2 |
| Payments/returns/refunds/exchanges | Authorized scoped subset | Platform-wide | Idempotency, defined financial model, audit |
| Roles/team | Own permitted team roles | Platform role and merchant membership management | No self-escalation |
| Reporting | Own data | Platform KPIs | Real data and documented definitions |
| Identity | Merchant login/session | Separate platform login/session | Customer app gets no admin/merchant credentials |
| MVP-3 | No live carrier tracking or behavioral funnels | Same | Explicitly deferred |
