import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { PassiveAggressionMeter } from '@/components/interpreter/passive-aggression-meter';

afterEach(() => {
  cleanup();
});

describe('PassiveAggressionMeter', () => {
  describe('rendering', () => {
    it('renders the component', () => {
      render(<PassiveAggressionMeter value={50} />);
      expect(screen.getByTestId('passive-aggression-meter-wrapper')).toBeInTheDocument();
    });

    it('renders with default testId', () => {
      render(<PassiveAggressionMeter value={50} />);
      expect(screen.getByTestId('passive-aggression-meter')).toBeInTheDocument();
    });

    it('renders with custom testId', () => {
      render(<PassiveAggressionMeter value={50} testId="custom-meter" />);
      expect(screen.getByTestId('custom-meter')).toBeInTheDocument();
    });

    it('displays the label "Passive-Aggression"', () => {
      render(<PassiveAggressionMeter value={50} />);
      expect(screen.getByText('Passive-Aggression')).toBeInTheDocument();
    });

    it('displays the percentage value', () => {
      render(<PassiveAggressionMeter value={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('contextual descriptions', () => {
    it('displays low likelihood description for values 0-30', () => {
      render(<PassiveAggressionMeter value={20} />);
      expect(
        screen.getByText('Low likelihood of passive-aggressive undertones')
      ).toBeInTheDocument();
    });

    it('displays medium likelihood description for values 31-60', () => {
      render(<PassiveAggressionMeter value={45} />);
      expect(
        screen.getByText('Some passive-aggressive patterns may be present')
      ).toBeInTheDocument();
    });

    it('displays high likelihood description for values 61-100', () => {
      render(<PassiveAggressionMeter value={85} />);
      expect(
        screen.getByText('High likelihood of passive-aggressive communication')
      ).toBeInTheDocument();
    });

    it('displays low description at threshold (30)', () => {
      render(<PassiveAggressionMeter value={30} />);
      expect(
        screen.getByText('Low likelihood of passive-aggressive undertones')
      ).toBeInTheDocument();
    });

    it('displays medium description at threshold (60)', () => {
      render(<PassiveAggressionMeter value={60} />);
      expect(
        screen.getByText('Some passive-aggressive patterns may be present')
      ).toBeInTheDocument();
    });
  });

  describe('color coding', () => {
    it('shows green for low values (safe)', () => {
      render(<PassiveAggressionMeter value={20} />);
      const meter = screen.getByTestId('passive-aggression-meter');
      expect(meter).toHaveAttribute('data-color-zone', 'low');
    });

    it('shows yellow for medium values (caution)', () => {
      render(<PassiveAggressionMeter value={50} />);
      const meter = screen.getByTestId('passive-aggression-meter');
      expect(meter).toHaveAttribute('data-color-zone', 'medium');
    });

    it('shows red for high values (high)', () => {
      render(<PassiveAggressionMeter value={80} />);
      const meter = screen.getByTestId('passive-aggression-meter');
      expect(meter).toHaveAttribute('data-color-zone', 'high');
    });
  });

  describe('tooltip structure', () => {
    it('has cursor-help on wrapper for tooltip indication', () => {
      render(<PassiveAggressionMeter value={50} />);
      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      expect(wrapper).toHaveClass('cursor-help');
    });

    it('wraps meter in TooltipTrigger for hover interaction', () => {
      render(<PassiveAggressionMeter value={50} />);
      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      // The wrapper should be present and contain the meter
      expect(wrapper).toBeInTheDocument();
      const meter = screen.getByTestId('passive-aggression-meter');
      expect(wrapper.contains(meter)).toBe(true);
    });
  });

  describe('styling and layout', () => {
    it('accepts custom className', () => {
      render(<PassiveAggressionMeter value={50} className="custom-class" />);
      const meter = screen.getByTestId('passive-aggression-meter');
      expect(meter).toHaveClass('custom-class');
    });
  });

  describe('edge cases', () => {
    it('handles value of 0', () => {
      render(<PassiveAggressionMeter value={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(
        screen.getByText('Low likelihood of passive-aggressive undertones')
      ).toBeInTheDocument();
    });

    it('handles value of 100', () => {
      render(<PassiveAggressionMeter value={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(
        screen.getByText('High likelihood of passive-aggressive communication')
      ).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA role on meter', () => {
      render(<PassiveAggressionMeter value={50} />);
      expect(screen.getByRole('meter')).toBeInTheDocument();
    });

    it('has aria-valuenow set correctly', () => {
      render(<PassiveAggressionMeter value={65} />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-valuenow', '65');
    });

    it('has aria-label for screen readers', () => {
      render(<PassiveAggressionMeter value={75} />);
      const meter = screen.getByRole('meter');
      expect(meter).toHaveAttribute('aria-label', 'Passive-Aggression: 75%');
    });
  });
});
