import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/orders
 * Super Admin platform-wide order listing with search, merchant filtering, and seller metadata.
 *
 * Security:
 * - Requires 'admin' security boundary
 * - Can view all orders across all merchants
 * - Supports filtering by ?merchant_id=..., status, or search query
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req: MedusaRequest, res: MedusaResponse): Promise<void> => {
    const url = new URL(req.url, 'http://localhost');
    const merchantId = url.searchParams.get('merchant_id') || undefined;
    const statusFilter = url.searchParams.get('status') || undefined;
    const search = url.searchParams.get('search') || undefined;

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
      });

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

      let formatted = (orders || []).map((order: any) => {
        const lineItems = (order.items || []).map((it: any) => {
          const mId = it.merchant?.id || it.merchant_id || productMerchantMap.get(it.product_id) || 'platform';
          const mMeta = merchantMap.get(mId);
          const qty = Number(it.detail?.quantity ?? it.quantity ?? 1);
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

        return {
          id: order.id,
          display_id: order.display_id,
          status: order.status,
          created_at: order.created_at,
          currency_code: order.currency_code || 'inr',
          customer_email: order.email || order.customer?.email || 'guest@ecom.local',
          shipping_address: order.shipping_address
            ? {
                first_name: order.shipping_address.first_name,
                last_name: order.shipping_address.last_name,
                city: order.shipping_address.city,
                province: order.shipping_address.province,
                postal_code: order.shipping_address.postal_code,
                country_code: order.shipping_address.country_code,
              }
            : null,
          items: lineItems,
          item_count: lineItems.length,
          total: orderTotal,
        };
      });

      // Filter by merchant_id if requested
      if (merchantId) {
        formatted = formatted
          .map((ord: any) => {
            const matchingItems = ord.items.filter((it: any) => it.merchant.id === merchantId);
            if (matchingItems.length === 0) return null;
            return {
              ...ord,
              items: matchingItems,
              item_count: matchingItems.length,
              total: matchingItems.reduce((acc: number, it: any) => acc + it.total, 0),
            };
          })
          .filter(Boolean);
      }

      // Filter by status
      if (statusFilter) {
        formatted = formatted.filter((ord: any) => ord.status === statusFilter);
      }

      // Filter by search
      if (search && search.trim() !== '') {
        const q = search.trim().toLowerCase();
        formatted = formatted.filter(
          (ord: any) =>
            (ord.display_id && ord.display_id.toString().toLowerCase().includes(q)) ||
            (ord.customer_email && ord.customer_email.toLowerCase().includes(q)) ||
            ord.items.some((it: any) => it.title.toLowerCase().includes(q))
        );
      }

      res.status(200).json({
        success: true,
        count: formatted.length,
        orders: formatted,
      });
    } catch (err: any) {
      console.error('[Admin Orders API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'ORDER_QUERY_FAILED',
        message: err.message,
      });
    }
  }
);
