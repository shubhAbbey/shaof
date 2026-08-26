import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../../lib/auth/auth-guard';
import { OrderService } from '../../../../../../../lib/orders/order-service';
import type { RefundDetailsDto } from '@ecom/types';

/**
 * POST /api/account/orders/[id]/refunds/cod
 * Phase 31: COD refund methods & payout abstraction boundary endpoint
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
    const { returnId, method, details, amount } = body;

    if (!returnId || !method || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PARAMETERS',
          message: 'returnId, valid method (upi | bank_transfer | store_credit), and positive amount are required.',
        },
        { status: 400 }
      );
    }

    if (!['upi', 'bank_transfer', 'store_credit'].includes(method)) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNSUPPORTED_METHOD',
          message: 'Supported COD refund methods are "upi", "bank_transfer", and "store_credit".',
        },
        { status: 400 }
      );
    }

    const result = await OrderService.processCodRefund(
      orderId,
      returnId,
      method,
      (details || {}) as RefundDetailsDto,
      amount,
      customer.id
    );

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/account/orders/[id]/refunds/cod] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to process COD refund payout',
      },
      { status: 500 }
    );
  }
}
