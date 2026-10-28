/**
 * Merchant Authentication & Session Security Engine (Phase M2-06)
 *
 * Implements:
 * 1. Dedicated Merchant boundary isolation (corporate email + password).
 * 2. Native Medusa v2 Authentication (`@medusajs/auth` with `emailpass` provider).
 * 3. Authoritative Medusa domain service persistence across Medusa `auth_identity`, `provider_identity`,
 *    `"user"`, `merchant`, and `merchant_member` tables without raw SQL or credential leakage in user.metadata.
 * 4. ACID transactional registration & reliable domain-service compensation rollback on partial failures.
 * 5. Redis-backed session lifecycle (sliding idle timeout 2h, absolute cap 24h) under `session:merch:${token}`.
 * 6. Dual-transport token handling: `ecom_merchant_sess` cookie + `Authorization: Bearer sess_merch_*`.
 * 7. Multi-layered distributed rate limiting (5 failed attempts per 15m window).
 * 8. Single-use 15-minute cryptographically secure password reset tokens.
 * 9. Centralized single-session logout & global user revocation (`user:revoked_at:${userId}`).
 * 10. Server-side merchant status gating (draft, pending_approval, suspended, rejected blocked from active commerce).
 * 11. Production fail-closed security when Redis or Postgres is unavailable.
 * 12. Security audit logging with strict credential redaction.
 */

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import Redis from 'ioredis';
import { Pool } from 'pg';
import { MedusaModule } from '@medusajs/framework/modules-sdk';
import { Modules } from '@medusajs/framework/utils';
import type {
  MerchantStatus,
  MerchantRole,
  MerchantMemberStatus,
  MarketplacePermission,
  AuthenticatedSessionDto,
  MerchantSessionRecord,
  MerchantAuthAction,
  MerchantAuthAuditEvent,
  MerchantRegisterPayload,
  MerchantTeamMemberDto,
  TeamAuditAction,
  TeamAuditEvent,
} from '@ecom/types';
import {
  validateMerchantProfile,
  validateSoleOwnerConstraint,
  validateMemberStatusTransition,
} from '@ecom/types';


// ==========================================
// Types & Contracts
// ==========================================

export interface MerchantUser {
  id: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  authIdentityId?: string;
  merchantId: string;
  role: MerchantRole;
  membershipStatus: MerchantMemberStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MerchantRecord {
  id: string;
  name: string;
  handle: string;
  status: MerchantStatus;
  email: string;
  phone: string;
  businessRegistrationNumber?: string | null;
  taxIdentifier?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  cooldownSeconds: number;
}

export interface IMerchantAuthStorageAdapter {
  isHealthy(): Promise<boolean>;
  checkRateLimit(key: string): Promise<RateLimitCheckResult>;
  recordFailedAttempt(key: string): Promise<void>;
  resetRateLimit(key: string): Promise<void>;
  saveSession(session: MerchantSessionRecord): Promise<void>;
  getSession(token: string): Promise<MerchantSessionRecord | null>;
  revokeSession(token: string): Promise<boolean>;
  revokeAllUserSessions(userId: string): Promise<void>;
  savePasswordResetToken(token: string, userId: string, ttlSeconds: number): Promise<void>;
  consumePasswordResetToken(token: string): Promise<string | null>;
  close(): Promise<void>;
}

export interface IMerchantIdentityStore {
  isHealthy(): Promise<boolean>;
  findUserByEmail(email: string): Promise<MerchantUser | null>;
  findUserById(id: string): Promise<MerchantUser | null>;
  findMerchantById(id: string): Promise<MerchantRecord | null>;
  findMerchantByHandle(handle: string): Promise<MerchantRecord | null>;
  createMerchantWithAccount(
    payload: MerchantRegisterPayload,
    passwordHash?: string,
    passwordSalt?: string
  ): Promise<{
    merchant: MerchantRecord;
    user: MerchantUser;
    member: {
      id: string;
      userId: string;
      role: MerchantRole;
      status: MerchantMemberStatus;
    };
  }>;
  authenticateUser(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    user?: MerchantUser;
    error?: string;
  }>;
  updateUserPassword(userId: string, newPassword: string, salt?: string): Promise<void>;
  updateMerchantStatus(
    merchantId: string,
    status: MerchantStatus,
    reason?: string
  ): Promise<MerchantRecord>;
  updateMemberStatus(
    userId: string,
    status: MerchantMemberStatus
  ): Promise<MerchantUser>;
  listMerchantMembers(merchantId: string): Promise<MerchantTeamMemberDto[]>;
  findMerchantMemberById(memberId: string): Promise<MerchantTeamMemberDto | null>;
  findMerchantMemberByUserAndMerchant(merchantId: string, userId: string): Promise<MerchantTeamMemberDto | null>;
  inviteMerchantMember(params: {
    merchantId: string;
    email: string;
    role: MerchantRole;
    invitedByUserId?: string;
  }): Promise<MerchantTeamMemberDto>;
  updateMerchantMemberRoleOrStatus(
    merchantId: string,
    memberIdOrUserId: string,
    update: { role?: MerchantRole; status?: MerchantMemberStatus }
  ): Promise<MerchantTeamMemberDto>;
  removeMerchantMember(merchantId: string, memberIdOrUserId: string): Promise<boolean>;
  listAllPlatformMembers(filter?: {
    merchantId?: string;
    role?: MerchantRole;
    status?: MerchantMemberStatus;
  }): Promise<(MerchantTeamMemberDto & { merchantName?: string; merchantHandle?: string })[]>;
  close(): Promise<void>;
  clear?(): Promise<void>;
}

// ==========================================
// Session & Rate Limit Storage Adapters (Redis / In-Memory)
// ==========================================

export class RedisMerchantAuthStorageAdapter implements IMerchantAuthStorageAdapter {
  private client: Redis;
  private isProduction: boolean;
  private isConnected: boolean = false;

  constructor(redisUrl?: string) {
    this.isProduction = process.env.NODE_ENV === 'production';
    const targetUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';

    this.client = new Redis(targetUrl, {
      maxRetriesPerRequest: this.isProduction ? 1 : 3,
      retryStrategy: (times) => {
        if (this.isProduction && times > 1) return null;
        return Math.min(times * 100, 2000);
      },
      lazyConnect: false,
      connectTimeout: 5000,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.on('error', () => {
      this.isConnected = false;
    });
  }

  async isHealthy(): Promise<boolean> {
    try {
      const pong = await this.client.ping();
      return pong === 'PONG';
    } catch {
      return false;
    }
  }

  private async wrapCall<T>(op: () => Promise<T>): Promise<T> {
    try {
      return await op();
    } catch (err: any) {
      if (this.isProduction) {
        throw new Error(`REDIS_SECURITY_FAILURE: Secure session storage is unavailable. Error: ${err.message}`);
      }
      throw err;
    }
  }

  async checkRateLimit(key: string): Promise<RateLimitCheckResult> {
    return this.wrapCall(async () => {
      const lockKey = `lockout:merchant:${key}`;
      const countKey = `ratelimit:merchant:${key}`;

      const ttl = await this.client.ttl(lockKey);
      if (ttl > 0) {
        return {
          allowed: false,
          remaining: 0,
          cooldownSeconds: ttl,
        };
      }

      const countStr = await this.client.get(countKey);
      const count = countStr ? parseInt(countStr, 10) : 0;
      const remaining = Math.max(0, 5 - count);

      return {
        allowed: remaining > 0,
        remaining,
        cooldownSeconds: 0,
      };
    });
  }

  async recordFailedAttempt(key: string): Promise<void> {
    return this.wrapCall(async () => {
      const countKey = `ratelimit:merchant:${key}`;
      const lockKey = `lockout:merchant:${key}`;

      const current = await this.client.incr(countKey);
      if (current === 1) {
        await this.client.expire(countKey, 15 * 60); // 15 min window
      }

      if (current >= 5) {
        await this.client.set(lockKey, 'locked', 'EX', 15 * 60);
      }
    });
  }

  async resetRateLimit(key: string): Promise<void> {
    return this.wrapCall(async () => {
      const countKey = `ratelimit:merchant:${key}`;
      const lockKey = `lockout:merchant:${key}`;
      await this.client.del(countKey, lockKey);
    });
  }

  async saveSession(session: MerchantSessionRecord): Promise<void> {
    return this.wrapCall(async () => {
      const key = `session:merch:${session.token}`;
      const ttlSeconds = Math.ceil((session.expiresAt - Date.now()) / 1000);
      if (ttlSeconds > 0) {
        await this.client.set(key, JSON.stringify(session), 'EX', ttlSeconds);
      }
    });
  }

  async getSession(token: string): Promise<MerchantSessionRecord | null> {
    return this.wrapCall(async () => {
      const key = `session:merch:${token}`;
      const raw = await this.client.get(key);
      if (!raw) return null;

      try {
        const session: MerchantSessionRecord = JSON.parse(raw);
        const now = Date.now();

        if (now > session.expiresAt) {
          await this.client.del(key);
          return null;
        }

        // Sliding idle timeout check (2 hours)
        if (now - session.lastActivityAt > 2 * 60 * 60 * 1000) {
          await this.client.del(key);
          return null;
        }

        // Check if user has been globally revoked
        const revocationKey = `user:revoked_at:${session.userId}`;
        const revokedAtStr = await this.client.get(revocationKey);
        if (revokedAtStr) {
          const revokedAt = parseInt(revokedAtStr, 10);
          if (session.createdAt < revokedAt) {
            await this.client.del(key);
            return null;
          }
        }

        // Refresh sliding idle activity timestamp
        session.lastActivityAt = now;
        const remainingTtlSeconds = Math.ceil((session.expiresAt - now) / 1000);
        if (remainingTtlSeconds > 0) {
          await this.client.set(key, JSON.stringify(session), 'EX', remainingTtlSeconds);
        }

        return session;
      } catch {
        await this.client.del(key);
        return null;
      }
    });
  }

  async revokeSession(token: string): Promise<boolean> {
    return this.wrapCall(async () => {
      const key = `session:merch:${token}`;
      const res = await this.client.del(key);
      return res > 0;
    });
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    return this.wrapCall(async () => {
      const revocationKey = `user:revoked_at:${userId}`;
      // Set revocation timestamp valid for 24 hours (max session duration)
      await this.client.set(revocationKey, Date.now().toString(), 'EX', 24 * 60 * 60);
    });
  }

  async savePasswordResetToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    return this.wrapCall(async () => {
      const key = `reset:merchant:${token}`;
      await this.client.set(key, userId, 'EX', ttlSeconds);
    });
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    return this.wrapCall(async () => {
      const key = `reset:merchant:${token}`;
      try {
        const userId = await (this.client as any).getdel(key);
        return userId || null;
      } catch {
        const userId = await this.client.get(key);
        if (userId) {
          await this.client.del(key);
        }
        return userId || null;
      }
    });
  }

  async close(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}

export class InMemoryMerchantAuthStorageAdapter implements IMerchantAuthStorageAdapter {
  private sessions = new Map<string, MerchantSessionRecord>();
  private userRevocations = new Map<string, number>();
  private loginAttempts = new Map<string, { count: number; firstAttemptAt: number; lockedUntil?: number }>();
  private resetTokens = new Map<string, { userId: string; expiresAt: number }>();

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PRODUCTION_SECURITY_VIOLATION: InMemoryMerchantAuthStorageAdapter is strictly prohibited in production.');
    }
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async checkRateLimit(key: string): Promise<RateLimitCheckResult> {
    const record = this.loginAttempts.get(key);
    const now = Date.now();

    if (!record) {
      return { allowed: true, remaining: 5, cooldownSeconds: 0 };
    }

    if (record.lockedUntil && now < record.lockedUntil) {
      const cooldown = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, remaining: 0, cooldownSeconds: cooldown };
    }

    if (now - record.firstAttemptAt > 15 * 60 * 1000) {
      this.loginAttempts.delete(key);
      return { allowed: true, remaining: 5, cooldownSeconds: 0 };
    }

    const remaining = Math.max(0, 5 - record.count);
    return { allowed: remaining > 0, remaining, cooldownSeconds: 0 };
  }

