/**
 * Regenerates the content of every skin-tone variant emoji page.
 *
 * Why this exists
 * ---------------
 * The five Fitzpatrick variants of an emoji (👮 👮🏻 👮🏼 👮🏽 👮🏾 👮🏿) were
 * originally produced by a generator that substituted the tone word into one
 * fixed sentence template. The result was five near-identical pages per
 * family, filled with filler like "the emoji of hand-coded reaction — the
 * manual tradition", which read as obviously machine-made to anyone who opened
 * two of them side by side.
 *
 * This generator replaces that output with two hand-authored halves:
 *
 *   - `profiles/` — one profile per emoji family, written by hand, describing
 *     what the artwork shows, what the gesture does in a conversation and how
 *     it gets misread.
 *   - `tone-archetypes.ts` — one set of templates per tone, each with its own
 *     structure and emphasis, describing what a particular skin-tone choice
 *     signals and how it renders.
 *
 * Run with `bun run generate:skin-tone-content`.
 */

import fs from 'fs';
import path from 'path';

import { format, type Options } from 'prettier';

import type { ContextType, Emoji } from '../../src/types/emoji';
import {
  archetypeFor,
  baseContextMeanings,
  baseConversationExamples,
  baseFaqs,
  baseGenerationalNotes,
  baseHowPeopleUseIt,
  baseHowToReply,
  baseMeaning,
  baseOverview,
  basePlatformNotes,
  baseSeoDescription,
  baseSeoTitle,
  baseTldr,
  baseWarnings,
  baseWhenNotToUse,
  type BaseContext,
} from './base-archetypes';
import { FAMILY_PROFILES } from './profiles';
import {
  TONE_META,
  overview,
  howPeopleUseIt,
  whenNotToUse,
  howToReply,
  faqs,
  platformNotes,
  generationalNotes,
  warnings,
  contextMeanings,
  conversationExamples,
  renderNoteFor,
  toneTarget,
  type RenderKind,
  type ToneContext,
} from './tone-archetypes';
import type { ToneModifier } from './types';
import { TONE_ORDER } from './types';

const EMOJI_DIR = path.join(process.cwd(), 'src', 'data', 'emojis');
const CONTENT_DATE = '2026-10-26';

/** The emoji data files are formatted with Prettier, so the generator writes them the same way. */
const JSON_FORMAT_OPTIONS: Options = { parser: 'json' };

function loadJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, 'utf-8')) as T;
}

/** Every published emoji page. `*-emoji.json` files are not published. */
function loadLiveEmojis(): Emoji[] {
  return fs
    .readdirSync(EMOJI_DIR)
    .filter((name) => name.endsWith('.json') && !name.endsWith('-emoji.json'))
    .map((name) => loadJson<Emoji>(path.join(EMOJI_DIR, name)));
}

/** True when the base glyph is a zero-width-joiner sequence. */
function renderKindOf(glyph: string): RenderKind {
  return glyph.includes('‍') ? 'zwj' : 'plain';
}

/**
 * The Fitzpatrick modifiers, U+1F3FB to U+1F3FF, in swatch order.
 */
const TONE_CHARACTERS: readonly string[] = ['🏻', '🏼', '🏽', '🏾', '🏿'];

/**
 * Strip the tone modifier off a glyph to get the tone-less version.
 *
 * The tone always follows the code point it modifies, so removing it leaves
 * the base sequence intact even for the zero-width-joiner job emoji.
 */
function stripTone(glyph: string): string {
  for (const tone of TONE_CHARACTERS) {
    if (glyph.includes(tone)) return glyph.replace(tone, '');
  }
  return glyph;
}

/** `medium-light skin tone` -> `Medium-Light Skin Tone`. */
function titleCase(text: string): string {
  return text
    .split(' ')
    .map((word) =>
      word.length > 0
        ? word
            .split('-')
            .map((part) => (part.length > 0 ? part[0].toUpperCase() + part.slice(1) : part))
            .join('-')
        : word
    )
    .join(' ');
}

/**
 * The tone-less title of a family.
 *
 * The family profile owns it, so the base page and its five tone variants all
 * call the same drawing by the same name.
 */
const TONE_SUFFIX = /:\s*(?:Light|Medium-Light|Medium|Medium-Dark|Dark) Skin Tone$/i;

/**
 * The tone sentence this generator appends, matched so that re-running the
 * generator does not stack a second one on top of the first.
 */
