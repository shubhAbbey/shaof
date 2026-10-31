import { describe, it, before, after, beforeEach } from 'node:test';
import assert from 'node:assert';
import { POST as registerHandler } from './api/merchant/auth/register/route';
import { GET as getApplicationHandler, PUT as updateApplicationHandler } from './api/merchant/application/route';
import { POST as submitApplicationHandler } from './api/merchant/application/submit/route';
import { GET as getAdminMerchantsHandler } from './api/admin/marketplace/merchants/route';
import { GET as getAdminMerchantDetailHandler } from './api/admin/marketplace/merchants/[id]/route';
import { PUT as updateAdminMerchantStatusHandler } from './api/admin/marketplace/merchants/[id]/status/route';
import { GET as getMerchantProductsHandler } from './api/merchant/products/route';
import { MARKETPLACE_MODULE } from './modules/marketplace/index';
import MarketplaceModuleService from './modules/marketplace/service';
import { validateMerchantStatusTransition } from '@ecom/types';
import {
  MerchantAuthEngine,
  InMemoryMerchantAuthStorageAdapter,
  InMemoryMerchantIdentityStore,
} from './modules/auth/merchant-auth-engine';

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

describe('Merchant Onboarding & Super Admin Approval Lifecycle Suite', () => {
  // In-Memory Marketplace Service with full lifecycle state machine validation
  class LifecycleTestMarketplaceService {
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

    async updateMerchants(data: any) {
      const existing = this.merchants.get(data.id);
      if (!existing) {
        throw new Error(`NOT_FOUND: Merchant with ID '${data.id}' not found.`);
      }
      const updated = {
        ...existing,
        ...data,
        updated_at: new Date().toISOString(),
      };
      this.merchants.set(data.id, updated);
      return [updated];
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
      context: { actorType?: any; actorId?: string; reason?: string; notes?: string } = {}
    ) {
      const merchant = await this.retrieveMerchant(id);
      const currentStatus = merchant.status;

      let hasActiveOwner = true;
      if (targetStatus === 'active') {
        const members = await this.listMerchantMembers({ merchant_id: id });
        hasActiveOwner = members.some((m) => m.role === 'owner' && m.status === 'active');
      }

      const transitionResult = validateMerchantStatusTransition(currentStatus as any, targetStatus as any, {
        actorType: context.actorType,
        hasActiveOwner,
        reason: context.reason,
      });

      if (!transitionResult.allowed) {
        throw new Error(transitionResult.error || `INVALID_TRANSITION: Cannot transition to ${targetStatus}`);
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

      const updatedMetadata: Record<string, any> = {
        ...metadata,
        lifecycleHistory: history,
      };

      if (targetStatus === 'pending_approval') {
        updatedMetadata.verificationSubmittedAt = now;
      } else if (targetStatus === 'active') {
        updatedMetadata.approvedAt = now;
        updatedMetadata.approvedBy = context.actorId || 'system';
      } else if (targetStatus === 'rejected') {
        updatedMetadata.rejectedAt = now;
        updatedMetadata.rejectedBy = context.actorId || 'system';
        updatedMetadata.rejectionReason = context.reason;
      } else if (targetStatus === 'draft' && currentStatus === 'pending_approval') {
        if (context.reason) {
          updatedMetadata.changesRequestedAt = now;
          updatedMetadata.changesRequestedBy = context.actorId || 'system';
          updatedMetadata.changesRequestedReason = context.reason;
        }
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

    async verifyActiveMembership(userId: string, merchantId: string) {
      if (!userId || !merchantId) {
        return {
          valid: false,
          statusCode: 401 as const,
          error: 'UNAUTHORIZED',
          message: 'userId and merchantId are required for membership verification.',
        };
      }

      const merchant = this.merchants.get(merchantId);
      if (!merchant) {
        return {
          valid: false,
          statusCode: 403 as const,
          error: 'FORBIDDEN',
          message: `Merchant with ID '${merchantId}' does not exist.`,
        };
      }

      if (merchant.status !== 'active') {
        return {
          valid: false,
          statusCode: 403 as const,
          error: 'FORBIDDEN',
          message: `Merchant account is not active (current status: '${merchant.status}'). Access denied.`,
        };
      }

      const member = Array.from(this.members.values()).find(
        (m: any) => m.merchant_id === merchantId && m.user_id === userId
      );

      if (!member) {
        return {
          valid: false,
          statusCode: 403 as const,
          error: 'FORBIDDEN',
          message: `User '${userId}' is not a member of merchant '${merchantId}'.`,
        };
      }

      if (member.status !== 'active') {
        return {
          valid: false,
          statusCode: 403 as const,
          error: 'FORBIDDEN',
          message: `Merchant membership is not active (current status: '${member.status}'). Access denied.`,
        };
      }

      return {
        valid: true,
        statusCode: 200 as const,
        role: member.role,
      };
    }
  }

  let marketplaceService: LifecycleTestMarketplaceService;
  let mockContainer: any;

  before(async () => {
    MerchantAuthEngine.setAdapter(new InMemoryMerchantAuthStorageAdapter());
    MerchantAuthEngine.setIdentityStore(new InMemoryMerchantIdentityStore());
    await MerchantAuthEngine.resetForTesting();

    marketplaceService = new LifecycleTestMarketplaceService();
    mockContainer = {
      resolve: (key: string) => {
        if (key === MARKETPLACE_MODULE) return marketplaceService;
        return null;
      },
    };
  });

  after(async () => {
    await MerchantAuthEngine.resetForTesting();
  });

  describe('1. Registration Initial Persisted State & Truthful Messaging', () => {
    it('initializes registered merchant status strictly as draft', async () => {
      // Seed a draft merchant directly in service
      marketplaceService.merchants.set('merch_test_initial', {
        id: 'merch_test_initial',
        name: 'Virasat Weaves',
        handle: 'virasat-weaves',
        status: 'draft',
        email: 'virasat@textiles.in',
        phone: '+919876543210',
        business_registration_number: null,
        tax_identifier: null,
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      marketplaceService.members.set('mem_virasat_owner', {
        id: 'mem_virasat_owner',
        merchant_id: 'merch_test_initial',
        user_id: 'usr_virasat_owner',
        role: 'owner',
        status: 'active',
      });

      const retrieved = await marketplaceService.retrieveMerchant('merch_test_initial');
      assert.strictEqual(retrieved.status, 'draft', 'Persisted status immediately after registration must be draft');
    });

    it('returns honest registration message that never falsely claims pending verification for draft', async () => {
      const ts = Date.now();
      // When registration handler returns, message must reflect draft status awaiting submission
      const http = createMockHttp({
        body: {
          name: 'Draft Only Studio',
          handle: `draft-studio-${ts}`,
          email: `draft_${ts}@studio.in`,
          phone: '+919876543210',
          password: 'Password123!',
        },
      });

      await registerHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 201);
      assert.strictEqual(res.body.merchant.status, 'draft');
      assert.ok(
        res.body.message.includes('draft status'),
        'Registration response must state account is in draft status'
      );
      assert.ok(
        !res.body.message.includes('awaiting verification by platform staff'),
        'Registration response must NOT falsely claim draft is already awaiting verification'
      );
    });
  });

  describe('2. Incomplete Application Submission Rejection', () => {
    it('rejects verification submission when GSTIN and PAN are missing (INCOMPLETE_APPLICATION)', async () => {
      // Merchant in draft status with missing tax fields
      marketplaceService.merchants.set('merch_incomplete_tax', {
        id: 'merch_incomplete_tax',
        name: 'Incomplete Handicrafts',
        handle: 'incomplete-crafts',
        status: 'draft',
        email: 'info@incomplete.in',
        phone: '+919876543210',
        business_registration_number: null,
        tax_identifier: null,
        metadata: {},
      });
      marketplaceService.members.set('mem_incomplete_owner', {
        id: 'mem_incomplete_owner',
        merchant_id: 'merch_incomplete_tax',
        user_id: 'usr_inc_owner',
        role: 'owner',
        status: 'active',
      });

      const sessionToken = JSON.stringify({
        userId: 'usr_inc_owner',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${sessionToken}` },
        scope: mockContainer,
      });

      await submitApplicationHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, 'INCOMPLETE_APPLICATION');
      assert.ok(
        res.body.errors.some((e: string) => e.includes('GSTIN')),
        'Errors must cite missing GSTIN'
      );
      assert.ok(
        res.body.errors.some((e: string) => e.includes('PAN')),
        'Errors must cite missing PAN'
      );

      // Verify merchant is STILL in draft status
      const current = await marketplaceService.retrieveMerchant('merch_incomplete_tax');
      assert.strictEqual(current.status, 'draft', 'Status must remain draft when submission is rejected');
    });

    it('rejects verification submission when GSTIN has invalid format', async () => {
      marketplaceService.merchants.set('merch_bad_gstin', {
        id: 'merch_bad_gstin',
        name: 'Bad GSTIN Store',
        handle: 'bad-gstin-store',
        status: 'draft',
        email: 'bad@gstin.in',
        phone: '+919876543210',
        business_registration_number: 'INVALID_GSTIN_123',
        tax_identifier: 'ABCDE1234F',
        metadata: {},
      });
      marketplaceService.members.set('mem_bad_gstin_owner', {
        id: 'mem_bad_gstin_owner',
        merchant_id: 'merch_bad_gstin',
        user_id: 'usr_bad_gstin',
        role: 'owner',
        status: 'active',
      });

      const sessionToken = JSON.stringify({
        userId: 'usr_bad_gstin',
        merchantId: 'merch_bad_gstin',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${sessionToken}` },
        scope: mockContainer,
      });

      await submitApplicationHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, 'INCOMPLETE_APPLICATION');
      assert.ok(res.body.errors.some((e: string) => e.includes('GSTIN Error')));
    });
  });

  describe('3. Draft Application Updating and Submission to Pending Approval', () => {
    it('allows updating draft profile and tax identifiers via PUT /merchant/application', async () => {
      const sessionToken = JSON.stringify({
        userId: 'usr_inc_owner',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: {
          businessRegistrationNumber: '07AAAAA0000A1Z5',
          taxIdentifier: 'AAAAA0000A',
        },
        scope: mockContainer,
      });

      await updateApplicationHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.merchant.businessRegistrationNumber, '07AAAAA0000A1Z5');
      assert.strictEqual(res.body.merchant.taxIdentifier, 'AAAAA0000A');
    });

    it('submits completed application and transitions status to pending_approval', async () => {
      const sessionToken = JSON.stringify({
        userId: 'usr_inc_owner',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${sessionToken}` },
        scope: mockContainer,
      });

      await submitApplicationHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.merchant.status, 'pending_approval');
      assert.ok(res.body.merchant.verificationSubmittedAt, 'Must record verificationSubmittedAt timestamp');

      // Verify in persistent service
      const updated = await marketplaceService.retrieveMerchant('merch_incomplete_tax');
      assert.strictEqual(updated.status, 'pending_approval');
      assert.ok(updated.metadata?.verificationSubmittedAt);
    });

    it('persists submitted status and verification metadata upon subsequent GET /merchant/application', async () => {
      const sessionToken = JSON.stringify({
        userId: 'usr_inc_owner',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'pending_approval',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${sessionToken}` },
        scope: mockContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.merchant.status, 'pending_approval');
      assert.ok(res.body.merchant.verification.verificationSubmittedAt);
      assert.strictEqual(res.body.merchant.owner.role, 'owner');
    });
  });

  describe('4. Super Admin Review Queue & Detail Verification', () => {
    it('includes submitted merchant in Super Admin Pending Approval queue', async () => {
      const adminToken = JSON.stringify({
        userId: 'usr_admin_verifier',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${adminToken}` },
        query: { status: 'pending_approval' },
        scope: mockContainer,
      });

      await getAdminMerchantsHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      const found = res.body.merchants.find((m: any) => m.id === 'merch_incomplete_tax');
      assert.ok(found, 'Submitted merchant must appear in Pending Approval queue');
      assert.strictEqual(found.status, 'pending_approval');
      assert.strictEqual(found.businessRegistrationNumber, '07AAAAA0000A1Z5');
      assert.strictEqual(found.taxIdentifier, 'AAAAA0000A');
    });

    it('exposes full profile, tax fields, owner verification, and audit history in Super Admin detail view', async () => {
      const adminToken = JSON.stringify({
        userId: 'usr_admin_verifier',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        params: { id: 'merch_incomplete_tax' },
        headers: { Authorization: `Bearer ${adminToken}` },
        scope: mockContainer,
      });

      await getAdminMerchantDetailHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.merchant.name, 'Incomplete Handicrafts');
      assert.strictEqual(res.body.merchant.status, 'pending_approval');
      assert.strictEqual(res.body.merchant.businessRegistrationNumber, '07AAAAA0000A1Z5');
      assert.strictEqual(res.body.merchant.taxIdentifier, 'AAAAA0000A');
      assert.ok(res.body.merchant.verification.verificationSubmittedAt);
      assert.ok(res.body.merchant.owner, 'Owner info must be present');
      assert.strictEqual(res.body.merchant.owner.role, 'owner');
      assert.strictEqual(res.body.merchant.owner.status, 'active');
      assert.ok(res.body.merchant.verification.lifecycleHistory.length >= 1);
    });
  });

  describe('5. Super Admin Approval, Direct-Activation Block, and Commercial Access Gating', () => {
    it('blocks direct activation of draft merchant without verification submission', async () => {
      marketplaceService.merchants.set('merch_unsubmitted_draft', {
        id: 'merch_unsubmitted_draft',
        name: 'Unsubmitted Draft Store',
        handle: 'unsubmitted-draft',
        status: 'draft',
        email: 'unsub@draft.in',
        phone: '+919876543210',
        metadata: {},
      });
      marketplaceService.members.set('mem_unsub_owner', {
        id: 'mem_unsub_owner',
        merchant_id: 'merch_unsubmitted_draft',
        user_id: 'usr_unsub_owner',
        role: 'owner',
        status: 'active',
      });

      const adminToken = JSON.stringify({
        userId: 'usr_admin_verifier',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        params: { id: 'merch_unsubmitted_draft' },
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { action: 'approve' },
        scope: mockContainer,
      });

      await updateAdminMerchantStatusHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, 'DIRECT_ACTIVATION_BLOCKED');
      assert.ok(res.body.message.includes('Draft merchant cannot be activated directly'));

      const merchant = await marketplaceService.retrieveMerchant('merch_unsubmitted_draft');
      assert.strictEqual(merchant.status, 'draft', 'Status must remain draft');
    });

    it('denies commercial operations (403 Forbidden) while merchant is in draft or pending_approval', async () => {
      const pendingSessionToken = JSON.stringify({
        userId: 'usr_inc_owner',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'pending_approval',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${pendingSessionToken}` },
        scope: mockContainer,
      });

      await getMerchantProductsHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('Merchant account is not active'));
    });

    it('approves pending_approval merchant as Super Admin, enforcing active owner and setting status to active', async () => {
      const adminToken = JSON.stringify({
        userId: 'usr_admin_verifier',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        params: { id: 'merch_incomplete_tax' },
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { action: 'approve' },
        scope: mockContainer,
      });

      await updateAdminMerchantStatusHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.merchant.status, 'active');

      const approved = await marketplaceService.retrieveMerchant('merch_incomplete_tax');
      assert.strictEqual(approved.status, 'active');
      assert.ok(approved.metadata.approvedAt);
      assert.strictEqual(approved.metadata.approvedBy, 'usr_admin_verifier');
    });

    it('allows commercial operations once merchant is active', async () => {
      const activeSessionToken = JSON.stringify({
        userId: 'usr_inc_owner',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'active',
        role: 'owner',
        permissions: ['catalog:read', 'catalog:write'],
      });

      const mockQueryContainer = {
        resolve: (key: string) => {
          if (key === MARKETPLACE_MODULE) return marketplaceService;
          if (key === 'query') {
            return {
              graph: async () => ({ data: [] }),
            };
          }
          return null;
        },
      };

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${activeSessionToken}` },
        scope: mockQueryContainer,
      });

      await getMerchantProductsHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.products));
    });
  });

  describe('6. Request Changes, Rejection, and Resubmission Cycles', () => {
    it('rejects request-changes without mandatory reason (CHANGES_REQUESTED_REASON_REQUIRED)', async () => {
      // Put merchant back to pending_approval
      marketplaceService.merchants.set('merch_changes_test', {
        id: 'merch_changes_test',
        name: 'Changes Test Store',
        handle: 'changes-test-store',
        status: 'pending_approval',
        email: 'changes@test.in',
        phone: '+919876543210',
        business_registration_number: '07AAAAA0000A1Z5',
        tax_identifier: 'AAAAA0000A',
        metadata: {},
      });
      marketplaceService.members.set('mem_changes_owner', {
        id: 'mem_changes_owner',
        merchant_id: 'merch_changes_test',
        user_id: 'usr_changes_owner',
        role: 'owner',
        status: 'active',
      });

      const adminToken = JSON.stringify({
        userId: 'usr_admin_verifier',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        params: { id: 'merch_changes_test' },
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { action: 'request-changes', reason: '   ' },
        scope: mockContainer,
      });

      await updateAdminMerchantStatusHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, 'CHANGES_REQUESTED_REASON_REQUIRED');
    });

    it('returns merchant to editable draft status when changes are requested with valid reason', async () => {
      const adminToken = JSON.stringify({
        userId: 'usr_admin_verifier',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        params: { id: 'merch_changes_test' },
        headers: { Authorization: `Bearer ${adminToken}` },
        body: {
          action: 'request-changes',
          reason: 'Legal business name does not match registered GSTIN. Please update store name.',
        },
        scope: mockContainer,
      });

      await updateAdminMerchantStatusHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.merchant.status, 'draft');

      const updated = await marketplaceService.retrieveMerchant('merch_changes_test');
      assert.strictEqual(updated.status, 'draft');
      assert.strictEqual(
        updated.metadata.changesRequestedReason,
        'Legal business name does not match registered GSTIN. Please update store name.'
      );
    });

    it('rejects application rejection without mandatory reason (REJECTION_REASON_REQUIRED)', async () => {
      // Transition back to pending_approval first
      marketplaceService.merchants.set('merch_reject_test', {
        id: 'merch_reject_test',
        name: 'Reject Test Store',
        handle: 'reject-test-store',
        status: 'pending_approval',
        email: 'reject@test.in',
        phone: '+919876543210',
        business_registration_number: '07AAAAA0000A1Z5',
        tax_identifier: 'AAAAA0000A',
        metadata: {},
      });
      marketplaceService.members.set('mem_reject_owner', {
        id: 'mem_reject_owner',
        merchant_id: 'merch_reject_test',
        user_id: 'usr_reject_owner',
        role: 'owner',
        status: 'active',
      });

      const adminToken = JSON.stringify({
        userId: 'usr_admin_verifier',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        params: { id: 'merch_reject_test' },
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { action: 'reject', reason: '' },
        scope: mockContainer,
      });

      await updateAdminMerchantStatusHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.error, 'REJECTION_REASON_REQUIRED');
    });

    it('rejects application with mandatory reason and records rejection metadata', async () => {
      const adminToken = JSON.stringify({
        userId: 'usr_admin_verifier',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        params: { id: 'merch_reject_test' },
        headers: { Authorization: `Bearer ${adminToken}` },
        body: { action: 'reject', reason: 'Fraudulent business registration detected.' },
        scope: mockContainer,
      });

      await updateAdminMerchantStatusHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.merchant.status, 'rejected');

      const rejected = await marketplaceService.retrieveMerchant('merch_reject_test');
      assert.strictEqual(rejected.status, 'rejected');
      assert.strictEqual(rejected.metadata.rejectionReason, 'Fraudulent business registration detected.');
    });

    it('permits rejected merchant to edit details and re-submit for review', async () => {
      const sessionToken = JSON.stringify({
        userId: 'usr_reject_owner',
        merchantId: 'merch_reject_test',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'rejected',
      });

      // Update name/details
      const editHttp = createMockHttp({
        headers: { Authorization: `Bearer ${sessionToken}` },
        body: { name: 'Rectified Business Store' },
        scope: mockContainer,
      });
      await updateApplicationHandler(editHttp.req, editHttp.res);
      assert.strictEqual(editHttp.getResponse().statusCode, 200);

      // Re-submit
      const submitHttp = createMockHttp({
        headers: { Authorization: `Bearer ${sessionToken}` },
        scope: mockContainer,
      });
      await submitApplicationHandler(submitHttp.req, submitHttp.res);
      const submitRes = submitHttp.getResponse();

      assert.strictEqual(submitRes.statusCode, 200);
      assert.strictEqual(submitRes.body.merchant.status, 'pending_approval');

      const resubmitted = await marketplaceService.retrieveMerchant('merch_reject_test');
      assert.strictEqual(resubmitted.status, 'pending_approval');
    });
  });

  describe('7. Security & Boundary Enforcement', () => {
    it('blocks merchant user from accessing Super Admin review endpoints (403 Forbidden)', async () => {
      const merchantToken = JSON.stringify({
        userId: 'usr_inc_owner',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${merchantToken}` },
        scope: mockContainer,
      });

      await getAdminMerchantsHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
    });

    it('blocks unauthenticated requests to merchant application endpoints (401 Unauthorized)', async () => {
      const http = createMockHttp({
        scope: mockContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 401);
      assert.strictEqual(res.body.error, 'UNAUTHORIZED');
    });

    it('blocks suspended merchant account from exploiting onboarding exception (403 Forbidden)', async () => {
      marketplaceService.merchants.set('merch_suspended_actor', {
        id: 'merch_suspended_actor',
        name: 'Suspended Weaves',
        status: 'suspended',
      });

      const suspendedToken = JSON.stringify({
        userId: 'usr_susp_owner',
        merchantId: 'merch_suspended_actor',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'suspended',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${suspendedToken}` },
        scope: mockContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('suspended'));
    });

    it('blocks suspended merchant team member from accessing application endpoints (403 Forbidden)', async () => {
      const suspendedMemberToken = JSON.stringify({
        userId: 'usr_susp_member',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'suspended',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${suspendedMemberToken}` },
        scope: mockContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('membership is not active'));
    });

    it('blocks staff role from editing or submitting application (403 Forbidden)', async () => {
      const staffToken = JSON.stringify({
        userId: 'usr_staff_applicant',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'staff',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // Attempt edit
      const editHttp = createMockHttp({
        headers: { Authorization: `Bearer ${staffToken}` },
        body: { businessRegistrationNumber: '27AAAAA0000A1Z5' },
        scope: mockContainer,
      });
      await updateApplicationHandler(editHttp.req, editHttp.res);
      assert.strictEqual(editHttp.getResponse().statusCode, 403);
      assert.strictEqual(editHttp.getResponse().body.error, 'FORBIDDEN');

      // Attempt submit
      const submitHttp = createMockHttp({
        headers: { Authorization: `Bearer ${staffToken}` },
        scope: mockContainer,
      });
      await submitApplicationHandler(submitHttp.req, submitHttp.res);
      assert.strictEqual(submitHttp.getResponse().statusCode, 403);
      assert.strictEqual(submitHttp.getResponse().body.error, 'FORBIDDEN');
    });

    it('enforces anti-forgery check against client-supplied merchant_id (403 Forbidden)', async () => {
      const validOwnerToken = JSON.stringify({
        userId: 'usr_forgery_test',
        merchantId: 'merch_tenant_a',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // Supply forged merchant_id for tenant B
      const forgeryHttp = createMockHttp({
        headers: { Authorization: `Bearer ${validOwnerToken}` },
        body: { merchant_id: 'merch_tenant_b' },
        scope: mockContainer,
      });

      await getApplicationHandler(forgeryHttp.req, forgeryHttp.res);
      const res = forgeryHttp.getResponse();

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
    });

    it('confirms Super Admin detail endpoint returns canonical camelCase businessRegistrationNumber and taxIdentifier', async () => {
      marketplaceService.merchants.set('merch_contract_test', {
        id: 'merch_contract_test',
        name: 'Canonical Contract Weaves',
        status: 'pending_approval',
        business_registration_number: '27AAAAA0000A1Z5',
        tax_identifier: 'AAAAA0000A',
        metadata: { verificationSubmittedAt: new Date().toISOString() },
      });

      const adminToken = JSON.stringify({
        userId: 'usr_admin_contract',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
        isMfaVerified: true,
      });

      const http = createMockHttp({
        params: { id: 'merch_contract_test' },
        headers: { Authorization: `Bearer ${adminToken}` },
        scope: mockContainer,
      });

      await getAdminMerchantDetailHandler(http.req, http.res);
      const res = http.getResponse();

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.merchant.businessRegistrationNumber, '27AAAAA0000A1Z5');
      assert.strictEqual(res.body.merchant.taxIdentifier, 'AAAAA0000A');
      assert.strictEqual(res.body.merchant.business_registration_number, undefined, 'Must NOT contain redundant snake_case key');
      assert.strictEqual(res.body.merchant.tax_identifier, undefined, 'Must NOT contain redundant snake_case key');
    });

    it('blocks request when role is missing/undefined in session token (fail-closed 403 Forbidden)', async () => {
      const missingRoleToken = JSON.stringify({
        userId: 'usr_norole',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: undefined,
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // GET fails closed
      const getHttp = createMockHttp({
        headers: { Authorization: `Bearer ${missingRoleToken}` },
        scope: mockContainer,
      });
      await getApplicationHandler(getHttp.req, getHttp.res);
      assert.strictEqual(getHttp.getResponse().statusCode, 403);
      assert.strictEqual(getHttp.getResponse().body.error, 'FORBIDDEN');

      // PUT fails closed
      const putHttp = createMockHttp({
        headers: { Authorization: `Bearer ${missingRoleToken}` },
        body: { name: 'New Name' },
        scope: mockContainer,
      });
      await updateApplicationHandler(putHttp.req, putHttp.res);
      assert.strictEqual(putHttp.getResponse().statusCode, 403);
      assert.strictEqual(putHttp.getResponse().body.error, 'FORBIDDEN');

      // POST submit fails closed
      const submitHttp = createMockHttp({
        headers: { Authorization: `Bearer ${missingRoleToken}` },
        scope: mockContainer,
      });
      await submitApplicationHandler(submitHttp.req, submitHttp.res);
      assert.strictEqual(submitHttp.getResponse().statusCode, 403);
      assert.strictEqual(submitHttp.getResponse().body.error, 'FORBIDDEN');
    });

    it('blocks request when role is unknown or unauthorized (e.g. intern, guest, visitor) (fail-closed 403 Forbidden)', async () => {
      const unknownRoleToken = JSON.stringify({
        userId: 'usr_unknown_role',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'intern',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // GET fails closed
      const getHttp = createMockHttp({
        headers: { Authorization: `Bearer ${unknownRoleToken}` },
        scope: mockContainer,
      });
      await getApplicationHandler(getHttp.req, getHttp.res);
      assert.strictEqual(getHttp.getResponse().statusCode, 403);
      assert.strictEqual(getHttp.getResponse().body.error, 'FORBIDDEN');

      // PUT fails closed
      const putHttp = createMockHttp({
        headers: { Authorization: `Bearer ${unknownRoleToken}` },
        body: { name: 'New Name' },
        scope: mockContainer,
      });
      await updateApplicationHandler(putHttp.req, putHttp.res);
      assert.strictEqual(putHttp.getResponse().statusCode, 403);
      assert.strictEqual(putHttp.getResponse().body.error, 'FORBIDDEN');

      // POST submit fails closed
      const submitHttp = createMockHttp({
        headers: { Authorization: `Bearer ${unknownRoleToken}` },
        scope: mockContainer,
      });
      await submitApplicationHandler(submitHttp.req, submitHttp.res);
      assert.strictEqual(submitHttp.getResponse().statusCode, 403);
      assert.strictEqual(submitHttp.getResponse().body.error, 'FORBIDDEN');
    });

    it('ignores client-supplied forged role in body or query and strictly enforces verified session role', async () => {
      const staffToken = JSON.stringify({
        userId: 'usr_staff_forge',
        merchantId: 'merch_incomplete_tax',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'staff',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // Staff user attempts PUT with forged role: 'owner' in body and query
      const putHttp = createMockHttp({
        headers: { Authorization: `Bearer ${staffToken}` },
        query: { role: 'owner' },
        body: { role: 'owner', name: 'Forged Store Name' },
        scope: mockContainer,
      });
      await updateApplicationHandler(putHttp.req, putHttp.res);
      assert.strictEqual(putHttp.getResponse().statusCode, 403);
      assert.strictEqual(putHttp.getResponse().body.error, 'FORBIDDEN');

      // Staff user attempts POST submit with forged role: 'owner' in body
      const submitHttp = createMockHttp({
        headers: { Authorization: `Bearer ${staffToken}` },
        body: { role: 'owner' },
        scope: mockContainer,
      });
      await submitApplicationHandler(submitHttp.req, submitHttp.res);
      assert.strictEqual(submitHttp.getResponse().statusCode, 403);
      assert.strictEqual(submitHttp.getResponse().body.error, 'FORBIDDEN');
    });

    it('blocks cross-merchant access when token merchant does not match target resource', async () => {
      const merchantAToken = JSON.stringify({
        userId: 'usr_owner_a',
        merchantId: 'merch_tenant_a',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // Attempt to submit for merchant_tenant_b
      const crossHttp = createMockHttp({
        headers: { Authorization: `Bearer ${merchantAToken}` },
        body: { merchant_id: 'merch_tenant_b' },
        scope: mockContainer,
      });
      await submitApplicationHandler(crossHttp.req, crossHttp.res);
      assert.strictEqual(crossHttp.getResponse().statusCode, 403);
      assert.strictEqual(crossHttp.getResponse().body.error, 'FORBIDDEN');
    });

    it('permits legitimate manager role to edit draft profile and submit application', async () => {
      marketplaceService.merchants.set('merch_mgr_test', {
        id: 'merch_mgr_test',
        name: 'Manager Managed Crafts',
        handle: 'mgr-crafts',
        status: 'draft',
        email: 'mgr@crafts.in',
        phone: '+919876543210',
        business_registration_number: null,
        tax_identifier: null,
        metadata: {},
      });

      marketplaceService.members.set('mem_mgr_owner', {
        id: 'mem_mgr_owner',
        merchant_id: 'merch_mgr_test',
        user_id: 'usr_mgr_owner',
        role: 'owner',
        status: 'active',
      });

      marketplaceService.members.set('mem_mgr_legit', {
        id: 'mem_mgr_legit',
        merchant_id: 'merch_mgr_test',
        user_id: 'usr_manager_legit',
        role: 'manager',
        status: 'active',
      });

      const managerToken = JSON.stringify({
        userId: 'usr_manager_legit',
        merchantId: 'merch_mgr_test',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'manager',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // Manager updates tax identifiers
      const editHttp = createMockHttp({
        headers: { Authorization: `Bearer ${managerToken}` },
        body: {
          businessRegistrationNumber: '27AAAAA0000A1Z5',
          taxIdentifier: 'AAAAA0000A',
        },
        scope: mockContainer,
      });
      await updateApplicationHandler(editHttp.req, editHttp.res);
      assert.strictEqual(editHttp.getResponse().statusCode, 200);
      assert.strictEqual(editHttp.getResponse().body.success, true);

      // Manager submits application
      const submitHttp = createMockHttp({
        headers: { Authorization: `Bearer ${managerToken}` },
        scope: mockContainer,
      });
      await submitApplicationHandler(submitHttp.req, submitHttp.res);
      assert.strictEqual(submitHttp.getResponse().statusCode, 200);
      assert.strictEqual(submitHttp.getResponse().body.success, true);
      assert.strictEqual(submitHttp.getResponse().body.merchant.status, 'pending_approval');
    });
  });

  describe('8. Authoritative Role Provenance & Production Membership Verification Matrix', () => {
    const targetMerchId = 'merch_prov_target';
    const targetUserId = 'usr_prov_actor';

    before(() => {
      marketplaceService.merchants.set(targetMerchId, {
        id: targetMerchId,
        name: 'Provenance Test Weaves',
        handle: 'provenance-weaves',
        status: 'draft',
        email: 'prov@crafts.in',
        phone: '+919876543210',
        business_registration_number: '27AAAAA0000A1Z5',
        tax_identifier: 'AAAAA0000A',
        metadata: {},
      });
    });

    it('Case 1: No persisted membership -> fails closed with 403 Forbidden', async () => {
      // User has no row in marketplaceService.members
      const token = JSON.stringify({
        userId: 'usr_no_membership_at_all',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${token}` },
        scope: mockContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('No active merchant membership found'));
    });

    it('Case 2: Membership belonging to a different user -> fails closed with 403 Forbidden', async () => {
      // Member row exists for different user on target merchant
      marketplaceService.members.set('mem_diff_user', {
        id: 'mem_diff_user',
        merchant_id: targetMerchId,
        user_id: 'usr_legit_other_user',
        role: 'owner',
        status: 'active',
      });

      const token = JSON.stringify({
        userId: 'usr_impostor',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${token}` },
        scope: mockContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('No active merchant membership found'));
    });

    it('Case 3: Membership belonging to a different merchant -> fails closed with 403 Forbidden', async () => {
      // Target user is member of merch_other, NOT targetMerchId
      marketplaceService.members.set('mem_other_merchant', {
        id: 'mem_other_merchant',
        merchant_id: 'merch_other_store',
        user_id: 'usr_cross_tenant_actor',
        role: 'owner',
        status: 'active',
      });

      const token = JSON.stringify({
        userId: 'usr_cross_tenant_actor',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${token}` },
        scope: mockContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('No active merchant membership found'));
    });

    it('Case 4: Inactive membership -> fails closed with 403 Forbidden', async () => {
      marketplaceService.members.set('mem_inactive_actor', {
        id: 'mem_inactive_actor',
        merchant_id: targetMerchId,
        user_id: 'usr_inactive_actor',
        role: 'owner',
        status: 'suspended',
      });

      const token = JSON.stringify({
        userId: 'usr_inactive_actor',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active', // Token claims active, but database says suspended!
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${token}` },
        scope: mockContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('membership is not active'));
    });

    it('Case 5: Missing role in membership -> fails closed with 403 Forbidden', async () => {
      marketplaceService.members.set('mem_norole_actor', {
        id: 'mem_norole_actor',
        merchant_id: targetMerchId,
        user_id: 'usr_norole_actor',
        role: undefined,
        status: 'active',
      });

      const token = JSON.stringify({
        userId: 'usr_norole_actor',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${token}` },
        scope: mockContainer,
      });

      await submitApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('membership role is required'));
    });

    it('Case 6: Unknown role in membership -> fails closed with 403 Forbidden', async () => {
      marketplaceService.members.set('mem_unknown_actor', {
        id: 'mem_unknown_actor',
        merchant_id: targetMerchId,
        user_id: 'usr_unknown_actor',
        role: 'contractor',
        status: 'active',
      });

      const token = JSON.stringify({
        userId: 'usr_unknown_actor',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${token}` },
        scope: mockContainer,
      });

      await submitApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('membership role is required'));
    });

    it('Case 7: Token role forged as owner while persisted membership is staff -> strictly overwritten by staff and fails closed with 403', async () => {
      marketplaceService.members.set('mem_staff_forger', {
        id: 'mem_staff_forger',
        merchant_id: targetMerchId,
        user_id: 'usr_staff_forger',
        role: 'staff',
        status: 'active',
      });

      // Token brazenly claims role: 'owner'
      const forgedToken = JSON.stringify({
        userId: 'usr_staff_forger',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${forgedToken}` },
        scope: mockContainer,
      });

      await submitApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(
        res.body.message.includes('Only merchant owner or manager can submit'),
        'Must overwrite token role with persisted staff role and deny submission'
      );
    });

    it('Case 8: Metadata role set to owner while no active membership exists -> findUserById rejects and fails closed with 403', async () => {
      // Identity store findUserById guarantees metadata is ignored
      const store = new InMemoryMerchantIdentityStore();
      const user = await store.findUserById('usr_non_existent');
      assert.strictEqual(user, null);

      const token = JSON.stringify({
        userId: 'usr_metadata_only',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${token}` },
        scope: mockContainer,
      });

      await updateApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('No active merchant membership found'));
    });

    it('Case 9: Membership service unavailable or lookup failure -> fails closed with 403 Forbidden', async () => {
      const failingContainer = {
        resolve: (key: string) => {
          if (key === MARKETPLACE_MODULE) {
            return {
              retrieveMerchant: async () => ({ id: targetMerchId, status: 'draft' }),
              listMerchantMembers: async () => {
                throw new Error('DATABASE_CONNECTION_REFUSED: PostgreSQL connection pool exhausted');
              },
            };
          }
          return null;
        },
      };

      const token = JSON.stringify({
        userId: targetUserId,
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${token}` },
        scope: failingContainer,
      });

      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(
        res.body.message.includes('Failed to verify merchant membership') ||
        res.body.message.includes('No active merchant membership found') ||
        res.body.message.includes('Marketplace service is unavailable'),
        `Expected lookup failure message, got '${res.body.message}'`
      );
    });

    it('Case 10: Valid active owner and manager -> successfully permitted (200 OK)', async () => {
      marketplaceService.members.set('mem_prov_owner', {
        id: 'mem_prov_owner',
        merchant_id: targetMerchId,
        user_id: 'usr_prov_owner',
        role: 'owner',
        status: 'active',
      });

      marketplaceService.members.set('mem_prov_manager', {
        id: 'mem_prov_manager',
        merchant_id: targetMerchId,
        user_id: 'usr_prov_manager',
        role: 'manager',
        status: 'active',
      });

      // 10a. Valid Owner
      const ownerToken = JSON.stringify({
        userId: 'usr_prov_owner',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });
      const ownerHttp = createMockHttp({
        headers: { Authorization: `Bearer ${ownerToken}` },
        scope: mockContainer,
      });
      await getApplicationHandler(ownerHttp.req, ownerHttp.res);
      assert.strictEqual(ownerHttp.getResponse().statusCode, 200);
      assert.strictEqual(ownerHttp.getResponse().body.success, true);

      // 10b. Valid Manager
      const managerToken = JSON.stringify({
        userId: 'usr_prov_manager',
        merchantId: targetMerchId,
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'manager',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });
      const managerHttp = createMockHttp({
        headers: { Authorization: `Bearer ${managerToken}` },
        scope: mockContainer,
      });
      await getApplicationHandler(managerHttp.req, managerHttp.res);
      assert.strictEqual(managerHttp.getResponse().statusCode, 200);
      assert.strictEqual(managerHttp.getResponse().body.success, true);
    });
  });

  describe('9. Fail-Closed Session Resolution & Storage Invariant Matrix (M2-11 Security Correction)', () => {
    let testAdapter: InMemoryMerchantAuthStorageAdapter;
    let testIdentityStore: InMemoryMerchantIdentityStore;
    let originalAdapter: any;
    let originalIdentityStore: any;

    before(() => {
      originalAdapter = (MerchantAuthEngine as any).sessionAdapter;
      originalIdentityStore = (MerchantAuthEngine as any).identityStore;
      testAdapter = new InMemoryMerchantAuthStorageAdapter();
      testIdentityStore = new InMemoryMerchantIdentityStore();
      MerchantAuthEngine.setAdapter(testAdapter);
      MerchantAuthEngine.setIdentityStore(testIdentityStore);
    });

    after(() => {
      if (originalAdapter) MerchantAuthEngine.setAdapter(originalAdapter);
      if (originalIdentityStore) MerchantAuthEngine.setIdentityStore(originalIdentityStore);
    });

    it('Scenario 1: Valid session with valid active persisted membership -> resolves effective role and grants onboarding access', async () => {
      const merch = {
        id: 'merch_s1',
        name: 'Store 1',
        handle: 'store-1',
        status: 'draft' as const,
        email: 's1@store.in',
        phone: '+919876543210',
        businessRegistrationNumber: '27AAAAA0000A1Z5',
        taxIdentifier: 'AAAAA0000A',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (testIdentityStore as any).merchants.set('merch_s1', merch);

      const user = {
        id: 'usr_s1',
        email: 's1@store.in',
        merchantId: 'merch_s1',
        role: 'owner' as const,
        membershipStatus: 'active' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (testIdentityStore as any).users.set('s1@store.in', user);

      marketplaceService.merchants.set('merch_s1', merch);
      marketplaceService.members.set('mem_s1', {
        id: 'mem_s1',
        merchant_id: 'merch_s1',
        user_id: 'usr_s1',
        role: 'owner',
        status: 'active',
      });

      const session = await MerchantAuthEngine.createSession({
        userId: 'usr_s1',
        merchantId: 'merch_s1',
        email: 's1@store.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // 1. Direct Engine resolution verification
      const resolved = await MerchantAuthEngine.resolveSession(session.token);
      assert.ok(resolved, 'Session must resolve');
      assert.strictEqual(resolved.role, 'owner');
      assert.strictEqual(resolved.membershipStatus, 'active');
      assert.strictEqual(resolved.merchantStatus, 'draft');
      assert.ok(resolved.permissions?.includes('settings:manage'));

      // 2. Route execution verification
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${session.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 200);
      assert.strictEqual(http.getResponse().body.success, true);
    });

    it('Scenario 2: Missing live user with forged owner session role -> fails closed (empty role, suspended status, 403 Forbidden)', async () => {
      // merch_s2 exists, but usr_ghost has NO record in identityStore
      (testIdentityStore as any).merchants.set('merch_s2', {
        id: 'merch_s2',
        name: 'Store 2',
        handle: 'store-2',
        status: 'draft',
        email: 's2@store.in',
        phone: '+919876543210',
        businessRegistrationNumber: '27AAAAA0000A1Z5',
        taxIdentifier: 'AAAAA0000A',
        metadata: {},
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      marketplaceService.merchants.set('merch_s2', (testIdentityStore as any).merchants.get('merch_s2'));

      // Forged session in adapter with owner role
      const session = await MerchantAuthEngine.createSession({
        userId: 'usr_ghost_missing_user',
        merchantId: 'merch_s2',
        email: 'ghost@hacker.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // 1. Engine layer invariant: missing live user MUST NOT fall back to session role
      const resolved = await MerchantAuthEngine.resolveSession(session.token);
      assert.ok(resolved, 'DTO returned');
      assert.strictEqual(resolved.role, '', 'Session role must NEVER be trusted for missing live user');
      assert.strictEqual(resolved.membershipStatus, 'suspended', 'Must fail closed to suspended');
      assert.strictEqual(resolved.permissions?.length || 0, 0, 'No permissions permitted for missing user');

      // 2. Route layer verification: blocked with 403 Forbidden
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${session.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
    });

    it('Scenario 3: Live user with no merchant membership -> fails closed (no role, suspended status, 403 Forbidden)', async () => {
      // User exists but has no merchant membership
      (testIdentityStore as any).users.set('nomember@store.in', {
        id: 'usr_nomember',
        email: 'nomember@store.in',
        merchantId: '',
        role: '' as any,
        membershipStatus: 'suspended' as any,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const session = await MerchantAuthEngine.createSession({
        userId: 'usr_nomember',
        merchantId: 'merch_s1',
        email: 'nomember@store.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // 1. Engine layer verification
      const resolved = await MerchantAuthEngine.resolveSession(session.token);
      assert.ok(resolved);
      assert.strictEqual(resolved.role, '');
      assert.strictEqual(resolved.membershipStatus, 'suspended');
      assert.strictEqual(resolved.permissions?.length || 0, 0);

      // 2. Route layer verification
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${session.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
    });

    it('Scenario 4: Live user associated with a different merchant -> fails closed (cross-tenant rejected with 403)', async () => {
      // User belongs to merch_other, NOT merch_s1
      (testIdentityStore as any).users.set('othermerch@store.in', {
        id: 'usr_other_tenant',
        email: 'othermerch@store.in',
        merchantId: 'merch_other_store',
        role: 'owner',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const session = await MerchantAuthEngine.createSession({
        userId: 'usr_other_tenant',
        merchantId: 'merch_s1', // Session attempts cross-tenant access to merch_s1
        email: 'othermerch@store.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // 1. Engine layer verification
      const resolved = await MerchantAuthEngine.resolveSession(session.token);
      assert.ok(resolved);
      assert.strictEqual(resolved.role, '', 'Must receive no role for mismatched merchant');
      assert.strictEqual(resolved.membershipStatus, 'suspended', 'Must fail closed to suspended');
      assert.strictEqual(resolved.permissions?.length || 0, 0);

      // 2. Route layer verification
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${session.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
    });

    it('Scenario 5: Membership lookup failure -> fails closed without crashing (role empty, 403 Forbidden)', async () => {
      // Inject identityStore that throws an unexpected error on lookup
      const failingStore = {
        isHealthy: async () => false,
        findUserByEmail: async () => { throw new Error('Postgres connection pool exhausted'); },
        findUserById: async () => { throw new Error('Postgres connection pool exhausted'); },
        findMerchantById: async () => { throw new Error('Postgres connection pool exhausted'); },
        findMerchantByHandle: async () => null,
        close: async () => {},
      };
      MerchantAuthEngine.setIdentityStore(failingStore as any);

      const session = await MerchantAuthEngine.createSession({
        userId: 'usr_lookup_fail',
        merchantId: 'merch_s1',
        email: 'fail@store.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // 1. Engine layer: must safely catch error and fail closed
      const resolved = await MerchantAuthEngine.resolveSession(session.token);
      assert.ok(resolved, 'DTO returned without throw');
      assert.strictEqual(resolved.role, '', 'Role must fail closed to empty string on lookup failure');
      assert.strictEqual(resolved.membershipStatus, 'suspended');
      assert.strictEqual(resolved.merchantStatus, 'suspended');
      assert.strictEqual(resolved.permissions?.length || 0, 0);

      // 2. Route layer: must reject with 403 Forbidden
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${session.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);

      // Restore working store
      MerchantAuthEngine.setIdentityStore(testIdentityStore);
    });

    it('Scenario 6: Missing persisted role -> fails closed (role empty, zero permissions, 403 Forbidden)', async () => {
      (testIdentityStore as any).users.set('norole@store.in', {
        id: 'usr_norole_actor',
        email: 'norole@store.in',
        merchantId: 'merch_s1',
        role: '' as any, // Missing role in persisted identity
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      const session = await MerchantAuthEngine.createSession({
        userId: 'usr_norole_actor',
        merchantId: 'merch_s1',
        email: 'norole@store.in',
        role: 'owner', // Session claims owner
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // 1. Engine layer: persisted missing role overrides session claim
      const resolved = await MerchantAuthEngine.resolveSession(session.token);
      assert.ok(resolved);
      assert.strictEqual(resolved.role, '');
      assert.strictEqual(resolved.permissions?.length || 0, 0);

      // 2. Route layer
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${session.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
    });

    it('Scenario 7: Token owner role with persisted staff membership -> strictly overwritten by staff and denied application submission/edit', async () => {
      (testIdentityStore as any).users.set('staff@store.in', {
        id: 'usr_staff_actor',
        email: 'staff@store.in',
        merchantId: 'merch_s1',
        role: 'staff',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      marketplaceService.members.set('mem_staff_actor', {
        id: 'mem_staff_actor',
        merchant_id: 'merch_s1',
        user_id: 'usr_staff_actor',
        role: 'staff',
        status: 'active',
      });

      // Forged session token claiming owner role
      const session = await MerchantAuthEngine.createSession({
        userId: 'usr_staff_actor',
        merchantId: 'merch_s1',
        email: 'staff@store.in',
        role: 'owner', // Forged session claim
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // 1. Engine layer: session role is discarded; persisted staff role is enforced
      const resolved = await MerchantAuthEngine.resolveSession(session.token);
      assert.ok(resolved);
      assert.strictEqual(resolved.role, 'staff', 'Effective role must strictly derive from persisted staff role');

      // 2. Route layer: staff role denied application submission
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${session.token}` },
        scope: mockContainer,
      });
      await submitApplicationHandler(http.req, http.res);
      const res = http.getResponse();
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message.includes('Only merchant owner or manager can submit verification application.'));
    });

    it('Scenario 8: Valid owner and manager onboarding access -> both permitted with 200 OK', async () => {
      // 8a. Owner
      (testIdentityStore as any).users.set('validowner@store.in', {
        id: 'usr_valid_owner',
        email: 'validowner@store.in',
        merchantId: 'merch_s1',
        role: 'owner',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      marketplaceService.members.set('mem_valid_owner', {
        id: 'mem_valid_owner',
        merchant_id: 'merch_s1',
        user_id: 'usr_valid_owner',
        role: 'owner',
        status: 'active',
      });

      const ownerSession = await MerchantAuthEngine.createSession({
        userId: 'usr_valid_owner',
        merchantId: 'merch_s1',
        email: 'validowner@store.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const ownerResolved = await MerchantAuthEngine.resolveSession(ownerSession.token);
      assert.ok(ownerResolved);
      assert.strictEqual(ownerResolved.role, 'owner');
      assert.strictEqual(ownerResolved.membershipStatus, 'active');

      const ownerHttp = createMockHttp({
        headers: { Authorization: `Bearer ${ownerSession.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(ownerHttp.req, ownerHttp.res);
      assert.strictEqual(ownerHttp.getResponse().statusCode, 200);
      assert.strictEqual(ownerHttp.getResponse().body.success, true);

      // 8b. Manager
      (testIdentityStore as any).users.set('validmanager@store.in', {
        id: 'usr_valid_manager',
        email: 'validmanager@store.in',
        merchantId: 'merch_s1',
        role: 'manager',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      marketplaceService.members.set('mem_valid_manager', {
        id: 'mem_valid_manager',
        merchant_id: 'merch_s1',
        user_id: 'usr_valid_manager',
        role: 'manager',
        status: 'active',
      });

      const managerSession = await MerchantAuthEngine.createSession({
        userId: 'usr_valid_manager',
        merchantId: 'merch_s1',
        email: 'validmanager@store.in',
        role: 'manager',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      const managerResolved = await MerchantAuthEngine.resolveSession(managerSession.token);
      assert.ok(managerResolved);
      assert.strictEqual(managerResolved.role, 'manager');
      assert.strictEqual(managerResolved.membershipStatus, 'active');

      const managerHttp = createMockHttp({
        headers: { Authorization: `Bearer ${managerSession.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(managerHttp.req, managerHttp.res);
      assert.strictEqual(managerHttp.getResponse().statusCode, 200);
      assert.strictEqual(managerHttp.getResponse().body.success, true);
    });
  });

  // ==========================================
  // 10. Fail-Closed Tenant Authorization & Invariant Verification Suite (15 Scenarios)
  // ==========================================
  describe('10. Fail-Closed Tenant Authorization & Invariant Verification Suite (15 Scenarios)', () => {
    let section10Merchant: any;
    let section10User: any;
    let section10OwnerSession: any;
    let section10ActiveOwnerSession: any;

    before(async () => {
      // Seed a standard merchant and owner
      section10Merchant = {
        id: 'merch_sec10_corp',
        name: 'Section 10 Corp',
        handle: 'section10-corp',
        status: 'draft',
        email: 'owner@sec10.in',
        phone: '+919876543219',
        business_registration_number: 'REG123',
        tax_identifier: 'GST123',
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      marketplaceService.merchants.set('merch_sec10_corp', section10Merchant);
      (MerchantAuthEngine['identityStore'] as any).merchants.set('merch_sec10_corp', section10Merchant);

      section10User = {
        id: 'usr_sec10_owner',
        email: 'owner@sec10.in',
        merchantId: 'merch_sec10_corp',
        role: 'owner',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (MerchantAuthEngine['identityStore'] as any).users.set('usr_sec10_owner', section10User);
      (MerchantAuthEngine['identityStore'] as any).users.set('owner@sec10.in', section10User);

      marketplaceService.members.set('mem_sec10_owner', {
        id: 'mem_sec10_owner',
        merchant_id: 'merch_sec10_corp',
        user_id: 'usr_sec10_owner',
        role: 'owner',
        status: 'active',
      });

      section10OwnerSession = await MerchantAuthEngine.createSession({
        userId: 'usr_sec10_owner',
        merchantId: 'merch_sec10_corp',
        email: 'owner@sec10.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // Seed active merchant and owner for commercial operation tests
      const section10ActiveMerchant = {
        id: 'merch_sec10_active',
        name: 'Section 10 Active Corp',
        handle: 'section10-active-corp',
        status: 'active',
        email: 'owner-active@sec10.in',
        phone: '+919876543218',
        business_registration_number: 'REG456',
        tax_identifier: 'GST456',
        metadata: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      marketplaceService.merchants.set('merch_sec10_active', section10ActiveMerchant);
      (MerchantAuthEngine['identityStore'] as any).merchants.set('merch_sec10_active', section10ActiveMerchant);

      const section10ActiveUser = {
        id: 'usr_sec10_active_owner',
        email: 'owner-active@sec10.in',
        merchantId: 'merch_sec10_active',
        role: 'owner',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (MerchantAuthEngine['identityStore'] as any).users.set('usr_sec10_active_owner', section10ActiveUser);
      (MerchantAuthEngine['identityStore'] as any).users.set('owner-active@sec10.in', section10ActiveUser);

      marketplaceService.members.set('mem_sec10_active_owner', {
        id: 'mem_sec10_active_owner',
        merchant_id: 'merch_sec10_active',
        user_id: 'usr_sec10_active_owner',
        role: 'owner',
        status: 'active',
      });

      section10ActiveOwnerSession = await MerchantAuthEngine.createSession({
        userId: 'usr_sec10_active_owner',
        merchantId: 'merch_sec10_active',
        email: 'owner-active@sec10.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });
    });

    // 1. Marketplace service unavailable
    it('1. Marketplace service unavailable -> fails closed with 403 Forbidden', async () => {
      const containerWithoutMarketplace = {
        resolve: (_key: string) => null,
      };
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: containerWithoutMarketplace,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /Marketplace service is unavailable/i);
    });

    // 2. Membership verification method missing
    it('2. Membership verification method missing -> fails closed with 403 Forbidden', async () => {
      const serviceWithoutVerify = {
        ...marketplaceService,
        verifyActiveMembership: undefined,
      };
      const container = {
        resolve: (key: string) => (key === MARKETPLACE_MODULE ? serviceWithoutVerify : null),
      };
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10ActiveOwnerSession.token}` },
        scope: container,
      });
      await getMerchantProductsHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /verification is unavailable/i);
    });

    // 3. Membership verification throws
    it('3. Membership verification throws -> fails closed with 403 Forbidden', async () => {
      const serviceThrowingVerify = {
        ...marketplaceService,
        verifyActiveMembership: async () => {
          throw new Error('Database connection pool timeout');
        },
      };
      const container = {
        resolve: (key: string) => (key === MARKETPLACE_MODULE ? serviceThrowingVerify : null),
      };
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10ActiveOwnerSession.token}` },
        scope: container,
      });
      await getMerchantProductsHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /Failed to verify merchant membership/i);
    });

    // 4. Membership verification returns invalid result
    it('4. Membership verification returns invalid result -> fails closed with 403 Forbidden', async () => {
      const serviceInvalidResult = {
        ...marketplaceService,
        verifyActiveMembership: async () => ({
          valid: false,
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Membership revoked by super admin',
        }),
      };
      const container = {
        resolve: (key: string) => (key === MARKETPLACE_MODULE ? serviceInvalidResult : null),
      };
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10ActiveOwnerSession.token}` },
        scope: container,
      });
      await getMerchantProductsHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /Membership revoked by super admin/i);
    });

    // 5. Merchant lookup method missing
    it('5. Merchant lookup method missing -> fails closed with 403 Forbidden', async () => {
      const serviceWithoutRetrieve = {
        ...marketplaceService,
        retrieveMerchant: undefined,
      };
      const container = {
        resolve: (key: string) => (key === MARKETPLACE_MODULE ? serviceWithoutRetrieve : null),
      };
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: container,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /Merchant lookup is unavailable/i);
    });

    // 6. Merchant lookup throws
    it('6. Merchant lookup throws -> fails closed with 403 Forbidden', async () => {
      const serviceThrowingRetrieve = {
        ...marketplaceService,
        retrieveMerchant: async () => {
          throw new Error('Postgres deadlock in merchant retrieval');
        },
      };
      const container = {
        resolve: (key: string) => (key === MARKETPLACE_MODULE ? serviceThrowingRetrieve : null),
      };
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: container,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /Failed to retrieve merchant record/i);
    });

    // 7. Merchant record missing
    it('7. Merchant record missing -> fails closed with 403 Forbidden', async () => {
      const serviceMissingRecord = {
        ...marketplaceService,
        retrieveMerchant: async () => null,
      };
      const container = {
        resolve: (key: string) => (key === MARKETPLACE_MODULE ? serviceMissingRecord : null),
      };
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: container,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /does not exist/i);
    });

    // 8. Merchant/user ID mismatch
    it('8. Merchant/user ID mismatch -> fails closed with 403 Forbidden', async () => {
      const serviceMismatch = {
        ...marketplaceService,
        retrieveMerchant: async () => section10Merchant,
        listMerchantMembers: async () => [
          {
            id: 'mem_other',
            merchant_id: 'merch_different',
            user_id: 'usr_different',
            role: 'owner',
            status: 'active',
          },
        ],
      };
      const container = {
        resolve: (key: string) => (key === MARKETPLACE_MODULE ? serviceMismatch : null),
      };
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: container,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /identity mismatch/i);
    });

    // 9. Missing or malformed token claims
    it('9. Missing or malformed token claims -> fails closed with 401/403', async () => {
      // 9a. Malformed token prefix
      const httpMalformed = createMockHttp({
        headers: { Authorization: 'Bearer merchant_token:' },
        scope: mockContainer,
      });
      await getApplicationHandler(httpMalformed.req, httpMalformed.res);
      assert.strictEqual(httpMalformed.getResponse().statusCode, 401);

      // 9b. Missing merchantId claim in session token
      const sessionNoMerchant = await MerchantAuthEngine.createSession({
        userId: 'usr_sec10_owner',
        merchantId: '', // Empty merchant ID
        email: 'owner@sec10.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });
      const httpNoMerchant = createMockHttp({
        headers: { Authorization: `Bearer ${sessionNoMerchant.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(httpNoMerchant.req, httpNoMerchant.res);
      assert.strictEqual(httpNoMerchant.getResponse().statusCode, 403);
      assert.match(httpNoMerchant.getResponse().body.message, /No merchant associated with session/i);
    });

    // 10. Forged owner role with persisted staff membership
    it('10. Forged owner role with persisted staff membership -> derives effective role from DB and rejects forbidden mutation', async () => {
      // User is persisted in database as 'staff'
      const staffUser = {
        id: 'usr_sec10_staff',
        email: 'staffactor@sec10.in',
        merchantId: 'merch_sec10_corp',
        role: 'staff',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (MerchantAuthEngine['identityStore'] as any).users.set('usr_sec10_staff', staffUser);
      (MerchantAuthEngine['identityStore'] as any).users.set('staffactor@sec10.in', staffUser);

      marketplaceService.members.set('mem_sec10_staff', {
        id: 'mem_sec10_staff',
        merchant_id: 'merch_sec10_corp',
        user_id: 'usr_sec10_staff',
        role: 'staff',
        status: 'active',
      });

      // Token client attempts to claim 'owner' role
      const forgedToken = 'merchant_token:usr_sec10_staff:merch_sec10_corp:owner:active:draft';
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${forgedToken}` },
        scope: mockContainer,
        body: { notes: 'Malicious update by staff masquerading as owner' },
      });

      // Attempt to update application (which requires owner/admin)
      await updateApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /Only merchant owner or manager|Insufficient privileges/i);
    });

    // 11. Suspended membership
    it('11. Suspended membership -> fails closed with 403 Forbidden', async () => {
      // Set member status to suspended
      marketplaceService.members.set('mem_sec10_owner', {
        ...marketplaceService.members.get('mem_sec10_owner'),
        status: 'suspended',
      });
      (MerchantAuthEngine['identityStore'] as any).users.set('usr_sec10_owner', {
        ...section10User,
        membershipStatus: 'suspended',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /membership is not active/i);

      // Restore active member status
      marketplaceService.members.set('mem_sec10_owner', {
        ...marketplaceService.members.get('mem_sec10_owner'),
        status: 'active',
      });
      (MerchantAuthEngine['identityStore'] as any).users.set('usr_sec10_owner', section10User);
    });

    // 12. Suspended merchant
    it('12. Suspended merchant -> fails closed with 403 Forbidden', async () => {
      // Set merchant status to suspended
      marketplaceService.merchants.set('merch_sec10_corp', {
        ...section10Merchant,
        status: 'suspended',
      });
      (MerchantAuthEngine['identityStore'] as any).merchants.set('merch_sec10_corp', {
        ...section10Merchant,
        status: 'suspended',
      });

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /Merchant account is suspended/i);

      // Restore draft merchant status
      marketplaceService.merchants.set('merch_sec10_corp', section10Merchant);
      (MerchantAuthEngine['identityStore'] as any).merchants.set('merch_sec10_corp', section10Merchant);
    });

    // 13. Valid active owner and manager onboarding access
    it('13. Valid active owner and manager onboarding access -> 200 OK', async () => {
      // 13a. Owner
      const httpOwner = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(httpOwner.req, httpOwner.res);
      assert.strictEqual(httpOwner.getResponse().statusCode, 200);
      assert.strictEqual(httpOwner.getResponse().body.success, true);
      assert.strictEqual(httpOwner.getResponse().body.merchant.id, 'merch_sec10_corp');

      // 13b. Manager
      const mgrUser = {
        id: 'usr_sec10_mgr',
        email: 'mgr@sec10.in',
        merchantId: 'merch_sec10_corp',
        role: 'manager',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      (MerchantAuthEngine['identityStore'] as any).users.set('usr_sec10_mgr', mgrUser);
      (MerchantAuthEngine['identityStore'] as any).users.set('mgr@sec10.in', mgrUser);

      marketplaceService.members.set('mem_sec10_mgr', {
        id: 'mem_sec10_mgr',
        merchant_id: 'merch_sec10_corp',
        user_id: 'usr_sec10_mgr',
        role: 'manager',
        status: 'active',
      });
      const mgrSession = await MerchantAuthEngine.createSession({
        userId: 'usr_sec10_mgr',
        merchantId: 'merch_sec10_corp',
        email: 'mgr@sec10.in',
        role: 'manager',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });
      const httpMgr = createMockHttp({
        headers: { Authorization: `Bearer ${mgrSession.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(httpMgr.req, httpMgr.res);
      assert.strictEqual(httpMgr.getResponse().statusCode, 200);
      assert.strictEqual(httpMgr.getResponse().body.success, true);
    });

    // 14. Draft/pending-approval merchant blocked from commercial operations
    it('14. Draft/pending-approval merchant blocked from commercial operations -> 403 Forbidden', async () => {
      // Mock verifyActiveMembership returning 403 for draft merchant
      const serviceWithVerify = {
        ...marketplaceService,
        verifyActiveMembership: async (_userId: string, _merchantId: string) => ({
          valid: false,
          statusCode: 403,
          error: 'FORBIDDEN',
          message: "Merchant account is not active (current status: 'draft'). Access denied.",
        }),
      };
      const container = {
        resolve: (key: string) => (key === MARKETPLACE_MODULE ? serviceWithVerify : null),
      };

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${section10OwnerSession.token}` },
        scope: container,
      });
      await getMerchantProductsHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.match(http.getResponse().body.message, /Merchant account is not active/i);
    });

    // 15. Active merchant permitted to use commercial operations
    it('15. Active merchant permitted to use commercial operations -> 200 OK', async () => {
      // Set merchant status to active in identity store and marketplace service
      const activeMerch = { ...section10Merchant, status: 'active' };
      marketplaceService.merchants.set('merch_sec10_corp', activeMerch);
      (MerchantAuthEngine['identityStore'] as any).merchants.set('merch_sec10_corp', activeMerch);

      const activeSession = await MerchantAuthEngine.createSession({
        userId: 'usr_sec10_owner',
        merchantId: 'merch_sec10_corp',
        email: 'owner@sec10.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Mock verifyActiveMembership returning valid: true for active merchant
      const serviceWithVerify = {
        ...marketplaceService,
        verifyActiveMembership: async (_userId: string, _merchantId: string) => ({
          valid: true,
          statusCode: 200,
          role: 'owner',
        }),
      };
      const container = {
        resolve: (key: string) => {
          if (key === MARKETPLACE_MODULE) return serviceWithVerify;
          if (key === 'query') {
            return {
              graph: async () => ({
                data: [{ id: 'prod_1', title: 'Ateevra Silk Scarf', status: 'published' }],
              }),
            };
          }
          return null;
        },
      };

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${activeSession.token}` },
        scope: container,
      });
      await getMerchantProductsHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 200);
      assert.strictEqual(http.getResponse().body.success, true);
      assert.strictEqual(http.getResponse().body.products.length, 1);
    });
  });

  // =========================================================================
  // Section 11: Multi-Merchant Membership Isolation and Fail-Closed Verification
  // =========================================================================
  describe('11. Multi-Merchant Membership Isolation & Authorization Provenance', () => {
    const multiUserId = 'usr_multi_tenant_1';
    const merchAId = 'merch_multi_alpha';
    const merchBId = 'merch_multi_beta';

    const merchantAlpha: any = {
      id: merchAId,
      name: 'Alpha Crafts',
      handle: 'alpha-crafts',
      status: 'draft',
      email: 'alpha@multi.in',
      phone: '+919876543201',
      businessRegistrationNumber: '07AAAAA0000A1Z5',
      taxIdentifier: 'AAAAA0000A',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const merchantBeta: any = {
      id: merchBId,
      name: 'Beta Textiles',
      handle: 'beta-textiles',
      status: 'draft',
      email: 'beta@multi.in',
      phone: '+919876543202',
      businessRegistrationNumber: '27AAAAA0000A1Z5',
      taxIdentifier: 'AAAAA0000B',
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let sessionAlpha: any;
    let sessionBeta: any;

    beforeEach(async () => {
      // Setup both merchants in memory store and marketplace service
      marketplaceService.merchants.set(merchAId, { ...merchantAlpha });
      marketplaceService.merchants.set(merchBId, { ...merchantBeta });

      const store = MerchantAuthEngine['identityStore'] as any;
      store.merchants.set(merchAId, { ...merchantAlpha });
      store.merchants.set(merchBId, { ...merchantBeta });

      // Add user record
      store.users.set('user@multi.in', {
        id: multiUserId,
        email: 'user@multi.in',
        merchantId: merchAId,
        role: 'owner',
        membershipStatus: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // Clear existing members for this user and add two distinct memberships:
      // Merchant A -> Role: 'owner', Status: 'active'
      // Merchant B -> Role: 'staff', Status: 'active'
      for (const [key, mem] of store.members.entries()) {
        if (mem.userId === multiUserId) store.members.delete(key);
      }
      for (const [key, mem] of marketplaceService.members.entries()) {
        if (mem.user_id === multiUserId) marketplaceService.members.delete(key);
      }

      store.members.set('mem_multi_a', {
        id: 'mem_multi_a',
        merchantId: merchAId,
        userId: multiUserId,
        role: 'owner',
        status: 'active',
      });
      marketplaceService.members.set('mem_multi_a', {
        id: 'mem_multi_a',
        merchant_id: merchAId,
        user_id: multiUserId,
        role: 'owner',
        status: 'active',
      });

      store.members.set('mem_multi_b', {
        id: 'mem_multi_b',
        merchantId: merchBId,
        userId: multiUserId,
        role: 'staff',
        status: 'active',
      });
      marketplaceService.members.set('mem_multi_b', {
        id: 'mem_multi_b',
        merchant_id: merchBId,
        user_id: multiUserId,
        role: 'staff',
        status: 'active',
      });

      // Create session for Merchant A
      sessionAlpha = await MerchantAuthEngine.createSession({
        userId: multiUserId,
        merchantId: merchAId,
        email: 'user@multi.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // Create session for Merchant B
      sessionBeta = await MerchantAuthEngine.createSession({
        userId: multiUserId,
        merchantId: merchBId,
        email: 'user@multi.in',
        role: 'staff',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });
    });

    // 1. Valid session for merchant A resolves exact Merchant A role ('owner') and permits application update
    it('1. Valid session for Merchant A resolves exact Merchant A role (owner) and permits update', async () => {
      const resolved = await MerchantAuthEngine.resolveSession(sessionAlpha.token);
      assert.ok(resolved);
      assert.strictEqual(resolved.merchantId, merchAId);
      assert.strictEqual(resolved.role, 'owner');
      assert.strictEqual(resolved.membershipStatus, 'active');

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${sessionAlpha.token}` },
        body: { name: 'Alpha Crafts Updated' },
        scope: mockContainer,
      });
      await updateApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 200);
      assert.strictEqual(http.getResponse().body.success, true);
    });

    // 2. Valid session for merchant B resolves exact Merchant B role ('staff') and blocks application update
    it('2. Valid session for Merchant B resolves exact Merchant B role (staff) and blocks update -> 403', async () => {
      const resolved = await MerchantAuthEngine.resolveSession(sessionBeta.token);
      assert.ok(resolved);
      assert.strictEqual(resolved.merchantId, merchBId);
      assert.strictEqual(resolved.role, 'staff');
      assert.strictEqual(resolved.membershipStatus, 'active');

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${sessionBeta.token}` },
        body: { name: 'Beta Textiles Updated' },
        scope: mockContainer,
      });
      await updateApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.strictEqual(http.getResponse().body.error, 'FORBIDDEN');
      assert.match(http.getResponse().body.message, /Only merchant owner or manager can edit onboarding application/i);
    });

    // 3. Cross-merchant request: Session for merchant A with merchant B in payload/query -> 403 Forbidden
    it('3. Cross-merchant request: Session for Merchant A with merchant B ID -> 403 Forbidden', async () => {
      const http = createMockHttp({
        headers: { Authorization: `Bearer ${sessionAlpha.token}` },
        body: { merchant_id: merchBId, name: 'Hacked Beta' },
        scope: mockContainer,
      });
      await updateApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
      assert.strictEqual(http.getResponse().body.error, 'FORBIDDEN');
      assert.match(http.getResponse().body.message, /FORGED_MERCHANT_ID/i);
    });

    // 4. Suspended membership in merchant A while merchant B remains active
    it('4. Suspended membership in Merchant A blocks Merchant A session while Merchant B remains active', async () => {
      // Suspend membership in Merchant A
      const store = MerchantAuthEngine['identityStore'] as any;
      const memA = store.members.get('mem_multi_a');
      memA.status = 'suspended';
      const liveMemA = marketplaceService.members.get('mem_multi_a');
      if (liveMemA) liveMemA.status = 'suspended';

      // Merchant A session resolution must fail closed to 'suspended'
      const resolvedA = await MerchantAuthEngine.resolveSession(sessionAlpha.token);
      assert.ok(resolvedA);
      assert.strictEqual(resolvedA.membershipStatus, 'suspended');

      // Attempting to access Merchant A onboarding endpoint must return 403 Forbidden
      const httpA = createMockHttp({
        headers: { Authorization: `Bearer ${sessionAlpha.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(httpA.req, httpA.res);
      assert.strictEqual(httpA.getResponse().statusCode, 403);
      assert.match(httpA.getResponse().body.message, /Merchant membership is not active/i);

      // Merchant B session remains fully active and can still read application
      const resolvedB = await MerchantAuthEngine.resolveSession(sessionBeta.token);
      assert.ok(resolvedB);
      assert.strictEqual(resolvedB.membershipStatus, 'active');
      assert.strictEqual(resolvedB.role, 'staff');

      const httpB = createMockHttp({
        headers: { Authorization: `Bearer ${sessionBeta.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(httpB.req, httpB.res);
      assert.strictEqual(httpB.getResponse().statusCode, 200);
      assert.strictEqual(httpB.getResponse().body.success, true);
    });

    // 5. Missing membership for the requested merchant -> fails closed
    it('5. Session for unassociated merchant returns no role, suspended status, and 403 Forbidden', async () => {
      const nonAssociatedMerchantId = 'merch_unassociated_xyz';
      marketplaceService.merchants.set(nonAssociatedMerchantId, {
        id: nonAssociatedMerchantId,
        name: 'XYZ Corp',
        handle: 'xyz-corp',
        status: 'draft',
      });
      (MerchantAuthEngine['identityStore'] as any).merchants.set(nonAssociatedMerchantId, {
        id: nonAssociatedMerchantId,
        name: 'XYZ Corp',
        handle: 'xyz-corp',
        status: 'draft',
      });

      const rogueSession = await MerchantAuthEngine.createSession({
        userId: multiUserId,
        merchantId: nonAssociatedMerchantId,
        email: 'user@multi.in',
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });

      // resolveSession should fail closed: role is empty, membershipStatus is suspended
      const resolvedRogue = await MerchantAuthEngine.resolveSession(rogueSession.token);
      assert.ok(resolvedRogue);
      assert.strictEqual(resolvedRogue.role, '');
      assert.strictEqual(resolvedRogue.membershipStatus, 'suspended');

      const http = createMockHttp({
        headers: { Authorization: `Bearer ${rogueSession.token}` },
        scope: mockContainer,
      });
      await getApplicationHandler(http.req, http.res);
      assert.strictEqual(http.getResponse().statusCode, 403);
    });

    // 6. verifyActiveMembership strictly checks both userId and merchantId and validates role
    it('6. verifyActiveMembership strictly checks both userId and merchantId and validates role', async () => {
      const fakeMarketplace: any = {
        retrieveMerchant: async (id: string) => {
          if (id === 'merch_active_1') return { id: 'merch_active_1', status: 'active' };
          return null;
        },
        listMerchantMembers: async (filter: any) => {
          if (filter.merchant_id === 'merch_active_1' && filter.user_id === 'usr_correct') {
            return [{ id: 'm1', merchant_id: 'merch_active_1', user_id: 'usr_correct', role: 'owner', status: 'active' }];
          }
          return [];
        },
      };

      const verifyFn = MarketplaceModuleService.prototype.verifyActiveMembership;

      // Case A: Correct user and merchant -> 200 OK
      const validRes = await verifyFn.call(fakeMarketplace, 'usr_correct', 'merch_active_1');
      assert.strictEqual(validRes.valid, true);
      assert.strictEqual(validRes.statusCode, 200);
      assert.strictEqual(validRes.role, 'owner');

      // Case B: Wrong merchant requested -> 403 Forbidden
      const wrongMerchRes = await verifyFn.call(fakeMarketplace, 'usr_correct', 'merch_other');
      assert.strictEqual(wrongMerchRes.valid, false);
      assert.strictEqual(wrongMerchRes.statusCode, 403);

      // Case C: Identity mismatch returned by underlying list -> 403 Forbidden
      fakeMarketplace.listMerchantMembers = async () => [
        { id: 'm1', merchant_id: 'merch_active_1', user_id: 'usr_other', role: 'owner', status: 'active' }
      ];
      const mismatchRes = await verifyFn.call(fakeMarketplace, 'usr_correct', 'merch_active_1');
      assert.strictEqual(mismatchRes.valid, false);
      assert.strictEqual(mismatchRes.statusCode, 403);
      assert.match(mismatchRes.message!, /Merchant membership identity mismatch/i);

      // Case D: Invalid/unknown role in persisted membership -> 403 Forbidden
      fakeMarketplace.listMerchantMembers = async () => [
        { id: 'm1', merchant_id: 'merch_active_1', user_id: 'usr_correct', role: 'super_hacker', status: 'active' }
      ];
      const invalidRoleRes = await verifyFn.call(fakeMarketplace, 'usr_correct', 'merch_active_1');
      assert.strictEqual(invalidRoleRes.valid, false);
      assert.strictEqual(invalidRoleRes.statusCode, 403);
      assert.match(invalidRoleRes.message!, /invalid or unknown role/i);
    });
  });
});
