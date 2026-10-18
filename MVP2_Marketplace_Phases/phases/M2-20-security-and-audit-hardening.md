# M2-20 — Security and Audit Hardening

**Phase type:** Threat review  
**Mandatory:** Read `../MVP2-AGENT-RULES.md` and `../MVP2-MASTER-PLAN.md` first.

## Objective and scope
Review customer/admin/merchant boundaries, auth, product ownership, media, inventory, orders, refunds, roles, exports and financial actions. Audit actor/role/target/time/outcome/reason and safe before/after fields.

## Deliverables
Fix confirmed in-scope issues; add missing audit/rate-limit/CSRF/CORS/step-up controls; document residual risks and MFA release gate.

## Acceptance criteria
Cross-tenant IDOR/escalation tests pass; secrets redacted; residual risks explicit; no unsupported security-certification claim.

## Required validation and completion report
- Inspect relevant code and Git diff before editing.
- Add focused tests, including negative authorization cases.
- Run finite relevant test/type/lint/build commands available in this repository; record exact commands/results.
- Run applicable MVP-1 regression tests (catalog, cart, checkout, Razorpay/COD, orders, shipping, returns, refunds, exchanges).
- Report PASS/BLOCKED/FAIL, files changed, architecture decisions, APIs/workflows and custom endpoint rationale, schema/migration/rollback, auth/tenant changes, test results, known gaps and Git status.
- Stop at this phase gate; do not start the next phase automatically.

## Stop conditions
Stop and report a blocker if repository/spec evidence is missing or a critical ownership/auth/financial/migration decision cannot be established safely. Do not guess, reset data, bypass authorization or expand scope to force completion.
