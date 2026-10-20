import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { BackendMarketplaceGuard } from '../../../modules/marketplace/ownership-guard';
import { requireTenantAuth } from '../../middlewares/tenant-auth';

/**
 * GET /merchant/orders
 * Lists orders containing items for the authenticated merchant with strict line-item isolation.
 * Resolves persisted Medusa order lines and module links.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'orders:read' permission
 * - Authoritative monetary values derived from persisted order lines
 * - Guarantees zero cross-tenant data leakage (other sellers' lines/totals are completely excluded)
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'orders:read' },
  async (req, res): Promise<void> => {
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
      });

      const scopedOrders: any[] = [];

      for (const order of orders || []) {
        // Resolve merchant links for each line item
        const mappedItems = (order.items || []).map((item: any) => ({
          ...item,
          merchantId: item.merchant?.id || item.merchant_id || '',
        }));

        // Split order line items by merchant using BackendMarketplaceGuard
        const merchantLinesMap = BackendMarketplaceGuard.splitOrderLinesByMerchant(mappedItems);
        const merchantItems = merchantLinesMap.get(merchantId) || [];

        // If the caller merchant has no line items in this order, omit completely
        if (merchantItems.length === 0) {
          continue;
        }

        // Authoritative monetary calculation from persisted line item data
        const merchantSubtotal = merchantItems.reduce(
          (sum, item) => sum + (item.total !== undefined ? item.total : ((item as any).unit_price ?? item.unitPrice ?? 0) * item.quantity),
          0
        );

        scopedOrders.push({
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
        });
      }

      res.status(200).json({
        success: true,
        count: scopedOrders.length,
        orders: scopedOrders,
      });
    } catch (err: any) {
      console.error('[Merchant Orders API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'ORDER_QUERY_FAILED',
        message: err.message,
      });
    }
  }
);
