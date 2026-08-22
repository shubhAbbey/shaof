'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';

const TRENDING_SEARCHES = [
  'Kurta Sets',
  'Oversized T-Shirts',
  'Floral Maxi Dresses',
  'Linen Shirts',
  'Embroidered Sarees',
  'Cargo Pants',
];

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
  autoFocus?: boolean;
  onSearchSubmit?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  placeholder = 'Search for kurtas, dresses, t-shirts, brands and more...',
  autoFocus = false,
  onSearchSubmit,
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      setIsOpen(false);
      if (onSearchSubmit) {
        onSearchSubmit(trimmed);
      } else {
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
      }
    }
  };

  const handleSelectTrending = (item: string) => {
    setQuery(item);
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(item);
    } else {
      router.push(`/search?q=${encodeURIComponent(item)}`);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-xl', className)}>
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
          placeholder={placeholder}
          autoFocus={autoFocus}
          aria-label="Search catalog"
          aria-expanded={isOpen}
          aria-controls="search-suggestions-list"
          aria-autocomplete="list"
          className="h-10 w-full rounded-full border border-gray-200 bg-gray-50/80 pl-10 pr-10 text-sm text-gray-900 placeholder:text-gray-400 transition-all focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            className="absolute right-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown Suggestions Entry Point */}
      {isOpen && (
        <div
          id="search-suggestions-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-xl animate-fadeIn"
        >
          {query.trim() ? (
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-brand-600 hover:bg-brand-50 transition-colors font-medium text-left"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>
                    Search for &ldquo;<strong>{query}</strong>&rdquo;
                  </span>
                </div>
                <span className="text-xs text-gray-400">Press Enter</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <TrendingUp className="h-3.5 w-3.5 text-brand-600" />
                Trending Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSelectTrending(item)}
                    className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                  >
                    <Sparkles className="h-3 w-3 text-brand-500" />
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
