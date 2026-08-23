'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ChevronRight, Sparkles, SlidersHorizontal, ArrowUpDown, X, Loader2, RefreshCw, PackageOpen, Check } from 'lucide-react';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Drawer } from '../ui/drawer';
import { EmptyState } from '../ui/empty-state';
import { MobileBackButton } from '../ui/mobile-back-button';
import { ProductCard } from '../sections/product-card';
import { PlpFiltersPanel, type ActiveFilters } from './plp-filters-panel';
import type { StorefrontProduct, ProductFacets } from '../../lib/commerce';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface InteractivePlpViewProps {
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumbs?: BreadcrumbItem[];
  initialProducts: StorefrontProduct[];
  initialTotalCount: number;
  initialHasMore: boolean;
  initialNextOffset?: number;
  initialFacets: ProductFacets;
  contextParams?: {
    categoryHandle?: string;
    collectionHandle?: string;
    brand?: string;
    onSaleOnly?: boolean;
    q?: string;
  };
  emptyTitle?: string;
  emptyDescription?: string;
}

type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

const SORT_LABELS: Record<SortOption, string> = {
  relevance: 'Featured / Relevance',
  price_asc: 'Price: Low to High',
  price_desc: 'Price: High to Low',
  newest: 'Newest Arrivals',
};

