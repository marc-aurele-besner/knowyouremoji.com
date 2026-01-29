'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Related combo data for display
 */
export interface RelatedCombo {
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
 * Props for the RelatedCombosSection component
 */
export interface RelatedCombosSectionProps {
  /** Array of related combos to display */
  combos: RelatedCombo[];
  /** Additional CSS class names */
  className?: string;
}

/**
 * Link icon component
 */
function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="link-icon"
      className={cn('w-6 h-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
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
 * Individual related combo card component
 */
function RelatedComboCard({ combo }: { combo: RelatedCombo }) {
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
 * RelatedCombosSection displays combos related to the current combo
 * at the bottom of combo detail pages. Combos are displayed as clickable
 * cards that link to their respective detail pages.
 *
 * @example
 * ```tsx
 * <RelatedCombosSection
 *   combos={[
 *     { slug: 'skull-laughing', combo: '💀😂', name: 'Dead Laughing', meaning: 'So funny' },
 *     { slug: 'fire-100', combo: '🔥💯', name: 'Fire 100', meaning: 'Perfect' },
 *   ]}
 * />
 * ```
 */
export function RelatedCombosSection({ combos, className }: RelatedCombosSectionProps) {
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
          <LinkIcon />
          Related Combos
        </h2>
        {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {combos.map((combo) => (
            <RelatedComboCard key={combo.slug} combo={combo} />
          ))}
        </div>
      )}
    </section>
  );
}
