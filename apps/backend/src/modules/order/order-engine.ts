import type {
  OrderLineItemDto,
  OrderShippingMethodDto,
  CartAdjustmentDto,
  OrderSummaryDto,
  OrderStatus,
  OrderPaymentStatus,
} from '@ecom/types';

export class OrderEngine {
  /**
   * Computes exact order financial summaries from items, adjustments, and shipping
   */
  static computeOrderSummary(
    items: OrderLineItemDto[],
    shippingMethods: OrderShippingMethodDto[],
    orderAdjustments: CartAdjustmentDto[] = [],
    paidAmount: number = 0,
    refundedAmount: number = 0
  ): OrderSummaryDto {
    const itemSubtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

    const itemDiscountTotal = items.reduce((acc, item) => {
      const adj = item.adjustments?.reduce((a, ad) => a + ad.amount, 0) || 0;
      return acc + adj;
    }, 0);

    const orderAdjustmentTotal = orderAdjustments.reduce((acc, adj) => acc + adj.amount, 0);
    const discountTotal = itemDiscountTotal + orderAdjustmentTotal;

    const subtotal = Math.max(0, itemSubtotal - discountTotal);

    const shippingTotal = shippingMethods.reduce((acc, s) => acc + s.amount, 0);

    const taxTotal = items.reduce((acc, item) => acc + (item.taxTotal || 0), 0) +
      shippingMethods.reduce((acc, s) => acc + (s.taxTotal || 0), 0);

    const total = subtotal + shippingTotal + taxTotal;

    return {
      itemSubtotal,
      subtotal,
      discountTotal,
      shippingTotal,
      taxTotal,
      total,
      paidTotal: paidAmount,
      refundedTotal: refundedAmount,
      difference: Math.max(0, total - paidAmount),
    };
  }

  /**
   * Derives OrderPaymentStatus based on total, authorized, captured, and refunded amounts
   */
  static derivePaymentStatus(
    total: number,
    authorizedAmount: number,
    capturedAmount: number,
    refundedAmount: number
  ): OrderPaymentStatus {
    if (refundedAmount > 0) {
      return refundedAmount >= capturedAmount ? 'refunded' : 'partially_refunded';
    }

    if (capturedAmount >= total && total > 0) {
      return 'captured';
    }

    if (capturedAmount > 0) {
      return 'partially_captured';
    }

    if (authorizedAmount >= total && total > 0) {
      return 'authorized';
    }

    if (authorizedAmount > 0) {
      return 'partially_authorized';
    }

    return 'not_paid';
  }
}
