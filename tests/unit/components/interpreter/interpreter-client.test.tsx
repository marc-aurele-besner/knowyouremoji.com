import { describe, it, expect, mock, beforeEach, afterEach } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';

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

// Mock functions that persist across tests
const mockRecordUse = mock(() => 2);
const mockReset = mock(() => {});
const mockInterpret = mock(() => {});
const mockStop = mock(() => {});
const mockStreamReset = mock(() => {});

// Store onFinish callback so we can call it in tests
let onFinishCallback: ((text: string) => void) | null = null;

// Create a mutable mock state that will be used by the mock
const mockRateLimitState = {
  remaining: 3,
  used: 0,
  maxUses: 3,
  canUse: true,
  isLimited: false,
  resetTime: new Date(Date.now() + 12 * 60 * 60 * 1000),
};

// Mock the useRateLimit hook
const mockUseRateLimit = mock(() => ({
  remaining: mockRateLimitState.remaining,
  used: mockRateLimitState.used,
  maxUses: mockRateLimitState.maxUses,
  canUse: mockRateLimitState.canUse,
  isLimited: mockRateLimitState.isLimited,
  resetTime: mockRateLimitState.resetTime,
  recordUse: mockRecordUse,
  reset: mockReset,
}));

mock.module('@/hooks/use-rate-limit', () => ({
  useRateLimit: mockUseRateLimit,
}));

// Mock the useStreamingInterpret hook
mock.module('@/hooks/use-streaming-interpret', () => ({
  useStreamingInterpret: ({ onFinish }: { onFinish?: (text: string) => void } = {}) => {
    onFinishCallback = onFinish ?? null;
    return {
      text: '',
      isLoading: false,
      error: null,
      interpret: mockInterpret,
      stop: mockStop,
      reset: mockStreamReset,
    };
  },
}));

// Import after mocks are set up
import { InterpreterClient } from '@/components/interpreter/interpreter-client';

describe('InterpreterClient', () => {
  let localStorageMock: ReturnType<typeof createLocalStorageMock>;

  beforeEach(() => {
    localStorageMock = createLocalStorageMock();
    globalThis.localStorage = localStorageMock;

    // Reset to default state
    mockRateLimitState.remaining = 3;
    mockRateLimitState.used = 0;
    mockRateLimitState.maxUses = 3;
    mockRateLimitState.canUse = true;
    mockRateLimitState.isLimited = false;
    mockRateLimitState.resetTime = new Date(Date.now() + 12 * 60 * 60 * 1000);

    mockRecordUse.mockClear();
    mockReset.mockClear();
    mockInterpret.mockClear();
    mockStop.mockClear();
    mockStreamReset.mockClear();
    mockUseRateLimit.mockClear();
    onFinishCallback = null;
  });

  afterEach(() => {
    cleanup();
  });

  describe('rendering', () => {
    it('renders the streaming interpreter form', () => {
      render(<InterpreterClient />);

      expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /interpret/i })).toBeInTheDocument();
    });

    it('displays usage counter with rate limit data', () => {
      render(<InterpreterClient />);

      const usageCounter = screen.getByTestId('usage-counter');
      expect(usageCounter).toBeInTheDocument();
      expect(usageCounter).toHaveAttribute('aria-label', '3 of 3 free uses remaining');
    });

    it('accepts className prop', () => {
      const { container } = render(<InterpreterClient className="custom-class" />);

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('when rate limited', () => {
    beforeEach(() => {
      mockRateLimitState.remaining = 0;
      mockRateLimitState.used = 3;
      mockRateLimitState.maxUses = 3;
      mockRateLimitState.canUse = false;
      mockRateLimitState.isLimited = true;
      mockRateLimitState.resetTime = new Date(Date.now() + 12 * 60 * 60 * 1000);
    });

    it('shows the upgrade prompt when rate limited', () => {
      render(<InterpreterClient />);

      expect(screen.getByTestId('upgrade-prompt')).toBeInTheDocument();
    });

    it('displays daily limit reached heading', () => {
      render(<InterpreterClient />);

      expect(screen.getByRole('heading', { name: /daily limit reached/i })).toBeInTheDocument();
    });

    it('shows countdown to reset', () => {
      render(<InterpreterClient />);

      expect(screen.getByTestId('reset-countdown')).toBeInTheDocument();
    });

    it('shows link to pricing page', () => {
      render(<InterpreterClient />);

      const link = screen.getByRole('link', { name: /upgrade for unlimited/i });
      expect(link).toHaveAttribute('href', '/pricing');
    });

    it('disables the submit button when rate limited', () => {
      render(<InterpreterClient />);

      const submitButton = screen.getByRole('button', { name: /interpret/i });
      expect(submitButton).toBeDisabled();
    });

    it('shows usage counter with 0 remaining', () => {
      render(<InterpreterClient />);

      const usageCounter = screen.getByTestId('usage-counter');
      expect(usageCounter).toHaveAttribute('aria-label', '0 of 3 free uses remaining');
    });
  });

  describe('when partially used', () => {
    beforeEach(() => {
      mockRateLimitState.remaining = 1;
      mockRateLimitState.used = 2;
      mockRateLimitState.maxUses = 3;
      mockRateLimitState.canUse = true;
      mockRateLimitState.isLimited = false;
      mockRateLimitState.resetTime = new Date(Date.now() + 12 * 60 * 60 * 1000);
    });

    it('shows remaining uses correctly', () => {
      render(<InterpreterClient />);

      const usageCounter = screen.getByTestId('usage-counter');
      expect(usageCounter).toHaveAttribute('aria-label', '1 of 3 free uses remaining');
    });

    it('does not show upgrade prompt when uses remain', () => {
      render(<InterpreterClient />);

      expect(screen.queryByTestId('upgrade-prompt')).not.toBeInTheDocument();
    });

    it('does not disable submit button', () => {
      render(<InterpreterClient />);

      const submitButton = screen.getByRole('button', { name: /interpret/i });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe('recording usage', () => {
    beforeEach(() => {
      mockRateLimitState.remaining = 2;
      mockRateLimitState.used = 1;
      mockRateLimitState.maxUses = 3;
      mockRateLimitState.canUse = true;
      mockRateLimitState.isLimited = false;
      mockRateLimitState.resetTime = new Date(Date.now() + 12 * 60 * 60 * 1000);
    });

    it('records usage when interpretation completes successfully', async () => {
      render(<InterpreterClient />);

      const textarea = screen.getByRole('textbox', { name: /message/i });
      const submitButton = screen.getByRole('button', { name: /interpret/i });

      // Fill in valid form
      fireEvent.change(textarea, { target: { value: 'Hello there 👋' } });

      // Select platform
      const platformCombobox = screen.getByRole('combobox');
      fireEvent.click(platformCombobox);
      await waitFor(() => {
        expect(screen.getByText('iMessage')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('iMessage'));

      // Select context
      const contextRadio = screen.getByRole('radio', { name: /friend/i });
      fireEvent.click(contextRadio);

      // Submit
      fireEvent.click(submitButton);

      // Simulate streaming completion by calling onFinish
      if (onFinishCallback) {
        onFinishCallback('Test interpretation result');
      }

      await waitFor(() => {
        expect(mockRecordUse).toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('has proper form structure', () => {
      render(<InterpreterClient />);

      expect(screen.getByRole('form')).toBeInTheDocument();
    });

    it('provides accessible usage status', () => {
      render(<InterpreterClient />);

      const usageCounter = screen.getByTestId('usage-counter');
      expect(usageCounter).toHaveAttribute('role', 'status');
    });
  });
});
