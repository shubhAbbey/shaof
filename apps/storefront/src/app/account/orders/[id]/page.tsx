'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Calendar,
  CreditCard,
  Banknote,
  Truck,
  RotateCcw,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
  X,
} from 'lucide-react';
import { Container } from '../../../../components/ui/container';
import { Button } from '../../../../components/ui/button';
import { LoginForm } from '../../../../components/auth/login-form';
import { useAuth } from '../../../../context/auth-context';
import type { OrderDto, ReturnDto, ReturnRequestPayload, RefundMethod, RefundDetailsDto } from '@ecom/types';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: orderId } = use(params);
  const { customer, isAuthenticated, isLoading: authLoading, openRegister } = useAuth();

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Return modal state
  const [isReturnModalOpen, setIsReturnModalOpen] = useState<boolean>(false);
  const [selectedItems, setSelectedItems] = useState<{ [itemId: string]: { selected: boolean; quantity: number; reason: string } }>({});
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('upi');
  const [refundDetails, setRefundDetails] = useState<RefundDetailsDto>({
    upiId: '',
    accountNumber: '',
    ifscCode: '',
    beneficiaryName: '',
  });
  const [isSubmittingReturn, setIsSubmittingReturn] = useState<boolean>(false);
  const [returnError, setReturnError] = useState<string | null>(null);
  const [returnSuccess, setReturnSuccess] = useState<string | null>(null);

  // Payment retry state
  const [isRetryingPayment, setIsRetryingPayment] = useState<boolean>(false);
  const [retryError, setRetryError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !customer) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadOrder() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/account/orders/${encodeURIComponent(orderId)}`);
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('Order not found or unauthorized.');
          }
          throw new Error('Failed to load order details.');
        }

        const data = await res.json();
        if (isMounted) {
          if (data.success && data.order) {
            setOrder(data.order);
            // Initialize return selection state
            const initialSel: { [itemId: string]: { selected: boolean; quantity: number; reason: string } } = {};
            data.order.items.forEach((i: any) => {
              initialSel[i.id] = { selected: false, quantity: 1, reason: 'Size too small' };
            });
            setSelectedItems(initialSel);
          } else {
            throw new Error(data.message || 'Order not found');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'An error occurred while loading order details.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrder();

    return () => {
      isMounted = false;
    };
  }, [orderId, isAuthenticated, customer, authLoading]);

  // Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
      </div>
    );
  }

  // Unauthenticated State: Show Login
  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 bg-gray-50/50">
        <Container size="sm" className="w-full">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sign In to View Order Details</h1>
            </div>
            <LoginForm
              onSuccess={() => router.refresh()}
              onSwitchToRegister={() => openRegister(`/account/orders/${orderId}`)}
              redirectUrl={`/account/orders/${orderId}`}
            />
          </div>
        </Container>
      </div>
    );
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-[70vh] py-12 bg-gray-50/40">
        <Container size="lg">
          <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="bg-white rounded-2xl p-6 h-64 border border-gray-100" />
            <div className="bg-white rounded-2xl p-6 h-48 border border-gray-100" />
          </div>
        </Container>
      </div>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <div className="min-h-[70vh] py-12 bg-gray-50/40 flex items-center justify-center">
        <Container size="sm">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xs text-center space-y-4 max-w-md mx-auto">
            <AlertCircle className="h-10 w-10 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-gray-900">Unable to View Order</h2>
            <p className="text-xs text-gray-500">{error || 'Order not found.'}</p>
            <Button
              variant="primary"
              size="md"
              onClick={() => router.push('/account/orders')}
              className="font-bold text-xs"
            >
              Back to Order History
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // Calculate return quantities
  const returnedQuantities: { [lineItemId: string]: number } = {};
  (order.returns || []).forEach((ret) => {
    if (ret.status !== 'canceled') {
      ret.items.forEach((item) => {
        returnedQuantities[item.lineItemId] =
          (returnedQuantities[item.lineItemId] || 0) + item.quantity;
      });
    }
  });

  const eligibleItemsToReturn = order.items.filter((item) => {
    const alreadyReturned = returnedQuantities[item.id] || 0;
    return item.quantity > alreadyReturned;
  });

  const canRequestReturn = eligibleItemsToReturn.length > 0;
  const isPaid = order.paymentStatus === 'captured';
  const isCod = order.paymentStatus === 'awaiting';
  const canRetryPayment = !isPaid && !isCod && order.status !== 'completed';

  // Handle Payment Retry
  async function handleRetryPayment() {
    if (!order) return;
    setIsRetryingPayment(true);
    setRetryError(null);

    try {
      const res = await fetch(`/api/account/orders/${encodeURIComponent(orderId)}/retry-payment`, {
        method: 'POST',
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to initiate payment retry');
      }

      // If Razorpay order returned, launch standard Razorpay checkout flow
      if (data.razorpayOrder) {
        const options = {
          key: data.razorpayOrder.keyId,
          amount: data.razorpayOrder.amount,
          currency: data.razorpayOrder.currency,
          name: 'ECOM Fashion Studio',
          description: `Payment for Order #${order.id}`,
          order_id: data.razorpayOrder.id,
          handler: async function (response: any) {
            // Verify payment
            const verifyRes = await fetch('/api/checkout/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              window.location.reload();
            } else {
              setRetryError('Payment verification failed.');
            }
          },
          prefill: {
            name: order.shippingAddress.fullName,
            contact: order.shippingAddress.mobile,
            email: order.email,
          },
          theme: { color: '#0F172A' },
        };

        if (typeof window !== 'undefined' && (window as any).Razorpay) {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          // In test/mock mode without CDN script
          setRetryError('Online payment modal not loaded. Please try again.');
        }
      }
    } catch (err: any) {
      setRetryError(err.message || 'Payment retry failed.');
    } finally {
      setIsRetryingPayment(false);
    }
  }

  // Handle Return Request Submission
  async function handleSubmitReturn(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setIsSubmittingReturn(true);
    setReturnError(null);
    setReturnSuccess(null);

    const itemsToSubmit: Array<{ lineItemId: string; quantity: number; reason: string }> = [];

    Object.entries(selectedItems).forEach(([itemId, state]) => {
      if (state.selected && state.quantity > 0) {
        itemsToSubmit.push({
          lineItemId: itemId,
          quantity: state.quantity,
          reason: state.reason,
        });
      }
    });

    if (itemsToSubmit.length === 0) {
      setReturnError('Please select at least one item to return.');
      setIsSubmittingReturn(false);
      return;
    }

    const payload: ReturnRequestPayload = {
      orderId: order.id,
      items: itemsToSubmit,
      refundMethod: isCod ? refundMethod : 'original',
      refundDetails: isCod ? refundDetails : undefined,
    };

    try {
      const res = await fetch(`/api/account/orders/${encodeURIComponent(order.id)}/returns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || 'Failed to submit return request');
      }

      setReturnSuccess('Return requested successfully! We will schedule a doorstep pickup.');
      if (data.return) {
        setOrder((prev) => (prev ? { ...prev, returns: [...(prev.returns || []), data.return] } : prev));
      }
      setTimeout(() => {
        setIsReturnModalOpen(false);
        setReturnSuccess(null);
      }, 2000);
    } catch (err: any) {
      setReturnError(err.message || 'Return submission failed');
    } finally {
      setIsSubmittingReturn(false);
    }
  }

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-[75vh] py-8 sm:py-12 bg-gray-50/40">
      <Container size="lg">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Bar: Back & Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-brand-600 mb-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Order History</span>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Order #{order.id}
              </h1>
              <p className="text-xs text-gray-500 mt-0.5">Placed on {formattedDate}</p>
            </div>

            {/* Badges & Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full font-bold text-xs ${
                  isPaid
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : isCod
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {isPaid ? 'Payment Captured' : isCod ? 'COD (Pay on Delivery)' : 'Unpaid'}
              </span>

              <span className="inline-flex items-center px-3 py-1 rounded-full font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                {order.fulfillmentStatus?.replace(/_/g, ' ') || 'Processing'}
              </span>
            </div>
          </div>

          {/* Payment Retry Banner (if failed/unpaid) */}
          {canRetryPayment && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 text-xs text-amber-900">
                <p className="font-bold text-sm">Payment Incomplete</p>
                <p>Your payment attempt for this order was not completed. You can safely retry online payment now.</p>
                {retryError && <p className="font-semibold text-red-600">{retryError}</p>}
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={handleRetryPayment}
                isLoading={isRetryingPayment}
                className="font-bold text-xs shrink-0"
              >
                Retry Payment
              </Button>
            </div>
          )}

          {/* Main Grid: Items & Order Info */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Items List & Returns */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Items */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                  <h2 className="text-base font-bold text-gray-900">Purchased Items ({order.items.length})</h2>
                  {canRequestReturn && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsReturnModalOpen(true)}
                      leftIcon={<RotateCcw className="h-3.5 w-3.5 text-brand-600" />}
                      className="text-xs font-bold text-brand-600 border-brand-200 hover:bg-brand-50/50"
                    >
                      Request Return
                    </Button>
                  )}
                </div>

                <div className="divide-y divide-gray-100">
                  {order.items.map((item) => {
                    const alreadyReturned = returnedQuantities[item.id] || 0;
                    const isFullyReturned = alreadyReturned >= item.quantity;

                    return (
                      <div key={item.id} className="py-4 flex items-start gap-4 text-xs">
                        <div className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center font-bold text-gray-400">
                          {item.thumbnail ? (
                            <img src={item.thumbnail} alt={item.title} className="h-full w-full object-cover" />
                          ) : (
                            item.title.charAt(0)
                          )}
                        </div>

                        <div className="flex-1 min-w-0 space-y-1">
                          <h3 className="font-bold text-gray-900 text-sm truncate">{item.title}</h3>
                          <p className="text-gray-500">
                            Variant: {item.variantTitle || 'Standard'} • Qty: {item.quantity}
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <span className="font-bold text-gray-900">
                              ₹{item.unitPrice.toLocaleString('en-IN')} each
                            </span>
                            {alreadyReturned > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10px]">
                                {isFullyReturned ? 'Returned' : `Partially Returned (${alreadyReturned})`}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <p className="text-xs text-gray-400">Subtotal</p>
                          <p className="font-bold text-gray-900 text-sm">
                            ₹{item.total.toLocaleString('en-IN')}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Existing Returns Timeline (if any) */}
              {order.returns && order.returns.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                    <RotateCcw className="h-4 w-4 text-purple-600" />
                    <h2 className="text-base font-bold text-gray-900">Return & Refund Status</h2>
                  </div>

                  <div className="space-y-3">
                    {order.returns.map((ret) => (
                      <div key={ret.id} className="bg-purple-50/50 rounded-xl p-4 border border-purple-100 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-mono font-bold text-purple-900">{ret.id}</span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold capitalize text-[11px]">
                            {ret.status.replace(/_/g, ' ')}
                          </span>
                        </div>

                        <p className="text-gray-600">
                          {ret.items.length} item(s) requested for return • Refund Amount:{' '}
                          <span className="font-bold text-gray-900">₹{ret.refundAmount?.toLocaleString('en-IN')}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right: Summary & Delivery Address */}
            <div className="space-y-6">
              {/* Financial Summary */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-4 text-xs">
                <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                  Payment Summary
                </h2>

                <div className="space-y-2.5">
                  <div className="flex justify-between text-gray-600">
                    <span>Items Subtotal</span>
                    <span>₹{order.summary.itemSubtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {order.summary.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Discount</span>
                      <span>-₹{order.summary.discountTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Shipping Fee</span>
                    <span>
                      {order.summary.shippingTotal === 0
                        ? 'FREE'
                        : `₹${order.summary.shippingTotal.toLocaleString('en-IN')}`}
                    </span>
                  </div>

                  {order.summary.taxTotal > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Estimated Taxes (GST)</span>
                      <span>₹{order.summary.taxTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-900">Total Paid</span>
                    <span className="font-black text-brand-600 text-base">
                      ₹{order.summary.total.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {order.summary.refundedTotal > 0 && (
                    <div className="pt-2 border-t border-purple-100 flex justify-between items-center text-xs text-purple-700 font-bold">
                      <span>Refunded Amount</span>
                      <span>₹{order.summary.refundedTotal.toLocaleString('en-IN')}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Delivery Address */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs space-y-3 text-xs">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                  <MapPin className="h-4 w-4 text-brand-600" />
                  <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
                </div>

                <div className="space-y-1">
                  <p className="font-bold text-gray-900 text-sm">{order.shippingAddress.fullName}</p>
                  <p className="text-gray-600">{order.shippingAddress.mobile}</p>
                  <p className="text-gray-500 pt-1">
                    {order.shippingAddress.addressLine1}
                    {order.shippingAddress.addressLine2 ? `, ${order.shippingAddress.addressLine2}` : ''}
                  </p>
                  <p className="text-gray-500">
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Return Request Modal */}
      {isReturnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5 text-brand-600" />
                <h2 className="text-lg font-bold text-gray-900">Request Item Return</h2>
              </div>
              <button
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitReturn} className="space-y-5">
              {returnError && (
                <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-semibold">
                  {returnError}
                </div>
              )}

              {returnSuccess && (
                <div className="bg-emerald-50 text-emerald-700 p-3 rounded-xl text-xs font-semibold">
                  {returnSuccess}
                </div>
              )}

              {/* Items Selector */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-700">Select Item(s) to Return:</p>
                <div className="space-y-3 divide-y divide-gray-100">
                  {eligibleItemsToReturn.map((item) => {
                    const alreadyReturned = returnedQuantities[item.id] || 0;
                    const maxReturnable = item.quantity - alreadyReturned;
                    const itemState = selectedItems[item.id] || { selected: false, quantity: 1, reason: 'Size too small' };

                    return (
                      <div key={item.id} className="pt-3 space-y-2 text-xs">
                        <label className="flex items-start gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={itemState.selected}
                            onChange={(e) =>
                              setSelectedItems((prev) => ({
                                ...prev,
                                [item.id]: { ...itemState, selected: e.target.checked },
                              }))
                            }
                            className="mt-1 h-4 w-4 rounded text-brand-600 focus:ring-brand-500 border-gray-300"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900">{item.title}</p>
                            <p className="text-gray-500">Max returnable: {maxReturnable}</p>
                          </div>
                          <span className="font-bold text-gray-900">₹{item.unitPrice}</span>
                        </label>

                        {itemState.selected && (
                          <div className="grid grid-cols-2 gap-3 pl-7 pt-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Quantity</label>
                              <select
                                value={itemState.quantity}
                                onChange={(e) =>
                                  setSelectedItems((prev) => ({
                                    ...prev,
                                    [item.id]: { ...itemState, quantity: Number(e.target.value) },
                                  }))
                                }
                                className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:ring-brand-500"
                              >
                                {Array.from({ length: maxReturnable }, (_, idx) => idx + 1).map((qty) => (
                                  <option key={qty} value={qty}>
                                    {qty}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-gray-600 mb-1">Reason</label>
                              <select
                                value={itemState.reason}
                                onChange={(e) =>
                                  setSelectedItems((prev) => ({
                                    ...prev,
                                    [item.id]: { ...itemState, reason: e.target.value },
                                  }))
                                }
                                className="w-full text-xs p-2 rounded-lg border border-gray-200 focus:ring-brand-500"
                              >
                                <option value="Size too small">Size too small</option>
                                <option value="Size too large">Size too large</option>
                                <option value="Damaged / Defective">Damaged / Defective</option>
                                <option value="Quality not as expected">Quality not as expected</option>
                                <option value="Wrong item delivered">Wrong item delivered</option>
                                <option value="Changed mind">Changed mind</option>
                              </select>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COD Refund Method Selector (if COD order) */}
              {isCod && (
                <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-xs border border-gray-200">
                  <p className="font-bold text-gray-900">Select COD Refund Method:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['upi', 'bank_transfer', 'store_credit'] as RefundMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setRefundMethod(method)}
                        className={`p-2.5 rounded-lg border text-center font-bold capitalize transition-all ${
                          refundMethod === method
                            ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-brand-200'
                        }`}
                      >
                        {method.replace(/_/g, ' ')}
                      </button>
                    ))}
                  </div>

                  {refundMethod === 'upi' && (
                    <div className="space-y-1">
                      <label className="font-semibold text-gray-700">UPI ID / VPA</label>
                      <input
                        type="text"
                        placeholder="e.g. username@okhdfcbank"
                        value={refundDetails.upiId}
                        onChange={(e) => setRefundDetails((prev) => ({ ...prev, upiId: e.target.value }))}
                        className="w-full p-2.5 rounded-lg border border-gray-200 text-xs focus:ring-brand-500"
                        required
                      />
                    </div>
                  )}

                  {refundMethod === 'bank_transfer' && (
                    <div className="space-y-2">
                      <div>
                        <label className="font-semibold text-gray-700">Account Number</label>
                        <input
                          type="text"
                          placeholder="Bank Account Number"
                          value={refundDetails.accountNumber}
                          onChange={(e) => setRefundDetails((prev) => ({ ...prev, accountNumber: e.target.value }))}
                          className="w-full p-2 rounded-lg border border-gray-200 text-xs focus:ring-brand-500"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="font-semibold text-gray-700">IFSC Code</label>
                          <input
                            type="text"
                            placeholder="e.g. HDFC0001234"
                            value={refundDetails.ifscCode}
                            onChange={(e) => setRefundDetails((prev) => ({ ...prev, ifscCode: e.target.value }))}
                            className="w-full p-2 rounded-lg border border-gray-200 text-xs uppercase focus:ring-brand-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="font-semibold text-gray-700">Beneficiary Name</label>
                          <input
                            type="text"
                            placeholder="Account Holder Name"
                            value={refundDetails.beneficiaryName}
                            onChange={(e) => setRefundDetails((prev) => ({ ...prev, beneficiaryName: e.target.value }))}
                            className="w-full p-2 rounded-lg border border-gray-200 text-xs focus:ring-brand-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {refundMethod === 'store_credit' && (
                    <p className="text-gray-500 text-[11px]">
                      Store credit will be instantly added to your account upon return verification.
                    </p>
                  )}
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="w-1/2 text-xs font-semibold"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSubmittingReturn}
                  className="w-1/2 text-xs font-bold"
                >
                  Submit Return Request
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
