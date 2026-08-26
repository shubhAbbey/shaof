import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../../lib/auth/auth-guard';
import { OrderService } from '../../../../../lib/orders/order-service';

/**
 * GET /api/account/orders/[id]
 * Authenticated customer single order details
 * Enforces IDOR protection & customer ownership
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

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: 'MISSING_ORDER_ID', message: 'Order ID is required' },
        { status: 400 }
      );
    }

    const order = await OrderService.getOrderById(orderId, customer.id);

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: 'ORDER_NOT_FOUND',
          message: 'Order not found or you do not have permission to view it.',
        },
        { status: 404 }
      );
    }

    const response = NextResponse.json({
      success: true,
      order,
    });

    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error: any) {
    console.error('[GET /api/account/orders/[id]] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to fetch order details',
      },
      { status: 500 }
    );
  }
}
