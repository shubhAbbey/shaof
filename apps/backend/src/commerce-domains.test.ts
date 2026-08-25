import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BasePaymentProvider,
  PromotionEngine,
  FulfillmentEngine,
  OrderEngine,
  ReturnEngine,
  BackendAuthGuard,
  WishlistEngine,
} from './index.js';


import type {
  InitiatePaymentInput,
  InitiatePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
} from '@medusajs/types';
import type {
  PromotionDto,
  OrderLineItemDto,
  OrderShippingMethodDto,
  FulfillmentDto,
  ReturnDto,
  ReturnRequestPayload,
} from '@ecom/types';

// ========================================================
// 1. Mock Payment Provider Implementation for Testing
// ========================================================
class MockPaymentProvider extends BasePaymentProvider {
  static override identifier = 'mock_payment_provider';

  constructor(cradle: Record<string, unknown> = {}, config: Record<string, unknown> = {}) {
    super(cradle, config);
  }

  async initiatePayment(data: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    return {
      id: `mock_sess_${Date.now()}`,
      data: { amount: data.amount, currency_code: data.currency_code, status: 'pending' },
      status: 'pending',
    };
  }

  async authorizePayment(data: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    return {
      status: 'authorized',
      data: { ...(data.data || {}), authorizedAt: new Date().toISOString() },
    };
  }

  async capturePayment(data: CapturePaymentInput): Promise<CapturePaymentOutput> {
    return {
      data: { ...(data.data || {}), captured: true },
    };
  }

  async refundPayment(data: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return {
      data: { ...(data.data || {}), refunded: true, refundAmount: data.amount },
    };
  }

  async cancelPayment(data: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {
      data: { ...(data.data || {}), canceled: true },
    };
  }
}

