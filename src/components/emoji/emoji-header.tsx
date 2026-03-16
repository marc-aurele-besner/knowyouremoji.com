'use client';

import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmojiDownloadButton } from '@/components/emoji/emoji-download-button';
import { emojiEvents } from '@/lib/analytics';

/**
 * Props for the EmojiHeader component
 */
export interface EmojiHeaderProps {
  emoji: {
    /** The emoji character */
    character: string;
    /** Full name of the emoji */
    name: string;
    /** Unicode code point (e.g., "1F600") */
    unicode: string;
    /** Shortcodes (e.g., [":grinning:", ":grinning_face:"]) */
    shortcodes: string[];
    /** URL-friendly identifier for analytics tracking */
    slug?: string;
  };
  /** Additional CSS class names */
  className?: string;
}

/**
 * EmojiHeader component displays the emoji character, name, copy button,
 * and Unicode information for an emoji detail page.
 *
 * @example
 * ```tsx
 * <EmojiHeader
 *   emoji={{
 *     character: '😀',
 *     name: 'Grinning Face',
 *     unicode: '1F600',
 *     shortcodes: [':grinning:', ':grinning_face:'],
 *   }}
 * />
 * ```
 */
export function EmojiHeader({ emoji, className }: EmojiHeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(emoji.character);
      setCopied(true);

      // Track emoji copy event
      if (emoji.slug) {
        emojiEvents.copy(emoji.character, emoji.slug);
      }

      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available, silently fail
      // Could add a fallback or error toast here
    }
  }, [emoji.character, emoji.slug]);

  // Format unicode with U+ prefix
  const formattedUnicode = emoji.unicode
    .split('-')
    .map((code) => `U+${code}`)
    .join('-');

  return (
    <header className={cn('flex flex-col items-center text-center py-10 px-4', className)}>
      {/* Emoji Character */}
      <div
        className="text-7xl md:text-9xl mb-6 select-none animate-bounce-in hover:animate-wiggle cursor-default"
        role="img"
        aria-label={emoji.name}
      >
        {emoji.character}
      </div>

      {/* Emoji Name */}
      <h1 className="text-3xl md:text-4xl font-extrabold mb-4 gradient-text">{emoji.name}</h1>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <Button
          onClick={handleCopy}
          variant={copied ? 'secondary' : 'primary'}
          size="md"
          aria-label={copied ? 'Copied!' : 'Copy emoji'}
        >
          <span className="mr-2">{copied ? '✓' : '📋'}</span>
          {copied ? 'Copied!' : 'Copy Emoji'}
        </Button>

        <EmojiDownloadButton character={emoji.character} name={emoji.name} slug={emoji.slug} />
      </div>

      {/* Unicode Info */}
      <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
        <p>
          <span className="font-medium text-gray-900 dark:text-gray-200">Unicode:</span>{' '}
          {formattedUnicode}
        </p>
        {emoji.shortcodes.length > 0 && (
          <p>
            <span className="font-medium text-gray-900 dark:text-gray-200">Shortcodes:</span>{' '}
            {emoji.shortcodes.map((code, index) => (
              <code key={code} className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-xs">
                {code}
                {index < emoji.shortcodes.length - 1 ? ' ' : ''}
              </code>
            ))}
          </p>
        )}
      </div>
    </header>
  );
}
