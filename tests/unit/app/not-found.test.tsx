import { describe, expect, test, afterEach, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import NotFound from '@/app/not-found';

const originalFetch = global.fetch;
const mockFetch = mock(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        emojis: [
          { slug: 'skull', character: '💀', name: 'Skull', category: 'faces', tldr: 'I am dead' },
        ],
      }),
  })
);

describe('Global NotFound (404 Page)', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  afterEach(() => {
    cleanup();
    global.fetch = originalFetch;
  });

  test('renders 404 heading', () => {
    render(<NotFound />);

    expect(
      screen.getByRole('heading', { level: 1, name: /this page melted away/i })
    ).toBeInTheDocument();
  });

  test('displays 404 status prominently', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  test('displays helpful message', () => {
    render(<NotFound />);

    expect(screen.getByText(/we couldn't find what you were looking for/i)).toBeInTheDocument();
  });

  test('displays a friendly emoji', () => {
    render(<NotFound />);

    // Should show the melting face emoji
    expect(screen.getByRole('img', { name: /melting face/i })).toBeInTheDocument();
  });

  test('includes link to homepage', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('includes link to interpreter', () => {
    render(<NotFound />);

    const interpreterLink = screen.getByRole('link', { name: /open interpreter/i });
    expect(interpreterLink).toBeInTheDocument();
    expect(interpreterLink).toHaveAttribute('href', '/interpreter');
  });

  test('includes search functionality section', () => {
    render(<NotFound />);

    // Should have a search input
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  test('displays search placeholder text', () => {
    render(<NotFound />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('placeholder', expect.stringContaining('Search'));
  });

  test('shows no result grid until the visitor searches', () => {
    render(<NotFound />);

    expect(screen.queryByRole('list', { name: /emoji results/i })).toBeNull();
  });

  test('displays emoji grid from the search API once the visitor searches', async () => {
    render(<NotFound />);

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'skull' } });
    await waitFor(() => {
      expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('does not hand the emoji catalog to the client search component', () => {
    type Node = { type?: unknown; props?: Record<string, unknown> } | null | undefined;
    const findSearchProps = (node: Node): Record<string, unknown> | null => {
      if (!node || typeof node !== 'object') return null;
      if ((node.type as { name?: string } | undefined)?.name === 'NotFoundSearch') {
        return node.props ?? {};
      }
      const children = node.props?.children;
      for (const child of Array.isArray(children) ? children : [children]) {
        const found = findSearchProps(child as Node);
        if (found) return found;
      }
      return null;
    };

    const props = findSearchProps(NotFound() as Node);
    expect(props).not.toBeNull();
    expect(Object.keys(props as object)).toEqual([]);
  });

  test('displays popular emoji chips linking to emoji pages', () => {
    render(<NotFound />);

    const nav = screen.getByRole('navigation', { name: /popular emojis/i });
    const links = nav.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
    expect(nav.querySelector('a[href="/emoji/skull"]')).not.toBeNull();
  });
});
