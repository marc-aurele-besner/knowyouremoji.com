'use client';

import { cn } from '@/lib/utils';
import type { EmojiSummary } from '@/types/emoji';

export interface SearchResultsProps {
  results: EmojiSummary[];
  selectedIndex: number;
  onSelect: (emoji: EmojiSummary, index: number) => void;
  onHover: (index: number) => void;
}

function SearchResults({ results, selectedIndex, onSelect, onHover }: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div
        id="search-results"
        role="listbox"
        className={cn(
          'absolute top-full left-0 z-50 mt-1.5 w-full min-w-[300px] rounded-2xl border border-card-border bg-card p-4 shadow-pop'
        )}
      >
        <p className="text-sm text-muted-foreground">No emojis found</p>
      </div>
    );
  }

  return (
    <ul
      id="search-results"
      role="listbox"
      className={cn(
        'absolute top-full left-0 z-50 mt-1.5 max-h-[420px] w-full min-w-[300px] overflow-auto rounded-2xl border border-card-border bg-card p-1.5 shadow-pop'
      )}
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
  );
}

SearchResults.displayName = 'SearchResults';

export { SearchResults };
