import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { fetchCategoryByHandle, fetchPlpProducts } from '../../../lib/commerce';
import { constructMetadata } from '../../../lib/seo';
import { PlpView } from '../../../components/plp';
import { NAVIGATION_CATEGORIES } from '../../../data/navigation';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface CategoryPlpProps {
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

export async function generateMetadata({ params, searchParams }: CategoryPlpProps): Promise<Metadata> {
  const category = await fetchCategoryByHandle(params.handle);

  if (!category) {
    const navCategory = NAVIGATION_CATEGORIES.find((c) => c.handle === params.handle);
    if (navCategory) {
      return constructMetadata({
        title: `${navCategory.name} Online Collection`,
        description: `Explore the trending ${navCategory.name} collection with authentic styles, premium fabrics, and express delivery across India.`,
      });
    }
    return {
      title: 'Category Not Found | EcomFashion',
      robots: { index: false, follow: false },
    };
  }

  // Canonical URL always points to clean category handle without filter spam
  return constructMetadata({
    title: `${category.name} Collection`,
    description:
      category.description ||
      `Shop high quality ${category.name} online at unbeatable prices. Fast shipping and COD available across India.`,
    canonicalUrl: `/category/${params.handle}`,
  });
}

export default async function CategoryPlpPage({ params, searchParams = {} }: CategoryPlpProps) {
  const category = await fetchCategoryByHandle(params.handle);

  if (!category) {
    const navCat = NAVIGATION_CATEGORIES.find((c) => c.handle === params.handle);
    if (!navCat) {
      notFound();
    }
    return (
      <main className="min-h-screen bg-white">
        <PlpView
          title={navCat.name}
          subtitle="Explore trending styles in this category."
          badge={navCat.badge}
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Categories', href: '/' },
            { label: navCat.name },
          ]}
          products={[]}
          totalCount={0}
          hasMore={false}
          contextParams={{ categoryHandle: params.handle }}
          emptyTitle={`No products found in ${navCat.name}`}
          emptyDescription={`We are adding new products to our ${navCat.name} catalog soon. Please check back shortly.`}
        />
      </main>
    );
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
    categoryId: category.id,
    categoryHandle: params.handle,
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
        title={category.name}
        subtitle={
          category.description ||
          `Handpicked styles and curated trends in ${category.name} with premium quality fabrics and designs.`
        }
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Categories', href: '/' },
          { label: category.name },
        ]}
        products={products}
        totalCount={totalCount}
        hasMore={hasMore}
        nextOffset={nextOffset}
        facets={facets}
        contextParams={{ categoryHandle: params.handle }}
        emptyTitle={`No products match your filters in ${category.name}`}
        emptyDescription="Try clearing some filter criteria to explore more items in this category."
      />
    </main>
  );
}
