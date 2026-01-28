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
    it('renders the section heading with "Related Emojis" title', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Related Emojis');
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

    it('renders emoji tldr descriptions', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByText('Hot, cool, or exciting')).toBeInTheDocument();
      expect(screen.getByText('Magic, excitement, or emphasis')).toBeInTheDocument();
      expect(screen.getByText('Love and affection')).toBeInTheDocument();
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
      const fireLink = screen.getByRole('link', { name: /fire/i });
      expect(fireLink).toHaveAttribute('href', '/emoji/fire');
    });

    it('each emoji card is a link', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
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

  describe('collapsible functionality', () => {
    it('renders expand/collapse button', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByRole('button', { name: /related emojis/i })).toBeInTheDocument();
    });

    it('starts expanded by default', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const button = screen.getByRole('button', { name: /related emojis/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses content when header button is clicked', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const button = screen.getByRole('button', { name: /related emojis/i });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands content when header button is clicked again', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const button = screen.getByRole('button', { name: /related emojis/i });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides emojis when collapsed', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const button = screen.getByRole('button', { name: /related emojis/i });
      fireEvent.click(button);
      expect(screen.queryByText('🔥')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'related-emojis-heading');
    });

    it('section has proper ARIA landmark', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('expand button has aria-expanded attribute', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const button = screen.getByRole('button', { name: /related emojis/i });
      expect(button).toHaveAttribute('aria-expanded');
    });

    it('emoji cards have accessible names', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByRole('link', { name: /fire/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /sparkles/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /red heart/i })).toBeInTheDocument();
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
      const complexEmoji: RelatedEmoji[] = [
        {
          slug: 'woman-technologist',
          character: '👩‍💻',
          name: 'Woman Technologist',
          tldr: 'Female coder',
        },
      ];
      render(<RelatedEmojisSection emojis={complexEmoji} />);
      expect(screen.getByText('👩‍💻')).toBeInTheDocument();
    });

    it('handles emoji with long tldr', () => {
      const longTldrEmoji: RelatedEmoji[] = [
        {
          slug: 'fire',
          character: '🔥',
          name: 'Fire',
          tldr: 'This is a very long description that describes what the fire emoji means in various contexts and situations',
        },
      ];
      render(<RelatedEmojisSection emojis={longTldrEmoji} />);
      expect(
        screen.getByText(
          'This is a very long description that describes what the fire emoji means in various contexts and situations'
        )
      ).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} className="custom-class" />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has proper spacing', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('my-8');
    });

    it('renders cards with border styling', () => {
      render(<RelatedEmojisSection emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link.closest('.border')).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('uses grid layout for emojis', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('has responsive grid columns', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-2');
      expect(gridContainer).toHaveClass('md:grid-cols-3');
      expect(gridContainer).toHaveClass('lg:grid-cols-4');
    });
  });

  describe('dark mode support', () => {
    it('has dark mode classes for card background', () => {
      render(<RelatedEmojisSection emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link.closest('.border')).toHaveClass('dark:bg-card');
    });

    it('has dark mode classes for text', () => {
      render(<RelatedEmojisSection emojis={singleEmoji} />);
      const nameElement = screen.getByText('Fire');
      expect(nameElement).toHaveClass('dark:text-gray-100');
    });
  });

  describe('icons', () => {
    it('renders link icon in the heading', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByTestId('link-icon')).toBeInTheDocument();
    });

    it('renders chevron up icon when expanded', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('renders chevron down icon when collapsed', () => {
      render(<RelatedEmojisSection emojis={mockRelatedEmojis} />);
      const button = screen.getByRole('button', { name: /related emojis/i });
      fireEvent.click(button);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });

  describe('hover effects', () => {
    it('card has hover transition classes', () => {
      render(<RelatedEmojisSection emojis={singleEmoji} />);
      const link = screen.getByRole('link', { name: /fire/i });
      expect(link.closest('.border')).toHaveClass('transition-all');
    });
  });
});
