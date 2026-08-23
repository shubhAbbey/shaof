import React from 'react';
import { Container } from '../../../components/ui/container';
import { Skeleton } from '../../../components/ui/skeleton';

export default function PdpLoading() {
  return (
    <div className="min-h-screen bg-white pb-16">
      {/* Breadcrumb Skeleton */}
      <div className="border-b border-gray-100 bg-gray-50/50 py-3">
        <Container size="xl">
          <Skeleton className="h-4 w-64" />
        </Container>
      </div>

      {/* Main Grid Skeleton */}
      <Container size="xl" className="pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Gallery Skeleton (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
            <div className="flex gap-2">
              <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg" />
              <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg" />
              <Skeleton className="h-16 w-16 sm:h-20 sm:w-20 rounded-lg" />
            </div>
          </div>

          {/* Buy Box Skeleton (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-8 w-40" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-9 w-16 rounded-lg" />
              <Skeleton className="h-9 w-16 rounded-lg" />
              <Skeleton className="h-9 w-16 rounded-lg" />
            </div>
            <div className="flex gap-3 pt-4">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 w-12 rounded-xl" />
            </div>
            <Skeleton className="h-28 w-full rounded-xl mt-4" />
          </div>
        </div>
      </Container>
    </div>
  );
}
