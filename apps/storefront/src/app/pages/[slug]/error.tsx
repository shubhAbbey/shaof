'use client';

import React, { useEffect } from 'react';
import { Container, ErrorState } from '../../../components/ui';

export default function CMSError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[CMS Page Error Boundary]:', error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <ErrorState
          title="Unable to load page"
          message="We couldn't load this content. Please try again."
          onRetry={() => reset()}
        />
      </Container>
    </main>
  );
}