describe('Task 04: Commerce Core Domains', () => {
  describe('Payment Provider Abstraction', () => {
    it('implements BasePaymentProvider with proper identifier and lifecycle methods', async () => {
      const provider = new MockPaymentProvider({}, {});

      assert.equal(provider.identifier, 'mock_payment_provider');

      // Initiate
      const initRes = await provider.initiatePayment({
        amount: 249900,
        currency_code: 'INR',
      });
      assert.equal(initRes.status, 'pending');
      assert.equal(initRes.data?.amount, 249900);

      // Authorize
      const authRes = await provider.authorizePayment({
        data: initRes.data,
      });
      assert.equal(authRes.status, 'authorized');

      // Capture
      const capRes = await provider.capturePayment({
        data: authRes.data,
      });
      assert.equal(capRes.data?.captured, true);

      // Refund
      const refRes = await provider.refundPayment({
        data: capRes.data,
        amount: 249900,
      });
      assert.equal(refRes.data?.refunded, true);

      // Cancel
      const cancelRes = await provider.cancelPayment({
        data: initRes.data,
      });
      assert.equal(cancelRes.data?.canceled, true);
    });
  });

  describe('Promotion & Discount Domain', () => {
    it('computes percentage discounts accurately with caps', () => {
      const promo: PromotionDto = {
        id: 'promo_1',
        code: 'SUMMER20',
        type: 'standard',
        status: 'active',
        applicationMethod: {
          type: 'percentage',
          targetType: 'order',
          value: 20, // 20%
          maxQuantity: 500, // Cap at ₹500
        },
      };

      // 20% on 2000 is 400 (under cap)
      const adj1 = PromotionEngine.calculateDiscount(promo, 2000);
      assert.ok(adj1);
      assert.equal(adj1.amount, 400);
      assert.equal(adj1.code, 'SUMMER20');

      // 20% on 5000 is 1000 (capped at 500)
      const adj2 = PromotionEngine.calculateDiscount(promo, 5000);
      assert.ok(adj2);
      assert.equal(adj2.amount, 500);
    });

    it('computes fixed discounts accurately', () => {
      const promo: PromotionDto = {
        id: 'promo_2',
        code: 'FLAT200',
        type: 'standard',
        status: 'active',
        applicationMethod: {
          type: 'fixed',
          targetType: 'order',
          value: 200,
        },
      };

      const adj = PromotionEngine.calculateDiscount(promo, 1500);
      assert.ok(adj);
      assert.equal(adj.amount, 200);
    });

    it('evaluates rule conditions properly', () => {
      assert.equal(
        PromotionEngine.evaluateRule({ attribute: 'currency_code', operator: 'eq', values: ['INR'] }, 'INR'),
        true
      );
      assert.equal(
        PromotionEngine.evaluateRule({ attribute: 'currency_code', operator: 'eq', values: ['USD'] }, 'INR'),
        false
      );
      assert.equal(
        PromotionEngine.evaluateRule({ attribute: 'category', operator: 'in', values: ['mens', 'womens'] }, 'mens'),
        true
      );
    });
  });

  describe('Shipping & Fulfillment Boundaries', () => {
    it('validates state transitions accurately', () => {
      assert.equal(FulfillmentEngine.isValidStatusTransition('not_fulfilled', 'fulfilled'), true);
      assert.equal(FulfillmentEngine.isValidStatusTransition('fulfilled', 'shipped'), true);
      assert.equal(FulfillmentEngine.isValidStatusTransition('shipped', 'delivered'), true);
      assert.equal(FulfillmentEngine.isValidStatusTransition('delivered', 'not_fulfilled'), false);
    });

    it('validates fulfillment item quantities against order line items', () => {
      const orderItems: OrderLineItemDto[] = [
        {
          id: 'item_1',
          title: 'Cotton Kurta',
          variantId: 'var_1',
          productId: 'prod_1',
          quantity: 2,
          unitPrice: 999,
          total: 1998,
          subtotal: 1998,
          taxTotal: 0,
          discountTotal: 0,
        },
      ];

      const existingFulfillments: FulfillmentDto[] = [];

      // Valid: fulfill 1
      const res1 = FulfillmentEngine.validateFulfillmentQuantities(
        orderItems,
        existingFulfillments,
        [{ lineItemId: 'item_1', quantity: 1 }]
      );
      assert.equal(res1.valid, true);

      // Invalid: fulfill 3 (exceeds order quantity 2)
      const res2 = FulfillmentEngine.validateFulfillmentQuantities(
        orderItems,
        existingFulfillments,
        [{ lineItemId: 'item_1', quantity: 3 }]
      );
      assert.equal(res2.valid, false);
    });

    it('computes overall fulfillment status from active fulfillments', () => {
      const orderItems: OrderLineItemDto[] = [
        {
          id: 'item_1',
          title: 'Silk Saree',
          variantId: 'var_1',
          productId: 'prod_1',
          quantity: 2,
          unitPrice: 2999,
          total: 5998,
          subtotal: 5998,
          taxTotal: 0,
          discountTotal: 0,
        },
      ];

      const fulfillments: FulfillmentDto[] = [
        {
          id: 'ful_1',
          providerId: 'manual',
          status: 'shipped',
          items: [{ id: 'fi_1', lineItemId: 'item_1', quantity: 2 }],
        },
      ];

      assert.equal(
        FulfillmentEngine.computeOverallFulfillmentStatus(orderItems, fulfillments),
        'shipped'
      );
    });
  });

  describe('Order Summary & Workflows', () => {
    it('computes order financial summaries accurately', () => {
      const items: OrderLineItemDto[] = [
        {
          id: 'item_1',
          title: 'Chino Trousers',
          variantId: 'var_1',
          productId: 'prod_1',
          quantity: 2,
          unitPrice: 1500,
          total: 3000,
          subtotal: 3000,
          taxTotal: 150,
          discountTotal: 0,
        },
      ];

      const shipping: OrderShippingMethodDto[] = [
        {
          id: 'ship_1',
          name: 'Standard Express',
          amount: 99,
          taxTotal: 0,
        },
      ];

      const adjustments = [{ id: 'adj_1', code: 'OFF100', amount: 100 }];

      const summary = OrderEngine.computeOrderSummary(items, shipping, adjustments, 3149, 0);

      assert.equal(summary.itemSubtotal, 3000);
      assert.equal(summary.discountTotal, 100);
      assert.equal(summary.subtotal, 2900);
      assert.equal(summary.shippingTotal, 99);
      assert.equal(summary.taxTotal, 150);
      assert.equal(summary.total, 3149);
      assert.equal(summary.difference, 0);
    });

    it('derives payment statuses correctly', () => {
      assert.equal(OrderEngine.derivePaymentStatus(1000, 0, 0, 0), 'not_paid');
      assert.equal(OrderEngine.derivePaymentStatus(1000, 1000, 0, 0), 'authorized');
      assert.equal(OrderEngine.derivePaymentStatus(1000, 1000, 1000, 0), 'captured');
      assert.equal(OrderEngine.derivePaymentStatus(1000, 1000, 1000, 500), 'partially_refunded');
      assert.equal(OrderEngine.derivePaymentStatus(1000, 1000, 1000, 1000), 'refunded');
    });
  });

  describe('Return & Refund Domain with COD Abstraction', () => {
    it('validates return request and computes refund amount', () => {
      const orderItems: OrderLineItemDto[] = [
        {
          id: 'item_1',
          title: 'Embroidered Kurti',
          variantId: 'var_1',
          productId: 'prod_1',
          quantity: 2,
          unitPrice: 1200,
          total: 2400,
          subtotal: 2400,
          taxTotal: 0,
          discountTotal: 0,
        },
      ];

      const previousReturns: ReturnDto[] = [];

      const payload: ReturnRequestPayload = {
        orderId: 'order_123',
        items: [{ lineItemId: 'item_1', quantity: 1, reason: 'Size too large' }],
        refundMethod: 'upi',
        refundDetails: { upiId: 'customer@okhdfcbank' },
      };

      const result = ReturnEngine.validateReturnRequest(orderItems, previousReturns, payload);
      assert.equal(result.valid, true);
      assert.equal(result.refundableAmount, 1200);
    });

    it('validates COD refund details strictly', () => {
      assert.ok(ReturnEngine.validateRefundDetails('upi', { upiId: 'invalid-upi' }));
      assert.equal(ReturnEngine.validateRefundDetails('upi', { upiId: 'valid@okaxis' }), null);

      assert.ok(
        ReturnEngine.validateRefundDetails('bank_transfer', {
          accountNumber: '123',
          ifscCode: 'HDFC0001234',
          beneficiaryName: 'John',
        })
      );
    });

    it('generates COD refund payout with idempotency key', () => {
      const payout = ReturnEngine.createCodRefundPayout({
        orderId: 'order_999',
        returnId: 'ret_888',
        amount: 1200,
        currencyCode: 'INR',
        method: 'upi',
        details: { upiId: 'user@paytm' },
      });

      assert.ok(payout.id);
      assert.equal(payout.status, 'pending');
      assert.equal(payout.amount, 1200);
      assert.equal(payout.idempotencyKey, 'payout_order_999_ret_888_upi_1200');
    });
  });

  describe('Task 19: Backend Authorization & Customer Ownership Enforcement', () => {
    it('allows access when session customer ID matches resource owner ID', () => {
      const result = BackendAuthGuard.validateResourceOwnership('cus_12345', 'cus_12345');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
      assert.equal(result.error, undefined);
    });

    it('rejects with 401 UNAUTHORIZED when session customer ID is missing or null', () => {
      const resNull = BackendAuthGuard.validateResourceOwnership(null, 'cus_12345');
      assert.equal(resNull.allowed, false);
      assert.equal(resNull.statusCode, 401);
      assert.equal(resNull.error, 'UNAUTHORIZED');

      const resEmpty = BackendAuthGuard.validateResourceOwnership('', 'cus_12345');
      assert.equal(resEmpty.allowed, false);
      assert.equal(resEmpty.statusCode, 401);
      assert.equal(resEmpty.error, 'UNAUTHORIZED');
    });

    it('rejects with 403 FORBIDDEN when customer attempts to access another customer resource', () => {
      const result = BackendAuthGuard.validateResourceOwnership('cus_customer_A', 'cus_customer_B');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });

    it('sanitizes redirect paths and blocks open redirect attack vectors', () => {
      assert.equal(BackendAuthGuard.sanitizeRedirect('/checkout'), '/checkout');
      assert.equal(BackendAuthGuard.sanitizeRedirect('/account/orders'), '/account/orders');
      assert.equal(BackendAuthGuard.sanitizeRedirect('https://evil.com'), '/account');
      assert.equal(BackendAuthGuard.sanitizeRedirect('//evil.com'), '/account');
      assert.equal(BackendAuthGuard.sanitizeRedirect('/\\evil.com'), '/account');
      assert.equal(BackendAuthGuard.sanitizeRedirect(undefined), '/account');
    });
  });

  describe('Task 22: Wishlist Engine Domain & Customer Persistence', () => {
    it('generates deterministic wishlist item ID for customer and variant', () => {
      const id1 = WishlistEngine.generateItemId('cus_100', 'var_red');
      const id2 = WishlistEngine.generateItemId('cus_100', 'var_red');
      const id3 = WishlistEngine.generateItemId('cus_200', 'var_red');

      assert.equal(id1, id2);
      assert.notEqual(id1, id3);
      assert.ok(id1.startsWith('wsh_'));
    });

    it('adds variant item to wishlist and formats WishlistDto properly', () => {
      const result = WishlistEngine.addWishlistItem(
        'cus_100',
        {
          productId: 'prod_saree_1',
          variantId: 'var_red',
          title: 'Silk Saree (Red)',
          price: 2999,
          currencyCode: 'INR',
        },
        []
      );

      assert.equal(result.isNew, true);
      assert.equal(result.item.productId, 'prod_saree_1');
      assert.equal(result.item.variantId, 'var_red');
      assert.equal(result.item.title, 'Silk Saree (Red)');
      assert.equal(result.wishlist.itemCount, 1);
      assert.equal(result.wishlist.items.length, 1);
    });

    it('enforces idempotency on duplicate variant add without creating duplicate items', () => {
      const firstAdd = WishlistEngine.addWishlistItem(
        'cus_100',
        {
          productId: 'prod_saree_1',
          variantId: 'var_red',
          title: 'Silk Saree (Red)',
          price: 2999,
        },
        []
      );

      const secondAdd = WishlistEngine.addWishlistItem(
        'cus_100',
        {
          productId: 'prod_saree_1',
          variantId: 'var_red',
          title: 'Silk Saree (Red)',
          price: 2999,
        },
        firstAdd.wishlist.items
      );

      assert.equal(secondAdd.isNew, false);
      assert.equal(secondAdd.wishlist.itemCount, 1);
      assert.equal(secondAdd.wishlist.items.length, 1);
      assert.equal(secondAdd.item.id, firstAdd.item.id);
    });

    it('allows same product with different variants as distinct wishlist items', () => {
      const firstAdd = WishlistEngine.addWishlistItem(
        'cus_100',
        {
          productId: 'prod_saree_1',
          variantId: 'var_red',
          title: 'Silk Saree (Red)',
        },
        []
      );

      const secondAdd = WishlistEngine.addWishlistItem(
        'cus_100',
        {
          productId: 'prod_saree_1',
          variantId: 'var_blue',
          title: 'Silk Saree (Blue)',
        },
        firstAdd.wishlist.items
      );

      assert.equal(secondAdd.isNew, true);
      assert.equal(secondAdd.wishlist.itemCount, 2);
      assert.equal(secondAdd.wishlist.items.length, 2);
    });

    it('removes item by ID or variant ID safely and preserves other variants', () => {
      const added1 = WishlistEngine.addWishlistItem(
        'cus_100',
        {
          productId: 'prod_saree_1',
          variantId: 'var_red',
          title: 'Silk Saree (Red)',
        },
        []
      );

      const added2 = WishlistEngine.addWishlistItem(
        'cus_100',
        {
          productId: 'prod_saree_1',
          variantId: 'var_blue',
          title: 'Silk Saree (Blue)',
        },
        added1.wishlist.items
      );

      // Remove by variant ID
      const removed = WishlistEngine.removeWishlistItem('cus_100', 'var_red', added2.wishlist.items);
      assert.equal(removed.removed, true);
      assert.equal(removed.wishlist.itemCount, 1);
      assert.equal(removed.wishlist.items[0].variantId, 'var_blue');

      // Attempting to remove by product ID does not remove variant items
      const removeByProd = WishlistEngine.removeWishlistItem('cus_100', 'prod_saree_1', removed.wishlist.items);
      assert.equal(removeByProd.removed, false);
      assert.equal(removeByProd.wishlist.itemCount, 1);
    });

    it('checks variant presence accurately', () => {
      const added = WishlistEngine.addWishlistItem(
        'cus_100',
        {
          productId: 'prod_saree_1',
          variantId: 'var_red',
          title: 'Silk Saree',
        },
        []
      );

      assert.equal(WishlistEngine.checkWishlistItem('cus_100', 'var_red', added.wishlist.items), true);
      assert.equal(WishlistEngine.checkWishlistItem('cus_100', 'var_blue', added.wishlist.items), false);
      assert.equal(WishlistEngine.checkWishlistItem('cus_100', 'prod_saree_1', added.wishlist.items), false); // Product ID returns false
      assert.equal(WishlistEngine.checkWishlistItem('cus_200', 'var_red', []), false);
    });
  });
});


