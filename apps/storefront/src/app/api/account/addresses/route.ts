import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/auth-guard';
import { normalizeIndianMobile } from '../../../../lib/auth/phone-utils';
import { AddressService } from '../../../../lib/addresses/address-service';

/**
 * GET /api/account/addresses - List authenticated customer saved addresses
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const customerId = authResult.customer.id;
    const addresses = await AddressService.listAddresses(customerId);

    return NextResponse.json({
      success: true,
      addresses,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to retrieve addresses',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/account/addresses - Add a new saved address for authenticated customer
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const customerId = authResult.customer.id;
    const body = await req.json().catch(() => ({}));

    const {
      fullName,
      mobile,
      addressLine1,
      addressLine2,
      landmark,
      city,
      state,
      pincode,
      countryCode = 'in',
      addressType = 'home',
      isDefault = false,
    } = body;

    // Field validations
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'INVALID_FULL_NAME', message: 'Full name must be at least 2 characters' },
        { status: 400 }
      );
    }

    if (!mobile || typeof mobile !== 'string' || mobile.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'INVALID_MOBILE', message: 'Mobile number is required' },
        { status: 400 }
      );
    }

    const phoneValidation = normalizeIndianMobile(mobile);
    if (!phoneValidation.isValid) {
      return NextResponse.json(
        { success: false, error: 'INVALID_MOBILE', message: phoneValidation.error || 'Please enter a valid 10-digit Indian mobile number' },
        { status: 400 }
      );
    }

    if (!addressLine1 || typeof addressLine1 !== 'string' || addressLine1.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'INVALID_ADDRESS_LINE_1', message: 'Address line 1 must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!city || typeof city !== 'string' || city.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'INVALID_CITY', message: 'City is required' },
        { status: 400 }
      );
    }

    if (!state || typeof state !== 'string' || state.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'INVALID_STATE', message: 'State is required' },
        { status: 400 }
      );
    }

    const cleanPincode = String(pincode || '').trim();
    if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PINCODE', message: 'Please enter a valid 6-digit Indian PIN code' },
        { status: 400 }
      );
    }

    const validAddressTypes = ['home', 'office', 'other'];
    const normalizedType = validAddressTypes.includes(String(addressType).toLowerCase())
      ? String(addressType).toLowerCase()
      : 'home';

    const result = await AddressService.createAddress(customerId, {
      fullName: fullName.trim(),
      mobile: phoneValidation.normalized,
      addressLine1: addressLine1.trim(),
      addressLine2: addressLine2 && typeof addressLine2 === 'string' ? addressLine2.trim() : undefined,
      landmark: landmark && typeof landmark === 'string' ? landmark.trim() : undefined,
      city: city.trim(),
      state: state.trim(),
      pincode: cleanPincode,
      countryCode: String(countryCode || 'in').toLowerCase().trim(),
      addressType: normalizedType as any,
      isDefault: Boolean(isDefault),
    });

    return NextResponse.json(
      {
        success: true,
        address: result.address,
        addresses: result.addresses,
        message: 'Address added successfully',
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'CREATE_ADDRESS_FAILED',
        message: error?.message || 'Failed to add address',
      },
      { status: 500 }
    );
  }
}
