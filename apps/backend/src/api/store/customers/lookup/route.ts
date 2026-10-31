import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';
import crypto from 'node:crypto';

const KNOWN_DEV_SECRETS = new Set([
  'ecom-s2s-dev-token-secret',
  'dev_secret',
  'test_secret',
  'placeholder',
  'sess_fb78c0486c41e081c7b36ca93163d881d9f46bbdc89f4aacc3e93d4f5e0cd89e',
]);

function getS2SSecret(): string | null {
  const isProd = process.env.NODE_ENV === 'production';
  const token = process.env.S2S_AUTH_TOKEN;

  if (isProd) {
    // In production, S2S_AUTH_TOKEN must be explicitly set and cannot be a known dev secret
    if (!token || token.trim() === '' || KNOWN_DEV_SECRETS.has(token.trim())) {
      console.error('[SECURITY ALERT] Production S2S_AUTH_TOKEN is missing or using known development secret! Failing closed.');
      return null;
    }
    return token.trim();
  }

  // Non-production fallback for development/testing only
  return token && token.trim() !== '' ? token.trim() : 'ecom-s2s-dev-token-secret';
}

function verifyS2SToken(token: string | undefined): boolean {
  if (!token || typeof token !== 'string') return false;
  const secret = getS2SSecret();
  if (!secret) return false; // Fail-closed in production if secret is unconfigured or insecure

  const trimmed = token.trim();
  if (trimmed.length === secret.length && crypto.timingSafeEqual(Buffer.from(trimmed), Buffer.from(secret))) {
    return true;
  }

  // Non-production fallback: accept known dev secrets for seamless local integration
  if (process.env.NODE_ENV !== 'production') {
    const devSecrets = [
      'ecom-s2s-dev-token-secret',
      'sess_fb78c0486c41e081c7b36ca93163d881d9f46bbdc89f4aacc3e93d4f5e0cd89e',
    ];
    for (const devSecret of devSecrets) {
      if (trimmed.length === devSecret.length && crypto.timingSafeEqual(Buffer.from(trimmed), Buffer.from(devSecret))) {
        return true;
      }
    }
  }

  return false;
}

/**
 * GET /store/customers/lookup?phone=+91XXXXXXXXXX
 * Look up whether customer exists in Medusa Customer Module by normalized Indian mobile phone.
 *
 * Security Controls (M2-02 Verification):
 * 1. S2S Authorization: Requires S2S server-to-server token header (x-s2s-auth-token) to prevent public account enumeration.
 * 2. Production Fail-Closed: Strictly blocks known development secrets in production environments.
 * 3. ZERO PII LEAKAGE: Returns strictly { success: true, exists: boolean }. Never returns customer records, names, emails, or IDs.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const s2sToken = (req.headers['x-s2s-auth-token'] as string) || '';
  if (!verifyS2SToken(s2sToken)) {
    res.status(401).json({
      success: false,
      exists: false,
      error: 'UNAUTHORIZED',
      message: 'Server-to-server authorization required for customer lookup to prevent public enumeration.',
    });
    return;
  }

  const phone = (req.query.phone as string) || (req.query.mobile as string);

  if (!phone || phone.trim() === '') {
    res.status(400).json({
      success: false,
      exists: false,
      error: 'PHONE_REQUIRED',
      message: 'phone query parameter is required',
    });
    return;
  }

  try {
    const customerModule: any = req.scope.resolve(Modules.CUSTOMER);
    const trimmedPhone = phone.trim();
    let customers = await customerModule.listCustomers({ phone: trimmedPhone });
    if ((!customers || customers.length === 0) && trimmedPhone.startsWith('+91')) {
      customers = await customerModule.listCustomers({ phone: trimmedPhone.slice(3) });
    } else if ((!customers || customers.length === 0) && !trimmedPhone.startsWith('+91')) {
      customers = await customerModule.listCustomers({ phone: `+91${trimmedPhone}` });
    }
    const exists = Boolean(customers && customers.length > 0);

    // ZERO PII LEAKAGE: Return strictly exists boolean to prevent customer enumeration
    res.status(200).json({
      success: true,
      exists,
    });
  } catch (err: any) {
    console.error('[Medusa Store API] GET /store/customers/lookup error:', err.message);
    res.status(500).json({
      success: false,
      exists: false,
      error: 'CUSTOMER_LOOKUP_FAILED',
      message: err.message,
    });
  }
}
