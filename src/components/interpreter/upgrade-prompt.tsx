'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRateLimit } from '@/hooks/use-rate-limit';

export interface UpgradePromptProps {
  className?: string;
}

/**
 * Format the time until reset in a human-readable way
 */
function formatTimeUntilReset(resetTime: Date): string {
  const now = new Date();
  const diffMs = resetTime.getTime() - now.getTime();

  if (diffMs <= 0) {
    return 'soon';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours >= 1) {
    const remainingMinutes = diffMinutes % 60;
    if (remainingMinutes > 0) {
      return `in ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} and ${remainingMinutes} ${remainingMinutes === 1 ? 'minute' : 'minutes'}`;
    }
    return `in ${diffHours} ${diffHours === 1 ? 'hour' : 'hours'}`;
  }

  if (diffMinutes > 0) {
    return `in ${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'}`;
  }

  return 'in less than a minute';
}

/**
 * Upgrade prompt component shown when users hit their daily interpretation limit.
 *
 * Displays:
 * - A message indicating the limit has been reached
 * - A countdown to when the limit resets
 * - A link to the pricing page for unlimited access
 *
 * @example
 * ```tsx
 * // Simply render when you want to show upgrade prompt
 * <UpgradePrompt />
 *
 * // With custom styling
 * <UpgradePrompt className="my-4" />
 * ```
 */
export function UpgradePrompt({ className }: UpgradePromptProps) {
  const { remaining, resetTime } = useRateLimit();

  // Don't render if user still has remaining uses
  if (remaining > 0) {
    return null;
  }

  const timeUntilReset = formatTimeUntilReset(resetTime);

  return (
    <div
      data-testid="upgrade-prompt"
      className={cn('p-6 rounded-lg border-2 border-blue-500 bg-blue-50 text-center', className)}
    >
      <h3 className="text-lg font-semibold mb-2 text-gray-900">Daily Limit Reached</h3>
      <p className="text-gray-600 mb-4">
        You have used all 3 free interpretations for today.
        <br />
        <span data-testid="reset-countdown">Resets {timeUntilReset}.</span>
      </p>

      <div className="space-y-3">
        <Link
          href="/pricing"
          className="block w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Upgrade for Unlimited
        </Link>
        <p className="text-xs text-gray-500">Starting at just $4.99/month</p>
      </div>
    </div>
  );
}
