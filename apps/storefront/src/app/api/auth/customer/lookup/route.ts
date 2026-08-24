import { NextRequest, NextResponse } from 'next/server';
import { SessionService } from '../../../../../lib/auth/session-service';
import { normalizeIndianMobile } from '../../../../../lib/auth/phone-utils';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mobile } = body || {};

    const validation = normalizeIndianMobile(mobile);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          exists: false,
          mobile: '',
          error: validation.error || 'INVALID_MOBILE',
          message: validation.error || 'Invalid mobile number',
        },
        { status: 400 }
      );
    }

    const result = await SessionService.lookupCustomer(validation.normalized);

    return NextResponse.json({
      success: true,
      exists: result.exists,
      mobile: validation.normalized,
      customer: result.customer,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        exists: false,
        mobile: '',
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to look up customer',
      },
      { status: 500 }
    );
  }
}
