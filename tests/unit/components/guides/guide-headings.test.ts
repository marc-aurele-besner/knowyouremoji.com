import { describe, it, expect } from 'bun:test';
import {
  headingText,
  slugifyHeading,
  withHeadingAnchors,
} from '@/components/guides/guide-headings';

describe('guide-headings', () => {
  describe('headingText', () => {
    it('strips tags and decodes the entities marked emits', () => {
      expect(headingText('<em>Why</em> &quot;k&quot; &amp; &#39;ok&#39; &lt;3 &gt;')).toBe(
        `Why "k" & 'ok' <3 >`
      );
    });
  });

  describe('slugifyHeading', () => {
    it('lowercases and hyphenates', () => {
      expect(slugifyHeading('Where 🍆 flips on you!')).toBe('where-flips-on-you');
    });

    it('falls back to "section" when nothing usable remains', () => {
      expect(slugifyHeading('💀💀')).toBe('section');
    });
  });

  describe('withHeadingAnchors', () => {
    it('adds ids to bare h2s and returns the headings in order', () => {
      const { html, headings } = withHeadingAnchors(
        '<p>Intro</p><h2>First part</h2><p>a</p><h3>Sub</h3><h2>FAQ</h2>'
      );
      expect(headings).toEqual([
        { id: 'section-first-part', text: 'First part' },
        { id: 'section-faq', text: 'FAQ' },
      ]);
      expect(html).toContain('<h2 id="section-first-part">First part</h2>');
      expect(html).toContain('<h3>Sub</h3>');
    });

    it('dedupes repeated headings with a numeric suffix', () => {
      const { headings } = withHeadingAnchors('<h2>FAQ</h2><h2>FAQ</h2><h2>FAQ</h2>');
      expect(headings.map((h) => h.id)).toEqual(['section-faq', 'section-faq-2', 'section-faq-3']);
    });

    it('leaves html without h2s untouched', () => {
      const input = '<p>No headings</p>';
      expect(withHeadingAnchors(input)).toEqual({ html: input, headings: [] });
    });
  });
});
