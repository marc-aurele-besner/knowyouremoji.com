import { describe, it, expect, afterEach, beforeEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor, act } from '@testing-library/react';

const mockPush = mock((_href: string) => {});
mock.module('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mock(() => {}),
    prefetch: mock(() => {}),
  }),
  usePathname: () => '/',
}));

import {
  Omnibox,
  hasEmoji,
  isSingleEmoji,
  isMessageLike,
  resolveLookupHref,
  TRY_EXAMPLES,
} from '@/components/home/omnibox';
import type { EmojiSummary } from '@/types/emoji';

const skull: EmojiSummary = {
  slug: 'skull',
  character: '💀',
  name: 'Skull',
  category: 'faces',
  tldr: "Usually means 'I'm dead'",
};
const skullBones: EmojiSummary = {
  slug: 'skull-and-crossbones',
  character: '☠️',
  name: 'Skull and Crossbones',
  category: 'symbols',
  tldr: 'Danger, or very dead',
};

let searchResults: EmojiSummary[] = [skullBones, skull];
const mockFetch = mock(() =>
  Promise.resolve({ json: () => Promise.resolve({ emojis: searchResults }) })
);

beforeEach(() => {
  searchResults = [skullBones, skull];
  mockPush.mockClear();
  mockFetch.mockClear();
  global.fetch = mockFetch as unknown as typeof fetch;
  globalThis.localStorage?.clear();
});

afterEach(() => {
  cleanup();
});

function typeInto(value: string) {
  const input = screen.getByRole('combobox');
  fireEvent.change(input, { target: { value } });
  return input;
}

async function waitForResults() {
  await waitFor(() => expect(screen.getAllByRole('option').length).toBeGreaterThan(0));
}

describe('omnibox helpers', () => {
  it('detects emojis', () => {
    expect(hasEmoji('hi 💀')).toBe(true);
    expect(hasEmoji('hello')).toBe(false);
  });

  it('detects a single emoji', () => {
    expect(isSingleEmoji('💀')).toBe(true);
    expect(isSingleEmoji(' ❤️ ')).toBe(true);
    expect(isSingleEmoji('👩‍💻')).toBe(true);
    expect(isSingleEmoji('🇫🇷')).toBe(true);
    expect(isSingleEmoji('💀😭')).toBe(false);
    expect(isSingleEmoji('skull')).toBe(false);
  });

  it('classifies message-like input', () => {
    expect(isMessageLike('ok sure 🙂')).toBe(true);
    expect(isMessageLike('see you later')).toBe(true);
    expect(isMessageLike('melting face')).toBe(false);
    expect(isMessageLike('💀')).toBe(false);
    expect(isMessageLike('a 🙂')).toBe(false);
  });

  it('resolves the lookup destination', () => {
    expect(resolveLookupHref('💀', [skullBones, skull])).toBe('/emoji/skull');
    expect(resolveLookupHref('🫠', [skullBones, skull])).toBe('/emoji/skull-and-crossbones');
    expect(resolveLookupHref('skull', [skull])).toBe('/emoji/skull');
    expect(resolveLookupHref('skull', [skull, skullBones])).toBe('/search?q=skull');
    expect(resolveLookupHref('💀', [])).toBe('/search?q=%F0%9F%92%80');
  });
});

