import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { MerchantAuthEngine } from '../../../../modules/auth/merchant-auth-engine';

/**
 * POST /merchant/auth/logout
 * Revokes the active Merchant session from shared storage and clears the session cookie.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const authHeader = (req.headers['authorization'] as string) || '';
  const cookieHeader = (req.headers['cookie'] as string) || '';
  let token: string | null = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)ecom_merchant_sess=([^;]+)/);
    if (match) token = decodeURIComponent(match[1].trim());
  }

  if (token) {
    await MerchantAuthEngine.revokeSession(token);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  // Clear HTTP-only cookie
  res.setHeader(
    'Set-Cookie',
    `ecom_merchant_sess=; Path=/merchant; HttpOnly; SameSite=Strict${isProduction ? '; Secure' : ''}; Max-Age=0`
  );

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}
