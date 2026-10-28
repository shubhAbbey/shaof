import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MARKETPLACE_MODULE } from '../../../../modules/marketplace/index';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/moderation
 * Super Admin product moderation queue.
 * Lists all products in 'proposed' status (pending review) across all merchants.
 *
 * Security:
 * - Requires 'admin' security boundary
 * - Supports filtering by ?status= (defaults to 'proposed') and ?merchant_id=
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const statusFilter = (req.query?.status as string) || 'proposed';
    const merchantIdFilter = req.query?.merchant_id as string | undefined;
    const search = req.query?.q as string | undefined;

    try {
      const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const filters: Record<string, any> = {};

      if (statusFilter && statusFilter !== 'all') {
        filters.status = statusFilter;
      }
      if (merchantIdFilter) {
        filters.merchant = { id: merchantIdFilter };
      }

      const { data: products } = await query.graph({
        entity: 'product',
        fields: [
          'id',
          'title',
          'handle',
          'description',
          'status',
          'created_at',
          'updated_at',
          'metadata',
          'variants.*',
          'merchant.*',
        ],
        filters: Object.keys(filters).length > 0 ? filters : undefined,
      });

      let items = (products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        description: p.description,
        status: p.status,
        merchant_id: p.merchant?.id || p.merchant_id || null,
        merchant: p.merchant
          ? {
              id: p.merchant.id,
              name: p.merchant.name,
              handle: p.merchant.handle,
              status: p.merchant.status,
              email: p.merchant.email,
              phone: p.merchant.phone,
            }
          : null,
        variants: p.variants || [],
        submitted_at: p.metadata?.submittedAt || p.updated_at,
        submitted_by: p.metadata?.submittedBy || null,
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));

      if (search) {
        const queryLower = search.toLowerCase();
        items = items.filter(
          (p: any) =>
            p.title.toLowerCase().includes(queryLower) ||
            p.handle.toLowerCase().includes(queryLower) ||
            (p.merchant?.name && p.merchant.name.toLowerCase().includes(queryLower))
        );
      }

      res.status(200).json({
        success: true,
        count: items.length,
        queue: items,
      });
    } catch (err: any) {
      console.error('[Admin Moderation API] GET /moderation error:', err.message);
      res.status(500).json({
        success: false,
        error: 'QUERY_FAILED',
        message: err.message,
      });
    }
  }
);
