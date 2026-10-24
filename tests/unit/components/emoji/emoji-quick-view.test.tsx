import { describe, it, expect, afterEach, mock, beforeEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import {
  EmojiQuickViewDrawer,
  EmojiQuickViewGrid,
  EmojiQuickViewRegion,
  isModifiedClick,
  readQuickViewData,
  type QuickViewEmoji,
} from '@/components/emoji/emoji-quick-view';
import { EmojiCard } from '@/components/emoji/emoji-card';
import type { MouseEvent } from 'react';

beforeEach(() => {
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: mock(() => Promise.resolve()) },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
});

const skull: QuickViewEmoji = {
  slug: 'skull',
  character: '💀',
  name: 'Skull',
  category: 'faces',
  tldr: "Usually means 'I'm dead' from laughing.",
};

const withContexts: QuickViewEmoji = {
  ...skull,
  contexts: [
    { context: 'SLANG', meaning: 'Extremely funny.', riskLevel: 'LOW', example: 'lol 💀' },
    { context: 'IRONIC', meaning: 'Disbelief.', riskLevel: 'LOW' },
    { context: 'PASSIVE_AGGRESSIVE', meaning: 'Annoyed.', riskLevel: 'MEDIUM' },
    { context: 'DATING', meaning: 'Flirty teasing.', riskLevel: 'LOW' },
    { context: 'RED_FLAG', meaning: 'Fifth meaning (hidden).', riskLevel: 'HIGH' },
  ],
};

const fire: QuickViewEmoji = {
  slug: 'fire',
  character: '🔥',
  name: 'Fire',
  category: 'nature',
  tldr: 'Hot or cool.',
};

describe('isModifiedClick', () => {
  const base = {
    defaultPrevented: false,
    button: 0,
    metaKey: false,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
  };
  const ev = (over: Partial<typeof base>) =>
    ({ ...base, ...over }) as unknown as MouseEvent<HTMLElement>;

  it('is false for a plain primary click', () => {
    expect(isModifiedClick(ev({}))).toBe(false);
  });

  it('is true for modifier, non-primary or already-handled clicks', () => {
    expect(isModifiedClick(ev({ metaKey: true }))).toBe(true);
    expect(isModifiedClick(ev({ ctrlKey: true }))).toBe(true);
    expect(isModifiedClick(ev({ shiftKey: true }))).toBe(true);
    expect(isModifiedClick(ev({ altKey: true }))).toBe(true);
    expect(isModifiedClick(ev({ button: 1 }))).toBe(true);
    expect(isModifiedClick(ev({ defaultPrevented: true }))).toBe(true);
  });
});

