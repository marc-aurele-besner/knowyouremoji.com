import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor, within } from '@testing-library/react';
import { EmojiSearch } from '@/components/emoji/emoji-search';
import type { EmojiSummary } from '@/types/emoji';

// Sample emoji data for testing
const mockEmojis: EmojiSummary[] = [
  {
    slug: 'skull',
    character: '💀',
    name: 'Skull',
    category: 'faces',
    tldr: "Usually means 'that's so funny I'm dead'",
  },
  {
    slug: 'fire',
    character: '🔥',
    name: 'Fire',
    category: 'travel',
    tldr: "Indicates something is 'hot' or awesome",
  },
  {
    slug: 'heart',
    character: '❤️',
    name: 'Red Heart',
    category: 'symbols',
    tldr: 'Classic expression of love',
  },
  {
    slug: 'grinning-face',
    character: '😀',
    name: 'Grinning Face',
    category: 'faces',
    tldr: 'Basic happy expression',
  },
  {
    slug: 'thinking-face',
    character: '🤔',
    name: 'Thinking Face',
    category: 'faces',
    tldr: 'Expressing contemplation or skepticism',
  },
];

afterEach(() => {
  cleanup();
});

describe('EmojiSearch', () => {
  describe('rendering', () => {
    it('renders the search input', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('renders with placeholder text', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      expect(screen.getByPlaceholderText(/search emojis/i)).toBeInTheDocument();
    });

    it('renders category filter select', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
    });

    it('renders all emojis initially when no search query', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      mockEmojis.forEach((emoji) => {
        expect(screen.getByText(emoji.character)).toBeInTheDocument();
      });
    });

    it('renders emoji names', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      mockEmojis.forEach((emoji) => {
        expect(screen.getByText(emoji.name)).toBeInTheDocument();
      });
    });

    it('renders search icon', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });
  });

  describe('search functionality', () => {
    it('filters emojis by name', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'skull' } });

      await waitFor(() => {
        expect(screen.getByText('💀')).toBeInTheDocument();
        expect(screen.queryByText('🔥')).not.toBeInTheDocument();
        expect(screen.queryByText('❤️')).not.toBeInTheDocument();
      });
    });

    it('filters emojis by character', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: '💀' } });

      await waitFor(() => {
        expect(screen.getByText('Skull')).toBeInTheDocument();
        expect(screen.queryByText('Fire')).not.toBeInTheDocument();
      });
    });

    it('filters emojis case-insensitively', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'SKULL' } });

      await waitFor(() => {
        expect(screen.getByText('💀')).toBeInTheDocument();
      });
    });

    it('shows no results message when no matches', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByText(/no emojis found/i)).toBeInTheDocument();
      });
    });

    it('searches by tldr/description', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'love' } });

      await waitFor(() => {
        expect(screen.getByText('❤️')).toBeInTheDocument();
        expect(screen.queryByText('💀')).not.toBeInTheDocument();
      });
    });

    it('clears search when clear button is clicked', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'skull' } });

      await waitFor(() => {
        expect(screen.queryByText('🔥')).not.toBeInTheDocument();
      });

      const clearButton = screen.getByRole('button', { name: /clear search/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        mockEmojis.forEach((emoji) => {
          expect(screen.getByText(emoji.character)).toBeInTheDocument();
        });
      });
    });

    it('shows clear button only when search has value', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });
  });

  describe('category filtering', () => {
    it('filters emojis by category', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const categorySelect = screen.getByRole('combobox', { name: /category/i });

      fireEvent.change(categorySelect, { target: { value: 'faces' } });

      await waitFor(() => {
        expect(screen.getByText('💀')).toBeInTheDocument();
        expect(screen.getByText('😀')).toBeInTheDocument();
        expect(screen.getByText('🤔')).toBeInTheDocument();
        expect(screen.queryByText('🔥')).not.toBeInTheDocument();
        expect(screen.queryByText('❤️')).not.toBeInTheDocument();
      });
    });

    it('shows all categories option', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const categorySelect = screen.getByRole('combobox', { name: /category/i });

      expect(within(categorySelect).getByText(/all categories/i)).toBeInTheDocument();
    });

    it('resets to all emojis when all categories is selected', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const categorySelect = screen.getByRole('combobox', { name: /category/i });

      fireEvent.change(categorySelect, { target: { value: 'faces' } });
      fireEvent.change(categorySelect, { target: { value: '' } });

      await waitFor(() => {
        mockEmojis.forEach((emoji) => {
          expect(screen.getByText(emoji.character)).toBeInTheDocument();
        });
      });
    });

    it('combines search and category filter', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');
      const categorySelect = screen.getByRole('combobox', { name: /category/i });

      fireEvent.change(categorySelect, { target: { value: 'faces' } });
      fireEvent.change(searchInput, { target: { value: 'grinning' } });

      await waitFor(() => {
        expect(screen.getByText('😀')).toBeInTheDocument();
        expect(screen.queryByText('💀')).not.toBeInTheDocument();
        expect(screen.queryByText('🤔')).not.toBeInTheDocument();
      });
    });
  });

  describe('emoji links', () => {
    it('renders each emoji as a link', () => {
      render(<EmojiSearch emojis={mockEmojis} />);

      mockEmojis.forEach((emoji) => {
        const link = screen.getByRole('link', { name: new RegExp(emoji.name) });
        expect(link).toHaveAttribute('href', `/emoji/${emoji.slug}`);
      });
    });
  });

  describe('accessibility', () => {
    it('search input has accessible label', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      expect(screen.getByRole('searchbox')).toHaveAccessibleName(/search emojis/i);
    });

    it('category select has accessible label', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      expect(screen.getByRole('combobox', { name: /category/i })).toBeInTheDocument();
    });

    it('emoji list has proper aria attributes', () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
    });

    it('announces result count to screen readers', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'face' } });

      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveTextContent(/\d+ emoji(s)? found/i);
      });
    });
  });

  describe('empty state', () => {
    it('shows message when no emojis provided', () => {
      render(<EmojiSearch emojis={[]} />);
      expect(screen.getByText(/no emojis available/i)).toBeInTheDocument();
    });
  });

  describe('result count', () => {
    it('displays the count of matching emojis', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);

      // Use getAllByText since count appears in multiple places
      const initialCounts = screen.getAllByText(/5 emojis?/i);
      expect(initialCounts.length).toBeGreaterThan(0);

      const searchInput = screen.getByRole('searchbox');
      // Searching for "grinning" should match only "Grinning Face"
      fireEvent.change(searchInput, { target: { value: 'grinning' } });

      await waitFor(() => {
        const filteredCounts = screen.getAllByText(/1 emoji/i);
        expect(filteredCounts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('custom props', () => {
    it('calls onSelect callback when emoji is clicked', async () => {
      const handleSelect = mock(() => {});
      render(<EmojiSearch emojis={mockEmojis} onSelect={handleSelect} />);

      const skullLink = screen.getByRole('link', { name: /skull/i });
      fireEvent.click(skullLink);

      expect(handleSelect).toHaveBeenCalledWith(mockEmojis[0]);
    });

    it('applies custom className', () => {
      render(<EmojiSearch emojis={mockEmojis} className="custom-class" />);
      const container = screen.getByTestId('emoji-search');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('debounced search', () => {
    it('debounces search input for performance', async () => {
      render(<EmojiSearch emojis={mockEmojis} />);
      const searchInput = screen.getByRole('searchbox');

      // Type quickly
      fireEvent.change(searchInput, { target: { value: 's' } });
      fireEvent.change(searchInput, { target: { value: 'sk' } });
      fireEvent.change(searchInput, { target: { value: 'sku' } });
      fireEvent.change(searchInput, { target: { value: 'skul' } });
      fireEvent.change(searchInput, { target: { value: 'skull' } });

      // Results should appear after debounce
      await waitFor(() => {
        expect(screen.getByText('💀')).toBeInTheDocument();
        expect(screen.queryByText('🔥')).not.toBeInTheDocument();
      });
    });
  });
});
