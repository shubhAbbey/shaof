import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { MerchantAuthEngine } from '../../../../modules/auth/merchant-auth-engine';

/**
 * POST /merchant/auth/reset-password
 * Consumes single-use reset token atomically, updates password, and invalidates all existing sessions.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = (req.body as any) || {};
  const { token, password } = body;

  if (!token || typeof token !== 'string' || !password || typeof password !== 'string') {
    res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'Token and new password are required.',
    });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({
      success: false,
      error: 'PASSWORD_TOO_WEAK',
      message: 'Password must be at least 8 characters long.',
    });
    return;
  }

  const result = await MerchantAuthEngine.resetPasswordWithToken(token.trim(), password);
  if (!result.success) {
    res.status(400).json({
      success: false,
      error: 'INVALID_OR_EXPIRED_TOKEN',
      message: result.error || 'Password reset token is invalid or has expired.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    message: 'Password reset successfully. You may now log in with your new credentials.',
  });
}
