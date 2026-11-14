import type { Metadata } from 'next';
import Link from 'next/link';
import { getResolvableComparisons } from '@/lib/comparison-data';
import { getEmojiBySlug } from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { buildSocialMetadata } from '@/lib/metadata';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { ItemListJsonLd } from '@/components/seo/item-list-json-ld';

/**
 * The compare hub.
 *
 * This page used to not exist: every comparison page breadcrumbed to
 * `/compare`, and `/llms.txt` advertised it as a tool, but no route
 * served it — so the hub was a 404 that every comparison page linked to
 * and every answer engine was pointed at. Giving it a real page fixes the
 * broken link and adds an indexable landing surface for the
 * "X vs Y emoji" query family.
 */

const siteDescription =
  'Side-by-side comparisons of the emoji pairs people mix up most — what each one means on its own, where they overlap, and how to tell them apart in a real message.';

/** Hourly ISR so a new comparison shows up without a redeploy. */
export const revalidate = 3600;

export function generateMetadata(): Metadata {
  const env = getEnv();
  const pageUrl = `${env.appUrl}/compare`;
  const title = 'Compare Emojis';
  const socialTitle = `${title} - ${env.appName}`;

  return {
    title,
    description: siteDescription,
    keywords: [
      'emoji comparison',
      'emoji vs emoji',
      'compare emoji meanings',
      'difference between emojis',
      'emoji meaning differences',
    ],
    alternates: { canonical: pageUrl },
    ...buildSocialMetadata({
      title: socialTitle,
      description: siteDescription,
      url: pageUrl,
      siteName: env.appName,
      imageAlt: 'Compare two emojis side by side on KnowYourEmoji',
    }),
    robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  };
}

export default function CompareHubPage() {
  const env = getEnv();
  const comparisons = getResolvableComparisons();

  const entries = comparisons.flatMap((comparison) => {
    const first = getEmojiBySlug(comparison.emoji1Slug);
    const second = getEmojiBySlug(comparison.emoji2Slug);
    if (!first || !second) return [];

    return [
      {
        url: `${env.appUrl}/compare/${comparison.emoji1Slug}/${comparison.emoji2Slug}`,
        name: `${first.character} ${first.name} vs ${second.character} ${second.name}`,
        comparison,
        first,
        second,
      },
    ];
  });

  const breadcrumbItems = [{ label: 'Home', href: '/' }, { label: 'Compare' }];
  const breadcrumbJsonLdItems = [{ name: 'Home', href: '/' }, { name: 'Compare' }];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <ItemListJsonLd
        name="Emoji Comparisons"
        description={siteDescription}
        pageUrl={`${env.appUrl}/compare`}
        items={entries.map((entry) => ({ name: entry.name, url: entry.url }))}
      />

      <main className="container mx-auto max-w-6xl px-4 pb-20 pt-8 md:pt-10">
        <Breadcrumbs items={breadcrumbItems} className="mb-5 text-[13px]" />

        <header className="mb-9 max-w-3xl">
          <p className="eyebrow">Compare</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            Compare emojis side by side
          </h1>
          <p className="mt-3 text-[17px] leading-relaxed text-muted-foreground">
            {siteDescription}
          </p>
        </header>

        <section aria-labelledby="comparisons-heading">
          <h2 id="comparisons-heading" className="mb-4 text-xl font-semibold tracking-tight">
            {entries.length} emoji {entries.length === 1 ? 'pair' : 'pairs'} compared
          </h2>

          <ul className="grid gap-3 md:grid-cols-2">
            {entries.map((entry) => (
              <li key={entry.url}>
                <Link
                  href={`/compare/${entry.comparison.emoji1Slug}/${entry.comparison.emoji2Slug}`}
                  className="flex h-full flex-col gap-2 rounded-2xl border border-card-border bg-card p-5 transition-colors hover:border-primary-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                >
                  <span className="text-lg font-semibold tracking-tight">
                    <span className="emoji-display" aria-hidden="true">
                      {entry.first.character}
                    </span>{' '}
                    {entry.first.name}
                    <span className="accent-serif"> vs </span>
                    <span className="emoji-display" aria-hidden="true">
                      {entry.second.character}
                    </span>{' '}
                    {entry.second.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {entry.comparison.seoDescription}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
