import { describe, it, expect } from 'bun:test';
import type { EmojiCombo } from '../../../src/types/combo';
import {
  COMBO_BOILERPLATE_PHRASES,
  COMBO_JARGON_WORDS,
  COMBO_STRONG_JARGON_PHRASES,
  countJargon,
  findBoilerplate,
  findComboBoilerplate,
  normalizeProse,
  comboProse,
} from '../../../scripts/combo-content/boilerplate';
import { validateComboBoilerplate } from '../../../scripts/validate-emojis';

const CLEAN_COMBO: EmojiCombo = {
  slug: 'test-clean-combo',
  combo: '💡🔦',
  emojis: ['light-bulb', 'flashlight'],
  name: 'Test Clean Combo',
  description:
    'A bright idea meeting the thing that makes it visible in a dark room, which is how most late-night plans actually happen.',
  meaning: 'The moment an idea shows up and someone finds a way to let other people see it.',
  examples: ['💡🔦 trying to figure this out in the dark'],
  category: 'other',
  seoTitle: '💡🔦 Test Clean Combo Meaning',
  seoDescription: 'What the 💡🔦 test clean combo means in real conversations.',
  longForm: {
    overview:
      'The light bulb carries the idea and the flashlight carries the practical act of making it visible. Together they describe the small flurry of activity that follows a good idea late at night, when someone is looking for a socket and someone else is looking for a charger.',
    howPeopleUseIt:
      'People send it when a plan starts taking shape and needs a practical next step, usually right after describing a problem they have already solved in their head.',
    whenNotToUse:
      'Skip it when the idea is still unformed, because the flashlight overstates how much progress has actually been made.',
    howToReply:
      'A question about what the plan needs first tends to land better than another emoji, because the pair is asking for help as much as it is announcing one.',
    faqs: [
      {
        question: 'Does 💡🔦 mean the plan is finished?',
        answer:
          'Not usually. It tends to mean a plan has an idea at its center and is still gathering the practical pieces.',
      },
      {
        question: 'Where does 💡🔦 usually show up?',
        answer:
          'Mostly in late-night group chats, where somebody is thinking out loud and asking for help at the same time.',
      },
    ],
  },
  conversationExamples: [
    {
      setting: 'work',
      message: '💡🔦 i think we can start the calls at six',
      interpretation: 'The sender has an idea and is already working out how to make it happen.',
    },
    {
      setting: 'friends',
      message: '💡🔦 bringing the spare bulb just in case',
      interpretation:
        'The sender is offering a practical contribution to an idea someone else raised.',
    },
  ],
};