export const InteractivePlpView: React.FC<InteractivePlpViewProps> = ({
  title,
  subtitle,
  badge,
  breadcrumbs = [{ label: 'Home', href: '/' }],
  initialProducts,
  initialTotalCount,
  initialHasMore,
  initialNextOffset,
  initialFacets,
  contextParams = {},
  emptyTitle = 'No Products Found',
  emptyDescription = 'We currently do not have items matching your selection. Try clearing some filters to explore more styles.',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Parse filters from URL search params or props
  const getInitialFiltersFromUrl = useCallback((): ActiveFilters => {
    const brandsParam = searchParams.get('brands') || searchParams.get('brand');
    const sizesParam = searchParams.get('sizes') || searchParams.get('size');
    const colorsParam = searchParams.get('colors') || searchParams.get('color');
    const priceMinParam = searchParams.get('price_min') || searchParams.get('priceMin');
    const priceMaxParam = searchParams.get('price_max') || searchParams.get('priceMax');
    const inStockParam = searchParams.get('in_stock') || searchParams.get('inStock');
    const onSaleParam = searchParams.get('sale') || searchParams.get('onSaleOnly');

    const brandList = brandsParam
      ? brandsParam.split(',').map((b) => b.trim()).filter(Boolean)
      : contextParams.brand
      ? [contextParams.brand]
      : [];

    return {
      brands: brandList,
      sizes: sizesParam ? sizesParam.split(',').map((s) => s.trim()).filter(Boolean) : [],
      colors: colorsParam ? colorsParam.split(',').map((c) => c.trim()).filter(Boolean) : [],
      priceMin: priceMinParam ? Number(priceMinParam) : undefined,
      priceMax: priceMaxParam ? Number(priceMaxParam) : undefined,
      inStock: inStockParam === 'true',
      onSaleOnly: onSaleParam === 'true' || Boolean(contextParams.onSaleOnly),
    };
  }, [searchParams, contextParams.brand, contextParams.onSaleOnly]);

  const initialSort = (searchParams.get('sort') as SortOption) || 'relevance';

  const [products, setProducts] = useState<StorefrontProduct[]>(initialProducts);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [nextOffset, setNextOffset] = useState<number | undefined>(initialNextOffset);
  const [facets, setFacets] = useState<ProductFacets>(initialFacets);

  const [activeFilters, setActiveFilters] = useState<ActiveFilters>(getInitialFiltersFromUrl);
  const [sort, setSort] = useState<SortOption>(initialSort);

  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);

  const observerTargetRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Synchronize internal state when server props or query change
  useEffect(() => {
    setProducts(initialProducts);
    setTotalCount(initialTotalCount);
    setHasMore(initialHasMore);
    setNextOffset(initialNextOffset);
    setFacets(initialFacets);
    setActiveFilters(getInitialFiltersFromUrl());
    setSort(initialSort);
  }, [
    initialProducts,
    initialTotalCount,
    initialHasMore,
    initialNextOffset,
    initialFacets,
    initialSort,
    getInitialFiltersFromUrl,
    contextParams.q,
    contextParams.categoryHandle,
    contextParams.collectionHandle,
    contextParams.brand,
  ]);

  // Sync state with URL
  const syncUrlParams = useCallback(
    (filters: ActiveFilters, currentSort: SortOption) => {
      const params = new URLSearchParams();

      if (contextParams.q) {
        params.set('q', contextParams.q);
      }
      if (filters.brands.length > 0) {
        params.set('brands', filters.brands.join(','));
      }
      if (filters.sizes.length > 0) {
        params.set('sizes', filters.sizes.join(','));
      }
      if (filters.colors.length > 0) {
        params.set('colors', filters.colors.join(','));
      }
      if (filters.priceMin !== undefined) {
        params.set('price_min', filters.priceMin.toString());
      }
      if (filters.priceMax !== undefined) {
        params.set('price_max', filters.priceMax.toString());
      }
      if (filters.inStock) {
        params.set('in_stock', 'true');
      }
      if (filters.onSaleOnly && !contextParams.onSaleOnly) {
        params.set('sale', 'true');
      }
      if (currentSort !== 'relevance') {
        params.set('sort', currentSort);
      }

      const queryString = params.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      window.history.replaceState(null, '', targetUrl);
    },
    [pathname, contextParams.onSaleOnly, contextParams.q]
  );

  // Fetch filtered products
  const fetchFilteredProducts = useCallback(
    async (filters: ActiveFilters, currentSort: SortOption) => {
      setIsLoading(true);
      setLoadMoreError(null);

      try {
        const query = new URLSearchParams({
          limit: '24',
          offset: '0',
          sort: currentSort,
        });

        if (contextParams.q) query.set('q', contextParams.q);
        if (contextParams.categoryHandle) query.set('categoryHandle', contextParams.categoryHandle);
        if (contextParams.collectionHandle) query.set('collectionHandle', contextParams.collectionHandle);
        if (contextParams.brand) query.set('brand', contextParams.brand);
        if (filters.brands.length > 0) query.set('brands', filters.brands.join(','));
        if (filters.sizes.length > 0) query.set('sizes', filters.sizes.join(','));
        if (filters.colors.length > 0) query.set('colors', filters.colors.join(','));
        if (filters.priceMin !== undefined) query.set('price_min', filters.priceMin.toString());
        if (filters.priceMax !== undefined) query.set('price_max', filters.priceMax.toString());
        if (filters.inStock) query.set('in_stock', 'true');
        if (filters.onSaleOnly || contextParams.onSaleOnly) query.set('sale', 'true');

        const res = await fetch(`/api/products?${query.toString()}`);
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);

        const data = await res.json();
        setProducts(data.products || []);
        setTotalCount(data.totalCount || 0);
        setHasMore(Boolean(data.hasMore));
        setNextOffset(data.nextOffset);
        if (data.facets && data.facets.brands?.length > 0) {
          setFacets(data.facets);
        }
      } catch (err: any) {
        console.error('Error loading filtered products:', err);
      } finally {
        setIsLoading(false);
      }
    },
    [contextParams]
  );

  // Handle progressive batch load (Desktop load more & Mobile infinite scroll)
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || nextOffset === undefined) return;

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const query = new URLSearchParams({
        limit: '24',
        offset: nextOffset.toString(),
        sort,
      });

      if (contextParams.q) query.set('q', contextParams.q);
      if (contextParams.categoryHandle) query.set('categoryHandle', contextParams.categoryHandle);
      if (contextParams.collectionHandle) query.set('collectionHandle', contextParams.collectionHandle);
      if (contextParams.brand) query.set('brand', contextParams.brand);
      if (activeFilters.brands.length > 0) query.set('brands', activeFilters.brands.join(','));
      if (activeFilters.sizes.length > 0) query.set('sizes', activeFilters.sizes.join(','));
      if (activeFilters.colors.length > 0) query.set('colors', activeFilters.colors.join(','));
      if (activeFilters.priceMin !== undefined) query.set('price_min', activeFilters.priceMin.toString());
      if (activeFilters.priceMax !== undefined) query.set('price_max', activeFilters.priceMax.toString());
      if (activeFilters.inStock) query.set('in_stock', 'true');
      if (activeFilters.onSaleOnly || contextParams.onSaleOnly) query.set('sale', 'true');

      const res = await fetch(`/api/products?${query.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const newItems: StorefrontProduct[] = data.products || [];

      // Duplicate Prevention using ID Set
      setProducts((prev) => {
        const seenIds = new Set(prev.map((p) => p.id));
        const nonDuplicates = newItems.filter((p) => !seenIds.has(p.id));
        return [...prev, ...nonDuplicates];
      });

      setHasMore(Boolean(data.hasMore));
      setNextOffset(data.nextOffset);
    } catch (err: any) {
      console.error('Error loading next batch of products:', err);
      setLoadMoreError('Unable to load more products. Please try again.');
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextOffset, sort, contextParams, activeFilters]);

  // Mobile Infinite Scroll Observer
  useEffect(() => {
    const sentinel = observerTargetRef.current;
    if (!sentinel || !hasMore || isLoading || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '250px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, isLoadingMore, handleLoadMore]);

  // Handle filter changes and trigger new query
  const updateFilters = (newFilters: ActiveFilters) => {
    setActiveFilters(newFilters);
    syncUrlParams(newFilters, sort);
    fetchFilteredProducts(newFilters, sort);
  };

  const handleToggleBrand = (brandValue: string) => {
    const exists = activeFilters.brands.some((b) => b.toLowerCase() === brandValue.toLowerCase());
    const updatedBrands = exists
      ? activeFilters.brands.filter((b) => b.toLowerCase() !== brandValue.toLowerCase())
      : [...activeFilters.brands, brandValue];
    updateFilters({ ...activeFilters, brands: updatedBrands });
  };

  const handleToggleSize = (sizeValue: string) => {
    const exists = activeFilters.sizes.some((s) => s.toLowerCase() === sizeValue.toLowerCase());
    const updatedSizes = exists
      ? activeFilters.sizes.filter((s) => s.toLowerCase() !== sizeValue.toLowerCase())
      : [...activeFilters.sizes, sizeValue];
    updateFilters({ ...activeFilters, sizes: updatedSizes });
  };

  const handleToggleColor = (colorValue: string) => {
    const exists = activeFilters.colors.some((c) => c.toLowerCase() === colorValue.toLowerCase());
    const updatedColors = exists
      ? activeFilters.colors.filter((c) => c.toLowerCase() !== colorValue.toLowerCase())
      : [...activeFilters.colors, colorValue];
    updateFilters({ ...activeFilters, colors: updatedColors });
  };

  const handleSetPriceRange = (min?: number, max?: number) => {
    updateFilters({ ...activeFilters, priceMin: min, priceMax: max });
  };

  const handleToggleInStock = (inStock: boolean) => {
    updateFilters({ ...activeFilters, inStock });
  };

  const handleToggleOnSale = (onSaleOnly: boolean) => {
    updateFilters({ ...activeFilters, onSaleOnly });
  };

  const handleClearAll = () => {
    const cleared: ActiveFilters = {
      brands: contextParams.brand ? [contextParams.brand] : [],
      sizes: [],
      colors: [],
      priceMin: undefined,
      priceMax: undefined,
      inStock: false,
      onSaleOnly: Boolean(contextParams.onSaleOnly),
    };
    updateFilters(cleared);
  };

  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    syncUrlParams(activeFilters, newSort);
    fetchFilteredProducts(activeFilters, newSort);
  };

  // Calculate active filter count for badge
  const totalActiveFilterCount =
    (activeFilters.brands.length > (contextParams.brand ? 1 : 0) ? activeFilters.brands.length : 0) +
    activeFilters.sizes.length +
    activeFilters.colors.length +
    (activeFilters.priceMin !== undefined || activeFilters.priceMax !== undefined ? 1 : 0) +
    (activeFilters.inStock ? 1 : 0) +
    (activeFilters.onSaleOnly && !contextParams.onSaleOnly ? 1 : 0);

  return (
    <div className="w-full bg-white pb-16 pt-4 sm:pt-6">
      <Container size="xl">
        {/* 1. Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <div className="sm:hidden shrink-0">
            <MobileBackButton fallbackUrl="/" />
          </div>
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
            {breadcrumbs.map((item, index) => {
              const isLast = index === breadcrumbs.length - 1;
              return (
                <li key={index} className="inline-flex items-center gap-1.5">
                  {item.href && !isLast ? (
                    <Link
                      href={item.href}
                      className="hover:text-brand-600 transition-colors font-medium"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={isLast ? 'font-semibold text-gray-900 line-clamp-1' : ''}
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                  {!isLast && (
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400 shrink-0" aria-hidden="true" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        {/* 2. PLP Header Banner */}
        <div className="mb-6 border-b border-gray-100 pb-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              {badge && (
                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full mb-2">
                  <Sparkles className="h-3 w-3" />
                  <span>{badge}</span>
                </div>
              )}
              <Heading level={1} className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                {title}
              </Heading>
              {subtitle && (
                <Text className="mt-1 text-sm text-gray-500 max-w-2xl">{subtitle}</Text>
              )}
            </div>

            <div className="text-xs sm:text-sm font-medium text-gray-500 shrink-0">
              Showing <span className="font-bold text-gray-900">{totalCount}</span> {totalCount === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>

        {/* 3. Filter & Sort Bar (Mobile & Desktop) */}
        <div className="sticky top-16 z-20 -mx-4 mb-6 flex items-center justify-between border-y border-gray-100 bg-white/95 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
          {/* Mobile Filter Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFilterDrawerOpen(true)}
              className="relative flex items-center gap-2 border-gray-300 font-semibold text-gray-800"
            >
              <SlidersHorizontal className="h-4 w-4 text-gray-600" />
              <span>Filters</span>
              {totalActiveFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
                  {totalActiveFilterCount}
                </span>
              )}
            </Button>

            {totalActiveFilterCount > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-xs font-bold text-gray-500 hover:text-brand-600 underline"
              >
                Clear
              </button>
            )}
          </div>

          {/* Desktop Filter Summary */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-500 font-medium">
            <SlidersHorizontal className="h-4 w-4 text-gray-400" />
            <span>Faceted Filter Engine</span>
          </div>

          {/* Sorting Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="hidden sm:inline-block text-xs font-semibold text-gray-500">Sort by:</span>
            <div className="relative">
              <select
                aria-label="Sort products"
                value={sort}
                onChange={(e) => handleSortChange(e.target.value as SortOption)}
                className="appearance-none rounded-lg border border-gray-200 bg-white py-1.5 pl-3 pr-8 text-xs font-semibold text-gray-800 shadow-xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <ArrowUpDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 4. Active Filter Chips Bar */}
        {totalActiveFilterCount > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-gray-400 font-medium mr-1">Active:</span>

            {activeFilters.brands.map((b) => (
              <span
                key={`chip-brand-${b}`}
                className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200"
              >
                {b}
                <button
                  type="button"
                  onClick={() => handleToggleBrand(b)}
                  className="rounded-full p-0.5 hover:bg-brand-200"
                  aria-label={`Remove ${b} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {activeFilters.sizes.map((s) => (
              <span
                key={`chip-size-${s}`}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 border border-gray-200"
              >
                Size: {s}
                <button
                  type="button"
                  onClick={() => handleToggleSize(s)}
                  className="rounded-full p-0.5 hover:bg-gray-200"
                  aria-label={`Remove size ${s} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {activeFilters.colors.map((c) => (
              <span
                key={`chip-color-${c}`}
                className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 border border-gray-200"
              >
                Color: {c}
                <button
                  type="button"
                  onClick={() => handleToggleColor(c)}
                  className="rounded-full p-0.5 hover:bg-gray-200"
                  aria-label={`Remove color ${c} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {(activeFilters.priceMin !== undefined || activeFilters.priceMax !== undefined) && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-800 border border-gray-200">
                ₹{activeFilters.priceMin || 0} - ₹{activeFilters.priceMax || 'Max'}
                <button
                  type="button"
                  onClick={() => handleSetPriceRange(undefined, undefined)}
                  className="rounded-full p-0.5 hover:bg-gray-200"
                  aria-label="Remove price filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {activeFilters.inStock && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                In Stock Only
                <button
                  type="button"
                  onClick={() => handleToggleInStock(false)}
                  className="rounded-full p-0.5 hover:bg-emerald-200"
                  aria-label="Remove in-stock filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleClearAll}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 ml-1 underline"
            >
              Clear All
            </button>
          </div>
        )}

        {/* 5. Main Layout: Sidebar (Desktop) + Product Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block lg:col-span-1 border-r border-gray-100 pr-6">
            <div className="sticky top-20">
              <PlpFiltersPanel
                facets={facets}
                activeFilters={activeFilters}
                onToggleBrand={handleToggleBrand}
                onToggleSize={handleToggleSize}
                onToggleColor={handleToggleColor}
                onSetPriceRange={handleSetPriceRange}
                onToggleInStock={handleToggleInStock}
                onToggleOnSale={handleToggleOnSale}
                onClearAll={handleClearAll}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="lg:col-span-3">
            {isLoading ? (
              <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-brand-600" />
                <span className="text-xs font-medium text-gray-500">Updating catalog...</span>
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                icon={<PackageOpen className="h-8 w-8 text-gray-400" />}
                title={emptyTitle}
                description={emptyDescription}
                actionText="Reset All Filters"
                onAction={handleClearAll}
              />
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-6">
                  {products.map((product, idx) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      priority={idx < 4}
                    />
                  ))}
                </div>

                {/* Next Page Error State with Retry Button */}
                {loadMoreError && (
                  <div className="mt-8 flex flex-col items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
                    <Text className="text-xs font-semibold text-red-700">{loadMoreError}</Text>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLoadMore}
                      className="border-red-300 text-red-800 hover:bg-red-100"
                    >
                      <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                      Retry Loading Next Page
                    </Button>
                  </div>
                )}

                {/* Desktop Load More Action & Mobile Sentinel */}
                {hasMore && !loadMoreError && (
                  <div className="mt-10 flex flex-col items-center justify-center">
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={handleLoadMore}
                      disabled={isLoadingMore}
                      className="hidden sm:inline-flex min-w-[200px] border-gray-300 font-bold text-gray-800 hover:border-brand-500 hover:text-brand-600 shadow-xs"
                    >
                      {isLoadingMore ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin text-brand-600" />
                          Loading More Products...
                        </>
                      ) : (
                        `View More Products (${products.length} of ${totalCount})`
                      )}
                    </Button>

                    {/* Mobile Loading Indicator */}
                    {isLoadingMore && (
                      <div className="flex sm:hidden items-center justify-center gap-2 py-4 text-xs font-medium text-gray-500">
                        <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                        <span>Loading next page...</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Mobile Infinite Scroll Sentinel Element */}
                <div ref={observerTargetRef} className="h-10 w-full" aria-hidden="true" />
              </>
            )}
          </main>
        </div>

        {/* 6. Mobile Filter Drawer */}
        <Drawer
          isOpen={isFilterDrawerOpen}
          onClose={() => setIsFilterDrawerOpen(false)}
          title="Filter Products"
          position="bottom"
          size="full"
          footer={
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleClearAll}
                className="w-1/3 border-gray-300 font-bold text-gray-700"
              >
                Clear All
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-2/3 font-bold shadow-md"
              >
                Apply Filters ({totalCount})
              </Button>
            </div>
          }
        >
          <div className="py-2">
            <PlpFiltersPanel
              facets={facets}
              activeFilters={activeFilters}
              onToggleBrand={handleToggleBrand}
              onToggleSize={handleToggleSize}
              onToggleColor={handleToggleColor}
              onSetPriceRange={handleSetPriceRange}
              onToggleInStock={handleToggleInStock}
              onToggleOnSale={handleToggleOnSale}
              onClearAll={handleClearAll}
            />
          </div>
        </Drawer>
      </Container>
    </div>
  );
};
InteractivePlpView.displayName = 'InteractivePlpView';
