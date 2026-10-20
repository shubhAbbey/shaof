import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { resolveSessionFromToken } from '../../../middlewares/tenant-auth';

/**
 * GET /merchant/auth/session
 * Returns the currently active Merchant session, validating sliding expiry and revocation status.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const authHeader = (req.headers['authorization'] as string) || '';
  const cookieHeader = (req.headers['cookie'] as string) || '';
  let token: string | null = null;

  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)ecom_merchant_sess=([^;]+)/);
    if (match) token = decodeURIComponent(match[1].trim());
  }

  if (!token) {
    res.status(401).json({
      success: false,
      authenticated: false,
      error: 'UNAUTHORIZED',
      message: 'No active Merchant session token found.',
    });
    return;
  }

  const session = await resolveSessionFromToken(token);
  if (!session || session.authBoundary !== 'merchant') {
    res.status(401).json({
      success: false,
      authenticated: false,
      error: 'UNAUTHORIZED',
      message: 'Invalid, expired, or revoked Merchant session.',
    });
    return;
  }

  res.status(200).json({
    success: true,
    authenticated: true,
    session,
  });
}
