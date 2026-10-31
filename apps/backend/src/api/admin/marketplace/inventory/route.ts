import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';
import { InventoryService } from '../../../../modules/marketplace/inventory-service';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/inventory
 * Platform-wide inventory listing for Super Admin.
 *
 * Security:
 * - Requires 'admin' security boundary
 * - Supports filtering by merchant_id, location_id, search, low_stock, status
 * - Attaches merchant metadata
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const url = new URL(req.url, 'http://localhost');
    const merchantId = url.searchParams.get('merchant_id') || undefined;
    const locationId = url.searchParams.get('location_id') || undefined;
    const search = url.searchParams.get('search') || undefined;
    const lowStockOnly = url.searchParams.get('low_stock') === 'true';
    const statusParam = url.searchParams.get('status') as any;

    try {
      const result = await InventoryService.getPlatformInventory({
        merchantId,
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
      console.error('[Admin Marketplace Inventory API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'ADMIN_INVENTORY_QUERY_FAILED',
        message: err.message,
      });
    }
  }
);
