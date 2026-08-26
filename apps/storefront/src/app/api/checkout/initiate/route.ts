import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/auth-guard';
import { CheckoutService } from '../../../../lib/checkout/checkout-service';
import { SessionService } from '../../../../lib/auth/session-service';
import { CART_COOKIE_NAME } from '@ecom/types';

/**
 * POST /api/checkout/initiate
 * Authenticated endpoint to revalidate cart, bind payment details, and create trusted Razorpay/COD session
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
          message: 'No active cart found for checkout.',
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const paymentMethod = body.paymentMethod || 'razorpay';

    if (paymentMethod !== 'razorpay' && paymentMethod !== 'cod') {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PAYMENT_METHOD',
          message: 'Supported payment methods are "razorpay" and "cod".',
        },
        { status: 400 }
      );
    }

    const result = await CheckoutService.initiatePayment(
      cartId,
      paymentMethod,
      customer.id,
      customer.email || undefined
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/checkout/initiate] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to initiate checkout',
      },
      { status: 500 }
    );
  }
}