describe('Omnibox', () => {
  it('renders a labelled combobox inside a search form', () => {
    render(<Omnibox />);
    const input = screen.getByRole('combobox', { name: /search an emoji or paste a message/i });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    expect(input).toHaveAttribute('aria-autocomplete', 'list');
    expect(screen.getByRole('search')).toHaveAttribute('action', '/search');
  });

  it('shows the lookup mode by default and the interpret mode for messages', () => {
    render(<Omnibox />);
    expect(screen.getByTestId('omnibox-mode')).toHaveTextContent('Look up meaning');
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();

    const input = typeInto('ok sure 🙂');
    expect(screen.getByTestId('omnibox-mode')).toHaveTextContent('Interpret message');
    expect(screen.getByTestId('omnibox-mode')).toHaveAttribute('data-mode', 'message');
    expect(screen.getByRole('button', { name: /decode/i })).toBeInTheDocument();
    expect(input).toHaveAttribute('name', 'm');
  });

  it('fetches suggestions for a lookup query and lists them', async () => {
    render(<Omnibox />);
    const input = typeInto('skull');
    await waitForResults();
    expect(mockFetch).toHaveBeenCalledWith('/api/emojis/search?q=skull&limit=6');
    expect(input).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toBeVisible();
    expect(screen.getByText('Skull and Crossbones')).toBeInTheDocument();
  });

  it('shows a no-match row when the search returns nothing', async () => {
    searchResults = [];
    render(<Omnibox />);
    typeInto('zzzz');
    await waitFor(() => expect(screen.getByText(/no emojis match/i)).toBeInTheDocument());
  });

  it('moves through suggestions with the arrow keys and opens the active one', async () => {
    render(<Omnibox />);
    const input = typeInto('skull');
    await waitForResults();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');
    expect(input.getAttribute('aria-activedescendant')).toContain('opt-0');

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true');

    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(screen.getAllByRole('option')[1]).toHaveAttribute('aria-selected', 'true');

    await act(async () => {
      fireEvent.submit(screen.getByRole('search'));
    });
    expect(mockPush).toHaveBeenCalledWith('/emoji/skull');
  });

  it('ignores arrow keys when no suggestions are open', () => {
    render(<Omnibox />);
    const input = screen.getByRole('combobox');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    fireEvent.keyDown(input, { key: 'Tab' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the suggestions on Escape and reopens them on focus', async () => {
    render(<Omnibox />);
    const input = typeInto('skull');
    await waitForResults();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(input).toHaveAttribute('aria-expanded', 'false');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('aria-expanded', 'true');
  });

  it('closes the suggestions when clicking outside', async () => {
    render(<Omnibox />);
    const input = typeInto('skull');
    await waitForResults();
    fireEvent.mouseDown(document.body);
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('navigates to an emoji when a suggestion is clicked', async () => {
    render(<Omnibox />);
    typeInto('skull');
    await waitForResults();
    const option = screen.getAllByRole('option')[1];
    fireEvent.mouseDown(option);
    fireEvent.mouseEnter(option);
    fireEvent.click(option);
    expect(mockPush).toHaveBeenCalledWith('/emoji/skull');
  });

  it('sends a single emoji straight to its exact match', async () => {
    render(<Omnibox />);
    typeInto('💀');
    await act(async () => {
      fireEvent.submit(screen.getByRole('search'));
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/emoji/skull'));
  });

  it('reuses already loaded suggestions on submit', async () => {
    render(<Omnibox />);
    typeInto('skull');
    await waitForResults();
    mockFetch.mockClear();
    await act(async () => {
      fireEvent.submit(screen.getByRole('search'));
    });
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/search?q=skull');
  });

  it('falls back to the search page when the lookup fails', async () => {
    global.fetch = mock(() => Promise.reject(new Error('offline'))) as unknown as typeof fetch;
    render(<Omnibox />);
    typeInto('melting');
    await act(async () => {
      fireEvent.submit(screen.getByRole('search'));
    });
    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/search?q=melting'));
  });

  it('hands message-like input to the interpreter', async () => {
    render(<Omnibox />);
    typeInto('ok sure 🙂');
    await act(async () => {
      fireEvent.submit(screen.getByRole('search'));
    });
    expect(mockPush).toHaveBeenCalledWith(`/interpreter?m=${encodeURIComponent('ok sure 🙂')}`);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('does nothing on an empty submit', async () => {
    render(<Omnibox />);
    await act(async () => {
      fireEvent.submit(screen.getByRole('search'));
    });
    expect(mockPush).not.toHaveBeenCalled();
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('clears suggestions when the input is emptied', async () => {
    render(<Omnibox />);
    const input = typeInto('skull');
    await waitForResults();
    typeInto('');
    expect(input).toHaveAttribute('aria-expanded', 'false');
  });

  it('fills the field from the try chips', () => {
    render(<Omnibox />);
    for (const example of TRY_EXAMPLES) {
      expect(screen.getByRole('button', { name: example })).toBeInTheDocument();
    }
    fireEvent.click(screen.getByRole('button', { name: 'that meme 💀😭' }));
    expect(screen.getByRole('combobox')).toHaveValue('that meme 💀😭');
    expect(screen.getByRole('combobox')).toHaveFocus();
  });

  it('shows the daily usage line from the rate limiter', () => {
    render(<Omnibox />);
    // The hook is shared process-wide, so only assert the shape of the line.
    expect(screen.getByTestId('omnibox-usage')).toHaveTextContent(
      /\d+ of \d+ free interpretations left today/
    );
  });
});
