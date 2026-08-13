import type { Metadata } from 'next';
import Link from 'next/link';
import { getPublishedGuideSummaries, getPublishedGuideCount } from '@/lib/guide-data';
import { DispatchList } from '@/components/guides/dispatch-list';
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

/** Build the volume + issue line that sits beneath the masthead. */
function formatIssueLine(count: number): string {
  const year = new Date().getFullYear();
  return `VOL. I · ${year} · ${count.toString().padStart(3, '0')} ${count === 1 ? 'DISPATCH' : 'DISPATCHES'} ON FILE`;
}

/** Timestamp for the live ticker — recomputed per request. */
function formatTimestamp(): string {
  const now = new Date();
  return now.toUTCString().replace('GMT', 'UTC').toUpperCase();
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
        {/* Live wire ticker — pinned to the top of the section. */}
        <div className="guides-ticker" aria-label="Wire status">
          <span className="guides-ticker-dot" aria-hidden="true" />
          <span className="text-amber-500">ON THE WIRE</span>
          <span aria-hidden="true" className="opacity-30">
            /
          </span>
          <span className="hidden sm:inline">{formatTimestamp()}</span>
          <span aria-hidden="true" className="hidden sm:inline opacity-30">
            /
          </span>
          <span className="text-red-400">LIVE</span>
        </div>

        {/* Masthead — the editorial hero, asymmetric grid. */}
        <div className="container mx-auto px-4 max-w-6xl">
          <Breadcrumbs
            items={breadcrumbItems}
            className="mt-6 mb-8 [&_a]:text-stone-400 [&_span]:text-stone-500"
          />

          <header className="guides-masthead grid gap-6 md:gap-8 md:grid-cols-[1fr_auto] items-start">
            <div>
              <p className="guides-eyebrow mb-6">Field Notes from the Emoji Frontier</p>
              <h1 className="guides-wordmark text-6xl md:text-9xl" data-testid="guides-masthead">
                Dispatches<span className="text-red-400">.</span>
              </h1>
              <p className="guides-lede mt-8 max-w-2xl">{siteDescription}</p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3 pr-1">
              <span className="guides-vertical-mark" aria-hidden="true">
                ON THE EMOJI FRONTIER · CONFIDENTIAL
              </span>
              <p className="guides-byline text-right">{formatIssueLine(total)}</p>
              <p className="guides-byline text-right opacity-60">
                EST. {new Date().getFullYear() - 3} · ISSUE {total.toString().padStart(3, '0')}
              </p>
            </div>
          </header>
        </div>

        {summaries.length === 0 ? (
          <div className="container mx-auto px-4 py-24 max-w-2xl text-center">
            <p className="guides-wordmark text-7xl text-stone-600">No dispatches on file.</p>
            <p className="guides-divider" aria-hidden="true">
              ·&nbsp;·&nbsp;·
            </p>
            <p className="guides-lede mt-6">
              The wire is quiet. We publish new explainers every week — check back soon.
            </p>
            <p className="mt-8 text-sm text-stone-500">
              Got a topic?{' '}
              <Link href="/about" className="text-amber-500 underline underline-offset-4">
                File a tip
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            <DispatchList guides={summaries} />
          </div>
        )}

        {/* Colophon — a single editorial note under the index. */}
        {summaries.length > 0 && (
          <div className="container mx-auto px-4 max-w-3xl pt-20 pb-24 text-center">
            <p className="guides-divider" aria-hidden="true">
              ✦&nbsp;✦&nbsp;✦
            </p>
            <p className="guides-eyebrow justify-center mt-2">Colophon</p>
            <p className="guides-annotation mt-6 leading-relaxed text-center">
              Each dispatch is written from the field &mdash; actual messages, real recipients,
              verified meanings. We cite sources when we can, and say so when we can&rsquo;t.
              Subscribe via the homepage footer to get new issues as they ship.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
