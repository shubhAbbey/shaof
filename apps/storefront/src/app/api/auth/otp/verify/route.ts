import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '../../../../../lib/auth/otp-service';
import { SessionService, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '../../../../../lib/auth/session-service';
import { MedusaCartService } from '../../../../../lib/cart/medusa-cart-service';
import { CART_COOKIE_NAME, CART_COOKIE_MAX_AGE } from '@ecom/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobile, otp, type, fullName, firstName, lastName, email, gender, dateOfBirth } = body || {};

    const resolvedFirstName = firstName || (fullName ? fullName.split(' ')[0] : undefined);
    const resolvedLastName = lastName || (fullName && fullName.split(' ').length > 1 ? fullName.split(' ').slice(1).join(' ') : undefined);

    const result = await OtpService.verifyOtp({
      mobile,
      otp,
      type,
      fullName: fullName || (resolvedFirstName ? (resolvedFirstName + ' ' + (resolvedLastName || '')).trim() : undefined),
      email,
    });

    if (!result.success) {
      const status = result.error === 'MAX_ATTEMPTS_EXCEEDED' ? 429 : 400;
      return NextResponse.json(result, { status });
    }

    const existing = await SessionService.lookupCustomer(result.customer?.mobile || mobile);

    const savedCustomer = await SessionService.saveCustomer({
      mobile: result.customer?.mobile || mobile,
      firstName: resolvedFirstName || existing.customer?.firstName || undefined,
      lastName: resolvedLastName || existing.customer?.lastName || undefined,
      email: email || existing.customer?.email || undefined,
      gender: gender || existing.customer?.gender || undefined,
      dateOfBirth: dateOfBirth || existing.customer?.dateOfBirth || undefined,
    });

    const session = await SessionService.createSession(savedCustomer, SESSION_TTL_SECONDS);

    // Phase 21: Deterministic guest-to-customer cart merge
    const guestCartId = req.cookies.get(CART_COOKIE_NAME)?.value;
    let mergeResult;
    try {
      mergeResult = await MedusaCartService.reconcileCartOnLogin({
        guestCartId,
        customer: savedCustomer,
      });
    } catch (cartErr: any) {
      console.warn('[POST /api/auth/otp/verify] Non-fatal cart reconciliation error:', cartErr.message);
    }

    const activeCart = mergeResult?.cart || null;

    const response = NextResponse.json(
      {
        success: true,
        message: 'Authentication successful',
        customer: savedCustomer,
        token: session.token,
        cart: activeCart,
        cartMerge: mergeResult
          ? {
              status: mergeResult.status,
              conflictItems: mergeResult.conflictItems,
            }
          : undefined,
      },
      { status: 200 }
    );

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    if (activeCart && activeCart.id) {
      response.cookies.set({
        name: CART_COOKIE_NAME,
        value: activeCart.id,
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
        message: 'An unexpected error occurred while verifying OTP',
        error: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
