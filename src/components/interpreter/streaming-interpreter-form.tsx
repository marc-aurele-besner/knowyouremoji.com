'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useStreamingInterpret } from '@/hooks/use-streaming-interpret';
import { interpreterEvents } from '@/lib/analytics';
import type { InterpretationResult } from '@/types';
import type { InterpreterFormData } from './interpreter-form';
import { InterpreterForm } from './interpreter-form';
import { InterpretResult } from './interpret-result';
import { getPlatformLabel } from './platform-selector';
import { getContextLabel } from './context-selector';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export interface StreamingInterpreterFormProps {
  /** Rate limit remaining uses */
  usageRemaining?: number;
  /** Rate limit maximum uses */
  usageMax?: number;
  /** Message to prefill the textarea with (e.g. from `/interpreter?m=`) */
  initialMessage?: string;
  /** Callback when interpretation completes */
  onComplete?: (text: string) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Additional class names */
  className?: string;
}

/** Three pulsing dots in a chat bubble, shown while the AI is thinking. */
function TypingDots() {
  return (
    <span
      data-testid="typing-dots"
      role="img"
      aria-label="Thinking"
      className="inline-flex gap-1.5 self-start rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3"
    >
      {[0, 150, 300].map((delay) => (
        <i
          key={delay}
          className="h-[7px] w-[7px] rounded-full bg-secondary-500 motion-safe:animate-pulse"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

function ChatBubble({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-full self-start whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-[15px] text-foreground">
      <span className="sr-only">Original message: </span>
      {children}
    </p>
  );
}

function LoadingSkeleton({ message }: { message?: string }) {
  return (
    <div data-testid="interpret-skeleton" aria-busy="true" className="flex flex-col gap-4">
      <span className="eyebrow">Reading the vibes…</span>
      {message && <ChatBubble>{message}</ChatBubble>}
      <TypingDots />
      <Skeleton className="h-6 w-[88%]" />
      <Skeleton className="h-6 w-[64%]" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * Interpreter form plus its result card.
 *
 * Streams the interpretation progressively by default (`/api/interpret/stream`).
 * Turning streaming off requests the full structured analysis from
 * `/api/interpret` (tone, sarcasm, passive-aggression, red flags, emoji breakdown).
 */
export function StreamingInterpreterForm({
  usageRemaining,
  usageMax,
  initialMessage,
  onComplete,
  onError,
  className,
}: StreamingInterpreterFormProps) {
  const [showResult, setShowResult] = useState(false);
  const [streaming, setStreaming] = useState(true);
  const [submitted, setSubmitted] = useState<InterpreterFormData | null>(null);
  const [fullResult, setFullResult] = useState<InterpretationResult | null>(null);
  const [fullLoading, setFullLoading] = useState(false);
  const [fullError, setFullError] = useState<Error | null>(null);

  const { text, isLoading, error, interpret, stop, reset } = useStreamingInterpret({
    onFinish: (finalText) => {
      onComplete?.(finalText);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const requestFullResult = useCallback(
    async (data: InterpreterFormData) => {
      setFullResult(null);
      setFullError(null);
      setFullLoading(true);
      try {
        const response = await fetch('/api/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: data.message,
            platform: data.platform,
            context: data.context,
          }),
        });
        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(body.error || `Request failed with status ${response.status}`);
        }
        if (!body.metrics) {
          throw new Error('The interpreter returned an unexpected response');
        }
        const result = body as InterpretationResult;
        setFullResult(result);
        interpreterEvents.resultView(
          result.redFlags.length > 0,
          result.metrics.passiveAggressionProbability
        );
        onComplete?.(result.interpretation);
      } catch (err) {
        const e = err instanceof Error ? err : new Error('Something went wrong');
        setFullError(e);
        onError?.(e);
      } finally {
        setFullLoading(false);
      }
    },
    [onComplete, onError]
  );

  const handleSubmit = useCallback(
    async (data: InterpreterFormData) => {
      // Track interpreter submission
      interpreterEvents.submit(data.message.length, data.platform || 'OTHER');

      setSubmitted(data);
      setShowResult(true);
      if (streaming) {
        setFullResult(null);
        setFullError(null);
        interpret({
          message: data.message,
          platform: data.platform,
          context: data.context,
        });
      } else {
        reset();
        await requestFullResult(data);
      }
    },
    [interpret, reset, streaming, requestFullResult]
  );

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleReset = useCallback(() => {
    reset();
    setFullResult(null);
    setFullError(null);
    setShowResult(false);
  }, [reset]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      console.error('Failed to copy to clipboard');
    }
  }, [text]);

  const meta = submitted
    ? `${getPlatformLabel(submitted.platform)} · ${getContextLabel(submitted.context)}`
    : undefined;
  const activeError = error ?? fullError;
  const busy = isLoading || fullLoading;

  let resultBody: React.ReactNode;
  if (activeError) {
    resultBody = (
      <div
        role="alert"
        data-testid="streaming-error"
        className="flex flex-col items-center gap-2.5 px-2 py-8 text-center"
      >
        <span className="text-[40px] leading-none" aria-hidden="true">
          ⚠️
        </span>
        <p className="text-[17px] font-semibold text-foreground">
          The interpreter couldn&apos;t finish
        </p>
        <p className="max-w-[420px] text-sm text-muted-foreground">{activeError.message}</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          <Button variant="primary" size="sm" onClick={handleReset}>
            Try Again
          </Button>
        </div>
      </div>
    );
  } else if (fullResult) {
    resultBody = <InterpretResult result={fullResult} meta={meta} onReset={handleReset} />;
  } else if (busy && !text) {
    resultBody = <LoadingSkeleton message={submitted?.message} />;
  } else {
    resultBody = (
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="eyebrow">{isLoading ? 'Interpreting…' : 'Interpretation'}</h2>
          {meta && <span className="text-[13px] text-muted-foreground">{meta}</span>}
        </div>
        {submitted && <ChatBubble>{submitted.message}</ChatBubble>}
        <div
          data-testid="streaming-text"
          aria-live="polite"
          className="whitespace-pre-wrap text-lg font-medium leading-relaxed tracking-tight text-foreground md:text-[22px]"
        >
          {text || (
            <span className="text-base font-normal italic text-muted-foreground">
              No interpretation yet
            </span>
          )}
          {isLoading && (
            <span
              aria-hidden="true"
              className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[3px] bg-primary-500 motion-safe:animate-pulse"
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-card-border pt-4">
          {isLoading ? (
            <Button variant="outline" size="sm" onClick={handleStop} data-testid="stop-button">
              Stop
            </Button>
          ) : (
            text && (
              <>
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  Copy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  data-testid="reset-button"
                  className="ml-auto"
                >
                  Clear
                </Button>
              </>
            )
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-5', className)}>
      <div className="rounded-2xl border border-card-border bg-card p-5 md:p-7">
        <InterpreterForm
          onSubmit={handleSubmit}
          disabled={busy}
          usageRemaining={usageRemaining}
          usageMax={usageMax}
          initialMessage={initialMessage}
          streaming={streaming}
          onStreamingChange={setStreaming}
        />
      </div>

      {showResult && (
        <section
          data-testid="streaming-result"
          aria-label="Interpretation result"
          aria-busy={busy}
          className="animate-fadeIn rounded-2xl border border-card-border bg-card p-5 md:p-7"
        >
          {resultBody}
        </section>
      )}
    </div>
  );
}
