/**
 * Dispatch-list — the editorial archive layout for the /guides index.
 *
 * The list is structured as a magazine archive:
 *  - The latest dispatch is rendered as a large, asymmetric "lead" card
 *    with an oversized monospace dispatch number, the hero emoji, and
 *    a heavy italic serif headline.
 *  - Subsequent dispatches are tighter, three-column rows in the
 *    style of a magazine TOC — number · title · metadata · emoji.
 *  - All set on the site's standard white surface with amber accents.
 */

import Link from 'next/link';
import type { GuideSummary } from '@/types/guide';

export interface DispatchListProps {
  /** Guides in display order (newest first). */
  guides: GuideSummary[];
}

/** Format an ISO date for the archive row. */
function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

/** Zero-padded dispatch number, e.g. 01, 02, 03. */
function dispatchNumber(index: number): string {
  return String(index + 1).padStart(2, '0');
}

/**
 * The latest dispatch — the "lead" of the issue. Driven by an
 * asymmetric grid: dispatch number on the left, stamp below, then
 * the headline + byline + lede on the right.
 */
function LatestDispatch({ guide, index }: { guide: GuideSummary; index: number }) {
  const href = `/guides/${guide.slug}`;
  const num = dispatchNumber(index);

  return (
    <Link
      href={href}
      className="guides-dispatch group block py-12 md:py-20 px-4 md:px-10"
      aria-label={guide.title}
      data-testid="guide-dispatch-latest"
    >
      <article className="grid gap-8 md:gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start">
        {/* Left rail — number + stamp, dead-set on the page. */}
        <div className="flex flex-col items-start gap-6 md:gap-8">
          <div className="flex items-baseline gap-3">
            <span className="guides-byline">№</span>
            <span className="guides-dispatch-number text-6xl md:text-8xl" aria-hidden="true">
              {num}
            </span>
          </div>
          {guide.heroEmoji && (
            <span
              className="guides-stamp guides-stamp--hero text-6xl md:text-8xl"
              aria-hidden="true"
            >
              {guide.heroEmoji}
            </span>
          )}
          <p className="guides-annotation hidden md:block">
            Filed {formatDate(guide.publishedAt)}
            <br />
            &mdash; {guide.readingTimeMinutes} min read
          </p>
        </div>

        {/* Right block — title, lede, tags, footer. */}
        <div className="min-w-0">
          <p className="guides-eyebrow mb-6">Lead dispatch</p>
          <h2 className="guides-wordmark text-4xl md:text-7xl text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {guide.title}
          </h2>
          <p className="guides-lede mt-6 max-w-2xl">{guide.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-4 guides-byline">
            <span>By {guide.author}</span>
            <span aria-hidden="true" className="text-amber-600 dark:text-amber-400">
              |
            </span>
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
            <span aria-hidden="true" className="text-amber-600 dark:text-amber-400">
              |
            </span>
            <span>{guide.readingTimeMinutes} min</span>
          </div>

          {guide.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {guide.tags.slice(0, 4).map((tag) => (
                <span key={tag} className="guides-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <p
            className="mt-10 guides-byline text-amber-600 dark:text-amber-400 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors"
            aria-hidden="true"
          >
            Read dispatch <span className="guides-arrow">→</span>
          </p>
        </div>
      </article>
    </Link>
  );
}

/** An archive row — dense, three-column, monospace lead. */
function ArchiveRow({ guide, index }: { guide: GuideSummary; index: number }) {
  const href = `/guides/${guide.slug}`;
  const num = dispatchNumber(index);

  return (
    <Link
      href={href}
      className="guides-dispatch group block py-5 md:py-6 px-4 md:px-10"
      aria-label={guide.title}
      data-testid="guide-dispatch"
    >
      <article className="grid gap-3 md:gap-6 md:grid-cols-[5rem_minmax(0,1fr)_8rem_3rem] items-baseline">
        <span className="guides-dispatch-number text-2xl md:text-3xl" aria-hidden="true">
          {num}
        </span>
        <div className="min-w-0">
          <h3 className="guides-wordmark text-xl md:text-2xl text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-tight">
            {guide.title}
          </h3>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 max-w-2xl">
            {guide.description}
          </p>
        </div>
        <div className="hidden md:block">
          <p className="guides-meta-strip">
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
          </p>
          <p className="guides-meta-strip mt-1 opacity-70">{guide.readingTimeMinutes} min read</p>
        </div>
        <div className="flex items-center justify-end gap-3">
          {guide.heroEmoji && (
            <span
              className="guides-stamp text-xl md:text-2xl"
              aria-hidden="true"
              title={guide.title}
            >
              {guide.heroEmoji}
            </span>
          )}
          <span
            className="guides-arrow text-lg opacity-0 group-hover:opacity-100"
            aria-hidden="true"
          >
            →
          </span>
        </div>
      </article>
    </Link>
  );
}

/** Editorial archive listing of every published guide. */
export function DispatchList({ guides }: DispatchListProps) {
  if (guides.length === 0) return null;
  const [latest, ...archive] = guides;

  return (
    <section className="guides-page" aria-label="All guides" data-testid="guides-dispatch-list">
      {latest && <LatestDispatch guide={latest} index={0} />}
      {archive.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-800">
          <div className="px-4 md:px-10 py-3 flex items-center gap-3">
            <span className="guides-eyebrow">Archive</span>
            <span className="guides-byline opacity-60">
              {archive.length} {archive.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
          {archive.map((guide, i) => (
            <ArchiveRow key={guide.slug} guide={guide} index={i + 1} />
          ))}
        </div>
      )}
    </section>
  );
}
