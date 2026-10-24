import { cn } from '@/lib/utils';
import { EmojiCard, emojiGridClass } from '@/components/emoji/emoji-card';
import { EmojiQuickViewRegion, type QuickViewEmoji } from '@/components/emoji/emoji-quick-view';
import type { EmojiSummary } from '@/types/emoji';

/**
 * Column configuration for responsive grid
 */
export interface EmojiGridColumns {
  /** Columns at sm breakpoint (640px+) */
  sm?: number;
  /** Columns at md breakpoint (768px+) */
  md?: number;
  /** Columns at lg breakpoint (1024px+) */
  lg?: number;
  /** Columns at xl breakpoint (1280px+) */
  xl?: number;
}

/**
 * Props for the EmojiGrid component
 */
export interface EmojiGridProps {
  /** Array of emojis to display in the grid */
  emojis: EmojiSummary[] | QuickViewEmoji[];
  /** Whether to show the tldr description for each emoji */
  showTldr?: boolean;
  /** Column configuration - number for fixed columns, object for responsive */
  columns?: number | EmojiGridColumns;
  /** Whether to use compact styling (smaller cards) */
  compact?: boolean;
  /** Whether the grid is in a loading state */
  loading?: boolean;
  /** Number of skeleton cards to show when loading */
  skeletonCount?: number;
  /** Aria label for the grid */
  ariaLabel?: string;
  /**
   * Open a quick-view drawer on plain click (cards remain real links for
   * modifier/middle clicks and no-JS).
   */
  quickView?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Get grid column classes based on columns prop
 */
function getColumnClasses(
  columns: number | EmojiGridColumns | undefined,
  compact: boolean
): string {
  if (typeof columns === 'number') {
    return `grid-cols-${columns}`;
  }

  if (columns) {
    return cn(
      'grid-cols-2',
      columns.sm && `sm:grid-cols-${columns.sm}`,
      columns.md && `md:grid-cols-${columns.md}`,
      columns.lg && `lg:grid-cols-${columns.lg}`,
      columns.xl && `xl:grid-cols-${columns.xl}`
    );
  }

  // Default: responsive auto-fill grid (cards ≥150px, dense ≥96px)
  return emojiGridClass(compact);
}

/**
 * Skeleton card component for loading state
 */
function EmojiGridSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      data-testid="emoji-grid-skeleton"
      className={cn(
        'flex flex-col gap-2 rounded-2xl border border-card-border bg-card animate-pulse',
        compact ? 'items-center px-2 py-3.5' : 'min-h-[150px] p-4'
      )}
    >
      <div className={cn('rounded-lg bg-muted', compact ? 'h-8 w-8' : 'h-10 w-10')} />
      <div className="h-4 w-16 rounded bg-muted" />
    </div>
  );
}

/**
 * EmojiGrid displays a responsive grid of emoji cards (`.ecard`).
 * Each card links to the emoji's detail page and shows the
 * emoji character and name. Optionally displays the tldr description
 * and opens a quick-view drawer on plain click (`quickView`).
 *
 * @example
 * ```tsx
 * // Basic usage
 * <EmojiGrid emojis={emojis} />
 *
 * // With tldr descriptions
 * <EmojiGrid emojis={emojis} showTldr />
 *
 * // Custom columns
 * <EmojiGrid emojis={emojis} columns={{ sm: 2, md: 3, lg: 4 }} />
 *
 * // Fixed columns
 * <EmojiGrid emojis={emojis} columns={3} />
 *
 * // Compact mode
 * <EmojiGrid emojis={emojis} compact />
 *
 * // Loading state
 * <EmojiGrid emojis={[]} loading skeletonCount={12} />
 * ```
 */
export function EmojiGrid({
  emojis,
  showTldr = false,
  columns,
  compact = false,
  loading = false,
  skeletonCount = 8,
  ariaLabel = 'Emoji grid',
  quickView = false,
  className,
}: EmojiGridProps) {
  const columnClasses = getColumnClasses(columns, compact);

  // Loading state
  if (loading) {
    return (
      <ul role="list" aria-label={ariaLabel} className={cn('grid gap-3', columnClasses, className)}>
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <li key={index}>
            <EmojiGridSkeleton compact={compact} />
          </li>
        ))}
      </ul>
    );
  }

  // Empty state
  if (emojis.length === 0) {
    return null;
  }

  const list = (
    <ul role="list" aria-label={ariaLabel} className={cn('grid gap-3', columnClasses, className)}>
      {emojis.map((emoji) => (
        <li key={emoji.slug}>
          <EmojiCard emoji={emoji} showTldr={showTldr} compact={compact} quickView={quickView} />
        </li>
      ))}
    </ul>
  );

  // Quick view: the grid stays server-rendered; a small client region
  // delegates clicks to open the drawer.
  return quickView ? <EmojiQuickViewRegion>{list}</EmojiQuickViewRegion> : list;
}
