import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  BackendMarketplaceGuard,
  MARKETPLACE_MODULE,
  Merchant,
  MerchantMember,
} from './modules/marketplace/index.js';

import type { AuthenticatedSessionDto } from '@ecom/types';
import { GET as customerLookupRoute } from './api/store/customers/lookup/route.js';
import { POST as customerSaveRoute } from './api/store/customers/route.js';



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

  describe('7. Backend Identity & Security Boundary Isolation Matrix', () => {
    it('Customer session is permitted to access storefront boundary', () => {
      const session: AuthenticatedSessionDto = {
        userId: 'cus_customer_1',
        actorType: 'customer',
        authBoundary: 'store',
      };
      const res = BackendMarketplaceGuard.assertBoundaryAccess(session, 'store');
      assert.equal(res.allowed, true);
      assert.equal(res.statusCode, 200);
    });

    it('NEGATIVE: Customer session is rejected (403 FORBIDDEN) from merchant boundary', () => {
      const session: AuthenticatedSessionDto = {
        userId: 'cus_customer_1',
        actorType: 'customer',
        authBoundary: 'store',
      };
      const res = BackendMarketplaceGuard.assertBoundaryAccess(session, 'merchant');
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.error, 'FORBIDDEN');
      assert.ok(res.message?.includes('Customer credentials cannot access merchant or admin boundaries'));
    });

    it('NEGATIVE: Customer session is rejected (403 FORBIDDEN) from admin boundary', () => {
      const session: AuthenticatedSessionDto = {
        userId: 'cus_customer_1',
        actorType: 'customer',
        authBoundary: 'store',
      };
      const res = BackendMarketplaceGuard.assertBoundaryAccess(session, 'admin');
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.error, 'FORBIDDEN');
    });

    it('Merchant user session is permitted to access merchant boundary', () => {
      const session: AuthenticatedSessionDto = {
        userId: 'usr_seller_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        merchantId: 'merch_virasat',
      };
      const res = BackendMarketplaceGuard.assertBoundaryAccess(session, 'merchant');
      assert.equal(res.allowed, true);
      assert.equal(res.statusCode, 200);
    });

    it('NEGATIVE: Merchant user session is rejected (403 FORBIDDEN) from admin boundary', () => {
      const session: AuthenticatedSessionDto = {
        userId: 'usr_seller_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        merchantId: 'merch_virasat',
      };
      const res = BackendMarketplaceGuard.assertBoundaryAccess(session, 'admin');
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.error, 'FORBIDDEN');
      assert.ok(res.message?.includes('Merchant credentials cannot access platform admin boundary'));
    });

    it('NEGATIVE: Merchant user session is blocked (403 FORBIDDEN) from performing storefront customer mutations directly', () => {
      const session: AuthenticatedSessionDto = {
        userId: 'usr_seller_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        merchantId: 'merch_virasat',
      };
      const res = BackendMarketplaceGuard.assertBoundaryAccess(session, 'store');
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.error, 'FORBIDDEN');
    });

    it('Super Admin session is permitted to access admin boundary', () => {
      const session: AuthenticatedSessionDto = {
        userId: 'usr_admin_1',
        actorType: 'super_admin',
        authBoundary: 'admin',
      };
      const res = BackendMarketplaceGuard.assertBoundaryAccess(session, 'admin');
      assert.equal(res.allowed, true);
      assert.equal(res.statusCode, 200);
    });

    it('NEGATIVE: Missing or null session is rejected with 401 UNAUTHORIZED', () => {
      const res = BackendMarketplaceGuard.assertBoundaryAccess(null, 'merchant');
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 401);
      assert.equal(res.error, 'UNAUTHORIZED');
    });
  });

  describe('8. Merchant Membership & Account Lifecycle Verification', () => {
    it('approves access when member is active and merchant account is active', () => {
      const res = BackendMarketplaceGuard.assertMerchantActiveMembership({
        membershipStatus: 'active',
        merchantStatus: 'active',
      });
      assert.equal(res.allowed, true);
      assert.equal(res.statusCode, 200);
    });

    it('NEGATIVE: rejects access (403 FORBIDDEN) when member status is invited', () => {
      const res = BackendMarketplaceGuard.assertMerchantActiveMembership({
        membershipStatus: 'invited',
        merchantStatus: 'active',
      });
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.error, 'FORBIDDEN');
    });

    it('NEGATIVE: rejects access (403 FORBIDDEN) when member status is suspended', () => {
      const res = BackendMarketplaceGuard.assertMerchantActiveMembership({
        membershipStatus: 'suspended',
        merchantStatus: 'active',
      });
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.error, 'FORBIDDEN');
    });

    it('NEGATIVE: rejects access (403 FORBIDDEN) when merchant account is suspended', () => {
      const res = BackendMarketplaceGuard.assertMerchantActiveMembership({
        membershipStatus: 'active',
        merchantStatus: 'suspended',
      });
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.error, 'FORBIDDEN');
    });

    it('NEGATIVE: rejects access (403 FORBIDDEN) when merchant account is draft or rejected', () => {
      const resDraft = BackendMarketplaceGuard.assertMerchantActiveMembership({
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });
      assert.equal(resDraft.allowed, false);
      assert.equal(resDraft.statusCode, 403);

      const resRejected = BackendMarketplaceGuard.assertMerchantActiveMembership({
        membershipStatus: 'active',
        merchantStatus: 'rejected',
      });
      assert.equal(resRejected.allowed, false);
      assert.equal(resRejected.statusCode, 403);
    });
  });

  describe('9. Extensible Permission-Based RBAC & Reviewer Roles', () => {
    it('Super Admin has all permissions globally', () => {
      const adminSession: AuthenticatedSessionDto = {
        userId: 'usr_admin_1',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
      };
      assert.equal(BackendMarketplaceGuard.assertPermission(adminSession, 'catalog:moderate').allowed, true);
      assert.equal(BackendMarketplaceGuard.assertPermission(adminSession, 'financials:payout').allowed, true);
    });

    it('Merchant owner has all merchant permissions', () => {
      const ownerSession: AuthenticatedSessionDto = {
        userId: 'usr_owner_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        merchantId: 'merch_100',
      };
      assert.equal(BackendMarketplaceGuard.assertPermission(ownerSession, 'catalog:write').allowed, true);
      assert.equal(BackendMarketplaceGuard.assertPermission(ownerSession, 'inventory:adjust').allowed, true);
    });

    it('Platform Reviewer role with catalog:moderate is permitted', () => {
      const reviewerSession: AuthenticatedSessionDto = {
        userId: 'usr_rev_1',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'reviewer',
        permissions: ['catalog:read', 'catalog:moderate'],
      };
      const res = BackendMarketplaceGuard.assertPermission(reviewerSession, 'catalog:moderate');
      assert.equal(res.allowed, true);
      assert.equal(res.statusCode, 200);
    });

    it('NEGATIVE: Platform Reviewer without financials:payout is blocked (403 FORBIDDEN)', () => {
      const reviewerSession: AuthenticatedSessionDto = {
        userId: 'usr_rev_1',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'reviewer',
        permissions: ['catalog:read', 'catalog:moderate'],
      };
      const res = BackendMarketplaceGuard.assertPermission(reviewerSession, 'financials:payout');
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
      assert.equal(res.error, 'FORBIDDEN');
    });

    it('NEGATIVE: Merchant staff without catalog:delete is blocked (403 FORBIDDEN)', () => {
      const staffSession: AuthenticatedSessionDto = {
        userId: 'usr_staff_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'staff',
        merchantId: 'merch_100',
        permissions: ['catalog:read', 'orders:read'],
      };
      const res = BackendMarketplaceGuard.assertPermission(staffSession, 'catalog:delete');
      assert.equal(res.allowed, false);
      assert.equal(res.statusCode, 403);
    });
  });

  describe('10. Dual-Transport Token Extraction (React Native & Browser)', () => {
    it('extracts Bearer token from Authorization header for React Native mobile app', () => {
      const headers = { authorization: 'Bearer mobile_jwt_999' };
      const extracted = BackendMarketplaceGuard.extractAuthToken(headers, null);
      assert.equal(extracted.transport, 'bearer');
      assert.equal(extracted.token, 'mobile_jwt_999');
    });

    it('extracts customer session token from Cookie header for browser', () => {
      const cookieHeader = 'ecom_session_token=browser_sess_123; other=val';
      const extracted = BackendMarketplaceGuard.extractAuthToken({}, cookieHeader);
      assert.equal(extracted.transport, 'cookie');
      assert.equal(extracted.token, 'browser_sess_123');
    });

    it('extracts merchant session cookie for merchant portal', () => {
      const cookieHeader = 'ecom_merchant_sess=merch_cookie_456';
      const extracted = BackendMarketplaceGuard.extractAuthToken({}, cookieHeader);
      assert.equal(extracted.transport, 'cookie');
      assert.equal(extracted.token, 'merch_cookie_456');
    });

    it('returns null when neither header nor cookie is present', () => {
      const extracted = BackendMarketplaceGuard.extractAuthToken({}, null);
      assert.equal(extracted.transport, null);
      assert.equal(extracted.token, null);
    });
  });

  describe('11. Customer Store API Security Controls (M2-02 Verification)', () => {
    const validS2S = process.env.S2S_AUTH_TOKEN || 'ecom-s2s-dev-token-secret';

    const mockCustomerModule = {
      async listCustomers(filter: { phone: string }) {
        if (filter.phone === '+919876543210') {
          return [
            {
              id: 'cus_existing_123',
              phone: '+919876543210',
              first_name: 'Priya',
              last_name: 'Sharma',
              email: 'priya@example.com',
              metadata: { gender: 'female', date_of_birth: '1995-05-15' },
              created_at: new Date('2026-01-01'),
            },
          ];
        }
        return [];
      },
      async createCustomers(data: any) {
        return {
          id: 'cus_new_456',
          ...data,
          created_at: new Date(),
        };
      },
      async updateCustomers(id: string, data: any) {
        return {
          id,
          phone: '+919876543210',
          first_name: data.first_name || 'Priya',
          last_name: data.last_name || 'Sharma',
          email: data.email || 'priya@example.com',
          metadata: data.metadata || {},
          created_at: new Date('2026-01-01'),
        };
      },
    };

    function createMockContext(options: {
      headers?: Record<string, string>;
      query?: Record<string, string>;
      body?: any;
    }) {
      const req: any = {
        headers: options.headers || {},
        query: options.query || {},
        body: options.body || {},
        scope: {
          resolve(token: string) {
            if (token === 'customer') return mockCustomerModule;
            throw new Error(`Unknown token: ${token}`);
          },
        },
      };

      const res: any = {
        statusCode: 200,
        body: null,
        status(code: number) {
          this.statusCode = code;
          return this;
        },
        json(data: any) {
          this.body = data;
          return this;
        },
      };

      return { req, res };
    }

    // 11.1 Customer Enumeration & PII Leakage Protection
    it('NEGATIVE: GET /store/customers/lookup rejects unauthenticated callers with 401 UNAUTHORIZED (prevents public enumeration)', async () => {
      const { req, res } = createMockContext({
        query: { phone: '+919876543210' },
      });

      await customerLookupRoute(req, res);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.error, 'UNAUTHORIZED');
      assert.equal(res.body.exists, false);
    });

    it('NEGATIVE: GET /store/customers/lookup rejects invalid S2S token with 401 UNAUTHORIZED', async () => {
      const { req, res } = createMockContext({
        headers: { 'x-s2s-auth-token': 'wrong-secret-token' },
        query: { phone: '+919876543210' },
      });

      await customerLookupRoute(req, res);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.error, 'UNAUTHORIZED');
    });

    it('GET /store/customers/lookup with valid S2S returns boolean existence and ZERO PII (never leaks customer record)', async () => {
      const { req, res } = createMockContext({
        headers: { 'x-s2s-auth-token': validS2S },
        query: { phone: '+919876543210' },
      });

      await customerLookupRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.exists, true);
      // Strictly verify ZERO PII is leaked:
      assert.equal(res.body.customer, undefined);
      assert.equal(res.body.email, undefined);
      assert.equal(res.body.firstName, undefined);
      assert.equal(res.body.lastName, undefined);
    });

    it('GET /store/customers/lookup returns exists: false for non-existent phone', async () => {
      const { req, res } = createMockContext({
        headers: { 'x-s2s-auth-token': validS2S },
        query: { phone: '+910000000000' },
      });

      await customerLookupRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.exists, false);
    });

    it('NEGATIVE: GET /store/customers/lookup rejects missing phone with 400 Bad Request', async () => {
      const { req, res } = createMockContext({
        headers: { 'x-s2s-auth-token': validS2S },
        query: { phone: '' },
      });

      await customerLookupRoute(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.error, 'PHONE_REQUIRED');
    });

    // 11.2 Customer Mutation & Account Takeover Protection
    it('NEGATIVE: POST /store/customers blocks unauthenticated callers with 401 UNAUTHORIZED (prevents account takeover)', async () => {
      const { req, res } = createMockContext({
        body: {
          mobile: '+919876543210',
          email: 'attacker@evil.com',
          firstName: 'Attacker',
        },
      });

      await customerSaveRoute(req, res);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.error, 'UNAUTHORIZED');
    });

    it('NEGATIVE: POST /store/customers rejects invalid gender with 400 Bad Request', async () => {
      const { req, res } = createMockContext({
        headers: { 'x-s2s-auth-token': validS2S },
        body: {
          mobile: '+919876543210',
          gender: 'malicious_payload',
        },
      });

      await customerSaveRoute(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.error, 'INVALID_GENDER');
    });

    it('NEGATIVE: POST /store/customers rejects invalid date of birth format with 400 Bad Request', async () => {
      const { req, res } = createMockContext({
        headers: { 'x-s2s-auth-token': validS2S },
        body: {
          mobile: '+919876543210',
          dateOfBirth: '15/05/1995', // not YYYY-MM-DD
        },
      });

      await customerSaveRoute(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.error, 'INVALID_DATE_OF_BIRTH');
    });

    it('POST /store/customers creates customer with allowlisted metadata when S2S token is verified', async () => {
      const { req, res } = createMockContext({
        headers: { 'x-s2s-auth-token': validS2S },
        body: {
          mobile: '+919123456789',
          firstName: 'Ananya',
          lastName: 'Roy',
          email: 'ananya@example.com',
          gender: 'female',
          dateOfBirth: '1998-12-01',
        },
      });

      await customerSaveRoute(req, res);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.isNew, true);
      assert.equal(res.body.customer.mobile, '+919123456789');
      assert.equal(res.body.customer.gender, 'female');
      assert.equal(res.body.customer.dateOfBirth, '1998-12-01');
    });

    it('POST /store/customers updates existing customer safely and merges allowlisted metadata', async () => {
      const { req, res } = createMockContext({
        headers: { 'x-s2s-auth-token': validS2S },
        body: {
          mobile: '+919876543210',
          firstName: 'Priya Updated',
        },
      });

      await customerSaveRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.isNew, false);
      assert.equal(res.body.customer.firstName, 'Priya Updated');
    });

    // 11.3 Production Fail-Closed & Dev Secret Rejection
    it('NEGATIVE: Production mode strictly blocks known development secret ecom-s2s-dev-token-secret', async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevSecret = process.env.S2S_AUTH_TOKEN;
      try {
        process.env.NODE_ENV = 'production';
        process.env.S2S_AUTH_TOKEN = 'ecom-s2s-dev-token-secret'; // Known dev secret configured in prod

        const { req, res } = createMockContext({
          headers: { 'x-s2s-auth-token': 'ecom-s2s-dev-token-secret' },
          query: { phone: '+919876543210' },
        });

        await customerLookupRoute(req, res);
        assert.equal(res.statusCode, 401);
        assert.equal(res.body.error, 'UNAUTHORIZED');
      } finally {
        process.env.NODE_ENV = prevEnv;
        process.env.S2S_AUTH_TOKEN = prevSecret;
      }
    });

    it('NEGATIVE: Production mode fails closed when S2S_AUTH_TOKEN is empty or omitted', async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevSecret = process.env.S2S_AUTH_TOKEN;
      try {
        process.env.NODE_ENV = 'production';
        delete process.env.S2S_AUTH_TOKEN;

        const { req, res } = createMockContext({
          headers: { 'x-s2s-auth-token': 'any-token' },
          body: { mobile: '+919876543210', firstName: 'Attacker' },
        });

        await customerSaveRoute(req, res);
        assert.equal(res.statusCode, 401);
        assert.equal(res.body.error, 'UNAUTHORIZED');
      } finally {
        process.env.NODE_ENV = prevEnv;
        process.env.S2S_AUTH_TOKEN = prevSecret;
      }
    });

    it('Production mode approves request when strong non-default secret is configured', async () => {
      const prevEnv = process.env.NODE_ENV;
      const prevSecret = process.env.S2S_AUTH_TOKEN;
      const strongProdSecret = 'prod_sec_99a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4';
      try {
        process.env.NODE_ENV = 'production';
        process.env.S2S_AUTH_TOKEN = strongProdSecret;

        const { req, res } = createMockContext({
          headers: { 'x-s2s-auth-token': strongProdSecret },
          query: { phone: '+919876543210' },
        });

        await customerLookupRoute(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.exists, true);
        assert.equal(res.body.customer, undefined); // Zero PII
      } finally {
        process.env.NODE_ENV = prevEnv;
        process.env.S2S_AUTH_TOKEN = prevSecret;
      }
    });
  });
});



