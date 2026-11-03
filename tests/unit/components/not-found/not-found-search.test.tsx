import { describe, expect, test, afterEach, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { NotFoundSearch } from '@/components/not-found/not-found-search';
import type { EmojiSummary } from '@/types/emoji';

const mockEmojis: EmojiSummary[] = [
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'symbols', tldr: 'Hot or exciting' },
  { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'Love' },
];

function respondWith(emojis: EmojiSummary[] | undefined) {
  return mock((_url: string) =>
    Promise.resolve({
      json: () => Promise.resolve(emojis === undefined ? {} : { emojis }),
    })
  );
}

const originalFetch = global.fetch;
let mockFetch: ReturnType<typeof respondWith>;

beforeEach(() => {
  mockFetch = respondWith(mockEmojis);
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  cleanup();
  global.fetch = originalFetch;
});

function search(value: string) {
  fireEvent.change(screen.getByRole('searchbox'), { target: { value } });
}

describe('NotFoundSearch Component', () => {
  test('renders search input with placeholder', () => {
    render(<NotFoundSearch />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('placeholder', expect.stringContaining('Search'));
  });

  test('renders section heading', () => {
    render(<NotFoundSearch />);

    expect(screen.getByRole('heading', { name: /search for an emoji/i })).toBeInTheDocument();
  });

  test('shows no results and makes no request before the visitor types', () => {
    render(<NotFoundSearch />);

    expect(screen.queryByRole('list', { name: /emoji results/i })).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('queries the search API and renders results', async () => {
    render(<NotFoundSearch />);

    search(' fire ');
    expect(screen.getByRole('status')).toHaveTextContent(/searching/i);

    await waitFor(() => {
      expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe('/api/emojis/search?q=fire&limit=12');
    expect(screen.getByRole('link', { name: 'Fire' })).toHaveAttribute('href', '/emoji/fire');
    expect(screen.getByText(/2 emojis found/i)).toBeInTheDocument();
  });

  test('uses singular wording for a single result', async () => {
    global.fetch = respondWith([mockEmojis[0]]) as unknown as typeof fetch;
    render(<NotFoundSearch />);

    search('fire');

    await waitFor(() => {
      expect(screen.getByText(/^1 emoji found$/i)).toBeInTheDocument();
    });
  });

  test('debounces keystrokes into a single request', async () => {
    render(<NotFoundSearch />);

    search('f');
    search('fi');
    search('fire');

    await waitFor(() => {
      expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  test('shows no results message when search has no matches', async () => {
    global.fetch = respondWith([]) as unknown as typeof fetch;
    render(<NotFoundSearch />);

    search('xyznonexistent');

    await waitFor(() => {
      expect(screen.getByText(/no emojis found/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/0 emojis found/i)).toBeInTheDocument();
  });

  test('treats a response without an emojis field as no results', async () => {
    global.fetch = respondWith(undefined) as unknown as typeof fetch;
    render(<NotFoundSearch />);

    search('fire');

    await waitFor(() => {
      expect(screen.getByText(/no emojis found/i)).toBeInTheDocument();
    });
  });

  test('shows no results message when the request fails', async () => {
    global.fetch = mock(() => Promise.reject(new Error('network'))) as unknown as typeof fetch;
    render(<NotFoundSearch />);

    search('fire');

    await waitFor(() => {
      expect(screen.getByText(/no emojis found/i)).toBeInTheDocument();
    });
  });

  test('says the top matches are shown when the result limit is reached', async () => {
    const manyEmojis: EmojiSummary[] = Array.from({ length: 12 }, (_, i) => ({
      slug: `emoji-${i}`,
      character: '😀',
      name: `Emoji ${i}`,
      category: 'faces',
      tldr: `Emoji ${i} description`,
    }));
    global.fetch = respondWith(manyEmojis) as unknown as typeof fetch;
    render(<NotFoundSearch />);

    search('emoji');

    await waitFor(() => {
      expect(screen.getAllByRole('listitem')).toHaveLength(12);
    });
    expect(screen.getByText(/showing the top 12 matches/i)).toBeInTheDocument();
  });

  test('shows clear button only when search has content', () => {
    render(<NotFoundSearch />);

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
    search('fire');
    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  test('clears search and results when clear button is clicked', async () => {
    render(<NotFoundSearch />);

    search('fire');
    await waitFor(() => {
      expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));

    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(screen.queryByRole('list', { name: /emoji results/i })).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  test('emptying the input resets to the idle state without a request', async () => {
    render(<NotFoundSearch />);

    search('fire');
    search('   ');
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(screen.queryByRole('status')).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  test('ignores a response that arrives after the search was cleared', async () => {
    let resolveFetch: (value: unknown) => void = () => {};
    const pendingFetch = mock(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    global.fetch = pendingFetch as unknown as typeof fetch;
    render(<NotFoundSearch />);

    search('fire');
    await waitFor(() => {
      expect(pendingFetch).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button', { name: /clear/i }));
    resolveFetch({ json: () => Promise.resolve({ emojis: mockEmojis }) });
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(screen.queryByRole('list', { name: /emoji results/i })).toBeNull();
    expect(screen.queryByRole('status')).toBeNull();
  });

  test('cancels a pending search on unmount', async () => {
    const { unmount } = render(<NotFoundSearch />);

    search('fire');
    unmount();
    await new Promise((resolve) => setTimeout(resolve, 250));

    expect(mockFetch).not.toHaveBeenCalled();
  });
});
