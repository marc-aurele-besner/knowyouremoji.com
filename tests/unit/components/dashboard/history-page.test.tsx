import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';

// Mock supabase before importing component
const mockRange = mock((): Promise<{ data: any[] | null; error: any }> =>
  Promise.resolve({ data: [], error: null })
);

mock.module('@/lib/supabase', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      select: () => ({
        order: () => ({
          range: mockRange,
        }),
      }),
    }),
  }),
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(() => {}) }),
}));

const { HistoryPage } = await import('@/components/dashboard/history-page');

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

beforeEach(() => {
  mockRange.mockImplementation(() => Promise.resolve({ data: [], error: null }));
});

afterEach(() => {
  cleanup();
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
    mockRange.mockImplementation(() => Promise.resolve({ data: [], error: null }));
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText(/no interpretations yet/i)).toBeInTheDocument();
    });
  });

  it('displays history entries', async () => {
    mockRange.mockImplementation(() => Promise.resolve({ data: sampleEntries, error: null }));
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
    mockRange.mockImplementation(() =>
      Promise.resolve({ data: [{ ...sampleEntries[0], emoji_count: 1 }], error: null })
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('1 emoji')).toBeInTheDocument();
    });
  });

  it('shows error message on fetch error', async () => {
    mockRange.mockImplementation(() =>
      Promise.resolve({ data: null, error: { message: 'Database error' } })
    );
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Database error')).toBeInTheDocument();
    });
  });

  it('shows error when fetch throws', async () => {
    mockRange.mockImplementation(() => Promise.reject(new Error('Network error')));
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('renders pagination controls when entries exist', async () => {
    mockRange.mockImplementation(() => Promise.resolve({ data: sampleEntries, error: null }));
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
    mockRange.mockImplementation(() => Promise.resolve({ data: sampleEntries, error: null }));
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /previous/i })).toBeDisabled();
    });
  });

  it('next button is disabled when no more pages', async () => {
    mockRange.mockImplementation(() => Promise.resolve({ data: sampleEntries, error: null }));
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).toBeDisabled();
    });
  });

  it('next button is enabled when more data available', async () => {
    const manyEntries = Array.from({ length: 11 }, (_, i) => ({
      ...sampleEntries[0],
      id: String(i + 1),
    }));
    mockRange.mockImplementation(() => Promise.resolve({ data: manyEntries, error: null }));
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /next/i })).not.toBeDisabled();
    });
  });

  it('formats dates correctly', async () => {
    mockRange.mockImplementation(() => Promise.resolve({ data: sampleEntries, error: null }));
    await act(async () => {
      render(<HistoryPage />);
    });
    await waitFor(() => {
      expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
    });
    // The formatted date should contain "Apr" for April 2026
    const dateElements = screen.getAllByText(/Apr/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('has displayName set', () => {
    expect(HistoryPage.displayName).toBe('HistoryPage');
  });
});
