import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';

let mockPathname = '/dashboard';

mock.module('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

afterEach(() => {
  cleanup();
  mockPathname = '/dashboard';
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

  it('renders all sidebar links', () => {
    render(<DashboardSidebar />);
    expect(screen.getByRole('link', { name: /overview/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /history/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /settings/i })).toBeInTheDocument();
  });

  it('links have correct hrefs', () => {
    render(<DashboardSidebar />);
    expect(screen.getByRole('link', { name: /overview/i })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: /profile/i })).toHaveAttribute(
      'href',
      '/dashboard/profile'
    );
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute(
      'href',
      '/dashboard/history'
    );
    expect(screen.getByRole('link', { name: /settings/i })).toHaveAttribute(
      'href',
      '/dashboard/settings'
    );
  });

  it('marks current page link with aria-current', () => {
    mockPathname = '/dashboard';
    render(<DashboardSidebar />);
    expect(screen.getByRole('link', { name: /overview/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /history/i })).not.toHaveAttribute('aria-current');
  });

  it('marks history link as active when on history page', () => {
    mockPathname = '/dashboard/history';
    render(<DashboardSidebar />);
    expect(screen.getByRole('link', { name: /history/i })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /overview/i })).not.toHaveAttribute('aria-current');
  });

  it('renders mobile toggle button', () => {
    render(<DashboardSidebar />);
    expect(screen.getByRole('button', { name: /toggle dashboard menu/i })).toBeInTheDocument();
  });

  it('sidebar is hidden on mobile by default', () => {
    render(<DashboardSidebar />);
    const sidebar = screen.getByTestId('dashboard-sidebar');
    expect(sidebar).toHaveClass('-translate-x-full');
  });

  it('opens sidebar on mobile toggle click', () => {
    render(<DashboardSidebar />);
    const toggle = screen.getByRole('button', { name: /toggle dashboard menu/i });
    fireEvent.click(toggle);
    const sidebar = screen.getByTestId('dashboard-sidebar');
    expect(sidebar).toHaveClass('translate-x-0');
    expect(sidebar).not.toHaveClass('-translate-x-full');
  });

  it('shows overlay when mobile sidebar is open', () => {
    render(<DashboardSidebar />);
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
    const toggle = screen.getByRole('button', { name: /toggle dashboard menu/i });
    fireEvent.click(toggle);
    expect(screen.getByTestId('sidebar-overlay')).toBeInTheDocument();
  });

  it('closes sidebar when overlay is clicked', () => {
    render(<DashboardSidebar />);
    const toggle = screen.getByRole('button', { name: /toggle dashboard menu/i });
    fireEvent.click(toggle);
    const overlay = screen.getByTestId('sidebar-overlay');
    fireEvent.click(overlay);
    expect(screen.getByTestId('dashboard-sidebar')).toHaveClass('-translate-x-full');
    expect(screen.queryByTestId('sidebar-overlay')).not.toBeInTheDocument();
  });

  it('closes mobile sidebar when a link is clicked', () => {
    render(<DashboardSidebar />);
    const toggle = screen.getByRole('button', { name: /toggle dashboard menu/i });
    fireEvent.click(toggle);
    expect(screen.getByTestId('dashboard-sidebar')).toHaveClass('translate-x-0');
    fireEvent.click(screen.getByRole('link', { name: /history/i }));
    expect(screen.getByTestId('dashboard-sidebar')).toHaveClass('-translate-x-full');
  });

  it('applies custom className', () => {
    render(<DashboardSidebar className="custom-sidebar" />);
    expect(screen.getByTestId('dashboard-sidebar')).toHaveClass('custom-sidebar');
  });

  it('has displayName set', () => {
    expect(DashboardSidebar.displayName).toBe('DashboardSidebar');
  });

  it('toggles mobile menu closed on second click', () => {
    render(<DashboardSidebar />);
    const toggle = screen.getByRole('button', { name: /toggle dashboard menu/i });
    fireEvent.click(toggle);
    expect(screen.getByTestId('dashboard-sidebar')).toHaveClass('translate-x-0');
    fireEvent.click(toggle);
    expect(screen.getByTestId('dashboard-sidebar')).toHaveClass('-translate-x-full');
  });

  it('has sticky positioning classes for desktop', () => {
    render(<DashboardSidebar />);
    const sidebar = screen.getByTestId('dashboard-sidebar');
    expect(sidebar).toHaveClass('md:sticky');
    expect(sidebar).toHaveClass('md:top-14');
  });
});
