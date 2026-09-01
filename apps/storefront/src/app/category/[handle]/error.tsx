'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../../components/ui';

export default function CategoryError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Category Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Unable to load category"
          message="We encountered an issue loading products for this category. Please try again."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
