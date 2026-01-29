import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { ProbabilityMeter } from '@/components/interpreter/probability-meter';

afterEach(() => {
  cleanup();
});

describe('ProbabilityMeter', () => {
  describe('rendering', () => {
    it('renders the component with required props', () => {
      render(<ProbabilityMeter value={50} label="Test Label" />);
      expect(screen.getByTestId('probability-meter')).toBeInTheDocument();
    });

    it('displays the label', () => {
      render(<ProbabilityMeter value={50} label="Sarcasm Probability" />);
      expect(screen.getByText('Sarcasm Probability')).toBeInTheDocument();
    });

    it('displays the percentage value', () => {
      render(<ProbabilityMeter value={75} label="Test" />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders the progress bar', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      expect(screen.getByTestId('probability-meter-bar')).toBeInTheDocument();
    });

    it('renders the fill with correct width', () => {
      render(<ProbabilityMeter value={60} label="Test" />);
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveStyle({ width: '60%' });
    });
  });

  describe('color gradient - danger scheme (default)', () => {
    it('applies green color for low values (0-30)', () => {
      render(<ProbabilityMeter value={15} label="Test" />);
      const meter = screen.getByTestId('probability-meter');
      expect(meter).toHaveAttribute('data-color-zone', 'low');
    });

    it('applies green color at threshold (30)', () => {
      render(<ProbabilityMeter value={30} label="Test" />);
      const meter = screen.getByTestId('probability-meter');
      expect(meter).toHaveAttribute('data-color-zone', 'low');
    });

    it('applies yellow color for medium values (31-60)', () => {
      render(<ProbabilityMeter value={45} label="Test" />);
      const meter = screen.getByTestId('probability-meter');
      expect(meter).toHaveAttribute('data-color-zone', 'medium');
    });

    it('applies yellow color at threshold (60)', () => {
      render(<ProbabilityMeter value={60} label="Test" />);
      const meter = screen.getByTestId('probability-meter');
      expect(meter).toHaveAttribute('data-color-zone', 'medium');
    });

    it('applies red color for high values (61-100)', () => {
      render(<ProbabilityMeter value={85} label="Test" />);
      const meter = screen.getByTestId('probability-meter');
      expect(meter).toHaveAttribute('data-color-zone', 'high');
    });

    it('applies correct visual styling for low zone', () => {
      render(<ProbabilityMeter value={20} label="Test" />);
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveClass('bg-green-500');
    });

    it('applies correct visual styling for medium zone', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveClass('bg-yellow-500');
    });

    it('applies correct visual styling for high zone', () => {
      render(<ProbabilityMeter value={80} label="Test" />);
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveClass('bg-red-500');
    });
  });

  describe('color schemes', () => {
    it('uses danger colorScheme by default', () => {
      render(<ProbabilityMeter value={80} label="Test" />);
      const meter = screen.getByTestId('probability-meter');
      expect(meter).toHaveAttribute('data-color-scheme', 'danger');
    });

    it('applies warning colorScheme', () => {
      render(<ProbabilityMeter value={80} label="Test" colorScheme="warning" />);
      const meter = screen.getByTestId('probability-meter');
      expect(meter).toHaveAttribute('data-color-scheme', 'warning');
    });

    it('applies neutral colorScheme', () => {
      render(<ProbabilityMeter value={80} label="Test" colorScheme="neutral" />);
      const meter = screen.getByTestId('probability-meter');
      expect(meter).toHaveAttribute('data-color-scheme', 'neutral');
    });

    it('uses blue colors for neutral scheme', () => {
      render(<ProbabilityMeter value={50} label="Test" colorScheme="neutral" />);
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveClass('bg-blue-500');
    });

    it('uses orange colors for warning scheme', () => {
      render(<ProbabilityMeter value={50} label="Test" colorScheme="warning" />);
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveClass('bg-orange-500');
    });
  });

  describe('animation', () => {
    it('has animation class on fill', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveClass('transition-all');
    });

    it('includes animation duration', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveClass('duration-700');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA role', () => {
      render(<ProbabilityMeter value={50} label="Test Label" />);
      expect(screen.getByRole('meter')).toBeInTheDocument();
    });

    it('has aria-valuenow set to current value', () => {
      render(<ProbabilityMeter value={65} label="Test" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-valuenow', '65');
    });

    it('has aria-valuemin set to 0', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-valuemin', '0');
    });

    it('has aria-valuemax set to 100', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-valuemax', '100');
    });

    it('has aria-label for screen readers', () => {
      render(<ProbabilityMeter value={75} label="Sarcasm" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-label', 'Sarcasm: 75%');
    });

    it('associates label with meter using aria-labelledby', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-labelledby');
    });
  });

  describe('tooltip/description', () => {
    it('renders description when provided', () => {
      render(
        <ProbabilityMeter
          value={50}
          label="Sarcasm"
          description="Indicates how likely the message contains sarcasm"
        />
      );
      expect(
        screen.getByText('Indicates how likely the message contains sarcasm')
      ).toBeInTheDocument();
    });

    it('does not render description element when not provided', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      expect(screen.queryByTestId('probability-meter-description')).not.toBeInTheDocument();
    });

    it('associates description with meter using aria-describedby', () => {
      render(<ProbabilityMeter value={50} label="Test" description="Some description" />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-describedby');
    });
  });

  describe('icon indicator', () => {
    it('shows appropriate icon for low values', () => {
      render(<ProbabilityMeter value={20} label="Test" />);
      const icon = screen.getByTestId('probability-meter-icon');
      expect(icon).toHaveTextContent(/[😊🙂✓]/);
    });

    it('shows appropriate icon for medium values', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      const icon = screen.getByTestId('probability-meter-icon');
      expect(icon).toHaveTextContent(/[😐🤔⚠]/);
    });

    it('shows appropriate icon for high values', () => {
      render(<ProbabilityMeter value={80} label="Test" />);
      const icon = screen.getByTestId('probability-meter-icon');
      expect(icon).toHaveTextContent(/[😬😰⚠]/);
    });
  });

  describe('edge cases', () => {
    it('handles value of 0', () => {
      render(<ProbabilityMeter value={0} label="Test" />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveStyle({ width: '0%' });
    });

    it('handles value of 100', () => {
      render(<ProbabilityMeter value={100} label="Test" />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      const fill = screen.getByTestId('probability-meter-fill');
      expect(fill).toHaveStyle({ width: '100%' });
    });

    it('clamps values below 0 to 0', () => {
      render(<ProbabilityMeter value={-10} label="Test" />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('clamps values above 100 to 100', () => {
      render(<ProbabilityMeter value={150} label="Test" />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('rounds decimal values', () => {
      render(<ProbabilityMeter value={33.7} label="Test" />);
      expect(screen.getByText('34%')).toBeInTheDocument();
    });
  });

  describe('styling and layout', () => {
    it('accepts custom className', () => {
      render(<ProbabilityMeter value={50} label="Test" className="custom-class" />);
      const container = screen.getByTestId('probability-meter');
      expect(container).toHaveClass('custom-class');
    });

    it('has horizontal layout by default', () => {
      render(<ProbabilityMeter value={50} label="Test" />);
      const bar = screen.getByTestId('probability-meter-bar');
      expect(bar).toHaveClass('h-2');
    });

    it('displays label above meter', () => {
      render(<ProbabilityMeter value={50} label="Test Label" />);
      const label = screen.getByText('Test Label');
      expect(label).toHaveClass('text-sm');
    });
  });

  describe('props interface', () => {
    it('accepts all documented props', () => {
      const { container } = render(
        <ProbabilityMeter
          value={75}
          label="Full Props Test"
          description="This is a test description"
          colorScheme="warning"
          className="test-class"
        />
      );
      expect(container).toBeTruthy();
    });
  });
});
