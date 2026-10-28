import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import {
  SuperAdminAuthEngine,
  EncryptionService,
} from '../../../../modules/auth/super-admin-auth-engine';
import { provisionInitialSuperAdmin } from '../../../../scripts/seed-super-admin';

export const AUTHENTICATE = false;

/**
 * POST /admin/auth/login
 * Super Admin primary authentication with rate limiting, password verification,
 * and optional inline or 2-stage MFA challenge.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = (req.body as any) || {};
  const { email, password, totpCode, backupCode } = body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';
  const userAgent = (req.headers['user-agent'] as string) || 'unknown';

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    res.status(400).json({
      success: false,
      error: 'MISSING_CREDENTIALS',
      message: 'Email and password are required.',
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rateLimitKey = `${normalizedEmail}:${ip}`;

  // 1. Rate Limiting Check (3 failures per 15 minutes window across shared Redis)
  const rateLimit = await SuperAdminAuthEngine.checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.login.locked',
      outcome: 'failure',
      email: normalizedEmail,
      ip,
      userAgent,
      reason: `Account temporarily locked due to multiple failed attempts. Cooldown: ${rateLimit.cooldownSeconds}s`,
    });

    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: `Account temporarily locked due to multiple failed login attempts. Please try again in ${rateLimit.cooldownSeconds} seconds.`,
      cooldownSeconds: rateLimit.cooldownSeconds,
    });
    return;
  }

  // 2. Validate User Credentials
  if (
    SuperAdminAuthEngine.getUserCount() === 0 &&
    process.env.INITIAL_ADMIN_EMAIL &&
    process.env.INITIAL_ADMIN_PASSWORD
  ) {
    try {
      await provisionInitialSuperAdmin();
    } catch (err: any) {
      console.error('[Admin Login Provisioning Error]:', err.message);
    }
  }

  const user = SuperAdminAuthEngine.findUserByEmail(normalizedEmail);
  if (!user) {
    await SuperAdminAuthEngine.recordFailedAttempt(rateLimitKey);
    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.login.failed',
      outcome: 'failure',
      email: normalizedEmail,
      ip,
      userAgent,
      reason: 'Invalid email or password.',
    });

    res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    });
    return;
  }

  const isPasswordValid = SuperAdminAuthEngine.verifyPassword(
    password,
    user.passwordHash,
    user.passwordSalt
  );

  if (!isPasswordValid) {
    await SuperAdminAuthEngine.recordFailedAttempt(rateLimitKey);
    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.login.failed',
      outcome: 'failure',
      userId: user.id,
      email: normalizedEmail,
      ip,
      userAgent,
      reason: 'Invalid email or password.',
    });

    res.status(401).json({
      success: false,
      error: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password.',
    });
    return;
  }

  // Credentials are valid -> Reset rate-limit counter
  await SuperAdminAuthEngine.resetRateLimit(rateLimitKey);

  // 3. MFA Handling
  let isSessionMfaVerified = !user.mfaEnabled;

  if (user.mfaEnabled && user.encryptedMfaSecret) {
    let mfaVerified = false;

    // Check if inline TOTP or backup code was supplied
    if (totpCode) {
      const decryptedSecret = EncryptionService.decrypt(user.encryptedMfaSecret);
      const verifyRes = SuperAdminAuthEngine.verifyTotpCode(
        decryptedSecret,
        totpCode,
        user.lastUsedTotpStep
      );

      if (verifyRes.valid && verifyRes.matchedStep !== undefined) {
        // Anti-replay check across shared storage
        const isReplay = await SuperAdminAuthEngine.getAdapter().isTotpReplay(user.id, verifyRes.matchedStep);
        if (isReplay) {
          res.status(401).json({
            success: false,
            error: 'MFA_CODE_ALREADY_USED',
            message: 'This TOTP code was already used. Please wait for the next time-step.',
          });
          return;
        }

        mfaVerified = true;
        isSessionMfaVerified = true;
        user.lastUsedTotpStep = verifyRes.matchedStep;
        SuperAdminAuthEngine.updateUser(user);

        SuperAdminAuthEngine.logAuditEvent({
          action: 'admin.mfa.verified',
          outcome: 'success',
          userId: user.id,
          email: user.email,
          ip,
          userAgent,
        });
      }
    } else if (backupCode) {
      const backupRes = await SuperAdminAuthEngine.verifyAndConsumeBackupCode(
        user.id,
        backupCode,
        user
      );

      if (backupRes.valid) {
        mfaVerified = true;
        isSessionMfaVerified = true;
        user.hashedBackupCodes = backupRes.remainingHashedCodes;
        SuperAdminAuthEngine.updateUser(user);

        SuperAdminAuthEngine.logAuditEvent({
          action: 'admin.backup_code.used',
          outcome: 'success',
          userId: user.id,
          email: user.email,
          ip,
          userAgent,
        });
      }
    }

    if (!mfaVerified) {
      // Create temporary challenge token for 2-stage verification (valid for 5 minutes)
      const challengeToken = `mfa_challenge_${Buffer.from(
        JSON.stringify({ userId: user.id, exp: Date.now() + 5 * 60 * 1000 })
      ).toString('base64')}`;

      res.status(200).json({
        success: true,
        mfaRequired: true,
        mfaChallengeToken: challengeToken,
        message: 'Primary credentials valid. Multi-Factor Authentication required.',
      });
      return;
    }
  }

  // 4. Create Active Session in Shared Storage
  const sessionRecord = await SuperAdminAuthEngine.createSession({
    userId: user.id,
    email: user.email,
    isMfaVerified: isSessionMfaVerified,
    ip,
    userAgent,
  });

  // Set HTTP-only cookie with unconditional Secure flag in production
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `ecom_admin_sess=${sessionRecord.token}; Path=/; HttpOnly; SameSite=Strict${isProduction ? '; Secure' : ''}; Max-Age=${
      SuperAdminAuthEngine.SESSION_ABSOLUTE_TTL_MS / 1000
    }`
  );

  res.status(200).json({
    success: true,
    token: sessionRecord.token,
    session: {
      userId: sessionRecord.userId,
      email: sessionRecord.email,
      role: 'super_admin',
      authBoundary: 'admin',
      actorType: 'super_admin',
      isMfaVerified: sessionRecord.isMfaVerified,
      expiresAt: new Date(sessionRecord.expiresAt).toISOString(),
      lastMfaVerifiedAt: sessionRecord.lastMfaVerifiedAt
        ? new Date(sessionRecord.lastMfaVerifiedAt).toISOString()
        : undefined,
    },
  });
}
