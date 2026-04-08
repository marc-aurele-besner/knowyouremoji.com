import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';

// Mock next-auth/react
mock.module('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'user-1', email: 'test@example.com' } },
    status: 'authenticated' as const,
  }),
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(() => {}) }),
}));

const sampleEntries = [
  {
    id: '1',
    message: 'Hey 😊👋',
    interpretation: 'A friendly greeting with a smile and wave.',
    created_at: '2026-04-01T10:00:00Z',
    emoji_count: 2,
  },
  {
    id: '2',
    message: '🔥🔥🔥',
    interpretation: 'Expressing intense excitement or approval.',
    created_at: '2026-03-30T15:30:00Z',
    emoji_count: 3,
  },
];

const moreEntries = [
  {
    id: '3',
    message: '😂😂',
    interpretation: 'Laughing hard at something funny.',
    created_at: '2026-03-28T12:00:00Z',
    emoji_count: 2,
  },
  {
    id: '4',
    message: '❤️🫶',
    interpretation: 'Expressing love and care.',
    created_at: '2026-03-27T09:00:00Z',
    emoji_count: 2,
  },
];

// Mock IntersectionObserver
let intersectionCallback: IntersectionObserverCallback | null = null;
const mockObserve = mock(() => {});
const mockDisconnect = mock(() => {});

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback;
  }
  observe = mockObserve;
  disconnect = mockDisconnect;
  unobserve = mock(() => {});
}

globalThis.IntersectionObserver = MockIntersectionObserver as never;

// Mock fetch
const mockFetch = mock(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [], hasMore: false }),
  })
);
globalThis.fetch = mockFetch as never;

const { HistoryPage } = await import('@/components/dashboard/history-page');

beforeEach(() => {
  mockFetch.mockImplementation(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: [], hasMore: false }),
    } as never)
  );
  intersectionCallback = null;
  mockObserve.mockClear();
  mockDisconnect.mockClear();
});

afterEach(() => {
  cleanup();
  mockFetch.mockClear();
});

describe('HistoryPage', () => {
  it('renders the heading', async () => {
    await act(async () => {
      render(<HistoryPage />);
    });
    expect(screen.getByRole('heading', { name: /interpretation history/i })).toBeInTheDocument();
  });

  it('renders description text', async () => {
    await act(async () => {
      render(<HistoryPage />);
    });
    expect(screen.getByText(/view your past emoji interpretations/i)).toBeInTheDocument();
  });

  it('shows empty state when no entries', async () => {
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/no interpretations yet/i)).toBeInTheDocument();
    });
  });

  it('displays history entries', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: false }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
      expect(screen.getByText(/a friendly greeting/i)).toBeInTheDocument();
      expect(screen.getByText('2 emojis')).toBeInTheDocument();
    });
  });

  it('shows singular emoji text for 1 emoji', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            data: [{ ...sampleEntries[0], emoji_count: 1 }],
            hasMore: false,
          }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('1 emoji')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch error', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Database error' }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });

  it('shows error when fetch throws', async () => {
    mockFetch.mockImplementation(() => Promise.reject(new Error('Network error')));
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows Load More button when more data is available', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: true }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /load more/i })).toBeInTheDocument();
    });
  });

  it('hides Load More button when no more data', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: false }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument();
  });

  it('appends entries when Load More is clicked', async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: sampleEntries, hasMore: true }),
        } as never);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: moreEntries, hasMore: false }),
      } as never);
    });
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /load more/i }));
    });
    await waitFor(() => {
      // Original entries still present
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
      expect(screen.getByText('🔥🔥🔥')).toBeInTheDocument();
      // New entries appended
      expect(screen.getByText('😂😂')).toBeInTheDocument();
      expect(screen.getByText('❤️🫶')).toBeInTheDocument();
    });
  });

  it('fetches page 1 on Load More click', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: true }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    mockFetch.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /load more/i }));
    });
    expect(mockFetch).toHaveBeenCalledWith('/api/interpretations?page=1');
  });

  it('sets up IntersectionObserver when hasMore is true', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: true }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    expect(mockObserve).toHaveBeenCalled();
  });

  it('triggers load more when sentinel is intersecting', async () => {
    let callCount = 0;
    mockFetch.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ data: sampleEntries, hasMore: true }),
        } as never);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: moreEntries, hasMore: false }),
      } as never);
    });
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    // Simulate intersection
    await act(async () => {
      intersectionCallback?.(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });
    await waitFor(() => {
      expect(screen.getByText('😂😂')).toBeInTheDocument();
    });
  });

  it('does not trigger load more when sentinel is not intersecting', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: true }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    mockFetch.mockClear();
    // Simulate non-intersection
    await act(async () => {
      intersectionCallback?.(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('formats dates correctly', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: false }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    const dateElements = screen.getAllByText(/Apr/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('expands entry when clicked', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: false }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    // Click the first entry
    const entryButton = screen.getByRole('button', {
      name: /view details for interpretation: hey/i,
    });
    await act(async () => {
      fireEvent.click(entryButton);
    });
    // Should now show the detail view with section headers
    expect(screen.getByText('Original Message')).toBeInTheDocument();
    expect(screen.getByText('Interpretation')).toBeInTheDocument();
  });

  it('collapses entry when close button is clicked', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: false }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    // Expand
    const entryButton = screen.getByRole('button', {
      name: /view details for interpretation: hey/i,
    });
    await act(async () => {
      fireEvent.click(entryButton);
    });
    expect(screen.getByText('Original Message')).toBeInTheDocument();
    // Close
    const closeButton = screen.getByRole('button', { name: /close detail view/i });
    await act(async () => {
      fireEvent.click(closeButton);
    });
    // Should no longer show detail view headers
    expect(screen.queryByText('Original Message')).not.toBeInTheDocument();
  });

  it('expands entry via keyboard Enter', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: false }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    const entryButton = screen.getByRole('button', {
      name: /view details for interpretation: hey/i,
    });
    await act(async () => {
      fireEvent.keyDown(entryButton, { key: 'Enter' });
    });
    expect(screen.getByText('Original Message')).toBeInTheDocument();
  });

  it('expands entry via keyboard Space', async () => {
    mockFetch.mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: sampleEntries, hasMore: false }),
      } as never)
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    const entryButton = screen.getByRole('button', {
      name: /view details for interpretation: hey/i,
    });
    await act(async () => {
      fireEvent.keyDown(entryButton, { key: ' ' });
    });
    expect(screen.getByText('Original Message')).toBeInTheDocument();
  });

  it('has displayName set', () => {
    expect(HistoryPage.displayName).toBe('HistoryPage');
  });
});
