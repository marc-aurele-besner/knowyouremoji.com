'use client';

import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { StreamingInterpreterForm } from './streaming-interpreter-form';
import { UpgradePrompt } from './upgrade-prompt';

export interface InterpreterClientProps {
  /** Additional class names */
  className?: string;
}

/**
 * Client-side interpreter wrapper that integrates rate limiting.
 *
 * This component:
 * - Uses the useRateLimit hook to manage daily usage limits
 * - Passes usage data to the StreamingInterpreterForm
 * - Shows UpgradePrompt when the user has reached their daily limit
 * - Records usage when interpretations complete successfully
 */
export function InterpreterClient({ className }: InterpreterClientProps) {
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

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <StreamingInterpreterForm
        usageRemaining={remaining}
        usageMax={maxUses}
        onComplete={handleComplete}
      />
      <UpgradePrompt />
    </div>
  );
}
