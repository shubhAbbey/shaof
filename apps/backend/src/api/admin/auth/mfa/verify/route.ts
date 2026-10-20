import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import {
  SuperAdminAuthEngine,
  EncryptionService,
} from '../../../../../modules/auth/super-admin-auth-engine';
import { resolveSessionFromToken } from '../../../../middlewares/tenant-auth';

/**
 * POST /admin/auth/mfa/verify
 * Verifies TOTP code or backup scratch code during:
 * 1. Initial pending-enrollment confirmation (activates MFA).
 * 2. 2-stage login challenge completion.
 * 3. Active session elevation.
 *
 * Security Requirements:
 * - Rate limited to 3 failed attempts per 15 minutes.
 * - Distributed anti-replay check via Redis.
 * - Atomic single-use bcrypt-hashed backup code consumption.
 * - Sets HttpOnly cookie with unconditional Secure flag in production.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = (req.body as any) || {};
  const { code, backupCode, mfaChallengeToken } = body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  if (!code && !backupCode) {
    res.status(400).json({
      success: false,
      error: 'MISSING_VERIFICATION_CODE',
      message: 'Either a 6-digit TOTP code or backup code is required.',
    });
    return;
  }

  // Determine user identity from either mfaChallengeToken or active session token
  let user: any = null;
  let activeSessionToken: string | null = null;

  if (mfaChallengeToken && typeof mfaChallengeToken === 'string') {
    if (!mfaChallengeToken.startsWith('mfa_challenge_')) {
      res.status(401).json({
        success: false,
        error: 'INVALID_CHALLENGE_TOKEN',
        message: 'Invalid MFA challenge token.',
      });
      return;
    }

    try {
      const b64 = mfaChallengeToken.substring(14);
      const data = JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
      if (Date.now() > data.exp) {
        res.status(401).json({
          success: false,
          error: 'CHALLENGE_EXPIRED',
          message: 'MFA challenge token has expired. Please log in again.',
        });
        return;
      }
      user = SuperAdminAuthEngine.findUserById(data.userId);
    } catch {
      res.status(401).json({
        success: false,
        error: 'INVALID_CHALLENGE_TOKEN',
        message: 'Malformed MFA challenge token.',
      });
      return;
    }
  } else {
    // Check Authorization header or Cookie
    const authHeader = (req.headers['authorization'] as string) || '';
    const cookieHeader = (req.headers['cookie'] as string) || '';
    let token: string | null = null;

    if (authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7).trim();
    } else if (cookieHeader) {
      const match = cookieHeader.match(/(?:^|;\s*)ecom_admin_sess=([^;]+)/);
      if (match) token = decodeURIComponent(match[1].trim());
    }

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Authentication required. Provide an active session or mfaChallengeToken.',
      });
      return;
    }

    const session = await resolveSessionFromToken(token);
    if (!session || session.authBoundary !== 'admin') {
      res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Invalid or expired session.',
      });
      return;
    }

    activeSessionToken = token;
    user = SuperAdminAuthEngine.findUserById(session.userId);
  }

  if (!user) {
    res.status(404).json({
      success: false,
      error: 'ADMIN_NOT_FOUND',
      message: 'Super Admin user record not found.',
    });
    return;
  }

  // Rate Limiting Check (3 failures per 15 minutes window)
  const rateLimitKey = `mfa:${user.id}:${ip}`;
  const rateLimit = await SuperAdminAuthEngine.checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.mfa.failed',
      outcome: 'failure',
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
      reason: `MFA verification locked. Cooldown: ${rateLimit.cooldownSeconds}s`,
    });

    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: `Account temporarily locked due to multiple failed verification attempts. Please try again in ${rateLimit.cooldownSeconds} seconds.`,
      cooldownSeconds: rateLimit.cooldownSeconds,
    });
    return;
  }

  // CASE 1: Pending Enrollment Confirmation
  if (user.pendingMfaSecret) {
    if (!code) {
      res.status(400).json({
        success: false,
        error: 'TOTP_CODE_REQUIRED',
        message: 'A 6-digit TOTP verification code is required to confirm and activate MFA.',
      });
      return;
    }

    let decryptedSecret: string;
    try {
      decryptedSecret = EncryptionService.decrypt(user.pendingMfaSecret);
    } catch {
      res.status(500).json({
        success: false,
        error: 'DECRYPTION_FAILED',
        message: 'Failed to decrypt pending MFA secret.',
      });
      return;
    }

    const verifyResult = SuperAdminAuthEngine.verifyTotpCode(
      decryptedSecret,
      code,
      user.lastUsedTotpStep
    );

    if (!verifyResult.valid || verifyResult.matchedStep === undefined) {
      await SuperAdminAuthEngine.recordFailedAttempt(rateLimitKey);
      SuperAdminAuthEngine.logAuditEvent({
        action: 'admin.mfa.failed',
        outcome: 'failure',
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
        reason: verifyResult.reason || 'Invalid confirmation code',
      });

      res.status(401).json({
        success: false,
        error: 'INVALID_TOTP_CODE',
        message: verifyResult.reason || 'Invalid verification code.',
      });
      return;
    }

    // Anti-replay check across distributed storage
    const isReplay = await SuperAdminAuthEngine.getAdapter().isTotpReplay(user.id, verifyResult.matchedStep);
    if (isReplay) {
      await SuperAdminAuthEngine.recordFailedAttempt(rateLimitKey);
      res.status(401).json({
        success: false,
        error: 'MFA_CODE_ALREADY_USED',
        message: 'This TOTP code was already used. Please wait for the next time-step.',
      });
      return;
    }

    // Confirmation successful -> Promote pending secret to active MFA
    user.encryptedMfaSecret = user.pendingMfaSecret;
    user.hashedBackupCodes = user.pendingBackupCodes || [];
    user.pendingMfaSecret = null;
    user.pendingBackupCodes = [];
    user.mfaEnabled = true;
    user.lastUsedTotpStep = verifyResult.matchedStep;
    SuperAdminAuthEngine.updateUser(user);

    await SuperAdminAuthEngine.resetRateLimit(rateLimitKey);

    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.mfa.enrolled',
      outcome: 'success',
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
    });

    // Elevate active session
    let token = activeSessionToken;
    let sessionRecord: any = null;
    if (token) {
      sessionRecord = await SuperAdminAuthEngine.resolveSession(token);
      if (sessionRecord) {
        sessionRecord.isMfaVerified = true;
        await SuperAdminAuthEngine.renewStepUp(token);
      }
    } else {
      sessionRecord = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: true,
        ip,
        userAgent,
      });
      token = sessionRecord.token;
    }

    const isProduction = process.env.NODE_ENV === 'production';
    res.setHeader(
      'Set-Cookie',
      `ecom_admin_sess=${token}; Path=/admin; HttpOnly; SameSite=Strict${isProduction ? '; Secure' : ''}; Max-Age=${
        SuperAdminAuthEngine.SESSION_ABSOLUTE_TTL_MS / 1000
      }`
    );

    res.status(200).json({
      success: true,
      isMfaVerified: true,
      token,
      session: sessionRecord,
      remainingBackupCodesCount: user.hashedBackupCodes.length,
      message: 'MFA confirmed and activated successfully.',
    });
    return;
  }

  // CASE 2: Active MFA Verification (2-Stage Login or Session Step-Up)
  if (!user.mfaEnabled || !user.encryptedMfaSecret) {
    res.status(400).json({
      success: false,
      error: 'MFA_NOT_CONFIGURED',
      message: 'MFA is not enrolled for this account.',
    });
    return;
  }

  if (code) {
    let decryptedSecret: string;
    try {
      decryptedSecret = EncryptionService.decrypt(user.encryptedMfaSecret);
    } catch {
      res.status(500).json({
        success: false,
        error: 'DECRYPTION_FAILED',
        message: 'Failed to decrypt MFA secret.',
      });
      return;
    }

    const verifyResult = SuperAdminAuthEngine.verifyTotpCode(
      decryptedSecret,
      code,
      user.lastUsedTotpStep
    );

    if (!verifyResult.valid || verifyResult.matchedStep === undefined) {
      await SuperAdminAuthEngine.recordFailedAttempt(rateLimitKey);
      SuperAdminAuthEngine.logAuditEvent({
        action: 'admin.mfa.failed',
        outcome: 'failure',
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
        reason: verifyResult.reason || 'Invalid TOTP code',
      });

      res.status(401).json({
        success: false,
        error: 'INVALID_TOTP_CODE',
        message: verifyResult.reason || 'Invalid verification code.',
      });
      return;
    }

    // Distributed Anti-Replay check via Redis
    const isReplay = await SuperAdminAuthEngine.getAdapter().isTotpReplay(user.id, verifyResult.matchedStep);
    if (isReplay) {
      await SuperAdminAuthEngine.recordFailedAttempt(rateLimitKey);
      res.status(401).json({
        success: false,
        error: 'MFA_CODE_ALREADY_USED',
        message: 'This TOTP code was already used. Please wait for the next time-step.',
      });
      return;
    }

    user.lastUsedTotpStep = verifyResult.matchedStep;
    SuperAdminAuthEngine.updateUser(user);
    await SuperAdminAuthEngine.resetRateLimit(rateLimitKey);

    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.mfa.verified',
      outcome: 'success',
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
    });
  } else if (backupCode) {
    // Atomic verification and consumption of bcrypt-hashed backup code
    const backupResult = await SuperAdminAuthEngine.verifyAndConsumeBackupCode(
      user.id,
      backupCode,
      user
    );

    if (!backupResult.valid) {
      await SuperAdminAuthEngine.recordFailedAttempt(rateLimitKey);
      SuperAdminAuthEngine.logAuditEvent({
        action: 'admin.mfa.failed',
        outcome: 'failure',
        userId: user.id,
        email: user.email,
        ip,
        userAgent,
        reason: backupResult.reason || 'Invalid backup scratch code.',
      });

      res.status(401).json({
        success: false,
        error: 'INVALID_BACKUP_CODE',
        message: backupResult.reason || 'Invalid or previously used backup scratch code.',
      });
      return;
    }

    await SuperAdminAuthEngine.resetRateLimit(rateLimitKey);

    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.backup_code.used',
      outcome: 'success',
      userId: user.id,
      email: user.email,
      ip,
      userAgent,
    });
  }

  // Complete session promotion or creation
  let finalToken: string;
  let finalSession: any;

  if (activeSessionToken) {
    finalSession = await SuperAdminAuthEngine.resolveSession(activeSessionToken);
    if (finalSession) {
      finalSession.isMfaVerified = true;
      await SuperAdminAuthEngine.renewStepUp(activeSessionToken);
    }
    finalToken = activeSessionToken;
  } else {
    const newSession = await SuperAdminAuthEngine.createSession({
      userId: user.id,
      email: user.email,
      isMfaVerified: true,
      ip,
      userAgent,
    });
    finalToken = newSession.token;
    finalSession = {
      userId: newSession.userId,
      email: newSession.email,
      role: 'super_admin',
      authBoundary: 'admin',
      actorType: 'super_admin',
      isMfaVerified: true,
      expiresAt: new Date(newSession.expiresAt).toISOString(),
      lastMfaVerifiedAt: new Date(newSession.lastMfaVerifiedAt!).toISOString(),
    };
  }

  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `ecom_admin_sess=${finalToken}; Path=/admin; HttpOnly; SameSite=Strict${isProduction ? '; Secure' : ''}; Max-Age=${
      SuperAdminAuthEngine.SESSION_ABSOLUTE_TTL_MS / 1000
    }`
  );

  res.status(200).json({
    success: true,
    isMfaVerified: true,
    token: finalToken,
    session: finalSession,
    remainingBackupCodesCount: user.hashedBackupCodes.length,
    message: 'Multi-Factor Authentication verified successfully.',
  });
}
