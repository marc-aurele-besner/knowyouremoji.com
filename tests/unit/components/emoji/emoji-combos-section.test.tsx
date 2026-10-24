import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
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
    it('renders the default section heading', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Combos with this emoji');
    });

    it('renders a custom title', () => {
      render(<EmojiCombosSection combos={mockCombos} title="Combos with 💀" />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Combos with 💀');
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
      expect(screen.getByRole('region')).toHaveAttribute('aria-labelledby', 'emoji-combos-heading');
    });

    it('returns null when combos array is empty', () => {
      const { container } = render(<EmojiCombosSection combos={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('links', () => {
    it('renders one link per combo', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getAllByRole('link')).toHaveLength(3);
    });

    it('links have correct href for each combo', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('link', { name: 'Dead Laughing combo' })).toHaveAttribute(
        'href',
        '/combo/skull-laughing'
      );
      expect(screen.getByRole('link', { name: 'Skull Fire combo' })).toHaveAttribute(
        'href',
        '/combo/skull-fire'
      );
      expect(screen.getByRole('link', { name: 'Skull Heart combo' })).toHaveAttribute(
        'href',
        '/combo/skull-heart'
      );
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveAttribute(
        'id',
        'emoji-combos-heading'
      );
    });

    it('combo names are level-3 headings', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getAllByRole('heading', { level: 3 })).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    it('handles single combo', () => {
      render(<EmojiCombosSection combos={singleCombo} />);
      expect(screen.getByText('Dead Laughing')).toBeInTheDocument();
    });

    it('handles many combos', () => {
      render(<EmojiCombosSection combos={manyCombos} />);
      expect(screen.getAllByRole('link')).toHaveLength(6);
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<EmojiCombosSection combos={mockCombos} className="custom-class" />);
      expect(screen.getByRole('region')).toHaveClass('custom-class');
    });

    it('has section spacing', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('region')).toHaveClass('mt-14');
    });

    it('renders cards in a grid with card styling', () => {
      render(<EmojiCombosSection combos={mockCombos} />);
      expect(screen.getByRole('list')).toHaveClass('grid');
      expect(screen.getByRole('link', { name: 'Dead Laughing combo' })).toHaveClass(
        'rounded-2xl',
        'border-card-border',
        'bg-card'
      );
    });
  });
});
