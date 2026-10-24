import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Breadcrumbs, type BreadcrumbItem } from '@/components/layout/breadcrumbs';
import { EmojiGrid } from '@/components/emoji/emoji-grid';
import type { QuickViewEmoji } from '@/components/emoji/emoji-quick-view';
import {
  BADGE_CLASS,
  BUBBLE_CLASS,
  chipClass,
  riskBadgeClass,
} from '@/components/emoji/emoji-labels';
import type { RiskLevel } from '@/types/emoji';

/** A sibling hub of the same kind (e.g. another generation). */
export interface EmojiHubSibling {
  label: string;
  href: string;
  active?: boolean;
}

/** A highlighted example card linking to an emoji page. */
export interface EmojiHubHighlight {
  slug: string;
  character: string;
  name: string;
  /** The hub-specific note or meaning */
  text: string;
  riskLevel?: RiskLevel;
  example?: string;
}

export interface EmojiHubPageProps {
  breadcrumbs: BreadcrumbItem[];
  title: ReactNode;
  description: string;
  /** e.g. "35 emojis in this category" */
  countLabel: string;
  siblings: EmojiHubSibling[];
  /** Accessible name of the sibling chip navigation */
  siblingsLabel: string;
  highlights?: EmojiHubHighlight[];
  highlightsTitle?: string;
  emojis: QuickViewEmoji[];
  /** Visually hidden h2 above the grid */
  gridHeading: string;
  emptyTitle: string;
  emptyDescription?: string;
}

/**
 * Shared layout for the category / context / generation / platform hub
 * pages: page head, sibling chips, optional highlighted examples, and the
 * emoji grid (cards open a quick-view drawer; they remain real links).
 */
export function EmojiHubPage({
  breadcrumbs,
  title,
  description,
  countLabel,
  siblings,
  siblingsLabel,
  highlights = [],
  highlightsTitle = 'Highlights',
  emojis,
  gridHeading,
  emptyTitle,
  emptyDescription = 'Check back soon — we add new write-ups every week.',
}: EmojiHubPageProps) {
  return (
    <main className="container mx-auto max-w-6xl px-4 pb-20 pt-8 md:pt-10">
      <Breadcrumbs items={breadcrumbs} className="mb-5 text-[13px]" />

      <header className="mb-7">
        <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
          {title}
        </h1>
        <p className="mt-2 max-w-2xl text-[17px] text-muted-foreground">{description}</p>
        <p className="mt-2 text-sm text-muted-foreground">{countLabel}</p>
      </header>

      {siblings.length > 0 && (
        <nav aria-label={siblingsLabel} className="mb-7">
          <ul className="flex flex-wrap gap-2">
            {siblings.map((sibling) => (
              <li key={sibling.href}>
                <Link
                  href={sibling.href}
                  aria-current={sibling.active ? 'page' : undefined}
                  className={chipClass(sibling.active)}
                >
                  {sibling.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {highlights.length > 0 && (
        <section aria-labelledby="hub-highlights-heading" className="mb-10">
          <h2 id="hub-highlights-heading" className="eyebrow mb-3">
            {highlightsTitle}
          </h2>
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,280px),1fr))] gap-3">
            {highlights.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/emoji/${item.slug}`}
                  className={cn(
                    'flex h-full flex-col gap-2 rounded-2xl border border-card-border bg-card p-[18px] text-foreground transition-colors hover:border-primary-500',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="text-[15px] font-semibold">
                      <span className="emoji-display mr-1.5" aria-hidden="true">
                        {item.character}
                      </span>
                      {item.name}
                    </span>
                    {item.riskLevel && (
                      <span className={cn(BADGE_CLASS, riskBadgeClass(item.riskLevel))}>
                        {item.riskLevel.toLowerCase()} risk
                      </span>
                    )}
                  </span>
                  <span className="text-[14.5px] leading-relaxed text-muted-foreground">
                    {item.text}
                  </span>
                  {item.example && <span className={BUBBLE_CLASS}>{item.example}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {emojis.length > 0 ? (
        <section aria-labelledby="emojis-heading">
          <h2 id="emojis-heading" className="sr-only">
            {gridHeading}
          </h2>
          <EmojiGrid emojis={emojis} showTldr quickView ariaLabel={gridHeading} />
        </section>
      ) : (
        <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center">
          <span className="emoji-display text-4xl" aria-hidden="true">
            🔍
          </span>
          <p className="text-[17px] font-semibold text-foreground">{emptyTitle}</p>
          <p className="text-muted-foreground">{emptyDescription}</p>
          <Link href="/emoji" className={cn(chipClass(), 'mt-1')}>
            Browse all emojis
          </Link>
        </div>
      )}
    </main>
  );
}

/**
 * Pick up to `limit` emojis to feature on a hub, preferring entries with
 * deep (fully written) content.
 */
export function pickHubHighlights<T extends { contentTier?: string }>(items: T[], limit = 4): T[] {
  const deep = items.filter((item) => item.contentTier === 'deep');
  const rest = items.filter((item) => item.contentTier !== 'deep');
  return [...deep, ...rest].slice(0, limit);
}
