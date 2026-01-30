import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ShareButtons } from '@/components/share/share-buttons';

// Mock clipboard API
const mockWriteText = mock(() => Promise.resolve());

// Mock window.open for social share links
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mockOpen = mock((url: string, target?: string, features?: string) => null);

// Helper to get the last call URL from mockOpen
function getLastOpenUrl(): string {
  const calls = mockOpen.mock.calls;
  if (calls.length === 0) return '';
  return (calls[calls.length - 1] as [string, string?, string?])[0];
}

beforeEach(() => {
  // Mock the clipboard on the navigator object
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: mockWriteText,
    },
    writable: true,
    configurable: true,
  });

  // Mock window.open
  Object.defineProperty(window, 'open', {
    value: mockOpen,
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  cleanup();
  mockWriteText.mockClear();
  mockOpen.mockClear();
});

describe('ShareButtons', () => {
  const defaultProps = {
    url: 'https://knowyouremoji.com/emoji/fire',
    title: 'Fire Emoji Meaning',
  };

  describe('rendering', () => {
    it('renders all share buttons by default', () => {
      render(<ShareButtons {...defaultProps} />);

      expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share on facebook/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    });

    it('renders as a horizontal layout by default', () => {
      render(<ShareButtons {...defaultProps} />);
      const container = screen.getByRole('group');
      expect(container).toHaveClass('flex-row');
    });

    it('renders as a vertical layout when direction is vertical', () => {
      render(<ShareButtons {...defaultProps} direction="vertical" />);
      const container = screen.getByRole('group');
      expect(container).toHaveClass('flex-col');
    });

    it('renders only specified buttons when platforms prop is provided', () => {
      render(<ShareButtons {...defaultProps} platforms={['twitter']} />);

      expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /share on facebook/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /copy link/i })).not.toBeInTheDocument();
    });

    it('renders twitter and copy buttons when specified', () => {
      render(<ShareButtons {...defaultProps} platforms={['twitter', 'copy']} />);

      expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /share on facebook/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    });
  });

  describe('Twitter/X share', () => {
    it('opens Twitter share URL in new window when clicked', () => {
      render(<ShareButtons {...defaultProps} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      fireEvent.click(twitterButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com/intent/tweet'),
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('includes title in Twitter share URL', () => {
      render(<ShareButtons {...defaultProps} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      fireEvent.click(twitterButton);

      const callArg = getLastOpenUrl();
      // URLSearchParams uses + for spaces
      expect(callArg).toContain('text=Fire+Emoji+Meaning');
    });

    it('includes URL in Twitter share URL', () => {
      render(<ShareButtons {...defaultProps} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      fireEvent.click(twitterButton);

      const callArg = getLastOpenUrl();
      expect(callArg).toContain(encodeURIComponent(defaultProps.url));
    });

    it('includes hashtags in Twitter share URL when provided', () => {
      render(<ShareButtons {...defaultProps} hashtags={['emoji', 'meaning']} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      fireEvent.click(twitterButton);

      const callArg = getLastOpenUrl();
      expect(callArg).toContain('hashtags=emoji%2Cmeaning');
    });
  });

  describe('Facebook share', () => {
    it('opens Facebook share URL in new window when clicked', () => {
      render(<ShareButtons {...defaultProps} />);
      const facebookButton = screen.getByRole('button', { name: /share on facebook/i });

      fireEvent.click(facebookButton);

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('facebook.com/sharer/sharer.php'),
        '_blank',
        'noopener,noreferrer'
      );
    });

    it('includes URL in Facebook share URL', () => {
      render(<ShareButtons {...defaultProps} />);
      const facebookButton = screen.getByRole('button', { name: /share on facebook/i });

      fireEvent.click(facebookButton);

      const callArg = getLastOpenUrl();
      expect(callArg).toContain(encodeURIComponent(defaultProps.url));
    });
  });

  describe('Copy link functionality', () => {
    it('copies URL to clipboard when copy button is clicked', async () => {
      render(<ShareButtons {...defaultProps} />);
      const copyButton = screen.getByRole('button', { name: /copy link/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith(defaultProps.url);
      });
    });

    it('shows "Copied!" feedback after successful copy', async () => {
      render(<ShareButtons {...defaultProps} />);
      const copyButton = screen.getByRole('button', { name: /copy link/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });

    it('reverts to initial state after timeout', async () => {
      render(<ShareButtons {...defaultProps} copyResetDelay={100} />);
      const copyButton = screen.getByRole('button', { name: /copy link/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
        },
        { timeout: 500 }
      );
    });

    it('calls onCopy callback when provided', async () => {
      const onCopy = mock(() => {});
      render(<ShareButtons {...defaultProps} onCopy={onCopy} />);
      const copyButton = screen.getByRole('button', { name: /copy link/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(onCopy).toHaveBeenCalled();
      });
    });

    it('handles clipboard API not available', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const onCopyError = mock(() => {});
      render(<ShareButtons {...defaultProps} onCopyError={onCopyError} />);
      const copyButton = screen.getByRole('button', { name: /copy link/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(onCopyError).toHaveBeenCalled();
      });
    });
  });

  describe('accessibility', () => {
    it('has accessible group role', () => {
      render(<ShareButtons {...defaultProps} />);
      expect(screen.getByRole('group', { name: /share/i })).toBeInTheDocument();
    });

    it('has accessible names for all buttons', () => {
      render(<ShareButtons {...defaultProps} />);

      expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /share on facebook/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /copy link/i })).toBeInTheDocument();
    });

    it('buttons are keyboard accessible', () => {
      render(<ShareButtons {...defaultProps} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      twitterButton.focus();
      expect(document.activeElement).toBe(twitterButton);
    });
  });

  describe('button sizes', () => {
    it('applies md size by default', () => {
      render(<ShareButtons {...defaultProps} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });
      expect(twitterButton).toHaveClass('h-10');
    });

    it('applies sm size when specified', () => {
      render(<ShareButtons {...defaultProps} size="sm" />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });
      expect(twitterButton).toHaveClass('h-8');
    });

    it('applies lg size when specified', () => {
      render(<ShareButtons {...defaultProps} size="lg" />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });
      expect(twitterButton).toHaveClass('h-12');
    });

    it('applies icon size when specified', () => {
      render(<ShareButtons {...defaultProps} size="icon" />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });
      expect(twitterButton).toHaveClass('w-10');
    });
  });

  describe('button variants', () => {
    it('applies ghost variant by default', () => {
      render(<ShareButtons {...defaultProps} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });
      expect(twitterButton).toHaveClass('hover:bg-gray-100');
    });

    it('applies outline variant when specified', () => {
      render(<ShareButtons {...defaultProps} variant="outline" />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });
      expect(twitterButton).toHaveClass('border');
    });

    it('applies secondary variant when specified', () => {
      render(<ShareButtons {...defaultProps} variant="secondary" />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });
      expect(twitterButton).toHaveClass('bg-gray-200');
    });
  });

  describe('styling', () => {
    it('merges custom className', () => {
      render(<ShareButtons {...defaultProps} className="custom-class" />);
      const container = screen.getByRole('group');
      expect(container).toHaveClass('custom-class');
    });

    it('applies gap between buttons', () => {
      render(<ShareButtons {...defaultProps} />);
      const container = screen.getByRole('group');
      expect(container).toHaveClass('gap-2');
    });
  });

  describe('show labels', () => {
    it('hides labels when showLabels is false', () => {
      render(<ShareButtons {...defaultProps} showLabels={false} />);

      // Buttons should still exist but not show text labels
      expect(screen.getByRole('button', { name: /share on twitter/i })).toBeInTheDocument();
      expect(screen.queryByText('Twitter')).not.toBeInTheDocument();
      expect(screen.queryByText('Facebook')).not.toBeInTheDocument();
      expect(screen.queryByText('Copy Link')).not.toBeInTheDocument();
    });

    it('shows labels when showLabels is true', () => {
      render(<ShareButtons {...defaultProps} showLabels={true} />);

      expect(screen.getByText('Twitter')).toBeInTheDocument();
      expect(screen.getByText('Facebook')).toBeInTheDocument();
      expect(screen.getByText('Copy Link')).toBeInTheDocument();
    });
  });

  describe('analytics callback', () => {
    it('calls onShare callback when Twitter share is clicked', () => {
      const onShare = mock(() => {});
      render(<ShareButtons {...defaultProps} onShare={onShare} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      fireEvent.click(twitterButton);

      expect(onShare).toHaveBeenCalledWith('twitter', defaultProps.url);
    });

    it('calls onShare callback when Facebook share is clicked', () => {
      const onShare = mock(() => {});
      render(<ShareButtons {...defaultProps} onShare={onShare} />);
      const facebookButton = screen.getByRole('button', { name: /share on facebook/i });

      fireEvent.click(facebookButton);

      expect(onShare).toHaveBeenCalledWith('facebook', defaultProps.url);
    });

    it('calls onShare callback when copy link is clicked', async () => {
      const onShare = mock(() => {});
      render(<ShareButtons {...defaultProps} onShare={onShare} />);
      const copyButton = screen.getByRole('button', { name: /copy link/i });

      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(onShare).toHaveBeenCalledWith('copy', defaultProps.url);
      });
    });
  });

  describe('edge cases', () => {
    it('handles URL with special characters', () => {
      const specialUrl = 'https://knowyouremoji.com/emoji/fire?query=test&foo=bar';
      render(<ShareButtons {...defaultProps} url={specialUrl} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      fireEvent.click(twitterButton);

      const callArg = getLastOpenUrl();
      expect(callArg).toContain(encodeURIComponent(specialUrl));
    });

    it('handles title with special characters', () => {
      const specialTitle = 'Fire Emoji & "Hot" Meaning <test>';
      render(<ShareButtons {...defaultProps} title={specialTitle} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      fireEvent.click(twitterButton);

      const callArg = getLastOpenUrl();
      // URLSearchParams uses + for spaces, properly encodes special chars
      expect(callArg).toContain('text=');
      expect(callArg).toContain('Fire');
      expect(callArg).toContain('Emoji');
    });

    it('handles empty hashtags array', () => {
      render(<ShareButtons {...defaultProps} hashtags={[]} />);
      const twitterButton = screen.getByRole('button', { name: /share on twitter/i });

      fireEvent.click(twitterButton);

      const callArg = getLastOpenUrl();
      expect(callArg).not.toContain('hashtags=');
    });

    it('handles rapid consecutive clicks on copy button', async () => {
      render(<ShareButtons {...defaultProps} />);
      const copyButton = screen.getByRole('button', { name: /copy link/i });

      fireEvent.click(copyButton);
      fireEvent.click(copyButton);
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledTimes(3);
      });
    });
  });
});
