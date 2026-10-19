/**
 * Backend Marketplace Ownership & Tenant Isolation Guard
 * Enforces server-side tenant boundaries across products, inventory, and order line items.
 */

import type {
  AuthBoundary,
  AuthenticatedSessionDto,
  IdentityAssertionResult,
  MarketplacePermission,
  MerchantMemberStatus,
  MerchantStatus,
} from '@ecom/types';

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


    if (session.actorType === 'merchant_user' && session.role === 'owner') {
      return { allowed: true, statusCode: 200 };
    }

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

