import type { Metadata } from 'next';
import {
  getComboCount,
  getAllComboCategories,
  getComboSummariesByCategory,
  getComboCategoryDisplayName,
} from '@/lib/combo-data';
import { getEnv } from '@/lib/env';
import { BookBanner } from '@/components/layout/book-banner';
import { ComboBrowser } from '@/components/combo/combo-browser';
import { ComboCategoryChips } from '@/components/combo/combo-category-chips';

/**
 * Generate metadata for the combo browse page
 */
export function generateMetadata(): Metadata {
  const env = getEnv();
  const comboCount = getComboCount();
  const pageUrl = `${env.appUrl}/combo`;
  // The root layout applies the `%s | <siteName>` title template, so the
  // metadata title must NOT include the site name itself — otherwise the
  // rendered `<title>` ends up with the name twice. Social cards are not
  // templated, so they keep their own fully-branded string.
  const title = `Browse All ${comboCount} Emoji Combos`;
  const socialTitle = `Browse All ${comboCount} Emoji Combos - ${env.appName}`;
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
      title: socialTitle,
      description,
    },
    twitter: {
      card: 'summary_large_image',
      title: socialTitle,
      description,
    },
  };
}

/**
 * Combo browse page - displays all emoji combos organized by category,
 * with client-side search and an A–Z sort layered on top.
 */
export default function ComboBrowsePage() {
  const comboCount = getComboCount();
  const categories = getAllComboCategories();

  // Group combos by category with display names
  const combosByCategory = categories.map((category) => ({
    slug: category,
    displayName: getComboCategoryDisplayName(category),
    combos: getComboSummariesByCategory(category),
  }));

  return (
    <div className="container mx-auto max-w-6xl px-4 pb-16 pt-10">
      <header className="mb-7">
        <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">Emoji combos</h1>
        <p className="mt-2 max-w-2xl text-[17px] text-muted-foreground">
          Discover {comboCount} emoji combination meanings and what they really mean in texts
        </p>
      </header>

      {combosByCategory.length > 0 ? (
        <ComboBrowser
          groups={combosByCategory}
          filters={
            <>
              <ComboCategoryChips
                totalCount={comboCount}
                categories={combosByCategory.map((category) => ({
                  slug: category.slug,
                  displayName: category.displayName,
                  comboCount: category.combos.length,
                }))}
              />
              <BookBanner variant="wide" className="mt-8" />
            </>
          }
        />
      ) : (
        <div className="flex flex-col items-center gap-2.5 rounded-2xl border border-dashed border-card-border px-6 py-12 text-center text-muted-foreground">
          <span className="text-4xl" aria-hidden="true">
            🧩
          </span>
          <p className="text-[17px] font-semibold text-foreground">
            No emoji combos available yet.
          </p>
          <p className="text-sm">Check back soon — new combos are added regularly.</p>
        </div>
      )}
    </div>
  );
}
