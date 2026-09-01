'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Search,
  X,
  Sparkles,
  TrendingUp,
  FolderTree,
  SearchX,
  AlertCircle,
  RefreshCw,
  Loader2,
  ChevronRight,
  Layers,
  Tag,
} from 'lucide-react';
import { MobileBackButton } from '../ui/mobile-back-button';
import { ProductCard } from '../sections/product-card';
import { ProductCardSkeleton } from '../ui/skeleton';
import { useSearch } from '../../hooks/use-search';
import { StorefrontProduct } from '../../lib/commerce';
import { cn } from '../../lib/utils';
import { POPULAR_CATEGORIES, TRENDING_SEARCHES } from '../layout/search-bar';

export interface MobileSearchViewProps {
  initialQuery?: string;
  initialProducts?: StorefrontProduct[];
  initialTotalCount?: number;
  initialHasMore?: boolean;
  initialNextOffset?: number;
  initialCategories?: { id: string; name: string; handle: string }[];
  initialCollections?: { id: string; title: string; handle: string }[];
  initialBrands?: string[];
}

export const MobileSearchView: React.FC<MobileSearchViewProps> = ({
  initialQuery = '',
  initialProducts = [],
  initialTotalCount = 0,
  initialHasMore = false,
  initialNextOffset,
  initialCategories = [],
  initialCollections = [],
  initialBrands = [],
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const observerTargetRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState<string>(initialQuery);
  const [products, setProducts] = useState<StorefrontProduct[]>(initialProducts);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [nextOffset, setNextOffset] = useState<number | undefined>(initialNextOffset);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Phase 14 useSearch hook for debounced suggestions & cancellation
  const {
    suggestions,
    isLoadingSuggestions,
    error: suggestionsError,
  } = useSearch({
    initialQuery,
    debounceMs: 250,
    autoFetchSuggestions: true,
  });

  // Track active request ID to discard stale responses
  const activeRequestIdRef = useRef<number>(0);

  // Sync products when debounced query changes
  const fetchProductsForQuery = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    const requestId = ++activeRequestIdRef.current;

    setIsLoadingProducts(true);
    setError(null);

    // Update URL seamlessly for back/forward navigation & shareability
    const targetUrl = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
    window.history.replaceState(null, '', targetUrl);

    try {
      const params = new URLSearchParams({
        limit: '24',
        offset: '0',
      });
      if (trimmed) {
        params.set('q', trimmed);
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to search products`);

      const data = await res.json();
      if (requestId === activeRequestIdRef.current) {
        setProducts(data.products || []);
        setTotalCount(data.totalCount || 0);
        setHasMore(Boolean(data.hasMore));
        setNextOffset(data.nextOffset);
      }
    } catch (err: any) {
      if (requestId === activeRequestIdRef.current) {
        console.error('Error fetching search products:', err);
        setError('Unable to load search results. Please check your connection and try again.');
      }
    } finally {
      if (requestId === activeRequestIdRef.current) {
        setIsLoadingProducts(false);
      }
    }
  }, []);

  // Trigger search on query change (with internal debounce matching useSearch)
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchProductsForQuery(query);
    }, 250);

    return () => clearTimeout(handler);
  }, [query, fetchProductsForQuery]);

  // Handle infinite scroll pagination
  const handleLoadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore || nextOffset === undefined) return;

    setIsLoadingMore(true);
    try {
      const params = new URLSearchParams({
        limit: '24',
        offset: nextOffset.toString(),
      });
      if (query.trim()) {
        params.set('q', query.trim());
      }

      const res = await fetch(`/api/products?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);

      const data = await res.json();
      const newItems: StorefrontProduct[] = data.products || [];

      // Duplicate prevention with ID Set
      setProducts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const filtered = newItems.filter((p) => !seen.has(p.id));
        return [...prev, ...filtered];
      });

      setHasMore(Boolean(data.hasMore));
      setNextOffset(data.nextOffset);
    } catch (err) {
      console.error('Error loading more search products:', err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, nextOffset, query]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const sentinel = observerTargetRef.current;
    if (!sentinel || !hasMore || isLoadingProducts || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { rootMargin: '300px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingProducts, isLoadingMore, handleLoadMore]);

  const handleClearQuery = () => {
    setQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectTrending = (term: string) => {
    setQuery(term);
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const trimmedQuery = query.trim();
  const isZsr = !isLoadingProducts && trimmedQuery !== '' && products.length === 0 && !error;

  const matchingCategories = suggestions?.categories?.length
    ? suggestions.categories
    : initialCategories;
  const matchingCollections = suggestions?.collections?.length
    ? suggestions.collections
    : initialCollections;
  const matchingBrands = suggestions?.brands?.length
    ? suggestions.brands
    : initialBrands;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:hidden">
      {/* 1. Mobile Search Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-3 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <MobileBackButton fallbackUrl="/" showLabel={false} className="p-1.5" />

          {/* Search Box Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search kurtas, dresses, shirts, brands..."
              className="w-full h-10 pl-9 pr-8 bg-gray-100/90 rounded-full text-xs font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
            />
            {query && (
              <button
                type="button"
                onClick={handleClearQuery}
                aria-label="Clear search query"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Category, Collection & Brand Suggestions Quick Chips */}
        {trimmedQuery !== '' && (matchingCategories.length > 0 || matchingCollections.length > 0 || matchingBrands.length > 0) && (
          <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto pt-2 pb-0.5 scroll-smooth">
            {matchingCategories.slice(0, 3).map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.handle}`}
                className="inline-flex items-center gap-1 shrink-0 rounded-full bg-brand-50 border border-brand-200 px-2.5 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-100"
              >
                <FolderTree className="h-3 w-3 text-brand-500" />
                <span>{cat.name}</span>
              </Link>
            ))}
            {matchingCollections.slice(0, 2).map((col) => (
              <Link
                key={col.id}
                href={`/collections/${col.handle}`}
                className="inline-flex items-center gap-1 shrink-0 rounded-full bg-purple-50 border border-purple-200 px-2.5 py-1 text-[11px] font-semibold text-purple-700 hover:bg-purple-100"
              >
                <Layers className="h-3 w-3 text-purple-500" />
                <span>{col.title}</span>
              </Link>
            ))}
            {matchingBrands.slice(0, 2).map((brand) => {
              const brandSlug = brand.toLowerCase().replace(/\s+/g, '-');
              return (
                <Link
                  key={brand}
                  href={`/brand/${encodeURIComponent(brandSlug)}`}
                  className="inline-flex items-center gap-1 shrink-0 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-100"
                >
                  <Tag className="h-3 w-3 text-blue-500" />
                  <span>{brand}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Main Search Body */}
      <div className="flex-1 p-3">
        {/* Loading State Spinner */}
        {isLoadingProducts && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-brand-600 mb-3" />
            <p className="text-xs font-semibold">Searching catalog for &ldquo;{trimmedQuery}&rdquo;...</p>
          </div>
        )}

        {/* Error State Banner */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center my-6">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
            <h3 className="text-xs font-bold text-red-800">Search Error</h3>
            <p className="mt-1 text-[11px] text-red-600">{error}</p>
            <button
              type="button"
              onClick={() => fetchProductsForQuery(query)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs hover:bg-red-700 active:scale-95 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Retry Search</span>
            </button>
          </div>
        )}

        {/* 4. Zero Search Results (ZSR) State */}
        {isZsr && (
          <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center my-4 shadow-2xs">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400 mb-3">
              <SearchX className="h-6 w-6" />
            </div>
            <h3 className="text-sm font-black text-gray-900">
              No results found for &ldquo;{trimmedQuery}&rdquo;
            </h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              We couldn&rsquo;t find any matches. Try checking your spelling or explore popular categories below.
            </p>

            {/* Trending suggestions recovery */}
            <div className="mt-6 text-left border-t border-gray-100 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                <TrendingUp className="h-3.5 w-3.5 text-brand-600" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectTrending(item)}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <Sparkles className="h-3 w-3 text-brand-500" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Categories recovery */}
            <div className="mt-4 text-left border-t border-gray-100 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
                <FolderTree className="h-3.5 w-3.5 text-brand-600" />
                <span>Popular Categories</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-xs font-semibold text-gray-700 hover:bg-brand-50 hover:border-brand-300 transition-colors"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. Product Results Header & Product Grid */}
        {products.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                {trimmedQuery ? (
                  <span>
                    Results for <strong className="text-gray-900">&ldquo;{trimmedQuery}&rdquo;</strong> ({totalCount})
                  </span>
                ) : (
                  <span>Trending Catalog ({totalCount})</span>
                )}
              </h2>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-2 gap-3">
              {products.map((product, idx) => (
                <ProductCard key={product.id} product={product} priority={idx < 4} />
              ))}
              {isLoadingMore && (
                <>
                  <ProductCardSkeleton />
                  <ProductCardSkeleton />
                </>
              )}
            </div>

            {/* Infinite Scroll Sentinel */}
            <div ref={observerTargetRef} className="py-6 text-center">
              {isLoadingMore && (
                <div className="flex items-center justify-center gap-2 text-xs font-medium text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-600" />
                  <span>Loading more items...</span>
                </div>
              )}
              {!hasMore && products.length > 0 && (
                <p className="text-[11px] font-semibold text-gray-400">
                  You have viewed all {totalCount} matching products
                </p>
              )}
            </div>
          </div>
        )}

        {/* 6. Empty Query Default State (No Query Entered) */}
        {!trimmedQuery && products.length === 0 && !isLoadingProducts && (
          <div className="space-y-5 py-4">
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectTrending(item)}
                    className="inline-flex items-center gap-1 rounded-full bg-white border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <Sparkles className="h-3 w-3 text-brand-500" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5 border-t border-gray-200/80 pt-4">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500">
                <FolderTree className="h-4 w-4 text-brand-600" />
                <span>Explore Categories</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.name}
                    href={cat.href}
                    className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-xs font-bold text-gray-700 hover:border-brand-300 hover:bg-brand-50 transition-colors shadow-2xs"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MobileSearchView.displayName = 'MobileSearchView';
