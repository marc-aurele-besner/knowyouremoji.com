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
import { GuideCardMagazine } from '@/components/guides/guide-card-magazine';
import { ReadingProgress } from '@/components/guides/reading-progress';
import { ShareSection } from '@/components/share/share-section';
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

/** Format an ISO date for the wire-ticker. */
function formatTimestamp(iso: string): string {
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toUTCString().replace('GMT', 'UTC').toUpperCase();
}

/** Get the dispatch's 1-indexed position in the published archive. */
function getDispatchNumber(slug: string): string {
  const summaries = getPublishedGuideSummaries();
  const index = summaries.findIndex((s) => s.slug === slug);
  return String((index >= 0 ? index : 0) + 1).padStart(3, '0');
}

export default async function GuidePage({ params }: GuidePageProps) {
  const { slug } = await params;
  const guide = getPublishedGuideBySlug(slug);
  if (!guide) notFound();

  const env = getEnv();
  const dispatchNum = getDispatchNumber(guide.slug);
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

      <main className="guides-page" data-testid="guides-article-page" data-slug={guide.slug}>
        {/* Issue strip — variant with the article's dispatch number. */}
        <div className="guides-ticker" aria-label="Issue status">
          <span className="guides-ticker-dot" aria-hidden="true" />
          <span>Dispatch №{dispatchNum}</span>
          <span aria-hidden="true" className="opacity-30">
            /
          </span>
          <span className="hidden sm:inline">{formatTimestamp(guide.publishedAt)}</span>
          <span aria-hidden="true" className="hidden sm:inline opacity-30">
            /
          </span>
          <span>{guide.readingTimeMinutes} min read</span>
        </div>

        {/* Hero — asymmetric masthead with the dispatch number as the anchor. */}
        <header className="container mx-auto px-4 max-w-6xl guides-masthead">
          <Breadcrumbs items={breadcrumbItems} className="mt-4 mb-10" />

          <div className="grid gap-8 md:gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] items-start">
            {/* Left rail — dispatch number, stamp, vertical mark. */}
            <div className="flex flex-col items-start gap-6 md:gap-8">
              <span className="guides-eyebrow">№ {dispatchNum}</span>
              {guide.heroEmoji && (
                <div
                  className="guides-stamp guides-stamp--article inline-block"
                  aria-hidden="true"
                  data-testid="guide-hero-stamp"
                >
                  {guide.heroEmoji}
                </div>
              )}
              <span className="guides-vertical-mark hidden md:inline-block" aria-hidden="true">
                FIELD NOTES · LONG-FORM · FROM THE EDITORS
              </span>
            </div>

            {/* Right block — title, lede, byline, tags. */}
            <div className="min-w-0">
              <p className="guides-eyebrow mb-6">Field Notes from the Emoji Frontier</p>
              <h1
                className="guides-wordmark text-5xl md:text-[6.5rem] text-gray-900 dark:text-white mb-8"
                data-testid="guide-title"
              >
                {guide.title}
              </h1>
              <p className="guides-lede">{guide.description}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 guides-byline">
                <span>By {guide.author}</span>
                <span aria-hidden="true" className="text-amber-600 dark:text-amber-400">
                  |
                </span>
                <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
                <span aria-hidden="true" className="text-amber-600 dark:text-amber-400">
                  |
                </span>
                <span>{guide.readingTimeMinutes} min read</span>
              </div>

              {guide.tags.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {guide.tags.map((tag) => (
                    <span key={tag} className="guides-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        <p className="guides-divider" aria-hidden="true">
          ✦&nbsp;✦&nbsp;✦
        </p>

        {/* Share row sits between the masthead and the body. */}
        <div className="container mx-auto px-4 max-w-3xl mb-12">
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

        {/* Footer — related references + last-updated stamp. */}
        <footer className="container mx-auto px-4 max-w-3xl mt-12">
          {relatedEmojiCards.length > 0 && (
            <section className="mb-10">
              <h2 className="guides-eyebrow mb-4">Specimens referenced</h2>
              <div className="guides-spec">
                {relatedEmojiCards.map((emoji) => (
                  <Link
                    key={emoji.slug}
                    href={`/emoji/${emoji.slug}`}
                    className="guides-tag"
                    aria-label={`${emoji.name} emoji`}
                  >
                    <span className="text-base mr-1.5 -ml-0.5" aria-hidden="true">
                      {emoji.character}
                    </span>
                    {emoji.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedComboCards.length > 0 && (
            <section className="mb-10">
              <h2 className="guides-eyebrow mb-4">Combos in this dispatch</h2>
              <div className="guides-spec">
                {relatedComboCards.map((combo) => (
                  <Link
                    key={combo.slug}
                    href={`/combo/${combo.slug}`}
                    className="guides-tag"
                    aria-label={`${combo.name} combo`}
                  >
                    <span className="text-base mr-1.5 -ml-0.5" aria-hidden="true">
                      {combo.combo}
                    </span>
                    {combo.name}
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="guides-byline mt-10 pt-6 border-t border-gray-200 dark:border-gray-800">
            Filed {formatDate(guide.publishedAt)} · Last revised {formatDate(guide.updatedAt)} ·
            Dispatch №{dispatchNum}
          </p>
        </footer>

        {/* More dispatches — keeps the reader on the page. */}
        {moreGuides.length > 0 && (
          <section className="guides-filed-nearby mt-20">
            <div className="container mx-auto px-4 py-16 max-w-6xl">
              <div className="flex items-baseline justify-between mb-10">
                <div>
                  <p className="guides-eyebrow mb-3">Filed nearby</p>
                  <h2 className="guides-wordmark text-3xl md:text-5xl text-gray-900 dark:text-white">
                    More dispatches
                  </h2>
                </div>
                <Link
                  href="/guides"
                  className="guides-byline text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  All dispatches <span className="guides-arrow">→</span>
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {moreGuides.map((summary, i) => (
                  <GuideCardMagazine key={summary.slug} guide={summary} index={i + 1} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
