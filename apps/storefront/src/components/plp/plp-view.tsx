import React from 'react';
import { Container } from '../ui/container';
import { ErrorState } from '../ui/error-state';
import { InteractivePlpView, type BreadcrumbItem } from './interactive-plp-view';
import type { StorefrontProduct, ProductFacets } from '../../lib/commerce';

export type { BreadcrumbItem };

export interface PlpViewProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  products: StorefrontProduct[];
  totalCount?: number;
  hasMore?: boolean;
  nextOffset?: number;
  facets?: ProductFacets;
  contextParams?: {
    categoryHandle?: string;
    collectionHandle?: string;
    brand?: string;
    onSaleOnly?: boolean;
  };
  emptyTitle?: string;
  emptyDescription?: string;
  error?: string;
}

export const PlpView: React.FC<PlpViewProps> = ({
  title,
  subtitle,
  badge,
  breadcrumbs,
  products,
  totalCount,
  hasMore = false,
  nextOffset,
  facets = { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 10000 } },
  contextParams = {},
  emptyTitle,
  emptyDescription,
  error,
}) => {
  if (error) {
    return (
      <div className="w-full bg-white py-16">
        <Container size="xl">
          <ErrorState
            title="Failed to Load Products"
            message={error}
          />
        </Container>
      </div>
    );
  }

  return (
    <InteractivePlpView
      title={title}
      subtitle={subtitle}
      badge={badge}
      breadcrumbs={breadcrumbs}
      initialProducts={products}
      initialTotalCount={totalCount !== undefined ? totalCount : products.length}
      initialHasMore={hasMore}
      initialNextOffset={nextOffset}
      initialFacets={facets}
      contextParams={contextParams}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
    />
  );
};
PlpView.displayName = 'PlpView';
