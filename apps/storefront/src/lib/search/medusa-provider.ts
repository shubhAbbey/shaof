/**
 * Phase 14: Search Abstraction & Backend Integration
 * Medusa-backed search provider implementing ISearchProvider interface.
 */

import { fetchPlpProducts, StorefrontProduct, ProductFacets } from '../commerce';
import { NAVIGATION_CATEGORIES } from '../../data/navigation';
import {
  ISearchProvider,
  SearchOptions,
  FullSearchOptions,
  SearchSuggestionsResult,
  SearchSuggestionItem,
  FullSearchResult,
} from './types';

const DEFAULT_TRENDING_QUERIES = [
  'Kurta Sets',
  'Oversized T-Shirts',
  'Floral Maxi Dresses',
  'Linen Shirts',
  'Embroidered Sarees',
  'Cargo Pants',
];

export class MedusaSearchProvider implements ISearchProvider {
  readonly name = 'medusa';

  /**
   * Fast, lightweight suggestions/autocomplete for real-time search inputs.
   */
  async suggestions(
    query: string,
    options: SearchOptions = {},
    signal?: AbortSignal
  ): Promise<SearchSuggestionsResult> {
    const trimmedQuery = (query || '').trim();

    // Direct / empty query: Return clean empty/popular state without expensive remote roundtrip
    if (!trimmedQuery) {
      const defaultSuggestions: SearchSuggestionItem[] = DEFAULT_TRENDING_QUERIES.map((q) => ({
        id: `trend_${q.toLowerCase().replace(/\s+/g, '_')}`,
        title: q,
        type: 'query',
        query: q,
      }));

      return {
        query: '',
        suggestions: defaultSuggestions,
        products: [],
        categories: [],
        brands: [],
        totalSuggestions: defaultSuggestions.length,
      };
    }

    if (signal?.aborted) {
      const error = new Error('Search suggestions request was cancelled');
      error.name = 'AbortError';
      throw error;
    }

    const limit = options.limit || 6;

    try {
      const result = await fetchPlpProducts({
        q: trimmedQuery,
        limit,
        offset: 0,
        categoryHandle: options.categoryHandle,
        brand: options.brand,
      });

      if (signal?.aborted) {
        const error = new Error('Search suggestions request was cancelled');
        error.name = 'AbortError';
        throw error;
      }

      const products: StorefrontProduct[] = result.products || [];
      const suggestions: SearchSuggestionItem[] = [];

      // 1. Direct query matching suggestion
      suggestions.push({
        id: `query_${encodeURIComponent(trimmedQuery)}`,
        title: trimmedQuery,
        type: 'query',
        query: trimmedQuery,
      });

      // 2. Extract matching categories
      const categoriesMap = new Map<string, { id: string; name: string; handle: string }>();
      products.forEach((p) => {
        if (p.categoryName && p.categoryHandle) {
          if (
            p.categoryName.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
            p.categoryHandle.toLowerCase().includes(trimmedQuery.toLowerCase())
          ) {
            categoriesMap.set(p.categoryHandle, {
              id: p.categoryHandle,
              name: p.categoryName,
              handle: p.categoryHandle,
            });
          }
        }
      });

      // Also check navigation categories for direct category matches
      NAVIGATION_CATEGORIES.forEach((cat) => {
        if (cat.name.toLowerCase().includes(trimmedQuery.toLowerCase())) {
          categoriesMap.set(cat.handle, {
            id: cat.id,
            name: cat.name,
            handle: cat.handle,
          });
        }
        cat.groups.forEach((g) => {
          g.items.forEach((item) => {
            if (item.label.toLowerCase().includes(trimmedQuery.toLowerCase())) {
              const handle = item.href.replace('/category/', '').replace('/sale', 'sale');
              categoriesMap.set(handle, {
                id: handle,
                name: item.label,
                handle,
              });
            }
          });
        });
      });

      categoriesMap.forEach((cat) => {
        suggestions.push({
          id: `cat_${cat.handle}`,
          title: `in ${cat.name}`,
          type: 'category',
          categoryName: cat.name,
          categoryHandle: cat.handle,
          query: trimmedQuery,
        });
      });

      // 3. Extract matching collections
      const collectionsMap = new Map<string, { id: string; title: string; handle: string }>();
      products.forEach((p: any) => {
        if (p.collectionTitle && p.collectionHandle) {
          if (
            p.collectionTitle.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
            p.collectionHandle.toLowerCase().includes(trimmedQuery.toLowerCase())
          ) {
            collectionsMap.set(p.collectionHandle, {
              id: p.collectionHandle,
              title: p.collectionTitle,
              handle: p.collectionHandle,
            });
          }
        }
      });

      // Also check featured collections in NAVIGATION_CATEGORIES
      NAVIGATION_CATEGORIES.forEach((cat) => {
        cat.featured?.forEach((f) => {
          if (f.href.startsWith('/collections/')) {
            const handle = f.href.replace('/collections/', '');
            if (
              f.title.toLowerCase().includes(trimmedQuery.toLowerCase()) ||
              handle.toLowerCase().includes(trimmedQuery.toLowerCase())
            ) {
              collectionsMap.set(handle, {
                id: handle,
                title: f.title,
                handle,
              });
            }
          }
        });
      });

      collectionsMap.forEach((col) => {
        suggestions.push({
          id: `col_${col.handle}`,
          title: `Collection: ${col.title}`,
          type: 'collection',
          collectionTitle: col.title,
          collectionHandle: col.handle,
          query: trimmedQuery,
        });
      });

      // 4. Extract matching brands
      const brandsSet = new Set<string>();
      products.forEach((p) => {
        if (p.brand && p.brand.toLowerCase().includes(trimmedQuery.toLowerCase())) {
          brandsSet.add(p.brand);
        }
      });

      brandsSet.forEach((brand) => {
        suggestions.push({
          id: `brand_${brand.toLowerCase().replace(/\s+/g, '_')}`,
          title: `${brand} Brand`,
          type: 'brand',
          brand,
          query: trimmedQuery,
        });
      });

      // 5. Product suggestions (top 4-6 products)
      products.slice(0, 5).forEach((p) => {
        suggestions.push({
          id: `prod_${p.id}`,
          title: p.title,
          type: 'product',
          handle: p.handle,
          thumbnail: p.thumbnail,
          price: p.price,
          originalPrice: p.originalPrice,
          discountPercentage: p.discountPercentage,
          categoryName: p.categoryName,
          categoryHandle: p.categoryHandle,
          brand: p.brand,
        });
      });

      return {
        query: trimmedQuery,
        suggestions,
        products,
        categories: Array.from(categoriesMap.values()),
        collections: Array.from(collectionsMap.values()),
        brands: Array.from(brandsSet),
        totalSuggestions: suggestions.length,
      };
    } catch (error: any) {
      if (error?.name === 'AbortError' || signal?.aborted) {
        throw error;
      }
      console.error('MedusaSearchProvider suggestions error:', error);
      // Graceful error fallback
      return {
        query: trimmedQuery,
        suggestions: [
          {
            id: `query_${encodeURIComponent(trimmedQuery)}`,
            title: trimmedQuery,
            type: 'query',
            query: trimmedQuery,
          },
        ],
        products: [],
        categories: [],
        brands: [],
        totalSuggestions: 1,
      };
    }
  }

