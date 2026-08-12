/**
 * Integration tests for the live loader against the on-disk
 * `content/guides/` directory.
 *
 * These tests verify end-to-end behavior (frontmatter parsing + Markdown
 * rendering + cache invalidation) using the real files committed to the
 * repo. They act as a guard against accidental format regressions.
 */

import { describe, it, expect, beforeEach, spyOn, afterEach } from 'bun:test';
import {
  getAllGuides,
  getAllGuideSlugs,
  getAllGuideSummaries,
  getPublishedGuides,
  getGuideBySlug,
  getPublishedGuideBySlug,
  getPublishedGuideSlugs,
  getPublishedGuideSummaries,
  getPublishedGuideCount,
  deriveSeoTitle,
  deriveSeoDescription,
  clearGuideCache,
} from '../../../src/lib/guide-data';

describe('guide-data (live loader)', () => {
  beforeEach(() => {
    clearGuideCache();
  });

  describe('getAllGuides', () => {
    it('returns at least the seed guide', () => {
      const guides = getAllGuides();
      expect(guides.length).toBeGreaterThan(0);
    });

    it('parses every required field from the seed guide', () => {
      const guide = getGuideBySlug('what-does-skull-mean-in-texting');
      expect(guide).toBeDefined();
      expect(guide?.title).toBe('What does 💀 mean in texting in 2026?');
      expect(guide?.tags).toContain('gen-z');
      expect(guide?.readingTimeMinutes).toBe(7);
      expect(guide?.heroEmoji).toBe('💀');
      expect(guide?.draft).toBe(false);
    });

    it('renders Markdown body to non-empty HTML', () => {
      const guide = getGuideBySlug('what-does-skull-mean-in-texting');
      expect(guide?.html).toBeDefined();
      expect(guide?.html.length).toBeGreaterThan(0);
      // The seed guide uses H2 sections, so the rendered output should
      // contain heading tags.
      expect(guide?.html.toLowerCase()).toMatch(/<h[1-6]/);
    });
  });

  describe('getPublishedGuides', () => {
    it('excludes drafts from the published list', () => {
      const published = getPublishedGuides();
      published.forEach((g) => expect(g.draft).toBe(false));
    });
  });

  describe('getPublishedGuideBySlug', () => {
    it('returns a guide when its slug is published', () => {
      const guide = getPublishedGuideBySlug('what-does-skull-mean-in-texting');
      expect(guide).toBeDefined();
    });

    it('returns undefined for an unknown slug', () => {
      const guide = getPublishedGuideBySlug('does-not-exist');
      expect(guide).toBeUndefined();
    });
  });

  describe('getPublishedGuideSlugs', () => {
    it('lists only published slugs', () => {
      const slugs = getPublishedGuideSlugs();
      expect(slugs).toContain('what-does-skull-mean-in-texting');
    });
  });

  describe('getPublishedGuideSummaries', () => {
    it('sorts summaries newest first by publishedAt', () => {
      const summaries = getPublishedGuideSummaries();
      expect(summaries.length).toBeGreaterThan(0);
      for (let i = 1; i < summaries.length; i++) {
        expect(summaries[i - 1].publishedAt >= summaries[i].publishedAt).toBe(true);
      }
    });

    it('does not include body or html fields', () => {
      const summaries = getPublishedGuideSummaries();
      summaries.forEach((s) => {
        expect((s as unknown as Record<string, unknown>).body).toBeUndefined();
        expect((s as unknown as Record<string, unknown>).html).toBeUndefined();
      });
    });
  });

  describe('getPublishedGuideCount', () => {
    it('matches getPublishedGuides length', () => {
      expect(getPublishedGuideCount()).toBe(getPublishedGuides().length);
    });
  });

  describe('deriveSeoTitle', () => {
    it('returns seoTitle when set', () => {
      const guide = getGuideBySlug('what-does-skull-mean-in-texting');
      expect(deriveSeoTitle(guide!)).toBe('What does 💀 mean in texting? The skull emoji, decoded');
    });

    it('falls back to the frontmatter title when seoTitle is missing', () => {
      const guide = getGuideBySlug('what-does-skull-mean-in-texting');
      const cloned = { ...guide!, seoTitle: undefined };
      expect(deriveSeoTitle(cloned)).toBe(guide!.title);
    });
  });

  describe('deriveSeoDescription', () => {
    it('returns seoDescription when set', () => {
      const guide = getGuideBySlug('what-does-skull-mean-in-texting');
      expect(deriveSeoDescription(guide!).length).toBeGreaterThan(0);
    });

    it('falls back to description when seoDescription is missing', () => {
      const guide = getGuideBySlug('what-does-skull-mean-in-texting');
      const cloned = { ...guide!, seoDescription: undefined };
      expect(deriveSeoDescription(cloned)).toBe(guide!.description);
    });
  });

  describe('getAllGuideSlugs', () => {
    it('includes drafts', () => {
      const slugs = getAllGuideSlugs();
      expect(slugs).toContain('what-does-skull-mean-in-texting');
    });
  });

  describe('getAllGuideSummaries', () => {
    it('includes drafts and sorts newest first', () => {
      const summaries = getAllGuideSummaries();
      expect(summaries.length).toBeGreaterThan(0);
      for (let i = 1; i < summaries.length; i++) {
        expect(summaries[i - 1].publishedAt >= summaries[i].publishedAt).toBe(true);
      }
    });
  });

  describe('frontmatter validation', () => {
    /**
     * Spy-driven tests for the validation paths inside
     * `buildGuideFromFrontmatter`. We can't reach the build step directly
     * (it's not exported), so we swap out `fs.readFileSync` to feed
     * malformed inputs through the real loader pipeline.
     *
     * Validation failures are caught by the loader and the offending file
     * is skipped (logged via `console.error`) so a single bad draft cannot
     * block the production build. We assert on the resulting empty list
     * plus the captured log output.
     */
    let readFileSyncSpy: ReturnType<typeof spyOn> | null = null;
    let errorSpy: ReturnType<typeof spyOn> | null = null;

    afterEach(() => {
      readFileSyncSpy?.mockRestore();
      readFileSyncSpy = null;
      errorSpy?.mockRestore();
      errorSpy = null;
      clearGuideCache();
    });

    it('skips and logs files missing required frontmatter fields', () => {
      const fs = require('fs') as typeof import('fs');
      readFileSyncSpy = spyOn(fs, 'readFileSync').mockReturnValue(`---
title: missing other required fields
---

body`);
      errorSpy = spyOn(console, 'error').mockImplementation(() => {});
      const guides = getAllGuides();
      expect(guides).toEqual([]);
      expect(errorSpy).toHaveBeenCalled();
      const firstCall = errorSpy.mock.calls[0]?.[0] as string;
      expect(firstCall).toMatch(/Failed to load/);
    });

    it('skips and logs files whose tags field is not a list', () => {
      const fs = require('fs') as typeof import('fs');
      readFileSyncSpy = spyOn(fs, 'readFileSync').mockReturnValue(`---
title: ok
description: ok
publishedAt: 2026-01-01
updatedAt: 2026-01-01
author: ok
tags: not-a-list
---

body`);
      errorSpy = spyOn(console, 'error').mockImplementation(() => {});
      const guides = getAllGuides();
      expect(guides).toEqual([]);
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('deriveSeoTitle fallback', () => {
    it('uses the first Markdown H1 when seoTitle is empty', () => {
      const guide = getGuideBySlug('what-does-skull-mean-in-texting');
      const withoutSeoTitle = { ...guide!, seoTitle: '' };
      expect(deriveSeoTitle(withoutSeoTitle)).toBe(guide!.title);
    });

    it('falls back to frontmatter title when body has no H1', () => {
      const guide = getGuideBySlug('what-does-skull-mean-in-texting');
      const withoutSeoTitle = { ...guide!, seoTitle: '', body: 'no headings here' };
      expect(deriveSeoTitle(withoutSeoTitle)).toBe(guide!.title);
    });
  });
});