const TONE_SENTENCE =
  /\s*The (?:light|medium-light|medium|medium-dark|dark) skin tone modifier is applied to the \w+\./gi;

/** Tone-aware replacement for the flat `baseMeaning` on variant pages. */
function baseMeaningFor(baseMeaning: string, toneLabel: string, target: string): string {
  const trimmed = baseMeaning.replace(TONE_SENTENCE, '').trim().replace(/\.$/, '');
  return `${trimmed}. The ${toneLabel} modifier is applied to the ${target}.`;
}

/** The one-line summary shown on cards and at the top of the page. */
function tldrFor(ctx: ToneContext): string {
  return `${ctx.glyph} ${ctx.baseTitle} with a ${ctx.toneLabel}. ${TONE_META[ctx.tone].punch}`;
}

/** SEO description — family-specific, so it does not read as a near-duplicate. */
function seoDescriptionFor(ctx: ToneContext): string {
  return (
    `What does the ${ctx.baseTitle.toLowerCase()} emoji ${ctx.glyph} mean? ${ctx.baseTitle} showing ` +
    `${ctx.depicts}. Covers the ${ctx.toneLabel} variant, the misread it invites, and how to reply.`
  );
}

function buildContext(
  base: Emoji,
  variant: Emoji,
  tone: ToneModifier,
  profile: (typeof FAMILY_PROFILES)[string]
): ToneContext {
  const meta = TONE_META[tone];
  const baseGlyph = stripTone(variant.character);
  const renderKind = renderKindOf(baseGlyph);
  const baseTitle = profile.title;
  return {
    glyph: variant.character,
    baseGlyph,
    title: `${baseTitle}: ${titleCase(meta.label)}`,
    baseTitle,
    toneLabel: meta.label,
    toneChar: meta.char,
    tone,
    depicts: profile.depicts,
    reads: profile.reads,
    misread: profile.misread,
    use1: profile.uses[0],
    use2: profile.uses[1],
    contrastGlyph: profile.contrast.glyph,
    contrastTitle: profile.contrast.title,
    contrastNote: profile.contrast.note,
    toneLands: profile.toneLands,
    renderKind,
    renderNote: renderNoteFor(baseGlyph, renderKind, meta.label),
    picker: meta.picker,
    signal: meta.signal,
    caveat: meta.caveat,
    register: meta.register,
    dating: meta.dating,
    work: meta.work,
    toneTarget: profile.toneTarget ?? toneTarget(profile.toneLands),
  };
}

function regenerate(base: Emoji, variant: Emoji, tone: ToneModifier): Emoji {
  const profile = FAMILY_PROFILES[base.slug];
  if (!profile) {
    throw new Error(`No family profile for "${base.slug}"`);
  }

  const ctx = buildContext(base, variant, tone, profile);
  const baseContextTypes = base.contextMeanings.map((m) => m.context as ContextType);
  const contextTypes: ContextType[] =
    baseContextTypes.length > 0 ? baseContextTypes : (['LITERAL', 'SLANG'] as ContextType[]);

  return {
    ...variant,
    name: ctx.title,
    baseMeaning: baseMeaningFor(variant.baseMeaning, ctx.toneLabel, ctx.toneTarget),
    tldr: tldrFor(ctx),
    contextMeanings: contextMeanings(ctx, contextTypes),
    platformNotes: platformNotes(ctx),
    generationalNotes: generationalNotes(ctx),
    warnings: warnings(ctx),
    seoTitle: `${ctx.glyph} ${ctx.baseTitle} ${titleCase(ctx.toneLabel)} Emoji Meaning - What Does ${ctx.glyph} Mean?`,
    seoDescription: seoDescriptionFor(ctx),
    longForm: {
      overview: overview(ctx),
      howPeopleUseIt: howPeopleUseIt(ctx),
      whenNotToUse: whenNotToUse(ctx),
      howToReply: howToReply(ctx),
      faqs: faqs(ctx),
    },
    conversationExamples: conversationExamples(ctx),
    contentTier: 'deep',
    contentUpdatedAt: CONTENT_DATE,
  };
}

/**
 * Rewrite the landing page of a skin-tone family.
 *
 * The base page is the one search engines index: the five tone variants are
 * `noindex, follow` and canonicalise to it. It used to carry the same
 * generated "-coded" boilerplate as the rest of the catalog, so it is rebuilt
 * here from the family profile too.
 */
