/**
 * Resolves the real emoji records behind a combo so the content writer can
 * ground its prose in what each emoji actually means.
 *
 * A combo names its parts as slugs (`["lightbulb", "fire"]`), but the emoji
 * catalog stores them under slightly different slugs (`light-bulb`,
 * `light-bulb-emoji`, ...). The page renderer resolves combo emoji slugs
 * with an exact match, which is why a number of combos silently lose a card
 * in the "Emojis in this Combo" grid.
 *
 * Resolution order, first hit wins:
 *   1. exact `slug`
 *   2. file name without `.json`
 *   3. the emoji's own `character`, matched against the combo's glyphs
 *
 * The character fallback is the reliable one: it is the only identifier that
 * cannot drift, since it is what the reader actually sees.
 */

import fs from 'fs';
import path from 'path';

interface EmojiRecord {
  slug: string;
  character: string;
  name: string;
  baseMeaning?: string;
  tldr?: string;
  category?: string;
  contextMeanings?: Array<{
    context: string;
    meaning: string;
    example?: string;
    riskLevel?: string;
  }>;
  platformNotes?: Array<{ platform: string; note: string }>;
  generationalNotes?: Array<{ generation: string; note: string }>;
  warnings?: Array<{ title: string; description: string; severity?: string }>;
}

export interface EmojiBrief {
  /** Slug of the resolved emoji record. */
  slug: string;
  /** The glyph itself. */
  character: string;
  /** Display name, e.g. "Light Bulb". */
  name: string;
  /** What the glyph depicts, in plain language. */
  baseMeaning: string;
  /** One-line summary of the emoji's communicative job. */
  tldr: string;
  /** Context-by-context readings, capped and de-duplicated. */
  contexts: Array<{ context: string; meaning: string; example?: string }>;
  /** Known misreads, the best raw material for `whenNotToUse`. */
  warnings: Array<{ title: string; description: string }>;
  /** Platform-specific behaviour, capped at three. */
  platformNotes: Array<{ platform: string; note: string }>;
  /** Generational differences, capped at two. */
  generationalNotes: Array<{ generation: string; note: string }>;
  /** True when the combo repeats the same emoji twice. */
  doubled: boolean;
}

let catalog: EmojiRecord[] | null = null;
let bySlug: Map<string, EmojiRecord> | null = null;
let byLooseSlug: Map<string, EmojiRecord> | null = null;
let byCharacter: Map<string, EmojiRecord[]> | null = null;

function loadCatalog(): EmojiRecord[] {
  if (catalog) return catalog;
  const dir = path.join(process.cwd(), 'src', 'data', 'emojis');
  const records: EmojiRecord[] = [];
  if (fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      try {
        const parsed = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf-8')) as EmojiRecord;
        if (parsed?.slug && parsed?.character) records.push(parsed);
      } catch {
        // A malformed emoji file should not take the whole pipeline down.
      }
    }
  }
  catalog = records;

  bySlug = new Map();
  byLooseSlug = new Map();
  byCharacter = new Map();
  for (const record of records) {
    // The first record wins for a given slug; the catalog is sorted by file
    // name so the base (non skin-tone) entry comes first.
    if (!bySlug.has(record.slug)) bySlug.set(record.slug, record);
    const loose = record.slug.replace(/-/g, '');
    if (!byLooseSlug.has(loose)) byLooseSlug.set(loose, record);
    const existing = byCharacter.get(record.character);
    if (existing) existing.push(record);
    else byCharacter.set(record.character, [record]);
  }
  return records;
}

/**
 * Prefer the base emoji over a skin-tone variant: they share a character but
 * only the base one carries the meaning.
 */
function preferBase(records: EmojiRecord[]): EmojiRecord {
  return records.find((r) => !/skin-tone/.test(r.slug)) ?? records[0];
}

/**
 * Split a combo's glyph string into grapheme clusters so that ZWJ sequences
 * (😵‍💫) stay in one piece.
 */
export function splitGraphemes(glyphs: string): string[] {
  const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' });
  return [...segmenter.segment(glyphs)].map((s) => s.segment);
}

/**
 * Resolve one emoji of a combo to its catalog record.
 *
 * @param slug    The slug the combo uses for this part.
 * @param glyph   The matching grapheme cluster from the combo's glyph string.
 */
export function resolveEmoji(slug: string | undefined, glyph?: string): EmojiRecord | undefined {
  loadCatalog();
  if (!bySlug || !byLooseSlug || !byCharacter) return undefined;

  if (slug) {
    const direct = bySlug.get(slug);
    if (direct) return direct;
    const loose = byLooseSlug.get(slug.replace(/-/g, ''));
    if (loose) return loose;
  }
  if (glyph) {
    const candidates = byCharacter.get(glyph);
    if (candidates?.length) return preferBase(candidates);
  }
  return undefined;
}

/** Strip the catalog's hyphenated jargon so it does not leak into prose. */
function humanize(text: string): string {
  return text
    .replace(/([A-Za-z]+)-coded\b/g, '$1')
    .replace(/\s*,\s*and\s+the\s+cadence\s+stays\s+the\s+same\.?/gi, '')
    .trim();
}

function pickContexts(record: EmojiRecord): EmojiBrief['contexts'] {
  const seen = new Set<string>();
  const out: EmojiBrief['contexts'] = [];
  for (const ctx of record.contextMeanings ?? []) {
    // "LITERAL" tells us what the glyph depicts, not how it is used in chat.
    const key = ctx.meaning.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      context: ctx.context,
      meaning: humanize(ctx.meaning),
      example: ctx.example ? humanize(ctx.example) : undefined,
    });
    if (out.length >= 4) break;
  }
  return out;
}

/**
 * Build the grounding brief for a single emoji of a combo.
 */
export function buildEmojiBrief(
  slug: string | undefined,
  glyph: string | undefined,
  doubled: boolean
): EmojiBrief | null {
  const record = resolveEmoji(slug, glyph);
  if (!record) return null;

  return {
    slug: record.slug,
    character: record.character,
    name: record.name,
    baseMeaning: humanize(record.baseMeaning ?? `The ${record.name} emoji.`),
    tldr: humanize(record.tldr ?? record.baseMeaning ?? record.name),
    contexts: pickContexts(record),
    warnings: (record.warnings ?? []).slice(0, 2).map((w) => ({
      title: humanize(w.title),
      description: humanize(w.description),
    })),
    platformNotes: (record.platformNotes ?? []).slice(0, 3).map((p) => ({
      platform: p.platform,
      note: humanize(p.note),
    })),
    generationalNotes: (record.generationalNotes ?? []).slice(0, 2).map((g) => ({
      generation: g.generation,
      note: humanize(g.note),
    })),
    doubled,
  };
}

/**
 * Build grounding briefs for every part of a combo.
 *
 * @param comboEmojiSlugs Slugs listed in the combo JSON.
 * @param comboGlyphs      The combo's glyph string.
 */
export function buildComboBriefs(
  comboEmojiSlugs: string[],
  comboGlyphs: string
): { briefs: EmojiBrief[]; resolved: (EmojiBrief | null)[] } {
  const graphs = splitGraphemes(comboGlyphs);
  const resolved = comboEmojiSlugs.map((slug, index) => {
    const glyph = graphs[index];
    const doubled = comboEmojiSlugs.filter((s) => s === slug).length > 1;
    return buildEmojiBrief(slug, glyph, doubled);
  });
  return { briefs: resolved.filter((b): b is EmojiBrief => b !== null), resolved };
}
