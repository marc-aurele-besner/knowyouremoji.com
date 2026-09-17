#!/usr/bin/env bun
/**
 * Pick exactly 250 candidates for batch 18, organized by 10 commits of 25
 * each. Each commit is 5 base emoji × 5 skin tones.
 *
 * Strategy: we still have plenty of full 5-tone People & Body sets left from
 * earlier batches that were not picked because batches 16 and 17 covered the
 * highest-traffic family first. This batch focuses on the long tail of
 * People & Body (kids, adults, gestures, pointing hands, fists, open hands,
 * motion/hold) so that the long-form tier covers every People & Body base.
 */
import fs from 'fs';
import path from 'path';

const emojisDir = path.join(process.cwd(), 'src', 'data', 'emojis');
const files = fs.readdirSync(emojisDir).filter((f) => f.endsWith('.json'));

interface EmojiInfo {
  slug: string;
  name: string;
  character: string;
  category: string;
  subcategory: string;
  contentTier: string;
  filename: string;
  shortName: string;
}

const all: EmojiInfo[] = [];
for (const file of files) {
  const content = JSON.parse(fs.readFileSync(path.join(emojisDir, file), 'utf-8'));
  all.push({
    slug: content.slug,
    name: content.name,
    character: content.character,
    category: content.category || 'unknown',
    subcategory: content.subcategory || 'unknown',
    contentTier: content.contentTier || 'unset',
    filename: file,
    shortName: content.shortName || '',
  });
}

// IMPORTANT: order tones by length desc so the suffix-stripper picks the longest.
const TONES_SORTED = ['medium-light', 'medium-dark', 'light', 'medium', 'dark'];

/**
 * Strip any of the two skin-tone suffixes (`-{tone}` or `-{tone}-skin-tone-emoji`)
 * and return the base slug. Returns null if no tone suffix matches.
 */
function stripTone(slug: string): { base: string; tone: string } | null {
  for (const tone of TONES_SORTED) {
    const longSuffix = `-${tone}-skin-tone-emoji`;
    if (slug.endsWith(longSuffix)) {
      return { base: slug.slice(0, -longSuffix.length), tone };
    }
    const shortSuffix = `-${tone}`;
    if (slug.endsWith(shortSuffix)) {
      return { base: slug.slice(0, -shortSuffix.length), tone };
    }
  }
  return null;
}

interface ToneSet {
  base: string;
  items: Record<string, EmojiInfo>; // tone -> emoji (we want exactly one of each)
  category: string;
  subcategory: string;
}

const allSets: Record<string, ToneSet> = {};

for (const file of all) {
  if (file.contentTier === 'deep') continue;
  const stripped = stripTone(file.slug);
  if (!stripped) continue;
  const { base, tone } = stripped;
  if (!allSets[base]) {
    allSets[base] = {
      base,
      items: {},
      category: file.category,
      subcategory: file.subcategory,
    };
  }
  // Prefer the entry with a longer character glyph (the actual skin-tone emoji
  // render rather than a plain base character), breaking ties by short slug.
  const existing = allSets[base].items[tone];
  const isBetter =
    !existing ||
    file.character.length > existing.character.length ||
    (file.character.length === existing.character.length &&
      file.slug.length < existing.slug.length);
  if (isBetter) {
    allSets[base].items[tone] = file;
  }
}

const fullSets = Object.values(allSets).filter((s) => TONES_SORTED.every((t) => s.items[t]));

// Group sets by their narrative family — pick 5 sets per commit.
const plan: Record<string, EmojiInfo[]> = {};

