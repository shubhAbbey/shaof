/**
 * Backend Marketplace Ownership & Tenant Isolation Guard
 * Enforces server-side tenant boundaries across products, inventory, and order line items.
 */

export interface TenantOwnershipAssertion {
  allowed: boolean;
  statusCode: 200 | 400 | 401 | 403 | 409;
  error?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST' | 'CONFLICT';
  message?: string;
}

export interface ProductLifecycleEvaluation {
  canDelete: boolean;
  canArchive: boolean;
  reason?: string;
}

export interface SplitMerchantLineItem {
  lineItemId: string;
  orderId: string;
  merchantId: string;
  merchantName?: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export class BackendMarketplaceGuard {
  /**
   * Asserts whether a merchant has ownership of a product.
   * Merchant A cannot read or mutate Merchant B's products.
   */
  static assertMerchantProductOwnership(
    sessionMerchantId: string | null | undefined,
    productMerchantId: string | null | undefined
  ): TenantOwnershipAssertion {
    if (!sessionMerchantId || typeof sessionMerchantId !== 'string' || sessionMerchantId.trim() === '') {
      return {
        allowed: false,
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'Active merchant session required.',
      };
    }

    if (!productMerchantId || typeof productMerchantId !== 'string' || productMerchantId.trim() === '') {
      return {
        allowed: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: 'Target product has no verified merchant ownership link.',
      };
    }

    if (sessionMerchantId.trim() !== productMerchantId.trim()) {
      return {
        allowed: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: 'Access denied: You do not own this product.',
      };
    }

    return {
      allowed: true,
      statusCode: 200,
    };
  }

  /**
   * For Super Admin product creation: Enforces mandatory explicit target merchant selection.
   * Accidental unassigned products are strictly blocked.
   */
  static assertSuperAdminTargetMerchant(
    targetMerchantId: string | null | undefined
  ): TenantOwnershipAssertion {
    if (!targetMerchantId || typeof targetMerchantId !== 'string' || targetMerchantId.trim() === '') {
      return {
        allowed: false,
        statusCode: 400,
        error: 'BAD_REQUEST',
        message: 'TARGET_MERCHANT_REQUIRED: Super Admin must explicitly select a target approved merchant before creating a merchant-owned product.',
      };
    }

    return {
      allowed: true,
      statusCode: 200,
    };
  }

  /**
   * Anti-forgery check: A client-supplied merchant_id in headers or payload must never override or conflict
   * with the server-verified active session merchant ID.
   */
  static validateClientMerchantId(
    sessionMerchantId: string | null | undefined,
    clientSuppliedMerchantId: string | null | undefined
  ): TenantOwnershipAssertion {
    if (!sessionMerchantId || sessionMerchantId.trim() === '') {
      return {
        allowed: false,
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'No active merchant session.',
      };
    }

    // If client supplied a different merchant_id, reject forged tenant context immediately
    if (clientSuppliedMerchantId && clientSuppliedMerchantId.trim() !== sessionMerchantId.trim()) {
      return {
        allowed: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: 'FORGED_MERCHANT_ID: Client-supplied merchant_id does not match verified session membership.',
      };
    }

    return {
      allowed: true,
      statusCode: 200,
    };
  }

  /**
   * Evaluates product lifecycle rules to prevent accidental data corruption or orphan records.
   * If historical orders or active stock exist, hard deletion is blocked; safe archiving is enforced.
   */
  static evaluateProductLifecycleSafety(params: {
    hasOrderHistory: boolean;
    activeStockQuantity?: number;
    hasPendingReturns?: boolean;
  }): ProductLifecycleEvaluation {
    const { hasOrderHistory, activeStockQuantity = 0, hasPendingReturns = false } = params;

    if (hasOrderHistory) {
      return {
        canDelete: false,
        canArchive: true,
        reason: 'Product cannot be hard-deleted because it is referenced in historical orders. Safe archive is required.',
      };
    }

    if (hasPendingReturns) {
      return {
        canDelete: false,
        canArchive: true,
        reason: 'Product cannot be deleted because it has active return requests.',
      };
    }

    if (activeStockQuantity > 0) {
      return {
        canDelete: false,
        canArchive: true,
        reason: `Product cannot be deleted while active stock remains (${activeStockQuantity} units in stock). Clear stock or archive.`,
      };
    }

    return {
      canDelete: true,
      canArchive: true,
    };
  }

  /**
   * Splits mixed-merchant order line items into tenant-isolated merchant groups.
   * Guarantees Merchant A never receives line items belonging to Merchant B.
   */
  static splitOrderLinesByMerchant<T extends SplitMerchantLineItem>(
    items: T[]
  ): Map<string, T[]> {
    const map = new Map<string, T[]>();

    for (const item of items) {
      const merchantId = item.merchantId;
      const list = map.get(merchantId) || [];
      list.push(item);
      map.set(merchantId, list);
    }

    return map;
  }
}
