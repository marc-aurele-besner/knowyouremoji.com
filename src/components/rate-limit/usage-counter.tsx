'use client';

import { cn } from '@/lib/utils';

export interface UsageCounterProps {
  remaining: number;
  max: number;
  variant?: 'default' | 'compact';
  className?: string;
}

/**
 * Displays the remaining free interpretations counter.
 * Shows visual indicators when usage is low or exhausted.
 */
export function UsageCounter({
  remaining,
  max,
  variant = 'default',
  className,
}: UsageCounterProps) {
  const getColorClass = () => {
    if (remaining === 0) {
      return 'text-red-600';
    }
    if (remaining === 1) {
      return 'text-yellow-600';
    }
    return 'text-gray-600';
  };

  const ariaLabel = `${remaining} of ${max} free uses remaining`;

  if (variant === 'compact') {
    return (
      <span
        role="status"
        aria-label={ariaLabel}
        aria-live="polite"
        data-testid="usage-counter"
        className={cn('text-sm font-medium', getColorClass(), className)}
      >
        {remaining}/{max}
      </span>
    );
  }

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      aria-live="polite"
      data-testid="usage-counter"
      className={cn('text-sm', getColorClass(), className)}
    >
      <span className="font-medium">
        {remaining} of {max}
      </span>{' '}
      free uses remaining
    </span>
  );
}
