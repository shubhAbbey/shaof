import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../middlewares/tenant-auth';
import { MerchantAuthEngine } from '../../../modules/auth/merchant-auth-engine';
import type { MerchantRole } from '@ecom/types';

/**
 * GET /merchant/team
 * Lists team members strictly scoped to the authenticated merchant.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'team:manage' permission
 * - Automatically scoped to caller's verified merchantId
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'team:manage' },
  async (req, res): Promise<void> => {
    const merchantId = req.tenantContext.merchantId!;

    try {
      const members = await MerchantAuthEngine.listTeamMembers(merchantId);
      res.status(200).json({
        success: true,
        count: members.length,
        members,
      });
    } catch (err: any) {
      console.error('[Merchant Team API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: err.message || 'Failed to list team members.',
      });
    }
  }
);

/**
 * POST /merchant/team
 * Invites a new team member to the calling merchant with an assigned role.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'team:manage' permission
 * - Caller cannot assign platform-level roles (super_admin)
 * - Permission ceiling: Admin callers cannot assign 'owner' role
 * - Validates email format and unique membership
 */
export const POST = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'team:manage' },
  async (req, res): Promise<void> => {
    const body = (req.body as any) || {};
    const { email, role } = body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      res.status(400).json({
        success: false,
        error: 'INVALID_EMAIL',
        message: 'A valid email address is required.',
      });
      return;
    }

    if (!role || typeof role !== 'string') {
      res.status(400).json({
        success: false,
        error: 'INVALID_ROLE',
        message: 'A role is required.',
      });
      return;
    }

    try {
      const member = await MerchantAuthEngine.inviteTeamMember(
        req.tenantContext,
        { email: email.trim().toLowerCase(), role: role as MerchantRole },
        ip,
        userAgent
      );

      res.status(201).json({
        success: true,
        member,
        message: 'Team member invited successfully.',
      });
    } catch (err: any) {
      const msg: string = err.message || '';

      if (msg.includes('PLATFORM_ROLE_ESCALATION_PROHIBITED')) {
        res.status(403).json({
          success: false,
          error: 'PLATFORM_ROLE_ESCALATION_PROHIBITED',
          message: 'Cannot assign platform-level roles.',
        });
        return;
      }

      if (msg.includes('CANNOT_GRANT_ROLE_ABOVE_CEILING')) {
        res.status(403).json({
          success: false,
          error: 'CANNOT_GRANT_ROLE_ABOVE_CEILING',
          message: 'Only an Owner can invite or assign another Owner.',
        });
        return;
      }

      if (msg.includes('DUPLICATE_MEMBERSHIP')) {
        res.status(409).json({
          success: false,
          error: 'DUPLICATE_MEMBERSHIP',
          message: msg,
        });
        return;
      }

      if (msg.includes('INVALID_ROLE') || msg.includes('INVALID_EMAIL')) {
        res.status(400).json({
          success: false,
          error: msg.split(':')[0],
          message: msg,
        });
        return;
      }

      if (msg.includes('NOT_FOUND')) {
        res.status(404).json({
          success: false,
          error: 'NOT_FOUND',
          message: msg,
        });
        return;
      }

      console.error('[Merchant Team API] POST error:', msg);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: msg || 'Failed to invite team member.',
      });
    }
  }
);
