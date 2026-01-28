import { describe, it, expect, mock, afterEach, beforeEach } from 'bun:test';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { InterpretResult } from '@/components/interpreter/interpret-result';
import type { InterpretationResult } from '@/types';

afterEach(() => {
  cleanup();
});

// Create a mock for clipboard
const mockWriteText = mock(() => Promise.resolve());

const mockResult: InterpretationResult = {
  id: 'int_123456_abc123',
  message: 'Hey 👋 how are you? 😊',
  emojis: [
    { character: '👋', meaning: 'A friendly greeting', slug: 'waving-hand' },
    { character: '😊', meaning: 'Genuine happiness', slug: 'smiling-face-with-smiling-eyes' },
  ],
  interpretation:
    'This is a warm, friendly greeting expressing genuine interest in how you are doing.',
  metrics: {
    sarcasmProbability: 10,
    passiveAggressionProbability: 5,
    overallTone: 'positive',
    confidence: 85,
  },
  redFlags: [],
  timestamp: '2024-01-15T10:30:00.000Z',
};

const mockResultWithRedFlags: InterpretationResult = {
  ...mockResult,
  id: 'int_789012_def456',
  message: 'Sure, that sounds great 🙂',
  emojis: [
    {
      character: '🙂',
      meaning: 'Potentially passive-aggressive or sarcastic',
      slug: 'slightly-smiling-face',
    },
  ],
  interpretation:
    'This response may be passive-aggressive. The slightly smiling emoji is often used to mask negative feelings.',
  metrics: {
    sarcasmProbability: 65,
    passiveAggressionProbability: 75,
    overallTone: 'negative',
    confidence: 70,
  },
  redFlags: [
    {
      type: 'passive_aggression',
      description: 'The slightly smiling emoji combined with "Sure" often indicates displeasure.',
      severity: 'medium',
    },
    {
      type: 'mixed_signals',
      description: 'The tone and emoji choice do not align.',
      severity: 'low',
    },
  ],
};

const mockResultNeutralTone: InterpretationResult = {
  ...mockResult,
  id: 'int_neutral_001',
  metrics: {
    ...mockResult.metrics,
    overallTone: 'neutral',
  },
};

