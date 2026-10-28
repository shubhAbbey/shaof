import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';
import { MerchantAuthEngine } from '../../../../../modules/auth/merchant-auth-engine';
import type { MerchantRole, MerchantMemberStatus } from '@ecom/types';

export const AUTHENTICATE = false;

/**
 * PUT /admin/marketplace/members/:id
 * Platform governance: Super Admin updates role or status of any merchant team member.
 *
 * Security:
 * - Requires 'admin' security boundary (Super Admin session)
 * - Enforces sole active owner protection
 * - Immediately invalidates sessions if suspended or role changed
 * - Records structured platform audit event
 */
export const PUT = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const memberId = req.params?.id;
    const body = (req.body as any) || {};
    const { role, status } = body;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    if (!memberId) {
      res.status(400).json({
        success: false,
        error: 'MISSING_MEMBER_ID',
        message: 'Member ID parameter is required.',
      });
      return;
    }

    if (!role && !status) {
      res.status(400).json({
        success: false,
        error: 'MISSING_UPDATE_FIELDS',
        message: 'At least one of role or status must be provided for update.',
      });
      return;
    }

    try {
      const member = await MerchantAuthEngine.updateTeamMember(
        req.tenantContext,
        memberId,
        {
          role: role as MerchantRole | undefined,
          status: status as MerchantMemberStatus | undefined,
        },
        ip,
        userAgent
      );

      res.status(200).json({
        success: true,
        member,
        message: 'Member updated successfully by platform administrator.',
      });
    } catch (err: any) {
      const msg: string = err.message || '';

      if (msg.includes('SOLE_OWNER_PROTECTION')) {
        res.status(409).json({
          success: false,
          error: 'SOLE_OWNER_PROTECTION',
          message: msg,
        });
        return;
      }

      if (msg.includes('MEMBER_NOT_FOUND')) {
        res.status(404).json({
          success: false,
          error: 'MEMBER_NOT_FOUND',
          message: msg,
        });
        return;
      }

      if (msg.includes('INVALID_ROLE') || msg.includes('INVALID_STATUS') || msg.includes('INVALID_TRANSITION')) {
        res.status(400).json({
          success: false,
          error: msg.split(':')[0],
          message: msg,
        });
        return;
      }

      console.error('[Admin Marketplace Member API] PUT error:', msg);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: msg || 'Failed to update member.',
      });
    }
  }
);
