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
