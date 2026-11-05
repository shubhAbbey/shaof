# ATEEVRA Digital Flagship — Page & Section Matrix

**Document ID:** `STR-ATEEVRA-PAGE-MATRIX-V1`  
**Classification:** `STOREFRONT COMPONENT & SECTION SPECIFICATION`  
**Parent Blueprint:** [`STOREFRONT-MASTER-BLUEPRINT.md`](STOREFRONT-MASTER-BLUEPRINT.md)  
**Effective Date:** 2026-11-05  

---

## 1. Page & Modular Component Hierarchy

| Page Route | Core Purpose | Modular Sections & Components | Data Source | Caching Strategy |
| :--- | :--- | :--- | :--- | :--- |
| **`/` (Homepage)** | Brand immersion, collection launch, editorial storytelling | - `HeroRunwayVideo`: Full-bleed autoplay silent 4K film<br>- `FeaturedDropGrid`: New arrival carousel (3:4 aspect)<br>- `EditorialLookbookSnippet`: Split-screen photo/story banner<br>- `CraftsmanshipPillar`: Macro fabric weave callouts<br>- `AtelierNewsletter`: Minimalist email/WhatsApp signup | Strapi v5 & Medusa v2 | ISR (1 hour) with On-Demand Revalidation |
| **`/collections/[slug]`** | Narrative-driven collection exploration | - `CollectionHeader`: Title, designer statement, season tag<br>- `RunwayLookGrid`: Full-height editorial images with hotspot pins<br>- `CuratedProductList`: Filterable product listing | Strapi v5 & Medusa v2 | ISR (1 hour) |
| **`/category/[category]`** | Product category browsing and filtering | - `CategoryFilterBar`: Sticky pill filters (Size, Fit, Material)<br>- `ProductGrid`: Responsive 2-col (mobile) / 4-col (desktop)<br>- `ProductCard`: Hover video preview, ATS stock indicator, price | Medusa v2 | ISR (30 mins) with Tag Revalidation |
| **`/product/[handle]`** | Primary conversion & sensory immersion | - `ProductGallery`: Dual-column desktop sticky scroll; 4K video<br>- `ProductMetaHeader`: Style title, composition, price<br>- `VariantSelector`: Tactile size/color buttons with ATS stock badges<br>- `SizingConciergeModal`: Flat measurement chart & model stats<br>- `FabricArchitectureSection`: Weave, GSM, origin, care icons<br>- `CompleteTheLook`: Complementary styled garments carousel | Medusa v2 (Specs) & Strapi (Videos) | Dynamic SSR with Client ATS Hydration |
| **`/cart` (Slide-Over Drawer)** | Frictionless shopping bag inspection | - `CartItemRow`: Image thumbnail, variant, quantity controls<br>- `FreeShippingProgress`: Real-time meter toward ₹1,199 threshold<br>- `OrderSummary`: Subtotal, GST disclosure, express checkout button | Medusa v2 Cart API | 100% Client-Side Dynamic |
| **`/checkout`** | Express one-page purchase completion | - `CustomerAuthGate`: Returning OTP vs Guest Checkout<br>- `ShippingAddressForm`: PIN code auto-city/state resolution<br>- `PaymentMethodAccordion`: UPI Intent, Cards, COD OTP<br>- `OrderReviewSummary`: Product line items, delivery speed | Medusa v2 Checkout API | 100% Dynamic SSR (No Cache) |
| **`/account/orders`** | Order management & self-service returns | - `OrderHistoryCard`: Order number, date, total, carrier badge<br>- `LiveTrackingTimeline`: Electronic courier scans visualization<br>- `ReturnInitiationButton`: Active for 7 days post-delivery | Medusa v2 Customer API | Authenticated Dynamic SSR |
| **`/pages/[slug]`** | Brand storytelling and editorial content | - `RichEditorialArticle`: Long-form typography with pull quotes<br>- `FabricGlossary`: Educational guides on Egyptian cotton, mulberry silk<br>- `GarmentCareGuide`: Washing, pressing, and seasonal storage tips | Strapi v5 Pages API | ISR (24 hours) |

---

## 2. Component Interaction & Error States

1. **Out-of-Stock Variants:** Size buttons render with a subtle strikethrough; clicking triggers an inline *"Notify Me When Re-Crafted"* modal capturing WhatsApp contact details.
2. **Slow Network Fallback:** Pre-rendered shimmering skeletons matching the exact 3:4 aspect ratio prevent content jank during image downloads.
3. **Checkout Error Handling:** Inline field-level validation errors (e.g. invalid 6-digit PIN code) without clearing previously entered customer data.
