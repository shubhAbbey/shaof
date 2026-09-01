'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../components/ui';

export default function AccountError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Account Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Unable to load account information"
          message="We encountered an issue loading your account details. Please try again."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
