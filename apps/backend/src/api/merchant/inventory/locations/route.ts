import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';
import { InventoryService } from '../../../../modules/marketplace/inventory-service';

export const AUTHENTICATE = false;

/**
 * GET /merchant/inventory/locations
 * Lists stock locations accessible to the authenticated merchant.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'inventory:read' permission
 * - Data-driven: returns explicit merchant-linked locations or active fulfillment centers
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'inventory:read' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const merchantId = (req as any).tenantContext.merchantId!;

    try {
      const locations = await InventoryService.getMerchantStockLocations(merchantId);

      res.status(200).json({
        success: true,
        count: locations.length,
        locations,
      });
    } catch (err: any) {
      console.error('[Merchant Inventory Locations API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'LOCATIONS_QUERY_FAILED',
        message: err.message,
      });
    }
  }
);
