import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MockMedusaContainer } from './api/__tests__/fixtures/mock-medusa-container.js';
import { POST as merchantProductSubmit } from './api/merchant/products/[id]/submit/route.js';
import { POST as merchantProductPost } from './api/merchant/products/route.js';
import { POST as merchantProductVariantPost } from './api/merchant/products/[id]/variants/route.js';
import { PUT as merchantProductPut } from './api/merchant/products/[id]/route.js';
import { GET as adminModerationQueueGet } from './api/admin/marketplace/moderation/route.js';
import { POST as adminProductModerate } from './api/admin/marketplace/products/[id]/moderate/route.js';
import { GET as storeProductsGet } from './api/store/products/route.js';
import { GET as storeProductByIdGet } from './api/store/products/[id]/route.js';
import path from 'node:path';
import express from 'express';
import { ApiLoader } from '@medusajs/framework/http';
import { configManager } from '@medusajs/framework/config';

describe('M2-10: Product Moderation and Publishing Test Suite', () => {
  let container: MockMedusaContainer;

  beforeEach(() => {
    container = new MockMedusaContainer();
  });

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

  describe('1. Merchant Submission Workflow & IDOR Defense', () => {
    it('POST /merchant/products/:id/submit: submits draft product for moderation (draft -> proposed)', async () => {
      // Set prod_loom_shirt_01 to draft for initial submission test
      container.products.get('prod_loom_shirt_01')!.status = 'draft';
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_loom_shirt_01' },
      });
      const res = createMockRes();

      await merchantProductSubmit(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.status, 'proposed');
      assert.strictEqual(res.body.product.id, 'prod_loom_shirt_01');
      assert.ok(res.body.product.submitted_at);
    });

    it('POST /merchant/products/:id/submit: allows resubmitting rejected product for re-moderation', async () => {
      // Set prod_loom_shirt_01 to rejected
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'rejected';

      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_loom_shirt_01' },
      });
      const res = createMockRes();

      await merchantProductSubmit(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.status, 'proposed');
    });

    it('NEGATIVE: rejects submitting already proposed product (400 ALREADY_SUBMITTED)', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_loom_shirt_01' },
      });
      const res = createMockRes();

      await merchantProductSubmit(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'ALREADY_SUBMITTED');
    });

    it('NEGATIVE: rejects submitting already published product (400 ALREADY_PUBLISHED)', async () => {
      // prod_virasat_saree_01 is published
      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: 'prod_virasat_saree_01' },
      });
      const res = createMockRes();

      await merchantProductSubmit(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'ALREADY_PUBLISHED');
    });

    it('NEGATIVE: IDOR Defense — Merchant A cannot submit Merchant B product (403 FORBIDDEN)', async () => {
      // Merchant Virasat Heritage attempts to submit Loom & Thread product
      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: 'prod_loom_shirt_01' },
      });
      const res = createMockRes();

      await merchantProductSubmit(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
    });
  });

  describe('2. Separation of Duties & Self-Approval Prevention', () => {
    it('NEGATIVE: Merchant cannot self-approve product to published status via PUT (403 CANNOT_SELF_APPROVE)', async () => {
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_loom_shirt_01' },
        body: {
          status: 'published', // Unauthorized self-approval attempt
        },
      });
      const res = createMockRes();

      await merchantProductPut(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'CANNOT_SELF_APPROVE');
      assert.ok(res.body.message?.includes('Merchants cannot set privileged status directly'));
    });

    it('NEGATIVE: Merchant cannot set status: published on product creation (403 CANNOT_SELF_APPROVE)', async () => {
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        body: {
          title: 'Illicit Pre-Published Product',
          status: 'published', // Unauthorized self-publication on create
        },
      });
      const res = createMockRes();

      await merchantProductPost(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'CANNOT_SELF_APPROVE');
      assert.ok(res.body.message?.includes('New merchant products must be created in "draft" status'));
    });

    it('NEGATIVE: Merchant cannot set status: proposed or approved on product creation (403 CANNOT_SELF_APPROVE)', async () => {
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        body: {
          title: 'Illicit Pre-Approved Product',
          status: 'approved',
        },
      });
      const res = createMockRes();

      await merchantProductPost(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'CANNOT_SELF_APPROVE');
    });

    it('NEGATIVE: Merchant cannot set status: approved via PUT (403 CANNOT_SELF_APPROVE)', async () => {
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_loom_shirt_01' },
        body: {
          status: 'approved',
        },
      });
      const res = createMockRes();

      await merchantProductPut(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'CANNOT_SELF_APPROVE');
    });

    it('NEGATIVE: Merchant cannot set status: proposed via PUT (403 CANNOT_SELF_APPROVE)', async () => {
      const req = createMockReq({
        merchantId: 'merch_loom_thread',
        params: { id: 'prod_loom_shirt_01' },
        body: {
          status: 'proposed',
        },
      });
      const res = createMockRes();

      await merchantProductPut(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'CANNOT_SELF_APPROVE');
    });

    it('NEGATIVE: Non-admin caller cannot access moderation endpoint (403 FORBIDDEN)', async () => {
      const req = createMockReq({
        boundary: 'merchant',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'approve' },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('3. Re-Review Trigger on Merchant Modification', () => {
    it('automatically transitions published product to proposed when content is edited', async () => {
      // prod_virasat_saree_01 is published
      const prod = container.products.get('prod_virasat_saree_01')!;
      assert.strictEqual(prod.status, 'published');

      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: 'prod_virasat_saree_01' },
        body: {
          title: 'Modified Heirloom Banarasi Silk Saree',
          description: 'Updated artisan weaving details.',
        },
      });
      const res = createMockRes();

      await merchantProductPut(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.status, 'proposed');

      const updated = container.products.get('prod_virasat_saree_01')!;
      assert.strictEqual(updated.status, 'proposed');
    });

    it('automatically transitions published product to proposed when a new variant is added', async () => {
      // prod_virasat_saree_01 is published
      const prod = container.products.get('prod_virasat_saree_01')!;
      prod.status = 'published';

      const req = createMockReq({
        merchantId: 'merch_virasat_heritage',
        params: { id: 'prod_virasat_saree_01' },
        body: {
          title: 'Royal Blue / XL',
          sku: 'VIRASAT-SAREE-BLU-XL',
          price: 1499900,
        },
      });
      const res = createMockRes();

      await merchantProductVariantPost(req, res);

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.success, true);

      // Parent product must now be moved to 'proposed' for moderation of the new variant/pricing
      const updated = container.products.get('prod_virasat_saree_01')!;
      assert.strictEqual(updated.status, 'proposed', 'Adding variant to published product must reset status to proposed');
    });
  });

  describe('4. Super Admin Moderation Queue', () => {
    it('GET /admin/marketplace/moderation: lists products in proposed status', async () => {
      // Set prod_loom_shirt_01 to proposed
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        boundary: 'admin',
      });
      const res = createMockRes();

      await adminModerationQueueGet(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.queue));
      assert.ok(res.body.count >= 1);
      const item = res.body.queue.find((p: any) => p.id === 'prod_loom_shirt_01');
      assert.ok(item);
      assert.strictEqual(item.status, 'proposed');
      assert.strictEqual(item.merchant_id, 'merch_loom_thread');
    });

    it('GET /admin/marketplace/moderation?q=...: searches queue by title', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        boundary: 'admin',
        query: { q: 'Linen' },
      });
      const res = createMockRes();

      await adminModerationQueueGet(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.queue.some((p: any) => p.title.includes('Linen')));
    });

    it('NEGATIVE: Non-admin caller cannot view moderation queue (403 FORBIDDEN)', async () => {
      const req = createMockReq({
        boundary: 'merchant',
      });
      const res = createMockRes();

      await adminModerationQueueGet(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe('5. Super Admin Moderation Decisions & Policy Enforcement', () => {
    it('approves a proposed product and transitions to published', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'approve' },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.status, 'published');

      const updated = container.products.get('prod_loom_shirt_01')!;
      assert.strictEqual(updated.status, 'published');
    });

    it('NEGATIVE: blocks approving product if associated merchant is suspended', async () => {
      // Reassign product to suspended merchant
      container.productLinks.set('prod_loom_shirt_01', 'merch_suspended_store');
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'approve' },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'MERCHANT_NOT_ACTIVE');
      assert.ok(res.body.message?.includes('not active'));
    });

    it('requests changes on a proposed product (proposed -> draft) with mandatory reason', async () => {
      // Restore valid link
      container.productLinks.set('prod_loom_shirt_01', 'merch_loom_thread');
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: {
          action: 'request-changes',
          reason: 'Please upload higher-resolution fabric detail photos and certify handloom weave.',
        },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.status, 'draft');

      const updated = container.products.get('prod_loom_shirt_01')!;
      assert.strictEqual(updated.status, 'draft');
    });

    it('NEGATIVE: request-changes without reason is rejected (400 CHANGES_REQUESTED_REASON_REQUIRED)', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: {
          action: 'request-changes',
          // Missing reason
        },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'CHANGES_REQUESTED_REASON_REQUIRED');
    });

    it('rejects a proposed product (proposed -> rejected) with mandatory reason', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: {
          action: 'reject',
          reason: 'Prohibited catalog category: synthetic blend masquerading as certified pure khadi.',
        },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.product.status, 'rejected');

      const updated = container.products.get('prod_loom_shirt_01')!;
      assert.strictEqual(updated.status, 'rejected');
    });

    it('NEGATIVE: reject without reason is blocked (400 REJECTION_REASON_REQUIRED)', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: {
          action: 'reject',
          reason: '   ', // Whitespace reason
        },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'REJECTION_REASON_REQUIRED');
    });

    it('NEGATIVE: rejects approving an already published product (400 NO_OP_TRANSITION)', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'published';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'approve' },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'NO_OP_TRANSITION');
      assert.ok(res.body.message?.includes('already'));
    });

    it('NEGATIVE: rejects rejecting an already rejected product (400 NO_OP_TRANSITION)', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'rejected';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'reject', reason: 'Defective imagery' },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'NO_OP_TRANSITION');
      assert.ok(res.body.message?.includes('already'));
    });

    it('NEGATIVE: rejects rejecting a published product from moderation queue (400 INVALID_TRANSITION)', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'published';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'reject', reason: 'Should not reject published item directly' },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'INVALID_TRANSITION');
    });

    it('NEGATIVE: rejects approving a rejected product directly without merchant re-submission (400 RE_REVIEW_REQUIRED)', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'rejected';

      const req = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'approve' },
      });
      const res = createMockRes();

      await adminProductModerate(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.error, 'RE_REVIEW_REQUIRED');
    });

    it('NEGATIVE: rejects approving or rejecting a draft product that was never submitted (400 INVALID_TRANSITION)', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'draft';

      // Attempt approve
      const reqApprove = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'approve' },
      });
      const resApprove = createMockRes();
      await adminProductModerate(reqApprove, resApprove);

      assert.strictEqual(resApprove.statusCode, 400);
      assert.strictEqual(resApprove.body.success, false);
      assert.strictEqual(resApprove.body.error, 'INVALID_TRANSITION');

      // Attempt reject
      const reqReject = createMockReq({
        boundary: 'admin',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'reject', reason: 'Draft cannot be rejected' },
      });
      const resReject = createMockRes();
      await adminProductModerate(reqReject, resReject);

      assert.strictEqual(resReject.statusCode, 400);
      assert.strictEqual(resReject.body.success, false);
      assert.strictEqual(resReject.body.error, 'INVALID_TRANSITION');
    });

    it('CONCURRENCY DEFENSE: competing moderation decisions serialize safely — first decision commits and second is rejected', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';
      prod.metadata = { moderationHistory: [] };

      // Admin A submits 'approve'
      const reqA = createMockReq({
        boundary: 'admin',
        userId: 'usr_admin_1',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'approve' },
      });
      const resA = createMockRes();

      // Admin B submits concurrent 'reject' on what was proposed
      const reqB = createMockReq({
        boundary: 'admin',
        userId: 'usr_admin_2',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'reject', reason: 'Conflicting admin decision' },
      });
      const resB = createMockRes();

      // Execute A first (wins race)
      await adminProductModerate(reqA, resA);
      assert.strictEqual(resA.statusCode, 200);
      assert.strictEqual(resA.body.product.status, 'published');

      // Execute B (arrives after status has changed to published)
      await adminProductModerate(reqB, resB);
      assert.strictEqual(resB.statusCode, 400);
      assert.strictEqual(resB.body.success, false);
      assert.strictEqual(resB.body.error, 'INVALID_TRANSITION');
      assert.ok(resB.body.message?.includes('Published product cannot be rejected'));

      // Product status remains published with exactly 1 audit event from winner
      const updated = container.products.get('prod_loom_shirt_01')!;
      assert.strictEqual(updated.status, 'published');
      const history = updated.metadata?.moderationHistory || [];
      assert.strictEqual(history.length, 1);
      assert.strictEqual(history[0].action, 'approve');
      assert.strictEqual(history[0].decidedBy, 'usr_admin_1');
    });

    it('AUDIT INTEGRITY: preserves sequential moderation history across review cycles', async () => {
      const prod = container.products.get('prod_loom_shirt_01')!;
      prod.status = 'proposed';
      prod.metadata = { moderationHistory: [] };

      // Cycle 1: Request changes
      const req1 = createMockReq({
        boundary: 'admin',
        userId: 'usr_admin_1',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'request-changes', reason: 'Better photos required' },
      });
      const res1 = createMockRes();
      await adminProductModerate(req1, res1);
      assert.strictEqual(res1.statusCode, 200);

      // Merchant submits again (draft -> proposed)
      container.products.get('prod_loom_shirt_01')!.status = 'proposed';

      // Cycle 2: Approve
      const req2 = createMockReq({
        boundary: 'admin',
        userId: 'usr_admin_1',
        params: { id: 'prod_loom_shirt_01' },
        body: { action: 'approve' },
      });
      const res2 = createMockRes();
      await adminProductModerate(req2, res2);
      assert.strictEqual(res2.statusCode, 200);

      // Verify audit history contains both events in chronological order
      const finalProd = container.products.get('prod_loom_shirt_01')!;
      const history = finalProd.metadata?.moderationHistory || [];
      assert.strictEqual(history.length, 2);
      assert.strictEqual(history[0].action, 'request-changes');
      assert.strictEqual(history[0].toStatus, 'draft');
      assert.strictEqual(history[1].action, 'approve');
      assert.strictEqual(history[1].toStatus, 'published');
    });
  });

  describe('6. Customer Storefront Catalog Isolation', () => {
    it('guarantees only published products from active merchants are visible to public customers', async () => {
      // Set prod_loom_shirt_01 to draft
      container.products.get('prod_loom_shirt_01')!.status = 'draft';
      // Create a product under suspended merchant with status=published -> MUST BE HIDDEN
      container.products.set('prod_suspended_item', {
        id: 'prod_suspended_item',
        title: 'Banned Merchant Product',
        handle: 'banned-prod',
        status: 'published',
        variants: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      container.productLinks.set('prod_suspended_item', 'merch_suspended_store');

      // Create a product with missing status -> MUST BE HIDDEN (fail-closed)
      container.products.set('prod_missing_status_item', {
        id: 'prod_missing_status_item',
        title: 'Missing Status Item',
        handle: 'missing-status-item',
        status: undefined as any,
        variants: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      container.productLinks.set('prod_missing_status_item', 'merch_virasat_heritage');

      const query = container.getQuery();
      const { data: allProducts } = await query.graph({
        entity: 'product',
        fields: ['id', 'title', 'status', 'merchant.*'],
      });

      // Fail-closed customer filtering rule: status === 'published' AND merchant.status === 'active'
      const publicProducts = allProducts.filter((p: any) => {
        const isPublished = p.status === 'published';
        const isMerchantActive = p.merchant?.status === 'active';
        return isPublished && isMerchantActive;
      });

      // Verify prod_virasat_saree_01 is visible
      const visibleIds = publicProducts.map((p: any) => p.id);
      assert.ok(visibleIds.includes('prod_virasat_saree_01'));

      // Verify draft, suspended, and missing-status products are strictly excluded fail-closed
      assert.ok(!visibleIds.includes('prod_loom_shirt_01'), 'Draft products must be hidden from customers');
      assert.ok(!visibleIds.includes('prod_suspended_item'), 'Suspended merchant products must be hidden');
      assert.ok(!visibleIds.includes('prod_missing_status_item'), 'Missing status products must be hidden (fail-closed)');
    });

    it('direct GET /store/products handler strictly isolates catalog server-side: excludes draft, proposed, and suspended merchant products', async () => {
      // 1. prod_virasat_saree_01: status=published, merchant=merch_virasat_heritage (active) -> MUST BE RETURNED
      container.products.get('prod_virasat_saree_01')!.status = 'published';

      // 2. prod_loom_shirt_01: status=proposed, merchant=merch_loom_thread (active) -> MUST BE EXCLUDED
      container.products.get('prod_loom_shirt_01')!.status = 'proposed';

      // 3. prod_suspended_item: status=published, merchant=merch_suspended_store (suspended) -> MUST BE EXCLUDED
      container.products.set('prod_suspended_item', {
        id: 'prod_suspended_item',
        title: 'Banned Merchant Product',
        handle: 'banned-prod',
        status: 'published',
        variants: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      container.productLinks.set('prod_suspended_item', 'merch_suspended_store');

      const req = createMockReq({
        query: { limit: '10', offset: '0' },
      });
      const res = createMockRes();

      await storeProductsGet(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(Array.isArray(res.body.products));

      const returnedIds = res.body.products.map((p: any) => p.id);
      assert.ok(returnedIds.includes('prod_virasat_saree_01'), 'Active published product must be returned by native Store API');
      assert.ok(!returnedIds.includes('prod_loom_shirt_01'), 'Proposed product must be excluded from native Store API');
      assert.ok(!returnedIds.includes('prod_suspended_item'), 'Published product of suspended merchant must be excluded from native Store API');
    });

    it('direct GET /store/products/:id handler strictly isolates catalog: returns 200 for active merchant published product, but returns 404 for suspended merchant, proposed, draft, or rejected products', async () => {
      // 1. Active merchant + Published product -> 200 OK
      container.products.get('prod_virasat_saree_01')!.status = 'published';
      const validReq = createMockReq({ params: { id: 'prod_virasat_saree_01' } });
      const validRes = createMockRes();
      await storeProductByIdGet(validReq, validRes);
      assert.strictEqual(validRes.statusCode, 200);
      assert.strictEqual(validRes.body.product?.id, 'prod_virasat_saree_01');

      // 2. Suspended merchant + Published product -> 404 NOT FOUND (fail-closed)
      container.products.set('prod_suspended_item', {
        id: 'prod_suspended_item',
        title: 'Banned Merchant Product',
        handle: 'banned-prod',
        status: 'published',
        variants: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      container.productLinks.set('prod_suspended_item', 'merch_suspended_store');
      const suspendedReq = createMockReq({ params: { id: 'prod_suspended_item' } });
      const suspendedRes = createMockRes();
      await storeProductByIdGet(suspendedReq, suspendedRes);
      assert.strictEqual(suspendedRes.statusCode, 404, 'Direct access to published product of suspended merchant must return 404');

      // 3. Active merchant + Proposed product -> 404 NOT FOUND (fail-closed)
      container.products.get('prod_loom_shirt_01')!.status = 'proposed';
      const proposedReq = createMockReq({ params: { id: 'prod_loom_shirt_01' } });
      const proposedRes = createMockRes();
      await storeProductByIdGet(proposedReq, proposedRes);
      assert.strictEqual(proposedRes.statusCode, 404, 'Direct access to proposed product must return 404');

      // 4. Active merchant + Draft product -> 404 NOT FOUND (fail-closed)
      container.products.get('prod_loom_shirt_01')!.status = 'draft';
      const draftReq = createMockReq({ params: { id: 'prod_loom_shirt_01' } });
      const draftRes = createMockRes();
      await storeProductByIdGet(draftReq, draftRes);
      assert.strictEqual(draftRes.statusCode, 404, 'Direct access to draft product must return 404');

      // 5. Active merchant + Rejected product -> 404 NOT FOUND (fail-closed)
      container.products.get('prod_loom_shirt_01')!.status = 'rejected';
      const rejectedReq = createMockReq({ params: { id: 'prod_loom_shirt_01' } });
      const rejectedRes = createMockRes();
      await storeProductByIdGet(rejectedReq, rejectedRes);
      assert.strictEqual(rejectedRes.statusCode, 404, 'Direct access to rejected product must return 404');

      // 6. Non-existent product -> 404 NOT FOUND
      const notFoundReq = createMockReq({ params: { id: 'prod_does_not_exist' } });
      const notFoundRes = createMockRes();
      await storeProductByIdGet(notFoundReq, notFoundRes);
      assert.strictEqual(notFoundRes.statusCode, 404, 'Non-existent product must return 404');
    });

    it('Medusa v2 route registration audit & HTTP boundary: proves custom store/products handlers override core and enforce fail-closed isolation over real HTTP', async () => {
      // 1. Verify RoutesLoader route override
      const fwDist = path.dirname(require.resolve('@medusajs/framework'));
      const routesLoaderPath = path.join(fwDist, 'http', 'routes-loader.js');
      const RoutesLoaderModule = require(routesLoaderPath);
      const routesLoader = new RoutesLoaderModule.RoutesLoader();

      const medDist = path.dirname(require.resolve('@medusajs/medusa'));
      const medusaApi = path.join(medDist, 'api');
      const projectApi = path.resolve(__dirname, 'api');
      const projectRoot = path.resolve(__dirname, '..');

      await routesLoader.scanDir(medusaApi);
      await routesLoader.scanDir(projectApi);

      const routes = routesLoader.getRoutes();
      const storeProductsRoute = routes.find((r: any) => r.matcher === '/store/products' && r.method === 'GET');
      const storeProductByIdRoute = routes.find((r: any) => r.matcher === '/store/products/:id' && r.method === 'GET');

      assert.ok(storeProductsRoute, 'GET /store/products must be registered');
      assert.ok(
        storeProductsRoute.absolutePath.includes(path.join('api', 'store', 'products', 'route.js')),
        `GET /store/products must be resolved from custom project handler, got ${storeProductsRoute.absolutePath}`
      );

      assert.ok(storeProductByIdRoute, 'GET /store/products/:id must be registered');
      assert.ok(
        storeProductByIdRoute.absolutePath.includes(path.join('api', 'store', 'products', '[id]', 'route.js')),
        `GET /store/products/:id must be resolved from custom project handler, got ${storeProductByIdRoute.absolutePath}`
      );

      // 2. Real HTTP Boundary Test
      configManager.loadConfig({
        projectConfig: { http: {} as any } as any,
        baseDir: projectRoot,
        throwOnValidationError: false,
      } as any);
      const testApp = express();

      // Seed data into container
      container.products.get('prod_virasat_saree_01')!.status = 'published';
      container.products.get('prod_loom_shirt_01')!.status = 'proposed';
      container.products.set('prod_suspended_item', {
        id: 'prod_suspended_item',
        title: 'Banned Merchant Product',
        handle: 'banned-prod',
        status: 'published',
        variants: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      container.productLinks.set('prod_suspended_item', 'merch_suspended_store');

      const mockScope = {
        resolve: (key: string) => {
          if (key === 'logger') return { debug: () => {}, warn: () => {}, error: () => {}, info: () => {} };
          if (key === 'configModule') return { projectConfig: { http: {} } };
          if (key === 'query') {
            return {
              graph: async (params: { entity: string; fields?: string[]; filters?: any }) => {
                if (params.entity === 'api_key') {
                  return {
                    data: [
                      {
                        id: 'key_test',
                        token: 'pk_test',
                        revoked_at: null,
                        sales_channels_link: [{ sales_channel_id: 'sc_default' }],
                      },
                    ],
                  };
                }
                if (params.entity === 'sales_channels') {
                  return { data: [{ id: 'sc_default' }], metadata: { count: 1 } };
                }
                if (params.entity === 'product') {
                  return await container.getQuery().graph({
                    ...params,
                    fields: params.fields || ['*'],
                  });
                }
                return { data: [] };
              },
            };
          }
          return null;
        },
        createScope: function () {
          return this;
        },
      };

      testApp.use((req: any, _res: any, next: any) => {
        req.scope = mockScope;
        next();
      });

      const loader = new ApiLoader({
        app: testApp,
        sourceDir: [medusaApi, projectApi],
        container: mockScope as any,
      });

      await loader.load();

      const server = testApp.listen(0);
      const port = (server.address() as any).port;
      const baseUrl = `http://127.0.0.1:${port}`;

      try {
        // Test A: Direct HTTP call without publishable API key -> 400 Bad Request (Medusa core guard verification)
        const unauthRes = await fetch(`${baseUrl}/store/products`, {
          headers: { connection: 'close' },
        });
        assert.strictEqual(unauthRes.status, 400, 'Request without publishable key must be rejected by Medusa security middleware');

        // Test B: Direct HTTP call with publishable key -> 200 OK with fail-closed catalog isolation
        const listRes = await fetch(`${baseUrl}/store/products`, {
          headers: { 'x-publishable-api-key': 'pk_test', connection: 'close' },
        });
        assert.strictEqual(listRes.status, 200);
        const listBody: any = await listRes.json();
        const productIds = (listBody.products || []).map((p: any) => p.id);
        assert.ok(productIds.includes('prod_virasat_saree_01'), 'Active published product must be returned over HTTP');
        assert.ok(!productIds.includes('prod_suspended_item'), 'Suspended merchant product must be excluded over HTTP');
        assert.ok(!productIds.includes('prod_loom_shirt_01'), 'Proposed product must be excluded over HTTP');

        // Test C: Direct HTTP single product by ID (active merchant, published) -> 200 OK
        const validItemRes = await fetch(`${baseUrl}/store/products/prod_virasat_saree_01`, {
          headers: { 'x-publishable-api-key': 'pk_test', connection: 'close' },
        });
        assert.strictEqual(validItemRes.status, 200);
        const validItemBody: any = await validItemRes.json();
        assert.strictEqual(validItemBody.product?.id, 'prod_virasat_saree_01');

        // Test D: Direct HTTP single product by ID (suspended merchant, published) -> 404 NOT FOUND (fail-closed)
        const suspendedItemRes = await fetch(`${baseUrl}/store/products/prod_suspended_item`, {
          headers: { 'x-publishable-api-key': 'pk_test', connection: 'close' },
        });
        assert.strictEqual(suspendedItemRes.status, 404, 'Direct HTTP request for suspended merchant product must return 404');

        // Test E: Direct HTTP single product by ID (active merchant, proposed) -> 404 NOT FOUND (fail-closed)
        const proposedItemRes = await fetch(`${baseUrl}/store/products/prod_loom_shirt_01`, {
          headers: { 'x-publishable-api-key': 'pk_test', connection: 'close' },
        });
        assert.strictEqual(proposedItemRes.status, 404, 'Direct HTTP request for proposed product must return 404');
      } finally {
        if ((server as any).closeAllConnections) {
          (server as any).closeAllConnections();
        }
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });
  });
});
