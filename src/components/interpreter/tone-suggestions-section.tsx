'use client';

import { useCallback, useState } from 'react';
import { cn } from '@/lib/utils';
import { ToneSuggestionCard } from './tone-suggestion-card';
import type { SuggestedResponseTone, ToneSuggestionRating, ResponseToneType } from '@/types';

export interface ToneSuggestionsSectionProps {
  suggestions: SuggestedResponseTone[];
  interpretationId: string;
  isRatingEnabled?: boolean;
  onCopyExample?: (example: string, tone: ResponseToneType) => void;
  onRate?: (rating: ToneSuggestionRating) => void;
  className?: string;
}

export function ToneSuggestionsSection({
  suggestions,
  interpretationId,
  isRatingEnabled = false,
  onCopyExample,
  onRate,
  className,
}: ToneSuggestionsSectionProps) {
  const [ratedTones, setRatedTones] = useState<Set<ResponseToneType>>(new Set());

  const handleCopyExample = useCallback(
    (example: string, tone: ResponseToneType) => {
      onCopyExample?.(example, tone);
    },
    [onCopyExample]
  );

  const handleRate = useCallback(
    (tone: ResponseToneType, rating: 1 | 2 | 3 | 4 | 5) => {
      if (ratedTones.has(tone)) return;

      setRatedTones((prev) => new Set(prev).add(tone));

      const ratingData: ToneSuggestionRating = {
        interpretationId,
        tone,
        rating,
        timestamp: new Date().toISOString(),
      };

      onRate?.(ratingData);
    },
    [interpretationId, onRate, ratedTones]
  );

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <section data-testid="tone-suggestions-section" className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <h3 className="text-base font-semibold text-foreground">How to reply</h3>
        <span className="text-sm text-muted-foreground">({suggestions.length} suggestions)</span>
      </div>

      <p className="text-sm text-muted-foreground">
        Based on our analysis, here are some recommended ways you could respond:
      </p>

      <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion, index) => (
          <ToneSuggestionCard
            key={suggestion.tone}
            suggestion={suggestion}
            index={index}
            onCopyExample={(example) => handleCopyExample(example, suggestion.tone)}
            onRate={
              isRatingEnabled && !ratedTones.has(suggestion.tone)
                ? (rating) => handleRate(suggestion.tone, rating)
                : undefined
            }
            isRatingEnabled={isRatingEnabled && !ratedTones.has(suggestion.tone)}
          />
        ))}
      </div>

      {isRatingEnabled && (
        <p className="text-center text-xs text-muted-foreground">
          Rating suggestions helps us improve recommendations for you.
        </p>
      )}
    </section>
  );
}
