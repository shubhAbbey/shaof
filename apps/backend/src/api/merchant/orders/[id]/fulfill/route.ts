import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';
import { FulfillmentService } from '../../../../../modules/marketplace/fulfillment-service';

export const AUTHENTICATE = false;

/**
 * POST /merchant/orders/:id/fulfill
 * Merchant-initiated order line item fulfillment.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'orders:fulfill' permission
 * - Enforces line-item ownership: caller cannot fulfill items belonging to another merchant (403)
 * - Advisory locking prevents concurrent duplicate fulfillment race conditions
 * - Validates unfulfilled quantities: rejects over-fulfillment (400)
 * - Manual shipping references (carrier name, tracking reference text) recorded without synthetic carrier APIs
 */
export const POST = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'orders:fulfill' },
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
      const statusCode = err.statusCode || (err.code === 'CROSS_TENANT_FULFILLMENT_FORBIDDEN' ? 403 : 400);
      res.status(statusCode).json({
        success: false,
        error: err.code || 'FULFILLMENT_FAILED',
        message: err.message,
      });
    }
  }
);
