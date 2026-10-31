import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';
import { InventoryService } from '../../../../modules/marketplace/inventory-service';

export const AUTHENTICATE = false;

/**
 * POST /merchant/inventory/adjust
 * Adjusts stock quantity for a merchant-owned inventory item at an authorized stock location.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'inventory:adjust' permission
 * - Asserts item belongs to caller merchant
 * - Asserts location is authorized for caller merchant
 * - Serializes updates via PostgreSQL advisory lock
 * - Enforces non-negative stock and active reservation checks
 * - Emits structured audit logging
 */
export const POST = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'inventory:adjust' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const tenantContext = (req as any).tenantContext;
    const merchantId = tenantContext.merchantId!;
    const body = (req.body as any) || {};

    const {
      inventory_item_id,
      location_id,
      adjustment,
      stocked_quantity,
      reason,
      idempotency_key,
    } = body;

    if (!inventory_item_id || typeof inventory_item_id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'INVENTORY_ITEM_ID_REQUIRED',
        message: 'A valid inventory_item_id is required.',
      });
      return;
    }

    if (!location_id || typeof location_id !== 'string') {
      res.status(400).json({
        success: false,
        error: 'LOCATION_ID_REQUIRED',
        message: 'A valid location_id is required.',
      });
      return;
    }

    if (adjustment === undefined && stocked_quantity === undefined) {
      res.status(400).json({
        success: false,
        error: 'ADJUSTMENT_VALUE_REQUIRED',
        message: 'Either adjustment delta or stocked_quantity must be provided.',
      });
      return;
    }

    const parsedAdjustment = adjustment !== undefined ? Number(adjustment) : undefined;
    const parsedStockedQuantity = stocked_quantity !== undefined ? Number(stocked_quantity) : undefined;

    if (parsedAdjustment !== undefined && isNaN(parsedAdjustment)) {
      res.status(400).json({
        success: false,
        error: 'INVALID_ADJUSTMENT',
        message: 'Adjustment must be a valid number.',
      });
      return;
    }

    if (parsedStockedQuantity !== undefined && (isNaN(parsedStockedQuantity) || parsedStockedQuantity < 0)) {
      res.status(400).json({
        success: false,
        error: 'INVALID_STOCKED_QUANTITY',
        message: 'stocked_quantity must be a non-negative number.',
      });
      return;
    }

    try {
      const result = await InventoryService.adjustStock({
        inventoryItemId: inventory_item_id,
        locationId: location_id,
        adjustment: parsedAdjustment,
        stockedQuantity: parsedStockedQuantity,
        merchantId,
        isSuperAdmin: false,
        reason,
        actorId: tenantContext.userId,
      });

      res.status(200).json({
        success: true,
        item: result,
      });
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        error: err.error || 'ADJUSTMENT_FAILED',
        message: err.message || 'An unexpected error occurred during inventory adjustment.',
      });
    }
  }
);
