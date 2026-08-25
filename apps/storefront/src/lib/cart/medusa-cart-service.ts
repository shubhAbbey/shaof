import { sdk } from '../medusa-client';
import { config } from '../../config';
import { SessionService } from '../auth/session-service';
import type {
  CartDto,
  CartLineItemDto,
  CartMergeResult,
  CartMergeConflictItem,
  CustomerSession,
} from '@ecom/types';


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
    const rawCart = data.cart || data.parent;
    if (rawCart && rawCart.id) {
      return mapMedusaCartToDto(rawCart);
    }

    const freshCart = await this.getCart(cartId);
    if (!freshCart) {
      throw new Error('Failed to retrieve cart after adding line item');
    }
    return freshCart;
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
    const rawCart = data.cart || data.parent;
    if (rawCart && rawCart.id) {
      return mapMedusaCartToDto(rawCart);
    }

    const freshCart = await this.getCart(cartId);
    if (!freshCart) {
      throw new Error('Failed to retrieve cart after line item update');
    }
    return freshCart;
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
    const rawCart = data.parent || data.cart;
    if (rawCart && rawCart.id) {
      return mapMedusaCartToDto(rawCart);
    }

    const freshCart = await this.getCart(cartId);
    if (!freshCart) {
      throw new Error('Failed to retrieve cart after item deletion');
    }
    return freshCart;
  }

  /**
   * Update cart email, region, or metadata in Medusa
   */
  static async updateCart(
    cartId: string,
    payload: {
      email?: string | null;
      region_id?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<CartDto> {
    if (!cartId) throw new Error('Cart ID is required');

    const body: Record<string, any> = {};
    if (payload.email) body.email = payload.email;
    if (payload.region_id) body.region_id = payload.region_id;
    if (payload.metadata) body.metadata = payload.metadata;

    const response = await fetch(
      `${config.medusa.baseUrl}/store/carts/${encodeURIComponent(cartId)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-publishable-api-key': config.medusa.publishableKey,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `Failed to update cart (${response.status})`);
    }

    const data = await response.json();
    return mapMedusaCartToDto(data.cart);
  }

  /**
   * Deterministically reconcile guest cart with customer active cart upon login/registration
   */
  static async reconcileCartOnLogin(params: {
    guestCartId?: string | null;
    customer: CustomerSession;
  }): Promise<CartMergeResult> {
    const { guestCartId, customer } = params;
    if (!customer || !customer.id) {
      throw new Error('Customer is required for cart reconciliation');
    }

    // Step 1: Resolve existing customer active cart from Redis
    const savedCustomerCartId = await SessionService.getCustomerActiveCartId(customer.id);
    let customerCart: CartDto | null = null;
    if (savedCustomerCartId) {
      customerCart = await this.getCart(savedCustomerCartId);
      // If the saved customer cart was completed or deleted, clear the stale ID
      if (!customerCart) {
        await SessionService.clearCustomerActiveCartId(customer.id);
      }
    }

    // Step 2: Resolve guest cart
    let guestCart: CartDto | null = null;
    if (guestCartId) {
      guestCart = await this.getCart(guestCartId);
    }

    const hasGuestItems = Boolean(guestCart && guestCart.items && guestCart.items.length > 0);
    const hasCustomerItems = Boolean(customerCart && customerCart.items && customerCart.items.length > 0);

    // Scenario D: No guest cart
    if (!guestCart) {
      if (customerCart) {
        return {
          success: true,
          cart: customerCart,
          status: 'restored',
          message: 'Customer cart restored successfully',
        };
      }
      return {
        success: true,
        cart: null,
        status: 'none',
        message: 'No active cart found',
      };
    }

    // Scenario E: Empty guest cart
    if (!hasGuestItems) {
      if (hasCustomerItems && customerCart) {
        return {
          success: true,
          cart: customerCart,
          status: 'restored',
          message: 'Customer cart restored successfully',
        };
      }
      // If customer has no cart or customer cart is also empty, associate email with guest cart
      if (customer.email) {
        try {
          await this.updateCart(guestCart.id, { email: customer.email });
        } catch {
          // Non-blocking
        }
      }
      await SessionService.setCustomerActiveCartId(customer.id, guestCart.id);
      return {
        success: true,
        cart: guestCart,
        status: 'transferred',
        message: 'Guest cart transferred to customer',
      };
    }

    // Scenario B & C: Guest has items & Customer has NO existing active cart (or customer cart is empty)
    if (hasGuestItems && (!customerCart || !hasCustomerItems)) {
      // Guest cart survives login and becomes the customer active cart
      if (customer.email) {
        try {
          guestCart = await this.updateCart(guestCart.id, { email: customer.email });
        } catch {
          // Non-blocking
        }
      }
      await SessionService.setCustomerActiveCartId(customer.id, guestCart.id);
      return {
        success: true,
        cart: guestCart,
        status: 'transferred',
        message: 'Guest cart transferred to customer successfully',
      };
    }

    // Scenario A: BOTH Guest Cart and Customer Cart have items -> Deterministic Merge
    // If they point to the exact same cart ID, return immediately
    if (guestCart.id === customerCart!.id) {
      if (customer.email) {
        try {
          customerCart = await this.updateCart(customerCart!.id, { email: customer.email });
        } catch {
          // Non-blocking
        }
      }
      return {
        success: true,
        cart: customerCart,
        status: 'transferred',
      };
    }

    const targetCart = customerCart!;
    const conflictItems: CartMergeConflictItem[] = [];
    const itemsToDeleteFromGuest: string[] = [];

    // Deterministic item iteration by variantId
    const sortedGuestItems = [...guestCart.items].sort((a, b) => a.variantId.localeCompare(b.variantId));

    for (const gItem of sortedGuestItems) {
      const existingCustomerItem = targetCart.items.find(
        (cItem) => cItem.variantId === gItem.variantId
      );

      if (existingCustomerItem) {
        // Duplicate variant: intended combined quantity
        const combinedQuantity = existingCustomerItem.quantity + gItem.quantity;
        try {
          // Authoritative Medusa inventory validation on update
          await this.updateLineItem(targetCart.id, existingCustomerItem.id, combinedQuantity);
          itemsToDeleteFromGuest.push(gItem.id);
        } catch (err: any) {
          const isInventory =
            err?.message?.includes('INSUFFICIENT_INVENTORY') ||
            err?.message?.toLowerCase().includes('stock');
          if (isInventory) {
            conflictItems.push({
              variantId: gItem.variantId,
              title: gItem.title,
              requestedQuantity: combinedQuantity,
              reason: 'INSUFFICIENT_INVENTORY',
              message: `Requested quantity (${combinedQuantity}) exceeds available inventory. Guest quantity preserved.`,
            });
            // Do NOT delete from guest cart; preserve guest quantity for user recovery
          } else {
            conflictItems.push({
              variantId: gItem.variantId,
              title: gItem.title,
              requestedQuantity: combinedQuantity,
              reason: 'ERROR',
              message: err?.message || 'Failed to update item in customer cart',
            });
          }
        }
      } else {
        // Distinct variant: add to customer cart
        try {
          await this.addLineItem(targetCart.id, gItem.variantId, gItem.quantity, gItem.options);
          itemsToDeleteFromGuest.push(gItem.id);
        } catch (err: any) {
          const isInventory =
            err?.message?.includes('INSUFFICIENT_INVENTORY') ||
            err?.message?.toLowerCase().includes('stock');
          if (isInventory) {
            conflictItems.push({
              variantId: gItem.variantId,
              title: gItem.title,
              requestedQuantity: gItem.quantity,
              reason: 'INSUFFICIENT_INVENTORY',
              message: `Cannot add variant (${gItem.title || gItem.variantId}): insufficient inventory. Guest quantity preserved.`,
            });
          } else {
            conflictItems.push({
              variantId: gItem.variantId,
              title: gItem.title,
              requestedQuantity: gItem.quantity,
              reason: 'ERROR',
              message: err?.message || 'Failed to add item to customer cart',
            });
          }
        }
      }
    }

    // Only delete items from guest cart that successfully merged
    for (const lineId of itemsToDeleteFromGuest) {
      try {
        await this.deleteLineItem(guestCart.id, lineId);
      } catch {
        // Non-blocking cleanup
      }
    }

    // Associate customer email with target customer cart
    if (customer.email) {
      try {
        await this.updateCart(targetCart.id, { email: customer.email });
      } catch {
        // Non-blocking
      }
    }

    // Refresh final authoritative cart from Medusa (recalculated totals, promotions, and taxes)
    const finalCart = await this.getCart(targetCart.id);
    await SessionService.setCustomerActiveCartId(customer.id, targetCart.id);

    const hasConflict = conflictItems.length > 0;
    return {
      success: true,
      cart: finalCart,
      status: hasConflict ? 'conflict' : 'merged',
      conflictItems: hasConflict ? conflictItems : undefined,
      message: hasConflict
        ? `Cart merged with ${conflictItems.length} inventory conflict(s).`
        : 'Guest cart merged into customer cart successfully.',
    };
  }
}


