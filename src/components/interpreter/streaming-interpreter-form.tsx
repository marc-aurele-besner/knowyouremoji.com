'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { useStreamingInterpret } from '@/hooks/use-streaming-interpret';
import type { InterpreterFormData } from './interpreter-form';
import { InterpreterForm } from './interpreter-form';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface StreamingInterpreterFormProps {
  /** Rate limit remaining uses */
  usageRemaining?: number;
  /** Rate limit maximum uses */
  usageMax?: number;
  /** Callback when interpretation completes */
  onComplete?: (text: string) => void;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Streaming interpreter form that displays progressive results.
 *
 * This component combines the InterpreterForm with streaming capabilities,
 * showing real-time text updates as the AI generates the interpretation.
 */
export function StreamingInterpreterForm({
  usageRemaining,
  usageMax,
  onComplete,
  onError,
  className,
}: StreamingInterpreterFormProps) {
  const [showResult, setShowResult] = useState(false);

  const { text, isLoading, error, interpret, stop, reset } = useStreamingInterpret({
    onFinish: (finalText) => {
      onComplete?.(finalText);
    },
    onError: (err) => {
      onError?.(err);
    },
  });

  const handleSubmit = useCallback(
    async (data: InterpreterFormData) => {
      setShowResult(true);
      interpret({
        message: data.message,
        platform: data.platform,
        context: data.context,
      });
    },
    [interpret]
  );

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const handleReset = useCallback(() => {
    reset();
    setShowResult(false);
  }, [reset]);

  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <InterpreterForm
        onSubmit={handleSubmit}
        disabled={isLoading}
        usageRemaining={usageRemaining}
        usageMax={usageMax}
      />

      {/* Streaming Result Display */}
      {showResult && (
        <Card
          data-testid="streaming-result"
          className={cn('animate-fadeIn', error && 'border-red-200')}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold leading-none tracking-tight">
                {isLoading ? 'Interpreting...' : 'Interpretation'}
              </h2>
              <div className="flex items-center gap-2">
                {isLoading && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStop}
                    data-testid="stop-button"
                  >
                    Stop
                  </Button>
                )}
                {!isLoading && text && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReset}
                    data-testid="reset-button"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-red-600" role="alert" data-testid="streaming-error">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error.message}</p>
                <Button variant="outline" size="sm" onClick={handleReset} className="mt-3">
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Progressive text display */}
                <div
                  data-testid="streaming-text"
                  className={cn(
                    'text-gray-900 dark:text-gray-100 whitespace-pre-wrap',
                    isLoading && 'animate-pulse'
                  )}
                >
                  {text || (
                    <span className="text-gray-500 italic">
                      {isLoading ? 'Generating interpretation...' : 'No interpretation yet'}
                    </span>
                  )}
                </div>

                {/* Loading indicator */}
                {isLoading && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
                    <span>AI is thinking...</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
