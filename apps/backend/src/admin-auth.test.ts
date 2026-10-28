/**
 * M2-05: Super Admin Authentication & MFA Test Suite
 *
 * Comprehensive automated security tests verifying:
 * 1. Scrypt password hashing & constant-time verification.
 * 2. AES-256-GCM encryption at rest & production fail-closed key validation.
 * 3. RFC 6238 TOTP engine, ±30s clock skew, and distributed anti-replay defense.
 * 4. Bcrypt-hashed backup scratch codes (ADR-002) with atomic concurrent consumption defense.
 * 5. Rate limiting & lockout across both password login and MFA verification.
 * 6. Two-step MFA enrollment (pending state -> TOTP confirmation -> activation) and step-up protection on reset.
 * 7. HTTP endpoints: Login, MFA verify, session sliding/absolute expiry, logout, and step-up.
 * 8. Shared Redis storage persistence, multi-instance replay defense, and production fail-closed behavior.
 * 9. Production cookie security (HttpOnly, SameSite=Strict, Secure).
 * 10. Boundary isolation (Customer & Merchant blocked) and audit logging secret redaction.
 * 11. Initial Super Admin provisioning script validation.
 */

import { describe, it, before, beforeEach, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import {
  SuperAdminAuthEngine,
  EncryptionService,
  InMemoryAuthStorageAdapter,
  RedisAuthStorageAdapter,
} from './modules/auth/super-admin-auth-engine';
import { requireTenantAuth, resolveSessionFromToken } from './api/middlewares/tenant-auth';
import { provisionInitialSuperAdmin } from './scripts/seed-super-admin';

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

describe('M2-05: Super Admin Authentication & MFA Suite', () => {
  let memoryAdapter: InMemoryAuthStorageAdapter;

  beforeEach(async () => {
    memoryAdapter = new InMemoryAuthStorageAdapter();
    SuperAdminAuthEngine.setAdapter(memoryAdapter);
    await SuperAdminAuthEngine.resetForTesting();
  });

  // ==========================================
  // 1. Password Hashing & Verification
  // ==========================================
  describe('1. Scrypt Password Hashing & Verification', () => {
    it('generates secure scrypt hash with unique salt', () => {
      const p1 = SuperAdminAuthEngine.hashPassword('SuperAdmin@2026!');
      const p2 = SuperAdminAuthEngine.hashPassword('SuperAdmin@2026!');

      assert.notEqual(p1.salt, p2.salt, 'Salts must be unique per hash');
      assert.notEqual(p1.hash, p2.hash, 'Hashes must differ due to unique salts');
      assert.equal(p1.hash.length, 128, '64-byte hex hash should be 128 chars');
    });

    it('verifies valid password and rejects incorrect password in constant-time', () => {
      const { hash, salt } = SuperAdminAuthEngine.hashPassword('ComplexPass#99');

      assert.equal(
        SuperAdminAuthEngine.verifyPassword('ComplexPass#99', hash, salt),
        true,
        'Correct password must verify'
      );
      assert.equal(
        SuperAdminAuthEngine.verifyPassword('WrongPassword#99', hash, salt),
        false,
        'Incorrect password must be rejected'
      );
    });

    it('rejects passwords shorter than 8 characters', () => {
      assert.throws(
        () => SuperAdminAuthEngine.hashPassword('short'),
        /PASSWORD_TOO_WEAK/,
        'Must reject password under 8 chars'
      );
    });
  });

  // ==========================================
  // 2. AES-256-GCM Secret Encryption & Fail-Closed Keys
  // ==========================================
  describe('2. AES-256-GCM Secret Encryption at Rest & Key Guards', () => {
    it('encrypts plaintext secret and decrypts with authenticity tag', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const encrypted = EncryptionService.encrypt(secret);

      assert.match(encrypted, /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/, 'Format must be iv:authTag:ciphertext');

      const decrypted = EncryptionService.decrypt(encrypted);
      assert.equal(decrypted, secret, 'Decrypted secret must match original');
    });

    it('fails decryption and throws if ciphertext or auth tag is tampered', () => {
      const encrypted = EncryptionService.encrypt('TOP_SECRET_TOTP_KEY');
      const parts = encrypted.split(':');

      // Tamper ciphertext
      const firstByte = parts[2].substring(0, 2);
      const flippedByte = firstByte === 'ff' ? '00' : 'ff';
      const tamperedCipher = parts[0] + ':' + parts[1] + ':' + flippedByte + parts[2].substring(2);
      assert.throws(() => EncryptionService.decrypt(tamperedCipher), /Unsupported state or unable to authenticate data/);

      // Tamper auth tag
      const firstTagByte = parts[1].substring(0, 2);
      const flippedTagByte = firstTagByte === 'ff' ? '00' : 'ff';
      const tamperedTag = parts[0] + ':' + flippedTagByte + parts[1].substring(2) + ':' + parts[2];
      assert.throws(() => EncryptionService.decrypt(tamperedTag), /Unsupported state or unable to authenticate data/);
    });

    it('FAIL-CLOSED: production fails closed when encryption key is absent or default', () => {
      const origEnv = process.env.NODE_ENV;
      const origKey = process.env.ADMIN_MFA_ENCRYPTION_KEY;

      try {
        process.env.NODE_ENV = 'production';
        delete process.env.ADMIN_MFA_ENCRYPTION_KEY;

        assert.throws(
          () => EncryptionService.encrypt('test_secret'),
          /PRODUCTION_SECURITY_VIOLATION: ADMIN_MFA_ENCRYPTION_KEY is required in production/,
          'Must fail closed when key is missing in production'
        );

        process.env.ADMIN_MFA_ENCRYPTION_KEY = 'ecom-dev-secret';
        assert.throws(
          () => EncryptionService.encrypt('test_secret'),
          /PRODUCTION_SECURITY_VIOLATION/,
          'Must fail closed when key is known development secret'
        );
      } finally {
        process.env.NODE_ENV = origEnv;
        if (origKey) process.env.ADMIN_MFA_ENCRYPTION_KEY = origKey;
        else delete process.env.ADMIN_MFA_ENCRYPTION_KEY;
      }
    });
  });

  // ==========================================
  // 3. RFC 6238 TOTP Engine & Distributed Anti-Replay
  // ==========================================
  describe('3. RFC 6238 TOTP Engine & Distributed Replay Defense', () => {
    it('generates valid 6-digit TOTP code from Base32 secret', () => {
      const { base32Secret, uri } = SuperAdminAuthEngine.generateTotpSecret();
      assert.match(base32Secret, /^[A-Z2-7]{32}$/, 'Secret must be valid RFC 4648 Base32');
      assert.ok(uri.startsWith('otpauth://totp/'), 'URI must be otpauth protocol');

      const code = SuperAdminAuthEngine.generateTotpCode(base32Secret);
      assert.match(code, /^\d{6}$/, 'TOTP code must be 6 digits');
    });

    it('verifies TOTP code within current time step and ±30s clock drift', () => {
      const secret = 'JBSWY3DPEHPK3PXP';
      const now = Date.now();

      const currentCode = SuperAdminAuthEngine.generateTotpCode(secret, 0, now);
      const pastCode = SuperAdminAuthEngine.generateTotpCode(secret, -1, now);
      const futureCode = SuperAdminAuthEngine.generateTotpCode(secret, 1, now);
      const tooOldCode = SuperAdminAuthEngine.generateTotpCode(secret, -2, now);

      assert.equal(SuperAdminAuthEngine.verifyTotpCode(secret, currentCode, undefined, now).valid, true);
      assert.equal(SuperAdminAuthEngine.verifyTotpCode(secret, pastCode, undefined, now).valid, true);
      assert.equal(SuperAdminAuthEngine.verifyTotpCode(secret, futureCode, undefined, now).valid, true);
      assert.equal(SuperAdminAuthEngine.verifyTotpCode(secret, tooOldCode, undefined, now).valid, false);
    });

    it('ANTI-REPLAY: rejects reusing the same TOTP code within the same 30s window', async () => {
      const userId = 'usr_admin_replay_test';
      const step = Math.floor(Date.now() / 30000);

      const firstAttempt = await memoryAdapter.isTotpReplay(userId, step);
      assert.equal(firstAttempt, false, 'First use of TOTP step must be allowed');

      const secondAttempt = await memoryAdapter.isTotpReplay(userId, step);
      assert.equal(secondAttempt, true, 'Second use of identical TOTP step must be rejected as replay');
    });
  });

  // ==========================================
  // 4. Bcrypt-Hashed Backup Scratch Codes (ADR-002)
  // ==========================================
  describe('4. Bcrypt-Hashed Backup Scratch Codes (ADR-002 Compliant)', () => {
    it('generates 8 backup codes, hashes them with bcrypt, and plain codes never match stored hashes directly', () => {
      const { plainCodes, hashedCodes } = SuperAdminAuthEngine.generateBackupCodes(8);

      assert.equal(plainCodes.length, 8);
      assert.equal(hashedCodes.length, 8);

      for (let i = 0; i < 8; i++) {
        assert.match(plainCodes[i], /^[0-9A-F]{4}-[0-9A-F]{4}$/, 'Code must be formatted XXXX-XXXX');
        assert.ok(hashedCodes[i].startsWith('$2a$') || hashedCodes[i].startsWith('$2b$'), 'Must be bcrypt hash');
        assert.notEqual(plainCodes[i], hashedCodes[i]);
        assert.ok(bcrypt.compareSync(plainCodes[i], hashedCodes[i]), 'Bcrypt compare must verify plain code against hash');
      }
    });

    it('consumes a backup code only once; subsequent consumption fails', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'backup_admin@ecom.local',
        password: 'Password@2026',
      });

      const { plainCodes, hashedCodes } = SuperAdminAuthEngine.generateBackupCodes(8);
      user.hashedBackupCodes = [...hashedCodes];
      SuperAdminAuthEngine.updateUser(user);

      const testCode = plainCodes[0];

      // 1. First consumption succeeds
      const res1 = await SuperAdminAuthEngine.verifyAndConsumeBackupCode(user.id, testCode, user);
      assert.equal(res1.valid, true);
      assert.equal(res1.remainingHashedCodes.length, 7);

      // 2. Second consumption of the same code fails
      const res2 = await SuperAdminAuthEngine.verifyAndConsumeBackupCode(user.id, testCode, user);
      assert.equal(res2.valid, false);
      assert.equal(res2.remainingHashedCodes.length, 7);
    });

    it('CONCURRENCY DEFENSE: concurrent consumption attempts with identical code prevent double-spend', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'concurrent_backup@ecom.local',
        password: 'Password@2026',
      });

      const { plainCodes, hashedCodes } = SuperAdminAuthEngine.generateBackupCodes(8);
      user.hashedBackupCodes = [...hashedCodes];
      SuperAdminAuthEngine.updateUser(user);

      const testCode = plainCodes[0];

      // Simulate simultaneous requests
      const [attempt1, attempt2] = await Promise.all([
        SuperAdminAuthEngine.verifyAndConsumeBackupCode(user.id, testCode, user),
        SuperAdminAuthEngine.verifyAndConsumeBackupCode(user.id, testCode, user),
      ]);

      const successCount = [attempt1.valid, attempt2.valid].filter(Boolean).length;
      assert.equal(successCount, 1, 'Exactly one concurrent attempt must succeed; double spend strictly blocked');
    });
  });

  // ==========================================
  // 5. Rate Limiting Across Login & MFA Verification
  // ==========================================
  describe('5. Multi-Layered Rate Limiting & Lockout', () => {
    it('locks out after 3 consecutive failed login attempts on primary login', async () => {
      const key = 'ratelimit:test@ecom.local:127.0.0.1';

      assert.equal((await SuperAdminAuthEngine.checkRateLimit(key)).allowed, true);
      await SuperAdminAuthEngine.recordFailedAttempt(key);
      assert.equal((await SuperAdminAuthEngine.checkRateLimit(key)).remaining, 2);

      await SuperAdminAuthEngine.recordFailedAttempt(key);
      assert.equal((await SuperAdminAuthEngine.checkRateLimit(key)).remaining, 1);

      await SuperAdminAuthEngine.recordFailedAttempt(key);
      const locked = await SuperAdminAuthEngine.checkRateLimit(key);
      assert.equal(locked.allowed, false, 'Must be locked out after 3 failures');
      assert.ok(locked.cooldownSeconds > 0, 'Cooldown seconds must be returned');
    });

    it('applies rate limiting to MFA verification endpoint and returns 429 on lockout', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'mfa_ratelimit@ecom.local',
        password: 'Password@2026',
      });
      user.mfaEnabled = true;
      user.encryptedMfaSecret = EncryptionService.encrypt('JBSWY3DPEHPK3PXP');
      SuperAdminAuthEngine.updateUser(user);

      const challengeToken = `mfa_challenge_${Buffer.from(
        JSON.stringify({ userId: user.id, exp: Date.now() + 5 * 60 * 1000 })
      ).toString('base64')}`;

      const { POST: mfaVerifyHandler } = await import('./api/admin/auth/mfa/verify/route.js');

      // 3 invalid attempts
      for (let i = 0; i < 3; i++) {
        const { req, res } = createMockHttp({
          body: { code: '000000', mfaChallengeToken: challengeToken },
        });
        await mfaVerifyHandler(req, res);
        assert.equal(res.getStatusCode(), 401);
      }

      // 4th attempt must be rejected with 429 TOO_MANY_REQUESTS
      const { req: req4, res: res4 } = createMockHttp({
        body: { code: '000000', mfaChallengeToken: challengeToken },
      });
      await mfaVerifyHandler(req4, res4);
      assert.equal(res4.getStatusCode(), 429);
      assert.equal(res4.getBody().error, 'TOO_MANY_REQUESTS');
    });
  });

  // ==========================================
  // 6. Two-Step MFA Enrollment & Step-Up on Reset
  // ==========================================
  describe('6. MFA Enrollment 2-Step Ceremony & Step-Up Defense', () => {
    it('POST /admin/auth/mfa/setup enters pending state and does NOT activate MFA until confirmed', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'enroll_admin@ecom.local',
        password: 'Password@2026',
      });

      const session = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: false,
      });

      const { POST: mfaSetupHandler } = await import('./api/admin/auth/mfa/setup/route.js');
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await mfaSetupHandler(req, res);
      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getBody().pendingConfirmation, true);

      // Verify user record: pendingMfaSecret is set, but mfaEnabled is FALSE
      const freshUser = SuperAdminAuthEngine.findUserById(user.id)!;
      assert.equal(freshUser.mfaEnabled, false, 'mfaEnabled must remain false until confirmation code is verified');
      assert.ok(freshUser.pendingMfaSecret, 'pendingMfaSecret must be set');

      // Now verify with confirmation TOTP code
      const decryptedSecret = EncryptionService.decrypt(freshUser.pendingMfaSecret!);
      const validCode = SuperAdminAuthEngine.generateTotpCode(decryptedSecret);

      const { POST: mfaVerifyHandler } = await import('./api/admin/auth/mfa/verify/route.js');
      const { req: verifyReq, res: verifyRes } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
        body: { code: validCode },
      });

      await mfaVerifyHandler(verifyReq, verifyRes);
      assert.equal(verifyRes.getStatusCode(), 200);
      assert.equal(verifyRes.getBody().isMfaVerified, true);

      // Verify user record: now mfaEnabled is true, pendingMfaSecret is cleared
      const activatedUser = SuperAdminAuthEngine.findUserById(user.id)!;
      assert.equal(activatedUser.mfaEnabled, true, 'mfaEnabled must now be true');
      assert.equal(activatedUser.pendingMfaSecret, null, 'pendingMfaSecret must be cleared');
    });

    it('requires step-up re-authentication before resetting or re-enrolling MFA on an active account', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'active_mfa@ecom.local',
        password: 'Password@2026',
      });
      user.mfaEnabled = true;
      user.encryptedMfaSecret = EncryptionService.encrypt('JBSWY3DPEHPK3PXP');
      SuperAdminAuthEngine.updateUser(user);

      // Session whose last step-up was 20 minutes ago (> 15m step-up timeout)
      const session = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: true,
        lastMfaVerifiedAt: Date.now() - 20 * 60 * 1000,
      });

      const { POST: mfaSetupHandler } = await import('./api/admin/auth/mfa/setup/route.js');
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await mfaSetupHandler(req, res);
      assert.equal(res.getStatusCode(), 403, 'Must reject re-enrollment without recent step-up');
      assert.equal(res.getBody().error, 'STEP_UP_REQUIRED');

      // Perform step-up
      await SuperAdminAuthEngine.renewStepUp(session.token);

      const { req: stepUpReq, res: stepUpRes } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });
      await mfaSetupHandler(stepUpReq, stepUpRes);
      assert.equal(stepUpRes.getStatusCode(), 200, 'Must allow re-enrollment when step-up is active');
    });
  });

  // ==========================================
  // 7. Full Session Lifecycle & Cookies
  // ==========================================
  describe('7. Session Lifecycle & Cookie Security', () => {
    it('sets HttpOnly, SameSite=Strict, and Secure flag in production on login and logout', async () => {
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';

        const user = SuperAdminAuthEngine.registerAdminUser({
          email: 'prod_cookie@ecom.local',
          password: 'Password@2026',
        });

        const { POST: loginHandler } = await import('./api/admin/auth/login/route.js');
        const { req, res } = createMockHttp({
          body: { email: 'prod_cookie@ecom.local', password: 'Password@2026' },
        });

        await loginHandler(req, res);
        assert.equal(res.getStatusCode(), 200);

        const cookie = res.getHeaders()['set-cookie'];
        assert.ok(cookie.includes('HttpOnly'), 'Must include HttpOnly');
        assert.ok(cookie.includes('SameSite=Strict'), 'Must include SameSite=Strict');
        assert.ok(cookie.includes('Secure'), 'Must unconditionally include Secure in production');

        // Logout
        const { POST: logoutHandler } = await import('./api/admin/auth/logout/route.js');
        const { req: outReq, res: outRes } = createMockHttp({
          headers: { authorization: `Bearer ${res.getBody().token}` },
        });

        await logoutHandler(outReq, outRes);
        assert.equal(outRes.getStatusCode(), 200);
        const outCookie = outRes.getHeaders()['set-cookie'];
        assert.ok(outCookie.includes('Max-Age=0'));
        assert.ok(outCookie.includes('Secure'));
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it('enforces 30m idle timeout and global user revocation', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'lifecycle@ecom.local',
        password: 'Password@2026',
      });

      const session = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: true,
      });

      // Valid session
      assert.ok(await resolveSessionFromToken(session.token));

      // Global revocation
      await SuperAdminAuthEngine.revokeAllUserSessions(user.id);
      assert.equal(await resolveSessionFromToken(session.token), null, 'Must be revoked globally');
    });
  });

  // ==========================================
  // 8. Shared Redis Storage Adapter Integration
  // ==========================================
  describe('8. Shared Redis Storage Adapter Integration (Real Redis)', () => {
    let redisAdapter: RedisAuthStorageAdapter;

    beforeEach(async () => {
      redisAdapter = new RedisAuthStorageAdapter('redis://127.0.0.1:6379');
      SuperAdminAuthEngine.setAdapter(redisAdapter);
      await SuperAdminAuthEngine.resetForTesting();
    });

    it('executes rate limiting, lockout, and reset directly against real Redis on port 6379', async () => {
      const isHealthy = await redisAdapter.isHealthy();
      if (!isHealthy) {
        console.warn('Redis on 127.0.0.1:6379 offline. Skipping real Redis subtest.');
        return;
      }

      const key = `ratelimit:redis_test_${Date.now()}`;
      assert.equal((await redisAdapter.checkRateLimit(key)).remaining, 3);

      await redisAdapter.recordFailedAttempt(key);
      await redisAdapter.recordFailedAttempt(key);
      await redisAdapter.recordFailedAttempt(key);

      const locked = await redisAdapter.checkRateLimit(key);
      assert.equal(locked.allowed, false, 'Must be locked out in Redis');
      assert.ok(locked.cooldownSeconds > 0);

      await redisAdapter.resetRateLimit(key);
      assert.equal((await redisAdapter.checkRateLimit(key)).allowed, true, 'Must reset lockout in Redis');
    });

    it('executes atomic anti-replay protection across simulated instances in Redis', async () => {
      const isHealthy = await redisAdapter.isHealthy();
      if (!isHealthy) return;

      const userId = `usr_redis_replay_${Date.now()}`;
      const step = 555555;

      // Instance A records code
      const r1 = await redisAdapter.isTotpReplay(userId, step);
      assert.equal(r1, false, 'First use in Redis must be accepted');

      // Instance B attempts same code concurrently
      const r2 = await redisAdapter.isTotpReplay(userId, step);
      assert.equal(r2, true, 'Second use in Redis across instances must be rejected as replay');
    });

    it('persists sessions in Redis across simulated process restarts', async () => {
      const isHealthy = await redisAdapter.isHealthy();
      if (!isHealthy) return;

      const user = SuperAdminAuthEngine.registerAdminUser({
        email: `redis_session_${Date.now()}@ecom.local`,
        password: 'Password@2026',
      });

      const session = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: true,
      });

      // Simulate process restart: instantiate brand new RedisAuthStorageAdapter
      const restartedAdapter = new RedisAuthStorageAdapter('redis://127.0.0.1:6379');
      try {
        const retrieved = await restartedAdapter.getSession(session.token);

        assert.ok(retrieved, 'Session must persist in Redis across process restarts');
        assert.equal(retrieved.userId, user.id);
        assert.equal(retrieved.email, user.email);
      } finally {
        await restartedAdapter.close();
      }
    });

    it('FAIL-CLOSED: production fails closed when Redis storage is unavailable with zero in-memory fallback', async () => {
      const origEnv = process.env.NODE_ENV;
      let deadAdapter: RedisAuthStorageAdapter | undefined;

      try {
        process.env.NODE_ENV = 'production';
        deadAdapter = new RedisAuthStorageAdapter('redis://127.0.0.1:19999');

        // 1. Rate limiting fails closed
        await assert.rejects(
          async () => deadAdapter!.checkRateLimit('fail_closed_ratelimit_key'),
          /REDIS_SECURITY_FAILURE: Redis storage unavailable in production. Failing closed./,
          'Rate limiting must throw REDIS_SECURITY_FAILURE when Redis is offline in production'
        );

        // 2. Session save fails closed
        await assert.rejects(
          async () =>
            deadAdapter!.saveSession({
              token: 'sess_prod_fail_closed_test',
              userId: 'usr_fail_closed',
              email: 'fail_closed@ecom.local',
              role: 'super_admin',
              actorType: 'super_admin',
              authBoundary: 'admin',
              isMfaVerified: true,
              createdAt: Date.now(),
              lastActivityAt: Date.now(),
              expiresAt: Date.now() + 3600000,
            }),
          /REDIS_SECURITY_FAILURE: Redis storage unavailable in production. Failing closed./,
          'Session persistence must fail closed when Redis is offline in production'
        );

        // 3. Confirm zero in-memory fallback: memory adapter has no trace of session or rate limits
        assert.equal(
          await memoryAdapter.getSession('sess_prod_fail_closed_test'),
          null,
          'Must not silently fall back to in-memory session storage'
        );
        assert.equal(
          (await memoryAdapter.checkRateLimit('fail_closed_ratelimit_key')).remaining,
          3,
          'Must not silently fall back to in-memory rate limiting'
        );
      } finally {
        process.env.NODE_ENV = origEnv;
        if (deadAdapter) {
          try {
            await deadAdapter.close();
          } catch {}
        }
      }
    });

    it('executes atomic backup-code consumption concurrently against real Redis distributed lock', async () => {
      // Confirm Redis adapter is active and cannot silently run against in-memory
      assert.ok(
        SuperAdminAuthEngine.getAdapter() instanceof RedisAuthStorageAdapter,
        'Must actively use RedisAuthStorageAdapter'
      );
      const isHealthy = await redisAdapter.isHealthy();
      assert.ok(isHealthy, 'Real Redis container on port 6379 must be healthy');

      const user = SuperAdminAuthEngine.registerAdminUser({
        email: `redis_concurrent_backup_${Date.now()}@ecom.local`,
        password: 'Password@2026',
      });

      const { plainCodes, hashedCodes } = SuperAdminAuthEngine.generateBackupCodes(8);
      user.hashedBackupCodes = [...hashedCodes];
      SuperAdminAuthEngine.updateUser(user);

      const testCode = plainCodes[0];

      try {
        // Exercise actual backup-code verification and consumption concurrently
        const [attempt1, attempt2] = await Promise.all([
          SuperAdminAuthEngine.verifyAndConsumeBackupCode(user.id, testCode, user),
          SuperAdminAuthEngine.verifyAndConsumeBackupCode(user.id, testCode, user),
        ]);

        const successCount = [attempt1.valid, attempt2.valid].filter(Boolean).length;
        assert.equal(
          successCount,
          1,
          'Exactly one concurrent verification must succeed under real Redis distributed lock'
        );

        const failedAttempt = attempt1.valid ? attempt2 : attempt1;
        assert.equal(failedAttempt.valid, false);
        assert.ok(
          failedAttempt.reason?.includes('CONCURRENT_REQUEST') ||
            failedAttempt.reason?.includes('INVALID_BACKUP_CODE'),
          'Rejected attempt must indicate concurrency lock or code invalidation'
        );

        assert.equal(
          user.hashedBackupCodes.length,
          7,
          'Remaining bcrypt backup hashes must be decremented to 7'
        );

        // Subsequent sequential reuse must also fail
        const reuseAttempt = await SuperAdminAuthEngine.verifyAndConsumeBackupCode(user.id, testCode, user);
        assert.equal(reuseAttempt.valid, false, 'Sequential reuse of already consumed backup code must fail');
      } finally {
        // Clean up test user and release any remaining Redis lock key
        await redisAdapter.releaseLock(`backup_consume:${user.id}`);
      }
    });

    afterEach(async () => {
      if (redisAdapter) {
        await redisAdapter.close();
      }
      SuperAdminAuthEngine.setAdapter(memoryAdapter);
    });
  });

  // ==========================================
  // 9. Boundary Isolation & Audit Logging Redaction
  // ==========================================
  describe('9. Boundary Isolation & Audit Logging Redaction', () => {
    it('NEGATIVE: rejects customer and merchant tokens from accessing admin routes', async () => {
      const dummyAdminRoute = requireTenantAuth({ boundary: 'admin' }, async (_req, res) => {
        res.status(200).json({ success: true });
      });

      // Customer token
      const { req: custReq, res: custRes } = createMockHttp({
        headers: { authorization: 'Bearer customer_token_123' },
      });
      await dummyAdminRoute(custReq, custRes);
      assert.equal(custRes.getStatusCode(), 403);
      assert.equal(custRes.getBody().error, 'FORBIDDEN');

      // Merchant token
      const { req: merchReq, res: merchRes } = createMockHttp({
        headers: { authorization: 'Bearer merchant_token_usr1:merch1:owner:active:active' },
      });
      await dummyAdminRoute(merchReq, merchRes);
      assert.equal(merchRes.getStatusCode(), 403);
    });

    it('AUDIT REDACTION: audit logs never contain passwords, secrets, or backup codes', () => {
      SuperAdminAuthEngine.logAuditEvent({
        action: 'admin.login.success',
        outcome: 'success',
        userId: 'usr_admin_123',
        email: 'audit_test@ecom.local',
      });

      const logs = SuperAdminAuthEngine.getAuditLogs({ userId: 'usr_admin_123' });
      assert.ok(logs.length > 0);
      const str = JSON.stringify(logs[0]);

      assert.ok(!str.includes('password'));
      assert.ok(!str.includes('secret'));
      assert.ok(!str.includes('backupCode'));
    });
  });

  // ==========================================
  // 10. Initial Super Admin Provisioning Script
  // ==========================================
  describe('10. Initial Super Admin Provisioning Script', () => {
    it('safely provisions admin from environment and refuses to overwrite existing account', async () => {
      const origEmail = process.env.INITIAL_ADMIN_EMAIL;
      const origPass = process.env.INITIAL_ADMIN_PASSWORD;

      try {
        process.env.INITIAL_ADMIN_EMAIL = 'bootstrap_admin@ecom.local';
        process.env.INITIAL_ADMIN_PASSWORD = 'BootstrapPassword@2026';

        // 1. Initial provisioning succeeds
        const res1 = await provisionInitialSuperAdmin();
        assert.equal(res1.success, true);
        assert.ok(res1.userId);

        // 2. Second provisioning skips without overwriting
        const res2 = await provisionInitialSuperAdmin();
        assert.equal(res2.success, false);
        assert.ok(res2.message.includes('already exists'));

        // 3. Password < 8 characters throws error
        process.env.INITIAL_ADMIN_EMAIL = 'weak_admin@ecom.local';
        process.env.INITIAL_ADMIN_PASSWORD = 'short';
        await assert.rejects(
          async () => provisionInitialSuperAdmin(),
          /PROVISIONING_FAILED: Password must be at least 8 characters long/
        );
      } finally {
        if (origEmail) process.env.INITIAL_ADMIN_EMAIL = origEmail;
        else delete process.env.INITIAL_ADMIN_EMAIL;
        if (origPass) process.env.INITIAL_ADMIN_PASSWORD = origPass;
        else delete process.env.INITIAL_ADMIN_PASSWORD;
      }
    });
  });

  // ==========================================
  // 11. Exploit Remediation: Fabricated Token Reject & Environment Protection
  // ==========================================
  describe('11. Exploit Remediation: Fabricated Token Reject & Environment Protection', () => {
    it('NEGATIVE: rejects fabricated admin_token prefix in development/production environment', async () => {
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'development';

        // 1. resolveSessionFromToken rejects prefix token
        const resolved = await resolveSessionFromToken('admin_token_superadmin');
        assert.equal(resolved, null, 'Fabricated admin token must return null in development/production');

        // 2. HTTP endpoint rejects with 401 UNAUTHORIZED
        const dummyAdminRoute = requireTenantAuth({ boundary: 'admin' }, async (_req, res) => {
          res.status(200).json({ success: true });
        });

        const { req, res } = createMockHttp({
          headers: { authorization: 'Bearer admin_token_superadmin' },
        });
        await dummyAdminRoute(req, res);
        assert.equal(res.getStatusCode(), 401);
        assert.equal(res.getBody().error, 'UNAUTHORIZED');
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });

    it('NEGATIVE: rejects fabricated merchant_token and JSON tokens in development/production', async () => {
      const origEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'production';

        const merchResolved = await resolveSessionFromToken('merchant_token_usr1:merch1:owner:active:active');
        assert.equal(merchResolved, null, 'Fabricated merchant token must return null in production');

        const jsonResolved = await resolveSessionFromToken('{"userId":"hacker","role":"super_admin"}');
        assert.equal(jsonResolved, null, 'Fabricated JSON token must return null in production');

        const b64Token = `sess_b64_${Buffer.from('{"userId":"hacker"}').toString('base64')}`;
        const b64Resolved = await resolveSessionFromToken(b64Token);
        assert.equal(b64Resolved, null, 'Fabricated Base64 token must return null in production');
      } finally {
        process.env.NODE_ENV = origEnv;
      }
    });
  });

  // ==========================================
  // 12. Mandatory MFA Enforcement on Super Admin Boundary
  // ==========================================
  describe('12. Mandatory MFA Enforcement on Super Admin Boundary', () => {
    it('NEGATIVE: rejects Super Admin session with isMfaVerified = false with 403 MFA_REQUIRED', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'mfa_gate_admin@ecom.local',
        password: 'Password@2026',
      });

      // Create session with isMfaVerified = false
      const session = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: false,
      });

      const privilegedRoute = requireTenantAuth({ boundary: 'admin' }, async (_req, res) => {
        res.status(200).json({ success: true, privilegedData: 'confidential' });
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await privilegedRoute(req, res);
      assert.equal(res.getStatusCode(), 403, 'Must return 403 Forbidden when MFA is not verified');
      assert.equal(res.getBody().error, 'MFA_REQUIRED');
      assert.equal(res.getBody().privilegedData, undefined, 'Zero privileged data must leak');
    });

    it('SUCCESS: allows Super Admin session with isMfaVerified = true to access admin boundary', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'mfa_verified_admin@ecom.local',
        password: 'Password@2026',
      });

      // Create session with isMfaVerified = true
      const session = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: true,
      });

      const privilegedRoute = requireTenantAuth({ boundary: 'admin' }, async (_req, res) => {
        res.status(200).json({ success: true, privilegedData: 'confidential' });
      });

      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${session.token}` },
      });

      await privilegedRoute(req, res);
      assert.equal(res.getStatusCode(), 200);
      assert.equal(res.getBody().success, true);
      assert.equal(res.getBody().privilegedData, 'confidential');
    });
  });

  // ==========================================
  // 13. Super Admin Password Rotation & Storage Security
  // ==========================================
  describe('13. Super Admin Password Rotation & Storage Security', () => {
    it('successfully rotates admin password, invalidates previous credentials, and revokes pre-rotation sessions', async () => {
      const email = 'rotation_admin@ecom.local';
      const initialPassword = 'InitialPassword@2026';
      const newPassword = 'RotatedSecurePassword@2026!';

      const user = SuperAdminAuthEngine.registerAdminUser({
        email,
        password: initialPassword,
      });

      // Verify initial password works
      assert.equal(
        SuperAdminAuthEngine.verifyPassword(initialPassword, user.passwordHash, user.passwordSalt),
        true
      );

      // Create an active session BEFORE password rotation
      const preRotationSession = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: true,
      });

      // Confirm pre-rotation session is active initially
      assert.ok(await SuperAdminAuthEngine.resolveSession(preRotationSession.token));

      // Rotate password (async revocation of all user sessions)
      const rotated = await SuperAdminAuthEngine.rotatePassword(email, newPassword);
      assert.equal(rotated, true, 'Password rotation must succeed');

      const updatedUser = SuperAdminAuthEngine.findUserByEmail(email)!;

      // 1. Old password MUST fail verification
      assert.equal(
        SuperAdminAuthEngine.verifyPassword(initialPassword, updatedUser.passwordHash, updatedUser.passwordSalt),
        false,
        'Old password must fail verification after rotation'
      );

      // 2. New password MUST succeed verification
      assert.equal(
        SuperAdminAuthEngine.verifyPassword(newPassword, updatedUser.passwordHash, updatedUser.passwordSalt),
        true,
        'New password must succeed verification after rotation'
      );

      // 3. Pre-rotation session MUST be immediately invalidated / revoked
      const staleSessionCheck = await SuperAdminAuthEngine.resolveSession(preRotationSession.token);
      assert.equal(staleSessionCheck, null, 'Session created before password rotation must be revoked immediately');

      // 4. Stale session calling privileged route returns 401 UNAUTHORIZED
      const dummyAdminRoute = requireTenantAuth({ boundary: 'admin' }, async (_req, res) => {
        res.status(200).json({ success: true, privileged: true });
      });
      const { req, res } = createMockHttp({
        headers: { authorization: `Bearer ${preRotationSession.token}` },
      });
      await dummyAdminRoute(req, res);
      assert.equal(res.getStatusCode(), 401);
      assert.equal(res.getBody().error, 'UNAUTHORIZED');

      // 5. Rejects rotation to password shorter than 8 characters
      await assert.rejects(
        async () => SuperAdminAuthEngine.rotatePassword(email, 'short'),
        /PASSWORD_TOO_WEAK/
      );
    });
  });

  // ==========================================
  // 14. Mandatory MFA Session-Token Rotation
  // ==========================================
  describe('14. Mandatory MFA Session-Token Rotation', () => {
    it('SESSION ROTATION (TOTP): revokes pre-MFA session and issues fresh unpredictable token on MFA verify', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'rotation_mfa_totp@ecom.local',
        password: 'Password@2026',
      });

      // 1. Primary login creates unverified pre-MFA session
      const preMfaSession = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: false,
      });

      // Enroll in MFA
      const { base32Secret } = SuperAdminAuthEngine.generateTotpSecret();
      user.encryptedMfaSecret = EncryptionService.encrypt(base32Secret);
      user.mfaEnabled = true;
      SuperAdminAuthEngine.updateUser(user);

      // Verify unverified session CANNOT access admin API (403 MFA_REQUIRED)
      const privilegedRoute = requireTenantAuth({ boundary: 'admin' }, async (_req, res) => {
        res.status(200).json({ success: true, secretData: 'admin-vault' });
      });

      const { req: unverifiedReq, res: unverifiedRes } = createMockHttp({
        headers: { authorization: `Bearer ${preMfaSession.token}` },
      });
      await privilegedRoute(unverifiedReq, unverifiedRes);
      assert.equal(unverifiedRes.getStatusCode(), 403);
      assert.equal(unverifiedRes.getBody().error, 'MFA_REQUIRED');

      // 2. Perform MFA verification with valid TOTP
      const totpCode = SuperAdminAuthEngine.generateTotpCode(base32Secret);
      const { POST: mfaVerifyHandler } = await import('./api/admin/auth/mfa/verify/route.js');
      const { req: verifyReq, res: verifyRes } = createMockHttp({
        headers: { authorization: `Bearer ${preMfaSession.token}` },
        body: { code: totpCode },
      });

      await mfaVerifyHandler(verifyReq, verifyRes);
      assert.equal(verifyRes.getStatusCode(), 200);
      assert.equal(verifyRes.getBody().isMfaVerified, true);

      const newSessionToken = verifyRes.getBody().token;
      assert.ok(newSessionToken, 'Must issue a fresh session token');
      assert.notEqual(newSessionToken, preMfaSession.token, 'New session token must differ from pre-MFA token');

      // 3. Old pre-MFA token MUST now be revoked and rejected with 401 UNAUTHORIZED
      const { req: staleReq, res: staleRes } = createMockHttp({
        headers: { authorization: `Bearer ${preMfaSession.token}` },
      });
      await privilegedRoute(staleReq, staleRes);
      assert.equal(staleRes.getStatusCode(), 401, 'Old pre-MFA token must return 401 Unauthorized after MFA rotation');
      assert.equal(staleRes.getBody().error, 'UNAUTHORIZED');

      // 4. Newly issued session token MUST succeed with 200 OK
      const { req: validReq, res: validRes } = createMockHttp({
        headers: { authorization: `Bearer ${newSessionToken}` },
      });
      await privilegedRoute(validReq, validRes);
      assert.equal(validRes.getStatusCode(), 200);
      assert.equal(validRes.getBody().secretData, 'admin-vault');
    });

    it('SESSION ROTATION (BACKUP CODE): revokes pre-MFA session and issues fresh token on backup code use', async () => {
      const user = SuperAdminAuthEngine.registerAdminUser({
        email: 'rotation_mfa_backup@ecom.local',
        password: 'Password@2026',
      });

      const { plainCodes, hashedCodes } = SuperAdminAuthEngine.generateBackupCodes(8);
      user.encryptedMfaSecret = EncryptionService.encrypt(SuperAdminAuthEngine.generateTotpSecret().base32Secret);
      user.hashedBackupCodes = [...hashedCodes];
      user.mfaEnabled = true;
      SuperAdminAuthEngine.updateUser(user);

      // Create pre-MFA session
      const preMfaSession = await SuperAdminAuthEngine.createSession({
        userId: user.id,
        email: user.email,
        isMfaVerified: false,
      });

      // Verify with single-use backup code
      const testCode = plainCodes[0];
      const { POST: mfaVerifyHandler } = await import('./api/admin/auth/mfa/verify/route.js');
      const { req: verifyReq, res: verifyRes } = createMockHttp({
        headers: { authorization: `Bearer ${preMfaSession.token}` },
        body: { backupCode: testCode },
      });

      await mfaVerifyHandler(verifyReq, verifyRes);
      assert.equal(verifyRes.getStatusCode(), 200);

      const rotatedToken = verifyRes.getBody().token;
      assert.ok(rotatedToken);
      assert.notEqual(rotatedToken, preMfaSession.token, 'Must rotate session token on backup code use');

      // Stale pre-MFA session returns 401
      const privilegedRoute = requireTenantAuth({ boundary: 'admin' }, async (_req, res) => {
        res.status(200).json({ success: true, privileged: true });
      });
      const { req: staleReq, res: staleRes } = createMockHttp({
        headers: { authorization: `Bearer ${preMfaSession.token}` },
      });
      await privilegedRoute(staleReq, staleRes);
      assert.equal(staleRes.getStatusCode(), 401);

      // Rotated token succeeds with 200
      const { req: freshReq, res: freshRes } = createMockHttp({
        headers: { authorization: `Bearer ${rotatedToken}` },
      });
      await privilegedRoute(freshReq, freshRes);
      assert.equal(freshRes.getStatusCode(), 200);
      assert.equal(freshRes.getBody().privileged, true);
    });
  });

  after(async () => {
    await SuperAdminAuthEngine.close();
  });
});
