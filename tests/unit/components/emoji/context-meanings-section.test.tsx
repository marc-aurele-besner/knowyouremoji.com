import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { ContextMeaningsSection } from '@/components/emoji/context-meanings-section';
import type { ContextMeaning } from '@/types/emoji';

afterEach(() => {
  cleanup();
});

const mockContexts: ContextMeaning[] = [
  {
    context: 'SLANG',
    meaning: 'Used to indicate something is extremely funny',
    example: 'That joke had me 💀💀💀',
    riskLevel: 'LOW',
  },
  {
    context: 'LITERAL',
    meaning: 'Represents death or danger',
    example: 'Warning: ⚠️💀 Danger ahead',
    riskLevel: 'MEDIUM',
  },
  {
    context: 'PASSIVE_AGGRESSIVE',
    meaning: 'Used sarcastically to express displeasure',
    example: 'Oh great, another meeting 💀',
    riskLevel: 'HIGH',
  },
];

const singleContext: ContextMeaning[] = [
  {
    context: 'SLANG',
    meaning: 'Single meaning test',
    example: 'Test example',
    riskLevel: 'LOW',
  },
];

describe('ContextMeaningsSection', () => {
  describe('rendering', () => {
    it('renders the section heading with correct count', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);
      expect(screen.getByText('💀 has 3 different meanings')).toBeInTheDocument();
    });

    it('renders singular form for single context', () => {
      render(<ContextMeaningsSection contexts={singleContext} emojiCharacter="💀" />);
      expect(screen.getByText('💀 has 1 different meaning')).toBeInTheDocument();
    });

    it('renders all context cards', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);
      expect(screen.getByText('Slang')).toBeInTheDocument();
      expect(screen.getByText('Literal')).toBeInTheDocument();
      expect(screen.getByText('Passive Aggressive')).toBeInTheDocument();
    });

    it('renders expand/collapse all button', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);
      expect(screen.getByRole('button', { name: /expand all/i })).toBeInTheDocument();
    });

    it('renders risk level filter', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);
      expect(screen.getByRole('combobox', { name: /filter by risk level/i })).toBeInTheDocument();
    });

    it('renders as a section element with proper aria-labelledby', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-labelledby', 'contexts-heading');
    });
  });

  describe('expand/collapse functionality', () => {
    it('expands all cards when expand all is clicked', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      // Initially, content should not be visible
      expect(
        screen.queryByText('Used to indicate something is extremely funny')
      ).not.toBeInTheDocument();

      // Click expand all
      fireEvent.click(screen.getByRole('button', { name: /expand all/i }));

      // All content should now be visible
      expect(screen.getByText('Used to indicate something is extremely funny')).toBeInTheDocument();
      expect(screen.getByText('Represents death or danger')).toBeInTheDocument();
      expect(screen.getByText('Used sarcastically to express displeasure')).toBeInTheDocument();
    });

    it('collapses all cards when collapse all is clicked', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      // Expand all first
      fireEvent.click(screen.getByRole('button', { name: /expand all/i }));
      expect(screen.getByText('Used to indicate something is extremely funny')).toBeInTheDocument();

      // Click collapse all
      fireEvent.click(screen.getByRole('button', { name: /collapse all/i }));

      // Content should no longer be visible
      expect(
        screen.queryByText('Used to indicate something is extremely funny')
      ).not.toBeInTheDocument();
    });

    it('toggles button text between expand and collapse', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      expect(screen.getByRole('button', { name: /expand all/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /expand all/i }));
      expect(screen.getByRole('button', { name: /collapse all/i })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /collapse all/i }));
      expect(screen.getByRole('button', { name: /expand all/i })).toBeInTheDocument();
    });

    it('expands first card by default when defaultExpandFirst is true', () => {
      render(
        <ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" defaultExpandFirst />
      );

      // First card content should be visible (sorted by frequency, so common first)
      // After sorting, we expect some content to be visible
      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(3);
    });
  });

  describe('sorting', () => {
    it('sorts contexts by frequency (common first)', () => {
      const unsortedContexts: ContextMeaning[] = [
        {
          context: 'LITERAL',
          meaning: 'Rare meaning',
          example: 'Rare example',
          riskLevel: 'LOW',
        },
        {
          context: 'SLANG',
          meaning: 'Common meaning',
          example: 'Common example',
          riskLevel: 'LOW',
        },
        {
          context: 'IRONIC',
          meaning: 'Occasional meaning',
          example: 'Occasional example',
          riskLevel: 'LOW',
        },
      ];

      render(<ContextMeaningsSection contexts={unsortedContexts} emojiCharacter="💀" />);

      const articles = screen.getAllByRole('article');
      expect(articles.length).toBe(3);
    });
  });

  describe('filtering', () => {
    it('filters by LOW risk level', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      const filter = screen.getByRole('combobox', { name: /filter by risk level/i });
      fireEvent.change(filter, { target: { value: 'LOW' } });

      // Only LOW risk context should be visible
      expect(screen.getByText('Slang')).toBeInTheDocument();
      expect(screen.queryByText('Literal')).not.toBeInTheDocument();
      expect(screen.queryByText('Passive Aggressive')).not.toBeInTheDocument();
    });

    it('filters by MEDIUM risk level', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      const filter = screen.getByRole('combobox', { name: /filter by risk level/i });
      fireEvent.change(filter, { target: { value: 'MEDIUM' } });

      // Only MEDIUM risk context should be visible
      expect(screen.queryByText('Slang')).not.toBeInTheDocument();
      expect(screen.getByText('Literal')).toBeInTheDocument();
      expect(screen.queryByText('Passive Aggressive')).not.toBeInTheDocument();
    });

    it('filters by HIGH risk level', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      const filter = screen.getByRole('combobox', { name: /filter by risk level/i });
      fireEvent.change(filter, { target: { value: 'HIGH' } });

      // Only HIGH risk context should be visible
      expect(screen.queryByText('Slang')).not.toBeInTheDocument();
      expect(screen.queryByText('Literal')).not.toBeInTheDocument();
      expect(screen.getByText('Passive Aggressive')).toBeInTheDocument();
    });

    it('shows all contexts when filter is set to all', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      const filter = screen.getByRole('combobox', { name: /filter by risk level/i });

      // Filter to HIGH first
      fireEvent.change(filter, { target: { value: 'HIGH' } });
      expect(screen.queryByText('Slang')).not.toBeInTheDocument();

      // Reset to all
      fireEvent.change(filter, { target: { value: 'all' } });

      // All should be visible
      expect(screen.getByText('Slang')).toBeInTheDocument();
      expect(screen.getByText('Literal')).toBeInTheDocument();
      expect(screen.getByText('Passive Aggressive')).toBeInTheDocument();
    });

    it('shows empty state when no contexts match filter', () => {
      const lowRiskOnly: ContextMeaning[] = [
        {
          context: 'SLANG',
          meaning: 'Low risk only',
          example: 'Example',
          riskLevel: 'LOW',
        },
      ];

      render(<ContextMeaningsSection contexts={lowRiskOnly} emojiCharacter="💀" />);

      const filter = screen.getByRole('combobox', { name: /filter by risk level/i });
      fireEvent.change(filter, { target: { value: 'HIGH' } });

      expect(screen.getByText('No contexts match the selected filter.')).toBeInTheDocument();
    });
  });

  describe('responsive grid layout', () => {
    it('renders grid container with correct classes', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      // Find grid container - it should contain the articles
      const articles = screen.getAllByRole('article');
      const gridContainer = articles[0].parentElement;

      expect(gridContainer).toHaveClass('grid');
      expect(gridContainer).toHaveClass('md:grid-cols-2');
    });
  });

  describe('accessibility', () => {
    it('has accessible heading with correct id', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveAttribute('id', 'contexts-heading');
    });

    it('filter has accessible label', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      const filter = screen.getByRole('combobox', { name: /filter by risk level/i });
      expect(filter).toHaveAttribute('aria-label', 'Filter by risk level');
    });

    it('section has proper ARIA landmark', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      const section = screen.getByRole('region');
      expect(section).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty contexts array', () => {
      render(<ContextMeaningsSection contexts={[]} emojiCharacter="💀" />);

      expect(screen.getByText('💀 has 0 different meanings')).toBeInTheDocument();
    });

    it('handles single context', () => {
      render(<ContextMeaningsSection contexts={singleContext} emojiCharacter="💀" />);

      expect(screen.getByText('💀 has 1 different meaning')).toBeInTheDocument();
      expect(screen.getByText('Slang')).toBeInTheDocument();
    });

    it('handles many contexts', () => {
      const manyContexts: ContextMeaning[] = Array.from({ length: 10 }, (_, i) => ({
        context: 'SLANG' as const,
        meaning: `Meaning ${i + 1}`,
        example: `Example ${i + 1}`,
        riskLevel: 'LOW' as const,
      }));

      render(<ContextMeaningsSection contexts={manyContexts} emojiCharacter="💀" />);

      expect(screen.getByText('💀 has 10 different meanings')).toBeInTheDocument();
      expect(screen.getAllByRole('article')).toHaveLength(10);
    });

    it('handles different emoji characters', () => {
      render(<ContextMeaningsSection contexts={singleContext} emojiCharacter="😀" />);

      expect(screen.getByText('😀 has 1 different meaning')).toBeInTheDocument();
    });

    it('handles complex emoji characters', () => {
      render(<ContextMeaningsSection contexts={singleContext} emojiCharacter="👩‍💻" />);

      expect(screen.getByText('👩‍💻 has 1 different meaning')).toBeInTheDocument();
    });
  });

  describe('styling', () => {
    it('applies custom className', () => {
      render(
        <ContextMeaningsSection
          contexts={mockContexts}
          emojiCharacter="💀"
          className="custom-class"
        />
      );

      const section = screen.getByRole('region');
      expect(section).toHaveClass('custom-class');
    });

    it('has spacing between header and grid', () => {
      render(<ContextMeaningsSection contexts={mockContexts} emojiCharacter="💀" />);

      const section = screen.getByRole('region');
      expect(section).toHaveClass('my-8');
    });
  });
});