  /**
   * Comprehensive full search with facets, pagination, and multi-dimensional filtering.
   */
  async search(
    query: string,
    options: FullSearchOptions = {},
    signal?: AbortSignal
  ): Promise<FullSearchResult> {
    const trimmedQuery = (query || '').trim();

    if (signal?.aborted) {
      const error = new Error('Full search request was cancelled');
      error.name = 'AbortError';
      throw error;
    }

    const limit = options.limit || 24;
    const offset = options.offset !== undefined ? options.offset : ((options.page || 1) - 1) * limit;
    const page = options.page || Math.floor(offset / limit) + 1;

    try {
      const result = await fetchPlpProducts({
        q: trimmedQuery,
        limit,
        offset,
        categoryHandle: options.categoryHandle,
        collectionHandle: options.collectionHandle,
        brands: options.brands,
        brand: options.brand,
        sizes: options.sizes,
        colors: options.colors,
        priceMin: options.priceMin,
        priceMax: options.priceMax,
        inStock: options.inStock,
        onSaleOnly: options.onSaleOnly,
        sort: options.sort || 'relevance',
      });

      if (signal?.aborted) {
        const error = new Error('Full search request was cancelled');
        error.name = 'AbortError';
        throw error;
      }

      return {
        query: trimmedQuery,
        products: result.products,
        totalCount: result.totalCount,
        hasMore: result.hasMore,
        page,
        limit,
        offset,
        facets: result.facets,
        appliedFilters: {
          categoryHandle: options.categoryHandle,
          brands: options.brands,
          sizes: options.sizes,
          colors: options.colors,
          priceMin: options.priceMin,
          priceMax: options.priceMax,
          inStock: options.inStock,
          sort: options.sort,
        },
      };
    } catch (error: any) {
      if (error?.name === 'AbortError' || signal?.aborted) {
        throw error;
      }
      console.error('MedusaSearchProvider search error:', error);
      return {
        query: trimmedQuery,
        products: [],
        totalCount: 0,
        hasMore: false,
        page,
        limit,
        offset,
        facets: { brands: [], sizes: [], colors: [], priceRange: { min: 0, max: 0 } },
      };
    }
  }
}
