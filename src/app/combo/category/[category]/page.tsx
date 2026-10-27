import { notFound } from 'next/navigation';
import {
  getAllComboCategories,
  getAllComboCategoryInfo,
  getComboCategoryInfo,
  getComboCount,
  getComboSummariesByCategory,
} from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { ComboCard } from '@/components/combo/combo-card';
import { ComboCategoryChips } from '@/components/combo/combo-category-chips';
import { Breadcrumbs } from '@/components/layout/breadcrumbs';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import { ItemListJsonLd } from '@/components/seo/item-list-json-ld';
import { buildComboListItems } from '@/lib/seo-schema';
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

      {/* Structured list of the combo meanings on this page */}
      <ItemListJsonLd
        name={`${categoryInfo.displayName} Emoji Combos`}
        description={categoryInfo.description}
        pageUrl={`${env.appUrl}/combo/category/${category}`}
        items={buildComboListItems(env.appUrl, combos)}
      />

      <main className="container mx-auto max-w-6xl px-4 pb-16 pt-10">
        {/* Category Header */}
        <header className="mb-7">
          {/* Breadcrumb navigation */}
          <Breadcrumbs items={breadcrumbItems} className="mb-5" />
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {categoryInfo.displayName} Emoji Combos
          </h1>
          <p className="mt-2 max-w-2xl text-[17px] text-muted-foreground">
            {categoryInfo.description}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            {categoryInfo.comboCount} combo{categoryInfo.comboCount !== 1 ? 's' : ''} in this
            category
          </p>
        </header>

        <ComboCategoryChips
          className="mb-8"
          activeSlug={categoryInfo.slug}
          totalCount={getComboCount()}
          categories={getAllComboCategoryInfo()}
        />

        {/* Combo Grid */}
        {combos.length > 0 ? (
          <section aria-labelledby="combos-heading">
            <h2 id="combos-heading" className="sr-only">
              {categoryInfo.displayName} Emoji Combos
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] gap-3">
              {combos.map((combo) => (
                <ComboCard key={combo.slug} combo={combo} ariaLabel={`${combo.name} emoji combo`} />
              ))}
            </div>
          </section>
        ) : (
          <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center text-muted-foreground">
            <span className="text-4xl" aria-hidden="true">
              🧩
            </span>
            <p className="text-[17px] font-semibold text-foreground">
              No combos found in this category yet.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
