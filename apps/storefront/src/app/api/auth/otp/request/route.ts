import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '../../../../../lib/auth/otp-service';

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_REQUEST',
          message: 'Invalid JSON request body',
          expiresInSeconds: 0,
        },
        { status: 400 }
      );
    }

    const { mobile, type } = body || {};

    // Extract client IP for abuse rate limiting
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1';

    // Extract S2S token from header to determine test/dev-fetch eligibility
    const s2sToken = req.headers.get('x-s2s-auth-token') || undefined;

    const result = await OtpService.requestOtp({
      mobile,
      type,
      ip,
      s2sToken,
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
