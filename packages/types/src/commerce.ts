// ==========================================
// 1. Address & Customer Domain
// ==========================================

export type AddressType = 'home' | 'office' | 'other';

export interface AddressDto {
  id?: string;
  customerId?: string;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  countryCode: string; // 'in' default
  addressType: AddressType;
  isDefault?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAddressPayload {
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
  countryCode?: string;
  addressType?: AddressType;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  fullName?: string;
  mobile?: string;
  addressLine1?: string;
  addressLine2?: string;
  landmark?: string;
  city?: string;
  state?: string;
  pincode?: string;
  countryCode?: string;
  addressType?: AddressType;
  isDefault?: boolean;
}

export interface AddressOperationResult {
  success: boolean;
  address?: AddressDto;
  addresses?: AddressDto[];
  message?: string;
  error?: string;
}

export interface CustomerProfileDto {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone: string;
  addresses?: AddressDto[];
}

// ==========================================
// 2. Promotion & Discount Domain
// ==========================================

export type PromotionType = 'standard' | 'buyget';
export type PromotionStatus = 'draft' | 'active' | 'inactive';
export type PromotionApplicationMethodType = 'fixed' | 'percentage';
export type PromotionAllocationType = 'each' | 'across';
export type PromotionRuleOperator = 'eq' | 'ne' | 'in' | 'nin';

export interface PromotionRuleDto {
  id?: string;
  attribute: string;
  operator: PromotionRuleOperator;
  values: string[];
}

export interface PromotionApplicationMethodDto {
  id?: string;
  type: PromotionApplicationMethodType;
  targetType: 'order' | 'items' | 'shipping';
  allocation?: PromotionAllocationType;
  value: number;
  currencyCode?: string;
  maxQuantity?: number;
  targetRules?: PromotionRuleDto[];
  buyRules?: PromotionRuleDto[];
}

export interface PromotionDto {
  id: string;
  code: string;
  type: PromotionType;
  status: PromotionStatus;
  isAutomatic?: boolean;
  applicationMethod?: PromotionApplicationMethodDto;
  rules?: PromotionRuleDto[];
  campaignId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CartAdjustmentDto {
  id: string;
  code: string;
  amount: number;
  promotionId?: string;
  description?: string;
}

// ==========================================
// 3. Shipping & Fulfillment Domain
// ==========================================

export type FulfillmentStatus =
  | 'not_fulfilled'
  | 'partially_fulfilled'
  | 'fulfilled'
  | 'partially_shipped'
  | 'shipped'
  | 'delivered'
  | 'canceled';

export type ShippingOptionPriceType = 'flat' | 'calculated';

export interface ShippingOptionDto {
  id: string;
  name: string;
  priceType: ShippingOptionPriceType;
  amount: number;
  currencyCode?: string;
  serviceZoneId?: string;
  shippingProfileId?: string;
  providerId?: string;
  isTaxInclusive?: boolean;
  insufficientInventory?: boolean;
  data?: Record<string, unknown>;
}

export interface CartShippingMethodDto {
  id: string;
  shippingOptionId?: string;
  name: string;
  amount: number;
  isTaxInclusive?: boolean;
  data?: Record<string, any>;
}

export interface SetShippingMethodPayload {
  optionId: string;
  data?: Record<string, any>;
}

export interface ShippingProfileDto {
  id: string;
  name: string;
  type: 'default' | 'gift_card' | 'custom';
}

export interface FulfillmentItemDto {
  id: string;
  lineItemId: string;
  quantity: number;
  title?: string;
  sku?: string;
}

export interface FulfillmentDto {
  id: string;
  locationId?: string;
  providerId: string;
  shippingOptionId?: string;
  status: FulfillmentStatus;
  trackingNumbers?: string[];
  items: FulfillmentItemDto[];
  data?: Record<string, unknown>;
  shippedAt?: string;
  deliveredAt?: string;
  canceledAt?: string;
}

// ==========================================
// 4. Order & Order Workflow Domain
// ==========================================

export type OrderStatus =
  | 'pending'
  | 'completed'
  | 'draft'
  | 'archived'
  | 'canceled'
  | 'requires_action';

export type OrderPaymentStatus =
  | 'not_paid'
  | 'awaiting'
  | 'authorized'
  | 'partially_authorized'
  | 'captured'
  | 'partially_captured'
  | 'partially_refunded'
  | 'refunded'
  | 'canceled'
  | 'requires_action';

export interface OrderLineItemDto {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  variantId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  compareAtUnitPrice?: number;
  isTaxInclusive?: boolean;
  adjustments?: CartAdjustmentDto[];
  total: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
}

export interface OrderShippingMethodDto {
  id: string;
  name: string;
  amount: number;
  shippingOptionId?: string;
  taxTotal: number;
  adjustments?: CartAdjustmentDto[];
}

export interface OrderSummaryDto {
  total: number;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  shippingTotal: number;
  paidTotal: number;
  refundedTotal: number;
  itemSubtotal: number;
  difference?: number;
}

export interface OrderDto {
  id: string;
  displayId?: number;
  status: OrderStatus;
  paymentStatus: OrderPaymentStatus;
  fulfillmentStatus: FulfillmentStatus;
  customerId: string;
  email: string;
  currencyCode: string;
  shippingAddress: AddressDto;
  billingAddress?: AddressDto;
  items: OrderLineItemDto[];
  shippingMethods: OrderShippingMethodDto[];
  summary: OrderSummaryDto;
  fulfillments?: FulfillmentDto[];
  returns?: ReturnDto[];
  paymentCollections?: PaymentCollectionDto[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. Return & Refund Domain
// ==========================================

export type ReturnStatus =
  | 'requested'
  | 'received'
  | 'partially_received'
  | 'canceled';

export type RefundStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'canceled';

export type RefundMethod =
  | 'original'
  | 'upi'
  | 'bank_transfer'
  | 'store_credit';

export interface ReturnReasonDto {
  id: string;
  value: string;
  label: string;
  description?: string;
}

export interface ReturnItemDto {
  id: string;
  returnId: string;
  lineItemId: string;
  quantity: number;
  receivedQuantity?: number;
  reasonId?: string;
  note?: string;
}

export interface ReturnDto {
  id: string;
  orderId: string;
  status: ReturnStatus;
  refundAmount?: number;
  items: ReturnItemDto[];
  requestedAt?: string;
  receivedAt?: string;
  canceledAt?: string;
  locationId?: string;
}

export interface RefundDetailsDto {
  upiId?: string;
  accountNumber?: string;
  ifscCode?: string;
  beneficiaryName?: string;
}

export interface ReturnRequestPayload {
  orderId: string;
  items: Array<{
    lineItemId: string;
    quantity: number;
    reason: string;
  }>;
  refundMethod?: RefundMethod;
  refundDetails?: RefundDetailsDto;
}

export interface CodRefundPayoutDto {
  id: string;
  orderId: string;
  returnId?: string;
  amount: number;
  currencyCode: string;
  method: 'upi' | 'bank_transfer' | 'store_credit';
  status: RefundStatus;
  details: RefundDetailsDto;
  providerReference?: string;
  idempotencyKey: string;
  errorMessage?: string;
  createdAt: string;
  processedAt?: string;
}

export interface RefundDto {
  id: string;
  paymentId: string;
  orderId?: string;
  amount: number;
  currencyCode: string;
  reason?: string;
  note?: string;
  refundMethod: RefundMethod;
  status: RefundStatus;
  createdAt: string;
}

// ==========================================
// 6. Payment Provider Abstraction Domain
// ==========================================

export type PaymentProviderType = 'system_manual' | 'razorpay' | string;

export type PaymentSessionStatus =
  | 'authorized'
  | 'captured'
  | 'pending'
  | 'requires_more'
  | 'error'
  | 'canceled';

export interface PaymentSessionDto {
  id: string;
  providerId: PaymentProviderType;
  amount: number;
  currencyCode: string;
  status: PaymentSessionStatus;
  data?: Record<string, unknown>;
}

export interface PaymentCollectionDto {
  id: string;
  currencyCode: string;
  amount: number;
  authorizedAmount?: number;
  capturedAmount?: number;
  refundedAmount?: number;
  status: 'not_paid' | 'awaiting' | 'authorized' | 'partially_authorized' | 'completed' | 'canceled';
  paymentSessions?: PaymentSessionDto[];
}

export interface PaymentAuthorizeInput {
  paymentSessionData: Record<string, unknown>;
  context?: Record<string, unknown>;
}

export interface PaymentAuthorizeOutput {
  status: PaymentSessionStatus;
  data: Record<string, unknown>;
}

export interface PaymentCaptureInput {
  paymentData: Record<string, unknown>;
  amount?: number;
}

export interface PaymentCaptureOutput {
  data: Record<string, unknown>;
}

export interface PaymentRefundInput {
  paymentData: Record<string, unknown>;
  amount: number;
  refundReason?: string;
}

export interface PaymentRefundOutput {
  data: Record<string, unknown>;
}

export interface PaymentWebhookPayload {
  event: string;
  data: Record<string, unknown>;
  signature?: string;
}

export interface PaymentWebhookOutput {
  action: 'authorized' | 'captured' | 'failed' | 'not_supported' | 'refunded';
  data?: Record<string, unknown>;
}

/**
 * Standard Payment Provider Abstraction Contract
 * Conforms to Medusa v2 Payment Provider lifecycle
 */
export interface PaymentProviderContract {
  readonly identifier: string;

  initiatePayment(
    input: { amount: number; currencyCode: string; context?: Record<string, unknown> }
  ): Promise<{ id?: string; data: Record<string, unknown>; status: PaymentSessionStatus }>;

  authorizePayment(
    input: PaymentAuthorizeInput
  ): Promise<PaymentAuthorizeOutput>;

  capturePayment(
    input: PaymentCaptureInput
  ): Promise<PaymentCaptureOutput>;

  refundPayment(
    input: PaymentRefundInput
  ): Promise<PaymentRefundOutput>;

  cancelPayment(
    paymentData: Record<string, unknown>
  ): Promise<{ data: Record<string, unknown> }>;

  getWebhookActionAndData?(
    payload: PaymentWebhookPayload
  ): Promise<PaymentWebhookOutput>;
}

// ==========================================
// 6. Guest & Customer Cart Domain (Phase 20)
// ==========================================

export const CART_COOKIE_NAME = 'ecom_cart_id';
export const CART_COOKIE_MAX_AGE = 30 * 24 * 60 * 60; // 30 days in seconds

export interface CartLineItemDto {
  id: string;
  title: string;
  subtitle?: string;
  thumbnail?: string;
  variantId: string;
  variantTitle?: string;
  productId: string;
  productHandle?: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice?: number;
  total: number;
  subtotal: number;
  options?: Record<string, string>;
  inStock?: boolean;
  inventoryQuantity?: number;
}

export interface CartDto {
  id: string;
  items: CartLineItemDto[];
  totalItems: number;
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  currencyCode: string;
  regionId?: string;
  shippingAddress?: AddressDto | null;
  billingAddress?: AddressDto | null;
  shippingMethods?: CartShippingMethodDto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AddToCartPayload {
  variantId: string;
  quantity?: number;
  metadata?: Record<string, any>;
}

export interface UpdateCartItemPayload {
  quantity: number;
}

export interface CartOperationResult {
  success: boolean;
  cart?: CartDto | null;
  error?: string;
  message?: string;
}

export interface CartMergeConflictItem {
  variantId: string;
  title?: string;
  requestedQuantity: number;
  reason: 'INSUFFICIENT_INVENTORY' | 'ERROR';
  message?: string;
}

export interface CartMergeResult {
  success: boolean;
  cart: CartDto | null;
  status: 'merged' | 'transferred' | 'restored' | 'none' | 'conflict';
  conflictItems?: CartMergeConflictItem[];
  message?: string;
}

// ========================================================
// 10. Wishlist Data Models & Types (Phase 22)
// ========================================================

export interface WishlistItemDto {
  id: string;
  customerId: string;
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
  createdAt: string;
}

export interface WishlistDto {
  customerId: string;
  items: WishlistItemDto[];
  itemCount: number;
  updatedAt: string;
}

export interface WishlistOperationResult {
  success: boolean;
  item?: WishlistItemDto;
  wishlist: WishlistDto;
  message?: string;
  error?: string;
}




