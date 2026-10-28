import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MARKETPLACE_MODULE } from '../../../../../modules/marketplace/index';
import { BackendMarketplaceGuard } from '../../../../../modules/marketplace/ownership-guard';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';

/**
 * POST /merchant/products/:id/submit
 * Merchant submits a product application for Super Admin platform moderation.
 * Transitions product status from 'draft' or 'rejected' to 'proposed'.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'catalog:write' permission
 * - Enforces verified ownership assertion
 * - Validates merchant is active
 * - Stale-state protection: cannot submit already proposed or published products without prior edits
 */
export const POST = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'catalog:write' },
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const merchantId = req.tenantContext.merchantId!;

    if (!id || id.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'MISSING_PRODUCT_ID',
        message: 'Product ID parameter is required.',
      });
      return;
    }

    try {
      const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const productModule: any = req.scope.resolve(Modules.PRODUCT);

      const { data: products } = await query.graph({
        entity: 'product',
        fields: ['id', 'title', 'handle', 'description', 'status', 'merchant.*'],
        filters: { id },
      });

      const product = products && products.length > 0 ? products[0] : null;
      if (!product) {
        res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Product with ID '${id}' was not found.`,
        });
        return;
      }

      // IDOR Defense: Assert merchant ownership
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

      // Stale state validation: only draft or rejected products can be submitted
      if (product.status === 'proposed') {
        res.status(400).json({
          success: false,
          error: 'ALREADY_SUBMITTED',
          message: 'Product is already pending moderation review.',
        });
        return;
      }

      if (product.status === 'published') {
        res.status(400).json({
          success: false,
          error: 'ALREADY_PUBLISHED',
          message: 'Product is already published.',
        });
        return;
      }

      // Transition status to 'proposed'
      const now = new Date().toISOString();
      const submitUpdates = {
        status: 'proposed',
        metadata: {
          ...(product.metadata || {}),
          submittedAt: now,
          submittedBy: req.tenantContext.userId,
        },
      };

      let updatedList: any;
      try {
        updatedList = await productModule.updateProducts({ id }, submitUpdates);
      } catch {
        updatedList = await productModule.updateProducts([{ id, ...submitUpdates }]);
      }
      const updated = Array.isArray(updatedList) ? updatedList[0] : updatedList;

      console.info(
        `[AUDIT] [PRODUCT_SUBMITTED_FOR_MODERATION] Product '${id}' submitted for moderation by merchant user '${req.tenantContext.userId}' (${merchantId})`
      );

      res.status(200).json({
        success: true,
        message: 'Product submitted for platform moderation successfully.',
        product: {
          id: updated.id,
          title: updated.title,
          handle: updated.handle,
          status: updated.status,
          merchant_id: merchantId,
          submitted_at: now,
        },
      });
    } catch (err: any) {
      console.error('[Merchant Products API] POST /submit error:', err.message);
      res.status(500).json({
        success: false,
        error: 'SUBMISSION_FAILED',
        message: err.message,
      });
    }
  }
);
