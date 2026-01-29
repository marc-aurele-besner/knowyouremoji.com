import { describe, expect, test, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import NotFound from '@/app/not-found';

// Mock the emoji-data module
mock.module('@/lib/emoji-data', () => ({
  getEmojiSummaries: () => [
    { slug: 'fire', character: '🔥', name: 'Fire', category: 'symbols', tldr: 'Hot or exciting' },
    { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'Love' },
    { slug: 'smile', character: '😊', name: 'Smiling Face', category: 'faces', tldr: 'Happy' },
  ],
}));

describe('Global NotFound (404 Page)', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders 404 heading', () => {
    render(<NotFound />);

    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  test('displays 404 status prominently', () => {
    render(<NotFound />);

    expect(screen.getByText('404')).toBeInTheDocument();
  });

  test('displays helpful message', () => {
    render(<NotFound />);

    expect(screen.getByText(/the page you're looking for doesn't exist/i)).toBeInTheDocument();
  });

  test('displays a friendly emoji', () => {
    render(<NotFound />);

    // Should show a confused/shrug emoji
    expect(screen.getByRole('img', { name: /confused/i })).toBeInTheDocument();
  });

  test('includes link to homepage', () => {
    render(<NotFound />);

    const homeLink = screen.getByRole('link', { name: /go home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('includes link to interpreter', () => {
    render(<NotFound />);

    const interpreterLink = screen.getByRole('link', { name: /try the interpreter/i });
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

  test('displays emoji grid when emojis are available', () => {
    render(<NotFound />);

    // Should display emoji results
    expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
  });

  test('displays quick links section', () => {
    render(<NotFound />);

    // Should have quick links to common pages
    expect(screen.getByRole('heading', { name: /popular pages/i })).toBeInTheDocument();
  });
});

describe('Global NotFound Search Functionality', () => {
  afterEach(() => {
    cleanup();
  });

  test('filters emojis based on search query', () => {
    render(<NotFound />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'fire' } });

    // Should show fire emoji in results
    expect(screen.getByText('Fire')).toBeInTheDocument();
  });

  test('shows no results message when search has no matches', () => {
    render(<NotFound />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

    expect(screen.getByText(/no emojis found/i)).toBeInTheDocument();
  });

  test('clears search when clear button is clicked', () => {
    render(<NotFound />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'fire' } });

    // Find and click clear button
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    // Search should be cleared
    expect(searchInput).toHaveValue('');
  });
});