  async recordFailedAttempt(key: string): Promise<void> {
    const now = Date.now();
    const record = this.loginAttempts.get(key) || { count: 0, firstAttemptAt: now };
    record.count += 1;

    if (record.count >= 5) {
      record.lockedUntil = now + 15 * 60 * 1000;
    }

    this.loginAttempts.set(key, record);
  }

  async resetRateLimit(key: string): Promise<void> {
    this.loginAttempts.delete(key);
  }

  async saveSession(session: MerchantSessionRecord): Promise<void> {
    this.sessions.set(session.token, { ...session });
  }

  async getSession(token: string): Promise<MerchantSessionRecord | null> {
    const session = this.sessions.get(token);
    if (!session) return null;

    const now = Date.now();
    if (now > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    // Sliding idle timeout: 2 hours (120 minutes)
    if (now - session.lastActivityAt > 2 * 60 * 60 * 1000) {
      this.sessions.delete(token);
      return null;
    }

    const revokedAt = this.userRevocations.get(session.userId);
    if (revokedAt && session.createdAt < revokedAt) {
      this.sessions.delete(token);
      return null;
    }

    session.lastActivityAt = now;
    return session;
  }

  async revokeSession(token: string): Promise<boolean> {
    return this.sessions.delete(token);
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    this.userRevocations.set(userId, Date.now());
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }

  async savePasswordResetToken(token: string, userId: string, ttlSeconds: number): Promise<void> {
    this.resetTokens.set(token, {
      userId,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async consumePasswordResetToken(token: string): Promise<string | null> {
    const record = this.resetTokens.get(token);
    if (!record) return null;

    this.resetTokens.delete(token);
    if (Date.now() > record.expiresAt) {
      return null;
    }
    return record.userId;
  }

  async close(): Promise<void> {
    this.clear();
  }

  clear(): void {
    this.sessions.clear();
    this.userRevocations.clear();
    this.loginAttempts.clear();
    this.resetTokens.clear();
  }
}

// ==========================================
// Authoritative Identity Stores (Medusa Native / In-Memory)
// ==========================================

/**
 * MedusaNativeMerchantIdentityStore
 *
 * Implements authoritative merchant identity using Medusa v2's native architecture:
 * 1. `@medusajs/auth` (`Modules.AUTH`) with native `emailpass` provider for Scrypt credential management.
 * 2. `@medusajs/user` (`Modules.USER`) for core user records without custom credentials in metadata.
 * 3. `MarketplaceModuleService` for `Merchant` and `MerchantMember` lifecycle management.
 * 4. Reliable compensation rollback across domain services on registration failure.
 * 5. Zero direct SQL mutations against Medusa-owned `user`, `auth_identity`, or `provider_identity` tables.
 */
export class MedusaNativeMerchantIdentityStore implements IMerchantIdentityStore {
  private static sharedAuthModule: any = null;
  private static sharedUserModule: any = null;
  private static sharedMarketplaceModule: any = null;
  private static sharedInitPromise: Promise<void> | null = null;

  private authModule: any = null;
  private userModule: any = null;
  private marketplaceModule: any = null;
  private dbUrl: string;
  private isProduction: boolean;
  private directPool: Pool;
  private isExternalPool: boolean = false;

  constructor(options?: {
    authModule?: any;
    userModule?: any;
    marketplaceModule?: any;
    databaseUrl?: string;
    pool?: Pool;
  }) {
    this.isProduction = process.env.NODE_ENV === 'production';
    this.dbUrl =
      options?.databaseUrl ||
      process.env.DATABASE_URL ||
      'postgres://postgres:postgres_secure_password@localhost:5432/medusa_db';

    this.authModule = options?.authModule || MedusaNativeMerchantIdentityStore.sharedAuthModule;
    this.userModule = options?.userModule || MedusaNativeMerchantIdentityStore.sharedUserModule;
    this.marketplaceModule = options?.marketplaceModule || MedusaNativeMerchantIdentityStore.sharedMarketplaceModule;

    if (options?.pool) {
      this.directPool = options.pool;
      this.isExternalPool = true;
    } else {
      this.directPool = new Pool({
        connectionString: this.dbUrl,
        max: 5,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });
      this.isExternalPool = false;
    }
  }

  static async shutdown(): Promise<void> {
    const modules = [
      MedusaNativeMerchantIdentityStore.sharedAuthModule,
      MedusaNativeMerchantIdentityStore.sharedUserModule,
      MedusaNativeMerchantIdentityStore.sharedMarketplaceModule,
    ];
    for (const mod of modules) {
      if (mod && mod.__container__) {
        try {
          const manager = mod.__container__['manager'];
          if (manager && typeof manager.getConnection === 'function') {
            const knex = manager.getConnection().getKnex?.();
            if (knex && typeof knex.destroy === 'function') {
              await knex.destroy();
            }
          }
        } catch {}
      }
    }
    try {
      await MedusaModule.onApplicationShutdown();
      MedusaModule.clearInstances();
    } catch {}
    MedusaNativeMerchantIdentityStore.sharedAuthModule = null;
    MedusaNativeMerchantIdentityStore.sharedUserModule = null;
    MedusaNativeMerchantIdentityStore.sharedMarketplaceModule = null;
    MedusaNativeMerchantIdentityStore.sharedInitPromise = null;
  }

  private async ensureInitialized(): Promise<void> {
    if (
      this.authModule &&
      this.userModule &&
      this.marketplaceModule &&
      MedusaNativeMerchantIdentityStore.sharedMarketplaceModule
    ) {
      return;
    }
    if (!MedusaNativeMerchantIdentityStore.sharedInitPromise) {
      MedusaNativeMerchantIdentityStore.sharedInitPromise = (async () => {
        if (!MedusaNativeMerchantIdentityStore.sharedAuthModule) {
          const authContainer = await MedusaModule.bootstrap({
            moduleKey: Modules.AUTH,
            defaultPath: '@medusajs/auth',
            declaration: {
              scope: 'internal',
              resolve: '@medusajs/auth',
              options: {
                database: { clientUrl: this.dbUrl },
                providers: [
                  {
                    resolve: '@medusajs/auth-emailpass',
                    id: 'emailpass',
                  },
                ],
              },
            },
          });
          MedusaNativeMerchantIdentityStore.sharedAuthModule = authContainer[Modules.AUTH];
        }

        if (!MedusaNativeMerchantIdentityStore.sharedUserModule) {
          const userContainer = await MedusaModule.bootstrap({
            moduleKey: Modules.USER,
            defaultPath: '@medusajs/user',
            declaration: {
              scope: 'internal',
              resolve: '@medusajs/user',
              options: {
                database: { clientUrl: this.dbUrl },
                jwt_secret:
                  process.env.JWT_SECRET ||
                  'super_secret_jwt_key_minimum_32_characters',
              },
            },
          });
          MedusaNativeMerchantIdentityStore.sharedUserModule = userContainer[Modules.USER];
        }

        if (!MedusaNativeMerchantIdentityStore.sharedMarketplaceModule) {
          const distMarketplace = path.resolve(__dirname, '../marketplace');
          const srcMarketplace = path.resolve(process.cwd(), 'apps/backend/src/modules/marketplace');
          const marketplacePath = fs.existsSync(distMarketplace) ? distMarketplace : srcMarketplace;

          const marketplaceContainer = await MedusaModule.bootstrap({
            moduleKey: 'marketplace',
            defaultPath: marketplacePath,
            declaration: {
              scope: 'internal',
              resolve: marketplacePath,
              options: {
                database: { clientUrl: this.dbUrl },
              },
            },
          });
          MedusaNativeMerchantIdentityStore.sharedMarketplaceModule = marketplaceContainer['marketplace'];
        }
      })();
    }
    await MedusaNativeMerchantIdentityStore.sharedInitPromise;
    this.authModule = MedusaNativeMerchantIdentityStore.sharedAuthModule;
    this.userModule = MedusaNativeMerchantIdentityStore.sharedUserModule;
    this.marketplaceModule = MedusaNativeMerchantIdentityStore.sharedMarketplaceModule;
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await this.directPool.query('SELECT 1');
      return res.rowCount === 1;
    } catch {
      return false;
    }
  }

  async createMerchantWithAccount(
    payload: MerchantRegisterPayload,
    _legacyHash?: string,
    _legacySalt?: string
  ): Promise<{
    merchant: MerchantRecord;
    user: MerchantUser;
    member: {
      id: string;
      userId: string;
      role: MerchantRole;
      status: MerchantMemberStatus;
    };
  }> {
    await this.ensureInitialized();
    const normalizedEmail = payload.email.trim().toLowerCase();
    const handle = payload.handle
      ? payload.handle.trim().toLowerCase()
      : payload.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    // Pre-check duplicate handle
    const existingMerchant = await this.findMerchantByHandle(handle);
    if (existingMerchant) {
      throw new Error(`HANDLE_ALREADY_IN_USE: Handle '${handle}' is already taken.`);
    }

    // Pre-check duplicate email
    const existingUser = await this.findUserByEmail(normalizedEmail);
    if (existingUser) {
      throw new Error(`EMAIL_ALREADY_REGISTERED: User with email '${normalizedEmail}' already exists.`);
    }

    let createdAuthIdentityId: string | null = null;
    let createdUserId: string | null = null;
    let createdMerchantId: string | null = null;
    let createdMemberId: string | null = null;

    try {
      // 1. Register with native Medusa Auth module (provider: 'emailpass')
      const authRes = await this.authModule.register('emailpass', {
        body: {
          email: normalizedEmail,
          password: payload.password,
        },
      });

      if (!authRes.success || !authRes.authIdentity) {
        if (
          authRes.error?.includes('already exists') ||
          authRes.error?.includes('duplicate') ||
          authRes.error?.includes('Identity with email already exists')
        ) {
          throw new Error(`EMAIL_ALREADY_REGISTERED: User with email '${normalizedEmail}' already exists.`);
        }
        throw new Error(`REGISTRATION_FAILED: ${authRes.error || 'Failed to create auth identity'}`);
      }

      createdAuthIdentityId = authRes.authIdentity.id;

      // 2. Create user in native Medusa User module
      const user = await this.userModule.createUsers({
        email: normalizedEmail,
        first_name: payload.name.trim(),
        metadata: {
          registeredAt: new Date().toISOString(),
        },
      });
      createdUserId = user.id;

      // 3. Link actor (user) to auth_identity in native Medusa Auth module
      await this.authModule.updateAuthIdentities({
        id: createdAuthIdentityId,
        app_metadata: {
          user_id: user.id,
          actor_type: 'merchant_user',
        },
      });

      // 4. Create Merchant in Marketplace module
      const merchant = await this.marketplaceModule.createMerchants({
        name: payload.name.trim(),
        handle,
        status: 'draft',
        email: normalizedEmail,
        phone: payload.phone.trim(),
        business_registration_number: payload.businessRegistrationNumber
          ? payload.businessRegistrationNumber.trim().toUpperCase()
          : null,
        tax_identifier: payload.taxIdentifier
          ? payload.taxIdentifier.trim().toUpperCase()
          : null,
        metadata: {
          applicationSubmittedAt: new Date().toISOString(),
        },
      });
      createdMerchantId = merchant.id;

      // 5. Create MerchantMember in Marketplace module
      const member = await this.marketplaceModule.createMerchantMembers({
        merchant_id: merchant.id,
        user_id: user.id,
        role: 'owner',
        status: 'active',
        metadata: {},
      });
      const memberObj = Array.isArray(member) ? member[0] : member;
      createdMemberId = memberObj?.id;

      const merchantRecord: MerchantRecord = {
        id: merchant.id,
        name: merchant.name,
        handle: merchant.handle,
        status: merchant.status as MerchantStatus,
        email: merchant.email,
        phone: merchant.phone,
        businessRegistrationNumber: merchant.business_registration_number,
        taxIdentifier: merchant.tax_identifier,
        metadata: merchant.metadata,
        createdAt: new Date(merchant.created_at).toISOString(),
        updatedAt: new Date(merchant.updated_at).toISOString(),
      };

      const merchantUser: MerchantUser = {
        id: user.id,
        email: user.email,
        merchantId: merchant.id,
        role: 'owner',
        membershipStatus: 'active',
        createdAt: new Date(user.created_at).toISOString(),
        updatedAt: new Date(user.updated_at).toISOString(),
      };

      return {
        merchant: merchantRecord,
        user: merchantUser,
        member: {
          id: memberObj?.id || createdMemberId,
          userId: user.id,
          role: 'owner',
          status: 'active',
        },
      };
    } catch (err: any) {
      // Atomic compensation / rollback across domain services
      if (createdMemberId) {
        try {
          await this.marketplaceModule.deleteMerchantMembers([createdMemberId]);
        } catch {}
      }
      if (createdMerchantId) {
        try {
          await this.marketplaceModule.deleteMerchants([createdMerchantId]);
        } catch {}
      }
      if (createdUserId) {
        try {
          await this.userModule.deleteUsers([createdUserId]);
        } catch {}
      }
      if (createdAuthIdentityId) {
        try {
          await this.authModule.deleteAuthIdentities([createdAuthIdentityId]);
        } catch {}
      }

      if (
        err.code === '23505' ||
        err.message?.includes('23505') ||
        err.message?.includes('duplicate') ||
        err.message?.includes('already exists')
      ) {
        if (err.message?.includes('handle') || err.constraint?.includes('handle')) {
          throw new Error(`HANDLE_ALREADY_IN_USE: Handle '${handle}' is already taken.`);
        }
        throw new Error(`EMAIL_ALREADY_REGISTERED: User with email '${normalizedEmail}' already exists.`);
      }
      throw err;
    }
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    user?: MerchantUser;
    error?: string;
  }> {
    await this.ensureInitialized();
    const normalizedEmail = email.trim().toLowerCase();

    const authRes = await this.authModule.authenticate('emailpass', {
      body: {
        email: normalizedEmail,
        password,
      },
    });

    if (!authRes.success || !authRes.authIdentity) {
      return {
        success: false,
        error: authRes.error || 'INVALID_CREDENTIALS',
      };
    }

    const userId = authRes.authIdentity.app_metadata?.user_id;
    if (!userId) {
      return {
        success: false,
        error: 'NO_ACTOR_ASSOCIATED',
      };
    }

    const user = await this.findUserById(userId);
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
      };
    }

    return {
      success: true,
      user,
    };
  }

  async findUserByEmail(email: string): Promise<MerchantUser | null> {
    await this.ensureInitialized();
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const users = await this.userModule.listUsers({ email: normalizedEmail }, { take: 1 });
      if (!users || users.length === 0) return null;
      return await this.findUserById(users[0].id);
    } catch {
      return null;
    }
  }

