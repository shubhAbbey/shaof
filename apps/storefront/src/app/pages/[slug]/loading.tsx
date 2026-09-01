import React from 'react';
import { Container, CMSSkeleton } from '../../../components/ui';

export default function Loading() {
  return (
    <main className="min-h-[80vh] bg-white">
      <Container size="xl">
        <CMSSkeleton />
      </Container>
    </main>
  );
}
