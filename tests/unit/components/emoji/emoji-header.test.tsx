import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { EmojiHeader } from '@/components/emoji/emoji-header';

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

const mockEmoji = {
  character: '😀',
  name: 'Grinning Face',
  unicode: '1F600',
  shortcodes: [':grinning:', ':grinning_face:'],
};

describe('EmojiHeader', () => {
  describe('rendering', () => {
    it('renders the emoji character', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      expect(screen.getByText('😀')).toBeInTheDocument();
    });

    it('renders the emoji name as an h1', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Grinning Face');
    });

    it('displays the Unicode code point', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      expect(screen.getByText(/U\+1F600/)).toBeInTheDocument();
    });

    it('displays the shortcodes', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      expect(screen.getByText(/:grinning:/)).toBeInTheDocument();
      expect(screen.getByText(/:grinning_face:/)).toBeInTheDocument();
    });

    it('renders the copy button', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      expect(screen.getByRole('button', { name: /copy emoji/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label on emoji character', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      expect(screen.getByRole('img', { name: 'Grinning Face' })).toBeInTheDocument();
    });

    it('copy button has accessible name', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      const button = screen.getByRole('button', { name: /copy emoji/i });
      expect(button).toBeInTheDocument();
    });

    it('copy button is keyboard accessible', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      const button = screen.getByRole('button', { name: /copy emoji/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('copy functionality', () => {
    it('copies emoji to clipboard when button is clicked', async () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      const button = screen.getByRole('button', { name: /copy emoji/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('😀');
      });
    });

    it('shows copied state after copying', async () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      const button = screen.getByRole('button', { name: /copy emoji/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });

    it('reverts to initial state after timeout', async () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      const button = screen.getByRole('button', { name: /copy emoji/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });

      // Wait for the copied state to revert
      await waitFor(
        () => {
          expect(screen.getByText(/copy emoji/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('styling', () => {
    it('applies responsive emoji size classes', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      const emojiElement = screen.getByRole('img', { name: 'Grinning Face' });
      // Check for text-8xl which is the large size class (64px+)
      expect(emojiElement.className).toMatch(/text-(6xl|7xl|8xl)/);
    });

    it('applies centered layout classes', () => {
      render(<EmojiHeader emoji={mockEmoji} />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('text-center');
    });
  });

  describe('edge cases', () => {
    it('handles emoji with no shortcodes', () => {
      const emojiNoShortcodes = {
        ...mockEmoji,
        shortcodes: [],
      };
      render(<EmojiHeader emoji={emojiNoShortcodes} />);
      // Should still render without errors
      expect(screen.getByText('😀')).toBeInTheDocument();
    });

    it('handles emoji with single shortcode', () => {
      const emojiSingleShortcode = {
        ...mockEmoji,
        shortcodes: [':grinning:'],
      };
      render(<EmojiHeader emoji={emojiSingleShortcode} />);
      expect(screen.getByText(/:grinning:/)).toBeInTheDocument();
    });

    it('handles multi-codepoint emoji', () => {
      const multiCodepointEmoji = {
        character: '👨‍💻',
        name: 'Man Technologist',
        unicode: '1F468-200D-1F4BB',
        shortcodes: [':man_technologist:'],
      };
      render(<EmojiHeader emoji={multiCodepointEmoji} />);
      expect(screen.getByText('👨‍💻')).toBeInTheDocument();
      // Each segment gets U+ prefix: U+1F468-U+200D-U+1F4BB
      expect(screen.getByText(/U\+1F468-U\+200D-U\+1F4BB/)).toBeInTheDocument();
    });
  });
});
