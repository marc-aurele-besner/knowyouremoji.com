/**
 * Emoji comparison data loader utility
 *
 * Provides functions to load and query curated emoji comparison data.
 */

import type { EmojiComparison, EmojiComparisonSummary } from '@/types/comparison';

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
