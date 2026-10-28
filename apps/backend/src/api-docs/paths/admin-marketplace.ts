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

  '/admin/marketplace/products/{id}': {
    get: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Super Admin Product Detail with Target Merchant Context',
      description:
        'Retrieves comprehensive product details, variant information, and attached target merchant context for platform administration.',
      operationId: 'adminMarketplaceGetProduct',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID (prod_*)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Product details with associated merchant metadata',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'product'],
                properties: {
                  success: { type: 'boolean', const: true },
                  product: { $ref: '#/components/schemas/ProductDto' },
                },
              },
            },
          },
        },
        '404': {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    put: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Super Admin Product Update and Merchant Reassignment',
      description:
        'Updates product title, handle, description, or status. Also allows reassigning ownership to a different active target merchant with full audit trail logging.',
      operationId: 'adminMarketplaceUpdateProduct',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID (prod_*)',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                handle: { type: 'string' },
                description: { type: 'string' },
                status: { type: 'string', enum: ['draft', 'published', 'proposed', 'rejected'] },
                target_merchant_id: { type: 'string', description: 'Reassign product to a different active merchant' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Product updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'product'],
                properties: {
                  success: { type: 'boolean', const: true },
                  product: { $ref: '#/components/schemas/ProductDto' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Target merchant not found or not active',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '404': {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Super Admin Safe Product Deletion',
      description:
        'Deletes product under a PostgreSQL transaction-level advisory lock (pg_advisory_xact_lock) to prevent read-then-act race conditions against concurrent customer orders. Strictly rejects deletion if order history exists.',
      operationId: 'adminMarketplaceDeleteProduct',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID (prod_*)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Product deleted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'message', 'id'],
                properties: {
                  success: { type: 'boolean', const: true },
                  message: { type: 'string', example: 'Product successfully deleted by platform administrator.' },
                  id: { type: 'string', example: 'prod_01HQXYZ' },
                },
              },
            },
          },
        },
        '404': {
          description: 'Product not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '409': {
          description: 'Conflict (Product cannot be deleted due to existing customer order history)',
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

  '/admin/marketplace/merchants': {
    get: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Super Admin Merchant Application Queue',
      description:
        'Lists all registered merchants across all lifecycle statuses with optional status filtering, search by company name, and pagination.',
      operationId: 'adminMarketplaceListMerchants',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          description: 'Filter merchants by lifecycle status',
          required: false,
          schema: { $ref: '#/components/schemas/MerchantStatus' },
        },
        {
          name: 'q',
          in: 'query',
          description: 'Search merchants by name or handle',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'limit',
          in: 'query',
          description: 'Number of items to return',
          required: false,
          schema: { type: 'integer', default: 50 },
        },
        {
          name: 'offset',
          in: 'query',
          description: 'Offset for pagination',
          required: false,
          schema: { type: 'integer', default: 0 },
        },
      ],
      responses: {
        '200': {
          description: 'List of merchants with verification metadata',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'merchants'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer', example: 5 },
                  merchants: {
                    type: 'array',
                    items: {
                      type: 'object',
                      required: ['id', 'name', 'status'],
                      properties: {
                        id: { type: 'string', example: 'merch_01HQXYZ' },
                        name: { type: 'string', example: 'Vedic Living' },
                        handle: { type: 'string', example: 'vedic-living' },
                        status: { $ref: '#/components/schemas/MerchantStatus' },
                        email: { type: 'string', example: 'contact@vedicliving.in' },
                        phone: { type: 'string', example: '+919876543210' },
                      },
                    },
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
  },

  '/admin/marketplace/merchants/{id}': {
    get: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Super Admin Merchant Application Detail',
      description:
        'Retrieves complete merchant application details, GSTIN/PAN verification state, active owner, team members, product count, and audit lifecycle history.',
      operationId: 'adminMarketplaceGetMerchant',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Merchant organization ID (merch_*)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Detailed merchant application record',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'merchant'],
                properties: {
                  success: { type: 'boolean', const: true },
                  merchant: {
                    type: 'object',
                    required: ['id', 'name', 'status'],
                    properties: {
                      id: { type: 'string', example: 'merch_01HQXYZ' },
                      name: { type: 'string', example: 'Vedic Living' },
                      handle: { type: 'string', example: 'vedic-living' },
                      status: { $ref: '#/components/schemas/MerchantStatus' },
                      email: { type: 'string', example: 'contact@vedicliving.in' },
                      phone: { type: 'string', example: '+919876543210' },
                      owner: {
                        type: 'object',
                        nullable: true,
                        properties: {
                          id: { type: 'string' },
                          name: { type: 'string' },
                          email: { type: 'string' },
                          role: { type: 'string' },
                          status: { type: 'string' },
                        },
                      },
                      teamMembers: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/MerchantTeamMember' },
                      },
                      productCount: { type: 'integer', example: 12 },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Missing merchant ID',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
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
        '404': {
          description: 'Merchant not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/marketplace/merchants/{id}/status': {
    put: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Super Admin Merchant Lifecycle Transition',
      description:
        'Executes approval, rejection, changes-request, suspension, or reactivation on a merchant application. Enforces mandatory reason recording, active owner validation on approval, and distributed session revocation on suspension.',
      operationId: 'adminMarketplaceUpdateMerchantStatus',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Merchant organization ID (merch_*)',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['action'],
              properties: {
                action: {
                  type: 'string',
                  enum: ['approve', 'reject', 'request-changes', 'suspend', 'reactivate'],
                  example: 'approve',
                },
                status: {
                  type: 'string',
                  description: 'Direct target status override (alternative to action)',
                  enum: ['draft', 'pending_approval', 'active', 'suspended', 'rejected'],
                },
                reason: {
                  type: 'string',
                  description: 'Mandatory reason when rejecting, requesting changes, or suspending',
                  example: 'Documents verified and approved.',
                },
                notes: {
                  type: 'string',
                  description: 'Internal Super Admin notes',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Merchant status updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'message', 'merchant'],
                properties: {
                  success: { type: 'boolean', const: true },
                  message: { type: 'string', example: "Merchant status successfully updated to 'active'." },
                  merchant: {
                    type: 'object',
                    required: ['id', 'status'],
                    properties: {
                      id: { type: 'string', example: 'merch_01HQXYZ' },
                      name: { type: 'string', example: 'Vedic Living' },
                      status: { $ref: '#/components/schemas/MerchantStatus' },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Missing reason, invalid transition, or missing active owner',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
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
        '404': {
          description: 'Merchant not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '409': {
          description: 'Conflict in transition invariant (e.g. active owner required for approval)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/marketplace/moderation': {
    get: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Product Moderation Queue Listing',
      description:
        'Lists products awaiting Super Admin moderation review (status: proposed) across all merchants with merchant profile details and submission timestamps.',
      operationId: 'adminMarketplaceGetModerationQueue',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'status',
          in: 'query',
          description: 'Filter by moderation status (defaults to proposed)',
          required: false,
          schema: { type: 'string', enum: ['proposed', 'published', 'draft', 'rejected', 'all'], default: 'proposed' },
        },
        {
          name: 'merchant_id',
          in: 'query',
          description: 'Filter queue by merchant organization ID',
          required: false,
          schema: { type: 'string' },
        },
        {
          name: 'q',
          in: 'query',
          description: 'Search queue by title, handle, or merchant name',
          required: false,
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'List of moderation queue items',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'queue'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer', example: 3 },
                  queue: {
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
  },

  '/admin/marketplace/products/{id}/moderate': {
    post: {
      tags: ['Super Admin Marketplace Governance'],
      summary: 'Execute Product Moderation Decision',
      description:
        'Executes approval, rejection, or changes-request decision on a product in the moderation queue. Enforces mandatory reason recording for reject and request-changes, active merchant verification for approval, and records platform audit trail.',
      operationId: 'adminMarketplaceModerateProduct',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Product ID (prod_*)',
          schema: { type: 'string' },
        },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['action'],
              properties: {
                action: {
                  type: 'string',
                  enum: ['approve', 'reject', 'request-changes'],
                  example: 'approve',
                },
                reason: {
                  type: 'string',
                  description: 'Mandatory reason when rejecting or requesting changes',
                  example: 'Product specifications verified and approved for catalog publishing.',
                },
                notes: {
                  type: 'string',
                  description: 'Optional internal moderation notes',
                },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Product moderation decision executed successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'message', 'product'],
                properties: {
                  success: { type: 'boolean', const: true },
                  message: { type: 'string', example: "Product successfully transitioned to 'published'." },
                  product: { $ref: '#/components/schemas/ProductDto' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Missing reason, invalid action, or inactive merchant on approval',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
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
        '404': {
          description: 'Product not found',
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
