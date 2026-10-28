import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../../../middlewares/tenant-auth';
import { MARKETPLACE_MODULE } from '../../../../../../modules/marketplace/index';
import { MerchantAuthEngine } from '../../../../../../modules/auth/merchant-auth-engine';
import type { MerchantStatus } from '@ecom/types';

export const AUTHENTICATE = false;

/**
 * PUT /admin/marketplace/merchants/:id/status
 * Super Admin review transition handler:
 * Executes approve, reject, request-changes, suspend, and reactivate transitions.
 *
 * Security:
 * - Requires 'admin' security boundary (Super Admin session)
 * - Separation of duties: merchant cannot self-approve
 * - Requires non-empty reason for reject, request-changes, and suspend
 * - Enforces active owner existence before approval
 * - Stale-state and transition safety
 * - Distributed session revocation across Redis when merchant is suspended
 * - Records structured platform audit history
 */
export const PUT = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const { id } = req.params;
    const body = (req.body as any) || {};
    const { action, status, reason, notes } = body;
    const actorId = req.tenantContext.userId;
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
    const userAgent = (req.headers['user-agent'] as string) || 'unknown';

    if (!id || id.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'MISSING_MERCHANT_ID',
        message: 'Merchant ID parameter is required.',
      });
      return;
    }

    // Resolve target status from explicit action or status field
    let targetStatus: MerchantStatus | undefined;

    if (action) {
      switch (action.toLowerCase()) {
        case 'approve':
          targetStatus = 'active';
          break;
        case 'reject':
          targetStatus = 'rejected';
          break;
        case 'request-changes':
        case 'request_changes':
          targetStatus = 'draft';
          break;
        case 'suspend':
          targetStatus = 'suspended';
          break;
        case 'reactivate':
          targetStatus = 'active';
          break;
        default:
          res.status(400).json({
            success: false,
            error: 'INVALID_ACTION',
            message: `Invalid review action '${action}'. Allowed actions: approve, reject, request-changes, suspend, reactivate.`,
          });
          return;
      }
    } else if (status) {
      targetStatus = status as MerchantStatus;
    } else {
      res.status(400).json({
        success: false,
        error: 'MISSING_ACTION_OR_STATUS',
        message: 'Either action (approve, reject, request-changes, suspend, reactivate) or status must be provided.',
      });
      return;
    }

    try {
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);

      const updated = await marketplaceService.transitionMerchantStatus(id.trim(), targetStatus, {
        actorType: 'super_admin',
        actorId,
        reason: reason ? String(reason).trim() : undefined,
        notes: notes ? String(notes).trim() : undefined,
      });

      // If merchant is suspended, immediately revoke all active merchant sessions
      if (targetStatus === 'suspended') {
        try {
          const members = await marketplaceService.listMerchantMembers({ merchant_id: id.trim() });
          for (const member of members || []) {
            if (member.user_id) {
              await MerchantAuthEngine.revokeAllUserSessions(member.user_id);
            }
          }
        } catch (revokeErr: any) {
          console.warn(`[MERCHANT_SUSPEND_SESSION_REVOCATION] Warning: Failed to revoke member sessions for ${id}:`, revokeErr.message);
        }
      }

      // Structured audit logging for platform status transition
      console.info(`[AUDIT] [MERCHANT_STATUS_TRANSITION] Merchant ${id.trim()} transitioned to '${targetStatus}' by admin ${actorId}. Reason: ${reason || 'N/A'}`);

      res.status(200).json({
        success: true,
        message: `Merchant status successfully updated to '${targetStatus}'.`,
        merchant: {
          id: updated.id,
          name: updated.name,
          handle: updated.handle,
          status: updated.status,
          metadata: updated.metadata,
          updated_at: updated.updated_at,
        },
      });
    } catch (err: any) {
      const msg: string = err.message || '';

      if (msg.includes('NOT_FOUND')) {
        res.status(404).json({
          success: false,
          error: 'MERCHANT_NOT_FOUND',
          message: msg,
        });
        return;
      }

      if (
        msg.includes('REJECTION_REASON_REQUIRED') ||
        msg.includes('CHANGES_REQUESTED_REASON_REQUIRED') ||
        msg.includes('SUSPENSION_REASON_REQUIRED') ||
        msg.includes('OWNER_REQUIRED') ||
        msg.includes('DIRECT_ACTIVATION_BLOCKED') ||
        msg.includes('RE_REVIEW_REQUIRED') ||
        msg.includes('SUPER_ADMIN_REQUIRED') ||
        msg.includes('INVALID_TRANSITION') ||
        msg.includes('NO_OP_TRANSITION')
      ) {
        const errorKey = msg.split(':')[0].trim();
        res.status(400).json({
          success: false,
          error: errorKey,
          message: msg,
        });
        return;
      }

      console.error('[Admin Marketplace Merchant Status API] PUT error:', msg);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: msg || 'Failed to update merchant status.',
      });
    }
  }
);
