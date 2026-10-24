import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { RelatedCombosSection, type RelatedCombo } from '@/components/combo/related-combos-section';

afterEach(() => {
  cleanup();
});

const mockRelatedCombos: RelatedCombo[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'So funny I died',
  },
  {
    slug: 'fire-100',
    combo: '🔥💯',
    name: 'Fire Hundred',
    meaning: 'Absolutely perfect',
  },
  {
    slug: 'cry-laugh',
    combo: '😭😂',
    name: 'Cry Laugh',
    meaning: 'Laughing so hard crying',
  },
];

const singleCombo: RelatedCombo[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'So funny I died',
  },
];

const manyCombos: RelatedCombo[] = [
  { slug: 'combo-1', combo: '💀😂', name: 'Combo 1', meaning: 'Meaning 1' },
  { slug: 'combo-2', combo: '🔥💯', name: 'Combo 2', meaning: 'Meaning 2' },
  { slug: 'combo-3', combo: '😭😂', name: 'Combo 3', meaning: 'Meaning 3' },
  { slug: 'combo-4', combo: '❤️🔥', name: 'Combo 4', meaning: 'Meaning 4' },
  { slug: 'combo-5', combo: '✨🎉', name: 'Combo 5', meaning: 'Meaning 5' },
  { slug: 'combo-6', combo: '🌈⭐', name: 'Combo 6', meaning: 'Meaning 6' },
];

describe('RelatedCombosSection', () => {
  describe('rendering', () => {
    it('renders the section heading with "Related Combos" title', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Related Combos');
    });

    it('renders all combo cards', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('🔥💯')).toBeInTheDocument();
      expect(screen.getByText('😭😂')).toBeInTheDocument();
    });

    it('renders combo names', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.getByText('Dead Laughing')).toBeInTheDocument();
      expect(screen.getByText('Fire Hundred')).toBeInTheDocument();
      expect(screen.getByText('Cry Laugh')).toBeInTheDocument();
    });

    it('renders combo meanings', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.getByText('So funny I died')).toBeInTheDocument();
      expect(screen.getByText('Absolutely perfect')).toBeInTheDocument();
      expect(screen.getByText('Laughing so hard crying')).toBeInTheDocument();
    });

    it('renders as a section element with proper aria-labelledby', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'related-combos-heading');
    });

    it('returns null when combos array is empty', () => {
      const { container } = render(<RelatedCombosSection combos={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('links', () => {
    it('renders links to combo detail pages', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link).toHaveAttribute('href', '/combo/skull-laughing');
    });

    it('each combo card is a link', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });

    it('links have correct href for each combo', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.getByRole('link', { name: /dead laughing/i })).toHaveAttribute(
        'href',
        '/combo/skull-laughing'
      );
      expect(screen.getByRole('link', { name: /fire hundred/i })).toHaveAttribute(
        'href',
        '/combo/fire-100'
      );
      expect(screen.getByRole('link', { name: /cry laugh/i })).toHaveAttribute(
        'href',
        '/combo/cry-laugh'
      );
    });
  });

  describe('collapsible functionality', () => {
    it('renders expand/collapse button', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.getByRole('button', { name: /related combos/i })).toBeInTheDocument();
    });

    it('starts expanded by default', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses content when header button is clicked', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands content when header button is clicked again', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides combos when collapsed', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      fireEvent.click(button);
      expect(screen.queryByText('💀😂')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'related-combos-heading');
    });

    it('section has proper ARIA landmark', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('expand button has aria-expanded attribute', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      expect(button).toHaveAttribute('aria-expanded');
    });

    it('combo cards have accessible names', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.getByRole('link', { name: /dead laughing/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /fire hundred/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /cry laugh/i })).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles single combo', () => {
      render(<RelatedCombosSection combos={singleCombo} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('Dead Laughing')).toBeInTheDocument();
    });

    it('handles many combos', () => {
      render(<RelatedCombosSection combos={manyCombos} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('🌈⭐')).toBeInTheDocument();
    });

    it('handles combo with long meaning', () => {
      const longMeaningCombo: RelatedCombo[] = [
        {
          slug: 'test',
          combo: '💀😂',
          name: 'Test Combo',
          meaning:
            'This is a very long meaning that describes what the combo means in various contexts and situations',
        },
      ];
      render(<RelatedCombosSection combos={longMeaningCombo} />);
      expect(
        screen.getByText(
          'This is a very long meaning that describes what the combo means in various contexts and situations'
        )
      ).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} className="custom-class" />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has proper spacing', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('mt-14');
    });

    it('renders cards with border styling', () => {
      render(<RelatedCombosSection combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link.closest('.border')).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('uses grid layout for combos', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('has responsive grid columns', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('sm:grid-cols-[repeat(auto-fill,minmax(250px,1fr))]');
    });
  });

  describe('theme tokens', () => {
    it('uses the card surface token for the card background', () => {
      render(<RelatedCombosSection combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link).toHaveClass('bg-card');
      expect(link).toHaveClass('border-card-border');
    });

    it('renders the combo name as a heading', () => {
      render(<RelatedCombosSection combos={singleCombo} />);
      expect(screen.getByRole('heading', { level: 3, name: 'Dead Laughing' })).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('renders a plain section heading without a decorative icon', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.queryByTestId('link-icon')).toBeNull();
      expect(screen.getByRole('heading', { level: 2, name: 'Related Combos' })).toBeInTheDocument();
    });

    it('renders chevron up icon when expanded', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('renders chevron down icon when collapsed', () => {
      render(<RelatedCombosSection combos={mockRelatedCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      fireEvent.click(button);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });

  describe('hover effects', () => {
    it('card has hover transition classes', () => {
      render(<RelatedCombosSection combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link.className).toContain('hover:shadow-soft');
    });
  });
});
