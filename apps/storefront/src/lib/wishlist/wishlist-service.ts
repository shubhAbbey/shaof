import crypto from 'crypto';
import { getRedisClient, IRedisAdapter } from '../auth/redis-client';
import type { WishlistItemDto, WishlistDto } from '@ecom/types';

export interface AddWishlistItemInput {
  productId: string;
  variantId: string;
  title: string;
  handle?: string;
  thumbnail?: string;
  price?: number;
  originalPrice?: number;
  currencyCode?: string;
  inStock?: boolean;
  options?: Record<string, string>;
}

const MEDUSA_URL =
  process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL ||
  process.env.MEDUSA_BACKEND_URL ||
  'http://localhost:9000';

const MEDUSA_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY ||
  'pk_962772bcd68f09b11833d76684644ae47e3f46059f995ff0c5eeba74d0cc01e3';

function getMedusaHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (MEDUSA_PUBLISHABLE_KEY) {
    headers['x-publishable-api-key'] = MEDUSA_PUBLISHABLE_KEY;
  }
  return headers;
}

export class WishlistService {
  private static getCustomerKey(customerId: string): string {
    return `wishlist:customer:${customerId.trim()}`;
  }

  static generateItemId(customerId: string, variantId: string): string {
    const rawKey = `${customerId.trim()}:${variantId.trim()}`;
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex').substring(0, 16);
    return `wsh_${hash}`;
  }

