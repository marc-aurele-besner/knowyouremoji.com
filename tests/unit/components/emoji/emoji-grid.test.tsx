import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { EmojiGrid } from '@/components/emoji/emoji-grid';
import type { EmojiSummary } from '@/types/emoji';

afterEach(() => {
  cleanup();
});

const mockEmojis: EmojiSummary[] = [
  {
    slug: 'fire',
    character: '🔥',
    name: 'Fire',
    category: 'faces',
    tldr: 'Hot, cool, or exciting',
  },
  {
    slug: 'sparkles',
    character: '✨',
    name: 'Sparkles',
    category: 'symbols',
    tldr: 'Magic, excitement, or emphasis',
  },
  {
    slug: 'skull',
    character: '💀',
    name: 'Skull',
    category: 'faces',
    tldr: 'Death or dying laughing',
  },
];

const singleEmoji: EmojiSummary[] = [
  {
    slug: 'fire',
    character: '🔥',
    name: 'Fire',
    category: 'faces',
    tldr: 'Hot, cool, or exciting',
  },
];

const manyEmojis: EmojiSummary[] = [
  { slug: 'fire', character: '🔥', name: 'Fire', category: 'faces', tldr: 'Hot' },
  { slug: 'sparkles', character: '✨', name: 'Sparkles', category: 'symbols', tldr: 'Magic' },
  { slug: 'skull', character: '💀', name: 'Skull', category: 'faces', tldr: 'Death' },
  { slug: 'heart', character: '❤️', name: 'Red Heart', category: 'symbols', tldr: 'Love' },
  { slug: 'star', character: '⭐', name: 'Star', category: 'symbols', tldr: 'Great' },
  { slug: 'sun', character: '☀️', name: 'Sun', category: 'travel', tldr: 'Bright' },
  { slug: 'moon', character: '🌙', name: 'Moon', category: 'travel', tldr: 'Night' },
  { slug: 'cloud', character: '☁️', name: 'Cloud', category: 'travel', tldr: 'Sky' },
  { slug: 'rainbow', character: '🌈', name: 'Rainbow', category: 'travel', tldr: 'Colorful' },
  { slug: 'pizza', character: '🍕', name: 'Pizza', category: 'food', tldr: 'Food' },
];

