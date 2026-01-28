'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { EmojiContextCard } from './emoji-context-card';
import type { ContextMeaning, RiskLevel } from '@/types/emoji';

/**
 * Props for the ContextMeaningsSection component
 */
export interface ContextMeaningsSectionProps {
  /** Array of context meanings to display */
  contexts: ContextMeaning[];
  /** The emoji character being described */
  emojiCharacter: string;
  /** Whether to expand the first card by default */
  defaultExpandFirst?: boolean;
  /** Additional CSS class names */
  className?: string;
}

/**
 * ContextMeaningsSection displays a grid of context cards with
 * filtering and expand/collapse functionality.
 *
 * @example
 * ```tsx
 * <ContextMeaningsSection
 *   contexts={emoji.contextMeanings}
 *   emojiCharacter="💀"
 *   defaultExpandFirst
 * />
 * ```
 */
export function ContextMeaningsSection({
  contexts,
  emojiCharacter,
  defaultExpandFirst = false,
  className,
}: ContextMeaningsSectionProps) {
  const [allExpanded, setAllExpanded] = useState(false);
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'all'>('all');

  // Sort contexts by a simple order based on context type
  // In a real implementation, this would use a frequency field from the data
  const sortedContexts = useMemo(() => {
    const contextOrder: Record<string, number> = {
      SLANG: 0,
      LITERAL: 1,
      IRONIC: 2,
      PASSIVE_AGGRESSIVE: 3,
      DATING: 4,
      WORK: 5,
      RED_FLAG: 6,
    };

    return [...contexts].sort(
      (a, b) => (contextOrder[a.context] ?? 99) - (contextOrder[b.context] ?? 99)
    );
  }, [contexts]);

  // Filter contexts by risk level
  const filteredContexts = useMemo(() => {
    if (riskFilter === 'all') return sortedContexts;
    return sortedContexts.filter((c) => c.riskLevel === riskFilter);
  }, [sortedContexts, riskFilter]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRiskFilter(e.target.value as RiskLevel | 'all');
  };

  const toggleExpandAll = () => {
    setAllExpanded(!allExpanded);
  };

  const countText = contexts.length === 1 ? 'meaning' : 'meanings';

  return (
    <section className={cn('my-8', className)} aria-labelledby="contexts-heading" role="region">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 id="contexts-heading" className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {emojiCharacter} has {contexts.length} different {countText}
        </h2>

        <div className="flex gap-2">
          <select
            value={riskFilter}
            onChange={handleFilterChange}
            className={cn(
              'px-3 py-2 border border-gray-300 rounded-lg text-sm',
              'bg-white dark:bg-gray-900 dark:border-gray-700',
              'focus:outline-none focus:ring-2 focus:ring-blue-600'
            )}
            aria-label="Filter by risk level"
          >
            <option value="all">All Contexts</option>
            <option value="LOW">Low Risk</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="HIGH">High Risk</option>
          </select>

          <button
            onClick={toggleExpandAll}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg',
              'bg-white dark:bg-gray-900 dark:border-gray-700',
              'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-blue-600'
            )}
          >
            {allExpanded ? (
              <>
                <span>▲</span>
                Collapse All
              </>
            ) : (
              <>
                <span>▼</span>
                Expand All
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredContexts.map((context, index) => (
          <EmojiContextCard
            key={`${context.context}-${index}-${allExpanded}`}
            context={context}
            defaultExpanded={allExpanded || (defaultExpandFirst && index === 0)}
          />
        ))}
      </div>

      {filteredContexts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">
          No contexts match the selected filter.
        </p>
      )}
    </section>
  );
}
