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
    ok: true,
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
  // Restore the shared fetch mock: individual tests may swap it out.
  global.fetch = mockFetch as unknown as typeof fetch;
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

    it('clears results and closes dropdown when query is cleared', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      // First, type something to get results
      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Now clear the query
      await act(async () => {
        fireEvent.change(input, { target: { value: '' } });
        // Wait for debounce to trigger fetchResults with empty query
        await new Promise((r) => setTimeout(r, 250));
      });

      // Dropdown should be closed and results cleared
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('clears results and closes dropdown when query is only whitespace', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      // First, type something to get results
      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      // Now enter only whitespace
      await act(async () => {
        fireEvent.change(input, { target: { value: '   ' } });
        // Wait for debounce to trigger fetchResults with whitespace query
        await new Promise((r) => setTimeout(r, 250));
      });

      // Dropdown should be closed and results cleared
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('explains the failure instead of listing results when the request rejects', async () => {
      const failingFetch = mock(() => Promise.reject(new Error('Network error')));
      global.fetch = failingFetch as unknown as typeof fetch;

      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/search is unavailable/i)).toBeInTheDocument();
      });

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(screen.queryByRole('option')).not.toBeInTheDocument();
      global.fetch = mockFetch as unknown as typeof fetch;
    });

    it('treats a non-OK response as a failure', async () => {
      global.fetch = mock(() =>
        Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve({}) })
      ) as unknown as typeof fetch;

      render(<SearchBar />);
      await act(async () => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'skull' } });
      });

      await waitFor(() => {
        expect(screen.getByText(/search is unavailable/i)).toBeInTheDocument();
      });
      global.fetch = mockFetch as unknown as typeof fetch;
    });
  });

  describe('query handling', () => {
    it('sends the trimmed query to the API', async () => {
      render(<SearchBar />);
      await act(async () => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: '  fire  ' } });
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/emojis/search?q=fire&limit=6');
      });
    });

    it('ignores a slow response that arrives after a newer query', async () => {
      const resolvers: Array<(value: unknown) => void> = [];
      global.fetch = mock(
        () =>
          new Promise((resolve) => {
            resolvers.push(resolve);
          })
      ) as unknown as typeof fetch;

      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'sk' } });
      });
      await waitFor(() => expect(resolvers.length).toBe(1));

      await act(async () => {
        fireEvent.change(input, { target: { value: 'fire' } });
      });
      await waitFor(() => expect(resolvers.length).toBe(2));

      // The newer query answers first...
      await act(async () => {
        resolvers[1]({
          ok: true,
          json: () =>
            Promise.resolve({
              emojis: [
                {
                  slug: 'fire',
                  character: '🔥',
                  name: 'Fire',
                  category: 'travel',
                  tldr: 'Something is awesome',
                },
              ],
            }),
        });
      });
      expect(screen.getByText('Fire')).toBeInTheDocument();

      // ...then the outdated one must not replace it.
      await act(async () => {
        resolvers[0]({
          ok: true,
          json: () =>
            Promise.resolve({
              emojis: [
                { slug: 'skull', character: '💀', name: 'Skull', category: 'faces', tldr: 'Dead' },
              ],
            }),
        });
      });
      expect(screen.getByText('Fire')).toBeInTheDocument();
      expect(screen.queryByText('Skull')).not.toBeInTheDocument();
      global.fetch = mockFetch as unknown as typeof fetch;
    });

    it('does not search when the pending debounce is cancelled by unmounting', async () => {
      const { unmount } = render(<SearchBar />);
      await act(async () => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'skull' } });
      });
      mockFetch.mockClear();
      unmount();

      await new Promise((resolve) => setTimeout(resolve, 250));
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('shows the query in the empty state and offers the full search page', async () => {
      global.fetch = mock(() =>
        Promise.resolve({ ok: true, json: () => Promise.resolve({ emojis: [] }) })
      ) as unknown as typeof fetch;

      render(<SearchBar />);
      await act(async () => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'zzzz' } });
      });

      await waitFor(() => {
        expect(screen.getByText('No emojis found for “zzzz”.')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'See all results for “zzzz”' }));
      });
      expect(mockPush).toHaveBeenCalledWith('/search?q=zzzz');
      global.fetch = mockFetch as unknown as typeof fetch;
    });
  });

  describe('clear and submit', () => {
    it('shows a clear button only when there is text', async () => {
      render(<SearchBar />);
      expect(screen.queryByRole('button', { name: 'Clear search' })).not.toBeInTheDocument();

      await act(async () => {
        fireEvent.change(screen.getByRole('combobox'), { target: { value: 'skull' } });
      });
      expect(screen.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
    });

    it('clears the input and results when the clear button is pressed', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull' } });
      });
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByRole('button', { name: 'Clear search' }));
      });

      expect(input).toHaveValue('');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      expect(document.activeElement).toBe(input);
    });

    it('opens the full search page on Enter when no suggestion is highlighted', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');

      await act(async () => {
        fireEvent.change(input, { target: { value: 'skull face' } });
      });
      await waitFor(() => {
        expect(screen.getByRole('listbox')).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.submit(input.closest('form')!);
      });

      expect(mockPush).toHaveBeenCalledWith('/search?q=skull%20face');
      expect(mockPush).not.toHaveBeenCalledWith(expect.stringContaining('/emoji/'));
    });

    it('does nothing when submitted with an empty query', async () => {
      render(<SearchBar />);
      await act(async () => {
        fireEvent.submit(screen.getByRole('combobox').closest('form')!);
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('ignores Enter while an IME composition is in progress', async () => {
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
      await act(async () => {
        fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
      });

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('reopens the dropdown with ArrowDown after Escape closed it', async () => {
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

      await act(async () => {
        fireEvent.keyDown(input, { key: 'ArrowDown' });
      });
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('ignores arrow keys when there are no results', async () => {
      render(<SearchBar />);
      const input = screen.getByRole('combobox');
      const event = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        cancelable: true,
      });
      input.dispatchEvent(event);
      expect(event.defaultPrevented).toBe(false);
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
                  ok: true,
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
