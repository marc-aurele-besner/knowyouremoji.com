import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { EmojiCopyButton } from '@/components/emoji/emoji-copy-button';

// Mock clipboard API
const mockWriteText = mock(() => Promise.resolve());

beforeEach(() => {
  // Mock the clipboard on the navigator object using defineProperty
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  mockWriteText.mockClear();
});

describe('EmojiCopyButton', () => {
  describe('rendering', () => {
    it('renders a button element', () => {
      render(<EmojiCopyButton emoji="😀" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('renders with default label', () => {
      render(<EmojiCopyButton emoji="😀" />);
      expect(screen.getByRole('button')).toHaveTextContent('Copy Emoji');
    });

    it('renders with custom label', () => {
      render(<EmojiCopyButton emoji="😀" label="Copy to clipboard" />);
      expect(screen.getByRole('button')).toHaveTextContent('Copy to clipboard');
    });

    it('renders copy icon by default', () => {
      render(<EmojiCopyButton emoji="😀" />);
      expect(screen.getByRole('button')).toHaveTextContent('📋');
    });

    it('renders only icon when showLabel is false', () => {
      render(<EmojiCopyButton emoji="😀" showLabel={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('📋');
      expect(button).not.toHaveTextContent('Copy Emoji');
    });
  });

  describe('accessibility', () => {
    it('has accessible name with default label', () => {
      render(<EmojiCopyButton emoji="😀" />);
      expect(screen.getByRole('button', { name: /copy emoji/i })).toBeInTheDocument();
    });

    it('has accessible name with custom label', () => {
      render(<EmojiCopyButton emoji="😀" label="Copy face" />);
      expect(screen.getByRole('button', { name: /copy face/i })).toBeInTheDocument();
    });

    it('has accessible name when showLabel is false', () => {
      render(<EmojiCopyButton emoji="😀" showLabel={false} />);
      // Should still have aria-label
      expect(screen.getByRole('button', { name: /copy emoji/i })).toBeInTheDocument();
    });

    it('is keyboard accessible', () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');
      button.focus();
      expect(document.activeElement).toBe(button);
    });

    it('can be triggered via click', async () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('😀');
      });
    });
  });

  describe('copy functionality', () => {
    it('copies emoji to clipboard when clicked', async () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('😀');
      });
    });

    it('copies multi-codepoint emoji correctly', async () => {
      render(<EmojiCopyButton emoji="👨‍💻" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('👨‍💻');
      });
    });

    it('calls onCopy callback when provided', async () => {
      const onCopy = mock(() => {});
      render(<EmojiCopyButton emoji="😀" onCopy={onCopy} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalled();
      });
    });

    it('calls onCopyError callback on failure', async () => {
      mockWriteText.mockImplementationOnce(() => Promise.reject(new Error('Failed')));
      const onCopyError = mock(() => {});
      render(<EmojiCopyButton emoji="😀" onCopyError={onCopyError} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(onCopyError).toHaveBeenCalled();
      });
    });
  });

  describe('visual feedback', () => {
    it('shows copied state after successful copy', async () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });

    it('shows checkmark icon when copied', async () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveTextContent('✓');
      });
    });

    it('reverts to initial state after timeout', async () => {
      render(<EmojiCopyButton emoji="😀" resetDelay={100} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });

      // Wait for the copied state to revert
      await waitFor(
        () => {
          expect(screen.getByText(/copy emoji/i)).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('uses custom reset delay', async () => {
      render(<EmojiCopyButton emoji="😀" resetDelay={50} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(screen.getByText(/copy emoji/i)).toBeInTheDocument();
        },
        { timeout: 200 }
      );
    });

    it('does not show copied state on failure', async () => {
      mockWriteText.mockImplementationOnce(() => Promise.reject(new Error('Failed')));
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      // Wait a bit to ensure the state would have changed
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(screen.queryByText(/copied/i)).not.toBeInTheDocument();
    });
  });

  describe('button variants', () => {
    it('applies primary variant by default', () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-amber-500');
    });

    it('applies secondary variant when copied', async () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(button).toHaveClass('bg-gray-200');
      });
    });

    it('allows custom variant override', () => {
      render(<EmojiCopyButton emoji="😀" variant="outline" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border');
    });
  });

  describe('button sizes', () => {
    it('applies md size by default', () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-10');
    });

    it('applies sm size', () => {
      render(<EmojiCopyButton emoji="😀" size="sm" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-8');
    });

    it('applies lg size', () => {
      render(<EmojiCopyButton emoji="😀" size="lg" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('h-12');
    });

    it('applies icon size', () => {
      render(<EmojiCopyButton emoji="😀" size="icon" showLabel={false} />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('w-10');
    });
  });

  describe('disabled state', () => {
    it('is disabled when disabled prop is true', () => {
      render(<EmojiCopyButton emoji="😀" disabled />);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('does not copy when disabled', async () => {
      render(<EmojiCopyButton emoji="😀" disabled />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      // Wait a bit to ensure nothing was called
      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(mockWriteText).not.toHaveBeenCalled();
    });
  });

  describe('styling', () => {
    it('merges custom className', () => {
      render(<EmojiCopyButton emoji="😀" className="custom-class" />);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    it('forwards ref correctly', () => {
      const ref = { current: null as HTMLButtonElement | null };
      render(<EmojiCopyButton emoji="😀" ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe('edge cases', () => {
    it('handles empty emoji string', async () => {
      render(<EmojiCopyButton emoji="" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('');
      });
    });

    it('handles rapid consecutive clicks', async () => {
      render(<EmojiCopyButton emoji="😀" />);
      const button = screen.getByRole('button');

      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledTimes(3);
      });
    });

    it('handles clipboard API not available', async () => {
      // Remove clipboard API
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const onCopyError = mock(() => {});
      render(<EmojiCopyButton emoji="😀" onCopyError={onCopyError} />);
      const button = screen.getByRole('button');

      fireEvent.click(button);

      await waitFor(() => {
        expect(onCopyError).toHaveBeenCalled();
      });
    });
  });
});
