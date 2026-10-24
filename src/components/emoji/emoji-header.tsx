'use client';

import { useState, useCallback, type ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { EmojiDownloadButton } from '@/components/emoji/emoji-download-button';
import { CheckIcon, CopyIcon, SwapIcon } from '@/components/emoji/emoji-icons';
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
    /** Category slug (links to the category hub) */
    category?: string;
    /** Human-readable category name */
    categoryName?: string;
    /** Unicode version the emoji was introduced in */
    unicodeVersion?: string;
    /** Unicode subcategory */
    subcategory?: string;
    /** ISO date the content was last updated */
    updatedAt?: string;
  };
  /** Link to a curated comparison featuring this emoji */
  compareHref?: string;
  /** Extra actions appended to the action row (e.g. the share dialog trigger) */
  actions?: ReactNode;
  /** Additional CSS class names */
  className?: string;
}

const META_BADGE =
  'inline-flex items-center rounded-full bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground';

/**
 * EmojiHeader is the hero of the emoji detail page: the emoji in an amber
 * tile, the name as page title, monospace metadata badges and the primary
 * action row (copy, download PNG, compare, share).
 *
 * @example
 * ```tsx
 * <EmojiHeader
 *   emoji={{
 *     character: '😀',
 *     name: 'Grinning Face',
 *     unicode: '1F600',
 *     shortcodes: [':grinning:'],
 *   }}
 * />
 * ```
 */
export function EmojiHeader({ emoji, compareHref, actions, className }: EmojiHeaderProps) {
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
    }
  }, [emoji.character, emoji.slug]);

  // Format unicode with U+ prefix
  const formattedUnicode = emoji.unicode
    .split('-')
    .map((code) => `U+${code}`)
    .join('-');

  return (
    <header className={cn('flex flex-wrap items-center gap-6 md:gap-7', className)}>
      {/* Emoji tile */}
      <div className="flex h-28 w-28 flex-none items-center justify-center rounded-[28px] bg-primary-50 md:h-[132px] md:w-[132px]">
        <span
          className="emoji-display text-7xl select-none md:text-[84px]"
          role="img"
          aria-label={emoji.name}
        >
          {emoji.character}
        </span>
      </div>

      <div className="min-w-0 flex-1 basis-72">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {emoji.name}
        </h1>

        {/* Metadata badges */}
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label="Emoji details">
          <li className={META_BADGE}>{formattedUnicode}</li>
          {emoji.category && (
            <li className="flex">
              <Link
                href={`/emoji/category/${emoji.category}`}
                className={cn(
                  META_BADGE,
                  'hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                )}
              >
                {emoji.categoryName ?? emoji.category}
              </Link>
            </li>
          )}
          {emoji.unicodeVersion && <li className={META_BADGE}>Unicode {emoji.unicodeVersion}</li>}
          {emoji.subcategory && <li className={META_BADGE}>{emoji.subcategory}</li>}
          {emoji.shortcodes.map((code) => (
            <li key={code} className={META_BADGE}>
              {code}
            </li>
          ))}
          {emoji.updatedAt && <li className={META_BADGE}>Updated {emoji.updatedAt}</li>}
        </ul>

        {/* Action row */}
        <div className="mt-[18px] flex flex-wrap items-center gap-2">
          <Button
            onClick={handleCopy}
            variant="primary"
            aria-label={copied ? 'Copied!' : 'Copy emoji'}
          >
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? 'Copied!' : `Copy ${emoji.character}`}
          </Button>

          <EmojiDownloadButton character={emoji.character} name={emoji.name} slug={emoji.slug} />

          {compareHref && (
            <Button asChild variant="outline">
              <Link href={compareHref}>
                <SwapIcon />
                Compare
              </Link>
            </Button>
          )}

          {actions}
        </div>
      </div>
    </header>
  );
}
