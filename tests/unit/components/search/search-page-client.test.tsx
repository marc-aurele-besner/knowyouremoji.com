import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { SearchPageClient } from '@/components/search/search-page-client';
import type { EmojiSummary } from '@/types/emoji';
import type { EmojiComboSummary } from '@/types/combo';

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
];

// Sample combo data for testing
const mockCombos: EmojiComboSummary[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'Something is so funny I died laughing',
    category: 'humor',
  },
  {
    slug: 'heart-eyes',
    combo: '❤️😍',
    name: 'Heart Eyes',
    meaning: 'In love with something or someone',
    category: 'flirting',
  },
  {
    slug: 'fire-hundred',
    combo: '🔥💯',
    name: 'Fire Hundred',
    meaning: 'Absolutely perfect, totally on point',
    category: 'celebration',
  },
];

afterEach(() => {
  cleanup();
});

describe('SearchPageClient', () => {
  describe('rendering', () => {
    it('renders the search input', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      expect(screen.getByRole('searchbox')).toBeInTheDocument();
    });

    it('renders with placeholder text', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      expect(screen.getByPlaceholderText(/search emojis and combos/i)).toBeInTheDocument();
    });

    it('renders tab buttons', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      expect(screen.getByRole('tab', { name: /emojis/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /combos/i })).toBeInTheDocument();
    });

    it('renders emoji tab as active by default', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const emojiTab = screen.getByRole('tab', { name: /emojis/i });
      expect(emojiTab).toHaveAttribute('aria-selected', 'true');
    });

    it('renders all emojis initially on emojis tab', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      mockEmojis.forEach((emoji) => {
        expect(screen.getByText(emoji.character)).toBeInTheDocument();
      });
    });

    it('renders search icon', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      expect(screen.getByTestId('search-icon')).toBeInTheDocument();
    });

    it('renders category filter', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      expect(
        screen.getByRole('combobox', { name: /filter emojis by category/i })
      ).toBeInTheDocument();
    });
  });

  describe('tab switching', () => {
    it('switches to combos tab when clicked', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const combosTab = screen.getByRole('tab', { name: /combos/i });

      fireEvent.click(combosTab);

      await waitFor(() => {
        expect(combosTab).toHaveAttribute('aria-selected', 'true');
      });
    });

    it('shows combos when combos tab is active', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const combosTab = screen.getByRole('tab', { name: /combos/i });

      fireEvent.click(combosTab);

      await waitFor(() => {
        mockCombos.forEach((combo) => {
          expect(screen.getByText(combo.combo)).toBeInTheDocument();
        });
      });
    });

    it('switches back to emojis tab when clicked', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const combosTab = screen.getByRole('tab', { name: /combos/i });
      const emojisTab = screen.getByRole('tab', { name: /emojis/i });

      fireEvent.click(combosTab);
      fireEvent.click(emojisTab);

      await waitFor(() => {
        expect(emojisTab).toHaveAttribute('aria-selected', 'true');
        mockEmojis.forEach((emoji) => {
          expect(screen.getByText(emoji.character)).toBeInTheDocument();
        });
      });
    });

    it('shows appropriate category filter for each tab', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);

      // On emojis tab
      expect(
        screen.getByRole('combobox', { name: /filter emojis by category/i })
      ).toBeInTheDocument();

      // Switch to combos tab
      fireEvent.click(screen.getByRole('tab', { name: /combos/i }));

      await waitFor(() => {
        expect(
          screen.getByRole('combobox', { name: /filter combos by category/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('search functionality', () => {
    it('filters emojis by name', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'skull' } });

      await waitFor(() => {
        expect(screen.getByText('💀')).toBeInTheDocument();
        expect(screen.queryByText('🔥')).not.toBeInTheDocument();
        expect(screen.queryByText('❤️')).not.toBeInTheDocument();
      });
    });

    it('filters combos by name', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const combosTab = screen.getByRole('tab', { name: /combos/i });
      fireEvent.click(combosTab);

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'dead' } });

      await waitFor(() => {
        expect(screen.getByText('💀😂')).toBeInTheDocument();
        expect(screen.queryByText('❤️😍')).not.toBeInTheDocument();
      });
    });

    it('filters emojis case-insensitively', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'SKULL' } });

      await waitFor(() => {
        expect(screen.getByText('💀')).toBeInTheDocument();
      });
    });

    it('shows no results message when no emoji matches', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByTestId('no-emoji-results')).toBeInTheDocument();
      });
    });

    it('shows no results message when no combo matches', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      fireEvent.click(screen.getByRole('tab', { name: /combos/i }));

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      await waitFor(() => {
        expect(screen.getByTestId('no-combo-results')).toBeInTheDocument();
      });
    });

    it('clears search when clear button is clicked', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
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
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);

      expect(screen.queryByRole('button', { name: /clear search/i })).not.toBeInTheDocument();

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'test' } });

      expect(screen.getByRole('button', { name: /clear search/i })).toBeInTheDocument();
    });

    it('syncs search query across tabs', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'love' } });

      // Check emojis are filtered
      await waitFor(() => {
        expect(screen.getByText('❤️')).toBeInTheDocument();
        expect(screen.queryByText('💀')).not.toBeInTheDocument();
      });

      // Switch to combos tab
      fireEvent.click(screen.getByRole('tab', { name: /combos/i }));

      // Combos should also be filtered by "love"
      await waitFor(() => {
        expect(screen.getByText('❤️😍')).toBeInTheDocument();
        expect(screen.queryByText('💀😂')).not.toBeInTheDocument();
      });
    });
  });

  describe('category filtering', () => {
    it('filters emojis by category', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const categorySelect = screen.getByRole('combobox', { name: /filter emojis by category/i });

      fireEvent.change(categorySelect, { target: { value: 'faces' } });

      await waitFor(() => {
        expect(screen.getByText('💀')).toBeInTheDocument();
        expect(screen.queryByText('🔥')).not.toBeInTheDocument();
        expect(screen.queryByText('❤️')).not.toBeInTheDocument();
      });
    });

    it('filters combos by category', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      fireEvent.click(screen.getByRole('tab', { name: /combos/i }));

      const categorySelect = screen.getByRole('combobox', { name: /filter combos by category/i });
      fireEvent.change(categorySelect, { target: { value: 'humor' } });

      await waitFor(() => {
        expect(screen.getByText('💀😂')).toBeInTheDocument();
        expect(screen.queryByText('❤️😍')).not.toBeInTheDocument();
        expect(screen.queryByText('🔥💯')).not.toBeInTheDocument();
      });
    });

    it('resets to all emojis when all categories is selected', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const categorySelect = screen.getByRole('combobox', { name: /filter emojis by category/i });

      fireEvent.change(categorySelect, { target: { value: 'faces' } });
      fireEvent.change(categorySelect, { target: { value: '' } });

      await waitFor(() => {
        mockEmojis.forEach((emoji) => {
          expect(screen.getByText(emoji.character)).toBeInTheDocument();
        });
      });
    });
  });

  describe('links', () => {
    it('renders each emoji as a link to its detail page', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);

      mockEmojis.forEach((emoji) => {
        const link = screen.getByRole('link', { name: new RegExp(emoji.name) });
        expect(link).toHaveAttribute('href', `/emoji/${emoji.slug}`);
      });
    });

    it('renders each combo as a link to its detail page', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      fireEvent.click(screen.getByRole('tab', { name: /combos/i }));

      await waitFor(() => {
        mockCombos.forEach((combo) => {
          const link = screen.getByRole('link', { name: new RegExp(combo.name) });
          expect(link).toHaveAttribute('href', `/combo/${combo.slug}`);
        });
      });
    });
  });

  describe('accessibility', () => {
    it('search input has accessible label', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      expect(screen.getByRole('searchbox')).toHaveAccessibleName(/search emojis and combos/i);
    });

    it('category select has accessible label', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      expect(
        screen.getByRole('combobox', { name: /filter emojis by category/i })
      ).toBeInTheDocument();
    });

    it('emoji results list has proper aria attributes', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      expect(screen.getByRole('list', { name: /emoji results/i })).toBeInTheDocument();
    });

    it('combo results list has proper aria attributes', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      fireEvent.click(screen.getByRole('tab', { name: /combos/i }));

      await waitFor(() => {
        expect(screen.getByRole('list', { name: /combo results/i })).toBeInTheDocument();
      });
    });

    it('announces result count to screen readers', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'skull' } });

      await waitFor(() => {
        const liveRegion = screen.getByRole('status');
        expect(liveRegion).toHaveTextContent(/\d+ emoji(s)? found/i);
      });
    });
  });

  describe('initial props', () => {
    it('accepts initial query', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} initialQuery="skull" />);
      const searchInput = screen.getByRole('searchbox');
      expect(searchInput).toHaveValue('skull');
    });

    it('accepts initial tab', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} initialTab="combos" />);
      const combosTab = screen.getByRole('tab', { name: /combos/i });
      expect(combosTab).toHaveAttribute('aria-selected', 'true');
    });

    it('applies custom className', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} className="custom-class" />);
      const container = screen.getByTestId('search-page-client');
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('result count display', () => {
    it('displays the count of matching emojis', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);

      const initialStatus = screen.getByRole('status');
      expect(initialStatus).toHaveTextContent(/3 emojis? found/i);

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'skull' } });

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/1 emoji found/i);
      });
    });

    it('displays the count of matching combos', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      fireEvent.click(screen.getByRole('tab', { name: /combos/i }));

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/3 combos? found/i);
      });

      const searchInput = screen.getByRole('searchbox');
      fireEvent.change(searchInput, { target: { value: 'dead' } });

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent(/1 combo found/i);
      });
    });

    it('displays counts in tabs', () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);

      expect(screen.getByRole('tab', { name: /emojis \(3\)/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /combos \(3\)/i })).toBeInTheDocument();
    });

    it('updates tab counts when filtering', async () => {
      render(<SearchPageClient emojis={mockEmojis} combos={mockCombos} />);
      const searchInput = screen.getByRole('searchbox');

      fireEvent.change(searchInput, { target: { value: 'skull' } });

      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /emojis \(1\)/i })).toBeInTheDocument();
        expect(screen.getByRole('tab', { name: /combos \(1\)/i })).toBeInTheDocument();
      });
    });
  });
});
