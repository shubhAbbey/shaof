# MVP-2 Complete Marketplace Phase Pack

Contains shared rules, master plan, requirements matrix and all 24 phase-specific prompts M2-00 through M2-23.

## Start
1. Read `MVP2-AGENT-RULES.md`.
2. Read `MVP2-MASTER-PLAN.md`.
3. Execute M2-00 first. It is analysis-only and reconciles this plan with the actual repo and original MVP-1 44-phase source of truth.
4. Execute one phase at a time and require evidence-based acceptance before proceeding.

## Product CRUD and merchant mapping
Explicitly included in M2-09: Merchant and Super Admin both have product create/list/search/read/update/delete-or-archive. Merchant is limited to its own verified merchant scope. Super Admin must select the target merchant for merchant-owned product creation, sees the merchant association on cross-platform product views, and backend persists/enforces the mapping for products and related variants, SKUs, media, prices, inventory and moderation. Cross-merchant negative tests are required.

MVP-3 defers carrier-specific APIs/live tracking/webhooks/ETA and customer behavioral funnel analytics. This prompt pack is not proof that implementation already exists; repository reconciliation is mandatory.
