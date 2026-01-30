/**
 * Redis Cache Module for KnowYourEmoji
 *
 * This module provides Redis-based caching using Upstash Redis.
 * It supports caching for:
 * - Emoji data
 * - Interpretation results
 * - All emojis list
 *
 * The cache is optional - if Redis is not configured, all operations
 * gracefully fall back to returning null/false without errors.
 */

import { Redis } from '@upstash/redis';

// ============================================
// CONSTANTS
// ============================================

/**
 * Cache key prefixes for different data types
 */
export const CACHE_PREFIXES = {
  EMOJI: 'emoji',
  INTERPRETATION: 'interpretation',
  ALL_EMOJIS: 'all_emojis',
} as const;

/**
 * Default TTL values in seconds
 */
export const DEFAULT_TTL = {
  /** Emoji data TTL - 1 hour */
  EMOJI: 3600,
  /** Interpretation result TTL - 24 hours */
  INTERPRETATION: 86400,
  /** All emojis list TTL - 1 hour */
  ALL_EMOJIS: 3600,
} as const;

/** Cache key namespace prefix */
const CACHE_NAMESPACE = 'kye';

// ============================================
// REDIS CLIENT
// ============================================

/** Cached Redis client instance */
let redisClient: Redis | null = null;

/**
 * Check if Redis is configured with required environment variables
 */
export function isRedisConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Get the Redis client instance
 * Returns null if Redis is not configured
 */
export function getRedisClient(): Redis | null {
  if (!isRedisConfigured()) {
    return null;
  }

  if (redisClient === null) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redisClient;
}

/**
 * Clear the cached Redis client instance
 * Useful for testing or resetting the connection
 */
export function clearCache(): void {
  redisClient = null;
}

// ============================================
// CACHE KEY GENERATION
// ============================================

/**
 * Generate a cache key with the namespace prefix
 * @param prefix - The cache prefix (e.g., 'emoji', 'interpretation')
 * @param identifier - Optional identifier for the specific item
 * @returns Formatted cache key
 */
export function getCacheKey(
  prefix: (typeof CACHE_PREFIXES)[keyof typeof CACHE_PREFIXES],
  identifier?: string
): string {
  if (identifier) {
    return `${CACHE_NAMESPACE}:${prefix}:${identifier}`;
  }
  return `${CACHE_NAMESPACE}:${prefix}`;
}

// ============================================
// CACHE OPERATIONS
// ============================================

/**
 * Get a value from the cache
 * @param key - The cache key
 * @returns The cached value or null if not found or Redis is not configured
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  if (!client) {
    return null;
  }

  try {
    const value = await client.get<T>(key);
    return value;
  } catch (error) {
    // Log error but don't throw - cache failures shouldn't break the app
    console.error('[Cache] Error getting value:', error);
    return null;
  }
}

/**
 * Set a value in the cache
 * @param key - The cache key
 * @param value - The value to cache
 * @param ttl - Time to live in seconds (optional)
 * @returns True if successful, false otherwise
 */
export async function cacheSet<T>(key: string, value: T, ttl?: number): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    if (ttl) {
      await client.set(key, value, { ex: ttl });
    } else {
      await client.set(key, value);
    }
    return true;
  } catch (error) {
    // Log error but don't throw - cache failures shouldn't break the app
    console.error('[Cache] Error setting value:', error);
    return false;
  }
}

/**
 * Delete a value from the cache
 * @param key - The cache key
 * @returns True if successful, false otherwise
 */
export async function cacheDelete(key: string): Promise<boolean> {
  const client = getRedisClient();
  if (!client) {
    return false;
  }

  try {
    await client.del(key);
    return true;
  } catch (error) {
    // Log error but don't throw - cache failures shouldn't break the app
    console.error('[Cache] Error deleting value:', error);
    return false;
  }
}

// ============================================
// SPECIALIZED CACHE FUNCTIONS
// ============================================

/**
 * Generate a hash for an interpretation request
 * Used as cache key identifier for interpretation results
 * @param message - The message to interpret
 * @param platform - Optional platform context
 * @param relationship - Optional relationship context
 * @returns Hash string for the cache key
 */
export function hashInterpretationRequest(
  message: string,
  platform?: string,
  relationship?: string
): string {
  // Simple hash function for cache key generation
  const input = `${message}|${platform || ''}|${relationship || ''}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}
