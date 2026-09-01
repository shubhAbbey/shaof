import React from 'react';
import { Container, WishlistSkeleton } from '../../components/ui';

export default function Loading() {
  return (
    <main className="min-h-[80vh] bg-white">
      <Container size="xl">
        <WishlistSkeleton />
      </Container>
    </main>
  );
}
