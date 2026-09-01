'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../../components/ui';

export default function CollectionError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Collection Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Unable to load collection"
          message="We encountered an issue loading products for this collection. Please try again."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
