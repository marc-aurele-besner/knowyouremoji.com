/**
 * Editorial "table of contents" layout for the /guides index.
 *
 * Replaces the small uniform card grid with a magazine-style TOC: the most
 * recent guide gets a featured spread (large hero emoji, italic-serif
 * headline, dek, mono byline, read CTA), and the remaining guides stack
 * as horizontal "dispatch" rows separated by hairline rules.
 *
 * The composition is intentionally asymmetric and card-less — the hero
 * spread anchors the page, the rows below carry a mono serial number, a
 * tag-kicker, and a one-line dek so each guide reads at a glance without
 * filling the viewport with identical rectangles.
 *
 * Server component; no client interactivity.
 */

import Link from 'next/link';
import type { GuideSummary } from '@/types/guide';

export interface GuidesIndexListProps {
  /** Summaries in published-descending order. */
  guides: GuideSummary[];
}

const EMPTY_BYLINE = 'Dispatch desk';

/** Format an ISO date string for display; falls back to the raw input. */
function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/** Zero-pad a 1-based serial number for the mono № column. */
function formatSerial(index: number): string {
  return index.toString().padStart(3, '0');
}

/** Single-line description used in dispatch rows. */
function truncateDescription(text: string, max = 140): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 0 ? lastSpace : max)}…`;
}

/**
 * Featured spread for the freshest guide.
 *
 * Large serif headline, oversized hero emoji on a tinted plate, mono
 * byline, amber CTA. The whole spread reads as one editorial unit.
 */
function FeaturedSpread({ guide }: { guide: GuideSummary }) {
  const byline = `${formatDate(guide.publishedAt)} · ${EMPTY_BYLINE} · ${guide.readingTimeMinutes} min read`;
  return (
    <article className="relative isolate overflow-hidden rounded-2xl border border-amber-200/70 dark:border-amber-900/40 bg-gradient-to-br from-amber-100/70 via-amber-50 to-white dark:from-amber-950/30 dark:via-gray-900 dark:to-gray-900">
      <div className="grid gap-6 px-6 py-8 md:gap-8 md:px-10 md:py-12 lg:grid-cols-[minmax(0,18rem)_1fr] lg:items-center lg:gap-14 lg:px-14 lg:py-16">
        {/* Oversized emoji plate — anchors the page visually. */}
        <div className="flex items-center justify-center lg:justify-start">
          <div
            aria-hidden="true"
            className="emoji-display grid h-40 w-40 place-items-center rounded-full bg-white shadow-[0_18px_60px_-12px_rgba(245,158,11,0.45)] ring-1 ring-amber-200 dark:bg-gray-800 dark:ring-amber-900/60 md:h-52 md:w-52 lg:h-64 lg:w-64"
          >
            <span className="text-7xl md:text-8xl lg:text-9xl">{guide.heroEmoji}</span>
          </div>
        </div>

        {/* Copy column — serif headline + mono byline + amber CTA. */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="guides-eyebrow !text-amber-700 dark:!text-amber-400">
              Featured dispatch
            </span>
            {guide.tags[0] && (
              <span className="text-xs font-mono uppercase tracking-[0.18em] text-amber-700/80 dark:text-amber-500/80">
                — {guide.tags[0]}
              </span>
            )}
          </div>

          <h2 className="mt-4 font-serif italic leading-[1.05] tracking-tight text-gray-900 dark:text-white text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem]">
            <Link
              href={`/guides/${guide.slug}`}
              className="bg-gradient-to-r from-gray-900 to-gray-900 bg-[length:0%_2px] bg-no-repeat bg-left-bottom hover:bg-[length:100%_2px] dark:from-white dark:to-white transition-[background-size] duration-500"
              data-testid="guides-featured-title"
            >
              {guide.title}
            </Link>
          </h2>

          <p className="mt-5 max-w-2xl text-base leading-relaxed text-gray-700 dark:text-gray-300 md:text-lg">
            {guide.description}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="font-mono uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              {byline}
            </span>
          </div>

          <Link
            href={`/guides/${guide.slug}`}
            className="group mt-8 inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-800 transition hover:border-amber-400 hover:bg-amber-100 hover:gap-3 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:border-amber-600 dark:hover:bg-amber-950"
          >
            Read the dispatch
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Horizontal rule-separated row for a non-featured dispatch.
 *
 * Layout — left column carries the serial number in mono; the right side
 * carries an eyebrow, sans headline, dek, and mono byline. Hover lifts the
 * amber accent on the rule + on the arrow without using a card container.
 */
function DispatchRow({ guide, index }: { guide: GuideSummary; index: number }) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group block py-8 md:py-10"
      data-testid="guides-dispatch-row"
      data-slug={guide.slug}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-start gap-x-6 gap-y-3 md:gap-x-10">
        {/* Serial number — mono, large, amber on hover, never wraps. */}
        <div className="flex flex-col items-start pt-1">
          <span
            aria-hidden="true"
            className="font-mono text-[0.7rem] uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500"
          >
            №
          </span>
          <span className="font-mono text-2xl font-medium leading-none text-gray-900 transition-colors group-hover:text-amber-600 dark:text-white dark:group-hover:text-amber-400 md:text-3xl">
            {formatSerial(index)}
          </span>
        </div>

        {/* Copy column — eyebrow, headline, dek. */}
        <div className="min-w-0">
          {guide.tags[0] && (
            <span className="guides-eyebrow !text-amber-700 dark:!text-amber-400">
              {guide.tags[0]}
            </span>
          )}

          <h3 className="mt-3 font-serif text-2xl font-semibold leading-tight tracking-tight text-gray-900 transition-colors group-hover:text-amber-700 dark:text-white dark:group-hover:text-amber-400 md:text-3xl">
            {guide.title}
          </h3>

          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-gray-600 dark:text-gray-300 md:text-base">
            {truncateDescription(guide.description)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-xs uppercase tracking-[0.16em] text-gray-500 dark:text-gray-400">
            <span>{formatDate(guide.publishedAt)}</span>
            <span aria-hidden="true" className="text-amber-600/70 dark:text-amber-500/70">
              ·
            </span>
            <span>{guide.readingTimeMinutes} min</span>
            {guide.tags.length > 1 && (
              <>
                <span aria-hidden="true" className="text-amber-600/70 dark:text-amber-500/70">
                  ·
                </span>
                <span>{guide.tags.slice(1, 3).join(' · ')}</span>
              </>
            )}
          </div>
        </div>

        {/* Trailing arrow — anchor for the hover affordance. */}
        <div className="pt-2 text-2xl text-gray-300 transition-all group-hover:translate-x-1 group-hover:text-amber-500 dark:text-gray-600 md:pt-3 md:text-3xl">
          <span aria-hidden="true">→</span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Renders the editorial /guides index. The first guide gets a featured
 * spread; subsequent guides stack as dispatch rows separated by hairline
 * rules. When there are zero guides, callers should already have rendered
 * the hero section, but we still render a friendly empty state.
 */
export function GuidesIndexList({ guides }: GuidesIndexListProps) {
  if (guides.length === 0) {
    return (
      <div className="py-20 text-center" data-testid="guides-empty">
        <p className="font-serif text-3xl italic text-gray-900 dark:text-white">
          No dispatches yet.
        </p>
        <p className="guides-meta mt-3 justify-center">
          The desk is filing its first report — check back soon.
        </p>
      </div>
    );
  }

  const [featured, ...rest] = guides;

  return (
    <div className="space-y-12 md:space-y-16" data-testid="guides-index-list">
      <FeaturedSpread guide={featured} />

      {rest.length > 0 && (
        <section aria-labelledby="guides-dispatch-heading">
          <header className="mb-2 flex items-baseline justify-between border-b border-gray-200 pb-4 dark:border-gray-800">
            <h2
              id="guides-dispatch-heading"
              className="text-sm font-mono uppercase tracking-[0.22em] text-gray-700 dark:text-gray-300"
            >
              The dispatches
            </h2>
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
              {rest.length} more on file
            </span>
          </header>

          <div className="divide-y divide-gray-200 dark:divide-gray-800">
            {rest.map((guide, i) => (
              <DispatchRow key={guide.slug} guide={guide} index={i + 2} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
