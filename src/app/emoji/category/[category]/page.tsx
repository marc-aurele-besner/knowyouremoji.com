import { notFound } from 'next/navigation';
import {
  getAllCategoryInfo,
  getAllValidCategories,
  getCategoryInfo,
  getEmojiSummariesByCategory,
  isValidCategory,
} from '@/lib/emoji-data';
import { getEnv } from '@/lib/env';
import { EmojiHubPage } from '@/components/emoji/emoji-hub-page';
import { BreadcrumbJsonLd } from '@/components/seo/breadcrumb-json-ld';
import type { Metadata } from 'next';

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

/**
 * Revalidate pages every hour (3600 seconds)
 * This enables Incremental Static Regeneration (ISR) for category pages
 */
export const revalidate = 3600;

/**
 * Generate static params for all category pages at build time
 *
 * Only the canonical categories are generated. The corpus contains legacy
 * category strings that do not have their own page — generating them would
 * prerender a 404 for each one, still carrying the site's default
 * `index, follow` robots directives.
 */
export async function generateStaticParams() {
  const categories = getAllValidCategories();
  return categories.map((category) => ({ category }));
}

/**
 * Generate metadata for the category page
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;
  const categoryInfo = getCategoryInfo(category);

  if (!categoryInfo) {
    // An unknown category slug has no page to describe. Returning `{}`
    // here would inherit the root layout's metadata — including its
    // `index, follow` directives and the *homepage's* canonical URL,
    // which tells search engines the homepage is the canonical version of
    // this URL. Ask for removal from the index instead.
    return {
      title: 'Category Not Found',
      robots: {
        index: false,
        follow: true,
        googleBot: {
          index: false,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    };
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

  // Sibling chips: every category that has its own page
  const siblings = getAllCategoryInfo()
    .filter((info) => isValidCategory(info.slug))
    .map((info) => ({
      label: info.displayName,
      href: `/emoji/category/${info.slug}`,
      active: info.slug === category,
    }));

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

      <EmojiHubPage
        breadcrumbs={breadcrumbItems}
        title={`${categoryInfo.displayName} Emojis`}
        description={categoryInfo.description}
        countLabel={`${categoryInfo.emojiCount} emoji${categoryInfo.emojiCount !== 1 ? 's' : ''} in this category`}
        siblings={siblings}
        siblingsLabel="Other categories"
        emojis={emojis}
        gridHeading={`${categoryInfo.displayName} Emojis`}
        emptyTitle="No emojis found in this category yet."
      />
    </>
  );
}
