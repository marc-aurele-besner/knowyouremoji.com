'use client';

import { useCallback, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEmojiSearch } from '@/hooks/use-emoji-search';
import { errorEvents } from '@/lib/analytics';
import type { EmojiSummary } from '@/types/emoji';

export interface NotFoundSearchProps {
  /** Array of emojis to search through */
  emojis: EmojiSummary[];
  /** Show the first results before the user types (default: true) */
  showInitialResults?: boolean;
}

/**
 * Client-side search component for the 404 page
 * Allows users to search for emojis when they land on a non-existent page
 */
export function NotFoundSearch({ emojis, showInitialResults = true }: NotFoundSearchProps) {
  const pathname = usePathname();

  // Track 404 page view on mount
  useEffect(() => {
    errorEvents.pageNotFound(pathname || '/unknown');
  }, [pathname]);

  const {
    results: filteredEmojis,
    query: searchQuery,
    setQuery,
    clearQuery,
    resultCount,
  } = useEmojiSearch({ emojis });

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    [setQuery]
  );

  const handleClearSearch = useCallback(() => {
    clearQuery();
  }, [clearQuery]);

  return (
    <div>
      <h2 className="sr-only">Search for an Emoji</h2>

      {/* Search Input */}
      <div className="relative mx-auto mb-6 max-w-[480px]">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground"
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
          type="search"
          role="searchbox"
          placeholder="Search emojis by name or character..."
          value={searchQuery}
          onChange={handleSearchChange}
          autoComplete="off"
          className="h-[50px] w-full rounded-full border border-card-border bg-card pl-11 pr-12 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500/25 [&::-webkit-search-cancel-button]:hidden"
          aria-label="Search emojis"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            aria-label="Clear search"
          >
            <span aria-hidden="true">✕</span>
          </button>
        )}
      </div>

      {/* Result Count */}
      {searchQuery && (
        <p className="mb-4 text-center text-sm text-muted-foreground" role="status">
          {resultCount} emoji{resultCount !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Emoji Results Grid */}
      {!searchQuery && !showInitialResults ? null : filteredEmojis.length > 0 ? (
        <ul
          role="list"
          aria-label="Emoji results"
          className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6"
        >
          {filteredEmojis.slice(0, 12).map((emoji: EmojiSummary) => (
            <li key={emoji.slug}>
              <Link
                href={`/emoji/${emoji.slug}`}
                className="flex h-full flex-col items-center gap-2 rounded-2xl border border-card-border bg-card px-2 py-3.5 text-center text-foreground transition-[border-color,box-shadow] hover:border-primary-500/60 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                aria-label={emoji.name}
              >
                <span className="emoji-display text-3xl leading-none" aria-hidden="true">
                  {emoji.character}
                </span>
                <span className="w-full truncate text-[12.5px] font-semibold">{emoji.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-card-border px-6 py-10 text-center text-muted-foreground">
          <span className="text-3xl" aria-hidden="true">
            🔍
          </span>
          <p className="font-semibold text-foreground">No emojis found matching your search.</p>
        </div>
      )}
    </div>
  );
}
