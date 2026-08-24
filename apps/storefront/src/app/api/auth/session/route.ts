import { NextRequest, NextResponse } from 'next/server';
import { SessionService, SESSION_COOKIE_NAME } from '../../../../lib/auth/session-service';

export async function GET(req: NextRequest) {
  try {
    const tokenFromCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
        customer: null,
      });
    }

    const customer = await SessionService.getSession(token);
    if (!customer) {
      return NextResponse.json({
        success: true,
        isAuthenticated: false,
        customer: null,
      });
    }

    return NextResponse.json({
      success: true,
      isAuthenticated: true,
      customer,
      token,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        isAuthenticated: false,
        customer: null,
        error: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}
