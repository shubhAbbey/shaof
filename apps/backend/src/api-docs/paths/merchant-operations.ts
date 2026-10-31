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
  '/merchant/orders/{id}/fulfill': {
    post: {
      tags: ['Merchant Operations — Orders & Fulfillment'],
      summary: 'Fulfill Merchant Order Line Items',
      description:
        'Fulfills line items in an order strictly belonging to the caller merchant. Enforces orders:fulfill permission, advisory transaction locking, and unfulfilled quantity non-negativity checks. Rejects cross-tenant fulfillment attempts with 403.',
      operationId: 'merchantFulfillOrder',
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
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['items'],
              properties: {
                items: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id', 'quantity'],
                    properties: {
                      id: { type: 'string', description: 'Line item ID' },
                      quantity: { type: 'number', minimum: 1 },
                    },
                  },
                },
                carrier_name: { type: 'string', example: 'Delhivery' },
                tracking_number: { type: 'string', example: 'DEL123456789' },
                notes: { type: 'string' },
                status: { type: 'string', enum: ['fulfilled', 'shipped'], default: 'fulfilled' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Fulfillment successfully recorded',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'fulfillment'],
                properties: {
                  success: { type: 'boolean', const: true },
                  fulfillment: { type: 'object' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid quantity, already fulfilled, or item not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '403': {
          description: 'Forbidden (Cross-tenant line-item fulfillment attempt)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  '/merchant/orders/{id}/fulfillments': {
    get: {
      tags: ['Merchant Operations — Orders & Fulfillment'],
      summary: 'List Merchant Order Fulfillments',
      description:
        'Retrieves fulfillment records for an order strictly scoped to caller merchant line items.',
      operationId: 'merchantListOrderFulfillments',
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
          description: 'List of order fulfillments',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'fulfillments'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer' },
                  fulfillments: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
      },
    },
  },
  '/merchant/inventory': {
    get: {
      tags: ['Merchant Operations — Inventory'],
      summary: 'List Merchant Scoped Inventory Levels',
      description:
        'Lists inventory items and stock levels strictly scoped to the authenticated merchant. Computes available stock (stocked - reserved) and low-stock indicators.',
      operationId: 'merchantListInventory',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      parameters: [
        {
          name: 'location_id',
          in: 'query',
          schema: { type: 'string' },
          description: 'Filter stock by stock location ID',
        },
        {
          name: 'status',
          in: 'query',
          schema: { type: 'string', enum: ['in_stock', 'low_stock', 'out_of_stock'] },
          description: 'Filter by inventory status',
        },
        {
          name: 'search',
          in: 'query',
          schema: { type: 'string' },
          description: 'Search by SKU or product/variant title',
        },
      ],
      responses: {
        '200': {
          description: 'Inventory items and summary statistics',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'summary', 'inventory'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer' },
                  summary: {
                    type: 'object',
                    properties: {
                      totalSkus: { type: 'integer' },
                      inStockCount: { type: 'integer' },
                      lowStockCount: { type: 'integer' },
                      outOfStockCount: { type: 'integer' },
                      totalStockedUnits: { type: 'integer' },
                    },
                  },
                  inventory: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        sku: { type: 'string' },
                        productTitle: { type: 'string' },
                        variantTitle: { type: 'string' },
                        locationId: { type: 'string' },
                        locationName: { type: 'string' },
                        stockedQuantity: { type: 'integer' },
                        reservedQuantity: { type: 'integer' },
                        availableQuantity: { type: 'integer' },
                        isLowStock: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        '403': {
          description: 'Forbidden (Missing inventory:read permission)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  '/merchant/inventory/locations': {
    get: {
      tags: ['Merchant Operations — Inventory'],
      summary: 'List Merchant Authorized Stock Locations',
      description:
        'Lists data-driven stock locations assigned to or accessible by the authenticated merchant.',
      operationId: 'merchantListStockLocations',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      responses: {
        '200': {
          description: 'Authorized stock locations',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'locations'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer' },
                  locations: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        is_default: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  '/merchant/inventory/adjust': {
    post: {
      tags: ['Merchant Operations — Inventory'],
      summary: 'Adjust Stock Quantity with Advisory Lock',
      description:
        'Adjusts stock quantity (+/- delta or absolute set) for a merchant-owned item at an authorized location. Serialized via PostgreSQL advisory lock and enforces reservation protection.',
      operationId: 'merchantAdjustStock',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['inventory_item_id', 'location_id'],
              properties: {
                inventory_item_id: { type: 'string' },
                location_id: { type: 'string' },
                adjustment: { type: 'number', description: '+/- delta' },
                stocked_quantity: { type: 'number', description: 'new total' },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Stock adjustment result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'item'],
                properties: {
                  success: { type: 'boolean', const: true },
                  item: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      inventoryItemId: { type: 'string' },
                      locationId: { type: 'string' },
                      previousQuantity: { type: 'number' },
                      newQuantity: { type: 'number' },
                      availableQuantity: { type: 'number' },
                      isLowStock: { type: 'boolean' },
                      adjustment: { type: 'number' },
                      reason: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'Validation error or negative stock / reservation conflict',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '403': {
          description: 'Forbidden (Unowned inventory item or unauthorized location)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  '/merchant/application': {
    get: {
      tags: ['Merchant Operations — Onboarding & Lifecycle'],
      summary: 'Get Merchant Onboarding Application',
      description:
        'Retrieves current merchant application details, status, tax identifiers, verification metadata, and lifecycle audit history.',
      operationId: 'merchantGetApplication',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      responses: {
        '200': {
          description: 'Merchant application details retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'merchant'],
                properties: {
                  success: { type: 'boolean', const: true },
                  merchant: { type: 'object' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Unauthorized (Missing or invalid merchant session)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
    put: {
      tags: ['Merchant Operations — Onboarding & Lifecycle'],
      summary: 'Update Draft Merchant Application',
      description:
        'Updates business details and Indian tax identifiers (GSTIN, PAN) on a draft or rejected merchant onboarding application.',
      operationId: 'merchantUpdateApplication',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                handle: { type: 'string' },
                phone: { type: 'string' },
                businessRegistrationNumber: { type: 'string' },
                taxIdentifier: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Draft application updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'merchant'],
                properties: {
                  success: { type: 'boolean', const: true },
                  message: { type: 'string' },
                  merchant: { type: 'object' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Validation error or cannot edit non-draft application',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },
  '/merchant/application/submit': {
    post: {
      tags: ['Merchant Operations — Onboarding & Lifecycle'],
      summary: 'Submit Merchant Application for Platform Verification',
      description:
        'Formally submits a completed draft or rejected merchant application for Super Admin review. Validates presence and format of GSTIN, PAN, and phone, and transitions status from draft to pending_approval.',
      operationId: 'merchantSubmitApplication',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                handle: { type: 'string' },
                phone: { type: 'string' },
                businessRegistrationNumber: { type: 'string' },
                taxIdentifier: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Application submitted successfully (status is now pending_approval)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'merchant'],
                properties: {
                  success: { type: 'boolean', const: true },
                  message: { type: 'string' },
                  merchant: { type: 'object' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Incomplete application (missing GSTIN/PAN) or invalid status transition',
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
