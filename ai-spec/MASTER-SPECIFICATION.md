# Ecommerce MVP — Master Specification

## Purpose

This document is the single source of truth for the ecommerce MVP. Coding agents must read it before implementing any task. Do not invent features, business rules, routes, services, databases, or infrastructure outside this specification.

## Stack

- Next.js + React + TypeScript + App Router for storefront.
- Medusa for commerce.
- Strapi for CMS/marketing content.
- PostgreSQL for Medusa and Strapi persistence.
- Redis for temporary/cache/rate-limit/workflow use.
- Razorpay for online payments in the India-first MVP.
- Medusa system/manual payment provider for COD.
- External SMS/OTP provider.
- External object storage for media.
- Single low-cost VPS initially; Docker Compose; reverse proxy; HTTPS.
- No native mobile app in MVP.

## Data ownership

- Medusa owns products, variants, categories, collections, pricing, inventory, customers, carts, promotions, shipping, fulfillment, orders, payments, returns/refunds.
- Strapi owns homepage/landing/sale/campaign content, banners, marketing sections, CMS media and CMS SEO content.
- Do not duplicate commerce master data into Strapi.
- Use one PostgreSQL server/instance initially with separate logical databases: medusa_db and strapi_db. Do not create a third custom application database.
- Share one Redis initially with clear namespaces/prefixes.
- Custom Medusa persistence should use Medusa's architecture.

## Scope

Public:

- Homepage.
- Search.
- Category/brand/collection/sale PLPs.
- PDP.
- Cart.
- CMS landing/sale/campaign pages.
- Footer/policy pages.

Protected:

- Account/profile.
- Orders/order details.
- Address book.
- Wishlist.
- Checkout/shipping/payment.

Guest:

- Browse, search, filter, sort, PDP, add/view/update cart.
- Guest cart is identified by Medusa cart ID.
- Guest must authenticate before proceeding from cart to shipping.
- Guest cannot use wishlist.

## Header/navigation

Desktop header:

- Logo.
- Search box.
- Account.
- Wishlist icon.
- Cart icon.
- Horizontal category/collection tiles.
- Category click opens a mega-menu directly below with active arrow/indicator.
  Mobile:
- Responsive header.
- Search opens a dedicated search page.
- Horizontal touch-friendly category navigation.

## Search

Desktop:

- Search box remains in header.
- Typing opens a compact dropdown.
- Dropdown contains product suggestions (image, name, price), category names, collection names, and View All Results.
- Product click -> PDP.
- Category click -> category PLP.
- Collection click -> collection PLP.
- Enter with no active suggestion -> full search PLP.
- Keyboard: arrows navigate, Enter selects active suggestion or performs full search, Escape closes.
  Mobile:
- Search opens dedicated page containing search box and results.
- Typing displays product results with infinite loading.
- Zero results -> explicit ZSR/No Results state.
- Product -> PDP; category/collection if surfaced -> PLP.
- Search must be debounced and stale responses must not overwrite newer queries.
  API abstraction: suggestions vs full search. Initial implementation may use Medusa capabilities; later search engine can be swapped for OpenSearch/Elasticsearch/Algolia/Meilisearch.

## PLP

Reusable engine for:

- Category.
- Brand.
- Collection.
- Sale/curated.
- Search.
  Features:
- Product grid/cards.
- Images, names, brand where available, current/original price, discount where applicable, availability.
- Wishlist action.
- Add-to-cart only when variant selection is unambiguous.
- Filters: category, brand, price, size, color, availability and configured attributes.
- Sorting: relevance, price ascending/descending, newest, only when supported.
- Infinite scroll.
- URL state for search/filter/sort.
- Loading/error/empty states.
- Back/forward and refresh must preserve reproducible URL state.

## PDP

- Images, name, brand, description, prices, discount, variants/options, availability, add to cart, wishlist, relevant information, related products where available.
- Invalid/unavailable variants cannot be added.
- Wishlist requires authentication.

## Cart

- Guest and authenticated cart.
- Add/remove/update quantity.
- Cart ID persistence.
- Totals from Medusa; frontend totals are not authoritative.
- Inventory revalidation.
- Guest can browse cart.
- Proceed to shipping requires login.
- After login preserve/merge guest cart with customer cart deterministically; do not silently lose items.

## Authentication

Mobile OTP only; no passwords.
Existing user:
mobile -> lookup -> OTP -> verify -> authenticated session.
New user:
mobile -> registration form -> name, email, mobile -> submit -> OTP -> verify -> customer/session.
Do not collect address, referral code, or age in registration.
OTP:

- Redis temporary storage.
- Expiration.
- Resend.
- Attempt limit.
- Rate limiting by mobile/IP.
- Invalidate after success.
- Never log/store plaintext OTP permanently or return it in API.
  Protected actions return user to intended destination after login.
  Backend must enforce authorization; frontend guards are not sufficient.

