'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { ComboCard } from '@/components/combo/combo-card';

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
      className={cn('mt-14', className)}
      aria-labelledby="related-combos-heading"
      role="region"
    >
      <button
        onClick={toggleExpand}
        className="mb-4 flex min-h-11 w-full items-center justify-between gap-3 rounded-xl text-left text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-expanded={expanded}
      >
        <h2
          id="related-combos-heading"
          className="text-2xl font-semibold tracking-tight text-foreground"
        >
          Related Combos
        </h2>
        {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {expanded && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
          {combos.map((combo) => (
            <ComboCard key={combo.slug} combo={combo} ariaLabel={`${combo.name} combo`} />
          ))}
        </div>
      )}
    </section>
  );
}
