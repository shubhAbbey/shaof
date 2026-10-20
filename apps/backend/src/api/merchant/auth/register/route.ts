import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { MerchantAuthEngine } from '../../../../modules/auth/merchant-auth-engine';
import type { MerchantRegisterPayload } from '@ecom/types';

/**
 * POST /merchant/auth/register
 * Merchant onboarding registration with ACID PostgreSQL durability.
 *
 * Enforces:
 * 1. Server-side validation of name, email, Indian phone (+91), GSTIN, PAN, and password strength.
 * 2. Trusted backend creation: merchant status is initialized strictly to 'draft' (never client-activatable).
 * 3. Scrypt password hashing with unique salts (constant-time verification).
 * 4. ACID transactional persistence across PostgreSQL `merchant`, `"user"`, and `merchant_member` tables.
 * 5. Automatic rollback on failure (zero orphaned records).
 * 6. Returns merchant profile in 'draft' status awaiting Super Admin verification.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const body = (req.body as any) || {};
  const {
    name,
    handle,
    email,
    phone,
    businessRegistrationNumber,
    taxIdentifier,
    password,
  } = body as Partial<MerchantRegisterPayload>;

  if (!name || typeof name !== 'string' || !email || typeof email !== 'string' || !password || typeof password !== 'string') {
    res.status(400).json({
      success: false,
      error: 'MISSING_FIELDS',
      message: 'Name, email, and password are required for merchant onboarding.',
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

  try {
    const payload: MerchantRegisterPayload = {
      name: name.trim(),
      handle: handle?.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : '',
      businessRegistrationNumber: businessRegistrationNumber ? businessRegistrationNumber.trim().toUpperCase() : undefined,
      taxIdentifier: taxIdentifier ? taxIdentifier.trim().toUpperCase() : undefined,
      password,
    };

    // 1. Transactionally register merchant, owner account, and membership in PostgreSQL
    const { merchant, user, member } = await MerchantAuthEngine.registerMerchant(payload);

    res.status(201).json({
      success: true,
      merchant: {
        id: merchant.id,
        name: merchant.name,
        handle: merchant.handle,
        status: merchant.status,
        email: merchant.email,
        phone: merchant.phone,
        businessRegistrationNumber: merchant.businessRegistrationNumber || undefined,
        taxIdentifier: merchant.taxIdentifier || undefined,
        createdAt: merchant.createdAt,
      },
      member: {
        id: member.id,
        userId: user.id,
        role: user.role,
        status: user.membershipStatus,
      },
      message:
        "Merchant onboarding application submitted successfully. Your store is in 'draft' status awaiting verification by platform staff.",
    });
  } catch (err: any) {
    const message = err.message || 'Registration failed.';
    if (message.includes('MERCHANT_VALIDATION_FAILED')) {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message,
      });
      return;
    }

    if (message.includes('EMAIL_ALREADY_REGISTERED')) {
      res.status(409).json({
        success: false,
        error: 'EMAIL_ALREADY_REGISTERED',
        message: 'A merchant account with this corporate email already exists.',
      });
      return;
    }

    if (message.includes('HANDLE_ALREADY_IN_USE')) {
      res.status(409).json({
        success: false,
        error: 'HANDLE_ALREADY_IN_USE',
        message: 'The requested store handle is already taken.',
      });
      return;
    }

    res.status(400).json({
      success: false,
      error: 'REGISTRATION_FAILED',
      message,
    });
  }
}
