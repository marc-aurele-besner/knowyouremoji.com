import { describe, it, expect, beforeEach } from 'bun:test';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  buildEmojiGrounding,
  clearGuideCache,
  countOccurrences,
  extractExcerpts,
  loadGuides,
  namesEmoji,
  scoreExcerpt,
  splitParagraphs,
  splitSections,
  stripMarkdown,
  truncateExcerpt,
} from '../../../scripts/emoji-content/guide-grounding';
import type { Emoji } from '../../../src/types/emoji';

const clown: Emoji = {
  unicode: '1F921',
  slug: 'clown-face',
  character: '🤡',
  name: 'Clown Face',
  shortName: 'clown face',
  category: 'smileys-emotion',
  unicodeVersion: '9.0',
  baseMeaning: 'A clown face, often used to represent foolishness or as an insult.',
  tldr: 'Silly.',
  contextMeanings: [],
  platformNotes: [],
  generationalNotes: [],
  warnings: [],
  relatedCombos: [],
  seoTitle: '',
  seoDescription: '',
};

const guides = [
  {
    slug: 'what-does-clown-face-mean',
    title: 'Clown face guide',
    body: 'Intro paragraph.\n\n## How it became a verb\n\n🤡 started showing up as a reaction to delusional takes from celebrities and randos on the timeline, and it was sharper than a laughing emoji.\n\n## Where it turns on you\n\nA different paragraph with no glyph in it at all.',
    relatedEmojis: ['clown-face'],
    heroEmoji: '🤡',
    draft: false,
  },
  {
    slug: 'other-guide',
    title: 'Other guide',
    body: 'Nothing to do with the clown here, just a long enough paragraph of prose about something else entirely.',
    relatedEmojis: [],
    heroEmoji: undefined,
    draft: false,
  },
];

