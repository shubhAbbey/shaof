import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';
import { InventoryService } from '../../../../../modules/marketplace/inventory-service';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/inventory/locations
 * Lists all stock locations in the system with their assigned merchants.
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    try {
      const locations = await InventoryService.getAllStockLocationsWithMerchants();

      res.status(200).json({
        success: true,
        count: locations.length,
        locations,
      });
    } catch (err: any) {
      console.error('[Admin Stock Locations API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'LOCATIONS_QUERY_FAILED',
        message: err.message,
      });
    }
  }
);

/**
 * POST /admin/marketplace/inventory/locations
 * Assigns a stock location to a merchant.
 */
export const POST = requireTenantAuth(
  { boundary: 'admin' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const body = (req.body as any) || {};
    const { merchant_id, stock_location_id } = body;

    if (!merchant_id || typeof merchant_id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'MERCHANT_ID_REQUIRED',
        message: 'merchant_id is required.',
      });
      return;
    }

    if (!stock_location_id || typeof stock_location_id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'STOCK_LOCATION_ID_REQUIRED',
        message: 'stock_location_id is required.',
      });
      return;
    }

    try {
      await InventoryService.assignStockLocationToMerchant(merchant_id, stock_location_id);

      res.status(200).json({
        success: true,
        message: `Merchant '${merchant_id}' assigned to stock location '${stock_location_id}'.`,
      });
    } catch (err: any) {
      console.error('[Admin Stock Locations API] POST error:', err.message);
      res.status(500).json({
        success: false,
        error: 'LOCATION_ASSIGNMENT_FAILED',
        message: err.message,
      });
    }
  }
);
