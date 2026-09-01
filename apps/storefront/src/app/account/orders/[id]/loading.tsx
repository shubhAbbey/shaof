import React from 'react';
import { Container, OrderItemSkeleton, Skeleton } from '../../../../../components/ui';

export default function Loading() {
  return (
    <main className="min-h-[80vh] bg-white py-8">
      <Container size="xl" className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-7 w-48 rounded-md" />
        </div>
        <OrderItemSkeleton />
        <div className="p-6 rounded-2xl border border-gray-100 bg-white space-y-3">
          <Skeleton className="h-6 w-36 rounded-md" />
          <Skeleton className="h-4 w-full rounded-sm" />
          <Skeleton className="h-4 w-2/3 rounded-sm" />
        </div>
      </Container>
    </main>
  );
}
