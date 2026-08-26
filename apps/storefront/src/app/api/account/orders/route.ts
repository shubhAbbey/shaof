import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../lib/auth/auth-guard';
import { OrderService } from '../../../../lib/orders/order-service';

/**
 * GET /api/account/orders
 * Authenticated customer order history list
 * Enforces session ownership & sets Cache-Control: private, no-store
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAuth(req);
    if (!authResult.authorized) {
      return authResult.response;
    }

    const customer = authResult.customer;
    const orders = await OrderService.listCustomerOrders(customer.id);

    const response = NextResponse.json({
      success: true,
      orders,
      count: orders.length,
    });

    // Prevent caching of private customer financial data
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    return response;
  } catch (error: any) {
    console.error('[GET /api/account/orders] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Failed to fetch order history',
      },
      { status: 500 }
    );
  }
}
