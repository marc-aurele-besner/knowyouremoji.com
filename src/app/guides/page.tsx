import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedGuideSummaries, getPublishedGuideCount } from '@/lib/guide-data';
import { DispatchList } from '@/components/guides/dispatch-list';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { getEnv } from '@/lib/env';

const siteDescription =
  'Editorial guides that explain what emojis really mean — from Gen Z slang and dating red flags to workplace etiquette. Long-form, original research.';

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

/** Build the volume + issue line that sits beneath the masthead. */
function formatIssueLine(count: number): string {
  const year = new Date().getFullYear();
  return `Volume I · ${year} · ${count} ${count === 1 ? 'dispatch' : 'dispatches'} so far`;
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

      <main className="guides-page" data-testid="guides-index">
        <div className="container mx-auto px-4 pt-8 pb-2 max-w-5xl">
          <Breadcrumbs items={breadcrumbItems} className="mb-8" />

          {/* Masthead — the editorial hero */}
          <header className="text-center pb-10 md:pb-14">
            <p className="guides-eyebrow mb-4">Field Notes from the Emoji Frontier</p>
            <h1
              className="guides-wordmark text-7xl md:text-9xl text-stone-900 dark:text-stone-50"
              data-testid="guides-masthead"
            >
              Emoji Guides
            </h1>
            <p className="guides-divider" aria-hidden="true">
              ·&nbsp;·&nbsp;·
            </p>
            <p className="guides-byline mt-2">{formatIssueLine(total)}</p>
            <p className="guides-lede mt-6 max-w-2xl mx-auto">{siteDescription}</p>
          </header>
        </div>

        {summaries.length === 0 ? (
          <div className="container mx-auto px-4 py-16 max-w-2xl text-center">
            <p className="guides-wordmark text-6xl text-stone-400 dark:text-stone-600">
              Nothing in the press yet.
            </p>
            <p className="mt-6 guides-lede">
              No dispatches yet. Check back soon — we publish new explainers every week.
            </p>
            <p className="mt-6 text-sm text-stone-500 dark:text-stone-400">
              Got a topic you want covered?{' '}
              <Link href="/about" className="text-amber-700 dark:text-amber-400 underline">
                Reach out
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
            <DispatchList guides={summaries} />
          </div>
        )}

        {/* Colophon — a single editorial note under the index */}
        {summaries.length > 0 && (
          <div className="container mx-auto px-4 max-w-3xl pt-16 pb-20 text-center">
            <p className="guides-divider" aria-hidden="true">
              ✦&nbsp;✦&nbsp;✦
            </p>
            <p className="guides-byline mt-4">Colophon</p>
            <p className="mt-4 text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
              Each dispatch is written from the field — actual messages, real recipients, verified
              meanings. We cite sources when we can, and say so when we can&rsquo;t. Subscribe via
              the homepage footer to get new issues as they ship.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
