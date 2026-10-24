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
        toneClass: 'bg-danger-background text-danger',
        badgeVariant: 'destructive' as const,
        label: 'High',
      };
    case 'medium':
      return {
        toneClass: 'bg-primary-50 text-primary-700',
        badgeVariant: 'warning' as const,
        label: 'Medium',
      };
    case 'low':
      return {
        toneClass: 'bg-muted text-foreground',
        badgeVariant: 'secondary' as const,
        label: 'Low',
      };
    default:
      return {
        toneClass: 'bg-muted text-muted-foreground',
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
        data-severity={flag.severity}
        role="alert"
        aria-label={ariaLabel}
        className={cn(
          'inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm',
          config.toneClass,
          className
        )}
      >
        <span aria-hidden="true">⚠️</span>
        <span className="font-semibold capitalize">{formatFlagType(flag.type)}</span>
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
      data-severity={flag.severity}
      role="alert"
      aria-label={ariaLabel}
      className={cn('flex gap-3 rounded-xl px-4 py-3.5 text-sm', config.toneClass, className)}
    >
      <span className="mt-0.5 shrink-0" aria-hidden="true">
        ⚠️
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold capitalize">{formatFlagType(flag.type)}</span>
          <Badge data-testid="severity-badge" variant={config.badgeVariant} className="text-xs">
            {config.label}
          </Badge>
          {expandable && (
            <button
              type="button"
              onClick={handleToggleExpand}
              aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
              aria-expanded={isExpanded}
              className="ml-auto rounded px-1 text-sm opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              {isExpanded ? '▼' : '▶'} Details
            </button>
          )}
        </div>
        <p className="mt-1 leading-snug opacity-90">{flag.description}</p>
        {resourceUrl && (
          <a
            href={resourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-2"
            aria-label="Learn more about this red flag"
          >
            Learn more →
          </a>
        )}
      </div>
    </div>
  );
}
