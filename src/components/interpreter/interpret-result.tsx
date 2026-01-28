'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { InterpretationResult, DetectedEmoji, RedFlag } from '@/types';

export interface InterpretResultProps {
  result: InterpretationResult;
  isLoading?: boolean;
  onEmojiClick?: (emoji: string) => void;
  className?: string;
}

interface ProbabilityMeterProps {
  label: string;
  value: number;
  testId: string;
}

function ProbabilityMeter({ label, value, testId }: ProbabilityMeterProps) {
  const getColorClass = (v: number) => {
    if (v >= 70) return 'text-red-600 bg-red-100';
    if (v >= 50) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const colorClass = getColorClass(value);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600" id={`${testId}-label`}>
        {label}
      </label>
      <div
        data-testid={testId}
        aria-labelledby={`${testId}-label`}
        className={cn(
          'flex items-center justify-between rounded-lg px-3 py-2',
          colorClass.split(' ')[1]
        )}
      >
        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 mr-3">
          <div
            className={cn('h-full rounded-full transition-all', colorClass.split(' ')[1])}
            style={{ width: `${value}%`, backgroundColor: 'currentColor' }}
          />
        </div>
        <span className={cn('text-sm font-medium', colorClass.split(' ')[0])}>{value}%</span>
      </div>
    </div>
  );
}

interface EmojiBreakdownCardProps {
  emoji: DetectedEmoji;
  index: number;
  onEmojiClick?: (emoji: string) => void;
}

function EmojiBreakdownCard({ emoji, index, onEmojiClick }: EmojiBreakdownCardProps) {
  const hasClickHandler = !!onEmojiClick;

  const handleClick = useCallback(() => {
    if (onEmojiClick) {
      onEmojiClick(emoji.character);
    }
  }, [onEmojiClick, emoji.character]);

  return (
    <Card
      data-testid="emoji-breakdown-card"
      className="animate-fadeIn"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="flex items-start gap-4 p-4">
        {hasClickHandler ? (
          <button
            onClick={handleClick}
            className="cursor-pointer text-4xl hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-1"
            aria-label={`View details for ${emoji.character}`}
          >
            {emoji.character}
          </button>
        ) : (
          <span className="text-4xl">{emoji.character}</span>
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-700">{emoji.meaning}</p>
          {emoji.slug && <p className="text-xs text-gray-400 mt-1">Learn more about this emoji</p>}
        </div>
      </CardContent>
    </Card>
  );
}

interface RedFlagItemProps {
  flag: RedFlag;
}

function RedFlagItem({ flag }: RedFlagItemProps) {
  const getSeverityClass = (severity: RedFlag['severity']) => {
    switch (severity) {
      case 'high':
        return 'border-red-500 bg-red-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-blue-500 bg-blue-50';
      default:
        return 'border-gray-500 bg-gray-50';
    }
  };

  const getSeverityLabel = (severity: RedFlag['severity']) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  return (
    <div
      data-testid="red-flag-item"
      className={cn('border-l-4 rounded-r-lg p-4', getSeverityClass(flag.severity))}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-red-500">⚠️</span>
        <span className="font-medium text-gray-900 capitalize">{flag.type.replace(/_/g, ' ')}</span>
        <Badge
          variant={
            flag.severity === 'high'
              ? 'destructive'
              : flag.severity === 'medium'
                ? 'warning'
                : 'secondary'
          }
          className="text-xs"
        >
          {getSeverityLabel(flag.severity)}
        </Badge>
      </div>
      <p className="text-sm text-gray-600">{flag.description}</p>
    </div>
  );
}

function InterpretResultSkeleton() {
  return (
    <div data-testid="interpret-result-skeleton" className="space-y-6">
      {/* Summary skeleton */}
      <div role="presentation">
        <Skeleton className="h-6 w-1/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>

      {/* Emoji breakdown skeleton */}
      <div role="presentation">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>

      {/* Metrics skeleton */}
      <div role="presentation">
        <Skeleton className="h-6 w-1/4 mb-4" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export function InterpretResult({
  result,
  isLoading,
  onEmojiClick,
  className,
}: InterpretResultProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    const textToCopy = `Message: ${result.message}\n\nInterpretation: ${result.interpretation}\n\nTone: ${result.metrics.overallTone}\nSarcasm: ${result.metrics.sarcasmProbability}%\nPassive-aggression: ${result.metrics.passiveAggressionProbability}%`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      console.error('Failed to copy to clipboard');
    }
  }, [result]);

  const handleShare = useCallback(async () => {
    const shareData = {
      title: 'Emoji Interpretation - KnowYourEmoji',
      text: `${result.interpretation}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      }
    } catch {
      // User cancelled or share failed
    }
  }, [result.interpretation]);

  const getToneBadgeConfig = (tone: 'positive' | 'neutral' | 'negative') => {
    switch (tone) {
      case 'positive':
        return { className: 'bg-green-100 text-green-800', label: 'Positive' };
      case 'negative':
        return { className: 'bg-red-100 text-red-800', label: 'Negative' };
      case 'neutral':
        return { className: 'bg-gray-100 text-gray-800', label: 'Neutral' };
    }
  };

  if (isLoading) {
    return <InterpretResultSkeleton />;
  }

  const toneBadgeConfig = getToneBadgeConfig(result.metrics.overallTone);

  return (
    <article className={cn('animate-fadeIn space-y-6', className)}>
      {/* Summary Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold leading-none tracking-tight">Interpretation</h2>
            <div className="flex items-center gap-2">
              <div
                data-testid="tone-badge"
                className={cn(
                  'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
                  toneBadgeConfig.className
                )}
              >
                {toneBadgeConfig.label}
              </div>
              <div
                data-testid="confidence-indicator"
                className="text-xs text-gray-500"
                title="Confidence level"
              >
                {result.metrics.confidence}% confident
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Original message */}
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-1">Original message</p>
            <p className="text-sm text-gray-700">{result.message}</p>
          </div>

          {/* Interpretation */}
          <p className="text-gray-900">{result.interpretation}</p>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy interpretation'}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </Button>
            {copied && (
              <span role="status" className="text-sm text-green-600">
                Copied to clipboard
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleShare} aria-label="Share">
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emoji Breakdown */}
      {result.emojis.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Emoji Breakdown</h3>
          <div data-testid="emoji-breakdown-grid" className="grid gap-4 sm:grid-cols-2">
            {result.emojis.map((emoji, index) => (
              <EmojiBreakdownCard
                key={`${emoji.character}-${index}`}
                emoji={emoji}
                index={index}
                onEmojiClick={onEmojiClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Probability Meters */}
      <section>
        <h3 className="text-lg font-semibold mb-4">Tone Analysis</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <ProbabilityMeter
            label="Sarcasm Probability"
            value={result.metrics.sarcasmProbability}
            testId="sarcasm-meter"
          />
          <ProbabilityMeter
            label="Passive-Aggression"
            value={result.metrics.passiveAggressionProbability}
            testId="passive-aggression-meter"
          />
        </div>
      </section>

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <section data-testid="red-flags-section">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="text-red-500">⚠️</span>
            Red Flags
          </h3>
          <div className="space-y-3">
            {result.redFlags.map((flag, index) => (
              <RedFlagItem key={`${flag.type}-${index}`} flag={flag} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
