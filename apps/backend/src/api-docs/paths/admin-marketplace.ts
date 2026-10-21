import type { OpenApiPathItem } from '../types';

export const adminMarketplacePaths: Record<string, OpenApiPathItem> = {
  '/admin/marketplace/products': {
    get: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Cross-Merchant Product Catalog Listing',
      description:
        'Lists all products across all merchants for platform moderation and oversight. Namespaced under /admin/marketplace/products to keep native Medusa /admin/products intact. Supports filtering by ?merchant_id=...',
      operationId: 'adminMarketplaceListProducts',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'merchant_id',
          in: 'query',
          description: 'Filter products by specific merchant ID',
          required: false,
          schema: { type: 'string' },
          example: 'merch_01HQXYZ',
        },
      ],
      responses: {
        '200': {
          description: 'List of platform products with merchant linkage',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'products'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer', example: 12 },
                  products: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/ProductDto' },
                  },
                },
              },
            },
          },
        },
        '403': {
          description: 'Forbidden (Caller does not have admin security boundary)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    post: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Create Merchant-Owned Product (Super Admin)',
      description:
        'Creates a product and links it to a designated active target merchant from the Super Admin portal. Enforces mandatory target merchant assignment, active merchant validation, and transactional compensation rollback if remote linking fails.',
      operationId: 'adminMarketplaceCreateProduct',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title', 'target_merchant_id'],
              properties: {
                title: { type: 'string', example: 'Handcrafted Brass Diya Set' },
                target_merchant_id: { type: 'string', description: 'ID of active merchant vendor to own the product', example: 'merch_01HQXYZ' },
                handle: { type: 'string', example: 'handcrafted-brass-diya-set' },
                description: { type: 'string', example: 'Traditional festive brass diya.' },
                status: { type: 'string', enum: ['draft', 'published', 'proposed'], default: 'draft' },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Product created and linked to target merchant',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'product', 'merchant_id'],
                properties: {
                  success: { type: 'boolean', const: true },
                  merchant_id: { type: 'string', example: 'merch_01HQXYZ' },
                  product: { $ref: '#/components/schemas/ProductDto' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Title required, target merchant missing, or target merchant inactive',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '403': {
          description: 'Forbidden (Caller does not have admin boundary)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/marketplace/team': {
    get: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Platform-Wide Merchant Team Directory',
      description:
        'Lists merchant members across all merchants. Supports filtering by ?merchant_id=..., ?role=..., and ?status=.... Requires super_admin authority.',
      operationId: 'adminMarketplaceListTeam',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'merchant_id',
          in: 'query',
          description: 'Filter team members by merchant ID',
          schema: { type: 'string' },
        },
        {
          name: 'role',
          in: 'query',
          description: 'Filter by member role',
          schema: { $ref: '#/components/schemas/MerchantRole' },
        },
        {
          name: 'status',
          in: 'query',
          description: 'Filter by membership status',
          schema: { $ref: '#/components/schemas/MerchantMemberStatus' },
        },
      ],
      responses: {
        '200': {
          description: 'Platform team directory retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'members'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer' },
                  members: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/MerchantTeamMember' },
                  },
                },
              },
            },
          },
        },
        '403': {
          description: 'Forbidden (Non-admin caller)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/marketplace/members/{id}': {
    put: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Super Admin Member Role or Status Mutation',
      description:
        'Allows platform administration to update a member role or lifecycle status (e.g. suspending a compromised merchant account). Strictly enforces PostgreSQL transaction advisory locks to guarantee that no merchant is left with zero active owners.',
      operationId: 'adminMarketplaceUpdateMember',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Merchant member ID (mmbr_*)',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/UpdateMemberPayload' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Member updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'member'],
                properties: {
                  success: { type: 'boolean', const: true },
                  member: { $ref: '#/components/schemas/MerchantTeamMember' },
                },
              },
            },
          },
        },
        '404': {
          description: 'Member not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '409': {
          description: 'Sole active owner protection violation',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
};
