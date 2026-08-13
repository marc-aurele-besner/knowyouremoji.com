import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  getAllGuideSlugs,
  getPublishedGuideBySlug,
  getPublishedGuideSummaries,
  deriveSeoTitle,
  deriveSeoDescription,
} from '@/lib/guide-data';
import { GuideJsonLd } from '@/components/seo/guide-json-ld';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { GuideCard } from '@/components/guides/guide-card';
import { ReadingProgress } from '@/components/guides/reading-progress';
import { ShareSection } from '@/components/share/share-section';
import { Badge } from '@/components/ui/badge';
import { getEmojiBySlug } from '@/lib/emoji-data';
import { getComboBySlug } from '@/lib/combo-data';
import { getEnv } from '@/lib/env';

interface GuidePageProps {
  params: Promise<{ slug: string }>;
}

/** Hourly ISR keeps guide edits flowing without a redeploy. */
export const revalidate = 3600;

/**
 * `generateStaticParams` enumerates every guide on disk (including drafts)
 * so unpublished drafts get a 404 in production builds — the route handler
 * itself returns `notFound()` for drafts to enforce that.
 */
export async function generateStaticParams() {
  return getAllGuideSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: GuidePageProps): Promise<Metadata> {
  const { slug } = await params;
  const guide = getPublishedGuideBySlug(slug);
  if (!guide) return {};

  const env = getEnv();
  const pageUrl = `${env.appUrl}/guides/${guide.slug}`;
  const title = deriveSeoTitle(guide);
  const description = deriveSeoDescription(guide);

  return {
    title,
    description,
    keywords: ['emoji guide', ...guide.tags],
    authors: [{ name: guide.author }],
    alternates: { canonical: pageUrl },
    openGraph: {
      type: 'article',
      url: pageUrl,
      siteName: env.appName,
      title,
      description,
      publishedTime: guide.publishedAt,
      modifiedTime: guide.updatedAt,
      authors: [guide.author],
      tags: guide.tags,
      images: [{ url: `${env.appUrl}/og-image.png`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [`${env.appUrl}/og-image.png`],
    },
    robots: { index: true, follow: true },
  };
}

/** Format an ISO date for human display. */
function formatDate(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getPublishedGuideBySlug(slug);
  if (!guide) notFound();

  const env = getEnv();
  const relatedEmojiCards = (guide.relatedEmojis ?? [])
    .map((emojiSlug) => getEmojiBySlug(emojiSlug))
    .filter((e): e is NonNullable<typeof e> => Boolean(e))
    .slice(0, 4)
    .map((e) => ({ slug: e.slug, character: e.character, name: e.name }));

  const relatedComboCards = (guide.relatedCombos ?? [])
    .map((comboSlug) => getComboBySlug(comboSlug))
    .filter((c): c is NonNullable<typeof c> => Boolean(c))
    .slice(0, 4)
    .map((c) => ({ slug: c.slug, combo: c.combo, name: c.name }));

  // Pick a handful of "more guides" suggestions, excluding the current one.
  const moreGuides = getPublishedGuideSummaries()
    .filter((summary) => summary.slug !== guide.slug)
    .slice(0, 3);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Guides', href: '/guides' },
    { label: guide.title },
  ];
  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Guides', href: '/guides' },
    { name: guide.title },
  ];

  return (
    <>
      <GuideJsonLd guide={guide} appUrl={env.appUrl} appName={env.appName} />
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      {/* Reading-progress bar is a client component that tracks scroll. */}
      <ReadingProgress targetSelector='[data-testid="guide-article"]' />

      <div className="guides-page" data-testid="guides-article-page" data-slug={guide.slug}>
        {/* Article hero — same gradient pattern as the index, then a centered title block. */}
        <section className="bg-gradient-to-b from-amber-50 via-amber-50/40 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-b border-amber-100/60 dark:border-gray-800">
          <div className="container mx-auto px-4 max-w-3xl pt-8 pb-12 md:pb-16">
            <Breadcrumbs items={breadcrumbItems} className="mb-8" />

            <div className="text-center">
              <span className="guides-eyebrow">Editorial</span>

              {guide.heroEmoji && (
                <div
                  className="mt-8 mb-6 text-7xl md:text-8xl emoji-display"
                  aria-hidden="true"
                  data-testid="guide-hero-stamp"
                >
                  {guide.heroEmoji}
                </div>
              )}

              <h1
                className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white tracking-tight leading-tight"
                data-testid="guide-title"
              >
                {guide.title}
              </h1>
              <p className="guides-lede mt-6 max-w-2xl mx-auto">{guide.description}</p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 guides-meta">
                <span>By {guide.author}</span>
                <span aria-hidden="true" className="text-amber-600 dark:text-amber-400">
                  ·
                </span>
                <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
                <span aria-hidden="true" className="text-amber-600 dark:text-amber-400">
                  ·
                </span>
                <span>{guide.readingTimeMinutes} min read</span>
              </div>

              {guide.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                  {guide.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Share row sits between the hero and the body. */}
        <div className="container mx-auto px-4 max-w-3xl mt-10 mb-8">
          <ShareSection
            url={`${env.appUrl}/guides/${guide.slug}`}
            title={guide.title}
            description={guide.description}
            hashtags={['emoji', 'emojiguide', ...guide.tags.slice(0, 2)]}
            contentType="guide"
          />
        </div>

        {/* The article body — typography handled by `.guides-article`. */}
        <article
          data-testid="guide-article"
          className="container mx-auto px-4 max-w-3xl guides-article guides-dropcap"
        >
          <div dangerouslySetInnerHTML={{ __html: guide.html }} />
        </article>

        <p className="guides-divider" aria-hidden="true">
          ✦&nbsp;✦&nbsp;✦
        </p>

        {/* Footer — related references + last-updated line. */}
        <footer className="container mx-auto px-4 max-w-3xl">
          {relatedEmojiCards.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Emojis referenced
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedEmojiCards.map((emoji) => (
                  <Link
                    key={emoji.slug}
                    href={`/emoji/${emoji.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors"
                    aria-label={`${emoji.name} emoji`}
                  >
                    <span aria-hidden="true">{emoji.character}</span>
                    <span>{emoji.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedComboCards.length > 0 && (
            <section className="mb-10">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Combos referenced
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedComboCards.map((combo) => (
                  <Link
                    key={combo.slug}
                    href={`/combo/${combo.slug}`}
                    className="inline-flex items-center gap-2 rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 text-sm text-gray-700 dark:text-gray-300 hover:border-amber-400 hover:text-amber-700 dark:hover:border-amber-500 dark:hover:text-amber-400 transition-colors"
                    aria-label={`${combo.name} combo`}
                  >
                    <span aria-hidden="true">{combo.combo}</span>
                    <span>{combo.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="guides-meta mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
            Published {formatDate(guide.publishedAt)} · Last revised {formatDate(guide.updatedAt)}
          </p>
        </footer>

        {/* More guides — keeps the reader on the site. */}
        {moreGuides.length > 0 && (
          <section className="bg-gray-50/50 dark:bg-gray-800/30 border-t border-gray-200/60 dark:border-gray-800/60 mt-16">
            <div className="container mx-auto px-4 py-16 max-w-6xl">
              <div className="text-center mb-10">
                <span className="guides-eyebrow justify-center">Keep reading</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-3">
                  More guides
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moreGuides.map((summary) => (
                  <GuideCard key={summary.slug} guide={summary} />
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/guides"
                  className="text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-medium"
                >
                  Browse all guides →
                </Link>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
