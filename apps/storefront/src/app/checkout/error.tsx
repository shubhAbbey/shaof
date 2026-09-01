'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../components/ui';

export default function CheckoutError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Checkout Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Checkout encountered an issue"
          message="We couldn't load checkout details. Your items and delivery information are preserved."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
