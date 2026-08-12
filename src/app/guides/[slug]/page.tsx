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
import { Badge } from '@/components/ui/badge';
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

/**
 * Article body styles. Centralized so we never sprinkle prose classes
 * across route components and so tests have a stable hook to assert
 * against.
 */
const proseClasses =
  'prose prose-lg dark:prose-invert max-w-none ' +
  'prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white ' +
  'prose-h1:text-3xl prose-h1:mt-10 prose-h1:mb-4 ' +
  'prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-3 ' +
  'prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-2 ' +
  'prose-p:text-gray-700 dark:prose-p:text-gray-300 ' +
  'prose-a:text-amber-600 dark:prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline ' +
  'prose-strong:text-gray-900 dark:prose-strong:text-white ' +
  'prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded ' +
  'prose-pre:bg-gray-900 dark:prose-pre:bg-gray-950 ' +
  'prose-blockquote:border-l-amber-500 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400 ' +
  'prose-ul:list-disc prose-ol:list-decimal';

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

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <header className="mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
            {guide.heroEmoji && <span className="text-3xl">{guide.heroEmoji}</span>}
            <span>{formatDate(guide.publishedAt)}</span>
            <span aria-hidden="true">·</span>
            <span>{guide.readingTimeMinutes} min read</span>
            <span aria-hidden="true">·</span>
            <span>By {guide.author}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            {guide.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">{guide.description}</p>
          {guide.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {guide.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </header>

        <ShareSection
          url={`${env.appUrl}/guides/${guide.slug}`}
          title={guide.title}
          description={guide.description}
          hashtags={['emoji', 'emojiguide', ...guide.tags.slice(0, 2)]}
          contentType="guide"
          className="mb-8"
        />

        <article
          data-testid="guide-article"
          className={proseClasses}
          dangerouslySetInnerHTML={{ __html: guide.html }}
        />

        <footer className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
          {relatedEmojiCards.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Related emojis
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedEmojiCards.map((emoji) => (
                  <Link
                    key={emoji.slug}
                    href={`/emoji/${emoji.slug}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:border-primary hover:shadow-md transition-all text-sm"
                    aria-label={`${emoji.name} emoji`}
                  >
                    <span className="text-xl">{emoji.character}</span>
                    <span className="text-gray-700 dark:text-gray-300">{emoji.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {relatedComboCards.length > 0 && (
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Related combos
              </h2>
              <div className="flex flex-wrap gap-2">
                {relatedComboCards.map((combo) => (
                  <Link
                    key={combo.slug}
                    href={`/combo/${combo.slug}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border bg-card hover:border-primary hover:shadow-md transition-all text-sm"
                    aria-label={`${combo.name} combo`}
                  >
                    <span className="text-xl">{combo.combo}</span>
                    <span className="text-gray-700 dark:text-gray-300">{combo.name}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <p className="text-xs text-gray-500 dark:textgray-400">
            Last updated {formatDate(guide.updatedAt)}
          </p>
        </footer>

        {moreGuides.length > 0 && (
          <section className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">More guides</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {moreGuides.map((summary) => (
                <GuideCard key={summary.slug} guide={summary} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
