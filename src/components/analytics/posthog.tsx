'use client';

import { useEffect, type ReactNode } from 'react';
import posthog from 'posthog-js';
import { isTest } from '@/lib/env';

/**
 * PostHog configuration interface
 */
export interface PostHogConfig {
  /** PostHog project API key */
  key: string;
  /** PostHog API host URL */
  host: string;
}

/** Default PostHog API host */
const DEFAULT_POSTHOG_HOST = 'https://us.i.posthog.com';

/**
 * Build PostHog config from key and host values
 * This is a pure function for testability, does not check NODE_ENV
 * @internal Exported for testing
 */
export function buildPostHogConfig(
  key: string | undefined,
  host: string | undefined
): PostHogConfig | null {
  if (!key) {
    return null;
  }

  return {
    key,
    host: host || DEFAULT_POSTHOG_HOST,
  };
}

/**
 * Get PostHog configuration from environment variables
 * Returns null if PostHog is disabled or not configured
 */
export function getPostHogConfig(): PostHogConfig | null {
  // Disable in test environment
  if (isTest()) {
    return null;
  }

  return buildPostHogConfig(
    process.env.NEXT_PUBLIC_POSTHOG_KEY,
    process.env.NEXT_PUBLIC_POSTHOG_HOST
  );
}

/**
 * Check if PostHog analytics is enabled
 */
export function isPostHogEnabled(): boolean {
  return getPostHogConfig() !== null;
}

/**
 * Initialize PostHog with the given config
 * @internal Exported for testing
 */
export function initializePostHog(config: PostHogConfig): void {
  posthog.init(config.key, {
    api_host: config.host,
    person_profiles: 'identified_only',
    capture_pageview: true,
    capture_pageleave: true,
    autocapture: true,
    persistence: 'localStorage+cookie',
  });
}

/**
 * PostHog Provider component for analytics and feature flags
 *
 * This component initializes PostHog for product analytics and feature flags.
 * It is disabled in test environments and when no API key is provided.
 *
 * Usage:
 * ```tsx
 * <PostHogProvider>
 *   <App />
 * </PostHogProvider>
 * ```
 */
export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const config = getPostHogConfig();
    if (!config) {
      return;
    }

    initializePostHog(config);
  }, []);

  return <>{children}</>;
}
