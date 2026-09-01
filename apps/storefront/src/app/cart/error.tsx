'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../components/ui';

export default function CartError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Cart Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Unable to load your shopping bag"
          message="We encountered an issue loading your cart. Your items are safe in your session."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
