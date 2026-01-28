'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Emoji combo data for display in the list
 */
export interface EmojiCombo {
  /** URL-friendly identifier */
  slug: string;
  /** The emoji combination string */
  combo: string;
  /** Name of the combo */
  name: string;
  /** Brief meaning of the combo */
  meaning: string;
}

/**
 * Props for the EmojiComboList component
 */
export interface EmojiComboListProps {
  /** Array of emoji combos to display */
  combos: EmojiCombo[];
  /** Additional CSS class names */
  className?: string;
}

/**
 * Sparkles icon component for the heading
 */
function SparklesIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="sparkles-icon"
      className={cn('w-6 h-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}

/**
 * Chevron down icon component
 */
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="chevron-down-icon"
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Chevron up icon component
 */
function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="chevron-up-icon"
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

/**
 * Individual combo card component
 */
function ComboCard({ combo }: { combo: EmojiCombo }) {
  return (
    <Link
      href={`/combo/${combo.slug}`}
      className="block border rounded-lg p-4 bg-card dark:bg-card hover:border-primary hover:shadow-md transition-all"
      aria-label={`${combo.name} combo`}
    >
      <div className="flex items-start gap-4">
        <span className="text-3xl shrink-0">{combo.combo}</span>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
            {combo.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{combo.meaning}</p>
        </div>
      </div>
    </Link>
  );
}

/**
 * EmojiComboList displays emoji combinations related to the current emoji
 * at the bottom of emoji detail pages. Combos are displayed as clickable
 * cards that link to their respective combo detail pages.
 *
 * @example
 * ```tsx
 * <EmojiComboList
 *   combos={[
 *     { slug: 'skull-laughing', combo: '💀😂', name: 'Dead Laughing', meaning: 'Extremely funny' },
 *     { slug: 'fire-100', combo: '🔥💯', name: 'Fire Hundred', meaning: 'Perfect' },
 *   ]}
 * />
 * ```
 */
export function EmojiComboList({ combos, className }: EmojiComboListProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (combos.length === 0) {
    return null;
  }

  return (
    <section
      className={cn('my-8', className)}
      aria-labelledby="related-combos-heading"
      role="region"
    >
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full text-left mb-4"
        aria-expanded={expanded}
      >
        <h2
          id="related-combos-heading"
          className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100"
        >
          <SparklesIcon />
          Related Combos
        </h2>
        {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.map((combo) => (
            <ComboCard key={combo.slug} combo={combo} />
          ))}
        </div>
      )}
    </section>
  );
}
