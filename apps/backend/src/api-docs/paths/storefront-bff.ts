import type { OpenApiPathItem } from '../types';

export const storefrontBffPaths: Record<string, OpenApiPathItem> = {
  '/api/health': {
    get: {
      tags: ['Storefront BFF — System'],
      summary: 'Storefront BFF Health Check',
      description: 'Liveness and readiness health probe for Next.js 14 Storefront application.',
      operationId: 'bffHealthCheck',
      responses: {
        '200': {
          description: 'Application healthy',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  status: { type: 'string', example: 'ok' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/auth/otp/request': {
    post: {
      tags: ['Storefront BFF — Customer Authentication'],
      summary: 'Request Mobile OTP',
      description:
        'Initiates mobile OTP authentication for Indian phone numbers (+91 E.164). Rate-limited to 3 requests per 10 minutes in Redis.',
      operationId: 'bffOtpRequest',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OtpRequestPayload' },
          },
        },
      },
      responses: {
        '200': {
          description: 'OTP dispatched via SMS provider (or mock in development)',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', const: true },
                  message: { type: 'string' },
                  expiresInSeconds: { type: 'integer', example: 300 },
                },
              },
            },
          },
        },
        '429': {
          description: 'Rate limit exceeded',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/api/auth/otp/verify': {
    post: {
      tags: ['Storefront BFF — Customer Authentication'],
      summary: 'Verify Mobile OTP & Issue Session',
      description:
        'Validates 6-digit OTP against Redis. On success, creates or links customer in Medusa via S2S token, and issues HTTP-only ecom_sess cookie.',
      operationId: 'bffOtpVerify',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/OtpVerifyPayload' },
          },
        },
      },
      responses: {
        '200': {
          description: 'OTP verified, session issued',
          headers: {
            'Set-Cookie': {
              description: 'ecom_sess=<session_id>; Path=/; HttpOnly; SameSite=Lax',
              schema: { type: 'string' },
            },
          },
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'customer'],
                properties: {
                  success: { type: 'boolean', const: true },
                  customer: { $ref: '#/components/schemas/CustomerDto' },
                },
              },
            },
          },
        },
        '400': {
          description: 'Invalid or expired OTP',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/api/auth/otp/dev-fetch': {
    get: {
      tags: ['Storefront BFF — Customer Authentication'],
      summary: 'Development OTP Retrieval Helper',
      description:
        'Non-production utility endpoint to retrieve the active OTP code for automated testing. Strictly disabled in production.',
      operationId: 'bffOtpDevFetch',
      security: [{ S2SAuth: [] }],
      parameters: [
        { name: 'mobile', in: 'query', required: true, schema: { type: 'string' }, example: '+919650115620' },
        { name: 'type', in: 'query', required: false, schema: { type: 'string', enum: ['login', 'register'] }, example: 'login' },
        { name: 's2sToken', in: 'query', required: false, schema: { type: 'string' }, description: 'Alternative query parameter for S2S authorization token' },
      ],
      responses: {
        '200': {
          description: 'Dev OTP code returned',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', const: true },
                  otp: { type: 'string', example: '123456' },
                },
              },
            },
          },
        },
        '403': {
          description: 'Disabled in production',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/api/auth/session': {
    get: {
      tags: ['Storefront BFF — Customer Authentication'],
      summary: 'Get Customer Session',
      description: 'Checks customer authentication state from ecom_sess cookie.',
      operationId: 'bffAuthSession',
      security: [{ CustomerCookieAuth: [] }],
      responses: {
        '200': {
          description: 'Session status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'isAuthenticated'],
                properties: {
                  success: { type: 'boolean', const: true },
                  isAuthenticated: { type: 'boolean' },
                  customer: { $ref: '#/components/schemas/CustomerDto' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/auth/logout': {
    post: {
      tags: ['Storefront BFF — Customer Authentication'],
      summary: 'Customer Logout',
      description: 'Revokes customer session in Redis and clears ecom_sess cookie.',
      operationId: 'bffAuthLogout',
      security: [{ CustomerCookieAuth: [] }],
      responses: {
        '200': {
          description: 'Logged out successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/api/auth/customer/lookup': {
    post: {
      tags: ['Storefront BFF — Customer Authentication'],
      summary: 'Lookup Customer by Phone',
      description: 'Checks if phone number is an existing customer without leaking PII.',
      operationId: 'bffCustomerLookup',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['mobile'],
              properties: {
                mobile: { type: 'string', pattern: '^\\+91[6-9]\\d{9}$', example: '+919876543210' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Customer existence status',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', const: true },
                  exists: { type: 'boolean' },
                  mobile: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/auth/customer/register': {
    post: {
      tags: ['Storefront BFF — Customer Authentication'],
      summary: 'Register Customer Profile',
      description: 'Completes profile registration with firstName, lastName, email, gender, and dateOfBirth.',
      operationId: 'bffCustomerRegister',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['firstName', 'lastName', 'email', 'mobile'],
              properties: {
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                email: { type: 'string', format: 'email' },
                mobile: { type: 'string' },
                gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'] },
                dateOfBirth: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Customer registered',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/api/products': {
    get: {
      tags: ['Storefront BFF — Product Discovery'],
      summary: 'List Published Products',
      description: 'Lists published products with pagination and category/tag filtering.',
      operationId: 'bffListProducts',
      parameters: [
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
        { name: 'offset', in: 'query', schema: { type: 'integer', default: 0 } },
        { name: 'category_id', in: 'query', schema: { type: 'string' } },
        { name: 'q', in: 'query', schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Products list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  products: { type: 'array', items: { $ref: '#/components/schemas/ProductDto' } },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/products/{handle}': {
    get: {
      tags: ['Storefront BFF — Product Discovery'],
      summary: 'Get Product by Handle',
      description: 'Retrieves product detail by SEO handle.',
      operationId: 'bffGetProductByHandle',
      parameters: [
        { name: 'handle', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Product detail',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
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
  },

  '/api/search': {
    get: {
      tags: ['Storefront BFF — Search'],
      summary: 'Full-Text Product Search',
      description: 'Executes full-text product search with query parsing, filters, and facets.',
      operationId: 'bffSearchProducts',
      parameters: [
        { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
        { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
        { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
      ],
      responses: {
        '200': {
          description: 'Search results',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  results: { type: 'array', items: { $ref: '#/components/schemas/ProductDto' } },
                  total: { type: 'integer' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/search/suggestions': {
    get: {
      tags: ['Storefront BFF — Search'],
      summary: 'Search Autocomplete Suggestions',
      description: 'Returns real-time suggestions and popular keywords as user types.',
      operationId: 'bffSearchSuggestions',
      parameters: [
        { name: 'q', in: 'query', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Search suggestions',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  suggestions: { type: 'array', items: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/cart': {
    get: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Get Current Cart',
      description: 'Retrieves current shopping cart for customer or anonymous guest.',
      operationId: 'bffGetCart',
      responses: {
        '200': {
          description: 'Cart retrieved',
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

    post: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Create Shopping Cart',
      description: 'Creates a new cart in Medusa backend.',
      operationId: 'bffCreateCart',
      responses: {
        '201': {
          description: 'Cart created',
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

  '/api/cart/items': {
    post: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Add Item to Cart',
      description: 'Adds a product variant line item to the active cart.',
      operationId: 'bffAddCartItem',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['variantId', 'quantity'],
              properties: {
                variantId: { type: 'string' },
                quantity: { type: 'integer', minimum: 1 },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Item added to cart',
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

  '/api/cart/items/{lineId}': {
    post: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Update Cart Line Item Quantity (POST Alias)',
      description: 'Updates quantity of a line item in the cart via POST.',
      operationId: 'bffUpdateCartItemPost',
      parameters: [
        { name: 'lineId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['quantity'],
              properties: {
                quantity: { type: 'integer', minimum: 1 },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Item quantity updated',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    },

    patch: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Update Cart Line Item Quantity',
      description: 'Updates quantity of a line item in the cart.',
      operationId: 'bffUpdateCartItem',
      parameters: [
        { name: 'lineId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['quantity'],
              properties: {
                quantity: { type: 'integer', minimum: 1 },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Item quantity updated',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Remove Line Item from Cart',
      description: 'Removes an item from the cart.',
      operationId: 'bffRemoveCartItem',
      parameters: [
        { name: 'lineId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Item removed from cart',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    },
  },

  '/api/cart/address': {
    post: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Set Cart Shipping Address',
      description: 'Sets shipping and billing address on the cart.',
      operationId: 'bffSetCartAddress',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddressDto' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Address attached to cart',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    },
  },

  '/api/cart/shipping-options': {
    get: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Get Available Shipping Options',
      description: 'Calculates applicable shipping methods and delivery fees for the cart.',
      operationId: 'bffGetShippingOptions',
      responses: {
        '200': {
          description: 'List of shipping options',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  shippingOptions: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/cart/shipping-methods': {
    post: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Select Shipping Method',
      description: 'Applies selected shipping option to cart.',
      operationId: 'bffSelectShippingMethod',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['optionId'],
              properties: { optionId: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Shipping method applied',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    },
  },

  '/api/checkout/initiate': {
    post: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Initiate Checkout & Payment Session',
      description: 'Prepares payment sessions for Razorpay or Cash on Delivery.',
      operationId: 'bffInitiateCheckout',
      responses: {
        '200': {
          description: 'Checkout initiated',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    },
  },

  '/api/checkout/complete-cod': {
    post: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Complete Cash on Delivery (COD) Order',
      description: 'Completes order checkout using COD payment method.',
      operationId: 'bffCompleteCodCheckout',
      responses: {
        '200': {
          description: 'COD order completed',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', const: true },
                  order: { $ref: '#/components/schemas/OrderDto' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/checkout/verify': {
    post: {
      tags: ['Storefront BFF — Cart & Checkout'],
      summary: 'Verify Razorpay Payment & Complete Order',
      description:
        'Verifies razorpay_payment_id, razorpay_order_id, and razorpay_signature before completing order.',
      operationId: 'bffVerifyPaymentCheckout',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['razorpay_payment_id', 'razorpay_order_id', 'razorpay_signature'],
              properties: {
                razorpay_payment_id: { type: 'string' },
                razorpay_order_id: { type: 'string' },
                razorpay_signature: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Payment verified and order finalized',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', const: true },
                  order: { $ref: '#/components/schemas/OrderDto' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/webhooks/razorpay': {
    post: {
      tags: ['Storefront BFF — Webhooks'],
      summary: 'Razorpay Payment Webhook',
      description:
        'Handles asynchronous payment.captured, payment.failed, and refund.processed events from Razorpay. Validates HMAC signature via x-razorpay-signature.',
      operationId: 'bffRazorpayWebhook',
      security: [{ RazorpayWebhookSignature: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['event'],
              properties: {
                event: { type: 'string', example: 'payment.captured' },
                payload: { type: 'object' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Webhook processed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid webhook signature',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/api/account/orders': {
    get: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'List Customer Orders',
      description: 'Returns order history for the authenticated customer.',
      operationId: 'bffListAccountOrders',
      security: [{ CustomerCookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of customer orders',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  orders: { type: 'array', items: { $ref: '#/components/schemas/OrderDto' } },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/account/orders/{id}': {
    get: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Get Customer Order Detail',
      description: 'Retrieves order detail and tracking info for an order belonging to customer.',
      operationId: 'bffGetAccountOrder',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Order details',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  order: { $ref: '#/components/schemas/OrderDto' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/account/orders/{id}/cancel': {
    post: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Cancel Order',
      description: 'Cancels customer order if eligible.',
      operationId: 'bffCancelAccountOrder',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Order cancelled',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/api/account/orders/{id}/returns': {
    get: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'List Order Returns',
      description: 'Retrieves return requests and status for an order belonging to customer.',
      operationId: 'bffListOrderReturns',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Returns list',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', const: true },
                  returns: { type: 'array', items: { type: 'object' } },
                },
              },
            },
          },
        },
      },
    },

    post: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Request Order Return',
      description: 'Submits a return request for delivered order items.',
      operationId: 'bffRequestOrderReturn',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['items', 'reason'],
              properties: {
                items: { type: 'array', items: { type: 'object' } },
                reason: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Return request submitted',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/api/account/orders/{id}/refunds/cod': {
    post: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Submit COD Refund Bank Details',
      description: 'Submits customer bank account / UPI details for refunding COD orders.',
      operationId: 'bffSubmitCodRefundDetails',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['accountNumber', 'ifscCode', 'accountHolderName'],
              properties: {
                accountNumber: { type: 'string' },
                ifscCode: { type: 'string' },
                accountHolderName: { type: 'string' },
                upiId: { type: 'string' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Refund bank details saved',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/api/account/orders/{id}/refunds/prepaid': {
    post: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Query Prepaid Refund Status',
      description: 'Checks status of refund to original payment source (Razorpay).',
      operationId: 'bffQueryPrepaidRefund',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Refund status',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    },
  },

  '/api/account/orders/{id}/retry-payment': {
    post: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Retry Failed Payment',
      description: 'Creates new payment session for an order that failed payment authorization.',
      operationId: 'bffRetryOrderPayment',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'New payment session created',
          content: {
            'application/json': {
              schema: { type: 'object' },
            },
          },
        },
      },
    },
  },

  '/api/account/addresses': {
    get: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'List Saved Addresses',
      description: 'Lists saved shipping/billing addresses for authenticated customer.',
      operationId: 'bffListAddresses',
      security: [{ CustomerCookieAuth: [] }],
      responses: {
        '200': {
          description: 'List of addresses',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  addresses: { type: 'array', items: { $ref: '#/components/schemas/AddressDto' } },
                },
              },
            },
          },
        },
      },
    },

    post: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Add Saved Address',
      description: 'Adds an address to customer profile.',
      operationId: 'bffCreateAddress',
      security: [{ CustomerCookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddressDto' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Address created',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddressDto' },
            },
          },
        },
      },
    },
  },

  '/api/account/addresses/{addressId}': {
    get: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Get Single Saved Address',
      description: 'Retrieves a single address by address ID for authenticated customer.',
      operationId: 'bffGetSingleAddress',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'addressId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Address retrieved',
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
        '404': {
          description: 'Address not found or unauthorized',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    patch: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Update Saved Address',
      description: 'Updates an existing saved address with partial field changes.',
      operationId: 'bffUpdateAddress',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'addressId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/AddressDto' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Address updated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AddressDto' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Storefront BFF — Customer Account'],
      summary: 'Delete Saved Address',
      description: 'Removes a saved address.',
      operationId: 'bffDeleteAddress',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'addressId', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Address deleted',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/api/wishlist': {
    get: {
      tags: ['Storefront BFF — Wishlist'],
      summary: 'Get Customer Wishlist',
      description: 'Returns wishlist items for authenticated customer.',
      operationId: 'bffGetWishlist',
      security: [{ CustomerCookieAuth: [] }],
      responses: {
        '200': {
          description: 'Wishlist items',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  items: { type: 'array', items: { $ref: '#/components/schemas/WishlistDto' } },
                },
              },
            },
          },
        },
      },
    },

    post: {
      tags: ['Storefront BFF — Wishlist'],
      summary: 'Add to Wishlist',
      description: 'Adds item to wishlist.',
      operationId: 'bffAddToWishlist',
      security: [{ CustomerCookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['variantId'],
              properties: { variantId: { type: 'string' } },
            },
          },
        },
      },
      responses: {
        '201': {
          description: 'Item added',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/WishlistDto' },
            },
          },
        },
      },
    },
  },

  '/api/wishlist/check': {
    get: {
      tags: ['Storefront BFF — Wishlist'],
      summary: 'Check Item in Wishlist',
      description: 'Checks if item is in customer wishlist.',
      operationId: 'bffCheckWishlist',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'variantId', in: 'query', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Wishlist check result',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  inWishlist: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
  },

  '/api/wishlist/{id}': {
    delete: {
      tags: ['Storefront BFF — Wishlist'],
      summary: 'Remove from Wishlist',
      description: 'Removes item from wishlist by item ID.',
      operationId: 'bffRemoveFromWishlist',
      security: [{ CustomerCookieAuth: [] }],
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
      ],
      responses: {
        '200': {
          description: 'Item removed',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },
};
