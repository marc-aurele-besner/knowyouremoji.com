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
}

type ColorZone = 'low' | 'medium' | 'high';

function getColorZone(value: number): ColorZone {
  if (value <= 30) return 'low';
  if (value <= 60) return 'medium';
  return 'high';
}

function getFillColorClass(zone: ColorZone, colorScheme: 'danger' | 'warning' | 'neutral'): string {
  if (colorScheme === 'neutral') {
    return 'bg-blue-500';
  }

  if (colorScheme === 'warning') {
    return 'bg-orange-500';
  }

  // danger scheme (default)
  switch (zone) {
    case 'low':
      return 'bg-green-500';
    case 'medium':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-red-500';
  }
}

function getBackgroundColorClass(
  zone: ColorZone,
  colorScheme: 'danger' | 'warning' | 'neutral'
): string {
  if (colorScheme === 'neutral') {
    return 'bg-blue-100';
  }

  if (colorScheme === 'warning') {
    return 'bg-orange-100';
  }

  // danger scheme (default)
  switch (zone) {
    case 'low':
      return 'bg-green-100';
    case 'medium':
      return 'bg-yellow-100';
    case 'high':
      return 'bg-red-100';
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
}: ProbabilityMeterProps) {
  const labelId = useId();
  const descriptionId = useId();

  // Clamp and round the value
  const clampedValue = Math.round(Math.max(0, Math.min(100, value)));

  const zone = getColorZone(clampedValue);
  const fillColorClass = getFillColorClass(zone, colorScheme);
  const bgColorClass = getBackgroundColorClass(zone, colorScheme);
  const icon = getIcon(zone);

  return (
    <div
      data-testid={testId ?? 'probability-meter'}
      data-color-zone={zone}
      data-color-scheme={colorScheme}
      className={cn('flex flex-col gap-1 rounded-lg px-3 py-2', bgColorClass, className)}
    >
      <label id={labelId} className="text-sm text-gray-600">
        {label}
      </label>

      <div
        role="meter"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clampedValue}%`}
        aria-labelledby={labelId}
        aria-describedby={description ? descriptionId : undefined}
        className="flex items-center gap-3"
      >
        {/* Progress bar container */}
        <div
          data-testid="probability-meter-bar"
          className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200"
        >
          <div
            data-testid="probability-meter-fill"
            className={cn(
              'h-full rounded-full transition-all duration-700 ease-out',
              fillColorClass
            )}
            style={{ width: `${clampedValue}%` }}
          />
        </div>

        {/* Icon indicator */}
        <span data-testid="probability-meter-icon" className="text-lg" aria-hidden="true">
          {icon}
        </span>

        {/* Percentage display */}
        <span className="min-w-[3rem] text-right text-sm font-medium text-gray-700">
          {clampedValue}%
        </span>
      </div>

      {/* Description/tooltip */}
      {description && (
        <p
          id={descriptionId}
          data-testid="probability-meter-description"
          className="text-xs text-gray-500"
        >
          {description}
        </p>
      )}
    </div>
  );
}
