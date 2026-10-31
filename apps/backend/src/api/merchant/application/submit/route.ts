import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';
import { MARKETPLACE_MODULE } from '../../../../modules/marketplace/index';
import { MerchantAuthEngine } from '../../../../modules/auth/merchant-auth-engine';
import {
  validateGSTIN,
  validatePAN,
  validateIndianPhone,
  validateMerchantHandle,
} from '@ecom/types';

export const AUTHENTICATE = false;

/**
 * POST /merchant/application/submit
 * Formally submits a completed draft or rejected merchant application for Super Admin verification,
 * transitioning the authoritative merchant status from 'draft' (or 'rejected') to 'pending_approval'.
 *
 * Enforces:
 * 1. Strict server-side validation of all required onboarding profile & tax identifier fields:
 *    - Store Name (2 - 120 chars)
 *    - Store Handle (slug format, min 3 chars)
 *    - Business Email
 *    - Indian Mobile Phone (+91 followed by 10 digits)
 *    - GSTIN (15 alphanumeric characters matching GSTIN checksum/format)
 *    - PAN (10 alphanumeric characters matching PAN format)
 * 2. Active owner member verification (merchants must maintain an active owner)
 * 3. Lifecycle state transition via MarketplaceModuleService with audit history and timestamps
 * 4. Rejection of direct activation or bypass of review queue
 * 5. Updates session claims in Redis
 */
