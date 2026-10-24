import type { Metadata } from 'next';
import { getPublishedGuideSummaries, getPublishedGuideCount } from '@/lib/guide-data';
import { GuidesIndexList } from '@/components/guides/guides-index-list';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { getEnv } from '@/lib/env';
import { BookBanner } from '@/components/layout/book-banner';

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

      <div
        className="guides-page container mx-auto max-w-6xl px-4 pb-16 pt-10"
        data-testid="guides-index"
      >
        <Breadcrumbs items={breadcrumbItems} className="mb-5" />

        <header className="mb-10 max-w-3xl">
          <p className="eyebrow">Editorial</p>
          <h1
            className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl"
            data-testid="guides-masthead"
          >
            Emoji Guides
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
            {siteDescription}
          </p>
          <p className="guides-meta mt-4">{formatIssueLine(total)}</p>
        </header>

        <GuidesIndexList guides={summaries} />

        <BookBanner variant="wide" className="mt-14" />
      </div>
    </>
  );
}
