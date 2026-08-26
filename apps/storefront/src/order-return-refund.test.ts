import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { OrderService } from './lib/orders/order-service';
import type { OrderDto, ReturnRequestPayload } from '@ecom/types';

describe('Tasks 28-31: Orders, Returns, Prepaid Razorpay Refunds & COD Payouts', () => {
  const customerA = 'cus_test_cust_A';
  const customerB = 'cus_test_cust_B';

  const sampleOrder: OrderDto = {
    id: 'order_test_999',
    displayId: 100999,
    status: 'pending',
    paymentStatus: 'captured',
    fulfillmentStatus: 'fulfilled',
    customerId: customerA,
    email: 'customerA@test.com',
    currencyCode: 'INR',
    summary: {
      total: 3500,
      subtotal: 3500,
      itemSubtotal: 3500,
      taxTotal: 0,
      discountTotal: 0,
      shippingTotal: 0,
      paidTotal: 3500,
      refundedTotal: 0,
    },
    shippingAddress: {
      id: 'addr_1',
      fullName: 'Rahul Sharma',
      mobile: '+919876543210',
      addressLine1: '123 MG Road',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      countryCode: 'in',
      addressType: 'home',
    },
    items: [
      {
        id: 'item_1',
        productId: 'prod_1',
        title: 'Slim Fit Cotton Shirt',
        variantId: 'var_1',
        variantTitle: 'Blue / L',
        quantity: 2,
        unitPrice: 1000,
        subtotal: 2000,
        total: 2000,
        taxTotal: 0,
        discountTotal: 0,
      },
      {
        id: 'item_2',
        productId: 'prod_2',
        title: 'Denim Jeans',
        variantId: 'var_2',
        variantTitle: 'Dark Blue / 32',
        quantity: 1,
        unitPrice: 1500,
        subtotal: 1500,
        total: 1500,
        taxTotal: 0,
        discountTotal: 0,
      },
    ],
    shippingMethods: [
      {
        id: 'sm_1',
        name: 'Standard Delivery',
        amount: 0,
        taxTotal: 0,
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  describe('Task 28: Orders / Confirmation / History / Details & Safe Retry', () => {
    it('saves order and lists orders strictly for the authenticated owner', async () => {
      await OrderService.saveOrder(sampleOrder);

      const ordersA = await OrderService.listCustomerOrders(customerA);
      assert.ok(ordersA.length >= 1);
      assert.equal(ordersA[0].id, sampleOrder.id);
      assert.equal(ordersA[0].customerId, customerA);

      // Customer B cannot see Customer A orders
      const ordersB = await OrderService.listCustomerOrders(customerB);
      assert.equal(ordersB.length, 0);
    });

    it('enforces IDOR protection on getOrderById (Customer B cannot view Customer A order)', async () => {
      const orderA = await OrderService.getOrderById(sampleOrder.id, customerA);
      assert.ok(orderA);
      assert.equal(orderA.id, sampleOrder.id);

      const orderB = await OrderService.getOrderById(sampleOrder.id, customerB);
      assert.equal(orderB, null);
    });

    it('handles payment retry safely: rejects retry on already captured order', async () => {
      const retryResult = await OrderService.retryOrderPayment(sampleOrder.id, customerA);
      assert.equal(retryResult.success, false);
      assert.match(retryResult.error || '', /already paid/i);
    });

    it('allows payment retry on unpaid/failed orders and computes exact balance in paise', async () => {
      const unpaidOrder: OrderDto = {
        ...sampleOrder,
        id: 'order_unpaid_123',
        paymentStatus: 'not_paid',
        status: 'pending',
      };
      await OrderService.saveOrder(unpaidOrder);

      const retryResult = await OrderService.retryOrderPayment(unpaidOrder.id, customerA);
      assert.equal(retryResult.success, true);
      assert.ok(retryResult.razorpayOrder);
      assert.equal(retryResult.razorpayOrder.amount, 350000); // 3500 INR = 350000 paise
      assert.equal(retryResult.razorpayOrder.currency, 'INR');
    });
  });

  describe('Task 29: Customer Returns & Server-Side Eligibility', () => {
    it('accepts eligible return request with valid partial quantity and reason', async () => {
      const payload: ReturnRequestPayload = {
        orderId: sampleOrder.id,
        items: [
          {
            lineItemId: 'item_1',
            quantity: 1, // Ordered 2, returning 1
            reason: 'Size too large',
          },
        ],
      };

      const result = await OrderService.requestOrderReturn(sampleOrder.id, customerA, payload);
      assert.equal(result.success, true);
      assert.ok(result.return);
      assert.equal(result.return.status, 'requested');
      assert.equal(result.refundableAmount, 1000);
      assert.equal(result.return.items[0].quantity, 1);
    });

    it('rejects return request with excessive quantity exceeding remaining returnable balance', async () => {
      const payload: ReturnRequestPayload = {
        orderId: sampleOrder.id,
        items: [
          {
            lineItemId: 'item_1',
            quantity: 2, // Only 1 returnable item remaining!
            reason: 'Changed mind',
          },
        ],
      };

      const result = await OrderService.requestOrderReturn(sampleOrder.id, customerA, payload);
      assert.equal(result.success, false);
      assert.match(result.error || '', /exceeds remaining returnable quantity/i);
    });

    it('rejects return request for item not belonging to order', async () => {
      const payload: ReturnRequestPayload = {
        orderId: sampleOrder.id,
        items: [
          {
            lineItemId: 'fake_item_999',
            quantity: 1,
            reason: 'Damaged / Defective',
          },
        ],
      };

      const result = await OrderService.requestOrderReturn(sampleOrder.id, customerA, payload);
      assert.equal(result.success, false);
      assert.match(result.error || '', /does not belong to this order/i);
    });

    it('enforces distributed concurrency locking on return requests', async () => {
      const lock1 = await OrderService.acquireReturnLock(sampleOrder.id);
      assert.equal(lock1.acquired, true);

      // Concurrent second lock rejected
      const lock2 = await OrderService.acquireReturnLock(sampleOrder.id);
      assert.equal(lock2.acquired, false);

      await OrderService.releaseReturnLock(sampleOrder.id, lock1.lockToken);

      const lock3 = await OrderService.acquireReturnLock(sampleOrder.id);
      assert.equal(lock3.acquired, true);
      await OrderService.releaseReturnLock(sampleOrder.id, lock3.lockToken);
    });
  });

  describe('Task 30: Prepaid Razorpay Refunds', () => {
    it('processes eligible partial prepaid refund and updates order refunded total', async () => {
      const refundResult = await OrderService.processPrepaidRefund(
        sampleOrder.id,
        'ret_123',
        1000,
        customerA
      );

      assert.equal(refundResult.success, true);
      assert.equal(refundResult.amount, 1000);
      assert.ok(refundResult.providerReference);

      // Verify order financial update
      const updatedOrder = await OrderService.getOrderById(sampleOrder.id, customerA);
      assert.equal(updatedOrder?.summary.refundedTotal, 1000);
      assert.equal(updatedOrder?.paymentStatus, 'partially_refunded');
    });

    it('rejects refund amount exceeding maximum remaining refundable balance', async () => {
      // Remaining refundable balance is 3500 - 1000 = 2500
      const refundResult = await OrderService.processPrepaidRefund(
        sampleOrder.id,
        'ret_124',
        3000, // Exceeds 2500!
        customerA
      );

      assert.equal(refundResult.success, false);
      assert.match(refundResult.error || '', /exceeds maximum eligible refundable amount/i);
    });
  });

  describe('Task 31: COD Refund Methods & Payout Abstraction Boundary', () => {
    const codOrder: OrderDto = {
      ...sampleOrder,
      id: 'order_cod_777',
      paymentStatus: 'awaiting',
    };

    it('accepts valid UPI COD refund details and schedules payout without fabricating false bank transfers', async () => {
      await OrderService.saveOrder(codOrder);

      const result = await OrderService.processCodRefund(
        codOrder.id,
        'ret_cod_1',
        'upi',
        { upiId: 'customer@okhdfcbank' },
        1500,
        customerA
      );

      assert.equal(result.success, true);
      assert.equal(result.status, 'pending');
      assert.equal(result.amount, 1500);
      assert.ok(result.providerReference);
      assert.equal(result.payout?.details.upiId, 'customer@okhdfcbank');
    });

    it('redacts sensitive bank account numbers in saved and returned COD payout records', async () => {
      const result = await OrderService.processCodRefund(
        codOrder.id,
        'ret_cod_2',
        'bank_transfer',
        {
          accountNumber: '98765432101234',
          ifscCode: 'HDFC0001234',
          beneficiaryName: 'Rahul Sharma',
        },
        1000,
        customerA
      );

      assert.equal(result.success, true);
      assert.equal(result.status, 'pending');
      assert.equal(result.payout?.details.accountNumber, 'XXXX-XXXX-1234');
      assert.equal(result.payout?.details.ifscCode, 'HDFC0001234');
    });

    it('processes Store Credit COD refund as an explicitly pending store credit request without fake immediate completion', async () => {
      const result = await OrderService.processCodRefund(
        codOrder.id,
        'ret_cod_3',
        'store_credit',
        {},
        1000,
        customerA
      );

      assert.equal(result.success, true);
      assert.equal(result.status, 'pending');
      assert.match(result.providerReference || '', /^STORE_CREDIT_REQ_/);
    });

    it('rejects prepaid Razorpay orders from entering the COD payout flow', async () => {
      const result = await OrderService.processCodRefund(
        sampleOrder.id, // Prepaid order!
        'ret_cod_4',
        'upi',
        { upiId: 'user@paytm' },
        1000,
        customerA
      );

      assert.equal(result.success, false);
      assert.match(result.error || '', /COD payout flow is exclusively reserved/i);
    });

    it('rejects invalid UPI or Bank details strictly', async () => {
      const invalidUpi = await OrderService.processCodRefund(
        codOrder.id,
        'ret_cod_5',
        'upi',
        { upiId: 'invalid-upi-id' },
        500,
        customerA
      );
      assert.equal(invalidUpi.success, false);
      assert.match(invalidUpi.error || '', /valid UPI ID/i);

      const invalidBank = await OrderService.processCodRefund(
        codOrder.id,
        'ret_cod_6',
        'bank_transfer',
        { accountNumber: '123', ifscCode: 'BADIFSC', beneficiaryName: 'A' },
        500,
        customerA
      );
      assert.equal(invalidBank.success, false);
    });
  });
});
