'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Container } from '../../components/ui/container';
import { Button } from '../../components/ui/button';
import { useCart } from '../../context/cart-context';
import { formatINR } from '../../lib/utils';

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    itemCount,
    subtotal,
    total,
    isLoading,
    isMutating,
    error,
    updateQuantity,
    removeItem,
    clearError,
  } = useCart();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const isEmpty = !cart || cart.items.length === 0;

  if (isLoading) {
    return (
      <div className="min-h-[70vh] py-12 bg-gray-50/30">
        <Container size="xl">
          <div className="space-y-8">
            <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-8 space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-2xl p-6 border border-gray-100 animate-pulse" />
                ))}
              </div>
              <div className="lg:col-span-4 h-64 bg-white rounded-2xl p-6 border border-gray-100 animate-pulse" />
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="min-h-[75vh] py-16 flex items-center justify-center bg-gray-50/20">
        <Container size="md">
          <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xs border border-gray-100 text-center space-y-6 max-w-lg mx-auto">
            <div className="h-24 w-24 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center mx-auto shadow-inner">
              <ShoppingBag className="h-12 w-12 stroke-[1.5]" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-gray-900">Your Shopping Bag is Empty</h1>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Looks like you haven&apos;t added anything to your bag yet. Discover our curated styles and find something you love.
              </p>

            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => router.push('/category/women')}
                className="w-full sm:w-auto"
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                Explore Women Edit
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() => router.push('/sale')}
                className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:border-red-200"
              >
                View Flash Deals
              </Button>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] py-10 bg-gray-50/30">
      <Container size="xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900">
                Shopping Bag <span className="text-brand-600 font-bold text-xl sm:text-2xl">({itemCount} items)</span>
              </h1>
              <p className="text-xs text-gray-500 mt-1">Review your items and proceed to secure checkout</p>
            </div>

            <Link
              href="/"
              className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline flex items-center gap-1"
            >
              Continue Shopping &rarr;
            </Link>
          </div>

          {error && (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-800 border border-red-100 text-sm">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <span className="flex-1 font-medium">{error}</span>
              <button
                type="button"
                onClick={clearError}
                className="text-xs font-bold uppercase tracking-wider text-red-700 hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Items List (Left Column) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-2xl shadow-xs border border-gray-100 divide-y divide-gray-100 overflow-hidden">
                {cart.items.map((item) => {
                  const hasOptions = item.options && Object.keys(item.options).length > 0;
                  const optionsText = hasOptions
                    ? Object.entries(item.options!)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' | ')
                    : item.variantTitle || '';

                  return (
                    <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                      {/* Product Thumbnail */}
                      <div className="relative h-28 w-24 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                        {item.thumbnail ? (
                          <Image
                            src={item.thumbnail}
                            alt={item.title}
                            fill
                            sizes="96px"
                            className="object-cover object-center"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <ShoppingBag className="h-8 w-8" />
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-1.5 w-full">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            {item.productHandle ? (
                              <Link
                                href={`/product/${item.productHandle}`}
                                className="text-base font-bold text-gray-900 hover:text-brand-600 transition-colors line-clamp-1"
                              >
                                {item.title}
                              </Link>
                            ) : (
                              <h3 className="text-base font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                            )}
                            {optionsText && (
                              <p className="text-xs text-gray-500 font-medium">{optionsText}</p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            disabled={isMutating}
                            aria-label={`Remove ${item.title} from bag`}
                            className="text-gray-400 hover:text-red-600 p-1.5 transition-colors rounded-lg hover:bg-red-50 shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Price & Quantity Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                          <div className="flex items-center border border-gray-200 rounded-xl bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={isMutating}
                              aria-label="Decrease quantity"
                              className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="px-3 text-sm font-bold text-gray-900 min-w-[28px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={isMutating}
                              aria-label="Increase quantity"
                              className="p-2 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-base sm:text-lg font-black text-gray-900">
                              {formatINR(item.total)}
                            </span>
                            {item.quantity > 1 && (
                              <p className="text-xs text-gray-400 font-medium">({formatINR(item.unitPrice)} each)</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Service Commitments */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <Truck className="h-5 w-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Free Delivery</p>
                    <p className="text-[11px] text-gray-500">On all prepaid orders over ₹999</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <RotateCcw className="h-5 w-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">7-Day Returns</p>
                    <p className="text-[11px] text-gray-500">Hassle-free instant pickups</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-brand-600 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">100% Authentic</p>
                    <p className="text-[11px] text-gray-500">Direct from artisan weavers</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary (Right Column) */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-2xl p-6 shadow-xs border border-gray-100 space-y-5 sticky top-24">
                <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">Order Summary</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Bag Total ({itemCount} items)</span>
                    <span className="font-semibold text-gray-900">{formatINR(subtotal)}</span>
                  </div>

                  {cart.discountTotal > 0 && (
                    <div className="flex justify-between text-emerald-600 font-medium">
                      <span>Bag Discount</span>
                      <span>-{formatINR(cart.discountTotal)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Estimated Shipping</span>
                    <span className="text-emerald-600 font-semibold">
                      {cart.shippingTotal > 0 ? formatINR(cart.shippingTotal) : 'FREE'}
                    </span>
                  </div>

                  {cart.taxTotal > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>Estimated Tax (GST)</span>
                      <span className="font-semibold text-gray-900">{formatINR(cart.taxTotal)}</span>
                    </div>
                  )}

                  <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                    <span className="text-base font-bold text-gray-900">Total Payable</span>
                    <div className="text-right">
                      <span className="text-xl font-black text-brand-600">{formatINR(total)}</span>
                      <p className="text-[10px] text-gray-400">Inclusive of all taxes</p>
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={isMutating}
                  rightIcon={<ArrowRight className="h-5 w-5" />}
                  className="w-full shadow-md text-base py-3.5"
                >
                  Proceed to Checkout
                </Button>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 pt-1">
                  <ShieldCheck className="h-4 w-4 text-gray-400" />
                  <span>256-Bit SSL Encrypted Checkout</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
