export interface ProductSuggestion {
  id: string;
  title: string;
  handle: string;
  thumbnail: string | null;
  price: number;
  originalPrice?: number;
  currencyCode: string;
}

export interface CategorySuggestion {
  id: string;
  name: string;
  handle: string;
}

export interface CollectionSuggestion {
  id: string;
  title: string;
  handle: string;
}

export interface SearchSuggestionsResult {
  query: string;
  products: ProductSuggestion[];
  categories: CategorySuggestion[];
  collections: CollectionSuggestion[];
  totalResults: number;
}

export interface SearchFilters {
  categoryHandle?: string;
  collectionHandle?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'created_at' | 'relevance';
}

export interface SearchProductResult {
  products: ProductSuggestion[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface SearchService {
  getSuggestions(query: string): Promise<SearchSuggestionsResult>;
  searchProducts(
    query: string,
    filters?: SearchFilters,
    page?: number,
    pageSize?: number
  ): Promise<SearchProductResult>;
}
