import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, within } from '@testing-library/react';
import { EmojiBrowser } from '@/components/emoji/emoji-browser';
import type { EmojiSummary } from '@/types/emoji';

afterEach(() => {
  cleanup();
});

const emojis: EmojiSummary[] = [
  { slug: 'skull', character: '💀', name: 'Skull', category: 'faces', tldr: 'Dead from laughing' },
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'nature', tldr: 'Hot or cool' },
  { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'Love' },
  { slug: 'grin', character: '😀', name: 'Grinning Face', category: 'faces', tldr: 'Happy' },
];

const categories = [
  { slug: 'faces', displayName: 'Smileys & Faces', emojiCount: 2 },
  { slug: 'nature', displayName: 'Nature', emojiCount: 1 },
  { slug: 'symbols', displayName: 'Symbols', emojiCount: 1 },
];

function cards() {
  return within(screen.getByRole('list', { name: 'Emoji results' })).getAllByRole('link');
}

describe('EmojiBrowser', () => {
  it('renders search, view toggle, category chips and all emojis', () => {
    render(<EmojiBrowser emojis={emojis} categories={categories} />);
    expect(screen.getByRole('searchbox', { name: 'Search emojis' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cards' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'All categories' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: /Smileys & Faces/ })).toHaveTextContent('2');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 4 of 4');
    expect(cards()).toHaveLength(4);
    expect(screen.getByText('Hot or cool')).toBeInTheDocument();
  });

  it('filters by search query and reports the result count', () => {
    render(<EmojiBrowser emojis={emojis} categories={categories} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'face' } });
    expect(screen.getByRole('status')).toHaveTextContent('2 results for “face”');
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'skull' } });
    expect(screen.getByRole('status')).toHaveTextContent('1 result for “skull”');
    expect(cards()).toHaveLength(1);
  });

  it('clears the query with the clear button', () => {
    render(<EmojiBrowser emojis={emojis} categories={categories} />);
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'skull' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
    expect(screen.getByRole('searchbox')).toHaveValue('');
    expect(cards()).toHaveLength(4);
  });

  it('does not navigate when the search form is submitted', () => {
    render(<EmojiBrowser emojis={emojis} categories={categories} />);
    const form = screen.getByRole('search');
    const submit = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submit);
    expect(submit.defaultPrevented).toBe(true);
  });

  it('filters by category chip', () => {
    render(<EmojiBrowser emojis={emojis} categories={categories} />);
    const chip = screen.getByRole('button', { name: /Smileys & Faces/ });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute('aria-pressed', 'true');
    expect(cards()).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'All categories' }));
    expect(cards()).toHaveLength(4);
  });

  it('switches to the dense view', () => {
    render(<EmojiBrowser emojis={emojis} categories={categories} />);
    fireEvent.click(screen.getByRole('button', { name: 'Dense' }));
    expect(screen.getByRole('button', { name: 'Dense' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.queryByText('Hot or cool')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Cards' }));
    expect(screen.getByText('Hot or cool')).toBeInTheDocument();
  });

  it('pages results with "Load more"', () => {
    render(<EmojiBrowser emojis={emojis} categories={categories} pageSize={3} />);
    expect(cards()).toHaveLength(3);
    expect(screen.getByRole('status')).toHaveTextContent('Showing 3 of 4');
    fireEvent.click(screen.getByRole('button', { name: 'Load 1 more' }));
    expect(cards()).toHaveLength(4);
    expect(screen.queryByRole('button', { name: /Load .* more/ })).toBeNull();
  });

  it('shows the empty state and clears filters', () => {
    render(<EmojiBrowser emojis={emojis} categories={categories} />);
    fireEvent.click(screen.getByRole('button', { name: /Nature/ }));
    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'zzz' } });
    expect(screen.getByText('No emojis found matching your search.')).toBeInTheDocument();
    expect(screen.getByText('Try a different search term or category.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear filters' }));
    expect(cards()).toHaveLength(4);
    expect(screen.getByRole('button', { name: 'All categories' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
  });
});
