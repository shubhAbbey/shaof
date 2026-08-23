/**
 * Phase 14: Search Abstraction & Backend Integration
 * SearchContext & SearchProvider for sharing normalized search state.
 */

'use client';

import React, { createContext, useContext, useMemo } from 'react';
import { useSearch, UseSearchResult, UseSearchOptions } from '../hooks/use-search';

const SearchContext = createContext<UseSearchResult | undefined>(undefined);

export interface SearchProviderProps extends UseSearchOptions {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({
  children,
  ...options
}) => {
  const searchState = useSearch(options);

  return (
    <SearchContext.Provider value={searchState}>
      {children}
    </SearchContext.Provider>
  );
};

SearchProvider.displayName = 'SearchProvider';

export function useSearchContext(): UseSearchResult {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearchContext must be used within a <SearchProvider>');
  }
  return context;
}
