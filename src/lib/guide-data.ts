/**
 * Guide data loader utility
 *
 * Loads editorial guides from Markdown files under `content/guides/*.md`.
 * Each file uses YAML-style frontmatter at the top (between `---` fences)
 * followed by a Markdown body that is rendered to HTML at load time.
 *
 * The loader mirrors the static Phase-1 architecture used for emojis and
 * combos: all parsing happens on the server during SSG/ISR, results are
 * cached in memory, and route components consume plain TypeScript objects.
 */

import fs from 'fs';
import path from 'path';
import { marked } from 'marked';
import type { Guide, GuideSlug, GuideSummary } from '@/types/guide';

/**
 * Split a Markdown source into its frontmatter block and body.
 *
 * Expects the frontmatter to start on the first line with `---`, end with
 * a matching `---`, and contain simple `key: value` pairs plus optional
 * YAML list syntax (`key: [a, b]`). This intentionally avoids pulling in
 * a YAML dependency — the frontmatter used by guides is a small, well-
 * defined subset.
 *
 * Exported for testing.
 */
export function parseGuideFrontmatter(source: string): {
  data: Record<string, unknown>;
  body: string;
} {
  // Normalize line endings so the parser is robust to CRLF/LF inputs.
  const normalized = source.replace(/\r\n/g, '\n');

  // Frontmatter must start at the very first line.
  if (!normalized.startsWith('---\n')) {
    throw new Error('Guide is missing frontmatter; expected file to start with "---".');
  }

  const closing = normalized.indexOf('\n---', 3);
  if (closing === -1) {
    throw new Error('Guide frontmatter is not closed with a matching "---".');
  }

  const frontmatterBlock = normalized.slice(4, closing);
  const afterClosing = normalized.slice(closing + 4);
  // Drop the optional single newline right after the closing fence.
  const body = afterClosing.startsWith('\n') ? afterClosing.slice(1) : afterClosing;

  const data: Record<string, unknown> = {};
  const lines = frontmatterBlock.split('\n');
  let i = 0;
  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) {
      i++;
      continue;
    }

    const colonAt = line.indexOf(':');
    if (colonAt === -1) {
      throw new Error(`Invalid frontmatter line (missing ":"): "${rawLine}"`);
    }

    const key = line.slice(0, colonAt).trim();
    let valueStr = line.slice(colonAt + 1).trim();
    let consumed = 1;

    // Inline list syntax may span multiple lines when prettier splits long
    // lists across lines. That can look like `key: [` (open bracket, no
    // close on this line) or even `key:` followed by `  [` on the next
    // line. In both cases the value isn't finished yet, so consume the
    // following indented lines until the matching `]` appears. We only
    // do this when the value clearly belongs to a list (the line ends
    // with `[` or starts one on the next line) so an intentional empty
    // value is preserved.
    const listAlreadyClosed = valueStr.includes(']');
    const listOpensHere = valueStr === '' || valueStr.startsWith('[');
    if (listOpensHere && !listAlreadyClosed) {
      const parts: string[] = [];
      if (valueStr !== '') {
        parts.push(valueStr);
      }
      let j = i + 1;
      let foundCloser = false;
      while (j < lines.length && !foundCloser) {
        const next = lines[j].trim();
        if (next === '') {
          j++;
          continue;
        }
        // Bail out if the next content line is a new `key:` — that means
        // the current key was intentionally left empty, not a list.
        if (parts.length === 0 && next.startsWith('[')) {
          parts.push(next);
        } else if (parts.length === 0) {
          // Empty value followed by a non-list line: keep the empty value.
          break;
        } else {
          parts.push(next);
        }
        if (next.includes(']')) foundCloser = true;
        j++;
      }
      if (parts.length > 0 && parts.join(' ').includes(']')) {
        valueStr = parts.join(' ').trim();
        consumed = j - i;
      } else {
        consumed = 1;
      }
    }
    i += consumed;

    let value: string | string[];
    // Inline list syntax: `[a, b, c]` → string[]
    if (valueStr.startsWith('[') && valueStr.endsWith(']')) {
      value = valueStr
        .slice(1, -1)
        .split(',')
        .map((entry) => entry.trim().replace(/^['"]|['"]$/g, ''))
        .filter((entry) => entry.length > 0);
    } else {
      // Strip surrounding quotes for plain string values.
      value = valueStr.replace(/^['"]|['"]$/g, '');
    }

    data[key] = value;
  }

  return { data, body };
}

/**
 * Coerce the loosely-typed frontmatter record into a typed `Guide`.
 *
 * Throws when a required field is missing or has the wrong shape — the
 * loader surfaces those failures with the file path so writers can fix
 * authoring mistakes before they hit production.
 *
 * Exported (named `_buildGuideFromFrontmatter`) so unit tests can drive
 * the validation paths without going through the filesystem loader.
 */
export function _buildGuideFromFrontmatter(
  data: Record<string, unknown>,
  body: string,
  slug: GuideSlug
): Guide {
  const requireString = (key: string): string => {
    const value = data[key];
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Guide "${slug}" is missing required frontmatter field "${key}".`);
    }
    return value;
  };

  const requireStringList = (key: string): string[] => {
    const value = data[key];
    if (value === undefined) return [];
    if (Array.isArray(value)) {
      return value.map((entry) => String(entry));
    }
    throw new Error(`Guide "${slug}" frontmatter field "${key}" must be a list.`);
  };

  const title = requireString('title');
  const description = requireString('description');
  const publishedAt = requireString('publishedAt');
  const updatedAt = requireString('updatedAt');
  const author = requireString('author');

  const heroEmoji = typeof data.heroEmoji === 'string' ? data.heroEmoji : undefined;
  const seoTitle = typeof data.seoTitle === 'string' ? data.seoTitle : undefined;
  const seoDescription = typeof data.seoDescription === 'string' ? data.seoDescription : undefined;

  const readingTimeRaw = data.readingTimeMinutes;
  let readingTimeMinutes = 5;
  if (typeof readingTimeRaw === 'string' && readingTimeRaw.length > 0) {
    const parsed = Number.parseInt(readingTimeRaw, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      readingTimeMinutes = parsed;
    }
  }

  const draft = data.draft === 'true' || data.draft === true;

  const tags = requireStringList('tags');
  const relatedEmojis = requireStringList('relatedEmojis');
  const relatedCombos = requireStringList('relatedCombos');

  // Render Markdown to HTML once at load time so route components don't
  // re-run the renderer on every request.
  const html = marked.parse(body, { async: false }) as string;

  return {
    slug,
    title,
    description,
    heroEmoji,
    tags,
    publishedAt,
    updatedAt,
    readingTimeMinutes,
    author,
    relatedEmojis,
    relatedCombos,
    seoTitle,
    seoDescription,
    body,
    html,
    draft,
  };
}

/** Path to the on-disk guides content directory. */
function getGuidesDir(): string {
  return path.join(process.cwd(), 'content', 'guides');
}

/**
 * Strip a leading `#`, `##`, … from a Markdown heading and collapse
 * whitespace — used to seed a default SEO title from the first H1.
 */
function firstHeadingFallback(body: string): string | undefined {
  for (const rawLine of body.split('\n')) {
    const line = rawLine.trim();
    if (line.startsWith('# ')) {
      return line.slice(2).trim();
    }
  }
  return undefined;
}

/** Internal cache to avoid re-reading files on every call. */
let guideCache: Guide[] | null = null;

/**
 * Load all guides from `content/guides/*.md`.
 *
 * Files that fail to parse are reported to the console and skipped so a
 * single bad draft cannot block the production build.
 */
function loadGuides(): Guide[] {
  if (guideCache !== null) {
    return guideCache;
  }

  const guidesDir = getGuidesDir();
  if (!fs.existsSync(guidesDir)) {
    guideCache = [];
    return guideCache;
  }

  const files = fs.readdirSync(guidesDir).filter((file) => file.endsWith('.md'));
  const loaded: Guide[] = [];

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const filePath = path.join(guidesDir, file);
    try {
      const source = fs.readFileSync(filePath, 'utf-8');
      const { data, body } = parseGuideFrontmatter(source);
      const guide = _buildGuideFromFrontmatter(data, body, slug);
      loaded.push(guide);
    } catch (error) {
      // Surface the failure but don't crash the build — drafts may be in
      // a half-finished state.
      console.error(`[guides] Failed to load "${file}":`, error);
    }
  }

  guideCache = loaded;
  return guideCache;
}

/** Return all guides (including drafts). */
export function getAllGuides(): Guide[] {
  return loadGuides();
}

/** Return only published guides (drafts hidden). */
export function getPublishedGuides(): Guide[] {
  return loadGuides().filter((guide) => !guide.draft);
}

/** Get a single guide by slug, regardless of draft state. */
export function getGuideBySlug(slug: GuideSlug): Guide | undefined {
  return loadGuides().find((guide) => guide.slug === slug);
}

/**
 * Get a published guide by slug. Used by the public route so draft files
 * can be authored in the repo without leaking to production builds.
 */
export function getPublishedGuideBySlug(slug: GuideSlug): Guide | undefined {
  const guide = getGuideBySlug(slug);
  if (!guide || guide.draft) return undefined;
  return guide;
}

/** All slugs for `generateStaticParams`. Includes drafts (route filters them). */
export function getAllGuideSlugs(): GuideSlug[] {
  return loadGuides().map((guide) => guide.slug);
}

/** Slugs of published guides only — used by the sitemap. */
export function getPublishedGuideSlugs(): GuideSlug[] {
  return getPublishedGuides().map((guide) => guide.slug);
}

/**
 * Lightweight summary used by cards/lists. Returns published guides only,
 * sorted by `publishedAt` descending so the index always surfaces fresh
 * content first.
 */
export function getPublishedGuideSummaries(): GuideSummary[] {
  return getPublishedGuides()
    .map(toSummary)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));
}

/** All guide summaries (including drafts) sorted newest first. */
export function getAllGuideSummaries(): GuideSummary[] {
  return loadGuides()
    .map(toSummary)
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : a.publishedAt > b.publishedAt ? -1 : 0));
}

