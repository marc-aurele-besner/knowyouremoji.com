import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

let mockPathname = '/dashboard';

mock.module('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({ push: mock(() => {}) }),
}));

const mockSignOut = mock(() => Promise.resolve());
mock.module('next-auth/react', () => ({
  signOut: mockSignOut,
  signIn: mock(() => Promise.resolve()),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

const { DashboardSidebar } = await import('@/components/dashboard/dashboard-sidebar');

afterEach(() => {
  cleanup();
  mockPathname = '/dashboard';
  mockSignOut.mockClear();
});

describe('DashboardSidebar', () => {
  it('renders the sidebar element', () => {
    render(<DashboardSidebar />);
    expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument();
  });

  it('renders navigation with dashboard label', () => {
    render(<DashboardSidebar />);
    expect(screen.getByRole('navigation', { name: /dashboard/i })).toBeInTheDocument();
  });

  it('renders all sidebar links in order', () => {
    render(<DashboardSidebar />);
    const labels = screen.getAllByRole('link').map((link) => link.textContent?.trim());
    expect(labels).toEqual([
      expect.stringContaining('Dashboard'),
      expect.stringContaining('History'),
      expect.stringContaining('Profile'),
      expect.stringContaining('Settings'),
      expect.stringContaining('Billing'),
    ]);
  });

  it('links have correct hrefs', () => {
    render(<DashboardSidebar />);
    expect(screen.getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
      'href',
      '/dashboard/profile'
    );
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute(
      'href',
      '/dashboard/history'
    );
    expect(screen.getByRole('link', { name: /billing/i })).toHaveAttribute(
      'href',
      '/dashboard/billing'
    );
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
      'href',
      '/dashboard/settings'
    );
  });

  it('marks current page link with aria-current', () => {
    mockPathname = '/dashboard';
    render(<DashboardSidebar />);
    const current = screen.getByRole('link', { name: /dashboard/i });
    expect(current).toHaveAttribute('aria-current', 'page');
    expect(current).toHaveClass('bg-muted');
    expect(screen.getByRole('link', { name: /history/i })).not.toHaveAttribute('aria-current');
  });

  it('marks history link as active when on history page', () => {
    mockPathname = '/dashboard/history';
    render(<DashboardSidebar />);
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /dashboard/i })).not.toHaveAttribute('aria-current');
  });

  it('does not show the admin link outside the admin area', () => {
    render(<DashboardSidebar />);
    expect(screen.queryByRole('link', { name: /admin/i })).not.toBeInTheDocument();
  });

  it('shows an active admin link while on admin pages', () => {
    mockPathname = '/admin/analytics';
    render(<DashboardSidebar />);
    const admin = screen.getByRole('link', { name: /admin/i });
    expect(admin).toHaveAttribute('href', '/admin/emojis');
    expect(admin).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /dashboard/i })).not.toHaveAttribute('aria-current');
  });

  it('signs out via next-auth when Sign Out is clicked', () => {
    render(<DashboardSidebar />);
    fireEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: '/' });
  });

  it('scrolls horizontally on mobile and stacks vertically on desktop', () => {
    render(<DashboardSidebar />);
    const nav = screen.getByRole('navigation', { name: /dashboard/i });
    expect(nav).toHaveClass('overflow-x-auto');
    expect(nav).toHaveClass('md:flex-col');
  });

  it('applies custom className', () => {
    render(<DashboardSidebar className="custom-sidebar" />);
    expect(screen.getByTestId('dashboard-sidebar')).toHaveClass('custom-sidebar');
  });

  it('has displayName set', () => {
    expect(DashboardSidebar.displayName).toBe('DashboardSidebar');
  });

  it('has sticky positioning classes for desktop', () => {
    render(<DashboardSidebar />);
    expect(screen.getByTestId('dashboard-sidebar')).toHaveClass('md:sticky');
  });
});
