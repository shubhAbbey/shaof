import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { BackendMarketplaceGuard } from '../../../../modules/marketplace/ownership-guard';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';

/**
 * GET /merchant/orders/:id
 * Retrieves order details scoped strictly to the authenticated merchant's line items.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'orders:read' permission
 * - Enforces line-item ownership: if order has no items for caller merchant -> 403 FORBIDDEN
 * - Authoritative monetary values derived from persisted order lines
 * - Filters items so merchant sees ONLY their own line items (zero cross-tenant data leakage)
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'orders:read' },
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const merchantId = req.tenantContext.merchantId!;

    try {
      const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: [
          'id',
          'display_id',
          'status',
          'created_at',
          'items.id',
          'items.order_id',
          'items.product_id',
          'items.variant_id',
          'items.title',
          'items.quantity',
          'items.unit_price',
          'items.total',
          'items.fulfillment_status',
          'items.merchant.*',
        ],
        filters: { id },
      });

      const order = orders && orders.length > 0 ? orders[0] : null;
      if (!order) {
        res.status(404).json({
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: `Order with ID '${id}' was not found.`,
        });
        return;
      }

      // Map line items with resolved merchant link
      const mappedItems = (order.items || []).map((item: any) => ({
        ...item,
        merchantId: item.merchant?.id || item.merchant_id || '',
      }));

      // Split order line items by merchant
      const merchantLinesMap = BackendMarketplaceGuard.splitOrderLinesByMerchant(mappedItems);
      const merchantItems = merchantLinesMap.get(merchantId) || [];

      // If caller merchant has no items in this order, reject with 403 FORBIDDEN
      if (merchantItems.length === 0) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'Access denied: You do not have permission to view this order.',
        });
        return;
      }

      // Calculate authoritative merchant-specific subtotal
      const merchantSubtotal = merchantItems.reduce(
        (sum, item) => sum + (item.total !== undefined ? item.total : ((item as any).unit_price ?? item.unitPrice ?? 0) * item.quantity),
        0
      );

      res.status(200).json({
        success: true,
        order: {
          id: order.id,
          display_id: order.display_id,
          status: order.status,
          created_at: order.created_at,
          items: merchantItems.map((it: any) => ({
            id: it.id,
            order_id: it.order_id,
            merchantId: it.merchantId,
            product_id: it.product_id,
            variant_id: it.variant_id,
            title: it.title,
            quantity: it.quantity,
            unit_price: it.unit_price,
            total: it.total !== undefined ? it.total : it.unit_price * it.quantity,
            fulfillment_status: it.fulfillment_status,
          })),
          item_count: merchantItems.length,
          merchant_subtotal: merchantSubtotal,
        },
      });
    } catch (err: any) {
      console.error('[Merchant Orders API] GET :id error:', err.message);
      res.status(500).json({
        success: false,
        error: 'ORDER_QUERY_FAILED',
        message: err.message,
      });
    }
  }
);
