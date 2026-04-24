import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getAllGenerations,
  getEmojiSummariesByGeneration,
  getGenerationInfo,
} from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Generation Header */}
        <header className="mb-8">
          {/* Breadcrumb navigation */}
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {generationInfo.displayName} Emoji Meanings
          </h1>
          <p className="text-lg text-muted-foreground">{generationInfo.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {generationInfo.emojiCount} emoji{generationInfo.emojiCount !== 1 ? 's' : ''} with{' '}
            {generationInfo.displayName}-specific notes
          </p>
        </header>

        {/* Emoji Grid */}
        {emojis.length > 0 ? (
          <section aria-labelledby="emojis-heading">
            <h2 id="emojis-heading" className="sr-only">
              {generationInfo.displayName} Emoji Meanings
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {emojis.map((emoji) => (
                <Link
                  key={emoji.slug}
                  href={`/emoji/${emoji.slug}`}
                  className="block"
                  aria-label={`${emoji.name} emoji`}
                >
                  <Card className="h-full hover:border-primary hover:shadow-md transition-all">
                    <CardContent className="p-4 text-center">
                      <span className="text-4xl block mb-2">{emoji.character}</span>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                        {emoji.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{emoji.tldr}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No emojis with generational notes found.
          </p>
        )}
      </main>
    </>
  );
}
