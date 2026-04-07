import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
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

beforeEach(() => {
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

  it('quick action links have correct hrefs', () => {
    render(<DashboardHome />);
    const links = screen.getAllByRole('link', { name: /get started/i });
    const hrefs = links.map((l) => l.getAttribute('href'));
    expect(hrefs).toContain('/interpreter');
    expect(hrefs).toContain('/emoji');
    expect(hrefs).toContain('/search');
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