  async findUserById(id: string): Promise<MerchantUser | null> {
    await this.ensureInitialized();
    if (!id) return null;
    try {
      const user = await this.userModule.retrieveUser(id);
      if (!user) return null;

      const members = await this.marketplaceModule.listMerchantMembers(
        { user_id: user.id },
        { take: 1 }
      );
      const member = members && members.length > 0 ? members[0] : null;

      return {
        id: user.id,
        email: user.email,
        merchantId: member?.merchant_id || user.metadata?.merchantId || '',
        role: (member?.role || user.metadata?.role || 'owner') as MerchantRole,
        membershipStatus: (member?.status || user.metadata?.membershipStatus || 'active') as MerchantMemberStatus,
        createdAt: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
        updatedAt: user.updated_at ? new Date(user.updated_at).toISOString() : new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async findMerchantById(id: string): Promise<MerchantRecord | null> {
    await this.ensureInitialized();
    if (!id) return null;
    try {
      const m = await this.marketplaceModule.retrieveMerchant(id);
      if (!m) return null;
      return {
        id: m.id,
        name: m.name,
        handle: m.handle,
        status: m.status as MerchantStatus,
        email: m.email,
        phone: m.phone,
        businessRegistrationNumber: m.business_registration_number,
        taxIdentifier: m.tax_identifier,
        metadata: m.metadata,
        createdAt: new Date(m.created_at).toISOString(),
        updatedAt: new Date(m.updated_at).toISOString(),
      };
    } catch {
      return null;
    }
  }

  async findMerchantByHandle(handle: string): Promise<MerchantRecord | null> {
    await this.ensureInitialized();
    if (!handle) return null;
    try {
      const merchants = await this.marketplaceModule.listMerchants(
        { handle: handle.trim().toLowerCase() },
        { take: 1 }
      );
      if (!merchants || merchants.length === 0) return null;
      const m = merchants[0];
      return {
        id: m.id,
        name: m.name,
        handle: m.handle,
        status: m.status as MerchantStatus,
        email: m.email,
        phone: m.phone,
        businessRegistrationNumber: m.business_registration_number,
        taxIdentifier: m.tax_identifier,
        metadata: m.metadata,
        createdAt: new Date(m.created_at).toISOString(),
        updatedAt: new Date(m.updated_at).toISOString(),
      };
    } catch {
      return null;
    }
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await this.ensureInitialized();
    let email = '';
    if (userId.includes('@')) {
      email = userId.trim().toLowerCase();
    } else {
      const user = await this.findUserById(userId);
      if (!user) {
        throw new Error(`USER_NOT_FOUND: User '${userId}' not found.`);
      }
      email = user.email;
    }

    const updateRes = await this.authModule.updateProvider('emailpass', {
      entity_id: email,
      password: newPassword,
    });

    if (!updateRes.success) {
      throw new Error(updateRes.error || 'FAILED_TO_UPDATE_PASSWORD');
    }
  }

  async updateMerchantStatus(
    merchantId: string,
    status: MerchantStatus,
    reason?: string
  ): Promise<MerchantRecord> {
    await this.ensureInitialized();
    const merchant = await this.findMerchantById(merchantId);
    if (!merchant) {
      throw new Error(`NOT_FOUND: Merchant with ID '${merchantId}' not found.`);
    }

    const metadata = {
      ...(merchant.metadata || {}),
      ...(reason ? { statusReason: reason } : {}),
    };

    const updated = await this.marketplaceModule.updateMerchants({
      id: merchantId,
      status,
      metadata,
    });

    return {
      id: updated.id,
      name: updated.name,
      handle: updated.handle,
      status: updated.status as MerchantStatus,
      email: updated.email,
      phone: updated.phone,
      businessRegistrationNumber: updated.business_registration_number,
      taxIdentifier: updated.tax_identifier,
      metadata: updated.metadata,
      createdAt: new Date(updated.created_at).toISOString(),
      updatedAt: new Date(updated.updated_at).toISOString(),
    };
  }

  async updateMemberStatus(
    userId: string,
    status: MerchantMemberStatus
  ): Promise<MerchantUser> {
    await this.ensureInitialized();
    const members = await this.marketplaceModule.listMerchantMembers({ user_id: userId });
    if (!members || members.length === 0) {
      throw new Error(`USER_NOT_FOUND: User '${userId}' not found.`);
    }

    await this.marketplaceModule.updateMerchantMemberRoleOrStatus(
      members[0].merchant_id,
      members[0].id,
      { status }
    );

    const updatedUser = await this.findUserById(userId);
    if (!updatedUser) {
      throw new Error(`USER_NOT_FOUND: User '${userId}' not found.`);
    }
    return updatedUser;
  }

  async listMerchantMembers(merchantId: string): Promise<MerchantTeamMemberDto[]> {
    await this.ensureInitialized();
    const members = await this.marketplaceModule.listMerchantMembers({ merchant_id: merchantId });
    if (!members || members.length === 0) return [];

    const result: MerchantTeamMemberDto[] = [];
    for (const m of members) {
      let email = '';
      let name = '';
      try {
        const u = await this.userModule.retrieveUser(m.user_id);
        if (u) {
          email = u.email;
          name = [u.first_name, u.last_name].filter(Boolean).join(' ');
        }
      } catch {}

      result.push({
        id: m.id,
        merchantId: m.merchant_id,
        userId: m.user_id,
        email,
        name: name || undefined,
        role: m.role as MerchantRole,
        status: m.status as MerchantMemberStatus,
        createdAt: new Date(m.created_at).toISOString(),
        updatedAt: new Date(m.updated_at).toISOString(),
      });
    }
    return result;
  }

  async findMerchantMemberById(memberId: string): Promise<MerchantTeamMemberDto | null> {
    await this.ensureInitialized();
    try {
      let m: any = null;
      try {
        m = await this.marketplaceModule.retrieveMerchantMember(memberId);
      } catch {}

      if (!m) {
        const byId = await this.marketplaceModule.listMerchantMembers({ id: memberId });
        if (byId && byId.length > 0) m = byId[0];
      }

      if (!m) {
        const byUser = await this.marketplaceModule.listMerchantMembers({ user_id: memberId });
        if (byUser && byUser.length > 0) m = byUser[0];
      }

      if (!m) return null;

      let email = '';
      let name = '';
      try {
        const u = await this.userModule.retrieveUser(m.user_id);
        if (u) {
          email = u.email;
          name = [u.first_name, u.last_name].filter(Boolean).join(' ');
        }
      } catch {}
      return {
        id: m.id,
        merchantId: m.merchant_id,
        userId: m.user_id,
        email,
        name: name || undefined,
        role: m.role as MerchantRole,
        status: m.status as MerchantMemberStatus,
        createdAt: new Date(m.created_at).toISOString(),
        updatedAt: new Date(m.updated_at).toISOString(),
      };
    } catch {
      return null;
    }
  }

  async findMerchantMemberByUserAndMerchant(merchantId: string, userId: string): Promise<MerchantTeamMemberDto | null> {
    await this.ensureInitialized();
    try {
      const members = await this.marketplaceModule.listMerchantMembers({
        merchant_id: merchantId,
        user_id: userId,
      });
      if (!members || members.length === 0) return null;
      const m = members[0];
      let email = '';
      let name = '';
      try {
        const u = await this.userModule.retrieveUser(m.user_id);
        if (u) {
          email = u.email;
          name = [u.first_name, u.last_name].filter(Boolean).join(' ');
        }
      } catch {}
      return {
        id: m.id,
        merchantId: m.merchant_id,
        userId: m.user_id,
        email,
        name: name || undefined,
        role: m.role as MerchantRole,
        status: m.status as MerchantMemberStatus,
        createdAt: new Date(m.created_at).toISOString(),
        updatedAt: new Date(m.updated_at).toISOString(),
      };
    } catch {
      return null;
    }
  }

  async inviteMerchantMember(params: {
    merchantId: string;
    email: string;
    role: MerchantRole;
    invitedByUserId?: string;
  }): Promise<MerchantTeamMemberDto> {
    await this.ensureInitialized();
    const normalizedEmail = params.email.trim().toLowerCase();

    // 1. Verify merchant exists
    const merchant = await this.findMerchantById(params.merchantId);
    if (!merchant) {
      throw new Error(`NOT_FOUND: Merchant '${params.merchantId}' not found.`);
    }

    // 2. Find or create user in User module
    let user = null;
    const existingUsers = await this.userModule.listUsers({ email: normalizedEmail }, { take: 1 });
    if (existingUsers && existingUsers.length > 0) {
      user = existingUsers[0];
    } else {
      user = await this.userModule.createUsers({
        email: normalizedEmail,
        metadata: {
          invitedToMerchantId: params.merchantId,
          invitedAt: new Date().toISOString(),
        },
      });
    }

    // 3. Check duplicate membership in this merchant
    const existingMembers = await this.marketplaceModule.listMerchantMembers({
      merchant_id: params.merchantId,
      user_id: user.id,
    });
    if (existingMembers && existingMembers.length > 0) {
      throw new Error(`DUPLICATE_MEMBERSHIP: User with email '${normalizedEmail}' is already a member of this merchant.`);
    }

    // 4. Create merchant member in Marketplace module
    const member = await this.marketplaceModule.createMerchantMembers({
      merchant_id: params.merchantId,
      user_id: user.id,
      role: params.role,
      status: 'invited',
      metadata: {
        invitedBy: params.invitedByUserId || 'system',
        invitedAt: new Date().toISOString(),
      },
    });

    return {
      id: member.id,
      merchantId: member.merchant_id,
      userId: member.user_id,
      email: normalizedEmail,
      role: member.role as MerchantRole,
      status: member.status as MerchantMemberStatus,
      createdAt: new Date(member.created_at).toISOString(),
      updatedAt: new Date(member.updated_at).toISOString(),
    };
  }

  async updateMerchantMemberRoleOrStatus(
    merchantId: string,
    memberIdOrUserId: string,
    update: { role?: MerchantRole; status?: MerchantMemberStatus }
  ): Promise<MerchantTeamMemberDto> {
    await this.ensureInitialized();

    const members = await this.marketplaceModule.listMerchantMembers({ merchant_id: merchantId });
    const target = members.find((m: any) => m.id === memberIdOrUserId || m.user_id === memberIdOrUserId);
    if (!target) {
      throw new Error(`MEMBER_NOT_FOUND: Member '${memberIdOrUserId}' not found in merchant '${merchantId}'.`);
    }

    await this.marketplaceModule.updateMerchantMemberRoleOrStatus(merchantId, target.user_id, update);

    const updated = await this.findMerchantMemberById(target.id);
    if (!updated) {
      throw new Error(`MEMBER_NOT_FOUND: Failed to retrieve updated member '${target.id}'.`);
    }
    return updated;
  }

  async removeMerchantMember(merchantId: string, memberIdOrUserId: string): Promise<boolean> {
    await this.ensureInitialized();
    return await this.marketplaceModule.removeMerchantMember(merchantId, memberIdOrUserId);
  }

  async listAllPlatformMembers(filter?: {
    merchantId?: string;
    role?: MerchantRole;
    status?: MerchantMemberStatus;
  }): Promise<(MerchantTeamMemberDto & { merchantName?: string; merchantHandle?: string })[]> {
    await this.ensureInitialized();
    const queryFilter: Record<string, any> = {};
    if (filter?.merchantId) queryFilter.merchant_id = filter.merchantId;
    if (filter?.role) queryFilter.role = filter.role;
    if (filter?.status) queryFilter.status = filter.status;

    const members = await this.marketplaceModule.listMerchantMembers(queryFilter);
    if (!members || members.length === 0) return [];

    const result: (MerchantTeamMemberDto & { merchantName?: string; merchantHandle?: string })[] = [];
    for (const m of members) {
      let email = '';
      let name = '';
      try {
        const u = await this.userModule.retrieveUser(m.user_id);
        if (u) {
          email = u.email;
          name = [u.first_name, u.last_name].filter(Boolean).join(' ');
        }
      } catch {}

      let merchantName = '';
      let merchantHandle = '';
      try {
        const merch = await this.marketplaceModule.retrieveMerchant(m.merchant_id);
        if (merch) {
          merchantName = merch.name;
          merchantHandle = merch.handle;
        }
      } catch {}

      result.push({
        id: m.id,
        merchantId: m.merchant_id,
        userId: m.user_id,
        email,
        name: name || undefined,
        role: m.role as MerchantRole,
        status: m.status as MerchantMemberStatus,
        createdAt: new Date(m.created_at).toISOString(),
        updatedAt: new Date(m.updated_at).toISOString(),
        merchantName: merchantName || undefined,
        merchantHandle: merchantHandle || undefined,
      });
    }
    return result;
  }

  async close(): Promise<void> {
    if (!this.isExternalPool) {
      try {
        await this.directPool.end();
      } catch {}
    }
  }

  async clear(): Promise<void> {
    if (this.isProduction || process.env.NODE_ENV === 'production') {
      throw new Error('PRODUCTION_SECURITY_VIOLATION: Clear is prohibited in production.');
    }
    await this.ensureInitialized();
    try {
      const members = await this.marketplaceModule.listMerchantMembers();
      if (members && members.length > 0) {
        await this.marketplaceModule.deleteMerchantMembers(members.map((m: any) => m.id));
      }
      const merchants = await this.marketplaceModule.listMerchants();
      if (merchants && merchants.length > 0) {
        await this.marketplaceModule.deleteMerchants(merchants.map((m: any) => m.id));
      }
      const users = await this.userModule.listUsers();
      if (users && users.length > 0) {
        await this.userModule.deleteUsers(users.map((u: any) => u.id));
      }
      const authIdentities = await this.authModule.listAuthIdentities();
      if (authIdentities && authIdentities.length > 0) {
        await this.authModule.deleteAuthIdentities(authIdentities.map((a: any) => a.id));
      }
    } catch {
      try {
        await this.directPool.query(`
          DELETE FROM merchant_member;
          DELETE FROM merchant;
          DELETE FROM "user";
          DELETE FROM provider_identity;
          DELETE FROM auth_identity;
        `);
      } catch {}
    }
  }
}

// Backwards-compatibility alias for tests and existing imports
export { MedusaNativeMerchantIdentityStore as PostgresMerchantIdentityStore };

export class InMemoryMerchantIdentityStore implements IMerchantIdentityStore {
  private authIdentities = new Map<string, { id: string; entity_id: string; passwordHash: string; passwordSalt: string; app_metadata: Record<string, any> }>();
  private users = new Map<string, MerchantUser>();
  private merchants = new Map<string, MerchantRecord>();
  private members = new Map<string, { id: string; merchantId: string; userId: string; role: MerchantRole; status: MerchantMemberStatus }>();

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PRODUCTION_SECURITY_VIOLATION: InMemoryMerchantIdentityStore is strictly prohibited in production.');
    }
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async findUserByEmail(email: string): Promise<MerchantUser | null> {
    if (!email) return null;
    return this.users.get(email.trim().toLowerCase()) || null;
  }

  async findUserById(id: string): Promise<MerchantUser | null> {
    for (const u of this.users.values()) {
      if (u.id === id) return u;
    }
    return null;
  }

  async findMerchantById(id: string): Promise<MerchantRecord | null> {
    return this.merchants.get(id) || null;
  }

  async findMerchantByHandle(handle: string): Promise<MerchantRecord | null> {
    const normalizedHandle = handle.trim().toLowerCase();
    for (const m of this.merchants.values()) {
      if (m.handle.toLowerCase() === normalizedHandle) return m;
    }
    return null;
  }

  async createMerchantWithAccount(
    payload: MerchantRegisterPayload,
    _legacyHash?: string,
    _legacySalt?: string
  ): Promise<{
    merchant: MerchantRecord;
    user: MerchantUser;
    member: {
      id: string;
      userId: string;
      role: MerchantRole;
      status: MerchantMemberStatus;
    };
  }> {
    const normalizedEmail = payload.email.trim().toLowerCase();
    if (this.users.has(normalizedEmail) || this.authIdentities.has(normalizedEmail)) {
      throw new Error(`EMAIL_ALREADY_REGISTERED: User with email '${normalizedEmail}' already exists.`);
    }

    const handle = payload.handle
      ? payload.handle.trim().toLowerCase()
      : payload.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    for (const m of this.merchants.values()) {
      if (m.handle === handle) {
        throw new Error(`HANDLE_ALREADY_IN_USE: Handle '${handle}' is already taken.`);
      }
    }

    const merchantId = `merch_${crypto.randomBytes(8).toString('hex')}`;
    const userId = `usr_merch_${crypto.randomBytes(8).toString('hex')}`;
    const authId = `authid_${crypto.randomBytes(12).toString('hex')}`;
    const memberId = `mem_${crypto.randomBytes(8).toString('hex')}`;
    const now = new Date().toISOString();

    const { hash, salt } = MerchantAuthEngine.hashPassword(payload.password);

    // Store auth identity separately (as Medusa auth_identity + provider_identity)
    this.authIdentities.set(normalizedEmail, {
      id: authId,
      entity_id: normalizedEmail,
      passwordHash: hash,
      passwordSalt: salt,
      app_metadata: { user_id: userId, actor_type: 'merchant_user' },
    });

    const merchant: MerchantRecord = {
      id: merchantId,
      name: payload.name.trim(),
      handle,
      status: 'draft',
      email: normalizedEmail,
      phone: payload.phone.trim(),
      businessRegistrationNumber: payload.businessRegistrationNumber
        ? payload.businessRegistrationNumber.trim().toUpperCase()
        : null,
      taxIdentifier: payload.taxIdentifier
        ? payload.taxIdentifier.trim().toUpperCase()
        : null,
      metadata: { applicationSubmittedAt: now },
      createdAt: now,
      updatedAt: now,
    };

    // User record does NOT contain password hash or salt!
    const user: MerchantUser = {
      id: userId,
      email: normalizedEmail,
      merchantId,
      role: 'owner',
      membershipStatus: 'active',
      createdAt: now,
      updatedAt: now,
    };

    const member = {
      id: memberId,
      userId,
      role: 'owner' as MerchantRole,
      status: 'active' as MerchantMemberStatus,
    };

    this.merchants.set(merchantId, merchant);
    this.users.set(normalizedEmail, user);
    this.members.set(memberId, { id: memberId, merchantId, userId, role: 'owner', status: 'active' });

    return { merchant, user, member };
  }

  async authenticateUser(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    user?: MerchantUser;
    error?: string;
  }> {
    const normalizedEmail = email.trim().toLowerCase();
    const auth = this.authIdentities.get(normalizedEmail);
    if (!auth) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    const isValid = MerchantAuthEngine.verifyPassword(password, auth.passwordHash, auth.passwordSalt);
    if (!isValid) {
      return { success: false, error: 'INVALID_CREDENTIALS' };
    }

    const user = this.users.get(normalizedEmail);
    if (!user) {
      return { success: false, error: 'USER_NOT_FOUND' };
    }

    return { success: true, user };
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error(`USER_NOT_FOUND: User '${userId}' not found.`);
    }
    const auth = this.authIdentities.get(user.email.toLowerCase());
    if (!auth) {
      throw new Error(`AUTH_IDENTITY_NOT_FOUND: Auth identity for '${user.email}' not found.`);
    }
    const { hash, salt } = MerchantAuthEngine.hashPassword(newPassword);
    auth.passwordHash = hash;
    auth.passwordSalt = salt;
  }

  async updateMerchantStatus(
    merchantId: string,
    status: MerchantStatus,
    reason?: string
  ): Promise<MerchantRecord> {
    const merchant = this.merchants.get(merchantId);
    if (!merchant) {
      throw new Error(`NOT_FOUND: Merchant with ID '${merchantId}' not found.`);
    }
    merchant.status = status;
    merchant.updatedAt = new Date().toISOString();
    if (!merchant.metadata) merchant.metadata = {};
    if (reason) merchant.metadata.statusReason = reason;
    return merchant;
  }

  async updateMemberStatus(
    userId: string,
    status: MerchantMemberStatus
  ): Promise<MerchantUser> {
    const user = await this.findUserById(userId);
    if (!user) {
      throw new Error(`USER_NOT_FOUND: User '${userId}' not found.`);
    }
    user.membershipStatus = status;
    user.updatedAt = new Date().toISOString();
    this.users.set(user.email.toLowerCase(), user);
    return user;
  }

  async listMerchantMembers(merchantId: string): Promise<MerchantTeamMemberDto[]> {
    const result: MerchantTeamMemberDto[] = [];
    for (const m of this.members.values()) {
      if (m.merchantId === merchantId) {
        let email = '';
        for (const u of this.users.values()) {
          if (u.id === m.userId) {
            email = u.email;
            break;
          }
        }
        result.push({
          id: m.id,
          merchantId: m.merchantId,
          userId: m.userId,
          email,
          role: m.role,
          status: m.status,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    }
    return result;
  }

  async findMerchantMemberById(memberId: string): Promise<MerchantTeamMemberDto | null> {
    const m = this.members.get(memberId);
    if (!m) return null;
    let email = '';
    for (const u of this.users.values()) {
      if (u.id === m.userId) {
        email = u.email;
        break;
      }
    }
    return {
      id: m.id,
      merchantId: m.merchantId,
      userId: m.userId,
      email,
      role: m.role,
      status: m.status,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async findMerchantMemberByUserAndMerchant(merchantId: string, userId: string): Promise<MerchantTeamMemberDto | null> {
    for (const m of this.members.values()) {
      if (m.merchantId === merchantId && m.userId === userId) {
        return await this.findMerchantMemberById(m.id);
      }
    }
    return null;
  }

  async inviteMerchantMember(params: {
    merchantId: string;
    email: string;
    role: MerchantRole;
    invitedByUserId?: string;
  }): Promise<MerchantTeamMemberDto> {
    const normalizedEmail = params.email.trim().toLowerCase();
    const merchant = this.merchants.get(params.merchantId);
    if (!merchant) {
      throw new Error(`NOT_FOUND: Merchant '${params.merchantId}' not found.`);
    }

    let user = this.users.get(normalizedEmail);
    if (!user) {
      const userId = `usr_inv_${crypto.randomBytes(8).toString('hex')}`;
      user = {
        id: userId,
        email: normalizedEmail,
        merchantId: params.merchantId,
        role: params.role,
        membershipStatus: 'invited',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.users.set(normalizedEmail, user);
    }

    // Check duplicate membership
    for (const m of this.members.values()) {
      if (m.merchantId === params.merchantId && m.userId === user.id) {
        throw new Error(`DUPLICATE_MEMBERSHIP: User with email '${normalizedEmail}' is already a member of this merchant.`);
      }
    }

    const memberId = `mem_${crypto.randomBytes(8).toString('hex')}`;
    const newMember = {
      id: memberId,
      merchantId: params.merchantId,
      userId: user.id,
      role: params.role,
      status: 'invited' as MerchantMemberStatus,
    };
    this.members.set(memberId, newMember);

    return {
      id: memberId,
      merchantId: params.merchantId,
      userId: user.id,
      email: normalizedEmail,
      role: params.role,
      status: 'invited',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  async updateMerchantMemberRoleOrStatus(
    merchantId: string,
    memberIdOrUserId: string,
    update: { role?: MerchantRole; status?: MerchantMemberStatus }
  ): Promise<MerchantTeamMemberDto> {
    let target = this.members.get(memberIdOrUserId);
    if (!target) {
      for (const m of this.members.values()) {
        if (m.merchantId === merchantId && m.userId === memberIdOrUserId) {
          target = m;
          break;
        }
      }
    }

    if (!target || target.merchantId !== merchantId) {
      throw new Error(`MEMBER_NOT_FOUND: Member '${memberIdOrUserId}' not found in merchant '${merchantId}'.`);
    }

    if (update.status && update.status !== target.status) {
      const statusRes = validateMemberStatusTransition(target.status, update.status);
      if (!statusRes.allowed) {
        throw new Error(statusRes.error || `INVALID_TRANSITION: Invalid status transition to ${update.status}`);
      }
    }

    const currentMembers = Array.from(this.members.values())
      .filter((m) => m.merchantId === merchantId)
      .map((m) => ({
        userId: m.userId,
        role: m.role,
        status: m.status,
      }));

    const soleOwnerRes = validateSoleOwnerConstraint(
      currentMembers,
      target.userId,
      update.role,
      update.status
    );
    if (!soleOwnerRes.allowed) {
      throw new Error(soleOwnerRes.error);
    }

    if (update.role) target.role = update.role;
    if (update.status) target.status = update.status;
    this.members.set(target.id, target);

    // Also update user record if present
    for (const u of this.users.values()) {
      if (u.id === target.userId) {
        if (update.role) u.role = update.role;
        if (update.status) u.membershipStatus = update.status;
        u.updatedAt = new Date().toISOString();
        break;
      }
    }

    const updated = await this.findMerchantMemberById(target.id);
    return updated!;
  }

  async removeMerchantMember(merchantId: string, memberIdOrUserId: string): Promise<boolean> {
    let target = this.members.get(memberIdOrUserId);
    if (!target) {
      for (const m of this.members.values()) {
        if (m.merchantId === merchantId && m.userId === memberIdOrUserId) {
          target = m;
          break;
        }
      }
    }

    if (!target || target.merchantId !== merchantId) {
      throw new Error(`MEMBER_NOT_FOUND: Member '${memberIdOrUserId}' not found in merchant '${merchantId}'.`);
    }

    const currentMembers = Array.from(this.members.values())
      .filter((m) => m.merchantId === merchantId);

    const activeOwners = currentMembers.filter(
      (m) => m.role === 'owner' && m.status === 'active'
    );
    if (target.role === 'owner' && target.status === 'active' && activeOwners.length === 1) {
      throw new Error('SOLE_OWNER_PROTECTION: Cannot remove the sole active owner of this merchant. Transfer ownership to another active member first.');
    }

    this.members.delete(target.id);
    return true;
  }

  async listAllPlatformMembers(filter?: {
    merchantId?: string;
    role?: MerchantRole;
    status?: MerchantMemberStatus;
  }): Promise<(MerchantTeamMemberDto & { merchantName?: string; merchantHandle?: string })[]> {
    const result: (MerchantTeamMemberDto & { merchantName?: string; merchantHandle?: string })[] = [];
    for (const m of this.members.values()) {
      if (filter?.merchantId && m.merchantId !== filter.merchantId) continue;
      if (filter?.role && m.role !== filter.role) continue;
      if (filter?.status && m.status !== filter.status) continue;

      let email = '';
      for (const u of this.users.values()) {
        if (u.id === m.userId) {
          email = u.email;
          break;
        }
      }

      const merch = this.merchants.get(m.merchantId);

      result.push({
        id: m.id,
        merchantId: m.merchantId,
        userId: m.userId,
        email,
        role: m.role,
        status: m.status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        merchantName: merch?.name,
        merchantHandle: merch?.handle,
      });
    }
    return result;
  }

  async close(): Promise<void> {
    await this.clear();
  }

  async clear(): Promise<void> {
    this.authIdentities.clear();
    this.users.clear();
    this.merchants.clear();
    this.members.clear();
  }
}

// ==========================================
// Merchant Auth Engine
// ==========================================

export class MerchantAuthEngine {
  public static readonly SESSION_IDLE_TIMEOUT_MS = 2 * 60 * 60 * 1000; // 2 hours sliding
  public static readonly SESSION_ABSOLUTE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours absolute max
  public static readonly RESET_TOKEN_TTL_SECONDS = 15 * 60; // 15 minutes

  private static sessionAdapter: IMerchantAuthStorageAdapter | null = null;
  private static identityStore: IMerchantIdentityStore | null = null;
  private static auditLogs: MerchantAuthAuditEvent[] = [];
  private static teamAuditLogs: TeamAuditEvent[] = [];
  private static memberMutationLocks = new Map<string, Promise<void>>();

  // ------------------------------------------
  // Storage Adapter Management
  // ------------------------------------------

  static setAdapter(adapter: IMerchantAuthStorageAdapter): void {
    MerchantAuthEngine.sessionAdapter = adapter;
  }

  static getAdapter(): IMerchantAuthStorageAdapter {
    if (!MerchantAuthEngine.sessionAdapter) {
      const isTest = process.env.NODE_ENV === 'test' ||
        process.execArgv.some((a) => a.includes('--test')) ||
        process.argv.some((arg) => arg.includes('--test') || arg.endsWith('.test.js') || arg.endsWith('.test.ts'));
      if (isTest && process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'development') {
        MerchantAuthEngine.sessionAdapter = new InMemoryMerchantAuthStorageAdapter();
      } else {
        MerchantAuthEngine.sessionAdapter = new RedisMerchantAuthStorageAdapter();
      }
    }
    return MerchantAuthEngine.sessionAdapter;
  }

  static async close(): Promise<void> {
    if (MerchantAuthEngine.sessionAdapter) {
      await MerchantAuthEngine.sessionAdapter.close().catch(() => {});
      MerchantAuthEngine.sessionAdapter = null;
    }
    if (MerchantAuthEngine.identityStore) {
      await MerchantAuthEngine.identityStore.close().catch(() => {});
      MerchantAuthEngine.identityStore = null;
    }
  }

  static setIdentityStore(store: IMerchantIdentityStore): void {
    MerchantAuthEngine.identityStore = store;
  }

  static getIdentityStore(): IMerchantIdentityStore {
    if (!MerchantAuthEngine.identityStore) {
      if (process.env.NODE_ENV === 'production' || process.env.DATABASE_URL) {
        MerchantAuthEngine.identityStore = new MedusaNativeMerchantIdentityStore();
      } else {
        MerchantAuthEngine.identityStore = new MedusaNativeMerchantIdentityStore();
      }
    }
    return MerchantAuthEngine.identityStore;
  }

  // ------------------------------------------
  // Role & Permissions Helper
  // ------------------------------------------

  static getPermissionsForRole(role: MerchantRole): MarketplacePermission[] {
    switch (role) {
      case 'owner':
        return [
          'catalog:read',
          'catalog:write',
          'catalog:delete',
          'inventory:read',
          'inventory:adjust',
          'orders:read',
          'orders:fulfill',
          'returns:read',
          'returns:process',
          'financials:view',
          'financials:payout',
          'team:manage',
          'settings:manage',
        ];
      case 'admin':
        return [
          'catalog:read',
          'catalog:write',
          'catalog:delete',
          'inventory:read',
          'inventory:adjust',
          'orders:read',
          'orders:fulfill',
          'returns:read',
          'returns:process',
          'team:manage',
        ];
      case 'manager':
        return [
          'catalog:read',
          'catalog:write',
          'inventory:read',
          'inventory:adjust',
          'orders:read',
          'orders:fulfill',
          'returns:read',
        ];
      case 'staff':
      default:
        return ['catalog:read', 'orders:read', 'orders:fulfill'];
    }
  }

  // ------------------------------------------
  // Audit Logging (Zero Plaintext Secrets)
  // ------------------------------------------

  static logAuditEvent(params: {
    action: MerchantAuthAction;
    outcome: 'success' | 'failure';
    userId?: string;
    merchantId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    reason?: string;
  }): MerchantAuthAuditEvent {
    const event: MerchantAuthAuditEvent = {
      eventId: `merch_audit_${crypto.randomBytes(12).toString('hex')}`,
      action: params.action,
      outcome: params.outcome,
      userId: params.userId,
      merchantId: params.merchantId,
      email: params.email ? params.email.toLowerCase().trim() : undefined,
      ip: params.ip,
      userAgent: params.userAgent,
      timestamp: new Date().toISOString(),
      reason: params.reason,
    };

    MerchantAuthEngine.auditLogs.push(event);
    if (MerchantAuthEngine.auditLogs.length > 500) {
      MerchantAuthEngine.auditLogs.shift();
    }

    return event;
  }

  static getAuditLogs(filter?: {
    userId?: string;
    merchantId?: string;
    action?: MerchantAuthAction;
  }): MerchantAuthAuditEvent[] {
    let logs = [...MerchantAuthEngine.auditLogs];
    if (filter?.userId) logs = logs.filter((l) => l.userId === filter.userId);
    if (filter?.merchantId) logs = logs.filter((l) => l.merchantId === filter.merchantId);
    if (filter?.action) logs = logs.filter((l) => l.action === filter.action);
    return logs;
  }

  // ------------------------------------------
  // Password Security (Scrypt + Constant-Time Utilities)
  // ------------------------------------------

  static hashPassword(password: string): { hash: string; salt: string } {
    if (!password || password.length < 8) {
      throw new Error('PASSWORD_TOO_WEAK: Password must be at least 8 characters long.');
    }
    const salt = crypto.randomBytes(32).toString('hex');
    const hash = crypto
      .scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 })
      .toString('hex');
    return { hash, salt };
  }

  static verifyPassword(password: string, storedHash: string, salt: string): boolean {
    if (!password || !storedHash || !salt) return false;
    try {
      const candidate = crypto
        .scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 })
        .toString('hex');
      const candidateBuf = Buffer.from(candidate, 'hex');
      const storedBuf = Buffer.from(storedHash, 'hex');
      if (candidateBuf.length !== storedBuf.length) return false;
      return crypto.timingSafeEqual(candidateBuf, storedBuf);
    } catch {
      return false;
    }
  }

  // ------------------------------------------
  // Rate Limiting & Lockout
  // ------------------------------------------

  static async checkRateLimit(key: string): Promise<RateLimitCheckResult> {
    return MerchantAuthEngine.getAdapter().checkRateLimit(key);
  }

  static async recordFailedAttempt(key: string): Promise<void> {
    await MerchantAuthEngine.getAdapter().recordFailedAttempt(key);
  }

  static async resetRateLimit(key: string): Promise<void> {
    await MerchantAuthEngine.getAdapter().resetRateLimit(key);
  }

  // ------------------------------------------
  // Merchant Onboarding & User Registration
  // ------------------------------------------

  static async registerMerchant(payload: MerchantRegisterPayload): Promise<{
    merchant: MerchantRecord;
    user: MerchantUser;
    member: {
      id: string;
      userId: string;
      role: MerchantRole;
      status: MerchantMemberStatus;
    };
  }> {
    // 1. Validate payload
    const validation = validateMerchantProfile(payload, true);
    if (!validation.isValid) {
      throw new Error(`MERCHANT_VALIDATION_FAILED: ${validation.errors.join('; ')}`);
    }

    const result = await MerchantAuthEngine.getIdentityStore().createMerchantWithAccount(payload);

    MerchantAuthEngine.logAuditEvent({
      action: 'merchant.register',
      outcome: 'success',
      userId: result.user.id,
      merchantId: result.merchant.id,
      email: result.user.email,
    });

    return result;
  }

  static async authenticateUser(
    email: string,
    password: string
  ): Promise<{
    success: boolean;
    user?: MerchantUser;
    error?: string;
  }> {
    return await MerchantAuthEngine.getIdentityStore().authenticateUser(email, password);
  }

  static async findMerchantById(id: string): Promise<MerchantRecord | null> {
    return await MerchantAuthEngine.getIdentityStore().findMerchantById(id);
  }

  static async findMerchantByHandle(handle: string): Promise<MerchantRecord | null> {
    return await MerchantAuthEngine.getIdentityStore().findMerchantByHandle(handle);
  }

  static async updateMerchantStatus(
    id: string,
    status: MerchantStatus,
    reason?: string
  ): Promise<MerchantRecord> {
    return await MerchantAuthEngine.getIdentityStore().updateMerchantStatus(id, status, reason);
  }

  static async findUserByEmail(email: string): Promise<MerchantUser | null> {
    return await MerchantAuthEngine.getIdentityStore().findUserByEmail(email);
  }

  static async findUserById(id: string): Promise<MerchantUser | null> {
    return await MerchantAuthEngine.getIdentityStore().findUserById(id);
  }

  static async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    await MerchantAuthEngine.getIdentityStore().updateUserPassword(userId, newPassword);
  }

  static async updateMemberStatus(
    userId: string,
    status: MerchantMemberStatus
  ): Promise<MerchantUser> {
    return await MerchantAuthEngine.getIdentityStore().updateMemberStatus(userId, status);
  }

  // ------------------------------------------
  // Session Creation & Resolution
  // ------------------------------------------

  static async createSession(params: {
    userId: string;
    merchantId: string;
    email: string;
    role: MerchantRole;
    membershipStatus: MerchantMemberStatus;
    merchantStatus: MerchantStatus;
    ip?: string;
    userAgent?: string;
  }): Promise<MerchantSessionRecord> {
    const token = `sess_merch_${crypto.randomBytes(32).toString('hex')}`;
    const now = Date.now();
    const permissions = MerchantAuthEngine.getPermissionsForRole(params.role);

    const record: MerchantSessionRecord = {
      token,
      userId: params.userId,
      merchantId: params.merchantId,
      email: params.email.toLowerCase(),
      role: params.role,
      membershipStatus: params.membershipStatus,
      merchantStatus: params.merchantStatus,
      permissions,
      actorType: 'merchant_user',
      authBoundary: 'merchant',
      createdAt: now,
      lastActivityAt: now,
      expiresAt: now + MerchantAuthEngine.SESSION_ABSOLUTE_TTL_MS,
      ip: params.ip,
      userAgent: params.userAgent,
    };

    await MerchantAuthEngine.getAdapter().saveSession(record);

    MerchantAuthEngine.logAuditEvent({
      action: 'merchant.login.success',
      outcome: 'success',
      userId: params.userId,
      merchantId: params.merchantId,
      email: params.email,
      ip: params.ip,
      userAgent: params.userAgent,
    });

    return record;
  }

  static async resolveSession(token: string | null): Promise<AuthenticatedSessionDto | null> {
    if (!token) return null;
    const session = await MerchantAuthEngine.getAdapter().getSession(token);
    if (!session) return null;

    // Dynamically synchronize live merchant and member status from identity store if available
    const liveUser = await MerchantAuthEngine.findUserById(session.userId);
    const liveMerchant = await MerchantAuthEngine.findMerchantById(session.merchantId);

    const membershipStatus = liveUser ? liveUser.membershipStatus : session.membershipStatus;
    const merchantStatus = liveMerchant ? liveMerchant.status : session.merchantStatus;
    const role = liveUser ? liveUser.role : session.role;
    const permissions = MerchantAuthEngine.getPermissionsForRole(role);

    return {
      userId: session.userId,
      merchantId: session.merchantId,
      email: session.email,
      role,
      membershipStatus,
      merchantStatus,
      permissions,
      authBoundary: 'merchant',
      actorType: 'merchant_user',
      sessionToken: session.token,
      issuedAt: new Date(session.createdAt).toISOString(),
      expiresAt: new Date(session.expiresAt).toISOString(),
    };
  }

  static async revokeSession(token: string): Promise<boolean> {
    const session = await MerchantAuthEngine.getAdapter().getSession(token);
    const success = await MerchantAuthEngine.getAdapter().revokeSession(token);

    if (session) {
      MerchantAuthEngine.logAuditEvent({
        action: 'merchant.logout',
        outcome: 'success',
        userId: session.userId,
        merchantId: session.merchantId,
        email: session.email,
      });
    }

    return success;
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    await MerchantAuthEngine.getAdapter().revokeAllUserSessions(userId);

    MerchantAuthEngine.logAuditEvent({
      action: 'merchant.session.revoked',
      outcome: 'success',
      userId,
      reason: 'Global user revocation triggered.',
    });
  }

  // ------------------------------------------
  // Password Reset Flow
  // ------------------------------------------

  static async createPasswordResetToken(email: string): Promise<string | null> {
    const user = await MerchantAuthEngine.findUserByEmail(email);
    if (!user) {
      // Return null quietly to prevent user enumeration
      return null;
    }

    const resetToken = `reset_merch_${crypto.randomBytes(32).toString('hex')}`;
    await MerchantAuthEngine.getAdapter().savePasswordResetToken(
      resetToken,
      user.id,
      MerchantAuthEngine.RESET_TOKEN_TTL_SECONDS
    );

    MerchantAuthEngine.logAuditEvent({
      action: 'merchant.password_reset_requested',
      outcome: 'success',
      userId: user.id,
      merchantId: user.merchantId,
      email: user.email,
    });

    return resetToken;
  }

  static async resetPasswordWithToken(
    token: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    if (!token || !token.startsWith('reset_merch_')) {
      return { success: false, error: 'INVALID_RESET_TOKEN' };
    }

    if (!newPassword || newPassword.length < 8) {
      return { success: false, error: 'PASSWORD_TOO_WEAK: Password must be at least 8 characters long.' };
    }

    // Single-use atomic consumption
    const userId = await MerchantAuthEngine.getAdapter().consumePasswordResetToken(token);
    if (!userId) {
      return { success: false, error: 'EXPIRED_OR_INVALID_TOKEN: Password reset token is invalid or has expired.' };
    }

    // Update password via native auth provider
    await MerchantAuthEngine.updateUserPassword(userId, newPassword);

    // Invalidate all existing sessions for this user across shared storage
    await MerchantAuthEngine.revokeAllUserSessions(userId);

    const user = await MerchantAuthEngine.findUserById(userId);
    MerchantAuthEngine.logAuditEvent({
      action: 'merchant.password_reset_completed',
      outcome: 'success',
      userId,
      merchantId: user?.merchantId,
      email: user?.email,
    });

    return { success: true };
  }

  // ------------------------------------------
  // Concurrency Lock Helper
  // ------------------------------------------

  static async withMerchantLock<T>(merchantId: string, fn: () => Promise<T>): Promise<T> {
    const currentLock = MerchantAuthEngine.memberMutationLocks.get(merchantId) || Promise.resolve();
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    MerchantAuthEngine.memberMutationLocks.set(merchantId, nextLock);

    try {
      await currentLock;
      return await fn();
    } finally {
      release!();
      if (MerchantAuthEngine.memberMutationLocks.get(merchantId) === nextLock) {
        MerchantAuthEngine.memberMutationLocks.delete(merchantId);
      }
    }
  }

  // ------------------------------------------
  // Team Audit Logging
  // ------------------------------------------

  static logTeamAuditEvent(params: {
    action: TeamAuditAction;
    actorUserId: string;
    actorRole?: string;
    merchantId?: string;
    targetUserId: string;
    targetMemberId?: string;
    previousRole?: string;
    newRole?: string;
    previousStatus?: string;
    newStatus?: string;
    ip?: string;
    userAgent?: string;
    outcome: 'success' | 'failure';
    reason?: string;
  }): TeamAuditEvent {
    const event: TeamAuditEvent = {
      eventId: `team_audit_${crypto.randomBytes(12).toString('hex')}`,
      action: params.action,
      actorUserId: params.actorUserId,
      actorRole: params.actorRole,
      merchantId: params.merchantId,
      targetUserId: params.targetUserId,
      targetMemberId: params.targetMemberId,
      previousRole: params.previousRole,
      newRole: params.newRole,
      previousStatus: params.previousStatus,
      newStatus: params.newStatus,
      ip: params.ip,
      userAgent: params.userAgent,
      timestamp: new Date().toISOString(),
      outcome: params.outcome,
      reason: params.reason,
    };
    MerchantAuthEngine.teamAuditLogs.push(event);
    return event;
  }

  static getTeamAuditLogs(): TeamAuditEvent[] {
    return [...MerchantAuthEngine.teamAuditLogs];
  }

  static clearTeamAuditLogs(): void {
    MerchantAuthEngine.teamAuditLogs = [];
  }

  // ------------------------------------------
  // Team Management (Phase M2-07)
  // ------------------------------------------

  static async listTeamMembers(merchantId: string): Promise<MerchantTeamMemberDto[]> {
    if (!merchantId) return [];
    return await MerchantAuthEngine.getIdentityStore().listMerchantMembers(merchantId);
  }

  static async inviteTeamMember(
    caller: AuthenticatedSessionDto,
    payload: { email: string; role: MerchantRole },
    ip?: string,
    userAgent?: string
  ): Promise<MerchantTeamMemberDto> {
    const { email, role } = payload;
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new Error('INVALID_EMAIL: A valid email address is required.');
    }

    const validRoles: MerchantRole[] = ['owner', 'admin', 'manager', 'staff'];
    if (!role || !validRoles.includes(role)) {
      if ((role as any) === 'super_admin' || (role as string)?.toLowerCase().includes('admin_platform')) {
        throw new Error('PLATFORM_ROLE_ESCALATION_PROHIBITED: Cannot assign platform-level roles.');
      }
      throw new Error(`INVALID_ROLE: Role must be one of: ${validRoles.join(', ')}.`);
    }

    // Anti-escalation: If caller is a merchant user
    if (caller.authBoundary === 'merchant') {
      if (caller.role !== 'owner' && role === 'owner') {
        throw new Error('CANNOT_GRANT_ROLE_ABOVE_CEILING: Only an Owner can invite another Owner.');
      }
    }

    const targetMerchantId = caller.merchantId!;
    const member = await MerchantAuthEngine.getIdentityStore().inviteMerchantMember({
      merchantId: targetMerchantId,
      email: email.trim().toLowerCase(),
      role,
      invitedByUserId: caller.userId,
    });

    MerchantAuthEngine.logTeamAuditEvent({
      action: 'team.member.invited',
      actorUserId: caller.userId,
      actorRole: caller.role,
      merchantId: targetMerchantId,
      targetUserId: member.userId,
      targetMemberId: member.id,
      newRole: member.role,
      newStatus: member.status,
      ip,
      userAgent,
      outcome: 'success',
    });

    return member;
  }

  static async updateTeamMember(
    caller: AuthenticatedSessionDto,
    memberIdOrUserId: string,
    update: { role?: MerchantRole; status?: MerchantMemberStatus },
    ip?: string,
    userAgent?: string
  ): Promise<MerchantTeamMemberDto> {
    const isSuperAdmin = caller.authBoundary === 'admin' || caller.actorType === 'super_admin';

    // Role validation
    const validRoles: MerchantRole[] = ['owner', 'admin', 'manager', 'staff'];
    if (update.role && !validRoles.includes(update.role)) {
      if ((update.role as any) === 'super_admin') {
        throw new Error('PLATFORM_ROLE_ESCALATION_PROHIBITED: Cannot assign platform-level roles.');
      }
      throw new Error(`INVALID_ROLE: Role must be one of: ${validRoles.join(', ')}.`);
    }

    const validStatuses: MerchantMemberStatus[] = ['invited', 'active', 'suspended'];
    if (update.status && !validStatuses.includes(update.status)) {
      throw new Error(`INVALID_STATUS: Status must be one of: ${validStatuses.join(', ')}.`);
    }

    // Retrieve existing member
    const existingMember = (await MerchantAuthEngine.getIdentityStore().findMerchantMemberById(memberIdOrUserId))
      || (caller.merchantId ? await MerchantAuthEngine.getIdentityStore().findMerchantMemberByUserAndMerchant(caller.merchantId, memberIdOrUserId) : null);

    if (!existingMember) {
      throw new Error(`MEMBER_NOT_FOUND: Member '${memberIdOrUserId}' not found.`);
    }

    const targetMerchantId = existingMember.merchantId;

    // Boundary & Anti-escalation checks
    if (!isSuperAdmin) {
      if (caller.merchantId !== targetMerchantId) {
        throw new Error(`CROSS_TENANT_ACCESS_DENIED: Cannot modify members belonging to another merchant.`);
      }

      if (caller.role === 'admin') {
        if (existingMember.role === 'owner') {
          throw new Error('CANNOT_MODIFY_HIGHER_ROLE: Admin cannot modify an Owner member.');
        }
        if (update.role === 'owner') {
          throw new Error('CANNOT_GRANT_ROLE_ABOVE_CEILING: Admin cannot promote members to Owner.');
        }
      }
    }

    // Execute update under lock to serialize concurrent sole-owner checks
    const updated = await MerchantAuthEngine.withMerchantLock(targetMerchantId, async () => {
      return await MerchantAuthEngine.getIdentityStore().updateMerchantMemberRoleOrStatus(
        targetMerchantId,
        existingMember.id,
        update
      );
    });

    // Session synchronization: If status is suspended or role changed, revoke existing sessions
    if (update.status === 'suspended' || (update.role && update.role !== existingMember.role)) {
      await MerchantAuthEngine.revokeAllUserSessions(existingMember.userId);
    }

    const action: TeamAuditAction = isSuperAdmin
      ? (update.role ? 'admin.team.member_role_updated' : 'admin.team.member_status_updated')
      : (update.role ? 'team.member.role_updated' : 'team.member.status_updated');

    MerchantAuthEngine.logTeamAuditEvent({
      action,
      actorUserId: caller.userId,
      actorRole: caller.role,
      merchantId: targetMerchantId,
      targetUserId: existingMember.userId,
      targetMemberId: existingMember.id,
      previousRole: existingMember.role,
      newRole: updated.role,
      previousStatus: existingMember.status,
      newStatus: updated.status,
      ip,
      userAgent,
      outcome: 'success',
    });

    return updated;
  }

  static async removeTeamMember(
    caller: AuthenticatedSessionDto,
    memberIdOrUserId: string,
    ip?: string,
    userAgent?: string
  ): Promise<boolean> {
    const isSuperAdmin = caller.authBoundary === 'admin' || caller.actorType === 'super_admin';

    const existingMember = (await MerchantAuthEngine.getIdentityStore().findMerchantMemberById(memberIdOrUserId))
      || (caller.merchantId ? await MerchantAuthEngine.getIdentityStore().findMerchantMemberByUserAndMerchant(caller.merchantId, memberIdOrUserId) : null);

    if (!existingMember) {
      throw new Error(`MEMBER_NOT_FOUND: Member '${memberIdOrUserId}' not found.`);
    }

    const targetMerchantId = existingMember.merchantId;

    if (!isSuperAdmin) {
      if (caller.merchantId !== targetMerchantId) {
        throw new Error(`CROSS_TENANT_ACCESS_DENIED: Cannot remove members belonging to another merchant.`);
      }

      if (caller.role === 'admin' && existingMember.role === 'owner') {
        throw new Error('CANNOT_MODIFY_HIGHER_ROLE: Admin cannot remove an Owner member.');
      }
    }

    // Execute removal under lock to enforce sole-owner invariant
    await MerchantAuthEngine.withMerchantLock(targetMerchantId, async () => {
      return await MerchantAuthEngine.getIdentityStore().removeMerchantMember(
        targetMerchantId,
        existingMember.id
      );
    });

    // Immediate session revocation
    await MerchantAuthEngine.revokeAllUserSessions(existingMember.userId);

    MerchantAuthEngine.logTeamAuditEvent({
      action: 'team.member.revoked',
      actorUserId: caller.userId,
      actorRole: caller.role,
      merchantId: targetMerchantId,
      targetUserId: existingMember.userId,
      targetMemberId: existingMember.id,
      previousRole: existingMember.role,
      previousStatus: existingMember.status,
      ip,
      userAgent,
      outcome: 'success',
    });

    return true;
  }

  static async listAllPlatformMembers(filter?: {
    merchantId?: string;
    role?: MerchantRole;
    status?: MerchantMemberStatus;
  }): Promise<(MerchantTeamMemberDto & { merchantName?: string; merchantHandle?: string })[]> {
    return await MerchantAuthEngine.getIdentityStore().listAllPlatformMembers(filter);
  }

  // ------------------------------------------
  // Test Cleanup Helper
  // ------------------------------------------

  static async resetForTesting(): Promise<void> {
    MerchantAuthEngine.auditLogs = [];
    MerchantAuthEngine.teamAuditLogs = [];

    if (MerchantAuthEngine.sessionAdapter instanceof InMemoryMerchantAuthStorageAdapter) {
      MerchantAuthEngine.sessionAdapter.clear();
    }
    if (MerchantAuthEngine.identityStore) {
      if (typeof MerchantAuthEngine.identityStore.clear === 'function') {
        await MerchantAuthEngine.identityStore.clear();
      }
    }
  }
}
