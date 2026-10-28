import { MedusaService, Modules } from '@medusajs/framework/utils';
import {
  MerchantStatus,
  MerchantRole,
  MerchantMemberStatus,
  CreateMerchantPayload,
  UpdateMerchantPayload,
  ActorType,
  validateMerchantProfile,
  validateMerchantStatusTransition,
  validateMemberStatusTransition,
  validateSoleOwnerConstraint,
  MerchantLifecycleEvent,
} from '@ecom/types';
import { Merchant } from './models/merchant';
import { MerchantMember } from './models/merchant-member';
import { BackendMarketplaceGuard } from './ownership-guard';

/**
 * MarketplaceModuleService
 *
 * Provides domain services for:
 * - Merchant profile creation, update, and validation (GSTIN, PAN, Phone, Handle).
 * - Status lifecycle state transitions with audit history and timestamps.
 * - Team membership management with unique member constraints.
 * - Sole active owner protection against demotion or deactivation.
 * - Server-verifiable active membership assertion.
 */
export default class MarketplaceModuleService extends MedusaService({
  Merchant,
  MerchantMember,
}) {
  // In-process lock chain per merchant to serialize member role/status mutations and prevent race conditions
  private static memberMutationLocks = new Map<string, Promise<void>>();

  static async withMerchantLock<T>(merchantId: string, fn: () => Promise<T>): Promise<T> {
    const currentLock = MarketplaceModuleService.memberMutationLocks.get(merchantId) || Promise.resolve();
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    MarketplaceModuleService.memberMutationLocks.set(merchantId, nextLock);

    try {
      await currentLock;
      return await fn();
    } finally {
      release!();
      if (MarketplaceModuleService.memberMutationLocks.get(merchantId) === nextLock) {
        MarketplaceModuleService.memberMutationLocks.delete(merchantId);
      }
    }
  }

  // In-process lock chain per product to serialize product deletion vs concurrent customer checkout
  private static productMutationLocks = new Map<string, Promise<void>>();

  static async withProductLock<T>(productId: string, fn: () => Promise<T>): Promise<T> {
    const currentLock = MarketplaceModuleService.productMutationLocks.get(productId) || Promise.resolve();
    let release: () => void;
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    MarketplaceModuleService.productMutationLocks.set(productId, nextLock);

    try {
      await currentLock;
      return await fn();
    } finally {
      release!();
      if (MarketplaceModuleService.productMutationLocks.get(productId) === nextLock) {
        MarketplaceModuleService.productMutationLocks.delete(productId);
      }
    }
  }

  /**
   * Validates and creates a new merchant in 'draft' status.
   */
  async validateAndCreateMerchant(payload: CreateMerchantPayload) {
    const validation = validateMerchantProfile(payload, true);
    if (!validation.isValid) {
      throw new Error(`MERCHANT_VALIDATION_FAILED: ${validation.errors.join('; ')}`);
    }

    const handle = payload.handle
      ? payload.handle.trim().toLowerCase()
      : payload.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

    const merchant = await (this as any).createMerchants({
      name: payload.name.trim(),
      handle,
      status: 'draft',
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      business_registration_number: payload.businessRegistrationNumber
        ? payload.businessRegistrationNumber.trim().toUpperCase()
        : null,
      tax_identifier: payload.taxIdentifier
        ? payload.taxIdentifier.trim().toUpperCase()
        : null,
      metadata: payload.metadata || {},
    });

    return merchant;
  }

  /**
   * Validates and updates a merchant profile.
   */
  async validateAndUpdateMerchant(id: string, payload: UpdateMerchantPayload) {
    const validation = validateMerchantProfile(payload, false);
    if (!validation.isValid) {
      throw new Error(`MERCHANT_VALIDATION_FAILED: ${validation.errors.join('; ')}`);
    }

    const updateData: Record<string, any> = {};
    if (payload.name !== undefined) updateData.name = payload.name.trim();
    if (payload.handle !== undefined) updateData.handle = payload.handle.trim().toLowerCase();
    if (payload.email !== undefined) updateData.email = payload.email.trim().toLowerCase();
    if (payload.phone !== undefined) updateData.phone = payload.phone.trim();
    if (payload.businessRegistrationNumber !== undefined) {
      updateData.business_registration_number = payload.businessRegistrationNumber
        ? payload.businessRegistrationNumber.trim().toUpperCase()
        : null;
    }
    if (payload.taxIdentifier !== undefined) {
      updateData.tax_identifier = payload.taxIdentifier
        ? payload.taxIdentifier.trim().toUpperCase()
        : null;
    }
    if (payload.metadata !== undefined) updateData.metadata = payload.metadata;

    const updated = await (this as any).updateMerchants({
      id,
      ...updateData,
    });
    return Array.isArray(updated) ? updated[0] : updated;
  }

  /**
   * Executes a lifecycle state transition with validation, owner protection, and audit recording.
   */
  async transitionMerchantStatus(
    id: string,
    targetStatus: MerchantStatus,
    context: {
      actorType?: ActorType;
      actorId?: string;
      reason?: string;
      notes?: string;
    } = {}
  ) {
    const merchant = await (this as any).retrieveMerchant(id);
    if (!merchant) {
      throw new Error(`NOT_FOUND: Merchant with ID '${id}' not found.`);
    }

    const currentStatus = merchant.status as MerchantStatus;

    // Check owner constraint if activating
    let hasActiveOwner = true;
    if (targetStatus === 'active') {
      const members = await (this as any).listMerchantMembers({ merchant_id: id });
      hasActiveOwner = members.some(
        (m: any) => m.role === 'owner' && m.status === 'active'
      );
    }

    const transitionResult = validateMerchantStatusTransition(currentStatus, targetStatus, {
      actorType: context.actorType,
      hasActiveOwner,
      reason: context.reason,
    });

    if (!transitionResult.allowed) {
      throw new Error(transitionResult.error || `INVALID_TRANSITION: Cannot transition to ${targetStatus}`);
    }

    // Build verification metadata & audit history
    const existingMetadata = merchant.metadata || {};
    const history: MerchantLifecycleEvent[] = Array.isArray(existingMetadata.lifecycleHistory)
      ? [...existingMetadata.lifecycleHistory]
      : [];

    const now = new Date().toISOString();
    const event: MerchantLifecycleEvent = {
      fromStatus: currentStatus,
      toStatus: targetStatus,
      changedAt: now,
      changedBy: context.actorId || 'system',
      reason: context.reason,
      notes: context.notes,
    };
    history.push(event);

    const updatedMetadata: Record<string, any> = {
      ...existingMetadata,
      lifecycleHistory: history,
    };

    if (targetStatus === 'pending_approval') {
      updatedMetadata.verificationSubmittedAt = now;
    } else if (targetStatus === 'active') {
      updatedMetadata.approvedAt = now;
      updatedMetadata.approvedBy = context.actorId || 'system';
      if (currentStatus === 'suspended') {
        updatedMetadata.reactivatedAt = now;
        updatedMetadata.reactivatedBy = context.actorId || 'system';
      }
    } else if (targetStatus === 'rejected') {
      updatedMetadata.rejectedAt = now;
      updatedMetadata.rejectedBy = context.actorId || 'system';
      updatedMetadata.rejectionReason = context.reason;
    } else if (targetStatus === 'suspended') {
      updatedMetadata.suspendedAt = now;
      updatedMetadata.suspendedBy = context.actorId || 'system';
      updatedMetadata.suspensionReason = context.reason;
    } else if (targetStatus === 'draft' && currentStatus === 'pending_approval') {
      if (context.reason) {
        updatedMetadata.changesRequestedAt = now;
        updatedMetadata.changesRequestedBy = context.actorId || 'system';
        updatedMetadata.changesRequestedReason = context.reason;
      }
    }

    const updated = await (this as any).updateMerchants({
      id,
      status: targetStatus,
      metadata: updatedMetadata,
    });
    return Array.isArray(updated) ? updated[0] : updated;
  }

  /**
   * Adds a new member to a merchant team with role and initial status.
   */
  async addMerchantMember(
    merchantId: string,
    data: {
      userId: string;
      role?: MerchantRole;
      status?: MerchantMemberStatus;
      metadata?: Record<string, unknown>;
    }
  ) {
    if (!data.userId || data.userId.trim() === '') {
      throw new Error('USER_ID_REQUIRED: userId is required to add team member.');
    }

    // Verify existing membership to prevent duplicate entries
    const existing = await (this as any).listMerchantMembers({
      merchant_id: merchantId,
      user_id: data.userId.trim(),
    });

    if (existing && existing.length > 0) {
      throw new Error(`DUPLICATE_MEMBERSHIP: User '${data.userId}' is already a member of merchant '${merchantId}'.`);
    }

    return await (this as any).createMerchantMembers({
      merchant_id: merchantId,
      user_id: data.userId.trim(),
      role: data.role || 'staff',
      status: data.status || 'invited',
      metadata: data.metadata || null,
    });
  }

  /**
   * Updates a member's role or status, enforcing sole active owner protection.
   * Uses PostgreSQL transaction-level advisory locking (pg_advisory_xact_lock) when database manager
   * is available, ensuring serialization across independent backend instances.
   */
  async updateMerchantMemberRoleOrStatus(
    merchantId: string,
    memberIdOrUserId: string,
    update: {
      role?: MerchantRole;
      status?: MerchantMemberStatus;
    }
  ) {
    const executeInTransaction = async (em?: any) => {
      if (em && typeof em.execute === 'function') {
        // Acquire PostgreSQL transaction-level advisory lock keyed to the merchant.
        // Automatically released on COMMIT, ROLLBACK, or connection termination.
        await em.execute('SELECT pg_advisory_xact_lock(hashtext(?))', ['merchant_member_' + merchantId]);
      }

      const txContext = em ? { transactionManager: em } : undefined;
      const members = await (this as any).listMerchantMembers({ merchant_id: merchantId }, {}, txContext);
      const targetMember = members.find(
        (m: any) => m.id === memberIdOrUserId || m.user_id === memberIdOrUserId
      );

      if (!targetMember) {
        throw new Error(`MEMBER_NOT_FOUND: Member '${memberIdOrUserId}' not found in merchant '${merchantId}'.`);
      }

      // Validate status transition if status is being updated
      if (update.status && update.status !== targetMember.status) {
        const statusRes = validateMemberStatusTransition(
          targetMember.status as MerchantMemberStatus,
          update.status
        );
        if (!statusRes.allowed) {
          throw new Error(statusRes.error || `INVALID_TRANSITION: Invalid status transition to ${update.status}`);
        }
      }

      // Validate sole owner constraint against the fresh members state inside the lock
      const soleOwnerRes = validateSoleOwnerConstraint(
        members.map((m: any) => ({
          userId: m.user_id,
          role: m.role as MerchantRole,
          status: m.status as MerchantMemberStatus,
        })),
        targetMember.user_id,
        update.role,
        update.status
      );

      if (!soleOwnerRes.allowed) {
        throw new Error(soleOwnerRes.error);
      }

      const updateData: Record<string, any> = {};
      if (update.role) updateData.role = update.role;
      if (update.status) updateData.status = update.status;

      try {
        return await (this as any).updateMerchantMembers(
          {
            id: targetMember.id,
            ...updateData,
          },
          txContext
        );
      } catch (err: any) {
        if (err.message && err.message.includes('[object Object]')) {
          return await (this as any).updateMerchantMembers(targetMember.id, updateData, txContext);
        }
        throw err;
      }
    };

    const manager = (this as any).__container__?.manager;
    if (manager && typeof manager.transactional === 'function') {
      return await manager.transactional(executeInTransaction);
    }

    // In-memory fallback for mocked unit test environments without database container
    return await MarketplaceModuleService.withMerchantLock(merchantId, () => executeInTransaction());
  }

  /**
   * Removes a member from a merchant team, enforcing sole active owner protection.
   * Uses PostgreSQL transaction-level advisory locking (pg_advisory_xact_lock) when database manager
   * is available, ensuring serialization across independent backend instances.
   */
  async removeMerchantMember(merchantId: string, memberIdOrUserId: string): Promise<boolean> {
    const executeInTransaction = async (em?: any) => {
      if (em && typeof em.execute === 'function') {
        // Acquire PostgreSQL transaction-level advisory lock keyed to the merchant.
        // Automatically released on COMMIT, ROLLBACK, or connection termination.
        await em.execute('SELECT pg_advisory_xact_lock(hashtext(?))', ['merchant_member_' + merchantId]);
      }

      const txContext = em ? { transactionManager: em } : undefined;
      const members = await (this as any).listMerchantMembers({ merchant_id: merchantId }, {}, txContext);
      const targetMember = members.find(
        (m: any) => m.id === memberIdOrUserId || m.user_id === memberIdOrUserId
      );

      if (!targetMember) {
        throw new Error(`MEMBER_NOT_FOUND: Member '${memberIdOrUserId}' not found in merchant '${merchantId}'.`);
      }

      // Check sole active owner constraint before deletion against fresh transactional state
      const activeOwners = members.filter(
        (m: any) => m.role === 'owner' && m.status === 'active'
      );
      if (
        targetMember.role === 'owner' &&
        targetMember.status === 'active' &&
        activeOwners.length <= 1
      ) {
        throw new Error(
          'SOLE_OWNER_PROTECTION: Cannot remove the sole active owner of this merchant. Transfer ownership to another active member first.'
        );
      }

      await (this as any).deleteMerchantMembers([targetMember.id], txContext);
      return true;
    };

    const manager = (this as any).__container__?.manager;
    if (manager && typeof manager.transactional === 'function') {
      return await manager.transactional(executeInTransaction);
    }

    // In-memory fallback for mocked unit test environments without database container
    return await MarketplaceModuleService.withMerchantLock(merchantId, () => executeInTransaction());
  }


  /**
   * Server-side verification of active membership for a given user and merchant.
   * Both membership and merchant account must be active.
   */
  async verifyActiveMembership(
    userId: string,
    merchantId: string
  ): Promise<{
    valid: boolean;
    statusCode: 200 | 401 | 403;
    role?: MerchantRole;
    error?: string;
    message?: string;
  }> {
    if (!userId || !merchantId) {
      return {
        valid: false,
        statusCode: 401,
        error: 'UNAUTHORIZED',
        message: 'userId and merchantId are required for membership verification.',
      };
    }

    const [merchant, members] = await Promise.all([
      (this as any).retrieveMerchant(merchantId).catch(() => null),
      (this as any).listMerchantMembers({ merchant_id: merchantId, user_id: userId }),
    ]);

    if (!merchant) {
      return {
        valid: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: `Merchant with ID '${merchantId}' does not exist.`,
      };
    }

    if (merchant.status !== 'active') {
      return {
        valid: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: `Merchant account is not active (current status: '${merchant.status}'). Access denied.`,
      };
    }

    const member = members && members.length > 0 ? members[0] : null;
    if (!member) {
      return {
        valid: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: `User '${userId}' is not a member of merchant '${merchantId}'.`,
      };
    }

    if (member.status !== 'active') {
      return {
        valid: false,
        statusCode: 403,
        error: 'FORBIDDEN',
        message: `Merchant membership is not active (current status: '${member.status}'). Access denied.`,
      };
    }

    return {
      valid: true,
      statusCode: 200,
      role: member.role as MerchantRole,
    };
  }

  /**
   * Deletes a product with distributed concurrency protection.
   * Acquires a PostgreSQL transaction-level advisory lock (pg_advisory_xact_lock)
   * on the product ID before evaluating order history and active inventory.
   * Resolves the M2-04 concurrency race (ADR-004) against concurrent customer orders.
   */
  async deleteProductWithSafetyLock(
    productId: string,
    merchantId: string | undefined, // undefined if Super Admin
    options: {
      query: any;
      productModule: any;
      remoteLink: any;
    }
  ): Promise<{ success: boolean; id: string }> {
    const executeInTransaction = async (em?: any) => {
      if (em && typeof em.execute === 'function') {
        // Acquire PostgreSQL transaction-level advisory lock keyed to the product.
        // Automatically released on COMMIT, ROLLBACK, or connection termination.
        // Compatible with order placement lock protocol on 'product_' + productId.
        await em.execute('SELECT pg_advisory_xact_lock(hashtext(?))', ['product_' + productId]);
      }

      // Fetch product and evaluate ownership and order references
      const { data: products } = await options.query.graph({
        entity: 'product',
        fields: ['id', 'hasOrderHistory', 'activeStockQuantity', 'hasPendingReturns', 'merchant.*'],
        filters: { id: productId },
      });

      const product = products && products.length > 0 ? products[0] : null;
      if (!product) {
        const err: any = new Error(`Product with ID '${productId}' was not found.`);
        err.code = 'PRODUCT_NOT_FOUND';
        err.statusCode = 404;
        throw err;
      }

      // If merchantId is provided, assert ownership
      if (merchantId) {
        const productMerchantId = product.merchant?.id || product.merchant_id;
        const assertion = BackendMarketplaceGuard.assertMerchantProductOwnership(merchantId, productMerchantId);
        if (!assertion.allowed) {
          const err: any = new Error(assertion.message);
          err.code = assertion.error;
          err.statusCode = assertion.statusCode;
          throw err;
        }
      }

      // Verify historical order line items directly from database if em is available
      let hasOrderHistory = Boolean(product.hasOrderHistory);
      if (em && typeof em.execute === 'function') {
        try {
          const orderRows = await em.execute(
            'SELECT id FROM order_line_item WHERE product_id = ? AND deleted_at IS NULL LIMIT 1',
            [productId]
          );
          if (orderRows && orderRows.length > 0) {
            hasOrderHistory = true;
          }
        } catch {
          // If table does not exist or mock query, keep existing hasOrderHistory
        }
      }

      // Evaluate lifecycle safety (historical customer orders, inventory, pending returns)
      const lifecycleCheck = BackendMarketplaceGuard.evaluateProductLifecycleSafety({
        hasOrderHistory,
        activeStockQuantity: product.activeStockQuantity || 0,
        hasPendingReturns: product.hasPendingReturns || false,
      });

      if (!lifecycleCheck.canDelete) {
        const err: any = new Error(lifecycleCheck.reason);
        err.code = 'CONFLICT';
        err.statusCode = 409;
        throw err;
      }

      // Dismiss remote link
      const productMerchantId = product.merchant?.id || product.merchant_id || merchantId;
      if (productMerchantId && options.remoteLink) {
        try {
          await options.remoteLink.dismiss([
            {
              marketplaceModule: { merchant_id: productMerchantId },
              [Modules.PRODUCT]: { product_id: productId },
            },
          ]);
        } catch (linkErr: any) {
          console.warn(`[DELETE PRODUCT] Failed to dismiss link for ${productId}:`, linkErr.message);
        }
      }

      // Delete product in Medusa Product Module
      await options.productModule.deleteProducts([productId]);

      return { success: true, id: productId };
    };

    const manager = (this as any).__container__?.manager;
    if (manager && typeof manager.transactional === 'function') {
      return await manager.transactional(executeInTransaction);
    }

    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'DATABASE_TRANSACTION_UNAVAILABLE: Database manager is required for distributed product deletion lock in production.'
      );
    }

    return await MarketplaceModuleService.withProductLock(productId, () => executeInTransaction());
  }
}
