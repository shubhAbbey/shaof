import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCollectionByHandle, fetchPlpProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PlpView } from '../../../components/plp';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface CollectionPlpProps {
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

export async function generateMetadata({ params, searchParams }: CollectionPlpProps): Promise<Metadata> {
  const collection = await fetchCollectionByHandle(params.handle);

  if (!collection) {
    return {
      title: 'Collection Not Found | EcomFashion',
      robots: { index: false, follow: false },
    };
  }

  return constructMetadata({
    title: `${collection.title} | Curated Collection`,
    description:
      collection.description ||
      `Explore our handpicked ${collection.title} styles with pure fabrics, limited edition designs, and fast delivery across India.`,
    canonicalUrl: `/collections/${params.handle}`,
  });
}

export default async function CollectionPlpPage({ params, searchParams = {} }: CollectionPlpProps) {
  const collection = await fetchCollectionByHandle(params.handle);

  if (!collection) {
    notFound();
  }

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
    collectionId: collection.id,
    collectionHandle: params.handle,
    brands,
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
        title={collection.title}
        subtitle={
          collection.description ||
          `Exclusive collection featuring limited-run silhouettes and premium quality artisanal craftsmanship.`
        }
        badge="CURATED COLLECTION"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Collections', href: '/' },
          { label: collection.title },
        ]}
        products={products}
        totalCount={totalCount}
        hasMore={hasMore}
        nextOffset={nextOffset}
        facets={facets}
        contextParams={{ collectionHandle: params.handle }}
        emptyTitle={`No products match your filters in ${collection.title}`}
        emptyDescription="All products in this curated capsule matching your filters have currently been claimed. Try resetting filters."
      />
    </main>
  );
}
