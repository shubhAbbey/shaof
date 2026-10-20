/**
 * Super Admin Authentication & MFA Security Engine (Phase M2-05)
 *
 * Implements:
 * 1. Dedicated Super Admin boundary isolation.
 * 2. Scrypt-based password hashing & constant-time verification.
 * 3. RFC 6238-compatible TOTP engine with ±30s clock drift tolerance.
 * 4. AES-256-GCM encryption of MFA secrets at rest (fail-closed in production).
 * 5. Bcrypt-hashed, single-use backup scratch codes (ADR-002 compliant).
 * 6. Distributed TOTP replay protection via Redis (fail-closed in production).
 * 7. Sliding idle expiration (30m) & absolute session TTL (8h) in Redis.
 * 8. Centralized single-session and global-user revocation.
 * 9. Step-up re-authentication for sensitive operations (15m window).
 * 10. Multi-layered distributed rate limiting (3 failed attempts per 15m window).
 * 11. Security audit logging with strict secret redaction.
 */

import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import Redis from 'ioredis';
import type {
  AdminAuthAction,
  AdminAuthAuditEvent,
  AdminSessionRecord,
  AuthenticatedSessionDto,
} from '@ecom/types';

// ==========================================
// Base32 Utilities (RFC 4648)
// ==========================================

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function toBase32(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function fromBase32(base32: string): Buffer {
  const cleaned = base32.replace(/[\s=-]/g, '').toUpperCase();
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < cleaned.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
    if (idx === -1) {
      throw new Error(`INVALID_BASE32_CHAR: Character '${cleaned[i]}' is not valid Base32.`);
    }

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

// ==========================================
// Cryptographic Secret Encryption (AES-256-GCM)
// ==========================================

export class EncryptionService {
  private static getKey(): Buffer {
    const isProduction = process.env.NODE_ENV === 'production';
    const key = process.env.ADMIN_MFA_ENCRYPTION_KEY;

    if (isProduction) {
      if (!key || typeof key !== 'string') {
        throw new Error('PRODUCTION_SECURITY_VIOLATION: ADMIN_MFA_ENCRYPTION_KEY is required in production. Failing closed.');
      }
      if (key.length < 32) {
        throw new Error('PRODUCTION_SECURITY_VIOLATION: ADMIN_MFA_ENCRYPTION_KEY must be at least 32 characters long. Failing closed.');
      }
      const knownDevKeys = [
        'fallback_super_admin_mfa_encryption_key_min_32_bytes_long',
        'ecom-dev-secret',
        'ecom-s2s-dev-token-secret',
        'super_secret_jwt_key_minimum_32_characters',
        'super_secret_cookie_key_minimum_32_characters',
      ];
      if (knownDevKeys.includes(key)) {
        throw new Error('PRODUCTION_SECURITY_VIOLATION: ADMIN_MFA_ENCRYPTION_KEY cannot use known development/default secrets. Failing closed.');
      }
      return crypto.createHash('sha256').update(key).digest();
    }

    // Non-production (development / test)
    if (key && key.length >= 32) {
      return crypto.createHash('sha256').update(key).digest();
    }

    return crypto.createHash('sha256').update('dev_super_admin_mfa_encryption_key_32bytes!').digest();
  }

  /**
   * Encrypts plaintext using AES-256-GCM.
   * Returns format: iv:authTag:ciphertext (all in hex).
   */
  static encrypt(plaintext: string): string {
    const key = EncryptionService.getKey();
    const iv = crypto.randomBytes(12); // 96-bit IV recommended for GCM
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    let ciphertext = cipher.update(plaintext, 'utf8', 'hex');
    ciphertext += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}:${authTag}:${ciphertext}`;
  }

  /**
   * Decrypts AES-256-GCM payload.
   * Throws if tampered or invalid authTag.
   */
  static decrypt(payload: string): string {
    const parts = payload.split(':');
    if (parts.length !== 3) {
      throw new Error('INVALID_CIPHERTEXT_FORMAT: Expected iv:authTag:ciphertext');
    }

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const key = EncryptionService.getKey();
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }
}

// ==========================================
// Storage Adapter Interface & Implementations
// ==========================================

export interface RateLimitCheckResult {
  allowed: boolean;
  remaining: number;
  cooldownSeconds: number;
}

export interface IAuthStorageAdapter {
  checkRateLimit(key: string): Promise<RateLimitCheckResult>;
  recordFailedAttempt(key: string): Promise<void>;
  resetRateLimit(key: string): Promise<void>;
  isTotpReplay(userId: string, step: number): Promise<boolean>;
  saveSession(session: AdminSessionRecord): Promise<void>;
  getSession(token: string): Promise<AdminSessionRecord | null>;
  revokeSession(token: string): Promise<boolean>;
  revokeAllUserSessions(userId: string): Promise<void>;
  acquireLock(lockKey: string, ttlSeconds: number): Promise<boolean>;
  releaseLock(lockKey: string): Promise<void>;
  isHealthy(): Promise<boolean>;
  close?(): Promise<void>;
}

/**
 * Shared Redis-backed storage adapter for production & persistent integration.
 * Atomic operations across multiple backend instances.
 */
export class RedisAuthStorageAdapter implements IAuthStorageAdapter {
  private client: Redis;
  private isConnected = false;

  constructor(redisUrl?: string) {
    const url = redisUrl || process.env.REDIS_URL || 'redis://127.0.0.1:6379';
    this.client = new Redis(url, {
      maxRetriesPerRequest: 2,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
      lazyConnect: false,
    });

    this.client.on('connect', () => {
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      this.isConnected = false;
      if (process.env.NODE_ENV === 'production') {
        console.error('[CRITICAL] Redis connection error in production:', err.message);
      }
    });
  }

  private ensureConnected(): void {
    if (process.env.NODE_ENV === 'production' && !this.isConnected && this.client.status !== 'ready' && this.client.status !== 'connect') {
      throw new Error('REDIS_SECURITY_FAILURE: Redis storage unavailable in production. Failing closed.');
    }
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await this.client.ping();
      return res === 'PONG';
    } catch {
      return false;
    }
  }

  async checkRateLimit(key: string): Promise<RateLimitCheckResult> {
    this.ensureConnected();
    const lockoutKey = `lockout:admin:${key}`;
    const countKey = `ratelimit:admin:${key}`;

    const lockoutTtl = await this.client.ttl(lockoutKey);
    if (lockoutTtl > 0) {
      return { allowed: false, remaining: 0, cooldownSeconds: lockoutTtl };
    }

    const currentCountStr = await this.client.get(countKey);
    const count = currentCountStr ? parseInt(currentCountStr, 10) : 0;
    const remaining = Math.max(0, 3 - count);

    return { allowed: remaining > 0, remaining, cooldownSeconds: 0 };
  }

  async recordFailedAttempt(key: string): Promise<void> {
    this.ensureConnected();
    const countKey = `ratelimit:admin:${key}`;
    const lockoutKey = `lockout:admin:${key}`;

    const count = await this.client.incr(countKey);
    if (count === 1) {
      await this.client.expire(countKey, 15 * 60); // 15 min window
    }

    if (count >= 3) {
      await this.client.set(lockoutKey, 'locked', 'EX', 15 * 60);
    }
  }

  async resetRateLimit(key: string): Promise<void> {
    this.ensureConnected();
    const countKey = `ratelimit:admin:${key}`;
    const lockoutKey = `lockout:admin:${key}`;
    await this.client.del(countKey, lockoutKey);
  }

  async isTotpReplay(userId: string, step: number): Promise<boolean> {
    this.ensureConnected();
    const key = `replay:totp:${userId}:${step}`;
    // SET key 1 EX 120 NX returns 'OK' if set, null if key already existed
    const result = await this.client.set(key, '1', 'EX', 120, 'NX');
    return result === null; // true if already used (replay)
  }

  async saveSession(session: AdminSessionRecord): Promise<void> {
    this.ensureConnected();
    const key = `session:admin:${session.token}`;
    const now = Date.now();
    const remainingAbsoluteSeconds = Math.max(1, Math.floor((session.expiresAt - now) / 1000));
    const idleSeconds = Math.min(30 * 60, remainingAbsoluteSeconds);

    await this.client.set(key, JSON.stringify(session), 'EX', idleSeconds);
  }

  async getSession(token: string): Promise<AdminSessionRecord | null> {
    this.ensureConnected();
    const key = `session:admin:${token}`;
    const data = await this.client.get(key);
    if (!data) return null;

    try {
      const session = JSON.parse(data) as AdminSessionRecord;
      const now = Date.now();

      // Check absolute expiration (8 hours)
      if (now > session.expiresAt) {
        await this.client.del(key);
        return null;
      }

      // Check user revocation timestamp
      const revokedAtStr = await this.client.get(`user:revoked_at:${session.userId}`);
      if (revokedAtStr) {
        const revokedAt = parseInt(revokedAtStr, 10);
        if (session.createdAt < revokedAt) {
          await this.client.del(key);
          return null;
        }
      }

      // Slide idle timeout in Redis
      session.lastActivityAt = now;
      const remainingAbsoluteSeconds = Math.max(1, Math.floor((session.expiresAt - now) / 1000));
      const idleSeconds = Math.min(30 * 60, remainingAbsoluteSeconds);
      await this.client.set(key, JSON.stringify(session), 'EX', idleSeconds);

      return session;
    } catch {
      return null;
    }
  }

  async revokeSession(token: string): Promise<boolean> {
    this.ensureConnected();
    const key = `session:admin:${token}`;
    const res = await this.client.del(key);
    return res > 0;
  }

  async revokeAllUserSessions(userId: string): Promise<void> {
    this.ensureConnected();
    await this.client.set(`user:revoked_at:${userId}`, Date.now().toString(), 'EX', 8 * 60 * 60);
  }

  async acquireLock(lockKey: string, ttlSeconds: number): Promise<boolean> {
    this.ensureConnected();
    const key = `lock:${lockKey}`;
    const res = await this.client.set(key, '1', 'EX', ttlSeconds, 'NX');
    return res === 'OK';
  }

  async releaseLock(lockKey: string): Promise<void> {
    this.ensureConnected();
    const key = `lock:${lockKey}`;
    await this.client.del(key);
  }

  async close(): Promise<void> {
    try {
      await this.client.quit();
    } catch {
      this.client.disconnect();
    }
  }
}

/**
 * Test-only In-Memory Storage Adapter.
 * Permitted strictly when process.env.NODE_ENV !== 'production'.
 */
export class InMemoryAuthStorageAdapter implements IAuthStorageAdapter {
  private sessions = new Map<string, AdminSessionRecord>();
  private userRevocations = new Map<string, number>();
  private loginAttempts = new Map<string, { count: number; firstAttemptAt: number; lockedUntil?: number }>();
  private usedTotpSteps = new Set<string>(); // key: `${userId}:${step}`
  private locks = new Set<string>();

  constructor() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('PRODUCTION_SECURITY_VIOLATION: InMemoryAuthStorageAdapter is strictly prohibited in production.');
    }
  }

  async isHealthy(): Promise<boolean> {
    return true;
  }

  async checkRateLimit(key: string): Promise<RateLimitCheckResult> {
    const record = this.loginAttempts.get(key);
    const now = Date.now();

    if (!record) {
      return { allowed: true, remaining: 3, cooldownSeconds: 0 };
    }

    if (record.lockedUntil && now < record.lockedUntil) {
      const cooldown = Math.ceil((record.lockedUntil - now) / 1000);
      return { allowed: false, remaining: 0, cooldownSeconds: cooldown };
    }

    if (now - record.firstAttemptAt > 15 * 60 * 1000) {
      this.loginAttempts.delete(key);
      return { allowed: true, remaining: 3, cooldownSeconds: 0 };
    }

    const remaining = Math.max(0, 3 - record.count);
    return { allowed: remaining > 0, remaining, cooldownSeconds: 0 };
  }

  async recordFailedAttempt(key: string): Promise<void> {
    const now = Date.now();
    const record = this.loginAttempts.get(key) || { count: 0, firstAttemptAt: now };
    record.count += 1;

    if (record.count >= 3) {
      record.lockedUntil = now + 15 * 60 * 1000;
    }

    this.loginAttempts.set(key, record);
  }

  async resetRateLimit(key: string): Promise<void> {
    this.loginAttempts.delete(key);
  }

  async isTotpReplay(userId: string, step: number): Promise<boolean> {
    const key = `${userId}:${step}`;
    if (this.usedTotpSteps.has(key)) {
      return true; // Already used
    }
    this.usedTotpSteps.add(key);
    return false;
  }

  async saveSession(session: AdminSessionRecord): Promise<void> {
    this.sessions.set(session.token, { ...session });
  }

  async getSession(token: string): Promise<AdminSessionRecord | null> {
    const session = this.sessions.get(token);
    if (!session) return null;

    const now = Date.now();
    if (now > session.expiresAt) {
      this.sessions.delete(token);
      return null;
    }

    if (now - session.lastActivityAt > 30 * 60 * 1000) {
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

  async acquireLock(lockKey: string, _ttlSeconds: number): Promise<boolean> {
    if (this.locks.has(lockKey)) return false;
    this.locks.add(lockKey);
    return true;
  }

  async releaseLock(lockKey: string): Promise<void> {
    this.locks.delete(lockKey);
  }

  clear(): void {
    this.sessions.clear();
    this.userRevocations.clear();
    this.loginAttempts.clear();
    this.usedTotpSteps.clear();
    this.locks.clear();
  }
}

// ==========================================
// Super Admin Profile & Engine
// ==========================================

export interface SuperAdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  passwordSalt: string;
  encryptedMfaSecret?: string | null;
  hashedBackupCodes: string[];
  mfaEnabled: boolean;
  pendingMfaSecret?: string | null; // Set during setup; confirmed upon first TOTP verification
  pendingBackupCodes?: string[];    // Set during setup; activated upon first TOTP verification
  lastUsedTotpStep?: number;
  createdAt: string;
  updatedAt: string;
}

export class SuperAdminAuthEngine {
  private static users = new Map<string, SuperAdminUser>(); // key: email.toLowerCase()
  private static auditLogs: AdminAuthAuditEvent[] = [];
  private static adapter?: IAuthStorageAdapter;

  // Configuration constants
  static readonly SESSION_IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
  static readonly SESSION_ABSOLUTE_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
  static readonly STEP_UP_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
  static readonly MAX_FAILED_LOGIN_ATTEMPTS = 3;
  static readonly LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

  // ------------------------------------------
  // Storage Adapter Management
  // ------------------------------------------

  static setAdapter(adapter: IAuthStorageAdapter): void {
    SuperAdminAuthEngine.adapter = adapter;
  }

  static getAdapter(): IAuthStorageAdapter {
    if (!SuperAdminAuthEngine.adapter) {
      if (process.env.NODE_ENV === 'test') {
        SuperAdminAuthEngine.adapter = new InMemoryAuthStorageAdapter();
      } else {
        SuperAdminAuthEngine.adapter = new RedisAuthStorageAdapter();
      }
    }
    return SuperAdminAuthEngine.adapter;
  }

  static async close(): Promise<void> {
    if (SuperAdminAuthEngine.adapter) {
      await SuperAdminAuthEngine.adapter.close?.();
      SuperAdminAuthEngine.adapter = undefined;
    }
  }

  // ------------------------------------------
  // Audit Logging
  // ------------------------------------------

  static logAuditEvent(params: {
    action: AdminAuthAction;
    outcome: 'success' | 'failure';
    userId?: string;
    email?: string;
    ip?: string;
    userAgent?: string;
    reason?: string;
  }): AdminAuthAuditEvent {
    const event: AdminAuthAuditEvent = {
      eventId: `audit_${crypto.randomBytes(12).toString('hex')}`,
      action: params.action,
      outcome: params.outcome,
      userId: params.userId,
      email: params.email ? params.email.toLowerCase().trim() : undefined,
      ip: params.ip,
      userAgent: params.userAgent,
      timestamp: new Date().toISOString(),
      reason: params.reason,
    };

    SuperAdminAuthEngine.auditLogs.push(event);
    if (SuperAdminAuthEngine.auditLogs.length > 500) {
      SuperAdminAuthEngine.auditLogs.shift();
    }

    return event;
  }

  static getAuditLogs(filter?: { userId?: string; action?: AdminAuthAction }): AdminAuthAuditEvent[] {
    let logs = [...SuperAdminAuthEngine.auditLogs];
    if (filter?.userId) logs = logs.filter((l) => l.userId === filter.userId);
    if (filter?.action) logs = logs.filter((l) => l.action === filter.action);
    return logs;
  }

  // ------------------------------------------
  // Password Security (Scrypt + Constant-Time)
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
  // RFC 6238 TOTP Multi-Factor Authentication
  // ------------------------------------------

  static generateTotpSecret(): { base32Secret: string; uri: string } {
    const rawBuffer = crypto.randomBytes(20); // 160-bit key recommended for SHA1
    const base32Secret = toBase32(rawBuffer);
    const uri = `otpauth://totp/EcomPlatform:Admin?secret=${base32Secret}&issuer=EcomPlatform&algorithm=SHA1&digits=6&period=30`;
    return { base32Secret, uri };
  }

  static generateTotpCode(
    secretBase32: string,
    offsetSteps: number = 0,
    timestamp: number = Date.now()
  ): string {
    const key = fromBase32(secretBase32);
    const timeStep = Math.floor(timestamp / 30000) + offsetSteps;

    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigInt64BE(BigInt(timeStep));

    const hmac = crypto.createHmac('sha1', key);
    hmac.update(counterBuffer);
    const digest = hmac.digest();

    const offset = digest[digest.length - 1] & 0x0f;
    const binary =
      ((digest[offset] & 0x7f) << 24) |
      ((digest[offset + 1] & 0xff) << 16) |
      ((digest[offset + 2] & 0xff) << 8) |
      (digest[offset + 3] & 0xff);

    const otp = (binary % 1000000).toString().padStart(6, '0');
    return otp;
  }

  /**
   * Verifies an RFC 6238 TOTP code with ±30s clock skew tolerance.
   */
  static verifyTotpCode(
    secretBase32: string,
    code: string,
    lastUsedStep?: number,
    timestamp: number = Date.now()
  ): { valid: boolean; matchedStep?: number; reason?: string } {
    const cleanCode = (code || '').trim();
    if (!/^\d{6}$/.test(cleanCode)) {
      return { valid: false, reason: 'INVALID_CODE_FORMAT: Code must be 6 digits.' };
    }

    const currentStep = Math.floor(timestamp / 30000);
    const stepsToCheck = [currentStep, currentStep - 1, currentStep + 1];

    for (const step of stepsToCheck) {
      const expected = SuperAdminAuthEngine.generateTotpCode(secretBase32, 0, step * 30000);
      const expectedBuf = Buffer.from(expected);
      const candidateBuf = Buffer.from(cleanCode);

      if (crypto.timingSafeEqual(expectedBuf, candidateBuf)) {
        if (lastUsedStep !== undefined && step <= lastUsedStep) {
          return {
            valid: false,
            reason: 'CODE_ALREADY_USED: This TOTP code was already used. Please wait for the next time-step.',
          };
        }
        return { valid: true, matchedStep: step };
      }
    }

    return { valid: false, reason: 'INVALID_TOTP_CODE: Verification code does not match.' };
  }

  // ------------------------------------------
  // Hashed Backup Scratch Codes (ADR-002: Bcrypt)
  // ------------------------------------------

  static generateBackupCodes(count: number = 8): {
    plainCodes: string[];
    hashedCodes: string[];
  } {
    const plainCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
      const part1 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const part2 = crypto.randomBytes(2).toString('hex').toUpperCase();
      const code = `${part1}-${part2}`;
      plainCodes.push(code);

      // ADR-002: Bcrypt hashing with cost factor 10
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(code, salt);
      hashedCodes.push(hash);
    }

    return { plainCodes, hashedCodes };
  }

  static async verifyAndConsumeBackupCode(
    userId: string,
    candidateCode: string,
    user: SuperAdminUser
  ): Promise<{ valid: boolean; remainingHashedCodes: string[]; reason?: string }> {
    const cleanCode = candidateCode.trim().toUpperCase();
    const lockKey = `admin:backup:${userId}`;

    // Acquire lock to prevent concurrent double-spends
    const acquired = await SuperAdminAuthEngine.getAdapter().acquireLock(lockKey, 5);
    if (!acquired) {
      return {
        valid: false,
        remainingHashedCodes: user.hashedBackupCodes,
        reason: 'CONCURRENT_REQUEST: Concurrent backup code verification in progress.',
      };
    }

    try {
      let matchedIndex = -1;
      for (let i = 0; i < user.hashedBackupCodes.length; i++) {
        if (bcrypt.compareSync(cleanCode, user.hashedBackupCodes[i])) {
          matchedIndex = i;
          break;
        }
      }

      if (matchedIndex === -1) {
        return { valid: false, remainingHashedCodes: user.hashedBackupCodes, reason: 'INVALID_BACKUP_CODE' };
      }

      // Single-use: atomically remove matched code from user's remaining list
      user.hashedBackupCodes.splice(matchedIndex, 1);
      SuperAdminAuthEngine.updateUser(user);

      return { valid: true, remainingHashedCodes: [...user.hashedBackupCodes] };
    } finally {
      await SuperAdminAuthEngine.getAdapter().releaseLock(lockKey);
    }
  }

  // ------------------------------------------
  // Rate Limiting & Lockout
  // ------------------------------------------

  static async checkRateLimit(key: string): Promise<RateLimitCheckResult> {
    return SuperAdminAuthEngine.getAdapter().checkRateLimit(key);
  }

  static async recordFailedAttempt(key: string): Promise<void> {
    await SuperAdminAuthEngine.getAdapter().recordFailedAttempt(key);
  }

  static async resetRateLimit(key: string): Promise<void> {
    await SuperAdminAuthEngine.getAdapter().resetRateLimit(key);
  }

  // ------------------------------------------
  // User Management
  // ------------------------------------------

  static registerAdminUser(params: {
    id?: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): SuperAdminUser {
    const normalizedEmail = params.email.trim().toLowerCase();
    if (SuperAdminAuthEngine.users.has(normalizedEmail)) {
      throw new Error(`ADMIN_EXISTS: Admin user with email '${normalizedEmail}' already exists.`);
    }

    const { hash, salt } = SuperAdminAuthEngine.hashPassword(params.password);
    const user: SuperAdminUser = {
      id: params.id || `usr_admin_${crypto.randomBytes(8).toString('hex')}`,
      email: normalizedEmail,
      firstName: params.firstName || 'Super',
      lastName: params.lastName || 'Admin',
      passwordHash: hash,
      passwordSalt: salt,
      encryptedMfaSecret: null,
      hashedBackupCodes: [],
      mfaEnabled: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    SuperAdminAuthEngine.users.set(normalizedEmail, user);
    return user;
  }

  static findUserByEmail(email: string): SuperAdminUser | null {
    if (!email) return null;
    return SuperAdminAuthEngine.users.get(email.trim().toLowerCase()) || null;
  }

  static findUserById(id: string): SuperAdminUser | null {
    for (const user of SuperAdminAuthEngine.users.values()) {
      if (user.id === id) return user;
    }
    return null;
  }

  static updateUser(user: SuperAdminUser): void {
    user.updatedAt = new Date().toISOString();
    SuperAdminAuthEngine.users.set(user.email.toLowerCase(), user);
  }

  // ------------------------------------------
  // Session Creation, Validation, and Revocation
  // ------------------------------------------

  static async createSession(params: {
    userId: string;
    email: string;
    isMfaVerified: boolean;
    ip?: string;
    userAgent?: string;
    lastMfaVerifiedAt?: number;
  }): Promise<AdminSessionRecord> {
    const token = `sess_admin_${crypto.randomBytes(32).toString('hex')}`;
    const now = Date.now();

    const record: AdminSessionRecord = {
      token,
      userId: params.userId,
      email: params.email.toLowerCase(),
      role: 'super_admin',
      actorType: 'super_admin',
      authBoundary: 'admin',
      isMfaVerified: params.isMfaVerified,
      createdAt: now,
      lastActivityAt: now,
      expiresAt: now + SuperAdminAuthEngine.SESSION_ABSOLUTE_TTL_MS,
      lastMfaVerifiedAt:
        params.lastMfaVerifiedAt !== undefined
          ? params.lastMfaVerifiedAt
          : params.isMfaVerified
          ? now
          : undefined,
      ip: params.ip,
      userAgent: params.userAgent,
    };

    await SuperAdminAuthEngine.getAdapter().saveSession(record);

    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.login.success',
      outcome: 'success',
      userId: params.userId,
      email: params.email,
      ip: params.ip,
      userAgent: params.userAgent,
    });

    return record;
  }

  static async resolveSession(token: string | null): Promise<AuthenticatedSessionDto | null> {
    if (!token) return null;
    const session = await SuperAdminAuthEngine.getAdapter().getSession(token);
    if (!session) return null;

    return {
      userId: session.userId,
      email: session.email,
      role: 'super_admin',
      authBoundary: 'admin',
      actorType: 'super_admin',
      isMfaVerified: session.isMfaVerified,
      sessionToken: session.token,
      issuedAt: new Date(session.createdAt).toISOString(),
      expiresAt: new Date(session.expiresAt).toISOString(),
    };
  }

  static async revokeSession(token: string): Promise<boolean> {
    const session = await SuperAdminAuthEngine.getAdapter().getSession(token);
    const success = await SuperAdminAuthEngine.getAdapter().revokeSession(token);

    if (session) {
      SuperAdminAuthEngine.logAuditEvent({
        action: 'admin.logout',
        outcome: 'success',
        userId: session.userId,
        email: session.email,
      });
    }

    return success;
  }

  static async revokeAllUserSessions(userId: string): Promise<void> {
    await SuperAdminAuthEngine.getAdapter().revokeAllUserSessions(userId);

    SuperAdminAuthEngine.logAuditEvent({
      action: 'admin.session.revoked',
      outcome: 'success',
      userId,
      reason: 'Global revocation triggered.',
    });
  }

  // ------------------------------------------
  // Step-Up Authentication
  // ------------------------------------------

  static async isStepUpActive(token: string): Promise<boolean> {
    const session = await SuperAdminAuthEngine.getAdapter().getSession(token);
    if (!session || !session.isMfaVerified || !session.lastMfaVerifiedAt) return false;
    return Date.now() - session.lastMfaVerifiedAt <= SuperAdminAuthEngine.STEP_UP_TIMEOUT_MS;
  }

  static async renewStepUp(token: string): Promise<boolean> {
    const session = await SuperAdminAuthEngine.getAdapter().getSession(token);
    if (!session) return false;
    session.lastMfaVerifiedAt = Date.now();
    await SuperAdminAuthEngine.getAdapter().saveSession(session);
    return true;
  }

  // ------------------------------------------
  // Test Cleanup Helper
  // ------------------------------------------

  static async resetForTesting(): Promise<void> {
    SuperAdminAuthEngine.users.clear();
    SuperAdminAuthEngine.auditLogs = [];
    const adapter = SuperAdminAuthEngine.getAdapter();
    if (adapter instanceof InMemoryAuthStorageAdapter) {
      adapter.clear();
    }
  }
}
