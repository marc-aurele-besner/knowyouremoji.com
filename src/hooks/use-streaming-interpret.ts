'use client';

import { useState, useCallback, useRef } from 'react';
import type { Platform, RelationshipContext } from '@/types';

/**
 * Options for the useStreamingInterpret hook
 */
export interface UseStreamingInterpretOptions {
  /** Custom API endpoint (default: /api/interpret/stream) */
  apiEndpoint?: string;
  /** Callback when an error occurs */
  onError?: (error: Error) => void;
  /** Callback when streaming finishes */
  onFinish?: (text: string) => void;
}

/**
 * Input data for the interpret function
 */
export interface InterpretInput {
  message: string;
  platform: Platform | 'OTHER';
  context: RelationshipContext;
}

/**
 * Return type for the useStreamingInterpret hook
 */
export interface UseStreamingInterpretReturn {
  /** The accumulated text from the stream */
  text: string;
  /** Whether the stream is currently loading */
  isLoading: boolean;
  /** Any error that occurred */
  error: Error | null;
  /** Start interpreting a message */
  interpret: (input: InterpretInput) => void;
  /** Stop the current stream */
  stop: () => void;
  /** Reset the hook state */
  reset: () => void;
}

/**
 * Hook for streaming emoji interpretation results using Vercel AI SDK patterns.
 *
 * Provides progressive text updates as the AI generates the interpretation,
 * with support for cancellation and error handling.
 *
 * @example
 * ```tsx
 * const { text, isLoading, error, interpret, stop, reset } = useStreamingInterpret();
 *
 * // Start interpreting
 * interpret({ message: 'Hello 👋', platform: 'IMESSAGE', context: 'FRIEND' });
 *
 * // Display progressive results
 * <div>{text}</div>
 *
 * // Cancel if needed
 * <button onClick={stop}>Cancel</button>
 * ```
 */
export function useStreamingInterpret(
  options: UseStreamingInterpretOptions = {}
): UseStreamingInterpretReturn {
  const { apiEndpoint = '/api/interpret/stream', onError, onFinish } = options;

  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Reference to the abort controller for cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Start interpreting a message with streaming response
   */
  const interpret = useCallback(
    async (input: InterpretInput) => {
      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Reset state
      setText('');
      setError(null);
      setIsLoading(true);

      try {
        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(input),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          // Try to parse error response
          const errorData = await response.json().catch(() => ({}));
          const errorMessage = errorData.error || `Request failed with status ${response.status}`;
          throw new Error(errorMessage);
        }

        // Handle streaming response
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('Response body is not readable');
        }

        const decoder = new TextDecoder();
        let accumulatedText = '';

        try {
          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // Decode the chunk and accumulate
            const chunk = decoder.decode(value, { stream: true });
            accumulatedText += chunk;
            setText(accumulatedText);
          }
        } finally {
          reader.releaseLock();
        }

        // Stream completed successfully
        setIsLoading(false);
        onFinish?.(accumulatedText);
      } catch (err) {
        // Handle abort separately
        if (err instanceof Error && err.name === 'AbortError') {
          setIsLoading(false);
          return;
        }

        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        setIsLoading(false);
        onError?.(error);
      }
    },
    [apiEndpoint, onError, onFinish]
  );

  /**
   * Stop the current streaming request
   */
  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  }, []);

  /**
   * Reset the hook state
   */
  const reset = useCallback(() => {
    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    setText('');
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    text,
    isLoading,
    error,
    interpret,
    stop,
    reset,
  };
}
