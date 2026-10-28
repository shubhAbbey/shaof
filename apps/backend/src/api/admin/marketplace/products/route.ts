import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MARKETPLACE_MODULE } from '../../../../modules/marketplace/index';
import { BackendMarketplaceGuard } from '../../../../modules/marketplace/ownership-guard';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/products
 * Cross-merchant product catalog listing for Super Admin governance.
 * Namespaced under /admin/marketplace/products to preserve native Medusa /admin/products intact.
 *
 * Security:
 * - Requires 'admin' security boundary
 * - Allows platform-wide cross-merchant visibility
 * - Supports optional filtering by ?merchant_id=...
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const filterMerchantId = req.query?.merchant_id as string | undefined;

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
        filters: filterMerchantId ? { merchant: { id: filterMerchantId } } : undefined,
      });

      const formatted = (products || []).map((p: any) => ({
        id: p.id,
        title: p.title,
        handle: p.handle,
        description: p.description,
        merchant_id: p.merchant?.id || p.merchant_id || null,
        merchant_name: p.merchant?.name,
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
      console.error('[Admin Marketplace Products API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'QUERY_FAILED',
        message: err.message,
      });
    }
  }
);

/**
 * POST /admin/marketplace/products
 * Creates a merchant-owned product from Super Admin portal.
 * Namespaced to avoid shadowing native Medusa /admin/products.
 *
 * Security:
 * - Requires 'admin' security boundary
 * - Enforces mandatory explicit target merchant selection (blocks unassigned products)
 * - Validates target merchant exists and is active before product creation
 * - Persists product in Medusa Product Module and ownership link in Medusa Remote Link
 * - Transactional Compensation: deletes product if link establishment fails
 */
export const POST = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const body = (req.body as any) || {};
    const targetMerchantId = body.target_merchant_id || body.merchant_id || body.targetMerchantId;

    // 1. Mandatory Target Merchant Selection Assertion
    const assertion = BackendMarketplaceGuard.assertSuperAdminTargetMerchant(targetMerchantId);
    if (!assertion.allowed) {
      res.status(assertion.statusCode).json({
        success: false,
        error: assertion.error,
        message: assertion.message,
      });
      return;
    }

    if (!body.title || typeof body.title !== 'string' || body.title.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'TITLE_REQUIRED',
        message: 'Product title is required.',
      });
      return;
    }

    const cleanTargetId = targetMerchantId.trim();

    try {
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);
      const productModule: any = req.scope.resolve(Modules.PRODUCT);
      const remoteLink: any = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);

      // 2. Validate that target merchant exists and is eligible to own products
      if (marketplaceService && typeof marketplaceService.retrieveMerchant === 'function') {
        const merchant = await marketplaceService.retrieveMerchant(cleanTargetId).catch(() => null);
        if (!merchant) {
          res.status(400).json({
            success: false,
            error: 'MERCHANT_NOT_FOUND',
            message: `Target merchant '${cleanTargetId}' does not exist.`,
          });
          return;
        }

        if (merchant.status !== 'active') {
          res.status(400).json({
            success: false,
            error: 'MERCHANT_NOT_ELIGIBLE',
            message: `Target merchant '${cleanTargetId}' is not active (current status: '${merchant.status}'). Cannot assign products to inactive merchants.`,
          });
          return;
        }
      }

      const title = body.title.trim();
      const handle =
        body.handle ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');

      let createdProduct: any;

      try {
        // 3. Create product in Medusa Product Module
        const [product] = await productModule.createProducts([
          {
            title,
            handle,
            description: body.description || '',
            status: body.status || 'draft',
          },
        ]);
        createdProduct = product;

        // 4. Persist ownership link via Medusa Remote Link
        await remoteLink.create([
          {
            [MARKETPLACE_MODULE]: { merchant_id: cleanTargetId },
            [Modules.PRODUCT]: { product_id: createdProduct.id },
          },
        ]);

        res.status(201).json({
          success: true,
          merchant_id: cleanTargetId,
          product: {
            id: createdProduct.id,
            title: createdProduct.title,
            handle: createdProduct.handle,
            description: createdProduct.description,
            merchant_id: cleanTargetId,
            status: createdProduct.status,
            variants: createdProduct.variants || [],
            created_at: createdProduct.created_at,
            updated_at: createdProduct.updated_at,
          },
        });
      } catch (linkErr: any) {
        // Compensation Strategy: Roll back orphan product if link creation fails
        if (createdProduct && createdProduct.id) {
          try {
            await productModule.deleteProducts([createdProduct.id]);
            console.warn(`[COMPENSATION] Rolled back unlinked admin product '${createdProduct.id}' due to link failure.`);
          } catch (compErr: any) {
            console.error(`[COMPENSATION FAILED] Could not delete unlinked admin product '${createdProduct.id}':`, compErr.message);
          }
        }

        throw linkErr;
      }
    } catch (err: any) {
      console.error('[Admin Marketplace Products API] POST error:', err.message);
      res.status(500).json({
        success: false,
        error: 'ADMIN_PRODUCT_CREATION_FAILED',
        message: `Failed to create product or establish ownership link: ${err.message}`,
      });
    }
  }
);
