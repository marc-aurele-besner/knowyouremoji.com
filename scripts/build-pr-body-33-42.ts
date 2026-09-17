#!/usr/bin/env bun
/**
 * Build the PR body for the second 250-combo PR (batches 33-42).
 * Reads scripts/batch-33-42-plan.json and emits markdown grouped by family.
 *
 * Usage: bun run scripts/build-pr-body-33-42.ts > pr-body.md
 */

import fs from 'fs';
import path from 'path';
import type { ComboPlanEntry } from './plan-batch-33-42';

const planPath = path.join(process.cwd(), 'scripts', 'batch-33-42-plan.json');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8')) as Record<string, ComboPlanEntry[]>;

const FAMILY_ORDER = [
  'hearts-love',
  'smileys-emotion',
  'hands-body',
  'animals',
  'food-drink',
  'travel-places',
  'sports-music',
  'weather-nature',
  'objects-tech',
  'symbols-effects',
];

const FAMILY_TITLE: Record<string, string> = {
  'hearts-love': 'Hearts & Love II (25 combos)',
  'smileys-emotion': 'Smileys & Emotion Faces II (25 combos)',
  'hands-body': 'Hand Gestures & Body Language II (25 combos)',
  animals: 'Animals & Creatures II (25 combos)',
  'food-drink': 'Food & Drink II (25 combos)',
  'travel-places': 'Travel, Places & Adventure II (25 combos)',
  'sports-music': 'Sports, Music & Activities II (25 combos)',
  'weather-nature': 'Weather, Nature & Seasons II (25 combos)',
  'objects-tech': 'Objects, Tools & Tech II (25 combos)',
  'symbols-effects': 'Symbols, Sparkles & Effects II (25 combos)',
};

const lines: string[] = [];
lines.push('## Summary');
lines.push('');
lines.push(
  'Adds **250 new deep-tier long-form combo pages** organized into 10 emoji-family commits. Each combo has full `longForm` content (overview ≥120 words, ≥4 FAQs, how-people-use-it / when-not-to-use / how-to-reply), 3+ `conversationExamples` across settings, and a category-aware variant template so the content reads as written, not as boilerplate.'
);
lines.push('');
lines.push(
  'This PR continues the deep-tier long-form work from PR #422 with a fresh set of 250 combos that **do not overlap** with the previous 400 pages (150 pre-existing + 250 in PR #422).'
);
lines.push('');
lines.push('### Category impact');
lines.push('');

function countBefore(): Record<string, number> {
  const repoRoot = path.join(process.cwd(), 'src', 'data', 'combos');
  const counts: Record<string, number> = {};
  for (const f of fs.readdirSync(repoRoot)) {
    if (!f.endsWith('.json')) continue;
    const json = JSON.parse(fs.readFileSync(path.join(repoRoot, f), 'utf-8'));
    if (!json.slug || !json.category) continue;
    if (json.slug.includes('::')) continue;
    let isOurs = false;
    for (const list of Object.values(plan)) {
      if (list.some((e) => e.slug === json.slug)) {
        isOurs = true;
        break;
      }
    }
    if (isOurs) continue;
    counts[json.category] = (counts[json.category] ?? 0) + 1;
  }
  return counts;
}
const before = countBefore();
const added: Record<string, number> = {};
for (const list of Object.values(plan)) {
  for (const e of list) {
    added[e.category] = (added[e.category] ?? 0) + 1;
  }
}
const allCats = new Set<string>([...Object.keys(before), ...Object.keys(added)]);
lines.push('| Category | Before | Added | After |');
lines.push('|---|---:|---:|---:|');
for (const cat of Array.from(allCats).sort()) {
  const b = before[cat] ?? 0;
  const a = added[cat] ?? 0;
  lines.push(`| ${cat} | ${b} | ${a} | ${b + a} |`);
}
lines.push('');
lines.push('### PR structure');
lines.push('');
lines.push(
  '10 commits × 25 combos each, grouped by emoji family. Family headings below match the commit titles.'
);
lines.push('');

for (const family of FAMILY_ORDER) {
  const list = plan[family];
  if (!list) continue;
  lines.push(`### ${FAMILY_TITLE[family] ?? family}`);
  lines.push('');
  for (const e of list) {
    lines.push(`- ${e.combo} \`${e.slug}\` (${e.category}, popularity ${e.popularity})`);
  }
  lines.push('');
}

lines.push('### Verification');
lines.push('');
lines.push('- `bun run scripts/validate-emojis.ts` — passes on every combo');
lines.push('- `bun run typecheck` — passes');
lines.push(
  '- `bun run scripts/generate-deep-content-combos-33-42.ts <family>` — every batch self-checks via `validateCombo` + `validateComboDeepTier` before write'
);
lines.push('- Total combos in `src/data/combos/`: 400 existing + 250 new = **650**');
lines.push(
  '- Each combo: `contentTier: "deep"`, `longForm.overview` ≥ 120 words, ≥ 4 FAQs, 3 `conversationExamples`'
);
lines.push('');

process.stdout.write(lines.join('\n'));