describe('EmojiQuickViewDrawer', () => {
  it('renders nothing without an emoji', () => {
    render(<EmojiQuickViewDrawer emoji={null} open onOpenChange={() => {}} />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('shows up to four context meanings when provided', () => {
    render(<EmojiQuickViewDrawer emoji={withContexts} open onOpenChange={() => {}} />);
    const dialog = screen.getByRole('dialog', { name: 'Skull' });
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('In context')).toBeInTheDocument();
    expect(screen.getByText('Extremely funny.')).toBeInTheDocument();
    expect(screen.getByText('lol 💀')).toBeInTheDocument();
    expect(screen.getByText('Flirty teasing.')).toBeInTheDocument();
    expect(screen.queryByText('Fifth meaning (hidden).')).toBeNull();
    expect(screen.getByText('medium risk')).toBeInTheDocument();
  });

  it('falls back to a category chip without context data', () => {
    render(<EmojiQuickViewDrawer emoji={skull} open onOpenChange={() => {}} />);
    expect(screen.getByText('U+1F480 · /emoji/skull')).toBeInTheDocument();
    expect(screen.getByText(/I'm dead/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Smileys & Faces' })).toHaveAttribute(
      'href',
      '/emoji/category/faces'
    );
    expect(screen.getByRole('link', { name: /open full entry/i })).toHaveAttribute(
      'href',
      '/emoji/skull'
    );
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  });

  it('omits the category chip when the category has no hub page', () => {
    render(<EmojiQuickViewDrawer emoji={fire} open onOpenChange={() => {}} />);
    expect(screen.getByText('Nature')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Nature' })).toBeNull();
  });

  it('requests closing from the close button', () => {
    const onOpenChange = mock(() => {});
    render(<EmojiQuickViewDrawer emoji={skull} open onOpenChange={onOpenChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Close quick view' }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe('EmojiQuickViewGrid', () => {
  it('renders real links in a labelled list', () => {
    render(<EmojiQuickViewGrid emojis={[skull, fire]} showTldr ariaLabel="Results" />);
    expect(screen.getByRole('list', { name: 'Results' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skull' })).toHaveAttribute('href', '/emoji/skull');
    expect(screen.getByText('Hot or cool.')).toBeInTheDocument();
  });

  it('opens the drawer on a plain click, moves focus inside, and restores it on Escape', async () => {
    render(<EmojiQuickViewGrid emojis={[skull, fire]} />);
    const card = screen.getByRole('link', { name: 'Skull' });
    card.focus();
    const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    card.dispatchEvent(clickEvent);
    expect(clickEvent.defaultPrevented).toBe(true);

    const dialog = await screen.findByRole('dialog', { name: 'Skull' });
    await waitFor(() => {
      expect(dialog.contains(document.activeElement)).toBe(true);
    });

    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).toBeNull();
    });
    await waitFor(() => {
      expect(document.activeElement).toBe(card);
    });
  });

  it('keeps default link behaviour for modifier clicks', () => {
    render(<EmojiQuickViewGrid emojis={[skull]} />);
    const card = screen.getByRole('link', { name: 'Skull' });
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
      metaKey: true,
    });
    card.dispatchEvent(clickEvent);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('uses a custom grid class and the dense layout', () => {
    render(<EmojiQuickViewGrid emojis={[skull]} compact gridClassName="my-grid" className="x" />);
    const list = screen.getByRole('list', { name: 'Emoji grid' });
    expect(list).toHaveClass('my-grid', 'x');
    expect(screen.getByRole('link', { name: 'Skull' })).toHaveClass('text-center');
  });
});

describe('readQuickViewData', () => {
  it('reads card data attributes and tolerates bad context JSON', () => {
    const card = document.createElement('a');
    card.dataset.quickSlug = 'skull';
    card.dataset.quickCharacter = '💀';
    card.dataset.quickName = 'Skull';
    card.dataset.quickCategory = 'faces';
    card.dataset.quickTldr = 'Dead';
    card.dataset.quickContexts = '[{"context":"SLANG","meaning":"Funny","riskLevel":"LOW"}]';
    expect(readQuickViewData(card)).toEqual({
      slug: 'skull',
      character: '💀',
      name: 'Skull',
      category: 'faces',
      tldr: 'Dead',
      contexts: [{ context: 'SLANG', meaning: 'Funny', riskLevel: 'LOW' }],
    });

    card.dataset.quickContexts = '{not json';
    expect(readQuickViewData(card).contexts).toBeUndefined();

    const empty = document.createElement('a');
    expect(readQuickViewData(empty)).toEqual({
      slug: '',
      character: '',
      name: '',
      category: '',
      tldr: '',
      contexts: undefined,
    });
  });
});

describe('EmojiQuickViewRegion', () => {
  it('opens the drawer from server-rendered cards and ignores other clicks', async () => {
    render(
      <EmojiQuickViewRegion className="region">
        <EmojiCard emoji={{ ...skull, contexts: withContexts.contexts }} showTldr quickView />
        <button type="button">Other</button>
      </EmojiQuickViewRegion>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Other' }));
    expect(screen.queryByRole('dialog')).toBeNull();

    const card = screen.getByRole('link', { name: 'Skull' });
    expect(card).toHaveAttribute('data-quick-slug', 'skull');
    const modified = new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true });
    card.dispatchEvent(modified);
    expect(screen.queryByRole('dialog')).toBeNull();

    const plain = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 });
    card.dispatchEvent(plain);
    expect(plain.defaultPrevented).toBe(true);
    await screen.findByRole('dialog', { name: 'Skull' });
    expect(screen.getByText('Extremely funny.')).toBeInTheDocument();
  });

  it('omits the contexts attribute when a card has none', () => {
    render(<EmojiCard emoji={skull} quickView />);
    expect(screen.getByRole('link', { name: 'Skull' })).not.toHaveAttribute('data-quick-contexts');
  });
});
