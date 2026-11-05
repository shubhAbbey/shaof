# ATEEVRA Digital Flagship — Customer Journey Blueprint

**Document ID:** `STR-ATEEVRA-JOURNEY-V1`  
**Classification:** `CUSTOMER EXPERIENCE & JOURNEY SPECIFICATION`  
**Parent Blueprint:** [`STOREFRONT-MASTER-BLUEPRINT.md`](STOREFRONT-MASTER-BLUEPRINT.md)  
**Effective Date:** 2026-11-05  

---

## 1. Journey 1: First-Time Discovery & Sensory Immersion

```mermaid
journey
    title First-Time Visitor Luxury Fashion Discovery
    section Inspiration & Entry
      Lands on Homepage: 5: Customer captivated by full-bleed silent runway video
      Views Seasonal Lookbook: 5: Explores editorial styling and high-resolution collection imagery
    section Evaluation & Curation
      Browses Category Grid: 4: Seamless filtering by size, silhouette, and natural fabric
      Opens Product Detail Page: 5: Reviews 4K drape video, weave density, and model sizing
    section Confidence & Sizing
      Clicks Sizing Concierge: 5: Checks flat garment measurements against own wardrobe
      Adds to Shopping Bag: 5: Instant slide-over drawer confirmation with real-time stock hold
```

---

## 2. Journey 2: Frictionless One-Page Checkout

```mermaid
flowchart TD
    A["Customer clicks 'Checkout' from Slide-Over Bag"] --> B{"Has Customer Account?"}
    B -- "Returning User" --> C["Enter Mobile Number $\rightarrow$ 6-Digit OTP Verified in 3s"]
    C --> D["Pre-Filled Saved Shipping Addresses & Payment Tokens"]
    B -- "New Visitor" --> E["Guest Checkout: Enter Email & Delivery Phone"]
    E --> F["PIN Code Entry: Automatically resolves City & State"]
    
    D --> G["Select Payment Rail"]
    F --> G
    
    G --> H{"Payment Selection"}
    H -- "UPI Intent / Cards" --> I["Instant Razorpay Overlay / GPay Intent Capture"]
    H -- "Cash on Delivery (COD)" --> J["Automated 4-Digit SMS/WhatsApp OTP Verification Gate"]
    
    I --> K["Order Confirmed Screen + Branded WhatsApp Receipt"]
    J --> K
```

---

## 3. Journey 3: Luxury Post-Purchase & 7-Day Return Concierge

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Retail Customer
    participant WhatsApp as WhatsApp Concierge API
    participant AccountUI as ateevra.com/account/orders
    participant Concierge as ATEEVRA Return Team

    WhatsApp->>Customer: "Your ATEEVRA parcel has been delivered by Bluedart."
    Note over Customer: Customer tries garment; desires alternative size
    Customer->>AccountUI: Navigate to Orders; Click "Request Size Exchange / Return"
    AccountUI->>Customer: Display 7-Day Return Countdown Badge (Day 2 of 7)
    Customer->>AccountUI: Select Reason: "Size Exchange: Request Size 42 instead of 40"
    AccountUI->>Concierge: Instant Exchange Webhook Triggered
    Concierge->>Customer: Automatic Return Label & Free Reverse Pickup Booked
    Note over Customer: 3PL Courier collects package from doorstep
    Concierge->>WhatsApp: "We have received your returned item. Replacement Size 42 dispatched!"
```
