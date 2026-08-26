import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../../lib/auth/auth-guard';
import { OrderService } from '../../../../../../lib/orders/order-service';
import type { ReturnRequestPayload } from '@ecom/types';

/**
 * POST /api/account/orders/[id]/returns
 * Authenticated customer return request with strict server-side eligibility check
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

    const body = (await req.json().catch(() => ({}))) as ReturnRequestPayload;

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PAYLOAD',
          message: 'At least one order line item must be selected for return.',
        },
        { status: 400 }
      );
    }

    const result = await OrderService.requestOrderReturn(orderId, customer.id, {
      ...body,
      orderId,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[POST /api/account/orders/[id]/returns] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to submit return request',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/account/orders/[id]/returns
 * List return requests for an order
 */
export async function GET(
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

    const order = await OrderService.getOrderById(orderId, customer.id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: 'ORDER_NOT_FOUND', message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      returns: order.returns || [],
    });
  } catch (error: any) {
    console.error('[GET /api/account/orders/[id]/returns] Error:', error);
    return NextResponse.json(
      { success: false, error: 'INTERNAL_SERVER_ERROR', message: 'Failed to fetch returns' },
      { status: 500 }
    );
  }
}
