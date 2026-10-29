import { describe, it, expect } from 'bun:test';
import {
  toIsoDay,
  resolveArticleDates,
  buildPublisher,
  buildMainEntityOfPage,
  buildImageObject,
  buildIsPartOf,
  buildEmojiListItems,
  buildComboListItems,
} from '@/lib/seo-schema';

describe('seo-schema', () => {
  describe('toIsoDay', () => {
    it('normalizes an ISO timestamp to a calendar day', () => {
      expect(toIsoDay('2026-08-12T00:00:00.000Z')).toBe('2026-08-12');
    });

    it('passes a plain date through unchanged', () => {
      expect(toIsoDay('2026-08-12')).toBe('2026-08-12');
    });

    it('returns undefined for a missing date', () => {
      expect(toIsoDay(undefined)).toBeUndefined();
      expect(toIsoDay('')).toBeUndefined();
    });

    it('returns undefined for an unparseable date', () => {
      expect(toIsoDay('not-a-date')).toBeUndefined();
    });
  });

  describe('resolveArticleDates', () => {
    it('publishes and modifies on the same editorial day', () => {
      expect(resolveArticleDates('2026-08-12T09:30:00.000Z')).toEqual({
        datePublished: '2026-08-12',
        dateModified: '2026-08-12',
      });
    });

    it('omits both dates when the timestamp is missing', () => {
      expect(resolveArticleDates(undefined)).toEqual({});
    });

    it('omits both dates when the timestamp is unparseable', () => {
      expect(resolveArticleDates('nope')).toEqual({});
    });
  });

  describe('buildPublisher', () => {
    it('builds an Organization publisher', () => {
      expect(buildPublisher('KnowYourEmoji', 'https://knowyouremoji.com')).toEqual({
        '@type': 'Organization',
        name: 'KnowYourEmoji',
        url: 'https://knowyouremoji.com',
      });
    });
  });

  describe('buildMainEntityOfPage', () => {
    it('builds a WebPage reference carrying the page name', () => {
      expect(buildMainEntityOfPage('https://knowyouremoji.com/emoji/skull', '💀 Skull')).toEqual({
        '@type': 'WebPage',
        '@id': 'https://knowyouremoji.com/emoji/skull',
        name: '💀 Skull',
      });
    });
  });

  describe('buildImageObject', () => {
    it('builds a 1200x630 ImageObject', () => {
      expect(buildImageObject('https://knowyouremoji.com/og/x.png', 'Alt text')).toEqual({
        '@type': 'ImageObject',
        url: 'https://knowyouremoji.com/og/x.png',
        width: 1200,
        height: 630,
        alt: 'Alt text',
      });
    });
  });

  describe('buildIsPartOf', () => {
    it('points at the site-level WebSite node', () => {
      expect(buildIsPartOf('https://knowyouremoji.com')).toEqual({
        '@id': 'https://knowyouremoji.com/#website',
      });
    });

    it('does not double up the trailing slash', () => {
      expect(buildIsPartOf('https://knowyouremoji.com/')).toEqual({
        '@id': 'https://knowyouremoji.com/#website',
      });
    });
  });

  describe('buildEmojiListItems', () => {
    it('builds one entry per emoji, carrying the character in the name', () => {
      const items = buildEmojiListItems('https://knowyouremoji.com', [
        { slug: 'skull', character: '💀', name: 'Skull' },
        { slug: 'fire', character: '🔥', name: 'Fire' },
      ]);

      expect(items).toEqual([
        { name: '💀 Skull', url: 'https://knowyouremoji.com/emoji/skull' },
        { name: '🔥 Fire', url: 'https://knowyouremoji.com/emoji/fire' },
      ]);
    });

    it('does not double up the trailing slash', () => {
      const items = buildEmojiListItems('https://knowyouremoji.com/', [
        { slug: 'skull', character: '💀', name: 'Skull' },
      ]);
      expect(items[0].url).toBe('https://knowyouremoji.com/emoji/skull');
    });

    it('returns an empty list for no emojis', () => {
      expect(buildEmojiListItems('https://knowyouremoji.com', [])).toEqual([]);
    });
  });

  describe('buildComboListItems', () => {
    it('builds one entry per combo, carrying the sequence in the name', () => {
      const items = buildComboListItems('https://knowyouremoji.com', [
        { slug: 'skull-laughing', combo: '💀😂', name: 'Dead Laughing' },
      ]);

      expect(items).toEqual([
        { name: '💀😂 Dead Laughing', url: 'https://knowyouremoji.com/combo/skull-laughing' },
      ]);
    });

    it('does not double up the trailing slash', () => {
      const items = buildComboListItems('https://knowyouremoji.com/', [
        { slug: 'skull-laughing', combo: '💀😂', name: 'Dead Laughing' },
      ]);
      expect(items[0].url).toBe('https://knowyouremoji.com/combo/skull-laughing');
    });

    it('returns an empty list for no combos', () => {
      expect(buildComboListItems('https://knowyouremoji.com', [])).toEqual([]);
    });
  });
});