function regenerateBase(
  base: Emoji,
  familyVariants: Emoji[],
  profile: (typeof FAMILY_PROFILES)[string]
): Emoji {
  const ctx: BaseContext = {
    profile,
    title: profile.title,
    glyph: profile.glyph,
    slug: base.slug,
    category: base.category,
    subcategory: base.subcategory ?? base.category,
    unicodeVersion: base.unicodeVersion,
    toneSlugs: familyVariants.map((variant) => variant.slug),
    archetype: archetypeFor(base.slug),
  };

  return {
    ...base,
    name: profile.title,
    baseMeaning: baseMeaning(ctx),
    tldr: baseTldr(ctx),
    contextMeanings: baseContextMeanings(ctx),
    platformNotes: basePlatformNotes(ctx),
    generationalNotes: baseGenerationalNotes(ctx),
    warnings: baseWarnings(ctx),
    seoTitle: baseSeoTitle(ctx),
    seoDescription: baseSeoDescription(ctx),
    skinToneVariations: ctx.toneSlugs,
    longForm: {
      overview: baseOverview(ctx),
      howPeopleUseIt: baseHowPeopleUseIt(ctx),
      whenNotToUse: baseWhenNotToUse(ctx),
      howToReply: baseHowToReply(ctx),
      faqs: baseFaqs(ctx),
    },
    conversationExamples: baseConversationExamples(ctx),
    contentTier: 'deep',
    contentUpdatedAt: CONTENT_DATE,
  };
}

async function main(): Promise<void> {
  const emojis = loadLiveEmojis();
  const bySlug = new Map(emojis.map((e) => [e.slug, e]));

  const variants = emojis.filter((e) => e.skinToneBase && e.skinToneModifier);
  const missing = variants.filter((v) => !FAMILY_PROFILES[v.skinToneBase as string]);
  if (missing.length > 0) {
    throw new Error(
      `Missing family profiles for: ${missing.map((m) => m.skinToneBase).join(', ')}`
    );
  }

  // Group the variants by the family they belong to, in swatch order.
  const families = new Map<string, Emoji[]>();
  for (const variant of variants) {
    const family = variant.skinToneBase as string;
    const group = families.get(family) ?? [];
    group.push(variant);
    families.set(family, group);
  }
  for (const group of families.values()) {
    group.sort(
      (a, b) =>
        TONE_ORDER.indexOf(a.skinToneModifier as ToneModifier) -
        TONE_ORDER.indexOf(b.skinToneModifier as ToneModifier)
    );
  }

  let written = 0;
  for (const variant of variants) {
    const base = bySlug.get(variant.skinToneBase as string);
    if (!base) {
      throw new Error(`Base emoji "${variant.skinToneBase}" not found for "${variant.slug}"`);
    }
    const profile = FAMILY_PROFILES[base.slug];
    if (stripTone(variant.character) !== profile.glyph) {
      throw new Error(
        `Variant "${variant.slug}" shows "${stripTone(variant.character)}" but the ` +
          `"${base.slug}" profile describes "${profile.glyph}".`
      );
    }
    const regenerated = regenerate(base, variant, variant.skinToneModifier as ToneModifier);
    const file = path.join(EMOJI_DIR, `${variant.slug}.json`);
    fs.writeFileSync(file, await format(JSON.stringify(regenerated, null, 2), JSON_FORMAT_OPTIONS));
    written += 1;
  }

  let baseWritten = 0;
  for (const [family, familyVariants] of families) {
    const base = bySlug.get(family);
    if (!base) {
      throw new Error(`Base emoji "${family}" not found`);
    }
    const profile = FAMILY_PROFILES[family];
    if (base.character !== profile.glyph) {
      throw new Error(
        `Base page "${family}" shows "${base.character}" but its profile describes ` +
          `"${profile.glyph}".`
      );
    }
    const regenerated = regenerateBase(base, familyVariants, profile);
    const file = path.join(EMOJI_DIR, `${family}.json`);
    fs.writeFileSync(file, await format(JSON.stringify(regenerated, null, 2), JSON_FORMAT_OPTIONS));
    baseWritten += 1;
  }

  console.log(
    `Rewrote ${written} skin-tone variant pages and ${baseWritten} family base pages across ` +
      `${families.size} families.`
  );
}

if (import.meta.main) {
  await main();
}
