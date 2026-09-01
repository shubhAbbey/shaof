import React from 'react';
import { Container, Skeleton, TextSkeleton } from '../../../components/ui';

export default function Loading() {
  return (
    <main className="min-h-[80vh] bg-white py-10">
      <Container size="md" className="space-y-6">
        <Skeleton className="h-9 w-64 rounded-md" />
        <Skeleton className="h-4 w-40 rounded-sm" />
        <div className="pt-4 space-y-4">
          <TextSkeleton lines={8} />
          <TextSkeleton lines={6} />
        </div>
      </Container>
    </main>
  );
}
