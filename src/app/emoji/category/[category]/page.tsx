import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllCategories, getCategoryInfo, getEmojiSummariesByCategory } from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

/**
 * Generate static params for all category pages at build time
 */
export async function generateStaticParams() {
  const categories = getAllCategories();
  return categories.map((category) => ({ category }));
}

/**
 * Generate metadata for the category page
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = getCategoryInfo(category);

  if (!categoryInfo) {
    return {};
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/emoji/category/${category}`;

  return {
    title: `${categoryInfo.displayName} Emojis - What Do They Really Mean?`,
    description: categoryInfo.description,
    keywords: [
      `${categoryInfo.displayName.toLowerCase()} emojis`,
      `${category} emoji meanings`,
      'emoji guide',
      'emoji meanings',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${categoryInfo.displayName} Emojis`,
      description: categoryInfo.description,
      type: 'website',
      url: pageUrl,
      siteName: env.appName,
    },
    twitter: {
      card: 'summary',
      title: `${categoryInfo.displayName} Emojis`,
      description: categoryInfo.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Category page component
 * Displays all emojis in a category as a grid
 */
export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;
  const categoryInfo = getCategoryInfo(category);

  if (!categoryInfo) {
    notFound();
  }

  const emojis = getEmojiSummariesByCategory(category);
  const env = getEnv();

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Emojis', href: '/emoji' },
    { label: categoryInfo.displayName },
  ];

  // Breadcrumb items for JSON-LD (with name instead of label)
  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Emojis', href: '/emoji' },
    { name: categoryInfo.displayName },
  ];

  return (
    <>
      {/* JSON-LD structured data for breadcrumbs */}
      <BreadcrumbJsonLd items={breadcrumbJsonLdItems} appUrl={env.appUrl} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Category Header */}
        <header className="mb-8">
          {/* Breadcrumb navigation */}
          <Breadcrumbs items={breadcrumbItems} className="mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {categoryInfo.displayName} Emojis
          </h1>
          <p className="text-lg text-muted-foreground">{categoryInfo.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {categoryInfo.emojiCount} emoji{categoryInfo.emojiCount !== 1 ? 's' : ''} in this
            category
          </p>
        </header>

        {/* Emoji Grid */}
        {emojis.length > 0 ? (
          <section aria-labelledby="emojis-heading">
            <h2 id="emojis-heading" className="sr-only">
              {categoryInfo.displayName} Emojis
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
            No emojis found in this category yet.
          </p>
        )}
      </main>
    </>
  );
}
