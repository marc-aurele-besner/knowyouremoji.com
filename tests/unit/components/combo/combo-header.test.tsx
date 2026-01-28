import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { ComboHeader } from '@/components/combo/combo-header';

// Mock clipboard API
const mockWriteText = mock(() => Promise.resolve());

beforeEach(() => {
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

const mockCombo = {
  combo: '💀😂',
  name: 'Dead Laughing',
  meaning: 'Something is so funny that you are dead from laughing.',
  category: 'humor' as const,
};

describe('ComboHeader', () => {
  describe('rendering', () => {
    it('renders the combo emojis', () => {
      render(<ComboHeader combo={mockCombo} />);
      expect(screen.getByText('💀😂')).toBeInTheDocument();
    });

    it('renders the combo name as an h1', () => {
      render(<ComboHeader combo={mockCombo} />);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Dead Laughing');
    });

    it('displays the category badge', () => {
      render(<ComboHeader combo={mockCombo} />);
      expect(screen.getByText('humor')).toBeInTheDocument();
    });

    it('displays the meaning summary', () => {
      render(<ComboHeader combo={mockCombo} />);
      expect(
        screen.getByText('Something is so funny that you are dead from laughing.')
      ).toBeInTheDocument();
    });

    it('renders the copy button', () => {
      render(<ComboHeader combo={mockCombo} />);
      expect(screen.getByRole('button', { name: /copy combo/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label on combo emojis', () => {
      render(<ComboHeader combo={mockCombo} />);
      expect(screen.getByRole('img', { name: 'Dead Laughing' })).toBeInTheDocument();
    });

    it('copy button has accessible name', () => {
      render(<ComboHeader combo={mockCombo} />);
      const button = screen.getByRole('button', { name: /copy combo/i });
      expect(button).toBeInTheDocument();
    });

    it('copy button is keyboard accessible', () => {
      render(<ComboHeader combo={mockCombo} />);
      const button = screen.getByRole('button', { name: /copy combo/i });
      button.focus();
      expect(document.activeElement).toBe(button);
    });
  });

  describe('copy functionality', () => {
    it('copies combo emojis to clipboard when button is clicked', async () => {
      render(<ComboHeader combo={mockCombo} />);
      const button = screen.getByRole('button', { name: /copy combo/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('💀😂');
      });
    });

    it('shows copied state after copying', async () => {
      render(<ComboHeader combo={mockCombo} />);
      const button = screen.getByRole('button', { name: /copy combo/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });
    });

    it('reverts to initial state after timeout', async () => {
      render(<ComboHeader combo={mockCombo} />);
      const button = screen.getByRole('button', { name: /copy combo/i });

      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument();
      });

      // Wait for the copied state to revert
      await waitFor(
        () => {
          expect(screen.getByText(/copy combo/i)).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });

  describe('styling', () => {
    it('applies responsive emoji size classes', () => {
      render(<ComboHeader combo={mockCombo} />);
      const emojiElement = screen.getByRole('img', { name: 'Dead Laughing' });
      expect(emojiElement.className).toMatch(/text-(6xl|7xl|8xl)/);
    });

    it('applies centered layout classes', () => {
      render(<ComboHeader combo={mockCombo} />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('text-center');
    });

    it('applies custom className when provided', () => {
      render(<ComboHeader combo={mockCombo} className="custom-class" />);
      const header = screen.getByRole('banner');
      expect(header).toHaveClass('custom-class');
    });
  });

  describe('edge cases', () => {
    it('handles combo with single emoji', () => {
      const singleEmojiCombo = {
        ...mockCombo,
        combo: '🔥',
        name: 'Fire',
      };
      render(<ComboHeader combo={singleEmojiCombo} />);
      expect(screen.getByText('🔥')).toBeInTheDocument();
    });

    it('handles combo with many emojis', () => {
      const manyEmojisCombo = {
        ...mockCombo,
        combo: '🙈🙉🙊',
        name: 'Three Monkeys',
      };
      render(<ComboHeader combo={manyEmojisCombo} />);
      expect(screen.getByText('🙈🙉🙊')).toBeInTheDocument();
    });

    it('handles different categories', () => {
      const flirtingCombo = {
        ...mockCombo,
        category: 'flirting' as const,
      };
      render(<ComboHeader combo={flirtingCombo} />);
      expect(screen.getByText('flirting')).toBeInTheDocument();
    });

    it('handles long combo names', () => {
      const longNameCombo = {
        ...mockCombo,
        name: 'This Is A Very Long Combo Name That Should Still Render Properly',
      };
      render(<ComboHeader combo={longNameCombo} />);
      expect(
        screen.getByText('This Is A Very Long Combo Name That Should Still Render Properly')
      ).toBeInTheDocument();
    });

    it('handles empty meaning gracefully', () => {
      const noMeaningCombo = {
        ...mockCombo,
        meaning: '',
      };
      render(<ComboHeader combo={noMeaningCombo} />);
      // Should still render without errors
      expect(screen.getByText('💀😂')).toBeInTheDocument();
    });

    it('handles clipboard API failure gracefully', async () => {
      // Mock clipboard to reject
      mockWriteText.mockImplementationOnce(() => Promise.reject(new Error('Clipboard error')));

      render(<ComboHeader combo={mockCombo} />);
      const button = screen.getByRole('button', { name: /copy combo/i });

      // Should not throw
      fireEvent.click(button);

      // Button should still be there (no crash)
      expect(screen.getByRole('button', { name: /copy combo/i })).toBeInTheDocument();
    });
  });
});
