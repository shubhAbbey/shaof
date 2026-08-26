import { NextRequest, NextResponse } from 'next/server';
import { MedusaCartService } from '../../../../lib/cart/medusa-cart-service';
import { CART_COOKIE_NAME, CART_COOKIE_MAX_AGE } from '@ecom/types';

/**
 * POST /api/cart/address - Set/update shipping address on the active cart
 */
export async function POST(req: NextRequest) {
  try {
    let cartId = req.cookies.get(CART_COOKIE_NAME)?.value;
    let isNewCart = false;

    if (!cartId) {
      const newCart = await MedusaCartService.createCart();
      cartId = newCart.id;
      isNewCart = true;
    }

    const body = await req.json();
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
    } = body || {};

    if (!fullName || typeof fullName !== 'string' || fullName.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'FULL_NAME_REQUIRED', message: 'Full name is required' },
        { status: 400 }
      );
    }
    if (!mobile || typeof mobile !== 'string' || mobile.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'MOBILE_REQUIRED', message: 'Mobile number is required' },
        { status: 400 }
      );
    }
    if (!addressLine1 || typeof addressLine1 !== 'string' || addressLine1.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'ADDRESS_LINE_1_REQUIRED', message: 'Address line 1 is required' },
        { status: 400 }
      );
    }
    if (!city || typeof city !== 'string' || city.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'CITY_REQUIRED', message: 'City is required' },
        { status: 400 }
      );
    }
    if (!state || typeof state !== 'string' || state.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'STATE_REQUIRED', message: 'State is required' },
        { status: 400 }
      );
    }
    if (!pincode || typeof pincode !== 'string' || pincode.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'PINCODE_REQUIRED', message: 'Pincode is required' },
        { status: 400 }
      );
    }

    let updatedCart: any;
    try {
      updatedCart = await MedusaCartService.setShippingAddress(cartId, {
        fullName: fullName.trim(),
        mobile: mobile.trim(),
        addressLine1: addressLine1.trim(),
        addressLine2: addressLine2 ? addressLine2.trim() : undefined,
        landmark: landmark ? landmark.trim() : undefined,
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        countryCode: countryCode.trim().toLowerCase(),
        addressType,
      });
    } catch (err: any) {
      if (err?.message?.includes('not found') || err?.message?.includes('CART_NOT_FOUND')) {
        const newCart = await MedusaCartService.createCart();
        cartId = newCart.id;
        isNewCart = true;
        updatedCart = await MedusaCartService.setShippingAddress(cartId, {
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          addressLine1: addressLine1.trim(),
          addressLine2: addressLine2 ? addressLine2.trim() : undefined,
          landmark: landmark ? landmark.trim() : undefined,
          city: city.trim(),
          state: state.trim(),
          pincode: pincode.trim(),
          countryCode: countryCode.trim().toLowerCase(),
          addressType,
        });
      } else {
        throw err;
      }
    }

    const response = NextResponse.json({
      success: true,
      cart: updatedCart,
      message: 'Cart shipping address updated successfully',
    });

    if (isNewCart || req.cookies.get(CART_COOKIE_NAME)?.value !== cartId) {
      response.cookies.set({
        name: CART_COOKIE_NAME,
        value: cartId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: CART_COOKIE_MAX_AGE,
      });
    }

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'UPDATE_CART_ADDRESS_FAILED',
        message: error?.message || 'Failed to update cart shipping address',
      },
      { status: 500 }
    );
  }
}
