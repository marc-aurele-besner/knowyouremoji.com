'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ProbabilityMeter } from './probability-meter';
import { PassiveAggressionMeter } from './passive-aggression-meter';
import { RedFlagBadge } from './red-flag-badge';
import { EmojiLink } from './emoji-link';
import { ToneSuggestionsSection } from './tone-suggestions-section';
import { ShareSection } from '@/components/share/share-section';
import { getShareUrl } from '@/lib/share-encoding';
import type { InterpretationResult, InterpretationResultWithTones, DetectedEmoji } from '@/types';

export interface InterpretResultProps {
  result: InterpretationResult | InterpretationResultWithTones;
  isLoading?: boolean;
  onEmojiClick?: (emoji: string) => void;
  /** Callback for tracking emoji link clicks (for analytics) */
  onEmojiLinkClick?: (emoji: string, slug: string) => void;
  /** Context line shown next to the badges, e.g. "iMessage · Friend" */
  meta?: string;
  /** When set, shows a "New message" action that calls this */
  onReset?: () => void;
  className?: string;
}

interface EmojiBreakdownCardProps {
  emoji: DetectedEmoji;
  index: number;
  onEmojiClick?: (emoji: string) => void;
  onEmojiLinkClick?: (emoji: string, slug: string) => void;
}

