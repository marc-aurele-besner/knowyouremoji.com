import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import { DashboardHome } from '@/components/dashboard/dashboard-home';

// Mock useRateLimit hook
const mockRateLimit = {
  used: 1,
  remaining: 2,
  maxUses: 3,
  canUse: true,
  isLimited: false,
  resetTime: new Date('2026-04-08T00:00:00'),
  recordUse: mock(() => 1),
  reset: mock(() => {}),
};

mock.module('@/hooks/use-rate-limit', () => ({
  useRateLimit: () => mockRateLimit,
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
  }),
}));

type FetchResult = { ok: boolean; json: () => Promise<unknown> };
let fetchImpl: () => Promise<FetchResult> = () =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [], hasMore: false }) });
const mockFetch = mock(() => fetchImpl());
globalThis.fetch = mockFetch as never;

beforeEach(() => {
  globalThis.fetch = mockFetch as never;
  fetchImpl = () =>
    Promise.resolve({ ok: true, json: () => Promise.resolve({ data: [], hasMore: false }) });
  mockRateLimit.used = 1;
  mockRateLimit.remaining = 2;
  mockRateLimit.maxUses = 3;
  mockRateLimit.canUse = true;
  mockRateLimit.isLimited = false;
});

afterEach(() => {
  cleanup();
});