export const POST = requireTenantAuth(
  { boundary: 'merchant', allowInactiveMerchant: true },
  async (req, res): Promise<void> => {
    const merchantId = req.tenantContext.merchantId;
    const actorId = req.tenantContext.userId;
    const callerRole = req.tenantContext.role;

    const validRoles = ['owner', 'admin', 'manager', 'staff'];
    if (!callerRole || !validRoles.includes(callerRole)) {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'A valid merchant membership role is required to submit verification application.',
      });
      return;
    }

    if (callerRole !== 'owner' && callerRole !== 'manager') {
      res.status(403).json({
        success: false,
        error: 'FORBIDDEN',
        message: 'Only merchant owner or manager can submit verification application.',
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

      // Assert transition eligibility from current lifecycle status
      if (merchant.status === 'pending_approval') {
        res.status(400).json({
          success: false,
          error: 'NO_OP_TRANSITION',
          message: "Target status is already 'pending_approval'. Application is already awaiting review.",
        });
        return;
      }

      if (merchant.status !== 'draft' && merchant.status !== 'rejected') {
        res.status(400).json({
          success: false,
          error: 'INVALID_TRANSITION',
          message: `Cannot transition merchant from '${merchant.status}' to 'pending_approval'. Only draft or rejected applications can be submitted.`,
        });
        return;
      }

      // Check if client submitted updated profile fields in request body
      const body = (req.body as any) || {};
      const {
        name: bodyName,
        handle: bodyHandle,
        phone: bodyPhone,
        businessRegistrationNumber: bodyGSTIN,
        taxIdentifier: bodyPAN,
      } = body;

      // Merge existing merchant record with any fields provided in submission body
      const name = (bodyName !== undefined ? bodyName : merchant.name)?.trim();
      const handle = (bodyHandle !== undefined ? bodyHandle : merchant.handle)?.trim().toLowerCase();
      const email = merchant.email?.trim().toLowerCase();
      const phone = (bodyPhone !== undefined ? bodyPhone : merchant.phone)?.trim();
      const gstin = (
        bodyGSTIN !== undefined ? bodyGSTIN : merchant.business_registration_number
      )?.trim().toUpperCase();
      const pan = (
        bodyPAN !== undefined ? bodyPAN : merchant.tax_identifier
      )?.trim().toUpperCase();

      // Collect server-side validation errors for required submission fields
      const errors: string[] = [];

      if (!name || typeof name !== 'string' || name.length < 2) {
        errors.push('Store name is required and must be at least 2 characters long.');
      } else if (name.length > 120) {
        errors.push('Store name cannot exceed 120 characters.');
      }

      if (!handle) {
        errors.push('Store handle is required.');
      } else {
        const handleRes = validateMerchantHandle(handle);
        if (!handleRes.isValid && handleRes.error) {
          errors.push(handleRes.error);
        }
      }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Valid corporate email address is required.');
      }

      if (!phone) {
        errors.push('Contact phone number is required.');
      } else {
        const phoneRes = validateIndianPhone(phone);
        if (!phoneRes.isValid && phoneRes.error) {
          errors.push(phoneRes.error);
        }
      }

      // GSTIN (businessRegistrationNumber) is MANDATORY for verification submission
      if (!gstin) {
        errors.push('GSTIN (15-character business registration number) is required for verification submission.');
      } else {
        const gstinRes = validateGSTIN(gstin);
        if (!gstinRes.isValid && gstinRes.error) {
          errors.push(`GSTIN Error: ${gstinRes.error}`);
        }
      }

      // PAN (taxIdentifier) is MANDATORY for verification submission
      if (!pan) {
        errors.push('PAN (10-character permanent account number) is required for verification submission.');
      } else {
        const panRes = validatePAN(pan);
        if (!panRes.isValid && panRes.error) {
          errors.push(`PAN Error: ${panRes.error}`);
        }
      }

      // Verify at least one active owner member exists
      const members = await marketplaceService.listMerchantMembers({ merchant_id: merchant.id }).catch(() => []);
      const hasActiveOwner = (members || []).some((m: any) => m.role === 'owner' && m.status === 'active');
      if (!hasActiveOwner) {
        errors.push('OWNER_REQUIRED: Merchant must have at least one active owner member before submission.');
      }

      if (errors.length > 0) {
        res.status(400).json({
          success: false,
          error: 'INCOMPLETE_APPLICATION',
          message:
            'Application is incomplete. Store name, corporate email, Indian phone (+91), GSTIN (15 characters), and PAN (10 characters) are required for verification submission.',
          errors,
        });
        return;
      }

      // If body included updated fields, persist them first
      const hasFieldUpdates =
        (bodyName !== undefined && bodyName.trim() !== merchant.name) ||
        (bodyHandle !== undefined && bodyHandle.trim().toLowerCase() !== merchant.handle) ||
        (bodyPhone !== undefined && bodyPhone.trim() !== merchant.phone) ||
        (bodyGSTIN !== undefined && bodyGSTIN.trim().toUpperCase() !== merchant.business_registration_number) ||
        (bodyPAN !== undefined && bodyPAN.trim().toUpperCase() !== merchant.tax_identifier);

      if (hasFieldUpdates) {
        await marketplaceService.updateMerchants({
          id: merchant.id,
          name,
          handle,
          phone,
          business_registration_number: gstin,
          tax_identifier: pan,
        });
      }

      // Execute authoritative status transition to 'pending_approval'
      const updated = await marketplaceService.transitionMerchantStatus(
        merchant.id,
        'pending_approval',
        {
          actorType: 'merchant_user',
          actorId,
          notes: 'Application submitted for platform verification by merchant owner.',
        }
      );

      // Attempt to refresh Redis session claims with updated merchant status
      try {
        const authHeader = req.headers['authorization'] as string;
        const cookieHeader = req.headers['cookie'] as string;
        let token = '';
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7).trim();
        } else if (cookieHeader) {
          const match = cookieHeader.match(/ecom_merchant_sess=([^;]+)/);
          if (match) token = match[1];
        }
        if (token) {
          const session = await MerchantAuthEngine.getAdapter().getSession(token);
          if (session) {
            session.merchantStatus = 'pending_approval';
            await MerchantAuthEngine.getAdapter().saveSession(session);
          }
        }
      } catch (sessionErr: any) {
        console.warn('[MERCHANT_SUBMIT] Warning: Could not update Redis session cache:', sessionErr.message);
      }

      res.status(200).json({
        success: true,
        message:
          "Merchant application submitted successfully. Your store is now in 'pending_approval' status awaiting Super Admin verification.",
        merchant: {
          id: updated.id,
          name: updated.name,
          handle: updated.handle,
          status: updated.status,
          email: updated.email,
          phone: updated.phone,
          businessRegistrationNumber: updated.business_registration_number,
          taxIdentifier: updated.tax_identifier,
          metadata: updated.metadata,
          verificationSubmittedAt: updated.metadata?.verificationSubmittedAt,
          updated_at: updated.updated_at,
        },
      });
    } catch (err: any) {
      console.error('[Merchant Application Submit API] POST error:', err.message);
      const msg = err.message || '';
      res.status(400).json({
        success: false,
        error: msg.includes('TRANSITION') ? 'INVALID_TRANSITION' : 'SUBMISSION_FAILED',
        message: msg || 'Failed to submit merchant application.',
      });
    }
  }
);
