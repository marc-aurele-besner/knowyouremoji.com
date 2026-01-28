'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

/**
 * Related emoji data for display
 */
export interface RelatedEmoji {
  /** URL-friendly identifier */
  slug: string;
  /** The actual emoji character */
  character: string;
  /** Full name of the emoji */
  name: string;
  /** Quick summary of real-world usage */
  tldr: string;
}

/**
 * Props for the RelatedEmojisSection component
 */
export interface RelatedEmojisSectionProps {
  /** Array of related emojis to display */
  emojis: RelatedEmoji[];
  /** Additional CSS class names */
  className?: string;
}

/**
 * Link icon component
 */
function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="link-icon"
      className={cn('w-6 h-6', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

/**
 * Chevron down icon component
 */
function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="chevron-down-icon"
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

/**
 * Chevron up icon component
 */
function ChevronUpIcon({ className }: { className?: string }) {
  return (
    <svg
      data-testid="chevron-up-icon"
      className={cn('w-5 h-5', className)}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}

/**
 * Individual related emoji card component
 */
function RelatedEmojiCard({ emoji }: { emoji: RelatedEmoji }) {
  return (
    <Link
      href={`/emoji/${emoji.slug}`}
      className="block border rounded-lg p-4 bg-card dark:bg-card hover:border-primary hover:shadow-md transition-all"
      aria-label={`${emoji.name} emoji`}
    >
      <div className="text-center">
        <span className="text-4xl mb-2 block">{emoji.character}</span>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">
          {emoji.name}
        </h3>
        <p className="text-xs text-muted-foreground line-clamp-2">{emoji.tldr}</p>
      </div>
    </Link>
  );
}

/**
 * RelatedEmojisSection displays emojis related to the current emoji
 * at the bottom of emoji detail pages. Emojis are displayed as clickable
 * cards that link to their respective detail pages.
 *
 * @example
 * ```tsx
 * <RelatedEmojisSection
 *   emojis={[
 *     { slug: 'fire', character: '🔥', name: 'Fire', tldr: 'Hot or cool' },
 *     { slug: 'sparkles', character: '✨', name: 'Sparkles', tldr: 'Magic' },
 *   ]}
 * />
 * ```
 */
export function RelatedEmojisSection({ emojis, className }: RelatedEmojisSectionProps) {
  const [expanded, setExpanded] = useState(true);

  const toggleExpand = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (emojis.length === 0) {
    return null;
  }

  return (
    <section
      className={cn('my-8', className)}
      aria-labelledby="related-emojis-heading"
      role="region"
    >
      <button
        onClick={toggleExpand}
        className="flex items-center justify-between w-full text-left mb-4"
        aria-expanded={expanded}
      >
        <h2
          id="related-emojis-heading"
          className="text-2xl font-bold flex items-center gap-2 text-gray-900 dark:text-gray-100"
        >
          <LinkIcon />
          Related Emojis
        </h2>
        {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>

      {expanded && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {emojis.map((emoji) => (
            <RelatedEmojiCard key={emoji.slug} emoji={emoji} />
          ))}
        </div>
      )}
    </section>
  );
}
