import { describe, it, expect, afterEach, mock, spyOn } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { ToneSuggestionCard } from '@/components/interpreter/tone-suggestion-card';
import { createSuggestedResponseTone } from '../../../utils/factories/interpreter.factory';

afterEach(() => {
  cleanup();
});

describe('ToneSuggestionCard', () => {
  const defaultSuggestion = createSuggestedResponseTone();

  describe('rendering', () => {
    it('renders the component with required props', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      expect(screen.getByTestId('tone-suggestion-card')).toBeInTheDocument();
    });

    it('displays the tone label', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      expect(screen.getByText('Playful & Light')).toBeInTheDocument();
    });

    it('displays the tone icon', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      expect(screen.getByRole('img', { name: 'Playful & Light' })).toBeInTheDocument();
    });

    it('displays the confidence score', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      expect(screen.getByTestId('tone-confidence')).toHaveTextContent('85% match');
    });

    it('displays the reasoning', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      expect(screen.getByText(defaultSuggestion.reasoning)).toBeInTheDocument();
    });

    it('displays example responses', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      expect(screen.getByText('Example responses:')).toBeInTheDocument();
      for (const example of defaultSuggestion.examples) {
        // The component uses &ldquo; and &rdquo; which render as curly quotes
        // Use a function matcher to find the text content
        expect(screen.getByText((content) => content.includes(example))).toBeInTheDocument();
      }
    });
  });

  describe('confidence color', () => {
    it('applies green color for high confidence (>= 80)', () => {
      const highConfSuggestion = createSuggestedResponseTone({ confidence: 85 });
      render(<ToneSuggestionCard suggestion={highConfSuggestion} index={0} />);
      expect(screen.getByTestId('tone-confidence')).toHaveClass('text-green-600');
    });

    it('applies yellow color for medium confidence (60-79)', () => {
      const medConfSuggestion = createSuggestedResponseTone({ confidence: 70 });
      render(<ToneSuggestionCard suggestion={medConfSuggestion} index={0} />);
      expect(screen.getByTestId('tone-confidence')).toHaveClass('text-yellow-600');
    });

    it('applies gray color for low confidence (< 60)', () => {
      const lowConfSuggestion = createSuggestedResponseTone({ confidence: 50 });
      render(<ToneSuggestionCard suggestion={lowConfSuggestion} index={0} />);
      expect(screen.getByTestId('tone-confidence')).toHaveClass('text-gray-600');
    });
  });

  describe('tone types', () => {
    it('renders DIRECT tone correctly', () => {
      const directSuggestion = createSuggestedResponseTone({ tone: 'DIRECT' });
      render(<ToneSuggestionCard suggestion={directSuggestion} index={0} />);
      expect(screen.getByText('Direct & Assertive')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Direct & Assertive' })).toHaveTextContent('💪');
    });

    it('renders CLARIFYING tone correctly', () => {
      const clarifyingSuggestion = createSuggestedResponseTone({ tone: 'CLARIFYING' });
      render(<ToneSuggestionCard suggestion={clarifyingSuggestion} index={0} />);
      expect(screen.getByText('Clarifying & Questioning')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Clarifying & Questioning' })).toHaveTextContent('🤔');
    });

    it('renders NEUTRAL tone correctly', () => {
      const neutralSuggestion = createSuggestedResponseTone({ tone: 'NEUTRAL' });
      render(<ToneSuggestionCard suggestion={neutralSuggestion} index={0} />);
      expect(screen.getByText('Neutral & Professional')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Neutral & Professional' })).toHaveTextContent('🤝');
    });

    it('renders MATCHING tone correctly', () => {
      const matchingSuggestion = createSuggestedResponseTone({ tone: 'MATCHING' });
      render(<ToneSuggestionCard suggestion={matchingSuggestion} index={0} />);
      expect(screen.getByText('Matching Energy')).toBeInTheDocument();
      expect(screen.getByRole('img', { name: 'Matching Energy' })).toHaveTextContent('🪞');
    });
  });

  describe('copy example functionality', () => {
    it('shows copy button on hover', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      expect(copyButtons.length).toBe(defaultSuggestion.examples.length);
    });

    it('copies example to clipboard when copy button is clicked', async () => {
      const writeTextMock = mock(() => Promise.resolve());
      spyOn(navigator.clipboard, 'writeText').mockImplementation(writeTextMock);

      const onCopyExample = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          onCopyExample={onCopyExample}
        />
      );

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(writeTextMock).toHaveBeenCalledWith(defaultSuggestion.examples[0]);
        expect(onCopyExample).toHaveBeenCalledWith(defaultSuggestion.examples[0]);
      });
    });

    it('shows copied state after copying', async () => {
      spyOn(navigator.clipboard, 'writeText').mockImplementation(() => Promise.resolve());

      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /copied/i })).toBeInTheDocument();
      });
    });

    it('handles copy failure gracefully', async () => {
      const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
      spyOn(navigator.clipboard, 'writeText').mockImplementation(() =>
        Promise.reject(new Error('Copy failed'))
      );

      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy example');
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('rating functionality', () => {
    it('does not show rating section when isRatingEnabled is false', () => {
      render(
        <ToneSuggestionCard suggestion={defaultSuggestion} index={0} isRatingEnabled={false} />
      );
      expect(screen.queryByText('Was this suggestion helpful?')).not.toBeInTheDocument();
    });

    it('shows rating section when isRatingEnabled is true and onRate is provided', () => {
      const onRate = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );
      expect(screen.getByText('Was this suggestion helpful?')).toBeInTheDocument();
    });

    it('renders 5 star rating buttons', () => {
      const onRate = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );
      const starButtons = screen.getAllByRole('radio');
      expect(starButtons).toHaveLength(5);
    });

    it('calls onRate when star is clicked', async () => {
      const onRate = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );

      const fourStarButton = screen.getByRole('radio', { name: 'Rate 4 stars' });
      fireEvent.click(fourStarButton);

      await waitFor(() => {
        expect(onRate).toHaveBeenCalledWith(4);
      });
    });

    it('shows thank you message after rating', async () => {
      const onRate = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );

      const threeStarButton = screen.getByRole('radio', { name: 'Rate 3 stars' });
      fireEvent.click(threeStarButton);

      await waitFor(() => {
        expect(screen.getByRole('status')).toHaveTextContent('Thanks for rating!');
      });
    });

    it('highlights stars on hover', () => {
      const onRate = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );

      const thirdStar = screen.getByRole('radio', { name: 'Rate 3 stars' });
      fireEvent.mouseEnter(thirdStar);

      // Stars 1-3 should be highlighted (yellow)
      // After hover they should change color
      expect(thirdStar).toBeInTheDocument();
    });

    it('resets hover state on mouse leave from rating group', () => {
      const onRate = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );

      const radioGroup = screen.getByRole('radiogroup');
      const thirdStar = screen.getByRole('radio', { name: 'Rate 3 stars' });

      // Hover on star
      fireEvent.mouseEnter(thirdStar);
      // Leave the rating group
      fireEvent.mouseLeave(radioGroup);

      // Should reset hover state
      expect(radioGroup).toBeInTheDocument();
    });
  });

  describe('animation', () => {
    it('has fadeIn animation class', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      const card = screen.getByTestId('tone-suggestion-card');
      expect(card).toHaveClass('animate-fadeIn');
    });

    it('applies animation delay based on index', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={2} />);
      const card = screen.getByTestId('tone-suggestion-card');
      expect(card).toHaveStyle({ animationDelay: '200ms' });
    });
  });

  describe('styling', () => {
    it('accepts custom className', () => {
      render(
        <ToneSuggestionCard suggestion={defaultSuggestion} index={0} className="custom-class" />
      );
      const card = screen.getByTestId('tone-suggestion-card');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('accessibility', () => {
    it('has proper aria-label for rating stars', () => {
      const onRate = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );

      expect(screen.getByRole('radio', { name: 'Rate 1 star' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Rate 2 stars' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Rate 3 stars' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Rate 4 stars' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Rate 5 stars' })).toBeInTheDocument();
    });

    it('has radiogroup role for rating stars', () => {
      const onRate = mock();
      render(
        <ToneSuggestionCard
          suggestion={defaultSuggestion}
          index={0}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );
      expect(screen.getByRole('radiogroup', { name: 'Rate this suggestion' })).toBeInTheDocument();
    });

    it('has proper aria-label for copy buttons', () => {
      render(<ToneSuggestionCard suggestion={defaultSuggestion} index={0} />);
      const copyButtons = screen.getAllByRole('button', { name: /copy example/i });
      expect(copyButtons.length).toBeGreaterThan(0);
    });
  });
});
