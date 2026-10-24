'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { shareEvents } from '@/lib/analytics';
import { CheckIcon, CopyIcon } from '@/components/emoji/emoji-icons';

export interface CopyTextButtonProps {
  /** The text to copy to clipboard */
  text: string;
  /** Content type for analytics tracking */
  contentType?: string;
  /** Visible label. When omitted the button is icon-only. */
  label?: string;
  /** Accessible name (defaults to "Copy to clipboard") */
  ariaLabel?: string;
  /** Additional className */
  className?: string;
}

/**
 * Copy button for content snippets on the emoji pages (TL;DR, meanings,
 * platform notes). Icon-only by default; pass `label` for a small text pill.
 * Shows a check for two seconds after a successful copy.
 */
export function CopyTextButton({
  text,
  contentType = 'section',
  label,
  ariaLabel = 'Copy to clipboard',
  className,
}: CopyTextButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not available');
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      shareEvents.copyLink(window.location.href, contentType);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }, [text, contentType]);

  const icon = copied ? <CheckIcon size={14} /> : <CopyIcon size={14} />;

  if (label) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        aria-label={copied ? 'Copied' : ariaLabel}
        className={cn('h-8 px-2.5 text-[13px] text-muted-foreground', className)}
      >
        {icon}
        {copied ? 'Copied' : label}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : ariaLabel}
      title={copied ? 'Copied!' : ariaLabel}
      className={cn('h-9 w-9', className)}
    >
      {icon}
    </Button>
  );
}
