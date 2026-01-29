import { describe, it, expect, beforeEach } from 'bun:test';
import { renderHook, act } from '@testing-library/react';
import { useRateLimit } from '@/hooks/use-rate-limit';
import { STORAGE_KEY } from '@/lib/rate-limit';

// Mock localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  };
};

describe('useRateLimit', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    globalThis.localStorage = localStorageMock;
  });

  describe('initialization', () => {
    it('should return initial rate limit state', () => {
      const { result } = renderHook(() => useRateLimit());

      expect(result.current.remaining).toBe(3);
      expect(result.current.used).toBe(0);
      expect(result.current.maxUses).toBe(3);
      expect(result.current.canUse).toBe(true);
      expect(result.current.isLimited).toBe(false);
    });

    it('should accept custom maxUses', () => {
      const { result } = renderHook(() => useRateLimit({ maxUses: 5 }));

      expect(result.current.remaining).toBe(5);
      expect(result.current.maxUses).toBe(5);
    });
  });

  describe('recordUse', () => {
    it('should decrement remaining uses when recordUse is called', () => {
      const { result } = renderHook(() => useRateLimit());

      act(() => {
        result.current.recordUse();
      });

      expect(result.current.remaining).toBe(2);
      expect(result.current.used).toBe(1);
    });

    it('should set isLimited to true when remaining reaches 0', () => {
      const { result } = renderHook(() => useRateLimit({ maxUses: 1 }));

      expect(result.current.isLimited).toBe(false);

      act(() => {
        result.current.recordUse();
      });

      expect(result.current.remaining).toBe(0);
      expect(result.current.isLimited).toBe(true);
      expect(result.current.canUse).toBe(false);
    });

    it('should not decrement below 0', () => {
      const { result } = renderHook(() => useRateLimit({ maxUses: 1 }));

      act(() => {
        result.current.recordUse();
        result.current.recordUse();
      });

      expect(result.current.remaining).toBe(0);
      expect(result.current.used).toBe(1);
    });

    it('should return remaining uses after recording', () => {
      const { result } = renderHook(() => useRateLimit({ maxUses: 3 }));

      let remainingAfter: number = -1;
      act(() => {
        remainingAfter = result.current.recordUse();
      });

      expect(remainingAfter).toBe(2);
    });
  });

  describe('reset', () => {
    it('should reset the rate limit to initial state', () => {
      const { result } = renderHook(() => useRateLimit());

      act(() => {
        result.current.recordUse();
        result.current.recordUse();
      });

      expect(result.current.remaining).toBe(1);

      act(() => {
        result.current.reset();
      });

      expect(result.current.remaining).toBe(3);
      expect(result.current.used).toBe(0);
      expect(result.current.canUse).toBe(true);
      expect(result.current.isLimited).toBe(false);
    });
  });

  describe('resetTime', () => {
    it('should return a Date object for the next reset time', () => {
      const { result } = renderHook(() => useRateLimit());

      expect(result.current.resetTime).toBeInstanceOf(Date);
    });

    it('should return midnight of the next day', () => {
      const { result } = renderHook(() => useRateLimit());

      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      expect(result.current.resetTime.getTime()).toBe(tomorrow.getTime());
    });
  });

  describe('persistence', () => {
    it('should persist state across hook re-renders', () => {
      const { result, rerender } = renderHook(() => useRateLimit());

      act(() => {
        result.current.recordUse();
      });

      rerender();

      expect(result.current.remaining).toBe(2);
      expect(result.current.used).toBe(1);
    });

    it('should restore state from localStorage on mount', () => {
      // Pre-populate localStorage
      const data = {
        count: 2,
        date: new Date().toDateString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      const { result } = renderHook(() => useRateLimit());

      expect(result.current.used).toBe(2);
      expect(result.current.remaining).toBe(1);
    });
  });

  describe('midnight reset', () => {
    it('should reset when date changes', () => {
      // Pre-populate with yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const data = {
        count: 3,
        date: yesterday.toDateString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      const { result } = renderHook(() => useRateLimit());

      expect(result.current.used).toBe(0);
      expect(result.current.remaining).toBe(3);
      expect(result.current.isLimited).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle zero maxUses', () => {
      const { result } = renderHook(() => useRateLimit({ maxUses: 0 }));

      expect(result.current.remaining).toBe(0);
      expect(result.current.canUse).toBe(false);
      expect(result.current.isLimited).toBe(true);
    });

    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json');

      const { result } = renderHook(() => useRateLimit());

      expect(result.current.remaining).toBe(3);
      expect(result.current.used).toBe(0);
    });
  });
});
