import { describe, it, expect } from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import type { EmojiCombo } from '../../../src/types/combo';
import {
  validateCombo,
  validateComboLongForm,
  validateComboFaq,
  validateComboConversationExample,
  validateComboContentTier,
  validateComboDeepTier,
  validateAllCombos,
  loadCombosFromDirectory,
  COMBO_DEEP_OVERVIEW_MIN_WORDS,
  COMBO_DEEP_FAQS_MIN,
  COMBO_DEEP_CONVERSATION_EXAMPLES_MIN,
  COMBO_RICH_PROSE_MIN_WORDS,
} from '../../../scripts/validate-emojis';

const baseCombo: EmojiCombo = {
  slug: 'skull-laughing',
  combo: '💀😂',
  emojis: ['skull', 'face-with-tears-of-joy'],
  name: 'Skull Laughing',
  description:
    'Skull paired with tears-of-joy is the maximum-funny combo used to mark something that killed you with laughter. It is a long-running reaction.',
  meaning:
    'Used to mark something so funny it killed the sender. The skull adds the dead beat and the tears-of-joy adds the laugh beat, together forming the universal I-am-dead visual for top-tier memes. It is the standard reaction to anything absurd in the wild.',
  examples: ['I cannot 😂💀', 'this thread 💀😂', 'rip me 💀😂'],
  category: 'humor',
  seoTitle: '💀😂 Skull Laughing Combo Meaning',
  seoDescription:
    'What does 💀😂 mean? The skull and tears-of-joy combo explained. Used to mark something that killed you with laughter.',
  relatedCombos: ['rofl-laughing', 'lol-100'],
  tags: ['funny', 'skull', 'laugh'],
  popularity: 95,
  contentTier: 'deep',
  contentUpdatedAt: '2026-08-14',
  longForm: {
    overview:
      '💀😂 is the maximum-funny combo. The skull adds the dead beat and the tears-of-joy adds the laugh beat, together forming the universal I-am-dead visual for top-tier memes. On TikTok, Twitter, and iMessage 💀😂 shows up under funny clips, jokes, and any context where the sender wants to mark a laugh-out-loud moment. The combo is more emphatic than 😂 alone and more visual than 💀 alone, which is why it has become the universal marker for top-tier humor. Writers should default to 💀😂 when the moment really is funny in a dead-from-laughing way, and reach for a softer 😂 when the read should be lighter. The pairing is also the standard closer on a thread where the sender wants to land as fully amused and the beat lands as authentic because both emojis are unambiguously about laughing. Worth knowing before you send or read it in any context.',
    howPeopleUseIt:
      'Arrives as a stand-alone reaction, sandwiched in a sentence as a beat, or stacked under a funny post.',
    whenNotToUse:
      'Skip 💀😂 in cold work channels where the laugh energy will read as unprofessional.',
    howToReply:
      'Mirror 💀😂 with another 💀😂 or with a sentence that engages with the funny moment.',
    faqs: [
      {
        question: 'What does 💀😂 mean?',
        answer:
          'Means the sender is fully dead from laughing. The skull and tears-of-joy combo is the universal laugh signal.',
      },
      {
        question: 'Is 💀😂 flirty?',
        answer: 'Usually no, it is a laugh reaction, not a flirtation signal.',
      },
      {
        question: 'What does 💀😂 mean on TikTok?',
        answer: 'A single 💀😂 in the comments means the viewer finds the content hilarious.',
      },
    ],
  },
  conversationExamples: [
    {
      setting: 'friends',
      message: 'this thread killed me 💀😂',
      interpretation: 'Friend sharing a laugh reaction.',
    },
    {
      setting: 'social',
      message: 'whole feed 💀😂',
      interpretation: 'Group reaction to a funny thread.',
    },
    {
      setting: 'work',
      message: 'meeting recap 💀😂',
      interpretation: 'Sympathetic work laugh.',
    },
    {
      setting: 'dating',
      message: 'you killed me 💀😂',
      interpretation: 'Romantic laugh.',
    },
    {
      setting: 'family',
      message: 'Dad just discovered emojis 💀😂',
      interpretation: 'Family laugh.',
    },
  ],
};

describe('validateComboLongForm', () => {
  it('returns no errors for a valid longForm', () => {
    const errors = validateComboLongForm(baseCombo.longForm!);
    expect(errors).toEqual([]);
  });

  it('flags an empty-string overview', () => {
    const errors = validateComboLongForm({
      ...baseCombo.longForm!,
      overview: '   ',
    });
    expect(errors.some((e) => e.field === 'longForm.overview')).toBe(true);
  });

  it('flags a non-string field', () => {
    const errors = validateComboLongForm({
      ...baseCombo.longForm!,
      howPeopleUseIt: 42 as unknown as string,
    });
    expect(errors.some((e) => e.field === 'longForm.howPeopleUseIt')).toBe(true);
  });
});

