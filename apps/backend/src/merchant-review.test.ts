import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { GET as getMerchantsHandler } from './api/admin/marketplace/merchants/route';
import { GET as getMerchantDetailHandler } from './api/admin/marketplace/merchants/[id]/route';
import { PUT as updateMerchantStatusHandler } from './api/admin/marketplace/merchants/[id]/status/route';
import { GET as getMerchantProductsHandler } from './api/merchant/products/route';
import { MARKETPLACE_MODULE } from './modules/marketplace/index';
import { MerchantAuthEngine } from './modules/auth/merchant-auth-engine';

/**
 * Mock HTTP Helper
 */
function createMockHttp(options: {
  params?: Record<string, string>;
  query?: Record<string, any>;
  body?: Record<string, any>;
  headers?: Record<string, string>;
  cookies?: Record<string, string>;
  scope?: any;
} = {}) {
  let statusCode = 200;
  const headers: Record<string, string> = {};
  let responseBody: any = null;

  const req: any = {
    params: options.params || {},
    query: options.query || {},
    body: options.body || {},
    headers: options.headers || {},
    cookies: options.cookies || {},
    socket: { remoteAddress: '127.0.0.1' },
    scope: options.scope || {
      resolve: (key: string) => {
        throw new Error(`Unresolved mock container key: ${key}`);
      },
    },
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    setHeader(name: string, value: string) {
      headers[name.toLowerCase()] = value;
      return res;
    },
    json(body: any) {
      responseBody = body;
      return res;
    },
    send(body: any) {
      responseBody = body;
      return res;
    },
  };

  return {
    req,
    res,
    getResponse: () => ({
      statusCode,
      headers,
      body: responseBody,
    }),
  };
}

