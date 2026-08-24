import { NextRequest, NextResponse } from 'next/server';
import { MedusaCartService } from '../../../../../lib/cart/medusa-cart-service';
import { CART_COOKIE_NAME } from '@ecom/types';

/**
 * PATCH / POST /api/cart/items/[lineId] - Update line item quantity in cart
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { lineId: string } }
) {
  return handleUpdate(req, params.lineId);
}

export async function POST(
  req: NextRequest,
  { params }: { params: { lineId: string } }
) {
  return handleUpdate(req, params.lineId);
}

async function handleUpdate(req: NextRequest, lineId: string) {
  try {
    const cartId = req.cookies.get(CART_COOKIE_NAME)?.value;
    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'NO_ACTIVE_CART', message: 'No active cart found' },
        { status: 400 }
      );
    }

    if (!lineId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_LINE_ID', message: 'Line item ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { quantity } = body || {};

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { success: false, error: 'INVALID_QUANTITY', message: 'Quantity must be non-negative' },
        { status: 400 }
      );
    }

    const updatedCart = await MedusaCartService.updateLineItem(cartId, lineId, quantity);

    return NextResponse.json({
      success: true,
      cart: updatedCart,
      message: quantity === 0 ? 'Item removed from cart' : 'Quantity updated successfully',
    });
  } catch (error: any) {
    const msg = error?.message || 'Failed to update item';
    const isInventory = msg.includes('INSUFFICIENT_INVENTORY') || msg.toLowerCase().includes('stock');
    return NextResponse.json(
      {
        success: false,
        error: isInventory ? 'INSUFFICIENT_INVENTORY' : 'UPDATE_CART_FAILED',
        message: isInventory ? 'The requested quantity exceeds available stock.' : msg,
      },
      { status: isInventory ? 400 : 500 }
    );
  }
}

/**
 * DELETE /api/cart/items/[lineId] - Remove line item from cart
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { lineId: string } }
) {
  try {
    const cartId = req.cookies.get(CART_COOKIE_NAME)?.value;
    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'NO_ACTIVE_CART', message: 'No active cart found' },
        { status: 400 }
      );
    }

    const { lineId } = params;
    if (!lineId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_LINE_ID', message: 'Line item ID is required' },
        { status: 400 }
      );
    }

    const updatedCart = await MedusaCartService.deleteLineItem(cartId, lineId);

    return NextResponse.json({
      success: true,
      cart: updatedCart,
      message: 'Item removed from cart successfully',
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: 'DELETE_CART_ITEM_FAILED',
        message: error?.message || 'Failed to delete item from cart',
      },
      { status: 500 }
    );
  }
}
