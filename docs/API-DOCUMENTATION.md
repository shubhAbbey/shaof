# ATEEVRA — Unified OpenAPI 3.1 & Swagger Documentation

**Authoritative Specification:** OpenAPI 3.1.0  
**Status:** IMPLEMENTED & VERIFIED  
**Scope:** MVP-1 Commerce Domains & MVP-2 Multi-Vendor Marketplace  
**Interactive UI:** `http://localhost:9000/docs` (or redirected via `http://localhost:3000/docs`)  
**Raw JSON Spec:** `http://localhost:9000/docs/openapi.json` (or `http://localhost:9000/docs/openapi`)  

---

## 1. Overview & Architecture

Ateevra features a unified, production-grade OpenAPI 3.1 documentation system covering:
1. **Medusa v2 Backend Custom APIs:** Custom routes in `apps/backend/src/api` encompassing Super Admin MFA, Merchant onboarding, RBAC team management, and scoped catalog/orders.
2. **Storefront Backend-For-Frontend (BFF) APIs:** Next.js 14 API routes in `apps/storefront/src/app/api` covering customer mobile OTP, cart mutations, checkout orchestration, and order cancellation/returns.
3. **Integrated Medusa Core Standard Endpoints:** Referenced standard Medusa v2 store products, carts, and native emailpass auth endpoints labeled under dedicated standard tags.

### Operational Coverage Breakdown (88 Total Operations)
- **Medusa v2 Backend Custom APIs:** 42 operations across 20 route files (100% coverage, 0 missing, 0 extra)
- **Storefront BFF APIs:** 42 operations across 27 route files (100% coverage, 0 missing, 0 extra)
- **Medusa Core Reference Endpoints:** 4 standard operations (`GET /store/products`, `POST /store/carts`, `POST /auth/customer/emailpass`, `POST /auth/user/emailpass`)
- **Total Documented Operations:** 88 operations (100% verified coverage)

### Multi-Server Target Environments
The interactive Swagger UI features a server selector allowing testing against:
- `http://localhost:9000`: **Medusa Backend** (Custom Marketplace & Store APIs)
- `http://localhost:3000`: **Storefront BFF** (Next.js 14 API Routes)

---

## 2. Interactive Swagger UI Access

### Local Development Access
When the backend is running, open:
```text
http://localhost:9000/docs
```
If you are working on the storefront development server on port 3000, opening:
```text
http://localhost:3000/docs
```
will automatically redirect your browser to `http://localhost:9000/docs`.

### Raw OpenAPI 3.1 JSON Specification
The raw specification can be fetched directly by API clients or tools:
```text
GET http://localhost:9000/docs/openapi.json
```
or via the alias:
```text
GET http://localhost:9000/docs/openapi
```
Alternatively, pass `?format=json` or `Accept: application/json` to `http://localhost:9000/docs`.

---

## 3. Security Schemes & Authentication

The documentation defines 7 authoritative security schemes matching backend middlewares:

| Scheme Name | Transport | Key / Header | Description |
| :--- | :--- | :--- | :--- |
| `MerchantCookieAuth` | Cookie | `ecom_merchant_sess` | HTTP-Only SameSite=Strict cookie for merchant portal. |
| `MerchantBearerAuth` | Header | `Authorization: Bearer sess_merch_*` | Bearer token alternative for merchant API clients. |
| `AdminCookieAuth` | Cookie | `ecom_admin_sess` | HTTP-Only SameSite=Strict cookie for platform Super Admin. |
| `AdminBearerAuth` | Header | `Authorization: Bearer sess_admin_*` | Bearer token for Super Admin API clients. |
| `CustomerCookieAuth` | Cookie | `ecom_sess` | HTTP-Only SameSite=Lax cookie for customer sessions. |
| `S2SAuth` | Header | `x-s2s-auth-token` | Server-to-Server internal shared secret for customer creation/lookup. |
| `RazorpayWebhookSignature` | Header | `x-razorpay-signature` | HMAC-SHA256 signature for payment webhook notifications. |

---

## 4. Production Security & Access Policy

1. **Development & Test Environments:**
   - Documentation UI (`/docs`) and raw specification (`/docs/openapi.json`) are accessible by default without authentication.
   - Swagger "Try it out" requests are disabled by default (`tryItOutEnabled: false`) to prevent accidental destructive calls.
2. **Production Environment:**
   - In production (`NODE_ENV === 'production'`), public access is disabled by default (`403 FORBIDDEN: DOCS_ACCESS_RESTRICTED`).
   - Access can be enabled by setting environment variable `ENABLE_API_DOCS=true`.
   - Authorized platform developers holding an active Super Admin session (`ecom_admin_sess` cookie or `sess_admin_*` token) are automatically permitted access even when public docs are disabled.
3. **Zero Secrets Leaked:**
   - No `.env` credentials, database connection strings, JWT keys, or active session tokens appear in documentation examples or generated artifacts.

---

## 5. Automated CI Verification

The OpenAPI documentation is covered by an automated test suite in [`apps/backend/src/openapi.test.ts`](file:///C:/Users/Shubham/OneDrive/Desktop/ecom_mvp/apps/backend/src/openapi.test.ts), verified on every test run:
1. **OAS 3.1.0 Validation:** Validates structure, info, servers, and tags.
2. **Operation ID Uniqueness:** Asserts every operation has a globally unique `operationId`.
3. **Reference Integrity:** Validates that every `$ref` points to an existing component schema.
4. **Backend Route Coverage Check:** Automatically scans `apps/backend/src/api` and asserts that 100% of custom route endpoints and HTTP methods are documented. Fails CI if a new route is introduced without OpenAPI docs.
5. **Storefront BFF Coverage Check:** Scans `apps/storefront/src/app/api` and asserts that 100% of BFF route endpoints and methods are documented.
6. **Handler Verification:** Tests `/docs`, `/docs/openapi.json`, and `/docs/openapi` handlers directly.
7. **Production Gating:** Verifies fail-closed access in production mode.

### Running Documentation Tests
```powershell
# Run focused OpenAPI test suite
node --test apps/backend/dist/openapi.test.js

# Run full backend regression suite (includes openapi.test.js)
npm test --workspace=@ecom/backend
```
