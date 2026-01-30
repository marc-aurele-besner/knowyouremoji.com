import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';

// Save original env values
const originalPosthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const originalPosthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
const originalNodeEnv = process.env.NODE_ENV;

// Mock posthog-js - must be done before importing component
mock.module('posthog-js', () => ({
  default: {
    init: mock(() => {}),
    capture: mock(() => {}),
    identify: mock(() => {}),
    reset: mock(() => {}),
    opt_out_capturing: mock(() => {}),
  },
}));

describe('PostHogProvider', () => {
  beforeEach(() => {
    // Reset env before each test
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
  });

  afterEach(() => {
    cleanup();
    // Restore original env
    process.env.NEXT_PUBLIC_POSTHOG_KEY = originalPosthogKey;
    process.env.NEXT_PUBLIC_POSTHOG_HOST = originalPosthogHost;
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
  });

  describe('test environment behavior', () => {
    it('does not render PostHog in test environment even with valid key', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123';
      process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com';

      const { PostHogProvider } = await import('@/components/analytics/posthog');
      const { container } = render(
        <PostHogProvider>
          <div data-testid="child">Child content</div>
        </PostHogProvider>
      );

      // Children should be rendered
      expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
      // But PostHog should not be initialized in test env
    });

    it('renders children when PostHog key is not set', async () => {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

      const { PostHogProvider } = await import('@/components/analytics/posthog');
      const { container } = render(
        <PostHogProvider>
          <div data-testid="child">Child content</div>
        </PostHogProvider>
      );

      expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
    });

    it('renders children when PostHog key is empty string', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = '';

      const { PostHogProvider } = await import('@/components/analytics/posthog');
      const { container } = render(
        <PostHogProvider>
          <div data-testid="child">Child content</div>
        </PostHogProvider>
      );

      expect(container.querySelector('[data-testid="child"]')).not.toBeNull();
    });
  });

  describe('component behavior validation', () => {
    it('isTest returns true in test environment', async () => {
      const { isTest } = await import('@/lib/env');
      expect(isTest()).toBe(true);
    });

    it('provider wraps children correctly', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123';

      const { PostHogProvider } = await import('@/components/analytics/posthog');
      const { getByTestId } = render(
        <PostHogProvider>
          <div data-testid="child">Child content</div>
        </PostHogProvider>
      );

      expect(getByTestId('child').textContent).toBe('Child content');
    });
  });
});

describe('posthog utilities', () => {
  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_POSTHOG_KEY;
    delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = originalPosthogKey;
    process.env.NEXT_PUBLIC_POSTHOG_HOST = originalPosthogHost;
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
  });

  describe('buildPostHogConfig', () => {
    it('returns null when key is undefined', async () => {
      const { buildPostHogConfig } = await import('@/components/analytics/posthog');
      expect(buildPostHogConfig(undefined, 'https://app.posthog.com')).toBeNull();
    });

    it('returns null when key is empty string', async () => {
      const { buildPostHogConfig } = await import('@/components/analytics/posthog');
      expect(buildPostHogConfig('', 'https://app.posthog.com')).toBeNull();
    });

    it('returns config with key and custom host', async () => {
      const { buildPostHogConfig } = await import('@/components/analytics/posthog');
      const config = buildPostHogConfig('phc_test123', 'https://app.posthog.com');

      expect(config).not.toBeNull();
      expect(config?.key).toBe('phc_test123');
      expect(config?.host).toBe('https://app.posthog.com');
    });

    it('uses default host when host is undefined', async () => {
      const { buildPostHogConfig } = await import('@/components/analytics/posthog');
      const config = buildPostHogConfig('phc_test123', undefined);

      expect(config).not.toBeNull();
      expect(config?.key).toBe('phc_test123');
      expect(config?.host).toBe('https://us.i.posthog.com');
    });

    it('uses default host when host is empty string', async () => {
      const { buildPostHogConfig } = await import('@/components/analytics/posthog');
      const config = buildPostHogConfig('phc_test123', '');

      expect(config).not.toBeNull();
      expect(config?.host).toBe('https://us.i.posthog.com');
    });
  });

  describe('getPostHogConfig', () => {
    it('returns null when POSTHOG_KEY is not set', async () => {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

      const { getPostHogConfig } = await import('@/components/analytics/posthog');
      expect(getPostHogConfig()).toBeNull();
    });

    it('returns null when POSTHOG_KEY is empty', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = '';

      const { getPostHogConfig } = await import('@/components/analytics/posthog');
      expect(getPostHogConfig()).toBeNull();
    });

    it('returns null in test environment even with valid key and host', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123';
      process.env.NEXT_PUBLIC_POSTHOG_HOST = 'https://app.posthog.com';
      // NODE_ENV is already 'test'

      const { getPostHogConfig } = await import('@/components/analytics/posthog');
      // In test env, should return null to disable analytics
      expect(getPostHogConfig()).toBeNull();
    });

    it('returns null in test environment even without host', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123';
      delete process.env.NEXT_PUBLIC_POSTHOG_HOST;
      // NODE_ENV is already 'test'

      const { getPostHogConfig } = await import('@/components/analytics/posthog');
      // In test env, should return null to disable analytics
      expect(getPostHogConfig()).toBeNull();
    });

    it('disables PostHog in test environment for safety', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123';
      // NODE_ENV is already 'test'

      const { getPostHogConfig } = await import('@/components/analytics/posthog');
      // In test env, should return null to disable analytics
      expect(getPostHogConfig()).toBeNull();
    });
  });

  describe('isPostHogEnabled', () => {
    it('returns false when key is not set', async () => {
      delete process.env.NEXT_PUBLIC_POSTHOG_KEY;

      const { isPostHogEnabled } = await import('@/components/analytics/posthog');
      expect(isPostHogEnabled()).toBe(false);
    });

    it('returns false in test environment', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = 'phc_test123';

      const { isPostHogEnabled } = await import('@/components/analytics/posthog');
      expect(isPostHogEnabled()).toBe(false);
    });

    it('returns false when key is empty', async () => {
      process.env.NEXT_PUBLIC_POSTHOG_KEY = '';

      const { isPostHogEnabled } = await import('@/components/analytics/posthog');
      expect(isPostHogEnabled()).toBe(false);
    });
  });

  describe('initializePostHog', () => {
    it('calls posthog.init with correct configuration', async () => {
      const { initializePostHog } = await import('@/components/analytics/posthog');
      const posthog = (await import('posthog-js')).default;

      const config = { key: 'phc_test123', host: 'https://app.posthog.com' };
      await initializePostHog(config);

      expect(posthog.init).toHaveBeenCalledWith('phc_test123', {
        api_host: 'https://app.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        persistence: 'localStorage+cookie',
      });
    });
  });
});
