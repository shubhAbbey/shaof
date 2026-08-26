import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/auth-guard';
import { CheckoutService } from '../../../../lib/checkout/checkout-service';
import { SessionService } from '../../../../lib/auth/session-service';
import { CART_COOKIE_NAME } from '@ecom/types';

/**
 * POST /api/checkout/complete-cod
 * Authenticated endpoint to place Cash on Delivery (COD) orders with Medusa manual payment semantics
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const customer = authResult.customer;
    let cartId = req.cookies.get(CART_COOKIE_NAME)?.value;

    if (!cartId) {
      cartId = (await SessionService.getCustomerActiveCartId(customer.id)) || undefined;
    }

    if (!cartId) {
      return NextResponse.json(
        {
          success: false,
          error: 'NO_ACTIVE_CART',
          message: 'No active cart found to complete COD order.',
        },
        { status: 400 }
      );
    }

    // 1. Verify COD is enabled in commerce configuration
    const isCodEnabled = process.env.COD_ENABLED !== 'false';
    if (!isCodEnabled) {
      return NextResponse.json(
        {
          success: false,
          error: 'COD_UNAVAILABLE',
          message: 'Cash on Delivery is currently unavailable.',
        },
        { status: 400 }
      );
    }

    // 2. Revalidate cart prerequisites (address and shipping method required)
    const validation = await CheckoutService.revalidateCheckoutCart(cartId, customer.id);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'VALIDATION_FAILED',
          message: validation.error || 'Cart validation failed before COD completion',
          requiresAddress: validation.requiresAddress,
          requiresShipping: validation.requiresShipping,
        },
        { status: 400 }
      );
    }

    // 3. Complete cart into Medusa Order with genuine manual/COD payment semantics
    const completionResult = await CheckoutService.completeCart(
      cartId,
      {
        provider: 'system_manual',
        isCod: true,
      },
      customer.id
    );

    if (!completionResult.success) {
      return NextResponse.json(completionResult, { status: 400 });
    }

    // 4. Clear cart cookie upon successful order completion
    const response = NextResponse.json(completionResult);
    response.cookies.delete(CART_COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error('[POST /api/checkout/complete-cod] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to complete COD order',
      },
      { status: 500 }
    );
  }
}
