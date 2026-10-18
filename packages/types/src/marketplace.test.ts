import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MarketplaceOwnershipGuard,
  type TenantContext,
  type OrderLineItemOwnershipDto,
} from './index.js';

describe('@ecom/types: Marketplace Ownership & Tenant Isolation Matrix', () => {
  describe('1. Tenant Scoping & Product Ownership Assertion', () => {
    it('Super Admin has global cross-merchant access to any product', () => {
      const superAdmin: TenantContext = {
        actorType: 'super_admin',
        userId: 'usr_super_admin_1',
        isSuperAdmin: true,
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(superAdmin, 'merch_virasat_heritage');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('Merchant User can access products belonging to their verified merchant', () => {
      const merchantUser: TenantContext = {
        actorType: 'merchant_user',
        userId: 'usr_seller_1',
        merchantId: 'merch_virasat_heritage',
        role: 'owner',
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(merchantUser, 'merch_virasat_heritage');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: Merchant A is blocked (403 FORBIDDEN) from accessing Merchant B product', () => {
      const merchantA: TenantContext = {
        actorType: 'merchant_user',
        userId: 'usr_seller_a',
        merchantId: 'merch_seller_a',
        role: 'manager',
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(merchantA, 'merch_seller_b');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
      assert.ok(result.message?.includes('Access denied: You do not own this product'));
    });

    it('NEGATIVE: Missing or unverified session is rejected with 401 UNAUTHORIZED', () => {
      const nullSession = null;
      const result = MarketplaceOwnershipGuard.assertProductAccess(nullSession, 'merch_seller_a');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 401);
      assert.equal(result.error, 'UNAUTHORIZED');
    });

    it('NEGATIVE: Merchant user without active merchant membership is rejected with 403 FORBIDDEN', () => {
      const unassignedUser: TenantContext = {
        actorType: 'merchant_user',
        userId: 'usr_unassigned',
        merchantId: '', // unassigned / no active membership
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(unassignedUser, 'merch_seller_a');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });

    it('NEGATIVE: Customer session attempting merchant resource access is rejected with 403 FORBIDDEN', () => {
      const customer: TenantContext = {
        actorType: 'customer',
        userId: 'cus_customer_1',
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(customer, 'merch_seller_a');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });
  });

  describe('2. Super Admin Mandatory Target Merchant Selection', () => {
    it('passes when Super Admin designates a valid target merchant', () => {
      const result = MarketplaceOwnershipGuard.assertSuperAdminProductTarget('merch_approved_100');
      assert.equal(result.valid, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: rejects product creation if target merchant is empty or missing (blocks unassigned products)', () => {
      const emptyTarget = MarketplaceOwnershipGuard.assertSuperAdminProductTarget('');
      assert.equal(emptyTarget.valid, false);
      assert.equal(emptyTarget.statusCode, 400);
      assert.ok(emptyTarget.error?.includes('TARGET_MERCHANT_REQUIRED'));

      const nullTarget = MarketplaceOwnershipGuard.assertSuperAdminProductTarget(null);
      assert.equal(nullTarget.valid, false);
      assert.equal(nullTarget.statusCode, 400);
    });
  });

  describe('3. Product Lifecycle & Safe Archiving Policy', () => {
    it('blocks hard deletion and enforces archiving when product has historical customer orders', () => {
      const evaluation = MarketplaceOwnershipGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: true,
        activeStockQuantity: 0,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('referenced in historical customer orders'));
    });

    it('blocks hard deletion when product has remaining active inventory stock', () => {
      const evaluation = MarketplaceOwnershipGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 25,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('active stock remains'));
    });

    it('blocks hard deletion when product has pending returns', () => {
      const evaluation = MarketplaceOwnershipGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 0,
        hasPendingReturns: true,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('active/pending return requests'));
    });

    it('permits deletion only when product has zero orders, zero stock, and zero pending returns', () => {
      const evaluation = MarketplaceOwnershipGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 0,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, true);
      assert.equal(evaluation.canArchive, true);
    });
  });

  describe('4. Mixed-Merchant Order Line-Item Splitting', () => {
    it('deterministically splits multi-merchant order into isolated merchant fulfillment groups', () => {
      const mixedLineItems: OrderLineItemOwnershipDto[] = [
        {
          lineItemId: 'item_1',
          orderId: 'order_1001',
          merchantId: 'merch_virasat',
          merchantName: 'Virasat Heritage',
          productId: 'prod_saree',
          variantId: 'var_saree_red',
          quantity: 1,
          unitPrice: 2199,
          total: 2199,
          fulfillmentStatus: 'not_fulfilled',
        },
        {
          lineItemId: 'item_2',
          orderId: 'order_1001',
          merchantId: 'merch_loom',
          merchantName: 'Loom & Thread',
          productId: 'prod_shirt',
          variantId: 'var_shirt_m',
          quantity: 2,
          unitPrice: 1399,
          total: 2798,
          fulfillmentStatus: 'not_fulfilled',
        },
        {
          lineItemId: 'item_3',
          orderId: 'order_1001',
          merchantId: 'merch_virasat',
          merchantName: 'Virasat Heritage',
          productId: 'prod_kurta',
          variantId: 'var_kurta_l',
          quantity: 1,
          unitPrice: 1899,
          total: 1899,
          fulfillmentStatus: 'not_fulfilled',
        },
      ];

      const split = MarketplaceOwnershipGuard.splitOrderLinesByMerchant(mixedLineItems);

      assert.equal(split.size, 2);

      const virasatGroup = split.get('merch_virasat');
      assert.ok(virasatGroup);
      assert.equal(virasatGroup.lineItems.length, 2);
      assert.equal(virasatGroup.itemCount, 2);
      assert.equal(virasatGroup.itemSubtotal, 2199 + 1899);

      const loomGroup = split.get('merch_loom');
      assert.ok(loomGroup);
      assert.equal(loomGroup.lineItems.length, 1);
      assert.equal(loomGroup.itemCount, 2);
      assert.equal(loomGroup.itemSubtotal, 2798);

      // Verify complete tenant isolation: Virasat group contains zero items from Loom
      assert.ok(virasatGroup.lineItems.every((i) => i.merchantId === 'merch_virasat'));
      assert.ok(loomGroup.lineItems.every((i) => i.merchantId === 'merch_loom'));
    });
  });
});
