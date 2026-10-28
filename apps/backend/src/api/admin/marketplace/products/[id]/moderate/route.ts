import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { validateProductStatusTransition, ProductLifecycleStatus } from '@ecom/types';
import { MARKETPLACE_MODULE } from '../../../../../../modules/marketplace/index';
import { requireTenantAuth } from '../../../../../middlewares/tenant-auth';

export const AUTHENTICATE = false;

/**
 * POST /admin/marketplace/products/:id/moderate
 * Super Admin review decision handler for products in moderation queue.
 * Actions:
 * - 'approve': Transitions product from 'proposed' to 'published'. Validates merchant is active.
 * - 'reject': Transitions product from 'proposed' to 'rejected'. Requires mandatory reason.
 * - 'request-changes': Transitions product from 'proposed' to 'draft'. Requires mandatory reason.
 *
 * Security:
 * - Requires 'admin' security boundary (Super Admin only)
 * - Separation of duties: merchants cannot self-moderate or publish
 * - Emits structured platform audit event
 */
export const POST = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const body = (req.body as any) || {};
    const { action, reason, notes } = body;
    const actorId = req.tenantContext.userId;

    if (!id || id.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'MISSING_PRODUCT_ID',
        message: 'Product ID parameter is required.',
      });
      return;
    }

    if (!action || !['approve', 'reject', 'request-changes'].includes(action)) {
      res.status(400).json({
        success: false,
        error: 'INVALID_MODERATION_ACTION',
        message: "Action must be one of: 'approve', 'reject', 'request-changes'.",
      });
      return;
    }

    // Reason validation
    if (['reject', 'request-changes'].includes(action) && (!reason || typeof reason !== 'string' || reason.trim() === '')) {
      const errCode = action === 'reject' ? 'REJECTION_REASON_REQUIRED' : 'CHANGES_REQUESTED_REASON_REQUIRED';
      res.status(400).json({
        success: false,
        error: errCode,
        message: `A non-empty reason is required when action is '${action}'.`,
      });
      return;
    }

    try {
      const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
      const productModule: any = req.scope.resolve(Modules.PRODUCT);
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);

      const { data: products } = await query.graph({
        entity: 'product',
        fields: ['id', 'title', 'handle', 'status', 'metadata', 'merchant.*'],
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

      // Check merchant status if approving
      const merchantId = product.merchant?.id || product.merchant_id;
      if (action === 'approve') {
        if (!merchantId) {
          res.status(400).json({
            success: false,
            error: 'UNASSIGNED_PRODUCT',
            message: 'Product does not have an assigned merchant organization.',
          });
          return;
        }

        const merchant = await marketplaceService.retrieveMerchant(merchantId).catch(() => null);
        if (!merchant || merchant.status !== 'active') {
          res.status(400).json({
            success: false,
            error: 'MERCHANT_NOT_ACTIVE',
            message: `Cannot publish product: Associated merchant '${merchantId}' is not active (status: '${merchant?.status || 'unknown'}').`,
          });
          return;
        }
      }

      const now = new Date().toISOString();
      const metadata = product.metadata || {};
      const history = Array.isArray(metadata.moderationHistory) ? [...metadata.moderationHistory] : [];

      let newStatus: 'published' | 'rejected' | 'draft';
      if (action === 'approve') {
        newStatus = 'published';
      } else if (action === 'reject') {
        newStatus = 'rejected';
      } else {
        newStatus = 'draft';
      }

      // Authoritative Product Status Transition Guard
      const transitionValidation = validateProductStatusTransition(
        product.status,
        newStatus,
        {
          actorType: 'super_admin',
          isMerchantActive: true,
          reason: reason?.trim(),
        }
      );

      if (!transitionValidation.allowed) {
        const errorKey = transitionValidation.error?.split(':')[0].trim() || 'INVALID_TRANSITION';
        res.status(400).json({
          success: false,
          error: errorKey,
          message: transitionValidation.error,
        });
        return;
      }

      if (action === 'approve') {
        metadata.approvedAt = now;
        metadata.approvedBy = actorId;
      } else if (action === 'reject') {
        metadata.rejectedAt = now;
        metadata.rejectedBy = actorId;
        metadata.rejectedReason = reason?.trim();
      } else {
        metadata.changesRequestedAt = now;
        metadata.changesRequestedBy = actorId;
        metadata.changesRequestedReason = reason?.trim();
      }

      history.push({
        action,
        fromStatus: product.status,
        toStatus: newStatus,
        decidedAt: now,
        decidedBy: actorId,
        reason: reason?.trim() || undefined,
        notes: notes?.trim() || undefined,
      });

      metadata.moderationHistory = history;

      const moderationUpdates = {
        status: newStatus,
        metadata,
      };

      let updatedList: any;
      try {
        updatedList = await productModule.updateProducts({ id }, moderationUpdates);
      } catch {
        updatedList = await productModule.updateProducts([{ id, ...moderationUpdates }]);
      }
      const updated = Array.isArray(updatedList) ? updatedList[0] : updatedList;

      console.info(
        `[AUDIT] [PRODUCT_MODERATED] Product '${id}' moderated by admin '${actorId}'. Action: '${action}' -> New status: '${newStatus}'. Reason: ${reason || 'N/A'}`
      );

      res.status(200).json({
        success: true,
        message: `Product successfully transitioned to '${newStatus}'.`,
        product: {
          id: updated.id,
          title: updated.title,
          status: updated.status,
          merchant_id: merchantId,
          updated_at: updated.updated_at,
        },
      });
    } catch (err: any) {
      console.error('[Admin Moderation API] POST /moderate error:', err.message);
      res.status(500).json({
        success: false,
        error: 'MODERATION_FAILED',
        message: err.message,
      });
    }
  }
);
