import type { OpenApiPathItem } from '../types';

export const storeApisPaths: Record<string, OpenApiPathItem> = {
  '/store/customers': {
    post: {
      tags: ['Store — Customer Management (S2S)'],
      summary: 'Create or Update Customer in Medusa Customer Module',
      description:
        'Internal Server-to-Server endpoint called by Storefront BFF upon verified OTP. Requires x-s2s-auth-token header. Fails-closed in production against insecure secrets. Strips non-allowlisted metadata and keeps system fields immutable.',
      operationId: 'storeCreateOrUpdateCustomer',
      security: [{ S2SAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['mobile'],
              properties: {
                mobile: { type: 'string', pattern: '^\\+91[6-9]\\d{9}$', example: '+919876543210' },
                firstName: { type: 'string', example: 'Aarav' },
                lastName: { type: 'string', example: 'Sharma' },
                email: { type: 'string', format: 'email', example: 'aarav.sharma@example.in' },
                gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'], example: 'male' },
                dateOfBirth: { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$', example: '1995-08-15' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Existing customer updated',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'customer', 'isNew'],
                properties: {
                  success: { type: 'boolean', const: true },
                  isNew: { type: 'boolean', const: false },
                  customer: { $ref: '#/components/schemas/CustomerDto' },
                },
              },
            },
          },
        },
        '201': {
          description: 'New customer created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'customer', 'isNew'],
                properties: {
                  success: { type: 'boolean', const: true },
                  isNew: { type: 'boolean', const: true },
                  customer: { $ref: '#/components/schemas/CustomerDto' },
                },
              },
            },
          },
        },
        '401': {
          description: 'Missing or invalid x-s2s-auth-token',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/store/customers/lookup': {
    get: {
      tags: ['Store — Customer Management (S2S)'],
      summary: 'Lookup Customer by Phone or Email',
      description:
        'Checks if a customer already exists in Medusa by phone number or email. Used during login/register flow to personalize greeting.',
      operationId: 'storeLookupCustomer',
      parameters: [
        {
          name: 'phone',
          in: 'query',
          description: 'Customer phone number (+91 E.164)',
          schema: { type: 'string' },
          example: '+919876543210',
        },
        {
          name: 'email',
          in: 'query',
          description: 'Customer email address',
          schema: { type: 'string', format: 'email' },
          example: 'customer@example.in',
        },
      ],
      responses: {
        '200': {
          description: 'Lookup result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'exists'],
                properties: {
                  success: { type: 'boolean', const: true },
                  exists: { type: 'boolean', example: true },
                  customer: {
                    type: 'object',
                    nullable: true,
                    properties: {
                      id: { type: 'string' },
                      firstName: { type: 'string' },
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

  '/store/addresses': {
    get: {
      tags: ['Store — Customer Addresses'],
      summary: 'List Customer Addresses',
      description: 'Lists all saved addresses for the specified customer ID from Medusa Customer Module.',
      operationId: 'storeListAddresses',
      parameters: [
        {
          name: 'customer_id',
          in: 'query',
          required: true,
          description: 'Customer ID (cus_*)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Customer addresses retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'addresses'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer' },
                  addresses: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AddressDto' },
                  },
                },
              },
            },
          },
        },
        '400': {
          description: 'customer_id query param is missing',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    post: {
      tags: ['Store — Customer Addresses'],
      summary: 'Create Customer Address',
      description:
        'Saves a new address in Medusa Customer Module with Indian pincode validation (6-digit) and address classification (home/work/other).',
      operationId: 'storeCreateAddress',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['customerId', 'fullName', 'mobile', 'addressLine1', 'city', 'state', 'pincode'],
              properties: {
                customerId: { type: 'string' },
                fullName: { type: 'string', example: 'Priya Patel' },
                mobile: { type: 'string', pattern: '^\\+91[6-9]\\d{9}$', example: '+919876543211' },
                addressLine1: { type: 'string', example: 'Flat 402, Royal Palms' },
                addressLine2: { type: 'string', example: 'Near MG Road' },
                landmark: { type: 'string', example: 'Opp Central Mall' },
                city: { type: 'string', example: 'Bengaluru' },
                state: { type: 'string', example: 'Karnataka' },
                pincode: { type: 'string', pattern: '^[1-9][0-9]{5}$', example: '560001' },
                addressType: { type: 'string', enum: ['home', 'work', 'other'], default: 'home' },
                isDefault: { type: 'boolean', default: false },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Address created',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'address'],
                properties: {
                  success: { type: 'boolean', const: true },
                  address: { $ref: '#/components/schemas/AddressDto' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/store/addresses/{id}': {
    get: {
      tags: ['Store — Customer Addresses'],
      summary: 'Retrieve Customer Address',
      description: 'Retrieves a single customer address with customer ownership verification.',
      operationId: 'storeGetAddressById',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Address ID (addr_*)',
          schema: { type: 'string' },
        },
        {
          name: 'customer_id',
          in: 'query',
          required: true,
          description: 'Customer ID for ownership verification',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Address retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'address'],
                properties: {
                  success: { type: 'boolean', const: true },
                  address: { $ref: '#/components/schemas/AddressDto' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Address ID or customer_id query parameter missing',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '404': {
          description: 'Address not found or access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    post: {
      tags: ['Store — Customer Addresses'],
      summary: 'Update Customer Address (POST alias)',
      description: 'Updates an existing customer address (alias for PATCH /store/addresses/{id}).',
      operationId: 'storeUpdateAddressPost',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Address ID (addr_*)',
          schema: { type: 'string' },
        },
        {
          name: 'customer_id',
          in: 'query',
          required: false,
          description: 'Optional customer ID query parameter if not provided in request body',
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
                customerId: { type: 'string', description: 'Customer ID (cus_*)' },
                fullName: { type: 'string' },
                mobile: { type: 'string' },
                addressLine1: { type: 'string' },
                addressLine2: { type: 'string' },
                landmark: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' },
                countryCode: { type: 'string' },
                addressType: { type: 'string', enum: ['home', 'work', 'other'] },
                isDefault: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Address updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'address'],
                properties: {
                  success: { type: 'boolean', const: true },
                  address: { $ref: '#/components/schemas/AddressDto' },
                  addresses: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AddressDto' },
                  },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Validation failed or missing customer ID',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '404': {
          description: 'Address not found or access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    patch: {
      tags: ['Store — Customer Addresses'],
      summary: 'Update Customer Address',
      description: 'Updates an existing customer address with customer ownership verification.',
      operationId: 'storeUpdateAddressPatch',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Address ID (addr_*)',
          schema: { type: 'string' },
        },
        {
          name: 'customer_id',
          in: 'query',
          required: false,
          description: 'Optional customer ID query parameter if not provided in request body',
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
                customerId: { type: 'string', description: 'Customer ID (cus_*)' },
                fullName: { type: 'string' },
                mobile: { type: 'string' },
                addressLine1: { type: 'string' },
                addressLine2: { type: 'string' },
                landmark: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                pincode: { type: 'string' },
                countryCode: { type: 'string' },
                addressType: { type: 'string', enum: ['home', 'work', 'other'] },
                isDefault: { type: 'boolean' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Address updated successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'address'],
                properties: {
                  success: { type: 'boolean', const: true },
                  address: { $ref: '#/components/schemas/AddressDto' },
                  addresses: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/AddressDto' },
                  },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Validation failed or missing customer ID',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '404': {
          description: 'Address not found or access denied',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Store — Customer Addresses'],
      summary: 'Delete Customer Address',
      description: 'Deletes an address from Medusa Customer Module.',
      operationId: 'storeDeleteAddress',
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Address ID (addr_*)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Address deleted successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/store/wishlist': {
    get: {
      tags: ['Store — Customer Wishlist'],
      summary: 'Get Customer Wishlist',
      description: 'Retrieves all product variants saved in customer wishlist.',
      operationId: 'storeGetWishlist',
      parameters: [
        {
          name: 'customer_id',
          in: 'query',
          required: true,
          description: 'Customer ID (cus_*)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Wishlist items retrieved',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'items'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer' },
                  items: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/WishlistDto' },
                  },
                },
              },
            },
          },
        },
      },
    },

    post: {
      tags: ['Store — Customer Wishlist'],
      summary: 'Add Item to Wishlist',
      description: 'Adds a product variant to the customer wishlist.',
      operationId: 'storeAddToWishlist',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['customerId', 'variantId'],
              properties: {
                customerId: { type: 'string' },
                variantId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Item added to wishlist',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'item'],
                properties: {
                  success: { type: 'boolean', const: true },
                  item: { $ref: '#/components/schemas/WishlistDto' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/store/wishlist/check': {
    get: {
      tags: ['Store — Customer Wishlist'],
      summary: 'Check if Variant is in Wishlist',
      description: 'Checks whether a specific product variant is already in customer wishlist.',
      operationId: 'storeCheckWishlist',
      parameters: [
        { name: 'customer_id', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'variant_id', in: 'query', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Wishlist status check',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'inWishlist'],
                properties: {
                  success: { type: 'boolean', const: true },
                  inWishlist: { type: 'boolean' },
                  wishlistId: { type: 'string', nullable: true },
                },
              },
            },
          },
        },
      },
    },
  },

  '/store/wishlist/{id}': {
    delete: {
      tags: ['Store — Customer Wishlist'],
      summary: 'Remove Item from Wishlist',
      description: 'Removes an item from customer wishlist by wishlist item ID.',
      operationId: 'storeRemoveFromWishlist',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Item removed from wishlist',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/store/orders/{id}/cancel': {
    post: {
      tags: ['Store — Order Management'],
      summary: 'Cancel Customer Order',
      description:
        'Cancels an order if in cancellable state (pending or requires_action) before warehouse fulfillment begins.',
      operationId: 'storeCancelOrder',
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: false,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                reason: { type: 'string', example: 'Order placed by mistake' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Order cancelled successfully',
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
        '400': {
          description: 'Order cannot be cancelled in its current state',
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
