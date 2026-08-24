import crypto from 'node:crypto';
import { getRedisClient, IRedisAdapter } from './redis-client';
import { normalizeIndianMobile } from './phone-utils';
import type {
  CustomerSession,
  GenderType,
} from '@ecom/types';

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const SESSION_COOKIE_NAME = 'ecom_session_token';

export class SessionService {
  static generateCustomerId(normalizedMobile: string): string {
    const hash = crypto.createHash('sha256').update(normalizedMobile).digest('hex').substring(0, 24);
    return 'cus_' + hash;
  }

  static async lookupCustomer(
    rawMobile: string,
    customRedis?: IRedisAdapter
  ): Promise<{ exists: boolean; customer: CustomerSession | null }> {
    const redis = customRedis || getRedisClient();
    const validation = normalizeIndianMobile(rawMobile);
    if (!validation.isValid) {
      return { exists: false, customer: null };
    }
    const mobile = validation.normalized;
    const customerStr = await redis.get('customer:' + mobile);
    if (!customerStr) {
      return { exists: false, customer: null };
    }
    try {
      const customer: CustomerSession = JSON.parse(customerStr);
      return { exists: true, customer };
    } catch {
      return { exists: false, customer: null };
    }
  }

  static async saveCustomer(
    payload: {
      mobile: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      gender?: GenderType | null;
      dateOfBirth?: string | null;
    },
    customRedis?: IRedisAdapter
  ): Promise<CustomerSession> {
    const redis = customRedis || getRedisClient();
    const validation = normalizeIndianMobile(payload.mobile);
    const mobile = validation.isValid ? validation.normalized : payload.mobile;
    const existing = await this.lookupCustomer(mobile, redis);

    const customer: CustomerSession = {
      id: existing.customer?.id || this.generateCustomerId(mobile),
      mobile,
      email: (payload.email !== undefined && payload.email !== null && payload.email.trim().length > 0) ? payload.email : existing.customer?.email || null,
      firstName: (payload.firstName !== undefined && payload.firstName !== null && payload.firstName.trim().length > 0) ? payload.firstName : existing.customer?.firstName || null,
      lastName: (payload.lastName !== undefined && payload.lastName !== null && payload.lastName.trim().length > 0) ? payload.lastName : existing.customer?.lastName || null,
      gender: (payload.gender !== undefined && payload.gender !== null) ? payload.gender : existing.customer?.gender || null,
      dateOfBirth: (payload.dateOfBirth !== undefined && payload.dateOfBirth !== null && payload.dateOfBirth.trim().length > 0) ? payload.dateOfBirth : existing.customer?.dateOfBirth || null,
      createdAt: existing.customer?.createdAt || new Date().toISOString(),
    };

    await redis.set('customer:' + mobile, JSON.stringify(customer));
    return customer;
  }

  static async createSession(
    customer: CustomerSession,
    ttlSeconds: number = SESSION_TTL_SECONDS,
    customRedis?: IRedisAdapter
  ): Promise<{ token: string; customer: CustomerSession }> {
    const redis = customRedis || getRedisClient();
    const token = 'sess_' + crypto.randomBytes(32).toString('hex');
    const sessionKey = 'session:' + token;

    await redis.set(sessionKey, JSON.stringify(customer), 'EX', ttlSeconds);
    return { token, customer };
  }

  static async getSession(
    token: string,
    customRedis?: IRedisAdapter
  ): Promise<CustomerSession | null> {
    if (!token || !token.startsWith('sess_')) return null;
    const redis = customRedis || getRedisClient();
    const sessionKey = 'session:' + token;
    const dataStr = await redis.get(sessionKey);
    if (!dataStr) return null;
    try {
      return JSON.parse(dataStr);
    } catch {
      return null;
    }
  }

  static async destroySession(
    token: string,
    customRedis?: IRedisAdapter
  ): Promise<boolean> {
    if (!token) return false;
    const redis = customRedis || getRedisClient();
    const sessionKey = 'session:' + token;
    const deleted = await redis.del(sessionKey);
    return deleted > 0;
  }
}
