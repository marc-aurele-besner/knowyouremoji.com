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

// Mock isTest to control test environment behavior
let mockIsTestValue = true;
mock.module('@/lib/env', () => ({
  isTest: () => mockIsTestValue,
}));

describe('GoogleAnalytics', () => {
  afterEach(() => {
    cleanup();
    // Restore original env
    process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = originalEnv;
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    // Reset mock to test environment
    mockIsTestValue = true;
  });

  describe('test environment behavior', () => {
    it('does not render in test environment even with measurement ID', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';
      mockIsTestValue = true;

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      // The isTest() check should prevent rendering
      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });

    it('does not render when measurement ID is not set', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      mockIsTestValue = false;

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });

    it('does not render when measurement ID is empty string', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = '';
      mockIsTestValue = false;

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });
  });

  describe('production environment behavior', () => {
    it('renders GA component in non-test environment with valid measurement ID', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';
      mockIsTestValue = false;

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).not.toBeNull();
      expect(gaComponent?.getAttribute('data-ga-id')).toBe('G-TESTID123');
    });

    it('does not render in production when measurement ID is missing', async () => {
      delete process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      mockIsTestValue = false;

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      const gaComponent = container.querySelector('[data-testid="ga-component"]');
      expect(gaComponent).toBeNull();
    });
  });

  describe('component structure', () => {
    it('returns null by default in test environment', async () => {
      process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID = 'G-TESTID123';
      mockIsTestValue = true;

      const { GoogleAnalytics } = await import('@/components/analytics/google-analytics');
      const { container } = render(<GoogleAnalytics />);

      // Container should be empty since component returns null in test env
      expect(container.innerHTML).toBe('');
    });
  });
});