const commits: { label: string; bases: string[] }[] = [
  {
    label: 'person identity with skin tones: Baby, Child, Boy, Girl, Older Person',
    bases: ['baby', 'child', 'boy', 'girl', 'older-person'],
  },
  {
    label: 'person identity with skin tones: Man, Woman, Person, Old Man, Old Woman',
    bases: ['man', 'woman', 'person', 'old-man', 'old-woman'],
  },
  {
    label:
      'person identity & gesture with skin tones: Person: Beard, Person: Blond Hair, Deaf Person, Person Bowing, Person Facepalming',
    bases: [
      'person-beard',
      'person-blond-hair',
      'deaf-person',
      'person-bowing',
      'person-facepalming',
    ],
  },
  {
    label:
      'person gesture with skin tones: Person Frowning, Person Gesturing OK, Person Raising Hand, Person Shrugging, Person Tipping Hand',
    bases: [
      'person-frowning',
      'person-gesturing-ok',
      'person-raising-hand',
      'person-shrugging',
      'person-tipping-hand',
    ],
  },
  {
    label:
      'body parts & fingers with skin tones: Flexed Biceps, Foot, Middle Finger, Pinching Hand, Pinched Fingers',
    bases: ['flexed-biceps', 'foot', 'middle-finger', 'pinching-hand', 'pinched-fingers'],
  },
  {
    label:
      'hand gesture (pointing) with skin tones: Pointing Down, Pointing Left, Pointing Right, Index Pointing Up Backhand, Index Pointing at the Viewer',
    bases: [
      'pointing-down',
      'pointing-left',
      'pointing-right',
      'pointing-up-backhand',
      'index-pointing-at-viewer',
    ],
  },
  {
    label:
      'hand gesture (pointing & raised) with skin tones: Index Pointing Up, Index Finger and Thumb Crossed, Raised Back of Hand, Raised Hand, Raised Fist',
    bases: [
      'index-pointing-up',
      'index-thumb-crossed',
      'raised-back-of-hand',
      'raised-hand',
      'raised-fist',
    ],
  },
  {
    label:
      'hand gesture (fists & thumbs) with skin tones: Left-Facing Fist, Right-Facing Fist, Oncoming Fist, Thumbs Down, Victory Hand',
    bases: [
      'left-facing-fist',
      'right-facing-fist',
      'oncoming-fist',
      'thumbs-down',
      'victory-hand',
    ],
  },
  {
    label:
      'hand gesture (open & palms) with skin tones: Open Hands, Palm Down Hand, Palm Up Hand, Rightwards Hand, Leftwards Hand',
    bases: ['open-hands', 'palm-down-hand', 'palm-up-hand', 'rightwards-hand', 'leftwards-hand'],
  },
  {
    label:
      'hand gesture (motion & hold) with skin tones: Hand with Fingers Splayed, Handshake, Heart Hands, Rightwards Pushing Hand, Raising Hands',
    bases: [
      'hand-fingers-splayed',
      'handshake',
      'heart-hands',
      'rightwards-pushing-hand',
      'raising-hands',
    ],
  },
];

const used = new Set<string>();

for (const commit of commits) {
  plan[commit.label] = [];
  for (const base of commit.bases) {
    const set = fullSets.find((s) => s.base === base);
    if (!set) {
      console.error(`  ✗ Missing set for "${base}"`);
      continue;
    }
    for (const tone of TONES_SORTED) {
      const item = set.items[tone];
      if (used.has(item.filename)) {
        console.error(`  ✗ Duplicate use: ${item.filename}`);
        continue;
      }
      used.add(item.filename);
      plan[commit.label].push(item);
    }
  }
}

console.log('\n=== BATCH 18 PLAN ===\n');
let total = 0;
for (const [label, list] of Object.entries(plan)) {
  total += list.length;
  console.log(`\n${label}: ${list.length} emojis`);
  for (const e of list) {
    console.log(`  ${e.character} ${e.name} [${e.filename}]`);
  }
}
console.log(`\n\nTOTAL: ${total}`);

const out = path.join(process.cwd(), 'scripts', 'batch-18-plan.json');
fs.writeFileSync(out, JSON.stringify(plan, null, 2));
console.log(`\nPlan saved to ${out}`);

if (total !== 250) {
  console.error(`\nERROR: expected 250 emoji, got ${total}`);
  process.exit(1);
}
