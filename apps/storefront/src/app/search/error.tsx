'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../components/ui';

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Search Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Search encountered an issue"
          message="We couldn't complete your search at this moment. Please try again."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
