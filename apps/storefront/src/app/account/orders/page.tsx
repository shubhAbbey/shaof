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
  ChevronRight,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { Container } from '../../../components/ui/container';
import { Button } from '../../../components/ui/button';
import { LoginForm } from '../../../components/auth/login-form';
import { useAuth } from '../../../context/auth-context';
import type { OrderDto } from '@ecom/types';

export default function OrderHistoryPage() {
  const router = useRouter();
  const { customer, isAuthenticated, isLoading: authLoading, openRegister } = useAuth();

  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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

  // 1. Auth Loading State
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
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
                Access your order history, delivery tracking, and returns.
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
                View and manage all your past and active orders.
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
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-xs animate-pulse space-y-4"
                >
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/6" />
                  </div>
                  <div className="h-16 bg-gray-100 rounded-xl" />
                  <div className="flex justify-between items-center pt-2">
                    <div className="h-4 bg-gray-200 rounded w-1/5" />
                    <div className="h-8 bg-gray-200 rounded w-24" />
                  </div>
                </div>
              ))}
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
            <div className="space-y-4">
              {orders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                });

                const isPaid = order.paymentStatus === 'captured';
                const isCod = order.paymentStatus === 'awaiting';
                const hasReturns = Boolean(order.returns && order.returns.length > 0);

                return (
                  <div
                    key={order.id}
                    className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-xs hover:border-brand-200 transition-all space-y-4"
                  >
                    {/* Top Row: Meta info */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100 text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-gray-900 text-sm">
                          {order.id}
                        </span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center gap-2">
                        {/* Payment Badge */}
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : isCod
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {isPaid ? 'Paid' : isCod ? 'COD (Awaiting)' : 'Unpaid'}
                        </span>

                        {/* Fulfillment Badge */}
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                          {order.fulfillmentStatus?.replace(/_/g, ' ') || 'Processing'}
                        </span>

                        {/* Return Badge */}
                        {hasReturns && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold text-[11px] bg-purple-50 text-purple-700 border border-purple-200">
                            Return Requested
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Middle Row: Items preview */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 overflow-x-auto py-1">
                        {order.items.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-2 border border-gray-100 shrink-0"
                          >
                            <div className="h-12 w-12 rounded-lg bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center text-xs text-gray-400 font-bold">
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
                            <div className="text-xs pr-2">
                              <p className="font-semibold text-gray-900 max-w-[140px] truncate">
                                {item.title}
                              </p>
                              <p className="text-gray-500">
                                Qty: {item.quantity} {item.variantTitle ? `• ${item.variantTitle}` : ''}
                              </p>
                            </div>
                          </div>
                        ))}

                        {order.items.length > 3 && (
                          <span className="text-xs font-semibold text-gray-400 pl-1 shrink-0">
                            +{order.items.length - 3} more
                          </span>
                        )}
                      </div>

                      {/* Total Amount & CTA */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0">
                        <div className="text-left sm:text-right">
                          <p className="text-[11px] text-gray-400 font-medium">Total Amount</p>
                          <p className="text-base font-black text-gray-900">
                            ₹{order.summary.total.toLocaleString('en-IN')}
                          </p>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/account/orders/${encodeURIComponent(order.id)}`)}
                          rightIcon={<ChevronRight className="h-4 w-4" />}
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
    </div>
  );
}
