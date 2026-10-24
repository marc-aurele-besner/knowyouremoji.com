'use client';

import { useId } from 'react';
import { cn } from '@/lib/utils';

export interface ProbabilityMeterProps {
  /** The probability value (0-100) */
  value: number;
  /** Label displayed above the meter */
  label: string;
  /** Optional description/tooltip text */
  description?: string;
  /** Color scheme for the meter */
  colorScheme?: 'danger' | 'warning' | 'neutral';
  /** Additional CSS classes */
  className?: string;
  /** Optional test ID for the component */
  testId?: string;
  /**
   * When set, the fill is amber below this value and red at or above it,
   * overriding the zone colors.
   */
  dangerThreshold?: number;
}

type ColorZone = 'low' | 'medium' | 'high';

function getColorZone(value: number): ColorZone {
  if (value <= 30) return 'low';
  if (value <= 60) return 'medium';
  return 'high';
}

function getFillColorClass(zone: ColorZone, colorScheme: 'danger' | 'warning' | 'neutral'): string {
  if (colorScheme === 'neutral') {
    return 'bg-primary-500';
  }

  if (colorScheme === 'warning') {
    return 'bg-primary-600';
  }

  // danger scheme (default)
  switch (zone) {
    case 'low':
      return 'bg-success';
    case 'medium':
      return 'bg-primary-500';
    case 'high':
      return 'bg-danger';
  }
}

function getIcon(zone: ColorZone): string {
  switch (zone) {
    case 'low':
      return '😊';
    case 'medium':
      return '😐';
    case 'high':
      return '😬';
  }
}

export function ProbabilityMeter({
  value,
  label,
  description,
  colorScheme = 'danger',
  className,
  testId,
  dangerThreshold,
}: ProbabilityMeterProps) {
  const labelId = useId();
  const descriptionId = useId();

  // Clamp and round the value
  const clampedValue = Math.round(Math.max(0, Math.min(100, value)));

  const zone = getColorZone(clampedValue);
  const isDanger = dangerThreshold !== undefined && clampedValue >= dangerThreshold;
  const fillColorClass =
    dangerThreshold === undefined
      ? getFillColorClass(zone, colorScheme)
      : isDanger
        ? 'bg-danger'
        : 'bg-primary-500';
  const icon = getIcon(zone);

  return (
    <div
      data-testid={testId ?? 'probability-meter'}
      data-color-zone={zone}
      data-color-scheme={colorScheme}
      data-danger={isDanger ? 'true' : undefined}
      className={cn(
        'flex flex-col gap-2 rounded-xl border border-card-border bg-card p-3.5',
        className
      )}
    >
      <label id={labelId} className="text-xs text-muted-foreground">
        {label}
      </label>

      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-semibold leading-none tracking-tight text-foreground">
          {clampedValue}%
        </span>
        <span data-testid="probability-meter-icon" className="text-base" aria-hidden="true">
          {icon}
        </span>
      </div>

      <div
        role="meter"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clampedValue}%`}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        data-testid="probability-meter-bar"
        className="h-2 overflow-hidden rounded-full bg-muted"
      >
        <div
          data-testid="probability-meter-fill"
          className={cn('h-full rounded-full transition-all duration-700 ease-out', fillColorClass)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>

      {/* Description/tooltip */}
      {description && (
        <p
          id={descriptionId}
          data-testid="probability-meter-description"
          className="text-xs leading-snug text-muted-foreground"
        >
          {description}
        </p>
      )}
    </div>
  );
}
