import { MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../../middlewares/tenant-auth';
import {
  SuperAdminAuthEngine,
  EncryptionService,
} from '../../../../../modules/auth/super-admin-auth-engine';

export const AUTHENTICATE = false;

/**
 * POST /admin/auth/mfa/setup
 * Enrolls TOTP Multi-Factor Authentication for the authenticated Super Admin.
 *
 * Security Requirements:
 * 1. Requires valid admin session.
 * 2. If MFA is already active, requires recent step-up re-authentication (< 15 mins)
 *    to prevent silent hijacking or replacement.
 * 3. Enters pending-enrollment state: does NOT activate MFA until confirmed with a valid TOTP code.
 * 4. Encrypts TOTP secret using AES-256-GCM at rest (fail-closed in production).
 * 5. Generates 8 single-use bcrypt-hashed backup scratch codes (ADR-002).
 */
export const POST = requireTenantAuth(
  { boundary: 'admin', requireMfa: false },
  async (req, res: MedusaResponse): Promise<void> => {
    const adminUserId = req.tenantContext.userId;
    const sessionToken = req.tenantContext.sessionToken;
    const user = SuperAdminAuthEngine.findUserById(adminUserId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'ADMIN_NOT_FOUND',
        message: 'Authenticated Super Admin user record not found.',
      });
      return;
    }

    // If MFA is already enabled, require recent step-up re-authentication to re-enroll/reset
    if (user.mfaEnabled) {
      const isStepUpActive = sessionToken
        ? await SuperAdminAuthEngine.isStepUpActive(sessionToken)
        : false;

      if (!isStepUpActive) {
        SuperAdminAuthEngine.logAuditEvent({
          action: 'admin.mfa.failed',
          outcome: 'failure',
          userId: user.id,
          email: user.email,
          reason: 'Step-up re-authentication required to reset or re-enroll MFA.',
        });

        res.status(403).json({
          success: false,
          error: 'STEP_UP_REQUIRED',
          message: 'Step-up re-authentication required to reset or re-enroll Multi-Factor Authentication.',
        });
        return;
      }
    }

    // 1. Generate RFC 6238 TOTP Secret
    const { base32Secret, uri } = SuperAdminAuthEngine.generateTotpSecret();

    // 2. Encrypt TOTP Secret using AES-256-GCM at rest (fails closed in production if key is missing)
    const encryptedSecret = EncryptionService.encrypt(base32Secret);

    // 3. Generate 8 single-use bcrypt-hashed backup scratch codes (ADR-002)
    const { plainCodes, hashedCodes } = SuperAdminAuthEngine.generateBackupCodes(8);

    // 4. Update user record in pending enrollment state (do NOT set mfaEnabled = true yet)
    user.pendingMfaSecret = encryptedSecret;
    user.pendingBackupCodes = hashedCodes;
    SuperAdminAuthEngine.updateUser(user);

    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.mfa.setup',
      outcome: 'success',
      userId: user.id,
      email: user.email,
    });

    res.status(200).json({
      success: true,
      secret: base32Secret,
      otpauthUri: uri,
      backupCodes: plainCodes,
      pendingConfirmation: true,
      message: 'MFA enrolled in pending state. Verify a 6-digit TOTP code via /admin/auth/mfa/verify to confirm and activate MFA.',
    });
  }
);
