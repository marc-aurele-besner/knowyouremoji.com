/**
 * Integration tests for the live loader against the on-disk
 * `content/guides/` directory.
 *
 * These tests verify end-to-end behavior (frontmatter parsing + Markdown
 * rendering + cache invalidation) using the real files committed to the
 * repo. They act as a guard against accidental format regressions.
 */

import { describe, it, expect, beforeEach } from 'bun:test';
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
  _buildGuideFromFrontmatter,
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
      expect(guide?.title).toBe('💀 stopped meaning death somewhere around 2018');
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
      expect(deriveSeoTitle(guide!)).toBe(
        "When did 💀 stop meaning death? The skull emoji's slow takeover of 😂"
      );
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

  describe('heart-hands guide', () => {
    it('loads with the expected frontmatter fields', () => {
      const guide = getPublishedGuideBySlug('what-does-heart-hands-mean');
      expect(guide).toBeDefined();
      expect(guide?.title).toBe('🫶 is the hug emoji that became a fandom signal');
      expect(guide?.tags).toContain('fandom');
      expect(guide?.tags).toContain('kpop');
      expect(guide?.readingTimeMinutes).toBe(7);
      expect(guide?.heroEmoji).toBe('🫶');
      expect(guide?.draft).toBe(false);
    });

    it('resolves the relatedEmojis slugs to known emoji records', () => {
      const guide = getPublishedGuideBySlug('what-does-heart-hands-mean');
      expect(guide?.relatedEmojis).toContain('heart-hands');
      expect(guide?.relatedEmojis).toContain('heart-red');
      expect(guide?.relatedEmojis).toContain('sparkling-heart');
      expect(guide?.relatedEmojis).toContain('thumbs-up');
    });

    it('resolves the relatedCombos slugs to known combo records', () => {
      const guide = getPublishedGuideBySlug('what-does-heart-hands-mean');
      expect(guide?.relatedCombos).toContain('double-hearts');
      expect(guide?.relatedCombos).toContain('hand-heart-love');
      expect(guide?.relatedCombos).toContain('sparkle-heart');
    });

    it('renders Markdown body to HTML with section headings', () => {
      const guide = getPublishedGuideBySlug('what-does-heart-hands-mean');
      expect(guide?.html.length).toBeGreaterThan(0);
      expect(guide?.html.toLowerCase()).toMatch(/<h[1-6]/);
    });

    it('appears in published slugs and summaries', () => {
      expect(getPublishedGuideSlugs()).toContain('what-does-heart-hands-mean');
      const summary = getPublishedGuideSummaries().find(
        (s) => s.slug === 'what-does-heart-hands-mean'
      );
      expect(summary).toBeDefined();
      expect(summary?.heroEmoji).toBe('🫶');
    });
  });

  describe('face-with-hand-over-mouth guide', () => {
    it('loads with the expected frontmatter fields', () => {
      const guide = getPublishedGuideBySlug('what-does-face-with-hand-over-mouth-mean');
      expect(guide).toBeDefined();
      expect(guide?.title).toBe('🤭 is the "hehe" emoji that quietly became flirty');
      expect(guide?.tags).toContain('bashful');
      expect(guide?.tags).toContain('dating');
      expect(guide?.readingTimeMinutes).toBe(7);
      expect(guide?.heroEmoji).toBe('🤭');
      expect(guide?.draft).toBe(false);
    });

    it('resolves the relatedEmojis slugs to known emoji records', () => {
      const guide = getPublishedGuideBySlug('what-does-face-with-hand-over-mouth-mean');
      expect(guide?.relatedEmojis).toContain('face-with-hand-over-mouth');
      expect(guide?.relatedEmojis).toContain('smiling-face-with-smiling-eyes');
      expect(guide?.relatedEmojis).toContain('see-no-evil');
      expect(guide?.relatedEmojis).toContain('smirk');
    });

    it('resolves the relatedCombos slugs to known combo records', () => {
      const guide = getPublishedGuideBySlug('what-does-face-with-hand-over-mouth-mean');
      expect(guide?.relatedCombos).toContain('shy-blush');
      expect(guide?.relatedCombos).toContain('smirk-wink');
      expect(guide?.relatedCombos).toContain('blush-rose');
      expect(guide?.relatedCombos).toContain('soft-smile');
    });

    it('renders Markdown body to HTML with section headings', () => {
      const guide = getPublishedGuideBySlug('what-does-face-with-hand-over-mouth-mean');
      expect(guide?.html.length).toBeGreaterThan(0);
      expect(guide?.html.toLowerCase()).toMatch(/<h[1-6]/);
    });

    it('appears in published slugs and summaries', () => {
      expect(getPublishedGuideSlugs()).toContain('what-does-face-with-hand-over-mouth-mean');
      const summary = getPublishedGuideSummaries().find(
        (s) => s.slug === 'what-does-face-with-hand-over-mouth-mean'
      );
      expect(summary).toBeDefined();
      expect(summary?.heroEmoji).toBe('🤭');
    });
  });

  describe('saluting-face guide', () => {
    it('loads with the expected frontmatter fields', () => {
      const guide = getPublishedGuideBySlug('what-does-saluting-face-mean');
      expect(guide).toBeDefined();
      expect(guide?.title).toBe(`🫡 is the "yes sir" emoji that became Gen Z's quiet check-out`);
      expect(guide?.tags).toContain('gen-z');
      expect(guide?.tags).toContain('work');
      expect(guide?.tags).toContain('passive-aggressive');
      expect(guide?.readingTimeMinutes).toBe(7);
      expect(guide?.heroEmoji).toBe('🫡');
      expect(guide?.draft).toBe(false);
    });

    it('resolves the relatedEmojis slugs to known emoji records', () => {
      const guide = getPublishedGuideBySlug('what-does-saluting-face-mean');
      expect(guide?.relatedEmojis).toContain('saluting-face');
      expect(guide?.relatedEmojis).toContain('folded-hands');
      expect(guide?.relatedEmojis).toContain('thumbs-up');
      expect(guide?.relatedEmojis).toContain('face-with-hand-over-mouth');
      expect(guide?.relatedEmojis).toContain('see-no-evil');
    });

    it('resolves the relatedCombos slugs to known combo records', () => {
      const guide = getPublishedGuideBySlug('what-does-saluting-face-mean');
      expect(guide?.relatedCombos).toContain('folded-hands-pleading');
      expect(guide?.relatedCombos).toContain('eye-roll-clap');
      expect(guide?.relatedCombos).toContain('rolling-eyes-sigh');
      expect(guide?.relatedCombos).toContain('flex-strong');
    });

    it('renders Markdown body to HTML with section headings', () => {
      const guide = getPublishedGuideBySlug('what-does-saluting-face-mean');
      expect(guide?.html.length).toBeGreaterThan(0);
      expect(guide?.html.toLowerCase()).toMatch(/<h[1-6]/);
    });

    it('appears in published slugs and summaries', () => {
      expect(getPublishedGuideSlugs()).toContain('what-does-saluting-face-mean');
      const summary = getPublishedGuideSummaries().find(
        (s) => s.slug === 'what-does-saluting-face-mean'
      );
      expect(summary).toBeDefined();
      expect(summary?.heroEmoji).toBe('🫡');
    });
  });

  describe('upside-down-face guide', () => {
    it('loads with the expected frontmatter fields', () => {
      const guide = getPublishedGuideBySlug('what-does-upside-down-face-mean');
      expect(guide).toBeDefined();
      expect(guide?.title).toBe(`🙃 is the "I'm fine" emoji that stopped being fine around 2016`);
      expect(guide?.tags).toContain('sarcasm');
      expect(guide?.tags).toContain('passive-aggressive');
      expect(guide?.readingTimeMinutes).toBe(7);
      expect(guide?.heroEmoji).toBe('🙃');
      expect(guide?.draft).toBe(false);
    });

    it('resolves the relatedEmojis slugs to known emoji records', () => {
      const guide = getPublishedGuideBySlug('what-does-upside-down-face-mean');
      expect(guide?.relatedEmojis).toContain('upside-down-face');
      expect(guide?.relatedEmojis).toContain('slightly-smiling');
      expect(guide?.relatedEmojis).toContain('smirk');
      expect(guide?.relatedEmojis).toContain('grimacing');
      expect(guide?.relatedEmojis).toContain('face-with-raised-eyebrow');
    });

    it('resolves the relatedCombos slugs to known combo records', () => {
      const guide = getPublishedGuideBySlug('what-does-upside-down-face-mean');
      expect(guide?.relatedCombos).toContain('upside-down-fine');
      expect(guide?.relatedCombos).toContain('shrug-upside-down');
      expect(guide?.relatedCombos).toContain('thumbs-up-slightly-smiling');
    });

    it('renders Markdown body to HTML with section headings', () => {
      const guide = getPublishedGuideBySlug('what-does-upside-down-face-mean');
      expect(guide?.html.length).toBeGreaterThan(0);
      expect(guide?.html.toLowerCase()).toMatch(/<h[1-6]/);
    });

    it('appears in published slugs and summaries', () => {
      expect(getPublishedGuideSlugs()).toContain('what-does-upside-down-face-mean');
      const summary = getPublishedGuideSummaries().find(
        (s) => s.slug === 'what-does-upside-down-face-mean'
      );
      expect(summary).toBeDefined();
      expect(summary?.heroEmoji).toBe('🙃');
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
     * Validation paths inside `_buildGuideFromFrontmatter`. The helper is
     * exported so tests can drive it directly without going through the
     * filesystem loader (which is what the bug-prone fs-spy approach did
     * previously — see PR #347 review).
     */

    it('throws a helpful error when a required field is missing', () => {
      expect(() =>
        _buildGuideFromFrontmatter({ title: 'only title' }, 'body', 'test-slug')
      ).toThrow(/missing required frontmatter field/);
    });

    it('throws when tags is not a list', () => {
      expect(() =>
        _buildGuideFromFrontmatter(
          {
            title: 'ok',
            description: 'ok',
            publishedAt: '2026-01-01',
            updatedAt: '2026-01-01',
            author: 'ok',
            tags: 'not-a-list',
          },
          'body',
          'test-slug'
        )
      ).toThrow(/must be a list/);
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
