import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { MARKETPLACE_MODULE } from '../../../../modules/marketplace/index';
import { BackendMarketplaceGuard } from '../../../../modules/marketplace/ownership-guard';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';

/**
 * GET /merchant/products/:id
 * Retrieves product details with IDOR protection via Medusa v2 Query Engine & Module Links.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'catalog:read' permission
 * - Enforces server-side product ownership check against persistent module link
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'catalog:read' },
  async (req, res): Promise<void> => {
    const { id } = req.params;
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

      // IDOR Defense: Assert merchant ownership using persisted module link
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

      res.status(200).json({
        success: true,
        product: {
          id: product.id,
          title: product.title,
          handle: product.handle,
          description: product.description,
          merchant_id: merchantId,
          status: product.status,
          variants: product.variants || [],
          created_at: product.created_at,
          updated_at: product.updated_at,
        },
      });
    } catch (err: any) {
      console.error('[Merchant Products API] GET :id error:', err.message);
      res.status(500).json({
        success: false,
        error: 'QUERY_FAILED',
        message: err.message,
      });
    }
  }
);

/**
 * PUT /merchant/products/:id
 * Updates product details with IDOR protection and blocks unauthorized merchant reassignment.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'catalog:write' permission
 * - Enforces persistent ownership check
 * - Strictly blocks ordinary merchants from reassigning products to another merchant
 */
export const PUT = requireTenantAuth(
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

      // Reassignment Protection: Block attempts to reassign merchant ownership
      const clientTargetMerchant = body.merchant_id || body.target_merchant_id;
      if (clientTargetMerchant && clientTargetMerchant.trim() !== merchantId.trim()) {
        res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: 'CANNOT_REASSIGN_MERCHANT: Product merchant reassignment is not permitted through standard update endpoints. Use dedicated reassignment workflow.',
        });
        return;
      }

      // Self-Approval / Privilege Escalation Protection: Merchants cannot set privileged status (published, proposed, approved)
      if (body.status && body.status !== 'draft') {
        res.status(403).json({
          success: false,
          error: 'CANNOT_SELF_APPROVE',
          message: 'Merchants cannot set privileged status directly. Submit for platform moderation to publish.',
        });
        return;
      }

      const updates: Record<string, any> = {};
      if (body.title !== undefined) updates.title = body.title.trim();
      if (body.handle !== undefined) updates.handle = body.handle.trim();
      if (body.description !== undefined) updates.description = body.description;

      // Re-Review Trigger: Modifying a published product moves it back to proposed moderation
      const hasContentChanges =
        updates.title !== undefined || updates.handle !== undefined || updates.description !== undefined;
      if (product.status === 'published' && hasContentChanges) {
        updates.status = 'proposed';
        console.info(
          `[AUDIT] [PRODUCT_RE_REVIEW] Published product '${id}' modified by merchant '${merchantId}'. Status transitioned to 'proposed'.`
        );
      } else if (body.status !== undefined) {
        updates.status = body.status;
      }

      let updatedList: any;
      try {
        updatedList = await productModule.updateProducts({ id }, updates);
      } catch {
        updatedList = await productModule.updateProducts([{ id, ...updates }]);
      }
      const updated = Array.isArray(updatedList) ? updatedList[0] : updatedList;

      res.status(200).json({
        success: true,
        product: {
          id: updated.id,
          title: updated.title,
          handle: updated.handle,
          description: updated.description,
          merchant_id: merchantId,
          status: updated.status,
          updated_at: updated.updated_at,
        },
      });
    } catch (err: any) {
      console.error('[Merchant Products API] PUT :id error:', err.message);
      res.status(500).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: err.message,
      });
    }
  }
);

/**
 * DELETE /merchant/products/:id
 * Deletes product with IDOR protection, link teardown, and lifecycle safety checks.
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Requires 'catalog:delete' permission
 * - Enforces persistent ownership check
 * - Blocks hard deletion if product has historical orders or active stock
 */
export const DELETE = requireTenantAuth(
  { boundary: 'merchant', requiredPermission: 'catalog:delete' },
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const merchantId = req.tenantContext.merchantId!;

    try {
      const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const productModule: any = req.scope.resolve(Modules.PRODUCT);
      const remoteLink: any = req.scope.resolve(ContainerRegistrationKeys.REMOTE_LINK);
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);

      await marketplaceService.deleteProductWithSafetyLock(id, merchantId, {
        query,
        productModule,
        remoteLink,
      });

      res.status(200).json({
        success: true,
        message: 'Product successfully deleted.',
        id,
      });
    } catch (err: any) {
      console.error('[Merchant Products API] DELETE :id error:', err.message);
      const statusCode = err.statusCode || (err.code === 'CONFLICT' ? 409 : err.code === 'PRODUCT_NOT_FOUND' ? 404 : 500);
      res.status(statusCode).json({
        success: false,
        error: err.code || 'DELETE_FAILED',
        message: err.message,
      });
    }
  }
);
