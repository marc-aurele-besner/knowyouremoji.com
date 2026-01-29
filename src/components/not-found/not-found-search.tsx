'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { useEmojiSearch } from '@/hooks/use-emoji-search';
import type { EmojiSummary } from '@/types/emoji';

export interface NotFoundSearchProps {
  /** Array of emojis to search through */
  emojis: EmojiSummary[];
}

/**
 * Client-side search component for the 404 page
 * Allows users to search for emojis when they land on a non-existent page
 */
export function NotFoundSearch({ emojis }: NotFoundSearchProps) {
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
    <div className="mb-12">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4 text-center">
        Search for an Emoji
      </h2>

      {/* Search Input */}
      <div className="relative max-w-md mx-auto mb-6">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true">
          🔍
        </span>
        <Input
          type="search"
          role="searchbox"
          placeholder="Search emojis by name or character..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="pl-10 pr-10"
          aria-label="Search emojis"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Result Count */}
      {searchQuery && (
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
          {resultCount} emoji{resultCount !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Emoji Results Grid */}
      {filteredEmojis.length > 0 ? (
        <ul
          role="list"
          aria-label="Emoji results"
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3"
        >
          {filteredEmojis.slice(0, 12).map((emoji: EmojiSummary) => (
            <li key={emoji.slug}>
              <Link
                href={`/emoji/${emoji.slug}`}
                className="flex flex-col items-center rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                aria-label={emoji.name}
              >
                <span className="text-3xl mb-2" role="img" aria-hidden="true">
                  {emoji.character}
                </span>
                <span className="text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                  {emoji.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500 py-8">No emojis found matching your search.</p>
      )}
    </div>
  );
}
