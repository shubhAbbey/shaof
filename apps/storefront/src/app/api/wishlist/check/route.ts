import { NextRequest, NextResponse } from 'next/server';
import { SessionService, SESSION_COOKIE_NAME } from '../../../../lib/auth/session-service';
import { WishlistService } from '../../../../lib/wishlist/wishlist-service';

/**
 * GET /api/wishlist/check?variantId=... - Check if an exact variant is in customer's wishlist
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const variantId = searchParams.get('variantId') || searchParams.get('variant_id');

    if (!variantId || variantId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_VARIANT_ID', message: 'variantId parameter is required' },
        { status: 400 }
      );
    }

    if (variantId.startsWith('prod_')) {
      return NextResponse.json(
        { success: false, error: 'INVALID_VARIANT_ID', message: 'variantId cannot be a product ID' },
        { status: 400 }
      );
    }

    const tokenFromCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      // Guests don't have a wishlist -> return false without 401 error
      return NextResponse.json({
        success: true,
        isWishlisted: false,
      });
    }

    const session = await SessionService.getSession(token);
    if (!session || !session.id) {
      return NextResponse.json({
        success: true,
        isWishlisted: false,
      });
    }

    const isWishlisted = await WishlistService.checkItem(session.id, variantId.trim());

    return NextResponse.json({
      success: true,
      isWishlisted,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to check wishlist status',
      },
      { status: 500 }
    );
  }
}
