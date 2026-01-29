import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getComboCount,
  getAllComboCategories,
  getComboSummariesByCategory,
} from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * Category display names
 */
const CATEGORY_DISPLAY_NAMES: Record<string, string> = {
  flirting: 'Flirting & Romance',
  friendship: 'Friendship',
  celebration: 'Celebration',
  emotions: 'Emotions',
  reactions: 'Reactions',
  humor: 'Humor',
  other: 'Other',
};

/**
 * Generate metadata for the combo browse page
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const comboCount = getComboCount();
  const pageUrl = `${env.appUrl}/combo`;
  const title = `Browse All ${comboCount} Emoji Combos - ${env.appName}`;
  const description = `Explore ${comboCount} emoji combination meanings. Understand what emoji combos like 👉👈, 🥺👉👈, and more really mean in texts and social media.`;

  return {
    title,
    description,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: pageUrl,
      siteName: env.appName,
      title,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

/**
 * Combo browse page - displays all emoji combos organized by category
 */
export default function ComboBrowsePage() {
  const comboCount = getComboCount();
  const categories = getAllComboCategories();

  // Group combos by category with display names
  const combosByCategory = categories.map((category) => ({
    slug: category,
    displayName: CATEGORY_DISPLAY_NAMES[category] || category,
    combos: getComboSummariesByCategory(category),
  }));

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-amber-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-16">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Emoji Combos
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Discover {comboCount} emoji combination meanings and what they really mean in texts
          </p>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-8 border-b dark:border-gray-800 sticky top-16 bg-white/95 dark:bg-gray-900/95 backdrop-blur z-40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-wrap gap-2 justify-center">
            {combosByCategory.map((category) => (
              <a
                key={category.slug}
                href={`#${category.slug}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 hover:bg-amber-100 text-gray-700 hover:text-amber-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-amber-900/30 dark:hover:text-amber-400 transition-colors"
              >
                {category.displayName} ({category.combos.length})
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* All Combos Grid */}
      {combosByCategory.length > 0 ? (
        combosByCategory.map((category) => (
          <section
            key={category.slug}
            id={category.slug}
            className="py-12 border-b dark:border-gray-800 last:border-b-0"
          >
            <div className="container mx-auto px-4 max-w-6xl">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {category.displayName}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  {category.combos.length} combos
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.combos.map((combo) => (
                  <Link
                    key={combo.slug}
                    href={`/combo/${combo.slug}`}
                    className="block"
                    aria-label={combo.name}
                  >
                    <Card className="hover:shadow-lg hover:scale-105 hover:border-amber-500 transition-all duration-200 h-full">
                      <CardHeader className="text-center pb-2">
                        <span className="text-4xl mb-2 block">{combo.combo}</span>
                        <CardTitle className="text-base">{combo.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                          {combo.meaning}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))
      ) : (
        <section className="py-16">
          <div className="container mx-auto px-4 text-center">
            <p className="text-gray-500 dark:text-gray-400">No emoji combos available yet.</p>
          </div>
        </section>
      )}
    </div>
  );
}
