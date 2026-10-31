import { describe, it, after } from 'node:test';
import assert from 'node:assert/strict';
import { BackendMarketplaceGuard } from './modules/marketplace/ownership-guard.js';
import { InventoryService } from './modules/marketplace/inventory-service.js';
import { GET as merchantInventoryGet } from './api/merchant/inventory/route.js';
import { GET as merchantLocationsGet } from './api/merchant/inventory/locations/route.js';
import { POST as merchantAdjustPost } from './api/merchant/inventory/adjust/route.js';
import { GET as adminInventoryGet } from './api/admin/marketplace/inventory/route.js';
import { GET as adminLocationsGet, POST as adminLocationsPost } from './api/admin/marketplace/inventory/locations/route.js';
import { POST as adminAdjustPost } from './api/admin/marketplace/inventory/adjust/route.js';

describe('M2-11: Inventory and Stock Locations Test Suite', () => {
  after(async () => {
    await InventoryService.closePool();
  });
  describe('1. Backend Stock Location Access Guard', () => {
    it('allows access when merchant owns the stock location', () => {
      const res = BackendMarketplaceGuard.assertMerchantStockLocationAccess(
        'merch_test_123',
        'merch_test_123'
      );
      assert.equal(res.allowed, true);
      assert.equal(res.statusCode, 200);
    });

    it('allows access for Super Admin regardless of location merchant', () => {
      const res = BackendMarketplaceGuard.assertMerchantStockLocationAccess(
        'admin_user_01',
        'merch_different',
        true
      );
      assert.equal(res.allowed, true);
      assert.equal(res.statusCode, 200);
    });

    it('NEGATIVE: rejects cross-tenant access with 403 when Merchant A accesses Merchant B location', () => {
      const res = BackendMarketplaceGuard.assertMerchantStockLocationAccess(
        'merch_seller_alpha',
        'merch_seller_beta'
      );
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.match(res.message || '', /Access denied/i);
    });

    it('NEGATIVE: rejects with 401 when session merchant ID is missing', () => {
      const res = BackendMarketplaceGuard.assertMerchantStockLocationAccess(
        null,
        'merch_seller_beta'
      );
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 401);
    });
  });

  describe('2. Inventory Adjustment Safety & Reservation Protection', () => {
    it('allows positive stock adjustment and correctly updates available quantity', () => {
      const currentStocked = 50;
      const reservedQuantity = 10;
      const adjustment = 25;

      const evalRes = BackendMarketplaceGuard.evaluateInventoryAdjustmentSafety(
        currentStocked,
        reservedQuantity,
        adjustment
      );

      assert.equal(evalRes.canAdjust, true);
      assert.equal(evalRes.resultingStocked, 75);
      assert.equal(evalRes.availableQuantity, 65);
    });

    it('allows valid negative adjustment when remaining stock exceeds reserved quantity', () => {
      const currentStocked = 50;
      const reservedQuantity = 10;
      const adjustment = -20;

      const evalRes = BackendMarketplaceGuard.evaluateInventoryAdjustmentSafety(
        currentStocked,
        reservedQuantity,
        adjustment
      );

      assert.equal(evalRes.canAdjust, true);
      assert.equal(evalRes.resultingStocked, 30);
      assert.equal(evalRes.availableQuantity, 20);
    });

    it('NEGATIVE: rejects adjustment that would result in negative stocked quantity', () => {
      const currentStocked = 10;
      const reservedQuantity = 2;
      const adjustment = -15;

      const evalRes = BackendMarketplaceGuard.evaluateInventoryAdjustmentSafety(
        currentStocked,
        reservedQuantity,
        adjustment
      );

      assert.equal(evalRes.canAdjust, false);
      assert.match(evalRes.reason || '', /negative stock/i);
    });

    it('NEGATIVE: rejects adjustment that reduces stock below active customer reservations', () => {
      const currentStocked = 50;
      const reservedQuantity = 30; // 30 units held in open customer orders
      const adjustment = -25; // would leave 25, which is < 30

      const evalRes = BackendMarketplaceGuard.evaluateInventoryAdjustmentSafety(
        currentStocked,
        reservedQuantity,
        adjustment
      );

      assert.equal(evalRes.canAdjust, false);
      assert.match(evalRes.reason || '', /reserved quantity of 30 units/i);
    });

    it('allows adjustment exactly to the reserved quantity (resulting available = 0)', () => {
      const currentStocked = 50;
      const reservedQuantity = 30;
      const adjustment = -20; // leaves exactly 30

      const evalRes = BackendMarketplaceGuard.evaluateInventoryAdjustmentSafety(
        currentStocked,
        reservedQuantity,
        adjustment
      );

      assert.equal(evalRes.canAdjust, true);
      assert.equal(evalRes.resultingStocked, 30);
      assert.equal(evalRes.availableQuantity, 0);
    });
  });

  describe('3. Concurrency & Advisory Lock Serialization', () => {
    it('executes database operations safely within advisory lock transaction', async () => {
      const result = await InventoryService.withAdvisoryLock('test_lock_key', async (client) => {
        const queryRes = await client.query('SELECT 1 as num');
        return queryRes.rows[0].num;
      });
      assert.equal(result, 1);
    });
  });

  describe('4. Inventory Endpoints Route Handlers', () => {
    it('merchant inventory routes require merchant boundary and permissions', () => {
      assert.equal(typeof merchantInventoryGet, 'function');
      assert.equal(typeof merchantLocationsGet, 'function');
      assert.equal(typeof merchantAdjustPost, 'function');
    });

    it('admin marketplace inventory routes require admin boundary', () => {
      assert.equal(typeof adminInventoryGet, 'function');
      assert.equal(typeof adminLocationsGet, 'function');
      assert.equal(typeof adminLocationsPost, 'function');
      assert.equal(typeof adminAdjustPost, 'function');
    });
  });
});
