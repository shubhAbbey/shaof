import React from 'react';
import { Container } from '../components/ui';
import { AteevraLoader } from '../components/ui/ateevra-loader';

export default function Loading() {
  return (
    <main className="min-h-[75vh] flex items-center justify-center bg-white">
      <Container size="xl" className="py-16 flex flex-col items-center justify-center">
        <AteevraLoader
          size="xl"
          variant="customer"
          text="Loading Ateevra..."
          subtext="Made For Your Vibe"
          fadePulse={true}
        />
      </Container>
    </main>
  );
}
