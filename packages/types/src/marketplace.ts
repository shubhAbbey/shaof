/**
 * Marketplace & Multi-Merchant Domain Contracts
 * Authoritative types for merchant ownership, tenant scoping, mixed orders, and lifecycle guards.
 */

// ==========================================
// 1. Merchant Identity & Status Types
// ==========================================

export type MerchantStatus =
  | 'draft'
  | 'pending_approval'
  | 'active'
  | 'suspended'
  | 'rejected';

export type MerchantRole = 'owner' | 'admin' | 'manager' | 'staff';

export type MerchantMemberStatus = 'invited' | 'active' | 'suspended';

export interface MerchantDto {
  id: string;
  name: string;
  handle: string;
  status: MerchantStatus;
  email: string;
  phone: string;
  businessRegistrationNumber?: string; // GSTIN for India
  taxIdentifier?: string; // PAN for India
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface CreateMerchantPayload {
  name: string;
  handle?: string;
  email: string;
  phone: string;
  businessRegistrationNumber?: string;
  taxIdentifier?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateMerchantPayload {
  name?: string;
  handle?: string;
  status?: MerchantStatus;
  email?: string;
  phone?: string;
  businessRegistrationNumber?: string;
  taxIdentifier?: string;
  metadata?: Record<string, unknown>;
}

export interface MerchantMemberDto {
  id: string;
  merchantId: string;
  userId: string;
  role: MerchantRole;
  status: MerchantMemberStatus;
  email?: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. Product Ownership & Catalog Scoping
// ==========================================

export type ProductModerationStatus =
  | 'draft'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'archived';

export interface ProductOwnershipDto {
  productId: string;
  merchantId: string;
  merchantName?: string;
  moderationStatus: ProductModerationStatus;
  assignedAt: string;
  reassignedAt?: string;
  reassignedBy?: string;
}

export interface ProductLifecycleRule {
  canDelete: boolean;
  canArchive: boolean;
  reason?: string;
  activeOrderCount?: number;
  activeStockQuantity?: number;
  pendingReturnCount?: number;
}

// ==========================================
// 3. Mixed-Merchant Order Line Item Ownership
// ==========================================

export type LineItemFulfillmentStatus =
  | 'not_fulfilled'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'shipped'
  | 'delivered'
  | 'canceled';

export type LineItemReturnStatus =
  | 'not_requested'
  | 'requested'
  | 'in_transit'
  | 'received'
  | 'rejected'
  | 'refunded';

export interface OrderLineItemOwnershipDto {
  lineItemId: string;
  orderId: string;
  merchantId: string;
  merchantName?: string;
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  total: number;
  fulfillmentStatus: LineItemFulfillmentStatus;
  returnStatus?: LineItemReturnStatus;
}

export interface MixedOrderMerchantGroup {
  merchantId: string;
  merchantName?: string;
  lineItems: OrderLineItemOwnershipDto[];
  itemSubtotal: number;
  itemCount: number;
  fulfillmentStatus: LineItemFulfillmentStatus;
}

// ==========================================
// 4. Stock Location & Inventory Scoping
// ==========================================

export interface StockLocationOwnershipDto {
  stockLocationId: string;
  merchantId: string;
  name: string;
  isDefault?: boolean;
}

// ==========================================
// 5. Tenant Context & Security Boundaries
// ==========================================

export type ActorType = 'customer' | 'merchant_user' | 'super_admin';

export interface TenantContext {
  actorType: ActorType;
  userId: string;
  merchantId?: string; // Present only if actorType === 'merchant_user' and active membership verified
  role?: MerchantRole | 'super_admin';
  isSuperAdmin?: boolean;
}

export interface OwnershipAssertionResult {
  allowed: boolean;
  statusCode: 200 | 400 | 401 | 403;
  error?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST';
  message?: string;
}

// ==========================================
// 6. Ownership Assertion & Governance Utilities
// ==========================================

export class MarketplaceOwnershipGuard {
  /**
   * Asserts whether a requesting tenant context has read or mutation access to a product.
   *
   * Rules:
   * 1. Super Admin has cross-merchant access (200 OK).
   * 2. Merchant User with matching verified merchantId has access (200 OK).
   * 3. Merchant User accessing another merchant's product is rejected with 403 FORBIDDEN.
   * 4. Missing or unverified session is rejected with 401 UNAUTHORIZED.
   */
  static assertProductAccess(
    tenant: TenantContext | null | undefined,
    productMerchantId: string | null | undefined
  ): OwnershipAssertionResult {
    if (!tenant || !tenant.userId) {
      return {
        allowed: false,
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'Authentication required. No active session found.',
      };
    }

    if (tenant.actorType === 'super_admin' || tenant.isSuperAdmin) {
      return {
        allowed: true,
        statusCode: 200,
      };
    }

    if (tenant.actorType === 'merchant_user') {
      if (!tenant.merchantId || tenant.merchantId.trim() === '') {
        return {
          allowed: false,
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Active merchant membership required.',
        };
      }

      if (!productMerchantId || tenant.merchantId.trim() !== productMerchantId.trim()) {
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

    return {
      allowed: false,
      statusCode: 403,
      error: 'FORBIDDEN',
      message: 'Access denied: Invalid actor type for merchant resource.',
    };
  }

  /**
   * Validates Super Admin product creation requirement: Target merchant must be explicitly selected.
   */
  static assertSuperAdminProductTarget(
    targetMerchantId: string | null | undefined
  ): { valid: boolean; statusCode: 200 | 400; error?: string } {
    if (!targetMerchantId || typeof targetMerchantId !== 'string' || targetMerchantId.trim() === '') {
      return {
        valid: false,
        statusCode: 400,
        error: 'TARGET_MERCHANT_REQUIRED: Super Admin must explicitly designate an active target merchant for product creation.',
      };
    }
    return {
      valid: true,
      statusCode: 200,
    };
  }

  /**
   * Evaluates product deletion vs archiving safety.
   * Hard deletion is strictly blocked if historical orders, active inventory, or pending returns exist.
   */
  static evaluateProductLifecycleSafety(params: {
    hasOrderHistory: boolean;
    activeStockQuantity?: number;
    hasPendingReturns?: boolean;
  }): ProductLifecycleRule {
    const { hasOrderHistory, activeStockQuantity = 0, hasPendingReturns = false } = params;

    if (hasOrderHistory) {
      return {
        canDelete: false,
        canArchive: true,
        reason: 'Product cannot be deleted because it is referenced in historical customer orders. Safe archive is required.',
      };
    }

    if (hasPendingReturns) {
      return {
        canDelete: false,
        canArchive: true,
        reason: 'Product cannot be deleted because it has active/pending return requests.',
      };
    }

    if (activeStockQuantity > 0) {
      return {
        canDelete: false,
        canArchive: true,
        reason: `Product cannot be deleted while active stock remains (${activeStockQuantity} units in stock). Clear inventory first or archive.`,
      };
    }

    return {
      canDelete: true,
      canArchive: true,
    };
  }

  /**
   * Splits order line items across distinct merchants for mixed-merchant customer orders.
   * Guarantees that Merchant A cannot see Line Items belonging to Merchant B.
   */
  static splitOrderLinesByMerchant(
    items: OrderLineItemOwnershipDto[]
  ): Map<string, MixedOrderMerchantGroup> {
    const merchantMap = new Map<string, MixedOrderMerchantGroup>();

    for (const item of items) {
      const merchantId = item.merchantId;
      let group = merchantMap.get(merchantId);

      if (!group) {
        group = {
          merchantId,
          merchantName: item.merchantName,
          lineItems: [],
          itemSubtotal: 0,
          itemCount: 0,
          fulfillmentStatus: 'not_fulfilled',
        };
        merchantMap.set(merchantId, group);
      }

      group.lineItems.push(item);
      group.itemSubtotal += item.total;
      group.itemCount += item.quantity;
    }

    return merchantMap;
  }
}
