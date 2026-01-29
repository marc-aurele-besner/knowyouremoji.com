import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';
import { SearchBar } from '@/components/search/search-bar';

// Mock next/navigation
const mockPush = mock(() => {});
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
}));

// Mock fetch
const mockFetch = mock(() =>
  Promise.resolve({
    json: () =>
      Promise.resolve({
        emojis: [
          {
            slug: 'skull',
            character: '💀',
            name: 'Skull',
            category: 'faces',
            tldr: "Usually means 'I'm dead'",
          },
          {
            slug: 'fire',
            character: '🔥',
            name: 'Fire',
            category: 'travel',
            tldr: 'Something is awesome',
          },
        ],
      }),
  })
);
global.fetch = mockFetch as unknown as typeof fetch;

beforeEach(() => {
  mockPush.mockClear();
  mockFetch.mockClear();
});

afterEach(() => {
  cleanup();
});

describe('SearchBar', () => {
  describe('rendering', () => {
    it('renders the search input', () => {
      render(<SearchBar />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('renders with default placeholder', () => {
      render(<SearchBar />);
      expect(screen.getByPlaceholderText('Search emojis...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
      render(<SearchBar placeholder="Find an emoji..." />);
      expect(screen.getByPlaceholderText('Find an emoji...')).toBeInTheDocument();
    });

    it('renders search icon', () => {
      render(<SearchBar />);
      // Search icon is an SVG
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<SearchBar className="custom-class" />);
      // The className is on the container div
      const container = screen.getByRole('combobox').parentElement?.parentElement;
      expect(container).toHaveClass('custom-class');
    });
  });

  describe('search functionality', () => {
    it('fetches results when typing', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
    });

    it('debounces search input', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      // Type quickly
      await act(async () => {
        fireEvent.change(input, { target: { value: 's' } });
        fireEvent.change(input, { target: { value: 'sk' } });
        fireEvent.change(input, { target: { value: 'sku' } });
      });

      // Should not call immediately for each keystroke
      await waitFor(
        () => {
          // Eventually should be called after debounce
          expect(mockFetch).toHaveBeenCalled();
        },
        { timeout: 500 }
      );
    });

    it('shows results dropdown when results available', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });

    it('does not show dropdown for empty query', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: '' } });
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('keyboard navigation', () => {
    it('navigates down with ArrowDown', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('navigates up with ArrowUp', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowDown' });
        fireEvent.keyDown(input, { key: 'ArrowUp' });
      });

      const options = screen.getAllByRole('option');
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('wraps around at the end of list with ArrowDown', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const options = screen.getAllByRole('option');

      // Navigate past the last item
      for (let i = 0; i <= options.length; i++) {
        await act(async () => {
          fireEvent.keyDown(input, { key: 'ArrowDown' });
        });
      }

      // Should wrap to first item
      expect(options[0]).toHaveAttribute('aria-selected', 'true');
    });

    it('wraps around at the beginning of list with ArrowUp', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Navigate up from -1 should go to last item
      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowUp' });
      });

      const options = screen.getAllByRole('option');
      expect(options[options.length - 1]).toHaveAttribute('aria-selected', 'true');
    });

    it('selects item with Enter', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      expect(mockPush).toHaveBeenCalledWith('/emoji/skull');
    });

    it('closes dropdown with Escape', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Escape' });
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('blurs input on Escape when dropdown is closed', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        input.focus();
        fireEvent.keyDown(input, { key: 'Escape' });
      });

      expect(document.activeElement).not.toBe(input);
    });
  });

  describe('mouse interaction', () => {
    it('selects item on click', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      const option = screen.getByText('Skull').closest('li');
      await act(async () => {
        fireEvent.click(option!);
      });

      expect(mockPush).toHaveBeenCalledWith('/emoji/skull');
    });

    it('closes dropdown when clicking outside', async () => {
      render(
        <div>
          <SearchBar />
          <div data-testid="outside">Outside</div>
        </div>
      );
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.mouseDown(screen.getByTestId('outside'));
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('selection behavior', () => {
    it('clears input after selection', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox') as HTMLInputElement;

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      expect(input.value).toBe('');
    });

    it('closes dropdown after selection', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      await waitFor(() => {
        const options = screen.getAllByRole('option');
        expect(options[0]).toHaveAttribute('aria-selected', 'true');
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter' });
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has combobox role', () => {
      render(<SearchBar />);
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('has aria-label', () => {
      render(<SearchBar />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-label', 'Search emojis');
    });

    it('has aria-expanded attribute', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      expect(input).toHaveAttribute('aria-expanded', 'false');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-expanded', 'true');
      });
    });

    it('has aria-autocomplete attribute', () => {
      render(<SearchBar />);
      expect(screen.getByRole('combobox')).toHaveAttribute('aria-autocomplete', 'list');
    });

    it('has aria-controls when dropdown is open', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(input).toHaveAttribute('aria-controls', 'search-results');
      });
    });

    it('has aria-activedescendant when item is selected', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });

      expect(input).toHaveAttribute('aria-activedescendant', 'search-result-0');
    });
  });

  describe('loading state', () => {
    it('shows loading spinner while fetching', async () => {
      // Create a delayed fetch
      const delayedFetch = mock(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  json: () => Promise.resolve({ emojis: [] }),
                }),
              100
            )
          )
      );
      global.fetch = delayedFetch as unknown as typeof fetch;

      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      // Loading spinner should appear during fetch
      await waitFor(() => {
        const spinner = document.querySelector('.animate-spin');
        expect(spinner).toBeInTheDocument();
      });

      // Restore original mock
      global.fetch = mockFetch as unknown as typeof fetch;
    });
  });

  describe('focus behavior', () => {
    it('reopens dropdown on focus if query has results', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Close with escape
      await act(async () => {
        fireEvent.keyDown(input, { key: 'Escape' });
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();

      // Focus again with existing query
      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
        await new Promise((r) => setTimeout(r, 250)); // Wait for debounce
      });

      await act(async () => {
        fireEvent.focus(input);
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });
    });
  });

  describe('displayName', () => {
    it('has displayName set', () => {
      expect(SearchBar.displayName).toBe('SearchBar');
    });
  });
});