describe('emoji-content/guide-grounding', () => {
  beforeEach(() => {
    clearGuideCache();
  });

  describe('stripMarkdown', () => {
    it('removes headings, bullets, links and bold spans', () => {
      const markdown = '## Heading\n\n- **Bold** and [a link](https://example.com) and `code`';
      expect(stripMarkdown(markdown)).toBe('Heading Bold and a link and code');
    });

    it('removes images down to their alt text', () => {
      expect(stripMarkdown('![alt text](/img.png)')).toBe('alt text');
    });

    it('removes fenced code blocks', () => {
      expect(stripMarkdown('before\n```\ncode\n```\nafter')).toBe('before after');
    });

    it('collapses whitespace', () => {
      expect(stripMarkdown('a\n\nb')).toBe('a b');
    });
  });

  describe('truncateExcerpt', () => {
    it('leaves a short passage alone', () => {
      expect(truncateExcerpt('short passage')).toBe('short passage');
    });

    it('cuts on a sentence boundary', () => {
      const text = 'First sentence here. Second sentence here. Third sentence here.';
      const truncated = truncateExcerpt(text, 45);
      expect(truncated.endsWith('.')).toBe(true);
      expect(truncated).toBe('First sentence here. Second sentence here.');
    });

    it('falls back to a hard cut when there is no punctuation', () => {
      const text = 'word '.repeat(50);
      expect(truncateExcerpt(text, 20)).toBe('word word word word');
    });
  });

  describe('splitSections', () => {
    it('splits on headings and keeps the heading with its section', () => {
      const sections = splitSections('intro\n\n## One\n\nbody one\n\n## Two\n\nbody two');
      expect(sections).toHaveLength(3);
      expect(sections[0].heading).toBeUndefined();
      expect(sections[1].heading).toBe('One');
      expect(sections[2].text).toBe('body two');
    });

    it('drops a section with no content', () => {
      expect(splitSections('## Empty\n\n## Full\n\nbody')).toHaveLength(1);
    });
  });

  describe('splitParagraphs', () => {
    it('splits on blank lines', () => {
      expect(splitParagraphs('one\n\ntwo\n\n\nthree')).toEqual(['one', 'two', 'three']);
    });

    it('returns nothing for blank input', () => {
      expect(splitParagraphs('   \n\n  ')).toEqual([]);
    });
  });

  describe('countOccurrences', () => {
    it('counts non-overlapping occurrences', () => {
      expect(countOccurrences('abab', 'ab')).toBe(2);
    });

    it('returns zero for an empty needle', () => {
      expect(countOccurrences('abc', '')).toBe(0);
    });
  });

  describe('namesEmoji', () => {
    it('matches a passage naming the emoji', () => {
      expect(namesEmoji('the clown face emoji is the default', clown)).toBe(true);
    });

    it('does not match a passage missing part of the name', () => {
      const tongue = { ...clown, name: 'Face with Tongue' };
      expect(namesEmoji('the clown face is the default', tongue)).toBe(false);
    });

    it('does not match a name made only of a short generic word', () => {
      const faceOnly = { ...clown, name: 'Face' };
      expect(namesEmoji('any face at all', faceOnly)).toBe(false);
    });

    it('does not match a name made only of stop words', () => {
      const stopOnly = { ...clown, name: 'Emoji Sign' };
      expect(namesEmoji('any emoji sign at all', stopOnly)).toBe(false);
    });
  });

  describe('scoreExcerpt', () => {
    it('scores a passage that names the glyph above one that does not', () => {
      const withGlyph = scoreExcerpt('🤡 and 🤡 again', clown);
      const without = scoreExcerpt('🤡 once', clown);
      expect(withGlyph).toBeGreaterThan(without);
    });
  });

  describe('extractExcerpts', () => {
    it('returns the passages that mention the glyph', () => {
      const excerpts = extractExcerpts(guides, clown);
      expect(excerpts).toHaveLength(1);
      expect(excerpts[0].guideSlug).toBe('what-does-clown-face-mean');
      expect(excerpts[0].heading).toBe('How it became a verb');
      expect(excerpts[0].text).toContain('delusional takes');
    });

    it('drops a passage that is too short to be about the emoji', () => {
      const short = [
        { ...guides[0], body: '## H\n\n🤡 short.', relatedEmojis: [], heroEmoji: undefined },
      ];
      expect(extractExcerpts(short, clown)).toHaveLength(0);
    });

    it('accepts a passage that names the emoji in a guide that claims it', () => {
      const named = [
        {
          ...guides[0],
          body: '## H\n\nThe clown face emoji became the default way to flag a bad call on the timeline, and it is sharper than a laughing emoji at calling one out.',
          relatedEmojis: ['clown-face'],
          heroEmoji: undefined,
        },
      ];
      expect(extractExcerpts(named, clown)).toHaveLength(1);
    });

    it('rejects a name match in a guide that does not claim the emoji', () => {
      const named = [
        {
          ...guides[0],
          body: '## H\n\nThe clown face emoji became the default way to flag a bad call on the timeline.',
          relatedEmojis: [],
          heroEmoji: undefined,
        },
      ];
      expect(extractExcerpts(named, clown, { minChars: 0 })).toHaveLength(0);
    });

    it('caps how many passages are returned', () => {
      const many = Array.from({ length: 12 }, (_, index) => ({
        ...guides[0],
        slug: `guide-${index}`,
        body: `## H\n\n🤡 ${'word '.repeat(40)}`,
      }));
      expect(extractExcerpts(many, clown).length).toBeLessThanOrEqual(8);
    });
  });

  describe('buildEmojiGrounding', () => {
    it('builds a brief from the guide passages', () => {
      const grounding = buildEmojiGrounding(clown, guides);
      expect(grounding?.slug).toBe('clown-face');
      expect(grounding?.character).toBe('🤡');
      expect(grounding?.guideSlugs).toEqual(['what-does-clown-face-mean']);
      expect(grounding?.excerpts.length).toBeGreaterThan(0);
    });

    it('returns nothing when no guide mentions the emoji', () => {
      expect(buildEmojiGrounding(clown, [guides[1]])).toBeNull();
    });
  });

  describe('loadGuides', () => {
    it('loads the published guides from disk', () => {
      const loaded = loadGuides();
      expect(loaded.length).toBeGreaterThan(0);
      expect(loaded.some((guide) => guide.slug === 'what-does-clown-face-mean')).toBe(true);
    });

    it('caches the loaded guides', () => {
      expect(loadGuides()).toBe(loadGuides());
    });

    it('returns nothing when the directory does not exist', () => {
      expect(loadGuides('/tmp/no-such-guides-dir')).toEqual([]);
    });

    it('falls back to the slug when a guide has no title', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kye-guides-'));
      fs.writeFileSync(path.join(dir, 'untitled-guide.md'), '---\ndraft: false\n---\n\nBody.\n');

      const loaded = loadGuides(dir);
      expect(loaded).toHaveLength(1);
      expect(loaded[0].title).toBe('untitled-guide');
    });

    it('skips a guide whose frontmatter cannot be parsed', () => {
      const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'kye-guides-'));
      fs.writeFileSync(path.join(dir, 'broken.md'), 'no frontmatter here\n');
      fs.writeFileSync(path.join(dir, 'good.md'), '---\ntitle: Good\n---\n\nBody.\n');

      const loaded = loadGuides(dir);
      expect(loaded).toHaveLength(1);
      expect(loaded[0].slug).toBe('good');
    });
  });
});
