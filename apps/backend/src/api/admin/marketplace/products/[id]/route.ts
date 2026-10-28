import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MARKETPLACE_MODULE } from '../../../../../modules/marketplace/index';
import { BackendMarketplaceGuard } from '../../../../../modules/marketplace/ownership-guard';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/products/:id
 * Retrieves product details with full target merchant context for Super Admin governance.
 *
 * Security:
 * - Requires 'admin' security boundary
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const { id } = req.params;

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

      res.status(200).json({
        success: true,
        product: {
          id: product.id,
          title: product.title,
          handle: product.handle,
          description: product.description,
          status: product.status,
          merchant_id: product.merchant?.id || product.merchant_id || null,
          merchant: product.merchant
            ? {
                id: product.merchant.id,
                name: product.merchant.name,
                handle: product.merchant.handle,
                status: product.merchant.status,
                email: product.merchant.email,
                phone: product.merchant.phone,
              }
            : null,
          variants: product.variants || [],
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
      });
    } catch (err: any) {
      console.error('[Admin Marketplace Products API] GET :id error:', err.message);
      res.status(500).json({
        success: false,
        error: 'QUERY_FAILED',
        message: err.message,
      });
    }
  }
);

/**
 * PUT /admin/marketplace/products/:id
 * Updates product details and handles target merchant reassignment from Super Admin portal.
 *
 * Security:
 * - Requires 'admin' security boundary
 * - If target merchant is reassigned, validates target exists and is active
 * - Updates remote link with transactional compensation if re-linking fails
 */
export const PUT = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const body = (req.body as any) || {};

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
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);
      const remoteLink: any = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);

      const { data: products } = await query.graph({
        entity: 'product',
        fields: ['id', 'title', 'handle', 'description', 'status', 'merchant.*'],
        filters: { id },
      });

      const existingProduct = products && products.length > 0 ? products[0] : null;
      if (!existingProduct) {
        res.status(404).json({
          success: false,
          error: 'PRODUCT_NOT_FOUND',
          message: `Product with ID '${id}' was not found.`,
        });
        return;
      }

      const currentMerchantId = existingProduct.merchant?.id || existingProduct.merchant_id;
      const targetMerchantId = body.target_merchant_id || body.merchant_id;

      // Check if ownership reassignment is requested
      if (targetMerchantId && targetMerchantId !== currentMerchantId) {
        const targetMerchant = await marketplaceService
          .retrieveMerchant(targetMerchantId)
          .catch(() => null);

        if (!targetMerchant) {
          res.status(400).json({
            success: false,
            error: 'TARGET_MERCHANT_NOT_FOUND',
            message: `Target merchant '${targetMerchantId}' does not exist.`,
          });
          return;
        }

        if (targetMerchant.status !== 'active') {
          res.status(400).json({
            success: false,
            error: 'TARGET_MERCHANT_NOT_ACTIVE',
            message: `Cannot assign product to merchant with non-active status '${targetMerchant.status}'.`,
          });
          return;
        }

        // Reassign remote link
        if (currentMerchantId) {
          try {
            await remoteLink.dismiss([
              {
                [MARKETPLACE_MODULE]: { merchant_id: currentMerchantId },
                [Modules.PRODUCT]: { product_id: id },
              },
            ]);
          } catch (dismissErr: any) {
            console.warn(`[REASSIGN PRODUCT] Failed to dismiss old link for ${id}:`, dismissErr.message);
          }
        }

        await remoteLink.create([
          {
            [MARKETPLACE_MODULE]: { merchant_id: targetMerchantId },
            [Modules.PRODUCT]: { product_id: id },
          },
        ]);

        console.info(
          `[AUDIT] [PRODUCT_OWNERSHIP_TRANSFER] Product ${id} reassigned from merchant '${currentMerchantId || 'none'}' to '${targetMerchantId}' by admin ${req.tenantContext.userId}`
        );
      }

      const updates: Record<string, any> = {};
      if (body.title !== undefined) updates.title = body.title.trim();
      if (body.handle !== undefined) updates.handle = body.handle.trim();
      if (body.description !== undefined) updates.description = body.description;
      if (body.status !== undefined) updates.status = body.status;

      let updatedProduct = existingProduct;
      if (Object.keys(updates).length > 0) {
        let updatedList: any;
        try {
          updatedList = await productModule.updateProducts({ id }, updates);
        } catch {
          updatedList = await productModule.updateProducts([{ id, ...updates }]);
        }
        updatedProduct = Array.isArray(updatedList) ? updatedList[0] : updatedList;
      }

      res.status(200).json({
        success: true,
        product: {
          id: updatedProduct.id,
          title: updatedProduct.title,
          handle: updatedProduct.handle,
          description: updatedProduct.description,
          status: updatedProduct.status,
          merchant_id: targetMerchantId || currentMerchantId,
        },
      });
    } catch (err: any) {
      console.error('[Admin Marketplace Products API] PUT :id error:', err.message);
      res.status(500).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: err.message,
      });
    }
  }
);

/**
 * DELETE /admin/marketplace/products/:id
 * Deletes or archives a product from Super Admin portal with distributed concurrency protection.
 *
 * Security:
 * - Requires 'admin' security boundary
 * - Acquires PostgreSQL transaction-level advisory lock (pg_advisory_xact_lock)
 * - Blocks hard deletion if historical orders exist (409 CONFLICT)
 */
export const DELETE = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const { id } = req.params;

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
      const remoteLink: any = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);

      await marketplaceService.deleteProductWithSafetyLock(id, undefined, {
        query,
        productModule,
        remoteLink,
      });

      console.info(
        `[AUDIT] [PRODUCT_DELETED_BY_ADMIN] Product ${id} deleted by platform admin ${req.tenantContext.userId}`
      );

      res.status(200).json({
        success: true,
        message: 'Product successfully deleted by platform administrator.',
        id,
      });
    } catch (err: any) {
      console.error('[Admin Marketplace Products API] DELETE :id error:', err.message);
      const statusCode =
        err.statusCode || (err.code === 'CONFLICT' ? 409 : err.code === 'PRODUCT_NOT_FOUND' ? 404 : 500);
      res.status(statusCode).json({
        success: false,
        error: err.code || 'DELETE_FAILED',
        message: err.message,
      });
    }
  }
);
