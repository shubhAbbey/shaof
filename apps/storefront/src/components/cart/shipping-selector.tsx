'use client';

import React from 'react';
import { useCart } from '../../context/cart-context';
import { formatINR, cn } from '../../lib/utils';
import { Truck, Check, AlertCircle, RefreshCw } from 'lucide-react';

export interface ShippingSelectorProps {
  className?: string;
}

export const ShippingSelector: React.FC<ShippingSelectorProps> = ({ className }) => {
  const {
    cart,
    shippingOptions,
    selectedShippingOptionId,
    isLoadingShipping,
    shippingError,
    setShippingMethod,
    fetchShippingOptions,
    clearShippingError,
    isMutating,
  } = useCart();

  const hasAddress = Boolean(cart?.shippingAddress);

  return (
    <div className={cn('bg-white rounded-2xl border border-gray-100 p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-brand-50 text-brand-700 rounded-xl">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">Delivery Method</h3>
            <p className="text-xs text-gray-500">Select your preferred shipping option</p>
          </div>
        </div>

        {hasAddress && (
          <button
            type="button"
            onClick={() => fetchShippingOptions()}
            disabled={isLoadingShipping || isMutating}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium flex items-center space-x-1 disabled:opacity-50"
            title="Refresh delivery rates"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoadingShipping && 'animate-spin')} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {shippingError && (
        <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between text-xs text-red-700">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span>{shippingError}</span>
          </div>
          <button
            type="button"
            onClick={clearShippingError}
            className="text-red-500 hover:text-red-700 font-bold ml-2"
          >
            ✕
          </button>
        </div>
      )}

      {!hasAddress ? (
        <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-center">
          <p className="text-xs text-gray-600 font-medium">
            Please select or add a delivery address above to view eligible shipping options.
          </p>
        </div>
      ) : isLoadingShipping ? (
        <div className="space-y-3">
          <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      ) : shippingOptions.length === 0 ? (
        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
          <p className="text-xs text-amber-800 font-medium">
            No shipping options available for this delivery address. Please verify your pincode or select another address.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {shippingOptions.map((option) => {
            const isSelected = selectedShippingOptionId === option.id;
            const isDisabled = Boolean(option.insufficientInventory) || isMutating;

            return (
              <label
                key={option.id}
                onClick={() => {
                  if (!isDisabled && !isSelected) {
                    setShippingMethod(option.id);
                  }
                }}
                className={cn(
                  'flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none',
                  isSelected
                    ? 'border-brand-600 bg-brand-50/40 ring-1 ring-brand-600 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50/50',
                  isDisabled && 'opacity-60 cursor-not-allowed bg-gray-50 hover:bg-gray-50 border-gray-200'
                )}
              >
                <div className="flex items-center space-x-3.5">
                  <div
                    className={cn(
                      'w-5 h-5 rounded-full border flex items-center justify-center transition-colors',
                      isSelected
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-gray-300 bg-white'
                    )}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold text-gray-900">{option.name}</span>
                      {option.isTaxInclusive && (
                        <span className="text-[10px] bg-gray-100 text-gray-600 font-medium px-1.5 py-0.5 rounded">
                          Tax Incl.
                        </span>
                      )}
                    </div>
                    {option.insufficientInventory ? (
                      <p className="text-xs text-red-600 font-medium mt-0.5">
                        Item unavailable for delivery from this location
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Provider standard delivery
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={cn(
                      'text-sm font-bold',
                      option.amount === 0 ? 'text-emerald-600' : 'text-gray-900'
                    )}
                  >
                    {option.amount === 0 ? 'FREE' : formatINR(option.amount)}
                  </span>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
};
