import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { InventoryService } from '../../../../../modules/marketplace/inventory-service';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/orders/:id
 * Super Admin full order detail with complete customer and multi-merchant seller context.
 *
 * Security:
 * - Requires 'admin' security boundary
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const { id } = req.params;

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
          'email',
          'customer.*',
          'shipping_address.*',
          'billing_address.*',
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

      // Fetch merchants for metadata attachment
      const { data: merchants } = await query.graph({
        entity: 'merchant',
        fields: ['id', 'name', 'handle', 'products.id'],
      }).catch(() => ({ data: [] }));

      const merchantMap = new Map<string, { id: string; name: string; handle: string }>();
      const productMerchantMap = new Map<string, string>();

      for (const m of merchants || []) {
        merchantMap.set(m.id, { id: m.id, name: m.name, handle: m.handle });
        for (const p of m.products || []) {
          productMerchantMap.set(p.id, m.id);
        }
      }

      const lineItems = (order.items || []).map((it: any) => {
        const mId = it.merchant?.id || it.merchant_id || productMerchantMap.get(it.product_id) || 'platform';
        const mMeta = merchantMap.get(mId);
        const qty = resolveQty(it);
        const unitPrice = Number(it.unit_price ?? it.unitPrice ?? 0);

        return {
          id: it.id,
          order_id: it.order_id,
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
          merchant: {
            id: mId,
            name: mMeta ? mMeta.name : 'ATEEVRA Direct',
            handle: mMeta ? mMeta.handle : 'platform',
          },
        };
      });

      const orderTotal = lineItems.reduce((acc: number, item: any) => acc + item.total, 0);

      res.status(200).json({
        success: true,
        order: {
          id: order.id,
          display_id: order.display_id,
          status: order.status,
          created_at: order.created_at,
          currency_code: order.currency_code || 'inr',
          customer_email: order.email || order.customer?.email || 'guest@ecom.local',
          shipping_address: order.shipping_address,
          billing_address: order.billing_address,
          items: lineItems,
          item_count: lineItems.length,
          total: orderTotal,
        },
      });
    } catch (err: any) {
      console.error('[Admin Orders API] GET :id error:', err.message);
      res.status(500).json({
        success: false,
        error: 'ORDER_QUERY_FAILED',
        message: err.message,
      });
    }
  }
);
