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

export interface MerchantLifecycleEvent {
  fromStatus: MerchantStatus;
  toStatus: MerchantStatus;
  changedAt: string;
  changedBy: string; // userId of actor or 'system'
  reason?: string;
  notes?: string;
}

export interface MerchantVerificationMetadata {
  verificationSubmittedAt?: string;
  approvedAt?: string;
  approvedBy?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  rejectedBy?: string;
  suspensionReason?: string;
  suspendedAt?: string;
  suspendedBy?: string;
  changesRequestedAt?: string;
  changesRequestedBy?: string;
  changesRequestedReason?: string;
  reactivatedAt?: string;
  reactivatedBy?: string;
  lifecycleHistory?: MerchantLifecycleEvent[];
}

export interface MerchantDto {
  id: string;
  name: string;
  handle: string;
  status: MerchantStatus;
  email: string;
  phone: string;
  businessRegistrationNumber?: string; // GSTIN for India
  taxIdentifier?: string; // PAN for India
  metadata?: MerchantVerificationMetadata & Record<string, unknown>;
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
  metadata?: MerchantVerificationMetadata & Record<string, unknown>;
}

export interface UpdateMerchantPayload {
  name?: string;
  handle?: string;
  status?: MerchantStatus;
  email?: string;
  phone?: string;
  businessRegistrationNumber?: string;
  taxIdentifier?: string;
  metadata?: MerchantVerificationMetadata & Record<string, unknown>;
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
// 1.1 Validation Constants & Helper Rules
// ==========================================

export const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const INDIAN_PHONE_REGEX = /^\+91[6-9]\d{9}$/;
export const MERCHANT_HANDLE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const RESERVED_MERCHANT_HANDLES = new Set([
  'admin',
  'superadmin',
  'merchant',
  'seller',
  'store',
  'shop',
  'api',
  'auth',
  'system',
  'root',
  'support',
  'help',
  'billing',
  'platform',
]);

export interface BusinessIdentifierValidationResult {
  isValid: boolean;
  normalized?: string;
  error?: string;
  /**
   * Format validation strictly evaluates alphanumeric syntax and pattern conformance.
   * It does NOT query government databases (GSTN / Income Tax Department) and must NOT
   * be represented as official registration verification.
   */
  isOfficialVerification: false;
}

/**
 * Validates Indian Goods & Services Tax Identification Number (GSTIN) syntax.
 * Structural format: 15 alphanumeric characters (2 state code digits + 10 PAN characters + 1 entity num + 'Z' + 1 checksum).
 *
 * NOTE: This function performs structural syntax validation only. It does NOT query the GSTN portal
 * and does NOT constitute official government registration verification.
 */
export function validateGSTIN(gstin?: string | null): BusinessIdentifierValidationResult {
  if (!gstin || typeof gstin !== 'string' || gstin.trim() === '') {
    return { isValid: false, isOfficialVerification: false, error: 'GSTIN is required' };
  }
  const clean = gstin.trim().toUpperCase();
  if (!GSTIN_REGEX.test(clean)) {
    return {
      isValid: false,
      isOfficialVerification: false,
      error: 'Invalid GSTIN format: Must be 15 alphanumeric characters (e.g. 07AAAAA0000A1Z5). Note: Structural validation does not verify official GSTN registry.',
    };
  }
  return { isValid: true, normalized: clean, isOfficialVerification: false };
}

/**
 * Validates Indian Permanent Account Number (PAN) syntax.
 * Structural format: 10 characters (5 letters + 4 digits + 1 letter).
 *
 * NOTE: This function performs structural syntax validation only. It does NOT query the Income Tax Department
 * and does NOT constitute official government registration verification.
 */
export function validatePAN(pan?: string | null): BusinessIdentifierValidationResult {
  if (!pan || typeof pan !== 'string' || pan.trim() === '') {
    return { isValid: false, isOfficialVerification: false, error: 'PAN is required' };
  }
  const clean = pan.trim().toUpperCase();
  if (!PAN_REGEX.test(clean)) {
    return {
      isValid: false,
      isOfficialVerification: false,
      error: 'Invalid PAN format: Must be 10 characters (e.g. ABCDE1234F). Note: Structural validation does not verify official Income Tax registry.',
    };
  }
  return { isValid: true, normalized: clean, isOfficialVerification: false };
}

/**
 * Validates normalized Indian mobile phone number in E.164 format (+91XXXXXXXXXX).
 */
export function validateIndianPhone(phone?: string | null): { isValid: boolean; error?: string } {
  if (!phone || typeof phone !== 'string' || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }
  const clean = phone.trim();
  if (!INDIAN_PHONE_REGEX.test(clean)) {
    return {
      isValid: false,
      error: 'Invalid Indian phone format: Must be E.164 +91 followed by 10 digits starting with 6-9',
    };
  }
  return { isValid: true };
}

/**
 * Validates merchant URL handle.
 * 3-60 lowercase alphanumeric characters with hyphens, not reserved.
 */
export function validateMerchantHandle(handle?: string | null): { isValid: boolean; error?: string } {
  if (!handle || typeof handle !== 'string' || handle.trim() === '') {
    return { isValid: false, error: 'Merchant handle is required' };
  }
  const clean = handle.trim().toLowerCase();
  if (clean.length < 3 || clean.length > 60) {
    return { isValid: false, error: 'Merchant handle must be between 3 and 60 characters long' };
  }
  if (!MERCHANT_HANDLE_REGEX.test(clean)) {
    return {
      isValid: false,
      error: 'Merchant handle must contain only lowercase letters, numbers, and single hyphens',
    };
  }
  if (RESERVED_MERCHANT_HANDLES.has(clean)) {
    return { isValid: false, error: `Handle '${clean}' is reserved and cannot be used` };
  }
  return { isValid: true };
}

/**
 * Validates merchant profile payload.
 */
export function validateMerchantProfile(
  payload: Partial<CreateMerchantPayload>,
  isCreate = false
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (isCreate || payload.name !== undefined) {
    if (!payload.name || typeof payload.name !== 'string' || payload.name.trim().length < 2) {
      errors.push('Merchant name is required and must be at least 2 characters long');
    } else if (payload.name.trim().length > 120) {
      errors.push('Merchant name cannot exceed 120 characters');
    }
  }

  if (isCreate || payload.email !== undefined) {
    if (!payload.email || typeof payload.email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email.trim())) {
      errors.push('Valid corporate email address is required');
    }
  }

