import { describe, it, expect, beforeEach, spyOn } from 'bun:test';
import {
  parseGuideFrontmatter,
  _buildGuideFromFrontmatter,
  deriveSeoTitle,
  getAllGuides,
  clearGuideCache,
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
});
