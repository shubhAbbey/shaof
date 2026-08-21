import type {
  PromotionDto,
  CartAdjustmentDto,
  OrderLineItemDto,
  PromotionRuleDto,
} from '@ecom/types';

/**
 * PromotionEngine
 *
 * In-memory helper and validation utility for promotion rules and discount previews.
 * Medusa's native Promotion module, campaign models, and cart/order workflows
 * remain the sole authoritative source of truth for pricing and discounts.
 */
export class PromotionEngine {
  /**
   * Evaluates whether a promotion is active given current time and status
   */
  static isPromotionActive(promotion: PromotionDto, referenceDate: Date = new Date()): boolean {
    if (promotion.status !== 'active') {
      return false;
    }

    const now = referenceDate.getTime();
    if (promotion.startDate && new Date(promotion.startDate).getTime() > now) {
      return false;
    }
    if (promotion.endDate && new Date(promotion.endDate).getTime() < now) {
      return false;
    }

    return true;
  }

  /**
   * Evaluates if a promotion rule matches the given context
   */
  static evaluateRule(rule: PromotionRuleDto, contextValue: string | number): boolean {
    const stringVal = String(contextValue);
    switch (rule.operator) {
      case 'eq':
        return rule.values.includes(stringVal);
      case 'ne':
        return !rule.values.includes(stringVal);
      case 'in':
        return rule.values.some((v) => v === stringVal);
      case 'nin':
        return !rule.values.some((v) => v === stringVal);
      default:
        return false;
    }
  }

  /**
   * Computes promotion discount adjustments on a subtotal or items
   */
  static calculateDiscount(
    promotion: PromotionDto,
    subtotal: number,
    items?: OrderLineItemDto[]
  ): CartAdjustmentDto | null {
    if (!this.isPromotionActive(promotion)) {
      return null;
    }

    const method = promotion.applicationMethod;
    if (!method) {
      return null;
    }

    let discountAmount = 0;

    if (method.type === 'percentage') {
      // Percentage discount: e.g. 10% on 1000 = 100
      discountAmount = Math.round((subtotal * method.value) / 100);
      if (method.maxQuantity && discountAmount > method.maxQuantity) {
        discountAmount = method.maxQuantity;
      }
    } else if (method.type === 'fixed') {
      // Fixed amount discount: e.g. 200 off
      discountAmount = Math.min(method.value, subtotal);
    }

    if (discountAmount <= 0) {
      return null;
    }

    return {
      id: `adj_${promotion.code.toLowerCase()}_${Date.now()}`,
      code: promotion.code,
      amount: discountAmount,
      promotionId: promotion.id,
      description: `${method.type === 'percentage' ? `${method.value}% off` : `₹${method.value} off`} (${promotion.code})`,
    };
  }
}