  if (isCreate || payload.phone !== undefined) {
    const phoneRes = validateIndianPhone(payload.phone);
    if (!phoneRes.isValid && phoneRes.error) {
      errors.push(phoneRes.error);
    }
  }

  if (payload.handle !== undefined && payload.handle !== null && payload.handle !== '') {
    const handleRes = validateMerchantHandle(payload.handle);
    if (!handleRes.isValid && handleRes.error) {
      errors.push(handleRes.error);
    }
  }

  if (payload.businessRegistrationNumber !== undefined && payload.businessRegistrationNumber !== null && payload.businessRegistrationNumber !== '') {
    const gstinRes = validateGSTIN(payload.businessRegistrationNumber);
    if (!gstinRes.isValid && gstinRes.error) {
      errors.push(gstinRes.error);
    }
  }

  if (payload.taxIdentifier !== undefined && payload.taxIdentifier !== null && payload.taxIdentifier !== '') {
    const panRes = validatePAN(payload.taxIdentifier);
    if (!panRes.isValid && panRes.error) {
      errors.push(panRes.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates status transitions for Merchant lifecycle state machine.
 */
export function validateMerchantStatusTransition(
  current: MerchantStatus,
  target: MerchantStatus,
  context?: {
    actorType?: ActorType;
    hasActiveOwner?: boolean;
    reason?: string;
  }
): { allowed: boolean; error?: string } {
  if (current === target) {
    return {
      allowed: false,
      error: `NO_OP_TRANSITION: Target status is already '${target}'.`,
    };
  }

  // 1. Draft transitions
  if (current === 'draft') {
    if (target === 'pending_approval') {
      return { allowed: true };
    }
    if (target === 'active') {
      return {
        allowed: false,
        error: 'DIRECT_ACTIVATION_BLOCKED: Draft merchant cannot be activated directly. Must submit for verification.',
      };
    }
    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition merchant from 'draft' to '${target}'.`,
    };
  }

  // 2. Pending Approval transitions
  if (current === 'pending_approval') {
    if (target === 'active') {
      if (context?.actorType && context.actorType !== 'super_admin') {
        return {
          allowed: false,
          error: 'SUPER_ADMIN_REQUIRED: Only Super Admin can approve and activate a merchant.',
        };
      }
      if (context?.hasActiveOwner === false) {
        return {
          allowed: false,
          error: 'OWNER_REQUIRED: Merchant must have at least one active owner before activation.',
        };
      }
      return { allowed: true };
    }
    if (target === 'rejected') {
      if (context?.actorType && context.actorType !== 'super_admin') {
        return {
          allowed: false,
          error: 'SUPER_ADMIN_REQUIRED: Only Super Admin can reject a merchant application.',
        };
      }
      if (!context?.reason || context.reason.trim() === '') {
        return {
          allowed: false,
          error: 'REJECTION_REASON_REQUIRED: A rejection reason is required when rejecting a merchant.',
        };
      }
      return { allowed: true };
    }
    if (target === 'draft') {
      if (context?.actorType === 'super_admin' && (!context.reason || context.reason.trim() === '')) {
        return {
          allowed: false,
          error: 'CHANGES_REQUESTED_REASON_REQUIRED: A reason is required when requesting changes on a merchant.',
        };
      }
      return { allowed: true }; // Merchant retracts submission to make edits or Super Admin requests changes
    }
    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition merchant from 'pending_approval' to '${target}'.`,
    };
  }

  // 3. Active transitions
  if (current === 'active') {
    if (target === 'suspended') {
      if (context?.actorType && context.actorType !== 'super_admin') {
        return {
          allowed: false,
          error: 'SUPER_ADMIN_REQUIRED: Only Super Admin can suspend an active merchant.',
        };
      }
      if (!context?.reason || context.reason.trim() === '') {
        return {
          allowed: false,
          error: 'SUSPENSION_REASON_REQUIRED: A suspension reason is required when suspending a merchant.',
        };
      }
      return { allowed: true };
    }
    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition merchant from 'active' to '${target}'. Only suspension is permitted.`,
    };
  }

  // 4. Suspended transitions
  if (current === 'suspended') {
    if (target === 'active') {
      if (context?.actorType && context.actorType !== 'super_admin') {
        return {
          allowed: false,
          error: 'SUPER_ADMIN_REQUIRED: Only Super Admin can reactivate a suspended merchant.',
        };
      }
      return { allowed: true };
    }
    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition merchant from 'suspended' to '${target}'. Only reactivation is permitted.`,
    };
  }

  // 5. Rejected transitions
  if (current === 'rejected') {
    if (target === 'draft' || target === 'pending_approval') {
      return { allowed: true }; // Merchant rectifies defects and re-submits
    }
    if (target === 'active') {
      return {
        allowed: false,
        error: 'RE_REVIEW_REQUIRED: Rejected merchant cannot be directly activated without re-review.',
      };
    }
    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition merchant from 'rejected' to '${target}'.`,
    };
  }

  return {
    allowed: false,
    error: `INVALID_TRANSITION: Unknown status transition from '${current}' to '${target}'.`,
  };
}

/**
 * Validates status transitions for MerchantMember lifecycle.
 */
export function validateMemberStatusTransition(
  current: MerchantMemberStatus,
  target: MerchantMemberStatus
): { allowed: boolean; error?: string } {
  if (current === target) {
    return {
      allowed: false,
      error: `NO_OP_TRANSITION: Target status is already '${target}'.`,
    };
  }

  if (current === 'invited') {
    if (target === 'active') {
      return { allowed: true };
    }
    if (target === 'suspended') {
      return {
        allowed: false,
        error: 'INVALID_TRANSITION: Cannot suspend an unaccepted invitation. Revoke the invitation instead.',
      };
    }
  }

  if (current === 'active') {
    if (target === 'suspended') {
      return { allowed: true };
    }
  }

  if (current === 'suspended') {
    if (target === 'active') {
      return { allowed: true };
    }
  }

  return {
    allowed: false,
    error: `INVALID_TRANSITION: Cannot transition member from '${current}' to '${target}'.`,
  };
}

/**
 * Validates that an operation will not leave an active merchant without an active owner.
 */
export function validateSoleOwnerConstraint(
  currentMembers: { userId: string; role: MerchantRole; status: MerchantMemberStatus }[],
  targetUserId: string,
  newRole?: MerchantRole,
  newStatus?: MerchantMemberStatus
): { allowed: boolean; error?: string } {
  const activeOwners = currentMembers.filter(
    (m) => m.role === 'owner' && m.status === 'active'
  );

  const isTargetActiveOwner = activeOwners.some((m) => m.userId === targetUserId);

  if (isTargetActiveOwner && activeOwners.length === 1) {
    if (newRole && newRole !== 'owner') {
      return {
        allowed: false,
        error: 'SOLE_OWNER_PROTECTION: Cannot demote the sole active owner of this merchant. Transfer ownership to another active member first.',
      };
    }
    if (newStatus && newStatus !== 'active') {
      return {
        allowed: false,
        error: 'SOLE_OWNER_PROTECTION: Cannot suspend or deactivate the sole active owner of this merchant.',
      };
    }
  }

  return { allowed: true };
}

// ==========================================
// 2. Product Ownership & Catalog Scoping
// ==========================================

export type ProductModerationStatus =
  | 'draft'
  | 'proposed'
  | 'pending_review'
  | 'approved'
  | 'rejected'
  | 'published'
  | 'archived';

export type ProductLifecycleStatus = 'draft' | 'proposed' | 'published' | 'rejected';

export const CANONICAL_PRODUCT_LIFECYCLE_STATUSES: readonly ProductLifecycleStatus[] = [
  'draft',
  'proposed',
  'published',
  'rejected',
] as const;

export interface ProductStatusTransitionContext {
  actorType?: ActorType;
  isMerchantActive?: boolean;
  reason?: string;
  notes?: string;
}

/**
 * Validates status transitions for Product moderation and publication lifecycle.
 * In Medusa v2 and PostgreSQL, the product status is constrained to 4 canonical persisted values:
 *   ('draft', 'proposed', 'published', 'rejected')
 * 'approved' is not a separate persisted state in PostgreSQL; it is the conceptual decision
 * that sets the status to 'published' while stamping metadata.approvedAt and metadata.approvedBy.
 * Any reference to 'approved' is normalized to 'published' (and 'pending_review' to 'proposed').
 */
export function validateProductStatusTransition(
  current: ProductLifecycleStatus | string,
  target: ProductLifecycleStatus | string,
  context?: ProductStatusTransitionContext
): { allowed: boolean; error?: string } {
  // Normalize conceptual aliases to canonical 4-state persisted lifecycle
  const normalizedCurrent =
    current === 'pending_review' ? 'proposed' : current === 'approved' ? 'published' : current;
  const normalizedTarget =
    target === 'pending_review' ? 'proposed' : target === 'approved' ? 'published' : target;

  if (normalizedCurrent === normalizedTarget) {
    return {
      allowed: false,
      error: `NO_OP_TRANSITION: Target status is already '${target}'.`,
    };
  }

  // 1. Proposed transitions (Super Admin moderation queue)
  if (normalizedCurrent === 'proposed') {
    if (normalizedTarget === 'published') {
      if (context?.actorType && context.actorType !== 'super_admin') {
        return {
          allowed: false,
          error: 'SUPER_ADMIN_REQUIRED: Only Super Admin can approve and publish products.',
        };
      }
      if (context?.isMerchantActive === false) {
        return {
          allowed: false,
          error: 'MERCHANT_NOT_ACTIVE: Associated merchant must be active to publish product.',
        };
      }
      return { allowed: true };
    }

    if (normalizedTarget === 'rejected') {
      if (context?.actorType && context.actorType !== 'super_admin') {
        return {
          allowed: false,
          error: 'SUPER_ADMIN_REQUIRED: Only Super Admin can reject product submissions.',
        };
      }
      if (!context?.reason || context.reason.trim() === '') {
        return {
          allowed: false,
          error: 'REJECTION_REASON_REQUIRED: A non-empty reason is required to reject a product.',
        };
      }
      return { allowed: true };
    }

    if (normalizedTarget === 'draft') {
      if (context?.actorType && context.actorType !== 'super_admin') {
        return {
          allowed: false,
          error: 'SUPER_ADMIN_REQUIRED: Only Super Admin can request changes on submitted products.',
        };
      }
      if (!context?.reason || context.reason.trim() === '') {
        return {
          allowed: false,
          error: 'CHANGES_REQUESTED_REASON_REQUIRED: A non-empty reason is required when requesting changes.',
        };
      }
      return { allowed: true };
    }

    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition product from 'proposed' to '${target}'.`,
    };
  }

  // 2. Draft transitions (Merchant catalog)
  if (normalizedCurrent === 'draft') {
    if (normalizedTarget === 'proposed') {
      return { allowed: true }; // Merchant submits for moderation
    }
    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition product from 'draft' to '${target}'. Product must be submitted for moderation first.`,
    };
  }

  // 3. Rejected transitions
  if (normalizedCurrent === 'rejected') {
    if (normalizedTarget === 'proposed') {
      return { allowed: true }; // Merchant re-submits for moderation
    }
    if (normalizedTarget === 'draft') {
      return { allowed: true }; // Merchant rectifies or edits
    }
    if (normalizedTarget === 'published') {
      return {
        allowed: false,
        error: 'RE_REVIEW_REQUIRED: Rejected product must be re-submitted for moderation review before publishing.',
      };
    }
    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition product from 'rejected' to '${target}'.`,
    };
  }

