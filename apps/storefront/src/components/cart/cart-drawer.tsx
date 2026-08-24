'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { Drawer } from '../ui/drawer';
import { Button } from '../ui/button';
import { useUi } from '../../providers/ui-provider';
import { useCart } from '../../context/cart-context';
import { formatINR } from '../../lib/utils';

export const CartDrawer: React.FC = () => {
  const router = useRouter();
  const { isCartDrawerOpen, closeCartDrawer } = useUi();
  const { cart, itemCount, subtotal, total, isLoading, isMutating, error, updateQuantity, removeItem, clearError } = useCart();

  const handleCheckout = () => {
    closeCartDrawer();
    router.push('/checkout');
  };

  const handleViewBag = () => {
    closeCartDrawer();
    router.push('/cart');
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <Drawer
      isOpen={isCartDrawerOpen}
      onClose={closeCartDrawer}
      position="right"
      size="md"
      showCloseButton
      title={
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-brand-600" />
          <span className="font-bold text-gray-900">
            Shopping Bag {itemCount > 0 && <span className="text-sm font-normal text-gray-500">({itemCount} items)</span>}
          </span>
        </div>
      }
      footer={
        !isEmpty ? (
          <div className="space-y-3 pt-2 border-t border-gray-100">
            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 text-red-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span className="flex-1">{error}</span>
                <button type="button" onClick={clearError} className="font-bold text-red-800 hover:underline">
                  &times;
                </button>
              </div>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatINR(subtotal)}</span>
              </div>
              {cart.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount</span>
                  <span>-{formatINR(cart.discountTotal)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-1 border-t border-gray-100">
                <span>Total Amount</span>
                <span className="text-brand-600">{formatINR(total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button variant="outline" size="md" onClick={handleViewBag} className="w-full">
                View Bag
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCheckout}
                disabled={isMutating}
                rightIcon={<ArrowRight className="h-4 w-4" />}
                className="w-full shadow-sm"
              >
                Checkout
              </Button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-1">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-600" />
              <span>Safe & Secure Checkout | 100% Authentic</span>
            </div>
          </div>
        ) : undefined
      }
    >
      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-600 border-t-transparent" />
          <p className="text-xs text-gray-400 font-medium">Loading your bag...</p>
        </div>
      ) : isEmpty ? (
        <div className="py-16 px-4 flex flex-col items-center justify-center text-center space-y-4">
          <div className="h-20 w-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600">
            <ShoppingBag className="h-10 w-10 stroke-[1.5]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-gray-900">Your shopping bag is empty</h3>
            <p className="text-xs text-gray-500 max-w-xs">
              Explore our curated fashion collections and discover timeless handpicked styles.
            </p>
          </div>
          <Button
            variant="primary"
            size="md"
            onClick={() => {
              closeCartDrawer();
              router.push('/category/women');
            }}
            className="mt-2"
          >
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 -mx-6 px-6">
          {cart.items.map((item) => {
            const hasOptions = item.options && Object.keys(item.options).length > 0;
            const optionsText = hasOptions
              ? Object.entries(item.options!)
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(' | ')
              : item.variantTitle || '';

            return (
              <div key={item.id} className="py-4 flex gap-4 items-start group">
                <div className="relative h-20 w-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-100">
                  {item.thumbnail ? (
                    <Image
                      src={item.thumbnail}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingBag className="h-6 w-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      {item.productHandle ? (
                        <Link
                          href={`/product/${item.productHandle}`}
                          onClick={closeCartDrawer}
                          className="text-sm font-semibold text-gray-900 hover:text-brand-600 transition-colors line-clamp-1"
                        >
                          {item.title}
                        </Link>
                      ) : (
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{item.title}</h4>
                      )}
                      {optionsText && (
                        <p className="text-xs text-gray-500 font-medium truncate">{optionsText}</p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={isMutating}
                      aria-label={`Remove ${item.title} from bag`}
                      className="text-gray-400 hover:text-red-600 p-1 transition-colors rounded"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white shadow-2xs">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={isMutating}
                        aria-label="Decrease quantity"
                        className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        disabled={isMutating}
                        aria-label="Increase quantity"
                        className="p-1.5 text-gray-500 hover:text-gray-900 disabled:opacity-40"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-900">{formatINR(item.total)}</p>
                      {item.quantity > 1 && (
                        <p className="text-[10px] text-gray-400 font-medium">({formatINR(item.unitPrice)} each)</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Drawer>
  );
};
