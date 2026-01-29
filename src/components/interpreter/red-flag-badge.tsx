'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import type { RedFlag } from '@/types';

export interface RedFlagBadgeProps {
  /** The red flag to display */
  flag: RedFlag;
  /** Whether the badge is expandable */
  expandable?: boolean;
  /** URL to helpful resources */
  resourceUrl?: string;
  /** Whether to display in compact mode */
  compact?: boolean;
  /** Controlled expanded state (optional) */
  isExpanded?: boolean;
  /** Callback when expansion state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Additional CSS classes */
  className?: string;
}

function getSeverityConfig(severity: RedFlag['severity']) {
  switch (severity) {
    case 'high':
      return {
        borderClass: 'border-red-500',
        bgClass: 'bg-red-50',
        badgeVariant: 'destructive' as const,
        label: 'High',
      };
    case 'medium':
      return {
        borderClass: 'border-yellow-500',
        bgClass: 'bg-yellow-50',
        badgeVariant: 'warning' as const,
        label: 'Medium',
      };
    case 'low':
      return {
        borderClass: 'border-blue-500',
        bgClass: 'bg-blue-50',
        badgeVariant: 'secondary' as const,
        label: 'Low',
      };
    default:
      return {
        borderClass: 'border-gray-500',
        bgClass: 'bg-gray-50',
        badgeVariant: 'secondary' as const,
        label: 'Unknown',
      };
  }
}

function formatFlagType(type: string): string {
  return type.replace(/_/g, ' ');
}

export function RedFlagBadge({
  flag,
  expandable = false,
  resourceUrl,
  compact = false,
  isExpanded: controlledExpanded,
  onExpandedChange,
  className,
}: RedFlagBadgeProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);

  // Support both controlled and uncontrolled modes
  const isControlled = controlledExpanded !== undefined;
  const isExpanded = isControlled ? controlledExpanded : internalExpanded;

  const config = getSeverityConfig(flag.severity);

  const handleToggleExpand = useCallback(() => {
    const newExpanded = !isExpanded;
    if (onExpandedChange) {
      onExpandedChange(newExpanded);
    }
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
  }, [isExpanded, onExpandedChange, isControlled]);

  const ariaLabel = `${config.label} severity red flag: ${formatFlagType(flag.type)}. ${flag.description}`;

  if (compact) {
    return (
      <div
        data-testid="red-flag-badge"
        data-compact="true"
        data-expanded="false"
        role="alert"
        aria-label={ariaLabel}
        className={cn(
          'border-l-4 rounded-r-lg p-2 inline-flex items-center gap-2',
          config.borderClass,
          config.bgClass,
          className
        )}
      >
        <span className="text-red-500" aria-hidden="true">
          ⚠️
        </span>
        <span className="font-medium text-gray-900 capitalize text-sm">
          {formatFlagType(flag.type)}
        </span>
        <Badge data-testid="severity-badge" variant={config.badgeVariant} className="text-xs">
          {config.label}
        </Badge>
      </div>
    );
  }

  return (
    <div
      data-testid="red-flag-badge"
      data-compact="false"
      data-expanded={isExpanded ? 'true' : 'false'}
      role="alert"
      aria-label={ariaLabel}
      className={cn('border-l-4 rounded-r-lg p-4', config.borderClass, config.bgClass, className)}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-500" aria-hidden="true">
          ⚠️
        </span>
        <span className="font-medium text-gray-900 capitalize">{formatFlagType(flag.type)}</span>
        <Badge data-testid="severity-badge" variant={config.badgeVariant} className="text-xs">
          {config.label}
        </Badge>
        {expandable && (
          <button
            type="button"
            onClick={handleToggleExpand}
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
            aria-expanded={isExpanded}
            className="ml-auto text-gray-500 hover:text-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1"
          >
            {isExpanded ? '▼' : '▶'} Details
          </button>
        )}
      </div>
      <p className="text-sm text-gray-600">{flag.description}</p>
      {resourceUrl && (
        <a
          href={resourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 mt-2"
          aria-label="Learn more about this red flag"
        >
          Learn more →
        </a>
      )}
    </div>
  );
}

// Export setter for controlled expansion from parent
export type { RedFlagBadgeProps };
