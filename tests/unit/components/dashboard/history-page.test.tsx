import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, waitFor, act } from '@testing-library/react';

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

  it('renders pagination controls when entries exist', async () => {
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
      expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
      expect(screen.getByText(/page 1/i)).toBeInTheDocument();
    });
  });

  it('previous button is disabled on first page', async () => {
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
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });
  });

  it('next button is disabled when no more pages', async () => {
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
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });
  });

  it('next button is enabled when more data available', async () => {
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
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
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

  it('has displayName set', () => {
    expect(HistoryPage.displayName).toBe('HistoryPage');
  });
});
