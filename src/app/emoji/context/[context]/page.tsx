import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getPageableContextTypes,
  getEmojisByContext,
  getContextInfo,
  getContextDisplayName,
} from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { EmojiHubPage, pickHubHighlights } from '@/components/emoji/emoji-hub-page';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';

interface ContextPageProps {
  params: Promise<{ context: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for context pages
 */
export const revalidate = 3600;

/**
 * Generate static params for all context pages at build time
 */
export async function generateStaticParams() {
  const contexts = getPageableContextTypes();
  return contexts.map((context) => ({ context }));
}

/**
 * Generate metadata for the context page
 */
export async function generateMetadata({ params }: ContextPageProps): Promise<Metadata> {
  const { context } = await params;
  const contextInfo = getContextInfo(context as never);

  if (!contextInfo) {
    return {};
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/emoji/context/${context}`;

  return {
    title: `${contextInfo.displayName} Emoji Meanings - Emojis for ${contextInfo.displayName} Context`,
    description: contextInfo.description,
    keywords: [
      `${contextInfo.displayName.toLowerCase()} emoji meanings`,
      `emojis for ${contextInfo.displayName.toLowerCase()} context`,
      'emoji context meanings',
      'emoji guide',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${contextInfo.displayName} Emoji Meanings`,
      description: contextInfo.description,
      type: 'website',
      url: pageUrl,
      siteName: env.appName,
    },
    twitter: {
      card: 'summary',
      title: `${contextInfo.displayName} Emoji Meanings`,
      description: contextInfo.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Context emoji page component
 * Displays all emojis with notable context meanings
 */
export default async function ContextPage({ params }: ContextPageProps) {
  const { context } = await params;
  const contextInfo = getContextInfo(context as never);

  if (!contextInfo) {
    notFound();
  }

  const fullEmojis = getEmojisByContext(contextInfo.slug);
  const env = getEnv();

  // Each card carries this hub's meaning so the quick view can show it.
  const emojis = fullEmojis.map((emoji) => ({
    slug: emoji.slug,
    character: emoji.character,
    name: emoji.name,
    category: emoji.category,
    tldr: emoji.tldr,
    contexts: emoji.contextMeanings.filter((m) => m.context === contextInfo.slug),
  }));

  const highlights = pickHubHighlights(fullEmojis).map((emoji) => {
    const meaning = emoji.contextMeanings.find((m) => m.context === contextInfo.slug)!;
    return {
      slug: emoji.slug,
      character: emoji.character,
      name: emoji.name,
      text: meaning.meaning,
      riskLevel: meaning.riskLevel,
      example: meaning.example,
    };
  });

  const siblings = getPageableContextTypes().map((type) => ({
    label: getContextDisplayName(type),
    href: `/emoji/context/${type}`,
    active: type === contextInfo.slug,
  }));

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Emojis', href: '/emoji' },
    { label: contextInfo.displayName },
  ];

  // Breadcrumb items for JSON-LD (with name instead of label)
  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Emojis', href: '/emoji' },
    { name: contextInfo.displayName },
  ];

  return (
    <>
      {/* JSON-LD structured data for breadcrumbs */}
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <EmojiHubPage
        breadcrumbs={breadcrumbItems}
        title={`${contextInfo.displayName} Emoji Meanings`}
        description={contextInfo.description}
        countLabel={`${contextInfo.emojiCount} emoji${contextInfo.emojiCount !== 1 ? 's' : ''} with ${contextInfo.displayName} context meanings`}
        siblings={siblings}
        siblingsLabel="Other contexts"
        highlights={highlights}
        highlightsTitle={`${contextInfo.displayName} in practice`}
        emojis={emojis}
        gridHeading={`${contextInfo.displayName} Emoji Meanings`}
        emptyTitle="No emojis with context meanings found."
      />
    </>
  );
}
