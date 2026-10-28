import { MedusaResponse } from '@medusajs/framework/http';
import { requireTenantAuth } from '../../../middlewares/tenant-auth';
import {
  SuperAdminAuthEngine,
  EncryptionService,
} from '../../../../modules/auth/super-admin-auth-engine';

export const AUTHENTICATE = false;

/**
 * POST /admin/auth/step-up
 * Step-up re-authentication for sensitive platform governance operations.
 * Requires fresh password or TOTP verification and renews the 15-minute step-up window.
 */
export const POST = requireTenantAuth(
  { boundary: 'admin' },
  async (req: any, res: MedusaResponse): Promise<void> => {
    const adminUserId = req.tenantContext.userId;
    const sessionToken = req.tenantContext.sessionToken;
    const body = (req.body as any) || {};
    const { password, totpCode } = body;

    if (!password && !totpCode) {
      res.status(400).json({
        success: false,
        error: 'MISSING_STEP_UP_CREDENTIALS',
        message: 'Either password or TOTP verification code is required for step-up authentication.',
      });
      return;
    }

    const user = SuperAdminAuthEngine.findUserById(adminUserId);
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'ADMIN_NOT_FOUND',
        message: 'Super Admin user record not found.',
      });
      return;
    }

    let verified = false;

    // 1. Password verification
    if (password) {
      const isPasswordValid = SuperAdminAuthEngine.verifyPassword(
        password,
        user.passwordHash,
        user.passwordSalt
      );
      if (isPasswordValid) verified = true;
    }

    // 2. TOTP verification
    if (!verified && totpCode && user.encryptedMfaSecret) {
      try {
        const decryptedSecret = EncryptionService.decrypt(user.encryptedMfaSecret);
        const totpRes = SuperAdminAuthEngine.verifyTotpCode(
          decryptedSecret,
          totpCode,
          user.lastUsedTotpStep
        );
        if (totpRes.valid && totpRes.matchedStep !== undefined) {
          const isReplay = await SuperAdminAuthEngine.getAdapter().isTotpReplay(user.id, totpRes.matchedStep);
          if (!isReplay) {
            verified = true;
            user.lastUsedTotpStep = totpRes.matchedStep;
            SuperAdminAuthEngine.updateUser(user);
          }
        }
      } catch {
        // Fall through
      }
    }

    if (!verified) {
      SuperAdminAuthEngine.logAuditEvent({
        action: 'admin.step_up.failed',
        outcome: 'failure',
        userId: user.id,
        email: user.email,
        reason: 'Invalid step-up credentials.',
      });

      res.status(401).json({
        success: false,
        stepUpVerified: false,
        error: 'STEP_UP_FAILED',
        message: 'Invalid password or TOTP code.',
      });
      return;
    }

    // Renew step-up timestamp
    if (sessionToken) {
      await SuperAdminAuthEngine.renewStepUp(sessionToken);
    }

    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.step_up.success',
      outcome: 'success',
      userId: user.id,
      email: user.email,
    });

    const stepUpExpiresAt = new Date(
      Date.now() + SuperAdminAuthEngine.STEP_UP_TIMEOUT_MS
    ).toISOString();

    res.status(200).json({
      success: true,
      stepUpVerified: true,
      expiresAt: stepUpExpiresAt,
      message: 'Step-up authentication verified successfully.',
    });
  }
);
