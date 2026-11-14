import { describe, expect, test } from 'bun:test';
import {
  fitSeoTitle,
  fitSeoDescription,
  TITLE_MAX_LENGTH,
  DESCRIPTION_MAX_LENGTH,
} from '../../../src/lib/seo-limits';

const BRAND = ' | KnowYourEmoji';

describe('seo-limits', () => {
  describe('fitSeoTitle', () => {
    test('leaves a title that already fits untouched', () => {
      expect(fitSeoTitle('💀 Skull Emoji Meaning', BRAND)).toBe('💀 Skull Emoji Meaning');
    });

    test('trims surrounding whitespace', () => {
      expect(fitSeoTitle('  💀 Skull  ', BRAND)).toBe('💀 Skull');
    });

    test('drops the trailing "What Does X Really Mean?" clause to fit the budget', () => {
      const title = fitSeoTitle('💀 Skull Emoji Meaning - What Does 💀 Really Mean?', BRAND);

      expect(title).toBe('💀 Skull Emoji Meaning');
      expect(title.length).toBeLessThanOrEqual(TITLE_MAX_LENGTH - BRAND.length);
    });

    test('drops the trailing "What Does X Mean?" clause to fit the budget', () => {
      const title = fitSeoTitle('💀 Skull Emoji Meaning In Text - What Does 💀 Mean?', BRAND);

      expect(title).toBe('💀 Skull Emoji Meaning In Text');
    });

    test('drops a trailing "What It Actually Means in Text" clause', () => {
      const title = fitSeoTitle('💀 Skull Emoji Meaning - What It Actually Means in Text', BRAND);

      expect(title).toBe('💀 Skull Emoji Meaning');
    });

    test('drops a trailing "A Full Breakdown" clause', () => {
      const title = fitSeoTitle('💀 Skull Emoji Meaning In Every Chat A Full Breakdown', BRAND);

      expect(title).toBe('💀 Skull Emoji Meaning In Every Chat');
    });

    test('drops a trailing "Meaning, Uses and Common Misreads" clause', () => {
      const title = fitSeoTitle('🤙 Call Me Hand Emoji: Meaning, Uses and Common Misreads', BRAND);

      expect(title).toBe('🤙 Call Me Hand Emoji');
    });

    test('drops a trailing "Emoji Meaning and How to Use It" clause', () => {
      const title = fitSeoTitle(
        '👉 Backhand Index Pointing Right Emoji Meaning and How to Use It',
        BRAND
      );

      expect(title).toBe('👉 Backhand Index Pointing Right Emoji');
    });

    test('drops a trailing "Meaning" and keeps the "Emoji" keyword', () => {
      const title = fitSeoTitle('👈 Backhand Index Pointing Left Emoji Meaning', BRAND);

      expect(title).toBe('👈 Backhand Index Pointing Left Emoji');
    });

    test('unwraps a "What Does the X Emoji Y Mean?" title', () => {
      const title = fitSeoTitle('What Does the Backhand Index Pointing Left Emoji 👈 Mean?', BRAND);

      expect(title).toBe('Backhand Index Pointing Left Emoji 👈');
    });

    test('unwraps a title that also carries a trailing clause', () => {
      // The clause comes off first, otherwise the wrapper is buried under
      // it and neither rule can see the other.
      const title = fitSeoTitle(
        'What Does the Backhand Index Pointing Left Emoji 👈 Mean? A Full Breakdown',
        BRAND
      );

      expect(title).toBe('Backhand Index Pointing Left Emoji 👈');
    });

    test('leaves no dangling separator behind', () => {
      const title = fitSeoTitle('🤙 Call Me Hand Emoji: Meaning, Uses and Common Misreads', BRAND);

      expect(title).not.toMatch(/[:\s—–-]$/);
    });

    test('drops a hub tail that only repeats the display name', () => {
      const title = fitSeoTitle('Red Flag Emoji Meanings - Emojis for Red Flag Context', BRAND);

      expect(title).toBe('Red Flag Emoji Meanings');
    });

    test('drops a "What Do They Really Mean?" hub tail', () => {
      const title = fitSeoTitle('Activities Emojis - What Do They Really Mean?', BRAND);

      expect(title).toBe('Activities Emojis');
    });

    test('drops a "What Emojis Mean to X" hub tail', () => {
      const title = fitSeoTitle('Gen Z Emoji Meanings - What Emojis Mean to Gen Z', BRAND);

      expect(title).toBe('Gen Z Emoji Meanings');
    });

    test('drops a "What Emojis Really Mean on X" hub tail', () => {
      const title = fitSeoTitle('TikTok Emoji Meanings - What Emojis Really Mean on TikTok', BRAND);

      expect(title).toBe('TikTok Emoji Meanings');
    });

    test('drops a "Best X Combos Explained" hub tail', () => {
      const title = fitSeoTitle(
        'Celebration Emoji Combos - Best Celebration Combos Explained',
        BRAND
      );

      expect(title).toBe('Celebration Emoji Combos');
    });

    test('keeps the head term when the clause alone does not make it fit', () => {
      // Nothing to strip: the title is one long unbroken phrase. It is
      // returned unchanged, because a mangled title is worse than a long
      // one.
      const title = fitSeoTitle('A'.repeat(80), BRAND);

      expect(title).toBe('A'.repeat(80));
    });

    test('returns the title unchanged when the suffix alone eats the budget', () => {
      const title = fitSeoTitle('💀 Skull Emoji Meaning', ' | A Very Long Site Name Indeed');

      expect(title).toBe('💀 Skull Emoji Meaning');
    });

    test('the brand is counted against the budget, not ignored', () => {
      // The same title fits with a short suffix and has to lose its clause
      // with a long one, because what gets truncated is the rendered
      // title, suffix included.
      const short = fitSeoTitle('💀 Skull Emoji Meaning - What Does 💀 Really Mean?', ' | A');
      const long = fitSeoTitle(
        '💀 Skull Emoji Meaning - What Does 💀 Really Mean?',
        ' | A Very Long Site Name Indeed'
      );

      expect(short).toContain('Really Mean');
      expect(long).toBe('💀 Skull Emoji Meaning');
    });
  });

  describe('fitSeoDescription', () => {
    test('leaves a description that already fits untouched', () => {
      const description = 'Learn what the skull emoji 💀 really means in modern texting.';

      expect(fitSeoDescription(description)).toBe(description);
    });

    test('trims surrounding whitespace', () => {
      expect(fitSeoDescription('  Short one.  ')).toBe('Short one.');
    });

    test('cuts at the last sentence that fits the budget', () => {
      const description =
        'The skull emoji means something is very funny. ' +
        'It is the internet way of saying I am dead. ' +
        'This trailing sentence is long enough that it cannot fit inside the budget at all.';

      const fitted = fitSeoDescription(description);

      expect(fitted.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
      expect(fitted.endsWith('I am dead.')).toBe(true);
    });

    test('falls back to a word boundary and marks the truncation', () => {
      const description = `The skull emoji ${'means something funny '.repeat(20)}`;

      const fitted = fitSeoDescription(description);

      expect(fitted.length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
      expect(fitted.endsWith('…')).toBe(true);
      expect(fitted).not.toContain('  ');
    });

    test('does not leave a dangling separator before the ellipsis', () => {
      const description = `The skull emoji ${'means something funny '.repeat(20)}, and more`;

      const fitted = fitSeoDescription(description);

      expect(fitted.endsWith('…')).toBe(true);
      expect(fitted).not.toMatch(/[\s,;:—–-]…$/);
    });
  });
});
