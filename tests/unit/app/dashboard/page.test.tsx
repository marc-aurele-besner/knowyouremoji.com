import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import DashboardPage from '@/app/(dashboard)/dashboard/page';

mock.module('@/hooks/use-rate-limit', () => ({
  useRateLimit: () => ({
    used: 0,
    remaining: 3,
    maxUses: 3,
    canUse: true,
    isLimited: false,
    resetTime: new Date('2026-04-08T00:00:00'),
    recordUse: mock(() => 2),
    reset: mock(() => {}),
  }),
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
  }),
}));

afterEach(() => {
  cleanup();
});

describe('DashboardPage', () => {
  it('renders the DashboardHome component', () => {
    render(<DashboardPage />);
    expect(screen.getByRole('heading', { name: /dashboard/i, level: 1 })).toBeInTheDocument();
  });

  it('shows quick actions', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/quick actions/i)).toBeInTheDocument();
  });

  it('shows usage stats', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/daily limit/i)).toBeInTheDocument();
  });
});