describe('M2-08: Merchant Review and Approval Test Suite', () => {
  // Mock In-Memory Marketplace Service
  class MockMarketplaceService {
    public merchants: Map<string, any> = new Map();
    public members: Map<string, any> = new Map();

    async listMerchants(filter: any = {}) {
      const list = Array.from(this.merchants.values());
      if (filter.status) {
        return list.filter((m) => m.status === filter.status);
      }
      return list;
    }

    async retrieveMerchant(id: string) {
      const merchant = this.merchants.get(id);
      if (!merchant) {
        throw new Error(`NOT_FOUND: Merchant with ID '${id}' not found.`);
      }
      return { ...merchant };
    }

    async listMerchantMembers(filter: any = {}) {
      let list = Array.from(this.members.values());
      if (filter.merchant_id) {
        list = list.filter((m) => m.merchant_id === filter.merchant_id);
      }
      if (filter.user_id) {
        list = list.filter((m) => m.user_id === filter.user_id);
      }
      return list;
    }

    async transitionMerchantStatus(
      id: string,
      targetStatus: string,
      context: { actorType?: string; actorId?: string; reason?: string; notes?: string } = {}
    ) {
      const merchant = await this.retrieveMerchant(id);
      const currentStatus = merchant.status;

      if (currentStatus === targetStatus) {
        throw new Error(`NO_OP_TRANSITION: Target status is already '${targetStatus}'.`);
      }

      if (context.actorType && context.actorType !== 'super_admin') {
        throw new Error('SUPER_ADMIN_REQUIRED: Only Super Admin can transition merchant status.');
      }

      if (targetStatus === 'active') {
        if (currentStatus === 'draft') {
          throw new Error('DIRECT_ACTIVATION_BLOCKED: Draft merchant cannot be activated directly.');
        }
        if (currentStatus === 'rejected') {
          throw new Error('RE_REVIEW_REQUIRED: Rejected merchant cannot be directly activated without re-review.');
        }
        const members = await this.listMerchantMembers({ merchant_id: id });
        const hasOwner = members.some((m) => m.role === 'owner' && m.status === 'active');
        if (!hasOwner) {
          throw new Error('OWNER_REQUIRED: Merchant must have at least one active owner before activation.');
        }
      }

      if (targetStatus === 'rejected') {
        if (!context.reason || context.reason.trim() === '') {
          throw new Error('REJECTION_REASON_REQUIRED: A rejection reason is required.');
        }
      }

      if (targetStatus === 'draft' && currentStatus === 'pending_approval') {
        if (!context.reason || context.reason.trim() === '') {
          throw new Error('CHANGES_REQUESTED_REASON_REQUIRED: A reason is required when requesting changes on a merchant.');
        }
      }

      if (targetStatus === 'suspended') {
        if (!context.reason || context.reason.trim() === '') {
          throw new Error('SUSPENSION_REASON_REQUIRED: A suspension reason is required.');
        }
      }

      const now = new Date().toISOString();
      const metadata = merchant.metadata || {};
      const history = Array.isArray(metadata.lifecycleHistory) ? [...metadata.lifecycleHistory] : [];

      history.push({
        fromStatus: currentStatus,
        toStatus: targetStatus,
        changedAt: now,
        changedBy: context.actorId || 'system',
        reason: context.reason,
        notes: context.notes,
      });

      const updatedMetadata = {
        ...metadata,
        lifecycleHistory: history,
      };

      if (targetStatus === 'active') {
        updatedMetadata.approvedAt = now;
        updatedMetadata.approvedBy = context.actorId || 'system';
        if (currentStatus === 'suspended') {
          updatedMetadata.reactivatedAt = now;
          updatedMetadata.reactivatedBy = context.actorId || 'system';
        }
      } else if (targetStatus === 'rejected') {
        updatedMetadata.rejectedAt = now;
        updatedMetadata.rejectedBy = context.actorId || 'system';
        updatedMetadata.rejectionReason = context.reason;
      } else if (targetStatus === 'draft') {
        updatedMetadata.changesRequestedAt = now;
        updatedMetadata.changesRequestedBy = context.actorId || 'system';
        updatedMetadata.changesRequestedReason = context.reason;
      } else if (targetStatus === 'suspended') {
        updatedMetadata.suspendedAt = now;
        updatedMetadata.suspendedBy = context.actorId || 'system';
        updatedMetadata.suspensionReason = context.reason;
      }

      const updated = {
        ...merchant,
        status: targetStatus,
        metadata: updatedMetadata,
        updated_at: now,
      };

      this.merchants.set(id, updated);
      return updated;
    }
  }

  let mockService: MockMarketplaceService;
  let mockScope: any;

  before(() => {
    mockService = new MockMarketplaceService();
    mockScope = {
      resolve: (key: string) => {
        if (key === MARKETPLACE_MODULE) return mockService;
        if (key === 'query') {
          return {
            graph: async () => ({ data: [] }),
          };
        }
        throw new Error(`Unknown container key: ${key}`);
      },
    };

    // Seed test merchants
    mockService.merchants.set('merch_pending_1', {
      id: 'merch_pending_1',
      name: 'Vedic Threads',
      handle: 'vedic-threads',
      status: 'pending_approval',
      email: 'owner@vedicthreads.com',
      phone: '+919876543210',
      business_registration_number: '29ABCDE1234F1Z5',
      tax_identifier: 'ABCDE1234F',
      metadata: { verificationSubmittedAt: new Date().toISOString() },
    });
    mockService.members.set('mem_1', {
      id: 'mem_1',
      merchant_id: 'merch_pending_1',
      user_id: 'usr_owner_1',
      role: 'owner',
      status: 'active',
    });

    mockService.merchants.set('merch_active_1', {
      id: 'merch_active_1',
      name: 'Jaipur Crafts',
      handle: 'jaipur-crafts',
      status: 'active',
      email: 'admin@jaipurcrafts.com',
      phone: '+919876543211',
      business_registration_number: '08ABCDE1234F1Z9',
      tax_identifier: 'ABCDE1234G',
      metadata: { approvedAt: new Date().toISOString() },
    });
    mockService.members.set('mem_2', {
      id: 'mem_2',
      merchant_id: 'merch_active_1',
      user_id: 'usr_owner_2',
      role: 'owner',
      status: 'active',
    });

    mockService.merchants.set('merch_no_owner', {
      id: 'merch_no_owner',
      name: 'Orphan Fabrics',
      handle: 'orphan-fabrics',
      status: 'pending_approval',
      email: 'orphan@fabrics.com',
      phone: '+919876543212',
      metadata: {},
    });
  });

  describe('1. Super Admin Review Queue Listing & Detail', () => {
    it('GET /admin/marketplace/merchants lists all merchants for Super Admin', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        scope: mockScope,
      });

      await getMerchantsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.success, true);
      assert.ok(Array.isArray(response.body.merchants));
      assert.strictEqual(response.body.merchants.length, 3);
    });

    it('GET /admin/marketplace/merchants filters by status=pending_approval', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        query: { status: 'pending_approval' },
        scope: mockScope,
      });

      await getMerchantsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.count, 2);
      assert.ok(response.body.merchants.every((m: any) => m.status === 'pending_approval'));
    });

    it('GET /admin/marketplace/merchants searches by name query ?q=Vedic', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        query: { q: 'Vedic' },
        scope: mockScope,
      });

      await getMerchantsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.count, 1);
      assert.strictEqual(response.body.merchants[0].name, 'Vedic Threads');
    });

    it('NEGATIVE: rejects non-admin callers (merchant user) with 403 Forbidden', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer merchant_token:usr_m1:merch_active_1:owner:active:active' },
        scope: mockScope,
      });

      await getMerchantsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 403);
      assert.strictEqual(response.body.error, 'FORBIDDEN');
    });

    it('GET /admin/marketplace/merchants/:id retrieves full merchant detail and audit history', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_pending_1' },
        scope: mockScope,
      });

      await getMerchantDetailHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.merchant.id, 'merch_pending_1');
      assert.strictEqual(response.body.merchant.name, 'Vedic Threads');
      assert.ok(response.body.merchant.owner);
      assert.strictEqual(response.body.merchant.owner.role, 'owner');
    });

    it('NEGATIVE: returns 404 for non-existent merchant ID', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_unknown_999' },
        scope: mockScope,
      });

      await getMerchantDetailHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 404);
      assert.strictEqual(response.body.error, 'MERCHANT_NOT_FOUND');
    });
  });

  describe('2. Super Admin Approval, Rejection, and Changes-Request Actions', () => {
    it('approves a pending merchant when actor is Super Admin and merchant has active owner', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_pending_1' },
        body: { action: 'approve', notes: 'All GSTIN and bank documents verified.' },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.merchant.status, 'active');
      assert.ok(response.body.merchant.metadata.approvedAt);
      assert.strictEqual(response.body.merchant.metadata.approvedBy, 'usr_admin_super_admin_1');
    });

    it('NEGATIVE: blocks approving merchant without an active owner (OWNER_REQUIRED)', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_no_owner' },
        body: { action: 'approve' },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 400);
      assert.strictEqual(response.body.error, 'OWNER_REQUIRED');
    });

    it('request-changes on pending merchant transitions status to draft with reason', async () => {
      // Seed fresh pending merchant
      mockService.merchants.set('merch_pending_changes', {
        id: 'merch_pending_changes',
        name: 'Artisan Potter',
        handle: 'artisan-potter',
        status: 'pending_approval',
        email: 'potter@artisan.com',
        phone: '+919876543299',
        metadata: {},
      });

      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_pending_changes' },
        body: {
          action: 'request-changes',
          reason: 'GSTIN document is blurred. Please upload clear scan.',
        },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.merchant.status, 'draft');
      assert.strictEqual(
        response.body.merchant.metadata.changesRequestedReason,
        'GSTIN document is blurred. Please upload clear scan.'
      );
    });

    it('NEGATIVE: request-changes without reason is rejected (CHANGES_REQUESTED_REASON_REQUIRED)', async () => {
      mockService.merchants.set('merch_pending_no_reason', {
        id: 'merch_pending_no_reason',
        name: 'Kashmir Silks',
        handle: 'kashmir-silks',
        status: 'pending_approval',
        email: 'silks@kashmir.com',
        phone: '+919876543288',
        metadata: {},
      });

      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_pending_no_reason' },
        body: { action: 'request-changes', reason: '   ' },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 400);
      assert.strictEqual(response.body.error, 'CHANGES_REQUESTED_REASON_REQUIRED');
    });

    it('rejects a pending merchant with mandatory rejection reason', async () => {
      mockService.merchants.set('merch_pending_reject', {
        id: 'merch_pending_reject',
        name: 'Fraudulent Goods Co',
        handle: 'fraudulent-goods',
        status: 'pending_approval',
        email: 'fraud@goods.com',
        phone: '+919876543277',
        metadata: {},
      });

      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_pending_reject' },
        body: {
          action: 'reject',
          reason: 'Submitted PAN details belong to an unregistered entity.',
        },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.merchant.status, 'rejected');
      assert.strictEqual(
        response.body.merchant.metadata.rejectionReason,
        'Submitted PAN details belong to an unregistered entity.'
      );
    });

    it('NEGATIVE: rejects without reason is blocked (REJECTION_REASON_REQUIRED)', async () => {
      mockService.merchants.set('merch_pending_reject_fail', {
        id: 'merch_pending_reject_fail',
        name: 'Test Store',
        handle: 'test-store',
        status: 'pending_approval',
        email: 'test@store.com',
        phone: '+919876543266',
        metadata: {},
      });

      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_pending_reject_fail' },
        body: { action: 'reject' },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 400);
      assert.strictEqual(response.body.error, 'REJECTION_REASON_REQUIRED');
    });
  });

  describe('3. Super Admin Suspension, Session Revocation & Reactivation', () => {
    it('suspends an active merchant with mandatory suspension reason and revokes sessions', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_active_1' },
        body: {
          action: 'suspend',
          reason: 'Severe compliance defect: multiple counterfeit product reports.',
        },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.merchant.status, 'suspended');
      assert.strictEqual(
        response.body.merchant.metadata.suspensionReason,
        'Severe compliance defect: multiple counterfeit product reports.'
      );
    });

    it('NEGATIVE: suspending without reason is blocked (SUSPENSION_REASON_REQUIRED)', async () => {
      mockService.merchants.set('merch_active_2', {
        id: 'merch_active_2',
        name: 'Active Seller',
        handle: 'active-seller',
        status: 'active',
        email: 'active@seller.com',
        phone: '+919876543255',
        metadata: {},
      });

      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_active_2' },
        body: { action: 'suspend', reason: '' },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 400);
      assert.strictEqual(response.body.error, 'SUSPENSION_REASON_REQUIRED');
    });

    it('reactivates a suspended merchant back to active status', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:super_admin_1' },
        params: { id: 'merch_active_1' },
        body: { action: 'reactivate', notes: 'Merchant compliance cleared by legal team.' },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.body.success, true);
      assert.strictEqual(response.body.merchant.status, 'active');
      assert.ok(response.body.merchant.metadata.reactivatedAt);
    });

    it('NEGATIVE: rejects merchant user attempting self-approval or status change', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer merchant_token:usr_m1:merch_pending_1:owner:active:pending_approval' },
        params: { id: 'merch_pending_1' },
        body: { action: 'approve' },
        scope: mockScope,
      });

      await updateMerchantStatusHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 403);
      assert.strictEqual(response.body.error, 'FORBIDDEN');
    });
  });

  describe('4. Status Gating on Commercial Operations for Non-Active Merchants', () => {
    it('strictly denies commercial endpoint access (403) when merchant account is suspended', async () => {
      // Simulate session for suspended merchant
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer merchant_token:usr_m2:merch_suspended:owner:active:suspended' },
        scope: mockScope,
      });

      await getMerchantProductsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 403);
      assert.strictEqual(response.body.error, 'FORBIDDEN');
      assert.ok(response.body.message.includes('Merchant account is not active'));
    });

    it('strictly denies commercial endpoint access (403) when merchant account is pending approval', async () => {
      const { req, res, getResponse } = createMockHttp({
        headers: { authorization: 'Bearer merchant_token:usr_m3:merch_pending:owner:active:pending_approval' },
        scope: mockScope,
      });

      await getMerchantProductsHandler(req, res);
      const response = getResponse();

      assert.strictEqual(response.statusCode, 403);
      assert.strictEqual(response.body.error, 'FORBIDDEN');
      assert.ok(response.body.message.includes('Merchant account is not active'));
    });
  });
});
