import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

mock.module('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: 'user-1', email: 'test@example.com' } },
    status: 'authenticated' as const,
  }),
}));

mock.module('next/navigation', () => ({
  useRouter: () => ({ push: mock(() => {}) }),
}));

const { HistoryDetailView } = await import('@/components/dashboard/history-detail-view');

const sampleEntry = {
  id: '1',
  message: 'Hey 😊👋',
  interpretation:
    'A friendly greeting with a smile and wave. The sender seems warm and approachable.',
  created_at: '2026-04-01T10:00:00Z',
  emoji_count: 2,
};

afterEach(() => {
  cleanup();
});

describe('HistoryDetailView', () => {
  it('renders the original message', () => {
    render(<HistoryDetailView entry={sampleEntry} onClose={() => {}} />);
    expect(screen.getByText('Hey 😊👋')).toBeInTheDocument();
  });

  it('renders the full interpretation text', () => {
    render(<HistoryDetailView entry={sampleEntry} onClose={() => {}} />);
    expect(
      screen.getByText(
        'A friendly greeting with a smile and wave. The sender seems warm and approachable.'
      )
    ).toBeInTheDocument();
  });

  it('renders the section headers', () => {
    render(<HistoryDetailView entry={sampleEntry} onClose={() => {}} />);
    expect(screen.getByText('Original Message')).toBeInTheDocument();
    expect(screen.getByText('Interpretation')).toBeInTheDocument();
  });

  it('renders the emoji count with plural', () => {
    render(<HistoryDetailView entry={sampleEntry} onClose={() => {}} />);
    expect(screen.getByText('2 emojis detected')).toBeInTheDocument();
  });

  it('renders singular emoji text for 1 emoji', () => {
    render(<HistoryDetailView entry={{ ...sampleEntry, emoji_count: 1 }} onClose={() => {}} />);
    expect(screen.getByText('1 emoji detected')).toBeInTheDocument();
  });

  it('renders formatted date', () => {
    render(<HistoryDetailView entry={sampleEntry} onClose={() => {}} />);
    const dateElements = screen.getAllByText(/April/);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('renders close button', () => {
    render(<HistoryDetailView entry={sampleEntry} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: /close detail view/i })).toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    const onClose = mock(() => {});
    render(<HistoryDetailView entry={sampleEntry} onClose={onClose} />);
    fireEvent.click(screen.getByRole('button', { name: /close detail view/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('handles invalid date gracefully', () => {
    render(
      <HistoryDetailView
        entry={{ ...sampleEntry, created_at: 'invalid-date' }}
        onClose={() => {}}
      />
    );
    expect(screen.getByText('invalid-date')).toBeInTheDocument();
  });

  it('has displayName set', () => {
    expect(HistoryDetailView.displayName).toBe('HistoryDetailView');
  });
});
