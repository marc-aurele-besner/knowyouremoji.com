'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { RedFlagBadge } from './red-flag-badge';
import type { RedFlag } from '@/types';

export interface RedFlagSectionProps {
  /** Array of red flags to display */
  flags: RedFlag[];
  /** Whether to show resource links */
  showResources?: boolean;
  /** Whether flags should be expandable */
  expandable?: boolean;
  /** Whether to display in compact mode */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

const SEVERITY_ORDER: Record<RedFlag['severity'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const HELPFUL_RESOURCES = [
  {
    title: 'Understanding Manipulation',
    url: 'https://www.psychologytoday.com/us/basics/manipulation',
  },
  {
    title: 'Signs of Gaslighting',
    url: 'https://www.healthline.com/health/gaslighting',
  },
  {
    title: 'Healthy Communication Tips',
    url: 'https://www.verywellmind.com/communication-skills-for-healthy-relationships-4154825',
  },
];

function sortFlagsBySeverity(flags: RedFlag[]): RedFlag[] {
  return [...flags].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

function countBySeverity(flags: RedFlag[]): { high: number; medium: number; low: number } {
  return flags.reduce(
    (acc, flag) => {
      acc[flag.severity]++;
      return acc;
    },
    { high: 0, medium: 0, low: 0 }
  );
}

export function RedFlagSection({
  flags,
  showResources,
  expandable = false,
  compact = false,
  className,
}: RedFlagSectionProps) {
  const [allExpanded, setAllExpanded] = useState(false);

  const sortedFlags = useMemo(() => sortFlagsBySeverity(flags), [flags]);
  const severityCounts = useMemo(() => countBySeverity(flags), [flags]);
  const hasHighSeverity = severityCounts.high > 0;

  // Show resources by default if there are high severity flags, unless explicitly set to false
  const shouldShowResources = showResources ?? hasHighSeverity;

  const handleExpandAll = useCallback(() => {
    setAllExpanded(true);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setAllExpanded(false);
  }, []);

  // Don't render if no flags
  if (flags.length === 0) {
    return null;
  }

  const flagCountLabel = `${flags.length} red flag${flags.length === 1 ? '' : 's'} detected`;

  return (
    <section
      data-testid="red-flag-section"
      role="region"
      aria-label="Red flags detected"
      className={cn('animate-fadeIn', className)}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-red-500" aria-hidden="true">
            ⚠️
          </span>
          Red Flags
          <span
            data-testid="flag-count"
            aria-label={flagCountLabel}
            className="inline-flex items-center justify-center bg-red-100 text-red-800 text-xs font-bold rounded-full w-6 h-6"
          >
            {flags.length}
          </span>
        </h3>
        {expandable && flags.length > 1 && (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExpandAll}
              aria-label="Expand all red flags"
              className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            >
              Expand all
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              aria-label="Collapse all red flags"
              className="text-sm text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            >
              Collapse all
            </button>
          </div>
        )}
      </div>

      {/* Severity Summary - only show for multiple flags */}
      {flags.length > 1 && (
        <div
          data-testid="severity-summary"
          className="flex items-center gap-3 mb-4 text-sm text-gray-600"
        >
          {severityCounts.high > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
              {severityCounts.high} High
            </span>
          )}
          {severityCounts.medium > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500" aria-hidden="true" />
              {severityCounts.medium} Medium
            </span>
          )}
          {severityCounts.low > 0 && (
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" aria-hidden="true" />
              {severityCounts.low} Low
            </span>
          )}
        </div>
      )}

      {/* Flags Container */}
      <div
        data-testid="flags-container"
        className={cn('flex gap-3', compact ? 'flex-row flex-wrap' : 'flex-col space-y-3')}
      >
        {sortedFlags.map((flag, index) => (
          <RedFlagBadge
            key={`${flag.type}-${index}`}
            flag={flag}
            expandable={expandable}
            compact={compact}
            isExpanded={expandable ? allExpanded : undefined}
          />
        ))}
      </div>

      {/* Resources Section */}
      {shouldShowResources && (
        <div
          data-testid="resources-section"
          className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200"
        >
          <h4 className="font-medium text-gray-900 mb-3">Helpful Resources</h4>
          <ul className="space-y-2">
            {HELPFUL_RESOURCES.map((resource) => (
              <li key={resource.url}>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {resource.title} →
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
