import React from 'react';
import { Container } from '../../../components/ui/container';
import { ProductCardSkeleton, Skeleton } from '../../../components/ui/skeleton';

export default function CollectionPlpLoading() {
  return (
    <div className="w-full bg-white pb-16 pt-4 sm:pt-6">
      <Container size="xl">
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-3.5 w-3.5" />
          <Skeleton className="h-3.5 w-32" />
        </div>

        {/* Header Skeleton */}
        <div className="mb-6 border-b border-gray-100 pb-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-8 w-56 sm:w-80 rounded-md" />
              <Skeleton className="h-4 w-72 sm:w-96 rounded-md" />
            </div>
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </Container>
    </div>
  );
}
