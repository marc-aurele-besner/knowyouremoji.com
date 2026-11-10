'use client';

import { cn } from '@/lib/utils';
import type { EmojiSummary } from '@/types/emoji';

export interface SearchResultsProps {
  results: EmojiSummary[];
  selectedIndex: number;
  onSelect: (emoji: EmojiSummary, index: number) => void;
  onHover: (index: number) => void;
  /** The query that produced these results, used in the empty and footer copy. */
  query?: string;
  /** True when the last request failed, so the panel explains that instead of "no results". */
  hasError?: boolean;
  /** Opens the full search page for `query`. Omit to hide the footer link. */
  onViewAll?: () => void;
}

const panelClassName =
  'absolute top-full left-0 z-50 mt-1.5 w-full min-w-[300px] rounded-2xl border border-card-border bg-card shadow-pop';

function SearchResults({
  results,
  selectedIndex,
  onSelect,
  onHover,
  query = '',
  hasError = false,
  onViewAll,
}: SearchResultsProps) {
  const trimmedQuery = query.trim();

  if (hasError || results.length === 0) {
    return (
      <div role="status" className={cn(panelClassName, 'p-4')}>
        <p className="text-sm text-muted-foreground">
          {hasError
            ? 'Search is unavailable right now. Try again in a moment.'
            : `No emojis found${trimmedQuery ? ` for “${trimmedQuery}”` : ''}.`}
        </p>
        {!hasError && trimmedQuery && onViewAll && (
          <ViewAllButton query={trimmedQuery} onViewAll={onViewAll} />
        )}
      </div>
    );
  }

  return (
    <div className={cn(panelClassName, 'p-1.5')}>
      <ul
        id="search-results"
        role="listbox"
        aria-label={trimmedQuery ? `Emojis matching “${trimmedQuery}”` : 'Matching emojis'}
        className="max-h-[420px] overflow-auto"
      >
        {results.map((emoji, index) => (
          <li
            key={emoji.slug}
            id={`search-result-${index}`}
            role="option"
            aria-selected={index === selectedIndex}
            onClick={() => onSelect(emoji, index)}
            onMouseEnter={() => onHover(index)}
            className={cn(
              'flex min-h-11 cursor-pointer items-center gap-3 rounded-[10px] px-2.5 py-2 text-sm text-foreground',
              'hover:bg-muted',
              index === selectedIndex && 'bg-muted'
            )}
          >
            <span className="emoji-display w-7 text-center text-2xl">{emoji.character}</span>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{emoji.name}</p>
              <p className="truncate text-xs text-muted-foreground">{emoji.tldr}</p>
            </div>
          </li>
        ))}
      </ul>
      {trimmedQuery && onViewAll && <ViewAllButton query={trimmedQuery} onViewAll={onViewAll} />}
    </div>
  );
}

function ViewAllButton({ query, onViewAll }: { query: string; onViewAll: () => void }) {
  return (
    <button
      type="button"
      onClick={onViewAll}
      className="mt-1 flex min-h-11 w-full items-center justify-between gap-2 rounded-[10px] px-2.5 text-left text-sm font-medium text-primary-500 transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500"
    >
      <span className="truncate">See all results for “{query}”</span>
      <span aria-hidden="true">→</span>
    </button>
  );
}

SearchResults.displayName = 'SearchResults';

export { SearchResults };
