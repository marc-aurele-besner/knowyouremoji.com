'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { shareEvents } from '@/lib/analytics';

export interface CopySectionButtonProps {
  /** The text to copy to clipboard */
  text: string;
  /** Content type for analytics tracking */
  contentType?: string;
  /** Additional className */
  className?: string;
}

/**
 * Small icon-only copy button for content sections.
 * Shows a checkmark on success, reverts after 2 seconds.
 */
export function CopySectionButton({
  text,
  contentType = 'section',
  className,
}: CopySectionButtonProps) {
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

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy to clipboard'}
      className={cn('h-8 w-8', className)}
      title={copied ? 'Copied!' : 'Copy to clipboard'}
    >
      <span className="text-sm">{copied ? '✓' : '📋'}</span>
    </Button>
  );
}
