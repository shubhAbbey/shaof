import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../../../middlewares/tenant-auth';
import { FulfillmentService } from '../../../../../../modules/marketplace/fulfillment-service';

export const AUTHENTICATE = false;

/**
 * POST /admin/marketplace/orders/:id/fulfill
 * Super Admin platform order fulfillment.
 *
 * Security:
 * - Requires 'admin' security boundary (Super Admin)
 * - Allows platform administrator to fulfill items across any merchant in the order
 * - Enforces concurrency advisory locks and quantity non-negativity checks
 * - Records structured platform audit event
 */
export const POST = requireTenantAuth(
  { boundary: 'admin' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const { id } = req.params;
    const session = (req as any).tenantContext;
    const body = (req.body as any) || {};

    try {
      const fulfillment = await FulfillmentService.fulfillOrder(session, {
        orderId: id,
        items: body.items,
        carrierName: body.carrier_name || body.carrierName,
        trackingNumber: body.tracking_number || body.trackingNumber,
        notes: body.notes,
        status: body.status || 'fulfilled',
      });

      res.status(200).json({
        success: true,
        fulfillment,
      });
    } catch (err: any) {
      res.status(err.statusCode || 400).json({
        success: false,
        error: err.code || 'FULFILLMENT_FAILED',
        message: err.message,
      });
    }
  }
);
