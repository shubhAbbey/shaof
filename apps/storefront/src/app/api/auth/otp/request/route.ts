import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '../../../../../lib/auth/otp-service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobile, type } = body || {};

    // Extract client IP for abuse rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';

    const result = await OtpService.requestOtp({
      mobile,
      type,
      ip,
    });

    if (!result.success) {
      const status = result.error === 'RATE_LIMIT_EXCEEDED' || result.error === 'IP_RATE_LIMIT_EXCEEDED' ? 429 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'An unexpected error occurred while processing OTP request',
        expiresInSeconds: 0,
        error: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
