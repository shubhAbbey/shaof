import type { OpenApiPathItem } from '../types';

export const adminAuthPaths: Record<string, OpenApiPathItem> = {
  '/admin/auth/login': {
    post: {
      tags: ['Super Admin Authentication'],
      summary: 'Super Admin Primary Authentication',
      description:
        'Authenticates a platform Super Admin using Scrypt password verification, distributed rate limiting (3 failed attempts per 15 min window in Redis), and supports optional inline or 2-stage TOTP/backup-code challenges.',
      operationId: 'adminAuthLogin',
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/SuperAdminLoginPayload' },
          },
        },
      },
      responses: {
        '200': {
          description: 'Login successful (or MFA challenge indicated)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuperAdminLoginResponse' },
            },
          },
        },
        '400': {
          description: 'Missing or malformed credentials',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '401': {
          description: 'Invalid email, password, or MFA code',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '429': {
          description: 'Rate limit exceeded (account locked for 15 minutes)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/auth/logout': {
    post: {
      tags: ['Super Admin Authentication'],
      summary: 'Super Admin Logout',
      description:
        'Revokes the current Super Admin session token in Redis and clears the HTTP-only ecom_admin_sess cookie.',
      operationId: 'adminAuthLogout',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      responses: {
        '200': {
          description: 'Session revoked successfully',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/auth/session': {
    get: {
      tags: ['Super Admin Authentication'],
      summary: 'Super Admin Session Check',
      description:
        'Validates active Super Admin session from cookie or Bearer token, refreshes the sliding 2-hour idle TTL, and returns user identity.',
      operationId: 'adminAuthSession',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      responses: {
        '200': {
          description: 'Session is valid and active',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'authenticated', 'user'],
                properties: {
                  success: { type: 'boolean', const: true },
                  authenticated: { type: 'boolean', const: true },
                  user: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      email: { type: 'string' },
                      role: { type: 'string', const: 'super_admin' },
                      mfaEnabled: { type: 'boolean' },
                    },
                  },
                },
              },
            },
          },
        },
        '401': {
          description: 'Session expired, missing, or revoked',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/auth/mfa/setup': {
    post: {
      tags: ['Super Admin MFA'],
      summary: 'Initiate TOTP Multi-Factor Authentication Enrollment',
      description:
        'Generates a new RFC 6238 TOTP Base32 secret and otpauth URI for enrollment in authenticator apps (e.g. Google Authenticator, Authy).',
      operationId: 'adminAuthMfaSetup',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      responses: {
        '200': {
          description: 'MFA setup secret generated',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MfaSetupResponse' },
            },
          },
        },
        '401': {
          description: 'Unauthorized admin session',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/auth/mfa/verify': {
    post: {
      tags: ['Super Admin MFA'],
      summary: 'Verify TOTP Enrollment & Issue Backup Codes',
      description:
        'Verifies a 6-digit TOTP code against the pending MFA secret. Upon successful verification, enables MFA on the admin account and generates single-use recovery backup codes.',
      operationId: 'adminAuthMfaVerify',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/MfaVerifyPayload' },
          },
        },
      },
      responses: {
        '200': {
          description: 'MFA verified and backup codes issued',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/MfaVerifyResponse' },
            },
          },
        },
        '400': {
          description: 'Invalid TOTP code or pending secret expired',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/admin/auth/step-up': {
    post: {
      tags: ['Super Admin MFA'],
      summary: 'MFA Step-Up Challenge Verification',
      description:
        'Verifies a fresh TOTP code or backup code before executing highly privileged operations (such as merchant suspension or platform role modifications).',
      operationId: 'adminAuthStepUp',
      security: [{ AdminCookieAuth: [] }, { AdminBearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                totpCode: { type: 'string', pattern: '^\\d{6}$', example: '123456' },
                backupCode: { type: 'string', example: 'A1B2C3D4' },
              },
            },
          },
        },
      },
      responses: {
        '200': {
          description: 'Step-up challenge validated; fresh elevated token granted',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '401': {
          description: 'Invalid step-up verification code',
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
