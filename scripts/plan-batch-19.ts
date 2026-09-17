#!/usr/bin/env bun
/**
 * Pick exactly 250 candidates for batch 19, organized by 10 commits of 25
 * each. After batches 16-18 finished every People & Body base with skin
 * tones, this batch focuses on the popular non-people long-tail that is
 * still missing deep-tier content: country flags, symbols, money/office
 * objects, household/tool objects, travel & places, activities & sport,
 * family/people-without-skin-tone, and the final hand & body long-tail.
 *
 * Strategy: dedupe by character glyph (so each emoji is picked once even
 * when both `flag-foo.json` and `flag-foo-emoji.json` exist) and split the
 * available pool across the 10 commits.
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
    subcategory: content.subcategory || 'unset',
    contentTier: content.contentTier || 'unset',
    filename: file,
    shortName: content.shortName || '',
  });
}

// Prefer the non "-emoji" filename when two files describe the same glyph.
function dedupeGlyph(arr: EmojiInfo[]): EmojiInfo[] {
  const byChar: Record<string, EmojiInfo> = {};
  for (const e of arr) {
    const existing = byChar[e.character];
    if (!existing) {
      byChar[e.character] = e;
    } else {
      const existingIsEmoji = existing.filename.endsWith('-emoji.json');
      const candidateIsEmoji = e.filename.endsWith('-emoji.json');
      if (candidateIsEmoji && !existingIsEmoji) {
        byChar[e.character] = e;
      }
    }
  }
  return Object.values(byChar);
}

const nonDeep = all.filter((e) => e.contentTier !== 'deep');

function pickUnique(
  filter: (e: EmojiInfo) => boolean,
  count: number,
  seen: Set<string>
): EmojiInfo[] {
  const candidates = dedupeGlyph(nonDeep.filter(filter));
  const out: EmojiInfo[] = [];
  for (const e of candidates) {
    if (out.length >= count) break;
    if (seen.has(e.filename)) continue;
    out.push(e);
    seen.add(e.filename);
  }
  return out;
}

const plan: Record<string, EmojiInfo[]> = {};
const seen = new Set<string>();

// ============================================================================
// Commit 1 — Country flags (popular Americas, Caribbean & Western Europe) — 25
// ============================================================================
plan['country flags (Americas & Western Europe)'] = pickUnique(
  (e) =>
    (e.category === 'flags' || e.category === 'Flags') &&
    (e.subcategory === 'country-flag' || e.subcategory === 'Country Flag') &&
    /argentin|bolivi|brazil|chile|colomb|costa|cuba|dominican|ecuador|el salvador|guatemala|guyana|honduras|jamaica|mexico|nicaragua|panama|paragua|peru|puerto|surinam|trinidad|urugua|venezuela|antigua|barbuda|haiti|aruba|curacao|sint maarten|virgin|grenad|saint|andorra|austria|belgium|denmark|finland|france|germany|iceland|ireland|italy|liechtenstein|luxembourg|monaco|netherlands|norway|portugal|spain|sweden|switzerland|united kingdom|uk\b|usa|united states/i.test(
      e.name
    ),
  25,
  seen
);

// ============================================================================
// Commit 2 — Country flags (Eastern Europe & Asia) — 25
// ============================================================================
plan['country flags (Eastern Europe & Asia)'] = pickUnique(
  (e) =>
    (e.category === 'flags' || e.category === 'Flags') &&
    (e.subcategory === 'country-flag' || e.subcategory === 'Country Flag') &&
    /albania|armeni|azerbaijan|belarus|bosnia|bulgaria|croatia|cyprus|czech|estonia|georgia|greece|hungary|kazakh|kosovo|latvia|lithuania|macedon|moldova|montenegro|poland|romania|russia|serbia|slovak|slovenia|turkey|ukraine|uzbek|kyrgyz|tajik|turkmen|china|japan|korea|mongolia|taiwan|vietnam|thailand|philippines|indonesia|malaysia|singapore|brunei|cambodia|laos|myanmar|nepal|bhutan|maldives|sri lanka|india|pakistan|afghan|iran|iraq|lebanon|sudan|syria|jordan|israel|palestin|saudi|yemen|oman|qatar|kuwait|bahrain|united arab/i.test(
      e.name
    ),
  25,
  seen
);

// ============================================================================
// Commit 3 — Country flags (Africa long-tail & Oceania) — 25
// ============================================================================
plan['country flags (Africa long-tail & Oceania)'] = pickUnique(
  (e) =>
    (e.category === 'flags' || e.category === 'Flags') &&
    (e.subcategory === 'country-flag' || e.subcategory === 'Country Flag') &&
    /algeria|angola|benin|botswana|burkina|burundi|cameroon|cape verde|chad|comoros|congo|cote d|djibouti|egypt|equatorial|eritrea|eswatini|ethiopia|gabon|gambia|ghana|guinea|guinea-bissau|kenya|lesotho|liberia|libya|madagascar|malawi|mali|mauritania|morocco|mozambique|namibia|niger|nigeria|rwanda|sahara|somalia|south africa|south sudan|tanzania|togo|tunisia|uganda|zambia|zimbabwe|fiji|kirit|samoa|tonga|papua|solomon|vanuatu|marshall|palau|nauru|tuvalu|mikronesia|cook|timor/i.test(
      e.name
    ),
  25,
  seen
);

// ============================================================================
// Commit 4 — Symbols (alphanumeric, arrows, status, keycaps, Japanese kana, recycling) — 25
// ============================================================================
plan['symbols (status, arrows, alphanumeric & Japanese)'] = pickUnique(
  (e) =>
    (e.category === 'symbols' || e.category === 'Symbols') && !/cross|heart/i.test(e.subcategory),
  23, // only 23 unique symbols exist in non-deep
  seen
);
// Top up to 25 with high-traffic flag emojis not yet picked (only used as
// a small buffer because there are exactly 23 unique symbols available).
const symTopup = pickUnique(
  (e) =>
    (e.category === 'flags' || e.category === 'Flags') &&
    (e.subcategory === 'country-flag' || e.subcategory === 'Country Flag') &&
    /dominican republic|cuba|czechia|tanzania|nicaragua|turkmenistan|vanuatu|kiribati|tonga|saint lucia/i.test(
      e.name
    ),
  2,
  seen
);
plan['symbols (status, arrows, alphanumeric & Japanese)'].push(...symTopup);

// ============================================================================
// Commit 5 — Objects (money, mail, office, science, household, tool, medical) — 25
// ============================================================================
plan['objects (money, mail, office, science & household)'] = pickUnique(
  (e) =>
    (e.category === 'objects' || e.category === 'Objects') &&
    /money|mail|office|household|tool|science|medical|book|light|lock|computer|phone|key/i.test(
      e.subcategory
    ),
  25,
  seen
);

// ============================================================================
// Commit 6 — Travel & Places (transport, buildings, time, religious, map) — 25
// ============================================================================
plan['travel & places (transport, buildings & time)'] = pickUnique(
  (e) =>
    e.category === 'travel' || e.category === 'Travel & Places' || e.category === 'travel-places',
  25,
  seen
);

// ============================================================================
// Commit 7 — Activities, nature, sky & misc people (sport, game, event, weather, plant) — 25
// ============================================================================
plan['activities & nature (sport, game, craft, weather, plant)'] = pickUnique(
  (e) =>
    e.category === 'activities' ||
    e.category === 'Activities' ||
    e.category === 'nature' ||
    e.category === 'sky-weather' ||
    e.category === 'weather' ||
    (e.category === 'people' &&
      /person swimming|swimmer|sauna|selfie|vulcan|couple|holding|family|mouth|headscarf|zombie/i.test(
        e.name
      )),
  25,
  seen
);
// Top up to 25 if the activities/nature pool is too thin.
const activitiesTopup = pickUnique(
  (e) => e.category === 'objects' && /clothing/i.test(e.subcategory),
  1,
  seen
);
plan['activities & nature (sport, game, craft, weather, plant)'].push(...activitiesTopup);

// ============================================================================
// Commit 8 — People with skin tones (family, nail-polish, gesture, person-sport) — 25
// ============================================================================
plan['people (skin tone family, nail-polish, gesture, swimming, biking)'] = pickUnique(
  (e) =>
    (e.category === 'people' || e.category === 'People & Body' || e.category === 'people-body') &&
    /pouting|gesturing-no|family|woman-and-man|woman-woman|man-man|nail-polish|swim|bik|push|fist|nose|selfie|vulcan|mouth|headscarf|zombie|technolog|teacher|singer|sauna|couple|holding hands/i.test(
      e.name
    ),
  25,
  seen
);

// ============================================================================
// Commit 9 — People remaining (veiled, fist, swimmers, body parts long-tail) — 25
// ============================================================================
plan['people (skin tone veil, fist, swimmers, body parts long-tail)'] = pickUnique(
  (e) => e.category === 'people' || e.category === 'People & Body' || e.category === 'people-body',
  25,
  seen
);
// Top up to 25 if there are fewer people long-tail than 25 (rare).
const peopleTopup = pickUnique(
  (e) =>
    (e.category === 'objects' || e.category === 'Objects') &&
    /clothing|tool|lock/i.test(e.subcategory) &&
    !/money|mail|office|household|science|medical|book|light|computer|phone|key/i.test(
      e.subcategory
    ),
  5,
  seen
);
plan['people (skin tone veil, fist, swimmers, body parts long-tail)'].push(...peopleTopup);

// ============================================================================
// Commit 10 — Remaining unset (flags long-tail, symbols, food-drink, misc) — 25
// ============================================================================
plan['remaining unset (flags long-tail, symbols, food-drink & misc)'] = pickUnique(
  (e) => true,
  25,
  seen
);

// Output
console.log('\n=== BATCH 19 PLAN ===\n');
let total = 0;
for (const [label, list] of Object.entries(plan)) {
  total += list.length;
  console.log(`\n${label}: ${list.length} emojis`);
  for (const e of list) {
    console.log(`  ${e.character} ${e.name} [${e.filename}]`);
  }
}
console.log(`\n\nTOTAL: ${total}`);

const out = path.join(process.cwd(), 'scripts', 'batch-19-plan.json');
fs.writeFileSync(out, JSON.stringify(plan, null, 2));
console.log(`\nPlan saved to ${out}`);

if (total !== 250) {
  console.error(`\nERROR: expected 250 emoji, got ${total}`);
  process.exit(1);
}
