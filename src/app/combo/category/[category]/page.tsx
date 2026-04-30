import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  getAllComboCategories,
  getComboCategoryInfo,
  getComboSummariesByCategory,
} from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { Card, CardContent } from '@/components/ui/card';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import type { Metadata } from 'next';

interface ComboCategoryPageProps {
  params: Promise<{ category: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for combo category pages
 */
export const revalidate = 3600;

/**
 * Generate static params for all combo category pages at build time
 */
export async function generateStaticParams() {
  const categories = getAllComboCategories();
  return categories.map((category) => ({ category }));
}

/**
 * Generate metadata for the combo category page
 */
export async function generateMetadata({ params }: ComboCategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = getComboCategoryInfo(category);

  if (!categoryInfo) {
    return {};
  }

  const env = getEnv();
  const pageUrl = `${env.appUrl}/combo/category/${category}`;

  return {
    title: `${categoryInfo.displayName} Emoji Combos - Best ${categoryInfo.displayName} Combos Explained`,
    description: categoryInfo.description,
    keywords: [
      `${categoryInfo.displayName.toLowerCase()} emoji combos`,
      `best ${categoryInfo.displayName.toLowerCase()} combos`,
      'emoji combo meanings',
      'emoji combinations',
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${categoryInfo.displayName} Emoji Combos`,
      description: categoryInfo.description,
      type: 'website',
      url: pageUrl,
      siteName: env.appName,
    },
    twitter: {
      card: 'summary',
      title: `${categoryInfo.displayName} Emoji Combos`,
      description: categoryInfo.description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * Combo category page component
 * Displays all combos in a category as a grid
 */
export default async function ComboCategoryPage({ params }: ComboCategoryPageProps) {
  const { category } = await params;
  const categoryInfo = getComboCategoryInfo(category);

  if (!categoryInfo) {
    notFound();
  }

  const combos = getComboSummariesByCategory(categoryInfo.slug);
  const env = getEnv();

  // Breadcrumb items for navigation
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Combos', href: '/combo' },
    { label: categoryInfo.displayName },
  ];

  // Breadcrumb items for JSON-LD (with name instead of label)
  const breadcrumbJsonLdItems = [
    { name: 'Home', href: '/' },
    { name: 'Combos', href: '/combo' },
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
            {categoryInfo.displayName} Emoji Combos
          </h1>
          <p className="text-lg text-muted-foreground">{categoryInfo.description}</p>
          <p className="text-sm text-muted-foreground mt-2">
            {categoryInfo.comboCount} combo{categoryInfo.comboCount !== 1 ? 's' : ''} in this
            category
          </p>
        </header>

        {/* Combo Grid */}
        {combos.length > 0 ? (
          <section aria-labelledby="combos-heading">
            <h2 id="combos-heading" className="sr-only">
              {categoryInfo.displayName} Emoji Combos
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {combos.map((combo) => (
                <Link
                  key={combo.slug}
                  href={`/combo/${combo.slug}`}
                  className="block"
                  aria-label={`${combo.name} emoji combo`}
                >
                  <Card className="h-full hover:border-primary hover:shadow-md transition-all">
                    <CardContent className="p-4 text-center">
                      <span className="text-4xl block mb-2">{combo.combo}</span>
                      <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1 line-clamp-1">
                        {combo.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2">{combo.meaning}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No combos found in this category yet.
          </p>
        )}
      </main>
    </>
  );
}
