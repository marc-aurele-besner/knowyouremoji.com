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
import { BookBanner } from '@/components/layout/book-banner';
import { withHeadingAnchors } from '@/components/guides/guide-headings';
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

  // Section anchors for the "In this guide" table of contents.
  const { html: articleHtml, headings } = withHeadingAnchors(guide.html);

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

      <div
        className="guides-page container mx-auto max-w-6xl px-4 pb-16 pt-10"
        data-testid="guides-article-page"
        data-slug={guide.slug}
      >
        <Breadcrumbs items={breadcrumbItems} className="mb-5" />

        {/* Article header — editorial serif headline, lede and byline. */}
        <header className="mb-10 max-w-[820px]">
          <h1
            className="font-serif text-4xl font-normal leading-[1.05] tracking-[-0.01em] md:text-[52px]"
            data-testid="guide-title"
          >
            {guide.title}
          </h1>
          <p className="guides-lede mt-4">{guide.description}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
            <span>By {guide.author}</span>
            <span aria-hidden="true">·</span>
            <time dateTime={guide.publishedAt}>{formatDate(guide.publishedAt)}</time>
            <span aria-hidden="true">·</span>
            <span>{guide.readingTimeMinutes} min read</span>
          </div>

          {guide.tags.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tags">
              {guide.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-muted px-2.5 py-1 font-mono text-xs font-medium text-muted-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </header>

        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-14">
          {/* The article body — typography handled by `.guides-article`. */}
          <article data-testid="guide-article" className="min-w-0 max-w-[720px]">
            <div
              className="guides-article guides-dropcap"
              dangerouslySetInnerHTML={{ __html: articleHtml }}
            />
          </article>

          <aside className="flex flex-col gap-4 lg:sticky lg:top-24">
            {headings.length > 0 && (
              <nav
                aria-label="In this guide"
                className="rounded-2xl border border-card-border bg-card p-5"
              >
                <p className="eyebrow">In this guide</p>
                <ol className="mt-2 flex flex-col gap-0.5 text-sm">
                  {headings.map((heading) => (
                    <li key={heading.id}>
                      <a
                        href={`#${heading.id}`}
                        className="block rounded-[10px] px-2.5 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            )}

            <div className="rounded-2xl border border-card-border bg-card p-5">
              <ShareSection
                url={`${env.appUrl}/guides/${guide.slug}`}
                title={guide.title}
                description={guide.description}
                hashtags={['emoji', 'emojiguide', ...guide.tags.slice(0, 2)]}
                contentType="guide"
                className="flex-wrap"
              />
            </div>

            <BookBanner />
          </aside>
        </div>

        <p className="guides-divider max-w-[720px]" aria-hidden="true">
          ✦&nbsp;✦&nbsp;✦
        </p>

        {/* Footer — related references + last-updated line. */}
        <footer className="max-w-[720px]">
          {relatedEmojiCards.length > 0 && (
            <section className="mb-10">
              <h2 className="mb-4 text-lg font-semibold">Emojis referenced</h2>
              <div className="flex flex-wrap gap-2">
                {relatedEmojiCards.map((emoji) => (
                  <Link
                    key={emoji.slug}
                    href={`/emoji/${emoji.slug}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-card-border bg-card px-3.5 text-sm text-foreground transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
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
              <h2 className="mb-4 text-lg font-semibold">Combos referenced</h2>
              <div className="flex flex-wrap gap-2">
                {relatedComboCards.map((combo) => (
                  <Link
                    key={combo.slug}
                    href={`/combo/${combo.slug}`}
                    className="inline-flex min-h-9 items-center gap-2 rounded-full border border-card-border bg-card px-3.5 text-sm text-foreground transition-colors hover:border-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                    aria-label={`${combo.name} combo`}
                  >
                    <span aria-hidden="true">{combo.combo}</span>
                    <span>{combo.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="guides-meta mt-8 border-t border-card-border pt-6">
            Published {formatDate(guide.publishedAt)} · Last revised {formatDate(guide.updatedAt)}
          </p>
        </footer>

        {/* More guides — keeps the reader on the site. */}
        {moreGuides.length > 0 && (
          <section className="mt-14" aria-labelledby="more-guides-heading">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
              <h2
                id="more-guides-heading"
                className="text-2xl font-semibold tracking-tight md:text-[28px]"
              >
                Keep reading
              </h2>
              <Link
                href="/guides"
                className="text-sm font-medium text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              >
                Browse all guides →
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
              {moreGuides.map((summary) => (
                <GuideCard key={summary.slug} guide={summary} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
