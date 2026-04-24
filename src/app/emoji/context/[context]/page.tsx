import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getPageableContextTypes,
  getEmojiSummariesByContext,
  getContextInfo,
} from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
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

  const emojis = getEmojiSummariesByContext(contextInfo.slug);
  const env = getEnv();

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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Context Header */}
        <header className="mb-8">
          {/* Breadcrumb navigation */}
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {contextInfo.displayName} Emoji Meanings
          </h1>
          <p className="text-lg text-muted-foreground">{contextInfo.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {contextInfo.emojiCount} emoji{contextInfo.emojiCount !== 1 ? 's' : ''} with{' '}
            {contextInfo.displayName} context meanings
          </p>
        </header>

        {/* Emoji Grid */}
        {emojis.length > 0 ? (
          <section aria-labelledby="emojis-heading">
            <h2 id="emojis-heading" className="sr-only">
              {contextInfo.displayName} Emoji Meanings
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
            No emojis with context meanings found.
          </p>
        )}
      </main>
    </>
  );
}
