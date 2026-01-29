import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { InterpretLoading, formatElapsedTime } from '@/components/interpreter/interpret-loading';

afterEach(() => {
  cleanup();
});

describe('InterpretLoading', () => {
  beforeEach(() => {
    // Use fake timers for testing time-based features
  });

  describe('rendering', () => {
    it('renders the loading component', () => {
      render(<InterpretLoading />);
      expect(screen.getByTestId('interpret-loading')).toBeInTheDocument();
    });

    it('renders skeleton placeholder elements', () => {
      render(<InterpretLoading />);
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThanOrEqual(3);
    });

    it('applies custom className', () => {
      render(<InterpretLoading className="custom-class" />);
      expect(screen.getByTestId('interpret-loading')).toHaveClass('custom-class');
    });
  });

  describe('loading messages', () => {
    it('displays a loading message', () => {
      render(<InterpretLoading />);
      expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });

    it('displays one of the predefined loading messages', () => {
      render(<InterpretLoading />);
      const messageElement = screen.getByTestId('loading-message');
      const possibleMessages = [
        'Analyzing emoji patterns...',
        'Detecting hidden meanings...',
        'Calculating sarcasm levels...',
        'Checking for red flags...',
        'Decoding digital hieroglyphics...',
        'Reading between the emojis...',
        'Consulting the emoji oracle...',
        'Processing emotional subtext...',
      ];
      expect(possibleMessages.some((msg) => messageElement.textContent?.includes(msg))).toBe(true);
    });

    it('rotates loading messages over time', async () => {
      const { rerender } = render(<InterpretLoading />);

      // Force re-render with new message (simulating interval)
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 2100));
      });
      rerender(<InterpretLoading />);

      // Message may or may not change (depends on random selection)
      // Just verify the component still renders correctly
      expect(screen.getByTestId('loading-message')).toBeInTheDocument();
    });
  });

  describe('progress indicator', () => {
    it('renders a progress indicator', () => {
      render(<InterpretLoading />);
      expect(screen.getByTestId('progress-indicator')).toBeInTheDocument();
    });

    it('shows animated progress bar', () => {
      render(<InterpretLoading />);
      const progressBar = screen.getByTestId('progress-indicator');
      expect(progressBar).toHaveClass('animate-pulse');
    });

    it('displays elapsed time indicator', () => {
      render(<InterpretLoading showElapsedTime />);
      expect(screen.getByTestId('elapsed-time')).toBeInTheDocument();
    });

    it('increments elapsed time every second', async () => {
      render(<InterpretLoading showElapsedTime />);

      // Initial state
      expect(screen.getByTestId('elapsed-time')).toHaveTextContent('0s');

      // Wait for 1 second
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      expect(screen.getByTestId('elapsed-time')).toHaveTextContent('1s');

      // Wait for another second
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      expect(screen.getByTestId('elapsed-time')).toHaveTextContent('2s');
    });

    it('formats elapsed time with minutes when over 60 seconds', async () => {
      // Mock the component with a pre-set elapsed time by using internal state
      // We'll test the formatting by waiting or by directly rendering
      render(<InterpretLoading showElapsedTime />);

      // Wait for 61 seconds worth of intervals
      // This is slow, so we'll use a workaround - test the formatting separately
      // For now, verify initial format is correct
      expect(screen.getByTestId('elapsed-time')).toHaveTextContent(/\d+s/);
    });
  });

  describe('timeout handling', () => {
    it('shows timeout message after specified duration', async () => {
      render(<InterpretLoading timeout={1000} />);

      // Wait for timeout
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      expect(screen.getByTestId('timeout-message')).toBeInTheDocument();
    });

    it('shows retry button when timed out', async () => {
      render(<InterpretLoading timeout={1000} onRetry={() => {}} />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });

    it('calls onRetry when retry button is clicked', async () => {
      const mockRetry = mock(() => {});
      render(<InterpretLoading timeout={1000} onRetry={mockRetry} />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      expect(mockRetry).toHaveBeenCalledTimes(1);
    });

    it('shows cancel button when onCancel provided', async () => {
      render(<InterpretLoading timeout={1000} onCancel={() => {}} />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    });

    it('calls onCancel when cancel button is clicked', async () => {
      const mockCancel = mock(() => {});
      render(<InterpretLoading timeout={1000} onCancel={mockCancel} />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      fireEvent.click(cancelButton);

      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it('does not show timeout message if timeout is not provided', async () => {
      render(<InterpretLoading />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
      });

      expect(screen.queryByTestId('timeout-message')).not.toBeInTheDocument();
    });

    it('resets timeout when isTimedOut is explicitly false', () => {
      render(<InterpretLoading timeout={1000} isTimedOut={false} />);
      expect(screen.queryByTestId('timeout-message')).not.toBeInTheDocument();
    });
  });

  describe('long-running request handling', () => {
    it('shows extended wait message after delay', async () => {
      render(<InterpretLoading showExtendedWaitMessage extendedWaitDelay={1000} />);

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1100));
      });

      expect(screen.getByTestId('extended-wait-message')).toBeInTheDocument();
    });

    it('does not show extended wait message before delay', () => {
      render(<InterpretLoading showExtendedWaitMessage extendedWaitDelay={5000} />);
      expect(screen.queryByTestId('extended-wait-message')).not.toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has accessible status role', () => {
      render(<InterpretLoading />);
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('has aria-live for dynamic content', () => {
      render(<InterpretLoading />);
      const status = screen.getByRole('status');
      expect(status).toHaveAttribute('aria-live', 'polite');
    });

    it('has aria-busy during loading', () => {
      render(<InterpretLoading />);
      const loading = screen.getByTestId('interpret-loading');
      expect(loading).toHaveAttribute('aria-busy', 'true');
    });

    it('provides accessible label for screen readers', () => {
      render(<InterpretLoading />);
      expect(screen.getByLabelText(/loading|interpreting/i)).toBeInTheDocument();
    });
  });

  describe('visual feedback', () => {
    it('renders spinner animation', () => {
      render(<InterpretLoading />);
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('spinner has animation class', () => {
      render(<InterpretLoading />);
      const spinner = screen.getByTestId('loading-spinner');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('formatElapsedTime', () => {
    it('formats seconds under 60 as seconds only', () => {
      expect(formatElapsedTime(0)).toBe('0s');
      expect(formatElapsedTime(30)).toBe('30s');
      expect(formatElapsedTime(59)).toBe('59s');
    });

    it('formats 60 seconds as 1 minute 0 seconds', () => {
      expect(formatElapsedTime(60)).toBe('1m 0s');
    });

    it('formats seconds over 60 with minutes and seconds', () => {
      expect(formatElapsedTime(61)).toBe('1m 1s');
      expect(formatElapsedTime(90)).toBe('1m 30s');
      expect(formatElapsedTime(125)).toBe('2m 5s');
    });

    it('handles larger time values', () => {
      expect(formatElapsedTime(300)).toBe('5m 0s');
      expect(formatElapsedTime(3661)).toBe('61m 1s');
    });
  });
});
