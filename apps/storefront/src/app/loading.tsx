import React from 'react';
import { Container, Section, BannerSkeleton, ProductCardSkeleton } from '../components/ui';

export default function Loading() {
  return (
    <main className="min-h-screen bg-white">
      <Container size="xl" className="py-6">
        {/* Banner shimmer */}
        <BannerSkeleton className="mb-8" />

        {/* Section title shimmer */}
        <Section spacing="sm">
          <div className="h-7 w-48 rounded-md bg-gray-200 animate-pulse mb-6" />

          {/* Grid of product card shimmers */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        </Section>
      </Container>
    </main>
  );
}
