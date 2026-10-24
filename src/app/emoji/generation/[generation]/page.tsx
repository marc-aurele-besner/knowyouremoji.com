import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  getAllGenerations,
  getEmojiSummariesByGeneration,
  getEmojisWithGenerationNotes,
  getGenerationInfo,
  getGenerationDisplayName,
} from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { EmojiHubPage, pickHubHighlights } from '@/components/emoji/emoji-hub-page';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';

interface GenerationPageProps {
  params: Promise<{ generation: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for generation pages
 */
export const revalidate = 3600;

/**
 * Generate static params for all generation pages at build time
 */
export async function generateStaticParams() {
  const generations = getAllGenerations();
  return generations.map((generation) => ({ generation }));
}

/**
 * Generate metadata for the generation page
 */
export async function generateMetadata({ params }: GenerationPageProps): Promise<Metadata> {
  const { generation } = await params;
  const generationInfo = getGenerationInfo(generation as never);

  if (!generationInfo) {
    return {};
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/emoji/generation/${generation}`;

  return {
    title: `${generationInfo.displayName} Emoji Meanings - What Emojis Mean to ${generationInfo.displayName}`,
    description: generationInfo.description,
    keywords: [
      `${generationInfo.displayName.toLowerCase()} emoji meanings`,
      `emoji guide for ${generationInfo.displayName.toLowerCase()}`,
      'generational emoji meanings',
      'emoji interpretation by generation',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${generationInfo.displayName} Emoji Meanings`,
      description: generationInfo.description,
      type: 'website',
      url: pageUrl,
      siteName: env.appName,
    },
    twitter: {
      card: 'summary',
      title: `${generationInfo.displayName} Emoji Meanings`,
      description: generationInfo.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Generation emoji page component
 * Displays all emojis with notable generational notes
 */
export default async function GenerationPage({ params }: GenerationPageProps) {
  const { generation } = await params;
  const generationInfo = getGenerationInfo(generation as never);

  if (!generationInfo) {
    notFound();
  }

  const emojis = getEmojiSummariesByGeneration(generationInfo.slug);
  const env = getEnv();

  const highlights = pickHubHighlights(getEmojisWithGenerationNotes(generationInfo.slug)).map(
    (emoji) => ({
      slug: emoji.slug,
      character: emoji.character,
      name: emoji.name,
      text: emoji.generationalNotes.find((n) => n.generation === generationInfo.slug)!.note,
    })
  );

  const siblings = getAllGenerations().map((gen) => ({
    label: getGenerationDisplayName(gen),
    href: `/emoji/generation/${gen}`,
    active: gen === generationInfo.slug,
  }));

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Emojis', href: '/emoji' },
    { label: generationInfo.displayName },
  ];

  // Breadcrumb items for JSON-LD (with name instead of label)
  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Emojis', href: '/emoji' },
    { name: generationInfo.displayName },
  ];

  return (
    <>
      {/* JSON-LD structured data for breadcrumbs */}
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <EmojiHubPage
        breadcrumbs={breadcrumbItems}
        title={`${generationInfo.displayName} Emoji Meanings`}
        description={generationInfo.description}
        countLabel={`${generationInfo.emojiCount} emoji${generationInfo.emojiCount !== 1 ? 's' : ''} with ${generationInfo.displayName}-specific notes`}
        siblings={siblings}
        siblingsLabel="Other generations"
        highlights={highlights}
        highlightsTitle={`How ${generationInfo.displayName} reads them`}
        emojis={emojis}
        gridHeading={`${generationInfo.displayName} Emoji Meanings`}
        emptyTitle="No emojis with generational notes found."
      />
    </>
  );
}
