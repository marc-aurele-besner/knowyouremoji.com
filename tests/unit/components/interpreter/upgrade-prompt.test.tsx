import { describe, it, expect, beforeEach, mock, afterEach } from 'bun:test';
import { render, screen, cleanup } from '@testing-library/react';
import { UpgradePrompt } from '@/components/interpreter/upgrade-prompt';

// Mock localStorage
const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string): string | null => store[key] ?? null,
    setItem: (key: string, value: string): void => {
      store[key] = value;
    },
    removeItem: (key: string): void => {
      delete store[key];
    },
    clear: (): void => {
      store = {};
    },
    get length(): number {
      return Object.keys(store).length;
    },
    key: (index: number): string | null => Object.keys(store)[index] ?? null,
  };
};

// Mock useRateLimit hook
const mockUseRateLimit = mock(() => ({
  remaining: 0,
  used: 3,
  maxUses: 3,
  canUse: false,
  isLimited: true,
  resetTime: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now
  recordUse: mock(() => 0),
  reset: mock(() => {}),
}));

// We need to mock the module before importing the component
mock.module('@/hooks/use-rate-limit', () => ({
  useRateLimit: mockUseRateLimit,
}));

describe('UpgradePrompt', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    globalThis.localStorage = localStorageMock;
    mockUseRateLimit.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering when limited', () => {
    beforeEach(() => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));
    });

    it('should render the upgrade prompt when rate limited', () => {
      render(<UpgradePrompt />);

      expect(screen.getByTestId('upgrade-prompt')).toBeInTheDocument();
    });

    it('should display "Daily Limit Reached" heading', () => {
      render(<UpgradePrompt />);

      expect(screen.getByRole('heading', { name: /daily limit reached/i })).toBeInTheDocument();
    });

    it('should display usage message', () => {
      render(<UpgradePrompt />);

      expect(screen.getByText(/you have used all 3 free interpretations/i)).toBeInTheDocument();
    });

    it('should display countdown to reset', () => {
      render(<UpgradePrompt />);

      // Should show some time indicator
      expect(screen.getByTestId('reset-countdown')).toBeInTheDocument();
    });

    it('should render upgrade button linking to pricing page', () => {
      render(<UpgradePrompt />);

      const link = screen.getByRole('link', { name: /upgrade for unlimited/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', '/pricing');
    });

    it('should display pricing information', () => {
      render(<UpgradePrompt />);

      expect(screen.getByText(/4\.99\/month/i)).toBeInTheDocument();
    });
  });

  describe('rendering when not limited', () => {
    beforeEach(() => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 2,
        used: 1,
        maxUses: 3,
        canUse: true,
        isLimited: false,
        resetTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        recordUse: mock(() => 1),
        reset: mock(() => {}),
      }));
    });

    it('should not render when remaining uses are available', () => {
      render(<UpgradePrompt />);

      expect(screen.queryByTestId('upgrade-prompt')).not.toBeInTheDocument();
    });
  });

  describe('styling', () => {
    beforeEach(() => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));
    });

    it('should accept custom className', () => {
      render(<UpgradePrompt className="custom-class" />);

      const prompt = screen.getByTestId('upgrade-prompt');
      expect(prompt).toHaveClass('custom-class');
    });

    it('should have proper border styling', () => {
      render(<UpgradePrompt />);

      const prompt = screen.getByTestId('upgrade-prompt');
      expect(prompt).toHaveClass('border-2');
    });
  });

  describe('accessibility', () => {
    beforeEach(() => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));
    });

    it('should have proper heading hierarchy', () => {
      render(<UpgradePrompt />);

      expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
    });

    it('should have accessible link', () => {
      render(<UpgradePrompt />);

      const link = screen.getByRole('link');
      expect(link).toHaveAccessibleName();
    });
  });

  describe('countdown formatting', () => {
    it('should format 1 hour and minutes correctly', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 1 * 60 * 60 * 1000 + 15 * 60 * 1000), // 1 hour and 15 minutes
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      render(<UpgradePrompt />);

      const countdown = screen.getByTestId('reset-countdown');
      // Allow for timing variance (14-15 minutes due to test execution time)
      expect(countdown.textContent).toMatch(/1\s*hour.*and.*(14|15)\s*minutes?/i);
    });

    it('should format multiple hours and 1 minute correctly', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 2 * 60 * 60 * 1000 + 1 * 60 * 1000), // 2 hours and 1 minute
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      render(<UpgradePrompt />);

      const countdown = screen.getByTestId('reset-countdown');
      expect(countdown.textContent).toMatch(/2\s*hours?.*and.*1\s*minute/i);
    });

    it('should format exact hours (no minutes) correctly', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // exactly 2 hours
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      render(<UpgradePrompt />);

      const countdown = screen.getByTestId('reset-countdown');
      expect(countdown.textContent).toMatch(/2\s*hours?/i);
      expect(countdown.textContent).not.toMatch(/and/i);
    });

    it('should format 1 minute correctly', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 1 * 60 * 1000), // 1 minute
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      render(<UpgradePrompt />);

      const countdown = screen.getByTestId('reset-countdown');
      expect(countdown.textContent).toMatch(/1\s*minute/i);
    });

    it('should format less than a minute correctly', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 30 * 1000), // 30 seconds
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      render(<UpgradePrompt />);

      const countdown = screen.getByTestId('reset-countdown');
      expect(countdown.textContent).toMatch(/less than a minute/i);
    });

    it('should format hours correctly', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      render(<UpgradePrompt />);

      const countdown = screen.getByTestId('reset-countdown');
      expect(countdown.textContent).toMatch(/\d+\s*hours?/i);
    });

    it('should format minutes correctly when less than an hour', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      render(<UpgradePrompt />);

      const countdown = screen.getByTestId('reset-countdown');
      expect(countdown.textContent).toMatch(/\d+\s*minutes?/i);
    });
  });

  describe('edge cases', () => {
    it('should handle reset time in the past gracefully', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() - 1000), // 1 second ago
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      // Should not throw
      expect(() => render(<UpgradePrompt />)).not.toThrow();
    });

    it('should handle exactly 0 remaining correctly', () => {
      mockUseRateLimit.mockImplementation(() => ({
        remaining: 0,
        used: 3,
        maxUses: 3,
        canUse: false,
        isLimited: true,
        resetTime: new Date(Date.now() + 60 * 60 * 1000),
        recordUse: mock(() => 0),
        reset: mock(() => {}),
      }));

      render(<UpgradePrompt />);

      expect(screen.getByTestId('upgrade-prompt')).toBeInTheDocument();
    });
  });
});
