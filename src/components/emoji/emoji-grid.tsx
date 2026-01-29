import Link from 'next/link';
import { cn } from '@/lib/utils';
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
  emojis: EmojiSummary[];
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
  /** Additional CSS class names */
  className?: string;
}

/**
 * Get grid column classes based on columns prop
 */
function getColumnClasses(columns?: number | EmojiGridColumns): string {
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

  // Default responsive columns
  return 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5';
}

/**
 * Skeleton card component for loading state
 */
function EmojiGridSkeleton({ compact }: { compact?: boolean }) {
  return (
    <div
      data-testid="emoji-grid-skeleton"
      className={cn(
        'flex flex-col items-center rounded-lg border border-gray-200 dark:border-gray-700 animate-pulse',
        compact ? 'p-2' : 'p-4'
      )}
    >
      <div
        className={cn('bg-gray-200 dark:bg-gray-700 rounded', compact ? 'w-8 h-8' : 'w-12 h-12')}
      />
      <div
        className={cn('bg-gray-200 dark:bg-gray-700 rounded w-16 h-4', compact ? 'mt-1' : 'mt-2')}
      />
    </div>
  );
}

/**
 * Individual emoji card component
 */
function EmojiCard({
  emoji,
  showTldr,
  compact,
}: {
  emoji: EmojiSummary;
  showTldr?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={`/emoji/${emoji.slug}`}
      className={cn(
        'flex flex-col items-center rounded-lg border border-gray-200 dark:border-gray-700 transition-colors hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-800',
        compact ? 'p-2' : 'p-4'
      )}
      aria-label={emoji.name}
    >
      <span className={cn(compact ? 'text-2xl' : 'text-4xl')} role="img" aria-hidden="true">
        {emoji.character}
      </span>
      <span
        className={cn(
          'text-center font-medium text-gray-700 dark:text-gray-100',
          compact ? 'mt-1 text-xs' : 'mt-2 text-sm'
        )}
      >
        {emoji.name}
      </span>
      {showTldr && (
        <span
          className={cn(
            'text-center text-gray-500 dark:text-gray-400 line-clamp-2',
            compact ? 'mt-1 text-xs' : 'mt-1 text-xs'
          )}
        >
          {emoji.tldr}
        </span>
      )}
    </Link>
  );
}

/**
 * EmojiGrid displays a responsive grid of emoji cards.
 * Each card links to the emoji's detail page and shows the
 * emoji character and name. Optionally displays the tldr description.
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
  className,
}: EmojiGridProps) {
  const columnClasses = getColumnClasses(columns);

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

  return (
    <ul role="list" aria-label={ariaLabel} className={cn('grid gap-3', columnClasses, className)}>
      {emojis.map((emoji) => (
        <li key={emoji.slug}>
          <EmojiCard emoji={emoji} showTldr={showTldr} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
