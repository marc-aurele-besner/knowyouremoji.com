'use client';

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { SearchResults } from './search-results';
import { emojiEvents, errorEvents } from '@/lib/analytics';
import type { EmojiSummary } from '@/types/emoji';

/** Delay between the last keystroke and the request. */
const DEBOUNCE_MS = 200;
/** Number of suggestions shown in the dropdown. */
const RESULT_LIMIT = 6;

export interface SearchBarProps {
  className?: string;
  placeholder?: string;
}

function SearchBar({ className, placeholder = 'Search emojis...' }: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<EmojiSummary[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Incremented for every request and every reset, so a slow response that
  // arrives after a newer keystroke (or after the box was cleared) is ignored.
  const requestIdRef = useRef(0);

  const cancelPending = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    requestIdRef.current++;
    setIsLoading(false);
  }, []);

  const resetDropdown = useCallback(() => {
    setResults([]);
    setIsOpen(false);
    setHasError(false);
    setSelectedIndex(-1);
  }, []);

  const fetchResults = useCallback(async (searchQuery: string) => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    setHasError(false);
    try {
      const response = await fetch(
        `/api/emojis/search?q=${encodeURIComponent(searchQuery)}&limit=${RESULT_LIMIT}`
      );
      if (!response.ok) {
        throw new Error(`Search request failed with status ${response.status}`);
      }
      const data = await response.json();
      if (requestId !== requestIdRef.current) return;

      const emojis: EmojiSummary[] = data.emojis || [];
      setResults(emojis);
      setIsOpen(true);
      setSelectedIndex(-1);

      emojiEvents.search(searchQuery, emojis.length);
      if (emojis.length === 0) {
        errorEvents.searchNoResults(searchQuery);
      }
    } catch {
      if (requestId !== requestIdRef.current) return;
      setResults([]);
      setSelectedIndex(-1);
      setHasError(true);
      setIsOpen(true);
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      cancelPending();

      if (!value.trim()) {
        resetDropdown();
        return;
      }

      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        fetchResults(value.trim());
      }, DEBOUNCE_MS);
    },
    [cancelPending, resetDropdown, fetchResults]
  );

  const handleClear = useCallback(() => {
    cancelPending();
    setQuery('');
    resetDropdown();
    inputRef.current?.focus();
  }, [cancelPending, resetDropdown]);

  const goToSearchPage = useCallback(() => {
    const trimmed = query.trim();
    if (!trimmed) return;
    cancelPending();
    setIsOpen(false);
    setSelectedIndex(-1);
    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  }, [query, cancelPending, router]);

  const handleSelect = useCallback(
    (emoji: EmojiSummary, position: number = 0) => {
      // Track search result click
      emojiEvents.searchResultClick(emoji.character, emoji.slug, position);

      cancelPending();
      setQuery('');
      resetDropdown();
      router.push(`/emoji/${emoji.slug}`);
    },
    [cancelPending, resetDropdown, router]
  );

  const handleSubmit = useCallback(
    (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      goToSearchPage();
    },
    [goToSearchPage]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      // Let IME composition (e.g. CJK input) confirm characters without acting on them.
      if (e.nativeEvent.isComposing) return;

      if (e.key === 'Escape') {
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
        } else {
          inputRef.current?.blur();
        }
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        if (results.length === 0) return;
        e.preventDefault();
        // Arrow keys reopen a dropdown that Escape or an outside click closed.
        if (!isOpen) {
          setIsOpen(true);
          return;
        }
        if (e.key === 'ArrowDown') {
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
        } else {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
        }
        return;
      }

      // Enter with a highlighted suggestion opens it. Otherwise the event falls
      // through to the form, which opens the full search page.
      if (e.key === 'Enter' && isOpen && selectedIndex >= 0 && selectedIndex < results.length) {
        e.preventDefault();
        handleSelect(results[selectedIndex], selectedIndex);
      }
    },
    [isOpen, results, selectedIndex, handleSelect]
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Cancel the pending debounce and any in-flight request on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      requestIdRef.current++;
    };
  }, []);

  // `isOpen` is only ever set after a request for a non-empty query (or its failure).
  const showListbox = isOpen;
  const showClearButton = query.length > 0 && !isLoading;

  return (
    <form
      ref={containerRef}
      role="search"
      action="/search"
      method="get"
      onSubmit={handleSubmit}
      className={cn('relative', className)}
    >
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
        <input
          ref={inputRef}
          type="search"
          role="combobox"
          name="q"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          aria-label="Search emojis"
          aria-expanded={showListbox}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          aria-controls={showListbox ? 'search-results' : undefined}
          aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
          autoComplete="off"
          enterKeyHint="search"
          spellCheck={false}
          className={cn(
            'h-10 w-full rounded-full border border-card-border bg-card pl-9 pr-10 text-sm text-foreground',
            'placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden',
            'transition-[border-color,box-shadow] focus:outline-none focus-visible:border-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-500/25'
          )}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2" role="status">
            <span className="sr-only">Searching</span>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-card-border border-t-primary-500" />
          </div>
        )}
        {showClearButton && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="2.5"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {showListbox && (
        <SearchResults
          results={results}
          selectedIndex={selectedIndex}
          onSelect={handleSelect}
          onHover={setSelectedIndex}
          query={query}
          hasError={hasError}
          onViewAll={goToSearchPage}
        />
      )}
    </form>
  );
}

SearchBar.displayName = 'SearchBar';

export { SearchBar };
