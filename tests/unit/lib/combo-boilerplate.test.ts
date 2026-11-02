import { describe, expect, test } from 'bun:test';
import {
  comboLongFormProse,
  countCodedTokens,
  findComboTemplateMarkers,
  isComboTemplated,
  normalizeProse,
} from '../../../src/lib/combo-boilerplate';
import { createEmojiCombo } from '../../utils/factories/combo.factory';

/**
 * A long-form shaped like the batch template's output: the `whenNotToUse`
 * and `howToReply` sections carry the same filler paragraph, and the whole
 * thing is saturated with "-coded" compounds.
 */
function templatedLongForm() {
  return {
    overview: 'The combo borrows the register most senders in the family expect.',
    howPeopleUseIt: 'The cue sticks whether it lands in a thread or a DM.',
    whenNotToUse:
      'The read depends on context, but the register itself does not. Across platforms the meaning is consistent, and the cadence stays the same.',
    howToReply: 'Reply with a grin-coded reaction to keep the joke going.',
    faqs: [
      {
        question: 'What does the combo mean?',
        answer: 'It is the humor-coded reaction the sender wanted.',
      },
    ],
  };
}

/** A long-form written about one pair of emoji, the way the hand-written pages are. */
function handWrittenLongForm() {
  return {
    overview:
      'The skull and the crying face together are the meme for being so sad the sender is "dead crying" about it. The two emoji have drifted far away from their literal meanings.',
    howPeopleUseIt:
      'People post it under dramatic reaction videos, or under a photo of a friend in a mess. It reads as "I cannot handle this" rather than as grief.',
    whenNotToUse:
      'Skip it when someone has actually lost someone. The meme has not spread widely enough to be read as sarcasm there.',
    howToReply:
      'If someone sends it, you can match the beat with a laughing emoji, or name what they are reacting to so the thread keeps moving.',
    faqs: [
      {
        question: 'What does 💀😭 mean?',
        answer:
          'It is the "I am dead" meme for something so sad or absurd that laughter is the only reaction.',
      },
      {
        question: 'Is 💀😭 flirty?',
        answer: 'No. It is a reaction to a situation, not to a person.',
      },
    ],
  };
}

describe('combo-boilerplate', () => {
  describe('normalizeProse', () => {
    test('lowercases and collapses whitespace', () => {
      expect(normalizeProse('  The   Register\nItself  ')).toBe('the register itself');
    });
  });

  describe('countCodedTokens', () => {
    test('counts each compound once', () => {
      expect(countCodedTokens('grin-coded and joke-coded')).toBe(2);
    });

    test('returns zero when the compound is absent', () => {
      expect(countCodedTokens('nothing to see here')).toBe(0);
    });
  });

  describe('comboLongFormProse', () => {
    test('returns an empty string when there is no long-form', () => {
      expect(comboLongFormProse(createEmojiCombo())).toBe('');
    });

    test('gathers the overview, the prose sections and the FAQs', () => {
      const prose = comboLongFormProse(createEmojiCombo({ longForm: handWrittenLongForm() }));

      expect(prose).toContain('drifted far away from their literal meanings');
      expect(prose).toContain('Skip it when someone has actually lost someone');
      expect(prose).toContain('What does 💀😭 mean?');
    });
  });

  describe('findComboTemplateMarkers', () => {
    test('returns nothing for a page without a long-form', () => {
      expect(findComboTemplateMarkers(createEmojiCombo())).toEqual([]);
    });

    test('returns nothing for a hand-written page', () => {
      expect(
        findComboTemplateMarkers(createEmojiCombo({ longForm: handWrittenLongForm() }))
      ).toEqual([]);
    });

    test('flags the batch sentence about the read and the register', () => {
      const findings = findComboTemplateMarkers(
        createEmojiCombo({
          longForm: {
            whenNotToUse: 'The read depends on context, but the register itself does not.',
          },
        })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('template-phrase');
      expect(findings[0].match).toBe(
        'the read depends on context, but the register itself does not'
      );
    });

    test('flags the batch phrase wherever it appears in the long-form', () => {
      const findings = findComboTemplateMarkers(
        createEmojiCombo({
          longForm: {
            howPeopleUseIt: 'The cue sticks whether it lands in a thread or a DM.',
          },
        })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('template-phrase');
      expect(findings[0].match).toBe('the cue sticks whether');
    });

    test('flags a long-form saturated with "-coded" compounds', () => {
      const coded = Array.from({ length: 10 }, (_, index) => `grin-coded take ${index}`).join('. ');
      const findings = findComboTemplateMarkers(
        createEmojiCombo({ longForm: { overview: coded } })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('coded-token');
      expect(findings[0].match).toContain('-coded');
    });

    test('does not flag a long-form with a handful of "-coded" compounds', () => {
      const coded = Array.from({ length: 9 }, (_, index) => `grin-coded take ${index}`).join('. ');
      const findings = findComboTemplateMarkers(
        createEmojiCombo({ longForm: { overview: coded } })
      );

      expect(findings).toEqual([]);
    });

    test('matches phrases regardless of case', () => {
      const findings = findComboTemplateMarkers(
        createEmojiCombo({
          longForm: { overview: 'THE READ DEPENDS ON CONTEXT, BUT THE REGISTER ITSELF DOES NOT.' },
        })
      );

      expect(findings).toHaveLength(1);
      expect(findings[0].kind).toBe('template-phrase');
    });

    test('reports every marker a templated page carries', () => {
      const findings = findComboTemplateMarkers(
        createEmojiCombo({ longForm: templatedLongForm() })
      );

      const matches = findings.map((finding) => finding.match);
      expect(matches).toContain('the read depends on context, but the register itself does not');
      expect(matches).toContain('borrows the register most senders in the family expect');
    });
  });

  describe('isComboTemplated', () => {
    test('is false for a hand-written page', () => {
      expect(isComboTemplated(createEmojiCombo({ longForm: handWrittenLongForm() }))).toBe(false);
    });

    test('is true for a templated page', () => {
      expect(isComboTemplated(createEmojiCombo({ longForm: templatedLongForm() }))).toBe(true);
    });
  });
});
