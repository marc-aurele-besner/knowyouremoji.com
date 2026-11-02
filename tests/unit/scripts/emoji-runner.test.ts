import { describe, it, expect } from 'bun:test';
import { assignAngles, selectTargets } from '../../../scripts/regenerate-emoji-content';
import { ANGLES } from '../../../scripts/emoji-content/prompt';
import type { Emoji } from '../../../src/types/emoji';

function makeEmoji(overrides: Partial<Emoji>): Emoji {
  return {
    unicode: '1F921',
    slug: 'clown-face',
    character: '🤡',
    name: 'Clown Face',
    shortName: 'clown face',
    category: 'smileys-emotion',
    subcategory: 'face-emotion',
    unicodeVersion: '9.0',
    baseMeaning: 'A clown face.',
    tldr: 'Silly.',
    contextMeanings: [],
    platformNotes: [],
    generationalNotes: [],
    warnings: [],
    relatedCombos: [],
    seoTitle: '🤡 Clown Face Emoji Meaning',
    seoDescription: 'What does 🤡 mean?',
    longForm: {
      overview:
        '🤡 is the emoji of clown-face-coded silly. It carries the same clause as every other page in the catalog, over and over, which is what makes it a template.',
    },
    ...overrides,
  };
}

const guides = [
  {
    slug: 'what-does-clown-face-mean',
    title: 'Clown face guide',
    body: '🤡 started showing up as a reaction to delusional takes from celebrities and randos on the timeline, and it was sharper than a laughing emoji at calling one out.',
    relatedEmojis: ['clown-face'],
    heroEmoji: '🤡',
    draft: false,
  },
];

describe('scripts/regenerate-emoji-content', () => {
  describe('assignAngles', () => {
    it('gives each emoji in a family a different angle', () => {
      const emojis = [makeEmoji({ slug: 'a' }), makeEmoji({ slug: 'b' }), makeEmoji({ slug: 'c' })];
      const angles = assignAngles(emojis);
      expect(angles.get('a')?.key).toBe(ANGLES[0].key);
      expect(angles.get('b')?.key).toBe(ANGLES[1].key);
      expect(angles.get('c')?.key).toBe(ANGLES[2].key);
    });

    it('separates emoji in different families', () => {
      const emojis = [
        makeEmoji({ slug: 'a', subcategory: 'face-emotion' }),
        makeEmoji({ slug: 'b', subcategory: 'food-food' }),
      ];
      const angles = assignAngles(emojis);
      expect(angles.get('a')?.key).toBe(ANGLES[0].key);
      expect(angles.get('b')?.key).toBe(ANGLES[0].key);
    });

    it('falls back to the category when there is no subcategory', () => {
      const emojis = [makeEmoji({ slug: 'a', subcategory: undefined })];
      const angles = assignAngles(emojis);
      expect(angles.get('a')?.key).toBe(ANGLES[0].key);
    });
  });

  describe('selectTargets', () => {
    it('selects a templated emoji a guide covers', () => {
      const targets = selectTargets([makeEmoji({})], guides);
      expect(targets.map((emoji) => emoji.slug)).toEqual(['clown-face']);
    });

    it('skips a page that is no longer templated', () => {
      const clean = makeEmoji({
        longForm: { overview: '🤡 is the default emoji for a bad call and a self-roast.' },
      });
      expect(selectTargets([clean], guides)).toEqual([]);
    });

    it('skips a skin-tone variant', () => {
      const variant = makeEmoji({ slug: 'clown-face-tone-2', skinToneBase: 'clown-face' });
      expect(selectTargets([variant], guides)).toEqual([]);
    });

    it('skips an emoji no guide covers', () => {
      const uncovered = makeEmoji({ slug: 'other', character: '🛂', name: 'Passport Control' });
      expect(selectTargets([uncovered], guides)).toEqual([]);
    });

    it('selects an emoji a guide claims in its frontmatter alone', () => {
      const claimed = makeEmoji({
        slug: 'other',
        character: '🛂',
        name: 'Passport Control',
        longForm: {
          overview:
            '🛂 is the emoji of passport-control-coded waiting, carrying the same clause as every other page in the catalog, over and over, which is what makes it a template.',
        },
      });
      const claimingGuides = [
        {
          ...guides[0],
          relatedEmojis: ['other'],
          body: 'A guide body about something else entirely.',
        },
      ];
      const targets = selectTargets([claimed], claimingGuides);
      // No passage grounds it, so it is not rewritten.
      expect(targets).toEqual([]);
    });
  });
});
