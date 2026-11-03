import { describe, expect, test } from 'bun:test';

import {
  findSharedSentences,
  splitSentences,
} from '../../../scripts/check-content-similarity';

interface TestPage {
  slug: string;
  file: string;
  family: string | undefined;
  text: string;
  sentences: string[];
}

function page(slug: string, sentences: string[]): TestPage {
  return {
    slug,
    file: `src/data/combos/${slug}.json`,
    family: undefined,
    text: sentences.join(' '),
    sentences,
  };
}

describe('check-content-similarity', () => {
  describe('splitSentences', () => {
    test('splits on a full stop', () => {
      expect(splitSentences('One thing. Another thing.')).toEqual(['One thing.', 'Another thing.']);
    });

    test('splits on a question mark and an exclamation mark', () => {
      expect(splitSentences('Really? Yes! No.')).toEqual(['Really?', 'Yes!', 'No.']);
    });

    test('keeps a closing quote with the sentence it closes', () => {
      expect(splitSentences('You can ask \'too far?\' and they will answer.')).toEqual([
        "You can ask 'too far?'",
        'and they will answer.',
      ]);
    });

    test('returns the trailing fragment when the text has no closing punctuation', () => {
      expect(splitSentences('No punctuation here')).toEqual(['No punctuation here']);
    });

    test('returns nothing for empty text', () => {
      expect(splitSentences('')).toEqual([]);
    });
  });

  describe('findSharedSentences', () => {
    test('reports a sentence that two pages repeat', () => {
      const shared =
        'The read depends on context, but the register itself does not change when the pair is used here.';
      const found = findSharedSentences([
        page('one', [shared]),
        page('two', [shared]),
        page('three', ['A completely different sentence about a different pair of emoji.']),
      ]);

      expect(found).toHaveLength(1);
      expect(found[0].slugs).toEqual(['one', 'two']);
    });

    test('ignores a shared short sentence', () => {
      const found = findSharedSentences([
        page('one', ['Usually no.']),
        page('two', ['Usually no.']),
      ]);

      expect(found).toEqual([]);
    });

    test('ignores case and wrapping differences', () => {
      const found = findSharedSentences([
        page('one', ['The combo is about the food, not about the sender of the message or the thread.']),
        page('two', ['the combo is about the food,   not about the sender of the message or the thread.']),
      ]);

      expect(found).toHaveLength(1);
      expect(found[0].slugs).toEqual(['one', 'two']);
    });

    test('returns nothing when every page says its own thing', () => {
      const found = findSharedSentences([
        page('one', ['A sentence written for the first page of the catalog.']),
        page('two', ['A different sentence written for the second page of the catalog.']),
      ]);

      expect(found).toEqual([]);
    });
  });
});
