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
          'absolute top-full left-0 z-50 mt-1 w-full min-w-[280px] rounded-md border border-gray-200 bg-white p-3 shadow-lg',
          'dark:border-gray-700 dark:bg-gray-800'
        )}
      >
        <p className="text-sm text-gray-500 dark:text-gray-400">No emojis found</p>
      </div>
    );
  }

  return (
    <ul
      id="search-results"
      role="listbox"
      className={cn(
        'absolute top-full left-0 z-50 mt-1 w-full min-w-[280px] rounded-md border border-gray-200 bg-white py-1 shadow-lg',
        'dark:border-gray-700 dark:bg-gray-800'
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
            'flex cursor-pointer items-center gap-3 px-3 py-2 text-sm',
            'hover:bg-gray-100 dark:hover:bg-gray-700',
            index === selectedIndex && 'bg-amber-50 dark:bg-amber-900/20'
          )}
        >
          <span className="emoji-display text-2xl">{emoji.character}</span>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">{emoji.name}</p>
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">{emoji.tldr}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

SearchResults.displayName = 'SearchResults';

export { SearchResults };