  static formatWishlist(customerId: string, items: WishlistItemDto[] = []): WishlistDto {
    return {
      customerId,
      items: Array.isArray(items) ? [...items] : [],
      itemCount: Array.isArray(items) ? items.length : 0,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves raw wishlist items from persistent storage for a customer.
   * Checks Redis cache first; on cache miss or Redis loss, recovers from Medusa persistent Store API.
   */
  private static async getStoredItems(
    customerId: string,
    customRedis?: IRedisAdapter
  ): Promise<WishlistItemDto[]> {
    if (!customerId) return [];
    const redis = customRedis || getRedisClient();
    const key = this.getCustomerKey(customerId);

    // 1. Check Redis cache
    const raw = await redis.get(key);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // Fall through to Medusa recovery
      }
    }

    // 2. Recover from Medusa persistent store on cache miss / Redis loss
    try {
      const res = await fetch(
        `${MEDUSA_URL}/store/wishlist?customer_id=${encodeURIComponent(customerId)}`,
        {
          method: 'GET',
          headers: getMedusaHeaders(),
          cache: 'no-store',
        }
      );
      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.wishlist && Array.isArray(data.wishlist.items)) {
          const items: WishlistItemDto[] = data.wishlist.items;
          // Re-populate Redis cache with recovered persistent items
          await redis.set(key, JSON.stringify(items));
          return items;
        }
      }
    } catch {
      // Medusa offline or test environment fallback
    }

    return [];
  }

  /**
   * Persists wishlist items to Redis cache
   */
  private static async saveStoredItems(
    customerId: string,
    items: WishlistItemDto[],
    customRedis?: IRedisAdapter
  ): Promise<void> {
    if (!customerId) return;
    const redis = customRedis || getRedisClient();
    const key = this.getCustomerKey(customerId);
    await redis.set(key, JSON.stringify(items));
  }

  /**
   * Retrieves the full wishlist for an authenticated customer
   */
  static async getWishlist(
    customerId: string,
    customRedis?: IRedisAdapter
  ): Promise<WishlistDto> {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required to retrieve wishlist');
    }

    const items = await this.getStoredItems(customerId, customRedis);
    return this.formatWishlist(customerId, items);
  }

  /**
   * Idempotently adds a variant to the customer's wishlist.
   * Persists through Medusa persistent module API and caches in Redis.
   */
  static async addItem(
    customerId: string,
    input: AddWishlistItemInput,
    customRedis?: IRedisAdapter
  ): Promise<{ item: WishlistItemDto; wishlist: WishlistDto; isNew: boolean }> {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required to add wishlist item');
    }

    if (!input.productId || input.productId.trim() === '') {
      throw new Error('Product ID is required to add item to wishlist');
    }

    if (!input.variantId || input.variantId.trim() === '') {
      throw new Error('Variant ID is required to add item to wishlist');
    }

    if (input.variantId.startsWith('prod_')) {
      throw new Error('Variant ID cannot be a product ID');
    }

    const cleanCustomerId = customerId.trim();
    const cleanProductId = input.productId.trim();
    const cleanVariantId = input.variantId.trim();

    // Try Medusa persistent custom module backend
    try {
      const res = await fetch(`${MEDUSA_URL}/store/wishlist`, {
        method: 'POST',
        headers: getMedusaHeaders(),
        body: JSON.stringify({
          customer_id: cleanCustomerId,
          product_id: cleanProductId,
          variant_id: cleanVariantId,
          title: input.title ? input.title.trim() : 'Product',
          handle: input.handle ? input.handle.trim() : undefined,
          thumbnail: input.thumbnail ? input.thumbnail.trim() : undefined,
          price: typeof input.price === 'number' ? input.price : undefined,
          original_price: typeof input.originalPrice === 'number' ? input.originalPrice : undefined,
          currency_code: input.currencyCode || 'inr',
          in_stock: typeof input.inStock === 'boolean' ? input.inStock : true,
          options: input.options || {},
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.success && data.item && data.wishlist) {
          await this.saveStoredItems(cleanCustomerId, data.wishlist.items, customRedis);
          return {
            item: data.item,
            wishlist: data.wishlist,
            isNew: data.isNew,
          };
        }
      }
    } catch {
      // Fallback for offline/test environments
    }

    // Local deterministic engine fallback
    const items = await this.getStoredItems(cleanCustomerId, customRedis);
    const expectedId = this.generateItemId(cleanCustomerId, cleanVariantId);

    const existingIndex = items.findIndex(
      (item) => item.id === expectedId || item.variantId === cleanVariantId
    );

    if (existingIndex >= 0) {
      const existingItem = items[existingIndex];
      if (input.options) existingItem.options = input.options;
      if (typeof input.price === 'number') existingItem.price = input.price;
      if (typeof input.inStock === 'boolean') existingItem.inStock = input.inStock;

      await this.saveStoredItems(cleanCustomerId, items, customRedis);
      return {
        item: existingItem,
        wishlist: this.formatWishlist(cleanCustomerId, items),
        isNew: false,
      };
    }

    const newItem: WishlistItemDto = {
      id: expectedId,
      customerId: cleanCustomerId,
      productId: cleanProductId,
      variantId: cleanVariantId,
      title: input.title ? input.title.trim() : 'Saved Item',
      handle: input.handle ? input.handle.trim() : undefined,
      thumbnail: input.thumbnail ? input.thumbnail.trim() : undefined,
      price: typeof input.price === 'number' ? input.price : undefined,
      originalPrice: typeof input.originalPrice === 'number' ? input.originalPrice : undefined,
      currencyCode: input.currencyCode || 'INR',
      inStock: typeof input.inStock === 'boolean' ? input.inStock : true,
      options: input.options || {},
      createdAt: new Date().toISOString(),
    };

    items.unshift(newItem);
    await this.saveStoredItems(cleanCustomerId, items, customRedis);

    return {
      item: newItem,
      wishlist: this.formatWishlist(cleanCustomerId, items),
      isNew: true,
    };
  }

  /**
   * Safely and idempotently removes an item by ID or variant ID (never generic product ID)
   */
  static async removeItem(
    customerId: string,
    idOrVariantId: string,
    customRedis?: IRedisAdapter
  ): Promise<{ wishlist: WishlistDto; removed: boolean }> {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required to remove wishlist item');
    }

    const cleanCustomerId = customerId.trim();
    const target = idOrVariantId ? idOrVariantId.trim() : '';

    // Try Medusa persistent custom module backend
    if (target) {
      try {
        const res = await fetch(
          `${MEDUSA_URL}/store/wishlist/${encodeURIComponent(target)}?customer_id=${encodeURIComponent(cleanCustomerId)}`,
          {
            method: 'DELETE',
            headers: getMedusaHeaders(),
          }
        );
        if (res.ok) {
          const data = await res.json();
          if (data && data.success && data.wishlist) {
            await this.saveStoredItems(cleanCustomerId, data.wishlist.items, customRedis);
            return {
              wishlist: data.wishlist,
              removed: data.removed !== false,
            };
          }
        }
      } catch {
        // Fallback for offline/test environments
      }
    }

    // Local deterministic engine fallback
    const items = await this.getStoredItems(cleanCustomerId, customRedis);
    if (!target) {
      return {
        wishlist: this.formatWishlist(cleanCustomerId, items),
        removed: false,
      };
    }

    const filtered = items.filter(
      (item) => item.id !== target && item.variantId !== target
    );
    const removed = filtered.length < items.length;

    if (removed) {
      await this.saveStoredItems(cleanCustomerId, filtered, customRedis);
    }

    return {
      wishlist: this.formatWishlist(cleanCustomerId, filtered),
      removed,
    };
  }

  /**
   * Checks whether an exact variant or item ID exists in the customer's wishlist
   */
  static async checkItem(
    customerId: string,
    variantIdOrItemId: string,
    customRedis?: IRedisAdapter
  ): Promise<boolean> {
    if (!customerId || !variantIdOrItemId) return false;
    const cleanTarget = variantIdOrItemId.trim();
    if (cleanTarget.startsWith('prod_')) return false; // Never treat product ID as variant
    const items = await this.getStoredItems(customerId, customRedis);
    return items.some(
      (item) => item.variantId === cleanTarget || item.id === cleanTarget
    );
  }
}
