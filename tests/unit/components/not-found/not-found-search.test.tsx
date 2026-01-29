import { describe, expect, test, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { NotFoundSearch } from '@/components/not-found/not-found-search';
import type { EmojiSummary } from '@/types/emoji';

const mockEmojis: EmojiSummary[] = [
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'symbols', tldr: 'Hot or exciting' },
  { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'Love' },
  { slug: 'smile', character: '😊', name: 'Smiling Face', category: 'faces', tldr: 'Happy' },
];

describe('NotFoundSearch Component', () => {
  afterEach(() => {
    cleanup();
  });

  test('renders search input', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  test('displays search placeholder text', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    const searchInput = screen.getByRole('searchbox');
    expect(searchInput).toHaveAttribute('placeholder', expect.stringContaining('Search'));
  });

  test('displays emoji results when emojis are provided', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Red Heart')).toBeInTheDocument();
    expect(screen.getByText('Smiling Face')).toBeInTheDocument();
  });

  test('filters emojis based on search query', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'fire' } });

    // Should show fire emoji in results
    expect(screen.getByText('Fire')).toBeInTheDocument();
    // Other emojis should not be visible
    expect(screen.queryByText('Red Heart')).not.toBeInTheDocument();
    expect(screen.queryByText('Smiling Face')).not.toBeInTheDocument();
  });

  test('shows no results message when search has no matches', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent' } });

    expect(screen.getByText(/no emojis found/i)).toBeInTheDocument();
  });

  test('shows clear button when search has content', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'fire' } });

    expect(screen.getByRole('button', { name: /clear/i })).toBeInTheDocument();
  });

  test('clears search when clear button is clicked', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'fire' } });

    // Find and click clear button
    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    // Search should be cleared
    expect(searchInput).toHaveValue('');
    // All emojis should be visible again
    expect(screen.getByText('Fire')).toBeInTheDocument();
    expect(screen.getByText('Red Heart')).toBeInTheDocument();
  });

  test('displays result count when searching', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    const searchInput = screen.getByRole('searchbox');
    fireEvent.change(searchInput, { target: { value: 'fire' } });

    expect(screen.getByText(/1 emoji found/i)).toBeInTheDocument();
  });

  test('hides clear button when search is empty', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    expect(screen.queryByRole('button', { name: /clear/i })).not.toBeInTheDocument();
  });

  test('renders emoji links correctly', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    const fireLink = screen.getByRole('link', { name: 'Fire' });
    expect(fireLink).toHaveAttribute('href', '/emoji/fire');
  });

  test('renders section heading', () => {
    render(<NotFoundSearch emojis={mockEmojis} />);

    expect(screen.getByRole('heading', { name: /search for an emoji/i })).toBeInTheDocument();
  });

  test('handles empty emoji array', () => {
    render(<NotFoundSearch emojis={[]} />);

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByText(/no emojis found/i)).toBeInTheDocument();
  });

  test('limits displayed results to 12', () => {
    const manyEmojis: EmojiSummary[] = Array.from({ length: 20 }, (_, i) => ({
      slug: `emoji-${i}`,
      character: '😀',
      name: `Emoji ${i}`,
      category: 'faces',
      tldr: `Emoji ${i} description`,
    }));

    render(<NotFoundSearch emojis={manyEmojis} />);

    // Should only show 12 emojis
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(12);
  });
});
