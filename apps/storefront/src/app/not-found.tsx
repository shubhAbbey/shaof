import React from 'react';
import Link from 'next/link';
import { Container, EmptyState } from '../components/ui';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-white py-12">
      <Container size="md">
        <EmptyState
          icon={<SearchX className="h-8 w-8 text-brand-600" />}
          title="Page Not Found (404)"
          description="The page or product collection you are looking for does not exist or has been moved."
          actionText="Return to Home"
          actionHref="/"
        />
      </Container>
    </main>
  );
}
