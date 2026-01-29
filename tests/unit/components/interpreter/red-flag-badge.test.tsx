import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { RedFlagBadge } from '@/components/interpreter/red-flag-badge';
import type { RedFlag } from '@/types';

afterEach(() => {
  cleanup();
});

const mockFlag: RedFlag = {
  type: 'manipulation',
  description: 'This message shows signs of manipulative behavior.',
  severity: 'high',
};

const mockFlagMedium: RedFlag = {
  type: 'passive_aggression',
  description: 'The message contains passive-aggressive undertones.',
  severity: 'medium',
};

const mockFlagLow: RedFlag = {
  type: 'mixed_signals',
  description: 'The tone and content do not align.',
  severity: 'low',
};

describe('RedFlagBadge', () => {
  describe('rendering', () => {
    it('renders the component', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      expect(screen.getByTestId('red-flag-badge')).toBeInTheDocument();
    });

    it('displays the flag type formatted correctly', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      expect(screen.getByText('manipulation')).toBeInTheDocument();
    });

    it('formats flag type with underscores as spaces', () => {
      render(<RedFlagBadge flag={mockFlagMedium} />);
      expect(screen.getByText('passive aggression')).toBeInTheDocument();
    });

    it('displays the severity badge', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      expect(screen.getByTestId('severity-badge')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });

    it('displays medium severity badge', () => {
      render(<RedFlagBadge flag={mockFlagMedium} />);
      expect(screen.getByText('Medium')).toBeInTheDocument();
    });

    it('displays low severity badge', () => {
      render(<RedFlagBadge flag={mockFlagLow} />);
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('displays the description', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      expect(screen.getByText(mockFlag.description)).toBeInTheDocument();
    });

    it('displays warning icon', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  describe('severity styling', () => {
    it('applies red styling for high severity', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveClass('border-red-500');
      expect(badge).toHaveClass('bg-red-50');
    });

    it('applies yellow/orange styling for medium severity', () => {
      render(<RedFlagBadge flag={mockFlagMedium} />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveClass('border-yellow-500');
      expect(badge).toHaveClass('bg-yellow-50');
    });

    it('applies blue styling for low severity', () => {
      render(<RedFlagBadge flag={mockFlagLow} />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveClass('border-blue-500');
      expect(badge).toHaveClass('bg-blue-50');
    });

    it('uses destructive variant badge for high severity', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      const severityBadge = screen.getByTestId('severity-badge');
      expect(severityBadge).toHaveClass('bg-red-100');
    });

    it('uses warning variant badge for medium severity', () => {
      render(<RedFlagBadge flag={mockFlagMedium} />);
      const severityBadge = screen.getByTestId('severity-badge');
      expect(severityBadge).toHaveClass('bg-yellow-100');
    });

    it('uses secondary variant badge for low severity', () => {
      render(<RedFlagBadge flag={mockFlagLow} />);
      const severityBadge = screen.getByTestId('severity-badge');
      expect(severityBadge).toHaveClass('bg-gray-100');
    });
  });

  describe('expandable functionality', () => {
    it('has expandable content when expandable prop is true', () => {
      render(<RedFlagBadge flag={mockFlag} expandable />);
      const expandButton = screen.getByRole('button', { name: /expand|more|details/i });
      expect(expandButton).toBeInTheDocument();
    });

    it('does not show expand button when expandable is false', () => {
      render(<RedFlagBadge flag={mockFlag} expandable={false} />);
      const expandButton = screen.queryByRole('button', { name: /expand|more|details/i });
      expect(expandButton).not.toBeInTheDocument();
    });

    it('toggles expanded state when clicked', () => {
      render(<RedFlagBadge flag={mockFlag} expandable />);
      const expandButton = screen.getByRole('button', { name: /expand|more|details/i });

      // Initially collapsed - description should be truncated or hidden
      expect(screen.getByTestId('red-flag-badge')).toHaveAttribute('data-expanded', 'false');

      fireEvent.click(expandButton);

      expect(screen.getByTestId('red-flag-badge')).toHaveAttribute('data-expanded', 'true');
    });
  });

  describe('resource link', () => {
    it('renders resource link when resourceUrl is provided', () => {
      render(<RedFlagBadge flag={mockFlag} resourceUrl="https://example.com/help" />);
      const link = screen.getByRole('link', { name: /learn more|resource/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com/help');
    });

    it('does not render resource link when resourceUrl is not provided', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      const link = screen.queryByRole('link', { name: /learn more|resource/i });
      expect(link).not.toBeInTheDocument();
    });

    it('opens resource link in new tab', () => {
      render(<RedFlagBadge flag={mockFlag} resourceUrl="https://example.com/help" />);
      const link = screen.getByRole('link', { name: /learn more|resource/i });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('styling and layout', () => {
    it('accepts custom className', () => {
      render(<RedFlagBadge flag={mockFlag} className="custom-class" />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveClass('custom-class');
    });

    it('has rounded border styling', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveClass('rounded-r-lg');
    });

    it('has left border accent', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveClass('border-l-4');
    });
  });

  describe('accessibility', () => {
    it('has proper role for the badge', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });

    it('has accessible label for screen readers', () => {
      render(<RedFlagBadge flag={mockFlag} />);
      const badge = screen.getByRole('alert');
      expect(badge).toHaveAttribute('aria-label');
    });

    it('expand button has accessible label', () => {
      render(<RedFlagBadge flag={mockFlag} expandable />);
      const expandButton = screen.getByRole('button', { name: /expand|more|details/i });
      expect(expandButton).toHaveAccessibleName();
    });
  });

  describe('compact mode', () => {
    it('renders in compact mode when compact prop is true', () => {
      render(<RedFlagBadge flag={mockFlag} compact />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveAttribute('data-compact', 'true');
    });

    it('hides description in compact mode', () => {
      render(<RedFlagBadge flag={mockFlag} compact />);
      expect(screen.queryByText(mockFlag.description)).not.toBeInTheDocument();
    });

    it('shows type and severity in compact mode', () => {
      render(<RedFlagBadge flag={mockFlag} compact />);
      expect(screen.getByText('manipulation')).toBeInTheDocument();
      expect(screen.getByText('High')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles empty type gracefully', () => {
      const emptyTypeFlag: RedFlag = { ...mockFlag, type: '' };
      render(<RedFlagBadge flag={emptyTypeFlag} />);
      expect(screen.getByTestId('red-flag-badge')).toBeInTheDocument();
    });

    it('handles very long description', () => {
      const longDescFlag: RedFlag = { ...mockFlag, description: 'A'.repeat(500) };
      render(<RedFlagBadge flag={longDescFlag} />);
      expect(screen.getByTestId('red-flag-badge')).toBeInTheDocument();
    });

    it('handles type with multiple underscores', () => {
      const multiUnderscoreFlag: RedFlag = { ...mockFlag, type: 'love_bombing_signs' };
      render(<RedFlagBadge flag={multiUnderscoreFlag} />);
      expect(screen.getByText('love bombing signs')).toBeInTheDocument();
    });

    it('handles unknown severity gracefully', () => {
      // Test with an invalid severity to cover default case
      const unknownSeverityFlag = { ...mockFlag, severity: 'unknown' as RedFlag['severity'] };
      render(<RedFlagBadge flag={unknownSeverityFlag} />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveClass('border-gray-500');
      expect(badge).toHaveClass('bg-gray-50');
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('controlled expanded state', () => {
    it('respects controlled isExpanded prop when true', () => {
      render(<RedFlagBadge flag={mockFlag} expandable isExpanded={true} />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveAttribute('data-expanded', 'true');
    });

    it('respects controlled isExpanded prop when false', () => {
      render(<RedFlagBadge flag={mockFlag} expandable isExpanded={false} />);
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveAttribute('data-expanded', 'false');
    });

    it('calls onExpandedChange callback when toggling', () => {
      const mockOnExpandedChange = mock(() => {});
      render(
        <RedFlagBadge
          flag={mockFlag}
          expandable
          isExpanded={false}
          onExpandedChange={mockOnExpandedChange}
        />
      );

      const expandButton = screen.getByRole('button', { name: /expand|more|details/i });
      fireEvent.click(expandButton);

      expect(mockOnExpandedChange).toHaveBeenCalledWith(true);
    });

    it('does not change internal state when controlled', () => {
      const mockOnExpandedChange = mock(() => {});
      render(
        <RedFlagBadge
          flag={mockFlag}
          expandable
          isExpanded={false}
          onExpandedChange={mockOnExpandedChange}
        />
      );

      const expandButton = screen.getByRole('button', { name: /expand|more|details/i });
      fireEvent.click(expandButton);

      // Since it's controlled, the state should stay as the prop value
      const badge = screen.getByTestId('red-flag-badge');
      expect(badge).toHaveAttribute('data-expanded', 'false');
    });

    it('calls onExpandedChange with false when collapsing from expanded', () => {
      const mockOnExpandedChange = mock(() => {});
      render(
        <RedFlagBadge
          flag={mockFlag}
          expandable
          isExpanded={true}
          onExpandedChange={mockOnExpandedChange}
        />
      );

      const collapseButton = screen.getByRole('button', { name: /collapse|details/i });
      fireEvent.click(collapseButton);

      expect(mockOnExpandedChange).toHaveBeenCalledWith(false);
    });
  });
});
