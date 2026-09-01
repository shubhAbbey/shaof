'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../../components/ui';

export default function BrandError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Brand Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Unable to load brand products"
          message="We encountered an issue loading products for this brand. Please try again."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