function EmojiBreakdownCard({
  emoji,
  index,
  onEmojiClick,
  onEmojiLinkClick,
}: EmojiBreakdownCardProps) {
  const hasClickHandler = !!onEmojiClick;
  const hasSlug = !!emoji.slug;

  const handleClick = useCallback(() => {
    if (onEmojiClick) {
      onEmojiClick(emoji.character);
    }
  }, [onEmojiClick, emoji.character]);

  return (
    <div
      data-testid="emoji-breakdown-card"
      className="flex animate-fadeIn items-start gap-3.5 rounded-xl border border-card-border bg-card px-3.5 py-3 transition hover:border-primary-500"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {hasSlug ? (
        <EmojiLink
          emoji={emoji.character}
          slug={emoji.slug}
          showPreview
          onLinkClick={onEmojiLinkClick}
          className="text-[28px] leading-none"
        />
      ) : hasClickHandler ? (
        <button
          onClick={handleClick}
          className="cursor-pointer rounded-lg text-[28px] leading-none transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label={`View details for ${emoji.character}`}
        >
          {emoji.character}
        </button>
      ) : (
        <span className="text-[28px] leading-none">{emoji.character}</span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] leading-snug text-foreground">{emoji.meaning}</p>
        {emoji.slug && (
          <EmojiLink
            emoji=""
            slug={emoji.slug}
            onLinkClick={onEmojiLinkClick}
            className="mt-1 inline-block text-xs font-medium text-primary-700 hover:underline"
          >
            Learn more about this emoji →
          </EmojiLink>
        )}
      </div>
    </div>
  );
}

function InterpretResultSkeleton() {
  return (
    <div data-testid="interpret-result-skeleton" className="space-y-5" aria-busy="true">
      <div role="presentation" className="space-y-3">
        <Skeleton className="h-6 w-[88%]" />
        <Skeleton className="h-6 w-[64%]" />
      </div>

      <div role="presentation" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>

      <div role="presentation" className="space-y-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  );
}

const sectionHeading = 'mb-2.5 text-base font-semibold text-foreground';

export function InterpretResult({
  result,
  isLoading,
  onEmojiClick,
  onEmojiLinkClick,
  meta,
  onReset,
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

  const getToneBadgeConfig = (tone: 'positive' | 'neutral' | 'negative') => {
    switch (tone) {
      case 'positive':
        return { className: 'bg-success-background text-success', label: 'Positive' };
      case 'negative':
        return { className: 'bg-danger-background text-danger', label: 'Negative' };
      case 'neutral':
        return { className: 'bg-primary-50 text-primary-700', label: 'Neutral' };
    }
  };

  if (isLoading) {
    return <InterpretResultSkeleton />;
  }

  const toneBadgeConfig = getToneBadgeConfig(result.metrics.overallTone);
  const suggestedTones = 'suggestedTones' in result ? result.suggestedTones : [];

  return (
    <article className={cn('flex animate-fadeIn flex-col gap-5', className)}>
      <h2 className="sr-only">Interpretation</h2>

      {/* Badges + context */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            data-testid="tone-badge"
            className={cn(
              'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold',
              toneBadgeConfig.className
            )}
          >
            {toneBadgeConfig.label} tone
          </span>
          <span
            data-testid="confidence-indicator"
            className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground"
            title="Confidence level"
          >
            {result.metrics.confidence}% confident
          </span>
        </div>
        {meta && <span className="text-[13px] text-muted-foreground">{meta}</span>}
      </div>

      {/* Original message as a chat bubble */}
      <p className="max-w-full self-start rounded-2xl rounded-bl-sm bg-muted px-4 py-2.5 text-[15px] text-foreground">
        <span className="sr-only">Original message: </span>
        {result.message}
      </p>

      {/* Verdict */}
      <p className="text-lg font-medium leading-relaxed tracking-tight text-foreground md:text-[22px]">
        {result.interpretation}
      </p>

      {/* Stat tiles */}
      <section aria-label="Tone analysis" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <ProbabilityMeter
          label="Sarcasm"
          value={result.metrics.sarcasmProbability}
          colorScheme="neutral"
          testId="sarcasm-meter"
        />
        <PassiveAggressionMeter value={result.metrics.passiveAggressionProbability} />
        <div
          data-testid="tone-tile"
          className="flex flex-col gap-2 rounded-xl border border-card-border bg-card p-3.5"
        >
          <span className="text-xs text-muted-foreground">Overall tone</span>
          <span className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            {toneBadgeConfig.label}
          </span>
        </div>
        <ProbabilityMeter
          label="Confidence"
          value={result.metrics.confidence}
          colorScheme="neutral"
          testId="confidence-meter"
        />
      </section>

      {/* Emoji Breakdown */}
      {result.emojis.length > 0 && (
        <section>
          <h3 className={sectionHeading}>Emojis in this message</h3>
          <div data-testid="emoji-breakdown-grid" className="grid gap-2">
            {result.emojis.map((emoji, index) => (
              <EmojiBreakdownCard
                key={`${emoji.character}-${index}`}
                emoji={emoji}
                index={index}
                onEmojiClick={onEmojiClick}
                onEmojiLinkClick={onEmojiLinkClick}
              />
            ))}
          </div>
        </section>
      )}

      {/* Red Flags */}
      {result.redFlags.length > 0 ? (
        <section data-testid="red-flags-section">
          <h3 className={sectionHeading}>Red flags</h3>
          <div className="flex flex-col gap-2">
            {result.redFlags.map((flag, index) => (
              <RedFlagBadge key={`${flag.type}-${index}`} flag={flag} />
            ))}
          </div>
        </section>
      ) : (
        <p
          data-testid="no-red-flags"
          className="rounded-xl bg-success-background px-3.5 py-3 text-sm text-success"
        >
          No red flags spotted.
        </p>
      )}

      {/* Reply tones (when the API provides them) */}
      {suggestedTones.length > 0 && (
        <ToneSuggestionsSection suggestions={suggestedTones} interpretationId={result.id} />
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2 border-t border-card-border pt-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          aria-label={copied ? 'Copied' : 'Copy interpretation'}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </Button>
        {copied && (
          <span role="status" className="text-sm text-success">
            Copied to clipboard
          </span>
        )}
        <ShareSection
          url={getShareUrl(result, typeof window !== 'undefined' ? window.location.origin : '')}
          title={`Emoji Interpretation: "${result.message.slice(0, 50)}${result.message.length > 50 ? '...' : ''}"`}
          description={result.interpretation.slice(0, 200)}
          contentType="interpretation"
          showLabel={false}
        />
        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset} className="ml-auto">
            New message
          </Button>
        )}
      </div>
    </article>
  );
}
