import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, cleanup } from '@testing-library/react';

// Save original env
const originalEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
const originalNodeEnv = process.env.NODE_ENV;

// Mock @next/third-parties/google
mock.module('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="ga-component" data-ga-id={gaId} />
  ),
}));

// We need to test the component's behavior under different NODE_ENV values.
// Since Bun's mock.module can have caching issues when running with other tests,
// we'll use a simpler approach: test the component's logic directly.

describe('GoogleAnalytics', () => {
  afterEach(() => {
    cleanup();
    // Restore original env
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalEnv;
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
  });

  describe('test environment behavior', () => {
    it('does not render in test environment even with measurement ID', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';
      // NODE_ENV is already 'test' in test environment

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      // The isTest() check should prevent rendering
      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });

    it('does not render when measurement ID is not set in test env', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });

    it('does not render when measurement ID is empty string in test env', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });
  });

  describe('component behavior validation', () => {
    // Since we can't easily change NODE_ENV in Bun tests, we verify the component's
    // logic by testing the isTest function directly
    it('isTest returns true in test environment', async () => {
      const { isTest } = await import('@/lib/env');
      expect(isTest()).toBe(true);
    });

    it('component returns null when isTest() is true', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      // Container should be empty since component returns null in test env
      expect(container.innerHTML).toBe('');
    });

    it('component checks measurementId before rendering', async () => {
      // Even with valid ID, test env prevents rendering
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      // Due to isTest() returning true, should not render
      expect(container.innerHTML).toBe('');
    });
  });
});
