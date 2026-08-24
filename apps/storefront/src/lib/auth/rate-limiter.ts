/**
 * Server-Side Rate Limiter
 *
 * Sliding/fixed window rate limiter backed by Redis
 */
import { getRedisClient, IRedisAdapter } from './redis-client';
import type { RateLimitResult } from '@ecom/types';

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
  customRedis?: IRedisAdapter
): Promise<RateLimitResult> {
  const redis = customRedis || getRedisClient();
  const namespacedKey = `ratelimit:${key}`;

  const currentCount = await redis.incr(namespacedKey);

  if (currentCount === 1) {
    await redis.expire(namespacedKey, windowSeconds);
  }

  const ttl = await redis.ttl(namespacedKey);
  const resetInSeconds = ttl > 0 ? ttl : windowSeconds;

  if (currentCount > limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInSeconds,
      limit,
    };
  }

  return {
    allowed: true,
    remaining: Math.max(0, limit - currentCount),
    resetInSeconds,
    limit,
  };
}
