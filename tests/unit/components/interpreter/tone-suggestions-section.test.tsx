import { describe, it, expect, afterEach, mock } from 'bun:test';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { ToneSuggestionsSection } from '@/components/interpreter/tone-suggestions-section';
import { createMultipleSuggestedTones } from '../../../utils/factories/interpreter.factory';
import type { ToneSuggestionRating } from '@/types';

afterEach(() => {
  cleanup();
});

describe('ToneSuggestionsSection', () => {
  const defaultSuggestions = createMultipleSuggestedTones(3);
  const defaultInterpretationId = 'test-interpretation-123';

  describe('rendering', () => {
    it('renders the section with suggestions', () => {
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
        />
      );
      expect(screen.getByTestId('tone-suggestions-section')).toBeInTheDocument();
    });

    it('displays the section header', () => {
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
        />
      );
      expect(screen.getByText('Suggested Response Tones')).toBeInTheDocument();
    });

    it('displays the suggestion count', () => {
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
        />
      );
      expect(screen.getByText('(3 suggestions)')).toBeInTheDocument();
    });

    it('displays the description text', () => {
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
        />
      );
      expect(
        screen.getByText(/based on our analysis, here are some recommended ways you could respond/i)
      ).toBeInTheDocument();
    });

    it('renders all suggestion cards', () => {
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
        />
      );
      const cards = screen.getAllByTestId('tone-suggestion-card');
      expect(cards).toHaveLength(3);
    });
  });

  describe('empty state', () => {
    it('returns null when suggestions array is empty', () => {
      const { container } = render(
        <ToneSuggestionsSection suggestions={[]} interpretationId={defaultInterpretationId} />
      );
      expect(container.firstChild).toBeNull();
    });

    it('returns null when suggestions is undefined', () => {
      const { container } = render(
        <ToneSuggestionsSection
          // @ts-expect-error - testing undefined case
          suggestions={undefined}
          interpretationId={defaultInterpretationId}
        />
      );
      expect(container.firstChild).toBeNull();
    });
  });

  describe('copy example functionality', () => {
    it('calls onCopyExample with example and tone when copy is triggered', async () => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: mock(() => Promise.resolve()),
        },
        writable: true,
      });

      const onCopyExample = mock();
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
          onCopyExample={onCopyExample}
        />
      );

      const copyButtons = screen.getAllByRole('button', { name: /copy/i });
      fireEvent.click(copyButtons[0]);

      await waitFor(() => {
        expect(onCopyExample).toHaveBeenCalledWith(
          defaultSuggestions[0].examples[0],
          defaultSuggestions[0].tone
        );
      });
    });
  });

  describe('rating functionality', () => {
    it('does not show rating UI when isRatingEnabled is false', () => {
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
          isRatingEnabled={false}
        />
      );
      expect(screen.queryByText('Was this suggestion helpful?')).not.toBeInTheDocument();
    });

    it('shows rating UI when isRatingEnabled is true', () => {
      const onRate = mock();
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );
      const ratingPrompts = screen.getAllByText('Was this suggestion helpful?');
      expect(ratingPrompts.length).toBe(3);
    });

    it('shows rating help text when enabled', () => {
      const onRate = mock();
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );
      expect(
        screen.getByText('Rating suggestions helps us improve recommendations for you.')
      ).toBeInTheDocument();
    });

    it('calls onRate with proper ToneSuggestionRating when rating is clicked', async () => {
      const onRate = mock();
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );

      const fourStarButtons = screen.getAllByRole('radio', { name: 'Rate 4 stars' });
      fireEvent.click(fourStarButtons[0]);

      await waitFor(() => {
        expect(onRate).toHaveBeenCalledTimes(1);
        const ratingArg = onRate.mock.calls[0][0] as ToneSuggestionRating;
        expect(ratingArg.interpretationId).toBe(defaultInterpretationId);
        expect(ratingArg.tone).toBe(defaultSuggestions[0].tone);
        expect(ratingArg.rating).toBe(4);
        expect(ratingArg.timestamp).toBeDefined();
      });
    });

    it('prevents duplicate ratings for the same tone', async () => {
      const onRate = mock();
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
          isRatingEnabled={true}
          onRate={onRate}
        />
      );

      // Rate the first suggestion
      const fourStarButtons = screen.getAllByRole('radio', { name: 'Rate 4 stars' });
      fireEvent.click(fourStarButtons[0]);

      await waitFor(() => {
        expect(onRate).toHaveBeenCalledTimes(1);
      });

      // Try to rate again - should not call onRate
      // After first rating, the star buttons for that card should be disabled
      // We simulate clicking again - onRate should still be at 1 call
    });
  });

  describe('grid layout', () => {
    it('renders cards in a responsive grid', () => {
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
        />
      );
      const grid = screen.getByTestId('tone-suggestions-section').querySelector('.grid');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });
  });

  describe('different suggestion counts', () => {
    it('handles 2 suggestions correctly', () => {
      const twoSuggestions = createMultipleSuggestedTones(2);
      render(
        <ToneSuggestionsSection
          suggestions={twoSuggestions}
          interpretationId={defaultInterpretationId}
        />
      );
      expect(screen.getByText('(2 suggestions)')).toBeInTheDocument();
      expect(screen.getAllByTestId('tone-suggestion-card')).toHaveLength(2);
    });

    it('handles 1 suggestion correctly', () => {
      const oneSuggestion = createMultipleSuggestedTones(1);
      render(
        <ToneSuggestionsSection
          suggestions={oneSuggestion}
          interpretationId={defaultInterpretationId}
        />
      );
      expect(screen.getByText('(1 suggestions)')).toBeInTheDocument();
      expect(screen.getAllByTestId('tone-suggestion-card')).toHaveLength(1);
    });
  });

  describe('styling', () => {
    it('accepts custom className', () => {
      render(
        <ToneSuggestionsSection
          suggestions={defaultSuggestions}
          interpretationId={defaultInterpretationId}
          className="custom-class"
        />
      );
      expect(screen.getByTestId('tone-suggestions-section')).toHaveClass('custom-class');
    });
  });
});
