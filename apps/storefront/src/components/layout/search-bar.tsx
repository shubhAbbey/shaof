/**
 * Phase 15: Desktop Search Dropdown & Autocomplete UX
 *
 * Implements desktop autocomplete search with live suggestions,
 * product/category/collection routing, keyboard navigation (ArrowUp, ArrowDown,
 * Enter, Escape), loading/error/empty states, and full search fallback.
 */

'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  Search,
  X,
  TrendingUp,
  Sparkles,
  ChevronRight,
  FolderTree,
  Layers,
  Loader2,
  PackageOpen,
  AlertCircle,
} from 'lucide-react';
import { useSearch } from '../../hooks/use-search';
import { StorefrontProduct } from '../../lib/commerce';
import { cn } from '../../lib/utils';

export const TRENDING_SEARCHES = [
  'Kurta Sets',
  'Oversized T-Shirts',
  'Floral Maxi Dresses',
  'Linen Shirts',
  'Embroidered Sarees',
  'Cargo Pants',
];

export const POPULAR_CATEGORIES = [
  { name: 'Women Ethnic', href: '/category/women' },
  { name: 'Men Topwear', href: '/category/men' },
  { name: 'Curve + Plus', href: '/category/curve-plus' },
  { name: 'Dresses', href: '/category/women-dresses' },
  { name: 'Sale Store', href: '/sale' },
];

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearchSubmit?: (query: string) => void;
  trendingSearches?: string[];
  popularCategories?: { name: string; href: string }[];
}

export type NavigableItemType =
  | 'query'
  | 'category'
  | 'collection'
  | 'brand'
  | 'product'
  | 'view_all'
  | 'trending';

