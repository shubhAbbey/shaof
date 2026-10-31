import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../../../middlewares/tenant-auth';
import { FulfillmentService } from '../../../../../../modules/marketplace/fulfillment-service';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/orders/:id/fulfillments
 * Super Admin platform order fulfillments viewer.
 *
 * Security:
 * - Requires 'admin' security boundary (Super Admin)
 * - Returns all fulfillments for the order with full merchant attribution
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
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
