import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCommerceProducts, fetchPlpProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PlpView } from '../../../components/plp';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface BrandPlpProps {
  params: {
    handle: string;
  };
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
    sale?: string;
    sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
    limit?: string;
    offset?: string;
  };
}

const KNOWN_BRANDS: Record<string, string> = {
  'virasat-heritage': 'Virasat Heritage',
  'gulmohar-jaipur': 'Gulmohar Jaipur',
  'meadow-studio': 'Meadow Studio',
  'loom-thread': 'Loom & Thread',
  'urban-drape': 'Urban Drape',
  'kora-weaves': 'Kora Weaves',
};

function formatBrandName(handle: string): string {
  if (KNOWN_BRANDS[handle]) {
    return KNOWN_BRANDS[handle];
  }
  return handle
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export async function generateMetadata({ params }: BrandPlpProps): Promise<Metadata> {
  const brandName = formatBrandName(params.handle);
  const products = await fetchCommerceProducts({ brand: params.handle, limit: 1 });

  if (products.length === 0 && !KNOWN_BRANDS[params.handle]) {
    return {
      title: 'Brand Not Found | EcomFashion',
      robots: { index: false, follow: false },
    };
  }

  return constructMetadata({
    title: `${brandName} Official Store | Designer Styles`,
    description: `Shop authentic apparel and fashion collections from ${brandName}. Verified genuine products, fast delivery across India, and cash on delivery.`,
    canonicalUrl: `/brand/${params.handle}`,
  });
}

export default async function BrandPlpPage({ params, searchParams = {} }: BrandPlpProps) {
  const brandName = formatBrandName(params.handle);

  const initialCheck = await fetchCommerceProducts({
    brand: params.handle,
    limit: 1,
  });

  if (initialCheck.length === 0 && !KNOWN_BRANDS[params.handle]) {
    notFound();
  }

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
    brand: brandName,
    brands: [brandName],
    sizes,
    colors,
    priceMin: searchParams.price_min ? Number(searchParams.price_min) : undefined,
    priceMax: searchParams.price_max ? Number(searchParams.price_max) : undefined,
    inStock: searchParams.in_stock === 'true',
    onSaleOnly: searchParams.sale === 'true',
    sort: searchParams.sort || 'relevance',
    limit: 24,
    offset: 0,
  });

  return (
    <main className="min-h-screen bg-white">
      <PlpView
        title={`${brandName} Official Store`}
        subtitle={`Discover handcrafted collections and exclusive drops from ${brandName}. 100% authentic quality guaranteed.`}
        badge="BRAND SPOTLIGHT"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Brands', href: '/' },
          { label: brandName },
        ]}
        products={products}
        totalCount={totalCount}
        hasMore={hasMore}
        nextOffset={nextOffset}
        facets={facets}
        contextParams={{ brand: brandName }}
        emptyTitle={`No products match your filters for ${brandName}`}
        emptyDescription={`We are restocking new season inventory from ${brandName}. Try clearing your filters to see all available styles.`}
      />
    </main>
  );
}
