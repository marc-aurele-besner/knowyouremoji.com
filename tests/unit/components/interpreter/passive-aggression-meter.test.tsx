import { describe, it, expect, afterEach } from 'bun:test';
import { render, screen, cleanup, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  describe('tooltip with patterns', () => {
    it('has cursor-help on wrapper for tooltip indication', () => {
      render(<PassiveAggressionMeter value={50} />);
      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      expect(wrapper).toHaveClass('cursor-help');
    });

    it('shows tooltip on hover', async () => {
      const user = userEvent.setup();
      render(<PassiveAggressionMeter value={50} />);

      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      await user.hover(wrapper);

      await waitFor(() => {
        expect(screen.getByTestId('passive-aggression-tooltip')).toBeInTheDocument();
      });
    });

    it('displays common patterns heading in tooltip', async () => {
      const user = userEvent.setup();
      render(<PassiveAggressionMeter value={50} />);

      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      await user.hover(wrapper);

      await waitFor(() => {
        expect(screen.getByText('Common Passive-Aggressive Patterns:')).toBeInTheDocument();
      });
    });

    it('displays thumbs up pattern in tooltip', async () => {
      const user = userEvent.setup();
      render(<PassiveAggressionMeter value={50} />);

      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      await user.hover(wrapper);

      await waitFor(() => {
        expect(screen.getByText('Thumbs up alone as response')).toBeInTheDocument();
      });
    });

    it('displays k. pattern in tooltip', async () => {
      const user = userEvent.setup();
      render(<PassiveAggressionMeter value={50} />);

      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      await user.hover(wrapper);

      await waitFor(() => {
        expect(screen.getByText('"k" vs "okay" vs "ok"')).toBeInTheDocument();
      });
    });

    it('displays Fine/Whatever pattern in tooltip', async () => {
      const user = userEvent.setup();
      render(<PassiveAggressionMeter value={50} />);

      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      await user.hover(wrapper);

      await waitFor(() => {
        expect(screen.getByText('"Fine" or "Whatever" type responses')).toBeInTheDocument();
      });
    });

    it('displays excessive smiling pattern in tooltip', async () => {
      const user = userEvent.setup();
      render(<PassiveAggressionMeter value={50} />);

      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      await user.hover(wrapper);

      await waitFor(() => {
        expect(screen.getByText('Excessive smiling with negative text')).toBeInTheDocument();
      });
    });

    it('displays period after short message pattern in tooltip', async () => {
      const user = userEvent.setup();
      render(<PassiveAggressionMeter value={50} />);

      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      await user.hover(wrapper);

      await waitFor(() => {
        expect(screen.getByText('Period after short message')).toBeInTheDocument();
      });
    });

    it('hides tooltip on unhover', async () => {
      const user = userEvent.setup();
      render(<PassiveAggressionMeter value={50} />);

      const wrapper = screen.getByTestId('passive-aggression-meter-wrapper');
      await user.hover(wrapper);

      await waitFor(() => {
        expect(screen.getByTestId('passive-aggression-tooltip')).toBeInTheDocument();
      });

      await user.unhover(wrapper);

      await waitFor(() => {
        expect(screen.queryByTestId('passive-aggression-tooltip')).not.toBeInTheDocument();
      });
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
