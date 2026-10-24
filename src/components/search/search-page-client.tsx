'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEmojiSearch } from '@/hooks/use-emoji-search';
import { useComboSearch } from '@/hooks/use-combo-search';
import { ComboCard } from '@/components/combo/combo-card';
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

/** Suggested queries shown while the search box is empty. */
export const POPULAR_SEARCHES = [
  'heart',
  'laughing',
  'skull',
  'sarcastic',
  'flirty',
  'crying',
  'fire',
  'love',
];

const selectClassName =
  'h-10 w-full rounded-full border border-card-border bg-card px-4 text-sm text-foreground focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500/25';

const tabClassName =
  'relative -mb-px min-h-11 whitespace-nowrap border-b-2 px-3.5 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500';

/** Empty-results box with a hand-off to the interpreter. */
function NoResults({
  testId,
  kind,
  query,
}: {
  testId: string;
  kind: 'emojis' | 'combos';
  query: string;
}) {
  const trimmed = query.trim();
  return (
    <div
      className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center text-muted-foreground"
      data-testid={testId}
    >
      <span className="text-4xl" aria-hidden="true">
        🔍
      </span>
      <p className="text-[17px] font-semibold text-foreground">
        No {kind} found matching your search.
      </p>
      <p className="text-sm">
        Check the spelling, try a feeling (“awkward”), a different category, or paste the emoji
        itself.
      </p>
      {trimmed && (
        <Link
          href={`/interpreter?m=${encodeURIComponent(trimmed)}`}
          className="mt-1 inline-flex h-10 items-center rounded-full border border-card-border bg-card px-4 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Decode it as a message instead
        </Link>
      )}
    </div>
  );
}

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

  const handlePopularSearch = useCallback(
    (term: string) => {
      setEmojiQuery(term);
      setComboQuery(term);
    },
    [setEmojiQuery, setComboQuery]
  );

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
        <svg
          data-testid="search-icon"
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
          placeholder="Search emojis and combos..."
          value={currentQuery}
          onChange={handleSearchChange}
          autoComplete="off"
          className="h-[50px] w-full rounded-full border border-card-border bg-card pl-11 pr-12 text-base text-foreground placeholder:text-muted-foreground focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-500/25 [&::-webkit-search-cancel-button]:hidden"
          aria-label="Search emojis and combos"
        />
        {currentQuery && (
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

      {/* Popular searches while the box is empty */}
      {!currentQuery.trim() && (
        <div className="flex flex-wrap items-center gap-2" data-testid="popular-searches">
          <span className="eyebrow mr-1">Popular searches</span>
          {POPULAR_SEARCHES.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => handlePopularSearch(term)}
              className="inline-flex min-h-9 items-center rounded-full border border-card-border bg-card px-3.5 text-sm text-foreground transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {term}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div
        role="tablist"
        aria-label="Result type"
        className="flex gap-1 overflow-x-auto border-b border-card-border [scrollbar-width:none]"
      >
        <button
          type="button"
          onClick={() => handleTabChange('emojis')}
          className={cn(
            tabClassName,
            activeTab === 'emojis'
              ? 'border-primary-500 text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          aria-selected={activeTab === 'emojis'}
          role="tab"
        >
          Emojis <span className="text-muted-foreground">({emojiResultCount})</span>
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('combos')}
          className={cn(
            tabClassName,
            activeTab === 'combos'
              ? 'border-primary-500 text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
          aria-selected={activeTab === 'combos'}
          role="tab"
        >
          Combos <span className="text-muted-foreground">({comboResultCount})</span>
        </button>
      </div>

      {/* Category Filter & Result Count */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="sm:w-56">
          {activeTab === 'emojis' ? (
            <select
              value={emojiCategory}
              onChange={handleEmojiCategoryChange}
              className={selectClassName}
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
              className={selectClassName}
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

        <span className="text-sm text-muted-foreground" role="status" aria-live="polite">
          {currentResultCount} {activeTab === 'emojis' ? 'emoji' : 'combo'}
          {currentResultCount !== 1 ? 's' : ''} found
        </span>
      </div>

      {/* Results */}
      {activeTab === 'emojis' ? (
        emojiResults.length === 0 ? (
          <NoResults testId="no-emoji-results" kind="emojis" query={currentQuery} />
        ) : (
          <ul
            role="list"
            aria-label="Emoji results"
            className="grid grid-cols-3 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(112px,1fr))]"
          >
            {emojiResults.map((emoji) => (
              <li key={emoji.slug}>
                <Link
                  href={`/emoji/${emoji.slug}`}
                  aria-label={emoji.name}
                  className="flex h-full flex-col items-center gap-2 rounded-2xl border border-card-border bg-card px-2 py-3.5 text-center text-foreground transition-[border-color,box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:border-primary-500/60 hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <span className="emoji-display text-4xl leading-none" aria-hidden="true">
                    {emoji.character}
                  </span>
                  <span className="w-full truncate text-[12.5px] font-semibold">{emoji.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )
      ) : comboResults.length === 0 ? (
        <NoResults testId="no-combo-results" kind="combos" query={currentQuery} />
      ) : (
        <ul
          role="list"
          aria-label="Combo results"
          className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]"
        >
          {comboResults.map((combo) => (
            <li key={combo.slug}>
              <ComboCard
                combo={combo}
                categoryLabel={
                  comboCategoryDisplayNames[combo.category] ||
                  combo.category.charAt(0).toUpperCase() + combo.category.slice(1)
                }
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

SearchPageClient.displayName = 'SearchPageClient';

export { SearchPageClient };
