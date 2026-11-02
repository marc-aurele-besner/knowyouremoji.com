/**
 * Pulls the editorial prose the site has already written about an emoji.
 *
 * Why this exists
 * ---------------
 * The batch generator filled every emoji page with the same template, which
 * is why more than a thousand pages read like one page repeated. Rewriting them from the
 * emoji's own record alone produced pages that were technically distinct and
 * still bland, because the record only holds a category and a name.
 *
 * The guides are the opposite: they are hand-written articles about what
 * particular emoji mean in real conversations, and they are the only place in
 * the repo where that specific knowledge exists. A guide that mentions 🤡
 * says what 🤡 is used for, who sends it, and how it misreads — exactly the
 * material a page about 🤡 needs and cannot be invented from a category name.
 *
 * So the writer is grounded in the guide prose rather than in the catalog
 * record, and the catalog record is used only for the facts the guide cannot
 * know (the Unicode name, the codepoint, the category).
 */

import fs from 'fs';
import path from 'path';

import { parseGuideFrontmatter } from '../../src/lib/guide-data';
import type { Emoji } from '../../src/types/emoji';

/**
 * One passage of guide prose about an emoji.
 */
export interface GuideExcerpt {
  /** Slug of the guide the passage came from. */
  guideSlug: string;
  /** The guide's headline, so the writer can see what the passage is about. */
  guideTitle: string;
  /** The section heading the passage sat under, when there was one. */
  heading?: string;
  /** The passage itself, with Markdown syntax removed. */
  text: string;
}

export interface EmojiGrounding {
  /** The emoji being grounded. */
  slug: string;
  /** The glyph, so the writer can use it in examples. */
  character: string;
  /** Display name. */
  name: string;
  /** What the glyph depicts, in plain language. */
  baseMeaning: string;
  /** The category, which tells the writer what kind of thing this is. */
  category: string;
  /** The subcategory, when the catalog has one. */
  subcategory?: string;
  /** The Unicode version the glyph was added in. */
  unicodeVersion: string;
  /** Guide passages about this emoji, richest first. */
  excerpts: GuideExcerpt[];
  /** Slugs of the guides the passages came from, in the order they were used. */
  guideSlugs: string[];
}

/**
 * The shortest a passage may be before it is treated as a real passage
 * rather than an incidental mention of the glyph.
 */
const MIN_EXCERPT_CHARS = 120;

/**
 * How many passages one emoji's grounding may carry.
 *
 * The prompt has to stay inside the model's attention, and past a certain
 * point the extra passages stop adding facts — the guides repeat themselves
 * about a popular emoji. The longest passages are kept, because a long
 * passage about an emoji is the one carrying the specifics.
 */
const MAX_EXCERPTS = 8;

/**
 * The longest a single passage may be. A guide section can run to several
 * hundred words; only the part of it that discusses the emoji is useful.
 */
const MAX_EXCERPT_CHARS = 900;

/**
 * Cut a passage to the length limit without leaving a half-sentence.
 *
 * A passage cut mid-sentence reads as a broken quote, and the writer takes
 * it as one. The cut lands on the last full stop that fits, and only falls
 * back to a hard cut when the passage has no punctuation to break on.
 */
export function truncateExcerpt(text: string, limit = MAX_EXCERPT_CHARS): string {
  if (text.length <= limit) return text;

  const slice = text.slice(0, limit);
  const lastStop = Math.max(
    slice.lastIndexOf('. '),
    slice.lastIndexOf('.\n'),
    slice.lastIndexOf('! '),
    slice.lastIndexOf('? ')
  );

  if (lastStop > limit * 0.5) return slice.slice(0, lastStop + 1).trim();

  return slice.trim();
}

/**
 * Strip Markdown down to the prose a reader sees.
 *
 * The guide bodies are written with headings, bullets, bold spans and
 * links. The writer is not being asked to reproduce Markdown, and the
 * link syntax carries no meaning for the emoji, so it is removed rather
 * than handed over as noise.
 */
