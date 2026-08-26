import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/auth-guard';
import { CheckoutService } from '../../../../lib/checkout/checkout-service';
import { SessionService } from '../../../../lib/auth/session-service';
import { CART_COOKIE_NAME } from '@ecom/types';

/**
 * POST /api/checkout/verify
 * Authenticated endpoint to verify Razorpay signature server-side and complete order
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
          message: 'No active cart found for payment verification.',
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        {
          success: false,
          error: 'MISSING_PAYMENT_DETAILS',
          message: 'Razorpay order ID, payment ID, and signature are required.',
        },
        { status: 400 }
      );
    }

    // 1. Server-side HMAC-SHA256 signature verification with constant-time comparison
    const isValidSignature = CheckoutService.verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_SIGNATURE',
          message: 'Payment verification failed: cryptographic signature mismatch.',
        },
        { status: 400 }
      );
    }

    // 2. Authoritative cart completion into Medusa Order
    const completionResult = await CheckoutService.completeCart(
      cartId,
      {
        provider: 'razorpay',
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        isCod: false,
      },
      customer.id
    );

    if (!completionResult.success) {
      return NextResponse.json(completionResult, { status: 400 });
    }

    // 3. Clear cart cookie upon successful order completion
    const response = NextResponse.json(completionResult);
    response.cookies.delete(CART_COOKIE_NAME);

    return response;
  } catch (error: any) {
    console.error('[POST /api/checkout/verify] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to verify payment and complete order',
      },
      { status: 500 }
    );
  }
}
