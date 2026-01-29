import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import { GoogleAnalytics } from '@/components/analytics/google-analytics';

// Save original env
const originalEnv = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Mock @next/third-parties/google
mock.module('@next/third-parties/google', () => ({
  GoogleAnalytics: ({ gaId }: { gaId: string }) => (
    <div data-testid="ga-component" data-ga-id={gaId} />
  ),
}));

describe('GoogleAnalytics', () => {
  afterEach(() => {
    cleanup();
    // Restore original env
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalEnv;
  });

  describe('test environment behavior', () => {
    it('does not render in test environment even with measurement ID', () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';
      // NODE_ENV is 'test' in the test environment

      const { container } = render(<GoogleAnalytics />);

      // The isTest() check should prevent rendering
      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });

    it('does not render when measurement ID is not set', () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

      const { container } = render(<GoogleAnalytics />);

      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });

    it('does not render when measurement ID is empty string', () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';

      const { container } = render(<GoogleAnalytics />);

      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });
  });

  describe('component structure', () => {
    it('returns null by default in test environment', () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';

      const { container } = render(<GoogleAnalytics />);

      // Container should be empty since component returns null in test env
      expect(container.innerHTML).toBe('');
    });
  });
});
