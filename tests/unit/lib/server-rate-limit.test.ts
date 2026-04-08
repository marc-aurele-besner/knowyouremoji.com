import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import * as cacheModule from '../../../src/lib/cache';
import {
  checkRateLimit,
  getClientIp,
  rateLimitHeaders,
  buildRateLimitKey,
  DEFAULT_RATE_LIMIT,
  DEFAULT_WINDOW_SECONDS,
} from '../../../src/lib/server-rate-limit';

// Mock Redis client
const mockObj = {
  incr: (_key: string) => Promise.resolve(1 as number),
  expire: (_key: string, _seconds: number) => Promise.resolve(true as boolean),
  ttl: (_key: string) => Promise.resolve(86400 as number),
};
const mockIncr = spyOn(mockObj, 'incr');
const mockExpire = spyOn(mockObj, 'expire');
const mockTtl = spyOn(mockObj, 'ttl');

function createMockRedisClient() {
  return {
    incr: (key: string) => mockIncr(key),
    expire: (key: string, seconds: number) => mockExpire(key, seconds),
    ttl: (key: string) => mockTtl(key),
  };
}

let isRedisConfiguredSpy: ReturnType<typeof spyOn>;
let getRedisClientSpy: ReturnType<typeof spyOn>;

describe('server-rate-limit', () => {
  beforeEach(() => {
    // Reset mock implementations
    mockIncr.mockReset();
    mockExpire.mockReset();
    mockTtl.mockReset();
    mockIncr.mockImplementation(() => Promise.resolve(1));
    mockExpire.mockImplementation(() => Promise.resolve(true));
    mockTtl.mockImplementation(() => Promise.resolve(86400));

    // Spy on cache module functions
    isRedisConfiguredSpy = spyOn(cacheModule, 'isRedisConfigured').mockReturnValue(false);
    getRedisClientSpy = spyOn(cacheModule, 'getRedisClient').mockReturnValue(null);
  });

  afterEach(() => {
    isRedisConfiguredSpy.mockRestore();
    getRedisClientSpy.mockRestore();
  });

  describe('buildRateLimitKey', () => {
    it('should build key with default prefix', () => {
      expect(buildRateLimitKey('192.168.1.1')).toBe('kye:ratelimit:192.168.1.1');
    });

    it('should build key with custom prefix', () => {
      expect(buildRateLimitKey('user-123', 'kye:custom')).toBe('kye:custom:user-123');
    });
  });

  describe('getClientIp', () => {
    it('should extract IP from x-forwarded-for header', () => {
      const headers = new Headers({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
      expect(getClientIp(headers)).toBe('1.2.3.4');
    });

    it('should extract single IP from x-forwarded-for', () => {
      const headers = new Headers({ 'x-forwarded-for': '10.0.0.1' });
      expect(getClientIp(headers)).toBe('10.0.0.1');
    });

    it('should fall back to x-real-ip', () => {
      const headers = new Headers({ 'x-real-ip': '10.0.0.2' });
      expect(getClientIp(headers)).toBe('10.0.0.2');
    });

    it('should prefer x-forwarded-for over x-real-ip', () => {
      const headers = new Headers({
        'x-forwarded-for': '1.1.1.1',
        'x-real-ip': '2.2.2.2',
      });
      expect(getClientIp(headers)).toBe('1.1.1.1');
    });

    it('should return "unknown" when no IP headers present', () => {
      const headers = new Headers({});
      expect(getClientIp(headers)).toBe('unknown');
    });

    it('should handle empty x-forwarded-for gracefully', () => {
      const headers = new Headers({ 'x-forwarded-for': '' });
      expect(getClientIp(headers)).toBe('unknown');
    });
  });

  describe('rateLimitHeaders', () => {
    it('should return rate limit headers for allowed request', () => {
      const result = {
        allowed: true,
        remaining: 5,
        limit: 10,
        resetAt: 1700000000,
      };
      const headers = rateLimitHeaders(result);
      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('5');
      expect(headers['X-RateLimit-Reset']).toBe('1700000000');
      expect(headers['Retry-After']).toBeUndefined();
    });

    it('should include Retry-After for denied request', () => {
      const now = Math.floor(Date.now() / 1000);
      const result = {
        allowed: false,
        remaining: 0,
        limit: 10,
        resetAt: now + 3600,
      };
      const headers = rateLimitHeaders(result);
      expect(headers['X-RateLimit-Limit']).toBe('10');
      expect(headers['X-RateLimit-Remaining']).toBe('0');
      expect(headers['Retry-After']).toBeDefined();
      const retryAfter = parseInt(headers['Retry-After']!);
      expect(retryAfter).toBeGreaterThan(0);
      expect(retryAfter).toBeLessThanOrEqual(3600);
    });
  });

  describe('checkRateLimit', () => {
    it('should allow requests when Redis is not configured', async () => {
      isRedisConfiguredSpy.mockReturnValue(false);
      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DEFAULT_RATE_LIMIT);
      expect(result.limit).toBe(DEFAULT_RATE_LIMIT);
    });

    it('should allow requests when Redis client returns null', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(null);
      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DEFAULT_RATE_LIMIT);
    });

    it('should allow first request and set expiry', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.resolve(1));
      mockTtl.mockImplementation(() => Promise.resolve(86400));

      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DEFAULT_RATE_LIMIT - 1);
      expect(mockIncr).toHaveBeenCalledTimes(1);
      expect(mockExpire).toHaveBeenCalledTimes(1);
    });

    it('should not set expiry on subsequent requests', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.resolve(5));
      mockTtl.mockImplementation(() => Promise.resolve(50000));

      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DEFAULT_RATE_LIMIT - 5);
      expect(mockIncr).toHaveBeenCalledTimes(1);
      expect(mockExpire).not.toHaveBeenCalled();
    });

    it('should deny when limit exceeded', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.resolve(11));
      mockTtl.mockImplementation(() => Promise.resolve(50000));

      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should deny when exactly at limit + 1', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.resolve(DEFAULT_RATE_LIMIT + 1));
      mockTtl.mockImplementation(() => Promise.resolve(50000));

      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should allow when exactly at limit', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.resolve(DEFAULT_RATE_LIMIT));
      mockTtl.mockImplementation(() => Promise.resolve(50000));

      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(0);
    });

    it('should use custom config values', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.resolve(3));
      mockTtl.mockImplementation(() => Promise.resolve(3600));

      const result = await checkRateLimit('192.168.1.1', {
        limit: 5,
        windowSeconds: 3600,
        prefix: 'kye:custom',
      });
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('should deny with custom limit', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.resolve(6));
      mockTtl.mockImplementation(() => Promise.resolve(3600));

      const result = await checkRateLimit('192.168.1.1', { limit: 5 });
      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it('should fail open on Redis errors', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.reject(new Error('Redis connection failed')));

      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});
      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(DEFAULT_RATE_LIMIT);
      consoleSpy.mockRestore();
    });

    it('should handle negative TTL gracefully', async () => {
      isRedisConfiguredSpy.mockReturnValue(true);
      getRedisClientSpy.mockReturnValue(createMockRedisClient());
      mockIncr.mockImplementation(() => Promise.resolve(1));
      mockTtl.mockImplementation(() => Promise.resolve(-1));

      const result = await checkRateLimit('192.168.1.1');
      expect(result.allowed).toBe(true);
      expect(result.resetAt).toBeGreaterThan(0);
    });
  });

  describe('constants', () => {
    it('should have correct default rate limit', () => {
      expect(DEFAULT_RATE_LIMIT).toBe(10);
    });

    it('should have correct default window (24 hours)', () => {
      expect(DEFAULT_WINDOW_SECONDS).toBe(86400);
    });
  });
});
