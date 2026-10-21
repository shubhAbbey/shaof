import type { OpenApiPathItem } from '../types';

export const merchantAuthPaths: Record<string, OpenApiPathItem> = {
  '/merchant/auth/register': {
    post: {
      tags: ['Merchant Authentication & Onboarding'],
      summary: 'Merchant Store Registration & Onboarding',
      description:
        'Registers a new vendor store in draft status and provisions the owner user using native Medusa v2 Auth emailpass provider. Enforces strict Indian compliance validation (GSTIN, PAN, Phone +91 E.164, alphanumeric handle). Orchestrates atomic compensation rollback if any creation step fails, guaranteeing zero orphaned merchants, users, or credentials.',
      operationId: 'merchantAuthRegister',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MerchantRegisterPayload' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Merchant registered successfully in draft status',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MerchantRegisterResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid GSTIN, PAN, phone number, or handle format',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '409': {
          description: 'Store handle or email already registered',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/auth/login': {
    post: {
      tags: ['Merchant Authentication & Onboarding'],
      summary: 'Merchant User Login',
      description:
        'Authenticates merchant credentials via native Medusa v2 Scrypt password verification with distributed Redis rate limiting (5 attempts per 15 min window). Issues both an HTTP-only ecom_merchant_sess cookie and a Bearer token (sess_merch_*). Enforces store and member lifecycle status gating.',
      operationId: 'merchantAuthLogin',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MerchantLoginPayload' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful, session issued',
          headers: {
            'Set-Cookie': {
              description: 'ecom_merchant_sess=sess_merch_*; Path=/merchant; HttpOnly; SameSite=Strict',
              schema: { type: 'string' },
            },
          },
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MerchantLoginResponse' },
            },
          },
        },
        '401': {
          description: 'Invalid email or password',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '403': {
          description: 'Merchant store or member is suspended/rejected/draft',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '429': {
          description: 'Too many failed login attempts (account locked for 15 minutes)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/auth/session': {
    get: {
      tags: ['Merchant Authentication & Onboarding'],
      summary: 'Merchant Active Session Verification',
      description:
        'Validates merchant session from cookie or Bearer token, refreshes the sliding 2-hour idle TTL (max 24h absolute TTL), and verifies live status against PostgreSQL.',
      operationId: 'merchantAuthSession',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      responses: {
        '200': {
          description: 'Active session is valid',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'authenticated', 'user', 'merchant'],
                properties: {
                  success: { type: 'boolean', const: true },
                  authenticated: { type: 'boolean', const: true },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      role: { $ref: '#/components/schemas/MerchantRole' },
                      status: { $ref: '#/components/schemas/MerchantMemberStatus' },
                    },
                  },
                  merchant: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      name: { type: 'string' },
                      handle: { type: 'string' },
                      status: { $ref: '#/components/schemas/MerchantStatus' },
                    },
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Session missing, expired, or globally revoked',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '403': {
          description: 'Merchant store or user account suspended',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/auth/logout': {
    post: {
      tags: ['Merchant Authentication & Onboarding'],
      summary: 'Merchant Logout',
      description:
        'Revokes the current merchant session token in Redis and clears the HTTP-only ecom_merchant_sess cookie.',
      operationId: 'merchantAuthLogout',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
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

  '/merchant/auth/forgot-password': {
    post: {
      tags: ['Merchant Authentication & Onboarding'],
      summary: 'Request Password Reset Token',
      description:
        'Generates a single-use 15-minute cryptographically secure password reset token for the specified merchant email.',
      operationId: 'merchantAuthForgotPassword',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['email'],
              properties: {
                email: { type: 'string', format: 'email', example: 'owner@vedicthreads.in' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password reset request acknowledged (token sent out-of-band)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/auth/reset-password': {
    post: {
      tags: ['Merchant Authentication & Onboarding'],
      summary: 'Reset Password Using Token',
      description:
        'Consumes the single-use reset token atomically, updates credentials via Medusa native auth provider, and globally invalidates all active sessions for the user.',
      operationId: 'merchantAuthResetPassword',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              required: ['token', 'newPassword'],
              properties: {
                token: { type: 'string', description: '15-minute reset token' },
                newPassword: { type: 'string', minLength: 8, example: 'NewStr0ngSecret#2026' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Password reset successfully; previous sessions revoked',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid or expired reset token',
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
