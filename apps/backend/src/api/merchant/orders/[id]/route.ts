import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { BackendMarketplaceGuard } from '../../../../modules/marketplace/ownership-guard';
import { InventoryService } from '../../../../modules/marketplace/inventory-service';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';

export const AUTHENTICATE = false;

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
 * - Minimizes customer PII exposure to necessary delivery context
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'orders:read' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const { id } = req.params;
    const merchantId = (req as any).tenantContext.merchantId!;

    try {
      const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const { data: orders } = await query.graph({
        entity: 'order',
        fields: [
          'id',
          'display_id',
          'status',
          'created_at',
          'currency_code',
          'shipping_address.*',
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
          'items.detail.*',
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

      // Ensure line item quantities are accurately hydrated from order_item when genuinely absent in graph
      const missingQtyLineIds = (order.items || [])
        .filter(
          (it: any) =>
            (it.quantity === undefined || it.quantity === null) &&
            (it.detail?.quantity === undefined || it.detail?.quantity === null)
        )
        .map((it: any) => it.id);

      if (missingQtyLineIds.length > 0) {
        try {
          const pool = InventoryService.getPool();
          const oiRes = await pool.query(
            `SELECT item_id, quantity FROM order_item WHERE order_id = $1 AND item_id = ANY($2)`,
            [id, missingQtyLineIds]
          );
          const qtyMap = new Map<string, number>();
          for (const row of oiRes.rows) {
            qtyMap.set(row.item_id, Number(row.quantity));
          }
          for (const it of order.items || []) {
            if (qtyMap.has(it.id)) {
              it.quantity = qtyMap.get(it.id);
            }
          }
        } catch {
          // Fall back gracefully if direct table query unavailable
        }
      }

      const resolveQty = (it: any): number => {
        if (it.quantity !== undefined && it.quantity !== null) return Number(it.quantity);
        if (it.detail?.quantity !== undefined && it.detail?.quantity !== null) return Number(it.detail.quantity);
        return 1;
      };

      // Also check product links for fallback seller resolution
      const { data: productLinks } = await query.graph({
        entity: 'merchant',
        fields: ['id', 'products.id'],
      }).catch(() => ({ data: [] }));

      const productMerchantMap = new Map<string, string>();
      for (const m of productLinks || []) {
        for (const p of m.products || []) {
          productMerchantMap.set(p.id, m.id);
        }
      }

      // Map line items with resolved merchant link
      const mappedItems = (order.items || []).map((item: any) => ({
        ...item,
        merchantId: item.merchant?.id || item.merchant_id || productMerchantMap.get(item.product_id) || '',
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
        (sum: number, item: any) => {
          const qty = resolveQty(item);
          const unitPrice = Number(item.unit_price ?? item.unitPrice ?? 0);
          return (
            sum +
            (item.total !== undefined && item.total !== null
              ? Number(item.total)
              : unitPrice * qty)
          );
        },
        0
      );

      res.status(200).json({
        success: true,
        order: {
          id: order.id,
          display_id: order.display_id,
          status: order.status,
          created_at: order.created_at,
          currency_code: order.currency_code || 'inr',
          shipping_destination: order.shipping_address
            ? {
                city: order.shipping_address.city,
                province: order.shipping_address.province,
                postal_code: order.shipping_address.postal_code,
                country_code: order.shipping_address.country_code,
              }
            : null,
          items: merchantItems.map((it: any) => {
            const qty = resolveQty(it);
            const unitPrice = Number(it.unit_price ?? it.unitPrice ?? 0);
            return {
              id: it.id,
              order_id: it.order_id,
              merchantId: it.merchantId,
              product_id: it.product_id,
              variant_id: it.variant_id,
              title: it.title,
              quantity: qty,
              unit_price: unitPrice,
              total:
                it.total !== undefined && it.total !== null
                  ? Number(it.total)
                  : unitPrice * qty,
              fulfillment_status: it.fulfillment_status,
            };
          }),
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
