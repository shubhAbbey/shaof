import { NextRequest, NextResponse } from 'next/server';
import { MedusaCartService } from '../../../../lib/cart/medusa-cart-service';
import { CART_COOKIE_NAME } from '@ecom/types';

/**
 * POST /api/cart/shipping-methods - Select and attach shipping method to active cart
 */
export async function POST(req: NextRequest) {
  try {
    const cartId = req.cookies.get(CART_COOKIE_NAME)?.value;

    if (!cartId || !cartId.startsWith('cart_')) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_ACTIVE_CART',
          message: 'No active cart found to attach shipping method',
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const optionId = body.optionId || body.option_id;
    const additionalData = body.data;

    if (!optionId || typeof optionId !== 'string' || optionId.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          error: 'SHIPPING_OPTION_REQUIRED',
          message: 'Valid shipping option ID is required',
        },
        { status: 400 }
      );
    }

    const updatedCart = await MedusaCartService.setShippingMethod(
      cartId,
      optionId.trim(),
      additionalData
    );

    return NextResponse.json({
      success: true,
      cart: updatedCart,
      message: 'Shipping method attached successfully',
    });
  } catch (error: any) {
    console.error('[BFF API] POST /api/cart/shipping-methods error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'SET_SHIPPING_METHOD_FAILED',
        message: error?.message || 'Failed to attach shipping method to cart',
      },
      { status: 500 }
    );
  }
}
