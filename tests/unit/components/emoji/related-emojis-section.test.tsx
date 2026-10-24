import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RelatedEmojisSection, type RelatedEmoji } from '@/components/emoji/related-emojis-section';

afterEach(() => {
  cleanup();
});

const mockRelatedEmojis: RelatedEmoji[] = [
  {
    slug: 'fire',
    character: '🔥',
    name: 'Fire',
    tldr: 'Hot, cool, or exciting',
  },
  {
    slug: 'sparkles',
    character: '✨',
    name: 'Sparkles',
    tldr: 'Magic, excitement, or emphasis',
  },
  {
    slug: 'heart',
    character: '❤️',
    name: 'Red Heart',
    tldr: 'Love and affection',
  },
];

const singleEmoji: RelatedEmoji[] = [
  {
    slug: 'fire',
    character: '🔥',
    name: 'Fire',
    tldr: 'Hot, cool, or exciting',
  },
];

const manyEmojis: RelatedEmoji[] = [
  { slug: 'fire', character: '🔥', name: 'Fire', tldr: 'Hot' },
  { slug: 'sparkles', character: '✨', name: 'Sparkles', tldr: 'Magic' },
  { slug: 'heart', character: '❤️', name: 'Red Heart', tldr: 'Love' },
  { slug: 'star', character: '⭐', name: 'Star', tldr: 'Great' },
  { slug: 'sun', character: '☀️', name: 'Sun', tldr: 'Bright' },
  { slug: 'moon', character: '🌙', name: 'Moon', tldr: 'Night' },
  { slug: 'cloud', character: '☁️', name: 'Cloud', tldr: 'Sky' },
  { slug: 'rainbow', character: '🌈', name: 'Rainbow', tldr: 'Colorful' },
];

describe('RelatedEmojisSection', () => {
  describe('rendering', () => {
    it('renders the section heading with "Related emojis" title', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Related emojis');
    });

    it('renders all emoji cards', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('✨')).toBeInTheDocument();
      expect(screen.getByText('❤️')).toBeInTheDocument();
    });

    it('renders emoji names', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByText('Fire')).toBeInTheDocument();
      expect(screen.getByText('Sparkles')).toBeInTheDocument();
      expect(screen.getByText('Red Heart')).toBeInTheDocument();
    });

    it('uses the dense card layout (TL;DR hidden)', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.queryByText('Hot, cool, or exciting')).not.toBeInTheDocument();
    });

    it('renders as a section element with proper aria-labelledby', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'related-emojis-heading');
    });

    it('returns null when emojis array is empty', () => {
      const { container } = render(<RelatedEmojisSection emojis={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('links', () => {
    it('renders links to emoji detail pages', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getAllByRole('link')).toHaveLength(3);
    });

    it('links have correct href for each emoji', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByRole('link', { name: /fire/i })).toHaveAttribute('href', '/emoji/fire');
      expect(screen.getByRole('link', { name: /sparkles/i })).toHaveAttribute(
        'href',
        '/emoji/sparkles'
      );
      expect(screen.getByRole('link', { name: /red heart/i })).toHaveAttribute(
        'href',
        '/emoji/heart'
      );
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'related-emojis-heading');
    });

    it('emoji cards have accessible names', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByRole('link', { name: 'Fire emoji' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Sparkles emoji' })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Red Heart emoji' })).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles single emoji', () => {
      render(<RelatedEmojisSection emojis={singleEmoji} />);
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('Fire')).toBeInTheDocument();
    });

    it('handles many emojis', () => {
      render(<RelatedEmojisSection emojis={manyEmojis} />);
      expect(screen.getByText('🔥')).toBeInTheDocument();
      expect(screen.getByText('🌈')).toBeInTheDocument();
    });

    it('handles complex emoji characters', () => {
      const complexEmojis: RelatedEmoji[] = [
        { slug: 'woman-technologist', character: '👩‍💻', name: 'Woman Technologist', tldr: 'Coding' },
      ];
      render(<RelatedEmojisSection emojis={complexEmojis} />);
      expect(screen.getByText('👩‍💻')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} className="custom-class" />);
      expect(screen.getByRole('region')).toHaveClass('custom-class');
    });

    it('has section spacing', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByRole('region')).toHaveClass('mt-14');
    });

    it('renders compact cards in an auto-fill grid', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const list = screen.getByRole('list');
      expect(list).toHaveClass('grid');
      expect(list.className).toContain('minmax(96px,1fr)');
      expect(screen.getByRole('link', { name: /fire/i })).toHaveClass(
        'rounded-2xl',
        'border-card-border',
        'emoji-card-hover'
      );
    });
  });

  describe('click interactions', () => {
    it('fires onClick handler when clicking a related emoji card', () => {
      render(<RelatedEmojisSection emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      // Should not throw — exercises the onClick analytics callback
      fireEvent.click(link);
      expect(link).toBeInTheDocument();
    });
  });
});
