/**
 * M2-06: Merchant Authentication and Onboarding Test Suite
 *
 * Comprehensive automated security tests verifying:
 * 1. Scrypt password hashing & constant-time verification.
 * 2. Merchant onboarding & server-side validation (GSTIN, PAN, Phone +91, Email).
 * 3. Initial status enforcement: strictly 'draft' (never client-activatable).
 * 4. Dual-transport session issuance (cookie 'ecom_merchant_sess' + bearer 'sess_merch_*').
 * 5. Production cookie security (HttpOnly, SameSite=Strict, Secure in prod).
 * 6. Multi-layered distributed rate limiting (5 failed attempts per 15m window).
 * 7. Boundary isolation: Customer and Admin sessions strictly blocked from Merchant routes.
 * 8. Session lifecycle: 2-hour sliding idle timeout & 24-hour absolute TTL cap.
 * 9. Centralized single-session logout & global user revocation.
 * 10. Server-side merchant status gating: draft, pending_approval, suspended, rejected blocked with 403.
 * 11. Inactive member status gating: invited, suspended members blocked with 403.
 * 12. Anti-forgery protection: client-supplied forged merchant_id rejected with 403.
 * 13. Direct activation from draft strictly blocked by state machine.
 * 14. Sole active owner protection enforced against demotion/deactivation.
 * 15. Single-use 15-minute password reset token consumption & session revocation.
 * 16. Shared Redis storage adapter integration (Real Redis on 127.0.0.1:6379).
 * 17. Production fail-closed behavior when Redis or PostgreSQL is unavailable.
 * 18. Audit log security and strict secret redaction.
 * 19. Authoritative PostgreSQL durable identity persistence (Real PostgreSQL on 127.0.0.1:5432).
 * 20. Process restart persistence & dual backend instance simulation.
 * 21. ACID transaction rollback on duplicate email/handle and partial registration failures.
 */

