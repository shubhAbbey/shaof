import React from 'react';
import type { Metadata } from 'next';
import { fetchPlpProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PlpView } from '../../../components/plp';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface SalePlpProps {
  searchParams?: {
    brands?: string;
    brand?: string;
    sizes?: string;
    size?: string;
    colors?: string;
    color?: string;
    price_min?: string;
    price_max?: string;
    in_stock?: string;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
    limit?: string;
    offset?: string;
  };
}

export async function generateMetadata(): Promise<Metadata> {
  return constructMetadata({
    title: 'Mega Flash Sale & Clearance Deals | Up to 70% Off',
    description:
      'Shop our biggest sale of the season. Flat discounts on ethnic sarees, kurtis, western dresses, linen shirts, and plus size fashion. Extra savings on prepaid orders.',
    canonicalUrl: '/sale/all',
  });
}

export default async function SaleAllPlpPage({ searchParams = {} }: SalePlpProps) {
  const brands = searchParams.brands
    ? searchParams.brands.split(',').filter(Boolean)
    : searchParams.brand
    ? [searchParams.brand]
    : [];
  const sizes = searchParams.sizes
    ? searchParams.sizes.split(',').filter(Boolean)
    : searchParams.size
    ? [searchParams.size]
    : [];
  const colors = searchParams.colors
    ? searchParams.colors.split(',').filter(Boolean)
    : searchParams.color
    ? [searchParams.color]
    : [];

  const { products, totalCount, hasMore, nextOffset, facets } = await fetchPlpProducts({
    onSaleOnly: true,
    brands,
    sizes,
    colors,
    priceMin: searchParams.price_min ? Number(searchParams.price_min) : undefined,
    priceMax: searchParams.price_max ? Number(searchParams.price_max) : undefined,
    inStock: searchParams.in_stock === 'true',
    sort: searchParams.sort || 'relevance',
    limit: 24,
    offset: 0,
  });

  return (
    <main className="min-h-screen bg-white">
      <PlpView
        title="Mega Flash Sale & Clearance Deals"
        subtitle="Limited-time markdowns and clearance steals across handpicked ethnic wear, westerns, and festive styles."
        badge="UP TO 70% OFF"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Sale', href: '/sale' },
          { label: 'All Sale Deals' },
        ]}
        products={products}
        totalCount={totalCount}
        hasMore={hasMore}
        nextOffset={nextOffset}
        facets={facets}
        contextParams={{ onSaleOnly: true }}
        emptyTitle="No Flash Deals Match Your Filters"
        emptyDescription="All current flash deals matching your filters have ended. Try clearing your filters to explore all active markdowns."
      />
    </main>
  );
}
