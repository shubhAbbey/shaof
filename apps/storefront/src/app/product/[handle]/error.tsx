'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../../components/ui';

export default function ProductError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[PDP Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Unable to load product details"
          message="We couldn't load the product information at this moment. Please try again."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
