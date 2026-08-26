import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth/auth-guard';
import { normalizeIndianMobile } from '../../../../../lib/auth/phone-utils';
import { AddressService } from '../../../../../lib/addresses/address-service';

/**
 * GET /api/account/addresses/[addressId] - Retrieve single address for authenticated customer
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { addressId } = params;
    if (!addressId || addressId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'MISSING_ADDRESS_ID', message: 'Address ID is required' },
        { status: 400 }
      );
    }

    const address = await AddressService.getAddress(authResult.customer.id, addressId.trim());
    if (!address) {
      return NextResponse.json(
        { success: false, error: 'NOT_FOUND', message: 'Address not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      address,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to retrieve address',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/addresses/[addressId] - Update address for authenticated customer
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { addressId } = params;
    if (!addressId || addressId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'MISSING_ADDRESS_ID', message: 'Address ID is required' },
        { status: 400 }
      );
    }

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
      countryCode,
      addressType,
      isDefault,
    } = body;

    const payload: Record<string, any> = {};

    if (fullName !== undefined) {
      if (typeof fullName !== 'string' || fullName.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'INVALID_FULL_NAME', message: 'Full name must be at least 2 characters' },
          { status: 400 }
        );
      }
      payload.fullName = fullName.trim();
    }

    if (mobile !== undefined) {
      const phoneValidation = normalizeIndianMobile(mobile);
      if (!phoneValidation.isValid) {
        return NextResponse.json(
          { success: false, error: 'INVALID_MOBILE', message: phoneValidation.error || 'Please enter a valid 10-digit Indian mobile number' },
          { status: 400 }
        );
      }
      payload.mobile = phoneValidation.normalized;
    }

    if (addressLine1 !== undefined) {
      if (typeof addressLine1 !== 'string' || addressLine1.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'INVALID_ADDRESS_LINE_1', message: 'Address line 1 must be at least 3 characters' },
          { status: 400 }
        );
      }
      payload.addressLine1 = addressLine1.trim();
    }

    if (addressLine2 !== undefined) {
      payload.addressLine2 = typeof addressLine2 === 'string' ? addressLine2.trim() : '';
    }

    if (landmark !== undefined) {
      payload.landmark = typeof landmark === 'string' ? landmark.trim() : '';
    }

    if (city !== undefined) {
      if (typeof city !== 'string' || city.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'INVALID_CITY', message: 'City is required' },
          { status: 400 }
        );
      }
      payload.city = city.trim();
    }

    if (state !== undefined) {
      if (typeof state !== 'string' || state.trim().length < 2) {
        return NextResponse.json(
          { success: false, error: 'INVALID_STATE', message: 'State is required' },
          { status: 400 }
        );
      }
      payload.state = state.trim();
    }

    if (pincode !== undefined) {
      const cleanPincode = String(pincode || '').trim();
      if (!cleanPincode || !/^\d{6}$/.test(cleanPincode)) {
        return NextResponse.json(
          { success: false, error: 'INVALID_PINCODE', message: 'Please enter a valid 6-digit Indian PIN code' },
          { status: 400 }
        );
      }
      payload.pincode = cleanPincode;
    }

    if (countryCode !== undefined) {
      payload.countryCode = String(countryCode).toLowerCase().trim();
    }

    if (addressType !== undefined) {
      const validTypes = ['home', 'office', 'other'];
      payload.addressType = validTypes.includes(String(addressType).toLowerCase())
        ? String(addressType).toLowerCase()
        : 'home';
    }

    if (isDefault !== undefined) {
      payload.isDefault = Boolean(isDefault);
    }

    const result = await AddressService.updateAddress(
      authResult.customer.id,
      addressId.trim(),
      payload
    );

    return NextResponse.json({
      success: true,
      address: result.address,
      addresses: result.addresses,
      message: 'Address updated successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'UPDATE_ADDRESS_FAILED',
        message: error?.message || 'Failed to update address',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/account/addresses/[addressId] - Delete address for authenticated customer
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { addressId: string } }
) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const { addressId } = params;
    if (!addressId || addressId.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'MISSING_ADDRESS_ID', message: 'Address ID is required' },
        { status: 400 }
      );
    }

    const result = await AddressService.deleteAddress(authResult.customer.id, addressId.trim());

    return NextResponse.json({
      success: true,
      addresses: result.addresses,
      message: 'Address deleted successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'DELETE_ADDRESS_FAILED',
        message: error?.message || 'Failed to delete address',
      },
      { status: 500 }
    );
  }
}
