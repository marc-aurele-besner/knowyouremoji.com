import { describe, it, expect, mock, afterEach } from 'bun:test';
import { renderHook, act, cleanup } from '@testing-library/react';
import { useStreamingInterpret } from '@/hooks/use-streaming-interpret';

afterEach(() => {
  cleanup();
});

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
      const originalFetch = globalThis.fetch;
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

      globalThis.fetch = originalFetch;
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
