import Link from 'next/link';
import type { MouseEvent } from 'react';
import { cn } from '@/lib/utils';

/**
 * Minimal data needed to render an emoji card.
 */
export interface EmojiCardData {
  slug: string;
  character: string;
  name: string;
  tldr?: string;
  /** Category slug (used by the quick view) */
  category?: string;
  /** Optional context meanings exposed to the quick view */
  contexts?: unknown[];
}

export interface EmojiCardProps {
  emoji: EmojiCardData;
  /** Show the clamped TL;DR line under the name */
  showTldr?: boolean;
  /** Dense variant: centered, smaller, no TL;DR */
  compact?: boolean;
  /** Optional click handler (client components only) */
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  /** Override the accessible name (defaults to the emoji name) */
  ariaLabel?: string;
  /**
   * Expose the card's data as `data-quick-*` attributes so a surrounding
   * `EmojiQuickViewRegion` can open the quick view without client props.
   */
  quickView?: boolean;
  className?: string;
}

/**
 * Emoji card (`.ecard`): a real link to the emoji page showing the emoji,
 * its name and optionally a three-line TL;DR. Server-safe; pass `onClick`
 * only from client components.
 */
export function EmojiCard({
  emoji,
  showTldr = false,
  compact = false,
  onClick,
  ariaLabel,
  quickView = false,
  className,
}: EmojiCardProps) {
  const quickViewData = quickView
    ? {
        'data-quick-slug': emoji.slug,
        'data-quick-character': emoji.character,
        'data-quick-name': emoji.name,
        'data-quick-category': emoji.category ?? '',
        'data-quick-tldr': emoji.tldr ?? '',
        ...(emoji.contexts?.length
          ? { 'data-quick-contexts': JSON.stringify(emoji.contexts) }
          : {}),
      }
    : {};

  return (
    <Link
      {...quickViewData}
      href={`/emoji/${emoji.slug}`}
      onClick={onClick}
      aria-label={ariaLabel ?? emoji.name}
      className={cn(
        'group flex h-full w-full flex-col gap-2 rounded-2xl border border-card-border bg-card text-left text-foreground emoji-card-hover',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        compact ? 'items-center px-2 py-3.5 text-center' : 'min-h-[150px] p-4',
        className
      )}
      data-testid="emoji-card"
    >
      <span
        className={cn('emoji-display inline-block', compact ? 'text-[32px]' : 'text-[40px]')}
        role="img"
        aria-hidden="true"
      >
        {emoji.character}
      </span>
      <span
        className={cn(
          'block max-w-full truncate font-semibold text-foreground',
          compact ? 'text-[12.5px]' : 'text-[14.5px]'
        )}
      >
        {emoji.name}
      </span>
      {showTldr && !compact && emoji.tldr && (
        <span className="line-clamp-3 text-[13px] leading-snug text-muted-foreground">
          {emoji.tldr}
        </span>
      )}
    </Link>
  );
}

/** Responsive auto-fill grid classes for card and dense layouts. */
export function emojiGridClass(compact = false): string {
  return compact
    ? 'grid grid-cols-[repeat(auto-fill,minmax(96px,1fr))] gap-3'
    : 'grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3 sm:grid-cols-[repeat(auto-fill,minmax(168px,1fr))]';
}
