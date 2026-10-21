import type { OpenApiPathItem } from '../types';

/**
 * Standard Medusa Core Reference Endpoints
 * Out-of-the-box Medusa v2 APIs integrated with Ateevra multi-vendor architecture.
 * Labeled clearly as 'Medusa Core Standard' to distinguish from custom extensions.
 */
export const medusaCorePaths: Record<string, OpenApiPathItem> = {
  '/store/products': {
    get: {
      tags: ['Medusa Core Standard — Products'],
      summary: 'List Store Products (Medusa Core)',
      description:
        'Standard Medusa v2 store endpoint returning published products with price selections and inventory levels.',
      operationId: 'medusaCoreListProducts',
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        { name: 'q', in: 'query', schema: { type: 'string' } },
        { name: 'category_id', in: 'query', schema: { type: 'array', items: { type: 'string' } } },
      ],
      responses: {
        '200': {
          description: 'Medusa core products response',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  products: { type: 'array', items: { $ref: '#/components/schemas/ProductDto' } },
                  count: { type: 'integer' },
                  offset: { type: 'integer' },
                  limit: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/store/carts': {
    post: {
      tags: ['Medusa Core Standard — Cart'],
      summary: 'Create Cart (Medusa Core)',
      description: 'Standard Medusa v2 cart initialization endpoint.',
      operationId: 'medusaCoreCreateCart',
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                region_id: { type: 'string' },
                sales_channel_id: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Cart initialized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cart: { type: 'object' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/auth/customer/emailpass': {
    post: {
      tags: ['Medusa Core Standard — Native Auth'],
      summary: 'Customer EmailPass Authentication (Medusa Core Auth Module)',
      description:
        'Native Medusa v2 Auth Module provider endpoint for authenticating customers using email/password.',
      operationId: 'medusaCoreCustomerEmailPassAuth',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Authentication token returned',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/auth/user/emailpass': {
    post: {
      tags: ['Medusa Core Standard — Native Auth'],
      summary: 'Merchant User EmailPass Authentication (Medusa Core Auth Module)',
      description:
        'Native Medusa v2 Auth Module provider endpoint used by Ateevra merchant authentication engine to verify credentials.',
      operationId: 'medusaCoreUserEmailPassAuth',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email', 'password'],
              properties: {
                email: { type: 'string', format: 'email' },
                password: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Auth identity token returned',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  token: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
};
