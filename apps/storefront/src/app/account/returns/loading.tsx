import React from 'react';
import { Container, OrderItemSkeleton, Skeleton } from '../../../../components/ui';

export default function Loading() {
  return (
    <main className="min-h-[80vh] bg-white py-8">
      <Container size="xl" className="space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <Skeleton className="h-8 w-44 rounded-md" />
        </div>
        <div className="space-y-4">
          <OrderItemSkeleton />
          <OrderItemSkeleton />
        </div>
      </Container>
    </main>
  );
}
