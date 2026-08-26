'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  ShoppingBag,
  Clock,
  MapPin,
  ChevronRight,
  Receipt,
} from 'lucide-react';
import { Container } from '../../../components/ui/container';
import { Button } from '../../../components/ui/button';
import type { OrderDto } from '@ecom/types';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId') || '';
  const paymentMethod = searchParams.get('method') || 'razorpay';
  const isCod = paymentMethod === 'cod';

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(orderId));

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    async function loadOrder() {
      try {
        const res = await fetch(`/api/account/orders/${encodeURIComponent(orderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && data.order) {
            setOrder(data.order);
          }
        }
      } catch {
        // Non-blocking fallback
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadOrder();
    return () => {
      isMounted = false;
    };
  }, [orderId]);

  const displayOrderId = order?.id || orderId || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const formattedDate = order?.createdAt
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  return (
    <div className="min-h-[80vh] py-10 sm:py-16 bg-gray-50/50">
      <Container size="md">
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xs border border-gray-100 space-y-6 max-w-xl mx-auto">
          {/* Success Banner */}
          <div className="text-center space-y-3">
            <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 stroke-[2]" />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
                Order Confirmed!
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
                Thank you for your purchase. We have received your order and our team has started processing it.
              </p>
            </div>
          </div>

          {/* Authoritative Order Summary Card */}
          <div className="bg-gray-50/80 rounded-2xl p-5 border border-gray-100 space-y-3.5 text-xs sm:text-sm">
            <div className="flex justify-between items-center pb-2.5 border-b border-gray-200/60">
              <span className="font-semibold text-gray-500">Order Number:</span>
              <span data-testid="confirmed-order-id" className="font-mono font-bold text-gray-900">
                {displayOrderId}
              </span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-gray-200/60">
              <span className="font-semibold text-gray-500">Order Date:</span>
              <span className="font-semibold text-gray-900">{formattedDate}</span>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-gray-200/60">
              <span className="font-semibold text-gray-500">Payment Method:</span>
              <div className="flex items-center gap-1.5 font-bold">
                {isCod ? (
                  <>
                    <Banknote className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700">Cash on Delivery</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700">Paid Online (Razorpay)</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pb-2.5 border-b border-gray-200/60">
              <span className="font-semibold text-gray-500">Payment Status:</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                  isCod
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {isCod ? 'Awaiting Payment' : 'Captured / Paid'}
              </span>
            </div>

            {order?.summary && (
              <div className="flex justify-between items-center pb-2.5 border-b border-gray-200/60">
                <span className="font-semibold text-gray-500">Total Amount:</span>
                <span className="font-black text-brand-600 text-base">
                  ₹{order.summary.total.toLocaleString('en-IN')}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-500">Fulfillment Status:</span>
              <span className="font-bold text-gray-800 capitalize">
                {order?.fulfillmentStatus?.replace(/_/g, ' ') || 'Processing'}
              </span>
            </div>
          </div>

          {/* Delivery Address Snapshot */}
          {order?.shippingAddress && (
            <div className="bg-white p-4 rounded-xl border border-gray-100 space-y-1.5 text-xs text-left">
              <div className="flex items-center gap-1.5 font-bold text-gray-900">
                <MapPin className="h-3.5 w-3.5 text-brand-600" />
                <span>Delivery Address</span>
              </div>
              <p className="text-gray-700 font-medium">
                {order.shippingAddress.fullName} • {order.shippingAddress.mobile}
              </p>
              <p className="text-gray-500">
                {order.shippingAddress.addressLine1}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
              </p>
            </div>
          )}

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-brand-600 shrink-0" />
              <div className="text-[11px]">
                <p className="font-bold text-gray-900">Standard Delivery</p>
                <p className="text-gray-500">Dispatch in 24-48 hrs</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
              <div className="text-[11px]">
                <p className="font-bold text-gray-900">Easy Returns</p>
                <p className="text-gray-500">7-day pickup policy</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 space-y-2.5">
            {orderId && (
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push(`/account/orders/${encodeURIComponent(orderId)}`)}
                className="w-full font-bold shadow-md"
                rightIcon={<ArrowRight className="h-4 w-4" />}
              >
                View Order Details
              </Button>
            )}

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                size="md"
                onClick={() => router.push('/account/orders')}
                leftIcon={<Package className="h-4 w-4" />}
                className="w-full text-xs font-bold"
              >
                My Orders
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => router.push('/')}
                leftIcon={<ShoppingBag className="h-4 w-4" />}
                className="w-full text-xs font-bold"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
