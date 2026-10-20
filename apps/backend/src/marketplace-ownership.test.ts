import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  BackendMarketplaceGuard,
  MARKETPLACE_MODULE,
  Merchant,
  MerchantMember,
} from './modules/marketplace/index.js';
import MarketplaceModuleService from './modules/marketplace/service.js';
import { Migration20261019000000 } from './modules/marketplace/migrations/Migration20261019000000.js';

import type { AuthenticatedSessionDto, MerchantRole, MerchantMemberStatus } from '@ecom/types';
import { GET as customerLookupRoute } from './api/store/customers/lookup/route.js';
import { POST as customerSaveRoute } from './api/store/customers/route.js';
import { GET as merchantProductsGetRoute, POST as merchantProductsPostRoute } from './api/merchant/products/route.js';
import {
  GET as merchantProductDetailGetRoute,
  PUT as merchantProductDetailPutRoute,
  DELETE as merchantProductDetailDeleteRoute,
} from './api/merchant/products/[id]/route.js';
import { POST as merchantVariantPostRoute } from './api/merchant/products/[id]/variants/route.js';
import { GET as merchantOrdersGetRoute } from './api/merchant/orders/route.js';
import { GET as merchantOrderDetailGetRoute } from './api/merchant/orders/[id]/route.js';
import {
  GET as adminMarketplaceProductsGetRoute,
  POST as adminMarketplaceProductsPostRoute,
} from './api/admin/marketplace/products/route.js';
import { MockMedusaContainer } from './api/__tests__/fixtures/mock-medusa-container.js';



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

  describe('12. MarketplaceModuleService Domain Methods & Migration Compatibility (M2-03)', () => {
    function createMockMarketplaceService() {
      const service = new MarketplaceModuleService({} as any);
      const merchants = new Map<string, any>();
      const members = new Map<string, any>();

      (service as any).createMerchants = async (data: any) => {
        const id = data.id || `merch_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const record = { id, ...data, created_at: new Date(), updated_at: new Date() };
        merchants.set(id, record);
        return record;
      };

      (service as any).retrieveMerchant = async (id: string) => {
        const record = merchants.get(id);
        if (!record) throw new Error(`Merchant ${id} not found`);
        return record;
      };

      (service as any).updateMerchants = async (id: string, data: any) => {
        const existing = await (service as any).retrieveMerchant(id);
        const updated = { ...existing, ...data, updated_at: new Date() };
        merchants.set(id, updated);
        return updated;
      };

      (service as any).listMerchantMembers = async (filters: any = {}) => {
        let result = Array.from(members.values());
        if (filters.merchant_id) {
          result = result.filter((m) => m.merchant_id === filters.merchant_id);
        }
        if (filters.user_id) {
          result = result.filter((m) => m.user_id === filters.user_id);
        }
        return result;
      };

      (service as any).createMerchantMembers = async (data: any) => {
        const id = data.id || `member_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        const record = { id, ...data, created_at: new Date(), updated_at: new Date() };
        members.set(id, record);
        return record;
      };

      (service as any).updateMerchantMembers = async (id: string, data: any) => {
        const existing = members.get(id);
        if (!existing) throw new Error(`Member ${id} not found`);
        const updated = { ...existing, ...data, updated_at: new Date() };
        members.set(id, updated);
        return updated;
      };

      return service;
    }

    it('validateAndCreateMerchant creates draft merchant with normalized handle and uppercase GSTIN/PAN', async () => {
      const service = createMockMarketplaceService();
      const created = await service.validateAndCreateMerchant({
        name: 'Virasat Heritage',
        email: 'seller@virasat.com',
        phone: '+919876543210',
        businessRegistrationNumber: '07aaaaa0000a1z5', // lowercase, should normalize
        taxIdentifier: 'abcde1234f', // lowercase, should normalize
      });

      assert.equal(created.name, 'Virasat Heritage');
      assert.equal(created.handle, 'virasat-heritage');
      assert.equal(created.status, 'draft');
      assert.equal(created.email, 'seller@virasat.com');
      assert.equal(created.business_registration_number, '07AAAAA0000A1Z5');
      assert.equal(created.tax_identifier, 'ABCDE1234F');
    });

    it('NEGATIVE: validateAndCreateMerchant throws on invalid profile payload', async () => {
      const service = createMockMarketplaceService();
      await assert.rejects(
        async () => {
          await service.validateAndCreateMerchant({
            name: 'A', // too short
            email: 'not-an-email',
            phone: '123',
          });
        },
        /MERCHANT_VALIDATION_FAILED/
      );
    });

    it('validateAndUpdateMerchant updates fields and validates modifications', async () => {
      const service = createMockMarketplaceService();
      const created = await service.validateAndCreateMerchant({
        name: 'Loom & Thread',
        handle: 'loom-thread',
        email: 'contact@loom.com',
        phone: '+919123456789',
      });

      const updated = await service.validateAndUpdateMerchant(created.id, {
        name: 'Loom & Thread Official',
        businessRegistrationNumber: '29AAAAA0000A1Z5',
      });

      assert.equal(updated.name, 'Loom & Thread Official');
      assert.equal(updated.business_registration_number, '29AAAAA0000A1Z5');
    });

    it('transitionMerchantStatus executes lifecycle state machine with audit history and timestamps', async () => {
      const service = createMockMarketplaceService();
      const created = await service.validateAndCreateMerchant({
        name: 'Royal Cottons',
        handle: 'royal-cottons',
        email: 'admin@royalcottons.com',
        phone: '+919988776655',
      });

      // 1. Submit for verification
      const submitted = await service.transitionMerchantStatus(created.id, 'pending_approval', {
        actorType: 'merchant_user',
        actorId: 'usr_seller_1',
      });
      assert.equal(submitted.status, 'pending_approval');
      assert.ok(submitted.metadata.verificationSubmittedAt);
      assert.equal(submitted.metadata.lifecycleHistory.length, 1);
      assert.equal(submitted.metadata.lifecycleHistory[0].fromStatus, 'draft');
      assert.equal(submitted.metadata.lifecycleHistory[0].toStatus, 'pending_approval');

      // Add owner before activation
      await service.addMerchantMember(created.id, {
        userId: 'usr_seller_1',
        role: 'owner',
        status: 'active',
      });

      // 2. Super Admin approves
      const approved = await service.transitionMerchantStatus(created.id, 'active', {
        actorType: 'super_admin',
        actorId: 'usr_admin_1',
      });
      assert.equal(approved.status, 'active');
      assert.ok(approved.metadata.approvedAt);
      assert.equal(approved.metadata.approvedBy, 'usr_admin_1');
      assert.equal(approved.metadata.lifecycleHistory.length, 2);

      // 3. Super Admin suspends with reason
      const suspended = await service.transitionMerchantStatus(created.id, 'suspended', {
        actorType: 'super_admin',
        actorId: 'usr_admin_1',
        reason: 'Compliance audit pending',
      });
      assert.equal(suspended.status, 'suspended');
      assert.ok(suspended.metadata.suspendedAt);
      assert.equal(suspended.metadata.suspensionReason, 'Compliance audit pending');
      assert.equal(suspended.metadata.lifecycleHistory.length, 3);

      // 4. Super Admin reactivates
      const reactivated = await service.transitionMerchantStatus(created.id, 'active', {
        actorType: 'super_admin',
        actorId: 'usr_admin_1',
      });
      assert.equal(reactivated.status, 'active');
      assert.ok(reactivated.metadata.reactivatedAt);
      assert.equal(reactivated.metadata.lifecycleHistory.length, 4);
    });

    it('NEGATIVE: transitionMerchantStatus blocks direct activation from draft', async () => {
      const service = createMockMarketplaceService();
      const created = await service.validateAndCreateMerchant({
        name: 'Direct Activate Test',
        email: 'test@direct.com',
        phone: '+919988776655',
      });

      await assert.rejects(
        async () => {
          await service.transitionMerchantStatus(created.id, 'active');
        },
        /DIRECT_ACTIVATION_BLOCKED/
      );
    });

    it('NEGATIVE: transitionMerchantStatus blocks activation if merchant lacks active owner', async () => {
      const service = createMockMarketplaceService();
      const created = await service.validateAndCreateMerchant({
        name: 'No Owner Test',
        email: 'test@noowner.com',
        phone: '+919988776655',
      });

      await service.transitionMerchantStatus(created.id, 'pending_approval');

      await assert.rejects(
        async () => {
          await service.transitionMerchantStatus(created.id, 'active', {
            actorType: 'super_admin',
          });
        },
        /OWNER_REQUIRED/
      );
    });

    it('NEGATIVE: transitionMerchantStatus blocks rejection without a rejection reason', async () => {
      const service = createMockMarketplaceService();
      const created = await service.validateAndCreateMerchant({
        name: 'Reject Reason Test',
        email: 'test@reject.com',
        phone: '+919988776655',
      });
      await service.transitionMerchantStatus(created.id, 'pending_approval');

      await assert.rejects(
        async () => {
          await service.transitionMerchantStatus(created.id, 'rejected', {
            actorType: 'super_admin',
            reason: '',
          });
        },
        /REJECTION_REASON_REQUIRED/
      );
    });

    it('addMerchantMember and duplicate membership prevention', async () => {
      const service = createMockMarketplaceService();
      const created = await service.validateAndCreateMerchant({
        name: 'Team Test Merchant',
        email: 'team@test.com',
        phone: '+919988776655',
      });

      const member = await service.addMerchantMember(created.id, {
        userId: 'usr_staff_101',
        role: 'staff',
        status: 'active',
      });
      assert.equal(member.merchant_id, created.id);
      assert.equal(member.user_id, 'usr_staff_101');
      assert.equal(member.role, 'staff');

      // Duplicate membership attempt must be rejected
      await assert.rejects(
        async () => {
          await service.addMerchantMember(created.id, {
            userId: 'usr_staff_101',
          });
        },
        /DUPLICATE_MEMBERSHIP/
      );
    });

    it('updateMerchantMemberRoleOrStatus enforces sole active owner protection', async () => {
      const service = createMockMarketplaceService();
      const created = await service.validateAndCreateMerchant({
        name: 'Sole Owner Guard Test',
        email: 'guard@test.com',
        phone: '+919988776655',
      });

      await service.addMerchantMember(created.id, {
        userId: 'usr_sole_owner',
        role: 'owner',
        status: 'active',
      });
      await service.addMerchantMember(created.id, {
        userId: 'usr_staff_1',
        role: 'staff',
        status: 'active',
      });

      // Attempting to demote the sole active owner to staff must fail
      await assert.rejects(
        async () => {
          await service.updateMerchantMemberRoleOrStatus(created.id, 'usr_sole_owner', {
            role: 'staff',
          });
        },
        /SOLE_OWNER_PROTECTION/
      );

      // Attempting to suspend the sole active owner must fail
      await assert.rejects(
        async () => {
          await service.updateMerchantMemberRoleOrStatus(created.id, 'usr_sole_owner', {
            status: 'suspended',
          });
        },
        /SOLE_OWNER_PROTECTION/
      );

      // Adding a second active owner relieves the sole owner constraint
      await service.addMerchantMember(created.id, {
        userId: 'usr_second_owner',
        role: 'owner',
        status: 'active',
      });

      const demoted = await service.updateMerchantMemberRoleOrStatus(created.id, 'usr_sole_owner', {
        role: 'manager',
      });
      assert.equal(demoted.role, 'manager');
    });

    it('CONCURRENCY: simultaneous attempts to demote two co-owners prevents race condition and leaves exactly one active owner', async () => {
      const service = createMockMarketplaceService();
      const merchant = await service.validateAndCreateMerchant({
        name: 'Concurrent Demote Merchant',
        email: 'concur@demote.com',
        phone: '+919988776655',
      });

      await service.addMerchantMember(merchant.id, {
        userId: 'usr_owner_alpha',
        role: 'owner',
        status: 'active',
      });
      await service.addMerchantMember(merchant.id, {
        userId: 'usr_owner_beta',
        role: 'owner',
        status: 'active',
      });

      // Fire simultaneous concurrent demotions for both owners
      const results = await Promise.allSettled([
        service.updateMerchantMemberRoleOrStatus(merchant.id, 'usr_owner_alpha', { role: 'staff' }),
        service.updateMerchantMemberRoleOrStatus(merchant.id, 'usr_owner_beta', { role: 'staff' }),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Exactly ONE demotion must succeed, and exactly ONE must be rejected by sole owner guard
      assert.equal(fulfilled.length, 1, 'Exactly one concurrent demotion must succeed');
      assert.equal(rejected.length, 1, 'Exactly one concurrent demotion must be rejected by sole owner guard');

      // Check rejection reason matches SOLE_OWNER_PROTECTION
      const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(
        rejectedReason?.message?.includes('SOLE_OWNER_PROTECTION'),
        'Rejection reason must be SOLE_OWNER_PROTECTION'
      );

      // Verify the final state in the store: exactly one active owner remains
      const remainingMembers = await (service as any).listMerchantMembers({ merchant_id: merchant.id });
      const activeOwners = remainingMembers.filter(
        (m: any) => m.role === 'owner' && m.status === 'active'
      );
      assert.equal(activeOwners.length, 1, 'Merchant must retain exactly one active owner');
    });

    it('CONCURRENCY: simultaneous attempts to suspend two co-owners prevents race condition and leaves exactly one active owner', async () => {
      const service = createMockMarketplaceService();
      const merchant = await service.validateAndCreateMerchant({
        name: 'Concurrent Suspend Merchant',
        email: 'concur@suspend.com',
        phone: '+919988776655',
      });

      await service.addMerchantMember(merchant.id, {
        userId: 'usr_owner_x',
        role: 'owner',
        status: 'active',
      });
      await service.addMerchantMember(merchant.id, {
        userId: 'usr_owner_y',
        role: 'owner',
        status: 'active',
      });

      // Fire simultaneous concurrent suspensions for both owners
      const results = await Promise.allSettled([
        service.updateMerchantMemberRoleOrStatus(merchant.id, 'usr_owner_x', { status: 'suspended' }),
        service.updateMerchantMemberRoleOrStatus(merchant.id, 'usr_owner_y', { status: 'suspended' }),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      // Exactly ONE suspension must succeed, and exactly ONE must be rejected
      assert.equal(fulfilled.length, 1, 'Exactly one concurrent suspension must succeed');
      assert.equal(rejected.length, 1, 'Exactly one concurrent suspension must be rejected by sole owner guard');

      const rejectedReason = (rejected[0] as PromiseRejectedResult).reason;
      assert.ok(
        rejectedReason?.message?.includes('SOLE_OWNER_PROTECTION'),
        'Rejection reason must be SOLE_OWNER_PROTECTION'
      );

      // Verify final state: exactly one active owner remains
      const remainingMembers = await (service as any).listMerchantMembers({ merchant_id: merchant.id });
      const activeOwners = remainingMembers.filter(
        (m: any) => m.role === 'owner' && m.status === 'active'
      );
      assert.equal(activeOwners.length, 1, 'Merchant must retain exactly one active owner');
    });

    it('verifyActiveMembership validates server-side active tenant status', async () => {
      const service = createMockMarketplaceService();
      const merchant = await service.validateAndCreateMerchant({
        name: 'Active Check Merchant',
        email: 'active@check.com',
        phone: '+919988776655',
      });

      await service.addMerchantMember(merchant.id, {
        userId: 'usr_owner_10',
        role: 'owner',
        status: 'active',
      });
      await service.addMerchantMember(merchant.id, {
        userId: 'usr_suspended_member',
        role: 'staff',
        status: 'suspended',
      });

      // Draft merchant: Even active member gets rejected
      const draftCheck = await service.verifyActiveMembership('usr_owner_10', merchant.id);
      assert.equal(draftCheck.valid, false);
      assert.equal(draftCheck.statusCode, 403);
      assert.ok(draftCheck.message?.includes('Merchant account is not active'));

      // Transition merchant to active
      await service.transitionMerchantStatus(merchant.id, 'pending_approval');
      await service.transitionMerchantStatus(merchant.id, 'active', {
        actorType: 'super_admin',
      });

      // Active member of active merchant: PASS
      const activeCheck = await service.verifyActiveMembership('usr_owner_10', merchant.id);
      assert.equal(activeCheck.valid, true);
      assert.equal(activeCheck.statusCode, 200);
      assert.equal(activeCheck.role, 'owner');

      // Suspended member of active merchant: 403 FORBIDDEN
      const suspendedCheck = await service.verifyActiveMembership('usr_suspended_member', merchant.id);
      assert.equal(suspendedCheck.valid, false);
      assert.equal(suspendedCheck.statusCode, 403);
      assert.ok(suspendedCheck.message?.includes('Merchant membership is not active'));

      // Unrelated user: 403 FORBIDDEN
      const strangerCheck = await service.verifyActiveMembership('usr_stranger', merchant.id);
      assert.equal(strangerCheck.valid, false);
      assert.equal(strangerCheck.statusCode, 403);
      assert.ok(strangerCheck.message?.includes('is not a member of merchant'));
    });

    it('Migration20261019000000 executes valid up() schema and 100% reversible down() rollback without mutating core tables', async () => {
      class TestMigrationRunner extends Migration20261019000000 {
        sqlStatements: string[] = [];
        constructor() {
          super({} as any, {} as any);
        }
        override addSql(sql: string) {
          this.sqlStatements.push(sql);
        }
      }

      const runner = new TestMigrationRunner();

      // Test up()
      await runner.up();
      assert.ok(runner.sqlStatements.length >= 10);

      // Verify table creation
      const allUpSql = runner.sqlStatements.join('\n');
      assert.ok(allUpSql.includes('CREATE TABLE IF NOT EXISTS "merchant"'));
      assert.ok(allUpSql.includes('CREATE TABLE IF NOT EXISTS "merchant_member"'));
      assert.ok(allUpSql.includes('idx_merchant_handle'));
      assert.ok(allUpSql.includes('idx_merchant_member_unique'));

      // Verify zero core table tampering (no ALTER TABLE product, order, customer, etc.)
      assert.ok(!allUpSql.includes('ALTER TABLE "product"'));
      assert.ok(!allUpSql.includes('ALTER TABLE "order"'));
      assert.ok(!allUpSql.includes('ALTER TABLE "customer"'));
      assert.ok(!allUpSql.includes('ALTER TABLE "line_item"'));

      // Test down()
      runner.sqlStatements = [];
      await runner.down();
      assert.equal(runner.sqlStatements.length, 2);
      const allDownSql = runner.sqlStatements.join('\n');
      assert.ok(allDownSql.includes('DROP TABLE IF EXISTS "merchant_member" CASCADE'));
      assert.ok(allDownSql.includes('DROP TABLE IF EXISTS "merchant" CASCADE'));
    });
  });

  describe('13. Route-Level Tenant Authorization & API Boundaries (M2-04)', () => {
    const testContainer = new MockMedusaContainer();

    function createRouteContext(options: {
      token?: string;
      cookie?: string;
      params?: Record<string, string>;
      query?: Record<string, string>;
      body?: any;
      container?: MockMedusaContainer;
    }) {
      const container = options.container || testContainer;
      const headers: Record<string, string> = {};
      if (options.token) {
        headers['authorization'] = `Bearer ${options.token}`;
      }
      if (options.cookie) {
        headers['cookie'] = options.cookie;
      }

      const req: any = {
        headers,
        params: options.params || {},
        query: options.query || {},
        body: options.body || {},
        scope: {
          resolve: (token: any) => container.resolve(token),
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

      return { req, res, container };
    }

    // Helper token generators
    const virasatOwnerToken = 'merchant_token:usr_virasat_owner:merch_virasat_heritage:owner:active:active';
    const virasatSupportToken = JSON.stringify({
      userId: 'usr_virasat_support',
      merchantId: 'merch_virasat_heritage',
      actorType: 'merchant_user',
      authBoundary: 'merchant',
      role: 'support',
      permissions: ['orders:read'],
    });
    const loomOwnerToken = 'merchant_token:usr_loom_owner:merch_loom_thread:owner:active:active';
    const customerToken = 'customer_token_cus_priya_sharma';
    const adminToken = 'admin_token_super_root';
    const suspendedMemberToken = JSON.stringify({
      userId: 'usr_suspended_virasat',
      merchantId: 'merch_virasat_heritage',
      actorType: 'merchant_user',
      authBoundary: 'merchant',
      membershipStatus: 'suspended',
      merchantStatus: 'active',
      role: 'manager',
      permissions: ['catalog:read', 'catalog:write'],
    });
    const suspendedMerchantToken = JSON.stringify({
      userId: 'usr_bad_merchant',
      merchantId: 'merch_suspended_store',
      actorType: 'merchant_user',
      authBoundary: 'merchant',
      membershipStatus: 'active',
      merchantStatus: 'suspended',
      role: 'owner',
      permissions: ['catalog:read', 'catalog:write'],
    });

    // 13.1 Unauthenticated Access Protection
    it('NEGATIVE: rejects unauthenticated requests to merchant routes with 401 UNAUTHORIZED', async () => {
      testContainer.seedDefaultData();
      const { req, res } = createRouteContext({});

      await merchantProductsGetRoute(req, res);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.error, 'UNAUTHORIZED');

      const { req: reqPost, res: resPost } = createRouteContext({ body: { title: 'Hack' } });
      await merchantProductsPostRoute(reqPost, resPost);
      assert.equal(resPost.statusCode, 401);
      assert.equal(resPost.body.error, 'UNAUTHORIZED');

      const { req: reqOrders, res: resOrders } = createRouteContext({});
      await merchantOrdersGetRoute(reqOrders, resOrders);
      assert.equal(resOrders.statusCode, 401);
      assert.equal(resOrders.body.error, 'UNAUTHORIZED');
    });

    it('NEGATIVE: rejects malformed / invalid tokens with 401 UNAUTHORIZED', async () => {
      const { req, res } = createRouteContext({ token: 'not-a-valid-token' });
      await merchantProductsGetRoute(req, res);
      assert.equal(res.statusCode, 401);
      assert.equal(res.body.error, 'UNAUTHORIZED');
    });

    // 13.2 Security Boundary Separation
    it('NEGATIVE: Customer token cannot access merchant product routes (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({ token: customerToken });
      await merchantProductsGetRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Customer credentials cannot access merchant or admin boundaries'));
    });

    it('NEGATIVE: Customer token cannot access admin routes (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({ token: customerToken });
      await adminMarketplaceProductsGetRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
    });

    it('NEGATIVE: Merchant token cannot access platform admin boundary (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({ token: virasatOwnerToken });
      await adminMarketplaceProductsGetRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Merchant credentials cannot access platform admin boundary'));

      const { req: reqPost, res: resPost } = createRouteContext({
        token: virasatOwnerToken,
        body: { title: 'Unauthorized Admin Product', target_merchant_id: 'merch_virasat_heritage' },
      });
      await adminMarketplaceProductsPostRoute(reqPost, resPost);
      assert.equal(resPost.statusCode, 403);
      assert.equal(resPost.body.error, 'FORBIDDEN');
    });

    // 13.3 Inactive Membership & Inactive Merchant Enforcement
    it('NEGATIVE: rejects merchant user with suspended membership (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({ token: suspendedMemberToken });
      await merchantProductsGetRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Merchant membership is not active'));
    });

    it('NEGATIVE: rejects merchant user belonging to a suspended merchant (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({ token: suspendedMerchantToken });
      await merchantProductsGetRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Merchant account is not active'));
    });

    // 13.4 Anti-Forgery Merchant ID Guard
    it('NEGATIVE: blocks forged client-supplied merchant_id in query differing from session (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: virasatOwnerToken, // session is merch_virasat_heritage
        query: { merchant_id: 'merch_loom_thread' }, // attacker tries to view Loom & Thread
      });

      await merchantProductsGetRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('FORGED_MERCHANT_ID'));
    });

    it('NEGATIVE: blocks forged client-supplied merchant_id in body differing from session (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: virasatOwnerToken,
        body: {
          title: 'Malicious Product',
          merchant_id: 'merch_loom_thread', // attacker tries to inject product into Loom & Thread
        },
      });

      await merchantProductsPostRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('FORGED_MERCHANT_ID'));
    });

    // 13.5 Permission-Based RBAC Enforcement
    it('NEGATIVE: blocks merchant staff without catalog:write from creating products (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: virasatSupportToken, // only has orders:read
        body: { title: 'Unauthorized Creation Attempt' },
      });

      await merchantProductsPostRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Missing required permission [catalog:write]'));
    });

    it('allows merchant owner with catalog:write to create product scoped to own merchant (201 CREATED)', async () => {
      const { req, res } = createRouteContext({
        token: virasatOwnerToken,
        body: {
          title: 'Virasat Zari Silk Dupatta',
          handle: 'virasat-zari-silk-dupatta',
          description: 'Authentic zari dupatta',
        },
      });

      await merchantProductsPostRoute(req, res);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.product.merchant_id, 'merch_virasat_heritage');
      assert.equal(res.body.product.title, 'Virasat Zari Silk Dupatta');
    });

    // 13.6 Cross-Merchant IDOR Protection on Products
    it('NEGATIVE: Merchant A cannot read Merchant B product details via GET /merchant/products/:id (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: virasatOwnerToken, // Merchant A
        params: { id: 'prod_loom_shirt_01' }, // Owned by Merchant B
      });

      await merchantProductDetailGetRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Access denied: You do not own this product'));
    });

    it('NEGATIVE: Merchant A cannot update Merchant B product via PUT /merchant/products/:id (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: virasatOwnerToken, // Merchant A
        params: { id: 'prod_loom_shirt_01' }, // Owned by Merchant B
        body: { title: 'Hijacked Title' },
      });

      await merchantProductDetailPutRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Access denied: You do not own this product'));
    });

    it('NEGATIVE: Merchant A cannot delete Merchant B product via DELETE /merchant/products/:id (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: virasatOwnerToken, // Merchant A
        params: { id: 'prod_loom_shirt_01' }, // Owned by Merchant B
      });

      await merchantProductDetailDeleteRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Access denied: You do not own this product'));
    });

    it('allows merchant to read and update their own product (200 OK)', async () => {
      const { req, res } = createRouteContext({
        token: loomOwnerToken,
        params: { id: 'prod_loom_shirt_01' },
      });

      await merchantProductDetailGetRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.product.id, 'prod_loom_shirt_01');
      assert.equal(res.body.product.merchant_id, 'merch_loom_thread');

      const { req: reqPut, res: resPut } = createRouteContext({
        token: loomOwnerToken,
        params: { id: 'prod_loom_shirt_01' },
        body: { description: 'Updated breathable linen shirt' },
      });
      await merchantProductDetailPutRoute(reqPut, resPut);
      assert.equal(resPut.statusCode, 200);
      assert.equal(resPut.body.product.description, 'Updated breathable linen shirt');
    });

    // 13.7 Parent-Product Variant Hijacking Protection
    it('NEGATIVE: Merchant A cannot add variants to Merchant B parent product (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: virasatOwnerToken, // Merchant A
        params: { id: 'prod_loom_shirt_01' }, // Parent owned by Merchant B
        body: {
          title: 'Forged Variant Size XL',
          sku: 'LOOM-HIJACK-XL',
          price: 199900,
        },
      });

      await merchantVariantPostRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('Access denied: You do not own this product'));
    });

    it('allows owning merchant to add variants to own parent product (201 CREATED)', async () => {
      const { req, res } = createRouteContext({
        token: loomOwnerToken,
        params: { id: 'prod_loom_shirt_01' },
        body: {
          title: 'Beige / L',
          sku: 'LOOM-SHIRT-BGE-L',
          price: 249900,
        },
      });

      await merchantVariantPostRoute(req, res);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.variant.sku, 'LOOM-SHIRT-BGE-L');
      assert.equal(res.body.variant.productId, 'prod_loom_shirt_01');
    });

    // 13.8 Product Lifecycle Safety Evaluation
    it('NEGATIVE: blocks hard deletion of product with historical orders (409 CONFLICT)', async () => {
      const { req, res } = createRouteContext({
        token: virasatOwnerToken,
        params: { id: 'prod_virasat_saree_01' }, // hasOrderHistory = true
      });

      await merchantProductDetailDeleteRoute(req, res);
      assert.equal(res.statusCode, 409);
      assert.equal(res.body.error, 'CONFLICT');
      assert.ok(res.body.message?.includes('historical orders'));
    });

    it('NEGATIVE: blocks hard deletion of product with active warehouse stock (409 CONFLICT)', async () => {
      const { req, res } = createRouteContext({
        token: loomOwnerToken,
        params: { id: 'prod_loom_shirt_with_stock' }, // activeStockQuantity = 25
      });

      await merchantProductDetailDeleteRoute(req, res);
      assert.equal(res.statusCode, 409);
      assert.equal(res.body.error, 'CONFLICT');
      assert.ok(res.body.message?.includes('active stock remains'));
    });

    it('allows deletion of clean product without order history and zero stock (200 OK)', async () => {
      const { req, res } = createRouteContext({
        token: loomOwnerToken,
        params: { id: 'prod_loom_shirt_01' }, // hasOrderHistory = false, stock = 0
      });

      await merchantProductDetailDeleteRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.message, 'Product successfully deleted.');
    });

    // 13.9 Mixed-Merchant Order Line-Item Isolation
    it('Merchant A in mixed-merchant orders sees ONLY Merchant A line items (zero cross-tenant leakage)', async () => {
      testContainer.seedDefaultData();
      const { req, res } = createRouteContext({
        token: virasatOwnerToken, // Virasat Heritage
      });

      await merchantOrdersGetRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      // Virasat has items in order_mixed_1001 and order_virasat_2001
      assert.equal(res.body.count, 2);

      const mixedOrder = res.body.orders.find((o: any) => o.id === 'order_mixed_1001');
      assert.ok(mixedOrder);
      // Mixed order originally has 2 items (1 Virasat, 1 Loom & Thread).
      // Virasat must ONLY see 1 item (Banarasi Saree).
      assert.equal(mixedOrder.items.length, 1);
      assert.equal(mixedOrder.items[0].merchantId, 'merch_virasat_heritage');
      assert.equal(mixedOrder.items[0].title, 'Handloom Banarasi Silk Saree');
      assert.equal(mixedOrder.merchant_subtotal, 1299900);

      // Verify Loom & Thread item is completely absent
      const hasLoomItem = mixedOrder.items.some((item: any) => item.merchantId === 'merch_loom_thread');
      assert.equal(hasLoomItem, false);
    });

    it('Merchant B in mixed-merchant orders sees ONLY Merchant B line items and cannot see Merchant A exclusive orders', async () => {
      const { req, res } = createRouteContext({
        token: loomOwnerToken, // Loom & Thread
      });

      await merchantOrdersGetRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      // Loom & Thread has items ONLY in order_mixed_1001. order_virasat_2001 must be completely omitted!
      assert.equal(res.body.count, 1);
      assert.equal(res.body.orders[0].id, 'order_mixed_1001');
      assert.equal(res.body.orders[0].items.length, 1);
      assert.equal(res.body.orders[0].items[0].merchantId, 'merch_loom_thread');
      assert.equal(res.body.orders[0].merchant_subtotal, 249900);

      // Verify Virasat exclusive order is not leaked
      const hasVirasatOrder = res.body.orders.some((o: any) => o.id === 'order_virasat_2001');
      assert.equal(hasVirasatOrder, false);
    });

    it('NEGATIVE: Merchant B cannot view Merchant A single-merchant order via GET /merchant/orders/:id (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: loomOwnerToken, // Loom & Thread
        params: { id: 'order_virasat_2001' }, // Virasat only order
      });

      await merchantOrderDetailGetRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('You do not have permission to view this order'));
    });

    it('Merchant B can view mixed order detail, but only their own line items (200 OK)', async () => {
      const { req, res } = createRouteContext({
        token: loomOwnerToken,
        params: { id: 'order_mixed_1001' },
      });

      await merchantOrderDetailGetRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(res.body.order.items.length, 1);
      assert.equal(res.body.order.items[0].merchantId, 'merch_loom_thread');
      assert.equal(res.body.order.merchant_subtotal, 249900);
    });

    // 13.10 Super Admin Governance and Target Merchant Selection
    it('NEGATIVE: Super Admin product creation without target_merchant_id is rejected with 400 Bad Request', async () => {
      const { req, res } = createRouteContext({
        token: adminToken,
        body: {
          title: 'Unassigned Product Attempt',
          target_merchant_id: '', // Empty target merchant
        },
      });

      await adminMarketplaceProductsPostRoute(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.error, 'BAD_REQUEST');
      assert.ok(res.body.message?.includes('TARGET_MERCHANT_REQUIRED'));
    });

    it('NEGATIVE: Super Admin product creation with non-existent target merchant is rejected with 400 Bad Request', async () => {
      const { req, res } = createRouteContext({
        token: adminToken,
        body: {
          title: 'Ghost Merchant Product',
          target_merchant_id: 'merch_non_existent_999',
        },
      });

      await adminMarketplaceProductsPostRoute(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.error, 'MERCHANT_NOT_FOUND');
    });

    it('NEGATIVE: Super Admin product creation with suspended target merchant is rejected with 400 Bad Request', async () => {
      const { req, res } = createRouteContext({
        token: adminToken,
        body: {
          title: 'Suspended Merchant Product',
          target_merchant_id: 'merch_suspended_store',
        },
      });

      await adminMarketplaceProductsPostRoute(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.error, 'MERCHANT_NOT_ELIGIBLE');
    });

    it('Super Admin creates product with explicit target_merchant_id and establishes persistent remote link (201 CREATED)', async () => {
      const { req, res, container } = createRouteContext({
        token: adminToken,
        body: {
          title: 'Platform Handcrafted Pashmina Shawl',
          target_merchant_id: 'merch_virasat_heritage',
        },
      });

      await adminMarketplaceProductsPostRoute(req, res);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.product.merchant_id, 'merch_virasat_heritage');
      assert.equal(res.body.product.title, 'Platform Handcrafted Pashmina Shawl');

      // Verify persistence in Medusa container and remote link
      const createdId = res.body.product.id;
      assert.ok(container.products.has(createdId));
      assert.equal(container.productLinks.get(createdId), 'merch_virasat_heritage');
    });

    it('Super Admin lists products cross-merchant or filtered by ?merchant_id=... (200 OK)', async () => {
      // Cross-merchant list
      const { req, res } = createRouteContext({
        token: adminToken,
      });

      await adminMarketplaceProductsGetRoute(req, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.count >= 2);

      // Filtered by specific merchant
      const { req: reqFiltered, res: resFiltered } = createRouteContext({
        token: adminToken,
        query: { merchant_id: 'merch_loom_thread' },
      });

      await adminMarketplaceProductsGetRoute(reqFiltered, resFiltered);
      assert.equal(resFiltered.statusCode, 200);
      const allLoom = resFiltered.body.products.every((p: any) => p.merchant_id === 'merch_loom_thread');
      assert.equal(allLoom, true);
    });

    // 13.11 Persistent Medusa Integration & Compensation Rollback (M2-04 Remediation)
    it('Merchant product creation persists in Medusa Product Module and Remote Link without in-memory store', async () => {
      const localContainer = new MockMedusaContainer();
      const { req, res } = createRouteContext({
        container: localContainer,
        token: virasatOwnerToken,
        body: {
          title: 'Authentic Chanderi Saree',
          handle: 'authentic-chanderi-saree',
          description: 'Handwoven pure Chanderi saree',
        },
      });

      await merchantProductsPostRoute(req, res);
      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      const createdId = res.body.product.id;

      // Assert persisted in container
      assert.ok(localContainer.products.has(createdId));
      assert.equal(localContainer.productLinks.get(createdId), 'merch_virasat_heritage');

      // Assert retrievable via GET /merchant/products/:id
      const { req: reqGet, res: resGet } = createRouteContext({
        container: localContainer,
        token: virasatOwnerToken,
        params: { id: createdId },
      });
      await merchantProductDetailGetRoute(reqGet, resGet);
      assert.equal(resGet.statusCode, 200);
      assert.equal(resGet.body.product.id, createdId);
      assert.equal(resGet.body.product.title, 'Authentic Chanderi Saree');
    });

    it('COMPENSATION: rolls back created product when remote link creation fails (zero orphan products)', async () => {
      const localContainer = new MockMedusaContainer();
      localContainer.failNextLinkCreate = true; // Simulate network or DB failure during link establishment

      const { req, res } = createRouteContext({
        container: localContainer,
        token: virasatOwnerToken,
        body: {
          title: 'Orphan Candidate Saree',
          handle: 'orphan-candidate-saree',
        },
      });

      await merchantProductsPostRoute(req, res);
      // Expect 500 error due to link failure
      assert.equal(res.statusCode, 500);
      assert.equal(res.body.error, 'PRODUCT_CREATION_FAILED');

      // Verify COMPENSATION: The product MUST NOT exist in localContainer.products!
      const orphanExists = Array.from(localContainer.products.values()).some(
        (p) => p.title === 'Orphan Candidate Saree'
      );
      assert.equal(orphanExists, false, 'Compensation failed: orphan unlinked product remained in database!');
    });

    it('NEGATIVE: rejects attempts by ordinary merchant to reassign product to another merchant (403 FORBIDDEN)', async () => {
      const { req, res } = createRouteContext({
        token: loomOwnerToken,
        params: { id: 'prod_loom_shirt_01' },
        body: {
          title: 'Reassigned Linen Shirt',
          target_merchant_id: 'merch_virasat_heritage', // Attempt to reassign owner
        },
      });

      await merchantProductDetailPutRoute(req, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.error, 'FORBIDDEN');
      assert.ok(res.body.message?.includes('CANNOT_REASSIGN_MERCHANT'));
    });

    it('Native Medusa Admin /admin/products route is not shadowed (custom route is namespaced under /admin/marketplace/products)', () => {
      const basePath = process.cwd().includes('apps/backend') || process.cwd().includes('apps\\backend')
        ? process.cwd()
        : path.resolve(process.cwd(), 'apps/backend');
      const conflictingRoutePath = path.resolve(basePath, 'src/api/admin/products/route.ts');
      const namespacedRoutePath = path.resolve(basePath, 'src/api/admin/marketplace/products/route.ts');

      // Verify conflicting route does NOT exist
      assert.equal(
        fs.existsSync(conflictingRoutePath),
        false,
        'Conflicting route apps/backend/src/api/admin/products/route.ts must not exist!'
      );

      // Verify namespaced route DOES exist
      assert.equal(
        fs.existsSync(namespacedRoutePath),
        true,
        'Namespaced route apps/backend/src/api/admin/marketplace/products/route.ts must exist!'
      );
    });
  });
});





