import { describe, it, expect, beforeEach, afterEach, spyOn } from 'bun:test';
import {
  getRedisClient,
  cacheGet,
  cacheSet,
  cacheDelete,
  clearCache,
  isRedisConfigured,
  getCacheKey,
  CACHE_PREFIXES,
  DEFAULT_TTL,
  hashInterpretationRequest,
} from '../../../src/lib/cache';

// Store original env
const originalEnv = { ...process.env };

describe('cache module', () => {
  beforeEach(() => {
    // Reset process.env before each test
    process.env = { ...originalEnv };
    // Clear any cached Redis client
    clearCache();
  });

  afterEach(() => {
    // Restore original env
    process.env = originalEnv;
  });

  describe('isRedisConfigured', () => {
    it('should return false when UPSTASH_REDIS_REST_URL is not set', () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      expect(isRedisConfigured()).toBe(false);
    });

    it('should return false when UPSTASH_REDIS_REST_TOKEN is not set', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      expect(isRedisConfigured()).toBe(false);
    });

    it('should return true when both URL and TOKEN are set', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
      expect(isRedisConfigured()).toBe(true);
    });
  });

  describe('getRedisClient', () => {
    it('should return null when Redis is not configured', () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const client = getRedisClient();
      expect(client).toBeNull();
    });

    it('should return a Redis client when configured', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
      const client = getRedisClient();
      expect(client).not.toBeNull();
    });

    it('should return the same client instance on subsequent calls', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
      const client1 = getRedisClient();
      const client2 = getRedisClient();
      expect(client1).toBe(client2);
    });
  });

  describe('getCacheKey', () => {
    it('should create a key with emoji prefix', () => {
      const key = getCacheKey(CACHE_PREFIXES.EMOJI, 'fire');
      expect(key).toBe('kye:emoji:fire');
    });

    it('should create a key with interpretation prefix', () => {
      const key = getCacheKey(CACHE_PREFIXES.INTERPRETATION, 'abc123');
      expect(key).toBe('kye:interpretation:abc123');
    });

    it('should create a key with all_emojis prefix', () => {
      const key = getCacheKey(CACHE_PREFIXES.ALL_EMOJIS);
      expect(key).toBe('kye:all_emojis');
    });
  });

  describe('CACHE_PREFIXES', () => {
    it('should have emoji prefix', () => {
      expect(CACHE_PREFIXES.EMOJI).toBe('emoji');
    });

    it('should have interpretation prefix', () => {
      expect(CACHE_PREFIXES.INTERPRETATION).toBe('interpretation');
    });

    it('should have all_emojis prefix', () => {
      expect(CACHE_PREFIXES.ALL_EMOJIS).toBe('all_emojis');
    });
  });

  describe('DEFAULT_TTL', () => {
    it('should have emoji TTL of 1 hour', () => {
      expect(DEFAULT_TTL.EMOJI).toBe(3600);
    });

    it('should have interpretation TTL of 24 hours', () => {
      expect(DEFAULT_TTL.INTERPRETATION).toBe(86400);
    });

    it('should have all_emojis TTL of 1 hour', () => {
      expect(DEFAULT_TTL.ALL_EMOJIS).toBe(3600);
    });
  });

  describe('cacheGet', () => {
    it('should return null when Redis is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const result = await cacheGet('test-key');
      expect(result).toBeNull();
    });
  });

  describe('cacheSet', () => {
    it('should return false when Redis is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const result = await cacheSet('test-key', { data: 'test' });
      expect(result).toBe(false);
    });
  });

  describe('cacheDelete', () => {
    it('should return false when Redis is not configured', async () => {
      delete process.env.UPSTASH_REDIS_REST_URL;
      delete process.env.UPSTASH_REDIS_REST_TOKEN;
      const result = await cacheDelete('test-key');
      expect(result).toBe(false);
    });
  });

  describe('clearCache', () => {
    it('should clear the cached Redis client', () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';
      // Get a client to initialize
      getRedisClient();
      clearCache();
      // After clearing, verify clearCache doesn't throw
      expect(() => clearCache()).not.toThrow();
    });
  });

  describe('hashInterpretationRequest', () => {
    it('should generate a hash for a message only', () => {
      const hash = hashInterpretationRequest('Hello world');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate a hash with platform context', () => {
      const hash = hashInterpretationRequest('Hello world', 'twitter');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate a hash with platform and relationship context', () => {
      const hash = hashInterpretationRequest('Hello world', 'twitter', 'friend');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should generate different hashes for different messages', () => {
      const hash1 = hashInterpretationRequest('Hello world');
      const hash2 = hashInterpretationRequest('Goodbye world');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate different hashes for same message with different platforms', () => {
      const hash1 = hashInterpretationRequest('Hello world', 'twitter');
      const hash2 = hashInterpretationRequest('Hello world', 'instagram');
      expect(hash1).not.toBe(hash2);
    });

    it('should generate the same hash for the same input', () => {
      const hash1 = hashInterpretationRequest('Hello world', 'twitter', 'friend');
      const hash2 = hashInterpretationRequest('Hello world', 'twitter', 'friend');
      expect(hash1).toBe(hash2);
    });

    it('should handle undefined platform and relationship', () => {
      const hash1 = hashInterpretationRequest('Hello world');
      const hash2 = hashInterpretationRequest('Hello world', undefined, undefined);
      expect(hash1).toBe(hash2);
    });

    it('should handle empty string message', () => {
      const hash = hashInterpretationRequest('');
      expect(typeof hash).toBe('string');
    });

    it('should handle message with emojis', () => {
      const hash = hashInterpretationRequest('Hello 👋 world 🌍');
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle very long messages', () => {
      const longMessage = 'a'.repeat(10000);
      const hash = hashInterpretationRequest(longMessage);
      expect(typeof hash).toBe('string');
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('cacheGet error handling', () => {
    it('should return null and log error when Redis call fails', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://invalid-test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

      // Suppress console.error during this test
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

      const result = await cacheGet('test-key');
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('cacheSet error handling', () => {
    it('should return false and log error when Redis call fails with TTL', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://invalid-test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

      // Suppress console.error during this test
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

      const result = await cacheSet('test-key', { data: 'test' }, 3600);
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should return false and log error when Redis call fails without TTL', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://invalid-test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

      // Suppress console.error during this test
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

      const result = await cacheSet('test-key', { data: 'test' });
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });

  describe('cacheDelete error handling', () => {
    it('should return false and log error when Redis call fails', async () => {
      process.env.UPSTASH_REDIS_REST_URL = 'https://invalid-test.upstash.io';
      process.env.UPSTASH_REDIS_REST_TOKEN = 'test-token';

      // Suppress console.error during this test
      const consoleSpy = spyOn(console, 'error').mockImplementation(() => {});

      const result = await cacheDelete('test-key');
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
