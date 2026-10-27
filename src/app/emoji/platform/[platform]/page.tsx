import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAllPlatforms,
  getEmojiSummariesByPlatform,
  getEmojisWithPlatformNotes,
  getPlatformInfo,
  getPlatformDisplayName,
} from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { EmojiHubPage, pickHubHighlights } from '@/components/emoji/emoji-hub-page';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { ItemListJsonLd } from '@/components/seo/item-list-json-ld';
import { buildEmojiListItems } from '@/lib/seo-schema';

interface PlatformPageProps {
  params: Promise<{ platform: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for platform pages
 */
export const revalidate = 3600;

/**
 * Generate static params for all platform pages at build time
 */
export async function generateStaticParams() {
  const platforms = getAllPlatforms();
  return platforms.map((platform) => ({ platform }));
}

/**
 * Generate metadata for the platform page
 */
export async function generateMetadata({ params }: PlatformPageProps): Promise<Metadata> {
  const { platform } = await params;
  const platformInfo = getPlatformInfo(platform as never);

  if (!platformInfo) {
    return {};
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/emoji/platform/${platform}`;

  return {
    title: `${platformInfo.displayName} Emoji Meanings - What Emojis Really Mean on ${platformInfo.displayName}`,
    description: platformInfo.description,
    keywords: [
      `${platformInfo.displayName.toLowerCase()} emojis`,
      `${platformInfo.displayName.toLowerCase()} emoji meanings`,
      'emoji platform meanings',
      'emoji guide',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${platformInfo.displayName} Emoji Meanings`,
      description: platformInfo.description,
      type: 'website',
      url: pageUrl,
      siteName: env.appName,
    },
    twitter: {
      card: 'summary',
      title: `${platformInfo.displayName} Emoji Meanings`,
      description: platformInfo.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Platform emoji page component
 * Displays all emojis with notable platform notes
 */
export default async function PlatformPage({ params }: PlatformPageProps) {
  const { platform } = await params;
  const platformInfo = getPlatformInfo(platform as never);

  if (!platformInfo) {
    notFound();
  }

  const emojis = getEmojiSummariesByPlatform(platformInfo.slug);
  const env = getEnv();

  const highlights = pickHubHighlights(getEmojisWithPlatformNotes(platformInfo.slug)).map(
    (emoji) => ({
      slug: emoji.slug,
      character: emoji.character,
      name: emoji.name,
      text: emoji.platformNotes.find((n) => n.platform === platformInfo.slug)!.note,
    })
  );

  const siblings = getAllPlatforms().map((p) => ({
    label: getPlatformDisplayName(p),
    href: `/emoji/platform/${p}`,
    active: p === platformInfo.slug,
  }));

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Emojis', href: '/emoji' },
    { label: platformInfo.displayName },
  ];

  // Breadcrumb items for JSON-LD (with name instead of label)
  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Emojis', href: '/emoji' },
    { name: platformInfo.displayName },
  ];

  return (
    <>
      {/* JSON-LD structured data for breadcrumbs */}
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      {/* Structured list of the emoji meanings on this page */}
      <ItemListJsonLd
        name={`${platformInfo.displayName} Emoji Meanings`}
        description={platformInfo.description}
        pageUrl={`${env.appUrl}/emoji/platform/${platform}`}
        items={buildEmojiListItems(env.appUrl, emojis)}
      />

      <EmojiHubPage
        breadcrumbs={breadcrumbItems}
        title={`${platformInfo.displayName} Emoji Meanings`}
        description={platformInfo.description}
        countLabel={`${platformInfo.emojiCount} emoji${platformInfo.emojiCount !== 1 ? 's' : ''} with ${platformInfo.displayName}-specific notes`}
        siblings={siblings}
        siblingsLabel="Other platforms"
        highlights={highlights}
        highlightsTitle={`Notable on ${platformInfo.displayName}`}
        emojis={emojis}
        gridHeading={`${platformInfo.displayName} Emoji Meanings`}
        emptyTitle="No emojis with platform notes found."
      />
    </>
  );
}
