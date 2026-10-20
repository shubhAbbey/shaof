import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';
import { MerchantAuthEngine } from '../../../../modules/auth/merchant-auth-engine';
import type { MerchantRole, MerchantMemberStatus } from '@ecom/types';

/**
 * PUT /merchant/team/:id
 * Updates role or status of an existing team member in the authenticated merchant.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'team:manage' permission
 * - Cross-tenant protection: Target member must belong to caller's merchant
 * - Anti-escalation: Admin callers cannot modify an Owner
 * - Permission ceiling: Admin callers cannot promote anyone to Owner
 * - Sole Owner Protection: Cannot demote or suspend the sole active owner
 * - Session propagation: Immediately revokes sessions if suspended or role changed
 */
export const PUT = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'team:manage' },
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
        message: 'Team member updated successfully.',
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

      if (msg.includes('CANNOT_MODIFY_HIGHER_ROLE')) {
        res.status(403).json({
          success: false,
          error: 'CANNOT_MODIFY_HIGHER_ROLE',
          message: 'Admin cannot modify an Owner member.',
        });
        return;
      }

      if (msg.includes('CANNOT_GRANT_ROLE_ABOVE_CEILING')) {
        res.status(403).json({
          success: false,
          error: 'CANNOT_GRANT_ROLE_ABOVE_CEILING',
          message: 'Admin cannot promote members to Owner.',
        });
        return;
      }

      if (msg.includes('CROSS_TENANT_ACCESS_DENIED')) {
        res.status(403).json({
          success: false,
          error: 'CROSS_TENANT_ACCESS_DENIED',
          message: 'Cannot modify members belonging to another merchant.',
        });
        return;
      }

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

      console.error('[Merchant Team Member API] PUT error:', msg);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: msg || 'Failed to update team member.',
      });
    }
  }
);

/**
 * DELETE /merchant/team/:id
 * Removes a member from the authenticated merchant's team.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'team:manage' permission
 * - Cross-tenant protection: Target member must belong to caller's merchant
 * - Anti-escalation: Admin callers cannot remove an Owner
 * - Sole Owner Protection: Cannot remove the sole active owner
 * - Session propagation: Immediately revokes all active sessions for the target user
 */
export const DELETE = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'team:manage' },
  async (req, res): Promise<void> => {
    const memberId = req.params?.id;
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

    try {
      await MerchantAuthEngine.removeTeamMember(
        req.tenantContext,
        memberId,
        ip,
        userAgent
      );

      res.status(200).json({
        success: true,
        message: 'Team member removed successfully.',
      });
    } catch (err: any) {
      const msg: string = err.message || '';

      if (msg.includes('CANNOT_MODIFY_HIGHER_ROLE')) {
        res.status(403).json({
          success: false,
          error: 'CANNOT_MODIFY_HIGHER_ROLE',
          message: 'Admin cannot remove an Owner member.',
        });
        return;
      }

      if (msg.includes('CROSS_TENANT_ACCESS_DENIED')) {
        res.status(403).json({
          success: false,
          error: 'CROSS_TENANT_ACCESS_DENIED',
          message: 'Cannot remove members belonging to another merchant.',
        });
        return;
      }

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

      console.error('[Merchant Team Member API] DELETE error:', msg);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: msg || 'Failed to remove team member.',
      });
    }
  }
);
