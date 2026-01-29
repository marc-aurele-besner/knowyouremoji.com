import { describe, it, expect, beforeEach } from 'bun:test';
import {
  RateLimiter,
  STORAGE_KEY,
  DEFAULT_MAX_USES,
  getRateLimiter,
} from '../../../src/lib/rate-limit';

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

describe('RateLimiter', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    globalThis.localStorage = localStorageMock;
  });

  describe('constructor', () => {
    it('should create a rate limiter with default max uses', () => {
      const limiter = new RateLimiter();
      expect(limiter.getMaxUses()).toBe(DEFAULT_MAX_USES);
    });

    it('should create a rate limiter with custom max uses', () => {
      const limiter = new RateLimiter(10);
      expect(limiter.getMaxUses()).toBe(10);
    });
  });

  describe('canUse', () => {
    it('should return true when under the limit', () => {
      const limiter = new RateLimiter(3);
      expect(limiter.canUse()).toBe(true);
    });

    it('should return false when at the limit', () => {
      const limiter = new RateLimiter(3);
      limiter.recordUse();
      limiter.recordUse();
      limiter.recordUse();
      expect(limiter.canUse()).toBe(false);
    });

    it('should return true after limit reached if day has changed', () => {
      const limiter = new RateLimiter(1);
      limiter.recordUse();
      expect(limiter.canUse()).toBe(false);

      // Simulate day change by modifying stored data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const data = {
        count: 1,
        date: yesterday.toDateString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      expect(limiter.canUse()).toBe(true);
    });
  });

  describe('recordUse', () => {
    it('should increment usage count', () => {
      const limiter = new RateLimiter(3);
      expect(limiter.getUsedCount()).toBe(0);
      limiter.recordUse();
      expect(limiter.getUsedCount()).toBe(1);
      limiter.recordUse();
      expect(limiter.getUsedCount()).toBe(2);
    });

    it('should persist usage count to localStorage', () => {
      const limiter = new RateLimiter(3);
      limiter.recordUse();

      const stored = localStorage.getItem(STORAGE_KEY);
      expect(stored).not.toBeNull();

      const data = JSON.parse(stored!);
      expect(data.count).toBe(1);
      expect(data.date).toBe(new Date().toDateString());
    });

    it('should return remaining uses after recording', () => {
      const limiter = new RateLimiter(3);
      expect(limiter.recordUse()).toBe(2);
      expect(limiter.recordUse()).toBe(1);
      expect(limiter.recordUse()).toBe(0);
    });

    it('should not increment beyond the limit', () => {
      const limiter = new RateLimiter(2);
      limiter.recordUse();
      limiter.recordUse();
      limiter.recordUse(); // Should not increment
      expect(limiter.getUsedCount()).toBe(2);
    });
  });

  describe('getRemainingUses', () => {
    it('should return max uses when unused', () => {
      const limiter = new RateLimiter(3);
      expect(limiter.getRemainingUses()).toBe(3);
    });

    it('should return correct remaining uses after some usage', () => {
      const limiter = new RateLimiter(3);
      limiter.recordUse();
      expect(limiter.getRemainingUses()).toBe(2);
    });

    it('should return 0 when limit reached', () => {
      const limiter = new RateLimiter(2);
      limiter.recordUse();
      limiter.recordUse();
      expect(limiter.getRemainingUses()).toBe(0);
    });
  });

  describe('getUsedCount', () => {
    it('should return 0 when no uses recorded', () => {
      const limiter = new RateLimiter(3);
      expect(limiter.getUsedCount()).toBe(0);
    });

    it('should return correct count after uses', () => {
      const limiter = new RateLimiter(5);
      limiter.recordUse();
      limiter.recordUse();
      limiter.recordUse();
      expect(limiter.getUsedCount()).toBe(3);
    });
  });

  describe('reset', () => {
    it('should reset the usage count to 0', () => {
      const limiter = new RateLimiter(3);
      limiter.recordUse();
      limiter.recordUse();
      expect(limiter.getUsedCount()).toBe(2);

      limiter.reset();
      expect(limiter.getUsedCount()).toBe(0);
      expect(limiter.getRemainingUses()).toBe(3);
    });

    it('should clear localStorage data', () => {
      const limiter = new RateLimiter(3);
      limiter.recordUse();
      expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();

      limiter.reset();
      expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
    });
  });

  describe('midnight reset', () => {
    it('should reset count when date changes', () => {
      const limiter = new RateLimiter(3);
      limiter.recordUse();
      limiter.recordUse();
      expect(limiter.getUsedCount()).toBe(2);

      // Simulate stored data from yesterday
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const oldData = {
        count: 2,
        date: yesterday.toDateString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(oldData));

      // Create new limiter instance (simulates page reload)
      const newLimiter = new RateLimiter(3);
      expect(newLimiter.getUsedCount()).toBe(0);
      expect(newLimiter.getRemainingUses()).toBe(3);
    });

    it('should preserve count when date is the same', () => {
      const limiter = new RateLimiter(3);
      limiter.recordUse();
      limiter.recordUse();

      // Create new limiter instance (simulates page reload)
      const newLimiter = new RateLimiter(3);
      expect(newLimiter.getUsedCount()).toBe(2);
    });
  });

  describe('persistence across page reloads', () => {
    it('should persist usage count across instances', () => {
      const limiter1 = new RateLimiter(5);
      limiter1.recordUse();
      limiter1.recordUse();

      // Simulate page reload with new instance
      const limiter2 = new RateLimiter(5);
      expect(limiter2.getUsedCount()).toBe(2);
      expect(limiter2.getRemainingUses()).toBe(3);
    });
  });

  describe('edge cases', () => {
    it('should handle corrupted localStorage data gracefully', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid-json');
      const limiter = new RateLimiter(3);
      expect(limiter.getUsedCount()).toBe(0);
      expect(limiter.canUse()).toBe(true);
    });

    it('should handle missing count in stored data', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: new Date().toDateString() }));
      const limiter = new RateLimiter(3);
      expect(limiter.getUsedCount()).toBe(0);
    });

    it('should handle missing date in stored data', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ count: 2 }));
      const limiter = new RateLimiter(3);
      // Without date, should reset
      expect(limiter.getUsedCount()).toBe(0);
    });

    it('should handle zero max uses', () => {
      const limiter = new RateLimiter(0);
      expect(limiter.canUse()).toBe(false);
      expect(limiter.getRemainingUses()).toBe(0);
    });

    it('should handle negative max uses as zero', () => {
      const limiter = new RateLimiter(-5);
      expect(limiter.canUse()).toBe(false);
      expect(limiter.getMaxUses()).toBe(0);
    });
  });

  describe('localStorage unavailable', () => {
    it('should work without localStorage (returns defaults)', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (globalThis as any).localStorage;

      const limiter = new RateLimiter(3);
      expect(limiter.getUsedCount()).toBe(0);
      expect(limiter.canUse()).toBe(true);

      // Recording should not throw
      expect(() => limiter.recordUse()).not.toThrow();

      // Reset the mock for other tests
      globalThis.localStorage = localStorageMock;
    });

    it('should handle localStorage access throwing an error', () => {
      // Create a getter that throws when accessed
      Object.defineProperty(globalThis, 'localStorage', {
        get: () => {
          throw new Error('localStorage access denied');
        },
        configurable: true,
      });

      const limiter = new RateLimiter(3);
      expect(limiter.getUsedCount()).toBe(0);
      expect(limiter.canUse()).toBe(true);
      expect(() => limiter.recordUse()).not.toThrow();
      expect(() => limiter.reset()).not.toThrow();

      // Restore localStorage mock
      Object.defineProperty(globalThis, 'localStorage', {
        value: localStorageMock,
        configurable: true,
        writable: true,
      });
    });
  });

  describe('localStorage errors on write', () => {
    it('should handle setItem throwing (quota exceeded)', () => {
      const errorMock = {
        ...localStorageMock,
        setItem: () => {
          throw new Error('QuotaExceededError');
        },
      };
      globalThis.localStorage = errorMock;

      const limiter = new RateLimiter(3);
      // Should not throw even when setItem fails
      expect(() => limiter.recordUse()).not.toThrow();
      // Since setItem failed, count should still be 0 on next read
      expect(limiter.getUsedCount()).toBe(0);
    });

    it('should handle removeItem throwing', () => {
      const errorMock = {
        ...localStorageMock,
        removeItem: () => {
          throw new Error('Storage error');
        },
      };
      globalThis.localStorage = errorMock;

      const limiter = new RateLimiter(3);
      limiter.recordUse();
      // Should not throw even when removeItem fails
      expect(() => limiter.reset()).not.toThrow();
    });
  });

  describe('multiple instances sharing state', () => {
    it('should share usage count across instances', () => {
      const limiter1 = new RateLimiter(5);
      const limiter2 = new RateLimiter(5);

      limiter1.recordUse();
      expect(limiter2.getUsedCount()).toBe(1);

      limiter2.recordUse();
      expect(limiter1.getUsedCount()).toBe(2);
    });

    it('should respect different max uses across instances', () => {
      const limiter1 = new RateLimiter(2);
      const limiter2 = new RateLimiter(5);

      limiter1.recordUse();
      limiter1.recordUse();

      // limiter1 is at its limit
      expect(limiter1.canUse()).toBe(false);
      // limiter2 has higher limit, so it can still use
      expect(limiter2.canUse()).toBe(true);
      expect(limiter2.getRemainingUses()).toBe(3);
    });
  });

  describe('recordUse at limit', () => {
    it('should return 0 when called at limit', () => {
      const limiter = new RateLimiter(2);
      limiter.recordUse();
      limiter.recordUse();

      // Already at limit, calling again should return 0
      expect(limiter.recordUse()).toBe(0);
    });
  });
});

describe('getRateLimiter', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    globalThis.localStorage = localStorageMock;
  });

  it('should return a singleton instance', () => {
    const limiter1 = getRateLimiter();
    const limiter2 = getRateLimiter();
    expect(limiter1).toBe(limiter2);
  });

  it('should return a limiter with default max uses', () => {
    const limiter = getRateLimiter();
    expect(limiter.getMaxUses()).toBe(DEFAULT_MAX_USES);
  });
});

describe('constants', () => {
  it('should export STORAGE_KEY', () => {
    expect(STORAGE_KEY).toBe('kye_rate_limit');
  });

  it('should export DEFAULT_MAX_USES as 3', () => {
    expect(DEFAULT_MAX_USES).toBe(3);
  });
});
