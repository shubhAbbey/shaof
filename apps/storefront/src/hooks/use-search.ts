/**
 * Phase 14: Search Abstraction & Backend Integration
 * Reusable useSearch hook with debouncing, request cancellation,
 * and stale-response protection.
 */

'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  ISearchProvider,
  SearchSuggestionsResult,
  FullSearchResult,
  SearchOptions,
  FullSearchOptions,
} from '../lib/search/types';
import { getSearchProvider } from '../lib/search';

export interface UseSearchOptions {
  provider?: ISearchProvider;
  debounceMs?: number;
  minQueryLength?: number;
  initialQuery?: string;
  autoFetchSuggestions?: boolean;
}

export interface UseSearchResult {
  query: string;
  setQuery: (q: string) => void;
  suggestions: SearchSuggestionsResult | null;
  fullResults: FullSearchResult | null;
  isLoadingSuggestions: boolean;
  isSearching: boolean;
  error: Error | null;
  fetchSuggestions: (q: string, immediate?: boolean, options?: SearchOptions) => Promise<void>;
  executeSearch: (q: string, options?: FullSearchOptions) => Promise<FullSearchResult | null>;
  clear: () => void;
}

export function useSearch(options: UseSearchOptions = {}): UseSearchResult {
  const {
    provider = getSearchProvider(),
    debounceMs = 250,
    minQueryLength = 1,
    initialQuery = '',
    autoFetchSuggestions = true,
  } = options;

  const [query, setQueryState] = useState<string>(initialQuery);
  const [suggestions, setSuggestions] = useState<SearchSuggestionsResult | null>(null);
  const [fullResults, setFullResults] = useState<FullSearchResult | null>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Stale-response protection sequence tracking
  const suggestionSequenceRef = useRef<number>(0);
  const searchSequenceRef = useRef<number>(0);

  // Active in-flight AbortControllers for cancellation
  const suggestionAbortControllerRef = useRef<AbortController | null>(null);
  const searchAbortControllerRef = useRef<AbortController | null>(null);

  // Debounce timer ref
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    if (suggestionAbortControllerRef.current) {
      suggestionAbortControllerRef.current.abort();
      suggestionAbortControllerRef.current = null;
    }
    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort();
      searchAbortControllerRef.current = null;
    }
    setQueryState('');
    setSuggestions(null);
    setFullResults(null);
    setIsLoadingSuggestions(false);
    setIsSearching(false);
    setError(null);
  }, []);

  const fetchSuggestions = useCallback(
    async (rawQuery: string, immediate = false, searchOpts?: SearchOptions) => {
      const q = rawQuery.trim();

      // Clear any pending debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      const runFetch = async () => {
        // Abort previous in-flight suggestions request
        if (suggestionAbortControllerRef.current) {
          suggestionAbortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        suggestionAbortControllerRef.current = abortController;

        const currentSeq = ++suggestionSequenceRef.current;
        setIsLoadingSuggestions(true);
        setError(null);

        try {
          const result = await provider.suggestions(q, searchOpts, abortController.signal);

          // Stale-response protection: Only commit state if this is still the newest request
          if (currentSeq === suggestionSequenceRef.current && !abortController.signal.aborted) {
            setSuggestions(result);
            setIsLoadingSuggestions(false);
          }
        } catch (err: any) {
          if (err?.name === 'AbortError' || abortController.signal.aborted) {
            // Ignored cancelled request
            return;
          }
          if (currentSeq === suggestionSequenceRef.current) {
            console.error('Search suggestions error:', err);
            setError(err instanceof Error ? err : new Error(String(err)));
            setIsLoadingSuggestions(false);
          }
        }
      };

      if (immediate || !debounceMs || q.length === 0) {
        await runFetch();
      } else {
        setIsLoadingSuggestions(true);
        debounceTimerRef.current = setTimeout(() => {
          runFetch();
        }, debounceMs);
      }
    },
    [provider, debounceMs]
  );

  const executeSearch = useCallback(
    async (rawQuery: string, searchOpts?: FullSearchOptions): Promise<FullSearchResult | null> => {
      const q = rawQuery.trim();

      // Cancel any pending debounced suggestion timers
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Abort previous in-flight full search request
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }

      const abortController = new AbortController();
      searchAbortControllerRef.current = abortController;

      const currentSeq = ++searchSequenceRef.current;
      setIsSearching(true);
      setError(null);

      try {
        const result = await provider.search(q, searchOpts, abortController.signal);

        if (currentSeq === searchSequenceRef.current && !abortController.signal.aborted) {
          setFullResults(result);
          setIsSearching(false);
          return result;
        }
        return null;
      } catch (err: any) {
        if (err?.name === 'AbortError' || abortController.signal.aborted) {
          return null;
        }
        if (currentSeq === searchSequenceRef.current) {
          console.error('Full search execution error:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
          setIsSearching(false);
        }
        return null;
      }
    },
    [provider]
  );

  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery);
      if (autoFetchSuggestions) {
        if (newQuery.trim().length >= minQueryLength) {
          fetchSuggestions(newQuery, false);
        } else {
          // Query cleared or below threshold
          fetchSuggestions('', true);
        }
      }
    },
    [autoFetchSuggestions, minQueryLength, fetchSuggestions]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (suggestionAbortControllerRef.current) {
        suggestionAbortControllerRef.current.abort();
      }
      if (searchAbortControllerRef.current) {
        searchAbortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    query,
    setQuery,
    suggestions,
    fullResults,
    isLoadingSuggestions,
    isSearching,
    error,
    fetchSuggestions,
    executeSearch,
    clear,
  };
}
