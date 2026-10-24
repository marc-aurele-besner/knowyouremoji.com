/**
 * Card used to display a guide in lists — index page, related-guides
 * sections, and the homepage featured strip.
 *
 * Renders a server component (no `'use client'`) so it can be embedded
 * directly inside SSG pages without an extra client boundary.
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { GuideSummary } from '@/types/guide';

export interface GuideCardProps {
  /** Summary data for the guide being rendered. */
  guide: GuideSummary;
  /** Optional className passthrough for layout tweaks. */
  className?: string;
  /** Test id on the card link (defaults to `guide-card`). */
  testId?: string;
}

/**
 * Format an ISO date string for display. Falls back to the raw string
 * when the value can't be parsed so the UI never breaks on bad input.
 */
function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Single guide preview card: hero emoji, serif headline, clamped dek and a
 * date · reading-time · tag line. The whole card is one link.
 */
export function GuideCard({ guide, className, testId = 'guide-card' }: GuideCardProps) {
  const tag = guide.tags[0];
  return (
    <Link
      href={`/guides/${guide.slug}`}
      aria-label={guide.title}
      data-testid={testId}
      data-slug={guide.slug}
      className={cn(
        'flex h-full flex-col gap-2.5 rounded-2xl border border-card-border bg-card p-[22px] text-foreground',
        'transition-[border-color,box-shadow] duration-150 hover:border-primary-500/60 hover:shadow-soft',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
        className
      )}
    >
      {guide.heroEmoji && (
        <span className="emoji-display text-[30px] leading-none" aria-hidden="true">
          {guide.heroEmoji}
        </span>
      )}
      <h3 className="font-serif text-2xl font-normal leading-[1.15] tracking-[-0.005em]">
        {guide.title}
      </h3>
      <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
        {guide.description}
      </p>
      <p className="mt-auto pt-1 text-[13px] text-muted-foreground">
        {formatDate(guide.publishedAt)} · {guide.readingTimeMinutes} min read
        {tag ? ` · ${tag}` : ''}
      </p>
    </Link>
  );
}
