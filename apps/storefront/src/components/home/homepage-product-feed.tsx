'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { StorefrontProduct } from '../../lib/commerce';
import { Container } from '../ui/container';
import { Heading, Text } from '../ui/typography';
import { Button } from '../ui/button';
import { ProductCard } from '../sections/product-card';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';

export interface HomepageProductFeedProps {
  initialProducts: StorefrontProduct[];
  initialTotalCount: number;
  initialHasMore: boolean;
  initialNextOffset?: number;
  title?: string;
  subtitle?: string;
}

export const HomepageProductFeed: React.FC<HomepageProductFeedProps> = ({
  initialProducts,
  initialTotalCount,
  initialHasMore,
  initialNextOffset = 24,
  title = 'Explore All Collections & Styles',
  subtitle = 'Discover our complete catalog of handpicked ethnic, festive, western, and fusion fashion.',
}) => {
  const [products, setProducts] = useState<StorefrontProduct[]>(initialProducts);
  const [hasMore, setHasMore] = useState<boolean>(initialHasMore);
  const [nextOffset, setNextOffset] = useState<number | undefined>(initialNextOffset);
  const [totalCount, setTotalCount] = useState<number>(initialTotalCount);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const observerTargetRef = useRef<HTMLDivElement>(null);
  const isLoadingMoreRef = useRef<boolean>(false);

  // Progressive batch loading handler (shared by desktop View More and mobile scroll)
  const handleLoadMore = useCallback(async () => {
    if (isLoadingMoreRef.current || !hasMore || nextOffset === undefined) {
      return;
    }

    isLoadingMoreRef.current = true;
    setIsLoadingMore(true);
    setLoadError(null);

    try {
      const res = await fetch(`/api/products?limit=24&offset=${nextOffset}`);
      if (!res.ok) {
        throw new Error(`Failed to load more products: HTTP ${res.status}`);
      }

      const data = await res.json();
      const newItems: StorefrontProduct[] = data.products || [];

      setProducts((prev) => {
        const seenIds = new Set(prev.map((p) => p.id));
        const uniqueNew = newItems.filter((p) => !seenIds.has(p.id));
        return [...prev, ...uniqueNew];
      });

      setTotalCount(data.totalCount ?? totalCount);
      setHasMore(data.hasMore ?? false);
      setNextOffset(data.nextOffset);
    } catch (err) {
      console.error('Error in homepage bottom product feed pagination:', err);
      setLoadError('Unable to load more products. Please try again.');
    } finally {
      isLoadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, [hasMore, nextOffset, totalCount]);

  // Mobile automatic infinite scroll trigger via IntersectionObserver
  useEffect(() => {
    const sentinel = observerTargetRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !isLoadingMoreRef.current) {
          handleLoadMore();
        }
      },
      {
        rootMargin: '250px',
        threshold: 0.1,
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, handleLoadMore]);

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <section className="w-full py-12 sm:py-16 bg-gradient-to-b from-gray-50/50 to-white border-t border-gray-100">
      <Container size="xl">
        {/* Feed Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full mb-2 border border-brand-100">
            <Sparkles className="h-3.5 w-3.5" />
            <span>MORE TO LOVE</span>
          </div>
          <Heading level={2} size="xl" className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {title}
          </Heading>
          {subtitle && (
            <Text className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto mt-1">
              {subtitle}
            </Text>
          )}
        </div>

        {/* Multi-Row Product Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {/* Next-Page Loading Error / Retry */}
        {loadError && (
          <div className="mt-8 flex flex-col items-center justify-center text-center p-4 bg-red-50/80 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
              <AlertCircle className="h-4 w-4" />
              <span>{loadError}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              className="bg-white hover:bg-red-50 text-red-700 border-red-200 font-semibold"
            >
              Retry Loading
            </Button>
          </div>
        )}

        {/* Desktop View More Button (hidden on mobile, visible on md+) */}
        {hasMore && !loadError && (
          <div className="hidden md:flex flex-col items-center justify-center mt-10 sm:mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={handleLoadMore}
              isLoading={isLoadingMore}
              className="min-w-[240px] font-bold text-gray-800 border-gray-300 hover:border-brand-600 hover:text-brand-600 shadow-sm"
            >
              {isLoadingMore ? 'Loading More...' : `View More Products (${products.length} of ${totalCount})`}
            </Button>
            <p className="text-xs text-gray-400 mt-2">
              Showing {products.length} of {totalCount} curated styles
            </p>
          </div>
        )}

        {/* Mobile Loading Indicator (visible only on mobile during fetch) */}
        {isLoadingMore && (
          <div className="flex md:hidden items-center justify-center py-6 gap-2 text-brand-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs font-semibold">Loading next styles...</span>
          </div>
        )}

        {/* Mobile Infinite Scroll Sentinel Element */}
        {hasMore && !isLoadingMore && (
          <div
            ref={observerTargetRef}
            className="md:hidden h-10 w-full"
            aria-hidden="true"
          />
        )}
      </Container>
    </section>
  );
};
HomepageProductFeed.displayName = 'HomepageProductFeed';