  // 4. Published (Approved & Live) transitions
  if (normalizedCurrent === 'published') {
    if (normalizedTarget === 'proposed') {
      return { allowed: true }; // Merchant content change triggers re-review
    }
    if (normalizedTarget === 'draft') {
      return { allowed: true }; // Unpublish to draft
    }
    if (normalizedTarget === 'rejected') {
      return {
        allowed: false,
        error: 'INVALID_TRANSITION: Published product cannot be rejected directly from moderation queue. Use unpublish or archive workflow.',
      };
    }
    return {
      allowed: false,
      error: `INVALID_TRANSITION: Cannot transition product from 'published' to '${target}'.`,
    };
  }

  return {
    allowed: false,
    error: `INVALID_TRANSITION: Unknown product status transition from '${current}' to '${target}'.`,
  };
}

export interface ProductAvailableActions {
  canSubmit: boolean;
  canApprove: boolean;
  canRequestChanges: boolean;
  canReject: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

export function getAvailableProductActions(
  status: ProductLifecycleStatus | string,
  actorBoundary: 'merchant' | 'admin'
): ProductAvailableActions {
  const normStatus = status === 'pending_review' ? 'proposed' : status;
  if (actorBoundary === 'admin') {
    return {
      canSubmit: false,
      canApprove: normStatus === 'proposed',
      canRequestChanges: normStatus === 'proposed',
      canReject: normStatus === 'proposed',
      canEdit: true,
      canDelete: true,
    };
  }

  // actorBoundary === 'merchant'
  return {
    canSubmit: normStatus === 'draft' || normStatus === 'rejected',
    canApprove: false,
    canRequestChanges: false,
    canReject: false,
    canEdit: true,
    canDelete: true,
  };
}

export interface MerchantReviewAvailableActions {
  canApprove: boolean;
  canRequestChanges: boolean;
  canReject: boolean;
  canSuspend: boolean;
  canReactivate: boolean;
}

export function getAvailableMerchantReviewActions(
  status: MerchantStatus | string
): MerchantReviewAvailableActions {
  return {
    canApprove: status === 'pending_approval',
    canRequestChanges: status === 'pending_approval',
    canReject: status === 'pending_approval',
    canSuspend: status === 'active',
    canReactivate: status === 'suspended',
  };
}

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

export interface MerchantFulfillOrderDto {
  items: Array<{ id: string; quantity: number }>;
  tracking_number?: string;
  trackingNumber?: string;
  carrier_name?: string;
  carrierName?: string;
  notes?: string;
  status?: 'fulfilled' | 'shipped';
}

export interface MerchantFulfillmentItemDto {
  id: string;
  lineItemId: string;
  quantity: number;
  title?: string;
  sku?: string;
}

export interface MerchantFulfillmentDetailDto {
  id: string;
  orderId: string;
  merchantId: string;
  merchantName?: string;
  status: LineItemFulfillmentStatus;
  trackingNumber?: string;
  carrierName?: string;
  notes?: string;
  items: MerchantFulfillmentItemDto[];
  packedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FulfillmentOperationResultDto {
  success: boolean;
  fulfillment: MerchantFulfillmentDetailDto;
  message?: string;
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

export interface MerchantInventoryItemDto {
  id: string;
  inventoryItemId: string | null;
  inventory_item_id?: string | null;
  sku: string;
  productId: string;
  product_id?: string;
  productTitle: string;
  product_title?: string;
  variantId: string;
  variant_id?: string;
  variantTitle: string;
  variant_title?: string;
  merchantId?: string;
  merchant_id?: string;
  locationId: string | null;
  location_id?: string | null;
  locationName: string;
  location_name?: string;
  stockedQuantity: number;
  stocked_quantity?: number;
  reservedQuantity: number;
  reserved_quantity?: number;
  availableQuantity: number;
  available_quantity?: number;
  lowStockThreshold?: number;
  low_stock_threshold?: number;
  isLowStock: boolean;
  is_low_stock?: boolean;
  updatedAt?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
}

export interface InventorySummaryDto {
  totalSkus: number;
  total_items?: number;
  inStockCount: number;
  in_stock_count?: number;
  lowStockCount: number;
  low_stock_count?: number;
  outOfStockCount: number;
  out_of_stock_count?: number;
  totalStockedUnits?: number;
  total_stocked_units?: number;
}

export interface InventoryAdjustmentDto {
  inventoryItemId: string;
  inventory_item_id?: string;
  locationId: string;
  location_id?: string;
  adjustment?: number;
  newQuantity?: number;
  stocked_quantity?: number;
  reason: string;
  idempotencyKey?: string;
  idempotency_key?: string;
}

export interface InventoryAdjustmentResultDto {
  success: boolean;
  id?: string;
  inventoryItemId: string;
  inventory_item_id?: string;
  locationId: string;
  location_id?: string;
  previousQuantity: number;
  previous_stocked_quantity?: number;
  newQuantity: number;
  stocked_quantity?: number;
  reserved_quantity?: number;
  adjustment: number;
  availableQuantity: number;
  available_quantity?: number;
  isLowStock: boolean;
  is_low_stock?: boolean;
  reason: string;
  adjustedAt: string;
  adjustedBy: string;
}

export interface InventoryAdjustmentSafetyResult {
  canAdjust: boolean;
  reason?: string;
  resultingStocked?: number;
  availableQuantity?: number;
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
  membershipStatus?: MerchantMemberStatus | null;
  merchantStatus?: MerchantStatus | null;
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
   * Asserts whether a requesting tenant context has read or mutation access to a stock location.
   */
  static assertStockLocationAccess(
    tenant: TenantContext | null | undefined,
    locationMerchantId: string | null | undefined
  ): OwnershipAssertionResult {
    if (!tenant || !tenant.userId) {
      return {
        allowed: false,
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'Authentication required. No active session token found.',
      };
    }

    if (tenant.actorType === 'super_admin' || tenant.isSuperAdmin) {
      return { allowed: true, statusCode: 200 };
    }

    if (tenant.actorType === 'merchant_user') {
      if (!tenant.merchantId || tenant.merchantId.trim() === '') {
        return {
          allowed: false,
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Access denied: Merchant user is not linked to an active merchant.',
        };
      }

      if (!locationMerchantId || tenant.merchantId.trim() !== locationMerchantId.trim()) {
        return {
          allowed: false,
          statusCode: 403,
          error: 'FORBIDDEN',
          message: 'Access denied: You do not have access to this stock location.',
        };
      }

      return { allowed: true, statusCode: 200 };
    }

    return {
      allowed: false,
      statusCode: 403,
      error: 'FORBIDDEN',
      message: 'Access denied: Invalid actor type for stock location.',
    };
  }

  /**
   * Evaluates inventory adjustment safety.
   * Guarantees stock quantity does not drop below current active reservations or become negative.
   */
  static evaluateInventoryAdjustmentSafety(
    currentStocked: number,
    reservedQuantity: number,
    adjustment: number
  ): InventoryAdjustmentSafetyResult {
    const resultingStocked = currentStocked + adjustment;
    if (resultingStocked < 0) {
      return {
        canAdjust: false,
        reason: `INVALID_STOCK: Adjustment would result in negative stock quantity (${resultingStocked}).`,
      };
    }
    if (resultingStocked < reservedQuantity) {
      return {
        canAdjust: false,
        reason: `RESERVATION_CONFLICT: Cannot adjust stock below currently reserved quantity of ${reservedQuantity} units. Active customer orders would be affected.`,
      };
    }
    return {
      canAdjust: true,
      resultingStocked,
      availableQuantity: resultingStocked - reservedQuantity,
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
   *
   * When a specific boundary is requested, it prioritizes the boundary-specific cookie
   * to prevent multi-cookie collisions in shared browser environments (e.g. localhost).
   */
  static extractAuthToken(
    headers: Record<string, string | undefined>,
    cookieHeader?: string | null,
    boundary?: AuthBoundary
  ): { token: string | null; transport: 'bearer' | 'cookie' | null } {
    const authHeader = headers['authorization'] || headers['Authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const bearerToken = authHeader.substring(7).trim();
      if (bearerToken) {
        return { token: bearerToken, transport: 'bearer' };
      }
    }

    if (cookieHeader) {
      if (boundary === 'merchant') {
        const match = cookieHeader.match(/(?:^|;\s*)ecom_merchant_sess=([^;]+)/);
        if (match && match[1]) {
          return { token: decodeURIComponent(match[1].trim()), transport: 'cookie' };
        }
      } else if (boundary === 'admin') {
        const match = cookieHeader.match(/(?:^|;\s*)ecom_admin_sess=([^;]+)/);
        if (match && match[1]) {
          return { token: decodeURIComponent(match[1].trim()), transport: 'cookie' };
        }
      } else if (boundary === 'store') {
        const match = cookieHeader.match(/(?:^|;\s*)ecom_session_token=([^;]+)/);
        if (match && match[1]) {
          return { token: decodeURIComponent(match[1].trim()), transport: 'cookie' };
        }
      }

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

