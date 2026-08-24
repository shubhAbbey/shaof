import { NextRequest, NextResponse } from 'next/server';
import { OtpService } from '../../../../../lib/auth/otp-service';

export async function GET(req: NextRequest) {
  try {
    // 1. Production fail-closed check
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'Not Found', error: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const mobile = searchParams.get('mobile') || '';
    const type = (searchParams.get('type') as any) || 'login';

    // 2. S2S authorization header or query param
    const s2sToken = req.headers.get('x-s2s-auth-token') || searchParams.get('s2sToken') || '';

    const result = await OtpService.devFetchOtp({
      mobile,
      type,
      s2sToken,
    });

    if (!result.success) {
      const status = result.error === 'UNAUTHORIZED_S2S' ? 401 : result.error === 'FORBIDDEN_IN_PRODUCTION' ? 403 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: 'Internal error in dev OTP fetch',
        error: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
