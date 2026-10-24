/**
 * Index layout for /guides.
 *
 * The most recent guide gets a featured card (large hero emoji, serif
 * headline, dek, byline and a read link); the remaining guides follow as a
 * grid of guide cards with serif titles.
 *
 * Server component; no client interactivity.
 */

import Link from 'next/link';
import { GuideCard } from '@/components/guides/guide-card';
import type { GuideSummary } from '@/types/guide';

export interface GuidesIndexListProps {
  /** Summaries in published-descending order. */
  guides: GuideSummary[];
}

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

/** Featured card for the freshest guide. */
function FeaturedGuide({ guide }: { guide: GuideSummary }) {
  return (
    <article className="flex flex-wrap items-center gap-6 rounded-2xl border border-card-border bg-card p-6 md:gap-8 md:p-8">
      <div className="min-w-0 flex-1 basis-64">
        <p className="text-xs font-semibold uppercase tracking-[0.1em] text-primary-700">
          Latest{guide.tags[0] ? ` · ${guide.tags[0]}` : ''}
        </p>
        <h2 className="mt-2 font-serif text-3xl font-normal leading-[1.1] tracking-[-0.005em] md:text-4xl">
          <Link
            href={`/guides/${guide.slug}`}
            className="rounded-sm hover:underline hover:decoration-1 hover:underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            data-testid="guides-featured-title"
          >
            {guide.title}
          </Link>
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{guide.description}</p>
        <p className="mt-3 text-[13px] text-muted-foreground">
          {formatDate(guide.publishedAt)} · {guide.author} · {guide.readingTimeMinutes} min read
        </p>
        <Link
          href={`/guides/${guide.slug}`}
          aria-label={`Read the guide: ${guide.title}`}
          className="mt-5 inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
        >
          Read the guide
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

/**
 * Renders the /guides index. The first guide gets a featured card;
 * subsequent guides render as a card grid. When there are zero guides we
 * render a friendly empty state.
 */
export function GuidesIndexList({ guides }: GuidesIndexListProps) {
  if (guides.length === 0) {
    return (
      <div
        className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center text-muted-foreground"
        data-testid="guides-empty"
      >
        <span className="text-4xl" aria-hidden="true">
          📖
        </span>
        <p className="text-[17px] font-semibold text-foreground">No guides yet.</p>
        <p className="text-sm">The first guides are being written — check back soon.</p>
      </div>
    );
  }

  const [featured, ...rest] = guides;

  return (
    <div className="space-y-14" data-testid="guides-index-list">
      <FeaturedGuide guide={featured} />

      {rest.length > 0 && (
        <section aria-labelledby="guides-more-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
            <h2
              id="guides-more-heading"
              className="text-2xl font-semibold tracking-tight md:text-[28px]"
            >
              All guides
            </h2>
            <span className="text-sm text-muted-foreground">{rest.length} more</span>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
            {rest.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} testId="guides-dispatch-row" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
