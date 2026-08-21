# Fashion Ecommerce MVP

India-First Fashion Ecommerce Platform built with Next.js App Router, Medusa v2 Commerce Engine, and Strapi CMS.

## Architecture

- **Storefront (`apps/storefront`):** Next.js App Router, TypeScript, Tailwind CSS, `@medusajs/js-sdk`.
- **Commerce Engine (`apps/backend`):** Medusa Commerce v2 (`medusa_db`).
- **CMS (`apps/cms`):** Strapi Headless CMS (`strapi_db`).
- **Persistence & Cache:** PostgreSQL 16 & Redis 7.
- **Payments:** Razorpay (UPI, Cards, Netbanking) & Cash on Delivery (COD).
- **Authentication:** Passwordless Mobile OTP.

## Project Structure

```text
├── apps/
│   ├── storefront/             # Next.js App Router storefront
│   ├── backend/                # Medusa commerce engine
│   └── cms/                    # Strapi headless CMS
├── packages/
│   ├── types/                  # Shared TypeScript DTOs & contracts
│   └── config/                 # Shared configs & environment validators
├── infrastructure/
│   ├── docker/                 # Docker Compose & container configurations
│   ├── nginx/                  # Reverse proxy configurations
│   └── scripts/                # Database backup & ops scripts
├── docs/                       # Architecture and developer documentation
└── ai-spec/                    # Product specification & task prompts
```

## Quick Start

```bash
# Install dependencies
npm install

# Run typecheck across all workspaces
npm run typecheck

# Run linting across all workspaces
npm run lint

# Build all applications
npm run build
```

See [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md) for more details.
