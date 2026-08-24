import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '../../../../../lib/auth/otp-service';
import { normalizeIndianMobile } from '../../../../../lib/auth/phone-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstName, lastName, email, mobile } = body || {};

    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'First name is required', error: 'MISSING_FIRST_NAME' },
        { status: 400 }
      );
    }

    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Last name is required', error: 'MISSING_LAST_NAME' },
        { status: 400 }
      );
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { success: false, message: 'Valid email address is required', error: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    const validation = normalizeIndianMobile(mobile);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error || 'Invalid mobile number', error: 'INVALID_MOBILE' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';

    const otpResult = await OtpService.requestOtp({
      mobile: validation.normalized,
      type: 'register',
      ip,
    });

    if (!otpResult.success) {
      const status = otpResult.error === 'RATE_LIMIT_EXCEEDED' ? 429 : 400;
      return NextResponse.json(otpResult, { status });
    }

    return NextResponse.json({
      success: true,
      message: 'Registration OTP sent successfully',
      expiresInSeconds: otpResult.expiresInSeconds,
      mobile: validation.normalized,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred during registration',
        error: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
