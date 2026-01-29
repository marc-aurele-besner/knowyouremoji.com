'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { EmojiSummary } from '@/types/emoji';

export interface UseEmojiSearchOptions {
  /** Array of emojis to search through */
  emojis: EmojiSummary[];
  /** Initial search query */
  initialQuery?: string;
  /** Initial category filter */
  initialCategory?: string;
  /** Debounce delay in milliseconds (0 = no debounce) */
  debounceMs?: number;
}

export interface UseEmojiSearchReturn {
  /** Filtered/searched emoji results */
  results: EmojiSummary[];
  /** Current search query */
  query: string;
  /** Current category filter */
  category: string;
  /** Set the search query */
  setQuery: (query: string) => void;
  /** Set the category filter */
  setCategory: (category: string) => void;
  /** Clear both query and category */
  clearSearch: () => void;
  /** Clear only the query */
  clearQuery: () => void;
  /** Clear only the category filter */
  clearCategory: () => void;
  /** List of unique categories from emojis */
  categories: string[];
  /** Number of results after filtering */
  resultCount: number;
  /** Total count of emojis (before filtering) */
  totalCount: number;
  /** Whether results are empty */
  isEmpty: boolean;
  /** Whether a search query is active */
  isSearching: boolean;
  /** Whether a category filter is active */
  isFiltering: boolean;
  /** Whether any filters (query or category) are active */
  hasActiveFilters: boolean;
}

/**
 * Custom hook for searching and filtering emojis from static data.
 *
 * Provides client-side search functionality with support for:
 * - Text search by name, character, category, tldr, and slug
 * - Category filtering
 * - Optional debouncing for performance
 *
 * @example
 * ```tsx
 * const {
 *   results,
 *   query,
 *   setQuery,
 *   category,
 *   setCategory,
 *   clearSearch,
 * } = useEmojiSearch({ emojis });
 *
 * // With initial values
 * const { results } = useEmojiSearch({
 *   emojis,
 *   initialQuery: 'skull',
 *   initialCategory: 'faces',
 * });
 *
 * // With debouncing
 * const { results } = useEmojiSearch({
 *   emojis,
 *   debounceMs: 200,
 * });
 * ```
 */
export function useEmojiSearch({
  emojis,
  initialQuery = '',
  initialCategory = '',
  debounceMs = 0,
}: UseEmojiSearchOptions): UseEmojiSearchReturn {
  const [query, setQueryState] = useState(initialQuery);
  const [category, setCategoryState] = useState(initialCategory);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce timer ref
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Handle debounced query updates (only when debounceMs > 0)
  useEffect(() => {
    // Skip effect when debounce is disabled - we use query directly in that case
    if (debounceMs === 0) {
      return;
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    // Cleanup on unmount or when query/debounceMs changes
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, debounceMs]);

  // Extract unique categories from emojis, sorted alphabetically
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(emojis.map((emoji) => emoji.category))];
    return uniqueCategories.sort();
  }, [emojis]);

  // Filter emojis based on search query and category
  const results = useMemo(() => {
    let result = emojis;

    // Filter by category first
    if (category) {
      result = result.filter((emoji) => emoji.category === category);
    }

    // Filter by search query (use debounced query when debouncing is enabled)
    const searchQuery = debounceMs > 0 ? debouncedQuery : query;
    if (searchQuery) {
      const normalizedQuery = searchQuery.toLowerCase();
      result = result.filter((emoji) => {
        return (
          emoji.name.toLowerCase().includes(normalizedQuery) ||
          emoji.character.includes(searchQuery) ||
          emoji.category.toLowerCase().includes(normalizedQuery) ||
          emoji.tldr.toLowerCase().includes(normalizedQuery) ||
          emoji.slug.toLowerCase().includes(normalizedQuery)
        );
      });
    }

    return result;
  }, [emojis, query, debouncedQuery, category, debounceMs]);

  // Set query handler - also sync debouncedQuery when not debouncing
  const setQuery = useCallback(
    (newQuery: string) => {
      setQueryState(newQuery);
      // When debounce is disabled, keep debouncedQuery in sync
      if (debounceMs === 0) {
        setDebouncedQuery(newQuery);
      }
    },
    [debounceMs]
  );

  // Set category handler
  const setCategory = useCallback((newCategory: string) => {
    setCategoryState(newCategory);
  }, []);

  // Clear search (both query and category)
  const clearSearch = useCallback(() => {
    setQueryState('');
    setCategoryState('');
    setDebouncedQuery('');
  }, []);

  // Clear only query
  const clearQuery = useCallback(() => {
    setQueryState('');
    setDebouncedQuery('');
  }, []);

  // Clear only category
  const clearCategory = useCallback(() => {
    setCategoryState('');
  }, []);

  // Computed values
  const resultCount = results.length;
  const totalCount = emojis.length;
  const isEmpty = results.length === 0;
  const isSearching = query.length > 0;
  const isFiltering = category.length > 0;
  const hasActiveFilters = isSearching || isFiltering;

  return {
    results,
    query,
    category,
    setQuery,
    setCategory,
    clearSearch,
    clearQuery,
    clearCategory,
    categories,
    resultCount,
    totalCount,
    isEmpty,
    isSearching,
    isFiltering,
    hasActiveFilters,
  };
}
