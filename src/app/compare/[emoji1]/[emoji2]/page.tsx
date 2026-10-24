import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getAllComparisons,
  getAllComparisonSlugs,
  getComparisonBySlug,
} from '@/lib/comparison-data';
import { getEmojiBySlug } from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { cn } from '@/lib/utils';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { Button } from '@/components/ui/button';
import { SwapIcon } from '@/components/emoji/emoji-icons';
import {
  BADGE_CLASS,
  chipClass,
  getContextLabel,
  getGenerationLabel,
  riskBadgeClass,
} from '@/components/emoji/emoji-labels';
import type { Emoji } from '@/types/emoji';
import type { EmojiComparison } from '@/types/comparison';

interface ComparePageProps {
  params: Promise<{ emoji1: string; emoji2: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for comparison pages
 */
export const revalidate = 3600;

/**
 * Find a curated comparison for two emoji slugs. Comparisons are looked up by
 * their slug first (`${emoji1}-${emoji2}`) and then by the pair of emoji slugs,
 * so URLs built from `emoji1Slug/emoji2Slug` always resolve.
 * `reversed` is true when the URL lists the emojis in the opposite order.
 */
function findComparison(
  emoji1Slug: string,
  emoji2Slug: string
): { comparison: EmojiComparison; reversed: boolean } | undefined {
  const direct =
    getComparisonBySlug(`${emoji1Slug}-${emoji2Slug}`) ??
    getAllComparisons().find((c) => c.emoji1Slug === emoji1Slug && c.emoji2Slug === emoji2Slug);
  if (direct) return { comparison: direct, reversed: false };

  const reverse =
    getComparisonBySlug(`${emoji2Slug}-${emoji1Slug}`) ??
    getAllComparisons().find((c) => c.emoji1Slug === emoji2Slug && c.emoji2Slug === emoji1Slug);
  if (reverse) return { comparison: reverse, reversed: true };

  return undefined;
}

/**
 * Generate static params for all comparison pages at build time
 */
export async function generateStaticParams() {
  const slugs = getAllComparisonSlugs();
  return slugs
    .map((slug) => {
      const comparison = getComparisonBySlug(slug);
      if (!comparison) return null;
      return {
        emoji1: comparison.emoji1Slug,
        emoji2: comparison.emoji2Slug,
      };
    })
    .filter(Boolean);
}

/**
 * Generate metadata for the comparison page
 */
export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { emoji1: emoji1Slug, emoji2: emoji2Slug } = await params;
  const found = findComparison(emoji1Slug, emoji2Slug);

  if (!found) {
    return {};
  }

  const comparison = found.comparison;

  if (found.reversed) {
    const reversed = comparison;
    return {
      title: reversed.seoTitle,
      description: reversed.seoDescription,
      keywords: [
        `${reversed.emoji1Slug} vs ${reversed.emoji2Slug}`,
        'emoji comparison',
        'emoji meaning',
      ],
      alternates: {
        canonical: `${getEnv().appUrl}/compare/${reversed.emoji1Slug}/${reversed.emoji2Slug}`,
      },
      openGraph: {
        title: reversed.seoTitle,
        description: reversed.seoDescription,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: reversed.seoTitle,
        description: reversed.seoDescription,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/compare/${emoji1Slug}/${emoji2Slug}`;

  return {
    title: comparison.seoTitle,
    description: comparison.seoDescription,
    keywords: [`${emoji1Slug} vs ${emoji2Slug}`, 'emoji comparison', 'emoji meaning'],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: comparison.seoTitle,
      description: comparison.seoDescription,
      type: 'website',
      url: pageUrl,
      siteName: env.appName,
    },
    twitter: {
      card: 'summary',
      title: comparison.seoTitle,
      description: comparison.seoDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * One side of the comparison: emoji tile, name, TL;DR, context meanings and
 * generational notes from the emoji data.
 */
function CompareColumn({ emoji, label }: { emoji: Emoji; label: string }) {
  return (
    <article className="flex flex-col gap-4 rounded-2xl border border-card-border bg-card p-6">
      <span className="eyebrow">{label}</span>
      <Link
        href={`/emoji/${emoji.slug}`}
        className="flex items-center gap-4 rounded-2xl text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        aria-label={`Learn more about ${emoji.name}`}
      >
        <span className="flex h-[88px] w-[88px] flex-none items-center justify-center rounded-[24px] bg-primary-50">
          <span className="emoji-display text-[56px]" aria-hidden="true">
            {emoji.character}
          </span>
        </span>
        <span className="min-w-0">
          <span className="block text-[26px] font-semibold tracking-tight">{emoji.name}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {emoji.unicode
              .split('-')
              .map((code) => `U+${code}`)
              .join(' ')}
          </span>
        </span>
      </Link>
      <p className="text-base">{emoji.tldr}</p>

      {emoji.contextMeanings.length > 0 && (
        <ul className="flex flex-col">
          {emoji.contextMeanings.map((meaning, index) => (
            <li key={index} className="border-t border-card-border py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{getContextLabel(meaning.context)}</span>
                <span className={cn(BADGE_CLASS, riskBadgeClass(meaning.riskLevel))}>
                  {meaning.riskLevel.toLowerCase()}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{meaning.meaning}</p>
            </li>
          ))}
        </ul>
      )}

      {emoji.generationalNotes.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold">Generations</h3>
          {emoji.generationalNotes.map((note, index) => (
            <p key={index} className="mt-1.5 text-[13.5px] text-muted-foreground">
              <span className="font-semibold text-foreground">
                {getGenerationLabel(note.generation)}:
              </span>{' '}
              {note.note}
            </p>
          ))}
        </div>
      )}
    </article>
  );
}

/**
 * Emoji comparison page component
 * Displays a curated comparison between two emojis
 */
export default async function ComparePage({ params }: ComparePageProps) {
  const { emoji1: emoji1Slug, emoji2: emoji2Slug } = await params;

  // Try to find comparison in either order
  const found = findComparison(emoji1Slug, emoji2Slug);

  if (!found) {
    notFound();
  }

  const { comparison, reversed } = found;
  const env = getEnv();

  // Get emoji data
  const emoji1Data = getEmojiBySlug(reversed ? comparison.emoji2Slug : comparison.emoji1Slug);
  const emoji2Data = getEmojiBySlug(reversed ? comparison.emoji1Slug : comparison.emoji2Slug);

  if (!emoji1Data || !emoji2Data) {
    notFound();
  }

  // Notes follow the order of the emojis in the URL
  const points = comparison.comparisonPoints.map((point) => ({
    aspect: point.aspect,
    first: reversed ? point.emoji2Note : point.emoji1Note,
    second: reversed ? point.emoji1Note : point.emoji2Note,
  }));

  // Other curated comparisons whose emojis both exist
  const popular = getAllComparisons()
    .filter((c) => c.slug !== comparison.slug)
    .map((c) => ({ c, a: getEmojiBySlug(c.emoji1Slug), b: getEmojiBySlug(c.emoji2Slug) }))
    .filter((item): item is { c: EmojiComparison; a: Emoji; b: Emoji } =>
      Boolean(item.a && item.b)
    );

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Compare', href: '/compare' },
    { label: `${emoji1Data.name} vs ${emoji2Data.name}` },
  ];

  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: `${emoji1Data.name} vs ${emoji2Data.name}` },
  ];

  return (
    <>
      {/* JSON-LD structured data for breadcrumbs */}
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-8 md:pt-10">
        <Breadcrumbs items={breadcrumbItems} className="mb-5 text-[13px]" />

        {/* Page head */}
        <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
              <span className="emoji-display">{emoji1Data.character}</span>{' '}
              <span className="accent-serif">vs</span>{' '}
              <span className="emoji-display">{emoji2Data.character}</span>
            </h1>
            <p className="mt-2 max-w-2xl text-[17px] text-muted-foreground">
              {comparison.seoDescription}
            </p>
          </div>
          <Button asChild variant="outline">
            <Link
              href={`/compare/${emoji2Data.slug}/${emoji1Data.slug}`}
              aria-label={`Swap: ${emoji2Data.name} vs ${emoji1Data.name}`}
            >
              <SwapIcon />
              Swap
            </Link>
          </Button>
        </header>

        {/* Key differences */}
        <section
          aria-labelledby="comparison-heading"
          className="mb-5 rounded-2xl border border-card-border bg-card p-5 md:p-6"
        >
          <h2 id="comparison-heading" className="mb-3 text-lg font-semibold tracking-tight">
            Key Differences
          </h2>
          <div className="divide-y divide-card-border">
            {points.map((point, index) => (
              <div
                key={index}
                className="grid gap-3 py-4 first:pt-0 last:pb-0 md:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)] md:gap-5"
              >
                <h3 className="font-semibold">{point.aspect}</h3>
                <p className="text-sm text-muted-foreground">
                  <span className="mr-1.5 text-base" aria-hidden="true">
                    {emoji1Data.character}
                  </span>
                  <span className="sr-only">{emoji1Data.name}: </span>
                  {point.first}
                </p>
                <p className="text-sm text-muted-foreground">
                  <span className="mr-1.5 text-base" aria-hidden="true">
                    {emoji2Data.character}
                  </span>
                  <span className="sr-only">{emoji2Data.name}: </span>
                  {point.second}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Side-by-side columns (stack on mobile) */}
        <div className="grid gap-5 md:grid-cols-2">
          <CompareColumn emoji={emoji1Data} label="Emoji 1" />
          <CompareColumn emoji={emoji2Data} label="Emoji 2" />
        </div>

        {/* Popular comparisons */}
        {popular.length > 0 && (
          <section aria-labelledby="popular-comparisons-heading" className="mt-14">
            <h2
              id="popular-comparisons-heading"
              className="mb-3 text-[22px] font-semibold tracking-tight"
            >
              Popular comparisons
            </h2>
            <ul className="flex flex-wrap gap-2">
              {popular.map(({ c, a, b }) => (
                <li key={c.slug}>
                  <Link
                    href={`/compare/${c.emoji1Slug}/${c.emoji2Slug}`}
                    className={chipClass()}
                    aria-label={`${a.name} vs ${b.name}`}
                  >
                    <span className="emoji-display">{a.character}</span> vs{' '}
                    <span className="emoji-display">{b.character}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
    </>
  );
}
