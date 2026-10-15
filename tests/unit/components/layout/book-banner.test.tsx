import { describe, it, expect, afterEach, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

const originalFetch = globalThis.fetch;
const originalIntersectionObserver = globalThis.IntersectionObserver;
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
  BOOK_WIDE_BANNERS,
  pickBookBanner,
  pickWideBookBanner,
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
  // Without IntersectionObserver the banner records its view immediately.
  Reflect.deleteProperty(globalThis, 'IntersectionObserver');
});

afterEach(() => {
  cleanup();
  globalThis.fetch = originalFetch;
  globalThis.IntersectionObserver = originalIntersectionObserver;
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

  it('renders the book title and a headline variant', () => {
    mockPathname = '/emoji/skull';
    render(<BookBanner />);
    expect(
      screen.getByText("The Parent's Guide to Decoding Your Teen's Texts")
    ).toBeInTheDocument();
    expect(screen.getByText(pickBookBanner('/emoji/skull').headline)).toBeInTheDocument();
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
});

describe('BookBanner wide variant', () => {
  const originalMatchMedia = window.matchMedia;
  const setViewportWide = (matches: boolean) => {
    window.matchMedia = ((query: string) => ({
      matches,
      media: query,
    })) as typeof window.matchMedia;
  };

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
  });

  it('renders the full-width image plus the card fallback for small screens', () => {
    mockPathname = '/';
    render(<BookBanner variant="wide" />);
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(2);
    links.forEach((link) => expect(link).toHaveAttribute('href', BOOK_URL));
    expect(links[0]).toHaveClass('hidden', 'md:block');
    expect(links[1]).toHaveClass('md:hidden');
    expect(links[0]).toHaveAccessibleName(
      "The Parent's Guide to Decoding Your Teen's Texts by Claire Vance — buy on Amazon"
    );
    const image = links[0].querySelector('img');
    expect(decodeURIComponent(image?.getAttribute('src') ?? '')).toContain(
      pickWideBookBanner('/').src
    );
  });

  it('does not hide the card in the inline variant', () => {
    render(<BookBanner />);
    expect(screen.getByRole('link')).not.toHaveClass('md:hidden');
  });

  it('records the image variant id on wide screens', () => {
    setViewportWide(true);
    mockPathname = '/emoji';
    render(<BookBanner variant="wide" />);
    fireEvent.click(screen.getAllByRole('link')[0]);
    const id = pickWideBookBanner('/emoji').id;
    expect(sentEvents().map((e) => e.body)).toEqual([
      { type: 'view', banner: id, path: '/emoji' },
      { type: 'click', banner: id, path: '/emoji' },
    ]);
  });

  it('records the card id on small screens', () => {
    setViewportWide(false);
    mockPathname = '/emoji';
    render(<BookBanner variant="wide" />);
    fireEvent.click(screen.getAllByRole('link')[1]);
    const id = pickBookBanner('/emoji').id;
    expect(sentEvents().map((e) => e.body)).toEqual([
      { type: 'view', banner: id, path: '/emoji' },
      { type: 'click', banner: id, path: '/emoji' },
    ]);
  });

  it('treats the viewport as wide when matchMedia is unavailable', () => {
    Reflect.deleteProperty(window, 'matchMedia');
    mockPathname = '/combo';
    render(<BookBanner variant="wide" />);
    expect(sentEvents()[0].body.banner).toBe(pickWideBookBanner('/combo').id);
  });

  it('uses both image variants across paths', () => {
    const paths = ['/', '/a', '/b', '/emoji', '/combo', '/guides', '/interpreter'];
    const picked = new Set(paths.map((p) => pickWideBookBanner(p).id));
    expect(picked).toEqual(new Set(BOOK_WIDE_BANNERS.map((b) => b.id)));
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

  it('waits until the banner is on screen before recording a view', () => {
    const observers: {
      callback: IntersectionObserverCallback;
      disconnect: ReturnType<typeof mock>;
    }[] = [];
    class MockIntersectionObserver {
      disconnect = mock(() => {});
      constructor(public callback: IntersectionObserverCallback) {
        observers.push(this);
      }
      observe() {}
    }
    globalThis.IntersectionObserver =
      MockIntersectionObserver as unknown as typeof IntersectionObserver;
    mockPathname = '/guides/x';
    render(<BookBanner />);
    expect(mockFetch).not.toHaveBeenCalled();

    const [observer] = observers;
    const fire = (isIntersecting: boolean) =>
      observer.callback(
        [{ isIntersecting } as IntersectionObserverEntry],
        observer as unknown as IntersectionObserver
      );
    fire(false);
    expect(mockFetch).not.toHaveBeenCalled();
    fire(true);
    expect(sentEvents().map((e) => e.body.type)).toEqual(['view']);
    expect(observer.disconnect).toHaveBeenCalled();
  });

  it('swallows network errors', async () => {
    mockFetch.mockImplementation(async () => {
      throw new Error('offline');
    });
    expect(() => recordBookBannerEvent('view', 'card-ts-pmo', '/')).not.toThrow();
    await Promise.resolve();
  });
});

describe('pickBookBanner', () => {
  it('is deterministic for a path', () => {
    expect(pickBookBanner('/emoji/skull')).toBe(pickBookBanner('/emoji/skull'));
  });

  it('returns one of the available banners', () => {
    const paths = ['/', '/a', '/b', '/emoji', '/combo', '/guides', '/interpreter'];
    const picked = new Set(paths.map((p) => pickBookBanner(p).id));
    for (const src of picked) {
      expect(BOOK_BANNERS.some((b) => b.id === src)).toBe(true);
    }
    expect(picked.size).toBe(BOOK_BANNERS.length);
  });
});
