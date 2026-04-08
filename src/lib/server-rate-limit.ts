/**
 * Server-Side Rate Limiting via Upstash Redis
 *
 * Provides server-side rate limiting using a sliding window counter
 * stored in Upstash Redis. Falls back gracefully (allowing requests)
 * when Redis is not configured.
 *
 * Uses IP address for anonymous users and user IDs for authenticated users.
 */

import { getRedisClient, isRedisConfigured } from '@/lib/cache';

// ============================================
// CONSTANTS
// ============================================

/** Rate limit cache key prefix for anonymous (IP-based) users */
const RATE_LIMIT_PREFIX = 'kye:ratelimit';

/** Rate limit cache key prefix for authenticated users */
export const AUTHENTICATED_RATE_LIMIT_PREFIX = 'kye:ratelimit:user';

/** Default rate limit for anonymous users: max requests per window */
export const DEFAULT_RATE_LIMIT = 10;

/** Rate limit for authenticated users: max requests per window */
export const AUTHENTICATED_RATE_LIMIT = 50;

/** Default rate limit window in seconds (24 hours) */
export const DEFAULT_WINDOW_SECONDS = 86400;

// ============================================
// TYPES
// ============================================

export interface RateLimitResult {
  /** Whether the request is allowed */
  allowed: boolean;
  /** Number of remaining requests in the current window */
  remaining: number;
  /** Maximum requests allowed per window */
  limit: number;
  /** Unix timestamp (seconds) when the window resets */
  resetAt: number;
}

export interface RateLimitConfig {
  /** Maximum number of requests per window */
  limit?: number;
  /** Window duration in seconds */
  windowSeconds?: number;
  /** Key prefix override (for different rate limit buckets) */
  prefix?: string;
}

// ============================================
// RATE LIMIT LOGIC
// ============================================

/**
 * Build the Redis key for a given identifier
 */
export function buildRateLimitKey(identifier: string, prefix?: string): string {
  return `${prefix || RATE_LIMIT_PREFIX}:${identifier}`;
}

/**
 * Check and consume a rate limit token for the given identifier.
 *
 * Uses a simple counter with TTL expiry. The counter increments on each
 * request and automatically expires after the window duration.
 *
 * When Redis is not configured, all requests are allowed (graceful fallback).
 *
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param config - Optional rate limit configuration
 * @returns Rate limit result with allowed status and metadata
 */
export async function checkRateLimit(
  identifier: string,
  config?: RateLimitConfig
): Promise<RateLimitResult> {
  const limit = config?.limit ?? DEFAULT_RATE_LIMIT;
  const windowSeconds = config?.windowSeconds ?? DEFAULT_WINDOW_SECONDS;

  // If Redis is not configured, allow all requests
  if (!isRedisConfigured()) {
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt: Math.floor(Date.now() / 1000) + windowSeconds,
    };
  }

  const client = getRedisClient();
  if (!client) {
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt: Math.floor(Date.now() / 1000) + windowSeconds,
    };
  }

  const key = buildRateLimitKey(identifier, config?.prefix);

  try {
    // Increment the counter
    const count = await client.incr(key);

    // If this is the first request in the window, set the expiry
    if (count === 1) {
      await client.expire(key, windowSeconds);
    }

    // Get the TTL to calculate reset time
    const ttl = await client.ttl(key);
    const resetAt = Math.floor(Date.now() / 1000) + Math.max(ttl, 0);

    const allowed = count <= limit;
    const remaining = Math.max(0, limit - count);

    return {
      allowed,
      remaining,
      limit,
      resetAt,
    };
  } catch (error) {
    // On Redis errors, fail open (allow the request)
    console.error('[ServerRateLimit] Redis error:', error);
    return {
      allowed: true,
      remaining: limit,
      limit,
      resetAt: Math.floor(Date.now() / 1000) + windowSeconds,
    };
  }
}

/**
 * Extract the client IP address from a NextRequest.
 *
 * Checks standard proxy headers in order of priority:
 * 1. x-forwarded-for (first IP in the chain)
 * 2. x-real-ip
 * 3. Falls back to 'unknown'
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs: client, proxy1, proxy2
    const firstIp = forwarded.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}

/**
 * Build rate limit response headers.
 * Follows the standard RateLimit header draft (RFC 9110).
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': String(result.limit),
    'X-RateLimit-Remaining': String(result.remaining),
    'X-RateLimit-Reset': String(result.resetAt),
    ...(result.allowed
      ? {}
      : { 'Retry-After': String(result.resetAt - Math.floor(Date.now() / 1000)) }),
  };
}

// ============================================
// AUTHENTICATED USAGE TRACKING
// ============================================

export interface RateLimitIdentifier {
  /** The identifier string (user ID or IP address) */
  identifier: string;
  /** Whether the user is authenticated */
  isAuthenticated: boolean;
  /** Rate limit config to use based on auth status */
  config: RateLimitConfig;
}

/**
 * Determine the rate limit identifier for a request.
 *
 * For authenticated users, uses the user ID with a higher rate limit.
 * For anonymous users, falls back to IP address with the default limit.
 */
export async function getRateLimitIdentifier(headers: Headers): Promise<RateLimitIdentifier> {
  // Try to get the authenticated session (dynamic import to avoid pulling
  // auth.ts into the module graph for tests that only need rate limiting)
  try {
    const { auth } = await import('@/lib/auth');
    const session = await auth();
    if (session?.user?.id) {
      return {
        identifier: session.user.id,
        isAuthenticated: true,
        config: {
          limit: AUTHENTICATED_RATE_LIMIT,
          prefix: AUTHENTICATED_RATE_LIMIT_PREFIX,
        },
      };
    }
  } catch {
    // Auth check failed — fall through to anonymous
  }

  return {
    identifier: getClientIp(headers),
    isAuthenticated: false,
    config: {},
  };
}
