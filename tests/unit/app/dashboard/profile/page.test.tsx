import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';

mock.module('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
      },
    },
    status: 'authenticated' as const,
  }),
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mock(() => {}),
  }),
}));

// Mock fetch
globalThis.fetch = mock(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        displayName: 'Test User',
        createdAt: '2026-01-15T10:00:00.000Z',
      }),
  })
) as never;

const { default: DashboardProfilePage } = await import('@/app/(dashboard)/dashboard/profile/page');

afterEach(() => {
  cleanup();
});

describe('DashboardProfilePage', () => {
  it('renders the ProfilePage component', async () => {
    render(<DashboardProfilePage />);
    expect(screen.getByRole('heading', { name: /profile/i, level: 1 })).toBeInTheDocument();
  });

  it('shows subscription status section', async () => {
    render(<DashboardProfilePage />);
    expect(screen.getByRole('heading', { name: /subscription status/i })).toBeInTheDocument();
  });

  it('shows user information section', async () => {
    render(<DashboardProfilePage />);
    expect(screen.getByText(/user information/i)).toBeInTheDocument();
  });
});
