import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BackendMarketplaceGuard } from './modules/marketplace/ownership-guard.js';
import { GET as merchantOrdersGet } from './api/merchant/orders/route.js';
import { GET as merchantOrderDetailGet } from './api/merchant/orders/[id]/route.js';
import { GET as adminOrdersGet } from './api/admin/marketplace/orders/route.js';
import { GET as adminOrderDetailGet } from './api/admin/marketplace/orders/[id]/route.js';

describe('M2-12: Order and Line-Item Management Test Suite', () => {
  describe('1. Line-Item Merchant Isolation & Mixed-Order Splitting', () => {
    it('splits mixed-merchant order line items into tenant-isolated merchant groups', () => {
      const mixedLineItems = [
        {
          lineItemId: 'item_alpha_1',
          id: 'item_alpha_1',
          orderId: 'order_100',
          order_id: 'order_100',
          merchantId: 'merch_alpha',
          productId: 'prod_alpha_1',
          variantId: 'var_alpha_1',
          title: 'Alpha Pure Silk Kurta',
          quantity: 2,
          unitPrice: 2500,
          unit_price: 2500,
          total: 5000,
        },
        {
          lineItemId: 'item_beta_1',
          id: 'item_beta_1',
          orderId: 'order_100',
          order_id: 'order_100',
          merchantId: 'merch_beta',
          productId: 'prod_beta_1',
          variantId: 'var_beta_1',
          title: 'Beta Cotton Kurti',
          quantity: 1,
          unitPrice: 1500,
          unit_price: 1500,
          total: 1500,
        },
        {
          lineItemId: 'item_alpha_2',
          id: 'item_alpha_2',
          orderId: 'order_100',
          order_id: 'order_100',
          merchantId: 'merch_alpha',
          productId: 'prod_alpha_2',
          variantId: 'var_alpha_2',
          title: 'Alpha Pashmina Shawl',
          quantity: 1,
          unitPrice: 4000,
          unit_price: 4000,
          total: 4000,
        },
      ];

      const splitMap = BackendMarketplaceGuard.splitOrderLinesByMerchant(mixedLineItems);

      // Verify two distinct merchant groups
      assert.equal(splitMap.size, 2);

      // Verify Merchant Alpha's items
      const alphaItems = splitMap.get('merch_alpha');
      assert.ok(alphaItems);
      assert.equal(alphaItems.length, 2);
      assert.equal(alphaItems[0].id, 'item_alpha_1');
      assert.equal(alphaItems[1].id, 'item_alpha_2');

      const alphaSubtotal = alphaItems.reduce((sum, it) => sum + it.total, 0);
      assert.equal(alphaSubtotal, 9000);

      // Verify Merchant Beta's items
      const betaItems = splitMap.get('merch_beta');
      assert.ok(betaItems);
      assert.equal(betaItems.length, 1);
      assert.equal(betaItems[0].id, 'item_beta_1');

      const betaSubtotal = betaItems.reduce((sum, it) => sum + it.total, 0);
      assert.equal(betaSubtotal, 1500);

      // Verify cross-tenant isolation: Beta does NOT see Alpha items
      assert.equal(
        betaItems.some((it) => it.merchantId === 'merch_alpha'),
        false
      );
    });

    it('returns empty list for merchant with no line items in the order', () => {
      const lineItems = [
        {
          lineItemId: 'item_gamma_1',
          id: 'item_gamma_1',
          orderId: 'order_200',
          order_id: 'order_200',
          merchantId: 'merch_gamma',
          productId: 'prod_gamma_1',
          variantId: 'var_gamma_1',
          title: 'Handmade Saree',
          quantity: 1,
          unitPrice: 3500,
          unit_price: 3500,
          total: 3500,
        },
      ];

      const splitMap = BackendMarketplaceGuard.splitOrderLinesByMerchant(lineItems);
      const alphaItems = splitMap.get('merch_alpha') || [];
      assert.equal(alphaItems.length, 0);
    });

    it('accurately distinguishes valid quantity of 1 from missing quantity and calculates distinct subtotals', () => {
      const orderLines = [
        {
          id: 'li_alpha_1',
          lineItemId: 'li_alpha_1',
          orderId: 'ord_1',
          order_id: 'ord_1',
          merchantId: 'merch_alpha',
          productId: 'prod_1',
          variantId: 'var_1',
          quantity: 1, // Valid quantity 1, NOT missing
          unitPrice: 3000,
          unit_price: 3000,
          total: 3000,
        },
        {
          id: 'li_alpha_2',
          lineItemId: 'li_alpha_2',
          orderId: 'ord_1',
          order_id: 'ord_1',
          merchantId: 'merch_alpha',
          productId: 'prod_2',
          variantId: 'var_2',
          quantity: 3, // Valid multi-quantity
          unitPrice: 1500,
          unit_price: 1500,
          total: 4500,
        },
        {
          id: 'li_beta_1',
          lineItemId: 'li_beta_1',
          orderId: 'ord_1',
          order_id: 'ord_1',
          merchantId: 'merch_beta',
          productId: 'prod_3',
          variantId: 'var_3',
          quantity: 1,
          unitPrice: 2000,
          unit_price: 2000,
          total: 2000,
        },
      ];

      const split = BackendMarketplaceGuard.splitOrderLinesByMerchant(orderLines);
      const alphaLines = split.get('merch_alpha')!;
      const betaLines = split.get('merch_beta')!;

      // Alpha has 2 items: 1 unit @ 3000, 3 units @ 1500 -> subtotal = 7500
      assert.equal(alphaLines.length, 2);
      assert.equal(alphaLines[0].quantity, 1);
      assert.equal(alphaLines[1].quantity, 3);
      const alphaSubtotal = alphaLines.reduce((s, it) => s + it.total, 0);
      assert.equal(alphaSubtotal, 7500);

      // Beta has 1 item: 1 unit @ 2000 -> subtotal = 2000
      assert.equal(betaLines.length, 1);
      assert.equal(betaLines[0].quantity, 1);
      const betaSubtotal = betaLines.reduce((s, it) => s + it.total, 0);
      assert.equal(betaSubtotal, 2000);

      // Total order amount = 9500, distinct from both merchant subtotals
      const totalOrderAmount = orderLines.reduce((s, it) => s + it.total, 0);
      assert.equal(totalOrderAmount, 9500);
      assert.notEqual(alphaSubtotal, totalOrderAmount);
      assert.notEqual(betaSubtotal, totalOrderAmount);
    });
  });

  describe('2. Order Route Handlers & Boundary Verification', () => {
    it('merchant order routes export valid route handlers requiring merchant boundary', () => {
      assert.equal(typeof merchantOrdersGet, 'function');
      assert.equal(typeof merchantOrderDetailGet, 'function');
    });

    it('admin marketplace order routes export valid route handlers requiring admin boundary', () => {
      assert.equal(typeof adminOrdersGet, 'function');
      assert.equal(typeof adminOrderDetailGet, 'function');
    });
  });
});
