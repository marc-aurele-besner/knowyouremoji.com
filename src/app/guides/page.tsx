import type { Metadata } from 'next';
import { getPublishedGuideSummaries, getPublishedGuideCount } from '@/lib/guide-data';
import { GuideCard } from '@/components/guides/guide-card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { getEnv } from '@/lib/env';

const siteDescription =
  'Editorial dispatches on what emojis actually mean — research from group chats, dating apps, and Slack threads. Long-form, original, frequently updated.';

/** Hourly ISR so newly published guides show up without a redeploy. */
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
    alternates: { canonical: pageUrl },
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
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

/** Build the issue line that sits under the hero. */
function formatIssueLine(count: number): string {
  const year = new Date().getFullYear();
  return `Vol. I · ${year} · ${count.toString().padStart(3, '0')} on file`;
}

export default function GuidesIndexPage() {
  const env = getEnv();
  const summaries = getPublishedGuideSummaries();
  const total = getPublishedGuideCount();

  const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Guides' }];
  const breadcrumbJsonLdItems = [{ name: 'Home', href: '/' }, { name: 'Guides' }];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <div className="guides-page" data-testid="guides-index">
        {/* Hero — amber gradient on light, gray on dark. */}
        <section className="bg-gradient-to-b from-amber-50 via-amber-50/40 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-b border-amber-100/60 dark:border-gray-800">
          <div className="container mx-auto px-4 max-w-6xl pt-8 pb-16 md:pb-20">
            <Breadcrumbs items={breadcrumbItems} className="mb-8" />

            <div className="max-w-3xl">
              <span className="guides-eyebrow">Editorial</span>
              <h1
                className="mt-4 text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight"
                data-testid="guides-masthead"
              >
                Emoji Guides
              </h1>
              <p className="guides-lede mt-6">{siteDescription}</p>
              <p className="guides-meta mt-6">{formatIssueLine(total)}</p>
            </div>
          </div>
        </section>

        {/* Guide list — card grid that matches the rest of the site. */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 max-w-6xl">
            {summaries.length === 0 ? (
              <div className="py-16 text-center">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  No guides yet.
                </p>
                <p className="guides-meta mt-3 justify-center">
                  New dispatches ship every week — check back soon.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {summaries.map((guide) => (
                  <GuideCard key={guide.slug} guide={guide} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
