import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllComparisonSlugs, getComparisonBySlug } from '@/lib/comparison-data';
import { getEmojiBySlug } from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { Card, CardContent } from '@/components/ui/card';

interface ComparePageProps {
  params: Promise<{ emoji1: string; emoji2: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for comparison pages
 */
export const revalidate = 3600;

/**
 * Generate static params for all comparison pages at build time
 */
export async function generateStaticParams() {
  const slugs = getAllComparisonSlugs();
  return slugs
    .map((slug) => {
      const comparison = getComparisonBySlug(slug);
      if (!comparison) return null;
      return {
        emoji1: comparison.emoji1Slug,
        emoji2: comparison.emoji2Slug,
      };
    })
    .filter(Boolean);
}

/**
 * Generate metadata for the comparison page
 */
export async function generateMetadata({ params }: ComparePageProps): Promise<Metadata> {
  const { emoji1: emoji1Slug, emoji2: emoji2Slug } = await params;
  const comparison = getComparisonBySlug(`${emoji1Slug}-${emoji2Slug}`);

  if (!comparison) {
    // Try the reverse order
    const reversed = getComparisonBySlug(`${emoji2Slug}-${emoji1Slug}`);
    if (!reversed) {
      return {};
    }
    return {
      title: reversed.seoTitle,
      description: reversed.seoDescription,
      keywords: [
        `${reversed.emoji1Slug} vs ${reversed.emoji2Slug}`,
        'emoji comparison',
        'emoji meaning',
      ],
      alternates: {
        canonical: `${getEnv().appUrl}/compare/${reversed.emoji1Slug}/${reversed.emoji2Slug}`,
      },
      openGraph: {
        title: reversed.seoTitle,
        description: reversed.seoDescription,
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: reversed.seoTitle,
        description: reversed.seoDescription,
      },
      robots: {
        index: true,
        follow: true,
      },
    };
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/compare/${emoji1Slug}/${emoji2Slug}`;

  return {
    title: comparison.seoTitle,
    description: comparison.seoDescription,
    keywords: [`${emoji1Slug} vs ${emoji2Slug}`, 'emoji comparison', 'emoji meaning'],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: comparison.seoTitle,
      description: comparison.seoDescription,
      type: 'website',
      url: pageUrl,
      siteName: env.appName,
    },
    twitter: {
      card: 'summary',
      title: comparison.seoTitle,
      description: comparison.seoDescription,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Emoji comparison page component
 * Displays a curated comparison between two emojis
 */
export default async function ComparePage({ params }: ComparePageProps) {
  const { emoji1: emoji1Slug, emoji2: emoji2Slug } = await params;

  // Try to find comparison in either order
  let comparison = getComparisonBySlug(`${emoji1Slug}-${emoji2Slug}`);
  let reversed = false;

  if (!comparison) {
    comparison = getComparisonBySlug(`${emoji2Slug}-${emoji1Slug}`);
    reversed = true;
  }

  if (!comparison) {
    notFound();
  }

  const env = getEnv();

  // Get emoji data
  const emoji1Data = getEmojiBySlug(reversed ? comparison.emoji2Slug : comparison.emoji1Slug);
  const emoji2Data = getEmojiBySlug(reversed ? comparison.emoji1Slug : comparison.emoji2Slug);

  if (!emoji1Data || !emoji2Data) {
    notFound();
  }

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Compare', href: '/compare' },
    { label: `${emoji1Data.name} vs ${emoji2Data.name}` },
  ];

  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Compare', href: '/compare' },
    { name: `${emoji1Data.name} vs ${emoji2Data.name}` },
  ];

  return (
    <>
      {/* JSON-LD structured data for breadcrumbs */}
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Comparison Header */}
        <header className="mb-8">
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 text-center">
            {emoji1Data.character} vs {emoji2Data.character}
          </h1>
          <p className="text-lg text-center text-muted-foreground mb-4">
            {comparison.seoDescription}
          </p>

          {/* Emoji Cards */}
          <div className="flex justify-center gap-8 mb-6">
            <Link
              href={`/emoji/${emoji1Data.slug}`}
              className="block"
              aria-label={`Learn more about ${emoji1Data.name}`}
            >
              <Card className="hover:border-primary hover:shadow-md transition-all">
                <CardContent className="p-4 text-center">
                  <span className="text-6xl block mb-2">{emoji1Data.character}</span>
                  <h2 className="font-semibold text-lg">{emoji1Data.name}</h2>
                </CardContent>
              </Card>
            </Link>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-muted-foreground">vs</span>
            </div>
            <Link
              href={`/emoji/${emoji2Data.slug}`}
              className="block"
              aria-label={`Learn more about ${emoji2Data.name}`}
            >
              <Card className="hover:border-primary hover:shadow-md transition-all">
                <CardContent className="p-4 text-center">
                  <span className="text-6xl block mb-2">{emoji2Data.character}</span>
                  <h2 className="font-semibold text-lg">{emoji2Data.name}</h2>
                </CardContent>
              </Card>
            </Link>
          </div>
        </header>

        {/* Comparison Points */}
        <section aria-labelledby="comparison-heading">
          <h2 id="comparison-heading" className="text-2xl font-bold mb-6 text-center">
            Key Differences
          </h2>
          <div className="space-y-4">
            {comparison.comparisonPoints.map((point, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-3">{point.aspect}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{emoji1Data.character}</span>
                        <span className="font-medium">{emoji1Data.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{point.emoji1Note}</p>
                    </div>
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-2xl">{emoji2Data.character}</span>
                        <span className="font-medium">{emoji2Data.name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{point.emoji2Note}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Navigation to Individual Emoji Pages */}
        <section className="mt-8 flex justify-center gap-4">
          <Link href={`/emoji/${emoji1Data.slug}`}>
            <Card className="hover:border-primary hover:shadow-md transition-all">
              <CardContent className="p-4 text-center">
                <span className="text-2xl block mb-1">{emoji1Data.character}</span>
                <span className="text-sm">Learn more about {emoji1Data.name}</span>
              </CardContent>
            </Card>
          </Link>
          <Link href={`/emoji/${emoji2Data.slug}`}>
            <Card className="hover:border-primary hover:shadow-md transition-all">
              <CardContent className="p-4 text-center">
                <span className="text-2xl block mb-1">{emoji2Data.character}</span>
                <span className="text-sm">Learn more about {emoji2Data.name}</span>
              </CardContent>
            </Card>
          </Link>
        </section>
      </main>
    </>
  );
}