## Account/address/wishlist

Profile: name, email, mobile.
Address book uses Medusa customer addresses. Fields:

- Full name
- Mobile
- Address line 1
- Address line 2 optional
- Landmark optional
- City
- State
- Pincode
- Country (India default)
- Address type (Home/Office/Other)
- Default flag
  Address is added later, not during registration.
  Wishlist requires login; implement a small Medusa custom module/domain if needed.

## Checkout

Cart -> authentication if needed -> shipping address -> shipping method -> payment -> order.
Saved address selection + add new address.
Shipping via Medusa fulfillment/shipping architecture and configured provider.
Do not invent delivery dates/rates.

## Payments

Use Razorpay for online payments.
Medusa payment architecture must remain the source of commerce state.
Implement:

- Payment session/initiation.
- Razorpay UI/integration.
- Confirmation.
- Failure/retry.
- Webhook verification and idempotency.
- No secrets in frontend.
  COD uses Medusa system/manual payment provider.
  Do not call Stripe for COD.

## Orders

- Success page.
- Order history.
- Order detail.
- Items/variants/quantities/prices/discounts/shipping/tax/total.
- Payment and fulfillment status.
- Shipping address.
- Customer can see only own orders.

## Returns/refunds

Returns and refunds are core MVP.
Use Medusa return/refund capabilities; do not rebuild the commerce engine.
Return flow: order -> request return -> select item/quantity/reason -> processing -> received -> refund.
Prepaid refund: Medusa initiates refund through configured Razorpay/payment provider; actual money movement is provider responsibility.
COD refund: custom backend/Medusa workflow must support a refund-method abstraction for UPI, bank transfer/IMPS, or store credit. Next.js only collects choice/data; financial payout logic remains server-side. Track refund status/provider/reference and prevent duplicates.
Exchange is optional/basic only; do not build complex exchange rules unless later requested.

## Promotions

Use Medusa promotions/discounts. Referral functionality is explicitly OUT OF SCOPE. No loyalty points, affiliate system, or referral rewards.

## CMS

Strapi page types:

- Homepage.
- Landing page.
- Sale page.
- Campaign page.
- Brand content page.
  Reusable sections:
- Hero.
- Banner.
- Rich text.
- Category tiles/grid/carousel.
- Collection carousel.
- Product carousel/grid.
- Promotional CTA.
- Sale banner.
- SEO metadata.
  CMS section ordering is data-driven. No arbitrary executable frontend code.
  CMS references commerce data instead of duplicating product records/prices/inventory.

## UX/design

Modern fashion ecommerce UX; SHEIN India can be used only as general visual/UX reference, not copied assets/branding/text/code.
Desktop and mobile are intentionally different where appropriate.
Every asynchronous request that changes visible UI has a loading state/shimmer/skeleton.
Every mutation has button loading state and duplicate-submission prevention.
Every important collection has an empty state.
Errors must distinguish API failure from valid zero results.
Implement 404, route error boundaries, section-level CMS fallback, retry controls, accessible dialogs/dropdowns, keyboard navigation, focus management and semantic HTML.

## Security

- HTTPS.
- Secrets only server-side.
- Input validation.
- Rate limiting.
- Webhook signature verification.
- Authorization/ownership checks.
- Secure session/cookie handling.
- No raw stack traces, OTPs, payment secrets, card data or bank credentials exposed.
- Do not publicly expose Postgres/Redis.

## Deployment

Initial:
single VPS, Docker Compose, reverse proxy, HTTPS, Next.js, Medusa, Strapi, PostgreSQL, Redis.
Use object storage for media and external backups.
Target low initial spend (~₹500/month where practical), but do not sacrifice essential security/backups.
Future scaling must permit multiple Next.js/Medusa instances, managed PostgreSQL/Redis and load balancing without rewriting domains.

## Explicitly out of scope

- Referral system.
- Loyalty.
- Reviews/ratings.
- Social login.
- Password authentication.
- Native app.
- Marketplace/multi-vendor.
- Multi-tenancy.
- AI recommendation engine.
- Advanced analytics platform.
- Kubernetes/Kafka/RabbitMQ/service mesh.
- Database/Redis clusters at MVP launch.
- Complex warehouse management.
- Advanced exchange engine.

## Agent rule

Before implementing any feature:

1. Check whether Medusa already provides it.
2. Check whether Strapi already provides it.
3. If neither does, implement the smallest custom solution explicitly required.
4. Do not create an additional database/service without a concrete requirement.
5. Preserve working code.
6. Run lint/typecheck/tests/build after implementation.
7. Never claim completion without verification.
