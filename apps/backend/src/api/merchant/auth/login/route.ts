import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { MerchantAuthEngine } from '../../../../modules/auth/merchant-auth-engine';

/**
 * POST /merchant/auth/login
 * Merchant primary authentication with distributed rate limiting (5 attempts / 15m),
 * Scrypt-verified passwords, and dual-transport token issuance (cookie + bearer).
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = (req.body as any) || {};
  const { email, password } = body;
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

  // 1. Rate Limiting Check (5 failures per 15 minutes window across shared Redis)
  const rateLimit = await MerchantAuthEngine.checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    MerchantAuthEngine.logAuditEvent({
      action: 'merchant.login.locked',
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

  // 2. Validate User Credentials via native Medusa authentication
  const authResult = await MerchantAuthEngine.authenticateUser(normalizedEmail, password);
  if (!authResult.success || !authResult.user) {
    await MerchantAuthEngine.recordFailedAttempt(rateLimitKey);
    MerchantAuthEngine.logAuditEvent({
      action: 'merchant.login.failed',
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

  const user = authResult.user;

  // Credentials are valid -> Reset rate-limit counter
  await MerchantAuthEngine.resetRateLimit(rateLimitKey);

  // 3. Resolve live merchant status
  const merchant = await MerchantAuthEngine.findMerchantById(user.merchantId);
  const merchantStatus = merchant ? merchant.status : 'active';

  // 4. Create Active Session in Shared Storage
  const sessionRecord = await MerchantAuthEngine.createSession({
    userId: user.id,
    merchantId: user.merchantId,
    email: user.email,
    role: user.role,
    membershipStatus: user.membershipStatus,
    merchantStatus,
    ip,
    userAgent,
  });

  // Set HTTP-only cookie with unconditional Secure flag in production
  const isProduction = process.env.NODE_ENV === 'production';
  res.setHeader(
    'Set-Cookie',
    `ecom_merchant_sess=${sessionRecord.token}; Path=/; HttpOnly; SameSite=Strict${
      isProduction ? '; Secure' : ''
    }; Max-Age=${MerchantAuthEngine.SESSION_ABSOLUTE_TTL_MS / 1000}`
  );

  res.status(200).json({
    success: true,
    token: sessionRecord.token,
    session: {
      userId: sessionRecord.userId,
      merchantId: sessionRecord.merchantId,
      email: sessionRecord.email,
      role: sessionRecord.role,
      authBoundary: 'merchant',
      actorType: 'merchant_user',
      membershipStatus: sessionRecord.membershipStatus,
      merchantStatus: sessionRecord.merchantStatus,
      permissions: sessionRecord.permissions,
      expiresAt: new Date(sessionRecord.expiresAt).toISOString(),
    },
  });
}