describe('DashboardHome', () => {
  it('renders the dashboard heading', () => {
    render(<DashboardHome />);
    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
  });

  it('renders welcome text', () => {
    render(<DashboardHome />);
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument();
  });

  it('displays used interpretations count', () => {
    render(<DashboardHome />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(/of 3 daily limit/i)).toBeInTheDocument();
  });

  it('displays remaining interpretations count', () => {
    render(<DashboardHome />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/interpretations available/i)).toBeInTheDocument();
  });

  it('shows resets at midnight when no remaining uses', () => {
    mockRateLimit.remaining = 0;
    mockRateLimit.used = 3;
    render(<DashboardHome />);
    expect(screen.getByText(/resets at midnight/i)).toBeInTheDocument();
  });

  it('displays the current plan', () => {
    render(<DashboardHome />);
    expect(screen.getByText('Free')).toBeInTheDocument();
    expect(screen.getByText(/3 interpretations\/day/i)).toBeInTheDocument();
  });

  it('renders upgrade link to pricing', () => {
    render(<DashboardHome />);
    const upgradeLink = screen.getByRole('link', { name: /upgrade for unlimited/i });
    expect(upgradeLink).toHaveAttribute('href', '/pricing');
  });

  it('renders usage progress bar', () => {
    render(<DashboardHome />);
    const bar = screen.getByTestId('usage-bar');
    expect(bar).toBeInTheDocument();
    expect(bar).toHaveStyle({ width: '33%' });
  });

  it('renders usage bar at 0% when no uses', () => {
    mockRateLimit.used = 0;
    mockRateLimit.remaining = 3;
    render(<DashboardHome />);
    const bar = screen.getByTestId('usage-bar');
    expect(bar).toHaveStyle({ width: '0%' });
  });

  it('renders quick actions section heading', () => {
    render(<DashboardHome />);
    expect(screen.getByRole('heading', { name: /quick actions/i })).toBeInTheDocument();
  });

  it('renders interpret action card', () => {
    render(<DashboardHome />);
    expect(screen.getByText(/interpret a message/i)).toBeInTheDocument();
    expect(screen.getByText(/decode emoji meanings/i)).toBeInTheDocument();
  });

  it('renders browse emojis action card', () => {
    render(<DashboardHome />);
    expect(screen.getByText(/browse emojis/i)).toBeInTheDocument();
    expect(screen.getByText(/explore our emoji encyclopedia/i)).toBeInTheDocument();
  });

  it('renders search action card', () => {
    render(<DashboardHome />);
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText(/find emojis and combos/i)).toBeInTheDocument();
  });

  it('quick action hub cards link to the right pages', () => {
    render(<DashboardHome />);
    expect(screen.getByRole('link', { name: /interpret a message/i })).toHaveAttribute(
      'href',
      '/interpreter'
    );
    expect(screen.getByRole('link', { name: /browse emojis/i })).toHaveAttribute('href', '/emoji');
    expect(screen.getByRole('link', { name: /^search/i })).toHaveAttribute('href', '/search');
    expect(screen.getByRole('link', { name: /revisit past interpretations/i })).toHaveAttribute(
      'href',
      '/dashboard/history'
    );
  });

  describe('recent interpretations', () => {
    it('shows a loading skeleton, then the empty state when there is no history', async () => {
      render(<DashboardHome />);
      expect(screen.getByTestId('recent-loading')).toBeInTheDocument();
      await waitFor(() => {
        expect(screen.getByText(/no interpretations yet/i)).toBeInTheDocument();
      });
      expect(mockFetch).toHaveBeenCalledWith('/api/interpretations?page=0');
      expect(screen.getByRole('link', { name: /open the interpreter/i })).toHaveAttribute(
        'href',
        '/interpreter'
      );
    });

    it('lists up to three recent interpretations', async () => {
      const entry = (id: string, count: number, date: string) => ({
        id,
        message: `Message ${id}`,
        interpretation: 'x',
        emoji_count: count,
        created_at: date,
      });
      fetchImpl = () =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                entry('a', 1, '2026-03-01T10:00:00.000Z'),
                entry('b', 2, 'not-a-date'),
                entry('c', 3, '2026-03-03T10:00:00.000Z'),
                entry('d', 4, '2026-03-04T10:00:00.000Z'),
              ],
              hasMore: false,
            }),
        });
      render(<DashboardHome />);
      await waitFor(() => {
        expect(screen.getByText('Message a')).toBeInTheDocument();
      });
      expect(screen.getByText('Message c')).toBeInTheDocument();
      expect(screen.queryByText('Message d')).not.toBeInTheDocument();
      expect(screen.getByText('1 emoji')).toBeInTheDocument();
      expect(screen.getByText('2 emojis')).toBeInTheDocument();
      expect(screen.getByText('not-a-date')).toBeInTheDocument();
      expect(screen.getByText('Mar 1, 2026')).toBeInTheDocument();
    });

    it('falls back to the empty state when the request fails', async () => {
      fetchImpl = () => Promise.resolve({ ok: false, json: () => Promise.resolve({}) });
      render(<DashboardHome />);
      await waitFor(() => {
        expect(screen.getByText(/no interpretations yet/i)).toBeInTheDocument();
      });
    });

    it('falls back to the empty state when the payload has no data', async () => {
      fetchImpl = () => Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      render(<DashboardHome />);
      await waitFor(() => {
        expect(screen.getByText(/no interpretations yet/i)).toBeInTheDocument();
      });
    });

    it('falls back to the empty state when fetch throws', async () => {
      fetchImpl = () => Promise.reject(new Error('offline'));
      render(<DashboardHome />);
      await waitFor(() => {
        expect(screen.getByText(/no interpretations yet/i)).toBeInTheDocument();
      });
    });

    it('ignores a response that resolves after unmount', async () => {
      let resolve: (value: FetchResult) => void = () => {};
      fetchImpl = () => new Promise<FetchResult>((r) => (resolve = r));
      const { unmount } = render(<DashboardHome />);
      unmount();
      resolve({ ok: true, json: () => Promise.resolve({ data: [] }) });
      await new Promise((r) => setTimeout(r, 0));
      expect(screen.queryByText(/no interpretations yet/i)).not.toBeInTheDocument();
    });
  });

  it('has displayName set', () => {
    expect(DashboardHome.displayName).toBe('DashboardHome');
  });

  it('handles maxUses of 0 gracefully', () => {
    mockRateLimit.maxUses = 0;
    mockRateLimit.used = 0;
    mockRateLimit.remaining = 0;
    render(<DashboardHome />);
    const bar = screen.getByTestId('usage-bar');
    expect(bar).toHaveStyle({ width: '0%' });
  });
});
