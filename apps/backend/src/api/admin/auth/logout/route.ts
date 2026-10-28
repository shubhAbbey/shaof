import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { SuperAdminAuthEngine } from '../../../../modules/auth/super-admin-auth-engine';

export const AUTHENTICATE = false;

/**
 * POST /admin/auth/logout
 * Revokes the active Super Admin session from shared storage and clears the session cookie.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const authHeader = (req.headers['authorization'] as string) || '';
  const cookieHeader = (req.headers['cookie'] as string) || '';
  let token: string | null = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)ecom_admin_sess=([^;]+)/);
    if (match) token = decodeURIComponent(match[1].trim());
  }

  if (token) {
    await SuperAdminAuthEngine.revokeSession(token);
  }

  const isProduction = process.env.NODE_ENV === 'production';
  // Clear HTTP-only cookie
  res.setHeader(
    'Set-Cookie',
    `ecom_admin_sess=; Path=/; HttpOnly; SameSite=Strict${isProduction ? '; Secure' : ''}; Max-Age=0`
  );

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}
