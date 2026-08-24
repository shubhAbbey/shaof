import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '../../../../../lib/auth/otp-service';
import { SessionService, SESSION_COOKIE_NAME, SESSION_TTL_SECONDS } from '../../../../../lib/auth/session-service';

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

    const response = NextResponse.json(
      {
        success: true,
        message: 'Authentication successful',
        customer: savedCustomer,
        token: session.token,
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
