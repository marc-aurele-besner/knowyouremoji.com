'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Combo data containing this emoji
 */
export interface ComboWithEmoji {
  /** URL-friendly identifier */
  slug: string;
  /** The emoji combination string */
  combo: string;
  /** Display name of the combo */
  name: string;
  /** What this combo means */
  meaning: string;
}

/**
 * Props for the EmojiCombosSection component
 */
export interface EmojiCombosSectionProps {
  /** Array of combos containing this emoji */
  combos: ComboWithEmoji[];
  /** Additional CSS class names */
  className?: string;
}

/**
 * Combo icon component (two squares together)
 */
function ComboIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="combo-icon"
      className={cn('w-6 h-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <rect x="3" y="3" width="8" height="8" rx="1" />
      <rect x="13" y="13" width="8" height="8" rx="1" />
      <path d="M11 8h2m0 0v2m0-2l4 4" />
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
function ComboCard({ combo }: { combo: ComboWithEmoji }) {
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
 * EmojiCombosSection displays emoji combos that contain the current emoji.
 * Shown on emoji detail pages to help users discover related combo meanings.
 *
 * @example
 * ```tsx
 * <EmojiCombosSection
 *   combos={[
 *     { slug: 'skull-laughing', combo: '💀😂', name: 'Dead Laughing', meaning: 'So funny' },
 *     { slug: 'skull-fire', combo: '💀🔥', name: 'Skull Fire', meaning: 'Deadly hot' },
 *   ]}
 * />
 * ```
 */
export function EmojiCombosSection({ combos, className }: EmojiCombosSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (combos.length === 0) {
    return null;
  }

  return (
    <section className={cn('my-8', className)} aria-labelledby="emoji-combos-heading" role="region">
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full text-left mb-4"
        aria-expanded={expanded}
      >
        <h2
          id="emoji-combos-heading"
          className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100"
        >
          <ComboIcon />
          Combos with this Emoji
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
