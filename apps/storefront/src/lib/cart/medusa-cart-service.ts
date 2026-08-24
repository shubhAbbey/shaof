import { sdk } from '../medusa-client';
import { config } from '../../config';
import type { CartDto, CartLineItemDto } from '@ecom/types';

/**
 * Mapper: Transforms Medusa v2 Store Cart to canonical CartDto
 */
export function mapMedusaCartToDto(cart: any): CartDto {
  if (!cart || !cart.id) {
    throw new Error('Invalid Medusa cart object');
  }

  const items: CartLineItemDto[] = (cart.items || []).map((item: any) => {
    const variant = item.variant || {};
    const product = variant.product || {};
    const variantTitle = item.variant_title || variant.title || undefined;
    const options: Record<string, string> = {};

    if (Array.isArray(variant.options)) {
      for (const opt of variant.options) {
        const title = opt.option?.title || opt.option_id || 'Option';
        options[title] = opt.value;
      }
    }

    const inventoryQty = typeof variant.inventory_quantity === 'number' ? variant.inventory_quantity : 10;
    const inStock = variant.manage_inventory ? inventoryQty > 0 || variant.allow_backorder === true : true;

    return {
      id: item.id,
      title: item.title || product.title || 'Product',
      subtitle: item.subtitle || product.subtitle || undefined,
      thumbnail: item.thumbnail || variant.thumbnail || product.thumbnail || undefined,
      variantId: item.variant_id || variant.id || '',
      variantTitle,
      productId: product.id || item.product_id || '',
      productHandle: product.handle || item.product_handle || undefined,
      quantity: item.quantity || 1,
      unitPrice: typeof item.unit_price === 'number' ? item.unit_price : 0,
      originalUnitPrice: typeof item.compare_at_unit_price === 'number' ? item.compare_at_unit_price : undefined,
      total: typeof item.total === 'number' ? item.total : (item.unit_price || 0) * (item.quantity || 1),
      subtotal: typeof item.subtotal === 'number' ? item.subtotal : (item.unit_price || 0) * (item.quantity || 1),
      options: Object.keys(options).length > 0 ? options : undefined,
      inStock,
      inventoryQuantity: inventoryQty,
    };
  });

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = typeof cart.subtotal === 'number' ? cart.subtotal : (cart.item_subtotal || items.reduce((sum, i) => sum + i.total, 0));
  const discountTotal = typeof cart.discount_total === 'number' ? cart.discount_total : 0;
  const shippingTotal = typeof cart.shipping_total === 'number' ? cart.shipping_total : 0;
  const taxTotal = typeof cart.tax_total === 'number' ? cart.tax_total : 0;
  const total = typeof cart.total === 'number' ? cart.total : Math.max(0, subtotal - discountTotal + shippingTotal + taxTotal);

  return {
    id: cart.id,
    items,
    totalItems,
    subtotal,
    discountTotal,
    shippingTotal,
    taxTotal,
    total,
    currencyCode: (cart.currency_code || 'inr').toUpperCase(),
    regionId: cart.region_id,
    createdAt: cart.created_at,
    updatedAt: cart.updated_at,
  };
}

export class MedusaCartService {
  /**
   * Create a new Medusa guest cart
   */
  static async createCart(regionId?: string): Promise<CartDto> {
    const payload: Record<string, any> = {};
    if (regionId) {
      payload.region_id = regionId;
    }

    const response = await fetch(`${config.medusa.baseUrl}/store/carts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': config.medusa.publishableKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to create cart (${response.status})`);
    }

    const data = await response.json();
    return mapMedusaCartToDto(data.cart);
  }



  /**
   * Retrieve cart by ID from Medusa
   */
  static async getCart(cartId: string): Promise<CartDto | null> {
    if (!cartId || !cartId.startsWith('cart_')) return null;

    try {
      const response = await fetch(
        `${config.medusa.baseUrl}/store/carts/${encodeURIComponent(cartId)}?fields=*items,*items.variant,*items.variant.product`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-publishable-api-key': config.medusa.publishableKey,
          },
          cache: 'no-store',
        }
      );

      if (!response.ok) {
        if (response.status === 404) return null;
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch cart (${response.status})`);
      }

      const data = await response.json();
      return mapMedusaCartToDto(data.cart);
    } catch (error: any) {
      console.warn('[MedusaCartService] Error fetching cart from Medusa:', error.message);
      return null;
    }
  }

  /**
   * Add line item to cart with inventory validation
   */
  static async addLineItem(
    cartId: string,
    variantId: string,
    quantity: number = 1,
    metadata?: Record<string, any>
  ): Promise<CartDto> {
    if (!cartId) {
      throw new Error('Cart ID is required');
    }
    if (!variantId) {
      throw new Error('Variant ID is required');
    }
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    const response = await fetch(`${config.medusa.baseUrl}/store/carts/${encodeURIComponent(cartId)}/line-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-publishable-api-key': config.medusa.publishableKey,
      },
      body: JSON.stringify({
        variant_id: variantId,
        quantity,
        metadata,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.message || errData.error || `Failed to add line item (${response.status})`;
      if (response.status === 404 || msg.toLowerCase().includes('cart') && msg.toLowerCase().includes('not found')) {
        throw new Error(`CART_NOT_FOUND: ${msg}`);
      }
      if (response.status === 400 && (msg.toLowerCase().includes('inventory') || msg.toLowerCase().includes('stock'))) {
        throw new Error('INSUFFICIENT_INVENTORY: The requested quantity exceeds available stock.');
      }
      throw new Error(msg);
    }


    const data = await response.json();
    return mapMedusaCartToDto(data.cart);
  }

  /**
   * Update line item quantity in cart
   */
  static async updateLineItem(
    cartId: string,
    lineItemId: string,
    quantity: number
  ): Promise<CartDto> {
    if (!cartId || !lineItemId) {
      throw new Error('Cart ID and Line Item ID are required');
    }

    if (quantity <= 0) {
      return this.deleteLineItem(cartId, lineItemId);
    }

    const response = await fetch(
      `${config.medusa.baseUrl}/store/carts/${encodeURIComponent(cartId)}/line-items/${encodeURIComponent(lineItemId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': config.medusa.publishableKey,
        },
        body: JSON.stringify({
          quantity,
        }),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const msg = errData.message || errData.error || `Failed to update line item (${response.status})`;
      if (response.status === 400 && (msg.toLowerCase().includes('inventory') || msg.toLowerCase().includes('stock'))) {
        throw new Error('INSUFFICIENT_INVENTORY: The requested quantity exceeds available stock.');
      }
      throw new Error(msg);
    }

    const data = await response.json();
    return mapMedusaCartToDto(data.cart);
  }

  /**
   * Delete line item from cart
   */
  static async deleteLineItem(cartId: string, lineItemId: string): Promise<CartDto> {
    if (!cartId || !lineItemId) {
      throw new Error('Cart ID and Line Item ID are required');
    }

    const response = await fetch(
      `${config.medusa.baseUrl}/store/carts/${encodeURIComponent(cartId)}/line-items/${encodeURIComponent(lineItemId)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': config.medusa.publishableKey,
        },
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to delete line item (${response.status})`);
    }

    const data = await response.json();
    return mapMedusaCartToDto(data.cart);
  }
}
