'use client';

import { useState, useCallback, useMemo } from 'react';
import { RateLimiter, DEFAULT_MAX_USES } from '@/lib/rate-limit';

export interface UseRateLimitOptions {
  /** Maximum uses per day (defaults to 3) */
  maxUses?: number;
}

export interface UseRateLimitReturn {
  /** Number of remaining uses for today */
  remaining: number;
  /** Number of uses recorded today */
  used: number;
  /** Maximum uses per day */
  maxUses: number;
  /** Whether the user can still use the interpreter */
  canUse: boolean;
  /** Whether the rate limit has been reached */
  isLimited: boolean;
  /** Time when the rate limit resets (midnight next day) */
  resetTime: Date;
  /** Record a usage and return remaining uses */
  recordUse: () => number;
  /** Reset the rate limit (for testing or admin purposes) */
  reset: () => void;
}

/**
 * Custom hook for managing client-side rate limiting.
 *
 * Provides reactive state for the rate limiter with automatic updates
 * when usage is recorded or reset.
 *
 * @example
 * ```tsx
 * const {
 *   remaining,
 *   canUse,
 *   isLimited,
 *   resetTime,
 *   recordUse,
 * } = useRateLimit();
 *
 * // Check before allowing action
 * if (canUse) {
 *   await interpret();
 *   recordUse();
 * }
 *
 * // Show upgrade prompt when limited
 * if (isLimited) {
 *   return <UpgradePrompt resetTime={resetTime} />;
 * }
 * ```
 */
export function useRateLimit(options: UseRateLimitOptions = {}): UseRateLimitReturn {
  const { maxUses = DEFAULT_MAX_USES } = options;

  // Create a stable limiter instance
  const limiter = useMemo(() => new RateLimiter(maxUses), [maxUses]);

  // State to trigger re-renders when usage changes
  const [, setVersion] = useState(0);

  // Get the reset time (midnight next day)
  const resetTime = useMemo(() => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }, []);

  // Record a usage and trigger re-render
  const recordUse = useCallback(() => {
    const remaining = limiter.recordUse();
    setVersion((v) => v + 1);
    return remaining;
  }, [limiter]);

  // Reset the rate limit and trigger re-render
  const reset = useCallback(() => {
    limiter.reset();
    setVersion((v) => v + 1);
  }, [limiter]);

  // Compute current values from the limiter
  const remaining = limiter.getRemainingUses();
  const used = limiter.getUsedCount();
  const canUse = limiter.canUse();
  const isLimited = !canUse;

  return {
    remaining,
    used,
    maxUses: limiter.getMaxUses(),
    canUse,
    isLimited,
    resetTime,
    recordUse,
    reset,
  };
}
