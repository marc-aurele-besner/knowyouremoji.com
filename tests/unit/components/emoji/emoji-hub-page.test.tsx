import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { EmojiHubPage, pickHubHighlights } from '@/components/emoji/emoji-hub-page';

afterEach(() => {
  cleanup();
});

const baseProps = {
  breadcrumbs: [
    { label: 'Home', href: '/' },
    { label: 'Emojis', href: '/emoji' },
    { label: 'Gen Z' },
  ],
  title: 'Gen Z Emoji Meanings',
  description: 'How Gen Z reads emojis.',
  countLabel: '2 emojis with Gen Z-specific notes',
  siblings: [
    { label: 'Gen Z', href: '/emoji/generation/GEN_Z', active: true },
    { label: 'Boomer', href: '/emoji/generation/BOOMER' },
  ],
  siblingsLabel: 'Other generations',
  emojis: [
    { slug: 'skull', character: '💀', name: 'Skull', category: 'faces', tldr: 'Dead laughing' },
    { slug: 'fire', character: '🔥', name: 'Fire', category: 'nature', tldr: 'Hot' },
  ],
  gridHeading: 'Gen Z Emoji Meanings',
  emptyTitle: 'No emojis with generational notes found.',
};

describe('EmojiHubPage', () => {
  it('renders the page head, breadcrumbs and count', () => {
    render(<EmojiHubPage {...baseProps} />);
    expect(
      screen.getByRole('heading', { level: 1, name: 'Gen Z Emoji Meanings' })
    ).toBeInTheDocument();
    expect(screen.getByText('How Gen Z reads emojis.')).toBeInTheDocument();
    expect(screen.getByText('2 emojis with Gen Z-specific notes')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
  });

  it('renders sibling chips and marks the current hub', () => {
    render(<EmojiHubPage {...baseProps} />);
    const nav = screen.getByRole('navigation', { name: 'Other generations' });
    expect(nav).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Gen Z' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: 'Boomer' })).not.toHaveAttribute('aria-current');
  });

  it('renders the emoji grid with quick-view cards that remain links', () => {
    render(<EmojiHubPage {...baseProps} />);
    expect(screen.getByRole('list', { name: 'Gen Z Emoji Meanings' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Skull' })).toHaveAttribute('href', '/emoji/skull');
    expect(screen.getByText('Dead laughing')).toBeInTheDocument();
  });

  it('renders highlighted example cards when provided', () => {
    render(
      <EmojiHubPage
        {...baseProps}
        highlightsTitle="In practice"
        highlights={[
          {
            slug: 'skull',
            character: '💀',
            name: 'Skull',
            text: 'Means laughing.',
            riskLevel: 'MEDIUM',
            example: 'lol 💀',
          },
          { slug: 'fire', character: '🔥', name: 'Fire', text: 'Means hot.' },
        ]}
      />
    );
    expect(screen.getByRole('heading', { level: 2, name: 'In practice' })).toBeInTheDocument();
    expect(screen.getByText('Means laughing.')).toBeInTheDocument();
    expect(screen.getByText('medium risk')).toHaveClass('text-primary-700');
    expect(screen.getByText('lol 💀')).toHaveClass('rounded-bl-sm');
    expect(screen.getByText('Means hot.')).toBeInTheDocument();
  });

  it('renders an empty state without emojis or siblings', () => {
    render(<EmojiHubPage {...baseProps} emojis={[]} siblings={[]} />);
    expect(screen.getByText('No emojis with generational notes found.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse all emojis' })).toHaveAttribute(
      'href',
      '/emoji'
    );
    expect(screen.queryByRole('navigation', { name: 'Other generations' })).toBeNull();
  });
});

describe('pickHubHighlights', () => {
  it('prefers deep-content entries and limits the result', () => {
    const items = [
      { id: 1 },
      { id: 2, contentTier: 'deep' },
      { id: 3, contentTier: 'standard' },
      { id: 4, contentTier: 'deep' },
    ];
    expect(pickHubHighlights(items, 3).map((i) => i.id)).toEqual([2, 4, 1]);
    expect(pickHubHighlights(items)).toHaveLength(4);
  });
});
