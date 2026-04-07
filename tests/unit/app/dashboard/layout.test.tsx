import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';

mock.module('next/navigation', () => ({
  usePathname: () => '/dashboard',
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

  it('has flex layout for sidebar and content', () => {
    const { container } = render(
      <DashboardLayout>
        <div>Content</div>
      </DashboardLayout>
    );
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('flex');
  });
});
