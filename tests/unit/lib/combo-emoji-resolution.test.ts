import { describe, it, expect, beforeEach } from 'bun:test';
import type { EmojiCombo } from '../../../src/types/combo';

/**
 * A combo names its parts with emoji slugs, and the catalog does not always
 * use the same name for the same glyph. These tests cover the resolution
 * that keeps every part of a combo linked to the emoji page that actually
 * shows it.
 */

let clearComboCache: () => void;
let clearEmojiCache: () => void;

beforeEach(async () => {
  const comboData = await import('../../../src/lib/combo-data');
  const emojiData = await import('../../../src/lib/emoji-data');
  clearComboCache = comboData.clearComboCache;
  clearEmojiCache = emojiData.clearEmojiCache;
  clearComboCache();
  clearEmojiCache();
});

describe('getComboEmojiRecords', () => {
  it('resolves a combo whose slugs match the catalog', async () => {
    const { getComboEmojiRecords } = await import('../../../src/lib/combo-data');

    const combo: EmojiCombo = {
      slug: 'test-skull-laughing',
      combo: '💀😂',
      emojis: ['skull', 'face-with-tears-of-joy'],
      name: 'Test',
      description: 'x',
      meaning: 'x',
      examples: ['x'],
      category: 'humor',
      seoTitle: 'x',
      seoDescription: 'x',
    };

    const records = getComboEmojiRecords(combo);

    expect(records).toHaveLength(2);
    expect(records[0].character).toBe('💀');
    expect(records[1].character).toBe('😂');
  });

  it('resolves a combo whose slugs do not match the catalog', async () => {
    const { getComboEmojiRecords } = await import('../../../src/lib/combo-data');

    // `honeybee` is published as `bee`; the glyph is what decides.
    const combo: EmojiCombo = {
      slug: 'test-honeybee',
      combo: '🐝🌻',
      emojis: ['honeybee', 'sunflower'],
      name: 'Test',
      description: 'x',
      meaning: 'x',
      examples: ['x'],
      category: 'food',
      seoTitle: 'x',
      seoDescription: 'x',
    };

    const records = getComboEmojiRecords(combo);

    expect(records).toHaveLength(2);
    expect(records[0].character).toBe('🐝');
    expect(records[1].character).toBe('🌻');
  });

  it('matches a glyph that differs only by its variation selector', async () => {
    const { getComboEmojiRecords } = await import('../../../src/lib/combo-data');

    // The catalog stores the peace symbol as "☮"; the combo carries "☮️".
    const combo: EmojiCombo = {
      slug: 'test-peace',
      combo: '☮️✨',
      emojis: ['peace-symbol', 'sparkles'],
      name: 'Test',
      description: 'x',
      meaning: 'x',
      examples: ['x'],
      category: 'reaction',
      seoTitle: 'x',
      seoDescription: 'x',
    };

    const records = getComboEmojiRecords(combo);

    expect(records.length).toBeGreaterThanOrEqual(1);
    expect(records[0].character.replace(/️/g, '')).toBe('☮');
  });

  it('keeps a ZWJ sequence as one emoji', async () => {
    const { getComboEmojiRecords } = await import('../../../src/lib/combo-data');

    const combo: EmojiCombo = {
      slug: 'test-zwj',
      combo: '😵‍💫⭐',
      emojis: ['exploding-head', 'star'],
      name: 'Test',
      description: 'x',
      meaning: 'x',
      examples: ['x'],
      category: 'reaction',
      seoTitle: 'x',
      seoDescription: 'x',
    };

    const records = getComboEmojiRecords(combo);

    // The head-exploding sequence counts as one emoji, plus the star.
    expect(records).toHaveLength(2);
    expect(records[0].character).toBe('😵‍💫');
    expect(records[1].character).toBe('⭐');
  });

  it('skips a glyph the catalog does not publish', async () => {
    const { getComboEmojiRecords } = await import('../../../src/lib/combo-data');

    const combo: EmojiCombo = {
      slug: 'test-unknown',
      combo: '🛂🎉',
      emojis: ['passport-control', 'party-popper'],
      name: 'Test',
      description: 'x',
      meaning: 'x',
      examples: ['x'],
      category: 'celebration',
      seoTitle: 'x',
      seoDescription: 'x',
    };

    const records = getComboEmojiRecords(combo);

    // The passport control glyph has no published page, so only the
    // published one is returned.
    expect(records).toHaveLength(1);
    expect(records[0].character).toBe('🎉');
  });

  it('returns an empty list for a combo with no glyphs', async () => {
    const { getComboEmojiRecords } = await import('../../../src/lib/combo-data');

    const combo: EmojiCombo = {
      slug: 'test-empty',
      combo: '',
      emojis: [],
      name: 'Test',
      description: 'x',
      meaning: 'x',
      examples: ['x'],
      category: 'other',
      seoTitle: 'x',
      seoDescription: 'x',
    };

    expect(getComboEmojiRecords(combo)).toEqual([]);
  });
});

describe('getEmojiByCharacter', () => {
  it('finds a published emoji by its glyph', async () => {
    const { getEmojiByCharacter } = await import('../../../src/lib/emoji-data');
    expect(getEmojiByCharacter('💀')?.slug).toBe('skull');
  });

  it('ignores the variation selector', async () => {
    const { getEmojiByCharacter } = await import('../../../src/lib/emoji-data');
    const withSelector = getEmojiByCharacter('☮️');
    const without = getEmojiByCharacter('☮');
    expect(withSelector?.slug).toBe(without?.slug);
  });

  it('returns undefined for a glyph with no published record', async () => {
    const { getEmojiByCharacter } = await import('../../../src/lib/emoji-data');
    expect(getEmojiByCharacter('🛂')).toBeUndefined();
  });

  it('returns undefined for an empty glyph', async () => {
    const { getEmojiByCharacter } = await import('../../../src/lib/emoji-data');
    expect(getEmojiByCharacter('')).toBeUndefined();
  });
});

describe('normalizeEmojiCharacter', () => {
  it('strips the variation selectors', async () => {
    const { normalizeEmojiCharacter } = await import('../../../src/lib/emoji-data');
    expect(normalizeEmojiCharacter('☮️')).toBe('☮');
    expect(normalizeEmojiCharacter('☮︎')).toBe('☮');
  });

  it('leaves an ordinary glyph alone', async () => {
    const { normalizeEmojiCharacter } = await import('../../../src/lib/emoji-data');
    expect(normalizeEmojiCharacter('💀')).toBe('💀');
  });
});

describe('getCombosByEmoji', () => {
  it('finds the combos that use an emoji', async () => {
    const { getCombosByEmoji } = await import('../../../src/lib/combo-data');
    const results = getCombosByEmoji('skull');
    expect(results.some((c) => c.slug === 'skull-laughing')).toBe(true);
  });

  it('finds a combo whose recorded slug names the emoji differently', async () => {
    const { getCombosByEmoji } = await import('../../../src/lib/combo-data');
    // The catalog publishes 🐝 as `bee`; a combo that calls it `honeybee`
    // still has to show up on the bee page.
    const results = getCombosByEmoji('bee');
    const honeybeeCombos = results.filter((c) => c.combo.includes('🐝'));
    expect(honeybeeCombos.length).toBeGreaterThan(0);
  });

  it('returns an empty list for an emoji nothing uses', async () => {
    const { getCombosByEmoji } = await import('../../../src/lib/combo-data');
    expect(getCombosByEmoji('non-existent-emoji')).toEqual([]);
  });
});
