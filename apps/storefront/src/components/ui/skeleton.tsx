import React from 'react';
import { cn } from '../../lib/utils';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  shimmer?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  shimmer = true,
  ...props
}) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative overflow-hidden rounded-md bg-gray-200/80',
        shimmer &&
          'after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer after:bg-gradient-to-r after:from-transparent after:via-white/50 after:to-transparent',
        className
      )}
      {...props}
    />
  );
};
Skeleton.displayName = 'Skeleton';

export const ProductCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('flex flex-col space-y-3', className)} aria-hidden="true">
      {/* Image Skeleton */}
      <Skeleton className="aspect-[3/4] w-full rounded-xl" />
      {/* Brand / Subtitle */}
      <Skeleton className="h-3.5 w-1/3 rounded-sm" />
      {/* Product Title */}
      <Skeleton className="h-4 w-4/5 rounded-sm" />
      {/* Price line */}
      <div className="flex items-center space-x-2 pt-1">
        <Skeleton className="h-4 w-16 rounded-sm" />
        <Skeleton className="h-3.5 w-12 rounded-sm" />
      </div>
    </div>
  );
};
ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export const BannerSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('w-full', className)} aria-hidden="true">
      <Skeleton className="h-48 sm:h-64 md:h-80 lg:h-96 w-full rounded-2xl" />
    </div>
  );
};
BannerSkeleton.displayName = 'BannerSkeleton';

export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className,
}) => {
  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn('h-4 rounded-sm', i === lines - 1 ? 'w-3/5' : 'w-full')}
        />
      ))}
    </div>
  );
};
TextSkeleton.displayName = 'TextSkeleton';

export const PLPSkeleton: React.FC<{ count?: number; className?: string }> = ({
  count = 8,
  className,
}) => {
  return (
    <div className={cn('w-full py-6 space-y-6', className)} aria-hidden="true">
      {/* PLP Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-100 pb-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-sm" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-32 rounded-lg" />
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
PLPSkeleton.displayName = 'PLPSkeleton';

export const PDPSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('w-full py-6 lg:py-10', className)} aria-hidden="true">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Gallery Skeleton (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-3">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
          </div>
        </div>

        {/* Right: Info & CTA Skeleton (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 rounded-sm" />
            <Skeleton className="h-8 w-4/5 rounded-md" />
            <Skeleton className="h-6 w-32 rounded-md" />
          </div>

          <div className="space-y-3 pt-4 border-t border-gray-100">
            <Skeleton className="h-4 w-20 rounded-sm" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-12 rounded-lg" />
              <Skeleton className="h-10 w-12 rounded-lg" />
              <Skeleton className="h-10 w-12 rounded-lg" />
              <Skeleton className="h-10 w-12 rounded-lg" />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          <div className="space-y-4 pt-6 border-t border-gray-100">
            <Skeleton className="h-5 w-36 rounded-sm" />
            <TextSkeleton lines={4} />
          </div>
        </div>
      </div>
    </div>
  );
};
PDPSkeleton.displayName = 'PDPSkeleton';

export const CartSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('w-full py-8', className)} aria-hidden="true">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Cart items list (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <Skeleton className="h-8 w-36 rounded-md mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100 bg-white">
              <Skeleton className="h-24 w-20 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4 rounded-sm" />
                <Skeleton className="h-4 w-1/3 rounded-sm" />
                <Skeleton className="h-5 w-20 rounded-sm pt-2" />
              </div>
            </div>
          ))}
        </div>

        {/* Order summary sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-6 rounded-2xl border border-gray-100 bg-white space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <div className="space-y-2 pt-2">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl pt-2" />
          </div>
        </div>
      </div>
    </div>
  );
};
CartSkeleton.displayName = 'CartSkeleton';

export const CheckoutSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('w-full py-8', className)} aria-hidden="true">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Checkout Steps (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1 */}
          <div className="p-6 rounded-2xl border border-gray-100 bg-white space-y-3">
            <Skeleton className="h-6 w-40 rounded-md" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
          {/* Step 2 */}
          <div className="p-6 rounded-2xl border border-gray-100 bg-white space-y-3">
            <Skeleton className="h-6 w-36 rounded-md" />
            <Skeleton className="h-16 w-full rounded-xl" />
          </div>
          {/* Step 3 */}
          <div className="p-6 rounded-2xl border border-gray-100 bg-white space-y-3">
            <Skeleton className="h-6 w-44 rounded-md" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>

        {/* Order Summary (4 cols) */}
        <div className="lg:col-span-4">
          <div className="p-6 rounded-2xl border border-gray-100 bg-white space-y-4">
            <Skeleton className="h-6 w-32 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};
CheckoutSkeleton.displayName = 'CheckoutSkeleton';

export const OrderItemSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-6 rounded-2xl border border-gray-100 bg-white space-y-4', className)} aria-hidden="true">
      <div className="flex justify-between items-center border-b border-gray-50 pb-3">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <Skeleton className="h-6 w-24 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-20 w-16 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-sm" />
          <Skeleton className="h-3.5 w-1/3 rounded-sm" />
          <Skeleton className="h-4 w-20 rounded-sm" />
        </div>
      </div>
    </div>
  );
};
OrderItemSkeleton.displayName = 'OrderItemSkeleton';

export const AddressCardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('p-5 rounded-xl border border-gray-100 bg-white space-y-3', className)} aria-hidden="true">
      <div className="flex justify-between items-center">
        <Skeleton className="h-5 w-32 rounded-sm" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <Skeleton className="h-4 w-full rounded-sm" />
      <Skeleton className="h-4 w-2/3 rounded-sm" />
      <Skeleton className="h-4 w-1/3 rounded-sm" />
    </div>
  );
};
AddressCardSkeleton.displayName = 'AddressCardSkeleton';

export const AccountSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('w-full py-8 space-y-6', className)} aria-hidden="true">
      {/* Profile Header */}
      <div className="p-6 rounded-2xl border border-gray-100 bg-white flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 rounded-md" />
          <Skeleton className="h-4 w-28 rounded-sm" />
        </div>
      </div>

      {/* Nav Tabs */}
      <div className="flex gap-3 border-b border-gray-100 pb-3">
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>

      {/* Content list */}
      <div className="space-y-4">
        <OrderItemSkeleton />
        <OrderItemSkeleton />
      </div>
    </div>
  );
};
AccountSkeleton.displayName = 'AccountSkeleton';

export const SearchSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('w-full py-6 space-y-6', className)} aria-hidden="true">
      <Skeleton className="h-12 w-full max-w-xl mx-auto rounded-xl" />
      <div className="flex justify-center gap-2">
        <Skeleton className="h-7 w-20 rounded-full" />
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
SearchSkeleton.displayName = 'SearchSkeleton';

export const CMSSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('w-full py-6 space-y-8', className)} aria-hidden="true">
      <BannerSkeleton />
      <div className="max-w-3xl mx-auto space-y-4">
        <Skeleton className="h-8 w-2/3 rounded-md mx-auto" />
        <TextSkeleton lines={6} />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
        <ProductCardSkeleton />
      </div>
    </div>
  );
};
CMSSkeleton.displayName = 'CMSSkeleton';

export const WishlistSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('w-full py-6 space-y-6', className)} aria-hidden="true">
      <div className="flex justify-between items-center border-b border-gray-100 pb-4">
        <Skeleton className="h-8 w-36 rounded-md" />
        <Skeleton className="h-4 w-20 rounded-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
};
WishlistSkeleton.displayName = 'WishlistSkeleton';
