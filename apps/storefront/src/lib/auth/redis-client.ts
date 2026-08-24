/**
 * Shared Redis Client & Memory Adapter for Temporary OTP & Rate-Limit State
 */
import Redis from 'ioredis';

export interface IRedisAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null>;
  del(key: string): Promise<number>;
  incr(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  ttl(key: string): Promise<number>;
  quit(): Promise<void>;
  isAlive(): Promise<boolean>;
}

export class InMemoryRedisAdapter implements IRedisAdapter {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  private clean(key: string): boolean {
    const entry = this.store.get(key);
    if (!entry) return false;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return false;
    }
    return true;
  }

  async get(key: string): Promise<string | null> {
    if (!this.clean(key)) return null;
    return this.store.get(key)?.value ?? null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null> {
    let expiresAt: number | undefined;
    if (mode === 'EX' && typeof duration === 'number') {
      expiresAt = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiresAt });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async incr(key: string): Promise<number> {
    const val = await this.get(key);
    const num = val ? parseInt(val, 10) + 1 : 1;
    const existing = this.store.get(key);
    this.store.set(key, { value: num.toString(), expiresAt: existing?.expiresAt });
    return num;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async ttl(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return -2;
    if (!entry.expiresAt) return -1;
    const remaining = Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000));
    return remaining;
  }

  async quit(): Promise<void> {
    this.store.clear();
  }

  async isAlive(): Promise<boolean> {
    return true;
  }
}

export class RedisClientWrapper implements IRedisAdapter {
  private client: Redis | null = null;
  private fallback = new InMemoryRedisAdapter();
  private redisUrl: string;

  constructor(redisUrl?: string) {
    this.redisUrl = redisUrl || process.env.REDIS_URL || 'redis://localhost:6379';
    try {
      this.client = new Redis(this.redisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 3000,
        lazyConnect: true,
        enableOfflineQueue: false,
      });

      this.client.on('error', () => {
        // Suppress unhandled connection crash
      });
    } catch {
      this.client = null;
    }
  }

  private async getActiveClient(): Promise<Redis | null> {
    if (!this.client) return null;
    try {
      if (this.client.status === 'wait') {
        await this.client.connect();
      }
      return this.client;
    } catch {
      return null;
    }
  }

  async get(key: string): Promise<string | null> {
    const client = await this.getActiveClient();
    if (client) {
      try {
        return await client.get(key);
      } catch {
        return this.fallback.get(key);
      }
    }
    return this.fallback.get(key);
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK' | null> {
    const client = await this.getActiveClient();
    if (client) {
      try {
        if (mode === 'EX' && typeof duration === 'number') {
          return await client.set(key, value, 'EX', duration);
        }
        return await client.set(key, value);
      } catch {
        return this.fallback.set(key, value, mode, duration);
      }
    }
    return this.fallback.set(key, value, mode, duration);
  }

  async del(key: string): Promise<number> {
    const client = await this.getActiveClient();
    if (client) {
      try {
        return await client.del(key);
      } catch {
        return this.fallback.del(key);
      }
    }
    return this.fallback.del(key);
  }

  async incr(key: string): Promise<number> {
    const client = await this.getActiveClient();
    if (client) {
      try {
        return await client.incr(key);
      } catch {
        return this.fallback.incr(key);
      }
    }
    return this.fallback.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    const client = await this.getActiveClient();
    if (client) {
      try {
        return await client.expire(key, seconds);
      } catch {
        return this.fallback.expire(key, seconds);
      }
    }
    return this.fallback.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    const client = await this.getActiveClient();
    if (client) {
      try {
        return await client.ttl(key);
      } catch {
        return this.fallback.ttl(key);
      }
    }
    return this.fallback.ttl(key);
  }

  async quit(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
    }
    await this.fallback.quit();
  }

  async isAlive(): Promise<boolean> {
    const client = await this.getActiveClient();
    if (client) {
      try {
        const ping = await client.ping();
        return ping === 'PONG';
      } catch {
        return true;
      }
    }
    return true;
  }
}

let defaultRedisInstance: IRedisAdapter | null = null;

export function getRedisClient(): IRedisAdapter {
  if (!defaultRedisInstance) {
    defaultRedisInstance = new RedisClientWrapper();
  }
  return defaultRedisInstance;
}

export function createInMemoryRedis(): IRedisAdapter {
  return new InMemoryRedisAdapter();
}
