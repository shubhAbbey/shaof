import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';
import { MARKETPLACE_MODULE } from '../../../../../modules/marketplace/index';

export const AUTHENTICATE = false;

/**
 * GET /admin/marketplace/merchants/:id
 * Super Admin merchant application detail view: retrieves full profile,
 * verification metadata, owner details, team members, product count, and audit lifecycle history.
 *
 * Security:
 * - Requires 'admin' security boundary (Super Admin session)
 */
export const GET = requireTenantAuth(
  { boundary: 'admin' },
  async (req, res): Promise<void> => {
    const { id } = req.params;

    if (!id || id.trim() === '') {
      res.status(400).json({
        success: false,
        error: 'MISSING_MERCHANT_ID',
        message: 'Merchant ID parameter is required.',
      });
      return;
    }

    try {
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);
      const merchant = await marketplaceService.retrieveMerchant(id.trim()).catch(() => null);

      if (!merchant) {
        res.status(404).json({
          success: false,
          error: 'MERCHANT_NOT_FOUND',
          message: `Merchant with ID '${id}' was not found.`,
        });
        return;
      }

      // Query team members
      const members = await marketplaceService.listMerchantMembers({ merchant_id: merchant.id });
      const ownerMember = (members || []).find((m: any) => m.role === 'owner');

      // Query product count via Query engine
      let productCount = 0;
      try {
        const query: any = req.scope.resolve(ContainerRegistrationKeys.QUERY);
        const { data: products } = await query.graph({
          entity: 'product',
          fields: ['id'],
          filters: {
            merchant: { id: merchant.id },
          },
        });
        productCount = (products || []).length;
      } catch {
        // Query fallback
      }

      const metadata = merchant.metadata || {};

      res.status(200).json({
        success: true,
        merchant: {
          id: merchant.id,
          name: merchant.name,
          handle: merchant.handle,
          status: merchant.status,
          email: merchant.email,
          phone: merchant.phone,
          businessRegistrationNumber: merchant.business_registration_number,
          taxIdentifier: merchant.tax_identifier,
          metadata,
          verification: {
            verificationSubmittedAt: metadata.verificationSubmittedAt,
            approvedAt: metadata.approvedAt,
            approvedBy: metadata.approvedBy,
            rejectedAt: metadata.rejectedAt,
            rejectedBy: metadata.rejectedBy,
            rejectionReason: metadata.rejectionReason,
            suspendedAt: metadata.suspendedAt,
            suspendedBy: metadata.suspendedBy,
            suspensionReason: metadata.suspensionReason,
            reactivatedAt: metadata.reactivatedAt,
            reactivatedBy: metadata.reactivatedBy,
            changesRequestedAt: metadata.changesRequestedAt,
            changesRequestedBy: metadata.changesRequestedBy,
            changesRequestedReason: metadata.changesRequestedReason,
            lifecycleHistory: metadata.lifecycleHistory || [],
          },
          owner: ownerMember
            ? {
                userId: ownerMember.user_id,
                role: ownerMember.role,
                status: ownerMember.status,
              }
            : null,
          members: (members || []).map((m: any) => ({
            id: m.id,
            userId: m.user_id,
            role: m.role,
            status: m.status,
          })),
          productCount,
          created_at: merchant.created_at,
          updated_at: merchant.updated_at,
        },
      });
    } catch (err: any) {
      console.error('[Admin Marketplace Merchant Detail API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: err.message || 'Failed to retrieve merchant details.',
      });
    }
  }
);
