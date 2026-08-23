import React from 'react';
import Link from 'next/link';
import { Container } from '../../../components/ui/container';
import { EmptyState } from '../../../components/ui/empty-state';
import { Button } from '../../../components/ui/button';

export default function ProductNotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-gray-50/50 py-16">
      <Container size="md">
        <EmptyState
          title="Product Not Found"
          description="The product you are searching for does not exist or may have been moved."
          actionText="Explore All Products"
          actionHref="/category/women"
        />
      </Container>
    </div>
  );
}
