import type {
  FulfillmentStatus,
  FulfillmentDto,
  OrderLineItemDto,
  ShippingOptionDto,
} from '@ecom/types';

/**
 * FulfillmentEngine
 *
 * Pre-flight validation and calculation helper for fulfillment workflows.
 * Medusa's native fulfillment module, shipping provider workflows, and database tables
 * remain the authoritative source of truth for all fulfillment states.
 */
export class FulfillmentEngine {
  private static readonly VALID_TRANSITIONS: Record<FulfillmentStatus, FulfillmentStatus[]> = {
    not_fulfilled: ['partially_fulfilled', 'fulfilled', 'canceled'],
    partially_fulfilled: ['partially_fulfilled', 'fulfilled', 'partially_shipped', 'shipped', 'canceled'],
    fulfilled: ['partially_shipped', 'shipped', 'canceled'],
    partially_shipped: ['partially_shipped', 'shipped', 'delivered', 'canceled'],
    shipped: ['delivered', 'canceled'],
    delivered: [],
    canceled: [],
  };

  /**
   * Validates whether a fulfillment status transition is valid
   */
  static isValidStatusTransition(
    currentStatus: FulfillmentStatus,
    targetStatus: FulfillmentStatus
  ): boolean {
    const allowed = this.VALID_TRANSITIONS[currentStatus];
    return allowed ? allowed.includes(targetStatus) : false;
  }

  /**
   * Validates if items to fulfill exceed available unfulfilled quantities
   */
  static validateFulfillmentQuantities(
    orderItems: OrderLineItemDto[],
    existingFulfillments: FulfillmentDto[],
    itemsToFulfill: Array<{ lineItemId: string; quantity: number }>
  ): { valid: boolean; error?: string } {
    const fulfilledCounts: Record<string, number> = {};

    for (const f of existingFulfillments) {
      if (f.status === 'canceled') continue;
      for (const item of f.items) {
        fulfilledCounts[item.lineItemId] =
          (fulfilledCounts[item.lineItemId] || 0) + item.quantity;
      }
    }

    for (const reqItem of itemsToFulfill) {
      const orderItem = orderItems.find((i) => i.id === reqItem.lineItemId);
      if (!orderItem) {
        return {
          valid: false,
          error: `Line item ${reqItem.lineItemId} does not exist on order`,
        };
      }

      const alreadyFulfilled = fulfilledCounts[reqItem.lineItemId] || 0;
      if (alreadyFulfilled + reqItem.quantity > orderItem.quantity) {
        return {
          valid: false,
          error: `Requested quantity ${reqItem.quantity} for item ${reqItem.lineItemId} exceeds remaining unfulfilled quantity (${orderItem.quantity - alreadyFulfilled})`,
        };
      }
    }

    return { valid: true };
  }

  /**
   * Determines overall order fulfillment status from individual fulfillments
   */
  static computeOverallFulfillmentStatus(
    orderItems: OrderLineItemDto[],
    fulfillments: FulfillmentDto[]
  ): FulfillmentStatus {
    const activeFulfillments = fulfillments.filter((f) => f.status !== 'canceled');
    if (activeFulfillments.length === 0) {
      return 'not_fulfilled';
    }

    const totalOrdered = orderItems.reduce((acc, i) => acc + i.quantity, 0);
    let totalFulfilled = 0;
    let totalShipped = 0;
    let totalDelivered = 0;

    for (const f of activeFulfillments) {
      const fQuantity = f.items.reduce((acc, i) => acc + i.quantity, 0);
      totalFulfilled += fQuantity;
      if (f.status === 'shipped') {
        totalShipped += fQuantity;
      } else if (f.status === 'delivered') {
        totalShipped += fQuantity;
        totalDelivered += fQuantity;
      }
    }

    if (totalDelivered >= totalOrdered) return 'delivered';
    if (totalShipped >= totalOrdered) return 'shipped';
    if (totalShipped > 0) return 'partially_shipped';
    if (totalFulfilled >= totalOrdered) return 'fulfilled';
    if (totalFulfilled > 0) return 'partially_fulfilled';

    return 'not_fulfilled';
  }
}
