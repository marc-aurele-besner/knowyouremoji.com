/**
 * TypeScript types for guides (editorial articles)
 *
 * Guides are long-form Markdown articles stored under `content/guides/*.md`
 * with YAML-style frontmatter. They power the `/guides` section of the site
 * and exist to prove to AdSense (and human reviewers) that KnowYourEmoji is
 * a real publisher with original editorial content — not a thin, auto-
 * generated emoji directory.
 *
 * This file is intentionally aligned with the PRD in issue #342
 * (CONTENT-P1-003).
 */

/**
 * URL-safe slug for a guide.
 * Matches the filename without the `.md` extension.
 * @example "what-does-skull-mean-in-texting"
 */
export type GuideSlug = string;

/**
 * Lightweight summary for the guides index, related-guides lists, and the
 * homepage featured-guides strip. Does not include the full Markdown body.
 */
export interface GuideSummary {
  /** URL slug (also the filename without `.md`) */
  slug: GuideSlug;
  /** Article title shown to readers */
  title: string;
  /** Short description used in cards and meta description */
  description: string;
  /** Hero emoji displayed at the top of the card and article (optional) */
  heroEmoji?: string;
  /** Tags used for filtering and SEO */
  tags: string[];
  /** ISO-8601 publish date */
  publishedAt: string;
  /** ISO-8601 last-updated date */
  updatedAt: string;
  /** Estimated reading time in minutes (writer-supplied) */
  readingTimeMinutes: number;
  /** Author display name */
  author: string;
  /** Optional slugs of related emoji pages to cross-link */
  relatedEmojis?: string[];
  /** Optional slugs of related combo pages to cross-link */
  relatedCombos?: string[];
  /** Optional human SEO title override */
  seoTitle?: string;
  /** Optional human SEO description override */
  seoDescription?: string;
}

/**
 * Full guide record, including the raw Markdown body and pre-rendered HTML.
 *
 * The HTML body is computed once at load time and cached alongside the
 * record so route components never have to re-run the Markdown renderer.
 */
export interface Guide extends GuideSummary {
  /** Raw Markdown body (everything after the frontmatter block) */
  body: string;
  /** Pre-rendered HTML body produced from `body` */
  html: string;
  /** Whether the guide is a draft (hidden from production listing) */
  draft: boolean;
}
