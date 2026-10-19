import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  MarketplaceOwnershipGuard,
  type TenantContext,
  type OrderLineItemOwnershipDto,
  type AuthenticatedSessionDto,
  validateGSTIN,
  validatePAN,
  validateIndianPhone,
  validateMerchantHandle,
  validateMerchantProfile,
  validateMerchantStatusTransition,
  validateMemberStatusTransition,
  validateSoleOwnerConstraint,
  type MerchantRole,
  type MerchantMemberStatus,
} from './index.js';


describe('@ecom/types: Marketplace Ownership & Tenant Isolation Matrix', () => {
  describe('1. Tenant Scoping & Product Ownership Assertion', () => {
    it('Super Admin has global cross-merchant access to any product', () => {
      const superAdmin: TenantContext = {
        actorType: 'super_admin',
        userId: 'usr_super_admin_1',
        isSuperAdmin: true,
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(superAdmin, 'merch_virasat_heritage');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('Merchant User can access products belonging to their verified merchant', () => {
      const merchantUser: TenantContext = {
        actorType: 'merchant_user',
        userId: 'usr_seller_1',
        merchantId: 'merch_virasat_heritage',
        role: 'owner',
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(merchantUser, 'merch_virasat_heritage');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: Merchant A is blocked (403 FORBIDDEN) from accessing Merchant B product', () => {
      const merchantA: TenantContext = {
        actorType: 'merchant_user',
        userId: 'usr_seller_a',
        merchantId: 'merch_seller_a',
        role: 'manager',
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(merchantA, 'merch_seller_b');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
      assert.ok(result.message?.includes('Access denied: You do not own this product'));
    });

    it('NEGATIVE: Missing or unverified session is rejected with 401 UNAUTHORIZED', () => {
      const nullSession = null;
      const result = MarketplaceOwnershipGuard.assertProductAccess(nullSession, 'merch_seller_a');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 401);
      assert.equal(result.error, 'UNAUTHORIZED');
    });

    it('NEGATIVE: Merchant user without active merchant membership is rejected with 403 FORBIDDEN', () => {
      const unassignedUser: TenantContext = {
        actorType: 'merchant_user',
        userId: 'usr_unassigned',
        merchantId: '', // unassigned / no active membership
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(unassignedUser, 'merch_seller_a');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });

    it('NEGATIVE: Customer session attempting merchant resource access is rejected with 403 FORBIDDEN', () => {
      const customer: TenantContext = {
        actorType: 'customer',
        userId: 'cus_customer_1',
      };

      const result = MarketplaceOwnershipGuard.assertProductAccess(customer, 'merch_seller_a');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });
  });

  describe('2. Super Admin Mandatory Target Merchant Selection', () => {
    it('passes when Super Admin designates a valid target merchant', () => {
      const result = MarketplaceOwnershipGuard.assertSuperAdminProductTarget('merch_approved_100');
      assert.equal(result.valid, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: rejects product creation if target merchant is empty or missing (blocks unassigned products)', () => {
      const emptyTarget = MarketplaceOwnershipGuard.assertSuperAdminProductTarget('');
      assert.equal(emptyTarget.valid, false);
      assert.equal(emptyTarget.statusCode, 400);
      assert.ok(emptyTarget.error?.includes('TARGET_MERCHANT_REQUIRED'));

      const nullTarget = MarketplaceOwnershipGuard.assertSuperAdminProductTarget(null);
      assert.equal(nullTarget.valid, false);
      assert.equal(nullTarget.statusCode, 400);
    });
  });

  describe('3. Product Lifecycle & Safe Archiving Policy', () => {
    it('blocks hard deletion and enforces archiving when product has historical customer orders', () => {
      const evaluation = MarketplaceOwnershipGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: true,
        activeStockQuantity: 0,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('referenced in historical customer orders'));
    });

    it('blocks hard deletion when product has remaining active inventory stock', () => {
      const evaluation = MarketplaceOwnershipGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 25,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('active stock remains'));
    });

    it('blocks hard deletion when product has pending returns', () => {
      const evaluation = MarketplaceOwnershipGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 0,
        hasPendingReturns: true,
      });

      assert.equal(evaluation.canDelete, false);
      assert.equal(evaluation.canArchive, true);
      assert.ok(evaluation.reason?.includes('active/pending return requests'));
    });

    it('permits deletion only when product has zero orders, zero stock, and zero pending returns', () => {
      const evaluation = MarketplaceOwnershipGuard.evaluateProductLifecycleSafety({
        hasOrderHistory: false,
        activeStockQuantity: 0,
        hasPendingReturns: false,
      });

      assert.equal(evaluation.canDelete, true);
      assert.equal(evaluation.canArchive, true);
    });
  });

  describe('4. Mixed-Merchant Order Line-Item Splitting', () => {
    it('deterministically splits multi-merchant order into isolated merchant fulfillment groups', () => {
      const mixedLineItems: OrderLineItemOwnershipDto[] = [
        {
          lineItemId: 'item_1',
          orderId: 'order_1001',
          merchantId: 'merch_virasat',
          merchantName: 'Virasat Heritage',
          productId: 'prod_saree',
          variantId: 'var_saree_red',
          quantity: 1,
          unitPrice: 2199,
          total: 2199,
          fulfillmentStatus: 'not_fulfilled',
        },
        {
          lineItemId: 'item_2',
          orderId: 'order_1001',
          merchantId: 'merch_loom',
          merchantName: 'Loom & Thread',
          productId: 'prod_shirt',
          variantId: 'var_shirt_m',
          quantity: 2,
          unitPrice: 1399,
          total: 2798,
          fulfillmentStatus: 'not_fulfilled',
        },
        {
          lineItemId: 'item_3',
          orderId: 'order_1001',
          merchantId: 'merch_virasat',
          merchantName: 'Virasat Heritage',
          productId: 'prod_kurta',
          variantId: 'var_kurta_l',
          quantity: 1,
          unitPrice: 1899,
          total: 1899,
          fulfillmentStatus: 'not_fulfilled',
        },
      ];

      const split = MarketplaceOwnershipGuard.splitOrderLinesByMerchant(mixedLineItems);

      assert.equal(split.size, 2);

      const virasatGroup = split.get('merch_virasat');
      assert.ok(virasatGroup);
      assert.equal(virasatGroup.lineItems.length, 2);
      assert.equal(virasatGroup.itemCount, 2);
      assert.equal(virasatGroup.itemSubtotal, 2199 + 1899);

      const loomGroup = split.get('merch_loom');
      assert.ok(loomGroup);
      assert.equal(loomGroup.lineItems.length, 1);
      assert.equal(loomGroup.itemCount, 2);
      assert.equal(loomGroup.itemSubtotal, 2798);

      // Verify complete tenant isolation: Virasat group contains zero items from Loom
      assert.ok(virasatGroup.lineItems.every((i) => i.merchantId === 'merch_virasat'));
      assert.ok(loomGroup.lineItems.every((i) => i.merchantId === 'merch_loom'));
    });
  });

  describe('5. Identity & Security Boundary Isolation Matrix', () => {
    it('Customer session is permitted to access storefront boundary', () => {
      const customerSession: AuthenticatedSessionDto = {
        userId: 'cus_priya_100',
        actorType: 'customer',
        authBoundary: 'store',
        mobile: '+919876543210',
      };

      const result = MarketplaceOwnershipGuard.assertBoundaryAccess(customerSession, 'store');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: Customer session is blocked (403 FORBIDDEN) from accessing merchant boundary', () => {
      const customerSession: AuthenticatedSessionDto = {
        userId: 'cus_priya_100',
        actorType: 'customer',
        authBoundary: 'store',
        mobile: '+919876543210',
      };

      const result = MarketplaceOwnershipGuard.assertBoundaryAccess(customerSession, 'merchant');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
      assert.ok(result.message?.includes('Customer credentials cannot access merchant or admin boundaries'));
    });

    it('NEGATIVE: Customer session is blocked (403 FORBIDDEN) from accessing admin boundary', () => {
      const customerSession: AuthenticatedSessionDto = {
        userId: 'cus_priya_100',
        actorType: 'customer',
        authBoundary: 'store',
      };

      const result = MarketplaceOwnershipGuard.assertBoundaryAccess(customerSession, 'admin');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });

    it('Merchant user session is permitted to access merchant boundary', () => {
      const merchantSession: AuthenticatedSessionDto = {
        userId: 'usr_seller_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        merchantId: 'merch_virasat',
        role: 'owner',
      };

      const result = MarketplaceOwnershipGuard.assertBoundaryAccess(merchantSession, 'merchant');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: Merchant user session is blocked (403 FORBIDDEN) from accessing platform admin boundary', () => {
      const merchantSession: AuthenticatedSessionDto = {
        userId: 'usr_seller_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        merchantId: 'merch_virasat',
        role: 'owner',
      };

      const result = MarketplaceOwnershipGuard.assertBoundaryAccess(merchantSession, 'admin');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
      assert.ok(result.message?.includes('Merchant credentials cannot access platform admin boundary'));
    });

    it('NEGATIVE: Merchant user session is blocked (403 FORBIDDEN) from performing storefront customer mutations directly', () => {
      const merchantSession: AuthenticatedSessionDto = {
        userId: 'usr_seller_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        merchantId: 'merch_virasat',
      };

      const result = MarketplaceOwnershipGuard.assertBoundaryAccess(merchantSession, 'store');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });

    it('Super Admin session is permitted across admin boundary', () => {
      const adminSession: AuthenticatedSessionDto = {
        userId: 'usr_admin_42',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
      };

      const result = MarketplaceOwnershipGuard.assertBoundaryAccess(adminSession, 'admin');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: Missing or null session is rejected with 401 UNAUTHORIZED', () => {
      const result = MarketplaceOwnershipGuard.assertBoundaryAccess(null, 'merchant');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 401);
      assert.equal(result.error, 'UNAUTHORIZED');
    });
  });

  describe('6. Merchant Membership & Account Lifecycle Verification', () => {
    it('approves access when member is active and merchant account is active', () => {
      const result = MarketplaceOwnershipGuard.assertMerchantActiveMembership({
        membershipStatus: 'active',
        merchantStatus: 'active',
      });
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: blocks access (403 FORBIDDEN) when member status is invited (unconfirmed)', () => {
      const result = MarketplaceOwnershipGuard.assertMerchantActiveMembership({
        membershipStatus: 'invited',
        merchantStatus: 'active',
      });
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
      assert.ok(result.message?.includes('Merchant membership is not active'));
    });

    it('NEGATIVE: blocks access (403 FORBIDDEN) when member status is suspended', () => {
      const result = MarketplaceOwnershipGuard.assertMerchantActiveMembership({
        membershipStatus: 'suspended',
        merchantStatus: 'active',
      });
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });

    it('NEGATIVE: blocks access (403 FORBIDDEN) when merchant account is suspended', () => {
      const result = MarketplaceOwnershipGuard.assertMerchantActiveMembership({
        membershipStatus: 'active',
        merchantStatus: 'suspended',
      });
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
      assert.ok(result.message?.includes('Merchant account is not active'));
    });

    it('NEGATIVE: blocks access (403 FORBIDDEN) when merchant account is pending approval or draft', () => {
      const resultDraft = MarketplaceOwnershipGuard.assertMerchantActiveMembership({
        membershipStatus: 'active',
        merchantStatus: 'draft',
      });
      assert.equal(resultDraft.allowed, false);
      assert.equal(resultDraft.statusCode, 403);

      const resultPending = MarketplaceOwnershipGuard.assertMerchantActiveMembership({
        membershipStatus: 'active',
        merchantStatus: 'pending_approval',
      });
      assert.equal(resultPending.allowed, false);
      assert.equal(resultPending.statusCode, 403);
    });
  });

  describe('7. Extensible Permission-Based RBAC & Reviewer Roles', () => {
    it('Super Admin has all permissions globally', () => {
      const adminSession: AuthenticatedSessionDto = {
        userId: 'usr_admin_1',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'super_admin',
      };

      assert.equal(MarketplaceOwnershipGuard.assertPermission(adminSession, 'catalog:moderate').allowed, true);
      assert.equal(MarketplaceOwnershipGuard.assertPermission(adminSession, 'financials:payout').allowed, true);
      assert.equal(MarketplaceOwnershipGuard.assertPermission(adminSession, 'catalog:delete').allowed, true);
    });

    it('Merchant owner has all merchant permissions within their store scope', () => {
      const ownerSession: AuthenticatedSessionDto = {
        userId: 'usr_owner_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'owner',
        merchantId: 'merch_100',
      };

      assert.equal(MarketplaceOwnershipGuard.assertPermission(ownerSession, 'catalog:write').allowed, true);
      assert.equal(MarketplaceOwnershipGuard.assertPermission(ownerSession, 'catalog:delete').allowed, true);
      assert.equal(MarketplaceOwnershipGuard.assertPermission(ownerSession, 'inventory:adjust').allowed, true);
      assert.equal(MarketplaceOwnershipGuard.assertPermission(ownerSession, 'orders:fulfill').allowed, true);
    });

    it('Catalog Reviewer with catalog:moderate permission is approved', () => {
      const reviewerSession: AuthenticatedSessionDto = {
        userId: 'usr_reviewer_1',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'reviewer',
        permissions: ['catalog:read', 'catalog:moderate'],
      };

      const result = MarketplaceOwnershipGuard.assertPermission(reviewerSession, 'catalog:moderate');
      assert.equal(result.allowed, true);
      assert.equal(result.statusCode, 200);
    });

    it('NEGATIVE: Catalog Reviewer attempting financials:payout is rejected (403 FORBIDDEN)', () => {
      const reviewerSession: AuthenticatedSessionDto = {
        userId: 'usr_reviewer_1',
        actorType: 'super_admin',
        authBoundary: 'admin',
        role: 'reviewer',
        permissions: ['catalog:read', 'catalog:moderate'],
      };


      const result = MarketplaceOwnershipGuard.assertPermission(reviewerSession, 'financials:payout');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
      assert.ok(result.message?.includes('Missing required permission [financials:payout]'));
    });

    it('NEGATIVE: Merchant staff without catalog:delete cannot delete products', () => {
      const staffSession: AuthenticatedSessionDto = {
        userId: 'usr_staff_1',
        actorType: 'merchant_user',
        authBoundary: 'merchant',
        role: 'staff',
        merchantId: 'merch_100',
        permissions: ['catalog:read', 'orders:read', 'orders:fulfill'],
      };

      const result = MarketplaceOwnershipGuard.assertPermission(staffSession, 'catalog:delete');
      assert.equal(result.allowed, false);
      assert.equal(result.statusCode, 403);
      assert.equal(result.error, 'FORBIDDEN');
    });
  });

  describe('8. Dual-Transport Token Extraction (React Native & Browser)', () => {
    it('extracts Bearer token from Authorization header for React Native mobile app', () => {
      const headers = { authorization: 'Bearer mobile_jwt_token_999' };
      const extracted = MarketplaceOwnershipGuard.extractAuthToken(headers, null);

      assert.equal(extracted.transport, 'bearer');
      assert.equal(extracted.token, 'mobile_jwt_token_999');
    });

    it('extracts customer session token from Cookie header for web browser', () => {
      const cookieHeader = 'theme=dark; ecom_session_token=browser_sess_token_123; tracking=xyz';
      const extracted = MarketplaceOwnershipGuard.extractAuthToken({}, cookieHeader);

      assert.equal(extracted.transport, 'cookie');
      assert.equal(extracted.token, 'browser_sess_token_123');
    });

    it('extracts merchant session cookie for merchant portal web requests', () => {
      const cookieHeader = 'ecom_merchant_sess=merch_sess_abc';
      const extracted = MarketplaceOwnershipGuard.extractAuthToken({}, cookieHeader);

      assert.equal(extracted.transport, 'cookie');
      assert.equal(extracted.token, 'merch_sess_abc');
    });

    it('extracts admin session cookie for super admin web requests', () => {
      const cookieHeader = 'ecom_admin_sess=admin_sess_xyz';
      const extracted = MarketplaceOwnershipGuard.extractAuthToken({}, cookieHeader);

      assert.equal(extracted.transport, 'cookie');
      assert.equal(extracted.token, 'admin_sess_xyz');
    });

    it('returns null when neither header nor cookie contains an auth token', () => {
      const extracted = MarketplaceOwnershipGuard.extractAuthToken({}, '');
      assert.equal(extracted.transport, null);
      assert.equal(extracted.token, null);
    });
  });

  describe('9. Indian Business Profile & Format Validations (M2-03)', () => {
    it('approves valid Indian GSTIN (15 characters) with normalization and disclaimer', () => {
      // Test lowercase normalization
      const res = validateGSTIN('07aaaaa0000a1z5');
      assert.equal(res.isValid, true);
      assert.equal(res.normalized, '07AAAAA0000A1Z5');
      assert.equal(res.isOfficialVerification, false);
      assert.equal(res.error, undefined);
    });

    it('NEGATIVE: rejects invalid GSTIN format and notes non-official status', () => {
      const badLength = validateGSTIN('07AAAAA0000A1Z'); // 14 chars
      assert.equal(badLength.isValid, false);
      assert.equal(badLength.isOfficialVerification, false);
      assert.ok(badLength.error?.includes('Invalid GSTIN format'));

      const badFormat = validateGSTIN('INVALIDGSTIN1234');
      assert.equal(badFormat.isValid, false);
      assert.equal(badFormat.isOfficialVerification, false);

      const empty = validateGSTIN('');
      assert.equal(empty.isValid, false);
      assert.equal(empty.isOfficialVerification, false);
    });

    it('approves valid Indian PAN (10 characters) with normalization and disclaimer', () => {
      // Test lowercase normalization
      const res = validatePAN('abcde1234f');
      assert.equal(res.isValid, true);
      assert.equal(res.normalized, 'ABCDE1234F');
      assert.equal(res.isOfficialVerification, false);
      assert.equal(res.error, undefined);
    });

    it('NEGATIVE: rejects invalid PAN format and notes non-official status', () => {
      const badLength = validatePAN('ABCDE1234'); // 9 chars
      assert.equal(badLength.isValid, false);
      assert.equal(badLength.isOfficialVerification, false);
      assert.ok(badLength.error?.includes('Invalid PAN format'));

      const digitsFirst = validatePAN('12345ABCDE');
      assert.equal(digitsFirst.isValid, false);
      assert.equal(digitsFirst.isOfficialVerification, false);

      const empty = validatePAN(null);
      assert.equal(empty.isValid, false);
      assert.equal(empty.isOfficialVerification, false);
    });

    it('approves valid normalized Indian phone (+91XXXXXXXXXX)', () => {
      const res = validateIndianPhone('+919876543210');
      assert.equal(res.isValid, true);
    });

    it('NEGATIVE: rejects invalid Indian phone number', () => {
      const noCountryCode = validateIndianPhone('9876543210');
      assert.equal(noCountryCode.isValid, false);
      assert.ok(noCountryCode.error?.includes('E.164 +91'));

      const startsWithZero = validateIndianPhone('+910123456789');
      assert.equal(startsWithZero.isValid, false);

      const wrongLength = validateIndianPhone('+9198765');
      assert.equal(wrongLength.isValid, false);
    });

    it('approves valid merchant URL handle', () => {
      const res = validateMerchantHandle('virasat-heritage-store');
      assert.equal(res.isValid, true);
    });

    it('NEGATIVE: rejects invalid or reserved merchant handles', () => {
      const tooShort = validateMerchantHandle('ab');
      assert.equal(tooShort.isValid, false);
      assert.ok(tooShort.error?.includes('between 3 and 60'));

      const reservedAdmin = validateMerchantHandle('admin');
      assert.equal(reservedAdmin.isValid, false);
      assert.ok(reservedAdmin.error?.includes('reserved'));

      const reservedApi = validateMerchantHandle('api');
      assert.equal(reservedApi.isValid, false);
      assert.ok(reservedApi.error?.includes('reserved'));

      const invalidChars = validateMerchantHandle('Merchant_Store!');
      assert.equal(invalidChars.isValid, false);
    });

    it('validateMerchantProfile validates full create payload and aggregates errors', () => {
      const valid = validateMerchantProfile({
        name: 'Virasat Heritage',
        handle: 'virasat-heritage',
        email: 'contact@virasat.com',
        phone: '+919876543210',
        businessRegistrationNumber: '07AAAAA0000A1Z5',
        taxIdentifier: 'ABCDE1234F',
      }, true);
      assert.equal(valid.isValid, true);
      assert.equal(valid.errors.length, 0);

      const invalid = validateMerchantProfile({
        name: 'A', // too short
        email: 'invalid-email',
        phone: '12345',
        handle: 'admin', // reserved
      }, true);
      assert.equal(invalid.isValid, false);
      assert.ok(invalid.errors.length >= 4);
    });
  });

  describe('10. Merchant Status Lifecycle State Machine (M2-03)', () => {
    it('allows draft to transition to pending_approval on submission', () => {
      const res = validateMerchantStatusTransition('draft', 'pending_approval');
      assert.equal(res.allowed, true);
    });

    it('NEGATIVE: blocks draft from directly activating (skipping verification)', () => {
      const res = validateMerchantStatusTransition('draft', 'active');
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('DIRECT_ACTIVATION_BLOCKED'));
    });

    it('NEGATIVE: blocks draft from being suspended or rejected directly', () => {
      const res = validateMerchantStatusTransition('draft', 'suspended');
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('INVALID_TRANSITION'));
    });

    it('approves pending_approval to active when Super Admin approves and owner exists', () => {
      const res = validateMerchantStatusTransition('pending_approval', 'active', {
        actorType: 'super_admin',
        hasActiveOwner: true,
      });
      assert.equal(res.allowed, true);
    });

    it('NEGATIVE: blocks pending_approval activation if actor is merchant user (cannot self-approve)', () => {
      const res = validateMerchantStatusTransition('pending_approval', 'active', {
        actorType: 'merchant_user',
        hasActiveOwner: true,
      });
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('SUPER_ADMIN_REQUIRED'));
    });

    it('NEGATIVE: blocks pending_approval activation if merchant has no active owner', () => {
      const res = validateMerchantStatusTransition('pending_approval', 'active', {
        actorType: 'super_admin',
        hasActiveOwner: false,
      });
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('OWNER_REQUIRED'));
    });

    it('approves pending_approval rejection with reason by Super Admin', () => {
      const res = validateMerchantStatusTransition('pending_approval', 'rejected', {
        actorType: 'super_admin',
        reason: 'Incomplete GSTIN documentation',
      });
      assert.equal(res.allowed, true);
    });

    it('NEGATIVE: blocks pending_approval rejection if reason is missing', () => {
      const res = validateMerchantStatusTransition('pending_approval', 'rejected', {
        actorType: 'super_admin',
        reason: '',
      });
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('REJECTION_REASON_REQUIRED'));
    });

    it('approves active merchant suspension with reason by Super Admin', () => {
      const res = validateMerchantStatusTransition('active', 'suspended', {
        actorType: 'super_admin',
        reason: 'Policy violation',
      });
      assert.equal(res.allowed, true);
    });

    it('NEGATIVE: blocks active merchant suspension without reason', () => {
      const res = validateMerchantStatusTransition('active', 'suspended', {
        actorType: 'super_admin',
        reason: '',
      });
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('SUSPENSION_REASON_REQUIRED'));
    });

    it('approves suspended merchant reactivation by Super Admin', () => {
      const res = validateMerchantStatusTransition('suspended', 'active', {
        actorType: 'super_admin',
      });
      assert.equal(res.allowed, true);
    });

    it('NEGATIVE: blocks rejected merchant from directly transitioning to active without re-review', () => {
      const res = validateMerchantStatusTransition('rejected', 'active', {
        actorType: 'super_admin',
      });
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('RE_REVIEW_REQUIRED'));
    });

    it('allows rejected merchant to return to draft or pending_approval for rectification', () => {
      const draftRes = validateMerchantStatusTransition('rejected', 'draft');
      assert.equal(draftRes.allowed, true);

      const resubmitRes = validateMerchantStatusTransition('rejected', 'pending_approval');
      assert.equal(resubmitRes.allowed, true);
    });

    it('NEGATIVE: rejects identical state transition (no-op)', () => {
      const res = validateMerchantStatusTransition('active', 'active');
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('NO_OP_TRANSITION'));
    });
  });

  describe('11. Merchant Member Lifecycle & Sole Owner Protection (M2-03)', () => {
    it('allows invited member to transition to active upon accepting invitation', () => {
      const res = validateMemberStatusTransition('invited', 'active');
      assert.equal(res.allowed, true);
    });

    it('NEGATIVE: blocks invited member from directly transitioning to suspended', () => {
      const res = validateMemberStatusTransition('invited', 'suspended');
      assert.equal(res.allowed, false);
      assert.ok(res.error?.includes('INVALID_TRANSITION'));
    });

    it('allows active member to be suspended and suspended member to be reactivated', () => {
      const suspendRes = validateMemberStatusTransition('active', 'suspended');
      assert.equal(suspendRes.allowed, true);

      const reactivateRes = validateMemberStatusTransition('suspended', 'active');
      assert.equal(reactivateRes.allowed, true);
    });

    it('NEGATIVE: blocks demoting sole active owner of merchant', () => {
      const members = [
        { userId: 'usr_owner_1', role: 'owner' as MerchantRole, status: 'active' as MerchantMemberStatus },
        { userId: 'usr_staff_2', role: 'staff' as MerchantRole, status: 'active' as MerchantMemberStatus },
      ];

      const result = validateSoleOwnerConstraint(members, 'usr_owner_1', 'staff');
      assert.equal(result.allowed, false);
      assert.ok(result.error?.includes('SOLE_OWNER_PROTECTION'));
    });

    it('NEGATIVE: blocks suspending sole active owner of merchant', () => {
      const members = [
        { userId: 'usr_owner_1', role: 'owner' as MerchantRole, status: 'active' as MerchantMemberStatus },
      ];

      const result = validateSoleOwnerConstraint(members, 'usr_owner_1', undefined, 'suspended');
      assert.equal(result.allowed, false);
      assert.ok(result.error?.includes('SOLE_OWNER_PROTECTION'));
    });

    it('allows demoting or suspending an owner when another active owner exists', () => {
      const members = [
        { userId: 'usr_owner_1', role: 'owner' as MerchantRole, status: 'active' as MerchantMemberStatus },
        { userId: 'usr_owner_2', role: 'owner' as MerchantRole, status: 'active' as MerchantMemberStatus },
      ];

      const result = validateSoleOwnerConstraint(members, 'usr_owner_1', 'staff');
      assert.equal(result.allowed, true);

      const suspendResult = validateSoleOwnerConstraint(members, 'usr_owner_1', undefined, 'suspended');
      assert.equal(suspendResult.allowed, true);
    });
  });
});


