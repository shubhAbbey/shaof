import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MockMedusaContainer } from './api/__tests__/fixtures/mock-medusa-container.js';
import { GET as merchantProductsGet, POST as merchantProductsPost } from './api/merchant/products/route.js';
import {
  GET as merchantProductDetailGet,
  PUT as merchantProductDetailPut,
  DELETE as merchantProductDetailDelete,
} from './api/merchant/products/[id]/route.js';
import {
  GET as adminProductsGet,
  POST as adminProductsPost,
} from './api/admin/marketplace/products/route.js';
import {
  GET as adminProductDetailGet,
  PUT as adminProductDetailPut,
  DELETE as adminProductDetailDelete,
} from './api/admin/marketplace/products/[id]/route.js';
import MarketplaceModuleService from './modules/marketplace/service.js';

describe('M2-09: Catalog Administration & Full Product CRUD Test Suite', () => {
  let container: MockMedusaContainer;

  beforeEach(() => {
    container = new MockMedusaContainer();
  });

  // Helper to build mock requests
  function createMockReq(options: {
    boundary?: 'merchant' | 'admin' | 'customer';
    userId?: string;
    merchantId?: string;
    role?: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
    body?: any;
    headers?: Record<string, string>;
  }) {
    const boundary = options.boundary || 'merchant';
    const userId = options.userId || (boundary === 'admin' ? 'usr_admin_1' : 'usr_owner_1');
    const role = options.role || (boundary === 'admin' ? 'super_admin' : 'owner');
    const merchantId = options.merchantId !== undefined ? options.merchantId : 'merch_virasat_heritage';

    const defaultAuthHeader =
      boundary === 'admin'
        ? `Bearer admin_token:${userId}`
        : `Bearer merchant_token:${userId}:${merchantId}:${role}:active:active`;

    return {
      scope: container,
      tenantContext: {
        userId,
        boundary,
        merchantId,
        role,
        permissions:
          boundary === 'admin'
            ? ['*']
            : ['catalog:read', 'catalog:write', 'catalog:delete', 'orders:read', 'team:manage'],
      },
      params: options.params || {},
      query: options.query || {},
      body: options.body || {},
      headers: {
        authorization: defaultAuthHeader,
        ...(options.headers || {}),
        'user-agent': 'node-test',
      },
      cookies: {},
      socket: { remoteAddress: '127.0.0.1' },
    } as any;
  }

  function createMockRes() {
    const res: any = {
      statusCode: 200,
      body: null,
      status(code: number) {
        res.statusCode = code;
        return res;
      },
      json(data: any) {
        res.body = data;
        return res;
      },
    };
    return res;
  }

  describe('1. Merchant Product CRUD & Tenant Scoping', () => {
    it('GET /merchant/products: lists products strictly scoped to authenticated merchant', async () => {
      const req = createMockReq({ merchantId: 'merch_virasat_heritage' });
      const res = createMockRes();

      await merchantProductsGet(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.products));
      // In mock fixture, merch_virasat_heritage owns prod_virasat_saree_01
      for (const prod of res.body.products) {
        assert.strictEqual(prod.merchant_id, 'merch_virasat_heritage');
      }
    });

    it('POST /merchant/products: creates product and binds ownership to authenticated merchant', async () => {
      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Handcrafted Sandalwood Incense Sticks',
          handle: 'handcrafted-sandalwood-incense',
          description: 'Pure Mysore sandalwood incense.',
        },
      });
      const res = createMockRes();

      await merchantProductsPost(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.title, 'Handcrafted Sandalwood Incense Sticks');
      assert.strictEqual(res.body.product.merchant_id, 'merch_virasat_heritage');
      assert.strictEqual(res.body.product.status, 'draft');
    });

    it('GET /merchant/products/:id: reads product detail with verified ownership', async () => {
      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: 'prod_virasat_saree_01' },
      });
      const res = createMockRes();

      await merchantProductDetailGet(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.id, 'prod_virasat_saree_01');
      assert.strictEqual(res.body.product.merchant_id, 'merch_virasat_heritage');
    });

    it('PUT /merchant/products/:id: updates product details for owned product', async () => {
      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: 'prod_virasat_saree_01' },
        body: {
          title: 'Royal Banarasi Silk Saree - Crimson',
          description: 'Updated heirloom bridal collection.',
        },
      });
      const res = createMockRes();

      await merchantProductDetailPut(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.title, 'Royal Banarasi Silk Saree - Crimson');
    });

    it('NEGATIVE: IDOR Defense — Merchant A cannot read Merchant B product (403 Forbidden)', async () => {
      // Merchant Loom & Thread attempts to read Virasat Heritage product
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_virasat_saree_01' },
      });
      const res = createMockRes();

      await merchantProductDetailGet(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
    });

    it('NEGATIVE: IDOR Defense — Merchant A cannot update Merchant B product (403 Forbidden)', async () => {
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_virasat_saree_01' },
        body: { title: 'Malicious Hijack Title' },
      });
      const res = createMockRes();

      await merchantProductDetailPut(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
    });

    it('NEGATIVE: IDOR Defense — Merchant A cannot delete Merchant B product (403 Forbidden)', async () => {
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_virasat_saree_01' },
      });
      const res = createMockRes();

      await merchantProductDetailDelete(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
    });

    it('NEGATIVE: Anti-Forgery — client-supplied merchant_id cannot override authenticated session', async () => {
      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Attempted Tenant Hijack',
          merchant_id: 'merch_loom_thread', // Forged payload
        },
      });
      const res = createMockRes();

      await merchantProductsPost(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
    });
  });

  describe('2. Super Admin Product CRUD & Target Merchant Binding', () => {
    it('GET /admin/marketplace/products: lists products across all merchants with merchant labels', async () => {
      const req = createMockReq({ boundary: 'admin' });
      const res = createMockRes();

      await adminProductsGet(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.count >= 2);
      // Confirms both merchants' products appear in admin catalog
      const merchantIds = res.body.products.map((p: any) => p.merchant_id);
      assert.ok(merchantIds.includes('merch_virasat_heritage'));
      assert.ok(merchantIds.includes('merch_loom_thread'));
    });

    it('GET /admin/marketplace/products?merchant_id=...: filters products by specific merchant', async () => {
      const req = createMockReq({
        boundary: 'admin',
        query: { merchant_id: 'merch_loom_thread' },
      });
      const res = createMockRes();

      await adminProductsGet(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      for (const prod of res.body.products) {
        assert.strictEqual(prod.merchant_id, 'merch_loom_thread');
      }
    });

    it('POST /admin/marketplace/products: creates product bound to active target merchant', async () => {
      const req = createMockReq({
        boundary: 'admin',
        body: {
          title: 'Handmade Kashmiri Walnut Wood Bowl',
          target_merchant_id: 'merch_virasat_heritage',
          handle: 'handmade-walnut-wood-bowl',
          description: 'Carved by master artisans.',
        },
      });
      const res = createMockRes();

      await adminProductsPost(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.merchant_id, 'merch_virasat_heritage');
      assert.strictEqual(res.body.product.title, 'Handmade Kashmiri Walnut Wood Bowl');
    });

    it('NEGATIVE: Super Admin product creation requires explicit target merchant', async () => {
      const req = createMockReq({
        boundary: 'admin',
        body: {
          title: 'Unassigned Product Attempt',
        },
      });
      const res = createMockRes();

      await adminProductsPost(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'BAD_REQUEST');
      assert.ok(
        res.body.message?.includes('target approved merchant') ||
          res.body.message?.includes('TARGET_MERCHANT_REQUIRED')
      );
    });

    it('NEGATIVE: Super Admin product creation blocks targeting non-active merchant', async () => {
      // In mock fixture, merch_suspended_store is suspended
      const req = createMockReq({
        boundary: 'admin',
        body: {
          title: 'Product on Suspended Merchant',
          target_merchant_id: 'merch_suspended_store',
        },
      });
      const res = createMockRes();

      await adminProductsPost(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.ok(
        res.body.error === 'MERCHANT_NOT_ELIGIBLE' ||
          res.body.error === 'BAD_REQUEST'
      );
      assert.ok(res.body.message?.includes('not active'));
    });

    it('GET /admin/marketplace/products/:id: retrieves product detail with full merchant context', async () => {
      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_virasat_saree_01' },
      });
      const res = createMockRes();

      await adminProductDetailGet(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.id, 'prod_virasat_saree_01');
      assert.ok(res.body.product.merchant);
      assert.strictEqual(res.body.product.merchant.id, 'merch_virasat_heritage');
    });

    it('PUT /admin/marketplace/products/:id: updates product details and allows ownership reassignment', async () => {
      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_virasat_saree_01' },
        body: {
          title: 'Reassigned Silk Saree',
          target_merchant_id: 'merch_loom_thread', // Valid active merchant
        },
      });
      const res = createMockRes();

      await adminProductDetailPut(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.merchant_id, 'merch_loom_thread');
    });

    it('NEGATIVE: Super Admin reassigning to suspended merchant is rejected with 400', async () => {
      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_virasat_saree_01' },
        body: {
          target_merchant_id: 'merch_suspended_store', // Suspended
        },
      });
      const res = createMockRes();

      await adminProductDetailPut(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'TARGET_MERCHANT_NOT_ACTIVE');
    });
  });

  describe('3. Safe Deletion & Advisory Locking (Resolving M2-04 Concurrency Race)', () => {
    it('NEGATIVE: blocks product deletion when historical customer orders exist (409 CONFLICT)', async () => {
      // prod_virasat_saree_01 has order history (hasOrderHistory: true)
      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: 'prod_virasat_saree_01' },
      });
      const res = createMockRes();

      await merchantProductDetailDelete(req, res);

      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'CONFLICT');
      assert.ok(res.body.message?.includes('historical orders'));
    });

    it('NEGATIVE: Super Admin deletion also blocked when historical customer orders exist (409 CONFLICT)', async () => {
      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_virasat_saree_01' },
      });
      const res = createMockRes();

      await adminProductDetailDelete(req, res);

      assert.strictEqual(res.statusCode, 409);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'CONFLICT');
      assert.ok(res.body.message?.includes('historical orders'));
    });

    it('permits safe deletion when product has zero orders and zero stock', async () => {
      // Create a clean product with zero orders
      const createReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Temporary Draft Saree',
          handle: 'temp-draft-saree',
        },
      });
      const createRes = createMockRes();
      await merchantProductsPost(createReq, createRes);

      const createdId = createRes.body.product.id;
      assert.ok(createdId);

      // Delete the clean product
      const deleteReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: createdId },
      });
      const deleteRes = createMockRes();
      await merchantProductDetailDelete(deleteReq, deleteRes);

      assert.strictEqual(deleteRes.statusCode, 200);
      assert.strictEqual(deleteRes.body.success, true);
      assert.strictEqual(deleteRes.body.id, createdId);

      // Verify product is no longer found
      const getReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: createdId },
      });
      const getRes = createMockRes();
      await merchantProductDetailGet(getReq, getRes);
      assert.strictEqual(getRes.statusCode, 404);
    });

    it('serializes concurrent deletion requests under advisory lock: exactly 1 succeeds and others get 404', async () => {
      // Create a clean product
      const createReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Race Condition Test Product',
          handle: 'race-test-prod',
        },
      });
      const createRes = createMockRes();
      await merchantProductsPost(createReq, createRes);
      const cleanId = createRes.body.product.id;

      // Fire 5 simultaneous deletion calls for the same product ID
      const deleteCalls = Array.from({ length: 5 }, async () => {
        const dReq = createMockReq({
          merchantId: 'merch_virasat_heritage',
          params: { id: cleanId },
        });
        const dRes = createMockRes();
        await merchantProductDetailDelete(dReq, dRes);
        return dRes;
      });

      const results = await Promise.all(deleteCalls);

      const successCount = results.filter((r) => r.statusCode === 200).length;
      const notFoundCount = results.filter((r) => r.statusCode === 404).length;

      // Exactly ONE deletion must succeed; all other concurrent calls must find it already deleted (404)
      assert.strictEqual(successCount, 1, 'Exactly one concurrent deletion must succeed');
      assert.strictEqual(notFoundCount, 4, 'Remaining concurrent deletions must receive 404');
    });
  });

  describe('4. Regression: Merchant-Product 1:N Cardinality, Compensation & Isolation', () => {
    it('allows one merchant to create and own multiple products', async () => {
      // Merchant A creates product 1
      const req1 = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Virasat Heritage Saree Collection Item 1',
          handle: 'virasat-collection-item-1',
          description: 'First product in catalog.',
        },
      });
      const res1 = createMockRes();
      await merchantProductsPost(req1, res1);

      assert.strictEqual(res1.statusCode, 201);
      assert.strictEqual(res1.body.success, true);
      assert.strictEqual(res1.body.product.merchant_id, 'merch_virasat_heritage');
      const prod1Id = res1.body.product.id;

      // Merchant A creates product 2 (1:N cardinality proof)
      const req2 = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Virasat Heritage Saree Collection Item 2',
          handle: 'virasat-collection-item-2',
          description: 'Second product in catalog.',
        },
      });
      const res2 = createMockRes();
      await merchantProductsPost(req2, res2);

      assert.strictEqual(res2.statusCode, 201);
      assert.strictEqual(res2.body.success, true);
      assert.strictEqual(res2.body.product.merchant_id, 'merch_virasat_heritage');
      const prod2Id = res2.body.product.id;

      assert.notStrictEqual(prod1Id, prod2Id, 'Products must have distinct IDs');

      // Verify list endpoint returns both products for Merchant A
      const listReq = createMockReq({ merchantId: 'merch_virasat_heritage' });
      const listRes = createMockRes();
      await merchantProductsGet(listReq, listRes);

      assert.strictEqual(listRes.statusCode, 200);
      assert.strictEqual(listRes.body.success, true);
      const returnedIds = listRes.body.products.map((p: any) => p.id);
      assert.ok(returnedIds.includes(prod1Id), 'Product 1 must be present in merchant catalog');
      assert.ok(returnedIds.includes(prod2Id), 'Product 2 must be present in merchant catalog');
    });

    it('links each product to the correct merchant and isolates tenant catalogs', async () => {
      // Merchant A creates Product A
      const reqA = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Virasat Saree Alpha',
          handle: 'virasat-saree-alpha',
        },
      });
      const resA = createMockRes();
      await merchantProductsPost(reqA, resA);
      const prodAId = resA.body.product.id;

      // Merchant B creates Product B
      const reqB = createMockReq({
        merchantId: 'merch_loom_thread',
        body: {
          title: 'Loom Linen Beta',
          handle: 'loom-linen-beta',
        },
      });
      const resB = createMockRes();
      await merchantProductsPost(reqB, resB);
      const prodBId = resB.body.product.id;

      // Merchant A catalog must contain Product A but NOT Product B
      const listReqA = createMockReq({ merchantId: 'merch_virasat_heritage' });
      const listResA = createMockRes();
      await merchantProductsGet(listReqA, listResA);
      const catalogAIds = listResA.body.products.map((p: any) => p.id);
      assert.ok(catalogAIds.includes(prodAId), 'Merchant A catalog must contain Product A');
      assert.ok(!catalogAIds.includes(prodBId), 'Merchant A catalog must NOT contain Product B');

      // Merchant B catalog must contain Product B but NOT Product A
      const listReqB = createMockReq({ merchantId: 'merch_loom_thread' });
      const listResB = createMockRes();
      await merchantProductsGet(listReqB, listResB);
      const catalogBIds = listResB.body.products.map((p: any) => p.id);
      assert.ok(catalogBIds.includes(prodBId), 'Merchant B catalog must contain Product B');
      assert.ok(!catalogBIds.includes(prodAId), 'Merchant B catalog must NOT contain Product A');
    });

    it('enforces IDOR defense: Merchant A cannot access or modify Merchant B products', async () => {
      // Merchant B creates Product B
      const reqB = createMockReq({
        merchantId: 'merch_loom_thread',
        body: {
          title: 'Loom Linen Gamma',
          handle: 'loom-linen-gamma',
        },
      });
      const resB = createMockRes();
      await merchantProductsPost(reqB, resB);
      const prodBId = resB.body.product.id;

      // Merchant A attempts to GET Product B
      const getReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: prodBId },
      });
      const getRes = createMockRes();
      await merchantProductDetailGet(getReq, getRes);
      assert.strictEqual(getRes.statusCode, 403);
      assert.strictEqual(getRes.body.error, 'FORBIDDEN');

      // Merchant A attempts to PUT Product B
      const putReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: prodBId },
        body: { title: 'Hijacked Title' },
      });
      const putRes = createMockRes();
      await merchantProductDetailPut(putReq, putRes);
      assert.strictEqual(putRes.statusCode, 403);
      assert.strictEqual(putRes.body.error, 'FORBIDDEN');

      // Merchant A attempts to DELETE Product B
      const deleteReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: prodBId },
      });
      const deleteRes = createMockRes();
      await merchantProductDetailDelete(deleteReq, deleteRes);
      assert.strictEqual(deleteRes.statusCode, 403);
      assert.strictEqual(deleteRes.body.error, 'FORBIDDEN');
    });

    it('executes compensation rollback when remote link creation fails (zero orphan products)', async () => {
      // Simulate link failure
      container.failNextLinkCreate = true;

      const initialProductCount = container.products.size;

      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Orphan Prevention Test Product',
          handle: 'orphan-prevention-prod',
        },
      });
      const res = createMockRes();
      await merchantProductsPost(req, res);

      // Verify request returns 500 PRODUCT_CREATION_FAILED
      assert.strictEqual(res.statusCode, 500);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'PRODUCT_CREATION_FAILED');
      assert.ok(res.body.message?.includes('Failed to create product or establish merchant ownership link'));

      // Verify product module was compensated (product deleted, no orphan remains)
      assert.strictEqual(
        container.products.size,
        initialProductCount,
        'Product count in container must remain unchanged after compensation rollback'
      );
    });

    it('enforces moderation safeguards and prevents self-approval on creation and updates', async () => {
      // 1. Attempt to create with privileged status 'published'
      const createReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Self-Approve Attempt Product',
          handle: 'self-approve-attempt',
          status: 'published',
        },
      });
      const createRes = createMockRes();
      await merchantProductsPost(createReq, createRes);
      assert.strictEqual(createRes.statusCode, 403);
      assert.strictEqual(createRes.body.error, 'CANNOT_SELF_APPROVE');

      // 2. Normal creation forces draft
      const normalReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        body: {
          title: 'Valid Draft Product',
          handle: 'valid-draft-prod',
        },
      });
      const normalRes = createMockRes();
      await merchantProductsPost(normalReq, normalRes);
      assert.strictEqual(normalRes.statusCode, 201);
      assert.strictEqual(normalRes.body.product.status, 'draft');
      const validId = normalRes.body.product.id;

      // 3. Attempt to update draft to 'published' directly
      const updateReq = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: validId },
        body: { status: 'published' },
      });
      const updateRes = createMockRes();
      await merchantProductDetailPut(updateReq, updateRes);
      assert.strictEqual(updateRes.statusCode, 403);
      assert.strictEqual(updateRes.body.error, 'CANNOT_SELF_APPROVE');
    });
  });
});
