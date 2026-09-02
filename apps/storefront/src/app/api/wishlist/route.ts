import { NextRequest, NextResponse } from 'next/server';
import { SessionService, SESSION_COOKIE_NAME } from '../../../lib/auth/session-service';
import { WishlistService } from '../../../lib/wishlist/wishlist-service';

/**
 * GET /api/wishlist - List authenticated customer's wishlist items
 */
export async function GET(req: NextRequest) {
  try {
    const tokenFromCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Authentication required to view wishlist' },
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

    const wishlist = await WishlistService.getWishlist(session.id);

    const response = NextResponse.json({
      success: true,
      wishlist,
    });
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error: any) {
    const errResponse = NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to retrieve wishlist',
      },
      { status: 500 }
    );
    errResponse.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return errResponse;
  }
}

/**
 * POST /api/wishlist - Add item to customer's wishlist (idempotent)
 */
export async function POST(req: NextRequest) {
  try {
    const tokenFromCookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
    const authHeader = req.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = tokenFromCookie || tokenFromHeader;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'Authentication required to add item to wishlist' },
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

    const body = await req.json();
    const { productId, variantId, title, handle, thumbnail, price, originalPrice, currencyCode, inStock, options } = body || {};

    if (!productId || typeof productId !== 'string' || productId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_PRODUCT_ID', message: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!variantId || typeof variantId !== 'string' || variantId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_VARIANT_ID', message: 'Variant ID is required' },
        { status: 400 }
      );
    }

    if (variantId.startsWith('prod_')) {
      return NextResponse.json(
        { success: false, error: 'INVALID_VARIANT_ID', message: 'variantId cannot be a product ID' },
        { status: 400 }
      );
    }

    const result = await WishlistService.addItem(session.id, {
      productId: productId.trim(),
      variantId: variantId.trim(),
      title: title ? String(title).trim() : 'Saved Item',
      handle: handle ? String(handle).trim() : undefined,
      thumbnail: thumbnail ? String(thumbnail).trim() : undefined,
      price: typeof price === 'number' ? price : undefined,
      originalPrice: typeof originalPrice === 'number' ? originalPrice : undefined,
      currencyCode: currencyCode || 'INR',
      inStock: typeof inStock === 'boolean' ? inStock : true,
      options: options && typeof options === 'object' ? options : {},
    });

    return NextResponse.json({
      success: true,
      item: result.item,
      wishlist: result.wishlist,
      isNew: result.isNew,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to add item to wishlist',
      },
      { status: 500 }
    );
  }
}
