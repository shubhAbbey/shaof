/**
 * Phase 14: Search Abstraction & Backend Integration
 * Reusable normalized search interfaces and SearchProvider contracts.
 */

import { StorefrontProduct, ProductFacets } from '../commerce';

export type SuggestionType = 'query' | 'product' | 'category' | 'collection' | 'brand';

export interface SearchSuggestionItem {
  id: string;
  title: string;
  type: SuggestionType;
  query?: string;
  handle?: string;
  categoryName?: string;
  categoryHandle?: string;
  collectionTitle?: string;
  collectionHandle?: string;
  brand?: string;
  thumbnail?: string | null;
  price?: number;
  originalPrice?: number;
  discountPercentage?: number;
}

export interface SearchSuggestionsResult {
  query: string;
  suggestions: SearchSuggestionItem[];
  products: StorefrontProduct[];
  categories: { id: string; name: string; handle: string }[];
  collections?: { id: string; title: string; handle: string }[];
  brands: string[];
  totalSuggestions: number;
}

export interface SearchOptions {
  limit?: number;
  categoryHandle?: string;
  brand?: string;
}

export interface FullSearchOptions extends SearchOptions {
  page?: number;
  limit?: number;
  offset?: number;
  collectionHandle?: string;
  brands?: string[];
  sizes?: string[];
  colors?: string[];
  priceMin?: number;
  priceMax?: number;
  inStock?: boolean;
  onSaleOnly?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'newest';
}

export interface FullSearchResult {
  query: string;
  products: StorefrontProduct[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  limit: number;
  offset: number;
  facets: ProductFacets;
  appliedFilters?: {
    categoryHandle?: string;
    brands?: string[];
    sizes?: string[];
    colors?: string[];
    priceMin?: number;
    priceMax?: number;
    inStock?: boolean;
    sort?: string;
  };
}

/**
 * Unified Search Provider Interface
 * Allows interchangeable backends (Medusa, OpenSearch, Elasticsearch, Algolia, Meilisearch)
 * without rewriting the UI or application consumers.
 */
export interface ISearchProvider {
  readonly name: string;

  /**
   * Fast, lightweight suggestions/autocomplete for real-time search inputs.
   */
  suggestions(
    query: string,
    options?: SearchOptions,
    signal?: AbortSignal
  ): Promise<SearchSuggestionsResult>;

  /**
   * Comprehensive full search with facets, pagination, and multi-dimensional filtering.
   */
  search(
    query: string,
    options?: FullSearchOptions,
    signal?: AbortSignal
  ): Promise<FullSearchResult>;
}
