import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../lib/auth/auth-guard';
import { OrderService } from '../../../../../../lib/orders/order-service';

/**
 * POST /api/account/orders/[id]/cancel
 * Customer Order Cancellation with Server-Side Pre-Fulfillment Verification
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Enforce authenticated customer session
    const authResult = await requireAuth(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const customer = authResult.customer;
    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_ORDER_ID', message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const reason = typeof body?.reason === 'string' ? body.reason : undefined;

    // 2. Perform authoritative cancellation with IDOR, eligibility & concurrency checks
    const result = await OrderService.cancelOrder(orderId, customer.id, reason);

    if (!result.success) {
      const isNotFoundOrUnauthorized = result.error?.includes('not found') || result.error?.includes('unauthorized');
      const isAlreadyCanceled = result.error?.includes('already canceled');
      const isFulfilled = result.error?.includes('fulfilled') || result.error?.includes('shipped');
      const isLocked = result.error?.includes('already being processed');

      const statusCode = isNotFoundOrUnauthorized
        ? 404
        : isAlreadyCanceled || isFulfilled || isLocked
        ? 409
        : 400;

      return NextResponse.json(result, { status: statusCode });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error('[POST /api/account/orders/[id]/cancel] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while processing order cancellation.',
      },
      { status: 500 }
    );
  }
}