describe('InterpretResult', () => {
  const mockOnEmojiClick = mock(() => {});

  beforeEach(() => {
    mockOnEmojiClick.mockClear();
    mockWriteText.mockClear();
    // Mock clipboard API using defineProperty
    Object.defineProperty(navigator, 'clipboard', {
      value: {
        writeText: mockWriteText,
      },
      writable: true,
      configurable: true,
    });
  });

  describe('rendering', () => {
    it('renders the interpretation summary', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByText(mockResult.interpretation)).toBeInTheDocument();
    });

    it('renders the original message', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByText(/Hey 👋 how are you\? 😊/)).toBeInTheDocument();
    });

    it('renders all detected emojis', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByText('👋')).toBeInTheDocument();
      expect(screen.getByText('😊')).toBeInTheDocument();
    });

    it('renders emoji meanings', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByText('A friendly greeting')).toBeInTheDocument();
      expect(screen.getByText('Genuine happiness')).toBeInTheDocument();
    });

    it('renders with accessible structure', () => {
      render(<InterpretResult result={mockResult} />);
      // Should have regions or sections
      expect(screen.getByRole('article')).toBeInTheDocument();
    });
  });

  describe('tone analysis badges', () => {
    it('renders positive tone badge', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByTestId('tone-badge')).toHaveTextContent(/positive/i);
    });

    it('renders negative tone badge', () => {
      render(<InterpretResult result={mockResultWithRedFlags} />);
      expect(screen.getByTestId('tone-badge')).toHaveTextContent(/negative/i);
    });

    it('renders neutral tone badge', () => {
      render(<InterpretResult result={mockResultNeutralTone} />);
      expect(screen.getByTestId('tone-badge')).toHaveTextContent(/neutral/i);
    });

    it('applies correct styling for positive tone', () => {
      render(<InterpretResult result={mockResult} />);
      const badge = screen.getByTestId('tone-badge');
      expect(badge).toHaveClass('bg-green-100');
    });

    it('applies correct styling for negative tone', () => {
      render(<InterpretResult result={mockResultWithRedFlags} />);
      const badge = screen.getByTestId('tone-badge');
      expect(badge).toHaveClass('bg-red-100');
    });

    it('applies correct styling for neutral tone', () => {
      render(<InterpretResult result={mockResultNeutralTone} />);
      const badge = screen.getByTestId('tone-badge');
      expect(badge).toHaveClass('bg-gray-100');
    });
  });

  describe('probability meters', () => {
    it('renders sarcasm probability meter', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByTestId('sarcasm-meter')).toBeInTheDocument();
    });

    it('renders passive-aggression probability meter', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByTestId('passive-aggression-meter')).toBeInTheDocument();
    });

    it('displays correct sarcasm probability value', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByTestId('sarcasm-meter')).toHaveTextContent('10%');
    });

    it('displays correct passive-aggression probability value', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByTestId('passive-aggression-meter')).toHaveTextContent('5%');
    });

    it('shows high probability with warning styling', () => {
      render(<InterpretResult result={mockResultWithRedFlags} />);
      const sarcasmMeter = screen.getByTestId('sarcasm-meter');
      const paMeter = screen.getByTestId('passive-aggression-meter');
      // The container has the background color, the inner span has the text color
      expect(sarcasmMeter).toHaveClass('bg-yellow-100');
      expect(paMeter).toHaveClass('bg-red-100');
    });

    it('displays confidence level', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByTestId('confidence-indicator')).toHaveTextContent('85%');
    });
  });

  describe('red flags', () => {
    it('does not render red flags section when none present', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.queryByTestId('red-flags-section')).not.toBeInTheDocument();
    });

    it('renders red flags section when present', () => {
      render(<InterpretResult result={mockResultWithRedFlags} />);
      expect(screen.getByTestId('red-flags-section')).toBeInTheDocument();
    });

    it('renders all red flags', () => {
      render(<InterpretResult result={mockResultWithRedFlags} />);
      // Check for red flag types (capitalized in the red flags section)
      expect(screen.getByText('passive aggression')).toBeInTheDocument();
      expect(screen.getByText('mixed signals')).toBeInTheDocument();
    });

    it('shows red flag descriptions', () => {
      render(<InterpretResult result={mockResultWithRedFlags} />);
      expect(screen.getByText(/slightly smiling emoji combined with "Sure"/i)).toBeInTheDocument();
    });

    it('applies severity styling to red flags', () => {
      render(<InterpretResult result={mockResultWithRedFlags} />);
      const redFlags = screen.getAllByTestId('red-flag-item');
      // First flag is medium severity
      expect(redFlags[0]).toHaveClass('border-yellow-500');
      // Second flag is low severity
      expect(redFlags[1]).toHaveClass('border-blue-500');
    });
  });

  describe('emoji interaction', () => {
    it('calls onEmojiClick when emoji is clicked', () => {
      render(<InterpretResult result={mockResult} onEmojiClick={mockOnEmojiClick} />);
      const emojiButton = screen.getByRole('button', { name: /👋/i });
      fireEvent.click(emojiButton);
      expect(mockOnEmojiClick).toHaveBeenCalledWith('👋');
    });

    it('makes emojis clickable when onEmojiClick provided', () => {
      render(<InterpretResult result={mockResult} onEmojiClick={mockOnEmojiClick} />);
      const emojiButtons = screen.getAllByRole('button', { name: /👋|😊/i });
      expect(emojiButtons.length).toBeGreaterThan(0);
    });

    it('does not make emojis buttons when onEmojiClick not provided', () => {
      render(<InterpretResult result={mockResult} />);
      const emojiSpans = screen.getAllByText(/👋|😊/);
      emojiSpans.forEach((span) => {
        expect(span.tagName).not.toBe('BUTTON');
      });
    });

    it('shows link indicator when emoji has slug', () => {
      render(<InterpretResult result={mockResult} onEmojiClick={mockOnEmojiClick} />);
      // Should have cursor pointer or link indicator
      const emojiButton = screen.getByRole('button', { name: /👋/i });
      expect(emojiButton).toHaveClass('cursor-pointer');
    });
  });

  describe('share and copy functionality', () => {
    it('renders copy button', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument();
    });

    it('copies interpretation to clipboard when copy button clicked', async () => {
      render(<InterpretResult result={mockResult} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalled();
        const calls = mockWriteText.mock.calls as unknown[][];
        const calledWith = calls[0]?.[0] as string | undefined;
        expect(calledWith).toContain(mockResult.interpretation);
      });
    });

    it('shows success feedback after copying', async () => {
      render(<InterpretResult result={mockResult} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText(/copied to clipboard/i)).toBeInTheDocument();
      });
    });

    it('renders share button', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('renders skeleton when isLoading is true', () => {
      render(<InterpretResult result={mockResult} isLoading />);
      expect(screen.getByTestId('interpret-result-skeleton')).toBeInTheDocument();
    });

    it('does not render result content when loading', () => {
      render(<InterpretResult result={mockResult} isLoading />);
      expect(screen.queryByText(mockResult.interpretation)).not.toBeInTheDocument();
    });

    it('renders multiple skeleton elements', () => {
      render(<InterpretResult result={mockResult} isLoading />);
      const skeletons = screen.getAllByRole('presentation');
      expect(skeletons.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('animation', () => {
    it('applies entrance animation class', () => {
      render(<InterpretResult result={mockResult} />);
      const container = screen.getByRole('article');
      expect(container).toHaveClass('animate-fadeIn');
    });

    it('staggers emoji card animations', () => {
      render(<InterpretResult result={mockResult} />);
      const emojiCards = screen.getAllByTestId('emoji-breakdown-card');
      // Each card should have a different animation delay
      emojiCards.forEach((card, index) => {
        expect(card).toHaveStyle({ animationDelay: `${index * 100}ms` });
      });
    });
  });

  describe('styling and layout', () => {
    it('accepts custom className', () => {
      render(<InterpretResult result={mockResult} className="custom-class" />);
      const container = screen.getByRole('article');
      expect(container).toHaveClass('custom-class');
    });

    it('has responsive layout', () => {
      render(<InterpretResult result={mockResult} />);
      const emojiGrid = screen.getByTestId('emoji-breakdown-grid');
      expect(emojiGrid).toHaveClass('grid');
    });
  });

  describe('accessibility', () => {
    it('has proper heading structure', () => {
      render(<InterpretResult result={mockResult} />);
      expect(
        screen.getByRole('heading', { level: 2, name: /interpretation/i })
      ).toBeInTheDocument();
    });

    it('uses semantic HTML for sections', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByRole('article')).toBeInTheDocument();
    });

    it('has accessible labels for meters', () => {
      render(<InterpretResult result={mockResult} />);
      expect(screen.getByLabelText(/sarcasm/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/passive/i)).toBeInTheDocument();
    });

    it('announces copy success to screen readers', async () => {
      render(<InterpretResult result={mockResult} />);
      const copyButton = screen.getByRole('button', { name: /copy/i });
      fireEvent.click(copyButton);

      await waitFor(() => {
        const successMessage = screen.getByRole('status');
        expect(successMessage).toHaveTextContent(/copied/i);
      });
    });
  });

  describe('edge cases', () => {
    it('handles result with no emojis gracefully', () => {
      const resultNoEmojis: InterpretationResult = {
        ...mockResult,
        emojis: [],
      };
      render(<InterpretResult result={resultNoEmojis} />);
      expect(screen.queryByTestId('emoji-breakdown-grid')).not.toBeInTheDocument();
    });

    it('handles emoji without slug', () => {
      const resultNoSlug: InterpretationResult = {
        ...mockResult,
        emojis: [{ character: '👍', meaning: 'Approval' }],
      };
      render(<InterpretResult result={resultNoSlug} onEmojiClick={mockOnEmojiClick} />);
      // Should still render but without link indicator
      expect(screen.getByText('👍')).toBeInTheDocument();
    });

    it('handles very long interpretation text', () => {
      const longResult: InterpretationResult = {
        ...mockResult,
        interpretation: 'A'.repeat(500),
      };
      render(<InterpretResult result={longResult} />);
      expect(screen.getByText('A'.repeat(500))).toBeInTheDocument();
    });

    it('handles high severity red flag', () => {
      const highSeverityResult: InterpretationResult = {
        ...mockResultWithRedFlags,
        redFlags: [
          {
            type: 'manipulation',
            description: 'This message shows signs of manipulation.',
            severity: 'high',
          },
        ],
      };
      render(<InterpretResult result={highSeverityResult} />);
      const redFlag = screen.getByTestId('red-flag-item');
      expect(redFlag).toHaveClass('border-red-500');
    });
  });
});
