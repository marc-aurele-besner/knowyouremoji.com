'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { WarningSeverity } from '@/types/emoji';

/**
 * Extended warning type with all required fields
 */
export interface EmojiWarningExtended {
  /** Brief title for the warning */
  title: string;
  /** Detailed description of the warning */
  description: string;
  /** Severity level of the warning */
  severity: WarningSeverity;
}

/**
 * Props for the EmojiWarnings component
 */
export interface EmojiWarningsProps {
  /** Array of warnings to display */
  warnings: EmojiWarningExtended[];
  /** The emoji character being described */
  emojiCharacter: string;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Severity styling configuration
 */
const severityStyles: Record<
  WarningSeverity,
  {
    card: string;
    badge: string;
    label: string;
  }
> = {
  LOW: {
    card: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800',
    badge: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    label: 'Low Risk',
  },
  MEDIUM: {
    card: 'bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800',
    badge: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    label: 'Medium Risk',
  },
  HIGH: {
    card: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    badge: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'High Risk',
  },
};

/**
 * Alert triangle icon for the section header
 */
function AlertTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="alert-triangle-icon"
      className={cn('w-6 h-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

/**
 * Warning icon for individual warning cards
 */
function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="warning-icon"
      className={cn('w-5 h-5 flex-shrink-0', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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
 * Individual warning card component
 */
function WarningCard({ warning }: { warning: EmojiWarningExtended }) {
  const styles = severityStyles[warning.severity];

  return (
    <div className={cn('border rounded-lg p-4', styles.card)} role="alert">
      <div className="flex gap-3">
        <WarningIcon className="mt-0.5 text-current" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{warning.title}</h3>
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded', styles.badge)}>
              {styles.label}
            </span>
          </div>
          <p className="text-gray-700 dark:text-gray-300">{warning.description}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * EmojiWarnings displays usage warnings and potential misunderstandings
 * for emojis with severity-based styling.
 *
 * @example
 * ```tsx
 * <EmojiWarnings
 *   warnings={emoji.warnings}
 *   emojiCharacter="💀"
 * />
 * ```
 */
export function EmojiWarnings({
  warnings,
  emojiCharacter: _emojiCharacter,
  className,
}: EmojiWarningsProps) {
  // Note: emojiCharacter prop kept for API consistency with other sections
  void _emojiCharacter;
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (warnings.length === 0) {
    return null;
  }

  const warningCount = warnings.length;
  const warningText = warningCount === 1 ? 'warning' : 'warnings';

  return (
    <section className={cn('my-8', className)} aria-labelledby="warnings-heading" role="region">
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full text-left mb-4"
        aria-expanded={expanded}
      >
        <h2
          id="warnings-heading"
          className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100"
        >
          <AlertTriangleIcon />
          Warnings
          <span className="text-base font-normal text-muted-foreground">
            ({warningCount} {warningText})
          </span>
        </h2>
        {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {expanded && (
        <div className="space-y-4">
          {warnings.map((warning, index) => (
            <WarningCard key={`${warning.title}-${index}`} warning={warning} />
          ))}
        </div>
      )}
    </section>
  );
}
