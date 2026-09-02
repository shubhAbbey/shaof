import { MedusaRequest, MedusaResponse } from '@medusajs/framework/http';
import { Modules } from '@medusajs/framework/utils';

/**
 * POST /store/orders/:id/cancel
 * Native Medusa Order Cancellation Endpoint for Storefront API
 * Authoritatively executes Medusa Order module cancellation workflow.
 */
export async function POST(req: MedusaRequest, res: MedusaResponse): Promise<void> {
  const { id } = req.params;
  const body = req.body as any;
  const customerId = body?.customer_id || body?.customerId;

  if (!id) {
    res.status(400).json({ success: false, error: 'ORDER_ID_REQUIRED', message: 'Order ID is required' });
    return;
  }

  try {
    const orderModule: any = req.scope.resolve(Modules.ORDER);
    const order = await orderModule.retrieveOrder(id, { relations: ['items', 'shipping_address', 'shipping_methods', 'payment_collections'] });

    if (!order) {
      res.status(404).json({ success: false, error: 'ORDER_NOT_FOUND', message: 'Order not found' });
      return;
    }

    // Verify customer ownership inside Medusa backend
    if (customerId && order.customer_id && order.customer_id !== customerId) {
      res.status(403).json({ success: false, error: 'FORBIDDEN', message: 'You are not authorized to cancel this order' });
      return;
    }

    // Verify order status
    if (order.status === 'canceled') {
      res.status(409).json({ success: false, error: 'ALREADY_CANCELED', message: 'This order is already canceled' });
      return;
    }

    // Verify fulfillment status (pre-fulfillment rule)
    if (order.fulfillment_status && order.fulfillment_status !== 'not_fulfilled') {
      res.status(409).json({ success: false, error: 'ALREADY_FULFILLED', message: 'Fulfilled orders cannot be canceled' });
      return;
    }

    // Execute native Medusa order cancellation workflow
    let updatedOrder: any;
    if (typeof orderModule.cancelOrder === 'function') {
      updatedOrder = await orderModule.cancelOrder({
        order_id: id,
        canceled_by: customerId || 'customer',
        no_notification: false,
      });
    } else if (typeof orderModule.updateOrders === 'function') {
      updatedOrder = await orderModule.updateOrders(id, {
        status: 'canceled',
        canceled_at: new Date(),
      });
    }

    res.status(200).json({
      success: true,
      order: updatedOrder || order,
      message: 'Order successfully canceled',
    });
  } catch (err: any) {
    console.error('[Medusa Store API] POST /store/orders/:id/cancel error:', err.message);
    res.status(500).json({ success: false, error: 'ORDER_CANCEL_FAILED', message: err.message });
  }
}
