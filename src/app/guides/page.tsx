import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedGuideSummaries, getPublishedGuideCount } from '@/lib/guide-data';
import { GuideCard } from '@/components/guides/guide-card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { getEnv } from '@/lib/env';

const siteDescription =
  'Editorial guides that explain what emojis really mean — from Gen Z slang and dating red flags to workplace etiquette. Long-form, original research.';

/**
 * Revalidate the guides index hourly so newly published articles show up
 * without a redeploy.
 */
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/guides`;

  return {
    title: 'Emoji Guides',
    description: siteDescription,
    keywords: [
      'emoji guide',
      'emoji meaning guide',
      'what does emoji mean',
      'gen z emoji guide',
      'emoji slang',
      'emoji etiquette',
      'dating emoji',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      siteName: env.appName,
      title: 'Emoji Guides | KnowYourEmoji',
      description: siteDescription,
      images: [
        { url: `${env.appUrl}/og-image.png`, width: 1200, height: 630, alt: 'Emoji Guides' },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Emoji Guides | KnowYourEmoji',
      description: siteDescription,
      images: [`${env.appUrl}/og-image.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

/**
 * Guides index page.
 *
 * Editorial hub for the /guides section. Renders one card per published
 * guide in reverse-chronological order, with breadcrumbs and the same
 * metadata conventions used elsewhere on the site.
 */
export default function GuidesIndexPage() {
  const env = getEnv();
  const summaries = getPublishedGuideSummaries();
  const total = getPublishedGuideCount();

  const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Guides' }];
  const breadcrumbJsonLdItems = [{ name: 'Home', href: '/' }, { name: 'Guides' }];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />

        <header className="mb-10 text-center">
          <span className="inline-block text-sm font-semibold tracking-wider uppercase text-amber-600 dark:text-amber-400 mb-3">
            Editorial
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4">
            Emoji Guides
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {siteDescription}
          </p>
          <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
            {total} {total === 1 ? 'guide' : 'guides'} published
          </p>
        </header>

        {summaries.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl mb-2">📚</p>
            <p className="text-gray-600 dark:text-gray-300">
              No guides yet. Check back soon — we publish new explainers every week.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Want a topic covered?{' '}
              <Link href="/about" className="text-amber-600 hover:underline">
                Reach out
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {summaries.map((guide) => (
              <GuideCard key={guide.slug} guide={guide} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
