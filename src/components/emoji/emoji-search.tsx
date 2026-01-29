'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEmojiSearch } from '@/hooks/use-emoji-search';
import type { EmojiSummary } from '@/types/emoji';

export interface EmojiSearchProps {
  /** Array of emojis to search through */
  emojis: EmojiSummary[];
  /** Callback when an emoji is selected */
  onSelect?: (emoji: EmojiSummary) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * EmojiSearch component provides a client-side search interface
 * for filtering emojis by name, character, category, and keywords.
 *
 * @example
 * ```tsx
 * <EmojiSearch emojis={emojis} />
 *
 * <EmojiSearch
 *   emojis={emojis}
 *   onSelect={(emoji) => console.log(emoji)}
 *   className="max-w-2xl"
 * />
 * ```
 */
function EmojiSearch({ emojis, onSelect, className }: EmojiSearchProps) {
  const {
    results: filteredEmojis,
    query: searchQuery,
    category: selectedCategory,
    setQuery,
    setCategory,
    clearQuery,
    categories,
    resultCount,
  } = useEmojiSearch({ emojis });

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setQuery(event.target.value);
    },
    [setQuery]
  );

  const handleCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setCategory(event.target.value);
    },
    [setCategory]
  );

  const handleClearSearch = useCallback(() => {
    clearQuery();
  }, [clearQuery]);

  const handleEmojiClick = useCallback(
    (emoji: EmojiSummary) => {
      onSelect?.(emoji);
    },
    [onSelect]
  );

  // Empty state when no emojis provided
  if (emojis.length === 0) {
    return (
      <div data-testid="emoji-search" className={cn('space-y-4', className)}>
        <p className="text-center text-gray-500">No emojis available</p>
      </div>
    );
  }

  return (
    <div data-testid="emoji-search" className={cn('space-y-4', className)}>
      {/* Search Controls */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* Search Input */}
        <div className="relative flex-1">
          <span
            data-testid="search-icon"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          >
            🔍
          </span>
          <Input
            type="search"
            role="searchbox"
            placeholder="Search emojis by name, character, or keyword..."
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

        {/* Category Filter */}
        <div className="sm:w-48">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>{resultCount} emojis</span>
        <span role="status" aria-live="polite">
          {resultCount} emoji{resultCount !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Results */}
      {filteredEmojis.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-gray-500">No emojis found matching your search.</p>
          <p className="mt-2 text-sm text-gray-400">Try a different search term or category.</p>
        </div>
      ) : (
        <ul
          role="list"
          aria-label="Emoji results"
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        >
          {filteredEmojis.map((emoji) => (
            <li key={emoji.slug}>
              <Link
                href={`/emoji/${emoji.slug}`}
                onClick={() => handleEmojiClick(emoji)}
                className="flex flex-col items-center rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
                aria-label={emoji.name}
              >
                <span className="text-4xl" role="img" aria-hidden="true">
                  {emoji.character}
                </span>
                <span className="mt-2 text-center text-sm font-medium text-gray-700">
                  {emoji.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { EmojiSearch };
