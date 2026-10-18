import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BackendMarketplaceGuard,
  MARKETPLACE_MODULE,
  Merchant,
  MerchantMember,
} from './index.js';

describe('M2-01: Backend Marketplace Ownership & Tenant Scoping Matrix', () => {
  describe('1. Merchant Product Ownership Assertion', () => {
    it('allows access when session merchant ID matches product merchant ownership', () => {
      const assertion = BackendMarketplaceGuard.assertMerchantProductOwnership(
        'merch_virasat_heritage',
        'merch_virasat_heritage'
      );
      assert.equal(assertion.allowed, true);
      assert.equal(assertion.statusCode, 200);
    });

    it('NEGATIVE: rejects cross-tenant access with 403 FORBIDDEN when Merchant A accesses Merchant B product', () => {
      const assertion = BackendMarketplaceGuard.assertMerchantProductOwnership(
        'merch_seller_a',
        'merch_seller_b'
      );
      assert.equal(assertion.allowed, false);
      assert.equal(assertion.statusCode, 403);
      assert.equal(assertion.error, 'FORBIDDEN');
      assert.ok(assertion.message?.includes('Access denied: You do not own this product'));
    });

    it('NEGATIVE: rejects with 401 UNAUTHORIZED when session merchant ID is missing', () => {
      const assertion = BackendMarketplaceGuard.assertMerchantProductOwnership(
        '',
        'merch_seller_b'
      );
      assert.equal(assertion.allowed, false);
      assert.equal(assertion.statusCode, 401);
      assert.equal(assertion.error, 'UNAUTHORIZED');
    });

    it('NEGATIVE: rejects with 403 FORBIDDEN when product has no verified merchant ownership link', () => {
      const assertion = BackendMarketplaceGuard.assertMerchantProductOwnership(
        'merch_seller_a',
        null
      );
      assert.equal(assertion.allowed, false);
      assert.equal(assertion.statusCode, 403);
      assert.equal(assertion.error, 'FORBIDDEN');
    });
  });

  describe('2. Super Admin Target Merchant Requirement', () => {
    it('approves Super Admin product creation when target merchant is designated', () => {
      const assertion = BackendMarketplaceGuard.assertSuperAdminTargetMerchant('merch_approved_42');
      assert.equal(assertion.allowed, true);
      assert.equal(assertion.statusCode, 200);
    });

    it('NEGATIVE: blocks Super Admin product creation when target merchant is omitted or empty (blocks unassigned products)', () => {
      const assertionEmpty = BackendMarketplaceGuard.assertSuperAdminTargetMerchant('');
      assert.equal(assertionEmpty.allowed, false);
      assert.equal(assertionEmpty.statusCode, 400);
      assert.equal(assertionEmpty.error, 'BAD_REQUEST');
      assert.ok(assertionEmpty.message?.includes('TARGET_MERCHANT_REQUIRED'));

      const assertionNull = BackendMarketplaceGuard.assertSuperAdminTargetMerchant(null);
      assert.equal(assertionNull.allowed, false);
      assert.equal(assertionNull.statusCode, 400);
    });
  });

  describe('3. Anti-Forgery Client Merchant ID Guard', () => {
    it('accepts matching client-supplied merchant_id or omitted client override', () => {
      const assertionMatching = BackendMarketplaceGuard.validateClientMerchantId(
        'merch_session_100',
        'merch_session_100'
      );
      assert.equal(assertionMatching.allowed, true);
      assert.equal(assertionMatching.statusCode, 200);

      const assertionOmitted = BackendMarketplaceGuard.validateClientMerchantId(
        'merch_session_100',
        undefined
      );
      assert.equal(assertionOmitted.allowed, true);
      assert.equal(assertionOmitted.statusCode, 200);
    });

    it('NEGATIVE: rejects forged client-supplied merchant_id that differs from verified session', () => {
      const assertionForged = BackendMarketplaceGuard.validateClientMerchantId(
        'merch_session_100',
        'merch_attacker_target_999'
      );
      assert.equal(assertionForged.allowed, false);
      assert.equal(assertionForged.statusCode, 403);
      assert.equal(assertionForged.error, 'FORBIDDEN');
      assert.ok(assertionForged.message?.includes('FORGED_MERCHANT_ID'));
    });
  });

  describe('4. Product Lifecycle & Safe Archiving Policy', () => {
    it('blocks hard deletion and mandates archiving for products with historical orders', () => {
      const evaluation = BackendMarketplaceGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: true,
        activeStockQuantity: 0,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('referenced in historical orders'));
    });

    it('blocks hard deletion when active stock quantity remains in inventory', () => {
      const evaluation = BackendMarketplaceGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 50,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('active stock remains'));
    });

    it('blocks hard deletion when pending returns are active', () => {
      const evaluation = BackendMarketplaceGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 0,
        hasPendingReturns: true,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('active return requests'));
    });

    it('allows hard deletion only when product has 0 orders, 0 stock, and 0 pending returns', () => {
      const evaluation = BackendMarketplaceGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 0,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, true);
      assert.equal(evaluation.canArchive, true);
    });
  });

  describe('5. Mixed-Merchant Order Line Item Splitting', () => {
    it('splits customer order line items by merchant with zero cross-tenant leakage', () => {
      const items = [
        {
          lineItemId: 'item_101',
          orderId: 'order_5001',
          merchantId: 'merch_virasat',
          productId: 'prod_saree',
          variantId: 'var_saree_m',
          quantity: 1,
          unitPrice: 2499,
          total: 2499,
        },
        {
          lineItemId: 'item_102',
          orderId: 'order_5001',
          merchantId: 'merch_loom',
          productId: 'prod_shirt',
          variantId: 'var_shirt_l',
          quantity: 2,
          unitPrice: 1299,
          total: 2598,
        },
        {
          lineItemId: 'item_103',
          orderId: 'order_5001',
          merchantId: 'merch_virasat',
          productId: 'prod_kurti',
          variantId: 'var_kurti_s',
          quantity: 1,
          unitPrice: 1599,
          total: 1599,
        },
      ];

      const split = BackendMarketplaceGuard.splitOrderLinesByMerchant(items);

      assert.equal(split.size, 2);

      const virasatItems = split.get('merch_virasat') || [];
      const loomItems = split.get('merch_loom') || [];

      assert.equal(virasatItems.length, 2);
      assert.equal(loomItems.length, 1);

      assert.equal(virasatItems[0].lineItemId, 'item_101');
      assert.equal(virasatItems[1].lineItemId, 'item_103');
      assert.equal(loomItems[0].lineItemId, 'item_102');

      // Assert total isolation
      assert.ok(virasatItems.every((i) => i.merchantId === 'merch_virasat'));
      assert.ok(loomItems.every((i) => i.merchantId === 'merch_loom'));
    });
  });

  describe('6. Module Architecture & Model Declarations', () => {
    it('declares marketplace module with correct identifier and models', () => {
      assert.equal(MARKETPLACE_MODULE, 'marketplace');
      assert.ok(Merchant);
      assert.ok(MerchantMember);
    });
  });
});
