import { describe, it, expect, afterEach, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

const originalFetch = globalThis.fetch;
const mockFetch = mock(async (..._args: unknown[]) => new Response('{"ok":true}'));

let mockPathname: string | null = '/';
mock.module('next/navigation', () => ({
  usePathname: () => mockPathname,
}));

const mockExternalLinkClick = mock(() => {});
mock.module('@/lib/analytics', () => ({
  engagementEvents: {
    externalLinkClick: mockExternalLinkClick,
  },
}));

import {
  BookBanner,
  BOOK_URL,
  BOOK_BANNERS,
  isBookBannerHidden,
  pickBookBanner,
  recordBookBannerEvent,
} from '@/components/layout/book-banner';

function sentEvents() {
  return mockFetch.mock.calls.map(([url, init]) => ({
    url,
    body: JSON.parse((init as RequestInit).body as string),
    keepalive: (init as RequestInit).keepalive,
  }));
}

beforeEach(() => {
  mockPathname = '/';
  mockExternalLinkClick.mockClear();
  mockFetch.mockClear();
  mockFetch.mockImplementation(async () => new Response('{"ok":true}'));
  globalThis.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
});

describe('BookBanner', () => {
  it('renders a link to the book on Amazon', () => {
    render(<BookBanner />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', BOOK_URL);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link.getAttribute('rel')).toContain('sponsored');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('renders the banner image with alt text', () => {
    render(<BookBanner />);
    expect(screen.getByAltText(/Parent's Guide to Decoding Your Teen's Texts/)).toBeInTheDocument();
  });

  it('is labelled as a featured book region', () => {
    render(<BookBanner />);
    expect(screen.getByRole('complementary', { name: 'Featured book' })).toBeInTheDocument();
  });

  it('applies a custom className', () => {
    render(<BookBanner className="custom-class" />);
    expect(screen.getByRole('complementary')).toHaveClass('custom-class');
  });

  it('tracks clicks', () => {
    render(<BookBanner />);
    fireEvent.click(screen.getByRole('link'));
    expect(mockExternalLinkClick).toHaveBeenCalledWith(BOOK_URL, 'Book banner');
  });

  it('renders on content pages', () => {
    mockPathname = '/emoji/skull';
    render(<BookBanner />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('falls back to root when pathname is null', () => {
    mockPathname = null;
    render(<BookBanner />);
    expect(screen.getByRole('link')).toBeInTheDocument();
  });

  it('renders nothing on dashboard and auth pages', () => {
    for (const path of ['/dashboard', '/dashboard/history', '/admin/emojis', '/login']) {
      mockPathname = path;
      const { container } = render(<BookBanner />);
      expect(container).toBeEmptyDOMElement();
      cleanup();
    }
  });
});

describe('BookBanner event tracking', () => {
  it('records a view when rendered', () => {
    mockPathname = '/emoji/skull';
    render(<BookBanner />);
    expect(sentEvents()).toEqual([
      {
        url: '/api/book-banner/event',
        body: { type: 'view', banner: pickBookBanner('/emoji/skull').id, path: '/emoji/skull' },
        keepalive: true,
      },
    ]);
  });

  it('records a click when the banner is clicked', () => {
    mockPathname = '/guides';
    render(<BookBanner />);
    fireEvent.click(screen.getByRole('link'));
    expect(sentEvents().map((e) => e.body)).toEqual([
      { type: 'view', banner: pickBookBanner('/guides').id, path: '/guides' },
      { type: 'click', banner: pickBookBanner('/guides').id, path: '/guides' },
    ]);
  });

  it('records a new view when the path changes', () => {
    mockPathname = '/emoji';
    const { rerender } = render(<BookBanner />);
    mockPathname = '/combo';
    rerender(<BookBanner />);
    expect(sentEvents().map((e) => e.body.path)).toEqual(['/emoji', '/combo']);
  });

  it('does not record anything on hidden routes', () => {
    mockPathname = '/dashboard';
    render(<BookBanner />);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('swallows network errors', async () => {
    mockFetch.mockImplementation(async () => {
      throw new Error('offline');
    });
    expect(() => recordBookBannerEvent('view', 'book-cover-01', '/')).not.toThrow();
    await Promise.resolve();
  });
});

describe('isBookBannerHidden', () => {
  it('hides on account and admin routes', () => {
    expect(isBookBannerHidden('/dashboard')).toBe(true);
    expect(isBookBannerHidden('/dashboard/settings')).toBe(true);
    expect(isBookBannerHidden('/register')).toBe(true);
    expect(isBookBannerHidden('/reset-password')).toBe(true);
  });

  it('shows on content routes', () => {
    expect(isBookBannerHidden('/')).toBe(false);
    expect(isBookBannerHidden('/emoji/skull')).toBe(false);
    expect(isBookBannerHidden('/guides/some-guide')).toBe(false);
    expect(isBookBannerHidden('/dashboards-are-cool')).toBe(false);
  });
});

describe('pickBookBanner', () => {
  it('is deterministic for a path', () => {
    expect(pickBookBanner('/emoji/skull')).toBe(pickBookBanner('/emoji/skull'));
  });

  it('returns one of the available banners', () => {
    const paths = ['/', '/a', '/b', '/emoji', '/combo', '/guides', '/interpreter'];
    const picked = new Set(paths.map((p) => pickBookBanner(p).src));
    for (const src of picked) {
      expect(BOOK_BANNERS.some((b) => b.src === src)).toBe(true);
    }
    expect(picked.size).toBe(BOOK_BANNERS.length);
  });
});
