import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { MerchantAuthEngine } from '../../../../modules/auth/merchant-auth-engine';

/**
 * POST /merchant/auth/forgot-password
 * Issues a cryptographically secure, single-use 15-minute reset token.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = (req.body as any) || {};
  const { email } = body;
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || '127.0.0.1';

  if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    res.status(400).json({
      success: false,
      error: 'INVALID_EMAIL',
      message: 'A valid email address is required.',
    });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();
  const rateLimitKey = `reset:${normalizedEmail}:${ip}`;

  // Rate limiting check
  const rateLimit = await MerchantAuthEngine.checkRateLimit(rateLimitKey);
  if (!rateLimit.allowed) {
    res.status(429).json({
      success: false,
      error: 'TOO_MANY_REQUESTS',
      message: `Too many password reset requests. Please try again in ${rateLimit.cooldownSeconds} seconds.`,
      cooldownSeconds: rateLimit.cooldownSeconds,
    });
    return;
  }

  const resetToken = await MerchantAuthEngine.createPasswordResetToken(normalizedEmail);
  const isProduction = process.env.NODE_ENV === 'production';

  res.status(200).json({
    success: true,
    message: 'If an account with that corporate email exists, password reset instructions have been sent.',
    resetToken: isProduction ? undefined : resetToken || undefined,
    expiresInSeconds: MerchantAuthEngine.RESET_TOKEN_TTL_SECONDS,
  });
}
