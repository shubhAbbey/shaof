import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { BackendMarketplaceGuard } from '../../../../../modules/marketplace/ownership-guard';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';

/**
 * POST /merchant/products/:id/variants
 * Adds a variant to a product under parent-product ownership enforcement in Medusa Product Module.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'catalog:write' permission
 * - Enforces parent-product ownership assertion against persistent Medusa module links
 * - Strictly prevents cross-merchant variant and SKU hijacking
 */
export const POST = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'catalog:write' },
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const merchantId = req.tenantContext.merchantId!;
    const body = (req.body as any) || {};

    try {
      const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const productModule: any = req.scope.resolve(Modules.PRODUCT);

      const { data: products } = await query.graph({
        entity: 'product',
        fields: ['id', 'status', 'merchant.*'],
        filters: { id },
      });

      const product = products && products.length > 0 ? products[0] : null;
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Parent product with ID '${id}' was not found.`,
        });
        return;
      }

      // Anti-Hijacking Check: Assert parent-product ownership
      const productMerchantId = product.merchant?.id || product.merchant_id;
      const assertion = BackendMarketplaceGuard.assertMerchantProductOwnership(
        merchantId,
        productMerchantId
      );
      if (!assertion.allowed) {
        res.status(assertion.statusCode).json({
          success: false,
          error: assertion.error,
          message: assertion.message,
        });
        return;
      }

      if (!body.title || typeof body.title !== 'string') {
        res.status(400).json({
          success: false,
          error: 'TITLE_REQUIRED',
          message: 'Variant title is required.',
        });
        return;
      }

      if (!body.sku || typeof body.sku !== 'string') {
        res.status(400).json({
          success: false,
          error: 'SKU_REQUIRED',
          message: 'Variant SKU is required.',
        });
        return;
      }

      if (body.price === undefined || typeof body.price !== 'number' || body.price < 0) {
        res.status(400).json({
          success: false,
          error: 'PRICE_REQUIRED',
          message: 'Valid non-negative price is required.',
        });
        return;
      }

      const [createdVariant] = await productModule.createProductVariants([
        {
          product_id: id,
          title: body.title.trim(),
          sku: body.sku.trim().toUpperCase(),
          prices: [{ amount: body.price, currency_code: 'inr' }],
          options: body.options,
        },
      ]);

      // Re-Review Trigger: Adding a variant or new pricing to a published product resets status to proposed
      if (product.status === 'published') {
        try {
          await productModule.updateProducts({ id }, { status: 'proposed' }).catch(async () => {
            await productModule.updateProducts([{ id, status: 'proposed' }]);
          });
          console.info(
            `[AUDIT] [PRODUCT_RE_REVIEW] Variant added to published product '${id}' by merchant '${merchantId}'. Status transitioned to 'proposed'.`
          );
        } catch (updateErr: any) {
          console.warn(`[PRODUCT_RE_REVIEW] Failed to set status to proposed for ${id}:`, updateErr.message);
        }
      }

      res.status(201).json({
        success: true,
        variant: {
          id: createdVariant.id,
          productId: id,
          product_id: id,
          title: createdVariant.title,
          sku: createdVariant.sku,
          price: body.price,
          options: createdVariant.options,
          created_at: createdVariant.created_at,
        },
      });
    } catch (err: any) {
      console.error('[Merchant Products API] POST :id/variants error:', err.message);
      res.status(500).json({
        success: false,
        error: 'VARIANT_CREATION_FAILED',
        message: err.message,
      });
    }
  }
);
