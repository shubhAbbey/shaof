import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../middlewares/tenant-auth';
import { InventoryService } from '../../../modules/marketplace/inventory-service';

export const AUTHENTICATE = false;

/**
 * GET /merchant/inventory
 * Lists inventory items and stock levels strictly scoped to the authenticated merchant.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'inventory:read' permission
 * - Query scoped to authenticated merchant_id
 * - Computes available_quantity (stocked - reserved) and low_stock flags
 * - Zero cross-tenant stock data leakage
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'inventory:read' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const merchantId = (req as any).tenantContext.merchantId!;
    const url = new URL(req.url, 'http://localhost');
    const locationId = url.searchParams.get('location_id') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const lowStockOnly = url.searchParams.get('low_stock') === 'true';
    const statusParam = url.searchParams.get('status') as any;

    try {
      const result = await InventoryService.getMerchantInventory(merchantId, {
        locationId,
        search,
        lowStockOnly,
        status: statusParam,
      });

      res.status(200).json({
        success: true,
        count: result.items.length,
        summary: result.summary,
        inventory: result.items,
      });
    } catch (err: any) {
      console.error('[Merchant Inventory API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'INVENTORY_QUERY_FAILED',
        message: err.message,
      });
    }
  }
);
