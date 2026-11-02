import { describe, expect, test } from 'bun:test';
import {
  countCodedTokens,
  emojiLongFormProse,
  findEmojiTemplateMarkers,
  isEmojiTemplated,
  normalizeProse,
} from '../../../src/lib/emoji-boilerplate';
import { createEmoji } from '../../utils/factories/emoji.factory';

/**
 * A long-form shaped like the batch template's output: the overview opens
 * with "is the emoji of", a FAQ answer leans on "is a natural fit for", and
 * the whole thing is saturated with "-coded" compounds.
 */
function templatedLongForm() {
  return {
    overview:
      'The ginger root is the emoji of ginger root-coded ginger root flex. The visual cue reads instantly as ginger-coded reveals.',
    howPeopleUseIt: 'People send it as a ginger-coded reaction.',
    whenNotToUse: 'Skip it when the ginger-coded moment is not there.',
    howToReply: 'Reply with another ginger-coded emoji.',
    faqs: [
      {
        question: 'What does the ginger root emoji mean?',
        answer:
          'The ginger root is a popular ginger-coded emoji. The visual cue is a natural fit for root-flex-coded reveals.',
      },
    ],
  };
}

/** A long-form written about one emoji, the way the hand-written pages are. */
function handWrittenLongForm() {
  return {
    overview:
      'The skull emoji has drifted from its literal meaning of death. On TikTok and Instagram it now signals that the sender is dead from laughter, or cringing on your behalf.',
    howPeopleUseIt:
      'In real chats the skull tends to arrive after a punchline. People send a single skull to show measured appreciation and a string of three when the moment is genuinely devastating.',
    whenNotToUse:
      'Skip the skull when you are actually grieving, or in any professional channel where the recipient may read it literally.',
    howToReply:
      'If someone sends you a skull and you want to keep the energy, mirror them with another skull or with a screenshot of whatever they are reacting to.',
    faqs: [
      {
        question: 'What does the skull emoji mean from a girl?',
        answer:
          'From a girl or anyone else, the skull almost always means "I am dead" from laughing, not anything romantic or threatening.',
      },
      {
        question: 'Is the skull flirty?',
        answer: 'Usually no. It signals that the sender is dying of laughter rather than flirting.',
      },
    ],
  };
}

describe('emoji-boilerplate', () => {
  describe('normalizeProse', () => {
    test('lowercases and collapses whitespace', () => {
      expect(normalizeProse('  The   Visual\nCue  ')).toBe('the visual cue');
    });
  });

  describe('countCodedTokens', () => {
    test('counts each compound once', () => {
      expect(countCodedTokens('olive-coded and shush-coded')).toBe(2);
    });

    test('returns zero when the compound is absent', () => {
      expect(countCodedTokens('nothing to see here')).toBe(0);
    });
  });

  describe('emojiLongFormProse', () => {
    test('returns an empty string when there is no long-form', () => {
      expect(emojiLongFormProse(createEmoji())).toBe('');
    });

    test('gathers the overview, the prose sections and the FAQs', () => {
      const prose = emojiLongFormProse(createEmoji({ longForm: handWrittenLongForm() }));

      expect(prose).toContain('drifted from its literal meaning');
      expect(prose).toContain('Skip the skull');
      expect(prose).toContain('What does the skull emoji mean from a girl?');
    });
  });

  describe('findEmojiTemplateMarkers', () => {
    test('returns nothing for a page without a long-form', () => {
      expect(findEmojiTemplateMarkers(createEmoji())).toEqual([]);
    });

    test('returns nothing for a hand-written page', () => {
      expect(findEmojiTemplateMarkers(createEmoji({ longForm: handWrittenLongForm() }))).toEqual(
        []
      );
    });

    test('flags an overview that says "is the emoji of"', () => {
      const findings = findEmojiTemplateMarkers(
        createEmoji({
          longForm: { overview: 'The ginger root is the emoji of ginger root flex.' },
        })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('template-phrase');
      expect(findings[0].match).toBe('is the emoji of');
    });

    test('flags a FAQ that says "is a natural fit for"', () => {
      const findings = findEmojiTemplateMarkers(
        createEmoji({
          longForm: {
            faqs: [
              {
                question: 'What does it mean?',
                answer: 'The visual cue is a natural fit for root-flex-coded reveals.',
              },
            ],
          },
        })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('template-phrase');
      expect(findings[0].match).toBe('is a natural fit for');
    });

    test('flags the batch phrase wherever it appears in the long-form', () => {
      const findings = findEmojiTemplateMarkers(
        createEmoji({
          longForm: {
            howPeopleUseIt: 'It is a natural fit for a friend\u2019s driving test.',
          },
        })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('template-phrase');
      expect(findings[0].match).toBe('is a natural fit for');
    });

    test('flags the batch phrase in a section rather than the overview', () => {
      const findings = findEmojiTemplateMarkers(
        createEmoji({
          longForm: { whenNotToUse: 'It is the emoji of nothing in particular.' },
        })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('template-phrase');
      expect(findings[0].match).toBe('is the emoji of');
    });

    test('flags a long-form saturated with "-coded" compounds', () => {
      const coded = Array.from({ length: 10 }, (_, index) => `ginger-coded take ${index}`).join(
        '. '
      );
      const findings = findEmojiTemplateMarkers(createEmoji({ longForm: { overview: coded } }));

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('coded-token');
      expect(findings[0].match).toContain('-coded');
    });

    test('does not flag a long-form with a handful of "-coded" compounds', () => {
      const coded = Array.from({ length: 9 }, (_, index) => `ginger-coded take ${index}`).join(
        '. '
      );
      const findings = findEmojiTemplateMarkers(createEmoji({ longForm: { overview: coded } }));

      expect(findings).toEqual([]);
    });

    test('matches phrases regardless of case', () => {
      const findings = findEmojiTemplateMarkers(
        createEmoji({
          longForm: { overview: 'The ginger root IS THE EMOJI OF ginger root flex.' },
        })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('template-phrase');
    });

    test('reports every marker a templated page carries', () => {
      const findings = findEmojiTemplateMarkers(createEmoji({ longForm: templatedLongForm() }));

      const matches = findings.map((finding) => finding.match);
      expect(matches).toContain('is the emoji of');
      expect(matches).toContain('is a natural fit for');
    });
  });

  describe('isEmojiTemplated', () => {
    test('is false for a hand-written page', () => {
      expect(isEmojiTemplated(createEmoji({ longForm: handWrittenLongForm() }))).toBe(false);
    });

    test('is true for a templated page', () => {
      expect(isEmojiTemplated(createEmoji({ longForm: templatedLongForm() }))).toBe(true);
    });
  });
});
