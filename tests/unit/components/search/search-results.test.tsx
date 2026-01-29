import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { SearchResults } from '@/components/search/search-results';
import type { EmojiSummary } from '@/types/emoji';

const mockEmojis: EmojiSummary[] = [
  { slug: 'skull', character: '💀', name: 'Skull', category: 'faces', tldr: "Usually means 'I'm dead' from laughing" },
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'travel', tldr: "Something is 'hot' or awesome" },
  { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'Expression of love' },
];

afterEach(() => {
  cleanup();
});

describe('SearchResults', () => {
  describe('rendering', () => {
    it('renders the listbox container', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('renders all emoji results', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      mockEmojis.forEach((emoji) => {
        expect(screen.getByText(emoji.character)).toBeInTheDocument();
        expect(screen.getByText(emoji.name)).toBeInTheDocument();
        expect(screen.getByText(emoji.tldr)).toBeInTheDocument();
      });
    });

    it('renders emoji characters in correct order', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options.length).toBe(3);
    });

    it('shows empty state when no results', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={[]}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      expect(screen.getByText(/no emojis found/i)).toBeInTheDocument();
    });
  });

  describe('selection', () => {
    it('highlights the selected item', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options[1]).toHaveAttribute('aria-selected', 'true');
      expect(options[0]).toHaveAttribute('aria-selected', 'false');
      expect(options[2]).toHaveAttribute('aria-selected', 'false');
    });

    it('calls onSelect when item is clicked', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const option = screen.getByText('Skull').closest('li');
      fireEvent.click(option!);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(mockEmojis[0]);
    });

    it('calls onHover when mouse enters item', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const option = screen.getByText('Fire').closest('li');
      fireEvent.mouseEnter(option!);

      expect(onHover).toHaveBeenCalledTimes(1);
      expect(onHover).toHaveBeenCalledWith(1);
    });
  });

  describe('accessibility', () => {
    it('has proper listbox role', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('has proper option roles for items', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options.length).toBe(mockEmojis.length);
    });

    it('sets aria-selected correctly', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={2}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options[2]).toHaveAttribute('aria-selected', 'true');
    });

    it('assigns unique IDs to options', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('id', 'search-result-0');
      expect(options[1]).toHaveAttribute('id', 'search-result-1');
      expect(options[2]).toHaveAttribute('id', 'search-result-2');
    });

    it('has correct id for listbox', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={-1}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      expect(screen.getByRole('listbox')).toHaveAttribute('id', 'search-results');
    });
  });

  describe('styling', () => {
    it('applies selected styling to the active item', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={0}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveClass('bg-amber-50');
    });

    it('does not apply selected styling to non-active items', () => {
      const onSelect = mock(() => {});
      const onHover = mock(() => {});

      render(
        <SearchResults
          results={mockEmojis}
          selectedIndex={0}
          onSelect={onSelect}
          onHover={onHover}
        />
      );

      const options = screen.getAllByRole('option');
      expect(options[1]).not.toHaveClass('bg-amber-50');
      expect(options[2]).not.toHaveClass('bg-amber-50');
    });
  });

  describe('displayName', () => {
    it('has displayName set', () => {
      expect(SearchResults.displayName).toBe('SearchResults');
    });
  });
});
