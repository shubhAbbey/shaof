import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';
import { MerchantAuthEngine } from '../../../../modules/auth/merchant-auth-engine';
import type { MerchantRole, MerchantMemberStatus } from '@ecom/types';

/**
 * GET /admin/marketplace/team
 * Platform-wide directory of merchant members with cross-merchant visibility and filtering.
 *
 * Security:
 * - Requires 'admin' security boundary (Super Admin session)
 * - Optional query filter: ?merchant_id=..., ?role=..., ?status=...
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const query = (req.query as any) || {};
    const merchantId = query.merchant_id as string | undefined;
    const role = query.role as MerchantRole | undefined;
    const status = query.status as MerchantMemberStatus | undefined;

    try {
      const members = await MerchantAuthEngine.listAllPlatformMembers({
        merchantId,
        role,
        status,
      });

      res.status(200).json({
        success: true,
        count: members.length,
        members,
      });
    } catch (err: any) {
      console.error('[Admin Marketplace Team API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: err.message || 'Failed to list platform team members.',
      });
    }
  }
);
