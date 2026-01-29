import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render } from '@testing-library/react';

// Store original env
const originalEnv = { ...process.env };

// Helper to set NODE_ENV while bypassing TypeScript's readonly constraint
function setNodeEnv(value: string | undefined) {
  (process.env as Record<string, string | undefined>).NODE_ENV = value;
}

describe('VercelAnalytics component', () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
    // Clear module cache to get fresh imports with updated env
    mock.module('@vercel/analytics/react', () => ({
      Analytics: () => <div data-testid="vercel-analytics" />,
    }));
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should not render in test environment', async () => {
    setNodeEnv('test');

    // Re-import to get fresh module with test env
    const { VercelAnalytics } =
      await import('../../../../src/components/analytics/vercel-analytics');

    const { container } = render(<VercelAnalytics />);

    // In test environment, the component should render nothing
    expect(container.innerHTML).toBe('');
  });

  it('should render Analytics in production environment', async () => {
    setNodeEnv('production');

    const { VercelAnalytics } =
      await import('../../../../src/components/analytics/vercel-analytics');

    const { getByTestId } = render(<VercelAnalytics />);

    expect(getByTestId('vercel-analytics')).toBeDefined();
  });

  it('should render Analytics in development environment', async () => {
    setNodeEnv('development');

    const { VercelAnalytics } =
      await import('../../../../src/components/analytics/vercel-analytics');

    const { getByTestId } = render(<VercelAnalytics />);

    expect(getByTestId('vercel-analytics')).toBeDefined();
  });
});

describe('Analytics component export', () => {
  it('should export VercelAnalytics component', async () => {
    const analyticsModule = await import('../../../../src/components/analytics/vercel-analytics');
    expect(analyticsModule.VercelAnalytics).toBeDefined();
    expect(typeof analyticsModule.VercelAnalytics).toBe('function');
  });
});
