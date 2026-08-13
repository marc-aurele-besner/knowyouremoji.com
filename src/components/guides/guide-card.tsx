/**
 * Card used to display a guide in lists — index page, related-guides
 * sections, and the homepage featured strip.
 *
 * Renders a server component (no `'use client'`) so it can be embedded
 * directly inside SSG pages without an extra client boundary.
 */

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import type { GuideSummary } from '@/types/guide';

export interface GuideCardProps {
  /** Summary data for the guide being rendered. */
  guide: GuideSummary;
  /** Optional className passthrough for layout tweaks. */
  className?: string;
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
 * Single guide preview card. Keeps markup consistent with the combo and
 * emoji cards so the visual rhythm of the homepage and index pages stays
 * familiar to returning readers.
 */
export function GuideCard({ guide, className }: GuideCardProps) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className={`block group ${className ?? ''}`.trim()}
      aria-label={guide.title}
    >
      <Card
        data-testid="guide-card"
        className="h-full emoji-card-hover border-2 border-transparent hover:border-amber-400 dark:hover:border-amber-500 transition-colors"
      >
        <CardHeader className="pb-2">
          <div className="flex items-start gap-3">
            {guide.heroEmoji && (
              <span className="text-3xl group-hover:animate-wiggle inline-block">
                {guide.heroEmoji}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
                {guide.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {formatDate(guide.publishedAt)} · {guide.readingTimeMinutes} min read
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
            {guide.description}
          </p>
          {guide.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {guide.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
