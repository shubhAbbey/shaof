import { NextRequest, NextResponse } from 'next/server';
import { MedusaCartService } from '../../../../lib/cart/medusa-cart-service';
import { CART_COOKIE_NAME } from '@ecom/types';

/**
 * GET /api/cart/shipping-options - List eligible shipping options for the active cart
 */
export async function GET(req: NextRequest) {
  try {
    const cartId = req.cookies.get(CART_COOKIE_NAME)?.value;

    if (!cartId || !cartId.startsWith('cart_')) {
      return NextResponse.json({
        success: true,
        shippingOptions: [],
        message: 'No active cart found',
      });
    }

    const currentCart = await MedusaCartService.getCart(cartId);
    if (!currentCart) {
      return NextResponse.json({
        success: true,
        shippingOptions: [],
        message: 'Cart not found',
      });
    }

    if (!currentCart.shippingAddress) {
      return NextResponse.json({
        success: true,
        shippingOptions: [],
        requiresAddress: true,
        message: 'Delivery address is required before fetching shipping options',
      });
    }

    const shippingOptions = await MedusaCartService.getShippingOptions(cartId);

    return NextResponse.json({
      success: true,
      shippingOptions,
      count: shippingOptions.length,
    });
  } catch (error: any) {
    console.error('[BFF API] GET /api/cart/shipping-options error:', error.message);
    return NextResponse.json(
      {
        success: false,
        error: 'FETCH_SHIPPING_OPTIONS_FAILED',
        message: error?.message || 'Failed to fetch shipping options',
        shippingOptions: [],
      },
      { status: 500 }
    );
  }
}
