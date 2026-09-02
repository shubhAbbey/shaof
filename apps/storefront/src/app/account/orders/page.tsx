'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Calendar,
  CreditCard,
  Truck,
  RotateCcw,
  RefreshCw,
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Clock,
  Ban,
  CheckCircle2,
  HelpCircle,
  X,
} from 'lucide-react';
import { Container } from '../../../components/ui/container';
import { Button } from '../../../components/ui/button';
import { Dialog } from '../../../components/ui/dialog';
import { AccountSkeleton, OrderItemSkeleton } from '../../../components/ui/skeleton';
import { LoginForm } from '../../../components/auth/login-form';
import { useAuth } from '../../../context/auth-context';
import type { OrderDto } from '@ecom/types';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: authLoading, openRegister } = useAuth();

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<OrderDto | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('Ordered by mistake');
  const [isCanceling, setIsCanceling] = useState<boolean>(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelSuccess, setCancelSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated || !customer) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchOrders() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/account/orders');
        if (!res.ok) {
          throw new Error('Failed to load orders');
        }
        const data = await res.json();
        if (isMounted) {
          if (data.success && Array.isArray(data.orders)) {
            setOrders(data.orders);
          } else {
            setOrders([]);
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Unable to load orders');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchOrders();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, customer, authLoading]);

  // Handle Order Cancellation Submit
  const handleConfirmCancel = async () => {
    if (!cancelModalOrder) return;

    setIsCanceling(true);
    setCancelError(null);
    setCancelSuccess(null);

    try {
      const res = await fetch(`/api/account/orders/${encodeURIComponent(cancelModalOrder.id)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelReason }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Failed to cancel order.');
      }

      setCancelSuccess('Your order has been successfully canceled.');
      
      // Update local order status in list
      setOrders((prev) =>
        prev.map((o) =>
          o.id === cancelModalOrder.id
            ? {
                ...o,
                status: 'canceled',
                paymentStatus:
                  o.paymentStatus === 'not_paid' || o.paymentStatus === 'awaiting' || o.paymentStatus === 'authorized'
                    ? 'canceled'
                    : o.paymentStatus,
              }
            : o
        )
      );

      // Auto-close dialog after short delay
      setTimeout(() => {
        setCancelModalOrder(null);
        setCancelSuccess(null);
      }, 1500);
    } catch (err: any) {
      setCancelError(err.message || 'An error occurred while canceling the order.');
    } finally {
      setIsCanceling(false);
    }
  };

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-[75vh] py-10 bg-gray-50/30">
        <Container size="lg">
          <AccountSkeleton />
        </Container>
      </div>
    );
  }

  // 2. Unauthenticated State: Show Login
  if (!isAuthenticated || !customer) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center py-12 px-4 bg-gray-50/50">
        <Container size="sm" className="w-full">
          <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl border border-gray-100 max-w-md mx-auto">
            <div className="text-center mb-6">
              <div className="h-12 w-12 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
                <Package className="h-6 w-6" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Sign In to View Orders</h1>
              <p className="text-xs text-gray-500 mt-1">
                Access your order history, delivery tracking, cancellations, and returns.
              </p>
            </div>
            <LoginForm
              onSuccess={() => router.refresh()}
              onSwitchToRegister={() => openRegister('/account/orders')}
              redirectUrl="/account/orders"
            />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] py-8 sm:py-12 bg-gray-50/40">
      <Container size="lg">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Order History
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                View and manage all your past and active orders, track status, cancel, return, or exchange.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/account')}
              className="self-start sm:self-auto text-xs font-semibold"
            >
              Back to Account
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-4">
              <OrderItemSkeleton />
              <OrderItemSkeleton />
              <OrderItemSkeleton />
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-red-500 mx-auto" />
              <p className="text-sm font-semibold text-red-800">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && orders.length === 0 && (
            <div className="bg-white rounded-2xl p-10 sm:p-14 border border-gray-100 shadow-xs text-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg font-bold text-gray-900">No Orders Placed Yet</h2>
                <p className="text-xs sm:text-sm text-gray-500 max-w-sm mx-auto">
                  Looks like you haven't placed any orders yet. Discover the latest trends in our catalog!
                </p>
              </div>
              <Button
                variant="primary"
                size="md"
                onClick={() => router.push('/search')}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="font-bold shadow-md"
              >
                Explore Fashion Catalog
              </Button>
            </div>
          )}

          {/* Orders List */}
          {!isLoading && !error && orders.length > 0 && (
            <div className="space-y-6">
              {orders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                const isCanceled = order.status === 'canceled';
                const isPaid = order.paymentStatus === 'captured';
                const isCod = order.paymentStatus === 'awaiting';
                const hasReturns = Boolean(order.returns && order.returns.length > 0);

                const isFulfilledOrShipped =
                  order.fulfillmentStatus === 'fulfilled' ||
                  order.fulfillmentStatus === 'partially_fulfilled' ||
                  order.fulfillmentStatus === 'shipped' ||
                  order.fulfillmentStatus === 'partially_shipped';

                const canCancelOrder = !isCanceled && !isFulfilledOrShipped;
                const canReturnOrExchange = !isCanceled && isFulfilledOrShipped;

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl border border-gray-200/80 shadow-xs hover:border-brand-200 transition-all overflow-hidden"
                  >
                    {/* 1. Order Card Header: ID, Date & Badges */}
                    <div className="bg-gray-50/70 px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className="font-mono font-bold text-gray-900 text-sm">
                          {order.id}
                        </span>
                        <span className="text-gray-300 hidden sm:inline">•</span>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Canceled Badge */}
                        {isCanceled && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-red-100 text-red-800 border border-red-200">
                            <Ban className="h-3 w-3" />
                            Canceled
                          </span>
                        )}

                        {/* Payment Badge */}
                        {!isCanceled && (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : isCod
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {isPaid ? 'Paid' : isCod ? 'COD (Awaiting)' : 'Unpaid'}
                          </span>
                        )}

                        {/* Fulfillment Badge */}
                        {!isCanceled && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                            {order.fulfillmentStatus?.replace(/_/g, ' ') || 'Processing'}
                          </span>
                        )}

                        {/* Return Badge */}
                        {hasReturns && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-purple-50 text-purple-700 border border-purple-200">
                            Return Requested
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 2. Canceled Order Banner */}
                    {isCanceled && (
                      <div className="bg-red-50/60 border-b border-red-100 px-5 sm:px-6 py-2.5 flex items-center gap-2 text-xs font-medium text-red-800">
                        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
                        <span>This order was canceled. Any pre-authorized payment has been voided or queued for refund.</span>
                      </div>
                    )}

                    {/* 3. Items List: Multiple Vertical Rows per Order */}
                    <div className="divide-y divide-gray-100 px-5 sm:px-6">
                      {order.items.map((item) => {
                        const itemUnitPrice = item.unitPrice || (item.total ? Math.round(item.total / item.quantity) : 0);
                        const itemTotalPrice = item.total || (itemUnitPrice * item.quantity);

                        return (
                          <div
                            key={item.id}
                            className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4"
                          >
                            {/* Left: Thumbnail & Details */}
                            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                              <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-xl bg-gray-100 overflow-hidden shrink-0 flex items-center justify-center text-sm text-gray-400 font-bold border border-gray-100">
                                {item.thumbnail ? (
                                  <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  item.title.charAt(0)
                                )}
                              </div>

                              <div className="min-w-0 space-y-1">
                                <h3 className="text-sm font-bold text-gray-900 truncate">
                                  {item.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                                  <span>Qty: <strong className="text-gray-800">{item.quantity}</strong></span>
                                  {item.variantTitle && (
                                    <>
                                      <span>•</span>
                                      <span className="text-gray-600">{item.variantTitle}</span>
                                    </>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400 sm:hidden">
                                  ₹{itemUnitPrice.toLocaleString('en-IN')} each
                                </div>
                              </div>
                            </div>

                            {/* Right: Item Price Calculation */}
                            <div className="text-left sm:text-right shrink-0 pt-1 sm:pt-0 pl-19 sm:pl-0">
                              <p className="text-sm font-black text-gray-900">
                                ₹{itemTotalPrice.toLocaleString('en-IN')}
                              </p>
                              {item.quantity > 1 && (
                                <p className="text-[11px] text-gray-400 hidden sm:block">
                                  ₹{itemUnitPrice.toLocaleString('en-IN')} each
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 4. Order Card Footer: Total Amount & Action Buttons */}
                    <div className="bg-gray-50/50 px-5 sm:px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Left: Total Order Price */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">Total ({order.items.reduce((acc, i) => acc + i.quantity, 0)} items):</span>
                        <span className="text-base font-black text-gray-900">
                          ₹{order.summary.total.toLocaleString('en-IN')}
                        </span>
                      </div>

                      {/* Right: Common Action Buttons (View Details, Cancel, Return, Exchange) */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Cancel Order Button */}
                        {canCancelOrder && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setCancelModalOrder(order);
                              setCancelReason('Ordered by mistake');
                              setCancelError(null);
                              setCancelSuccess(null);
                            }}
                            className="text-xs font-bold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                          >
                            <Ban className="h-3.5 w-3.5 mr-1" />
                            Cancel Order
                          </Button>
                        )}

                        {/* Return Button */}
                        {canReturnOrExchange && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/account/orders/${encodeURIComponent(order.id)}?action=return`)}
                            className="text-xs font-bold text-gray-700 hover:border-gray-400"
                          >
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            Return
                          </Button>
                        )}

                        {/* Exchange Button */}
                        {canReturnOrExchange && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/account/orders/${encodeURIComponent(order.id)}?action=exchange`)}
                            className="text-xs font-bold text-gray-700 hover:border-gray-400"
                          >
                            <RefreshCw className="h-3.5 w-3.5 mr-1" />
                            Exchange
                          </Button>
                        )}

                        {/* View Details Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/account/orders/${encodeURIComponent(order.id)}`)}
                          rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
                          className="font-bold text-xs hover:border-brand-600 hover:text-brand-600"
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </Container>

      {/* 5. Cancel Order Confirmation Dialog */}
      <Dialog
        isOpen={Boolean(cancelModalOrder)}
        onClose={() => {
          if (!isCanceling) {
            setCancelModalOrder(null);
            setCancelError(null);
            setCancelSuccess(null);
          }
        }}
        title="Cancel Order Confirmation"
        description={`Order #${cancelModalOrder?.id}`}
        size="md"
      >
        <div className="space-y-4 pt-2">
          {cancelError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{cancelError}</span>
            </div>
          )}

          {cancelSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-700 font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <span>{cancelSuccess}</span>
            </div>
          )}

          {!cancelSuccess && (
            <>
              <p className="text-xs text-gray-600">
                Are you sure you want to cancel this order? Once canceled, items will be restocked and cannot be reversed.
              </p>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Reason for Cancellation
                </label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  disabled={isCanceling}
                  className="w-full text-xs rounded-xl border border-gray-200 px-3 py-2 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 disabled:bg-gray-100"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price elsewhere">Found a better price elsewhere</option>
                  <option value="Change of delivery address">Change of delivery address</option>
                  <option value="Need different size/variant">Need different size or variant</option>
                  <option value="Delayed delivery estimation">Delayed delivery estimation</option>
                  <option value="Other reason">Other reason</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Prepaid & COD Refund Notice
                </p>
                <p>
                  If you made an online payment, the refund will be credited back to your original payment method. For COD orders, no payment was collected.
                </p>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              disabled={isCanceling}
              onClick={() => {
                setCancelModalOrder(null);
                setCancelError(null);
                setCancelSuccess(null);
              }}
              className="text-xs font-semibold"
            >
              Close
            </Button>
            {!cancelSuccess && (
              <Button
                variant="primary"
                size="sm"
                isLoading={isCanceling}
                onClick={handleConfirmCancel}
                className="text-xs font-bold bg-red-600 hover:bg-red-700 text-white border-transparent"
              >
                Confirm Cancellation
              </Button>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
}
