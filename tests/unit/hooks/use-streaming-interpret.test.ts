import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { renderHook, act, cleanup, waitFor } from '@testing-library/react';
import { useStreamingInterpret } from '@/hooks/use-streaming-interpret';

// Store original fetch
let originalFetch: typeof fetch;

beforeEach(() => {
  originalFetch = globalThis.fetch;
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

// Helper to create a mock ReadableStream
function createMockStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let index = 0;

  return new ReadableStream<Uint8Array>({
    pull(controller) {
      if (index < chunks.length) {
        controller.enqueue(encoder.encode(chunks[index]));
        index++;
      } else {
        controller.close();
      }
    },
  });
}

// Helper to create mock fetch response with stream
function createMockFetchWithStream(
  chunks: string[],
  options: { ok?: boolean; status?: number; errorJson?: object } = {}
) {
  const { ok = true, status = 200, errorJson } = options;

  return mock(() =>
    Promise.resolve({
      ok,
      status,
      body: ok ? createMockStream(chunks) : null,
      json: () => Promise.resolve(errorJson || { error: 'Test error' }),
    } as Response)
  ) as unknown as typeof fetch;
}

describe('useStreamingInterpret', () => {
  describe('initial state', () => {
    it('returns initial state with empty text', () => {
      const { result } = renderHook(() => useStreamingInterpret());

      expect(result.current.text).toBe('');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('provides interpret function', () => {
      const { result } = renderHook(() => useStreamingInterpret());

      expect(typeof result.current.interpret).toBe('function');
    });

    it('provides stop function', () => {
      const { result } = renderHook(() => useStreamingInterpret());

      expect(typeof result.current.stop).toBe('function');
    });

    it('provides reset function', () => {
      const { result } = renderHook(() => useStreamingInterpret());

      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('interpret function', () => {
    it('sets isLoading to true when called', async () => {
      const { result } = renderHook(() => useStreamingInterpret());

      // Mock fetch to never resolve during test
      const mockFetch = mock(() => new Promise(() => {})) as unknown as typeof fetch;
      globalThis.fetch = mockFetch;

      act(() => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('streams text progressively and calls onFinish', async () => {
      const onFinish = mock(() => {});
      const chunks = ['Hello ', 'world ', 'streaming!'];
      globalThis.fetch = createMockFetchWithStream(chunks);

      const { result } = renderHook(() => useStreamingInterpret({ onFinish }));

      await act(async () => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.text).toBe('Hello world streaming!');
      expect(result.current.error).toBeNull();
      expect(onFinish).toHaveBeenCalledWith('Hello world streaming!');
    });

    it('handles HTTP error response with error message', async () => {
      const onError = mock(() => {});
      globalThis.fetch = createMockFetchWithStream([], {
        ok: false,
        status: 400,
        errorJson: { error: 'Custom error message' },
      });

      const { result } = renderHook(() => useStreamingInterpret({ onError }));

      await act(async () => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.error?.message).toBe('Custom error message');
      expect(onError).toHaveBeenCalled();
    });

    it('handles HTTP error response with status code fallback', async () => {
      const onError = mock(() => {});
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          json: () => Promise.reject(new Error('JSON parse error')),
        } as Response)
      ) as unknown as typeof fetch;

      const { result } = renderHook(() => useStreamingInterpret({ onError }));

      await act(async () => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toContain('500');
      expect(onError).toHaveBeenCalled();
    });

    it('handles response with no body', async () => {
      const onError = mock(() => {});
      globalThis.fetch = mock(() =>
        Promise.resolve({
          ok: true,
          status: 200,
          body: null,
        } as Response)
      ) as unknown as typeof fetch;

      const { result } = renderHook(() => useStreamingInterpret({ onError }));

      await act(async () => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe('Response body is not readable');
      expect(onError).toHaveBeenCalled();
    });

    it('handles network error', async () => {
      const onError = mock(() => {});
      globalThis.fetch = mock(() =>
        Promise.reject(new Error('Network error'))
      ) as unknown as typeof fetch;

      const { result } = renderHook(() => useStreamingInterpret({ onError }));

      await act(async () => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe('Network error');
      expect(onError).toHaveBeenCalled();
    });

    it('handles non-Error thrown values', async () => {
      const onError = mock(() => {});
      globalThis.fetch = mock(() => Promise.reject('string error')) as unknown as typeof fetch;

      const { result } = renderHook(() => useStreamingInterpret({ onError }));

      await act(async () => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error?.message).toBe('Unknown error');
      expect(onError).toHaveBeenCalled();
    });

    it('cancels previous request when calling interpret again', async () => {
      const chunks = ['chunk1'];
      let fetchCallCount = 0;
      globalThis.fetch = mock(() => {
        fetchCallCount++;
        // First call takes longer
        if (fetchCallCount === 1) {
          return new Promise(() => {}); // Never resolves
        }
        return Promise.resolve({
          ok: true,
          status: 200,
          body: createMockStream(chunks),
        } as Response);
      }) as unknown as typeof fetch;

      const { result } = renderHook(() => useStreamingInterpret());

      // Start first request
      act(() => {
        result.current.interpret({
          message: 'First request 😀 message here',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      // Start second request immediately
      await act(async () => {
        result.current.interpret({
          message: 'Second request 😊 message here',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(fetchCallCount).toBe(2);
    });

    it('uses custom API endpoint', async () => {
      let capturedUrl = '';
      globalThis.fetch = mock((url: string) => {
        capturedUrl = url;
        return Promise.resolve({
          ok: true,
          status: 200,
          body: createMockStream(['test']),
        } as Response);
      }) as unknown as typeof fetch;

      const { result } = renderHook(() =>
        useStreamingInterpret({ apiEndpoint: '/api/custom-interpret' })
      );

      await act(async () => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(capturedUrl).toBe('/api/custom-interpret');
    });
  });

  describe('stop function', () => {
    it('stops loading when called', async () => {
      // Mock fetch to never resolve
      globalThis.fetch = mock(() => new Promise(() => {})) as unknown as typeof fetch;

      const { result } = renderHook(() => useStreamingInterpret());

      act(() => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.stop();
      });

      expect(result.current.isLoading).toBe(false);
    });

    it('handles abort error gracefully', async () => {
      // Create a fetch that will be aborted
      globalThis.fetch = mock((_url: string, options?: RequestInit) => {
        return new Promise((_, reject) => {
          options?.signal?.addEventListener('abort', () => {
            const abortError = new Error('Aborted');
            abortError.name = 'AbortError';
            reject(abortError);
          });
        });
      }) as unknown as typeof fetch;

      const onError = mock(() => {});
      const { result } = renderHook(() => useStreamingInterpret({ onError }));

      act(() => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      // Abort the request
      await act(async () => {
        result.current.stop();
        // Wait a tick for the abort to be processed
        await new Promise((r) => setTimeout(r, 10));
      });

      // onError should NOT be called for abort
      expect(onError).not.toHaveBeenCalled();
      expect(result.current.error).toBeNull();
    });

    it('can be called safely when no request is in progress', () => {
      const { result } = renderHook(() => useStreamingInterpret());

      // Should not throw
      act(() => {
        result.current.stop();
      });

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('reset function', () => {
    it('clears text and error', () => {
      const { result } = renderHook(() => useStreamingInterpret());

      act(() => {
        result.current.reset();
      });

      expect(result.current.text).toBe('');
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('aborts any in-progress request', async () => {
      globalThis.fetch = mock(() => new Promise(() => {})) as unknown as typeof fetch;

      const { result } = renderHook(() => useStreamingInterpret());

      act(() => {
        result.current.interpret({
          message: 'Hello there friend 😀 how are you?',
          platform: 'IMESSAGE',
          context: 'FRIEND',
        });
      });

      expect(result.current.isLoading).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.text).toBe('');
      expect(result.current.error).toBeNull();
    });

    it('can be called safely when no request is in progress', () => {
      const { result } = renderHook(() => useStreamingInterpret());

      // Should not throw
      act(() => {
        result.current.reset();
      });

      expect(result.current.text).toBe('');
    });
  });

  describe('options', () => {
    it('accepts custom API endpoint', () => {
      const { result } = renderHook(() =>
        useStreamingInterpret({ apiEndpoint: '/api/custom-interpret' })
      );

      expect(result.current.text).toBe('');
    });

    it('accepts onError callback', () => {
      const onError = mock(() => {});
      const { result } = renderHook(() => useStreamingInterpret({ onError }));

      expect(result.current.text).toBe('');
    });

    it('accepts onFinish callback', () => {
      const onFinish = mock(() => {});
      const { result } = renderHook(() => useStreamingInterpret({ onFinish }));

      expect(result.current.text).toBe('');
    });
  });

  describe('return type', () => {
    it('returns correct shape', () => {
      const { result } = renderHook(() => useStreamingInterpret());

      expect(result.current).toHaveProperty('text');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('error');
      expect(result.current).toHaveProperty('interpret');
      expect(result.current).toHaveProperty('stop');
      expect(result.current).toHaveProperty('reset');
    });
  });
});
