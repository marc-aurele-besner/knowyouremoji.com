'use client';

import { useCallback, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { UsageCounter } from '@/components/rate-limit/usage-counter';
import { StreamingInterpreterForm } from './streaming-interpreter-form';
import { UpgradePrompt } from './upgrade-prompt';

export interface InterpreterClientProps {
  /**
   * Page heading rendered next to the usage counter. When provided, the usage
   * counter moves from below the submit button into this header row (the
   * daily limit is still enforced on the submit button).
   */
  header?: ReactNode;
  /** Message to prefill the form with (not submitted automatically) */
  initialMessage?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Client-side interpreter wrapper that integrates rate limiting.
 *
 * This component:
 * - Uses the useRateLimit hook to manage daily usage limits
 * - Passes usage data to the StreamingInterpreterForm (or shows it in the header)
 * - Shows UpgradePrompt when the user has reached their daily limit
 * - Records usage when interpretations complete successfully
 */
export function InterpreterClient({ header, initialMessage, className }: InterpreterClientProps) {
  const { remaining, maxUses, recordUse } = useRateLimit();

  const handleComplete = useCallback(
    (text: string) => {
      // Only record usage if we got a valid response
      if (text) {
        recordUse();
      }
    },
    [recordUse]
  );

  const hasHeader = header !== undefined;

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {hasHeader && (
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="min-w-0 max-w-2xl">{header}</div>
          <UsageCounter remaining={remaining} max={maxUses} />
        </div>
      )}
      <StreamingInterpreterForm
        usageRemaining={remaining}
        usageMax={hasHeader ? undefined : maxUses}
        initialMessage={initialMessage}
        onComplete={handleComplete}
      />
      <UpgradePrompt />
    </div>
  );
}
