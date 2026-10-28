import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

/**
 * GET /store/products
 * Public Storefront Product Discovery API.
 *
 * Server-Side Catalog Isolation (M2-10 Requirement):
 * Guarantees fail-closed catalog isolation on direct native API requests:
 * 1. Only products with status === 'published' are returned.
 * 2. Only products belonging to merchants with status === 'active' are returned.
 * Products in 'draft', 'proposed', 'rejected' status, or belonging to suspended/inactive
 * merchants, are strictly filtered out server-side.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const {
    limit = 20,
    offset = 0,
    q,
    handle,
    id,
    category_id,
    collection_id,
  } = (req.query as any) || {};

  try {
    const filters: Record<string, any> = {};
    if (id) {
      filters.id = Array.isArray(id) ? id : [id];
    }
    if (handle) {
      filters.handle = handle;
    }
    if (category_id) {
      filters.categories = { id: Array.isArray(category_id) ? category_id : [category_id] };
    }
    if (collection_id) {
      filters.collection_id = Array.isArray(collection_id) ? collection_id : [collection_id];
    }

    const { data: rawProducts } = await query.graph({
      entity: 'product',
      fields: [
        'id',
        'title',
        'handle',
        'subtitle',
        'description',
        'status',
        'thumbnail',
        'images.*',
        'options.*',
        'options.values.*',
        'variants.*',
        'variants.prices.*',
        'variants.options.*',
        'categories.*',
        'collection.*',
        'tags.*',
        'metadata',
        'created_at',
        'updated_at',
        'merchant.*',
      ],
      filters,
    });

    // Authoritative M2-10 Server-Side Catalog Visibility Guard:
    // A product is visible to public store clients IF AND ONLY IF:
    // 1. product.status === 'published'
    // 2. product.merchant?.status === 'active'
    let publicProducts = (rawProducts || []).filter((p: any) => {
      const isPublished = p.status === 'published';
      const isMerchantActive = p.merchant?.status === 'active';
      return isPublished && isMerchantActive;
    });

    if (q && typeof q === 'string' && q.trim()) {
      const term = q.toLowerCase().trim();
      publicProducts = publicProducts.filter(
        (p: any) =>
          p.title?.toLowerCase().includes(term) ||
          p.description?.toLowerCase().includes(term) ||
          p.handle?.toLowerCase().includes(term)
      );
    }

    const totalCount = publicProducts.length;
    const numLimit = Math.max(1, Number(limit) || 20);
    const numOffset = Math.max(0, Number(offset) || 0);
    const paginated = publicProducts.slice(numOffset, numOffset + numLimit);

    res.status(200).json({
      products: paginated,
      count: totalCount,
      offset: numOffset,
      limit: numLimit,
    });
  } catch (err: any) {
    console.error('[Store Products API] GET error:', err.message);
    res.status(500).json({
      success: false,
      error: 'STORE_PRODUCTS_QUERY_FAILED',
      message: err.message,
    });
  }
}
