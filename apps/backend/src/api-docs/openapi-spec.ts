import type { OpenApiDocument, OpenApiTag, OpenApiServer } from './types';
import { securitySchemes } from './components/security';
import { componentSchemas } from './components/schemas';
import { adminAuthPaths } from './paths/admin-auth';
import { adminMarketplacePaths } from './paths/admin-marketplace';
import { merchantAuthPaths } from './paths/merchant-auth';
import { merchantTeamPaths } from './paths/merchant-team';
import { merchantOperationsPaths } from './paths/merchant-operations';
import { storeApisPaths } from './paths/store-apis';
import { storefrontBffPaths } from './paths/storefront-bff';
import { medusaCorePaths } from './paths/medusa-core';

export const openApiServers: OpenApiServer[] = [
  {
    url: 'http://localhost:9000',
    description: 'Medusa Backend (Custom Marketplace & Store APIs)',
  },
  {
    url: 'http://localhost:3000',
    description: 'Storefront BFF (Next.js 14 API Routes)',
  },
];

export const openApiTags: OpenApiTag[] = [
  {
    name: 'Super Admin Authentication',
    description:
      'Platform Super Admin primary authentication, session lifecycle, and sliding TTL management (ADR-005).',
  },
  {
    name: 'Super Admin MFA',
    description:
      'RFC 6238 TOTP multi-factor enrollment, verification, backup codes, and step-up challenges (ADR-005).',
  },
  {
    name: 'Super Admin Marketplace Governance',
    description:
      'Platform-wide marketplace oversight, cross-merchant product catalog visibility, and tenant member governance (ADR-004, ADR-007).',
  },
  {
    name: 'Merchant Authentication & Onboarding',
    description:
      'Native Medusa v2 Auth Module emailpass registration, Indian tax validation (GSTIN/PAN), Scrypt login, and session tokens (ADR-006).',
  },
  {
    name: 'Merchant Team Management & RBAC',
    description:
      'Merchant-scoped team invitations, role ceilings, anti-escalation, and PostgreSQL advisory-locked sole-owner safety (ADR-007).',
  },
  {
    name: 'Merchant Operations — Products & Catalog',
    description:
      'Tenant-scoped product creation, variant management, and ownership link enforcement (ADR-001, ADR-004).',
  },
  {
    name: 'Merchant Operations — Orders',
    description:
      'Merchant-scoped order fulfillment and line-item redaction for multi-vendor split orders (ADR-004).',
  },
  {
    name: 'Store — Customer Management (S2S)',
    description:
      'Internal Server-to-Server authenticated customer provisioning and lookup in Medusa Customer Module.',
  },
  {
    name: 'Store — Customer Addresses',
    description:
      'Persistent customer address book in Medusa Customer Module with Indian pincode and address type classification.',
  },
  {
    name: 'Store — Customer Wishlist',
    description: 'Customer product wishlist management via dedicated Medusa wishlist module.',
  },
  {
    name: 'Store — Order Management',
    description: 'Store customer order lifecycle and cancellation workflow.',
  },
  {
    name: 'Storefront BFF — System',
    description: 'Storefront application health and liveness checks.',
  },
  {
    name: 'Storefront BFF — Customer Authentication',
    description:
      'Customer mobile OTP generation, verification, and cookie session lifecycle on Storefront BFF.',
  },
  {
    name: 'Storefront BFF — Product Discovery',
    description: 'Product listing and detail endpoints proxied to Medusa catalog.',
  },
  {
    name: 'Storefront BFF — Search',
    description: 'Full-text product search abstraction and search suggestions.',
  },
  {
    name: 'Storefront BFF — Cart & Checkout',
    description: 'Cart line-item mutations, shipping selection, and COD/prepaid checkout orchestration.',
  },
  {
    name: 'Storefront BFF — Customer Account',
    description: 'Customer order history, order cancellation, returns, and refund tracking.',
  },
  {
    name: 'Storefront BFF — Wishlist',
    description: 'Customer wishlist client proxy.',
  },
  {
    name: 'Storefront BFF — Webhooks',
    description: 'External payment gateway webhook receivers (Razorpay).',
  },
  {
    name: 'Medusa Core Standard — Products',
    description: 'Standard out-of-the-box Medusa v2 store product endpoints.',
  },
  {
    name: 'Medusa Core Standard — Cart',
    description: 'Standard out-of-the-box Medusa v2 cart endpoints.',
  },
  {
    name: 'Medusa Core Standard — Native Auth',
    description: 'Standard out-of-the-box Medusa v2 Auth Module provider endpoints.',
  },
];

/**
 * Builds the authoritative OpenAPI 3.1.0 document combining all domains.
 */
export function buildOpenApiDocument(): OpenApiDocument {
  const mergedPaths = {
    ...adminAuthPaths,
    ...adminMarketplacePaths,
    ...merchantAuthPaths,
    ...merchantTeamPaths,
    ...merchantOperationsPaths,
    ...storeApisPaths,
    ...storefrontBffPaths,
    ...medusaCorePaths,
  };

  return {
    openapi: '3.1.0',
    info: {
      title: 'Ateevra Multi-Vendor Marketplace API',
      version: '2.0.0',
      description:
        'Authoritative OpenAPI 3.1.0 specification for Ateevra India-First Multi-Vendor Fashion Marketplace (MVP-1 & MVP-2).\n\n' +
        '### Security & Authentication Overview\n' +
        '- **Merchant Portal:** Uses native Medusa v2 Scrypt authentication with dual-transport `ecom_merchant_sess` cookie and `sess_merch_*` Bearer tokens.\n' +
        '- **Super Admin:** Uses Scrypt credentials, sliding 2h sessions (`ecom_admin_sess` / `sess_admin_*`), and RFC 6238 TOTP MFA challenges.\n' +
        '- **Customer:** Authenticates via mobile SMS OTP with Redis sessions and `ecom_sess` cookie.\n' +
        '- **Internal S2S:** Secured via `x-s2s-auth-token` header for internal communication between Storefront BFF and Medusa Backend.\n' +
        '- **Webhooks:** Secured via HMAC-SHA256 signature verification (`x-razorpay-signature`).',
      contact: {
        name: 'Ateevra Engineering Team',
        email: 'engineering@ateevra.in',
      },
      license: {
        name: 'Proprietary',
      },
    },
    servers: openApiServers,
    tags: openApiTags,
    paths: mergedPaths,
    components: {
      securitySchemes,
      schemas: componentSchemas,
    },
  };
}

export const ateevraOpenApiDocument = buildOpenApiDocument();
