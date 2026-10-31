import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../middlewares/tenant-auth';
import { MARKETPLACE_MODULE } from '../../../modules/marketplace/index';
import { validateMerchantProfile } from '@ecom/types';

export const AUTHENTICATE = false;

/**
 * GET /merchant/application
 * Retrieves the caller merchant's application details, verification metadata,
 * owner verification info, and lifecycle audit history.
 *
 * Security:
 * - Requires 'merchant' security boundary (supports draft, pending, active, rejected)
 */
export const GET = requireTenantAuth(
  { boundary: 'merchant', allowInactiveMerchant: true },
  async (req, res): Promise<void> => {
    const merchantId = req.tenantContext.merchantId;
    const callerRole = req.tenantContext.role;

    const validRoles = ['owner', 'admin', 'manager', 'staff'];
    if (!callerRole || !validRoles.includes(callerRole)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'A valid merchant membership role is required to view onboarding application details.',
      });
      return;
    }

    try {
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);
      const merchant = await marketplaceService.retrieveMerchant(merchantId).catch(() => null);

      if (!merchant) {
        res.status(404).json({
          success: false,
          error: 'MERCHANT_NOT_FOUND',
          message: `Merchant with ID '${merchantId}' was not found.`,
        });
        return;
      }

      // Query members to resolve owner context
      const members = await marketplaceService.listMerchantMembers({ merchant_id: merchant.id }).catch(() => []);
      const ownerMember = (members || []).find((m: any) => m.role === 'owner');

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
          created_at: merchant.created_at,
          updated_at: merchant.updated_at,
        },
      });
    } catch (err: any) {
      console.error('[Merchant Application API] GET error:', err.message);
      res.status(500).json({
        success: false,
        error: 'INTERNAL_ERROR',
        message: err.message || 'Failed to retrieve merchant application.',
      });
    }
  }
);

/**
 * PUT /merchant/application
 * Updates editable fields on a draft or rejected merchant onboarding application
 * (e.g., store name, phone, GSTIN, PAN).
 *
 * Security:
 * - Requires 'merchant' security boundary
 * - Prohibits modifying active, pending_approval, or suspended merchants through application endpoint
 * - Validates format of phone (+91), GSTIN (15 chars), PAN (10 chars), and handle
 */
export const PUT = requireTenantAuth(
  { boundary: 'merchant', allowInactiveMerchant: true },
  async (req, res): Promise<void> => {
    const merchantId = req.tenantContext.merchantId;
    const callerRole = req.tenantContext.role;

    const validRoles = ['owner', 'admin', 'manager', 'staff'];
    if (!callerRole || !validRoles.includes(callerRole)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'A valid merchant membership role is required to access onboarding application.',
      });
      return;
    }

    if (callerRole !== 'owner' && callerRole !== 'manager') {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only merchant owner or manager can edit onboarding application profile and tax identifiers.',
      });
      return;
    }

    const body = (req.body as any) || {};
    const { name, handle, phone, businessRegistrationNumber, taxIdentifier } = body;

    try {
      const marketplaceService: any = req.scope.resolve(MARKETPLACE_MODULE);
      const merchant = await marketplaceService.retrieveMerchant(merchantId).catch(() => null);

      if (!merchant) {
        res.status(404).json({
          success: false,
          error: 'MERCHANT_NOT_FOUND',
          message: `Merchant with ID '${merchantId}' was not found.`,
        });
        return;
      }

      // Assert draft or rejected status
      if (merchant.status !== 'draft' && merchant.status !== 'rejected') {
        res.status(400).json({
          success: false,
          error: 'CANNOT_EDIT_NON_DRAFT',
          message: `Application cannot be edited while in '${merchant.status}' status. Only draft or rejected applications can be updated.`,
        });
        return;
      }

      // Build update payload
      const updateData: Record<string, any> = {};
      if (name !== undefined) updateData.name = String(name).trim();
      if (handle !== undefined) updateData.handle = String(handle).trim().toLowerCase();
      if (phone !== undefined) updateData.phone = String(phone).trim();
      if (businessRegistrationNumber !== undefined) {
        updateData.businessRegistrationNumber = businessRegistrationNumber
          ? String(businessRegistrationNumber).trim().toUpperCase()
          : null;
      }
      if (taxIdentifier !== undefined) {
        updateData.taxIdentifier = taxIdentifier ? String(taxIdentifier).trim().toUpperCase() : null;
      }

      // Validate inputs
      const validation = validateMerchantProfile(updateData, false);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'VALIDATION_ERROR',
          message: `Validation failed: ${validation.errors.join('; ')}`,
          errors: validation.errors,
        });
        return;
      }

      // Translate camelCase to database snake_case fields for MikroORM update
      const dbUpdate: Record<string, any> = { id: merchant.id };
      if (updateData.name !== undefined) dbUpdate.name = updateData.name;
      if (updateData.handle !== undefined) dbUpdate.handle = updateData.handle;
      if (updateData.phone !== undefined) dbUpdate.phone = updateData.phone;
      if (updateData.businessRegistrationNumber !== undefined) {
        dbUpdate.business_registration_number = updateData.businessRegistrationNumber;
      }
      if (updateData.taxIdentifier !== undefined) {
        dbUpdate.tax_identifier = updateData.taxIdentifier;
      }

      const updated = await marketplaceService.updateMerchants(dbUpdate);
      const result = Array.isArray(updated) ? updated[0] : updated;

      res.status(200).json({
        success: true,
        message: 'Draft application details updated successfully.',
        merchant: {
          id: result.id,
          name: result.name,
          handle: result.handle,
          status: result.status,
          email: result.email,
          phone: result.phone,
          businessRegistrationNumber: result.business_registration_number,
          taxIdentifier: result.tax_identifier,
          updated_at: result.updated_at,
        },
      });
    } catch (err: any) {
      console.error('[Merchant Application API] PUT error:', err.message);
      res.status(400).json({
        success: false,
        error: 'UPDATE_FAILED',
        message: err.message || 'Failed to update merchant application.',
      });
    }
  }
);