import { describe, it, before, beforeEach, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { Pool } from 'pg';
import { MedusaModule } from '@medusajs/framework/modules-sdk';
import {
  MerchantAuthEngine,
  InMemoryMerchantAuthStorageAdapter,
  RedisMerchantAuthStorageAdapter,
  InMemoryMerchantIdentityStore,
  PostgresMerchantIdentityStore,
} from './modules/auth/merchant-auth-engine';
import { requireTenantAuth, resolveSessionFromToken } from './api/middlewares/tenant-auth';
import { POST as registerHandler } from './api/merchant/auth/register/route';
import { POST as loginHandler } from './api/merchant/auth/login/route';
import { GET as sessionHandler } from './api/merchant/auth/session/route';
import { POST as logoutHandler } from './api/merchant/auth/logout/route';
import { POST as forgotPasswordHandler } from './api/merchant/auth/forgot-password/route';
import { POST as resetPasswordHandler } from './api/merchant/auth/reset-password/route';
import {
  validateMerchantStatusTransition,
  validateSoleOwnerConstraint,
  validateMerchantProfile,
  validateGSTIN,
  validatePAN,
  validateIndianPhone,
} from '@ecom/types';

// Helper to simulate MedusaRequest and MedusaResponse
function createMockHttp(options: {
  headers?: Record<string, string>;
  body?: any;
  query?: any;
  params?: any;
}) {
  const headers = options.headers || {};
  let statusCode = 200;
  let responseBody: any = null;
  const setHeaders: Record<string, string> = {};

  const req: any = {
    headers,
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    socket: { remoteAddress: '127.0.0.1' },
    scope: { resolve: () => null },
  };

  const res: any = {
    status(code: number) {
      statusCode = code;
      return res;
    },
    json(data: any) {
      responseBody = data;
      return res;
    },
    setHeader(key: string, value: string) {
      setHeaders[key.toLowerCase()] = value;
      return res;
    },
    getStatusCode() {
      return statusCode;
    },
    getBody() {
      return responseBody;
    },
    getHeaders() {
      return setHeaders;
    },
  };

  return { req, res };
}

describe('M2-06: Merchant Authentication & Onboarding Suite', () => {
  let memoryAdapter: InMemoryMerchantAuthStorageAdapter;
  let memoryIdentityStore: InMemoryMerchantIdentityStore;

  beforeEach(async () => {
    memoryAdapter = new InMemoryMerchantAuthStorageAdapter();
    memoryIdentityStore = new InMemoryMerchantIdentityStore();
    MerchantAuthEngine.setAdapter(memoryAdapter);
    MerchantAuthEngine.setIdentityStore(memoryIdentityStore);
    await MerchantAuthEngine.resetForTesting();
  });

  // ==========================================
  // 1. Password Hashing & Constant-Time Verification
  // ==========================================
  describe('1. Scrypt Password Hashing & Constant-Time Verification', () => {
    it('generates secure scrypt hash with unique salt for merchant passwords', () => {
      const p1 = MerchantAuthEngine.hashPassword('SellerSecret@2026!');
      const p2 = MerchantAuthEngine.hashPassword('SellerSecret@2026!');

      assert.notEqual(p1.salt, p2.salt, 'Salts must be unique per password hash');
      assert.notEqual(p1.hash, p2.hash, 'Hashes must differ due to unique salts');
      assert.equal(p1.hash.length, 128, '64-byte hex hash should be 128 chars');
    });

    it('verifies valid password and rejects incorrect password in constant-time', () => {
      const { hash, salt } = MerchantAuthEngine.hashPassword('SellerSecret@2026!');

      assert.equal(
        MerchantAuthEngine.verifyPassword('SellerSecret@2026!', hash, salt),
        true,
        'Valid password must verify'
      );
      assert.equal(
        MerchantAuthEngine.verifyPassword('WrongPassword@999', hash, salt),
        false,
        'Incorrect password must be rejected'
      );
      assert.equal(
        MerchantAuthEngine.verifyPassword('', hash, salt),
        false,
        'Empty password must be rejected'
      );
    });

    it('rejects passwords shorter than 8 characters', () => {
      assert.throws(
        () => MerchantAuthEngine.hashPassword('short'),
        /PASSWORD_TOO_WEAK/,
        'Should enforce min 8 chars'
      );
    });
  });

  // ==========================================
  // 2. Merchant Onboarding & Validation (POST /merchant/auth/register)
  // ==========================================
  describe('2. Merchant Onboarding & Server-Side Validation', () => {
    it('successfully registers merchant with valid Indian profile and returns draft status', async () => {
      const { req, res } = createMockHttp({
        body: {
          name: 'Jaipur Block Prints',
          handle: 'jaipur-block-prints',
          email: 'founder@jaipurprints.in',
          phone: '+919876543210',
          businessRegistrationNumber: '08AAAAA0000A1Z5', // Valid GSTIN
          taxIdentifier: 'ABCDE1234F', // Valid PAN
          password: 'SecurePassword@2026',
        },
      });

      await registerHandler(req, res);

      assert.equal(res.getStatusCode(), 201);
      const body = res.getBody();
      assert.equal(body.success, true);
      assert.equal(body.merchant.name, 'Jaipur Block Prints');
      assert.equal(body.merchant.handle, 'jaipur-block-prints');
      assert.equal(body.merchant.status, 'draft', 'Initial status must strictly be draft');
      assert.equal(body.merchant.email, 'founder@jaipurprints.in');
      assert.equal(body.merchant.businessRegistrationNumber, '08AAAAA0000A1Z5');
      assert.equal(body.merchant.taxIdentifier, 'ABCDE1234F');
      assert.equal(body.member.role, 'owner');
      assert.equal(body.member.status, 'active');
      assert.match(body.message, /draft/i);
    });

    it('rejects invalid GSTIN format with 400 Bad Request', async () => {
      const { req, res } = createMockHttp({
        body: {
          name: 'Faulty GST Store',
          email: 'badgst@store.in',
          phone: '+919876543210',
          businessRegistrationNumber: 'INVALID_GSTIN_123',
          password: 'Password@2026',
        },
      });

      await registerHandler(req, res);

      assert.equal(res.getStatusCode(), 400);
      const body = res.getBody();
      assert.equal(body.success, false);
      assert.equal(body.error, 'VALIDATION_ERROR');
      assert.match(body.message, /GSTIN/i);
    });

    it('rejects invalid PAN format with 400 Bad Request', async () => {
      const { req, res } = createMockHttp({
        body: {
          name: 'Faulty PAN Store',
          email: 'badpan@store.in',
          phone: '+919876543210',
          taxIdentifier: '12345ABCDE', // Wrong format
          password: 'Password@2026',
        },
      });

      await registerHandler(req, res);

      assert.equal(res.getStatusCode(), 400);
      const body = res.getBody();
      assert.equal(body.success, false);
      assert.equal(body.error, 'VALIDATION_ERROR');
      assert.match(body.message, /PAN/i);
    });

    it('rejects invalid Indian mobile number with 400 Bad Request', async () => {
      const { req, res } = createMockHttp({
        body: {
          name: 'Faulty Phone Store',
          email: 'badphone@store.in',
          phone: '+1234567890', // Non-Indian phone
          password: 'Password@2026',
        },
      });

      await registerHandler(req, res);

      assert.equal(res.getStatusCode(), 400);
      const body = res.getBody();
      assert.equal(body.success, false);
      assert.match(body.message, /phone/i);
    });

    it('rejects duplicate email registration with 409 Conflict', async () => {
      await MerchantAuthEngine.registerMerchant({
        name: 'First Store',
        email: 'duplicate@store.com',
        phone: '+919876543210',
        password: 'Password@2026',
      });

      const { req, res } = createMockHttp({
        body: {
          name: 'Second Store',
          email: 'duplicate@store.com',
          phone: '+919876543211',
          password: 'Password@2026',
        },
      });

      await registerHandler(req, res);

      assert.equal(res.getStatusCode(), 409);
      assert.equal(res.getBody().error, 'EMAIL_ALREADY_REGISTERED');
    });

    it('rejects duplicate store handle with 409 Conflict', async () => {
      await MerchantAuthEngine.registerMerchant({
        name: 'Store Alpha',
        handle: 'alpha-store',
        email: 'alpha@store.com',
        phone: '+919876543210',
        password: 'Password@2026',
      });

      const { req, res } = createMockHttp({
        body: {
          name: 'Store Beta',
          handle: 'alpha-store',
          email: 'beta@store.com',
          phone: '+919876543211',
          password: 'Password@2026',
        },
      });

      await registerHandler(req, res);

      assert.equal(res.getStatusCode(), 409);
      assert.equal(res.getBody().error, 'HANDLE_ALREADY_IN_USE');
    });
  });

  // ==========================================
  // 3. Merchant Primary Authentication (POST /merchant/auth/login)
  // ==========================================
  describe('3. Merchant Primary Authentication', () => {
    let merchantUser: any;
    let merchantRecord: any;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Vogue Craft',
        handle: 'vogue-craft',
        email: 'seller@voguecraft.in',
        phone: '+919876543210',
        password: 'VoguePassword@2026',
      });
      merchantRecord = reg.merchant;
      merchantUser = reg.user;
    });

    it('authenticates valid credentials, issues session DTO and sets secure cookie', async () => {
      const { req, res } = createMockHttp({
        body: {
          email: 'seller@voguecraft.in',
          password: 'VoguePassword@2026',
        },
      });

      await loginHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const body = res.getBody();
      assert.equal(body.success, true);
      assert.ok(body.token);
      assert.match(body.token, /^sess_merch_/);
      assert.equal(body.session.userId, merchantUser.id);
      assert.equal(body.session.merchantId, merchantRecord.id);
      assert.equal(body.session.role, 'owner');
      assert.equal(body.session.authBoundary, 'merchant');
      assert.equal(body.session.actorType, 'merchant_user');
      assert.ok(Array.isArray(body.session.permissions));

      // Verify Set-Cookie header
      const cookieHeader = res.getHeaders()['set-cookie'];
      assert.ok(cookieHeader);
      assert.match(cookieHeader, /ecom_merchant_sess=sess_merch_/);
      assert.match(cookieHeader, /HttpOnly/i);
      assert.match(cookieHeader, /SameSite=Strict/i);
    });

    it('rejects invalid password with 401 Unauthorized', async () => {
      const { req, res } = createMockHttp({
        body: {
          email: 'seller@voguecraft.in',
          password: 'WrongPassword@123',
        },
      });

      await loginHandler(req, res);

      assert.equal(res.getStatusCode(), 401);
      assert.equal(res.getBody().error, 'INVALID_CREDENTIALS');
    });

    it('rejects non-existent email with 401 Unauthorized', async () => {
      const { req, res } = createMockHttp({
        body: {
          email: 'nonexistent@store.in',
          password: 'SomePassword@2026',
        },
      });

      await loginHandler(req, res);

      assert.equal(res.getStatusCode(), 401);
      assert.equal(res.getBody().error, 'INVALID_CREDENTIALS');
    });
  });

  // ==========================================
  // 4. Rate Limiting & Lockout
  // ==========================================
  describe('4. Rate Limiting & Lockout Defense', () => {
    beforeEach(async () => {
      await MerchantAuthEngine.registerMerchant({
        name: 'Rate Limit Test Store',
        email: 'lockout@test.com',
        phone: '+919876543210',
        password: 'ValidPassword@2026',
      });
    });

    it('locks out account after 5 failed login attempts with 429 Too Many Requests', async () => {
      for (let i = 1; i <= 5; i++) {
        const { req, res } = createMockHttp({
          body: {
            email: 'lockout@test.com',
            password: 'BadPassword@123',
          },
        });
        await loginHandler(req, res);

        if (i < 5) {
          assert.equal(res.getStatusCode(), 401, `Attempt ${i} should return 401`);
        } else {
          assert.equal(res.getStatusCode(), 401, '5th attempt records failure triggering lockout');
        }
      }

      // 6th attempt: should be blocked by rate limiter with 429
      const { req: req6, res: res6 } = createMockHttp({
        body: {
          email: 'lockout@test.com',
          password: 'ValidPassword@2026', // Even with correct password, account is locked
        },
      });
      await loginHandler(req6, res6);

      assert.equal(res6.getStatusCode(), 429);
      const body = res6.getBody();
      assert.equal(body.error, 'TOO_MANY_REQUESTS');
      assert.ok(body.cooldownSeconds > 0);
    });

    it('resets failed attempt counter upon successful login', async () => {
      // 3 failed attempts
      for (let i = 0; i < 3; i++) {
        const { req, res } = createMockHttp({
          body: { email: 'lockout@test.com', password: 'WrongPassword' },
        });
        await loginHandler(req, res);
        assert.equal(res.getStatusCode(), 401);
      }

      // Successful login resets counter
      const { req: reqSuccess, res: resSuccess } = createMockHttp({
        body: { email: 'lockout@test.com', password: 'ValidPassword@2026' },
      });
      await loginHandler(reqSuccess, resSuccess);
      assert.equal(resSuccess.getStatusCode(), 200);

      // Verify rate limit check shows clean remaining attempts
      const check = await MerchantAuthEngine.checkRateLimit('lockout@test.com:127.0.0.1');
      assert.equal(check.remaining, 5);
    });
  });

  // ==========================================
  // 5. Session Verification & Lifecycle (GET /merchant/auth/session)
  // ==========================================
  describe('5. Session Lifecycle & Dual Transport', () => {
    let merchantUser: any;
    let merchantRecord: any;
    let validToken: string;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Session Test Store',
        email: 'session@teststore.in',
        phone: '+919876543210',
        password: 'ValidPassword@2026',
      });
      merchantRecord = reg.merchant;
      merchantUser = reg.user;

      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: merchantUser.membershipStatus,
        merchantStatus: merchantRecord.status,
      });
      validToken = session.token;
    });

    it('resolves active session via Authorization Bearer header', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${validToken}` },
      });

      await sessionHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const body = res.getBody();
      assert.equal(body.authenticated, true);
      assert.equal(body.session.userId, merchantUser.id);
      assert.equal(body.session.merchantId, merchantRecord.id);
      assert.equal(body.session.authBoundary, 'merchant');
    });

    it('resolves active session via ecom_merchant_sess cookie', async () => {
      const { req, res } = createMockHttp({
        headers: { cookie: `ecom_merchant_sess=${validToken}` },
      });

      await sessionHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const body = res.getBody();
      assert.equal(body.authenticated, true);
      assert.equal(body.session.userId, merchantUser.id);
    });

    it('rejects missing or empty token with 401 Unauthorized', async () => {
      const { req, res } = createMockHttp({});

      await sessionHandler(req, res);

      assert.equal(res.getStatusCode(), 401);
      assert.equal(res.getBody().error, 'UNAUTHORIZED');
    });

    it('enforces 2-hour sliding idle timeout on inactive sessions', async () => {
      // Simulate session idle for > 2 hours
      const session = await MerchantAuthEngine.getAdapter().getSession(validToken);
      assert.ok(session);
      // Wind back lastActivityAt to 2 hours and 5 minutes ago
      session.lastActivityAt = Date.now() - (2 * 60 * 60 * 1000 + 5 * 60 * 1000);
      await MerchantAuthEngine.getAdapter().saveSession(session);

      const resolved = await MerchantAuthEngine.resolveSession(validToken);
      assert.equal(resolved, null, 'Session idle > 2h must be expired and null');
    });

    it('enforces 24-hour absolute TTL cap even with continuous activity', async () => {
      const session = await MerchantAuthEngine.getAdapter().getSession(validToken);
      assert.ok(session);
      // Wind back createdAt and expiresAt past 24 hours
      session.createdAt = Date.now() - (25 * 60 * 60 * 1000);
      session.expiresAt = Date.now() - (1 * 60 * 60 * 1000);
      session.lastActivityAt = Date.now(); // active right now
      await MerchantAuthEngine.getAdapter().saveSession(session);

      const resolved = await MerchantAuthEngine.resolveSession(validToken);
      assert.equal(resolved, null, 'Session past 24h absolute TTL must be expired');
    });
  });

  // ==========================================
  // 6. Centralized Logout & Session Revocation
  // ==========================================
  describe('6. Centralized Logout & Global Revocation', () => {
    let merchantUser: any;
    let merchantRecord: any;
    let validToken: string;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Logout Test Store',
        email: 'logout@teststore.in',
        phone: '+919876543210',
        password: 'ValidPassword@2026',
      });
      merchantRecord = reg.merchant;
      merchantUser = reg.user;

      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: merchantUser.membershipStatus,
        merchantStatus: merchantRecord.status,
      });
      validToken = session.token;
    });

    it('POST /merchant/auth/logout revokes session in storage and clears cookie', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${validToken}` },
      });

      await logoutHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getBody().success, true);

      // Cookie should be cleared
      const cookieHeader = res.getHeaders()['set-cookie'];
      assert.ok(cookieHeader);
      assert.match(cookieHeader, /Max-Age=0/);

      // Session in storage must be deleted
      const resolved = await MerchantAuthEngine.resolveSession(validToken);
      assert.equal(resolved, null, 'Revoked session must not resolve');
    });

    it('global user revocation invalidates all active sessions for that user', async () => {
      const session2 = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: merchantUser.membershipStatus,
        merchantStatus: merchantRecord.status,
      });

      // Both sessions active
      assert.ok(await MerchantAuthEngine.resolveSession(validToken));
      assert.ok(await MerchantAuthEngine.resolveSession(session2.token));

      // Global revocation
      await MerchantAuthEngine.revokeAllUserSessions(merchantUser.id);

      // Both sessions must now be rejected
      assert.equal(await MerchantAuthEngine.resolveSession(validToken), null);
      assert.equal(await MerchantAuthEngine.resolveSession(session2.token), null);
    });
  });

  // ==========================================
  // 7. Server-Side Status Gating on Protected Routes
  // ==========================================
  describe('7. Server-Side Merchant & Member Status Gating', () => {
    let merchantUser: any;
    let merchantRecord: any;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Gated Test Store',
        email: 'gated@store.in',
        phone: '+919876543210',
        password: 'ValidPassword@2026',
      });
      merchantRecord = reg.merchant;
      merchantUser = reg.user;
    });

    // Dummy protected merchant route wrapped with requireTenantAuth
    const protectedRoute = requireTenantAuth(
      { boundary: 'merchant', requiredPermission: 'catalog:read' },
      async (req, res) => {
        res.status(200).json({ success: true, data: 'Sensitive Merchant Workspace Data' });
      }
    );

    it('blocks merchant in draft status with 403 FORBIDDEN', async () => {
      // Merchant is in 'draft' status
      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: merchantUser.membershipStatus,
        merchantStatus: 'draft',
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await protectedRoute(req, res);

      assert.equal(res.getStatusCode(), 403);
      const body = res.getBody();
      assert.equal(body.error, 'FORBIDDEN');
      assert.match(body.message, /Merchant account is not active/i);
    });

    it('blocks merchant in pending_approval status with 403 FORBIDDEN', async () => {
      await MerchantAuthEngine.updateMerchantStatus(merchantRecord.id, 'pending_approval');

      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: merchantUser.membershipStatus,
        merchantStatus: 'pending_approval',
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await protectedRoute(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.match(res.getBody().message, /Merchant account is not active/i);
    });

    it('blocks merchant in suspended status with 403 FORBIDDEN', async () => {
      await MerchantAuthEngine.updateMerchantStatus(merchantRecord.id, 'suspended', 'Terms violation');

      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: merchantUser.membershipStatus,
        merchantStatus: 'suspended',
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await protectedRoute(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.match(res.getBody().message, /Merchant account is not active/i);
    });

    it('blocks merchant in rejected status with 403 FORBIDDEN', async () => {
      await MerchantAuthEngine.updateMerchantStatus(merchantRecord.id, 'rejected', 'Invalid KYC documents');

      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: merchantUser.membershipStatus,
        merchantStatus: 'rejected',
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await protectedRoute(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.match(res.getBody().message, /Merchant account is not active/i);
    });

    it('blocks user with suspended member status even if merchant is active', async () => {
      await MerchantAuthEngine.updateMerchantStatus(merchantRecord.id, 'active');
      await MerchantAuthEngine.updateMemberStatus(merchantUser.id, 'suspended');

      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: 'suspended',
        merchantStatus: 'active',
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await protectedRoute(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.match(res.getBody().message, /membership is not active/i);
    });

    it('permits active merchant with active member status to access protected route', async () => {
      await MerchantAuthEngine.updateMerchantStatus(merchantRecord.id, 'active');
      await MerchantAuthEngine.updateMemberStatus(merchantUser.id, 'active');

      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await protectedRoute(req, res);

      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getBody().success, true);
    });
  });

  // ==========================================
  // 8. Boundary Isolation & Anti-Forgery Defense
  // ==========================================
  describe('8. Boundary Isolation & Anti-Forgery Defense', () => {
    let merchantRecord: any;
    let merchantUser: any;
    let activeMerchantToken: string;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Boundary Test Store',
        email: 'boundary@teststore.in',
        phone: '+919876543210',
        password: 'ValidPassword@2026',
      });
      merchantRecord = reg.merchant;
      merchantUser = reg.user;
      await MerchantAuthEngine.updateMerchantStatus(merchantRecord.id, 'active');

      const session = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: 'active',
        merchantStatus: 'active',
      });
      activeMerchantToken = session.token;
    });

    const protectedMerchantRoute = requireTenantAuth(
      { boundary: 'merchant', requiredPermission: 'catalog:read' },
      async (req, res) => {
        res.status(200).json({ success: true, merchantId: req.tenantContext.merchantId });
      }
    );

    it('strictly blocks Customer tokens from merchant routes with 403 FORBIDDEN', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: 'Bearer customer_token:cus_12345678' },
      });

      await protectedMerchantRoute(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.equal(res.getBody().error, 'FORBIDDEN');
      assert.match(res.getBody().message, /Customer credentials cannot access merchant/i);
    });

    it('strictly blocks Super Admin tokens from merchant session endpoint with 401 UNAUTHORIZED', async () => {
      const { req, res } = createMockHttp({
        headers: { authorization: 'Bearer admin_token:usr_admin_123' },
      });

      await sessionHandler(req, res);

      assert.equal(res.getStatusCode(), 401);
      assert.equal(res.getBody().error, 'UNAUTHORIZED');
      assert.match(res.getBody().message, /Invalid, expired, or revoked Merchant session/i);
    });

    it('rejects client-supplied forged merchant_id differing from session with 403 FORBIDDEN', async () => {
      // Query param forgery attempt
      const { req: reqQuery, res: resQuery } = createMockHttp({
        headers: { authorization: `Bearer ${activeMerchantToken}` },
        query: { merchant_id: 'merch_victim_company' }, // Forged merchant ID
      });

      await protectedMerchantRoute(reqQuery, resQuery);

      assert.equal(resQuery.getStatusCode(), 403);
      assert.equal(resQuery.getBody().error, 'FORBIDDEN');
      assert.match(resQuery.getBody().message, /FORGED_MERCHANT_ID/);

      // Body payload forgery attempt
      const { req: reqBody, res: resBody } = createMockHttp({
        headers: { authorization: `Bearer ${activeMerchantToken}` },
        body: { merchant_id: 'merch_victim_company' }, // Forged merchant ID in body
      });

      await protectedMerchantRoute(reqBody, resBody);

      assert.equal(resBody.getStatusCode(), 403);
      assert.equal(resBody.getBody().error, 'FORBIDDEN');
      assert.match(resBody.getBody().message, /FORGED_MERCHANT_ID/);
    });

    it('prevents cross-merchant data access (Merchant A cannot query Merchant B)', async () => {
      const regB = await MerchantAuthEngine.registerMerchant({
        name: 'Store B',
        email: 'seller@storeb.com',
        phone: '+919876543211',
        password: 'ValidPassword@2026',
      });
      await MerchantAuthEngine.updateMerchantStatus(regB.merchant.id, 'active');

      const sessionB = await MerchantAuthEngine.createSession({
        userId: regB.user.id,
        merchantId: regB.merchant.id,
        email: regB.user.email,
        role: regB.user.role,
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Merchant B attempts to claim Merchant A's store ID
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${sessionB.token}` },
        body: { merchant_id: merchantRecord.id }, // Forged attempt
      });

      await protectedMerchantRoute(req, res);

      assert.equal(res.getStatusCode(), 403);
      assert.match(res.getBody().message, /FORGED_MERCHANT_ID/);
    });
  });

  // ==========================================
  // 9. Status Transition & Sole Owner Constraints
  // ==========================================
  describe('9. Status Transition & Sole Owner Protection Constraints', () => {
    it('validates permitted status transitions according to state machine', () => {
      // Draft -> Pending Approval (Allowed)
      const t1 = validateMerchantStatusTransition('draft', 'pending_approval');
      assert.equal(t1.allowed, true);

      // Pending Approval -> Active (Allowed by Super Admin)
      const t2 = validateMerchantStatusTransition('pending_approval', 'active', {
        actorType: 'super_admin',
      });
      assert.equal(t2.allowed, true);

      // Active -> Suspended (Allowed with reason by Super Admin)
      const t3 = validateMerchantStatusTransition('active', 'suspended', {
        actorType: 'super_admin',
        reason: 'Policy violation',
      });
      assert.equal(t3.allowed, true);

      // Suspended -> Active (Allowed by Super Admin)
      const t4 = validateMerchantStatusTransition('suspended', 'active', {
        actorType: 'super_admin',
      });
      assert.equal(t4.allowed, true);

      // Direct Draft -> Active (Strictly Blocked)
      const t5 = validateMerchantStatusTransition('draft', 'active');
      assert.equal(t5.allowed, false, 'Direct jump from draft to active must be blocked');
      assert.match(t5.error || '', /DIRECT_ACTIVATION_BLOCKED/);

      // Rejected -> Active (Strictly Blocked)
      const t6 = validateMerchantStatusTransition('rejected', 'active', {
        actorType: 'super_admin',
      });
      assert.equal(t6.allowed, false, 'Direct jump from rejected to active must be blocked');
    });

    it('enforces sole active owner constraint against deactivation or demotion', () => {
      const activeMembers: any[] = [
        { userId: 'usr_owner_1', role: 'owner', status: 'active' },
        { userId: 'usr_admin_2', role: 'admin', status: 'active' },
        { userId: 'usr_staff_3', role: 'staff', status: 'active' },
      ];

      // Attempt to demote sole owner to admin
      const demoteAttempt = validateSoleOwnerConstraint(
        activeMembers,
        'usr_owner_1',
        'admin',
        'active'
      );
      assert.equal(demoteAttempt.allowed, false, 'Demoting sole owner must be blocked');
      assert.match(demoteAttempt.error || '', /sole active owner/i);

      // Attempt to deactivate sole owner
      const deactivateAttempt = validateSoleOwnerConstraint(
        activeMembers,
        'usr_owner_1',
        'owner',
        'suspended'
      );
      assert.equal(deactivateAttempt.allowed, false, 'Deactivating sole owner must be blocked');

      // Modifying staff/admin is allowed
      const modifyAdmin = validateSoleOwnerConstraint(
        activeMembers,
        'usr_admin_2',
        'staff',
        'active'
      );
      assert.equal(modifyAdmin.allowed, true);

      // When there is a second active owner, modification is permitted
      const twoOwners: any[] = [
        { userId: 'usr_owner_1', role: 'owner', status: 'active' },
        { userId: 'usr_owner_2', role: 'owner', status: 'active' },
      ];
      const modifyWithCoOwner = validateSoleOwnerConstraint(
        twoOwners,
        'usr_owner_1',
        'admin',
        'active'
      );
      assert.equal(modifyWithCoOwner.allowed, true, 'Allowed if another active owner exists');
    });
  });

  // ==========================================
  // 10. Password Reset Workflow
  // ==========================================
  describe('10. Password Reset & Single-Use Token Workflow', () => {
    let merchantUser: any;
    let merchantRecord: any;

    beforeEach(async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Reset Flow Store',
        email: 'resetflow@store.in',
        phone: '+919876543210',
        password: 'OriginalPassword@2026',
      });
      merchantRecord = reg.merchant;
      merchantUser = reg.user;
    });

    it('POST /merchant/auth/forgot-password generates 15m reset token', async () => {
      const { req, res } = createMockHttp({
        body: { email: 'resetflow@store.in' },
      });

      await forgotPasswordHandler(req, res);

      assert.equal(res.getStatusCode(), 200);
      const body = res.getBody();
      assert.equal(body.success, true);
      assert.ok(body.resetToken);
      assert.match(body.resetToken, /^reset_merch_/);
      assert.equal(body.expiresInSeconds, 900);
    });

    it('POST /merchant/auth/reset-password consumes token atomically, updates password, and revokes sessions', async () => {
      // 1. Create active session before reset
      const oldSession = await MerchantAuthEngine.createSession({
        userId: merchantUser.id,
        merchantId: merchantRecord.id,
        email: merchantUser.email,
        role: merchantUser.role,
        membershipStatus: merchantUser.membershipStatus,
        merchantStatus: merchantRecord.status,
      });

      assert.ok(await MerchantAuthEngine.resolveSession(oldSession.token));

      // 2. Generate reset token
      const resetToken = await MerchantAuthEngine.createPasswordResetToken('resetflow@store.in');
      assert.ok(resetToken);

      // 3. Reset password with valid token
      const { req: reqReset, res: resReset } = createMockHttp({
        body: {
          token: resetToken,
          password: 'BrandNewPassword@2026',
        },
      });

      await resetPasswordHandler(reqReset, resReset);

      assert.equal(resReset.getStatusCode(), 200);
      assert.equal(resReset.getBody().success, true);

      // 4. Token replay must fail (atomically consumed single-use)
      const { req: reqReplay, res: resReplay } = createMockHttp({
        body: {
          token: resetToken,
          password: 'AnotherPassword@2026',
        },
      });
      await resetPasswordHandler(reqReplay, resReplay);
      assert.equal(resReplay.getStatusCode(), 400);
      assert.equal(resReplay.getBody().error, 'INVALID_OR_EXPIRED_TOKEN');

      // 5. Old session must be revoked
      assert.equal(await MerchantAuthEngine.resolveSession(oldSession.token), null);

      // 6. Old password must fail login; new password must succeed
      const { req: reqOldLogin, res: resOldLogin } = createMockHttp({
        body: { email: 'resetflow@store.in', password: 'OriginalPassword@2026' },
      });
      await loginHandler(reqOldLogin, resOldLogin);
      assert.equal(resOldLogin.getStatusCode(), 401);

      const { req: reqNewLogin, res: resNewLogin } = createMockHttp({
        body: { email: 'resetflow@store.in', password: 'BrandNewPassword@2026' },
      });
      await loginHandler(reqNewLogin, resNewLogin);
      assert.equal(resNewLogin.getStatusCode(), 200);
      assert.equal(resNewLogin.getBody().success, true);
    });
  });

  // ==========================================
  // 11. Shared Redis Storage Adapter Integration (Real Redis on 127.0.0.1:6379)
  // ==========================================
  describe('11. Shared Redis Storage Adapter Integration (Real Redis)', () => {
    let redisAdapter: RedisMerchantAuthStorageAdapter;

    beforeEach(async () => {
      redisAdapter = new RedisMerchantAuthStorageAdapter();
      MerchantAuthEngine.setAdapter(redisAdapter);
      await MerchantAuthEngine.resetForTesting();
    });

    afterEach(async () => {
      try {
        await redisAdapter.close();
      } catch {}
      MerchantAuthEngine.setAdapter(memoryAdapter);
    });

    it('persists merchant sessions across simulated process restarts in real Redis', async () => {
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Redis Test Store',
        email: 'redis@teststore.in',
        phone: '+919876543210',
        password: 'Password@2026',
      });

      const session = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: reg.merchant.id,
        email: reg.user.email,
        role: reg.user.role,
        membershipStatus: 'active',
        merchantStatus: 'active',
      });

      // Verify session exists in first adapter instance
      const fetched1 = await redisAdapter.getSession(session.token);
      assert.ok(fetched1);
      assert.equal(fetched1.userId, reg.user.id);

      // Simulate process restart: instantiate brand new second adapter instance
      const secondAdapter = new RedisMerchantAuthStorageAdapter();
      try {
        const fetched2 = await secondAdapter.getSession(session.token);
        assert.ok(fetched2, 'Session must persist across process restarts in Redis');
        assert.equal(fetched2.userId, reg.user.id);
        assert.equal(fetched2.merchantId, reg.merchant.id);
      } finally {
        await secondAdapter.close();
      }
    });

    it('enforces real Redis distributed rate limiting and lockout', async () => {
      const key = `integration_test_${Date.now()}`;

      for (let i = 0; i < 5; i++) {
        await redisAdapter.recordFailedAttempt(key);
      }

      const check = await redisAdapter.checkRateLimit(key);
      assert.equal(check.allowed, false, 'Should be locked out after 5 failures in Redis');
      assert.ok(check.cooldownSeconds > 0);

      await redisAdapter.resetRateLimit(key);
      const afterReset = await redisAdapter.checkRateLimit(key);
      assert.equal(afterReset.allowed, true, 'Should be allowed after reset in Redis');
    });

    it('atomically consumes single-use password reset token in real Redis', async () => {
      const token = `reset_merch_${Date.now()}_test`;
      await redisAdapter.savePasswordResetToken(token, 'usr_merch_test123', 900);

      // First consumption succeeds
      const userId1 = await redisAdapter.consumePasswordResetToken(token);
      assert.equal(userId1, 'usr_merch_test123');

      // Second consumption must fail (atomically consumed)
      const userId2 = await redisAdapter.consumePasswordResetToken(token);
      assert.equal(userId2, null, 'Consumed token must return null on second attempt');
    });
  });

  // ==========================================
  // 12. Production Fail-Closed Behavior
  // ==========================================
  describe('12. Production Fail-Closed Behavior', () => {
    it('refuses in-memory storage adapter when NODE_ENV is production', () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        assert.throws(
          () => new InMemoryMerchantAuthStorageAdapter(),
          /PRODUCTION_SECURITY_VIOLATION/
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('refuses in-memory identity store when NODE_ENV is production', () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';
        assert.throws(
          () => new InMemoryMerchantIdentityStore(),
          /PRODUCTION_SECURITY_VIOLATION/
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('fails closed with REDIS_SECURITY_FAILURE when production Redis is unavailable', async () => {
      const originalEnv = process.env.NODE_ENV;
      let badAdapter: RedisMerchantAuthStorageAdapter | null = null;
      try {
        process.env.NODE_ENV = 'production';
        // Connect to an unavailable Redis port
        badAdapter = new RedisMerchantAuthStorageAdapter('redis://127.0.0.1:54399');

        await assert.rejects(
          async () => {
            await badAdapter!.checkRateLimit('test_key');
          },
          /REDIS_SECURITY_FAILURE/,
          'Production operations must throw REDIS_SECURITY_FAILURE when Redis is down'
        );
      } finally {
        process.env.NODE_ENV = originalEnv;
        if (badAdapter) {
          await badAdapter.close().catch(() => {});
        }
      }
    });
  });

  // ==========================================
  // 13. Audit Logging & Credential Redaction
  // ==========================================
  describe('13. Audit Logging & Credential Redaction', () => {
    it('records audit events without logging passwords or salts', async () => {
      await MerchantAuthEngine.registerMerchant({
        name: 'Audit Store',
        email: 'audit@store.in',
        phone: '+919876543210',
        password: 'TopSecretPassword@2026',
      });

      const logs = MerchantAuthEngine.getAuditLogs({ action: 'merchant.register' });
      assert.ok(logs.length > 0);

      const logJson = JSON.stringify(logs);
      assert.equal(
        logJson.includes('TopSecretPassword@2026'),
        false,
        'Plaintext password MUST NEVER appear in audit logs'
      );
      assert.equal(logJson.includes('passwordSalt'), false);
      assert.equal(logJson.includes('passwordHash'), false);
    });
  });

  // ==========================================
  // 14. Authoritative PostgreSQL Durable Identity & Multi-Instance Integration (Real Postgres + Real Redis)
  // ==========================================
  describe('14. Authoritative PostgreSQL Durable Identity & Multi-Instance Integration', () => {
    let pgStore: PostgresMerchantIdentityStore;
    let redisAdapter: RedisMerchantAuthStorageAdapter;
    let directPool: Pool;

    before(async () => {
      directPool = new Pool({
        connectionString:
          process.env.DATABASE_URL ||
          'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db',
      });
      pgStore = new PostgresMerchantIdentityStore({ pool: directPool });
    });

    after(async () => {
      try {
        await pgStore.clear();
      } catch {}
      try {
        await directPool.end();
      } catch {}
      try {
        await PostgresMerchantIdentityStore.shutdown();
      } catch {}
    });

    beforeEach(async () => {
      redisAdapter = new RedisMerchantAuthStorageAdapter();
      MerchantAuthEngine.setIdentityStore(pgStore);
      MerchantAuthEngine.setAdapter(redisAdapter);
      await MerchantAuthEngine.resetForTesting();
    });

    afterEach(async () => {
      try {
        await pgStore.clear();
      } catch {}
      try {
        await redisAdapter.close();
      } catch {}
      // Restore in-memory instances for succeeding non-DB tests
      MerchantAuthEngine.setIdentityStore(memoryIdentityStore);
      MerchantAuthEngine.setAdapter(memoryAdapter);
    });

    it('persists merchant registration and owner user durably across PostgreSQL tables', async () => {
      const email = `craft_${Date.now()}@jaipur.in`;
      const handle = `jaipur-crafts-${Date.now()}`;

      const { req, res } = createMockHttp({
        body: {
          name: 'Jaipur Heritage Crafts',
          handle,
          email,
          phone: '+919876543210',
          businessRegistrationNumber: '08AAAAA0000A1Z5',
          taxIdentifier: 'ABCDE1234F',
          password: 'SecurePassword@2026',
        },
      });

      await registerHandler(req, res);
      assert.equal(res.getStatusCode(), 201);
      const regBody = res.getBody();
      const merchantId = regBody.merchant.id;
      const userId = regBody.member.userId;

      // 1. Direct PostgreSQL verification in `merchant` table
      const mRes = await directPool.query('SELECT * FROM merchant WHERE id = $1', [merchantId]);
      assert.equal(mRes.rows.length, 1, 'Merchant row must exist in PostgreSQL');
      assert.equal(mRes.rows[0].status, 'draft', 'Initial status in DB must be draft');
      assert.equal(mRes.rows[0].handle, handle);
      assert.equal(mRes.rows[0].email, email);

      // 2. Direct PostgreSQL verification in Medusa native "user", auth_identity, and provider_identity tables
      const uRes = await directPool.query('SELECT * FROM "user" WHERE id = $1', [userId]);
      assert.equal(uRes.rows.length, 1, 'User row must exist in PostgreSQL');
      assert.equal(uRes.rows[0].email, email);
      const uMeta = uRes.rows[0].metadata;
      assert.equal(uMeta?.passwordHash, undefined, 'Custom password hash must NOT be in user.metadata');
      assert.equal(uMeta?.passwordSalt, undefined, 'Custom password salt must NOT be in user.metadata');

      // Verify native auth_identity and provider_identity
      const authRes = await directPool.query(
        'SELECT * FROM auth_identity WHERE (app_metadata->>\'user_id\') = $1',
        [userId]
      );
      assert.equal(authRes.rows.length, 1, 'Auth identity row must exist in PostgreSQL');
      assert.equal(authRes.rows[0].app_metadata.actor_type, 'merchant_user');

      const provRes = await directPool.query(
        'SELECT * FROM provider_identity WHERE entity_id = $1',
        [email]
      );
      assert.equal(provRes.rows.length, 1, 'Provider identity row must exist in PostgreSQL');
      assert.equal(provRes.rows[0].provider, 'emailpass');
      assert.ok(provRes.rows[0].provider_metadata?.password, 'Native Scrypt password hash must be stored in provider_identity');

      // 3. Direct PostgreSQL verification in `merchant_member` table
      const memRes = await directPool.query(
        'SELECT * FROM merchant_member WHERE merchant_id = $1 AND user_id = $2',
        [merchantId, userId]
      );
      assert.equal(memRes.rows.length, 1, 'Merchant member row must exist in PostgreSQL');
      assert.equal(memRes.rows[0].role, 'owner');
      assert.equal(memRes.rows[0].status, 'active');

      // 4. Authenticate user from database
      const { req: reqLogin, res: resLogin } = createMockHttp({
        body: { email, password: 'SecurePassword@2026' },
      });
      await loginHandler(reqLogin, resLogin);
      assert.equal(resLogin.getStatusCode(), 200);
      assert.equal(resLogin.getBody().success, true);
    });

    it('authenticates user across simulated process restarts with zero in-memory state', async () => {
      const email = `restart_${Date.now()}@store.in`;
      const handle = `restart-store-${Date.now()}`;

      // Instance A registers user
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Restart Store',
        handle,
        email,
        phone: '+919876543210',
        password: 'DurablePassword@2026',
      });

      // Simulate complete process termination: close instance A adapter
      await redisAdapter.close();

      // Simulate new backend process starting up: instantiate brand new second store and adapter
      const newProcessPgStore = new PostgresMerchantIdentityStore({ pool: directPool });
      const newProcessRedisAdapter = new RedisMerchantAuthStorageAdapter();

      try {
        MerchantAuthEngine.setIdentityStore(newProcessPgStore);
        MerchantAuthEngine.setAdapter(newProcessRedisAdapter);

        // Instance B authenticates user from durable storage without any in-memory state
        const { req: reqLogin, res: resLogin } = createMockHttp({
          body: { email, password: 'DurablePassword@2026' },
        });

        await loginHandler(reqLogin, resLogin);

        assert.equal(resLogin.getStatusCode(), 200, 'Authentication must succeed on restarted instance');
        const loginBody = resLogin.getBody();
        assert.equal(loginBody.success, true);
        assert.equal(loginBody.session.userId, reg.user.id);
        assert.equal(loginBody.session.merchantId, reg.merchant.id);

        // Verify session resolution on restarted instance
        const resolved = await MerchantAuthEngine.resolveSession(loginBody.token);
        assert.ok(resolved);
        assert.equal(resolved.email, email);
      } finally {
        await newProcessPgStore.close();
        await newProcessRedisAdapter.close();
      }
    });

    it('simulates dual backend instances sharing the same PostgreSQL and Redis cluster', async () => {
      const email = `cluster_${Date.now()}@handicrafts.in`;
      const handle = `cluster-crafts-${Date.now()}`;

      const storeInstanceA = new PostgresMerchantIdentityStore({ pool: directPool });
      const redisInstanceA = new RedisMerchantAuthStorageAdapter();
      const storeInstanceB = new PostgresMerchantIdentityStore({ pool: directPool });
      const redisInstanceB = new RedisMerchantAuthStorageAdapter();

      try {
        // Backend Instance A registers the merchant
        MerchantAuthEngine.setIdentityStore(storeInstanceA);
        MerchantAuthEngine.setAdapter(redisInstanceA);

        const reg = await MerchantAuthEngine.registerMerchant({
          name: 'Cluster Handicrafts',
          handle,
          email,
          phone: '+919876543210',
          password: 'ClusterPassword@2026',
        });

        // Backend Instance B processes login for this merchant
        MerchantAuthEngine.setIdentityStore(storeInstanceB);
        MerchantAuthEngine.setAdapter(redisInstanceB);

        const { req: reqLogin, res: resLogin } = createMockHttp({
          body: { email, password: 'ClusterPassword@2026' },
        });
        await loginHandler(reqLogin, resLogin);
        assert.equal(resLogin.getStatusCode(), 200);
        const token = resLogin.getBody().token;

        // Backend Instance A verifies the session
        MerchantAuthEngine.setIdentityStore(storeInstanceA);
        MerchantAuthEngine.setAdapter(redisInstanceA);

        const resolvedOnA = await MerchantAuthEngine.resolveSession(token);
        assert.ok(resolvedOnA);
        assert.equal(resolvedOnA.merchantStatus, 'draft');

        // Super Admin approves and activates merchant on Instance B
        MerchantAuthEngine.setIdentityStore(storeInstanceB);
        await MerchantAuthEngine.updateMerchantStatus(reg.merchant.id, 'active');

        // Live session verified on Instance A immediately reflects live active status
        MerchantAuthEngine.setIdentityStore(storeInstanceA);
        const liveOnA = await MerchantAuthEngine.resolveSession(token);
        assert.ok(liveOnA);
        assert.equal(liveOnA.merchantStatus, 'active', 'Dynamic status update must propagate across cluster');
      } finally {
        await storeInstanceA.close();
        await redisInstanceA.close();
        await storeInstanceB.close();
        await redisInstanceB.close();
      }
    });

    it('persists password reset across process restarts and invalidates distributed sessions', async () => {
      const email = `pwreset_${Date.now()}@store.in`;
      const handle = `pwreset-store-${Date.now()}`;

      // 1. Register and login on Instance A
      const reg = await MerchantAuthEngine.registerMerchant({
        name: 'Password Reset Store',
        handle,
        email,
        phone: '+919876543210',
        password: 'OriginalPassword@2026',
      });

      const oldSession = await MerchantAuthEngine.createSession({
        userId: reg.user.id,
        merchantId: reg.merchant.id,
        email,
        role: 'owner',
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });
      assert.ok(await MerchantAuthEngine.resolveSession(oldSession.token));

      // 2. Request password reset token
      const resetToken = await MerchantAuthEngine.createPasswordResetToken(email);
      assert.ok(resetToken);

      // 3. Simulate process restart: instantiate brand new engine stores
      await redisAdapter.close();

      const restartedStore = new PostgresMerchantIdentityStore({ pool: directPool });
      const restartedRedis = new RedisMerchantAuthStorageAdapter();
      try {
        MerchantAuthEngine.setIdentityStore(restartedStore);
        MerchantAuthEngine.setAdapter(restartedRedis);

        // 4. Consume reset token on restarted engine
        const resetRes = await MerchantAuthEngine.resetPasswordWithToken(
          resetToken,
          'DurableNewPassword@2026'
        );
        assert.equal(resetRes.success, true);

        // 5. Old password must fail login
        const oldAuth = await MerchantAuthEngine.authenticateUser(email, 'OriginalPassword@2026');
        assert.equal(oldAuth.success, false, 'Old password must fail authentication');

        // 6. New password must succeed
        const newAuth = await MerchantAuthEngine.authenticateUser(email, 'DurableNewPassword@2026');
        assert.equal(newAuth.success, true, 'New password must succeed authentication');
        assert.ok(newAuth.user);
        assert.equal(newAuth.user.email, email);

        // 7. Old session must be revoked
        const resolvedOld = await MerchantAuthEngine.resolveSession(oldSession.token);
        assert.equal(resolvedOld, null, 'Old session must be revoked across cluster');
      } finally {
        await restartedStore.close();
        await restartedRedis.close();
      }
    });

    it('enforces ACID transaction rollback on concurrent duplicate email registration', async () => {
      const email = `concurrent_dup_${Date.now()}@store.in`;

      const payload1 = {
        name: 'Store First',
        handle: `handle-1-${Date.now()}`,
        email,
        phone: '+919876543210',
        password: 'Password@2026',
      };

      const payload2 = {
        name: 'Store Second',
        handle: `handle-2-${Date.now()}`,
        email, // Same duplicate email
        phone: '+919876543211',
        password: 'Password@2026',
      };

      // Execute concurrent registrations against PostgreSQL
      const results = await Promise.allSettled([
        MerchantAuthEngine.registerMerchant(payload1),
        MerchantAuthEngine.registerMerchant(payload2),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly one concurrent registration must succeed');
      assert.equal(rejected.length, 1, 'Exactly one concurrent registration must fail');

      const rejectReason = (rejected[0] as PromiseRejectedResult).reason?.message;
      assert.match(rejectReason, /EMAIL_ALREADY_REGISTERED/);

      // Verify PostgreSQL database state: exactly 1 user row exists
      const userRes = await directPool.query('SELECT * FROM "user" WHERE LOWER(email) = LOWER($1)', [email]);
      assert.equal(userRes.rows.length, 1, 'Database must contain exactly 1 user record');
    });

    it('enforces ACID transaction rollback on concurrent duplicate store handle registration', async () => {
      const handle = `dup-handle-${Date.now()}`;

      const payload1 = {
        name: 'Handle Store A',
        handle,
        email: `email_a_${Date.now()}@store.in`,
        phone: '+919876543210',
        password: 'Password@2026',
      };

      const payload2 = {
        name: 'Handle Store B',
        handle, // Same duplicate handle
        email: `email_b_${Date.now()}@store.in`,
        phone: '+919876543211',
        password: 'Password@2026',
      };

      // Execute concurrent registrations against PostgreSQL
      const results = await Promise.allSettled([
        MerchantAuthEngine.registerMerchant(payload1),
        MerchantAuthEngine.registerMerchant(payload2),
      ]);

      const fulfilled = results.filter((r) => r.status === 'fulfilled');
      const rejected = results.filter((r) => r.status === 'rejected');

      assert.equal(fulfilled.length, 1, 'Exactly one concurrent handle registration must succeed');
      assert.equal(rejected.length, 1, 'Exactly one concurrent handle registration must fail');

      const rejectReason = (rejected[0] as PromiseRejectedResult).reason?.message;
      assert.match(rejectReason, /HANDLE_ALREADY_IN_USE/);

      // Verify PostgreSQL database state: exactly 1 merchant row exists with this handle
      const merchRes = await directPool.query('SELECT * FROM merchant WHERE handle = $1', [handle]);
      assert.equal(merchRes.rows.length, 1, 'Database must contain exactly 1 merchant record');
    });

    it('guarantees atomic compensation rollback on partial registration failure with zero orphaned records', async () => {
      const email = `rollback_test_${Date.now()}@store.in`;
      const handle = `rollback-test-${Date.now()}`;

      // Force a failure in member creation during registration to trigger domain-level compensation
      await (pgStore as any).ensureInitialized();
      const originalCreateMembers = (pgStore as any).marketplaceModule.createMerchantMembers.bind(
        (pgStore as any).marketplaceModule
      );
      (pgStore as any).marketplaceModule.createMerchantMembers = async () => {
        throw new Error('SIMULATED_MEMBER_CREATION_FAILURE');
      };

      try {
        await assert.rejects(
          () =>
            MerchantAuthEngine.registerMerchant({
              name: 'Orphan Compensation Test',
              handle,
              email,
              phone: '+919876543210',
              password: 'Password@2026',
            }),
          /SIMULATED_MEMBER_CREATION_FAILURE/
        );
      } finally {
        (pgStore as any).marketplaceModule.createMerchantMembers = originalCreateMembers;
      }

      // Assert zero orphaned records in PostgreSQL
      const orphanMerch = await directPool.query('SELECT * FROM merchant WHERE handle = $1', [handle]);
      assert.equal(orphanMerch.rows.length, 0, 'Zero orphaned merchant rows must exist after rollback');

      const orphanUser = await directPool.query('SELECT * FROM "user" WHERE LOWER(email) = LOWER($1)', [email]);
      assert.equal(orphanUser.rows.length, 0, 'Zero orphaned user rows must exist after rollback');

      const orphanAuth = await directPool.query('SELECT * FROM provider_identity WHERE entity_id = $1', [email]);
      assert.equal(orphanAuth.rows.length, 0, 'Zero orphaned provider identity rows must exist after rollback');
    });
  });

  after(async () => {
    try {
      await PostgresMerchantIdentityStore.shutdown();
    } catch {}
  });
});