export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}>\s?/gm, '')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s{0,3}[-*+]\s+/gm, '')
    .replace(/^\s{0,3}\d+\.\s+/gm, '')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(\*|_)(.*?)\1/g, '$2')
    .replace(/^\s*[-*_]{3,}\s*$/gm, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface ParsedGuide {
  slug: string;
  title: string;
  body: string;
  relatedEmojis: string[];
  heroEmoji?: string;
  draft: boolean;
}

let guideCache: ParsedGuide[] | null = null;

/**
 * Read every guide from disk, frontmatter parsed.
 *
 * A guide that fails to parse is skipped rather than fatal: the writer
 * should keep working with the guides it can read.
 */
export function loadGuides(
  guidesDir = path.join(process.cwd(), 'content', 'guides')
): ParsedGuide[] {
  if (guideCache) return guideCache;

  const guides: ParsedGuide[] = [];
  if (fs.existsSync(guidesDir)) {
    for (const file of fs.readdirSync(guidesDir).filter((f) => f.endsWith('.md'))) {
      const slug = file.replace(/\.md$/, '');
      try {
        const source = fs.readFileSync(path.join(guidesDir, file), 'utf-8');
        const { data, body } = parseGuideFrontmatter(source);
        const related = Array.isArray(data.relatedEmojis)
          ? (data.relatedEmojis as unknown[]).map((entry) => String(entry))
          : [];
        guides.push({
          slug,
          title: typeof data.title === 'string' ? data.title : slug,
          body,
          relatedEmojis: related,
          heroEmoji: typeof data.heroEmoji === 'string' ? data.heroEmoji : undefined,
          draft: data.draft === 'true' || data.draft === true,
        });
      } catch {
        // A half-written draft should not stop the run.
      }
    }
  }

  guideCache = guides;
  return guides;
}

/** Clear the in-memory guide cache. Test helper. */
export function clearGuideCache(): void {
  guideCache = null;
}

/**
 * Split a guide body into sections, keeping the heading each section sits
 * under.
 */
export function splitSections(body: string): { heading?: string; text: string }[] {
  const sections: { heading?: string; text: string }[] = [];
  let heading: string | undefined;
  let buffer: string[] = [];

  const flush = () => {
    const text = buffer.join('\n').trim();
    if (text) sections.push({ heading, text });
    buffer = [];
  };

  for (const rawLine of body.split('\n')) {
    if (/^\s{0,3}#{1,6}\s+/.test(rawLine)) {
      flush();
      heading = stripMarkdown(rawLine);
      continue;
    }
    buffer.push(rawLine);
  }
  flush();

  return sections;
}

/**
 * Split a section into paragraphs.
 */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/**
 * How relevant a passage is to one emoji.
 *
 * The number of times the glyph appears matters most: a passage that names
 * the emoji three times is discussing it, while a passage that names it once
 * in a list of eight is passing over it. The emoji's own name counts too,
 * because the guides sometimes write "the clown face" rather than the glyph.
 * Length breaks the remaining ties — the longer passage is the one that
 * explains.
 */
export function scoreExcerpt(text: string, emoji: Emoji): number {
  const glyphHits = text.split(emoji.character).length - 1;
  const nameHits = nameKeywords(emoji).reduce(
    (count, word) => count + countOccurrences(text.toLowerCase(), word),
    0
  );

  return glyphHits * 10 + nameHits * 3 + Math.min(text.length, 600) / 600;
}

/**
 * The words of an emoji's name that carry its identity.
 *
 * "Clown Face" is two words that have to appear together; "Face" on its own
 * is too generic to identify anything, so a single short word is not
 * enough on its own.
 */
export function nameKeywords(emoji: Emoji): string[] {
  const stopWords = ['emoji', 'sign', 'symbol', 'with', 'and', 'the', 'a'];

  return emoji.name
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.includes(word));
}

/**
 * Whether a passage talks about the emoji by name rather than by glyph.
 *
 * The guides write "the clown face" and "the clown face emoji" as often as
 * they write 🤡, so a passage that names the emoji is about the emoji even
 * when the glyph never appears in it. Every word of the name has to be
 * present, so "face with tongue" does not match a passage about a face.
 */
export function namesEmoji(text: string, emoji: Emoji): boolean {
  const lowered = text.toLowerCase();
  const words = nameKeywords(emoji);

  if (words.length === 0) return false;
  if (words.length === 1 && words[0].length < 5) return false;

  return words.every((word) => lowered.includes(word));
}

/**
 * Count non-overlapping occurrences of a substring.
 */
export function countOccurrences(text: string, needle: string): number {
  if (!needle) return 0;
  return text.split(needle).length - 1;
}

/**
 * Collect the guide passages that talk about an emoji.
 *
 * A passage counts when it contains the glyph. The passages are then
 * ranked by how much they are about the emoji, not merely by length.
 *
 * A passage that names the emoji instead of showing the glyph counts too,
 * but only in a guide that already claims the emoji: either the guide lists
 * it in its `relatedEmojis` frontmatter, or the guide is about the emoji by
 * name. Without that claim the name match would pull in passages about a
 * bomb in a war story rather than about 💣.
 */
export function extractExcerpts(
  guides: ParsedGuide[],
  emoji: Emoji,
  options: { max?: number; minChars?: number } = {}
): GuideExcerpt[] {
  const max = options.max ?? MAX_EXCERPTS;
  const minChars = options.minChars ?? MIN_EXCERPT_CHARS;

  const found: { excerpt: GuideExcerpt; score: number; order: number }[] = [];
  let order = 0;

  for (const guide of guides) {
    const guideClaimsEmoji =
      guide.relatedEmojis.includes(emoji.slug) || guide.heroEmoji === emoji.character;

    if (!guideClaimsEmoji && !guide.body.includes(emoji.character)) continue;

    for (const section of splitSections(guide.body)) {
      for (const paragraph of splitParagraphs(section.text)) {
        const hasGlyph = paragraph.includes(emoji.character);
        if (!hasGlyph && !(guideClaimsEmoji && namesEmoji(paragraph, emoji))) continue;

        const text = stripMarkdown(paragraph);
        if (text.length < minChars) continue;

        found.push({
          excerpt: {
            guideSlug: guide.slug,
            guideTitle: guide.title,
            heading: section.heading,
            text: truncateExcerpt(text),
          },
          score: scoreExcerpt(text, emoji),
          order: order++,
        });
      }
    }
  }

  found.sort((a, b) => b.score - a.score || a.order - b.order);

  return found.slice(0, max).map((entry) => entry.excerpt);
}

/**
 * Build the grounding for one emoji.
 *
 * Returns null when no guide says anything about the emoji — there is
 * nothing to write from, and a page written without grounding is exactly
 * the page this pipeline exists to replace.
 */
export function buildEmojiGrounding(
  emoji: Emoji,
  guides: ParsedGuide[] = loadGuides()
): EmojiGrounding | null {
  const excerpts = extractExcerpts(guides, emoji);
  if (excerpts.length === 0) return null;

  const guideSlugs: string[] = [];
  for (const excerpt of excerpts) {
    if (!guideSlugs.includes(excerpt.guideSlug)) guideSlugs.push(excerpt.guideSlug);
  }

  return {
    slug: emoji.slug,
    character: emoji.character,
    name: emoji.name,
    baseMeaning: emoji.baseMeaning,
    category: emoji.category,
    subcategory: emoji.subcategory,
    unicodeVersion: emoji.unicodeVersion,
    excerpts,
    guideSlugs,
  };
}
