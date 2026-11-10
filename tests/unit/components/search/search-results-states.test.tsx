import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SearchResults } from '@/components/search/search-results';
import type { EmojiSummary } from '@/types/emoji';

const emojis: EmojiSummary[] = [
  {
    slug: 'skull',
    character: '💀',
    name: 'Skull',
    category: 'faces',
    tldr: 'Usually means dead',
  },
];

afterEach(() => {
  cleanup();
});

describe('SearchResults states', () => {
  it('names the query in the empty state', () => {
    render(
      <SearchResults
        results={[]}
        selectedIndex={-1}
        onSelect={mock(() => {})}
        onHover={mock(() => {})}
        query="  zzz  "
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent('No emojis found for “zzz”.');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('shows a generic empty message when no query is given', () => {
    render(
      <SearchResults
        results={[]}
        selectedIndex={-1}
        onSelect={mock(() => {})}
        onHover={mock(() => {})}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(/^No emojis found\.$/);
  });

  it('shows an error message instead of results when hasError is set', () => {
    render(
      <SearchResults
        results={emojis}
        selectedIndex={-1}
        onSelect={mock(() => {})}
        onHover={mock(() => {})}
        hasError
        query="skull"
        onViewAll={mock(() => {})}
      />
    );

    expect(screen.getByRole('status')).toHaveTextContent(/search is unavailable/i);
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    // No "see all" link on failure: the full page would fail the same way.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('omits the empty-state link when there is no query', () => {
    render(
      <SearchResults
        results={[]}
        selectedIndex={-1}
        onSelect={mock(() => {})}
        onHover={mock(() => {})}
        onViewAll={mock(() => {})}
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('offers a link to the full search page under results', () => {
    const onViewAll = mock(() => {});
    render(
      <SearchResults
        results={emojis}
        selectedIndex={-1}
        onSelect={mock(() => {})}
        onHover={mock(() => {})}
        query="skull"
        onViewAll={onViewAll}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'See all results for “skull”' }));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });

  it('hides the footer link when onViewAll is not provided', () => {
    render(
      <SearchResults
        results={emojis}
        selectedIndex={-1}
        onSelect={mock(() => {})}
        onHover={mock(() => {})}
        query="skull"
      />
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('labels the listbox with the query', () => {
    render(
      <SearchResults
        results={emojis}
        selectedIndex={-1}
        onSelect={mock(() => {})}
        onHover={mock(() => {})}
        query="skull"
      />
    );

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', 'Emojis matching “skull”');
  });

  it('uses a generic listbox label without a query', () => {
    render(
      <SearchResults
        results={emojis}
        selectedIndex={-1}
        onSelect={mock(() => {})}
        onHover={mock(() => {})}
      />
    );

    expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', 'Matching emojis');
  });
});
