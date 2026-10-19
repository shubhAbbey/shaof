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

export type AuthBoundary = 'store' | 'merchant' | 'admin';

export type MarketplacePermission =
  | 'catalog:read'
  | 'catalog:write'
  | 'catalog:delete'
  | 'catalog:moderate'
  | 'inventory:read'
  | 'inventory:adjust'
  | 'orders:read'
  | 'orders:fulfill'
  | 'returns:read'
  | 'returns:process'
  | 'financials:view'
  | 'financials:payout'
  | 'team:manage'
  | 'settings:manage';

export interface AuthenticatedSessionDto {
  userId: string;
  actorType: ActorType;
  authBoundary: AuthBoundary;
  email?: string | null;
  mobile?: string | null;
  merchantId?: string | null;
  role?: MerchantRole | 'super_admin' | 'reviewer';
  permissions?: MarketplacePermission[];
  isMfaVerified?: boolean;
  sessionToken?: string;
  issuedAt?: string;
  expiresAt?: string;
}

export interface TenantContext {
  actorType: ActorType;
  userId: string;
  merchantId?: string; // Present only if actorType === 'merchant_user' and active membership verified
  role?: MerchantRole | 'super_admin' | 'reviewer';
  isSuperAdmin?: boolean;
}

export interface OwnershipAssertionResult {
  allowed: boolean;
  statusCode: 200 | 400 | 401 | 403;
  error?: 'UNAUTHORIZED' | 'FORBIDDEN' | 'BAD_REQUEST';
  message?: string;
}

export interface IdentityAssertionResult {
  allowed: boolean;
  statusCode: 200 | 401 | 403;
  error?: 'UNAUTHORIZED' | 'FORBIDDEN';
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

  /**
   * Asserts whether an authenticated session is permitted to access a given security boundary.
   *
   * Boundaries:
   * - 'store': Customer storefront operations.
   * - 'merchant': Merchant portal and tenant operations.
   * - 'admin': Super Admin platform governance operations.
   *
   * Rules:
   * 1. Unauthenticated or missing session -> 401 UNAUTHORIZED
   * 2. Customer accessing 'merchant' or 'admin' -> 403 FORBIDDEN
   * 3. Merchant user accessing 'admin' -> 403 FORBIDDEN
   * 4. Merchant user accessing 'store' with merchant credentials -> 403 FORBIDDEN
   * 5. Super Admin accessing 'admin' or cross-merchant resources -> 200 OK
   */
  static assertBoundaryAccess(
    session: AuthenticatedSessionDto | null | undefined,
    targetBoundary: AuthBoundary
  ): IdentityAssertionResult {
    if (!session || !session.userId) {
      return {
        allowed: false,
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'Authentication required. No active session token found.',
      };
    }

    if (session.actorType === 'customer') {
      if (targetBoundary !== 'store') {
        return {
          allowed: false,
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Access denied: Customer credentials cannot access merchant or admin boundaries.',
        };
      }
      return { allowed: true, statusCode: 200 };
    }

    if (session.actorType === 'merchant_user') {
      if (targetBoundary === 'admin') {
        return {
          allowed: false,
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Access denied: Merchant credentials cannot access platform admin boundary.',
        };
      }
      if (targetBoundary === 'store') {
        return {
          allowed: false,
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Access denied: Merchant credentials cannot perform customer storefront operations directly.',
        };
      }
      return { allowed: true, statusCode: 200 };
    }

    if (session.actorType === 'super_admin') {
      return { allowed: true, statusCode: 200 };
    }

    return {
      allowed: false,
      statusCode: 403,
      error: 'FORBIDDEN',
      message: 'Access denied: Unknown or unhandled actor type.',
    };
  }

  /**
   * Asserts whether a merchant team member has active membership and active merchant account status.
   */
  static assertMerchantActiveMembership(params: {
    membershipStatus: MerchantMemberStatus | null | undefined;
    merchantStatus: MerchantStatus | null | undefined;
  }): IdentityAssertionResult {
    const { membershipStatus, merchantStatus } = params;

    if (!membershipStatus || membershipStatus !== 'active') {
      return {
        allowed: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: `Merchant membership is not active (current status: ${membershipStatus || 'unknown'}). Access denied.`,
      };
    }

    if (!merchantStatus || merchantStatus !== 'active') {
      return {
        allowed: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: `Merchant account is not active (current status: ${merchantStatus || 'unknown'}). Access denied.`,
      };
    }

    return { allowed: true, statusCode: 200 };
  }

  /**
   * Evaluates permission-based RBAC for merchant users and platform staff (including reviewer roles).
   */
  static assertPermission(
    session: AuthenticatedSessionDto | null | undefined,
    requiredPermission: MarketplacePermission
  ): IdentityAssertionResult {
    if (!session || !session.userId) {
      return {
        allowed: false,
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'Authentication required.',
      };
    }

    // Super Admin role has all permissions globally
    if (session.role === 'super_admin') {
      return { allowed: true, statusCode: 200 };
    }

    // Merchant owner has all permissions within their merchant scope
    if (session.actorType === 'merchant_user' && session.role === 'owner') {
      return { allowed: true, statusCode: 200 };
    }

    // Permission-based evaluation for other roles (admin, manager, staff, reviewer)
    if (session.permissions && session.permissions.includes(requiredPermission)) {
      return { allowed: true, statusCode: 200 };
    }

    return {
      allowed: false,
      statusCode: 403,
      error: 'FORBIDDEN',
      message: `Access denied: Missing required permission [${requiredPermission}].`,
    };
  }

  /**
   * Dual-transport token extractor supporting:
   * 1. React Native mobile apps using 'Authorization: Bearer <token>' header
   * 2. Web browser clients using HTTP-only cookies ('ecom_session_token', 'ecom_merchant_sess', 'ecom_admin_sess')
   */
  static extractAuthToken(
    headers: Record<string, string | undefined>,
    cookieHeader?: string | null
  ): { token: string | null; transport: 'bearer' | 'cookie' | null } {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken) {
        return { token: bearerToken, transport: 'bearer' };
      }
    }

    if (cookieHeader) {
      const match = cookieHeader.match(
        /(?:^|;\s*)(?:ecom_session_token|ecom_merchant_sess|ecom_admin_sess)=([^;]+)/
      );
      if (match && match[1]) {
        return { token: decodeURIComponent(match[1].trim()), transport: 'cookie' };
      }
    }

    return { token: null, transport: null };
  }
}

