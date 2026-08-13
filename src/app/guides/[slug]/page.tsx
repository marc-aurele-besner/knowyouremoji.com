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

/** Body prose — built on @tailwindcss/typography but tuned for the editorial section. */
const proseClasses =
  'prose prose-lg dark:prose-invert max-w-none ' +
  'font-sans ' +
  'prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight ' +
  'prose-headings:text-stone-900 dark:prose-headings:text-stone-50 ' +
  'prose-h1:hidden ' +
  'prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 ' +
  'prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 ' +
  'prose-p:text-stone-700 dark:prose-p:text-stone-300 prose-p:leading-[1.75] prose-p:my-5 ' +
  'prose-a:text-amber-700 dark:prose-a:text-amber-400 prose-a:font-medium prose-a:no-underline hover:prose-a:underline ' +
  'prose-strong:text-stone-900 dark:prose-strong:text-stone-50 prose-strong:font-semibold ' +
  'prose-em:font-serif prose-em:italic ' +
  'prose-code:font-mono prose-code:text-[0.9em] prose-code:bg-stone-100 dark:prose-code:bg-stone-800 ' +
  'prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-amber-800 dark:prose-code:text-amber-300 ' +
  'prose-code:before:content-none prose-code:after:content-none ' +
  'prose-pre:bg-stone-900 dark:prose-pre:bg-stone-950 prose-pre:border prose-pre:border-stone-800 ' +
  'prose-blockquote:border-l-2 prose-blockquote:border-amber-600 dark:prose-blockquote:border-amber-400 ' +
  'prose-blockquote:font-serif prose-blockquote:italic prose-blockquote:text-stone-700 dark:prose-blockquote:text-stone-300 ' +
  'prose-blockquote:not-italic prose-blockquote:py-1 ' +
  'prose-ul:my-6 prose-ol:my-6 ' +
  'prose-li:my-2 prose-li:text-stone-700 dark:prose-li:text-stone-300 ' +
  'prose-hr:border-stone-300 dark:prose-hr:border-stone-700';

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

      <main className="guides-page" data-testid="guides-article-page" data-slug={guide.slug}>
        <article className="container mx-auto px-4 pt-8 pb-16 max-w-3xl">
          <Breadcrumbs items={breadcrumbItems} className="mb-10" />

          {/* Masthead block: kicker, dispatch number, oversized stamp, title */}
          <header className="mb-10 md:mb-14 text-center">
            <p className="guides-eyebrow mb-6">Field Notes from the Emoji Frontier</p>

            {guide.heroEmoji && (
              <div
                className="guides-stamp guides-stamp--article mx-auto mb-6 inline-block"
                aria-hidden="true"
                data-testid="guide-hero-stamp"
              >
                {guide.heroEmoji}
              </div>
            )}

            <h1
              className="guides-wordmark text-3xl md:text-5xl text-stone-900 dark:text-stone-50 mb-6 leading-[1.05]"
              data-testid="guide-title"
            >
              {guide.title}
            </h1>

            <p className="guides-lede">{guide.description}</p>

            <p className="guides-byline mt-6 flex flex-wrap justify-center items-center gap-x-2">
              <span>By {guide.author}</span>
              <span aria-hidden="true">·</span>
              <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
              <span aria-hidden="true">·</span>
              <span>{guide.readingTimeMinutes} min read</span>
            </p>

            {guide.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {guide.tags.map((tag) => (
                  <span key={tag} className="guides-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <p className="guides-divider" aria-hidden="true">
            ✦&nbsp;✦&nbsp;✦
          </p>

          {/* Share row sits between the masthead and the body */}
          <ShareSection
            url={`${env.appUrl}/guides/${guide.slug}`}
            title={guide.title}
            description={guide.description}
            hashtags={['emoji', 'emojiguide', ...guide.tags.slice(0, 2)]}
            contentType="guide"
            className="mb-10"
          />

          {/* The article body — typography handled by @tailwindcss/typography. */}
          <div
            data-testid="guide-article"
            className={`${proseClasses} guides-dropcap`}
            dangerouslySetInnerHTML={{ __html: guide.html }}
          />

          <p className="guides-divider" aria-hidden="true">
            ✦&nbsp;✦&nbsp;✦
          </p>

          {/* Footer — related references + last-updated stamp */}
          <footer className="mt-10">
            {relatedEmojiCards.length > 0 && (
              <section className="mb-8">
                <h2 className="guides-eyebrow mb-4">Specimens referenced</h2>
                <div className="flex flex-wrap gap-2">
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
              <section className="mb-8">
                <h2 className="guides-eyebrow mb-4">Combos in this dispatch</h2>
                <div className="flex flex-wrap gap-2">
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

            <p className="guides-byline mt-8 pt-6 border-t border-stone-300 dark:border-stone-700">
              Filed {formatDate(guide.publishedAt)} · Last revised {formatDate(guide.updatedAt)}
            </p>
          </footer>
        </article>

        {/* More dispatches — keeps the reader on the page */}
        {moreGuides.length > 0 && (
          <section className="border-t-2 border-stone-900/80 dark:border-amber-400/60 bg-stone-100/40 dark:bg-stone-900/40">
            <div className="container mx-auto px-4 py-14 max-w-5xl">
              <p className="guides-eyebrow text-center mb-3">Filed nearby</p>
              <h2 className="guides-wordmark text-3xl md:text-5xl text-center text-stone-900 dark:text-stone-50 mb-10">
                More dispatches
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {moreGuides.map((summary) => (
                  <GuideCard key={summary.slug} guide={summary} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
