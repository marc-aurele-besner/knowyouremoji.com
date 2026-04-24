import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllPlatforms, getEmojiSummariesByPlatform, getPlatformInfo } from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';

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

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Platform Header */}
        <header className="mb-8">
          {/* Breadcrumb navigation */}
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {platformInfo.displayName} Emoji Meanings
          </h1>
          <p className="text-lg text-muted-foreground">{platformInfo.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {platformInfo.emojiCount} emoji{platformInfo.emojiCount !== 1 ? 's' : ''} with{' '}
            {platformInfo.displayName}-specific notes
          </p>
        </header>

        {/* Emoji Grid */}
        {emojis.length > 0 ? (
          <section aria-labelledby="emojis-heading">
            <h2 id="emojis-heading" className="sr-only">
              {platformInfo.displayName} Emoji Meanings
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
            No emojis with platform notes found.
          </p>
        )}
      </main>
    </>
  );
}
