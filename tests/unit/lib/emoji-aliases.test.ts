import { describe, expect, test } from 'bun:test';
import {
  EMOJI_ALIASES,
  MISLABELED_EMOJI_SLUGS,
  getCanonicalEmojiSlug,
  isEmojiAlias,
} from '../../../src/lib/emoji-aliases';
import { getAllEmojis, getEmojiBySlug, normalizeEmojiCharacter } from '../../../src/lib/emoji-data';

describe('emoji-aliases', () => {
  test('maps the duplicate 💯 page to the one that owns it', () => {
    expect(isEmojiAlias('100')).toBe(true);
    expect(getCanonicalEmojiSlug('100')).toBe('hundred-points');
  });

  test('leaves owners and unknown slugs alone', () => {
    expect(isEmojiAlias('hundred-points')).toBe(false);
    expect(getCanonicalEmojiSlug('hundred-points')).toBe('hundred-points');
    expect(getCanonicalEmojiSlug('not-an-emoji')).toBe('not-an-emoji');
    // Prototype keys are not aliases.
    expect(isEmojiAlias('constructor')).toBe(false);
  });

  test('every alias points at a published owner with the same glyph', () => {
    for (const [alias, owner] of Object.entries(EMOJI_ALIASES)) {
      const aliasEmoji = getEmojiBySlug(alias);
      const ownerEmoji = getEmojiBySlug(owner);
      expect(aliasEmoji).toBeDefined();
      expect(ownerEmoji).toBeDefined();
      expect(isEmojiAlias(owner)).toBe(false);
      expect(normalizeEmojiCharacter(aliasEmoji!.character)).toBe(
        normalizeEmojiCharacter(ownerEmoji!.character)
      );
    }
  });

  test('each glyph has one indexable page', () => {
    const skipped = new Set(MISLABELED_EMOJI_SLUGS);
    const owners = new Map<string, string[]>();
    for (const emoji of getAllEmojis()) {
      if (emoji.skinToneBase || skipped.has(emoji.slug) || isEmojiAlias(emoji.slug)) continue;
      const glyph = normalizeEmojiCharacter(emoji.character);
      owners.set(glyph, [...(owners.get(glyph) ?? []), emoji.slug]);
    }
    const duplicated = [...owners.values()].filter((slugs) => slugs.length > 1);
    expect(duplicated).toEqual([]);
  });

  test('mislabeled slugs are never aliases', () => {
    for (const slug of MISLABELED_EMOJI_SLUGS) expect(isEmojiAlias(slug)).toBe(false);
  });
});
