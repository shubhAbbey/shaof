import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../../lib/auth/auth-guard';
import { OrderService } from '../../../../../../../lib/orders/order-service';

/**
 * POST /api/account/orders/[id]/refunds/prepaid
 * Phase 30: Prepaid Razorpay refund endpoint
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

    const body = await req.json().catch(() => ({}));
    const { returnId, amount } = body;

    if (!returnId || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PARAMETERS',
          message: 'Valid returnId and positive refund amount are required.',
        },
        { status: 400 }
      );
    }

    const result = await OrderService.processPrepaidRefund(
      orderId,
      returnId,
      amount,
      customer.id
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/account/orders/[id]/refunds/prepaid] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to process prepaid refund',
      },
      { status: 500 }
    );
  }
}
