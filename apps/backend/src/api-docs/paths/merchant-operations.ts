import type { OpenApiPathItem } from '../types';

export const merchantOperationsPaths: Record<string, OpenApiPathItem> = {
  '/merchant/products': {
    get: {
      tags: ['Merchant Operations — Products & Catalog'],
      summary: 'List Merchant Scoped Products',
      description:
        'Lists products strictly owned by the authenticated merchant using Medusa v2 module link filtering. Requires catalog:read permission.',
      operationId: 'merchantListProducts',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      responses: {
        '200': {
          description: 'Products owned by the caller merchant',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'products'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer' },
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
          description: 'Forbidden (Missing catalog:read permission)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    post: {
      tags: ['Merchant Operations — Products & Catalog'],
      summary: 'Create Merchant Product',
      description:
        'Creates a new product and atomically links it to the calling merchant organization. Requires catalog:write permission.',
      operationId: 'merchantCreateProduct',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['title'],
              properties: {
                title: { type: 'string', example: 'Handwoven Khadi Cotton Kurta' },
                handle: { type: 'string', example: 'handwoven-khadi-cotton-kurta' },
                description: { type: 'string', example: 'Organic 100% Indian cotton.' },
                status: { type: 'string', enum: ['draft', 'published', 'proposed'], default: 'draft' },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Product created and linked to merchant',
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
          description: 'Missing title or malformed payload',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '403': {
          description: 'Forbidden (Missing catalog:write permission)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/products/{id}': {
    get: {
      tags: ['Merchant Operations — Products & Catalog'],
      summary: 'Get Product Detail',
      description:
        'Retrieves details for a single product, strictly asserting ownership link. Prevents cross-tenant product inspection.',
      operationId: 'merchantGetProduct',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
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
          description: 'Product retrieved successfully',
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
        '403': {
          description: 'Cross-tenant access forbidden (product belongs to another merchant)',
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

    put: {
      tags: ['Merchant Operations — Products & Catalog'],
      summary: 'Update Merchant Product',
      description:
        'Updates an existing product after verifying merchant ownership link. Requires catalog:write permission.',
      operationId: 'merchantUpdateProduct',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
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
                description: { type: 'string' },
                status: { type: 'string', enum: ['draft', 'published', 'proposed'] },
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
        '403': {
          description: 'Cross-tenant update forbidden or insufficient permissions',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Merchant Operations — Products & Catalog'],
      summary: 'Delete Merchant Product',
      description:
        'Soft deletes a product and removes the merchant-product module link. Requires catalog:write permission.',
      operationId: 'merchantDeleteProduct',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
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
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '403': {
          description: 'Forbidden (Product owned by another merchant or lacking permission)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/products/{id}/variants': {
    post: {
      tags: ['Merchant Operations — Products & Catalog'],
      summary: 'Add Product Variant',
      description:
        'Creates a new SKU/variant under the specified merchant product, verifying ownership. Requires catalog:write permission.',
      operationId: 'merchantAddProductVariant',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
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
              required: ['title', 'sku'],
              properties: {
                title: { type: 'string', example: 'XL / Royal Blue' },
                sku: { type: 'string', example: 'VT-KURTA-XL-BLU' },
                price: { type: 'number', example: 269900 },
                inventory_quantity: { type: 'integer', example: 25 },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Variant added successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'variant'],
                properties: {
                  success: { type: 'boolean', const: true },
                  variant: { type: 'object' },
                },
              },
            },
          },
        },
        '403': {
          description: 'Forbidden',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/products/{id}/submit': {
    post: {
      tags: ['Merchant Operations — Products & Catalog'],
      summary: 'Submit Product for Platform Moderation',
      description:
        'Submits a draft or rejected product for Super Admin moderation review. Transitions status to proposed and records submission metadata. Requires catalog:write permission.',
      operationId: 'merchantSubmitProductForModeration',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
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
          description: 'Product submitted successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'message', 'product'],
                properties: {
                  success: { type: 'boolean', const: true },
                  message: { type: 'string', example: 'Product submitted for platform moderation successfully.' },
                  product: { $ref: '#/components/schemas/ProductDto' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Product already submitted or published',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '403': {
          description: 'Forbidden (Not owner or missing permission)',
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

  '/merchant/orders': {
    get: {
      tags: ['Merchant Operations — Orders'],
      summary: 'List Merchant Scoped Orders',
      description:
        'Lists orders that contain line items belonging to the authenticated merchant. Line items belonging to other merchants in mixed carts are redacted. Requires orders:read permission.',
      operationId: 'merchantListOrders',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      responses: {
        '200': {
          description: 'Merchant-scoped orders list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'orders'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer' },
                  orders: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/OrderDto' },
                  },
                },
              },
            },
          },
        },
        '403': {
          description: 'Forbidden (Missing orders:read permission)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/orders/{id}': {
    get: {
      tags: ['Merchant Operations — Orders'],
      summary: 'Get Merchant Order Detail',
      description:
        'Retrieves order detail with strict item filtering: only line items belonging to the caller merchant are returned. Rejects access if the order contains no items for this merchant.',
      operationId: 'merchantGetOrder',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Order ID (order_*)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Order detail scoped to caller merchant',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'order'],
                properties: {
                  success: { type: 'boolean', const: true },
                  order: { $ref: '#/components/schemas/OrderDto' },
                },
              },
            },
          },
        },
        '403': {
          description: 'Forbidden (Order contains no items for caller merchant)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '404': {
          description: 'Order not found',
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
