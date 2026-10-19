import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';
import crypto from 'node:crypto';

const KNOWN_DEV_SECRETS = new Set([
  'ecom-s2s-dev-token-secret',
  'dev_secret',
  'test_secret',
  'placeholder',
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
  if (trimmed.length !== secret.length) return false;
  return crypto.timingSafeEqual(Buffer.from(trimmed), Buffer.from(secret));
}

const ALLOWED_GENDERS = new Set(['male', 'female', 'other', 'prefer_not_to_say']);

/**
 * POST /store/customers
 * Create or update customer in Medusa Customer Module
 *
 * Security Controls (M2-02 Verification):
 * 1. Authentication: Requires verified S2S authorization header (x-s2s-auth-token) to prevent unauthorized mutations.
 * 2. Production Fail-Closed: Strictly blocks known development secrets in production environments.
 * 3. Account-Takeover Resistance: Unauthenticated callers cannot update existing customer records or hijack accounts.
 * 4. Metadata Allowlisting: Accepts only validated 'gender' and 'date_of_birth' fields; strips any arbitrary/elevated keys.
 * 5. Protected Fields: System fields (id, has_account, created_at) are immutable.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const s2sToken = (req.headers['x-s2s-auth-token'] as string) || '';
  if (!verifyS2SToken(s2sToken)) {
    res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Server-to-server authorization required to create or update customer records.',
    });
    return;
  }

  const body = req.body as any;
  const { mobile, firstName, lastName, email, gender, dateOfBirth } = body || {};

  if (!mobile || typeof mobile !== 'string' || mobile.trim() === '') {
    res.status(400).json({
      success: false,
      error: 'MOBILE_REQUIRED',
      message: 'mobile is required',
    });
    return;
  }

  const phone = mobile.trim();

  // Validate allowed metadata strictly
  const sanitizedMetadata: Record<string, string> = {};

  if (gender !== undefined && gender !== null && gender !== '') {
    if (!ALLOWED_GENDERS.has(gender)) {
      res.status(400).json({
        success: false,
        error: 'INVALID_GENDER',
        message: `gender must be one of: ${Array.from(ALLOWED_GENDERS).join(', ')}`,
      });
      return;
    }
    sanitizedMetadata.gender = gender;
  }

  if (dateOfBirth !== undefined && dateOfBirth !== null && dateOfBirth !== '') {
    if (typeof dateOfBirth !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(dateOfBirth.trim())) {
      res.status(400).json({
        success: false,
        error: 'INVALID_DATE_OF_BIRTH',
        message: 'dateOfBirth must be in YYYY-MM-DD format',
      });
      return;
    }
    sanitizedMetadata.date_of_birth = dateOfBirth.trim();
  }

  try {
    const customerModule: any = req.scope.resolve(Modules.CUSTOMER);
    const existingList = await customerModule.listCustomers({ phone });
    const existing = existingList && existingList.length > 0 ? existingList[0] : null;

    const existingMetadata = existing?.metadata || {};
    const metadata = {
      ...existingMetadata,
      ...sanitizedMetadata,
    };

    let customerRecord: any;

    if (existing) {
      // Update existing customer with validated fields
      const updateData: Record<string, any> = {
        metadata,
      };
      if (firstName !== undefined && firstName !== null && firstName.trim() !== '') {
        updateData.first_name = firstName.trim();
      }
      if (lastName !== undefined && lastName !== null && lastName.trim() !== '') {
        updateData.last_name = lastName.trim();
      }
      if (email !== undefined && email !== null && email.trim() !== '') {
        updateData.email = email.trim().toLowerCase();
      }

      customerRecord = await customerModule.updateCustomers(existing.id, updateData);
    } else {
      // Create new customer
      customerRecord = await customerModule.createCustomers({
        phone,
        first_name: firstName && firstName.trim() !== '' ? firstName.trim() : null,
        last_name: lastName && lastName.trim() !== '' ? lastName.trim() : null,
        email: email && email.trim() !== '' ? email.trim().toLowerCase() : null,
        has_account: true,
        metadata,
      });
    }

    const resMetadata = customerRecord.metadata || {};
    const customer = {
      id: customerRecord.id,
      mobile: customerRecord.phone || phone,
      email: customerRecord.email || null,
      firstName: customerRecord.first_name || null,
      lastName: customerRecord.last_name || null,
      gender: resMetadata.gender || null,
      dateOfBirth: resMetadata.date_of_birth || null,
      createdAt: customerRecord.created_at
        ? new Date(customerRecord.created_at).toISOString()
        : new Date().toISOString(),
    };

    res.status(existing ? 200 : 201).json({
      success: true,
      customer,
      isNew: !existing,
    });
  } catch (err: any) {
    console.error('[Medusa Store API] POST /store/customers error:', err.message);
    res.status(500).json({
      success: false,
      error: 'CUSTOMER_SAVE_FAILED',
      message: err.message,
    });
  }
}
