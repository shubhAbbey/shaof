import type {
  ReturnDto,
  ReturnRequestPayload,
  OrderLineItemDto,
  CodRefundPayoutDto,
  RefundMethod,
  RefundDetailsDto,
} from '@ecom/types';

export class ReturnEngine {
  /**
   * Validates a return request payload against an order's items and previous returns
   */
  static validateReturnRequest(
    orderItems: OrderLineItemDto[],
    previousReturns: ReturnDto[],
    payload: ReturnRequestPayload
  ): { valid: boolean; error?: string; refundableAmount?: number } {
    if (!payload.items || payload.items.length === 0) {
      return { valid: false, error: 'Return request must include at least one item' };
    }

    const previouslyReturnedCounts: Record<string, number> = {};
    for (const r of previousReturns) {
      if (r.status === 'canceled') continue;
      for (const item of r.items) {
        previouslyReturnedCounts[item.lineItemId] =
          (previouslyReturnedCounts[item.lineItemId] || 0) + item.quantity;
      }
    }

    let calculatedRefundAmount = 0;

    for (const reqItem of payload.items) {
      const orderItem = orderItems.find((i) => i.id === reqItem.lineItemId);
      if (!orderItem) {
        return {
          valid: false,
          error: `Line item ${reqItem.lineItemId} not found on order`,
        };
      }

      if (reqItem.quantity <= 0) {
        return {
          valid: false,
          error: `Invalid quantity ${reqItem.quantity} for item ${reqItem.lineItemId}`,
        };
      }

      const alreadyReturned = previouslyReturnedCounts[reqItem.lineItemId] || 0;
      if (alreadyReturned + reqItem.quantity > orderItem.quantity) {
        return {
          valid: false,
          error: `Return quantity ${reqItem.quantity} exceeds available quantity (${orderItem.quantity - alreadyReturned}) for item ${reqItem.lineItemId}`,
        };
      }

      // Compute refundable item amount (pro-rated unit price after line item adjustments)
      const effectiveUnitPrice = orderItem.total / orderItem.quantity;
      calculatedRefundAmount += Math.round(effectiveUnitPrice * reqItem.quantity);
    }

    // If COD refund details provided, validate payout details
    if (payload.refundMethod && payload.refundMethod !== 'original') {
      const detailsError = this.validateRefundDetails(payload.refundMethod, payload.refundDetails);
      if (detailsError) {
        return { valid: false, error: detailsError };
      }
    }

    return {
      valid: true,
      refundableAmount: calculatedRefundAmount,
    };
  }

  /**
   * Validates refund destination details for COD payouts (UPI / Bank Transfer / Store Credit)
   */
  static validateRefundDetails(
    method: RefundMethod,
    details?: RefundDetailsDto
  ): string | null {
    if (!details) {
      return `Refund details are required for ${method} refund method`;
    }

    if (method === 'upi') {
      if (!details.upiId || !details.upiId.includes('@')) {
        return 'A valid UPI ID (e.g. user@okhdfcbank) is required';
      }
    } else if (method === 'bank_transfer') {
      if (!details.accountNumber || details.accountNumber.length < 8) {
        return 'A valid bank account number is required';
      }
      if (!details.ifscCode || details.ifscCode.length !== 11) {
        return 'A valid 11-character IFSC code is required';
      }
      if (!details.beneficiaryName || details.beneficiaryName.trim().length === 0) {
        return 'Beneficiary name is required for bank transfer';
      }
    }

    return null;
  }

  /**
   * Initializes a COD refund payout record with duplicate prevention idempotency key
   */
  static createCodRefundPayout(params: {
    orderId: string;
    returnId?: string;
    amount: number;
    currencyCode: string;
    method: 'upi' | 'bank_transfer' | 'store_credit';
    details: RefundDetailsDto;
  }): CodRefundPayoutDto {
    const idempotencyKey = `payout_${params.orderId}_${params.returnId || 'manual'}_${params.method}_${params.amount}`;

    return {
      id: `payout_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      orderId: params.orderId,
      returnId: params.returnId,
      amount: params.amount,
      currencyCode: params.currencyCode,
      method: params.method,
      status: 'pending',
      details: params.details,
      idempotencyKey,
      createdAt: new Date().toISOString(),
    };
  }
}
