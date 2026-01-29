import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { RedFlagSection } from '@/components/interpreter/red-flag-section';
import type { RedFlag } from '@/types';

afterEach(() => {
  cleanup();
});

const mockFlags: RedFlag[] = [
  {
    type: 'manipulation',
    description: 'This message shows signs of manipulative behavior.',
    severity: 'high',
  },
  {
    type: 'passive_aggression',
    description: 'The message contains passive-aggressive undertones.',
    severity: 'medium',
  },
  {
    type: 'mixed_signals',
    description: 'The tone and content do not align.',
    severity: 'low',
  },
];

const mockFlagsSingleHigh: RedFlag[] = [
  {
    type: 'gaslighting',
    description: 'This message shows gaslighting patterns.',
    severity: 'high',
  },
];

describe('RedFlagSection', () => {
  describe('rendering', () => {
    it('renders the section', () => {
      render(<RedFlagSection flags={mockFlags} />);
      expect(screen.getByTestId('red-flag-section')).toBeInTheDocument();
    });

    it('renders section header with title', () => {
      render(<RedFlagSection flags={mockFlags} />);
      expect(screen.getByRole('heading', { name: /red flags/i })).toBeInTheDocument();
    });

    it('renders warning icon in header', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const header = screen.getByRole('heading', { name: /red flags/i });
      expect(header.parentElement?.textContent).toContain('⚠️');
    });

    it('renders all flags', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const badges = screen.getAllByTestId('red-flag-badge');
      expect(badges).toHaveLength(3);
    });

    it('displays flag count', () => {
      render(<RedFlagSection flags={mockFlags} />);
      expect(screen.getByTestId('flag-count')).toHaveTextContent('3');
    });
  });

  describe('empty state', () => {
    it('does not render when flags array is empty', () => {
      render(<RedFlagSection flags={[]} />);
      expect(screen.queryByTestId('red-flag-section')).not.toBeInTheDocument();
    });

    it('returns null for empty array', () => {
      const { container } = render(<RedFlagSection flags={[]} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('flag ordering', () => {
    it('sorts flags by severity (high first)', () => {
      const shuffledFlags: RedFlag[] = [mockFlags[2], mockFlags[0], mockFlags[1]];
      render(<RedFlagSection flags={shuffledFlags} />);
      const badges = screen.getAllByTestId('red-flag-badge');
      // High severity should be first
      expect(badges[0]).toHaveClass('border-red-500');
      // Medium severity should be second
      expect(badges[1]).toHaveClass('border-yellow-500');
      // Low severity should be last
      expect(badges[2]).toHaveClass('border-blue-500');
    });
  });

  describe('resources functionality', () => {
    it('shows resources section when showResources is true', () => {
      render(<RedFlagSection flags={mockFlags} showResources />);
      expect(screen.getByTestId('resources-section')).toBeInTheDocument();
    });

    it('hides resources section when showResources is false', () => {
      render(<RedFlagSection flags={mockFlags} showResources={false} />);
      expect(screen.queryByTestId('resources-section')).not.toBeInTheDocument();
    });

    it('shows resources section by default when high severity flags present', () => {
      render(<RedFlagSection flags={mockFlagsSingleHigh} />);
      expect(screen.getByTestId('resources-section')).toBeInTheDocument();
    });

    it('includes helpful resources heading', () => {
      render(<RedFlagSection flags={mockFlags} showResources />);
      expect(screen.getByText(/helpful resources/i)).toBeInTheDocument();
    });
  });

  describe('expandable flags', () => {
    it('makes flags expandable when expandable prop is true', () => {
      render(<RedFlagSection flags={mockFlags} expandable />);
      const expandButtons = screen.getAllByRole('button', { name: /expand|more|details/i });
      expect(expandButtons.length).toBeGreaterThan(0);
    });

    it('expand all button expands all flags', () => {
      render(<RedFlagSection flags={mockFlags} expandable />);
      const expandAllButton = screen.getByRole('button', { name: /expand all/i });
      fireEvent.click(expandAllButton);

      const badges = screen.getAllByTestId('red-flag-badge');
      badges.forEach((badge) => {
        expect(badge).toHaveAttribute('data-expanded', 'true');
      });
    });

    it('collapse all button collapses all flags', () => {
      render(<RedFlagSection flags={mockFlags} expandable />);
      // First expand all
      const expandAllButton = screen.getByRole('button', { name: /expand all/i });
      fireEvent.click(expandAllButton);

      // Then collapse all
      const collapseAllButton = screen.getByRole('button', { name: /collapse all/i });
      fireEvent.click(collapseAllButton);

      const badges = screen.getAllByTestId('red-flag-badge');
      badges.forEach((badge) => {
        expect(badge).toHaveAttribute('data-expanded', 'false');
      });
    });
  });

  describe('compact mode', () => {
    it('renders flags in compact mode when compact prop is true', () => {
      render(<RedFlagSection flags={mockFlags} compact />);
      const badges = screen.getAllByTestId('red-flag-badge');
      badges.forEach((badge) => {
        expect(badge).toHaveAttribute('data-compact', 'true');
      });
    });

    it('uses horizontal layout in compact mode', () => {
      render(<RedFlagSection flags={mockFlags} compact />);
      const section = screen.getByTestId('red-flag-section');
      const flagsContainer = section.querySelector('[data-testid="flags-container"]');
      expect(flagsContainer).toHaveClass('flex-row');
    });

    it('uses vertical layout in normal mode', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const section = screen.getByTestId('red-flag-section');
      const flagsContainer = section.querySelector('[data-testid="flags-container"]');
      expect(flagsContainer).toHaveClass('flex-col');
    });
  });

  describe('severity summary', () => {
    it('shows severity summary when multiple flags', () => {
      render(<RedFlagSection flags={mockFlags} />);
      expect(screen.getByTestId('severity-summary')).toBeInTheDocument();
    });

    it('displays count of high severity flags', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const summary = screen.getByTestId('severity-summary');
      expect(summary).toHaveTextContent(/1 high/i);
    });

    it('displays count of medium severity flags', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const summary = screen.getByTestId('severity-summary');
      expect(summary).toHaveTextContent(/1 medium/i);
    });

    it('displays count of low severity flags', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const summary = screen.getByTestId('severity-summary');
      expect(summary).toHaveTextContent(/1 low/i);
    });

    it('does not show severity summary for single flag', () => {
      render(<RedFlagSection flags={mockFlagsSingleHigh} />);
      expect(screen.queryByTestId('severity-summary')).not.toBeInTheDocument();
    });
  });

  describe('styling and layout', () => {
    it('accepts custom className', () => {
      render(<RedFlagSection flags={mockFlags} className="custom-class" />);
      const section = screen.getByTestId('red-flag-section');
      expect(section).toHaveClass('custom-class');
    });

    it('has proper spacing between flags', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const flagsContainer = screen.getByTestId('flags-container');
      expect(flagsContainer).toHaveClass('space-y-3');
    });

    it('applies animation class', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const section = screen.getByTestId('red-flag-section');
      expect(section).toHaveClass('animate-fadeIn');
    });
  });

  describe('accessibility', () => {
    it('has proper section role', () => {
      render(<RedFlagSection flags={mockFlags} />);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('has accessible label for the section', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const section = screen.getByRole('region');
      expect(section).toHaveAttribute('aria-label', expect.stringMatching(/red flags/i));
    });

    it('heading has correct level', () => {
      render(<RedFlagSection flags={mockFlags} />);
      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('flag count is announced to screen readers', () => {
      render(<RedFlagSection flags={mockFlags} />);
      const countEl = screen.getByTestId('flag-count');
      expect(countEl).toHaveAttribute('aria-label', expect.stringMatching(/3.*red flags/i));
    });
  });

  describe('edge cases', () => {
    it('handles single flag', () => {
      render(<RedFlagSection flags={mockFlagsSingleHigh} />);
      const badges = screen.getAllByTestId('red-flag-badge');
      expect(badges).toHaveLength(1);
    });

    it('handles many flags', () => {
      const manyFlags: RedFlag[] = Array(10)
        .fill(null)
        .map((_, i) => ({
          type: `flag_${i}`,
          description: `Description ${i}`,
          severity: ['high', 'medium', 'low'][i % 3] as RedFlag['severity'],
        }));
      render(<RedFlagSection flags={manyFlags} />);
      const badges = screen.getAllByTestId('red-flag-badge');
      expect(badges).toHaveLength(10);
    });

    it('handles flags with same severity', () => {
      const sameFlags: RedFlag[] = [
        { type: 'flag_1', description: 'Desc 1', severity: 'high' },
        { type: 'flag_2', description: 'Desc 2', severity: 'high' },
      ];
      render(<RedFlagSection flags={sameFlags} />);
      const badges = screen.getAllByTestId('red-flag-badge');
      expect(badges).toHaveLength(2);
    });
  });
});
