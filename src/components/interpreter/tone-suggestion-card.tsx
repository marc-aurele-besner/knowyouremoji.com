'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getToneTypeInfo } from '@/lib/response-tones';
import type { SuggestedResponseTone } from '@/types';

export interface ToneSuggestionCardProps {
  suggestion: SuggestedResponseTone;
  index: number;
  onCopyExample?: (example: string) => void;
  onRate?: (rating: 1 | 2 | 3 | 4 | 5) => void;
  isRatingEnabled?: boolean;
  className?: string;
}

function RatingStars({
  onRate,
  disabled,
}: {
  onRate: (rating: 1 | 2 | 3 | 4 | 5) => void;
  disabled?: boolean;
}) {
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [selectedRating, setSelectedRating] = useState<number>(0);

  const handleClick = (rating: 1 | 2 | 3 | 4 | 5) => {
    if (disabled) return;
    setSelectedRating(rating);
    onRate(rating);
  };

  return (
    <div
      className="flex items-center gap-1"
      onMouseLeave={() => setHoveredRating(0)}
      role="radiogroup"
      aria-label="Rate this suggestion"
    >
      {([1, 2, 3, 4, 5] as const).map((rating) => (
        <button
          key={rating}
          type="button"
          onClick={() => handleClick(rating)}
          onMouseEnter={() => !disabled && setHoveredRating(rating)}
          disabled={disabled}
          aria-label={`Rate ${rating} star${rating > 1 ? 's' : ''}`}
          aria-checked={selectedRating === rating}
          role="radio"
          className={cn(
            'rounded text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
            disabled && 'cursor-not-allowed opacity-50',
            !disabled && 'cursor-pointer hover:scale-110'
          )}
        >
          <span
            className={cn(
              rating <= (hoveredRating || selectedRating) ? 'text-primary-500' : 'text-card-border'
            )}
          >
            ★
          </span>
        </button>
      ))}
      {selectedRating > 0 && (
        <span className="ml-2 text-xs text-muted-foreground" role="status">
          Thanks for rating!
        </span>
      )}
    </div>
  );
}

export function ToneSuggestionCard({
  suggestion,
  index,
  onCopyExample,
  onRate,
  isRatingEnabled = false,
  className,
}: ToneSuggestionCardProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const toneInfo = getToneTypeInfo(suggestion.tone);

  const handleCopyExample = useCallback(
    async (example: string, exampleIndex: number) => {
      try {
        await navigator.clipboard.writeText(example);
        setCopiedIndex(exampleIndex);
        setTimeout(() => setCopiedIndex(null), 2000);
        onCopyExample?.(example);
      } catch {
        console.error('Failed to copy example');
      }
    },
    [onCopyExample]
  );

  const handleRate = useCallback(
    (rating: 1 | 2 | 3 | 4 | 5) => {
      onRate?.(rating);
    },
    [onRate]
  );

  const confidenceColor =
    suggestion.confidence >= 80
      ? 'text-success'
      : suggestion.confidence >= 60
        ? 'text-primary-700'
        : 'text-muted-foreground';

  return (
    <Card
      data-testid="tone-suggestion-card"
      className={cn('animate-fadeIn rounded-xl shadow-none', className)}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardHeader className="p-3.5 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg" role="img" aria-label={toneInfo.label}>
              {toneInfo.icon}
            </span>
            <h4 className="text-[13px] font-semibold">{toneInfo.label}</h4>
          </div>
          <div
            className={cn('text-xs font-medium', confidenceColor)}
            data-testid="tone-confidence"
            title="Confidence score"
          >
            {suggestion.confidence}% match
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-3.5 pt-0">
        {/* Reasoning */}
        <p className="text-xs leading-snug text-muted-foreground">{suggestion.reasoning}</p>

        {/* Example Responses */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Example responses:</p>
          <div className="space-y-2">
            {suggestion.examples.map((example, exampleIndex) => (
              <div
                key={exampleIndex}
                className="group flex items-start gap-2 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm"
              >
                <p className="flex-1 text-foreground">&ldquo;{example}&rdquo;</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyExample(example, exampleIndex)}
                  className="h-6 px-2 text-xs opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
                  aria-label={copiedIndex === exampleIndex ? 'Copied' : 'Copy example'}
                >
                  {copiedIndex === exampleIndex ? '✓' : 'Copy'}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Rating (Phase 2 - requires auth) */}
        {isRatingEnabled && onRate && (
          <div className="border-t border-card-border pt-2">
            <p className="mb-2 text-xs text-muted-foreground">Was this suggestion helpful?</p>
            <RatingStars onRate={handleRate} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
