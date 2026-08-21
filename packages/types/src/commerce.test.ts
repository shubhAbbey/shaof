import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  AddressDto,
  PromotionDto,
  ShippingOptionDto,
  OrderDto,
  ReturnDto,
  RefundDto,
  PaymentProviderContract,
  CodRefundPayoutDto,
} from './index.js';

describe('@ecom/types: Commerce Contracts', () => {
  it('instantiates valid commerce domain objects', () => {
    const address: AddressDto = {
      fullName: 'Rahul Sharma',
      mobile: '+919876543210',
      addressLine1: 'Flat 402, Lotus Apartments',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      countryCode: 'in',
      addressType: 'home',
      isDefault: true,
    };
    assert.equal(address.countryCode, 'in');

    const promo: PromotionDto = {
      id: 'promo_diwali',
      code: 'DIWALI50',
      type: 'standard',
      status: 'active',
      applicationMethod: {
        type: 'percentage',
        targetType: 'order',
        value: 50,
      },
    };
    assert.equal(promo.code, 'DIWALI50');

    const codPayout: CodRefundPayoutDto = {
      id: 'payout_1',
      orderId: 'order_1',
      amount: 1500,
      currencyCode: 'INR',
      method: 'upi',
      status: 'pending',
      details: { upiId: 'user@okhdfcbank' },
      idempotencyKey: 'payout_order_1_manual_upi_1500',
      createdAt: new Date().toISOString(),
    };
    assert.equal(codPayout.method, 'upi');
  });
});
