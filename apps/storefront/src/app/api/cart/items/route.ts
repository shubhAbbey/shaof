import { NextRequest, NextResponse } from 'next/server';
import { MedusaCartService } from '../../../../lib/cart/medusa-cart-service';
import { CART_COOKIE_NAME, CART_COOKIE_MAX_AGE } from '@ecom/types';

/**
 * POST /api/cart/items - Add line item to cart (creates cart if missing)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, quantity = 1, metadata } = body || {};

    if (!variantId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_VARIANT_ID', message: 'Variant ID is required' },
        { status: 400 }
      );
    }

    if (typeof quantity !== 'number' || quantity <= 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_QUANTITY', message: 'Quantity must be at least 1' },
        { status: 400 }
      );
    }

    let cartId = req.cookies.get(CART_COOKIE_NAME)?.value;
    let isNewCart = false;

    // Check if cart exists in Medusa, otherwise create new
    if (cartId) {
      const existingCart = await MedusaCartService.getCart(cartId);
      if (!existingCart) {
        cartId = undefined;
      }
    }

    let updatedCart;
    try {
      if (!cartId) {
        const newCart = await MedusaCartService.createCart();
        cartId = newCart.id;
        isNewCart = true;
      }
      updatedCart = await MedusaCartService.addLineItem(cartId, variantId, quantity, metadata);
    } catch (addErr: any) {
      if (addErr?.message?.includes('CART_NOT_FOUND')) {
        // Stale or invalid cart -> recreate real cart and retry addLineItem
        const newCart = await MedusaCartService.createCart();
        cartId = newCart.id;
        isNewCart = true;
        updatedCart = await MedusaCartService.addLineItem(cartId, variantId, quantity, metadata);
      } else {
        throw addErr;
      }
    }

    const response = NextResponse.json({
      success: true,
      cart: updatedCart,
      message: 'Item added to cart successfully',
    });

    if (isNewCart || req.cookies.get(CART_COOKIE_NAME)?.value !== cartId) {
      response.cookies.set({
        name: CART_COOKIE_NAME,
        value: cartId,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: CART_COOKIE_MAX_AGE,
      });
    }


    return response;
  } catch (error: any) {
    const msg = error?.message || 'Failed to add item to cart';
    const isInventory = msg.includes('INSUFFICIENT_INVENTORY') || msg.toLowerCase().includes('stock');
    return NextResponse.json(
      {
        success: false,
        error: isInventory ? 'INSUFFICIENT_INVENTORY' : 'ADD_TO_CART_FAILED',
        message: isInventory ? 'The requested quantity exceeds available stock.' : msg,
      },
      { status: isInventory ? 400 : 500 }
    );
  }
}
