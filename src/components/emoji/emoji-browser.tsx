'use client';

import { useCallback, useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useEmojiSearch } from '@/hooks/use-emoji-search';
import { EmojiQuickViewGrid } from '@/components/emoji/emoji-quick-view';
import { CloseIcon, SearchIcon } from '@/components/emoji/emoji-icons';
import { chipClass } from '@/components/emoji/emoji-labels';
import type { EmojiSummary } from '@/types/emoji';

/** Category filter option with its emoji count. */
export interface EmojiBrowserCategory {
  slug: string;
  displayName: string;
  emojiCount: number;
}

export interface EmojiBrowserProps {
  emojis: EmojiSummary[];
  categories: EmojiBrowserCategory[];
  /** Number of cards shown initially and added per "Load more" */
  pageSize?: number;
}

type ViewMode = 'cards' | 'dense';

const numberFormat = new Intl.NumberFormat('en-US');

/**
 * Client-side emoji browser: large search field, Cards/Dense view toggle,
 * category filter chips with counts, result count, quick-view grid and
 * "Load more" paging.
 */
export function EmojiBrowser({ emojis, categories, pageSize = 96 }: EmojiBrowserProps) {
  const { results, query, category, setQuery, setCategory, clearSearch } = useEmojiSearch({
    emojis,
  });
  const [view, setView] = useState<ViewMode>('cards');
  const [visibleCount, setVisibleCount] = useState(pageSize);

  // Reset paging whenever the filters change
  useEffect(() => {
    setVisibleCount(pageSize);
  }, [query, category, pageSize]);

  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    [setQuery]
  );

  const handleSubmit = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  }, []);

  const dense = view === 'dense';
  const visible = results.slice(0, visibleCount);
  const remaining = results.length - visible.length;
  const trimmedQuery = query.trim();

  const countText = trimmedQuery
    ? `${numberFormat.format(results.length)} result${results.length === 1 ? '' : 's'} for “${trimmedQuery}”`
    : `Showing ${numberFormat.format(visible.length)} of ${numberFormat.format(results.length)}`;

  return (
    <div>
      {/* Toolbar: search + view toggle */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <form role="search" onSubmit={handleSubmit} className="relative min-w-0 flex-[1_1_240px]">
          <label htmlFor="emoji-browse-search" className="sr-only">
            Search emojis
          </label>
          <SearchIcon
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            id="emoji-browse-search"
            type="search"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search by name, emoji or meaning…"
            autoComplete="off"
            className={cn(
              'h-[50px] w-full rounded-full border border-card-border bg-card pl-11 pr-11 text-base text-foreground placeholder:text-muted-foreground',
              'focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
              '[&::-webkit-search-cancel-button]:hidden'
            )}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <CloseIcon size={16} />
            </button>
          )}
        </form>

        <div
          role="group"
          aria-label="View"
          className="inline-flex gap-0.5 rounded-xl bg-muted p-[3px]"
        >
          {(
            [
              ['cards', 'Cards'],
              ['dense', 'Dense'],
            ] as const
          ).map(([mode, label]) => (
            <button
              key={mode}
              type="button"
              aria-pressed={view === mode}
              onClick={() => setView(mode)}
              className={cn(
                'min-h-10 rounded-[9px] px-3 text-[13px] font-medium transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
                view === mode
                  ? 'bg-card text-foreground shadow-soft'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter chips */}
      <div role="group" aria-label="Filter by category" className="mb-5 flex flex-wrap gap-2">
        <button
          type="button"
          aria-pressed={category === ''}
          onClick={() => setCategory('')}
          className={chipClass(category === '')}
        >
          All categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            aria-pressed={category === cat.slug}
            onClick={() => setCategory(cat.slug)}
            className={chipClass(category === cat.slug)}
          >
            {cat.displayName}
            <span className="text-[11.5px] opacity-65">{numberFormat.format(cat.emojiCount)}</span>
          </button>
        ))}
      </div>

      {results.length > 0 ? (
        <>
          <p className="mb-3 text-[13px] text-muted-foreground" role="status" aria-live="polite">
            {countText}
          </p>
          <EmojiQuickViewGrid
            emojis={visible}
            showTldr={!dense}
            compact={dense}
            ariaLabel="Emoji results"
          />
          {remaining > 0 && (
            <div className="mt-6 text-center">
              <Button
                variant="outline"
                onClick={() => setVisibleCount((count) => count + pageSize)}
              >
                Load {numberFormat.format(Math.min(pageSize, remaining))} more
              </Button>
            </div>
          )}
        </>
      ) : (
        <div
          role="status"
          className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center"
        >
          <span className="emoji-display text-4xl" aria-hidden="true">
            🔍
          </span>
          <p className="text-[17px] font-semibold text-foreground">
            No emojis found matching your search.
          </p>
          <p className="text-muted-foreground">Try a different search term or category.</p>
          <Button variant="outline" onClick={clearSearch} className="mt-1">
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
