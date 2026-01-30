'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useEmojiSearch } from '@/hooks/use-emoji-search';
import { useComboSearch } from '@/hooks/use-combo-search';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { EmojiSummary } from '@/types/emoji';
import type { EmojiComboSummary } from '@/types/combo';

export interface SearchPageClientProps {
  /** Array of emojis to search through */
  emojis: EmojiSummary[];
  /** Array of combos to search through */
  combos: EmojiComboSummary[];
  /** Initial search query from URL params */
  initialQuery?: string;
  /** Initial active tab */
  initialTab?: 'emojis' | 'combos';
  /** Additional CSS classes */
  className?: string;
}

type SearchTab = 'emojis' | 'combos';

/**
 * SearchPageClient component provides a unified search interface
 * for both emojis and combos with tabbed navigation.
 */
function SearchPageClient({
  emojis,
  combos,
  initialQuery = '',
  initialTab = 'emojis',
  className,
}: SearchPageClientProps) {
  const [activeTab, setActiveTab] = useState<SearchTab>(initialTab);

  // Emoji search
  const {
    results: emojiResults,
    query: emojiQuery,
    category: emojiCategory,
    setQuery: setEmojiQuery,
    setCategory: setEmojiCategory,
    clearQuery: clearEmojiQuery,
    categories: emojiCategories,
    resultCount: emojiResultCount,
  } = useEmojiSearch({ emojis, initialQuery });

  // Combo search
  const {
    results: comboResults,
    query: comboQuery,
    category: comboCategory,
    setQuery: setComboQuery,
    setCategory: setComboCategory,
    clearQuery: clearComboQuery,
    categories: comboCategories,
    resultCount: comboResultCount,
  } = useComboSearch({ combos, initialQuery });

  // Unified query state - both tabs share the same search term
  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setEmojiQuery(value);
      setComboQuery(value);
    },
    [setEmojiQuery, setComboQuery]
  );

  const handleClearSearch = useCallback(() => {
    clearEmojiQuery();
    clearComboQuery();
  }, [clearEmojiQuery, clearComboQuery]);

  const handleEmojiCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setEmojiCategory(event.target.value);
    },
    [setEmojiCategory]
  );

  const handleComboCategoryChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      setComboCategory(event.target.value);
    },
    [setComboCategory]
  );

  const handleTabChange = useCallback((tab: SearchTab) => {
    setActiveTab(tab);
  }, []);

  const currentQuery = activeTab === 'emojis' ? emojiQuery : comboQuery;
  const currentResultCount = activeTab === 'emojis' ? emojiResultCount : comboResultCount;

  // Category display name mapping for combos
  const comboCategoryDisplayNames: Record<string, string> = {
    flirting: 'Flirting & Romance',
    friendship: 'Friendship',
    celebration: 'Celebration',
    emotion: 'Emotion',
    emotions: 'Emotions',
    reaction: 'Reaction',
    reactions: 'Reactions',
    humor: 'Humor',
    sarcasm: 'Sarcasm',
    relationship: 'Relationship',
    work: 'Work',
    food: 'Food',
    travel: 'Travel',
    other: 'Other',
  };

  return (
    <div data-testid="search-page-client" className={cn('space-y-6', className)}>
      {/* Search Input */}
      <div className="relative">
        <span
          data-testid="search-icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl"
          aria-hidden="true"
        >
          🔍
        </span>
        <Input
          type="search"
          role="searchbox"
          placeholder="Search emojis and combos..."
          value={currentQuery}
          onChange={handleSearchChange}
          className="pl-12 pr-12 h-14 text-lg"
          aria-label="Search emojis and combos"
        />
        {currentQuery && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => handleTabChange('emojis')}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'emojis'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          )}
          aria-selected={activeTab === 'emojis'}
          role="tab"
        >
          Emojis ({emojiResultCount})
          {activeTab === 'emojis' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('combos')}
          className={cn(
            'px-4 py-3 text-sm font-medium transition-colors relative',
            activeTab === 'combos'
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
          )}
          aria-selected={activeTab === 'combos'}
          role="tab"
        >
          Combos ({comboResultCount})
          {activeTab === 'combos' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-500" />
          )}
        </button>
      </div>

      {/* Category Filter & Result Count */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-48">
          {activeTab === 'emojis' ? (
            <select
              value={emojiCategory}
              onChange={handleEmojiCategoryChange}
              className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:text-gray-100"
              aria-label="Filter emojis by category"
            >
              <option value="">All categories</option>
              {emojiCategories.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={comboCategory}
              onChange={handleComboCategoryChange}
              className="h-10 w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 dark:text-gray-100"
              aria-label="Filter combos by category"
            >
              <option value="">All categories</option>
              {comboCategories.map((category) => (
                <option key={category} value={category}>
                  {comboCategoryDisplayNames[category] ||
                    category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          )}
        </div>

        <span className="text-sm text-gray-600 dark:text-gray-400" role="status" aria-live="polite">
          {currentResultCount} {activeTab === 'emojis' ? 'emoji' : 'combo'}
          {currentResultCount !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Results */}
      {activeTab === 'emojis' ? (
        emojiResults.length === 0 ? (
          <div className="py-12 text-center" data-testid="no-emoji-results">
            <p className="text-gray-500 dark:text-gray-400">
              No emojis found matching your search.
            </p>
            <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
              Try a different search term or category.
            </p>
          </div>
        ) : (
          <ul
            role="list"
            aria-label="Emoji results"
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3"
          >
            {emojiResults.map((emoji) => (
              <li key={emoji.slug}>
                <Link href={`/emoji/${emoji.slug}`} className="block" aria-label={emoji.name}>
                  <Card className="text-center hover:shadow-lg hover:scale-105 hover:border-amber-500 transition-all duration-200">
                    <CardContent className="py-4 px-2">
                      <span className="text-4xl block mb-1">{emoji.character}</span>
                      <p className="font-medium text-gray-900 dark:text-white text-xs truncate">
                        {emoji.name}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : comboResults.length === 0 ? (
        <div className="py-12 text-center" data-testid="no-combo-results">
          <p className="text-gray-500 dark:text-gray-400">No combos found matching your search.</p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
            Try a different search term or category.
          </p>
        </div>
      ) : (
        <ul
          role="list"
          aria-label="Combo results"
          className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {comboResults.map((combo) => (
            <li key={combo.slug}>
              <Link href={`/combo/${combo.slug}`} className="block" aria-label={combo.name}>
                <Card className="hover:shadow-lg hover:scale-105 hover:border-amber-500 transition-all duration-200 h-full">
                  <CardHeader className="text-center pb-2">
                    <span className="text-4xl mb-2 block">{combo.combo}</span>
                    <CardTitle className="text-base">{combo.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                      {combo.meaning}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

SearchPageClient.displayName = 'SearchPageClient';

export { SearchPageClient };
