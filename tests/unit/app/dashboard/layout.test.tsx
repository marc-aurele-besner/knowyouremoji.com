import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';

mock.module('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

mock.module('next-auth/react', () => ({
  signOut: mock(() => Promise.resolve()),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
}));

afterEach(() => {
  cleanup();
});

describe('DashboardLayout', () => {
  it('renders the sidebar', () => {
    render(
      <DashboardLayout>
        <div>Test content</div>
      </DashboardLayout>
    );
    expect(screen.getByTestId('dashboard-sidebar')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <DashboardLayout>
        <div>Dashboard child content</div>
      </DashboardLayout>
    );
    expect(screen.getByText('Dashboard child content')).toBeInTheDocument();
  });

  it('places the sidebar and content in a two-column grid on desktop', () => {
    render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    const grid = screen.getByTestId('dashboard-sidebar').parentElement as HTMLElement;
    expect(grid).toHaveClass('flex');
    expect(grid).toHaveClass('md:grid');
  });
});
