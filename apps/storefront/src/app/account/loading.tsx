import React from 'react';
import { Container, AccountSkeleton } from '../../components/ui';

export default function Loading() {
  return (
    <main className="min-h-[80vh] bg-white">
      <Container size="xl">
        <AccountSkeleton />
      </Container>
    </main>
  );
}
