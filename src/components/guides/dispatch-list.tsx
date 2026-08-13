/**
 * Dispatch-list — the editorial list layout for the /guides index.
 *
 * Renders guides as numbered rows in a single column, in the style of a
 * magazine table of contents. The first (latest) dispatch is given a
 * "hero" treatment with an oversized specimen-stamp and a wider layout;
 * subsequent dispatches are tighter lines. Visual rhythm comes from
 * horizontal-rule dividers, not card chrome — guides are reading, not
 * browsing.
 */

import Link from 'next/link';
import type { GuideSummary } from '@/types/guide';

export interface DispatchListProps {
  /** Guides in display order (newest first). */
  guides: GuideSummary[];
}

/** Format an ISO date for the byline strip. */
function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Zero-padded dispatch number, e.g. 01, 02, 03. */
function dispatchNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/**
 * Single dispatch row. The latest guide (index === 0) gets the hero
 * treatment; the rest are compact one-line rows.
 */
function DispatchRow({
  guide,
  index,
  isLatest,
}: {
  guide: GuideSummary;
  index: number;
  isLatest: boolean;
}) {
  const href = `/guides/${guide.slug}`;
  const num = dispatchNumber(index);

  if (isLatest) {
    return (
      <Link
        href={href}
        className="guides-dispatch group block py-10 md:py-14 px-4 md:px-8"
        aria-label={guide.title}
        data-testid="guide-dispatch-latest"
      >
        <article className="grid gap-6 md:gap-10 md:grid-cols-[auto_1fr] items-start">
          <div className="flex flex-col items-start gap-4">
            <span className="guides-dispatch-number text-3xl md:text-5xl" aria-hidden="true">
              №{num}
            </span>
            {guide.heroEmoji && (
              <span
                className="guides-stamp guides-stamp--hero text-6xl md:text-7xl"
                aria-hidden="true"
              >
                {guide.heroEmoji}
              </span>
            )}
          </div>
          <div className="min-w-0">
            <p className="guides-byline mb-3">
              <span className="text-red-700 dark:text-red-400 font-bold">Latest dispatch</span>
              <span className="mx-3 opacity-50">/</span>
              <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
              <span className="mx-3 opacity-50">·</span>
              <span>{guide.readingTimeMinutes} min read</span>
            </p>
            <h2 className="guides-wordmark text-3xl md:text-5xl text-stone-900 dark:text-stone-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
              {guide.title}
            </h2>
            <p className="guides-lede mt-4">{guide.description}</p>
            {guide.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {guide.tags.slice(0, 4).map((tag) => (
                  <span key={tag} className="guides-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="guides-dispatch group block py-6 md:py-7 px-4 md:px-8"
      aria-label={guide.title}
      data-testid="guide-dispatch"
    >
      <article className="grid gap-4 md:gap-6 md:grid-cols-[5rem_1fr_auto] items-baseline">
        <span className="guides-dispatch-number text-2xl md:text-3xl" aria-hidden="true">
          №{num}
        </span>
        <div className="min-w-0">
          <h3 className="guides-wordmark text-2xl md:text-3xl text-stone-900 dark:text-stone-50 group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors leading-tight">
            {guide.title}
          </h3>
          <p className="mt-1 text-sm text-stone-600 dark:text-stone-400 line-clamp-2 max-w-2xl">
            {guide.description}
          </p>
        </div>
        <div className="text-left md:text-right">
          <p className="guides-byline">
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
          </p>
          <p className="guides-byline mt-1 opacity-70">{guide.readingTimeMinutes} min read</p>
          {guide.heroEmoji && (
            <span
              className="guides-stamp text-2xl mt-2 inline-block"
              aria-hidden="true"
              title={guide.title}
            >
              {guide.heroEmoji}
            </span>
          )}
        </div>
      </article>
    </Link>
  );
}

/** Editorial table-of-contents listing of every published guide. */
export function DispatchList({ guides }: DispatchListProps) {
  if (guides.length === 0) return null;
  return (
    <section
      className="guides-page border-t-2 border-b-2 border-stone-900/80 dark:border-amber-400/60"
      aria-label="All guides"
      data-testid="guides-dispatch-list"
    >
      {guides.map((guide, index) => (
        <DispatchRow key={guide.slug} guide={guide} index={index} isLatest={index === 0} />
      ))}
    </section>
  );
}
