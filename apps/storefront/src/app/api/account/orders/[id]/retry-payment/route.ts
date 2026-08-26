import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../lib/auth/auth-guard';
import { OrderService } from '../../../../../../lib/orders/order-service';

/**
 * POST /api/account/orders/[id]/retry-payment
 * Safe payment retry endpoint for unpaid / failed orders
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const result = await OrderService.retryOrderPayment(orderId, customer.id);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/account/orders/[id]/retry-payment] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to initiate payment retry',
      },
      { status: 500 }
    );
  }
}
