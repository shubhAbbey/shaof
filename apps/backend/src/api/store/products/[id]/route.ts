import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';

/**
 * GET /store/products/:id
 * Public Storefront Single Product Retrieval API.
 *
 * Server-Side Catalog Isolation (M2-10 Requirement):
 * Guarantees fail-closed catalog isolation on direct single-product requests:
 * 1. Only products with status === 'published' are returned.
 * 2. Only products belonging to merchants with status === 'active' are returned.
 * Products in 'draft', 'proposed', 'rejected' status, or belonging to suspended/inactive
 * merchants, fail closed and return 404 Not Found.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const id = req.params?.id;

  if (!id) {
    res.status(400).json({
      message: 'Product ID parameter is required',
    });
    return;
  }

  try {
    const { data: products } = await query.graph({
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
      filters: { id },
    });

    const product = products?.[0];
    if (!product) {
      res.status(404).json({
        message: `Product with id: ${id} was not found`,
      });
      return;
    }

    // Authoritative M2-10 Server-Side Catalog Visibility Guard:
    // A product is visible to public store clients IF AND ONLY IF:
    // 1. product.status === 'published'
    // 2. product.merchant?.status === 'active'
    const isPublished = product.status === 'published';
    const merchantStatus = product.merchant?.status ?? (product.metadata?.merchant_status as string | undefined);
    const isMerchantActive = merchantStatus === 'active';

    if (!isPublished || !isMerchantActive) {
      // Fail closed: Draft, proposed, rejected, or suspended/inactive merchant products return 404
      res.status(404).json({
        message: `Product with id: ${id} was not found`,
      });
      return;
    }

    res.status(200).json({ product });
  } catch (err: any) {
    console.error(`[Store Products API] GET /store/products/${id} error:`, err.message);
    res.status(500).json({
      success: false,
      error: 'STORE_PRODUCT_RETRIEVAL_FAILED',
      message: err.message,
    });
  }
}
