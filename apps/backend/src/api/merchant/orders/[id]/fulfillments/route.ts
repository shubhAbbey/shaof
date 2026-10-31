import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';
import { FulfillmentService } from '../../../../../modules/marketplace/fulfillment-service';

export const AUTHENTICATE = false;

/**
 * GET /merchant/orders/:id/fulfillments
 * Retrieves fulfillment records for an order, strictly scoped to caller merchant's items.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'orders:read' permission
 * - Cross-tenant isolation: fulfillments and items belonging to other merchants are excluded
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'orders:read' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const { id } = req.params;
    const session = (req as any).tenantContext;

    try {
      const fulfillments = await FulfillmentService.listOrderFulfillments(session, id);

      res.status(200).json({
        success: true,
        count: fulfillments.length,
        fulfillments,
      });
    } catch (err: any) {
      res.status(err.statusCode || 500).json({
        success: false,
        error: err.code || 'INTERNAL_ERROR',
        message: err.message,
      });
    }
  }
);