describe('combo-content/boilerplate', () => {
  describe('normalizeProse', () => {
    it('lowercases and collapses whitespace', () => {
      expect(normalizeProse('  Hello   WORLD \n again ')).toBe('hello world again');
    });

    it('leaves an empty string alone', () => {
      expect(normalizeProse('')).toBe('');
    });
  });

  describe('findBoilerplate', () => {
    it('finds nothing in clean prose', () => {
      expect(findBoilerplate('The light bulb carries the idea.')).toEqual([]);
    });

    it('finds a pasted filler sentence', () => {
      const hits = findBoilerplate(
        'The read depends on context, but the register itself does not shift.'
      );
      expect(hits.length).toBeGreaterThan(0);
      expect(hits).toContain('the read depends on context, but the register itself does not');
    });

    it('matches regardless of case and line wrapping', () => {
      const hits = findBoilerplate(
        'ACROSS PLATFORMS THE MEANING IS CONSISTENT,\nAND THE CADENCE STAYS THE SAME.'
      );
      expect(hits).toContain(
        'across platforms the meaning is consistent, and the cadence stays the same'
      );
    });

    it('finds a strong jargon phrase', () => {
      const hits = findBoilerplate('It travels without losing the read on the way.');
      expect(hits).toContain('without losing the read');
    });

    it('finds a hyphenated coded compound', () => {
      const hits = findBoilerplate('It is the humor-coded reaction.');
      expect(hits).toContain('-coded');
    });

    it('reports each phrase once', () => {
      const text = 'The read depends on context, but the register itself does not shift. '.repeat(
        3
      );
      const hits = findBoilerplate(text);
      expect(
        hits.filter(
          (hit) => hit === 'the read depends on context, but the register itself does not'
        )
      ).toHaveLength(1);
    });
  });

  describe('countJargon', () => {
    it('counts nothing in plain prose', () => {
      expect(countJargon('The pair describes a plan and a practical next step.')).toBe(0);
    });

    it('counts a jargon word', () => {
      expect(countJargon('The register stays the same.')).toBe(1);
    });

    it('counts repeated occurrences of the same word', () => {
      expect(countJargon('Register and register and register.')).toBe(3);
    });

    it('counts a hyphenated term once per occurrence', () => {
      expect(countJargon('reaction-coded and humor-coded')).toBe(2);
    });

    it('does not match a word that merely contains a jargon word', () => {
      expect(countJargon('Registers are everywhere.')).toBe(0);
    });
  });

  describe('comboProse', () => {
    it('collects the reader-visible prose of a combo', () => {
      const prose = comboProse(CLEAN_COMBO);
      expect(prose).toContain('A bright idea meeting the thing that makes it visible');
      expect(prose).toContain('The moment an idea shows up');
      expect(prose).toContain('Does 💡🔦 mean the plan is finished?');
      expect(prose).toContain('bringing the spare bulb just in case');
    });

    it('tolerates a combo with no long form', () => {
      expect(comboProse({ description: 'only this' }).trim()).toBe('only this');
    });

    it('tolerates a completely empty combo', () => {
      expect(comboProse({}).trim()).toBe('');
    });
  });

  describe('findComboBoilerplate', () => {
    it('finds nothing in a hand-written combo', () => {
      expect(findComboBoilerplate(CLEAN_COMBO)).toEqual([]);
    });

    it('finds the template language in a templated combo', () => {
      const templated: EmojiCombo = {
        ...CLEAN_COMBO,
        longForm: {
          ...CLEAN_COMBO.longForm,
          overview:
            'This combo works well in almost any context. Combos in the objects, tools & tech family are especially common, so it lands as expected rather than as a surprise.',
        },
      };
      const hits = findComboBoilerplate(templated);
      expect(hits).toContain('combos in the objects, tools & tech family are');
      expect(hits).toContain('so it lands as expected rather than as a surprise');
    });
  });

  describe('the phrase lists', () => {
    it('has no duplicate entries', () => {
      expect(new Set(COMBO_BOILERPLATE_PHRASES).size).toBe(COMBO_BOILERPLATE_PHRASES.length);
      expect(new Set(COMBO_JARGON_WORDS).size).toBe(COMBO_JARGON_WORDS.length);
      expect(new Set(COMBO_STRONG_JARGON_PHRASES).size).toBe(COMBO_STRONG_JARGON_PHRASES.length);
    });

    it('keeps every phrase in lowercase so matching is case-insensitive', () => {
      for (const phrase of COMBO_BOILERPLATE_PHRASES) {
        expect(phrase).toBe(phrase.toLowerCase());
      }
      for (const phrase of COMBO_STRONG_JARGON_PHRASES) {
        expect(phrase).toBe(phrase.toLowerCase());
      }
    });
  });
});

describe('validateComboBoilerplate', () => {
  it('passes a combo written about its own emoji pair', () => {
    expect(validateComboBoilerplate(CLEAN_COMBO)).toEqual([]);
  });

  it('fails a combo that reuses the shared template language', () => {
    const templated: EmojiCombo = {
      ...CLEAN_COMBO,
      meaning:
        'The two-emoji register is consistent across audiences and borrows the register most senders in the family expect.',
    };
    const errors = validateComboBoilerplate(templated);
    expect(errors).toHaveLength(1);
    expect(errors[0].file).toBe('test-clean-combo');
    expect(errors[0].field).toBe('longForm');
    expect(errors[0].message).toContain('shared template language');
  });

  it('names every offending phrase in the message', () => {
    const templated: EmojiCombo = {
      ...CLEAN_COMBO,
      description: 'It lives in the work-coded space and signals a reaction-coded reply.',
    };
    const errors = validateComboBoilerplate(templated);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('"lives in the work-coded space"');
    expect(errors[0].message).toContain('"signals a reaction-coded reply"');
  });

  it('summarizes the phrases it does not list', () => {
    const templated: EmojiCombo = {
      ...CLEAN_COMBO,
      description:
        'The read depends on context, but the register itself does not shift. Across platforms the meaning is consistent, and the cadence stays the same. The combo lands in 1:1 threads, on instagram, and on tiktok without losing the read.',
    };
    const errors = validateComboBoilerplate(templated);
    expect(errors[0].message).toMatch(/and \d+ more/);
  });

  it('reports the combo slug as the file it belongs to', () => {
    const errors = validateComboBoilerplate({
      ...CLEAN_COMBO,
      slug: '',
      meaning: 'The read depends on context, but the register itself does not shift.',
    });
    expect(errors[0].file).toBe('unknown');
  });
});
