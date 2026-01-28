import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { UsageCounter } from '@/components/rate-limit/usage-counter';

// Mock the rate-limit module
const mockGetRemainingUses = mock(() => 3);
const mockGetMaxUses = mock(() => 3);
const mockGetUsedCount = mock(() => 0);

mock.module('@/lib/rate-limit', () => ({
  getRateLimiter: () => ({
    getRemainingUses: mockGetRemainingUses,
    getMaxUses: mockGetMaxUses,
    getUsedCount: mockGetUsedCount,
    canUse: () => mockGetRemainingUses() > 0,
    recordUse: mock(() => mockGetRemainingUses() - 1),
    reset: mock(() => {}),
  }),
  RateLimiter: class {
    getRemainingUses = mockGetRemainingUses;
    getMaxUses = mockGetMaxUses;
    getUsedCount = mockGetUsedCount;
    canUse = () => mockGetRemainingUses() > 0;
  },
  STORAGE_KEY: 'kye_rate_limit',
  DEFAULT_MAX_USES: 3,
}));

describe('UsageCounter', () => {
  beforeEach(() => {
    mockGetRemainingUses.mockReturnValue(3);
    mockGetMaxUses.mockReturnValue(3);
    mockGetUsedCount.mockReturnValue(0);
  });

  afterEach(() => {
    cleanup();
    mockGetRemainingUses.mockClear();
    mockGetMaxUses.mockClear();
    mockGetUsedCount.mockClear();
  });

  describe('display', () => {
    it('renders the usage counter with remaining uses', () => {
      render(<UsageCounter remaining={2} max={3} />);
      expect(screen.getByText(/2 of 3/)).toBeInTheDocument();
    });

    it('displays "free uses remaining" text', () => {
      render(<UsageCounter remaining={2} max={3} />);
      expect(screen.getByText(/free uses remaining/i)).toBeInTheDocument();
    });

    it('shows full remaining count when no uses recorded', () => {
      render(<UsageCounter remaining={3} max={3} />);
      expect(screen.getByText(/3 of 3/)).toBeInTheDocument();
    });

    it('shows zero remaining when all uses exhausted', () => {
      render(<UsageCounter remaining={0} max={3} />);
      expect(screen.getByText(/0 of 3/)).toBeInTheDocument();
    });

    it('handles custom max uses value', () => {
      render(<UsageCounter remaining={5} max={10} />);
      expect(screen.getByText(/5 of 10/)).toBeInTheDocument();
    });
  });

  describe('visual indicators', () => {
    it('applies warning style when low on uses (1 remaining)', () => {
      render(<UsageCounter remaining={1} max={3} />);
      const counter = screen.getByTestId('usage-counter');
      expect(counter).toHaveClass('text-yellow-600');
    });

    it('applies error style when no uses remaining', () => {
      render(<UsageCounter remaining={0} max={3} />);
      const counter = screen.getByTestId('usage-counter');
      expect(counter).toHaveClass('text-red-600');
    });

    it('applies default style when uses are available', () => {
      render(<UsageCounter remaining={3} max={3} />);
      const counter = screen.getByTestId('usage-counter');
      expect(counter).toHaveClass('text-gray-600');
    });

    it('applies warning style at exactly 1 remaining', () => {
      render(<UsageCounter remaining={1} max={5} />);
      const counter = screen.getByTestId('usage-counter');
      expect(counter).toHaveClass('text-yellow-600');
    });
  });

  describe('accessibility', () => {
    it('has accessible role for screen readers', () => {
      render(<UsageCounter remaining={2} max={3} />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-label describing the usage status', () => {
      render(<UsageCounter remaining={2} max={3} />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-label', '2 of 3 free uses remaining');
    });

    it('updates aria-label when remaining changes', () => {
      const { rerender } = render(<UsageCounter remaining={2} max={3} />);
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        '2 of 3 free uses remaining'
      );

      rerender(<UsageCounter remaining={1} max={3} />);
      expect(screen.getByRole('status')).toHaveAttribute(
        'aria-label',
        '1 of 3 free uses remaining'
      );
    });

    it('uses aria-live polite for status updates', () => {
      render(<UsageCounter remaining={2} max={3} />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('custom className', () => {
    it('accepts and applies custom className', () => {
      render(<UsageCounter remaining={2} max={3} className="custom-class" />);
      const counter = screen.getByTestId('usage-counter');
      expect(counter).toHaveClass('custom-class');
    });

    it('merges custom className with default styles', () => {
      render(<UsageCounter remaining={2} max={3} className="my-custom-class" />);
      const counter = screen.getByTestId('usage-counter');
      expect(counter).toHaveClass('my-custom-class');
      expect(counter).toHaveClass('text-sm');
    });
  });

  describe('compact variant', () => {
    it('renders compact variant with shorter text', () => {
      render(<UsageCounter remaining={2} max={3} variant="compact" />);
      expect(screen.getByText('2/3')).toBeInTheDocument();
    });

    it('does not show "free uses remaining" in compact mode', () => {
      render(<UsageCounter remaining={2} max={3} variant="compact" />);
      expect(screen.queryByText(/free uses remaining/i)).not.toBeInTheDocument();
    });

    it('still applies color styles in compact mode', () => {
      render(<UsageCounter remaining={0} max={3} variant="compact" />);
      const counter = screen.getByTestId('usage-counter');
      expect(counter).toHaveClass('text-red-600');
    });
  });

  describe('default variant', () => {
    it('uses default variant when not specified', () => {
      render(<UsageCounter remaining={2} max={3} />);
      expect(screen.getByText(/free uses remaining/i)).toBeInTheDocument();
    });

    it('explicitly uses default variant', () => {
      render(<UsageCounter remaining={2} max={3} variant="default" />);
      expect(screen.getByText(/free uses remaining/i)).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles zero max uses gracefully', () => {
      render(<UsageCounter remaining={0} max={0} />);
      expect(screen.getByText(/0 of 0/)).toBeInTheDocument();
    });

    it('handles remaining greater than max (should not happen but be safe)', () => {
      render(<UsageCounter remaining={5} max={3} />);
      expect(screen.getByText(/5 of 3/)).toBeInTheDocument();
    });

    it('handles large numbers', () => {
      render(<UsageCounter remaining={999} max={1000} />);
      expect(screen.getByText(/999 of 1000/)).toBeInTheDocument();
    });
  });
});
