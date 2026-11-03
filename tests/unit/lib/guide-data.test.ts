import { describe, it, expect, beforeEach, spyOn } from 'bun:test';
import {
  parseGuideFrontmatter,
  _buildGuideFromFrontmatter,
  deriveSeoTitle,
  getAllGuides,
  clearGuideCache,
  isGuideFeaturedOn,
  getHomepageGuideSummaries,
} from '../../../src/lib/guide-data';
import fs from 'fs';

describe('guide-data', () => {
  describe('parseGuideFrontmatter', () => {
    it('parses a well-formed frontmatter block', () => {
      const source = `---
title: What does 💀 mean?
slug: what-does-skull-mean
description: A quick explainer.
tags: [gen-z, slang]
draft: false
---

# Heading

Body content.`;

      const { data, body } = parseGuideFrontmatter(source);
      expect(data.title).toBe('What does 💀 mean?');
      expect(data.slug).toBe('what-does-skull-mean');
      expect(data.description).toBe('A quick explainer.');
      expect(data.tags).toEqual(['gen-z', 'slang']);
      expect(data.draft).toBe('false');
      // The parser strips one leading newline (the line ending right
      // after the closing fence).
      expect(body).toBe('\n# Heading\n\nBody content.');
    });

    it('strips surrounding quotes from string values', () => {
      const source = `---
title: "Quoted title"
description: 'Single-quoted'
---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.title).toBe('Quoted title');
      expect(data.description).toBe('Single-quoted');
    });

    it('preserves blank lines in the body', () => {
      const source = `---
title: x
---

First paragraph.

Second paragraph.`;
      const { body } = parseGuideFrontmatter(source);
      // The parser strips one leading newline (the line ending right after
      // the closing fence). Any extra blank lines the writer adds for
      // readability are preserved.
      expect(body).toBe('\nFirst paragraph.\n\nSecond paragraph.');
    });

    it('throws when frontmatter is missing', () => {
      expect(() => parseGuideFrontmatter('# Heading only\n\nbody')).toThrow(/missing frontmatter/);
    });

    it('throws when frontmatter is not closed', () => {
      const source = `---
title: oops
still going`;
      expect(() => parseGuideFrontmatter(source)).toThrow(/not closed/);
    });

    it('throws when a line is missing the colon separator', () => {
      const source = `---
title: ok
broken-line-no-colon
---

body`;
      expect(() => parseGuideFrontmatter(source)).toThrow(/missing ":"/);
    });

    it('trims whitespace around values and keys', () => {
      const source = `---
  title  :   spaced title
---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.title).toBe('spaced title');
    });

    it('skips blank lines and comment lines in frontmatter', () => {
      const source = `---
# this is a comment
title: ok
# another comment

---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.title).toBe('ok');
    });

    it('parses inline list values with quotes and empty entries', () => {
      const source = `---
tags: ['gen-z', "slang", '', ]
---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.tags).toEqual(['gen-z', 'slang']);
    });

    it('handles CRLF line endings', () => {
      const source = '---\r\ntitle: crlf\r\n---\r\nbody';
      const { data, body } = parseGuideFrontmatter(source);
      expect(data.title).toBe('crlf');
      expect(body).toBe('body');
    });

    it('parses inline lists split across multiple lines (prettier output)', () => {
      const source = `---
title: split-list
tags: [gen-z, slang]
relatedEmojis:
  [
    fire,
    sparkles,
    thumbs-up,
  ]
relatedCombos:
  [fire-100, fire-heart, party-fire]
---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.tags).toEqual(['gen-z', 'slang']);
      expect(data.relatedEmojis).toEqual(['fire', 'sparkles', 'thumbs-up']);
      expect(data.relatedCombos).toEqual(['fire-100', 'fire-heart', 'party-fire']);
    });

    it('continues an inline list that is not closed on the same line', () => {
      const source = `---
platforms: [imessage, whatsapp
  , slack]
---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.platforms).toEqual(['imessage', 'whatsapp', 'slack']);
    });

    it('keeps collecting a multi-line list across blank lines', () => {
      const source = `---
tags: [gen-z,

  slang]
---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.tags).toEqual(['gen-z', 'slang']);
    });

    it('keeps an intentionally empty value when the next line is not a list', () => {
      const source = `---
heroEmoji:
title: What does 💀 mean?
---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.heroEmoji).toBe('');
      expect(data.title).toBe('What does 💀 mean?');
    });

    it('leaves an unterminated list as a plain string value', () => {
      const source = `---
tags: [gen-z
relatedEmojis: skull
---

body`;
      const { data } = parseGuideFrontmatter(source);
      expect(data.tags).toBe('[gen-z');
      expect(data.relatedEmojis).toBe('skull');
    });
  });

  describe('deriveSeoTitle', () => {
    it('falls back to the first H1 heading when seoTitle is missing', () => {
      const source = `---
title: Frontmatter title
description: A description.
publishedAt: '2026-01-01'
updatedAt: '2026-01-01'
author: 'Test Author'
---

# Heading from body

Body content.`;
      const { data, body } = parseGuideFrontmatter(source);
      const guide = _buildGuideFromFrontmatter(data, body, 'whatever' as never);
      // seoTitle is empty in the parsed result, so deriveSeoTitle falls back
      // to the firstHeadingFallback helper.
      const title = deriveSeoTitle(guide);
      expect(title).toBe('Heading from body');
    });

    it('returns the frontmatter title when there is no H1 and no seoTitle', () => {
      const source = `---
title: Frontmatter title
description: A description.
publishedAt: '2026-01-01'
updatedAt: '2026-01-01'
author: 'Test Author'
---

Just body, no headings here.`;
      const { data, body } = parseGuideFrontmatter(source);
      const guide = _buildGuideFromFrontmatter(data, body, 'whatever' as never);
      const title = deriveSeoTitle(guide);
      expect(title).toBe('Frontmatter title');
    });
  });

  describe('loader resilience', () => {
    beforeEach(() => {
      clearGuideCache();
    });

    it('returns an empty list when the guides directory does not exist', () => {
      const existsSyncSpy = spyOn(fs, 'existsSync').mockReturnValue(false);
      try {
        expect(getAllGuides()).toEqual([]);
      } finally {
        existsSyncSpy.mockRestore();
        clearGuideCache();
      }
    });

    it('skips files that fail to parse and reports the failure', () => {
      const readdirSyncSpy = spyOn(fs, 'readdirSync').mockReturnValue(['broken.md'] as never);
      const readFileSyncSpy = spyOn(fs, 'readFileSync').mockReturnValue('no frontmatter here');
      const consoleErrorSpy = spyOn(console, 'error').mockImplementation(() => {});
      try {
        expect(getAllGuides()).toEqual([]);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy.mock.calls[0][0]).toContain('[guides] Failed to load "broken.md"');
      } finally {
        consoleErrorSpy.mockRestore();
        readFileSyncSpy.mockRestore();
        readdirSyncSpy.mockRestore();
        clearGuideCache();
      }
    });
  });

  describe('seasonal featuring window', () => {
    const baseData = {
      title: 'T',
      description: 'D',
      publishedAt: '2026-01-01',
      updatedAt: '2026-01-01',
      author: 'A',
    };

    it('reads featuredFrom and featuredUntil from frontmatter', () => {
      const guide = _buildGuideFromFrontmatter(
        { ...baseData, featuredFrom: '2026-11-01', featuredUntil: '2026-12-26' },
        'Body',
        'seasonal'
      );
      expect(guide.featuredFrom).toBe('2026-11-01');
      expect(guide.featuredUntil).toBe('2026-12-26');
    });

    it('leaves the window undefined when the fields are absent or empty', () => {
      const guide = _buildGuideFromFrontmatter(
        { ...baseData, featuredFrom: '' },
        'Body',
        'evergreen'
      );
      expect(guide.featuredFrom).toBeUndefined();
      expect(guide.featuredUntil).toBeUndefined();
    });

    it('rejects a date that is not YYYY-MM-DD', () => {
      expect(() =>
        _buildGuideFromFrontmatter({ ...baseData, featuredUntil: 'Dec 26' }, 'Body', 'bad')
      ).toThrow('frontmatter field "featuredUntil" must be a YYYY-MM-DD date');
      expect(() =>
        _buildGuideFromFrontmatter({ ...baseData, featuredFrom: ['2026-11-01'] }, 'Body', 'bad')
      ).toThrow('frontmatter field "featuredFrom" must be a YYYY-MM-DD date');
    });

    it('rejects a window that ends before it starts', () => {
      expect(() =>
        _buildGuideFromFrontmatter(
          { ...baseData, featuredFrom: '2026-12-26', featuredUntil: '2026-11-01' },
          'Body',
          'backwards'
        )
      ).toThrow('featuredFrom (2026-12-26) after featuredUntil (2026-11-01)');
    });

    describe('isGuideFeaturedOn', () => {
      const window = { featuredFrom: '2026-11-01', featuredUntil: '2026-12-26' };

      it('is false for guides without a window', () => {
        expect(isGuideFeaturedOn({}, new Date('2026-11-03T12:00:00Z'))).toBe(false);
      });

      it('includes both ends of the window', () => {
        expect(isGuideFeaturedOn(window, new Date('2026-11-01T00:00:00Z'))).toBe(true);
        expect(isGuideFeaturedOn(window, new Date('2026-12-26T23:59:59Z'))).toBe(true);
      });

      it('is false before the window opens and after it closes', () => {
        expect(isGuideFeaturedOn(window, new Date('2026-10-31T23:59:59Z'))).toBe(false);
        expect(isGuideFeaturedOn(window, new Date('2026-12-27T00:00:00Z'))).toBe(false);
      });

      it('treats a missing end as open-ended', () => {
        expect(
          isGuideFeaturedOn({ featuredFrom: '2026-11-01' }, new Date('2030-01-01T00:00:00Z'))
        ).toBe(true);
        expect(
          isGuideFeaturedOn({ featuredUntil: '2026-12-26' }, new Date('2020-01-01T00:00:00Z'))
        ).toBe(true);
      });
    });

    describe('getHomepageGuideSummaries', () => {
      const files: Record<string, string> = {
        'newest.md': guideSource('2026-11-02'),
        'newer.md': guideSource('2026-10-29'),
        'new.md': guideSource('2026-10-27'),
        'christmas.md': guideSource(
          '2026-10-07',
          'featuredFrom: 2026-11-01\nfeaturedUntil: 2026-12-26'
        ),
        'thanksgiving.md': guideSource(
          '2026-09-01',
          'featuredFrom: 2026-11-01\nfeaturedUntil: 2026-11-26'
        ),
        'always.md': guideSource('2026-01-01', 'featuredFrom: 2026-01-01'),
      };

      function guideSource(publishedAt: string, extra = ''): string {
        return `---
title: Guide
description: A description.
publishedAt: ${publishedAt}
updatedAt: ${publishedAt}
author: Test Author
${extra}
---

Body.`;
      }

      function withFixtureGuides(run: () => void) {
        clearGuideCache();
        const existsSyncSpy = spyOn(fs, 'existsSync').mockReturnValue(true);
        const readdirSyncSpy = spyOn(fs, 'readdirSync').mockReturnValue(
          Object.keys(files) as never
        );
        const readFileSyncSpy = spyOn(fs, 'readFileSync').mockImplementation(
          ((filePath: string) => files[filePath.split('/').pop() as string]) as never
        );
        try {
          run();
        } finally {
          readFileSyncSpy.mockRestore();
          readdirSyncSpy.mockRestore();
          existsSyncSpy.mockRestore();
          clearGuideCache();
        }
      }

      it('puts open windows first, soonest-closing first, then the newest guides', () => {
        withFixtureGuides(() => {
          const slugs = getHomepageGuideSummaries(5, new Date('2026-11-03T12:00:00Z')).map(
            (g) => g.slug
          );
          expect(slugs).toEqual(['thanksgiving', 'christmas', 'always', 'newest', 'newer']);
        });
      });

      it('drops a guide once its window has closed', () => {
        withFixtureGuides(() => {
          const slugs = getHomepageGuideSummaries(3, new Date('2026-12-01T12:00:00Z')).map(
            (g) => g.slug
          );
          expect(slugs).toEqual(['christmas', 'always', 'newest']);
        });
      });

      it('falls back to newest-first when no window is open', () => {
        withFixtureGuides(() => {
          const slugs = getHomepageGuideSummaries(3, new Date('2025-06-01T12:00:00Z')).map(
            (g) => g.slug
          );
          expect(slugs).toEqual(['newest', 'newer', 'new']);
        });
      });

      it('returns nothing for a non-positive limit and defaults now to the current date', () => {
        withFixtureGuides(() => {
          expect(getHomepageGuideSummaries(0, new Date('2026-11-03T12:00:00Z'))).toEqual([]);
          expect(getHomepageGuideSummaries(-1)).toEqual([]);
          expect(getHomepageGuideSummaries(10).length).toBe(Object.keys(files).length);
        });
      });
    });
  });
});