/** Pick the lightweight summary fields out of a full guide. */
function toSummary(guide: Guide): GuideSummary {
  return {
    slug: guide.slug,
    title: guide.title,
    description: guide.description,
    heroEmoji: guide.heroEmoji,
    tags: guide.tags,
    publishedAt: guide.publishedAt,
    updatedAt: guide.updatedAt,
    readingTimeMinutes: guide.readingTimeMinutes,
    author: guide.author,
    relatedEmojis: guide.relatedEmojis,
    relatedCombos: guide.relatedCombos,
    seoTitle: guide.seoTitle,
    seoDescription: guide.seoDescription,
  };
}

/** Compute a fallback SEO title from the first Markdown heading. */
export function deriveSeoTitle(guide: Guide): string {
  if (guide.seoTitle && guide.seoTitle.length > 0) return guide.seoTitle;
  const heading = firstHeadingFallback(guide.body);
  return heading ?? guide.title;
}

/** Compute a fallback SEO description from the frontmatter description. */
export function deriveSeoDescription(guide: Guide): string {
  if (guide.seoDescription && guide.seoDescription.length > 0) return guide.seoDescription;
  return guide.description;
}

/** Number of published guides. */
export function getPublishedGuideCount(): number {
  return getPublishedGuides().length;
}

/** Clear the in-memory cache. Test helper. */
export function clearGuideCache(): void {
  guideCache = null;
}