describe('EmojiGrid', () => {
  describe('rendering', () => {
    it('renders all emoji cards', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('💀')).toBeInTheDocument();
    });

    it('renders emoji names', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      expect(screen.getByText('Fire')).toBeInTheDocument();
      expect(screen.getByText('Sparkles')).toBeInTheDocument();
      expect(screen.getByText('Skull')).toBeInTheDocument();
    });

    it('renders as a grid list element', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
      expect(list).toHaveAttribute('aria-label', 'Emoji grid');
    });

    it('renders list items for each emoji', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(3);
    });

    it('returns null when emojis array is empty', () => {
      const { container } = render(<EmojiGrid emojis={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('links', () => {
    it('renders links to emoji detail pages', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      const fireLink = screen.getByRole('link', { name: /fire/i });
      expect(fireLink).toHaveAttribute('href', '/emoji/fire');
    });

    it('each emoji card is a link', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });

    it('links have correct href for each emoji', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      expect(screen.getByRole('link', { name: /fire/i })).toHaveAttribute('href', '/emoji/fire');
      expect(screen.getByRole('link', { name: /sparkles/i })).toHaveAttribute(
        'href',
        '/emoji/sparkles'
      );
      expect(screen.getByRole('link', { name: /skull/i })).toHaveAttribute('href', '/emoji/skull');
    });
  });

  describe('showTldr prop', () => {
    it('does not show tldr by default', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      expect(screen.queryByText('Hot, cool, or exciting')).not.toBeInTheDocument();
    });

    it('shows tldr when showTldr is true', () => {
      render(<EmojiGrid emojis={mockEmojis} showTldr />);
      expect(screen.getByText('Hot, cool, or exciting')).toBeInTheDocument();
      expect(screen.getByText('Magic, excitement, or emphasis')).toBeInTheDocument();
    });

    it('shows all tldrs when showTldr is true', () => {
      render(<EmojiGrid emojis={mockEmojis} showTldr />);
      expect(screen.getByText('Hot, cool, or exciting')).toBeInTheDocument();
      expect(screen.getByText('Magic, excitement, or emphasis')).toBeInTheDocument();
      expect(screen.getByText('Death or dying laughing')).toBeInTheDocument();
    });
  });

  describe('columns prop', () => {
    it('uses default responsive columns when no columns prop provided', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      const list = screen.getByRole('list');
      expect(list).toHaveClass('grid-cols-2');
      expect(list).toHaveClass('sm:grid-cols-3');
      expect(list).toHaveClass('md:grid-cols-4');
      expect(list).toHaveClass('lg:grid-cols-5');
    });

    it('allows custom columns configuration', () => {
      render(<EmojiGrid emojis={mockEmojis} columns={{ sm: 2, md: 3, lg: 4 }} />);
      const list = screen.getByRole('list');
      expect(list).toHaveClass('grid-cols-2');
      expect(list).toHaveClass('sm:grid-cols-2');
      expect(list).toHaveClass('md:grid-cols-3');
      expect(list).toHaveClass('lg:grid-cols-4');
    });

    it('applies single column value when columns is a number', () => {
      render(<EmojiGrid emojis={mockEmojis} columns={3} />);
      const list = screen.getByRole('list');
      expect(list).toHaveClass('grid-cols-3');
    });
  });

  describe('accessibility', () => {
    it('has proper list role', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      const list = screen.getByRole('list');
      expect(list).toBeInTheDocument();
    });

    it('has proper aria-label', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'Emoji grid');
    });

    it('allows custom aria-label', () => {
      render(<EmojiGrid emojis={mockEmojis} ariaLabel="Popular emojis" />);
      const list = screen.getByRole('list');
      expect(list).toHaveAttribute('aria-label', 'Popular emojis');
    });

    it('emoji cards have accessible names', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      expect(screen.getByRole('link', { name: /fire/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sparkles/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /skull/i })).toBeInTheDocument();
    });

    it('emoji character has aria-hidden', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const emojiChar = screen.getByText('🔥');
      expect(emojiChar).toHaveAttribute('aria-hidden', 'true');
    });

    it('emoji character has img role', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const emojiChar = screen.getByText('🔥');
      expect(emojiChar).toHaveAttribute('role', 'img');
    });
  });

  describe('edge cases', () => {
    it('handles single emoji', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('Fire')).toBeInTheDocument();
    });

    it('handles many emojis', () => {
      render(<EmojiGrid emojis={manyEmojis} />);
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('🍕')).toBeInTheDocument();
      const items = screen.getAllByRole('listitem');
      expect(items).toHaveLength(10);
    });

    it('handles complex emoji characters', () => {
      const complexEmoji: EmojiSummary[] = [
        {
          slug: 'woman-technologist',
          character: '👩‍💻',
          name: 'Woman Technologist',
          category: 'people',
          tldr: 'Female coder',
        },
      ];
      render(<EmojiGrid emojis={complexEmoji} />);
      expect(screen.getByText('👩‍💻')).toBeInTheDocument();
    });

    it('handles emoji with special characters in name', () => {
      const specialEmoji: EmojiSummary[] = [
        {
          slug: 'face-with-tears-of-joy',
          character: '😂',
          name: 'Face with Tears of Joy',
          category: 'faces',
          tldr: 'Laughing so hard you cry',
        },
      ];
      render(<EmojiGrid emojis={specialEmoji} />);
      expect(screen.getByText('Face with Tears of Joy')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<EmojiGrid emojis={mockEmojis} className="custom-class" />);
      const list = screen.getByRole('list');
      expect(list).toHaveClass('custom-class');
    });

    it('has proper grid gap', () => {
      render(<EmojiGrid emojis={mockEmojis} />);
      const list = screen.getByRole('list');
      expect(list).toHaveClass('gap-3');
    });

    it('renders cards with border styling', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link).toHaveClass('border');
    });

    it('has hover transition classes', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link).toHaveClass('transition-colors');
    });
  });

  describe('dark mode support', () => {
    it('has dark mode classes for hover background', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link).toHaveClass('dark:hover:bg-gray-800');
    });

    it('has dark mode classes for border', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link).toHaveClass('dark:border-gray-700');
    });

    it('has dark mode classes for text', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const nameElement = screen.getByText('Fire');
      expect(nameElement).toHaveClass('dark:text-gray-100');
    });
  });

  describe('compact mode', () => {
    it('uses smaller padding in compact mode', () => {
      render(<EmojiGrid emojis={singleEmoji} compact />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link).toHaveClass('p-2');
    });

    it('uses normal padding by default', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link).toHaveClass('p-4');
    });

    it('uses smaller emoji size in compact mode', () => {
      render(<EmojiGrid emojis={singleEmoji} compact />);
      const emojiChar = screen.getByText('🔥');
      expect(emojiChar).toHaveClass('text-2xl');
    });

    it('uses larger emoji size by default', () => {
      render(<EmojiGrid emojis={singleEmoji} />);
      const emojiChar = screen.getByText('🔥');
      expect(emojiChar).toHaveClass('text-4xl');
    });
  });

  describe('loading state', () => {
    it('renders skeleton cards when loading', () => {
      render(<EmojiGrid emojis={[]} loading skeletonCount={6} />);
      const skeletons = screen.getAllByTestId('emoji-grid-skeleton');
      expect(skeletons).toHaveLength(6);
    });

    it('uses default skeleton count of 8', () => {
      render(<EmojiGrid emojis={[]} loading />);
      const skeletons = screen.getAllByTestId('emoji-grid-skeleton');
      expect(skeletons).toHaveLength(8);
    });

    it('shows emojis when not loading even with loading prop', () => {
      render(<EmojiGrid emojis={mockEmojis} loading={false} />);
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('hides emojis when loading', () => {
      render(<EmojiGrid emojis={mockEmojis} loading />);
      expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    });
  });
});
