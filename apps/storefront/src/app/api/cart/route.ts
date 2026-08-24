import { NextRequest, NextResponse } from 'next/server';
import { MedusaCartService } from '../../../lib/cart/medusa-cart-service';
import { CART_COOKIE_NAME, CART_COOKIE_MAX_AGE } from '@ecom/types';

/**
 * GET /api/cart - Retrieve current active guest/customer cart
 */
export async function GET(req: NextRequest) {
  try {
    const cartId = req.cookies.get(CART_COOKIE_NAME)?.value;

    if (!cartId) {
      return NextResponse.json({
        success: true,
        cart: null,
      });
    }

    const cart = await MedusaCartService.getCart(cartId);

    if (!cart) {
      // Cart was deleted or expired in Medusa -> clear stale cookie
      const response = NextResponse.json({
        success: true,
        cart: null,
      });
      response.cookies.set({
        name: CART_COOKIE_NAME,
        value: '',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    return NextResponse.json({
      success: true,
      cart,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        cart: null,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to retrieve cart',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart - Create a new guest cart
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { regionId } = body || {};

    const cart = await MedusaCartService.createCart(regionId);

    const response = NextResponse.json({
      success: true,
      cart,
    });

    response.cookies.set({
      name: CART_COOKIE_NAME,
      value: cart.id,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: CART_COOKIE_MAX_AGE,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        cart: null,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to create cart',
      },
      { status: 500 }
    );
  }
}
