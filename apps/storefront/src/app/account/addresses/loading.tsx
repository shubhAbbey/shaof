import React from 'react';
import { Container, AddressCardSkeleton, Skeleton } from '../../../components/ui';

export default function Loading() {
  return (
    <main className="min-h-[80vh] bg-white py-8">
      <Container size="xl" className="space-y-6">
        <div className="flex justify-between items-center border-b border-gray-100 pb-4">
          <Skeleton className="h-8 w-44 rounded-md" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <AddressCardSkeleton />
          <AddressCardSkeleton />
        </div>
      </Container>
    </main>
  );
}
