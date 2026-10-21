import type { OpenApiPathItem } from '../types';

export const merchantTeamPaths: Record<string, OpenApiPathItem> = {
  '/merchant/team': {
    get: {
      tags: ['Merchant Team Management & RBAC'],
      summary: 'List Merchant Team Members',
      description:
        'Retrieves all team members strictly scoped to the calling merchant. Enforces team:manage permission. Prevents cross-tenant information disclosure.',
      operationId: 'merchantTeamList',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      responses: {
        '200': {
          description: 'Team members retrieved successfully',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['success', 'count', 'members'],
                properties: {
                  success: { type: 'boolean', const: true },
                  count: { type: 'integer', example: 4 },
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
          description: 'Missing required permission (team:manage) or tenant boundary mismatch',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    post: {
      tags: ['Merchant Team Management & RBAC'],
      summary: 'Invite Team Member',
      description:
        'Invites a new member to the merchant organization. Enforces anti-escalation controls: merchant users cannot grant super_admin, and Admin callers cannot assign or promote to the Owner role (permission ceiling).',
      operationId: 'merchantTeamCreate',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InviteMemberPayload' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Team member invited successfully',
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
        '400': {
          description: 'Invalid email or missing fields',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '403': {
          description: 'Role escalation or ceiling violation',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '409': {
          description: 'Duplicate membership (user already belongs to this merchant)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/team/invite': {
    post: {
      tags: ['Merchant Team Management & RBAC'],
      summary: 'Dedicated Team Member Invitation Endpoint',
      description:
        'Alternative dedicated endpoint for inviting team members with role ceiling validation and duplicate detection.',
      operationId: 'merchantTeamInvite',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/InviteMemberPayload' },
          },
        },
      },
      responses: {
        '201': {
          description: 'Invitation sent successfully',
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
        '403': {
          description: 'Forbidden (Role ceiling violation or insufficient permissions)',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },
  },

  '/merchant/team/{id}': {
    put: {
      tags: ['Merchant Team Management & RBAC'],
      summary: 'Update Member Role or Status',
      description:
        'Updates role or status for a team member. Enforces sole-active-owner protection using PostgreSQL transaction-level advisory locks: demoting or suspending the sole active owner is rejected with 409 CONFLICT.',
      operationId: 'merchantTeamUpdateMember',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Member ID (mmbr_*)',
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
        '403': {
          description: 'Cross-tenant IDOR attempt, owner immutability against admin, or role ceiling violation',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
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
          description: 'Operation would leave merchant without any active owner',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
      },
    },

    delete: {
      tags: ['Merchant Team Management & RBAC'],
      summary: 'Remove Team Member from Organization',
      description:
        'Removes a member from the merchant. Enforces sole-active-owner protection: cannot remove the sole active owner. Immediately revokes all active sessions for the removed user.',
      operationId: 'merchantTeamRemoveMember',
      security: [{ MerchantCookieAuth: [] }, { MerchantBearerAuth: [] }],
      parameters: [
        {
          name: 'id',
          in: 'path',
          required: true,
          description: 'Member ID (mmbr_*)',
          schema: { type: 'string' },
        },
      ],
      responses: {
        '200': {
          description: 'Member removed and sessions revoked',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SuccessResponse' },
            },
          },
        },
        '403': {
          description: 'Admin cannot delete Owner, or cross-tenant IDOR attempt',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ErrorResponse' },
            },
          },
        },
        '409': {
          description: 'Cannot remove sole active owner',
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
