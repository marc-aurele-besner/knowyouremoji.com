'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { ContextMeaning, ContextType, RiskLevel } from '@/types/emoji';

/**
 * Props for the EmojiContextCard component
 */
export interface EmojiContextCardProps {
  /** The context meaning data to display */
  context: ContextMeaning;
  /** Whether the card should be expanded by default */
  defaultExpanded?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Formats context type from enum to display title
 * @example PASSIVE_AGGRESSIVE -> "Passive Aggressive"
 */
function formatContextType(context: ContextType): string {
  const formatted = context
    .toLowerCase()
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return formatted;
}

/**
 * Get display text for risk level
 */
function getRiskLevelText(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'LOW':
      return 'Low Risk';
    case 'MEDIUM':
      return 'Medium Risk';
    case 'HIGH':
      return 'High Risk';
  }
}

/**
 * Get styling classes for risk level badge
 */
function getRiskLevelClasses(riskLevel: RiskLevel): string {
  switch (riskLevel) {
    case 'LOW':
      return 'bg-green-100 text-green-800';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-800';
    case 'HIGH':
      return 'bg-red-100 text-red-800';
  }
}

/**
 * EmojiContextCard component displays an individual context meaning
 * with usage example and risk/appropriateness badge.
 *
 * @example
 * ```tsx
 * <EmojiContextCard
 *   context={{
 *     context: 'SLANG',
 *     meaning: 'Used to indicate something is extremely funny',
 *     example: 'That joke had me 💀💀💀',
 *     riskLevel: 'LOW',
 *   }}
 *   defaultExpanded={false}
 * />
 * ```
 */
export function EmojiContextCard({
  context,
  defaultExpanded = false,
  className,
}: EmojiContextCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const contextTitle = formatContextType(context.context);
  const riskText = getRiskLevelText(context.riskLevel);
  const riskClasses = getRiskLevelClasses(context.riskLevel);

  return (
    <article
      className={cn(
        'border rounded-lg overflow-hidden hover:shadow-md transition-shadow',
        'bg-white dark:bg-gray-900',
        className
      )}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'w-full p-4 flex items-center justify-between text-left',
          'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
        )}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">{contextTitle}</h3>
          <span className={cn('px-2 py-0.5 text-xs font-medium rounded', riskClasses)}>
            {riskText}
          </span>
        </div>
        <span className="text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
          {expanded ? '▲' : '▼'}
        </span>
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          <p className="text-gray-600 dark:text-gray-300">{context.meaning}</p>

          <blockquote
            role="blockquote"
            className={cn(
              'border-l-4 border-blue-500 pl-4 py-2',
              'bg-gray-50 dark:bg-gray-800 rounded-r'
            )}
          >
            <p className="italic text-gray-700 dark:text-gray-300">&quot;{context.example}&quot;</p>
          </blockquote>
        </div>
      )}
    </article>
  );
}
