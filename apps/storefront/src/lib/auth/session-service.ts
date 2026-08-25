import crypto from 'node:crypto';
import { getRedisClient, IRedisAdapter } from './redis-client';
import { MedusaCustomerService } from './medusa-customer-service';
import type { CustomerSession, GenderType } from '@ecom/types';

export const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days
export const SESSION_COOKIE_NAME = 'ecom_session_token';

export class SessionService {
  /**
   * Look up customer from the single source of truth: Medusa
   */
  static async lookupCustomer(
    rawMobile: string
  ): Promise<{ exists: boolean; customer: CustomerSession | null }> {
    return MedusaCustomerService.lookupCustomerByPhone(rawMobile);
  }

  /**
   * Persist customer in Medusa commerce customer database
   */
  static async saveCustomer(payload: {
    mobile: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    gender?: GenderType | null;
    dateOfBirth?: string | null;
  }): Promise<CustomerSession> {
    return MedusaCustomerService.saveCustomer(payload);
  }

  /**
   * Create an active runtime session in Redis with 30 days TTL
   */
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

  /**
   * Get active session from runtime cache
   */
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

  /**
   * Invalidate runtime session on logout
   */
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

  /**
   * Retrieve active cart ID associated with a customer in Redis cache
   */
  static async getCustomerActiveCartId(
    customerId: string,
    customRedis?: IRedisAdapter
  ): Promise<string | null> {
    if (!customerId) return null;
    const redis = customRedis || getRedisClient();
    const cartKey = 'cart:customer:' + customerId;
    return redis.get(cartKey);
  }

  /**
   * Associate active cart ID with a customer in Redis cache
   */
  static async setCustomerActiveCartId(
    customerId: string,
    cartId: string,
    ttlSeconds: number = SESSION_TTL_SECONDS,
    customRedis?: IRedisAdapter
  ): Promise<void> {
    if (!customerId || !cartId) return;
    const redis = customRedis || getRedisClient();
    const cartKey = 'cart:customer:' + customerId;
    await redis.set(cartKey, cartId, 'EX', ttlSeconds);
  }

  /**
   * Clear active cart ID associated with a customer in Redis cache
   */
  static async clearCustomerActiveCartId(
    customerId: string,
    customRedis?: IRedisAdapter
  ): Promise<void> {
    if (!customerId) return;
    const redis = customRedis || getRedisClient();
    const cartKey = 'cart:customer:' + customerId;
    await redis.del(cartKey);
  }
}

