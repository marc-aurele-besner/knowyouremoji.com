import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { EmojiComboList, type EmojiCombo } from '@/components/emoji/emoji-combo-list';

afterEach(() => {
  cleanup();
});

const mockCombos: EmojiCombo[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'Something is so funny you are dead from laughing',
  },
  {
    slug: 'fire-100',
    combo: '🔥💯',
    name: 'Fire Hundred',
    meaning: 'Absolutely perfect or on point',
  },
  {
    slug: 'eyes-lips-eyes',
    combo: '👁️👄👁️',
    name: 'The Look',
    meaning: 'Intense staring or awkward observation',
  },
];

const singleCombo: EmojiCombo[] = [
  {
    slug: 'skull-laughing',
    combo: '💀😂',
    name: 'Dead Laughing',
    meaning: 'Something is so funny you are dead from laughing',
  },
];

const manyCombosList: EmojiCombo[] = [
  { slug: 'combo-1', combo: '😂🔥', name: 'Combo 1', meaning: 'Meaning 1' },
  { slug: 'combo-2', combo: '❤️✨', name: 'Combo 2', meaning: 'Meaning 2' },
  { slug: 'combo-3', combo: '🎉🥳', name: 'Combo 3', meaning: 'Meaning 3' },
  { slug: 'combo-4', combo: '😎👍', name: 'Combo 4', meaning: 'Meaning 4' },
  { slug: 'combo-5', combo: '🤔💭', name: 'Combo 5', meaning: 'Meaning 5' },
  { slug: 'combo-6', combo: '💪🏃', name: 'Combo 6', meaning: 'Meaning 6' },
];

describe('EmojiComboList', () => {
  describe('rendering', () => {
    it('renders the section heading with "Related Combos" title', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Related Combos');
    });

    it('renders all combo items', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('🔥💯')).toBeInTheDocument();
      expect(screen.getByText('👁️👄👁️')).toBeInTheDocument();
    });

    it('renders combo names', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(screen.getByText('Dead Laughing')).toBeInTheDocument();
      expect(screen.getByText('Fire Hundred')).toBeInTheDocument();
      expect(screen.getByText('The Look')).toBeInTheDocument();
    });

    it('renders combo meanings', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(
        screen.getByText('Something is so funny you are dead from laughing')
      ).toBeInTheDocument();
      expect(screen.getByText('Absolutely perfect or on point')).toBeInTheDocument();
      expect(screen.getByText('Intense staring or awkward observation')).toBeInTheDocument();
    });

    it('renders as a section element with proper aria-labelledby', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'related-combos-heading');
    });

    it('returns null when combos array is empty', () => {
      const { container } = render(<EmojiComboList combos={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('links', () => {
    it('renders links to combo detail pages', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const comboLink = screen.getByRole('link', { name: /dead laughing/i });
      expect(comboLink).toHaveAttribute('href', '/combo/skull-laughing');
    });

    it('each combo item is a link', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
    });

    it('links have correct href for each combo', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(screen.getByRole('link', { name: /dead laughing/i })).toHaveAttribute(
        'href',
        '/combo/skull-laughing'
      );
      expect(screen.getByRole('link', { name: /fire hundred/i })).toHaveAttribute(
        'href',
        '/combo/fire-100'
      );
      expect(screen.getByRole('link', { name: /the look/i })).toHaveAttribute(
        'href',
        '/combo/eyes-lips-eyes'
      );
    });
  });

  describe('collapsible functionality', () => {
    it('renders expand/collapse button', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(screen.getByRole('button', { name: /related combos/i })).toBeInTheDocument();
    });

    it('starts expanded by default', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('collapses content when header button is clicked', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'false');
    });

    it('expands content when header button is clicked again', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      fireEvent.click(button);
      fireEvent.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');
    });

    it('hides combos when collapsed', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      fireEvent.click(button);
      expect(screen.queryByText('💀😂')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'related-combos-heading');
    });

    it('section has proper ARIA landmark', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });

    it('expand button has aria-expanded attribute', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      expect(button).toHaveAttribute('aria-expanded');
    });

    it('combo items have accessible names', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(screen.getByRole('link', { name: /dead laughing/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /fire hundred/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /the look/i })).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles single combo', () => {
      render(<EmojiComboList combos={singleCombo} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
      expect(screen.getByText('Dead Laughing')).toBeInTheDocument();
    });

    it('handles many combos', () => {
      render(<EmojiComboList combos={manyCombosList} />);
      expect(screen.getByText('😂🔥')).toBeInTheDocument();
      expect(screen.getByText('💪🏃')).toBeInTheDocument();
    });

    it('handles combo with long meaning', () => {
      const longMeaningCombo: EmojiCombo[] = [
        {
          slug: 'test-combo',
          combo: '🔥😂',
          name: 'Test Combo',
          meaning:
            'This is a very long meaning that describes what this emoji combo represents in various contexts and situations where it might be used',
        },
      ];
      render(<EmojiComboList combos={longMeaningCombo} />);
      expect(
        screen.getByText(
          'This is a very long meaning that describes what this emoji combo represents in various contexts and situations where it might be used'
        )
      ).toBeInTheDocument();
    });

    it('handles combo with complex emoji characters', () => {
      const complexCombo: EmojiCombo[] = [
        {
          slug: 'complex-combo',
          combo: '👨‍👩‍👧‍👦❤️',
          name: 'Family Love',
          meaning: 'Family with love',
        },
      ];
      render(<EmojiComboList combos={complexCombo} />);
      expect(screen.getByText('👨‍👩‍👧‍👦❤️')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(<EmojiComboList combos={mockCombos} className="custom-class" />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has proper spacing', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const section = screen.getByRole('region');
      expect(section).toHaveClass('my-8');
    });

    it('renders items with border styling', () => {
      render(<EmojiComboList combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link.closest('.border')).toBeInTheDocument();
    });
  });

  describe('responsive layout', () => {
    it('uses grid layout for combos', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('has responsive grid columns', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const gridContainer = screen.getByRole('region').querySelector('.grid');
      expect(gridContainer).toHaveClass('grid-cols-1');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });
  });

  describe('dark mode support', () => {
    it('has dark mode classes for card background', () => {
      render(<EmojiComboList combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link.closest('.border')).toHaveClass('dark:bg-card');
    });

    it('has dark mode classes for text', () => {
      render(<EmojiComboList combos={singleCombo} />);
      const nameElement = screen.getByText('Dead Laughing');
      expect(nameElement).toHaveClass('dark:text-gray-100');
    });
  });

  describe('icons', () => {
    it('renders sparkles icon in the heading', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(screen.getByTestId('sparkles-icon')).toBeInTheDocument();
    });

    it('renders chevron up icon when expanded', () => {
      render(<EmojiComboList combos={mockCombos} />);
      expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('renders chevron down icon when collapsed', () => {
      render(<EmojiComboList combos={mockCombos} />);
      const button = screen.getByRole('button', { name: /related combos/i });
      fireEvent.click(button);
      expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });
  });

  describe('hover effects', () => {
    it('card has hover transition classes', () => {
      render(<EmojiComboList combos={singleCombo} />);
      const link = screen.getByRole('link', { name: /dead laughing/i });
      expect(link.closest('.border')).toHaveClass('transition-all');
    });
  });
});
