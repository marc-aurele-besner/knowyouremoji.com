'use client';

import { cn } from '@/lib/utils';

export interface UsageCounterProps {
  remaining: number;
  max: number;
  variant?: 'default' | 'compact';
  className?: string;
}

/** Pips are only drawn for small daily allowances; larger ones stay text-only. */
const MAX_PIPS = 10;

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
      return 'text-danger';
    }
    if (remaining === 1) {
      return 'text-primary-700';
    }
    return 'text-muted-foreground';
  };

  const ariaLabel = `${remaining} of ${max} free interpretations left today`;

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
      className={cn('inline-flex items-center gap-2.5 text-[13px]', getColorClass(), className)}
    >
      {max > 0 && max <= MAX_PIPS && (
        <span data-testid="usage-pips" className="inline-flex gap-1" aria-hidden="true">
          {Array.from({ length: max }, (_, i) => (
            <i
              key={i}
              className={cn(
                'h-1.5 w-[18px] rounded-full',
                i < remaining ? 'bg-primary-500' : 'bg-card-border'
              )}
            />
          ))}
        </span>
      )}
      <span>
        {remaining} of {max} free interpretations left today
      </span>
    </span>
  );
}
