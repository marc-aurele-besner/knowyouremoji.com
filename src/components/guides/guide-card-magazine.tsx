/**
 * Magazine-style guide card — used in the /guides article-page
 * "Filed nearby" section. Sized for the editorial layout: monospace
 * dispatch number, italic serif title, dense metadata, all in the
 * site's normal white surface with amber accents.
 */

import Link from 'next/link';
import type { GuideSummary } from '@/types/guide';

export interface GuideCardMagazineProps {
  /** Summary data for the guide being rendered. */
  guide: GuideSummary;
  /** 1-indexed position in the archive (rendered as the leading number). */
  index: number;
}

/** Format an ISO date for the byline strip. */
function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

/** Zero-padded dispatch number, e.g. 001, 002. */
function dispatchNumber(index: number): string {
  return String(index + 1).padStart(3, '0');
}

/**
 * A dense, magazine-style guide card. Uses the `.guides-filed-card`
 * and `.guides-filed-card-title` classes defined in `globals.css`.
 */
export function GuideCardMagazine({ guide, index }: GuideCardMagazineProps) {
  const num = dispatchNumber(index);

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="guides-filed-card group"
      aria-label={guide.title}
    >
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <span className="guides-dispatch-number text-lg" aria-hidden="true">
          {num}
        </span>
        {guide.heroEmoji && (
          <span className="guides-stamp text-xl" aria-hidden="true" title={guide.title}>
            {guide.heroEmoji}
          </span>
        )}
      </div>
      <h3 className="guides-filed-card-title group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {guide.title}
      </h3>
      <p className="guides-meta-strip mt-3">
        <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
        <span aria-hidden="true" className="mx-2 opacity-50">
          ·
        </span>
        {guide.readingTimeMinutes} min
      </p>
      <p
        className="guides-byline mt-4 text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors"
        aria-hidden="true"
      >
        Read <span className="guides-arrow">→</span>
      </p>
    </Link>
  );
}