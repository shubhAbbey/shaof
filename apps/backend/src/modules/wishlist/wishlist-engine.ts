import crypto from 'crypto';
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

/**
 * WishlistEngine
 *
 * Canonical domain helper for managing authenticated customer wishlists.
 * Enforces customer ownership, idempotent additions, safe removals,
 * and deterministic item identity based on variantId.
 */
export class WishlistEngine {
  /**
   * Generates a deterministic unique identifier for a customer's variant wishlist item
   */
  static generateItemId(customerId: string, variantId: string): string {
    const rawKey = `${customerId.trim()}:${variantId.trim()}`;
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex').substring(0, 16);
    return `wsh_${hash}`;
  }

  /**
   * Formats a raw list of items into a canonical WishlistDto
   */
  static formatWishlist(customerId: string, items: WishlistItemDto[] = []): WishlistDto {
    return {
      customerId,
      items: Array.isArray(items) ? [...items] : [],
      itemCount: Array.isArray(items) ? items.length : 0,
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Idempotently adds a variant item to the customer's wishlist
   */
  static addWishlistItem(
    customerId: string,
    input: AddWishlistItemInput,
    currentItems: WishlistItemDto[] = []
  ): { item: WishlistItemDto; wishlist: WishlistDto; isNew: boolean } {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required for wishlist operations');
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
    const items = Array.isArray(currentItems) ? [...currentItems] : [];
    const expectedId = this.generateItemId(cleanCustomerId, cleanVariantId);

    // Variant-level uniqueness per customer
    const existingIndex = items.findIndex(
      (item) => item.id === expectedId || item.variantId === cleanVariantId
    );

    if (existingIndex >= 0) {
      // Idempotent: item already in wishlist -> update variant/options preference if provided, return existing item
      const existingItem = items[existingIndex];
      if (input.options) existingItem.options = input.options;
      if (typeof input.price === 'number') existingItem.price = input.price;
      if (typeof input.inStock === 'boolean') existingItem.inStock = input.inStock;

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

    items.unshift(newItem); // Place newest item at the top

    return {
      item: newItem,
      wishlist: this.formatWishlist(cleanCustomerId, items),
      isNew: true,
    };
  }

  /**
   * Safely and idempotently removes an item by ID or variant ID (never generic product ID)
   */
  static removeWishlistItem(
    customerId: string,
    idOrVariantId: string,
    currentItems: WishlistItemDto[] = []
  ): { wishlist: WishlistDto; removed: boolean } {
    if (!customerId || customerId.trim() === '') {
      throw new Error('Customer ID is required for wishlist operations');
    }

    if (!idOrVariantId || idOrVariantId.trim() === '') {
      return {
        wishlist: this.formatWishlist(customerId, currentItems),
        removed: false,
      };
    }

    const target = idOrVariantId.trim();
    const items = Array.isArray(currentItems) ? [...currentItems] : [];
    const initialLength = items.length;

    const filteredItems = items.filter(
      (item) => item.id !== target && item.variantId !== target
    );

    const removed = filteredItems.length < initialLength;

    return {
      wishlist: this.formatWishlist(customerId, filteredItems),
      removed,
    };
  }

  /**
   * Checks whether an exact variant or item ID exists in the customer's wishlist
   */
  static checkWishlistItem(
    customerId: string,
    variantIdOrItemId: string,
    currentItems: WishlistItemDto[] = []
  ): boolean {
    if (!customerId || !variantIdOrItemId) return false;
    const cleanTarget = variantIdOrItemId.trim();
    if (cleanTarget.startsWith('prod_')) return false; // Strict variant identity
    const items = Array.isArray(currentItems) ? currentItems : [];
    return items.some(
      (item) => item.variantId === cleanTarget || item.id === cleanTarget
    );
  }
}
