import type { OpenApiSchema } from '../types';

/**
 * Reusable Component Schemas for ATEEVRA Commerce & Marketplace OpenAPI 3.1
 * Reflects actual TypeScript DTOs from @ecom/types and backend domain modules.
 */
export const componentSchemas: Record<string, OpenApiSchema> = {
  ErrorResponse: {
    type: 'object',
    required: ['success', 'error', 'message'],
    properties: {
      success: { type: 'boolean', const: false, example: false },
      error: {
        type: 'string',
        description: 'Machine-readable upper snake-case error code',
        example: 'UNAUTHORIZED',
      },
      message: {
        type: 'string',
        description: 'Human-readable explanation of error',
        example: 'Invalid credentials or expired session.',
      },
      details: {
        type: 'object',
        description: 'Optional granular error context or field validation errors',
      },
      cooldownSeconds: {
        type: 'integer',
        description: 'Seconds remaining before rate-limited action can be re-attempted',
        example: 900,
      },
    },
  },

  SuccessResponse: {
    type: 'object',
    required: ['success'],
    properties: {
      success: { type: 'boolean', const: true, example: true },
      message: { type: 'string', example: 'Operation completed successfully.' },
    },
  },

  CustomerDto: {
    type: 'object',
    required: ['id', 'mobile'],
    properties: {
      id: { type: 'string', example: 'cus_01HQ2ABCXYZ' },
      mobile: { type: 'string', pattern: '^\\+91[6-9]\\d{9}$', example: '+919876543210' },
      email: { type: 'string', format: 'email', nullable: true, example: 'customer@example.in' },
      firstName: { type: 'string', nullable: true, example: 'Aarav' },
      lastName: { type: 'string', nullable: true, example: 'Sharma' },
      gender: {
        type: 'string',
        enum: ['male', 'female', 'other', 'prefer_not_to_say'],
        nullable: true,
        example: 'male',
      },
      dateOfBirth: { type: 'string', format: 'date', nullable: true, example: '1995-08-15' },
      createdAt: { type: 'string', format: 'date-time', example: '2026-10-20T10:00:00.000Z' },
    },
  },

  AddressDto: {
    type: 'object',
    required: [
      'id',
      'customerId',
      'fullName',
      'mobile',
      'addressLine1',
      'city',
      'state',
      'pincode',
      'countryCode',
      'addressType',
      'isDefault',
    ],
    properties: {
      id: { type: 'string', example: 'addr_01HQ2ABCXYZ' },
      customerId: { type: 'string', example: 'cus_01HQ2ABCXYZ' },
      fullName: { type: 'string', example: 'Priya Patel' },
      mobile: { type: 'string', pattern: '^\\+91[6-9]\\d{9}$', example: '+919876543211' },
      addressLine1: { type: 'string', example: 'Flat 402, Royal Palms' },
      addressLine2: { type: 'string', nullable: true, example: 'Near MG Road Metro' },
      landmark: { type: 'string', nullable: true, example: 'Opposite Central Mall' },
      city: { type: 'string', example: 'Bengaluru' },
      state: { type: 'string', example: 'Karnataka' },
      pincode: { type: 'string', pattern: '^[1-9][0-9]{5}$', example: '560001' },
      countryCode: { type: 'string', default: 'in', example: 'in' },
      addressType: { type: 'string', enum: ['home', 'work', 'other'], example: 'home' },
      isDefault: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  WishlistDto: {
    type: 'object',
    required: ['id', 'customerId', 'variantId', 'createdAt'],
    properties: {
      id: { type: 'string', example: 'wsh_01HQXYZ' },
      customerId: { type: 'string', example: 'cus_01HQ2ABCXYZ' },
      variantId: { type: 'string', example: 'var_01HQPRODUCTVAR' },
      createdAt: { type: 'string', format: 'date-time' },
    },
  },

  MerchantStatus: {
    type: 'string',
    enum: ['draft', 'pending_approval', 'active', 'suspended', 'rejected'],
    description: 'Lifecycle state of merchant vendor organization.',
    example: 'active',
  },

  MerchantRole: {
    type: 'string',
    enum: ['owner', 'admin', 'manager', 'staff'],
    description:
      'Granular merchant role. owner: Full control & billing; admin: Team & catalog; manager: Orders & products; staff: View only.',
    example: 'admin',
  },

  MerchantMemberStatus: {
    type: 'string',
    enum: ['invited', 'active', 'suspended'],
    description: 'Status of merchant user membership.',
    example: 'active',
  },

  MerchantRegisterPayload: {
    type: 'object',
    required: ['storeName', 'handle', 'ownerEmail', 'ownerPassword', 'ownerPhone', 'gstin', 'pan'],
    properties: {
      storeName: { type: 'string', minLength: 2, example: 'Vedic Threads Apparel' },
      handle: {
        type: 'string',
        pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
        example: 'vedic-threads',
      },
      ownerEmail: { type: 'string', format: 'email', example: 'owner@vedicthreads.in' },
      ownerPassword: {
        type: 'string',
        minLength: 8,
        description: 'Password meets complexity requirements (stored in native Medusa Scrypt hash).',
        example: 'SecureStr0ngPass#2026',
      },
      ownerPhone: {
        type: 'string',
        pattern: '^\\+91[6-9]\\d{9}$',
        example: '+919876543299',
      },
      gstin: {
        type: 'string',
        pattern: '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$',
        example: '29ABCDE1234F1Z5',
      },
      pan: {
        type: 'string',
        pattern: '^[A-Z]{5}[0-9]{4}[A-Z]{1}$',
        example: 'ABCDE1234F',
      },
      ownerName: { type: 'string', example: 'Rajesh Verma' },
    },
  },

  MerchantRegisterResponse: {
    type: 'object',
    required: ['success', 'merchant', 'user', 'message'],
    properties: {
      success: { type: 'boolean', const: true },
      message: { type: 'string', example: 'Merchant onboarding initiated successfully.' },
      merchant: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'merch_01HQXYZ' },
          name: { type: 'string', example: 'Vedic Threads Apparel' },
          handle: { type: 'string', example: 'vedic-threads' },
          status: { $ref: '#/components/schemas/MerchantStatus' },
        },
      },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_01HQOWNER' },
          email: { type: 'string', format: 'email', example: 'owner@vedicthreads.in' },
          role: { $ref: '#/components/schemas/MerchantRole' },
        },
      },
    },
  },

  MerchantLoginPayload: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'owner@vedicthreads.in' },
      password: { type: 'string', example: 'SecureStr0ngPass#2026' },
    },
  },

  MerchantLoginResponse: {
    type: 'object',
    required: ['success', 'token', 'user', 'merchant'],
    properties: {
      success: { type: 'boolean', const: true },
      token: {
        type: 'string',
        description: 'Bearer token issued alongside HTTP-only ecom_merchant_sess cookie',
        example: 'sess_merch_a1b2c3d4e5f60718293a4b5c6d7e8f90',
      },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_01HQOWNER' },
          email: { type: 'string', format: 'email', example: 'owner@vedicthreads.in' },
          role: { $ref: '#/components/schemas/MerchantRole' },
        },
      },
      merchant: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'merch_01HQXYZ' },
          name: { type: 'string', example: 'Vedic Threads Apparel' },
          handle: { type: 'string', example: 'vedic-threads' },
          status: { $ref: '#/components/schemas/MerchantStatus' },
        },
      },
    },
  },

  MerchantTeamMember: {
    type: 'object',
    required: ['id', 'merchantId', 'userId', 'role', 'status', 'createdAt'],
    properties: {
      id: { type: 'string', example: 'mmbr_01HQMEMBER' },
      merchantId: { type: 'string', example: 'merch_01HQXYZ' },
      userId: { type: 'string', example: 'usr_01HQMEMBER' },
      role: { $ref: '#/components/schemas/MerchantRole' },
      status: { $ref: '#/components/schemas/MerchantMemberStatus' },
      email: { type: 'string', format: 'email', example: 'staff@vedicthreads.in' },
      name: { type: 'string', example: 'Anita Desai' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  },

  InviteMemberPayload: {
    type: 'object',
    required: ['email', 'role'],
    properties: {
      email: { type: 'string', format: 'email', example: 'manager@vedicthreads.in' },
      role: { $ref: '#/components/schemas/MerchantRole' },
      name: { type: 'string', example: 'Vikram Mehta' },
    },
  },

  UpdateMemberPayload: {
    type: 'object',
    properties: {
      role: { $ref: '#/components/schemas/MerchantRole' },
      status: { $ref: '#/components/schemas/MerchantMemberStatus' },
    },
  },

  SuperAdminLoginPayload: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'admin@ateevra.in' },
      password: { type: 'string', example: 'SuperAdminSecret#2026' },
      totpCode: {
        type: 'string',
        pattern: '^\\d{6}$',
        description: 'Optional inline 6-digit TOTP code if MFA is already enrolled',
        example: '123456',
      },
      backupCode: {
        type: 'string',
        description: 'Optional 8-character backup code if TOTP device is lost',
        example: 'A1B2C3D4',
      },
    },
  },

  SuperAdminLoginResponse: {
    type: 'object',
    required: ['success'],
    properties: {
      success: { type: 'boolean', const: true },
      requiresMfa: {
        type: 'boolean',
        description: 'True if 2-stage MFA challenge is required before issuing full admin session',
        example: false,
      },
      token: {
        type: 'string',
        nullable: true,
        description: 'Issued only when MFA is verified or not yet enrolled',
        example: 'sess_admin_99aa88bb77cc66dd55ee44ff',
      },
      user: {
        type: 'object',
        properties: {
          id: { type: 'string', example: 'usr_superadmin_01' },
          email: { type: 'string', format: 'email', example: 'admin@ateevra.in' },
          role: { type: 'string', const: 'super_admin' },
          mfaEnabled: { type: 'boolean', example: true },
        },
      },
    },
  },

  MfaSetupResponse: {
    type: 'object',
    required: ['success', 'secret', 'otpauthUrl'],
    properties: {
      success: { type: 'boolean', const: true },
      secret: {
        type: 'string',
        description: 'Base32 secret key for authenticator apps (e.g. Google Authenticator)',
        example: 'JBSWY3DPEHPK3PXP',
      },
      otpauthUrl: {
        type: 'string',
        description: 'Standard otpauth:// URI suitable for rendering as QR code',
        example: 'otpauth://totp/Ateevra%20Admin:admin@ateevra.in?secret=JBSWY3DPEHPK3PXP&issuer=Ateevra',
      },
    },
  },

  MfaVerifyPayload: {
    type: 'object',
    required: ['totpCode'],
    properties: {
      totpCode: { type: 'string', pattern: '^\\d{6}$', example: '654321' },
    },
  },

  MfaVerifyResponse: {
    type: 'object',
    required: ['success', 'message', 'backupCodes'],
    properties: {
      success: { type: 'boolean', const: true },
      message: { type: 'string', example: 'MFA verified and enabled successfully.' },
      backupCodes: {
        type: 'array',
        items: { type: 'string' },
        description: 'One-time emergency recovery codes. Displayed only once.',
        example: ['99AABB11', '88CCDD22', '77EEFF33'],
      },
    },
  },

  ProductDto: {
    type: 'object',
    required: ['id', 'title', 'handle', 'status'],
    properties: {
      id: { type: 'string', example: 'prod_01HQSHIRT' },
      title: { type: 'string', example: 'Handwoven Khadi Cotton Kurta' },
      handle: { type: 'string', example: 'handwoven-khadi-cotton-kurta' },
      description: { type: 'string', example: 'Crafted from 100% natural organic Indian cotton.' },
      status: { type: 'string', enum: ['draft', 'published', 'proposed', 'rejected'], example: 'published' },
      merchant_id: { type: 'string', nullable: true, example: 'merch_01HQXYZ' },
      variants: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'var_01HQVAR' },
            title: { type: 'string', example: 'Medium / Indigo' },
            sku: { type: 'string', example: 'VT-KURTA-MED-IND' },
            price: { type: 'number', example: 249900, description: 'Price in INR paisa (₹2,499.00)' },
          },
        },
      },
      created_at: { type: 'string', format: 'date-time' },
      updated_at: { type: 'string', format: 'date-time' },
    },
  },

  OrderDto: {
    type: 'object',
    required: ['id', 'status', 'total', 'currency_code'],
    properties: {
      id: { type: 'string', example: 'order_01HQORDER' },
      status: {
        type: 'string',
        enum: ['pending', 'completed', 'canceled', 'requires_action'],
        example: 'completed',
      },
      total: { type: 'number', description: 'Total in INR paisa', example: 499900 },
      currency_code: { type: 'string', default: 'inr', example: 'inr' },
      items: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'item_01HQITEM' },
            title: { type: 'string', example: 'Handwoven Khadi Cotton Kurta' },
            quantity: { type: 'integer', example: 2 },
            unit_price: { type: 'number', example: 249900 },
            merchant_id: { type: 'string', example: 'merch_01HQXYZ' },
          },
        },
      },
      created_at: { type: 'string', format: 'date-time' },
    },
  },

  OtpRequestPayload: {
    type: 'object',
    required: ['mobile'],
    properties: {
      mobile: { type: 'string', pattern: '^\\+91[6-9]\\d{9}$', example: '+919876543210' },
      type: {
        type: 'string',
        enum: ['login', 'register', 'profile', 'checkout'],
        default: 'login',
        example: 'login',
      },
    },
  },

  OtpVerifyPayload: {
    type: 'object',
    required: ['mobile', 'otp'],
    properties: {
      mobile: { type: 'string', pattern: '^\\+91[6-9]\\d{9}$', example: '+919876543210' },
      otp: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
      type: { type: 'string', enum: ['login', 'register', 'profile', 'checkout'], default: 'login' },
      fullName: { type: 'string', example: 'Rohan Gupta' },
      email: { type: 'string', format: 'email', example: 'rohan.gupta@example.in' },
    },
  },
};
