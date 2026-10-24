'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { interpreterEvents } from '@/lib/analytics';

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
  const { remaining, maxUses, resetTime } = useRateLimit();
  const hasTrackedRef = useRef(false);

  // Track rate limit reached when component becomes visible
  useEffect(() => {
    if (remaining === 0 && !hasTrackedRef.current) {
      interpreterEvents.rateLimitReached(maxUses);
      hasTrackedRef.current = true;
    }
  }, [remaining, maxUses]);

  // Don't render if user still has remaining uses
  if (remaining > 0) {
    return null;
  }

  const timeUntilReset = formatTimeUntilReset(resetTime);

  return (
    <div
      data-testid="upgrade-prompt"
      className={cn(
        'flex flex-col items-center gap-2.5 rounded-2xl border-2 border-dashed border-card-border bg-card px-6 py-12 text-center',
        className
      )}
    >
      <span className="text-[40px] leading-none" aria-hidden="true">
        ⏳
      </span>
      <h3 className="text-[17px] font-semibold text-foreground">Daily limit reached</h3>
      <p className="max-w-[420px] text-sm text-muted-foreground">
        You have used all 3 free interpretations for today.{' '}
        <span data-testid="reset-countdown">Resets {timeUntilReset}.</span> Pro unlocks unlimited
        interpretations and history.
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <Link
          href="/pricing"
          className="inline-flex h-10 items-center rounded-full bg-primary-500 px-5 text-sm font-semibold text-primary-foreground transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          Upgrade for Unlimited
        </Link>
        <Link
          href="/emoji"
          className="inline-flex h-10 items-center rounded-full border border-card-border bg-card px-5 text-sm font-medium text-foreground transition hover:border-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Browse emojis (unlimited)
        </Link>
      </div>
      <p className="text-xs text-muted-foreground">Starting at just $4.99/month</p>
    </div>
  );
}
