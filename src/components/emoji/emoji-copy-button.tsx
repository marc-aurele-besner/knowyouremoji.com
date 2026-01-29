'use client';

import { useState, useCallback, forwardRef } from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { emojiEvents } from '@/lib/analytics';

export interface EmojiCopyButtonProps extends Omit<
  ButtonProps,
  'onClick' | 'children' | 'aria-label'
> {
  /** The emoji character to copy */
  emoji: string;
  /** The emoji slug for analytics tracking */
  slug?: string;
  /** Custom label text (default: "Copy Emoji") */
  label?: string;
  /** Whether to show the label text (default: true) */
  showLabel?: boolean;
  /** Delay in ms before resetting copied state (default: 2000) */
  resetDelay?: number;
  /** Callback when copy succeeds */
  onCopy?: () => void;
  /** Callback when copy fails */
  onCopyError?: (error: Error) => void;
}

/**
 * EmojiCopyButton component provides a button to copy an emoji to the clipboard
 * with visual feedback showing success state.
 *
 * @example
 * ```tsx
 * <EmojiCopyButton emoji="😀" />
 *
 * <EmojiCopyButton
 *   emoji="👨‍💻"
 *   label="Copy"
 *   size="sm"
 *   onCopy={() => console.log('Copied!')}
 * />
 *
 * <EmojiCopyButton emoji="🎉" showLabel={false} size="icon" />
 * ```
 */
const EmojiCopyButton = forwardRef<HTMLButtonElement, EmojiCopyButtonProps>(
  (
    {
      emoji,
      slug,
      label = 'Copy Emoji',
      showLabel = true,
      resetDelay = 2000,
      onCopy,
      onCopyError,
      variant,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      if (disabled) return;

      try {
        if (!navigator.clipboard) {
          throw new Error('Clipboard API not available');
        }
        await navigator.clipboard.writeText(emoji);
        setCopied(true);

        // Track emoji copy event
        if (slug) {
          emojiEvents.copy(emoji, slug);
        }

        onCopy?.();
        setTimeout(() => setCopied(false), resetDelay);
      } catch (error) {
        onCopyError?.(error instanceof Error ? error : new Error('Copy failed'));
      }
    }, [emoji, slug, resetDelay, onCopy, onCopyError, disabled]);

    const displayLabel = copied ? 'Copied!' : label;
    const icon = copied ? '✓' : '📋';

    return (
      <Button
        ref={ref}
        onClick={handleCopy}
        variant={variant ?? (copied ? 'secondary' : 'primary')}
        aria-label={showLabel ? displayLabel : label}
        disabled={disabled}
        className={cn(className)}
        {...props}
      >
        <span className={showLabel ? 'mr-2' : ''}>{icon}</span>
        {showLabel && displayLabel}
      </Button>
    );
  }
);

EmojiCopyButton.displayName = 'EmojiCopyButton';

export { EmojiCopyButton };
