import React from 'react';
import type { Metadata } from 'next';
import { fetchPlpProducts } from '../../lib/commerce';
import { getSearchProvider } from '../../lib/search';
import { constructMetadata } from '../../lib/seo';
import { PlpView } from '../../components/plp';
import { MobileSearchView } from '../../components/search/mobile-search-view';

export const revalidate = 60; // ISR revalidation every 60 seconds

interface SearchPageProps {
  searchParams?: {
    q?: string;
    query?: string;
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

export async function generateMetadata({ searchParams = {} }: SearchPageProps): Promise<Metadata> {
  const q = (searchParams.q || searchParams.query || '').trim();

  if (!q) {
    return constructMetadata({
      title: 'Search Fashion Catalog | EcomFashion',
      description: 'Search our extensive collection of premium ethnic wear, kurtas, dresses, sarees, and modern fashion online.',
      canonicalUrl: '/search',
    });
  }

  return constructMetadata({
    title: `Search results for "${q}" | EcomFashion`,
    description: `Explore top-rated styles, pure fabrics, and latest fashion matching "${q}" with fast delivery and COD available across India.`,
    canonicalUrl: `/search?q=${encodeURIComponent(q)}`,
  });
}

export default async function SearchPage({ searchParams = {} }: SearchPageProps) {
  const query = (searchParams.q || searchParams.query || '').trim();

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

  const priceMin = searchParams.price_min ? Number(searchParams.price_min) : undefined;
  const priceMax = searchParams.price_max ? Number(searchParams.price_max) : undefined;
  const inStock = searchParams.in_stock === 'true';
  const onSaleOnly = searchParams.sale === 'true';
  const sort = searchParams.sort || 'relevance';

  // 1. Fetch full PLP search results
  const { products, totalCount, hasMore, nextOffset, facets } = await fetchPlpProducts({
    q: query || undefined,
    brands,
    sizes,
    colors,
    priceMin,
    priceMax,
    inStock,
    onSaleOnly,
    sort,
    limit: 24,
    offset: 0,
  });

  // 2. Fetch lightweight suggestions for quick category/collection chips if query is present
  let initialCategories: { id: string; name: string; handle: string }[] = [];
  let initialCollections: { id: string; title: string; handle: string }[] = [];

  if (query) {
    try {
      const searchProvider = getSearchProvider();
      const suggestionsResult = await searchProvider.suggestions(query);
      initialCategories = suggestionsResult.categories || [];
      initialCollections = suggestionsResult.collections || [];
    } catch {
      // Non-blocking fallback
    }
  }

  const breadcrumbs = [
    { label: 'Home', href: '/' },
    { label: 'Search', href: '/search' },
    ...(query ? [{ label: `"${query}"` }] : []),
  ];

  return (
    <main className="min-h-screen bg-white">
      {/* Desktop Search PLP View */}
      <div className="hidden md:block">
        <PlpView
          key={`desktop-search-${query || 'all'}`}
          title={query ? `Search Results for "${query}"` : 'Explore Fashion Catalog'}
          subtitle={
            query
              ? `Found ${totalCount} matching styles for your search query`
              : 'Browse our complete curated wardrobe collection'
          }
          badge="SEARCH RESULTS"
          breadcrumbs={breadcrumbs}
          products={products}
          totalCount={totalCount}
          hasMore={hasMore}
          nextOffset={nextOffset}
          facets={facets}
          contextParams={{ q: query || undefined }}
          emptyTitle={query ? `No results found for "${query}"` : 'No products available'}
          emptyDescription={
            query
              ? 'We couldn’t find any items matching your exact search. Try checking your spelling, removing filters, or browsing our categories.'
              : 'Explore our catalog categories to find what you are looking for.'
          }
        />
      </div>

      {/* Mobile Dedicated Search Page */}
      <div className="block md:hidden">
        <MobileSearchView
          key={`mobile-search-${query || 'all'}`}
          initialQuery={query}
          initialProducts={products}
          initialTotalCount={totalCount}
          initialHasMore={hasMore}
          initialNextOffset={nextOffset}
          initialCategories={initialCategories}
          initialCollections={initialCollections}
        />
      </div>
    </main>
  );
}