describe('validateComboFaq', () => {
  it('returns no errors for a valid faq', () => {
    const errors = validateComboFaq(baseCombo.longForm!.faqs![0], 0);
    expect(errors).toEqual([]);
  });

  it('flags a missing question', () => {
    const errors = validateComboFaq({ question: '', answer: 'ok' }, 0);
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('validateComboConversationExample', () => {
  it('returns no errors for a valid example', () => {
    const errors = validateComboConversationExample(baseCombo.conversationExamples![0], 0);
    expect(errors).toEqual([]);
  });

  it('flags a missing interpretation', () => {
    const errors = validateComboConversationExample(
      { setting: 'friends', message: 'hi', interpretation: '' },
      0
    );
    expect(errors.length).toBeGreaterThan(0);
  });
});

describe('validateComboContentTier', () => {
  it('accepts each valid tier value', () => {
    expect(validateComboContentTier('thin')).toEqual([]);
    expect(validateComboContentTier('standard')).toEqual([]);
    expect(validateComboContentTier('deep')).toEqual([]);
  });

  it('rejects an unknown tier', () => {
    const errors = validateComboContentTier('mega');
    expect(errors.length).toBeGreaterThan(0);
  });

  it('accepts undefined (tier is optional)', () => {
    expect(validateComboContentTier(undefined)).toEqual([]);
  });
});

describe('validateComboDeepTier', () => {
  it('returns no errors for a valid deep combo', () => {
    expect(validateComboDeepTier(baseCombo)).toEqual([]);
  });

  it('flags a deep combo with a short overview', () => {
    const errors = validateComboDeepTier({
      ...baseCombo,
      longForm: { ...baseCombo.longForm!, overview: 'too short' },
    });
    expect(errors.some((e) => e.field === 'longForm.overview')).toBe(true);
  });

  it('flags a deep combo with fewer than the minimum FAQs', () => {
    const errors = validateComboDeepTier({
      ...baseCombo,
      longForm: { ...baseCombo.longForm!, faqs: baseCombo.longForm!.faqs!.slice(0, 1) },
    });
    expect(errors.some((e) => e.field === 'longForm.faqs')).toBe(true);
  });

  it('flags a deep combo with fewer than the minimum conversation examples', () => {
    const errors = validateComboDeepTier({
      ...baseCombo,
      conversationExamples: baseCombo.conversationExamples!.slice(0, 2),
    });
    expect(errors.some((e) => e.field === 'conversationExamples')).toBe(true);
  });
});

describe('validateCombo', () => {
  const knownSlugs = new Set(['skull-laughing', 'rofl-laughing', 'lol-100']);

  it('accepts a fully-populated deep combo', () => {
    expect(validateCombo(baseCombo, knownSlugs)).toEqual([]);
  });

  it('flags missing required fields', () => {
    const errors = validateCombo({ slug: 'only' } as unknown as EmojiCombo, knownSlugs);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('flags invalid category', () => {
    const errors = validateCombo({ ...baseCombo, category: 'unknown' as never }, knownSlugs);
    expect(errors.some((e) => e.field === 'category')).toBe(true);
  });

  it('flags a deep combo with fewer than 2 emojis', () => {
    const errors = validateCombo({ ...baseCombo, emojis: ['skull'] }, knownSlugs);
    expect(errors.some((e) => e.field === 'emojis')).toBe(true);
  });

  it('flags a deep combo with fewer than 3 examples', () => {
    const errors = validateCombo({ ...baseCombo, examples: ['only one'] }, knownSlugs);
    expect(errors.some((e) => e.field === 'examples')).toBe(true);
  });

  it('flags a description+meaning under the rich-prose floor', () => {
    const errors = validateCombo(
      {
        ...baseCombo,
        description: 'Short desc.',
        meaning: 'Short meaning.',
      },
      knownSlugs
    );
    expect(errors.some((e) => e.field === 'description+meaning')).toBe(true);
  });

  it('flags an unknown relatedCombos slug', () => {
    const errors = validateCombo({ ...baseCombo, relatedCombos: ['does-not-exist'] }, knownSlugs);
    expect(errors.some((e) => e.field === 'relatedCombos[0]')).toBe(true);
  });

  it('grandfathers thin-tier combos that lack required prose fields', () => {
    const thin = { slug: 'legacy', contentTier: 'thin' } as unknown as EmojiCombo;
    expect(validateCombo(thin, knownSlugs)).toEqual([]);
  });
});

describe('validateAllCombos', () => {
  it('returns valid when all combos pass', () => {
    const result = validateAllCombos([
      baseCombo,
      { ...baseCombo, slug: 'rofl-laughing' },
      { ...baseCombo, slug: 'lol-100' },
    ]);
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it('aggregates errors across multiple combos', () => {
    const result = validateAllCombos([
      baseCombo,
      { ...baseCombo, slug: 'broken', category: 'bogus' as never },
    ]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.startsWith('[broken]'))).toBe(true);
  });

  it('flags duplicate slugs', () => {
    const result = validateAllCombos([baseCombo, { ...baseCombo }]);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Duplicate combo slug'))).toBe(true);
  });
});

describe('loadCombosFromDirectory', () => {
  it('returns [] when the directory does not exist', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'combos-'));
    const missing = path.join(tmp, 'does-not-exist');
    expect(loadCombosFromDirectory(missing)).toEqual([]);
    fs.rmSync(tmp, { recursive: true, force: true });
  });

  it('returns parsed combos from valid JSON files', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'combos-'));
    fs.writeFileSync(path.join(tmp, 'a.json'), JSON.stringify({ slug: 'a' }));
    fs.writeFileSync(path.join(tmp, 'b.json'), JSON.stringify({ slug: 'b' }));
    const combos = loadCombosFromDirectory(tmp);
    expect(combos.map((c) => c.slug).sort()).toEqual(['a', 'b']);
    fs.rmSync(tmp, { recursive: true, force: true });
  });
});

describe('combo tier constants', () => {
  it('exposes the expected deep-tier thresholds', () => {
    expect(COMBO_DEEP_OVERVIEW_MIN_WORDS).toBe(120);
    expect(COMBO_DEEP_FAQS_MIN).toBe(3);
    expect(COMBO_DEEP_CONVERSATION_EXAMPLES_MIN).toBe(3);
    expect(COMBO_RICH_PROSE_MIN_WORDS).toBe(40);
  });
});
