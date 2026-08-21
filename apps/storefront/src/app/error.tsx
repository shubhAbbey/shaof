'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../components/ui';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled Storefront Error:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Something went wrong"
          message="An unexpected error occurred while loading this page. Our team has been notified."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
