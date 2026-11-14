/**
 * Emoji comparison data loader utility
 *
 * Provides functions to load and query curated emoji comparison data.
 */

import type { EmojiComparison, EmojiComparisonSummary } from '@/types/comparison';
import { getEmojiBySlug } from '@/lib/emoji-data';

// Import Node.js fs for SSG/SSR context
import fs from 'fs';
import path from 'path';

// Cache for loaded comparisons
let comparisonCache: EmojiComparison[] | null = null;

/**
 * Get the path to the comparisons data directory
 */
function getComparisonsDir(): string {
  return path.join(process.cwd(), 'src', 'data', 'comparisons');
}

/**
 * Load all comparison data from JSON files
 * Results are cached after first load
 */
function loadComparisons(): EmojiComparison[] {
  if (comparisonCache !== null) {
    return comparisonCache;
  }

  const comparisonsDir = getComparisonsDir();

  // Check if directory exists
  if (!fs.existsSync(comparisonsDir)) {
    comparisonCache = [];
    return comparisonCache;
  }

  const indexPath = path.join(comparisonsDir, 'index.json');

  if (!fs.existsSync(indexPath)) {
    comparisonCache = [];
    return comparisonCache;
  }

  const content = fs.readFileSync(indexPath, 'utf-8');
  comparisonCache = JSON.parse(content) as EmojiComparison[];

  return comparisonCache;
}

/**
 * Get all comparisons
 * @returns Array of all comparison data
 */
export function getAllComparisons(): EmojiComparison[] {
  return loadComparisons();
}

/**
 * Get the comparisons whose emoji pages actually exist.
 *
 * A comparison that names an emoji slug with no matching page can never
 * render — the route calls `notFound()`. `/compare/fire/hundred` did
 * exactly that: `hundred` is not a slug in the catalog (💯 lives at
 * `hundred-points`), so the URL returned 404 while the sitemap still
 * advertised it as an indexable page.
 *
 * Filtering here keeps the sitemap, the compare hub, and the generated
 * static params in agreement with what the router can actually serve, so a
 * stale slug in the data can never put a 404 back into the sitemap.
 *
 * @returns Array of comparisons with both emoji pages resolvable
 */
export function getResolvableComparisons(): EmojiComparison[] {
  return loadComparisons().filter(
    (comparison) =>
      Boolean(getEmojiBySlug(comparison.emoji1Slug)) &&
      Boolean(getEmojiBySlug(comparison.emoji2Slug))
  );
}

/**
 * Get a comparison by its slug
 * @param slug - URL-friendly identifier for the comparison
 * @returns Comparison data or undefined if not found
 */
export function getComparisonBySlug(slug: string): EmojiComparison | undefined {
  return loadComparisons().find((comparison) => comparison.slug === slug);
}

/**
 * Get all comparison slugs for static path generation
 * @returns Array of all comparison slugs
 */
export function getAllComparisonSlugs(): string[] {
  return loadComparisons().map((comparison) => comparison.slug);
}

/**
 * Get comparison summaries for list/grid display
 * @returns Array of comparison summaries
 */
export function getComparisonSummaries(): EmojiComparisonSummary[] {
  return loadComparisons().map((comparison) => ({
    slug: comparison.slug,
    emoji1Slug: comparison.emoji1Slug,
    emoji2Slug: comparison.emoji2Slug,
    emoji1Character: '',
    emoji2Character: '',
    emoji1Name: '',
    emoji2Name: '',
  }));
}

/**
 * Clear the comparison cache (useful for testing)
 */
export function clearComparisonCache(): void {
  comparisonCache = null;
}
