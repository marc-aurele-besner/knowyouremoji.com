#!/usr/bin/env bun
/**
 * Per-batch deep-tier combo content writer for batches 33-42.
 *
 * Usage:
 *   bun run scripts/generate-deep-content-combos-33-42.ts <family-name>
 *   bun run scripts/generate-deep-content-combos-33-42.ts            # list families
 *
 * Reads scripts/batch-33-42-plan.json, writes 25 new combo JSON files into
 * src/data/combos/, and prints a stage-ready list of slugs for git add.
 */

import fs from 'fs';
import path from 'path';
import { buildCtx, getArchetype, pad } from './combo-content/archetypes';
import { FAMILY_FLAVOR } from './combo-content/family-flavor';
import { FAQ_POOL, TAG_POOL, SETTING_TRIPLES } from './combo-content/pools';
import { countWords, fillTemplate, hashSeed, mulberry32, pickN } from './combo-content/util';
import type { ComboPlanEntry, Family } from './plan-batch-33-42';
import { validateCombo, validateComboDeepTier, loadComboSlugs } from './validate-emojis';
import type { EmojiCombo, ComboFaq, ComboConversationExample } from '../src/types/combo';

const planPath = path.join(process.cwd(), 'scripts', 'batch-33-42-plan.json');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8')) as Record<string, ComboPlanEntry[]>;
const combosDir = path.join(process.cwd(), 'src', 'data', 'combos');

function familyList(): string[] {
  return Object.keys(plan);
}

function buildOne(
  entry: ComboPlanEntry,
  indexInBatch: number,
  existingSlugs: Set<string>
): EmojiCombo {
  const arch = getArchetype(entry.category, entry.variant);
  const ctx = buildCtx(entry.name, entry.combo, entry.variant, arch.tones);
  const rand = mulberry32(hashSeed(entry.slug + ':' + entry.variant));

  const familyFlavorText = FAMILY_FLAVOR[entry.family as Family]?.habitat ?? '';

  const archOverview = pad(arch.overview(ctx), 145);
  const overview =
    `${archOverview}\n\n${familyFlavorText}\n\nThe two-emoji register is consistent across audiences — iMessage, Instagram, TikTok, and Discord all carry the same read, which is why ${entry.combo} travels without losing the cue.\n\nWithin the ${entry.family.replace(/-/g, ' / ')} family specifically, the combo borrows the register most senders in the family expect, so it lands as expected rather than as a surprise. The cue sticks whether ${entry.combo} sits as a stand-alone reaction, at the end of a sentence, or stacked under a photo drop.`.replace(
      /\n{3,}/g,
      '\n\n'
    );

  const howPeopleUseIt = pad(arch.howPeopleUseIt(ctx), 70);
  const whenNotToUse = pad(arch.whenNotToUse(ctx), 70);
  const howToReply = pad(arch.howToReply(ctx), 70);

  const faqPool = FAQ_POOL[entry.category];
  const allFaqs: ComboFaq[] = faqPool.map((f) => ({
    question: fillTemplate(f.question, ctx).replace(
      /\{alt\}/g,
      `${entry.combo} in a softer register`
    ),
    answer: fillTemplate(f.answer, ctx)
      .replace(/\{c\}/g, entry.combo)
      .replace(/\{alt\}/g, `${entry.combo} in a softer register`),
  }));
  const faqs = pickN(allFaqs, 4, rand).map((f) => ({
    question: f.question,
    answer: f.answer,
  }));

  const triple = SETTING_TRIPLES[indexInBatch % SETTING_TRIPLES.length];
  const lines = arch.conversationLines(ctx, rand);
  const conversationExamples: ComboConversationExample[] = triple.map((setting, i) => {
    let line = lines.find((l) => l.setting === setting);
    if (!line) line = lines[i % lines.length];
    return {
      setting,
      message: line.message,
      interpretation: line.interpretation,
    };
  });

  const examplesAll = arch.examples(ctx, rand);
  const examples = examplesAll.slice(0, Math.max(3, examplesAll.length));

  const familyTags = TAG_POOL[entry.family] ?? [];
  const pickedFromPool = pickN(familyTags, 2 + Math.floor(rand() * 3), rand);
  const tags = Array.from(new Set([...entry.tags, ...pickedFromPool])).slice(0, 6);

  const seoTitle = arch.seoTitle(ctx).replace(/\s+/g, ' ').trim();
  const seoDescription = arch.seoDescription(ctx).replace(/\s+/g, ' ').trim();

  const description = pad(arch.description(ctx), 22);
  const meaning = pad(arch.meaning(ctx), 35);

  return {
    slug: entry.slug,
    combo: entry.combo,
    emojis: entry.emojis,
    name: entry.name,
    description,
    meaning,
    examples: examples.slice(0, Math.max(3, examples.length)),
    category: entry.category,
    seoTitle,
    seoDescription,
    tags,
    popularity: entry.popularity,
    contentTier: 'deep',
    contentUpdatedAt: '2026-09-17',
    relatedCombos: [],
    longForm: {
      overview: pad(overview, 130),
      howPeopleUseIt,
      whenNotToUse,
      howToReply,
      faqs,
    },
    conversationExamples,
  };
}

function writeBatch(family: string): string[] {
  const list = plan[family];
  if (!list) {
    throw new Error(`Unknown family: ${family}. Available: ${familyList().join(', ')}`);
  }
  if (list.length !== 25) {
    throw new Error(`Family '${family}' has ${list.length} entries, expected 25`);
  }

  const existingSlugs = loadComboSlugs(combosDir);
  const knownSlugs = new Set<string>(existingSlugs);
  for (const e of list) knownSlugs.add(e.slug);

  const written: string[] = [];
  const errors: string[] = [];

  list.forEach((entry, idx) => {
    let combo: EmojiCombo;
    try {
      combo = buildOne(entry, idx, knownSlugs);
    } catch (err) {
      errors.push(`[${entry.slug}] build failed: ${(err as Error).message}`);
      return;
    }
    const validationErrors = validateCombo(combo, knownSlugs);
    if (validationErrors.length > 0) {
      errors.push(
        `[${entry.slug}] validateCombo errors:\n  ${validationErrors.map((v) => `[${v.field}] ${v.message}`).join('\n  ')}`
      );
      return;
    }
    const deepErrors = validateComboDeepTier(combo);
    if (deepErrors.length > 0) {
      errors.push(
        `[${entry.slug}] validateComboDeepTier errors:\n  ${deepErrors.map((v) => `[${v.field}] ${v.message}`).join('\n  ')}`
      );
      return;
    }

    const filePath = path.join(combosDir, `${entry.slug}.json`);
    fs.writeFileSync(filePath, JSON.stringify(combo, null, 2) + '\n');
    written.push(entry.slug);
  });

  if (errors.length > 0) {
    console.error('Errors during batch write:');
    for (const err of errors) console.error(`  ${err}`);
    throw new Error(`Batch '${family}' had ${errors.length} error(s).`);
  }

  console.log(`# Wrote ${written.length} combos for family '${family}'`);
  for (const slug of written) {
    console.log(`src/data/combos/${slug}.json`);
  }
  return written;
}

function main() {
  const family = process.argv[2];
  if (!family) {
    console.log('Available families:');
    for (const f of familyList()) console.log(`  ${f} (${plan[f].length})`);
    console.log('\nUsage: bun run scripts/generate-deep-content-combos-33-42.ts <family-name>');
    return;
  }
  writeBatch(family);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
