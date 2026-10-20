import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MARKETPLACE_MODULE } from '../../../modules/marketplace/index';
import { requireTenantAuth } from '../../middlewares/tenant-auth';

/**
 * GET /merchant/products
 * Lists products strictly scoped to the authenticated merchant via Medusa v2 query engine & links.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'catalog:read' permission
 * - Automatically scopes query to verified session merchant_id via Medusa v2 module link
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'catalog:read' },
  async (req, res): Promise<void> => {
    const merchantId = req.tenantContext.merchantId!;

    try {
      const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const { data: products } = await query.graph({
        entity: 'product',
        fields: [
          'id',
          'title',
          'handle',
          'description',
          'status',
          'created_at',
          'updated_at',
          'variants.*',
          'merchant.*',
        ],
        filters: {
          merchant: {
            id: merchantId,
          },
        },
      });

      const formatted = (products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        description: p.description,
        merchant_id: merchantId,
        status: p.status,
        variants: p.variants || [],
        created_at: p.created_at,
        updated_at: p.updated_at,
      }));

      res.status(200).json({
        success: true,
        count: formatted.length,
        products: formatted,
      });
    } catch (err: any) {
      console.error('[Merchant Products API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'QUERY_FAILED',
        message: err.message,
      });
    }
  }
);

/**
 * POST /merchant/products
 * Creates a product owned by the authenticated merchant in Medusa Product Module
 * and binds the ownership link via Medusa Remote Link.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'catalog:write' permission
 * - Injects verified session merchant_id server-side
 * - Transactional Compensation: rolls back created product if remote link creation fails
 */
export const POST = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'catalog:write' },
  async (req, res): Promise<void> => {
    const merchantId = req.tenantContext.merchantId!;
    const body = (req.body as any) || {};

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'TITLE_REQUIRED',
        message: 'Product title is required.',
      });
      return;
    }

    const title = body.title.trim();
    const handle =
      body.handle ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

    const productModule: any = req.scope.resolve(Modules.PRODUCT);
    const remoteLink: any = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);

    let createdProduct: any;

    try {
      // 1. Create product in Medusa Product Module
      const [product] = await productModule.createProducts([
        {
          title,
          handle,
          description: body.description || '',
          status: body.status || 'draft',
        },
      ]);
      createdProduct = product;

      // 2. Persist ownership link via Medusa Remote Link
      await remoteLink.create([
        {
          [MARKETPLACE_MODULE]: { merchant_id: merchantId },
          [Modules.PRODUCT]: { product_id: createdProduct.id },
        },
      ]);

      res.status(201).json({
        success: true,
        product: {
          id: createdProduct.id,
          title: createdProduct.title,
          handle: createdProduct.handle,
          description: createdProduct.description,
          merchant_id: merchantId,
          status: createdProduct.status,
          variants: createdProduct.variants || [],
          created_at: createdProduct.created_at,
          updated_at: createdProduct.updated_at,
        },
      });
    } catch (err: any) {
      // Compensation Strategy: If link establishment fails, delete the orphan product
      if (createdProduct && createdProduct.id) {
        try {
          await productModule.deleteProducts([createdProduct.id]);
          console.warn(`[COMPENSATION] Rolled back unlinked product '${createdProduct.id}' due to link failure.`);
        } catch (compensationErr: any) {
          console.error(`[COMPENSATION FAILED] Could not delete unlinked product '${createdProduct.id}':`, compensationErr.message);
        }
      }

      console.error('[Merchant Products API] POST error:', err.message);
      res.status(500).json({
        success: false,
        error: 'PRODUCT_CREATION_FAILED',
        message: `Failed to create product or establish merchant ownership link: ${err.message}`,
      });
    }
  }
);
