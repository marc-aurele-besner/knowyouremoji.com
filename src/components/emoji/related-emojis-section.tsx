'use client';

import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { emojiEvents } from '@/lib/analytics';
import { EmojiCard, emojiGridClass } from '@/components/emoji/emoji-card';

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
 * RelatedEmojisSection displays emojis related to the current emoji
 * at the bottom of emoji detail pages as a dense grid of emoji cards
 * that link to their respective detail pages.
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
  const pathname = usePathname();

  // Extract the source slug from the current path (e.g., /emoji/fire -> fire)
  const sourceSlug = pathname?.split('/').pop() || '';

  if (emojis.length === 0) {
    return null;
  }

  return (
    <section
      className={cn('mt-14', className)}
      aria-labelledby="related-emojis-heading"
      role="region"
    >
      <h2
        id="related-emojis-heading"
        className="mb-5 text-2xl font-semibold tracking-tight text-foreground"
      >
        Related emojis
      </h2>

      <ul role="list" className={emojiGridClass(true)}>
        {emojis.map((emoji) => (
          <li key={emoji.slug}>
            <EmojiCard
              emoji={emoji}
              compact
              ariaLabel={`${emoji.name} emoji`}
              onClick={() => emojiEvents.relatedClick(emoji.character, emoji.slug, sourceSlug)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
