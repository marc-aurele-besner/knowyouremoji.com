'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const LOADING_MESSAGES = [
  'Analyzing emoji patterns...',
  'Detecting hidden meanings...',
  'Calculating sarcasm levels...',
  'Checking for red flags...',
  'Decoding digital hieroglyphics...',
  'Reading between the emojis...',
  'Consulting the emoji oracle...',
  'Processing emotional subtext...',
];

const MESSAGE_ROTATION_INTERVAL = 2000;
const DEFAULT_EXTENDED_WAIT_DELAY = 10000;

export function formatElapsedTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export interface InterpretLoadingProps {
  className?: string;
  timeout?: number;
  isTimedOut?: boolean;
  onRetry?: () => void;
  onCancel?: () => void;
  showElapsedTime?: boolean;
  showExtendedWaitMessage?: boolean;
  extendedWaitDelay?: number;
}

function LoadingSpinner() {
  return (
    <div data-testid="loading-spinner" className="animate-spin h-5 w-5 text-blue-600">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        className="h-full w-full"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}

export function InterpretLoading({
  className,
  timeout,
  isTimedOut: isTimedOutProp,
  onRetry,
  onCancel,
  showElapsedTime = false,
  showExtendedWaitMessage = false,
  extendedWaitDelay = DEFAULT_EXTENDED_WAIT_DELAY,
}: InterpretLoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(() =>
    Math.floor(Math.random() * LOADING_MESSAGES.length)
  );
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [showExtendedWait, setShowExtendedWait] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Handle controlled isTimedOut prop
  const effectiveIsTimedOut = isTimedOutProp !== undefined ? isTimedOutProp : isTimedOut;

  // Rotate loading messages
  useEffect(() => {
    if (effectiveIsTimedOut) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, MESSAGE_ROTATION_INTERVAL);

    return () => clearInterval(interval);
  }, [effectiveIsTimedOut]);

  // Handle timeout
  useEffect(() => {
    if (!timeout || isTimedOutProp === false) return;

    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeout);

    return () => clearTimeout(timer);
  }, [timeout, isTimedOutProp]);

  // Handle extended wait message
  useEffect(() => {
    if (!showExtendedWaitMessage || effectiveIsTimedOut) return;

    const timer = setTimeout(() => {
      setShowExtendedWait(true);
    }, extendedWaitDelay);

    return () => clearTimeout(timer);
  }, [showExtendedWaitMessage, extendedWaitDelay, effectiveIsTimedOut]);

  // Track elapsed time
  useEffect(() => {
    if (!showElapsedTime || effectiveIsTimedOut) return;

    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [showElapsedTime, effectiveIsTimedOut]);

  const handleRetry = useCallback(() => {
    setIsTimedOut(false);
    setShowExtendedWait(false);
    setElapsedSeconds(0);
    onRetry?.();
  }, [onRetry]);

  const handleCancel = useCallback(() => {
    onCancel?.();
  }, [onCancel]);

  return (
    <div
      data-testid="interpret-loading"
      aria-busy="true"
      aria-label="Interpreting message"
      className={cn('space-y-6', className)}
    >
      {/* Status region for screen readers */}
      <div role="status" aria-live="polite" className="sr-only">
        {effectiveIsTimedOut
          ? 'Request timed out. Please try again.'
          : LOADING_MESSAGES[currentMessageIndex]}
      </div>

      {/* Loading header with spinner and message */}
      <div className="flex items-center gap-3">
        <LoadingSpinner />
        <p data-testid="loading-message" className="text-gray-600 font-medium">
          {LOADING_MESSAGES[currentMessageIndex]}
        </p>
      </div>

      {/* Progress indicator */}
      <div
        data-testid="progress-indicator"
        className="animate-pulse h-1 bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 rounded-full"
        style={{
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite linear',
        }}
      />

      {/* Elapsed time */}
      {showElapsedTime && !effectiveIsTimedOut && (
        <p data-testid="elapsed-time" className="text-sm text-gray-500">
          Elapsed: {formatElapsedTime(elapsedSeconds)}
        </p>
      )}

      {/* Extended wait message */}
      {showExtendedWait && !effectiveIsTimedOut && (
        <p
          data-testid="extended-wait-message"
          className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg"
        >
          This is taking longer than usual. Complex messages may require additional processing time.
        </p>
      )}

      {/* Skeleton placeholder */}
      <div className="space-y-4">
        {/* Summary skeleton */}
        <div role="presentation">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Emoji breakdown skeleton */}
        <div role="presentation">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>

        {/* Metrics skeleton */}
        <div role="presentation">
          <Skeleton className="h-6 w-1/4 mb-4" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>

      {/* Timeout message and actions */}
      {effectiveIsTimedOut && (
        <div
          data-testid="timeout-message"
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-yellow-600">⏱️</span>
            <p className="text-sm font-medium text-yellow-800">Request timed out</p>
          </div>
          <p className="text-sm text-yellow-700">
            The interpretation is taking longer than expected. This could be due to high demand or a
            complex message.
          </p>
          <div className="flex gap-3">
            {onRetry && (
              <Button variant="primary" size="sm" onClick={handleRetry} aria-label="Retry request">
                Retry
              </Button>
            )}
            {onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                aria-label="Cancel request"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
