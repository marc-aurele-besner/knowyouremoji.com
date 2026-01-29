import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EmojiCombosSection, type ComboWithEmoji } from '@/components/emoji/emoji-combos-section';

afterEach(() => {
  cleanup();
});

const mockCombos: ComboWithEmoji[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'So funny I died',
  },
  {
    slug: 'skull-fire',
    combo: '💀🔥',
    name: 'Skull Fire',
    meaning: 'Deadly hot',
  },
  {
    slug: 'skull-heart',
    combo: '💀❤️',
    name: 'Skull Heart',
    meaning: 'Love to death',
  },
];

const singleCombo: ComboWithEmoji[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'So funny I died',
  },
];

const manyCombos: ComboWithEmoji[] = [
  { slug: 'combo-1', combo: '💀😂', name: 'Combo 1', meaning: 'Meaning 1' },
  { slug: 'combo-2', combo: '💀🔥', name: 'Combo 2', meaning: 'Meaning 2' },
  { slug: 'combo-3', combo: '💀😭', name: 'Combo 3', meaning: 'Meaning 3' },
  { slug: 'combo-4', combo: '💀❤️', name: 'Combo 4', meaning: 'Meaning 4' },
  { slug: 'combo-5', combo: '💀✨', name: 'Combo 5', meaning: 'Meaning 5' },
  { slug: 'combo-6', combo: '💀🎉', name: 'Combo 6', meaning: 'Meaning 6' },
];

describe('EmojiCombosSection', () => {
  describe('rendering', () => {
    it('renders the section heading with "Combos with this Emoji" title', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Combos with this Emoji');
    });

    it('renders all combo cards', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('💀🔥')).toBeInTheDocument();
      expect(screen.getByText('💀❤️')).toBeInTheDocument();
    });

    it('renders combo names', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByText('Dead Laughing')).toBeInTheDocument();
      expect(screen.getByText('Skull Fire')).toBeInTheDocument();
      expect(screen.getByText('Skull Heart')).toBeInTheDocument();
    });

    it('renders combo meanings', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByText('So funny I died')).toBeInTheDocument();
      expect(screen.getByText('Deadly hot')).toBeInTheDocument();
      expect(screen.getByText('Love to death')).toBeInTheDocument();
    });

    it('renders as a section element with proper aria-labelledby', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'emoji-combos-heading');
    });

    it('returns null when combos array is empty', () => {
      const { container } = render(<EmojiCombosSection combos={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('links', () => {
    it('renders links to combo detail pages', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link).toHaveAttribute('href', '/combo/skull-laughing');
    });

    it('each combo card is a link', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });

    it('links have correct href for each combo', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('link', { name: /dead laughing/i })).toHaveAttribute(
        'href',
        '/combo/skull-laughing'
      );
      expect(screen.getByRole('link', { name: /skull fire/i })).toHaveAttribute(
        'href',
        '/combo/skull-fire'
      );
      expect(screen.getByRole('link', { name: /skull heart/i })).toHaveAttribute(
        'href',
        '/combo/skull-heart'
      );
    });
  });

  describe('collapsible functionality', () => {
    it('renders expand/collapse button', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('button', { name: /combos with this emoji/i })).toBeInTheDocument();
    });

    it('starts expanded by default', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /combos with this emoji/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses content when header button is clicked', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /combos with this emoji/i });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands content when header button is clicked again', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /combos with this emoji/i });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides combos when collapsed', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /combos with this emoji/i });
      fireEvent.click(button);
      expect(screen.queryByText('💀😂')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'emoji-combos-heading');
    });

    it('section has proper ARIA landmark', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('expand button has aria-expanded attribute', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /combos with this emoji/i });
      expect(button).toHaveAttribute('aria-expanded');
    });

    it('combo cards have accessible names', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('link', { name: /dead laughing/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /skull fire/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /skull heart/i })).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles single combo', () => {
      render(<EmojiCombosSection combos={singleCombo} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('Dead Laughing')).toBeInTheDocument();
    });

    it('handles many combos', () => {
      render(<EmojiCombosSection combos={manyCombos} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('💀🎉')).toBeInTheDocument();
    });

    it('handles combo with long meaning', () => {
      const longMeaningCombo: ComboWithEmoji[] = [
        {
          slug: 'test',
          combo: '💀😂',
          name: 'Test Combo',
          meaning:
            'This is a very long meaning that describes what the combo means in various contexts and situations',
        },
      ];
      render(<EmojiCombosSection combos={longMeaningCombo} />);
      expect(
        screen.getByText(
          'This is a very long meaning that describes what the combo means in various contexts and situations'
        )
      ).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<EmojiCombosSection combos={mockCombos} className="custom-class" />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has proper spacing', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('my-8');
    });

    it('renders cards with border styling', () => {
      render(<EmojiCombosSection combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link.closest('.border')).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('uses grid layout for combos', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('has responsive grid columns', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });
  });

  describe('dark mode support', () => {
    it('has dark mode classes for card background', () => {
      render(<EmojiCombosSection combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link.closest('.border')).toHaveClass('dark:bg-card');
    });

    it('has dark mode classes for text', () => {
      render(<EmojiCombosSection combos={singleCombo} />);
      const nameElement = screen.getByText('Dead Laughing');
      expect(nameElement).toHaveClass('dark:text-gray-100');
    });
  });

  describe('icons', () => {
    it('renders combo icon in the heading', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByTestId('combo-icon')).toBeInTheDocument();
    });

    it('renders chevron up icon when expanded', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('renders chevron down icon when collapsed', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /combos with this emoji/i });
      fireEvent.click(button);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });

  describe('hover effects', () => {
    it('card has hover transition classes', () => {
      render(<EmojiCombosSection combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link.closest('.border')).toHaveClass('transition-all');
    });
  });
});
