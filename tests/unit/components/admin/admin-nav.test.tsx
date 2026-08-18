import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { AdminNav } from '@/components/admin/admin-nav';

let mockPathname = '/admin/emojis';

mock.module('next/navigation', () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mock(() => {}),
  }),
}));

afterEach(() => {
  cleanup();
  mockPathname = '/admin/emojis';
});

describe('AdminNav', () => {
  it('renders the Emojis and Analytics links', () => {
    render(<AdminNav />);
    expect(screen.getByRole('link', { name: /emojis/i })).toHaveAttribute('href', '/admin/emojis');
    expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute(
      'href',
      '/admin/analytics'
    );
  });

  it('marks the active link with aria-current', () => {
    mockPathname = '/admin/analytics';
    render(<AdminNav />);
    expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
    expect(screen.getByRole('link', { name: /emojis/i })).not.toHaveAttribute('aria-current');
  });

  it('matches nested analytics routes', () => {
    mockPathname = '/admin/analytics/details';
    render(<AdminNav />);
    expect(screen.getByRole('link', { name: /analytics/i })).toHaveAttribute(
      'aria-current',
      'page'
    );
  });
});