export interface NavigableItem {
  id: string;
  type: NavigableItemType;
  title: string;
  href: string;
  query?: string;
  product?: StorefrontProduct;
  categoryName?: string;
  collectionTitle?: string;
  brand?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = 'Search for kurtas, dresses, t-shirts, brands and more...',
  autoFocus = false,
  onSearchSubmit,
  trendingSearches,
  popularCategories,
}) => {
  const router = useRouter();
  const activeTrendingSearches = trendingSearches && trendingSearches.length > 0 ? trendingSearches : TRENDING_SEARCHES;
  const activePopularCategories = popularCategories && popularCategories.length > 0 ? popularCategories : POPULAR_CATEGORIES;

  const {
    query,
    setQuery,
    suggestions,
    isLoadingSuggestions,
    error,
    clear,
  } = useSearch({
    debounceMs: 250,
    autoFetchSuggestions: true,
  });

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);

  // Build the flat list of navigable items for deterministic keyboard navigation
  const navigableItems = useMemo<NavigableItem[]>(() => {
    const trimmed = query.trim();
    const items: NavigableItem[] = [];

    if (!trimmed) {
      // Empty query state: Trending searches are keyboard-navigable
      activeTrendingSearches.forEach((trend, idx) => {
        items.push({
          id: `nav-trend-${idx}`,
          type: 'trending',
          title: trend,
          href: `/search?q=${encodeURIComponent(trend)}`,
          query: trend,
        });
      });
      return items;
    }

    // 1. Direct Query Completion Item
    items.push({
      id: `nav-query-${encodeURIComponent(trimmed)}`,
      type: 'query',
      title: trimmed,
      href: `/search?q=${encodeURIComponent(trimmed)}`,
      query: trimmed,
    });

    // 2. Matching Category Items
    if (suggestions?.categories && suggestions.categories.length > 0) {
      suggestions.categories.slice(0, 3).forEach((cat) => {
        items.push({
          id: `nav-cat-${cat.handle}`,
          type: 'category',
          title: cat.name,
          href: `/category/${encodeURIComponent(cat.handle)}`,
          categoryName: cat.name,
        });
      });
    }

    // 3. Matching Collection Items
    if (suggestions?.collections && suggestions.collections.length > 0) {
      suggestions.collections.slice(0, 2).forEach((col) => {
        items.push({
          id: `nav-col-${col.handle}`,
          type: 'collection',
          title: col.title,
          href: `/collections/${encodeURIComponent(col.handle)}`,
          collectionTitle: col.title,
        });
      });
    }

    // 4. Matching Product Suggestions (Top 4)
    if (suggestions?.products && suggestions.products.length > 0) {
      suggestions.products.slice(0, 4).forEach((prod) => {
        items.push({
          id: `nav-prod-${prod.id}`,
          type: 'product',
          title: prod.title,
          href: `/product/${encodeURIComponent(prod.handle)}`,
          product: prod,
        });
      });
    }

    // 5. "View All Results" Item
    items.push({
      id: `nav-view-all-${encodeURIComponent(trimmed)}`,
      type: 'view_all',
      title: `View all results for "${trimmed}"`,
      href: `/search?q=${encodeURIComponent(trimmed)}`,
      query: trimmed,
    });

    return items;
  }, [query, suggestions, activeTrendingSearches]);

  // Reset activeIndex when query or suggestions change
  useEffect(() => {
    setActiveIndex(-1);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Execute navigation for a selected item
  const handleSelectItem = useCallback(
    (item: NavigableItem) => {
      setIsOpen(false);
      setActiveIndex(-1);

      if (item.type === 'query' || item.type === 'view_all' || item.type === 'trending') {
        const q = item.query || item.title;
        if (onSearchSubmit) {
          onSearchSubmit(q);
        } else {
          router.push(item.href);
        }
      } else {
        // Product -> PDP, Category -> PLP, Collection -> PLP
        router.push(item.href);
      }
    },
    [onSearchSubmit, router]
  );

  // Form submit handler (Enter key without selection or button click)
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();

    if (activeIndex >= 0 && activeIndex < navigableItems.length) {
      handleSelectItem(navigableItems[activeIndex]);
      return;
    }

    if (trimmed) {
      setIsOpen(false);
      setActiveIndex(-1);
      if (onSearchSubmit) {
        onSearchSubmit(trimmed);
      } else {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    }
  };

  // Keyboard navigation handler for ArrowDown, ArrowUp, Enter, Escape, Tab
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        if (navigableItems.length === 0) return;
        setActiveIndex((prev) => (prev < navigableItems.length - 1 ? prev + 1 : 0));
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (navigableItems.length === 0) return;
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      }
      case 'Enter': {
        e.preventDefault();
        handleSubmit();
        break;
      }
      case 'Escape': {
        e.preventDefault();
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
      }
      case 'Tab': {
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      }
      default:
        break;
    }
  };

  const handleSelectTrending = (item: string) => {
    setQuery(item);
    setIsOpen(false);
    setActiveIndex(-1);
    if (onSearchSubmit) {
      onSearchSubmit(item);
    } else {
      router.push(`/search?q=${encodeURIComponent(item)}`);
    }
  };

  const handleClear = () => {
    clear();
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const isQueryEntered = query.trim().length > 0;

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-2xl', className)}>
      {/* Search Input Form */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="pointer-events-none absolute left-3.5 flex items-center text-gray-400">
          <Search className="h-4 w-4" />
        </div>

        <input
          ref={inputRef}
          type="search"
          role="combobox"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onClick={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Search catalog"
          aria-expanded={isOpen}
          aria-controls="desktop-search-dropdown"
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 && activeIndex < navigableItems.length
              ? `suggestion-item-${activeIndex}`
              : undefined
          }
          className="h-10 w-full rounded-full border border-gray-200 bg-gray-50/90 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />

        {/* Right Loading Spinner or Clear Button */}
        <div className="absolute right-3.5 flex items-center gap-1.5">
          {isLoadingSuggestions && (
            <Loader2 className="h-4 w-4 animate-spin text-brand-600" aria-label="Loading suggestions" />
          )}
          {query && !isLoadingSuggestions && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>

      {/* Desktop Search Dropdown */}
      {isOpen && (
        <div
          id="desktop-search-dropdown"
          ref={listboxRef}
          role="listbox"
          data-testid="search-suggestions-dropdown"
          aria-label="Search Suggestions"
          className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[480px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl animate-fadeIn scroll-smooth"
        >
          {isQueryEntered ? (
            <div className="space-y-3">
              {/* 1. Direct Search Query Item */}
              {navigableItems
                .filter((item) => item.type === 'query')
                .map((item) => {
                  const globalIdx = navigableItems.findIndex((i) => i.id === item.id);
                  const isItemActive = activeIndex === globalIdx;
                  return (
                    <div
                      key={item.id}
                      id={`suggestion-item-${globalIdx}`}
                      role="option"
                      aria-selected={isItemActive}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                        isItemActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <Search className="h-4 w-4 text-brand-600 shrink-0" />
                        <span className="truncate">
                          Search for &ldquo;<strong>{item.title}</strong>&rdquo;
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">Press Enter</span>
                    </div>
                  );
                })}

              {/* 2. Error State */}
              {error && (
                <div className="flex items-center gap-2 rounded-xl bg-amber-50 p-2.5 text-xs text-amber-800">
                  <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
                  <span>Suggestions unavailable. Press Enter to search catalog.</span>
                </div>
              )}

              {/* 3. Matching Categories Section */}
              {suggestions?.categories && suggestions.categories.length > 0 && (
                <div className="space-y-1.5 border-t border-gray-100 pt-2.5">
                  <div className="flex items-center gap-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <FolderTree className="h-3 w-3 text-brand-600" />
                    <span>Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {navigableItems
                      .filter((item) => item.type === 'category')
                      .map((item) => {
                        const globalIdx = navigableItems.findIndex((i) => i.id === item.id);
                        const isItemActive = activeIndex === globalIdx;
                        return (
                          <button
                            key={item.id}
                            id={`suggestion-item-${globalIdx}`}
                            role="option"
                            aria-selected={isItemActive}
                            type="button"
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                              isItemActive
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                            )}
                          >
                            <span>in {item.title}</span>
                            <ChevronRight className="h-3 w-3 opacity-60" />
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 4. Matching Collections Section */}
              {suggestions?.collections && suggestions.collections.length > 0 && (
                <div className="space-y-1.5 border-t border-gray-100 pt-2.5">
                  <div className="flex items-center gap-1.5 px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <Layers className="h-3 w-3 text-brand-600" />
                    <span>Collections</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {navigableItems
                      .filter((item) => item.type === 'collection')
                      .map((item) => {
                        const globalIdx = navigableItems.findIndex((i) => i.id === item.id);
                        const isItemActive = activeIndex === globalIdx;
                        return (
                          <button
                            key={item.id}
                            id={`suggestion-item-${globalIdx}`}
                            role="option"
                            aria-selected={isItemActive}
                            type="button"
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                            className={cn(
                              'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                              isItemActive
                                ? 'bg-brand-600 text-white shadow-xs'
                                : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
                            )}
                          >
                            <span>{item.title}</span>
                            <ChevronRight className="h-3 w-3 opacity-60" />
                          </button>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 5. Product Suggestions Section */}
              {suggestions?.products && suggestions.products.length > 0 && (
                <div className="space-y-1.5 border-t border-gray-100 pt-2.5">
                  <div className="flex items-center justify-between px-3 text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    <span>Products</span>
                    <span className="text-[10px] font-medium text-gray-400">
                      {suggestions.products.length} match{suggestions.products.length > 1 ? 'es' : ''}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {navigableItems
                      .filter((item) => item.type === 'product')
                      .map((item) => {
                        const globalIdx = navigableItems.findIndex((i) => i.id === item.id);
                        const isItemActive = activeIndex === globalIdx;
                        const prod = item.product!;
                        return (
                          <div
                            key={item.id}
                            id={`suggestion-item-${globalIdx}`}
                            role="option"
                            aria-selected={isItemActive}
                            onClick={() => handleSelectItem(item)}
                            onMouseEnter={() => setActiveIndex(globalIdx)}
                            className={cn(
                              'flex cursor-pointer items-center gap-3 rounded-xl p-2 transition-colors',
                              isItemActive
                                ? 'bg-brand-50/80 ring-1 ring-brand-300'
                                : 'hover:bg-gray-50'
                            )}
                          >
                            {/* Product Thumbnail */}
                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-gray-100 border border-gray-200/60">
                              {prod.thumbnail ? (
                                <Image
                                  src={prod.thumbnail}
                                  alt={prod.title}
                                  fill
                                  sizes="44px"
                                  className="object-cover object-top"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-gray-300">
                                  <PackageOpen className="h-5 w-5" />
                                </div>
                              )}
                            </div>

                            {/* Product Details */}
                            <div className="flex flex-1 flex-col min-w-0">
                              <span className="truncate text-xs font-bold text-gray-900">
                                {prod.title}
                              </span>
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                {prod.brand && <span>{prod.brand}</span>}
                                {prod.brand && prod.categoryName && <span>•</span>}
                                {prod.categoryName && <span>{prod.categoryName}</span>}
                              </div>
                            </div>

                            {/* Price & Discount */}
                            <div className="flex flex-col items-end shrink-0">
                              <span className="text-xs font-black text-gray-900">
                                ₹{prod.price.toLocaleString('en-IN')}
                              </span>
                              {prod.originalPrice && prod.originalPrice > prod.price && (
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] text-gray-400 line-through">
                                    ₹{prod.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                  {prod.discountPercentage && prod.discountPercentage > 0 && (
                                    <span className="text-[9px] font-bold text-green-600">
                                      {prod.discountPercentage}% off
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* 6. Zero Direct Results State */}
              {!isLoadingSuggestions &&
                (!suggestions?.products || suggestions.products.length === 0) &&
                (!suggestions?.categories || suggestions.categories.length === 0) &&
                (!suggestions?.collections || suggestions.collections.length === 0) && (
                  <div className="py-4 text-center">
                    <p className="text-xs font-semibold text-gray-600">
                      No direct matches found for &ldquo;{query.trim()}&rdquo;
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-400">
                      Press Enter to search entire catalog
                    </p>
                  </div>
                )}

              {/* 7. View All Results Footer */}
              {navigableItems
                .filter((item) => item.type === 'view_all')
                .map((item) => {
                  const globalIdx = navigableItems.findIndex((i) => i.id === item.id);
                  const isItemActive = activeIndex === globalIdx;
                  return (
                    <div
                      key={item.id}
                      id={`suggestion-item-${globalIdx}`}
                      role="option"
                      aria-selected={isItemActive}
                      onClick={() => handleSelectItem(item)}
                      onMouseEnter={() => setActiveIndex(globalIdx)}
                      className={cn(
                        'flex cursor-pointer items-center justify-between rounded-xl border-t border-gray-100 px-3 py-2.5 text-xs font-bold transition-colors',
                        isItemActive
                          ? 'bg-brand-600 text-white'
                          : 'bg-gray-50/70 text-brand-600 hover:bg-brand-50'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="h-3.5 w-3.5" />
                        <span>View all results for &ldquo;{query.trim()}&rdquo;</span>
                      </div>
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  );
                })}
            </div>
          ) : (
            /* Empty Query: Trending Searches & Popular Categories */
            <div className="space-y-4 p-1">
              {/* Trending Searches */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <TrendingUp className="h-3.5 w-3.5 text-brand-600" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeTrendingSearches.map((item, idx) => {
                    const isItemActive = activeIndex === idx;
                    return (
                      <button
                        key={item}
                        id={`suggestion-item-${idx}`}
                        role="option"
                        aria-selected={isItemActive}
                        type="button"
                        onClick={() => handleSelectTrending(item)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                          isItemActive
                            ? 'bg-brand-600 text-white shadow-xs'
                            : 'bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-700'
                        )}
                      >
                        <Sparkles className="h-3 w-3 text-brand-500" />
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Popular Categories */}
              <div className="space-y-2 border-t border-gray-100 pt-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  <FolderTree className="h-3.5 w-3.5 text-brand-600" />
                  <span>Explore Popular Categories</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activePopularCategories.map((cat) => (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        router.push(cat.href);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-gray-50 border border-gray-200/80 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:border-brand-300 hover:bg-brand-50/50 hover:text-brand-700 transition-colors"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="h-3 w-3 opacity-50" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SearchBar.displayName = 'SearchBar';
