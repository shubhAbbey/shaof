import { NextRequest, NextResponse } from 'next/server';
import { SessionService, SESSION_COOKIE_NAME } from '../../../../lib/auth/session-service';
import { WishlistService } from '../../../../lib/wishlist/wishlist-service';

/**
 * DELETE /api/wishlist/[id] - Remove item from customer's wishlist (idempotent)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tokenFromCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Authentication required to remove wishlist item' },
        { status: 401 }
      );
    }

    const session = await SessionService.getSession(token);
    if (!session || !session.id) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Invalid or expired customer session' },
        { status: 401 }
      );
    }

    const targetId = params?.id;
    if (!targetId || targetId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_ITEM_ID', message: 'Item or Product ID is required' },
        { status: 400 }
      );
    }

    const result = await WishlistService.removeItem(session.id, targetId);

    return NextResponse.json({
      success: true,
      wishlist: result.wishlist,
      removed: result.removed,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to remove wishlist item',
      },
      { status: 500 }
    );
  }
}
