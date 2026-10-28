import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';
import { MARKETPLACE_MODULE } from '../../../../modules/marketplace/index';
import type { MerchantStatus } from '@ecom/types';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/merchants
 * Super Admin review queue: lists merchants across all statuses with filtering,
 * search, pagination, and owner verification context.
 *
 * Security:
 * - Requires 'admin' security boundary (Super Admin session)
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const status = req.query?.status as MerchantStatus | undefined;
    const search = req.query?.q as string | undefined;
    const limit = req.query?.limit ? parseInt(req.query.limit as string, 10) : 50;
    const offset = req.query?.offset ? parseInt(req.query.offset as string, 10) : 0;

    try {
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);

      const filter: Record<string, any> = {};
      if (status) {
        filter.status = status;
      }

      const merchants = await marketplaceService.listMerchants(filter);

      // In-memory query filter if 'q' provided
      let filtered = merchants || [];
      if (search && search.trim().length > 0) {
        const qLower = search.trim().toLowerCase();
        filtered = filtered.filter(
          (m: any) =>
            m.name?.toLowerCase().includes(qLower) ||
            m.handle?.toLowerCase().includes(qLower) ||
            m.email?.toLowerCase().includes(qLower) ||
            m.phone?.includes(qLower)
        );
      }

      const total = filtered.length;
      const paginated = filtered.slice(offset, offset + limit);

      // Attach owner and member count details
      const detailed = await Promise.all(
        paginated.map(async (m: any) => {
          let owner = null;
          let memberCount = 0;
          try {
            const members = await marketplaceService.listMerchantMembers({ merchant_id: m.id });
            memberCount = (members || []).length;
            const ownerMember = (members || []).find((mem: any) => mem.role === 'owner');
            if (ownerMember) {
              owner = {
                userId: ownerMember.user_id,
                status: ownerMember.status,
                role: ownerMember.role,
              };
            }
          } catch {
            // Member lookup fallback
          }

          return {
            id: m.id,
            name: m.name,
            handle: m.handle,
            status: m.status,
            email: m.email,
            phone: m.phone,
            businessRegistrationNumber: m.business_registration_number,
            taxIdentifier: m.tax_identifier,
            metadata: m.metadata || {},
            owner,
            memberCount,
            created_at: m.created_at,
            updated_at: m.updated_at,
          };
        })
      );

      res.status(200).json({
        success: true,
        count: detailed.length,
        total,
        limit,
        offset,
        merchants: detailed,
      });
    } catch (err: any) {
      console.error('[Admin Marketplace Merchants API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: err.message || 'Failed to list merchants.',
      });
    }
  }
);
