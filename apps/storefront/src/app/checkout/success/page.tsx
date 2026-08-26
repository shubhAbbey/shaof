'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Banknote,
  ShoppingBag,
} from 'lucide-react';
import { Container } from '../../../components/ui/container';
import { Button } from '../../../components/ui/button';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || 'ORD-' + Math.floor(100000 + Math.random() * 900000);
  const paymentMethod = searchParams.get('method') || 'razorpay';

  const isCod = paymentMethod === 'cod';

  return (
    <div className="min-h-[75vh] py-12 sm:py-16 bg-gray-50/40 flex items-center justify-center">
      <Container size="md">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xs border border-gray-100 text-center space-y-6 max-w-lg mx-auto">
          {/* Success Icon */}
          <div className="h-20 w-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
            <CheckCircle2 className="h-10 w-10 stroke-[2]" />
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Order Confirmed!
            </h1>
            <p className="text-sm text-gray-500">
              Thank you for shopping with us. We have received your order and started preparing it for shipment.
            </p>
          </div>

          {/* Order Details Badge */}
          <div className="bg-gray-50 rounded-2xl p-4 sm:p-5 border border-gray-100 space-y-3 text-left">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-500">Order Reference:</span>
              <span data-testid="confirmed-order-id" className="font-bold text-gray-900 font-mono">
                {orderId}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-500">Payment Status:</span>
              <div className="flex items-center gap-1.5 font-bold">
                {isCod ? (
                  <>
                    <Banknote className="h-4 w-4 text-amber-600" />
                    <span className="text-amber-700">Cash on Delivery (Pay at Doorstep)</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 text-emerald-600" />
                    <span className="text-emerald-700">Paid Online (Razorpay Verified)</span>
                  </>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-gray-500">Estimated Delivery:</span>
              <span className="font-bold text-gray-900">3 - 5 Business Days</span>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-left">
            <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <Truck className="h-4 w-4 text-brand-600 shrink-0" />
              <div className="text-[11px]">
                <p className="font-bold text-gray-900">Standard Delivery</p>
                <p className="text-gray-500">Tracked dispatch</p>
              </div>
            </div>

            <div className="bg-white p-3 rounded-xl border border-gray-100 flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-brand-600 shrink-0" />
              <div className="text-[11px]">
                <p className="font-bold text-gray-900">7-Day Returns</p>
                <p className="text-gray-500">Hassle-free pickup</p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.location.href = '/'}
              className="w-full font-bold shadow-md"
              rightIcon={<ArrowRight className="h-4 w-4" />}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
}
