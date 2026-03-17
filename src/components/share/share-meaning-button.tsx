'use client';

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { shareEvents } from '@/lib/analytics';

export interface ShareMeaningButtonProps {
  /** The emoji character */
  emoji: string;
  /** The context type label */
  context: string;
  /** The meaning text */
  meaning: string;
  /** The emoji slug for the URL */
  slug: string;
  /** The index of the context meaning for anchor linking */
  index: number;
  /** Additional className */
  className?: string;
}

/**
 * Small share button for individual context meanings on emoji pages.
 * Uses native Web Share API when available, falls back to copying to clipboard.
 */
export function ShareMeaningButton({
  emoji,
  context,
  meaning,
  slug,
  index,
  className,
}: ShareMeaningButtonProps) {
  const handleShare = useCallback(async () => {
    const text = `${emoji} in ${context} context: ${meaning} — KnowYourEmoji.com`;
    const url = `${window.location.origin}/emoji/${slug}#context-${index}`;

    try {
      if (navigator.share) {
        await navigator.share({ title: `${emoji} ${context} Meaning`, text, url });
        shareEvents.share('native', url, 'meaning');
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        shareEvents.copyLink(url, 'meaning');
      }
    } catch {
      // User cancelled or share failed
    }
  }, [emoji, context, meaning, slug, index]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleShare}
      aria-label={`Share ${context} meaning`}
      className={className}
      title="Share this meaning"
    >
      <span className="text-sm">📤</span>
    </Button>
  );
}
